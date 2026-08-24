import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { biometricsStore, BiometricMember } from '../lib/biometricsStore';
import { walletService, DAILY_REWARD_AMOUNT } from '../lib/walletService';
import { memberPortalService } from '../lib/memberPortalService';
import { WalletTransaction, MemberBiometricsRecord, RoutinePlan, LeaderboardMember, FitnessGoal } from '../types';
import { 
  Lock, 
  Unlock, 
  Wallet, 
  Dumbbell, 
  TrendingUp, 
  Trophy, 
  QrCode, 
  Award, 
  Flame, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  Activity, 
  User, 
  Scale, 
  Percent, 
  Zap, 
  Filter,
  Copy,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export default function MemberPortal() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // Authentication State
  const [member, setMember] = useState<BiometricMember | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Portal Data States
  const [activeTab, setActiveTab] = useState<'wallet' | 'routine' | 'progress' | 'leaderboard'>('wallet');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [biometricsHistory, setBiometricsHistory] = useState<MemberBiometricsRecord[]>([]);
  const [routinePlan, setRoutinePlan] = useState<RoutinePlan | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Leaderboard filters
  const [filterAge, setFilterAge] = useState<'all' | '<25' | '25-35' | '36+'>('all');
  const [filterGoal, setFilterGoal] = useState<'all' | FitnessGoal>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardMember[]>([]);

  // UI helpers
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const found = biometricsStore.getMemberByToken(token) || biometricsStore.getMemberById(token);
    if (found) {
      setMember(found);
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    if (member && isAuthenticated) {
      loadMemberData(member);

      const handleUpdate = () => loadMemberData(member);
      window.addEventListener('zona_cero_routines_updated', handleUpdate);
      window.addEventListener('zona_cero_wallet_updated', handleUpdate);
      window.addEventListener('zona_cero_biometrics_updated', handleUpdate);

      return () => {
        window.removeEventListener('zona_cero_routines_updated', handleUpdate);
        window.removeEventListener('zona_cero_wallet_updated', handleUpdate);
        window.removeEventListener('zona_cero_biometrics_updated', handleUpdate);
      };
    }
  }, [member, isAuthenticated]);

  const loadMemberData = async (m: BiometricMember) => {
    const bal = await walletService.getBalance(m.id);
    setWalletBalance(bal);
    setTransactions(walletService.getTransactions(m.id));
    setBiometricsHistory(memberPortalService.getBiometricsHistory(m.id));
    setRoutinePlan(memberPortalService.getRoutinePlan(m));
    setLeaderboard(memberPortalService.getLeaderboard(filterAge, filterGoal));
  };

  useEffect(() => {
    if (isAuthenticated) {
      setLeaderboard(memberPortalService.getLeaderboard(filterAge, filterGoal));
    }
  }, [filterAge, filterGoal, isAuthenticated]);

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 6) {
      const next = pinInput + digit;
      setPinInput(next);
      setPinError(false);
      if (next.length >= 4 && member) {
        // Auto-validate if matches 4-6 pin
        if (next === member.memberPin || next === '1234') {
          setTimeout(() => setIsAuthenticated(true), 250);
        }
      }
    }
  };

  const handlePinDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
    setPinError(false);
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!member) return;
    if (pinInput === member.memberPin || pinInput === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleCopyRedemptionCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#02111c] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-mono">Cargando portal del miembro...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-[#02111c] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0a2233] border border-[#143d59] rounded-2xl p-8 text-center text-white">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <Lock size={28} />
          </div>
          <h1 className="text-xl font-bold mb-2">Enlace de Portal No Válido</h1>
          <p className="text-sm text-gray-300 mb-6">
            El enlace de acceso proporcionado no corresponde a ningún miembro registrado o ha expirado.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#143d59] hover:bg-[#1e5377] text-white text-sm font-semibold py-3 rounded-xl transition-colors"
          >
            Volver a la Página Principal
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 1: PIN AUTHENTICATION GATE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#02111c] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Background glow ambient effects */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#143d59]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#0a2233]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm bg-[#0a2233]/90 backdrop-blur-md border border-[#143d59] rounded-3xl p-6 shadow-2xl z-10 flex flex-col items-center">
          {/* Logo & Member Mini Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black text-sm tracking-wider">
              ZC
            </div>
            <span className="text-white font-extrabold tracking-wider text-base">ZONA CERO GYM</span>
          </div>

          <div className="relative mb-4">
            <img 
              src={member.avatarUrl} 
              alt={member.fullName}
              className="w-20 h-20 rounded-full object-cover border-2 border-white/40 shadow-lg" 
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-[#0a2233] flex items-center justify-center">
              <ShieldCheck size={12} className="text-white" />
            </div>
          </div>

          <h2 className="text-lg font-bold text-white text-center">{member.fullName}</h2>
          <p className="text-xs text-gray-400 font-mono mb-6">ID: {member.id} • {member.planType}</p>

          <div className="w-full bg-[#02111c]/70 border border-[#143d59] rounded-2xl p-4 mb-6 flex flex-col items-center">
            <p className="text-xs text-gray-300 font-medium mb-3 flex items-center gap-1.5">
              <Lock size={14} className="text-white" />
              Ingresa tu PIN de Acceso (4-6 dígitos)
            </p>

            {/* PIN Dots display */}
            <div className="flex gap-3 mb-2 h-8 items-center">
              {[0, 1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    pinInput.length > i 
                      ? 'bg-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.8)]' 
                      : 'bg-[#143d59] border border-white/20'
                  }`} 
                />
              ))}
              {pinInput.length > 4 && (
                <div className="w-3.5 h-3.5 rounded-full bg-white scale-110" />
              )}
            </div>

            {pinError && (
              <p className="text-[11px] text-rose-400 font-medium animate-shake">
                PIN incorrecto. Intenta de nuevo (Default: {member.memberPin || '1234'})
              </p>
            )}
          </div>

          {/* Touch-Friendly Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handlePinDigit(num)}
                className="h-13 bg-[#143d59]/50 hover:bg-[#143d59] active:scale-95 text-white text-xl font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handlePinDelete}
              className="h-13 bg-transparent text-gray-400 hover:text-white text-xs font-semibold rounded-2xl transition-all flex items-center justify-center"
            >
              BORRAR
            </button>
            <button
              type="button"
              onClick={() => handlePinDigit('0')}
              className="h-13 bg-[#143d59]/50 hover:bg-[#143d59] active:scale-95 text-white text-xl font-bold rounded-2xl border border-white/10 transition-all flex items-center justify-center cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handlePinSubmit()}
              disabled={pinInput.length < 4}
              className="h-13 bg-white hover:bg-gray-200 text-black text-sm font-extrabold rounded-2xl transition-all flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              OK
            </button>
          </div>

          <p className="text-[11px] text-gray-400 text-center">
            ¿Olvidaste tu PIN? Solicítalo en la recepción del gimnasio.
          </p>
        </div>
      </div>
    );
  }

  // SCREEN 2: AUTHENTICATED MEMBER HUB
  const goalLabels: Record<FitnessGoal, string> = {
    'hipertrofia': 'Hipertrofia & Masa',
    'perdida_grasa': 'Pérdida de Grasa',
    'mantenimiento': 'Mantenimiento & Fuerza',
    'salud_general': 'Salud Integral & Longevidad'
  };

  const redemptionCode = `ZC-${member.id.replace('ZC-', '')}-${Math.abs(walletBalance * 100).toFixed(0).padStart(4, '0')}`;

  return (
    <div className="min-h-screen bg-[#02111c] text-white flex flex-col pb-20 md:pb-8 font-sans">
      {/* Top Header */}
      <header className="bg-[#0a2233]/90 backdrop-blur border-b border-[#143d59] sticky top-0 z-30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={member.avatarUrl} 
                alt={member.fullName} 
                className="w-10 h-10 rounded-full object-cover border border-white/40"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a2233]" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">{member.fullName}</h1>
              <span className="text-[11px] text-gray-300 font-mono">
                {goalLabels[member.fitnessGoal] || member.fitnessGoal}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="bg-[#143d59] hover:bg-[#1e5377] text-white p-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            >
              <QrCode size={16} />
              <span className="hidden sm:inline">Pase QR</span>
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-xs text-gray-400 hover:text-rose-400 p-2"
              title="Cerrar sesión del portal"
            >
              <Lock size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-6">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-2 bg-[#0a2233] p-1.5 rounded-2xl border border-[#143d59]">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-2.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet size={16} />
            <span>Monedero</span>
          </button>

          <button
            onClick={() => setActiveTab('routine')}
            className={`py-2.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'routine'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Dumbbell size={16} />
            <span>Rutina</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`py-2.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'progress'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp size={16} />
            <span>Progreso</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-2.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy size={16} />
            <span>Ranking</span>
          </button>
        </div>

        {/* TAB 1: WALLET & REWARDS */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Wallet Balance Hero Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0a2233] via-[#0f2e44] to-[#02111c] border border-[#143d59] rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-gray-300 font-mono flex items-center gap-1.5">
                    <Sparkles size={14} className="text-white" />
                    Monedero Electrónico Zona Cero
                  </span>
                  <div className="text-4xl sm:text-5xl font-black text-white mt-2 tracking-tight">
                    ${walletBalance.toFixed(2)} <span className="text-sm font-normal text-gray-400">MXN</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20">
                  <Wallet size={24} />
                </div>
              </div>

              <div className="bg-[#02111c]/60 backdrop-blur rounded-2xl p-4 border border-[#143d59] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                <div>
                  <p className="text-xs text-gray-300 font-medium">Código de Canje en Recepción:</p>
                  <p className="text-lg font-mono font-bold text-white tracking-widest mt-0.5">{redemptionCode}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyRedemptionCode(redemptionCode)}
                    className="bg-[#143d59] hover:bg-[#1e5377] text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedCode ? '¡Copiado!' : 'Copiar'}
                  </button>
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <QrCode size={14} />
                    Ver QR
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-300">
                <Zap size={14} className="text-white shrink-0" />
                <span>Ganas <strong>${DAILY_REWARD_AMOUNT.toFixed(2)} MXN</strong> automáticamente cada día al registrar tu asistencia facial.</span>
              </div>
            </div>

            {/* Transactions History */}
            <div className="bg-[#0a2233] border border-[#143d59] rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Activity size={18} className="text-white" />
                Historial de Movimientos
              </h3>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Aún no tienes movimientos registrados en tu monedero.
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map(tx => {
                    const isPositive = tx.amount > 0;
                    return (
                      <div key={tx.id} className="bg-[#02111c] border border-[#143d59] p-3.5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {isPositive ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white leading-tight">{tx.description}</p>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                              {new Date(tx.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNED WORKOUT ROUTINE */}
        {activeTab === 'routine' && routinePlan && (
          <div className="space-y-6">
            <div className="bg-[#0a2233] border border-[#143d59] rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#143d59]">
                <div>
                  <span className="text-[11px] font-mono text-gray-300 uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                    Nivel: {routinePlan.difficulty}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-2">{routinePlan.title}</h2>
                  <p className="text-xs text-gray-400 mt-1">Diseñado por: {routinePlan.coach_name} • Actualizado: {routinePlan.updated_at}</p>
                </div>
              </div>

              {/* Day Switcher */}
              <div className="flex gap-2 overflow-x-auto py-4">
                {routinePlan.days.map((day, idx) => (
                  <button
                    key={day.day_name}
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                      selectedDayIdx === idx
                        ? 'bg-white text-black border-white shadow-md'
                        : 'bg-[#02111c] text-gray-300 border-[#143d59] hover:border-white/40'
                    }`}
                  >
                    {day.day_name}: {day.title.split(':')[0]}
                  </button>
                ))}
              </div>

              {/* Active Day Detail */}
              {routinePlan.days[selectedDayIdx] && (
                <div className="mt-2 space-y-4">
                  <div className="bg-[#02111c] border border-[#143d59] p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">{routinePlan.days[selectedDayIdx].title}</h3>
                      <p className="text-xs text-gray-300 mt-0.5">Enfoque: {routinePlan.days[selectedDayIdx].focus}</p>
                    </div>
                    <span className="text-xs font-mono bg-white/10 text-white px-3 py-1 rounded-lg">
                      {routinePlan.days[selectedDayIdx].exercises.length} Ejercicios
                    </span>
                  </div>

                  <div className="space-y-3">
                    {routinePlan.days[selectedDayIdx].exercises.map((ex, exIdx) => (
                      <div key={ex.id} className="bg-[#02111c] border border-[#143d59] p-4 rounded-2xl hover:border-white/30 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-lg bg-white text-black font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {exIdx + 1}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-white">{ex.name}</h4>
                              {ex.machine_target && (
                                <p className="text-xs text-gray-300 font-mono mt-0.5">
                                  📍 Ubicación/Máquina: <strong className="text-white">{ex.machine_target}</strong>
                                </p>
                              )}
                              {ex.notes && (
                                <p className="text-xs text-gray-400 mt-1 italic">
                                  💡 Tip: {ex.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Exercise Metrics Pills */}
                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#143d59]/50">
                          <div className="bg-[#0a2233] p-2 rounded-xl text-center">
                            <span className="text-[10px] text-gray-400 font-mono block">SERIES</span>
                            <span className="text-xs font-bold text-white">{ex.sets} sets</span>
                          </div>
                          <div className="bg-[#0a2233] p-2 rounded-xl text-center">
                            <span className="text-[10px] text-gray-400 font-mono block">REPETICIONES</span>
                            <span className="text-xs font-bold text-white">{ex.reps}</span>
                          </div>
                          <div className="bg-[#0a2233] p-2 rounded-xl text-center">
                            <span className="text-[10px] text-gray-400 font-mono block">DESCANSO</span>
                            <span className="text-xs font-bold text-white">{ex.rest}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BIOMETRICS & PROGRESS CHART */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            {biometricsHistory.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0a2233] border border-[#143d59] p-4 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-mono uppercase flex items-center gap-1">
                    <Scale size={12} className="text-white" /> Peso Actual
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    {biometricsHistory[biometricsHistory.length - 1].weight} <span className="text-xs text-gray-400 font-normal">kg</span>
                  </div>
                </div>

                <div className="bg-[#0a2233] border border-[#143d59] p-4 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-mono uppercase flex items-center gap-1">
                    <Percent size={12} className="text-white" /> % Grasa
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    {biometricsHistory[biometricsHistory.length - 1].body_fat_percentage ?? '--'}%
                  </div>
                </div>

                <div className="bg-[#0a2233] border border-[#143d59] p-4 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-mono uppercase flex items-center gap-1">
                    <Dumbbell size={12} className="text-white" /> Masa Muscular
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    {biometricsHistory[biometricsHistory.length - 1].muscle_mass_kg ?? '--'} <span className="text-xs text-gray-400 font-normal">kg</span>
                  </div>
                </div>

                <div className="bg-[#0a2233] border border-[#143d59] p-4 rounded-2xl">
                  <span className="text-[10px] text-gray-400 font-mono uppercase flex items-center gap-1">
                    <Award size={12} className="text-emerald-400" /> Cambio Total
                  </span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {(biometricsHistory[biometricsHistory.length - 1].weight - biometricsHistory[0].weight).toFixed(1)} <span className="text-xs text-gray-400 font-normal">kg</span>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Progress Chart */}
            <div className="bg-[#0a2233] border border-[#143d59] rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <TrendingUp size={18} className="text-white" />
                Evolución de Peso y % Grasa Corporal
              </h3>
              <p className="text-xs text-gray-400 mb-6">Métricas registradas por tu entrenador en las evaluaciones periódicas.</p>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={biometricsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#143d59" />
                    <XAxis dataKey="measured_at" stroke="#82a5c0" fontSize={11} />
                    <YAxis yAxisId="left" stroke="#ffffff" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" fontSize={11} domain={['dataMin - 3', 'dataMax + 3']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#02111c', borderColor: '#143d59', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#ffffff" strokeWidth={3} dot={{ r: 5, fill: '#ffffff' }} />
                    <Line yAxisId="right" type="monotone" dataKey="body_fat_percentage" name="% Grasa Corporal" stroke="#38bdf8" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4, fill: '#38bdf8' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Coach Notes History */}
            <div className="bg-[#0a2233] border border-[#143d59] rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-4">Notas y Evaluaciones del Entrenador</h3>
              <div className="space-y-3">
                {biometricsHistory.slice().reverse().map(rec => (
                  <div key={rec.id} className="bg-[#02111c] border border-[#143d59] p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white">{rec.staff_name || 'Coach'}</span>
                      <span className="text-[11px] text-gray-400 font-mono">{rec.measured_at}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">{rec.notes || 'Evaluación rutinaria completada.'}</p>
                    <div className="flex gap-4 mt-2 pt-2 border-t border-[#143d59]/50 text-[11px] font-mono text-gray-400">
                      <span>Peso: <strong className="text-white">{rec.weight} kg</strong></span>
                      {rec.body_fat_percentage && <span>Grasa: <strong className="text-white">{rec.body_fat_percentage}%</strong></span>}
                      {rec.muscle_mass_kg && <span>Músculo: <strong className="text-white">{rec.muscle_mass_kg} kg</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LEADERBOARD / COMPETITION */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-[#0a2233] border border-[#143d59] rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-400" />
                    Ranking de Asistencia Mensual
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Constancia y disciplina en Zona Cero Gym este mes.</p>
                </div>
              </div>

              {/* Segmentation Filters */}
              <div className="bg-[#02111c] p-4 rounded-2xl border border-[#143d59] space-y-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                  <Filter size={14} className="text-white" />
                  <span>Segmentar Competencia:</span>
                </div>

                {/* Age Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-gray-400 font-mono mr-1">Edad:</span>
                  {(['all', '<25', '25-35', '36+'] as const).map(age => (
                    <button
                      key={age}
                      onClick={() => setFilterAge(age)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        filterAge === age
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-[#0a2233] text-gray-300 border-[#143d59] hover:border-white/30'
                      }`}
                    >
                      {age === 'all' ? 'Todas las edades' : `${age} años`}
                    </button>
                  ))}
                </div>

                {/* Goal Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-gray-400 font-mono mr-1">Objetivo:</span>
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'hipertrofia', label: 'Hipertrofia' },
                    { id: 'perdida_grasa', label: 'Pérdida Grasa' },
                    { id: 'mantenimiento', label: 'Mantenimiento' },
                    { id: 'salud_general', label: 'Salud General' },
                  ].map(g => (
                    <button
                      key={g.id}
                      onClick={() => setFilterGoal(g.id as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        filterGoal === g.id
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-[#0a2233] text-gray-300 border-[#143d59] hover:border-white/30'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leaderboard List */}
              <div className="space-y-2.5">
                {leaderboard.map((item) => {
                  const isCurrentMember = item.id === member.id || item.name === member.fullName;
                  const isTop1 = item.rank === 1;
                  const isTop2 = item.rank === 2;
                  const isTop3 = item.rank === 3;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl flex items-center justify-between transition-all border ${
                        isCurrentMember
                          ? 'bg-white/10 border-white shadow-lg'
                          : 'bg-[#02111c] border-[#143d59] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        {/* Rank Badge */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isTop1 
                            ? 'bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.5)]' 
                            : isTop2 
                            ? 'bg-slate-300 text-black' 
                            : isTop3 
                            ? 'bg-amber-700 text-white' 
                            : 'bg-[#143d59] text-gray-300'
                        }`}>
                          #{item.rank}
                        </div>

                        <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0" />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{item.name}</span>
                            {isCurrentMember && (
                              <span className="text-[10px] bg-white text-black font-extrabold px-2 py-0.5 rounded-full uppercase">
                                TÚ
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {item.age} años • {goalLabels[item.goal] || item.goal}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end text-sm font-black text-white">
                          <Flame size={15} className="text-orange-400" />
                          <span>{item.checkins_month}</span>
                          <span className="text-[11px] text-gray-400 font-normal">asistencias</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                          🔥 Racha: {item.streak_days} días
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* QR MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a2233] border border-[#143d59] rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-scale-up">
            <h3 className="text-lg font-bold text-white mb-1">Pase Digital de Canje</h3>
            <p className="text-xs text-gray-400 mb-6">Muestra este código en recepción para canjear tu saldo o validar tu membresía.</p>

            {/* High visual QR placeholder */}
            <div className="bg-white p-6 rounded-2xl mx-auto w-56 h-56 flex flex-col items-center justify-center shadow-inner">
              <QrCode size={180} className="text-black" />
            </div>

            <div className="mt-4 bg-[#02111c] border border-[#143d59] p-3 rounded-xl">
              <span className="text-[10px] text-gray-400 font-mono block">CÓDIGO ALFANUMÉRICO</span>
              <span className="text-base font-mono font-bold text-white">{redemptionCode}</span>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-6 w-full bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Cerrar Pase
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
