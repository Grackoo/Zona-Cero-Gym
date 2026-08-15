import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MonitorSmartphone, 
  Package, 
  BarChart3, 
  UserSquare2, 
  Settings,
  HelpCircle,
  LogOut,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Inicio', path: '/dashboard' },
  { icon: Users, label: 'Miembros', path: '/members' },
  { icon: MonitorSmartphone, label: 'Punto de Venta', path: '/pos' },
  { icon: Package, label: 'Inventario', path: '/inventory' },
  { icon: BarChart3, label: 'Reportes', path: '/reports' },
  { icon: UserSquare2, label: 'Personal', path: '/staff' },
  { icon: Settings, label: 'Configuración', path: '/settings' },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-cero-bg overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-cero-border bg-[#10161c] flex flex-col transition-all">
        {/* Logo Area */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.jpg" alt="ZONA CERO Logo" className="h-8 w-auto object-contain rounded-sm" />
            <div className="hidden text-xl font-bold text-cero-lime tracking-tight">ZONA CERO</div>
            <div>
              <h1 className="text-cero-lime font-bold text-lg leading-tight tracking-wide">ZONA CERO</h1>
              <p className="text-xs text-cero-text-muted">Panel de Control</p>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-cero-lime text-black font-semibold py-3 px-4 rounded-lg hover:bg-cero-lime-hover transition-colors">
            <Plus size={20} />
            Nuevo Ingreso
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-[#1f2937] text-white shadow-sm" 
                    : "text-cero-text-muted hover:text-white hover:bg-[#1a232f]"
                )
              }
            >
              <item.icon size={18} className="opacity-80" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-cero-border/50 space-y-2">
          <button className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-cero-text-muted hover:text-white transition-colors">
            <HelpCircle size={18} />
            Ayuda
          </button>
          <button className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-cero-text-muted hover:text-rose-400 transition-colors">
            <LogOut size={18} />
            Cerrar Sesión
          </button>
          
          <div className="mt-4 flex items-center gap-3 px-4 pt-4 border-t border-cero-border/50">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center overflow-hidden shrink-0">
               <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white text-left">Admin</span>
              <span className="text-[10px] text-cero-lime uppercase tracking-wider text-left">Administrador</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-cero-bg">
        <Outlet />
      </main>
    </div>
  );
}
