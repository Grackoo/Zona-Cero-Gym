import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { biometricsStore, AccessLog, BiometricMember } from '../lib/biometricsStore';
import { retentionService, InactiveMemberRisk } from '../lib/retentionService';
import { walletService } from '../lib/walletService';
import { useNavigate } from 'react-router-dom';
import { 
  Fingerprint, 
  Search, 
  ShoppingCart, 
  UserCheck, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  ScanFace,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Clock,
  Wallet,
  Flame,
  UserX,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [inactiveRisks, setInactiveRisks] = useState<InactiveMemberRisk[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState(true);
  const [justRegistered, setJustRegistered] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<AccessLog | null>(null);

  useEffect(() => {
    loadData();
    biometricsStore.syncFromSupabase();
    const handleAccessUpdate = () => loadData();
    const handleMembersUpdate = () => loadData();
    const handleWalletUpdate = () => loadData();

    window.addEventListener('zona_cero_access_updated', handleAccessUpdate);
    window.addEventListener('zona_cero_members_updated', handleMembersUpdate);
    window.addEventListener('zona_cero_wallet_updated', handleWalletUpdate);

    return () => {
      window.removeEventListener('zona_cero_access_updated', handleAccessUpdate);
      window.removeEventListener('zona_cero_members_updated', handleMembersUpdate);
      window.removeEventListener('zona_cero_wallet_updated', handleWalletUpdate);
    };
  }, []);

  const loadData = () => {
    setLogs(biometricsStore.getAccessLogs());
    setInactiveRisks(retentionService.getInactiveMembers(3));
  };

  const handleQuickRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    biometricsStore.addMember({
      fullName: name,
      phone: phone || '+52 55 1234 5678',
      planType: 'Mensual Premium',
      status: 'Activo',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250',
      whatsappConnected: whatsapp,
      memberPin: '1234',
      fitnessGoal: 'hipertrofia'
    });

    setJustRegistered(true);
    setName('');
    setPhone('');
    setTimeout(() => setJustRegistered(false), 2500);
  };

  const handleQuickScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const members = biometricsStore.getMembers();
      if (members.length > 0) {
        const randomMember = members[Math.floor(Math.random() * members.length)];
        const result = biometricsStore.registerAccess(randomMember.id, 'Entrada');
        setLastScanned(result.log);
        if (result.success) {
          walletService.grantCheckinReward(randomMember.id);
        }
      }
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-cero-bg">
      <PageHeader
        title="Vista General"
        rightContent={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cero-text-muted" size={18} />
            <input
              type="text"
              placeholder="Buscar miembros, productos..."
              className="bg-cero-panel border border-cero-border text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-cero-lime w-64"
            />
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* RETENTION ALERT BANNER: INACTIVE MEMBERS (3+ DAYS) */}
        <div className="bg-gradient-to-r from-[#1c150a] via-[#0a2233] to-[#02111c] border border-amber-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Alerta de Retención: Miembros en Riesgo</h2>
                  <span className="bg-amber-500/20 text-amber-300 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    {inactiveRisks.length} Miembros (3+ Días Inactivos)
                  </span>
                </div>
                <p className="text-xs text-cero-text-muted mt-0.5">
                  Miembros activos sin asistencia registrada en los últimos 3 o más días. Envía un mensaje motivacional directo para evitar abandono.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/members')}
              className="text-xs text-cero-lime hover:underline flex items-center gap-1 font-semibold self-start sm:self-auto"
            >
              Ver todos en Directorio <ArrowRight size={13} />
            </button>
          </div>

          {inactiveRisks.length === 0 ? (
            <div className="bg-cero-bg/80 border border-cero-border rounded-xl p-4 text-center text-xs text-emerald-400 font-medium flex items-center justify-center gap-2">
              <CheckCircle2 size={16} />
              ¡Excelente! Todos los miembros activos han asistido regularmente en los últimos 3 días.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {inactiveRisks.slice(0, 3).map((item) => (
                <div key={item.member.id} className="bg-cero-bg/90 border border-cero-border hover:border-amber-500/40 rounded-xl p-4 flex flex-col justify-between transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <img 
                      src={item.member.avatarUrl} 
                      alt={item.member.fullName} 
                      className="w-11 h-11 rounded-full object-cover border border-amber-500/30 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white truncate">{item.member.fullName}</h4>
                      <p className="text-[11px] text-cero-text-muted">{item.member.planType}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-400 font-mono font-semibold">
                        <Clock size={12} />
                        <span>{item.daysInactive} días sin asistir</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-cero-border/60 flex items-center justify-between">
                    <div className="text-[11px] text-cero-text-muted">
                      Monedero: <span className="text-cero-lime font-mono font-bold">${item.walletBalance.toFixed(2)}</span>
                    </div>
                    <a
                      href={item.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3 Main Grid Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Inscribir Cliente Card */}
          <div className="bg-cero-panel rounded-xl p-6 border border-cero-border flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Inscripción de Cliente</h2>
                <Fingerprint className="text-cero-lime" size={24} />
              </div>

              {justRegistered && (
                <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>¡Cliente inscrito con biometría guardada!</span>
                </div>
              )}

              <form onSubmit={handleQuickRegister} className="space-y-4">
                <div>
                  <label className="block text-xs text-cero-text-muted mb-1 font-mono uppercase">Nombre Completo</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Ana Pérez" 
                    className="w-full bg-cero-bg border border-cero-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cero-lime" 
                  />
                </div>
                <div>
                  <label className="block text-xs text-cero-text-muted mb-1 font-mono uppercase">Número Telefónico</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+52 55 1234 5678" 
                    className="w-full bg-cero-bg border border-cero-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cero-lime" 
                  />
                </div>
                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.checked)}
                    className="rounded border-cero-border bg-cero-bg text-cero-lime focus:ring-cero-lime/50 cursor-pointer" 
                  />
                  <span className="text-sm text-gray-300">Conectado a WhatsApp</span>
                </label>

                <button 
                  type="submit"
                  className="w-full bg-[#1e293b] hover:bg-cero-lime hover:text-black border border-cero-border text-gray-200 py-3 rounded-lg text-sm font-bold mt-4 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Fingerprint size={18} />
                  Registrar Biometría
                </button>
              </form>
            </div>

            <button 
              onClick={() => navigate('/access')}
              className="text-xs text-cero-lime hover:underline mt-4 flex items-center justify-end gap-1 cursor-pointer font-semibold"
            >
              Abrir módulo de enrolamiento facial <ArrowRight size={13} />
            </button>
          </div>

          {/* Registro Entrada/Salida Card */}
          <div className="bg-cero-panel rounded-xl p-6 border border-cero-border flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Registro de Entrada/Salida</h2>
                <button 
                  onClick={() => navigate('/access')} 
                  className="text-xs text-cero-lime hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                  title="Ir al módulo independiente de acceso"
                >
                  Módulo Completo <ExternalLink size={12} />
                </button>
              </div>

              {/* Quick interactive scanner trigger */}
              <div 
                onClick={handleQuickScan}
                className="relative h-36 bg-cero-bg rounded-lg border border-cero-border border-dashed flex items-center justify-center overflow-hidden mb-4 group cursor-pointer hover:border-cero-lime transition-all"
                title="Haz clic para simular escaneo facial"
              >
                <div className="z-10 flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-xl border-2 border-cero-lime border-dashed flex items-center justify-center ${isScanning ? 'animate-spin' : 'animate-pulse'}`}>
                    <UserCheck className="text-cero-lime" size={24} />
                  </div>
                  <span className="text-xs text-cero-lime font-mono font-bold tracking-wider">
                    {isScanning ? 'ESCANEANDO...' : 'CLIC PARA ESCANEAR'}
                  </span>
                </div>
              </div>

              {/* Recent Check-in Logs */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {logs.slice(0, 3).map(log => (
                  <div key={log.id} className="flex items-center justify-between bg-cero-bg p-2.5 rounded-lg border border-cero-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={log.memberAvatar} alt={log.memberName} className="w-9 h-9 rounded-full object-cover border border-cero-border shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{log.memberName}</p>
                        <p className="text-xs text-cero-text-muted font-mono">{log.timeFormatted}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ${
                      log.type === 'Entrada'
                        ? 'bg-cero-lime/10 text-cero-lime border border-cero-lime/20'
                        : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                    }`}>
                      {log.type === 'Entrada' ? 'IN (+ $5)' : 'OUT'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/access')}
              className="w-full bg-[#1e293b] hover:bg-[#283548] text-white text-xs font-bold py-2 rounded-lg transition-colors mt-4 flex items-center justify-center gap-2 cursor-pointer border border-cero-border"
            >
              <ScanFace size={14} /> Abrir Tótem de Reconocimiento
            </button>
          </div>

          {/* Alertas Card */}
          <div className="bg-cero-panel rounded-xl p-6 border border-cero-border flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="text-rose-400" size={20} />
                Alertas del Sistema
              </h2>
            </div>

            <div className="space-y-3 flex-1">
              <div className="bg-cero-bg border-l-2 border-rose-500 p-4 rounded-r-lg">
                <p className="text-sm text-white font-medium">Stock bajo de Proteína</p>
                <p className="text-xs text-cero-text-muted mt-1">Quedan 2 unidades de Whey Gold.</p>
              </div>
              <div className="bg-cero-bg border-l-2 border-rose-500 p-4 rounded-r-lg">
                <p className="text-sm text-white font-medium">Membresías por Vencer</p>
                <p className="text-xs text-cero-text-muted mt-1">3 clientes vencen en los próximos 2 días.</p>
              </div>
              <div className="bg-cero-bg border-l-2 border-cero-lime p-4 rounded-r-lg">
                <p className="text-sm text-white font-medium">Gamificación Activa</p>
                <p className="text-xs text-cero-text-muted mt-1">Recompensas de monedero funcionando al 100%.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
