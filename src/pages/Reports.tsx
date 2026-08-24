import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/PageHeader';
import { FinancialStatements } from '../components/FinancialStatements';
import { biometricsStore, AccessLog, AttendanceAnalytics } from '../lib/biometricsStore';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  FileText,
  BarChart2,
  Users,
  Clock,
  Flame,
  Award,
  Filter,
  Search,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Zap,
  ArrowUpRight,
  Sun,
  Moon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'attendance_analytics' | 'financial_statements' | 'overview'>('attendance_analytics');
  const [analytics, setAnalytics] = useState<AttendanceAnalytics>(() => biometricsStore.getAttendanceAnalytics());
  const [logs, setLogs] = useState<AccessLog[]>(() => biometricsStore.getAccessLogs());
  
  // Table filters
  const [searchMember, setSearchMember] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Entrada' | 'Salida' | 'inside'>('all');
  const [filterCoach, setFilterCoach] = useState<'all' | 'Valeria' | 'Marcos'>('all');
  const [filterDate, setFilterDate] = useState<'today' | 'all'>('all');

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('zona_cero_access_updated', handleUpdate);
    window.addEventListener('zona_cero_members_updated', handleUpdate);

    return () => {
      window.removeEventListener('zona_cero_access_updated', handleUpdate);
      window.removeEventListener('zona_cero_members_updated', handleUpdate);
    };
  }, []);

  const loadData = () => {
    setAnalytics(biometricsStore.getAttendanceAnalytics());
    setLogs(biometricsStore.getAccessLogs());
  };

  const chartFinancialData = [
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

  // Filter logs for attendance table
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.memberName.toLowerCase().includes(searchMember.toLowerCase()) || 
                          log.memberId.toLowerCase().includes(searchMember.toLowerCase());
    
    let matchesType = true;
    if (filterType === 'Entrada') matchesType = log.type === 'Entrada';
    else if (filterType === 'Salida') matchesType = log.type === 'Salida';
    else if (filterType === 'inside') {
      matchesType = biometricsStore.isMemberCurrentlyInside(log.memberId) && log.type === 'Entrada';
    }

    let matchesCoach = true;
    if (filterCoach === 'Valeria') matchesCoach = log.coachOnDuty.includes('Valeria') || log.shift === 'Mañana';
    else if (filterCoach === 'Marcos') matchesCoach = log.coachOnDuty.includes('Marcos') || log.shift === 'Tarde/Noche';

    let matchesDate = true;
    if (filterDate === 'today') {
      const todayStr = new Date().toLocaleDateString('es-MX');
      matchesDate = log.dateFormatted === todayStr || log.timestamp.startsWith(new Date().toISOString().split('T')[0]);
    }

    return matchesSearch && matchesType && matchesCoach && matchesDate;
  });

  // Data for Coach Preference Pie Chart
  const coachPieData = analytics.coaches.map(c => ({
    name: c.name.replace('Coach ', ''),
    value: c.totalCheckins || 1,
    percentage: c.percentage,
    shift: c.shift,
    hours: c.shiftHours
  }));

  const COACH_COLORS = ['#4ade80', '#38bdf8']; // Valeria (Emerald/Lime), Marcos (Sky/Cyan)

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Fecha', 'Hora', 'Socio', 'Plan', 'Tipo', 'Coach en Turno', 'Turno', 'Estadia (min)', 'Similitud (%)', 'Estado'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.dateFormatted || '',
      l.timeFormatted,
      `"${l.memberName}"`,
      `"${l.planType}"`,
      l.type,
      `"${l.coachOnDuty}"`,
      l.shift,
      l.durationMinutes || '',
      l.similarity,
      l.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zona_cero_asistencias_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[#02111c]">
      {/* Top Header */}
      <PageHeader
        title="Reportes, Afluencia & Finanzas"
        subtitle="Analítica de asistencia facial, horarios pico, preferencia de coaches y estados financieros."
      >
        <div className="flex items-center gap-3 ml-auto print:hidden">
          {/* Navigation Tabs */}
          <div className="flex bg-[#10161c] rounded-xl p-1 border border-cero-border">
            <button
              onClick={() => setActiveTab('attendance_analytics')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'attendance_analytics'
                  ? 'bg-cero-lime text-black shadow-md font-bold'
                  : 'text-cero-text-muted hover:text-white'
              }`}
            >
              <Activity size={16} />
              Afluencia & Coaches
            </button>
            <button
              onClick={() => setActiveTab('financial_statements')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'financial_statements'
                  ? 'bg-cero-lime text-black shadow-md font-bold'
                  : 'text-cero-text-muted hover:text-white'
              }`}
            >
              <FileText size={16} />
              Estados Financieros
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-cero-lime text-black shadow-md font-bold'
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
        
        {/* ========================================================================= */}
        {/* TAB 1: AFLUENCIA, HORARIOS PICO & PREFERENCIA DE COACHES */}
        {/* ========================================================================= */}
        {activeTab === 'attendance_analytics' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Top KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: Horario Pico */}
              <div className="bg-cero-panel border border-cero-border rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-cero-lime transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs text-cero-text-muted font-mono tracking-wider uppercase block">Horario Mayor Concurrencia</span>
                    <div className="text-2xl font-extrabold text-white mt-1 flex items-center gap-2">
                      <Flame className="text-amber-400 fill-amber-400/20" size={24} />
                      {analytics.peakHour}
                    </div>
                  </div>
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                    <Clock size={20} />
                  </div>
                </div>
                <p className="text-xs text-amber-300/90 font-medium">
                  Pico de mayor concentración de socios en sala
                </p>
              </div>

              {/* Card 2: Coach Preferido */}
              <div className="bg-cero-panel border border-cero-border rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-cero-lime transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs text-cero-text-muted font-mono tracking-wider uppercase block">Coach de Mayor Preferencia</span>
                    <div className="text-xl font-extrabold text-cero-lime mt-1 flex items-center gap-1.5 truncate">
                      <Award size={22} className="text-cero-lime shrink-0" />
                      <span className="truncate">{analytics.preferredCoach.name.replace('Coach ', '')}</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-cero-lime/10 border border-cero-lime/20 rounded-xl text-cero-lime">
                    <Users size={20} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-cero-lime/10 text-cero-lime px-2 py-0.5 rounded font-bold">
                    {analytics.preferredCoach.percentage}% de afluencia
                  </span>
                  <span className="text-cero-text-muted font-mono">Turno {analytics.preferredCoach.shift}</span>
                </div>
              </div>

              {/* Card 3: Socios Actualmente Dentro */}
              <div className="bg-cero-panel border border-cero-border rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-cero-lime transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs text-cero-text-muted font-mono tracking-wider uppercase block">Entrenando Actualmente</span>
                    <div className="text-3xl font-extrabold text-cyan-400 mt-1 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
                      {analytics.currentlyInsideCount} <span className="text-sm font-normal text-gray-400">socios</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
                    <Zap size={20} />
                  </div>
                </div>
                <p className="text-xs text-cyan-300/80 font-mono">
                  {analytics.totalEntradas} entradas vs {analytics.totalSalidas} salidas registradas
                </p>
              </div>

              {/* Card 4: Tiempo Promedio de Sesión */}
              <div className="bg-cero-panel border border-cero-border rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-cero-lime transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs text-cero-text-muted font-mono tracking-wider uppercase block">Tiempo Promedio en Gym</span>
                    <div className="text-3xl font-extrabold text-white mt-1">
                      {analytics.avgDurationMinutes} <span className="text-sm font-normal text-gray-400">minutos</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#1e293b] border border-cero-border rounded-xl text-cero-lime">
                    <Clock size={20} />
                  </div>
                </div>
                <p className="text-xs text-cero-text-muted font-mono">
                  Calculado con marcas biométricas Entrada / Salida
                </p>
              </div>

            </div>

            {/* Main Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart 1: Hourly Attendance Distribution (2 cols) */}
              <div className="lg:col-span-2 bg-cero-panel border border-cero-border rounded-2xl p-6 shadow-xl">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart2 className="text-cero-lime" size={20} />
                      Horarios de Mayor Concurrencia (6:00 AM - 10:00 PM)
                    </h2>
                    <p className="text-xs text-cero-text-muted">
                      Distribución de entradas por hora del día para dimensionar personal y clases.
                    </p>
                  </div>

                  {/* Shift legend */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-400"></span>
                      <span className="text-gray-300">Mañana (Coach Valeria)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-cyan-400"></span>
                      <span className="text-gray-300">Tarde (Coach Marcos)</span>
                    </div>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.hourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis 
                        dataKey="label" 
                        stroke="#64748b" 
                        tick={{ fill: '#94a3b8', fontSize: 11 }} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#64748b" 
                        tick={{ fill: '#94a3b8', fontSize: 11 }} 
                        tickLine={false} 
                        axisLine={false} 
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#0c1520', 
                          borderColor: '#2d3748', 
                          borderRadius: '12px', 
                          color: '#fff',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                        }}
                        formatter={(value: any, name: any, item: any) => {
                          const shift = item.payload.shift;
                          const coach = item.payload.coach;
                          return [`${value} entradas`, `Turno ${shift} • ${coach}`];
                        }}
                      />
                      <Bar 
                        dataKey="entradas" 
                        name="Entradas Registradas" 
                        radius={[6, 6, 0, 0]}
                      >
                        {analytics.hourlyData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.shift === 'Mañana' ? '#34d399' : '#38bdf8'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Coach Preference Breakdown (1 col) */}
              <div className="bg-cero-panel border border-cero-border rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <Award className="text-amber-400" size={20} />
                    Preferencia de Coaches
                  </h2>
                  <p className="text-xs text-cero-text-muted mb-4">
                    Comparativa de afluencia entre el coach de la mañana y de la tarde.
                  </p>

                  <div className="h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={coachPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {coachPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COACH_COLORS[index % COACH_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0c1520', borderColor: '#2d3748', borderRadius: '8px', color: '#fff' }}
                          formatter={(value: any, name: any, item: any) => [`${item.payload.percentage}% (${value} visitas)`, `Coach ${name}`]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Coach Cards Comparison */}
                <div className="space-y-3 mt-4">
                  {analytics.coaches.map((coach, idx) => {
                    const isMorning = coach.shift === 'Mañana';
                    return (
                      <div 
                        key={coach.name} 
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                          isMorning 
                            ? 'bg-emerald-950/20 border-emerald-500/30' 
                            : 'bg-cyan-950/20 border-cyan-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={coach.avatarUrl} 
                            alt={coach.name} 
                            className="w-10 h-10 rounded-full object-cover border border-white/20"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              {isMorning ? <Sun size={13} className="text-emerald-400" /> : <Moon size={13} className="text-cyan-400" />}
                              <p className="text-sm font-bold text-white">{coach.name}</p>
                            </div>
                            <p className="text-[11px] text-cero-text-muted font-mono">{coach.shiftHours}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-base font-extrabold ${isMorning ? 'text-emerald-400' : 'text-cyan-400'}`}>
                            {coach.percentage}%
                          </span>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {coach.totalCheckins} check-ins
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Currently Active Members in Gym Section */}
            {analytics.currentlyInsideMembers.length > 0 && (
              <div className="bg-cero-panel border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <h3 className="text-base font-bold text-white">
                      Socios Entrenando en Sala Ahora Mismo ({analytics.currentlyInsideMembers.length})
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-cyan-300">Monitoreo de Aforo en Vivo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {analytics.currentlyInsideMembers.map(member => (
                    <div key={member.id} className="bg-[#10161c] border border-cero-border rounded-xl p-3 flex items-center gap-3">
                      <img src={member.avatarUrl} alt={member.fullName} className="w-10 h-10 rounded-full object-cover border border-cero-border" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{member.fullName}</p>
                        <p className="text-xs text-cero-text-muted font-mono">Ingresó: {member.enteredAt}</p>
                        <span className="text-[10px] text-cyan-300 font-mono font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded">
                          ⏱️ {member.timeInsideFormatted}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Attendance Records Table */}
            <div className="bg-cero-panel border border-cero-border rounded-2xl overflow-hidden flex flex-col shadow-xl">
              
              {/* Header & Filter Bar */}
              <div className="p-6 border-b border-cero-border bg-[#10161c] flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="text-cero-lime" size={20} />
                    Historial Completo de Entradas y Salidas
                  </h2>
                  <p className="text-xs text-cero-text-muted">Registro detallado con fechas, horarios, turnos y coach correspondiente.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cero-text-muted" size={14} />
                    <input
                      type="text"
                      placeholder="Buscar por socio..."
                      value={searchMember}
                      onChange={e => setSearchMember(e.target.value)}
                      className="bg-cero-bg border border-cero-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cero-lime w-48"
                    />
                  </div>

                  {/* Filter by Type */}
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value as any)}
                    className="bg-cero-bg border border-cero-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cero-lime"
                  >
                    <option value="all">Todos los registros</option>
                    <option value="Entrada">Solo Entradas (IN)</option>
                    <option value="Salida">Solo Salidas (OUT)</option>
                    <option value="inside">Actualmente Dentro</option>
                  </select>

                  {/* Filter by Coach */}
                  <select
                    value={filterCoach}
                    onChange={e => setFilterCoach(e.target.value as any)}
                    className="bg-cero-bg border border-cero-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cero-lime"
                  >
                    <option value="all">Todos los Coaches</option>
                    <option value="Valeria">Coach Valeria (Mañana)</option>
                    <option value="Marcos">Coach Marcos (Tarde)</option>
                  </select>

                  {/* Export CSV */}
                  <button
                    onClick={handleExportCSV}
                    className="bg-cero-lime text-black font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 hover:bg-cero-lime-hover transition-colors cursor-pointer shadow-sm"
                  >
                    <Download size={14} /> Exportar CSV
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-cero-text-muted uppercase tracking-wider font-mono bg-cero-bg/50 border-b border-cero-border">
                    <tr>
                      <th className="px-6 py-4 font-medium">Socio</th>
                      <th className="px-6 py-4 font-medium">Tipo</th>
                      <th className="px-6 py-4 font-medium">Fecha & Hora</th>
                      <th className="px-6 py-4 font-medium">Coach en Turno</th>
                      <th className="px-6 py-4 font-medium text-center">Estadía</th>
                      <th className="px-6 py-4 font-medium text-center">Biometría</th>
                      <th className="px-6 py-4 font-medium text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cero-border">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-cero-text-muted">
                          No se encontraron registros que coincidan con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const isValeria = log.coachOnDuty.includes('Valeria') || log.shift === 'Mañana';
                        return (
                          <tr key={log.id} className="hover:bg-cero-bg/80 transition-colors">
                            {/* Member info */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={log.memberAvatar} alt={log.memberName} className="w-10 h-10 rounded-full object-cover border border-cero-border" />
                                <div>
                                  <p className="text-white font-bold">{log.memberName}</p>
                                  <p className="text-xs text-cero-text-muted font-mono">{log.planType}</p>
                                </div>
                              </div>
                            </td>

                            {/* Type (Entrada vs Salida) */}
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                log.type === 'Entrada'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                              }`}>
                                {log.type === 'Entrada' ? '✓ ENTRADA (IN)' : '← SALIDA (OUT)'}
                              </span>
                            </td>

                            {/* Date and Time */}
                            <td className="px-6 py-4 font-mono text-xs">
                              <p className="text-white font-semibold">{log.timeFormatted}</p>
                              <p className="text-cero-text-muted">{log.dateFormatted || 'Hoy'}</p>
                            </td>

                            {/* Coach on duty */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isValeria ? 'bg-emerald-400' : 'bg-cyan-400'}`}></span>
                                <div>
                                  <p className="text-white font-medium text-xs">{log.coachOnDuty}</p>
                                  <span className={`text-[10px] font-mono font-bold ${isValeria ? 'text-emerald-400' : 'text-cyan-400'}`}>
                                    Turno {log.shift}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Duration */}
                            <td className="px-6 py-4 text-center font-mono text-xs">
                              {log.durationMinutes ? (
                                <span className="bg-cyan-500/10 text-cyan-300 px-2 py-1 rounded border border-cyan-500/20 font-bold">
                                  {log.durationMinutes >= 60 
                                    ? `${Math.floor(log.durationMinutes / 60)}h ${log.durationMinutes % 60}m` 
                                    : `${log.durationMinutes} min`}
                                </span>
                              ) : log.type === 'Entrada' && biometricsStore.isMemberCurrentlyInside(log.memberId) ? (
                                <span className="text-amber-400 font-medium">Entrenando...</span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>

                            {/* Similarity */}
                            <td className="px-6 py-4 text-center font-mono text-xs">
                              <span className={`font-bold ${log.similarity >= 95 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {log.similarity}%
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                                log.status === 'Permitido' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ESTADOS FINANCIEROS */}
        {/* ========================================================================= */}
        {activeTab === 'financial_statements' && (
          <FinancialStatements />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RESUMEN OPERATIVO */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Filter Bar */}
            <div className="flex justify-between items-center bg-cero-panel border border-cero-border rounded-xl p-4">
              <div className="flex bg-[#1e293b] rounded-lg p-1 border border-cero-border">
                <button className="px-4 py-1.5 text-sm text-cero-text-muted hover:text-white transition-colors">Hoy</button>
                <button className="px-4 py-1.5 text-sm bg-[#2d3748] text-white rounded shadow-sm">Esta Semana</button>
                <button className="px-4 py-1.5 text-sm text-cero-text-muted hover:text-white transition-colors">Este Mes</button>
              </div>
              <button
                onClick={() => window.print()}
                className="border border-cero-border text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download size={16} /> Imprimir Resumen
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
                    <BarChart data={chartFinancialData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
