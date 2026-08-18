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
  timestamp: string;
  timeFormatted: string;
  type: 'Entrada' | 'Salida';
  status: 'Permitido' | 'Denegado';
  reason: string;
  similarity: number;
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
    lastVisit: 'Hace 4 días (2026-08-12)',
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
    lastVisit: 'Hace 5 días (2026-08-11)',
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
    lastVisit: 'Hoy, 07:30 AM',
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
    lastVisit: 'Hace 3 días (2026-08-13)',
    accessToken: 'c1111111-1111-1111-1111-111111111106',
    memberPin: '5555',
    birthDate: '1982-12-05',
    fitnessGoal: 'perdida_grasa'
  }
];

const INITIAL_LOGS: AccessLog[] = [
  {
    id: 'LOG-9001',
    memberId: 'a1111111-1111-1111-1111-111111111101',
    memberName: 'Carlos Mendoza',
    memberAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250',
    planType: 'Mensual Premium',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    timeFormatted: '08:42 AM',
    type: 'Entrada',
    status: 'Permitido',
    similarity: 98.4,
    reason: 'Membresía Activa - Coincidencia Facial 98.4% (>= 95% Requerido)'
  },
  {
    id: 'LOG-9002',
    memberId: 'a1111111-1111-1111-1111-111111111102',
    memberName: 'Elia Hernandez',
    memberAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250&h=250',
    planType: 'Anual Premium',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    timeFormatted: '08:15 AM',
    type: 'Salida',
    status: 'Permitido',
    similarity: 99.1,
    reason: 'Membresía Activa - Coincidencia Facial 99.1% (>= 95% Requerido)'
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
        .limit(50);

      if (!logsError && dbLogs && dbLogs.length > 0) {
        const mappedLogs: AccessLog[] = dbLogs.map((log: any) => {
          const logDate = new Date(log.created_at);
          const hours = logDate.getHours().toString().padStart(2, '0');
          const minutes = logDate.getMinutes().toString().padStart(2, '0');
          const timeFormatted = `${hours}:${minutes} ${logDate.getHours() >= 12 ? 'PM' : 'AM'}`;
          const memberData = log.members;

          return {
            id: log.id,
            memberId: log.member_id,
            memberName: memberData?.full_name || 'Socio Registrado',
            memberAvatar: memberData?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250&h=250',
            planType: memberData?.plan_type || 'Mensual Premium',
            timestamp: log.created_at,
            timeFormatted,
            type: log.type as 'Entrada' | 'Salida',
            status: log.status as 'Permitido' | 'Denegado',
            similarity: Number(log.similarity) || 98.0,
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

  registerAccess(
    memberId: string, 
    type: 'Entrada' | 'Salida' = 'Entrada',
    forcedSimilarity?: number
  ): { success: boolean; log: AccessLog; member?: BiometricMember; similarity: number } {
    const members = this.getMembers();
    const member = members.find(m => m.id === memberId);

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeFormatted = `${hours}:${minutes} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    if (!member) {
      const similarity = forcedSimilarity ?? parseFloat((Math.random() * 40 + 30).toFixed(1));
      const log: AccessLog = {
        id: `LOG-${Date.now()}`,
        memberId: 'DESCONOCIDO',
        memberName: 'Persona no identificada',
        memberAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250&h=250',
        planType: 'Ninguno',
        timestamp: now.toISOString(),
        timeFormatted,
        type,
        status: 'Denegado',
        similarity,
        reason: `Rostro no encontrado en el sistema (${similarity}% efectividad)`
      };
      const logs = [log, ...this.getAccessLogs()].slice(0, 50);
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));
      window.dispatchEvent(new CustomEvent('zona_cero_access_updated'));
      return { success: false, log, similarity };
    }

    // Determine biometric similarity
    const similarity = forcedSimilarity ?? parseFloat((95.1 + Math.random() * 4.7).toFixed(1));
    
    // Strict > 95% threshold requirement
    const meetsBiometricThreshold = similarity >= 95.0;
    const isPlanActive = member.status === 'Activo';
    const isAuthorized = meetsBiometricThreshold && isPlanActive;

    let reason = '';
    if (!meetsBiometricThreshold) {
      reason = `Similitud insuficiente (${similarity}% < 95.0% requerido)`;
    } else if (!isPlanActive) {
      reason = `Acceso Denegado: Membresía en estado '${member.status}' (Efectividad ${similarity}%)`;
    } else {
      reason = `Membresía Activa - Coincidencia Facial ${similarity}% (Efectividad > 95% Cumplida)`;
    }

    const log: AccessLog = {
      id: `LOG-${Date.now()}`,
      memberId: member.id,
      memberName: member.fullName,
      memberAvatar: member.avatarUrl,
      planType: member.planType,
      timestamp: now.toISOString(),
      timeFormatted,
      type,
      status: isAuthorized ? 'Permitido' : 'Denegado',
      similarity,
      reason
    };

    if (isAuthorized) {
      this.updateMember(member.id, { lastVisit: `Hoy, ${timeFormatted}` });
    }

    const logs = [log, ...this.getAccessLogs()].slice(0, 50);
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('zona_cero_access_updated'));

    // Save attendance log to Supabase if valid UUID
    if (isSupabaseReady() && member.id && member.id.includes('-')) {
      supabase
        .from('attendance_logs')
        .insert({
          member_id: member.id,
          type: type,
          status: isAuthorized ? 'Permitido' : 'Denegado',
          similarity: similarity,
          reason: reason
        })
        .then(
          ({ error }) => {
            if (error) console.error('❌ Error al registrar asistencia en Supabase:', error.message);
            else console.log('✅ Asistencia registrada en Supabase para:', member.fullName);
          },
          (err) => console.error('Error al registrar asistencia en Supabase:', err)
        );
    }

    return { success: isAuthorized, log, member, similarity };
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
