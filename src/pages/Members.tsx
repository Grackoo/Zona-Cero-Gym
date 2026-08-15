import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { biometricsStore, BiometricMember } from '../lib/biometricsStore';
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
  AlertTriangle 
} from 'lucide-react';

export default function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<BiometricMember[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [planFilter, setPlanFilter] = useState('Todos');
  const [memberToDelete, setMemberToDelete] = useState<BiometricMember | null>(null);

  useEffect(() => {
    setMembers(biometricsStore.getMembers());
    const handleUpdate = () => setMembers(biometricsStore.getMembers());
    window.addEventListener('zona_cero_members_updated', handleUpdate);
    return () => window.removeEventListener('zona_cero_members_updated', handleUpdate);
  }, []);

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          m.id.toLowerCase().includes(search.toLowerCase()) ||
                          m.phone.includes(search);
    const matchesStatus = statusFilter === 'Todos' || m.status === statusFilter;
    const matchesPlan = planFilter === 'Todos' || m.planType.includes(planFilter);
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const activeCount = members.filter(m => m.status === 'Activo').length;

  const handleDelete = (member: BiometricMember) => {
    biometricsStore.deleteMember(member.id);
    setMemberToDelete(null);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-cero-bg">
      <PageHeader
        title="Directorio de Miembros"
        subtitle="Administra y monitorea todas las membresías y datos biométricos del gimnasio."
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-cero-panel border border-cero-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-cero-text-muted font-mono tracking-wider uppercase">Miembros Registrados</span>
              <div className="p-2 bg-[#1e293b] rounded-lg">
                <Users className="text-cero-lime" size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-white">{members.length}</div>
          </div>

          <div className="bg-cero-panel border border-cero-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-cero-text-muted font-mono tracking-wider uppercase">Miembros Activos</span>
              <div className="p-2 bg-[#1e293b] rounded-lg">
                <CheckCircle className="text-cero-lime" size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-cero-lime">{activeCount}</div>
          </div>

          <div className="bg-cero-panel border border-cero-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-cero-text-muted font-mono tracking-wider uppercase">Enrolados con Rostro</span>
              <div className="p-2 bg-[#1e293b] rounded-lg">
                <ScanFace className="text-cero-lime" size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-white">100%</div>
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
              <option value="Pase">Pases por Día</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-cero-text-muted uppercase tracking-wider font-mono bg-[#10161c] border-b border-cero-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Miembro y Biometría</th>
                  <th className="px-6 py-4 font-medium">Tipo de Plan</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Última Visita</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
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
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-cero-bg/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={member.avatarUrl} alt={member.fullName} className="w-10 h-10 rounded-full bg-gray-800 object-cover border border-cero-border" />
                          <div>
                            <div className="text-white font-medium">{member.fullName}</div>
                            <div className="text-xs text-cero-text-muted font-mono">ID: {member.id} • {member.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{member.planType}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                          member.status === 'Activo' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : member.status === 'Vencido' 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{member.lastVisit || 'Hoy'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate('/access')}
                            className="text-xs bg-[#1e293b] hover:bg-cero-lime hover:text-black text-white px-3 py-1.5 rounded-lg border border-cero-border transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Ir al escáner facial"
                          >
                            <ScanFace size={13} />
                            Acceso
                          </button>
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
                  ))
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
