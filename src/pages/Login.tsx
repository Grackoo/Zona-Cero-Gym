import React, { FormEvent } from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-black font-sans">
      {/* Background Image Setup using Image 1.png */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
        style={{ backgroundImage: "url('/Image%201.png')" }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>

      <div className="z-20 w-full max-w-md p-8 bg-[#0f172a]/80 backdrop-blur-xl rounded-2xl border border-cero-border shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.jpg" alt="ZONA CERO Logo" className="h-16 w-auto mb-4 rounded-md" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Panel de Control</h1>
          <p className="text-cero-text-muted text-sm mt-2">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              defaultValue="admin@zonacero.com"
              className="w-full bg-[#1e293b]/50 border border-cero-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cero-lime transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
            <input 
              type="password" 
              defaultValue="password"
              className="w-full bg-[#1e293b]/50 border border-cero-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cero-lime transition-colors"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-cero-lime hover:bg-cero-lime-hover text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all mt-4"
          >
            <LogIn size={20} />
            Ingresar al Panel
          </button>
        </form>
      </div>
    </div>
  );
}
