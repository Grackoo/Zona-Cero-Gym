import { PageHeader } from '../components/PageHeader';
import { UserPlus, Shield, Clock, Phone, Mail, Edit3, Trash2 } from 'lucide-react';

export default function Staff() {
  const staff = [
    { id: 1, name: 'Carlos Mendoza', role: 'Administrador del Sistema', phone: '+1 (555) 019-8234', email: 'carlos@zonacero.com', status: 'EN TURNO', shift: '08:00 - 16:00', img: 'https://i.pravatar.cc/150?u=carlos-mendoza' },
    { id: 2, name: 'Elia Hernandez', role: 'Entrenadora Principal', phone: '+1 (555) 019-8235', email: 'elia@zonacero.com', status: 'EN TURNO', shift: '10:00 - 18:00', img: 'https://i.pravatar.cc/150?u=elia-hernandez' },
    { id: 3, name: 'David Martinez', role: 'Entrenador', phone: '+1 (555) 019-8236', email: 'david@zonacero.com', status: 'FUERA DE TURNO', shift: 'Mañana, 06:00', img: 'https://i.pravatar.cc/150?u=davidw' },
    { id: 4, name: 'Maria Lopez', role: 'Recepcionista', phone: '+1 (555) 019-8237', email: 'maria@zonacero.com', status: 'DE PERMISO', shift: 'Vuelve el 12 Oct', img: 'https://i.pravatar.cc/150?u=maria-lopez' },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <PageHeader title="Gestión de Personal" subtitle="Supervisa horarios, roles e información de contacto de los empleados.">
        <button className="bg-cero-lime text-black font-semibold px-4 py-2 rounded-lg ml-auto hover:bg-cero-lime-hover transition-colors flex items-center gap-2 text-sm">
          <UserPlus size={16} /> Añadir Empleado
        </button>
      </PageHeader>

      <div className="p-8">

        {/* Top Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          <div className="bg-cero-panel border border-cero-border rounded-xl p-6 flex flex-col justify-between">
            <h3 className="text-lg font-bold text-white mb-4">Actualmente en Turno (3)</h3>
            <div className="flex gap-4">
              {staff.filter(s => s.status === 'EN TURNO').map(s => (
                <div key={s.id} className="relative group cursor-pointer">
                  <img src={s.img} alt={s.name} className="w-14 h-14 rounded-full border-2 border-cero-lime object-cover" />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-cero-lime rounded-full border-2 border-cero-panel"></div>
                </div>
              ))}
              <div className="w-14 h-14 rounded-full border-2 border-cero-border border-dashed flex items-center justify-center text-cero-text-muted hover:border-cero-lime hover:text-white cursor-pointer transition-colors">
                <UserPlus size={20} />
              </div>
            </div>
          </div>

          <div className="bg-cero-panel border border-cero-border rounded-xl p-6 grid grid-cols-3 divide-x divide-cero-border">
            <div className="px-4 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-white mb-1">12</span>
              <span className="text-xs text-cero-text-muted uppercase tracking-wider font-mono">Personal Total</span>
            </div>
            <div className="px-4 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-cero-lime mb-1">8</span>
              <span className="text-xs text-cero-text-muted uppercase tracking-wider font-mono">Entrenadores</span>
            </div>
            <div className="px-4 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-rose-400 mb-1">1</span>
              <span className="text-xs text-cero-text-muted uppercase tracking-wider font-mono">De Permiso</span>
            </div>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {staff.map(person => (
            <div key={person.id} className="bg-cero-panel border border-cero-border rounded-xl overflow-hidden hover:border-cero-lime transition-all group">
              <div className="h-24 bg-[#10161c] relative border-b border-cero-border">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-8 h-8 rounded bg-[#1e293b] flex items-center justify-center text-cero-text-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Edit3 size={14} /></button>
                  <button className="w-8 h-8 rounded bg-rose-500/10 flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="px-6 pb-6 relative">
                <img src={person.img} className="w-20 h-20 rounded-xl border-4 border-cero-panel absolute -top-10 bg-gray-800 object-cover" />
                <div className="pt-12">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {person.name}
                    {person.role === 'Administrador del Sistema' && <Shield size={14} className="text-cero-lime" />}
                  </h3>
                  <p className="text-sm text-cero-text-muted font-mono">{person.role}</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Phone size={14} className="text-cero-text-muted" />
                      {person.phone}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Mail size={14} className="text-cero-text-muted" />
                      <span className="truncate">{person.email}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-cero-border flex justify-between items-center">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${person.status === 'EN TURNO' ? 'bg-cero-lime/10 text-cero-lime border border-cero-lime/20' :
                          person.status === 'FUERA DE TURNO' ? 'bg-[#1e293b] text-gray-400 border border-gray-600' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                        {person.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-cero-text-muted">
                      <Clock size={12} />
                      {person.shift}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
