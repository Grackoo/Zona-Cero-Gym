import { FitnessGoal } from '../types';

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

const INITIAL_MEMBERS: BiometricMember[] = [
  {
    id: 'ZC-1001',
    fullName: 'Carlos Mendoza',
    phone: '+52 55 1234 5678',
    planType: 'Mensual Premium',
    status: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250',
    whatsappConnected: true,
    registeredAt: '2026-01-15',
    lastVisit: 'Hoy, 08:42 AM',
    accessToken: 'carlos-mendoza-token-77',
    memberPin: '1234',
    birthDate: '1998-04-12',
    fitnessGoal: 'hipertrofia'
  },
  {
    id: 'ZC-1002',
    fullName: 'Elia Hernandez',
    phone: '+52 55 9876 5432',
    planType: 'Anual Premium',
    status: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250&h=250',
    whatsappConnected: true,
    registeredAt: '2026-02-10',
    lastVisit: 'Hoy, 08:15 AM',
    accessToken: 'elia-hernandez-token-88',
    memberPin: '4321',
    birthDate: '2001-09-24',
    fitnessGoal: 'perdida_grasa'
  },
  {
    id: 'ZC-1003',
    fullName: 'Maria Lopez',
    phone: '+52 55 4567 8901',
    planType: 'Mensual Básico',
    status: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250&h=250',
    whatsappConnected: true,
    registeredAt: '2026-01-05',
    lastVisit: 'Hace 4 días (2026-08-12)',
    accessToken: 'maria-lopez-token-99',
    memberPin: '2026',
    birthDate: '1989-11-03',
    fitnessGoal: 'salud_general'
  },
  {
    id: 'ZC-1004',
    fullName: 'Elena Rodriguez',
    phone: '+52 55 2345 6789',
    planType: 'Anual Estándar',
    status: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250&h=250',
    whatsappConnected: true,
    registeredAt: '2025-11-20',
    lastVisit: 'Hace 5 días (2026-08-11)',
    accessToken: 'elena-rodriguez-token-11',
    memberPin: '8888',
    birthDate: '1995-07-19',
    fitnessGoal: 'mantenimiento'
  },
  {
    id: 'ZC-1005',
    fullName: 'Sarah Jenkins',
    phone: '+52 55 8765 4321',
    planType: 'Anual Premium',
    status: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250&h=250',
    whatsappConnected: true,
    registeredAt: '2026-03-01',
    lastVisit: 'Hoy, 07:30 AM',
    accessToken: 'sarah-jenkins-token-22',
    memberPin: '9999',
    birthDate: '1992-03-15',
    fitnessGoal: 'hipertrofia'
  },
  {
    id: 'ZC-1006',
    fullName: 'Roberto Valdés',
    phone: '+52 55 6789 0123',
    planType: 'Mensual Básico',
    status: 'Activo',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250',
    whatsappConnected: true,
    registeredAt: '2026-02-01',
    lastVisit: 'Hace 3 días (2026-08-13)',
    accessToken: 'roberto-valdes-token-33',
    memberPin: '5555',
    birthDate: '1982-12-05',
    fitnessGoal: 'perdida_grasa'
  }
];

const INITIAL_LOGS: AccessLog[] = [
  {
    id: 'LOG-9001',
    memberId: 'ZC-1001',
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
    memberId: 'ZC-1002',
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

  addMember(member: Omit<BiometricMember, 'id' | 'registeredAt' | 'accessToken'> & { accessToken?: string }): BiometricMember {
    const members = this.getMembers();
    const newId = `ZC-${1000 + members.length + 1}`;
    const generatedToken = member.accessToken || `token-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;
    const newMember: BiometricMember = {
      ...member,
      id: newId,
      accessToken: generatedToken,
      memberPin: member.memberPin || '1234',
      fitnessGoal: member.fitnessGoal || 'salud_general',
      registeredAt: new Date().toISOString().split('T')[0],
      lastVisit: 'Recién Registrado',
    };

    const updated = [newMember, ...members];
    localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('zona_cero_members_updated'));
    return newMember;
  },

  updateMember(id: string, updates: Partial<BiometricMember>): void {
    const members = this.getMembers();
    const updated = members.map(m => m.id === id ? { ...m, ...updates } : m);
    localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('zona_cero_members_updated'));
  },

  deleteMember(id: string): void {
    const members = this.getMembers();
    const updated = members.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('zona_cero_members_updated'));
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
