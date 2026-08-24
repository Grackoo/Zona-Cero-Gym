import { FitnessGoal } from '../types';
import { supabase } from './supabase';

export interface BiometricMember {
  id: string;
  fullName: string;
  phone: string;
  planType: string;
  status: 'Activo' | 'Vencido' | 'Congelado';
  avatarUrl: string;
  whatsappConnected: boolean;
  registeredAt: string;
  lastVisit?: string;
  notes?: string;
  accessToken: string;
  memberPin: string;
  birthDate?: string;
  fitnessGoal: FitnessGoal;
}

export interface AccessLog {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  planType: string;
  timestamp: string; // ISO 8601 string
  dateFormatted: string; // e.g. "23/08/2026"
  timeFormatted: string; // e.g. "08:42 AM"
  type: 'Entrada' | 'Salida';
  status: 'Permitido' | 'Denegado';
  reason: string;
  similarity: number;
  coachOnDuty: string;
  shift: 'Mañana' | 'Tarde/Noche';
  durationMinutes?: number; // Calculated on 'Salida'
}

export interface CoachAnalytics {
  name: string;
  role: string;
  shift: 'Mañana' | 'Tarde/Noche';
  shiftHours: string;
  totalCheckins: number;
  percentage: number;
  avgDurationMinutes: number;
  uniqueMembers: number;
  avatarUrl: string;
}

export interface AttendanceAnalytics {
  totalEntradas: number;
  totalSalidas: number;
  currentlyInsideCount: number;
  currentlyInsideMembers: { id: string; fullName: string; avatarUrl: string; enteredAt: string; timeInsideFormatted: string }[];
  peakHour: string;
  peakHourCount: number;
  avgDurationMinutes: number;
  hourlyData: { hour: string; label: string; entradas: number; salidas: number; coach: string; shift: 'Mañana' | 'Tarde/Noche' }[];
  coaches: CoachAnalytics[];
  preferredCoach: CoachAnalytics;
}

const STORAGE_MEMBERS_KEY = 'zona_cero_biometric_members_v2';
const STORAGE_LOGS_KEY = 'zona_cero_access_logs_v2';

const isSupabaseReady = () => {
  return (
    Boolean(import.meta.env.VITE_SUPABASE_URL) &&
    !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
    Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY) &&
    !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('placeholder')
  );
};

// Determines Coach on duty based on hour of day
export function getCoachAndShiftForTimestamp(date: Date = new Date()): { coachName: string; shift: 'Mañana' | 'Tarde/Noche'; shiftHours: string; avatarUrl: string } {
  const hour = date.getHours();
  // Turno Mañana: 06:00 a 13:59 (Coach Valeria Mendez)
  // Turno Tarde/Noche: 14:00 a 22:59 (Coach Marcos Rios)
  if (hour >= 6 && hour < 14) {
    return {
      coachName: 'Coach Valeria Mendez',
      shift: 'Mañana',
      shiftHours: '06:00 - 14:00',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250&h=250'
    };
  } else {
    return {
      coachName: 'Coach Marcos Rios',
      shift: 'Tarde/Noche',
      shiftHours: '14:00 - 22:00',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250'
    };
  }
}

const mapDbToMember = (row: any): BiometricMember => ({
  id: row.id,
  fullName: row.full_name || 'Sin Nombre',
  phone: row.phone || '',
  planType: row.plan_type || 'Mensual Premium',
  status: (row.status === 'Active' ? 'Activo' : row.status === 'Frozen' ? 'Congelado' : row.status === 'Overdue' ? 'Vencido' : row.status) || 'Activo',
  avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250',
  whatsappConnected: row.whatsapp_connected ?? true,
  registeredAt: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
  accessToken: row.access_token || row.id,
  memberPin: row.member_pin || '1234',
  birthDate: row.birth_date || undefined,
  fitnessGoal: (row.fitness_goal as FitnessGoal) || 'salud_general',
  lastVisit: row.last_visit || undefined
});

