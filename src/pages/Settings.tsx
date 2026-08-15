import { PageHeader } from '../components/PageHeader';
import { Building2, CreditCard, Lock, MessageSquare, Save, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <PageHeader title="Configuración de la Plataforma" subtitle="Configura los parámetros operativos clave y las integraciones del gimnasio.">
        <button className="bg-cero-lime text-black font-semibold px-6 py-2 rounded-lg ml-auto hover:bg-cero-lime-hover transition-colors flex items-center gap-2 text-sm shadow-[0_0_15px_rgba(212,255,0,0.2)]">
          <Save size={16} /> Guardar Cambios
        </button>
      </PageHeader>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Inner Sidebar */}
        <div className="w-64 border-r border-cero-border bg-[#10161c] p-6 space-y-1 overflow-y-auto">
           <button 
             onClick={() => setActiveTab('profile')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${activeTab === 'profile' ? 'bg-[#1e293b] text-white' : 'text-cero-text-muted hover:bg-cero-bg hover:text-white'}`}
           >
             <Building2 size={18} /> Perfil del Gimnasio
           </button>
           <button 
             onClick={() => setActiveTab('payments')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${activeTab === 'payments' ? 'bg-[#1e293b] text-white' : 'text-cero-text-muted hover:bg-cero-bg hover:text-white'}`}
           >
             <CreditCard size={18} /> Pagos
           </button>
           <button 
             onClick={() => setActiveTab('devices')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${activeTab === 'devices' ? 'bg-[#1e293b] text-white' : 'text-cero-text-muted hover:bg-cero-bg hover:text-white'}`}
           >
             <Lock size={18} /> Accesos y Dispositivos
           </button>
           <button 
             onClick={() => setActiveTab('whatsapp')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${activeTab === 'whatsapp' ? 'bg-[#1e293b] text-white' : 'text-cero-text-muted hover:bg-cero-bg hover:text-white'}`}
           >
             <MessageSquare size={18} /> WhatsApp Bot
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto bg-cero-bg">
          <div className="max-w-3xl space-y-8">
            
            {/* Facility Details Section */}
            <div className="bg-cero-panel border border-cero-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-cero-border bg-[#10161c]">
                <h2 className="text-lg font-bold text-white">Detalles del Gimnasio</h2>
                <p className="text-sm text-cero-text-muted mt-1">Información general sobre la sede de tu gimnasio.</p>
              </div>
              
              <div className="p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm text-cero-text-muted mb-2 font-medium">Nombre del Gimnasio</label>
                     <input type="text" defaultValue="ZONA CERO" className="w-full bg-cero-bg border border-cero-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cero-lime" />
                   </div>
                   <div>
                     <label className="block text-sm text-cero-text-muted mb-2 font-medium">Correo de Contacto</label>
                     <input type="email" defaultValue="hello@zonacero.com" className="w-full bg-cero-bg border border-cero-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cero-lime" />
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm text-cero-text-muted mb-2 font-medium">Dirección Física</label>
                   <input type="text" defaultValue="Av. Principal 123, Centro, ST 12345" className="w-full bg-cero-bg border border-cero-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cero-lime" />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm text-cero-text-muted mb-2 font-medium">Número Telefónico</label>
                     <input type="text" defaultValue="+1 (555) 019-2838" className="w-full bg-cero-bg border border-cero-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cero-lime" />
                   </div>
                   <div>
                     <label className="block text-sm text-cero-text-muted mb-2 font-medium">Moneda</label>
                     <select className="w-full bg-cero-bg border border-cero-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cero-lime appearance-none">
                       <option>USD ($)</option>
                       <option>EUR (€)</option>
                       <option>MXN ($)</option>
                     </select>
                   </div>
                 </div>
              </div>
            </div>

            {/* Payment Integration Section */}
            <div className="bg-cero-panel border border-cero-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-cero-border bg-[#10161c] flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white">Pasarela de Pagos</h2>
                  <p className="text-sm text-cero-text-muted mt-1">Configura Stripe para procesamiento de tarjetas.</p>
                </div>
                <span className="px-3 py-1 bg-cero-lime/10 text-cero-lime border border-cero-lime/20 rounded-full text-xs font-bold uppercase tracking-wider">
                  Conectado
                </span>
              </div>
              
              <div className="p-6 space-y-6">
                 <div className="flex items-center justify-between p-4 bg-[#1e293b] rounded-lg border border-cero-border">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-2">
                       <svg viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg" className="w-full"><path fill="#635bff" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95l.58 2.58c-1.2.62-3.1 1.05-5.27 1.05-4.14 0-6.19-2.58-6.19-6.9 0-4.52 2.37-7.23 6.07-7.23 4.14 0 5.64 3.03 5.64 6.64 0 .8-.05 1.55-.02 2.26zm-7.9-2.45h4.63c-.1-1.42-1.04-2.4-2.27-2.4-1.25 0-2.18.9-2.36 2.4zM43.08 6.4c-1.32 0-2.6.45-3.4 1.15V.43l-3.64.83v17.92h3.58v-1.85c.87.8 2.05 1.18 3.32 1.18 3.03 0 5.2-2.3 5.2-6.1 0-3.68-2.14-5.98-5.06-5.98zm-.55 9.77c-1.5 0-2.52-1.05-2.52-3.65 0-2.73 1.02-3.8 2.5-3.8 1.48 0 2.54 1.1 2.54 3.8 0 2.65-1.04 3.65-2.52 3.65zM29.56 6.4c-1.32 0-2.6.45-3.4 1.15V6.7h-3.56v13.2h3.64v-7.85c0-2.28 1.07-3.4 2.6-3.4.38 0 .85.05 1.17.13l.63-3.32c-.37-.08-.76-.1-1.12-.1zM20.67 6.65l-3.65.8V19.8h3.65V6.65zM20.6 1.83c0-1.24-1-2.22-2.26-2.22-1.25 0-2.24.98-2.24 2.2 0 1.25 1 2.24 2.24 2.24 1.26 0 2.26-.98 2.26-2.22zM10.95 6.7h-2.9v13.2h3.66v-7c0-2.33 1.12-3.4 2.76-3.4 1.62 0 2.24 1.03 2.24 2.87v7.54h3.64V11.2c0-3.35-1.57-4.82-3.9-4.82-1.35 0-2.53.5-3.5 1.3V6.7zM3.48 11.23c0-1.24.96-1.8 2.54-1.8 1.12 0 2.4.37 3.5.95l.58-2.62C8.97 7.14 7.2 6.7 5.26 6.7c-3.5 0-6.17 1.8-6.17 4.96 0 5 6.13 4.14 6.13 6.2 0 1.34-1.16 1.8-2.75 1.8-1.54 0-2.8-.45-4.08-1.18L-2.2 21.2c1.4.82 3.4 1.3 5.46 1.3 3.64 0 6.4-1.67 6.4-5.1 0-5.18-6.18-4.32-6.18-6.17z"/></svg>
                     </div>
                     <div>
                       <h3 className="text-white font-medium">Stripe Connect</h3>
                       <p className="text-xs text-cero-text-muted">Cuenta terminada en **** 4920</p>
                     </div>
                   </div>
                   <button className="text-sm font-medium text-white hover:text-cero-lime transition-colors flex items-center gap-2">
                     <RefreshCw size={16} /> Sincronizar Estado
                   </button>
                 </div>

                 <div>
                   <label className="block text-sm text-cero-text-muted mb-2 font-medium">Clave Pública de Stripe</label>
                   <input type="text" defaultValue="pk_live_51M..." className="w-full bg-cero-bg border border-cero-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cero-lime font-mono text-sm opacity-50 cursor-not-allowed" disabled />
                 </div>
                 
                 <p className="text-xs text-cero-text-muted mt-2">Las claves API son gestionadas de forma segura por el administrador. Para actualizar, contacte a soporte.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
