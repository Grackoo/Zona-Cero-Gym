import { PageHeader } from '../components/PageHeader';
import { Search, Users, CheckCircle, TrendingUp, MoreVertical, Filter } from 'lucide-react';

export default function Members() {
  const members = [
    { name: 'Elia Hernandez', id: '4892-A', plan: 'Anual Premium', status: 'Activo', visit: 'Hoy, 08:42 AM', img: 'https://i.pravatar.cc/150?u=elia-hernandez' },
    { name: 'Maria Lopez', id: '5120-B', plan: 'Mensual Básico', status: 'Vencido', visit: 'Hace 3 días', img: 'https://i.pravatar.cc/150?u=maria-lopez' },
    { name: 'Elena Rodriguez', id: '3044-C', plan: 'Anual Estándar', status: 'Congelado', visit: 'Hace 14 días', img: 'https://i.pravatar.cc/150?u=elena-rodriguez' },
    { name: 'Carlos Mendoza', id: '6711-A', plan: 'Mensual Premium', status: 'Activo', visit: 'Ayer, 18:30 PM', img: 'https://i.pravatar.cc/150?u=carlos-mendoza' },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <PageHeader
        title="Directorio de Miembros"
        subtitle="Administra y monitorea todas las membresías activas del gimnasio."
      >
        <button className="bg-cero-lime text-black font-semibold px-4 py-2 rounded-lg ml-auto hover:bg-cero-lime-hover transition-colors text-sm">
          + Añadir Miembro
        </button>
      </PageHeader>

      <div className="p-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-cero-panel border border-cero-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-cero-text-muted font-mono tracking-wider uppercase">Miembros Totales</span>
              <div className="p-2 bg-[#1e293b] rounded-lg">
                <Users className="text-cero-lime" size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-white">1,248</div>
          </div>

          <div className="bg-cero-panel border border-cero-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-cero-text-muted font-mono tracking-wider uppercase">Miembros Activos</span>
              <div className="p-2 bg-[#1e293b] rounded-lg">
                <CheckCircle className="text-cero-lime" size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-cero-lime">1,102</div>
          </div>

          <div className="bg-cero-panel border border-cero-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-cero-text-muted font-mono tracking-wider uppercase">Nuevos este Mes</span>
              <div className="p-2 bg-[#1e293b] rounded-lg">
                <TrendingUp className="text-cero-lime" size={20} />
              </div>
            </div>
            <div className="text-4xl font-bold text-white">84</div>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-cero-panel border border-cero-border rounded-xl flex flex-col">
          {/* Table Controls */}
          <div className="p-4 border-b border-cero-border flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cero-text-muted" size={18} />
              <input
                type="text"
                placeholder="Filtrar miembros..."
                className="w-full bg-white text-black text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none"
              />
            </div>
            <select className="bg-transparent border border-cero-border text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-cero-lime w-48">
              <option>Estado: Todos</option>
            </select>
            <select className="bg-transparent border border-cero-border text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-cero-lime w-48">
              <option>Plan: Todos</option>
            </select>
            <button className="px-4 py-2 border border-cero-border rounded-lg text-white hover:bg-[#1e293b] transition-colors">
              <Filter size={18} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-cero-text-muted uppercase tracking-wider font-mono bg-cero-panel border-b border-cero-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Miembro</th>
                  <th className="px-6 py-4 font-medium">Tipo de Plan</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Última Visita</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cero-border bg-cero-bg/30">
                {members.map((member, i) => (
                  <tr key={i} className="hover:bg-cero-bg/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={member.img} alt={member.name} className="w-10 h-10 rounded-full bg-gray-800 object-cover" />
                        <div>
                          <div className="text-white font-medium">{member.name}</div>
                          <div className="text-xs text-cero-text-muted font-mono">ID: {member.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{member.plan}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${member.status === 'Activo' ? 'bg-cero-lime/10 text-cero-lime border-cero-lime/20' :
                          member.status === 'Vencido' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{member.visit}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-cero-text-muted hover:text-white transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-cero-border flex justify-between items-center text-sm text-cero-text-muted">
            <div>Mostrando 1 a 4 de 1,248</div>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded bg-cero-bg border border-cero-border hover:bg-cero-panel">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#2d3748] text-white">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-cero-panel text-white">2</button>
              <span className="w-8 h-8 flex items-center justify-center">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-cero-bg border border-cero-border hover:bg-cero-panel">&gt;</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
