import { biometricsStore, BiometricMember, AccessLog } from './biometricsStore';
import { supabase } from './supabase';
import { walletService } from './walletService';

export interface InactiveMemberRisk {
  member: BiometricMember;
  daysInactive: number;
  lastVisitFormatted: string;
  walletBalance: number;
  whatsappUrl: string;
}

export const retentionService = {
  // Calculate inactivity in days
  getInactiveMembers(thresholdDays: number = 3): InactiveMemberRisk[] {
    const members = biometricsStore.getMembers().filter(m => m.status === 'Activo');
    const logs = biometricsStore.getAccessLogs();
    const wallets = walletService.getLocalWallets();

    const results: InactiveMemberRisk[] = [];

    for (const member of members) {
      // Find latest check-in
      const memberLogs = logs.filter(l => l.memberId === member.id && l.status === 'Permitido' && l.type === 'Entrada');
      
      let daysInactive = 0;
      let lastVisitFormatted = 'Sin registros recientes';

      if (memberLogs.length > 0) {
        const latestTimestamp = new Date(memberLogs[0].timestamp).getTime();
        const diffMs = Date.now() - latestTimestamp;
        daysInactive = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        lastVisitFormatted = `Hace ${daysInactive} días (${new Date(latestTimestamp).toLocaleDateString('es-MX')})`;
      } else if (member.lastVisit && member.lastVisit.includes('Hace')) {
        // Extract days if pre-formatted in demo
        const match = member.lastVisit.match(/Hace (\d+) días/);
        if (match) {
          daysInactive = parseInt(match[1], 10);
          lastVisitFormatted = member.lastVisit;
        } else {
          daysInactive = 4;
          lastVisitFormatted = member.lastVisit;
        }
      } else {
        // Registered date fallback
        const regTime = new Date(member.registeredAt).getTime();
        const diffMs = Date.now() - regTime;
        daysInactive = Math.max(3, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        lastVisitFormatted = `Registrado el ${member.registeredAt}`;
      }

      if (daysInactive >= thresholdDays) {
        const balance = wallets[member.id] || 0.00;
        const whatsappUrl = this.generateWhatsAppUrl(member, daysInactive, balance);

        results.push({
          member,
          daysInactive,
          lastVisitFormatted,
          walletBalance: balance,
          whatsappUrl
        });
      }
    }

    return results.sort((a, b) => b.daysInactive - a.daysInactive);
  },

  // Generates direct WhatsApp motivation URL with personalized text
  generateWhatsAppUrl(member: BiometricMember, daysInactive: number, walletBalance: number): string {
    const rawPhone = member.phone.replace(/[^0-9]/g, '');
    const phone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;

    const message = `¡Hola ${member.fullName.split(' ')[0]}! 💪 En *Zona Cero Gym* te extrañamos.
Llevas ${daysInactive} días sin entrenar y tu meta de *${member.fitnessGoal.replace('_', ' ').toUpperCase()}* te espera.

🔥 *¡No pierdas tu racha!*
Tienes *$${walletBalance.toFixed(2)} MXN* acumulados en tu Monedero Zona Cero listos para canjear en la barra de suplementos o accesorios al registrar tu check-in de hoy.

¿Nos vemos hoy en el gimnasio? ¡Te tenemos lista la rutina! 🏋️‍♂️✨`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
};
