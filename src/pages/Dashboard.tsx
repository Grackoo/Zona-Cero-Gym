import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { biometricsStore, AccessLog, BiometricMember } from '../lib/biometricsStore';
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
  ExternalLink
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState(true);
  const [justRegistered, setJustRegistered] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<AccessLog | null>(null);

  useEffect(() => {
    setLogs(biometricsStore.getAccessLogs());
    const handleUpdate = () => setLogs(biometricsStore.getAccessLogs());
    window.addEventListener('zona_cero_access_updated', handleUpdate);
    return () => window.removeEventListener('zona_cero_access_updated', handleUpdate);
  }, []);

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

      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('/Image 1.png')" }}></div>
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
                    {log.type === 'Entrada' ? 'IN' : 'OUT'}
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
              <p className="text-sm text-white font-medium">Pago vencido: Maria Lopez</p>
              <p className="text-xs text-cero-text-muted mt-1">Membresía básica expiró ayer.</p>
            </div>
            <div className="bg-cero-bg border-l-2 border-cero-lime p-4 rounded-r-lg">
              <p className="text-sm text-white font-medium">Mantenimiento de Equipo</p>
              <p className="text-xs text-cero-text-muted mt-1">Caminadora 3 programada para revisión.</p>
            </div>
          </div>
        </div>

        {/* Punto de Venta (POS) - Quick View */}
        <div className="bg-cero-panel rounded-xl p-6 border border-cero-border col-span-1 md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Punto de Venta (POS)</h2>
            <ShoppingCart className="text-cero-text-muted" size={20} />
          </div>
          <div className="flex gap-6 h-64">
            <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto pr-2">
              <div className="bg-cero-bg border border-cero-border rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cero-lime transition-colors text-center">
                <div className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center">🥤</div>
                <div>
                  <p className="text-sm font-medium text-white">Whey...</p>
                  <p className="text-xs text-cero-lime">$45.00</p>
                </div>
              </div>
              <div className="bg-cero-bg border border-cero-border rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cero-lime transition-colors text-center">
                <div className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center">💧</div>
                <div>
                  <p className="text-sm font-medium text-white">Water...</p>
                  <p className="text-xs text-cero-lime">$2.50</p>
                </div>
              </div>
              <div className="bg-cero-bg border border-cero-border rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cero-lime transition-colors text-center">
                <div className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center">⚡</div>
                <div>
                  <p className="text-sm font-medium text-white">Creatine</p>
                  <p className="text-xs text-cero-lime">$25.00</p>
                </div>
              </div>
              <div className="bg-cero-bg border border-cero-border rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cero-lime transition-colors text-center">
                <div className="w-10 h-10 bg-[#1e293b] rounded-full flex items-center justify-center">🔋</div>
                <div>
                  <p className="text-sm font-medium text-white">Energ...</p>
                  <p className="text-xs text-cero-lime">$3.00</p>
                </div>
              </div>
            </div>

            <div className="w-64 flex flex-col">
              <select className="w-full bg-cero-bg border border-cero-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cero-lime mb-3">
                <option>Seleccionar Cliente...</option>
              </select>
              <div className="flex-1 bg-cero-bg border border-cero-border rounded-lg flex items-center justify-center text-cero-text-muted text-sm mb-3">
                Carrito vacío
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-white">Total:</span>
                <span className="text-lg font-bold text-cero-lime">$0.00</span>
              </div>
              <button 
                onClick={() => navigate('/pos')}
                className="w-full bg-cero-lime hover:bg-cero-lime-hover text-black py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer"
              >
                Finalizar Venta
              </button>
            </div>
          </div>
        </div>

        {/* Membresías Overview */}
        <div className="bg-cero-panel rounded-xl p-6 border border-cero-border col-span-1 md:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Membresías</h2>
          </div>
          <div className="flex gap-2 mb-4">
            <button className="bg-[#1e293b] text-xs text-white px-3 py-1.5 rounded hover:bg-[#2d3748] cursor-pointer">Filtro: {">"} 3 Días Ausente</button>
            <button className="bg-[#1e293b] text-xs text-white px-3 py-1.5 rounded hover:bg-[#2d3748] cursor-pointer">Recordatorio WhatsApp</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-cero-text-muted border-b border-cero-border">
                <tr>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cero-border">
                <tr>
                  <td className="py-3 text-white">Elena R.</td>
                  <td className="py-3"><span className="flex items-center gap-1 text-cero-lime"><div className="w-1.5 h-1.5 rounded-full bg-cero-lime"></div>Pagado</span></td>
                </tr>
                <tr>
                  <td className="py-3 text-white">Miguel A.</td>
                  <td className="py-3"><span className="flex items-center gap-1 text-rose-400"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>Vencido</span></td>
                </tr>
                <tr>
                  <td className="py-3 text-white">Sofia V.</td>
                  <td className="py-3"><span className="flex items-center gap-1 text-cero-lime"><div className="w-1.5 h-1.5 rounded-full bg-cero-lime"></div>Pagado</span></td>
                </tr>
                <tr>
                  <td className="py-3 text-white">David L.</td>
                  <td className="py-3"><span className="flex items-center gap-1 text-cero-lime"><div className="w-1.5 h-1.5 rounded-full bg-cero-lime"></div>Pagado</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
