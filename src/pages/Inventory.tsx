import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { GymMachine } from '../types';
import { gymEquipmentService } from '../lib/gymEquipmentService';
import { MachineModal } from '../components/MachineModal';
import { RoutineBuilderModal } from '../components/RoutineBuilderModal';
import {
  History,
  Package,
  Droplets,
  Shirt,
  Filter,
  AlertTriangle,
  Dumbbell,
  Plus,
  Search,
  Wrench,
  CheckCircle2,
  Trash2,
  Edit3,
  Sparkles,
  MapPin,
  Tag,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<'machines' | 'products'>('machines');
  
  // Machines state
  const [machines, setMachines] = useState<GymMachine[]>(() => gymEquipmentService.getMachines());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Modals state
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [machineToEdit, setMachineToEdit] = useState<GymMachine | null>(null);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<GymMachine | null>(null);

  useEffect(() => {
    loadMachines();
    const handleUpdate = () => loadMachines();
    window.addEventListener('zona_cero_machines_updated', handleUpdate);
    return () => {
      window.removeEventListener('zona_cero_machines_updated', handleUpdate);
    };
  }, []);

  const loadMachines = () => {
    setMachines(gymEquipmentService.getMachines());
  };

  const storeInventory = [
    { name: 'Whey Protein Isolate - Vainilla', sku: 'SKU: SUP-WPI-V2', category: 'Suplementos', stock: 12, reorder: 25, supplier: 'Optimum Nutrition', status: 'LOW STOCK' },
    { name: 'Pre-Workout Energy - Moras', sku: 'SKU: BEV-PWE-B1', category: 'Bebidas', stock: 48, reorder: 20, supplier: 'C4 Energy', status: 'OPTIMAL' },
    { name: 'Camiseta ZONA CERO - Negra (L)', sku: 'SKU: APP-TS-BL-L', category: 'Ropa', stock: 0, reorder: 10, supplier: 'In-House Print', status: 'OUT OF STOCK' },
    { name: 'Straps Levantamiento Pesado', sku: 'SKU: ACC-LS-HD', category: 'Accesorios', stock: 35, reorder: 15, supplier: 'Rogue Fitness', status: 'OPTIMAL' },
    { name: 'Creatina Monohidratada 300g', sku: 'SKU: SUP-CRE-300', category: 'Suplementos', stock: 22, reorder: 15, supplier: 'Creapure Raw', status: 'OPTIMAL' },
    { name: 'Bebida Isotónica Electrolitos', sku: 'SKU: BEV-ISO-500', category: 'Bebidas', stock: 60, reorder: 25, supplier: 'Gatorade Pro', status: 'OPTIMAL' }
  ];

  // Filtered Machines
  const filteredMachines = machines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.target_muscles.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'Todas' || m.category === categoryFilter;
    const matchesStatus = statusFilter === 'Todos' || m.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const availableCount = machines.filter(m => m.status === 'Disponible').length;
  const maintenanceCount = machines.filter(m => m.status !== 'Disponible').length;

  const handleDeleteMachine = (m: GymMachine) => {
    gymEquipmentService.deleteMachine(m.id);
    setMachineToDelete(null);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-cero-bg">
      {/* Top Header */}
      <PageHeader 
        title="Inventario & Equipamiento" 
        subtitle="Administra las máquinas de entrenamiento para rutinas y el stock de la tienda."
      >
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          {/* Navigation Tabs */}
          <div className="flex bg-[#10161c] rounded-xl p-1 border border-cero-border">
            <button
              onClick={() => setActiveTab('machines')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'machines'
                  ? 'bg-cero-lime text-black shadow-md'
                  : 'text-cero-text-muted hover:text-white'
              }`}
            >
              <Dumbbell size={15} />
              Máquinas & Equipamiento ({machines.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-cero-lime text-black shadow-md'
                  : 'text-cero-text-muted hover:text-white'
              }`}
            >
              <Package size={15} />
              Stock de Tienda & POS
            </button>
          </div>

          {/* Action Buttons for Machines Tab */}
          {activeTab === 'machines' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRoutineModalOpen(true)}
                className="border border-cero-lime/40 text-cero-lime bg-cero-lime/10 text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-cero-lime/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Sparkles size={14} />
                Diseñar Rutinas
              </button>
              <button
                onClick={() => {
                  setMachineToEdit(null);
                  setIsMachineModalOpen(true);
                }}
                className="bg-cero-lime text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-cero-lime-hover transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus size={16} />
                + Añadir Máquina
              </button>
            </div>
          )}
        </div>
      </PageHeader>
      
      <div className="p-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: MÁQUINAS Y EQUIPAMIENTO DEL GIMNASIO */}
        {/* ========================================================================= */}
        {activeTab === 'machines' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* KPI Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-cero-panel border border-cero-border rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-cero-text-muted font-mono uppercase tracking-wider">Total Equipamiento</span>
                  <div className="p-2.5 bg-[#1e293b] rounded-xl text-cero-lime">
                    <Dumbbell size={20} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white">{machines.length}</div>
                <p className="text-xs text-cero-text-muted mt-1 font-mono">En inventario activo</p>
              </div>

              <div className="bg-cero-panel border border-cero-border rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-cero-text-muted font-mono uppercase tracking-wider">Disponibles / Operativas</span>
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">{availableCount}</div>
                <p className="text-xs text-emerald-300/80 mt-1 font-mono">Listas para rutinas</p>
              </div>

              <div className="bg-cero-panel border border-cero-border rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-cero-text-muted font-mono uppercase tracking-wider">En Mantenimiento</span>
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                    <Wrench size={20} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-amber-400">{maintenanceCount}</div>
                <p className="text-xs text-amber-300/80 mt-1 font-mono">Requieren servicio</p>
              </div>

              <div className="bg-cero-panel border border-cero-border rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-cero-text-muted font-mono uppercase tracking-wider">Constructor de Rutinas</span>
                  <div className="p-2.5 bg-cero-lime/10 rounded-xl text-cero-lime border border-cero-lime/20">
                    <Sparkles size={20} />
                  </div>
                </div>
                <button
                  onClick={() => setIsRoutineModalOpen(true)}
                  className="mt-1 text-sm font-bold text-cero-lime hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  Asignar a Miembros <ArrowRight size={14} />
                </button>
                <p className="text-xs text-cero-text-muted mt-1 font-mono">Vinculación directa a socios</p>
              </div>

            </div>

            {/* Filter and Search Bar */}
            <div className="bg-cero-panel border border-cero-border rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-cero-text-muted" size={15} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, código (LEG-01), zona o músculo..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-cero-bg border border-cero-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cero-lime"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="bg-cero-bg border border-cero-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cero-lime font-medium"
                >
                  <option value="Todas">Todas las Categorías</option>
                  <option value="Pierna">Pierna & Glúteo</option>
                  <option value="Pecho">Pecho (Pectoral)</option>
                  <option value="Espalda">Espalda & Dorsales</option>
                  <option value="Hombro / Brazo">Hombro / Brazo</option>
                  <option value="Cardio">Cardio & HIIT</option>
                  <option value="Funcional / Core">Funcional / Core</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-cero-bg border border-cero-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cero-lime font-medium"
                >
                  <option value="Todos">Todos los Estados</option>
                  <option value="Disponible">Disponible</option>
                  <option value="En Mantenimiento">En Mantenimiento</option>
                  <option value="Fuera de Servicio">Fuera de Servicio</option>
                </select>
              </div>

              <div className="text-xs text-cero-text-muted font-mono">
                Mostrando <span className="text-white font-bold">{filteredMachines.length}</span> de {machines.length} máquinas
              </div>
            </div>

            {/* Machines Grid */}
            {filteredMachines.length === 0 ? (
              <div className="bg-cero-panel border border-cero-border rounded-2xl p-12 text-center text-cero-text-muted space-y-3">
                <Dumbbell size={40} className="mx-auto text-cero-lime opacity-40" />
                <p className="text-base font-bold text-white">No se encontraron máquinas</p>
                <p className="text-xs max-w-md mx-auto">
                  No hay equipos que coincidan con la búsqueda o filtro seleccionado. Haz clic en "+ Añadir Máquina" para registrar un nuevo equipo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMachines.map(machine => (
                  <div
                    key={machine.id}
                    className="bg-cero-panel border border-cero-border rounded-2xl overflow-hidden shadow-lg hover:border-cero-lime/60 transition-all flex flex-col group"
                  >
                    {/* Machine Photo Header */}
                    <div className="h-44 bg-[#0a121a] relative overflow-hidden">
                      <img
                        src={machine.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=350'}
                        alt={machine.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cero-panel via-transparent to-black/30"></div>

                      {/* Code Badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-[11px] font-mono font-black text-cero-lime tracking-wider">
                        {machine.code}
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          machine.status === 'Disponible'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md'
                            : machine.status === 'En Mantenimiento'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md'
                        }`}>
                          {machine.status}
                        </span>
                      </div>

                      {/* Category Tag */}
                      <div className="absolute bottom-2 left-3 text-xs font-bold text-white drop-shadow">
                        {machine.category}
                      </div>
                    </div>

                    {/* Machine Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-cero-lime transition-colors line-clamp-1">
                          {machine.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-cero-text-muted mt-1 font-medium">
                          <MapPin size={13} className="text-cero-lime shrink-0" />
                          <span className="truncate">{machine.zone}</span>
                        </div>

                        {/* Muscle Tags */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {machine.target_muscles.map((muscle, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#10161c] text-gray-300 border border-cero-border"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>

                        {machine.notes && (
                          <p className="text-[11px] text-gray-400 mt-2.5 line-clamp-2 italic bg-[#10161c] p-2 rounded-lg border border-cero-border/50">
                            "{machine.notes}"
                          </p>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-cero-border flex items-center justify-between">
                        <button
                          onClick={() => {
                            setMachineToEdit(machine);
                            setIsMachineModalOpen(true);
                          }}
                          className="text-xs font-semibold text-cero-text-muted hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} /> Editar
                        </button>

                        <button
                          onClick={() => setMachineToDelete(machine)}
                          className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STOCK DE TIENDA Y POS */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#121f2d] border border-cero-border rounded-xl p-6 relative overflow-hidden">
                <Package className="absolute right-[-20px] bottom-[-20px] text-white/5" size={120} />
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Suplementos</h3>
                    <span className="bg-[#1e293b] text-cero-text-muted text-xs px-2 py-1 rounded font-mono">42 Items</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold text-cero-lime">1,204</span>
                    <span className="text-sm text-cero-text-muted">Unidades</span>
                  </div>
                  <p className="text-sm text-rose-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400"></span> 3 items con stock bajo</p>
                </div>
              </div>
              
              <div className="bg-[#0f1f2a] border border-cero-border rounded-xl p-6 relative overflow-hidden">
                <Droplets className="absolute right-[-20px] bottom-[-20px] text-white/5" size={120} />
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Bebidas</h3>
                    <span className="bg-[#1e293b] text-cero-text-muted text-xs px-2 py-1 rounded font-mono">18 Items</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold text-cero-lime">850</span>
                    <span className="text-sm text-cero-text-muted">Unidades</span>
                  </div>
                  <p className="text-sm text-cero-lime flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cero-lime"></span> Stock óptimo</p>
                </div>
              </div>

              <div className="bg-[#172033] border border-cero-border rounded-xl p-6 relative overflow-hidden">
                <Shirt className="absolute right-[-20px] bottom-[-20px] text-white/5" size={120} />
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Ropa & Accesorios</h3>
                    <span className="bg-[#1e293b] text-cero-text-muted text-xs px-2 py-1 rounded font-mono">24 Items</span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold text-cero-lime">312</span>
                    <span className="text-sm text-cero-text-muted">Unidades</span>
                  </div>
                  <p className="text-sm text-rose-400 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400"></span> 1 item agotado</p>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-cero-panel border border-cero-border rounded-xl flex flex-col shadow-xl">
              <div className="p-6 border-b border-cero-border flex justify-between items-center bg-[#10161c] rounded-t-xl">
                <h2 className="text-lg font-bold text-white">Stock Actual en Tienda</h2>
                <div className="flex items-center gap-4">
                  <button className="text-cero-text-muted hover:text-white transition-colors">
                    <Filter size={18} />
                  </button>
                  <div className="flex bg-[#1e293b] rounded-lg p-1 border border-cero-border">
                    <button className="px-4 py-1 text-xs bg-[#2d3748] text-white rounded shadow-sm">Todos</button>
                    <button className="px-4 py-1 text-xs text-cero-text-muted hover:text-white transition-colors">Stock Bajo</button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-cero-text-muted uppercase tracking-wider font-mono bg-cero-bg/50 border-b border-cero-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">Producto</th>
                      <th className="px-6 py-4 font-medium text-center">Categoría</th>
                      <th className="px-6 py-4 font-medium text-center">Stock Actual</th>
                      <th className="px-6 py-4 font-medium text-center">Punto de Reorden</th>
                      <th className="px-6 py-4 font-medium text-center">Proveedor</th>
                      <th className="px-6 py-4 font-medium text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cero-border">
                    {storeInventory.map((item, i) => (
                      <tr key={i} className="hover:bg-cero-bg/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center text-xl shrink-0">
                              {item.category === 'Suplementos' ? '💊' : item.category === 'Bebidas' ? '💧' : item.category === 'Ropa' ? '👕' : '⚙️'}
                            </div>
                            <div>
                              <div className="text-white font-medium">{item.name}</div>
                              <div className="text-xs text-cero-text-muted font-mono">{item.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-center">{item.category}</td>
                        <td className={`px-6 py-4 text-center font-bold ${item.stock <= item.reorder && item.stock > 0 ? 'text-rose-400' : item.stock === 0 ? 'text-rose-500' : 'text-cero-lime'}`}>
                          {item.stock}
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-center font-mono">{item.reorder}</td>
                        <td className="px-6 py-4 text-gray-300 text-center">{item.supplier}</td>
                        <td className="px-6 py-4 text-center">
                          {item.status === 'LOW STOCK' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>
                              Bajo Stock
                            </span>
                          )}
                          {item.status === 'OPTIMAL' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-cero-lime/10 text-cero-lime border border-cero-lime/20 uppercase tracking-wide">
                              <span className="w-1.5 h-1.5 rounded-full bg-cero-lime mr-1.5"></span>
                              Óptimo
                            </span>
                          )}
                          {item.status === 'OUT OF STOCK' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-transparent text-gray-400 border border-gray-600 uppercase tracking-wide">
                              <AlertTriangle size={10} className="mr-1" />
                              Agotado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Machine Modal (Add / Edit) */}
      <MachineModal
        isOpen={isMachineModalOpen}
        onClose={() => {
          setIsMachineModalOpen(false);
          setMachineToEdit(null);
        }}
        machineToEdit={machineToEdit}
        onSaved={loadMachines}
      />

      {/* Routine Builder Modal */}
      <RoutineBuilderModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        onSaved={() => {}}
      />

      {/* Delete Machine Confirmation Modal */}
      {machineToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-cero-panel border border-cero-border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">¿Eliminar esta máquina?</h3>
            <p className="text-xs text-cero-text-muted">
              Estás a punto de eliminar <span className="text-white font-bold">"{machineToDelete.name}"</span> ({machineToDelete.code}). Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setMachineToDelete(null)}
                className="px-4 py-2 rounded-xl border border-cero-border text-xs font-semibold text-gray-300 hover:bg-[#1e293b] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteMachine(machineToDelete)}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors cursor-pointer"
              >
                Sí, Eliminar Máquina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
