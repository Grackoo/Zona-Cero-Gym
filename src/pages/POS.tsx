import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Wifi, 
  Wallet, 
  CheckCircle2, 
  User, 
  AlertCircle,
  Sparkles,
  Receipt
} from 'lucide-react';
import { cn } from '../lib/utils';
import { biometricsStore, BiometricMember } from '../lib/biometricsStore';
import { walletService } from '../lib/walletService';

interface CartItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  img: string;
}

export default function POS() {
  const categories = ['TODOS', 'SUPLEMENTOS', 'HIDRATACIÓN', 'ROPA', 'ACCESORIOS'];
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  const products = [
    { id: 1, name: 'Cero+ Whey Isolate - Vainilla', category: 'SUPLEMENTOS', price: 45.00, stock: 12, img: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 2, name: 'Agua Alcalina 1L', category: 'HIDRATACIÓN', price: 3.50, stock: 48, img: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 3, name: 'Straps Pro Levantamiento', category: 'ACCESORIOS', price: 18.00, stock: 35, img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 4, name: 'Cero Energy Bebida Cero Azúcar', category: 'HIDRATACIÓN', price: 4.00, stock: 24, img: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 5, name: 'Creatina Monohidratada Creapure 300g', category: 'SUPLEMENTOS', price: 35.00, stock: 18, img: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 6, name: 'Shaker Pro Zona Cero 700ml', category: 'ACCESORIOS', price: 12.00, stock: 50, img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 7, name: 'Playera Dry-Fit Zona Cero', category: 'ROPA', price: 25.00, stock: 30, img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=200&h=200' },
  ];

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([
    { id: 1, name: 'Cero+ Whey Isolate - Vainilla', category: 'SUPLEMENTOS', price: 45.00, quantity: 1, img: 'https://images.unsplash.com/photo-1579722820308-d74e571900a9?auto=format&fit=crop&q=80&w=200&h=200' },
    { id: 4, name: 'Cero Energy Bebida Cero Azúcar', category: 'HIDRATACIÓN', price: 4.00, quantity: 2, img: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&q=80&w=200&h=200' },
  ]);

  // Members & Wallet
  const [members, setMembers] = useState<BiometricMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('ZC-1001');
  const [memberWalletBalance, setMemberWalletBalance] = useState<number>(0);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH' | 'NFC' | 'WALLET'>('WALLET');
  const [walletAmountToUse, setWalletAmountToUse] = useState<number>(0);
  const [useFullWallet, setUseFullWallet] = useState<boolean>(true);

  // Success Notification Modal
  const [saleCompleted, setSaleCompleted] = useState<{
    total: number;
    walletUsed: number;
    remainingPaid: number;
    memberName: string;
    newWalletBalance: number;
  } | null>(null);

  useEffect(() => {
    setMembers(biometricsStore.getMembers());
    loadMemberWallet(selectedMemberId);

    const handleWalletUpdated = () => {
      loadMemberWallet(selectedMemberId);
    };
    window.addEventListener('zona_cero_wallet_updated', handleWalletUpdated);
    return () => window.removeEventListener('zona_cero_wallet_updated', handleWalletUpdated);
  }, [selectedMemberId]);

  const loadMemberWallet = async (mId: string) => {
    if (!mId) {
      setMemberWalletBalance(0);
      return;
    }
    const bal = await walletService.getBalance(mId);
    setMemberWalletBalance(bal);
  };

  const addToCart = (product: typeof products[0]) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Number((subtotal * 0.085).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  // Wallet calculation
  const maxApplicableWallet = Math.min(memberWalletBalance, total);
  const effectiveWalletUsed = paymentMethod === 'WALLET' 
    ? (useFullWallet ? maxApplicableWallet : Math.min(walletAmountToUse, maxApplicableWallet))
    : 0;
  const remainingTotal = Number((total - effectiveWalletUsed).toFixed(2));

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'TODOS' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const selectedMember = members.find(m => m.id === selectedMemberId);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    let newBalance = memberWalletBalance;

    if (paymentMethod === 'WALLET' && selectedMember && effectiveWalletUsed > 0) {
      const res = await walletService.redeemWallet(
        selectedMember.id,
        effectiveWalletUsed,
        `Canje en POS (${cart.map(c => `${c.quantity}x ${c.name}`).join(', ').substring(0, 50)})`
      );

      if (!res.success) {
        alert(res.error || 'Error al procesar canje de monedero.');
        return;
      }
      newBalance = res.newBalance;
    }

    setSaleCompleted({
      total,
      walletUsed: effectiveWalletUsed,
      remainingPaid: remainingTotal,
      memberName: selectedMember ? selectedMember.fullName : 'Cliente General',
      newWalletBalance: newBalance
    });

    clearCart();
    loadMemberWallet(selectedMemberId);
  };

  return (
    <div className="h-full flex overflow-hidden font-sans">
      {/* Left Area - Products */}
      <div className="flex-1 flex flex-col border-r border-cero-border bg-cero-bg">
        {/* Top Bar */}
        <div className="p-4 border-b border-cero-border flex gap-4 overflow-x-auto items-center">
          <div className="relative shrink-0 w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cero-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cero-panel border border-cero-border text-white text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-cero-lime"
            />
          </div>
          
          <div className="flex gap-2 shrink-0">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-colors border cursor-pointer",
                  selectedCategory === cat 
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
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className="bg-cero-panel border border-cero-border rounded-xl overflow-hidden group cursor-pointer hover:border-cero-lime transition-all flex flex-col justify-between"
              >
                <div className="relative h-44 bg-[#1e293b]">
                  <img src={product.img} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity mix-blend-screen" />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] font-mono px-2 py-1 rounded">
                    {product.stock} EN STOCK
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-cero-text-muted mb-1 font-mono">{product.category}</p>
                    <h3 className="text-sm text-white font-medium mb-3 line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-cero-border/40">
                    <span className="text-lg font-bold text-cero-lime">${product.price.toFixed(2)}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="w-8 h-8 rounded-full bg-[#2d3748] flex items-center justify-center text-white hover:bg-cero-lime hover:text-black transition-colors cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Area - Cart & Checkout */}
      <div className="w-96 flex flex-col bg-[#10161c] shrink-0 border-l border-cero-border">
        <div className="p-5 border-b border-cero-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingCart size={18} className="text-cero-lime" />
            Venta Actual ({cart.reduce((a, b) => a + b.quantity, 0)})
          </h2>
          <button 
            onClick={clearCart}
            disabled={cart.length === 0}
            className="text-xs flex items-center gap-1 text-cero-text-muted hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <Trash2 size={13} /> VACIAR
          </button>
        </div>
        
        {/* Member Selector & Wallet Balance Display */}
        <div className="p-4 border-b border-cero-border space-y-2 bg-[#0a2233]">
          <label className="text-[11px] font-mono uppercase tracking-wider text-cero-text-muted block">
            Cliente / Miembro Asignado:
          </label>
          <select 
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full bg-[#02111c] border border-cero-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cero-lime cursor-pointer font-medium"
          >
            <option value="">👤 Venta Rápida (Cliente General)</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.id})
              </option>
            ))}
          </select>

          {/* Member Wallet Pill Banner */}
          {selectedMember && (
            <div className="mt-2 bg-[#02111c] border border-cero-lime/30 rounded-xl p-3 flex items-center justify-between shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <img src={selectedMember.avatarUrl} alt={selectedMember.fullName} className="w-8 h-8 rounded-full object-cover border border-cero-lime/40" />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{selectedMember.fullName}</p>
                  <p className="text-[10px] text-cero-text-muted">{selectedMember.planType}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-cero-text-muted block font-mono">SALDO MONEDERO</span>
                <span className="text-sm font-bold font-mono text-cero-lime">
                  ${memberWalletBalance.toFixed(2)} MXN
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-cero-text-muted p-6">
              <ShoppingCart size={40} className="opacity-20 mb-2" />
              <p className="text-sm font-medium">El carrito está vacío</p>
              <p className="text-xs text-gray-500 mt-1">Selecciona productos del catálogo para comenzar la venta.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-cero-panel border border-cero-border rounded-xl p-3 flex gap-3">
                <img src={item.img} className="w-12 h-12 rounded-lg object-cover mix-blend-screen bg-gray-800 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">{item.name}</h4>
                  <p className="text-xs text-cero-text-muted">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between shrink-0">
                  <span className="text-xs font-bold text-white">${(item.price * item.quantity).toFixed(2)}</span>
                  <div className="flex items-center gap-2 bg-cero-bg rounded-full px-2 py-0.5 border border-cero-border mt-1">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="text-cero-text-muted hover:text-white cursor-pointer"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-xs text-white w-3 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="text-cero-text-muted hover:text-white cursor-pointer"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Payment Methods */}
        <div className="p-5 border-t border-cero-border bg-cero-bg">
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs text-cero-text-muted">
              <span>Subtotal</span>
              <span className="text-white font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-cero-text-muted">
              <span>IVA / Impuesto (8.5%)</span>
              <span className="text-white font-mono">${tax.toFixed(2)}</span>
            </div>
            
            {paymentMethod === 'WALLET' && effectiveWalletUsed > 0 && (
              <div className="flex justify-between text-xs text-emerald-400 font-semibold pt-1 border-t border-cero-border/40">
                <span>Descuento Monedero</span>
                <span className="font-mono">-${effectiveWalletUsed.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 mt-1 border-t border-cero-border border-dashed">
              <div>
                <span className="text-xs text-cero-text-muted block">Total a Pagar</span>
                {paymentMethod === 'WALLET' && remainingTotal > 0 && (
                  <span className="text-[10px] text-amber-400 font-mono">Restante con otro medio: ${remainingTotal.toFixed(2)}</span>
                )}
              </div>
              <span className="text-2xl font-black text-cero-lime font-mono">
                ${(paymentMethod === 'WALLET' ? remainingTotal : total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector Grid */}
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            <button 
              onClick={() => setPaymentMethod('WALLET')}
              disabled={!selectedMember || memberWalletBalance <= 0}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'WALLET'
                  ? 'bg-cero-lime text-black border-cero-lime font-bold shadow-md'
                  : 'bg-cero-panel border-cero-border text-cero-text-muted hover:border-cero-lime hover:text-white disabled:opacity-25 disabled:pointer-events-none'
              }`}
            >
              <Wallet size={16} />
              <span className="text-[9px] uppercase tracking-tighter">Monedero</span>
            </button>

            <button 
              onClick={() => setPaymentMethod('CARD')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'CARD'
                  ? 'bg-cero-lime text-black border-cero-lime font-bold shadow-md'
                  : 'bg-cero-panel border-cero-border text-cero-text-muted hover:border-cero-lime hover:text-white'
              }`}
            >
              <CreditCard size={16} />
              <span className="text-[9px] uppercase tracking-tighter">Tarjeta</span>
            </button>

            <button 
              onClick={() => setPaymentMethod('CASH')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'CASH'
                  ? 'bg-cero-lime text-black border-cero-lime font-bold shadow-md'
                  : 'bg-cero-panel border-cero-border text-cero-text-muted hover:border-cero-lime hover:text-white'
              }`}
            >
              <Banknote size={16} />
              <span className="text-[9px] uppercase tracking-tighter">Efectivo</span>
            </button>

            <button 
              onClick={() => setPaymentMethod('NFC')}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                paymentMethod === 'NFC'
                  ? 'bg-cero-lime text-black border-cero-lime font-bold shadow-md'
                  : 'bg-cero-panel border-cero-border text-cero-text-muted hover:border-cero-lime hover:text-white'
              }`}
            >
              <Wifi size={16} />
              <span className="text-[9px] uppercase tracking-tighter">Tap NFC</span>
            </button>
          </div>

          {/* Checkout Button */}
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-cero-lime hover:bg-cero-lime-hover text-black font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-sm"
          >
            <ShoppingCart size={18} />
            FINALIZAR VENTA
          </button>
        </div>
      </div>

      {/* Sale Receipt Confirmation Modal */}
      {saleCompleted && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a2233] border border-cero-border rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4 animate-scale-up">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">¡Venta Completada con Éxito!</h3>
              <p className="text-xs text-cero-text-muted mt-0.5">Comprobante de compra registrado en sistema.</p>
            </div>

            <div className="bg-[#02111c] border border-cero-border rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-cero-text-muted">Cliente:</span>
                <span className="text-white font-medium">{saleCompleted.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cero-text-muted">Total Venta:</span>
                <span className="text-white font-mono font-bold">${saleCompleted.total.toFixed(2)}</span>
              </div>
              {saleCompleted.walletUsed > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Pagado con Monedero:</span>
                  <span className="font-mono">-${saleCompleted.walletUsed.toFixed(2)}</span>
                </div>
              )}
              {saleCompleted.remainingPaid > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Restante Pagado:</span>
                  <span className="font-mono">${saleCompleted.remainingPaid.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-cero-border text-cero-lime font-mono">
                <span>Nuevo Saldo Monedero:</span>
                <span className="font-bold">${saleCompleted.newWalletBalance.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setSaleCompleted(null)}
              className="w-full bg-cero-lime hover:bg-cero-lime-hover text-black font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Nueva Venta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