const mapMemberToDb = (m: Partial<BiometricMember>) => {
  const dbObj: any = {};
  if (m.id !== undefined) dbObj.id = m.id;
  if (m.fullName !== undefined) dbObj.full_name = m.fullName;
  if (m.phone !== undefined) dbObj.phone = m.phone;
  if (m.planType !== undefined) dbObj.plan_type = m.planType;
  if (m.status !== undefined) dbObj.status = m.status;
  if (m.avatarUrl !== undefined) dbObj.avatar_url = m.avatarUrl;
  if (m.whatsappConnected !== undefined) dbObj.whatsapp_connected = m.whatsappConnected;
  if (m.accessToken !== undefined) dbObj.access_token = m.accessToken;
  if (m.memberPin !== undefined) dbObj.member_pin = m.memberPin;
  if (m.birthDate !== undefined) dbObj.birth_date = m.birthDate;
  if (m.fitnessGoal !== undefined) dbObj.fitness_goal = m.fitnessGoal;
  return dbObj;
};

const INITIAL_MEMBERS: BiometricMember[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111101',
    fullName: 'Carlos Mendoza',
    phone: '+52 55 1234 5678',
    planType: 'Mensual Premium',
    status: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250',
    whatsappConnected: true,
    registeredAt: '2026-01-15',
    lastVisit: 'Hoy, 08:42 AM',
    accessToken: 'c1111111-1111-1111-1111-111111111101',
    memberPin: '1234',
    birthDate: '1998-04-12',
    fitnessGoal: 'hipertrofia'
  },
  {
    id: 'a1111111-1111-1111-1111-111111111102',
    fullName: 'Elia Hernandez',
    phone: '+52 55 9876 5432',
    planType: 'Anual Premium',
    status: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250&h=250',
    whatsappConnected: true,
    registeredAt: '2026-02-10',
    lastVisit: 'Hoy, 08:15 AM',
    accessToken: 'c1111111-1111-1111-1111-111111111102',
    memberPin: '4321',
    birthDate: '2001-09-24',
    fitnessGoal: 'perdida_grasa'
  },
  {
    id: 'a1111111-1111-1111-1111-111111111103',
    fullName: 'Maria Lopez',
    phone: '+52 55 4567 8901',
    planType: 'Mensual Básico',
    status: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250&h=250',
    whatsappConnected: true,
    registeredAt: '2026-01-05',
    lastVisit: 'Ayer, 06:15 PM',
    accessToken: 'c1111111-1111-1111-1111-111111111103',
    memberPin: '2026',
    birthDate: '1989-11-03',
    fitnessGoal: 'salud_general'
  },
  {
    id: 'a1111111-1111-1111-1111-111111111104',
    fullName: 'Elena Rodriguez',
    phone: '+52 55 2345 6789',
    planType: 'Anual Estándar',
    status: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250&h=250',
    whatsappConnected: true,
    registeredAt: '2025-11-20',
    lastVisit: 'Hoy, 07:10 AM',
    accessToken: 'c1111111-1111-1111-1111-111111111104',
    memberPin: '8888',
    birthDate: '1995-07-19',
    fitnessGoal: 'mantenimiento'
  },
  {
    id: 'a1111111-1111-1111-1111-111111111105',
    fullName: 'Sarah Jenkins',
    phone: '+52 55 8765 4321',
    planType: 'Anual Premium',
    status: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250&h=250',
    whatsappConnected: true,
    registeredAt: '2026-03-01',
    lastVisit: 'Hoy, 06:45 PM',
    accessToken: 'c1111111-1111-1111-1111-111111111105',
    memberPin: '9999',
    birthDate: '1992-03-15',
    fitnessGoal: 'hipertrofia'
  },
  {
    id: 'a1111111-1111-1111-1111-111111111106',
    fullName: 'Roberto Valdés',
    phone: '+52 55 6789 0123',
    planType: 'Mensual Básico',
    status: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250',
    whatsappConnected: true,
    registeredAt: '2026-02-01',
    lastVisit: 'Hace 2 días',
    accessToken: 'c1111111-1111-1111-1111-111111111106',
    memberPin: '5555',
    birthDate: '1982-12-05',
    fitnessGoal: 'perdida_grasa'
  }
];

const createSampleDate = (hoursAgo: number) => {
  const d = new Date(Date.now() - 1000 * 60 * 60 * hoursAgo);
  return d;
};

