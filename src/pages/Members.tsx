import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { biometricsStore, BiometricMember } from '../lib/biometricsStore';
import { walletService } from '../lib/walletService';
import { retentionService } from '../lib/retentionService';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Trash2, 
  Filter, 
  UserPlus, 
  ScanFace,
  AlertTriangle,
  Wallet,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Clock,
  Sparkles,
  Smartphone
} from 'lucide-react';

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<BiometricMember[]>([]);
  const [wallets, setWallets] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [planFilter, setPlanFilter] = useState('Todos');
  const [retentionFilter, setRetentionFilter] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<BiometricMember | null>(null);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  useEffect(() => {
    loadMembersData();
    biometricsStore.syncFromSupabase();
    const handleUpdate = () => loadMembersData();
    window.addEventListener('zona_cero_members_updated', handleUpdate);
    window.addEventListener('zona_cero_wallet_updated', handleUpdate);
    return () => {
      window.removeEventListener('zona_cero_members_updated', handleUpdate);
      window.removeEventListener('zona_cero_wallet_updated', handleUpdate);
    };
  }, []);

  const loadMembersData = () => {
    setMembers(biometricsStore.getMembers());
    setWallets(walletService.getLocalWallets());
  };

  const isInactiveRisk = (member: BiometricMember) => {
    if (member.status !== 'Activo') return false;
    if (member.lastVisit && member.lastVisit.includes('Hace')) {
      const match = member.lastVisit.match(/Hace (\d+) días/);
      if (match && parseInt(match[1], 10) >= 3) return true;
    }
    return false;
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          m.id.toLowerCase().includes(search.toLowerCase()) ||
                          m.phone.includes(search);
    const matchesStatus = statusFilter === 'Todos' || m.status === statusFilter;
    const matchesPlan = planFilter === 'Todos' || m.planType.includes(planFilter);
    const matchesRetention = !retentionFilter || isInactiveRisk(m);
    return matchesSearch && matchesStatus && matchesPlan && matchesRetention;
  });

  const activeCount = members.filter(m => m.status === 'Activo').length;
  const atRiskCount = members.filter(m => isInactiveRisk(m)).length;

  const handleDelete = (member: BiometricMember) => {
    biometricsStore.deleteMember(member.id);
    setMemberToDelete(null);
  };

  const handleCopyPortalLink = (member: BiometricMember) => {
    const token = member.accessToken || member.id;
    const url = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedTokenId(member.id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-cero-bg">
      <PageHeader
        title="Directorio de Miembros"
        subtitle="Administra membresías, monederos electrónicos y portales interactivos de clientes."
      >
        <button 
          onClick={() => navigate('/access')}
          className="bg-cero-lime text-black font-bold px-4 py-2 rounded-lg ml-auto hover:bg-cero-lime-hover transition-colors text-sm flex items-center gap-2 cursor-pointer"
        >
          <UserPlus size={16} />
          + Añadir Miembro Biométrico
        </button>
      </PageHeader>

      <div className="p-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-cero-panel border border-cero-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-cero-text-muted font-mono tracking-wider uppercase">Registrados</span>
              <div className="p-2 bg-[#1e293b] rounded-lg">
                <Users className="text-cero-lime" size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{members.length}</div>
          </div>

          <div className="bg-cero-panel border border-cero-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-cero-text-muted font-mono tracking-wider uppercase">Activos</span>
              <div className="p-2 bg-[#1e293b] rounded-lg">
                <CheckCircle className="text-cero-lime" size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold text-cero-lime">{activeCount}</div>
          </div>

          <div 
            onClick={() => setRetentionFilter(!retentionFilter)}
            className={`border rounded-xl p-6 cursor-pointer transition-all ${
              retentionFilter 
                ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                : 'bg-cero-panel border-cero-border hover:border-amber-500/40'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-amber-300 font-mono tracking-wider uppercase">Riesgo Abandono (3+ días)</span>
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-400">{atRiskCount}</div>
          </div>

          <div className="bg-cero-panel border border-cero-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-cero-text-muted font-mono tracking-wider uppercase">Saldo Monederos</span>
              <div className="p-2 bg-[#1e293b] rounded-lg">
                <Wallet className="text-cero-lime" size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">
              ${(Object.values(wallets) as number[]).reduce((a: number, b: number) => a + b, 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-cero-panel border border-cero-border rounded-xl flex flex-col shadow-lg">
          {/* Table Controls */}
          <div className="p-4 border-b border-cero-border flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cero-text-muted" size={18} />
              <input
                type="text"
                placeholder="Filtrar por nombre, ID o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#10161c] text-white text-sm rounded-lg pl-10 pr-4 py-2 border border-cero-border focus:outline-none focus:border-cero-lime"
              />
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#10161c] border border-cero-border text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-cero-lime w-44 cursor-pointer"
            >
              <option value="Todos">Estado: Todos</option>
              <option value="Activo">Activos</option>
              <option value="Vencido">Vencidos</option>
              <option value="Congelado">Congelados</option>
            </select>

            <select 
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-[#10161c] border border-cero-border text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-cero-lime w-44 cursor-pointer"
            >
              <option value="Todos">Plan: Todos</option>
              <option value="Premium">Premium</option>
              <option value="Básico">Básico</option>
              <option value="Estándar">Estándar</option>
            </select>

            <button
              onClick={() => setRetentionFilter(!retentionFilter)}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border cursor-pointer ${
                retentionFilter
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-[#10161c] text-gray-300 border-cero-border hover:border-amber-500'
              }`}
            >
              <AlertTriangle size={14} />
              {retentionFilter ? 'Filtrando: En Riesgo' : 'Solo en Riesgo (3+ días)'}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-cero-text-muted uppercase tracking-wider font-mono bg-[#10161c] border-b border-cero-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Miembro y Biometría</th>
                  <th className="px-6 py-4 font-medium">Monedero</th>
                  <th className="px-6 py-4 font-medium">Meta & Plan</th>
                  <th className="px-6 py-4 font-medium">Estado & Asistencia</th>
                  <th className="px-6 py-4 font-medium text-right">Portal & Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cero-border bg-cero-bg/30">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-cero-text-muted">
                      No se encontraron miembros con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const balance = wallets[member.id] || 0.00;
                    const inRisk = isInactiveRisk(member);
                    const whatsappUrl = retentionService.generateWhatsAppUrl(member, 4, balance);

                    return (
                      <tr key={member.id} className="hover:bg-cero-bg/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={member.avatarUrl} alt={member.fullName} className="w-10 h-10 rounded-full bg-gray-800 object-cover border border-cero-border" />
                            <div>
                              <div className="text-white font-medium flex items-center gap-2">
                                {member.fullName}
                                {inRisk && (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                                    3+ días ausente
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-cero-text-muted font-mono">
                                ID: {member.id} • PIN: {member.memberPin || '1234'} • {member.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Wallet Balance */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-cero-lime font-mono font-bold">
                            <Wallet size={14} />
                            <span>${balance.toFixed(2)}</span>
                          </div>
                        </td>

                        {/* Goal & Plan */}
                        <td className="px-6 py-4">
                          <div className="text-gray-200 font-medium">{member.planType}</div>
                          <div className="text-xs text-cero-text-muted capitalize">
                            🎯 {(member.fitnessGoal || 'salud_general').replace('_', ' ')}
                          </div>
                        </td>

                        {/* Status & Last Visit */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border w-fit ${
                              member.status === 'Activo' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : member.status === 'Vencido' 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>
                              {member.status}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">
                              {member.lastVisit || 'Sin registro'}
                            </span>
                          </div>
                        </td>

                        {/* Portal & Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Superlink / Member Portal Button */}
                            <a
                              href={`/portal/${member.accessToken || member.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-[#10161c] hover:bg-cero-lime hover:text-black text-white px-3 py-1.5 rounded-lg border border-cero-border transition-all inline-flex items-center gap-1 font-semibold"
                              title="Abrir Portal Público del Miembro"
                            >
                              <Smartphone size={13} />
                              Portal
                            </a>

                            <button
                              onClick={() => handleCopyPortalLink(member)}
                              className="p-1.5 text-cero-text-muted hover:text-white bg-[#10161c] border border-cero-border rounded-lg transition-colors"
                              title="Copiar Enlace del Portal"
                            >
                              {copiedTokenId === member.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>

                            {/* WhatsApp Button */}
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 bg-emerald-500/10 border border-emerald-500/30 rounded-lg transition-colors"
                              title="Enviar mensaje motivacional por WhatsApp"
                            >
                              <MessageCircle size={14} />
                            </a>

                            {/* Delete */}
                            <button 
                              onClick={() => setMemberToDelete(member)}
                              className="p-1.5 text-cero-text-muted hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                              title={`Eliminar a ${member.fullName}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-cero-border flex justify-between items-center text-sm text-cero-text-muted">
            <div>Mostrando {filteredMembers.length} de {members.length} miembros registrados</div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {memberToDelete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-cero-panel border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/30">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">¿Eliminar Miembro?</h3>
                  <p className="text-xs text-cero-text-muted">Esta acción borrará sus datos personales y registro biométrico.</p>
                </div>
              </div>

              <div className="p-4 bg-[#10161c] border border-cero-border rounded-xl flex items-center gap-4">
                <img 
                  src={memberToDelete.avatarUrl} 
                  alt={memberToDelete.fullName} 
                  className="w-12 h-12 rounded-xl object-cover border border-cero-border"
                />
                <div>
                  <p className="text-sm font-bold text-white">{memberToDelete.fullName}</p>
                  <p className="text-xs text-cero-text-muted">ID: {memberToDelete.id} • Plan: {memberToDelete.planType}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setMemberToDelete(null)}
                  className="px-4 py-2.5 border border-cero-border text-white text-sm font-semibold rounded-xl hover:bg-[#1e293b] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(memberToDelete)}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Trash2 size={16} /> Confirmar Eliminación
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
