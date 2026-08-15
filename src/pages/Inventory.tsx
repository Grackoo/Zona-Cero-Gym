import { PageHeader } from '../components/PageHeader';
import { History, Package, Droplets, Shirt, Filter, AlertTriangle } from 'lucide-react';

export default function Inventory() {
  const inventory = [
    { name: 'Whey Protein Isolate - Vainilla', sku: 'SKU: SUP-WPI-V2', category: 'Suplementos', stock: 12, reorder: 25, supplier: 'Optimum Nutrition', status: 'LOW STOCK' },
    { name: 'Pre-Workout Energy - Moras', sku: 'SKU: BEV-PWE-B1', category: 'Bebidas', stock: 48, reorder: 20, supplier: 'C4 Energy', status: 'OPTIMAL' },
    { name: 'Camiseta ZONA CERO - Negra (L)', sku: 'SKU: APP-TS-BL-L', category: 'Ropa', stock: 0, reorder: 10, supplier: 'In-House Print', status: 'OUT OF STOCK' },
    { name: 'Straps Levantamiento', sku: 'SKU: ACC-LS-HD', category: 'Accesorios', stock: 35, reorder: 15, supplier: 'Rogue Fitness', status: 'OPTIMAL' },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <PageHeader title="Gestión de Inventario" subtitle="Monitorea niveles de stock y administra reabastecimientos.">
        <div className="flex gap-3 ml-auto">
          <button className="border border-cero-border text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors flex items-center gap-2">
            <History size={16} /> Historial
          </button>
          <button className="bg-cero-lime text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-cero-lime-hover transition-colors flex items-center gap-2">
            + Actualizar Stock
          </button>
        </div>
      </PageHeader>
      
      <div className="p-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                 <h3 className="text-xl font-bold text-white">Ropa</h3>
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

        {/* Table Area */}
        <div className="bg-cero-panel border border-cero-border rounded-xl flex flex-col">
          {/* Table Header Controls */}
          <div className="p-6 border-b border-cero-border flex justify-between items-center bg-[#10161c] rounded-t-xl">
             <h2 className="text-lg font-bold text-white">Stock Actual</h2>
             <div className="flex items-center gap-4">
                <button className="text-cero-text-muted hover:text-white transition-colors">
                  <Filter size={18} />
                </button>
                <div className="flex bg-[#1e293b] rounded-lg p-1 border border-cero-border">
                  <button className="px-4 py-1 text-sm bg-[#2d3748] text-white rounded shadow-sm">Todos</button>
                  <button className="px-4 py-1 text-sm text-cero-text-muted hover:text-white transition-colors">Stock Bajo</button>
                </div>
             </div>
          </div>

          {/* Table */}
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
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cero-border">
                {inventory.map((item, i) => (
                  <tr key={i} className="hover:bg-cero-bg/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-[#1e293b] flex items-center justify-center text-xl shrink-0">
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
                    <td className="px-6 py-4 text-gray-300 text-center">{item.reorder}</td>
                    <td className="px-6 py-4 text-gray-300 text-center">{item.supplier}</td>
                    <td className="px-6 py-4 text-center">
                      {item.status === 'LOW STOCK' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>
                          Bajo Stock
                        </span>
                      )}
                      {item.status === 'OPTIMAL' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-cero-lime/10 text-cero-lime border border-cero-lime/20 uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 rounded-full bg-cero-lime mr-1.5"></span>
                          Óptimo
                        </span>
                      )}
                      {item.status === 'OUT OF STOCK' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-transparent text-gray-400 border border-gray-600 uppercase tracking-wide">
                          <AlertTriangle size={10} className="mr-1" />
                          Agotado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Actions placeholder */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-cero-border flex justify-between items-center text-sm text-cero-text-muted bg-[#10161c] rounded-b-xl">
            <div>Mostrando 1 a 4 de 84 resultados</div>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded bg-cero-bg border border-cero-border hover:bg-cero-panel">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#2d3748] text-white">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-cero-panel text-white">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-cero-panel text-white">3</button>
              <span className="w-8 h-8 flex items-center justify-center">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-cero-bg border border-cero-border hover:bg-cero-panel">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