const INITIAL_LOGS: AccessLog[] = [
  // Today evening (Coach Marcos)
  {
    id: 'LOG-9005',
    memberId: 'a1111111-1111-1111-1111-111111111105',
    memberName: 'Sarah Jenkins',
    memberAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250&h=250',
    planType: 'Anual Premium',
    timestamp: createSampleDate(1).toISOString(),
    dateFormatted: createSampleDate(1).toLocaleDateString('es-MX'),
    timeFormatted: '06:45 PM',
    type: 'Entrada',
    status: 'Permitido',
    similarity: 98.9,
    coachOnDuty: 'Coach Marcos Rios',
    shift: 'Tarde/Noche',
    reason: 'Membresía Activa • Entrada registrada (Coach Marcos Rios en turno - Tarde/Noche) • Rostro 98.9%'
  },
  // Today morning (Coach Valeria) - Salida
  {
    id: 'LOG-9004',
    memberId: 'a1111111-1111-1111-1111-111111111101',
    memberName: 'Carlos Mendoza',
    memberAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250',
    planType: 'Mensual Premium',
    timestamp: createSampleDate(10).toISOString(),
    dateFormatted: createSampleDate(10).toLocaleDateString('es-MX'),
    timeFormatted: '10:05 AM',
    type: 'Salida',
    status: 'Permitido',
    similarity: 98.1,
    coachOnDuty: 'Coach Valeria Mendez',
    shift: 'Mañana',
    durationMinutes: 83,
    reason: 'Salida registrada • Tiempo en gym: 1h 23m (Coach Valeria Mendez en turno)'
  },
  // Today morning (Coach Valeria) - Entrada
  {
    id: 'LOG-9003',
    memberId: 'a1111111-1111-1111-1111-111111111101',
    memberName: 'Carlos Mendoza',
    memberAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250',
    planType: 'Mensual Premium',
    timestamp: createSampleDate(11.5).toISOString(),
    dateFormatted: createSampleDate(11.5).toLocaleDateString('es-MX'),
    timeFormatted: '08:42 AM',
    type: 'Entrada',
    status: 'Permitido',
    similarity: 98.4,
    coachOnDuty: 'Coach Valeria Mendez',
    shift: 'Mañana',
    reason: 'Membresía Activa • Entrada registrada (Coach Valeria Mendez en turno - Mañana) • Rostro 98.4%'
  },
  // Today morning (Coach Valeria)
  {
    id: 'LOG-9002',
    memberId: 'a1111111-1111-1111-1111-111111111102',
    memberName: 'Elia Hernandez',
    memberAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250&h=250',
    planType: 'Anual Premium',
    timestamp: createSampleDate(12).toISOString(),
    dateFormatted: createSampleDate(12).toLocaleDateString('es-MX'),
    timeFormatted: '08:15 AM',
    type: 'Entrada',
    status: 'Permitido',
    similarity: 99.1,
    coachOnDuty: 'Coach Valeria Mendez',
    shift: 'Mañana',
    reason: 'Membresía Activa • Entrada registrada (Coach Valeria Mendez en turno - Mañana) • Rostro 99.1%'
  },
  // Yesterday evening (Coach Marcos)
  {
    id: 'LOG-9001',
    memberId: 'a1111111-1111-1111-1111-111111111103',
    memberName: 'Maria Lopez',
    memberAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250&h=250',
    planType: 'Mensual Básico',
    timestamp: createSampleDate(26).toISOString(),
    dateFormatted: createSampleDate(26).toLocaleDateString('es-MX'),
    timeFormatted: '06:15 PM',
    type: 'Entrada',
    status: 'Permitido',
    similarity: 97.6,
    coachOnDuty: 'Coach Marcos Rios',
    shift: 'Tarde/Noche',
    reason: 'Membresía Activa • Entrada registrada (Coach Marcos Rios en turno - Tarde/Noche)'
  }
];

