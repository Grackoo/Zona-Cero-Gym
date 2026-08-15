import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Wifi } from 'lucide-react';
import { cn } from '../lib/utils';

export default function POS() {
  const categories = ['TODOS', 'SUPLEMENTOS', 'HIDRATACIÓN', 'ROPA', 'ACCESORIOS'];
  
  const products = [
    { id: 1, name: 'Cero+ Whey Isolate - Vainilla', category: 'SUPLEMENTOS', price: 45.00, stock: 12, img: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 2, name: 'Agua Alcalina 1L', category: 'HIDRATACIÓN', price: 3.50, stock: 48, img: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 3, name: 'Straps Pro', category: 'ACCESORIOS', price: 18.00, stock: 35, img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 4, name: 'Cero Energy Cero Azúcar', category: 'HIDRATACIÓN', price: 4.00, stock: 24, img: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&q=80&w=200&h=200' },
  ];

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Area - Products */}
      <div className="flex-1 flex flex-col border-r border-cero-border bg-cero-bg">
        {/* Top Bar */}
        <div className="p-4 border-b border-cero-border flex gap-4 overflow-x-auto items-center">
          <div className="relative shrink-0 w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cero-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className="w-full bg-cero-panel border border-cero-border text-white text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-cero-lime"
            />
          </div>
          
          <div className="flex gap-2 shrink-0">
            {categories.map(cat => (
              <button 
                key={cat}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-colors border",
                  cat === 'TODOS' 
                    ? "bg-cero-lime text-black border-cero-lime" 
                    : "bg-transparent text-gray-300 border-cero-border hover:border-cero-lime"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-cero-panel border border-cero-border rounded-xl overflow-hidden group cursor-pointer hover:border-cero-lime transition-all">
                <div className="relative h-48 bg-[#1e293b]">
                  <img src={product.img} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity mix-blend-screen" />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] font-mono px-2 py-1 rounded">
                    {product.stock} EN STOCK
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-cero-text-muted mb-1 font-mono">{product.category}</p>
                  <h3 className="text-sm text-white font-medium mb-3 line-clamp-2 h-10">{product.name}</h3>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-lg font-bold text-cero-lime">${product.price.toFixed(2)}</span>
                    <button className="w-8 h-8 rounded-full bg-[#2d3748] flex items-center justify-center text-white hover:bg-cero-lime hover:text-black transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Area - Cart */}
      <div className="w-96 flex flex-col bg-[#10161c] shrink-0">
        <div className="p-6 border-b border-cero-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Venta Actual</h2>
          <button className="text-xs flex items-center gap-1 text-cero-text-muted hover:text-rose-400 transition-colors">
            <Trash2 size={14} /> VACIAR
          </button>
        </div>
        
        <div className="p-4 border-b border-cero-border">
           <select className="w-full bg-cero-panel border border-cero-border rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-cero-lime appearance-none">
             <option>👤 Asignar a Miembro (Opcional)</option>
           </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
           {/* Item 1 */}
           <div className="bg-cero-panel border border-cero-border rounded-lg p-3 flex gap-3">
             <img src={products[0].img} className="w-12 h-12 rounded object-cover mix-blend-screen bg-gray-800" />
             <div className="flex-1">
               <h4 className="text-sm text-white font-medium line-clamp-1">{products[0].name}</h4>
               <p className="text-xs text-cero-text-muted">${products[0].price.toFixed(2)}</p>
             </div>
             <div className="flex flex-col items-end justify-between">
               <span className="text-sm font-bold text-white">${products[0].price.toFixed(2)}</span>
               <div className="flex items-center gap-2 bg-cero-bg rounded-full px-2 py-1 border border-cero-border mt-2">
                 <button className="text-cero-text-muted hover:text-white"><Minus size={12} /></button>
                 <span className="text-xs text-white w-4 text-center">1</span>
                 <button className="text-cero-text-muted hover:text-white"><Plus size={12} /></button>
               </div>
             </div>
           </div>

           {/* Item 2 */}
           <div className="bg-cero-panel border border-cero-border rounded-lg p-3 flex gap-3">
             <img src={products[3].img} className="w-12 h-12 rounded object-cover mix-blend-screen bg-gray-800" />
             <div className="flex-1">
               <h4 className="text-sm text-white font-medium line-clamp-1">{products[3].name}</h4>
               <p className="text-xs text-cero-text-muted">${products[3].price.toFixed(2)}</p>
             </div>
             <div className="flex flex-col items-end justify-between">
               <span className="text-sm font-bold text-white">${(products[3].price * 2).toFixed(2)}</span>
               <div className="flex items-center gap-2 bg-cero-bg rounded-full px-2 py-1 border border-cero-border mt-2">
                 <button className="text-cero-text-muted hover:text-white"><Minus size={12} /></button>
                 <span className="text-xs text-white w-4 text-center">2</span>
                 <button className="text-cero-text-muted hover:text-white"><Plus size={12} /></button>
               </div>
             </div>
           </div>
        </div>

        {/* Totals & Payment */}
        <div className="p-6 border-t border-cero-border bg-cero-bg">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-cero-text-muted">Subtotal</span>
              <span className="text-white">$53.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cero-text-muted">Impuesto (8.5%)</span>
              <span className="text-white">$4.51</span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-cero-border border-dashed">
              <span className="text-lg text-white font-medium">Total</span>
              <span className="text-3xl font-bold text-cero-lime">$57.51</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <button className="bg-cero-panel border border-cero-border hover:border-cero-lime rounded-lg py-3 flex flex-col items-center justify-center gap-1 transition-colors">
              <CreditCard size={20} className="text-white" />
              <span className="text-xs font-medium text-cero-text-muted">TARJETA</span>
            </button>
            <button className="bg-cero-panel border border-cero-border hover:border-cero-lime rounded-lg py-3 flex flex-col items-center justify-center gap-1 transition-colors">
              <Banknote size={20} className="text-white" />
              <span className="text-xs font-medium text-cero-text-muted">EFECTIVO</span>
            </button>
            <button className="bg-[#2d3748] border border-cero-lime text-cero-lime rounded-lg py-3 flex flex-col items-center justify-center gap-1">
              <Wifi size={20} />
              <span className="text-xs font-bold">TAP NFC</span>
            </button>
          </div>

          <button className="w-full bg-cero-lime hover:bg-cero-lime-hover text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(212,255,0,0.3)]">
            <ShoppingCart size={20} />
            FINALIZAR VENTA
          </button>
        </div>
      </div>
    </div>
  );
}
