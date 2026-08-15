import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { FinancialStatements } from '../components/FinancialStatements';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  FileText,
  BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'financial_statements' | 'overview'>('financial_statements');

  const chartData = [
    { name: 'Lun', revenue: 4000, expenses: 2400 },
    { name: 'Mar', revenue: 3000, expenses: 1398 },
    { name: 'Mié', revenue: 2000, expenses: 9800 },
    { name: 'Jue', revenue: 2780, expenses: 3908 },
    { name: 'Vie', revenue: 1890, expenses: 4800 },
    { name: 'Sáb', revenue: 2390, expenses: 3800 },
    { name: 'Dom', revenue: 3490, expenses: 4300 },
  ];

  const recentTransactions = [
    { id: 'TRX-8923', date: 'Hoy, 14:32', client: 'Elia Hernandez', type: 'Membresía Anual', amount: 450.00, status: 'Completado' },
    { id: 'TRX-8922', date: 'Hoy, 12:15', client: 'Maria Lopez', type: 'Suplementos (Whey)', amount: 45.00, status: 'Completado' },
    { id: 'TRX-8921', date: 'Hoy, 09:05', client: 'Elena Rodriguez', type: 'Entrenamiento Personal', amount: 120.00, status: 'Pendiente' },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[#02111c]">
      {/* Top Header */}
      <PageHeader
        title="Reportes y Finanzas"
        subtitle="Determinación de utilidad, estados financieros y métricas operativas."
      >
        <div className="flex items-center gap-3 ml-auto print:hidden">
          {/* Navigation Tabs */}
          <div className="flex bg-[#10161c] rounded-xl p-1 border border-cero-border">
            <button
              onClick={() => setActiveTab('financial_statements')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'financial_statements'
                  ? 'bg-cero-lime text-black shadow-md'
                  : 'text-cero-text-muted hover:text-white'
                }`}
            >
              <FileText size={16} />
              Estados Financieros
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'overview'
                  ? 'bg-cero-lime text-black shadow-md'
                  : 'text-cero-text-muted hover:text-white'
                }`}
            >
              <BarChart2 size={16} />
              Resumen Operativo
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="p-8">
        {/* Tab 1: Formal Financial Statements (Matches Reference Image) */}
        {activeTab === 'financial_statements' && (
          <FinancialStatements />
        )}

        {/* Tab 2: Operational Overview & Analytics */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Filter Bar */}
            <div className="flex justify-between items-center bg-cero-panel border border-cero-border rounded-xl p-4">
              <div className="flex bg-[#1e293b] rounded-lg p-1 border border-cero-border">
                <button className="px-4 py-1.5 text-sm text-cero-text-muted hover:text-white transition-colors">Hoy</button>
                <button className="px-4 py-1.5 text-sm bg-[#2d3748] text-white rounded shadow-sm">Esta Semana</button>
                <button className="px-4 py-1.5 text-sm text-cero-text-muted hover:text-white transition-colors">Este Mes</button>
                <button className="px-4 py-1.5 text-sm text-cero-text-muted hover:text-white transition-colors flex items-center gap-1">
                  <Calendar size={14} /> Personalizado
                </button>
              </div>
              <button
                onClick={() => window.print()}
                className="border border-cero-border text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download size={16} /> Exportar CSV
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-cero-panel border border-cero-border rounded-xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-sm text-cero-text-muted font-mono tracking-wider uppercase block mb-1">Ingresos Totales</span>
                    <div className="text-4xl font-bold text-white">$45,231.89</div>
                  </div>
                  <div className="p-3 bg-[#1e293b] rounded-xl">
                    <DollarSign className="text-cero-lime" size={24} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-cero-lime flex items-center gap-1 font-bold"><TrendingUp size={16} /> 12.5%</span>
                  <span className="text-cero-text-muted">vs periodo anterior</span>
                </div>
              </div>

              <div className="bg-cero-panel border border-cero-border rounded-xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-sm text-cero-text-muted font-mono tracking-wider uppercase block mb-1">Gastos Totales</span>
                    <div className="text-4xl font-bold text-white">$12,450.00</div>
                  </div>
                  <div className="p-3 bg-[#1e293b] rounded-xl">
                    <DollarSign className="text-rose-400" size={24} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-cero-lime flex items-center gap-1 font-bold"><TrendingDown size={16} /> 2.4%</span>
                  <span className="text-cero-text-muted">vs periodo anterior</span>
                </div>
              </div>

              <div className="bg-cero-panel border border-cero-border rounded-xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-sm text-cero-text-muted font-mono tracking-wider uppercase block mb-1">Ganancia Neta</span>
                    <div className="text-4xl font-bold text-cero-lime">$32,781.89</div>
                  </div>
                  <div className="p-3 bg-cero-lime/10 border border-cero-lime/20 rounded-xl">
                    <TrendingUp className="text-cero-lime" size={24} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-cero-lime flex items-center gap-1 font-bold"><TrendingUp size={16} /> 8.2%</span>
                  <span className="text-cero-text-muted">vs periodo anterior</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-cero-panel border border-cero-border rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-6">Ingresos vs Gastos</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#10161c', borderColor: '#2d3748', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="revenue" fill="#ffffff" radius={[4, 4, 0, 0]} name="Ingresos" />
                      <Bar dataKey="expenses" fill="#fb7185" radius={[4, 4, 0, 0]} name="Gastos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-cero-panel border border-cero-border rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-6">Desglose de Ingresos</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white">Membresías</span>
                      <span className="text-white font-bold">65%</span>
                    </div>
                    <div className="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[65%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white">Suplementos (POS)</span>
                      <span className="text-white font-bold">20%</span>
                    </div>
                    <div className="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
                      <div className="h-full bg-[#4ade80] w-[20%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white">Ropa</span>
                      <span className="text-white font-bold">10%</span>
                    </div>
                    <div className="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
                      <div className="h-full bg-[#60a5fa] w-[10%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white">Pases por Día</span>
                      <span className="text-white font-bold">5%</span>
                    </div>
                    <div className="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
                      <div className="h-full bg-[#a78bfa] w-[5%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-cero-panel border border-cero-border rounded-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-cero-border flex justify-between items-center bg-[#10161c]">
                <h2 className="text-lg font-bold text-white">Transacciones Recientes</h2>
                <button className="text-sm text-cero-lime hover:underline cursor-pointer">Ver Todo</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-cero-text-muted uppercase tracking-wider font-mono bg-cero-bg/50 border-b border-cero-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">ID Transacción</th>
                      <th className="px-6 py-4 font-medium">Fecha y Hora</th>
                      <th className="px-6 py-4 font-medium">Cliente</th>
                      <th className="px-6 py-4 font-medium">Tipo</th>
                      <th className="px-6 py-4 font-medium text-right">Monto</th>
                      <th className="px-6 py-4 font-medium text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cero-border">
                    {recentTransactions.map((trx, i) => (
                      <tr key={i} className="hover:bg-cero-bg/80 transition-colors">
                        <td className="px-6 py-4 text-white font-mono text-xs">{trx.id}</td>
                        <td className="px-6 py-4 text-gray-300">{trx.date}</td>
                        <td className="px-6 py-4 text-white font-medium">{trx.client}</td>
                        <td className="px-6 py-4 text-gray-300">{trx.type}</td>
                        <td className="px-6 py-4 text-right text-white font-bold">${trx.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${trx.status === 'Completado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-[#1e293b] text-gray-400 border border-cero-border'}`}>
                            {trx.status}
                          </span>
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
    </div>
  );
}