export const biometricsStore = {
  // Sync members and logs from Supabase
  async syncFromSupabase(): Promise<void> {
    if (!isSupabaseReady()) return;

    try {
      // 1. Fetch Members from Supabase
      const { data: dbMembers, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (!membersError && dbMembers) {
        if (dbMembers.length > 0) {
          const mappedMembers = dbMembers.map(mapDbToMember);
          localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(mappedMembers));
          window.dispatchEvent(new CustomEvent('zona_cero_members_updated'));
        }
      } else if (membersError) {
        console.warn('Error syncing members from Supabase:', membersError);
      }

      // 2. Fetch Attendance Logs from Supabase
      const { data: dbLogs, error: logsError } = await supabase
        .from('attendance_logs')
        .select(`
          id,
          member_id,
          type,
          status,
          similarity,
          reason,
          created_at,
          members (
            full_name,
            avatar_url,
            plan_type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!logsError && dbLogs && dbLogs.length > 0) {
        const mappedLogs: AccessLog[] = dbLogs.map((log: any) => {
          const logDate = new Date(log.created_at);
          const hours = logDate.getHours().toString().padStart(2, '0');
          const minutes = logDate.getMinutes().toString().padStart(2, '0');
          const timeFormatted = `${hours}:${minutes} ${logDate.getHours() >= 12 ? 'PM' : 'AM'}`;
          const dateFormatted = logDate.toLocaleDateString('es-MX');
          const memberData = log.members;
          const coachInfo = getCoachAndShiftForTimestamp(logDate);

          return {
            id: log.id,
            memberId: log.member_id,
            memberName: memberData?.full_name || 'Socio Registrado',
            memberAvatar: memberData?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250&h=250',
            planType: memberData?.plan_type || 'Mensual Premium',
            timestamp: log.created_at,
            dateFormatted,
            timeFormatted,
            type: (log.type as 'Entrada' | 'Salida') || 'Entrada',
            status: (log.status as 'Permitido' | 'Denegado') || 'Permitido',
            similarity: Number(log.similarity) || 98.0,
            coachOnDuty: coachInfo.coachName,
            shift: coachInfo.shift,
            reason: log.reason || 'Acceso Registrado'
          };
        });

        localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(mappedLogs));
        window.dispatchEvent(new CustomEvent('zona_cero_access_updated'));
      }
    } catch (e) {
      console.warn('Error during Supabase sync:', e);
    }
  },

  getMembers(): BiometricMember[] {
    try {
      const data = localStorage.getItem(STORAGE_MEMBERS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(INITIAL_MEMBERS));
        return INITIAL_MEMBERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_MEMBERS;
    }
  },

  getMemberByToken(token: string): BiometricMember | undefined {
    const members = this.getMembers();
    return members.find(m => m.accessToken === token || m.id === token);
  },

  getMemberById(id: string): BiometricMember | undefined {
    const members = this.getMembers();
    return members.find(m => m.id === id);
  },

  // Check if a member is currently inside the gym (latest permitted log is 'Entrada')
  isMemberCurrentlyInside(memberId: string): boolean {
    const logs = this.getAccessLogs();
    const memberLogs = logs.filter(l => l.memberId === memberId && l.status === 'Permitido');
    if (memberLogs.length === 0) return false;
    return memberLogs[0].type === 'Entrada';
  },

  // Get the active entry log for an inside member
  getActiveEntryLog(memberId: string): AccessLog | undefined {
    const logs = this.getAccessLogs();
    const memberLogs = logs.filter(l => l.memberId === memberId && l.status === 'Permitido');
    if (memberLogs.length > 0 && memberLogs[0].type === 'Entrada') {
      return memberLogs[0];
    }
    return undefined;
  },

  addMember(member: Omit<BiometricMember, 'id' | 'registeredAt' | 'accessToken'> & { id?: string; accessToken?: string }): BiometricMember {
    const members = this.getMembers();
    const newId = member.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ZC-${Date.now()}`);
    const generatedToken = member.accessToken || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `token-${Date.now()}`);
    
    const newMember: BiometricMember = {
      ...member,
      id: newId,
      accessToken: generatedToken,
      memberPin: member.memberPin || '1234',
      fitnessGoal: member.fitnessGoal || 'salud_general',
      registeredAt: new Date().toISOString().split('T')[0],
      lastVisit: 'Recién Registrado',
    };

    // 1. Update local cache immediately for instant UI
    const updated = [newMember, ...members];
    localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('zona_cero_members_updated'));

    // 2. Persist asynchronously to Supabase
    if (isSupabaseReady()) {
      const dbPayload = mapMemberToDb(newMember);
      supabase
        .from('members')
        .insert(dbPayload)
        .then(
          ({ error }) => {
            if (error) {
              console.error('❌ Error al guardar miembro en Supabase:', error.message, error.details || error);
            } else {
              console.log('✅ Miembro guardado con éxito en Supabase:', newMember.fullName, newMember.id);
            }
          },
          (err) => {
            console.error('Error de red al insertar en Supabase:', err);
          }
        );
    }

    return newMember;
  },

  updateMember(id: string, updates: Partial<BiometricMember>): void {
    const members = this.getMembers();
    const updated = members.map(m => m.id === id ? { ...m, ...updates } : m);
    localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('zona_cero_members_updated'));

    if (isSupabaseReady()) {
      const dbPayload = mapMemberToDb(updates);
      supabase
        .from('members')
        .update(dbPayload)
        .eq('id', id)
        .then(
          ({ error }) => {
            if (error) {
              console.error('❌ Error al actualizar miembro en Supabase:', error.message);
            } else {
              console.log('✅ Miembro actualizado en Supabase:', id);
            }
          },
          (err) => console.error('Error al actualizar en Supabase:', err)
        );
    }
  },

  deleteMember(id: string): void {
    const members = this.getMembers();
    const updated = members.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('zona_cero_members_updated'));

    if (isSupabaseReady()) {
      supabase
        .from('members')
        .delete()
        .eq('id', id)
        .then(
          ({ error }) => {
            if (error) {
              console.error('❌ Error al eliminar miembro en Supabase:', error.message);
            } else {
              console.log('✅ Miembro eliminado en Supabase:', id);
            }
          },
          (err) => console.error('Error al eliminar en Supabase:', err)
        );
    }
  },

  getAccessLogs(): AccessLog[] {
    try {
      const data = localStorage.getItem(STORAGE_LOGS_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(INITIAL_LOGS));
        return INITIAL_LOGS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_LOGS;
    }
  },

  /**
   * Registers biometric access with Intelligent Auto-Detection of 'Entrada' vs 'Salida'
   * @param memberId Target member ID
   * @param requestedType 'Auto' (default: automatically toggles Entrada/Salida), 'Entrada', or 'Salida'
   * @param forcedSimilarity Optional test similarity score
   */
  registerAccess(
    memberId: string, 
    requestedType: 'Entrada' | 'Salida' | 'Auto' = 'Auto',
    forcedSimilarity?: number
  ): { 
    success: boolean; 
    log: AccessLog; 
    member?: BiometricMember; 
    similarity: number; 
    actionType: 'Entrada' | 'Salida';
    durationMinutes?: number;
    coachOnDuty: string;
    shift: 'Mañana' | 'Tarde/Noche';
  } {
    const members = this.getMembers();
    const member = members.find(m => m.id === memberId);

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeFormatted = `${hours}:${minutes} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    const dateFormatted = now.toLocaleDateString('es-MX');
    const coachInfo = getCoachAndShiftForTimestamp(now);

    if (!member) {
      const similarity = forcedSimilarity ?? parseFloat((Math.random() * 40 + 30).toFixed(1));
      const log: AccessLog = {
        id: `LOG-${Date.now()}`,
        memberId: 'DESCONOCIDO',
        memberName: 'Persona no identificada',
        memberAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250&h=250',
        planType: 'Ninguno',
        timestamp: now.toISOString(),
        dateFormatted,
        timeFormatted,
        type: requestedType === 'Salida' ? 'Salida' : 'Entrada',
        status: 'Denegado',
        similarity,
        coachOnDuty: coachInfo.coachName,
        shift: coachInfo.shift,
        reason: `Rostro no reconocido en el sistema (${similarity}% efectividad)`
      };
      const logs = [log, ...this.getAccessLogs()].slice(0, 100);
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));
      window.dispatchEvent(new CustomEvent('zona_cero_access_updated'));
      return { 
        success: false, 
        log, 
        similarity, 
        actionType: log.type, 
        coachOnDuty: coachInfo.coachName, 
        shift: coachInfo.shift 
      };
    }

    // Determine biometric similarity
    const similarity = forcedSimilarity ?? parseFloat((95.1 + Math.random() * 4.7).toFixed(1));
    
    // Strict > 95% threshold requirement
    const meetsBiometricThreshold = similarity >= 95.0;
    const isPlanActive = member.status === 'Activo';
    const isAuthorized = meetsBiometricThreshold && isPlanActive;

    // INTELLIGENT AUTO-TOGGLE:
    // If requestedType === 'Auto', check if member is currently inside
    let determinedType: 'Entrada' | 'Salida' = 'Entrada';
    let durationMinutes: number | undefined;

    if (requestedType === 'Auto' || !requestedType) {
      const isInside = this.isMemberCurrentlyInside(member.id);
      if (isInside) {
        determinedType = 'Salida';
        const entryLog = this.getActiveEntryLog(member.id);
        if (entryLog) {
          const entryTime = new Date(entryLog.timestamp).getTime();
          durationMinutes = Math.max(1, Math.round((now.getTime() - entryTime) / (1000 * 60)));
        }
      } else {
        determinedType = 'Entrada';
      }
    } else {
      determinedType = requestedType;
      if (determinedType === 'Salida') {
        const entryLog = this.getActiveEntryLog(member.id);
        if (entryLog) {
          const entryTime = new Date(entryLog.timestamp).getTime();
          durationMinutes = Math.max(1, Math.round((now.getTime() - entryTime) / (1000 * 60)));
        }
      }
    }

    // Reason description
    let reason = '';
    if (!meetsBiometricThreshold) {
      reason = `Similitud insuficiente (${similarity}% < 95.0% requerido)`;
    } else if (!isPlanActive) {
      reason = `Acceso Denegado: Membresía en estado '${member.status}' (Efectividad ${similarity}%)`;
    } else {
      if (determinedType === 'Entrada') {
        reason = `Membresía Activa • Entrada registrada (${coachInfo.coachName} en turno - ${coachInfo.shift}) • Rostro ${similarity}%`;
      } else {
        const durationStr = durationMinutes 
          ? (durationMinutes >= 60 
              ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` 
              : `${durationMinutes} min`)
          : 'Sesión completada';
        reason = `Salida registrada • Tiempo en gym: ${durationStr} (${coachInfo.coachName} en turno)`;
      }
    }

    const log: AccessLog = {
      id: `LOG-${Date.now()}`,
      memberId: member.id,
      memberName: member.fullName,
      memberAvatar: member.avatarUrl,
      planType: member.planType,
      timestamp: now.toISOString(),
      dateFormatted,
      timeFormatted,
      type: determinedType,
      status: isAuthorized ? 'Permitido' : 'Denegado',
      similarity,
      coachOnDuty: coachInfo.coachName,
      shift: coachInfo.shift,
      durationMinutes,
      reason
    };

    if (isAuthorized) {
      this.updateMember(member.id, { 
        lastVisit: determinedType === 'Entrada' ? `Hoy, ${timeFormatted} (Entrada)` : `Hoy, ${timeFormatted} (Salida)`
      });
    }

    const logs = [log, ...this.getAccessLogs()].slice(0, 100);
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('zona_cero_access_updated'));

    // Save attendance log to Supabase if valid UUID
    if (isSupabaseReady() && member.id && member.id.includes('-')) {
      supabase
        .from('attendance_logs')
        .insert({
          member_id: member.id,
          type: determinedType,
          status: isAuthorized ? 'Permitido' : 'Denegado',
          similarity: similarity,
          reason: reason
        })
        .then(
          ({ error }) => {
            if (error) console.error('❌ Error al registrar asistencia en Supabase:', error.message);
            else console.log(`✅ ${determinedType} registrada en Supabase para:`, member.fullName);
          },
          (err) => console.error('Error al registrar asistencia en Supabase:', err)
        );
    }

    return { 
      success: isAuthorized, 
      log, 
      member, 
      similarity, 
      actionType: determinedType, 
      durationMinutes,
      coachOnDuty: coachInfo.coachName,
      shift: coachInfo.shift
    };
  },

  // Comprehensive analytics calculation for admin reports
  getAttendanceAnalytics(): AttendanceAnalytics {
    const logs = this.getAccessLogs();
    const members = this.getMembers();

    const allowedLogs = logs.filter(l => l.status === 'Permitido');
    const entradas = allowedLogs.filter(l => l.type === 'Entrada');
    const salidas = allowedLogs.filter(l => l.type === 'Salida');

    // Currently inside calculation
    const currentlyInsideMembers: { id: string; fullName: string; avatarUrl: string; enteredAt: string; timeInsideFormatted: string }[] = [];
    const now = Date.now();

    members.forEach(member => {
      if (this.isMemberCurrentlyInside(member.id)) {
        const entryLog = this.getActiveEntryLog(member.id);
        const enteredAt = entryLog ? entryLog.timeFormatted : 'Hoy';
        let timeInsideFormatted = 'En sesión';
        if (entryLog) {
          const diffMin = Math.max(1, Math.round((now - new Date(entryLog.timestamp).getTime()) / (1000 * 60)));
          timeInsideFormatted = diffMin >= 60 ? `${Math.floor(diffMin / 60)}h ${diffMin % 60}m` : `${diffMin} min`;
        }
        currentlyInsideMembers.push({
          id: member.id,
          fullName: member.fullName,
          avatarUrl: member.avatarUrl,
          enteredAt,
          timeInsideFormatted
        });
      }
    });

    // Hourly distribution for 6:00 to 22:00
    const hoursSlots = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    const hourlyData = hoursSlots.map(h => {
      const label = `${h.toString().padStart(2, '0')}:00`;
      const isMorning = h < 14;
      const coach = isMorning ? 'Coach Valeria Mendez' : 'Coach Marcos Rios';
      const shift: 'Mañana' | 'Tarde/Noche' = isMorning ? 'Mañana' : 'Tarde/Noche';

      const countEntradas = entradas.filter(l => {
        const logHour = new Date(l.timestamp).getHours();
        return logHour === h;
      }).length;

      const countSalidas = salidas.filter(l => {
        const logHour = new Date(l.timestamp).getHours();
        return logHour === h;
      }).length;

      return {
        hour: `${h}:00`,
        label,
        entradas: countEntradas,
        salidas: countSalidas,
        coach,
        shift
      };
    });

    // Peak Hour calculation
    let maxHour = hourlyData[0];
    hourlyData.forEach(hd => {
      if (hd.entradas > (maxHour?.entradas || 0)) {
        maxHour = hd;
      }
    });

    // Coach preference calculation
    const valeriaLogs = entradas.filter(l => l.coachOnDuty.includes('Valeria') || l.shift === 'Mañana');
    const marcosLogs = entradas.filter(l => l.coachOnDuty.includes('Marcos') || l.shift === 'Tarde/Noche');

    const totalCheckins = entradas.length || 1;
    const valeriaPercentage = Math.round((valeriaLogs.length / totalCheckins) * 100);
    const marcosPercentage = Math.round((marcosLogs.length / totalCheckins) * 100);

    // Calculate average session duration in minutes
    const logsWithDuration = salidas.filter(l => typeof l.durationMinutes === 'number' && l.durationMinutes > 0);
    const totalDuration = logsWithDuration.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
    const avgDuration = logsWithDuration.length > 0 ? Math.round(totalDuration / logsWithDuration.length) : 65;

    // Unique members per coach
    const valeriaUniqueMembers = new Set(valeriaLogs.map(l => l.memberId)).size;
    const marcosUniqueMembers = new Set(marcosLogs.map(l => l.memberId)).size;

    const coaches: CoachAnalytics[] = [
      {
        name: 'Coach Valeria Mendez',
        role: 'Coach Matutina & Nutrición Deportiva',
        shift: 'Mañana',
        shiftHours: '06:00 AM - 02:00 PM',
        totalCheckins: valeriaLogs.length,
        percentage: valeriaPercentage,
        avgDurationMinutes: 62,
        uniqueMembers: valeriaUniqueMembers,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250&h=250'
      },
      {
        name: 'Coach Marcos Rios',
        role: 'Coach Vespertino & Fuerza / HIIT',
        shift: 'Tarde/Noche',
        shiftHours: '02:00 PM - 10:00 PM',
        totalCheckins: marcosLogs.length,
        percentage: marcosPercentage,
        avgDurationMinutes: 71,
        uniqueMembers: marcosUniqueMembers,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250'
      }
    ];

    const preferredCoach = coaches[0].totalCheckins >= coaches[1].totalCheckins ? coaches[0] : coaches[1];

    return {
      totalEntradas: entradas.length,
      totalSalidas: salidas.length,
      currentlyInsideCount: currentlyInsideMembers.length,
      currentlyInsideMembers,
      peakHour: maxHour ? `${maxHour.label} - ${(parseInt(maxHour.hour) + 1)}:00` : '19:00 - 20:00',
      peakHourCount: maxHour?.entradas || 0,
      avgDurationMinutes: avgDuration,
      hourlyData,
      coaches,
      preferredCoach
    };
  },

  clearLogs(): void {
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('zona_cero_access_updated'));
  },

  resetDemoData(): void {
    localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(INITIAL_MEMBERS));
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(INITIAL_LOGS));
    window.dispatchEvent(new CustomEvent('zona_cero_members_updated'));
    window.dispatchEvent(new CustomEvent('zona_cero_access_updated'));
  }
};

// Initial sync on module load
if (typeof window !== 'undefined') {
  biometricsStore.syncFromSupabase();
}
