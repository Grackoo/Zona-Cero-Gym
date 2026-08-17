import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader } from '../components/PageHeader';
import { 
  biometricsStore, 
  BiometricMember, 
  AccessLog 
} from '../lib/biometricsStore';
import { 
  matchLiveVideoAgainstMembers, 
  MatchResult 
} from '../lib/faceMatcher';
import { 
  Camera, 
  CameraOff, 
  ScanFace, 
  UserCheck, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Upload, 
  Smartphone, 
  Activity, 
  ShieldCheck, 
  Search, 
  History, 
  Zap, 
  Check, 
  Sparkles,
  Users,
  LogOut,
  LogIn,
  Trash2,
  Play,
  Pause,
  Lock,
  Unlock,
  EyeOff,
  Eye,
  Gauge,
  Wallet
} from 'lucide-react';
import { walletService, DAILY_REWARD_AMOUNT } from '../lib/walletService';

const SAMPLE_AVATARS = [
  { label: 'Rostro 1 (Atleta M)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250' },
  { label: 'Rostro 2 (Atleta F)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250' },
  { label: 'Rostro 3 (Entrenador)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250' },
  { label: 'Rostro 4 (Miembro F)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250&h=250' },
  { label: 'Rostro 5 (Miembro M)', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250&h=250' },
  { label: 'Rostro 6 (Miembro F)', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250&h=250' },
];

export default function AccessControl() {
  const [members, setMembers] = useState<BiometricMember[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [activeTab, setActiveTab] = useState<'scanner' | 'register' | 'directory'>('scanner');
  const [accessType, setAccessType] = useState<'Entrada' | 'Salida'>('Entrada');

  // Live scanner states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [continuousMode, setContinuousMode] = useState(true);
  const [scanningStatusText, setScanningStatusText] = useState('ESCANEO CONTINUO ACTIVO');
  
  // Real-time Computer Vision Match Live Stats
  const [liveSimScore, setLiveSimScore] = useState<number>(0);
  const [cameraCoveredAlert, setCameraCoveredAlert] = useState(false);
  const [detectedCandidate, setDetectedCandidate] = useState<string | null>(null);

  const [scanResult, setScanResult] = useState<{
    member?: BiometricMember;
    log: AccessLog;
    success: boolean;
    similarity: number;
  } | null>(null);

  const [rewardNotice, setRewardNotice] = useState<{
    rewarded: boolean;
    newBalance: number;
    message: string;
  } | null>(null);

  // Member deletion state
  const [memberToDelete, setMemberToDelete] = useState<BiometricMember | null>(null);

  // New Client Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    planType: 'Mensual Premium',
    status: 'Activo' as 'Activo' | 'Vencido' | 'Congelado',
    whatsappConnected: true,
    avatarUrl: SAMPLE_AVATARS[0].url,
    memberPin: '1234',
    fitnessGoal: 'salud_general' as const,
  });
  const [enrollmentMode, setEnrollmentMode] = useState<'camera' | 'upload' | 'samples'>('samples');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Camera video and canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const registerVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const continuousTimerRef = useRef<number | null>(null);
  const isCooldownRef = useRef(false);

  // Auto request camera on module load
  useEffect(() => {
    loadData();
    const handleMembersUpdated = () => setMembers(biometricsStore.getMembers());
    const handleAccessUpdated = () => setLogs(biometricsStore.getAccessLogs());

    window.addEventListener('zona_cero_members_updated', handleMembersUpdated);
    window.addEventListener('zona_cero_access_updated', handleAccessUpdated);

    // Automatically request camera permission immediately on mount
    startCamera(videoRef);

    return () => {
      window.removeEventListener('zona_cero_members_updated', handleMembersUpdated);
      window.removeEventListener('zona_cero_access_updated', handleAccessUpdated);
      stopCamera();
      if (continuousTimerRef.current) {
        clearInterval(continuousTimerRef.current);
      }
    };
  }, []);

  const loadData = () => {
    setMembers(biometricsStore.getMembers());
    setLogs(biometricsStore.getAccessLogs());
  };

  // Continuous auto-scanning loop (Smooth real-time comparison every 700ms)
  useEffect(() => {
    if (activeTab === 'scanner' && continuousMode) {
      if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);

      continuousTimerRef.current = window.setInterval(async () => {
        if (!isCooldownRef.current) {
          await runContinuousFrameCheck();
        }
      }, 700);
    } else {
      if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);
    }

    return () => {
      if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);
    };
  }, [activeTab, continuousMode, accessType, members]);

  // Start webcam
  const startCamera = async (targetVideoRef: React.RefObject<HTMLVideoElement | null>) => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Cámara no soportada en este dispositivo.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      if (targetVideoRef.current) {
        targetVideoRef.current.srcObject = stream;
        await targetVideoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access:', err);
      setCameraError(err.message || 'Permiso de cámara no concedido.');
      setIsCameraActive(false);
    }
  };

  // Stop webcam
  const stopCamera = () => {
    [videoRef.current, registerVideoRef.current].forEach(v => {
      if (v && v.srcObject) {
        const stream = v.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        v.srcObject = null;
      }
    });
    setIsCameraActive(false);
  };

  // Capture snapshot from webcam for registration
  const captureSnapshot = () => {
    if (registerVideoRef.current && canvasRef.current) {
      const video = registerVideoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(dataUrl);
        setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
        stopCamera();
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCapturedPhoto(result);
        setFormData(prev => ({ ...prev, avatarUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // CONTINUOUS AUTOMATED FRAME PROCESSING (NO BUTTON PRESS NEEDED)
  const runContinuousFrameCheck = async () => {
    const video = videoRef.current;
    if (!isCameraActive || !video || video.readyState < 2) return;

    const currentMembers = biometricsStore.getMembers();
    if (currentMembers.length === 0) return;

    // Run real visual comparison
    const match = await matchLiveVideoAgainstMembers(video, currentMembers);
    setLiveSimScore(match.similarity);

    // 1. Camera covered or pitch black
    if (match.isCovered) {
      setCameraCoveredAlert(true);
      setDetectedCandidate(null);
      setScanningStatusText('⚠️ CÁMARA TAPADA / SIN LUZ (ACCESO BLOQUEADO)');
      return;
    } else {
      setCameraCoveredAlert(false);
    }

    // 2. No face detected (hands, watch, empty room)
    if (!match.isFacePresent) {
      setDetectedCandidate(null);
      setScanningStatusText('BUSCANDO ROSTRO EN EL ENCUADRE...');
      return;
    }

    // 3. Face detected in frame
    if (match.bestMemberName) {
      setDetectedCandidate(match.bestMemberName);
    }

    // If similarity is below 95%
    if (match.similarity < 95.0) {
      setScanningStatusText(`ROSTRO EN ENCUADRE • SIMILITUD ${match.similarity}% (< 95% REQUERIDO)`);
      return;
    }

    // 4. MATCH CONFIRMED (>= 95.0%) -> Trigger automated access!
    if (match.bestMemberId) {
      isCooldownRef.current = true;
      setScanningStatusText(`¡ACCESO CONCEDIDO! (${match.similarity}% > 95%)`);

      const result = biometricsStore.registerAccess(match.bestMemberId, accessType, match.similarity);
      setScanResult(result);

      if (result.success && accessType === 'Entrada') {
        walletService.grantCheckinReward(match.bestMemberId).then(reward => {
          setRewardNotice(reward);
        });
      } else {
        setRewardNotice(null);
      }

      // 4-second cooldown before next person
      setTimeout(() => {
        isCooldownRef.current = false;
        setScanningStatusText('ESCANEO CONTINUO ACTIVO');
      }, 4000);
    }
  };

  // Manual test trigger (allows testing simulation buttons if needed)
  const triggerFacialScan = (forcedMember?: BiometricMember, customSimilarity?: number) => {
    isCooldownRef.current = true;
    setScanResult(null);
    setScanningStatusText('VALIDANDO VECTOR FACIAL...');

    setTimeout(() => {
      let targetMember = forcedMember;
      if (!targetMember && customSimilarity && customSimilarity >= 95.0) {
        const available = biometricsStore.getMembers();
        if (available.length > 0) targetMember = available[0];
      }

      if (targetMember && (!customSimilarity || customSimilarity >= 95.0)) {
        const sim = customSimilarity ?? parseFloat((96.8 + Math.random() * 2.8).toFixed(1));
        const result = biometricsStore.registerAccess(targetMember.id, accessType, sim);
        setScanResult(result);
        setLiveSimScore(sim);

        if (result.success && accessType === 'Entrada') {
          walletService.grantCheckinReward(targetMember.id).then(reward => {
            setRewardNotice(reward);
          });
        } else {
          setRewardNotice(null);
        }
      } else {
        const sim = customSimilarity ?? parseFloat((78.0 + Math.random() * 12.0).toFixed(1));
        const result = biometricsStore.registerAccess('UNKNOWN', accessType, sim);
        setScanResult(result);
        setLiveSimScore(sim);
        setRewardNotice(null);
      }

      setTimeout(() => {
        isCooldownRef.current = false;
        setScanningStatusText('ESCANEO CONTINUO ACTIVO');
      }, 2000);
    }, 400);
  };

  // Delete Member Confirmation
  const handleDeleteMember = (member: BiometricMember) => {
    biometricsStore.deleteMember(member.id);
    setMemberToDelete(null);
  };

  // Handle new client registration
  const handleRegisterClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    biometricsStore.addMember({
      fullName: formData.fullName,
      phone: formData.phone || '+52 55 0000 0000',
      planType: formData.planType,
      status: formData.status,
      avatarUrl: formData.avatarUrl || SAMPLE_AVATARS[0].url,
      whatsappConnected: formData.whatsappConnected,
      memberPin: formData.memberPin || '1234',
      fitnessGoal: formData.fitnessGoal || 'salud_general',
    });

    setRegistrationSuccess(true);
    setTimeout(() => {
      setRegistrationSuccess(false);
      setFormData({
        fullName: '',
        phone: '',
        planType: 'Mensual Premium',
        status: 'Activo',
        whatsappConnected: true,
        avatarUrl: SAMPLE_AVATARS[0].url,
      });
      setCapturedPhoto(null);
      setActiveTab('scanner');
    }, 1500);
  };

  // Computed metrics
  const todayLogs = logs.filter(l => {
    const logDate = new Date(l.timestamp).toDateString();
    return logDate === new Date().toDateString();
  });
  const entradasHoy = todayLogs.filter(l => l.type === 'Entrada' && l.status === 'Permitido').length;
  const salidasHoy = todayLogs.filter(l => l.type === 'Salida' && l.status === 'Permitido').length;
  const dentroActual = Math.max(0, entradasHoy - salidasHoy);
  const denegadosHoy = todayLogs.filter(l => l.status === 'Denegado').length;

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-cero-bg">
      {/* Top Header */}
      <PageHeader 
        title="Control de Acceso Biométrico" 
        subtitle="Escaneo facial continuo y automático • Validación estricta > 95.0% de efectividad."
      >
        <div className="flex items-center gap-3 ml-auto">
          {/* Navigation Tabs */}
          <div className="flex bg-[#10161c] rounded-xl p-1 border border-cero-border">
            <button
              onClick={() => { setActiveTab('scanner'); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-cero-lime text-black shadow-md'
                  : 'text-cero-text-muted hover:text-white'
              }`}
            >
              <ScanFace size={16} />
              Tótem de Acceso
            </button>
            <button
              onClick={() => { setActiveTab('register'); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-cero-lime text-black shadow-md'
                  : 'text-cero-text-muted hover:text-white'
              }`}
            >
              <UserPlus size={16} />
              Inscribir con Rostro
            </button>
            <button
              onClick={() => { setActiveTab('directory'); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-cero-lime text-black shadow-md'
                  : 'text-cero-text-muted hover:text-white'
              }`}
            >
              <Users size={16} />
              Directorio ({members.length})
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="p-8 space-y-8">

        {/* Security Rule & Vision Status Banner */}
        <div className="bg-[#10161c] border border-cero-border/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Escáner Automático Continuo en Vivo</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold rounded-full border border-emerald-500/30">
                  UMBRAL: {">"} 95.0%
                </span>
              </div>
              <p className="text-xs text-cero-text-muted mt-0.5">
                El sistema detecta automáticamente al cliente frente al lente y compara su estructura facial en tiempo real sin pulsar botones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {/* Live calculated similarity gauge */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cero-bg border border-cero-border rounded-xl text-white font-bold shadow-inner">
              <Gauge size={15} className="text-cero-lime" />
              <span>Similitud en Vivo: <strong className={liveSimScore >= 95 ? 'text-emerald-400 font-mono text-sm' : 'text-amber-400 font-mono text-sm'}>{liveSimScore}%</strong></span>
            </div>

            {cameraCoveredAlert ? (
              <span className="px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl flex items-center gap-1.5 font-bold animate-pulse">
                <EyeOff size={14} /> CÁMARA TAPADA
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center gap-1.5 font-bold">
                <Eye size={14} /> {detectedCandidate ? `DETECTANDO: ${detectedCandidate.split(' ')[0]}` : 'ESCANEANDO EN VIVO'}
              </span>
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-cero-panel border border-cero-border rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-cero-text-muted font-mono uppercase tracking-wider">Entradas Hoy</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                <LogIn size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{entradasHoy}</div>
            <span className="text-xs text-emerald-400 font-medium mt-1 inline-block">Validaciones faciales {">"} 95%</span>
          </div>

          <div className="bg-cero-panel border border-cero-border rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-cero-text-muted font-mono uppercase tracking-wider">En Gimnasio Ahora</span>
              <div className="p-2 bg-cero-lime/10 text-cero-lime border border-cero-lime/20 rounded-lg">
                <Activity size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold text-cero-lime">{dentroActual}</div>
            <span className="text-xs text-cero-text-muted font-medium mt-1 inline-block">Aforo actual en sala</span>
          </div>

          <div className="bg-cero-panel border border-cero-border rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-cero-text-muted font-mono uppercase tracking-wider">Salidas Hoy</span>
              <div className="p-2 bg-[#1e293b] text-gray-300 border border-cero-border rounded-lg">
                <LogOut size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{salidasHoy}</div>
            <span className="text-xs text-cero-text-muted font-medium mt-1 inline-block">Check-outs registrados</span>
          </div>

          <div className="bg-cero-panel border border-cero-border rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-cero-text-muted font-mono uppercase tracking-wider">Accesos Bloqueados</span>
              <div className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg">
                <Lock size={18} />
              </div>
            </div>
            <div className="text-3xl font-bold text-rose-400">{denegadosHoy}</div>
            <span className="text-xs text-rose-400/80 font-medium mt-1 inline-block">{"<"} 95% similitud o no miembros</span>
          </div>
        </div>

        {/* TAB 1: CONTINUOUS BIOMETRIC SCANNER */}
        {activeTab === 'scanner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Biometric Facial Viewfinder (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-cero-panel border border-cero-border rounded-2xl p-6 shadow-xl relative">
                
                {/* Header of the Scanner */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${cameraCoveredAlert ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-ping'}`}></div>
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        Tótem de Acceso Continuo
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono rounded border border-emerald-500/20 font-normal">
                          AUTOMÁTICO
                        </span>
                      </h2>
                      <p className="text-xs text-cero-text-muted">Enfoque su rostro al centro para autorizar acceso</p>
                    </div>
                  </div>

                  {/* Mode Selector: Entrada vs Salida */}
                  <div className="flex items-center gap-2">
                    <div className="flex bg-[#10161c] p-1 rounded-xl border border-cero-border">
                      <button
                        onClick={() => setAccessType('Entrada')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          accessType === 'Entrada' 
                            ? 'bg-cero-lime text-black' 
                            : 'text-cero-text-muted hover:text-white'
                        }`}
                      >
                        <LogIn size={14} /> ENTRADA (IN)
                      </button>
                      <button
                        onClick={() => setAccessType('Salida')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                          accessType === 'Salida' 
                            ? 'bg-cero-lime text-black' 
                            : 'text-cero-text-muted hover:text-white'
                        }`}
                      >
                        <LogOut size={14} /> SALIDA (OUT)
                      </button>
                    </div>

                    {/* Continuous Auto-Scan Toggle */}
                    <button
                      onClick={() => setContinuousMode(!continuousMode)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        continuousMode 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-[#1e293b] border-cero-border text-gray-400 hover:text-white'
                      }`}
                      title={continuousMode ? 'Pausar escaneo automático' : 'Reanudar escaneo automático'}
                    >
                      {continuousMode ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </div>
                </div>

                {/* Viewfinder Screen */}
                <div className={`relative h-80 sm:h-96 bg-[#020b12] rounded-2xl border-2 overflow-hidden flex items-center justify-center group shadow-inner transition-all ${
                  cameraCoveredAlert 
                    ? 'border-rose-500/70' 
                    : liveSimScore >= 95 
                    ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.35)]'
                    : 'border-cero-border/80'
                }`}>
                  
                  {/* Real WebCam Video element */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                      isCameraActive ? 'opacity-90' : 'hidden'
                    }`}
                  />

                  {/* Simulated Background if webcam is off */}
                  {!isCameraActive && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity filter contrast-125"
                      style={{ backgroundImage: "url('/Image 1.png')" }}
                    />
                  )}

                  {/* Subtle Grid overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(#143d59_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none"></div>

                  {/* Camera Covered Overlay Alert */}
                  {cameraCoveredAlert && (
                    <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                      <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-full text-rose-400 mb-3 animate-bounce">
                        <EyeOff size={32} />
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-wide">
                        Lente Obstruido o Sin Luz
                      </h3>
                      <p className="text-xs text-rose-200 mt-1 max-w-sm">
                        No se detecta imagen ni iluminación suficiente. Destape la cámara y colóquese frente al lente para ingresar.
                      </p>
                      <span className="mt-3 px-3 py-1 bg-black/60 text-rose-400 font-mono text-[11px] rounded-full border border-rose-500/30">
                        ACCESO AUTOMÁTICAMENTE PAUSADO
                      </span>
                    </div>
                  )}

                  {/* Holographic Face Bounding Frame */}
                  <div className={`relative z-10 w-56 h-68 border-2 border-dashed rounded-3xl flex flex-col items-center justify-between p-4 pointer-events-none transition-colors ${
                    cameraCoveredAlert 
                      ? 'border-rose-500/60 shadow-[0_0_35px_rgba(244,63,94,0.15)]' 
                      : liveSimScore >= 95
                      ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.3)]'
                      : 'border-cero-lime/60 shadow-[0_0_35px_rgba(255,255,255,0.09)]'
                  }`}>
                    {/* Corner Reticles */}
                    <div className={`absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg ${cameraCoveredAlert ? 'border-rose-500' : liveSimScore >= 95 ? 'border-emerald-400' : 'border-cero-lime'}`}></div>
                    <div className={`absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg ${cameraCoveredAlert ? 'border-rose-500' : liveSimScore >= 95 ? 'border-emerald-400' : 'border-cero-lime'}`}></div>
                    <div className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg ${cameraCoveredAlert ? 'border-rose-500' : liveSimScore >= 95 ? 'border-emerald-400' : 'border-cero-lime'}`}></div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-lg ${cameraCoveredAlert ? 'border-rose-500' : liveSimScore >= 95 ? 'border-emerald-400' : 'border-cero-lime'}`}></div>

                    {/* Animated Scanning Beam */}
                    {!cameraCoveredAlert && (
                      <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cero-lime to-transparent shadow-[0_0_15px_#ffffff] animate-bounce top-1/3"></div>
                    )}

                    {/* Top Status */}
                    <div className="bg-black/75 backdrop-blur px-3 py-1 rounded-full text-[10px] font-mono text-cero-lime border border-cero-lime/30 flex items-center gap-1.5">
                      <ScanFace size={12} className={cameraCoveredAlert ? '' : 'animate-spin'} />
                      <span>{scanningStatusText}</span>
                    </div>

                    {/* Face Target Icon */}
                    <div className="opacity-40">
                      {cameraCoveredAlert ? (
                        <EyeOff size={72} className="text-rose-400" />
                      ) : (
                        <ScanFace size={72} className="text-white animate-pulse" />
                      )}
                    </div>

                    {/* Bottom Status */}
                    <div className="text-[10px] text-emerald-400 font-mono bg-black/70 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      REQ: EFECTIVIDAD {">"} 95.0%
                    </div>
                  </div>

                  {/* Camera Status Overlay Badge */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                      isCameraActive 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-black/60 text-cero-text-muted border border-cero-border'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
                      {isCameraActive ? 'CÁMARA CONECTADA' : 'INICIANDO CÁMARA...'}
                    </span>
                  </div>
                </div>

                {/* Controls Bar */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {!isCameraActive ? (
                      <button
                        onClick={() => startCamera(videoRef)}
                        className="bg-[#1e293b] hover:bg-[#2d3748] border border-cero-border text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Camera size={16} />
                        Reconectar Cámara Web
                      </button>
                    ) : (
                      <button
                        onClick={stopCamera}
                        className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <CameraOff size={16} />
                        Apagar Cámara
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-cero-text-muted flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Modo Continuo: Comparación de fotogramas activa</span>
                  </div>
                </div>

                {/* Simulation & Validation Bar */}
                <div className="mt-6 pt-5 border-t border-cero-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-cero-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-cero-lime" />
                      Prueba Rápida de Validación de Torniquete:
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {members.slice(0, 3).map(member => (
                      <button
                        key={member.id}
                        onClick={() => triggerFacialScan(member, parseFloat((96.5 + Math.random() * 3.0).toFixed(1)))}
                        className="p-2 bg-[#10161c] hover:bg-[#1e293b] border border-cero-border hover:border-cero-lime/50 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer text-left group"
                        title={`Simular coincidencia exacta de ${member.fullName} (>95%)`}
                      >
                        <img 
                          src={member.avatarUrl} 
                          alt={member.fullName} 
                          className="w-8 h-8 rounded-full object-cover border border-cero-border shrink-0" 
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-cero-lime transition-colors">
                            {member.fullName.split(' ')[0]}
                          </p>
                          <p className="text-[10px] text-emerald-400 font-mono">
                            {">"} 95% Match
                          </p>
                        </div>
                      </button>
                    ))}

                    {/* Low confidence (< 95%) Test Button */}
                    <button
                      onClick={() => triggerFacialScan(undefined, 42.5)}
                      className="p-2 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/30 hover:border-rose-500/60 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer text-left"
                      title="Probar rechazo por baja similitud (<95%)"
                    >
                      <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 font-bold text-xs">
                        {"<95%"}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-rose-300 truncate">
                          Similitud 42.5%
                        </p>
                        <p className="text-[10px] text-rose-400 font-mono">
                          Rechazo Auto
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

              </div>

              {/* Scan Match Result Banner */}
              {scanResult && (
                <div className={`p-6 rounded-2xl border shadow-xl transition-all animate-fadeIn ${
                  scanResult.success 
                    ? 'bg-emerald-950/40 border-emerald-500/40' 
                    : 'bg-rose-950/40 border-rose-500/40'
                }`}>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative shrink-0">
                      <img 
                        src={scanResult.log.memberAvatar} 
                        alt={scanResult.log.memberName} 
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                      />
                      <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-full ${
                        scanResult.success ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                      }`}>
                        {scanResult.success ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h3 className="text-xl font-bold text-white">{scanResult.log.memberName}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          scanResult.success 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {scanResult.log.status.toUpperCase()}
                        </span>
                        
                        {/* Similarity Score Pill */}
                        <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded border ${
                          scanResult.similarity >= 95.0 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}>
                          EFECTIVIDAD: {scanResult.similarity}% {scanResult.similarity >= 95.0 ? '(>= 95%)' : '(< 95% RECHAZADO)'}
                        </span>
                      </div>

                      <p className="text-xs text-gray-300 font-mono">
                        ID: {scanResult.log.memberId} • Plan: {scanResult.log.planType} • {scanResult.log.type} ({scanResult.log.timeFormatted})
                      </p>

                      <p className={`text-sm font-medium ${
                        scanResult.success ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {scanResult.log.reason}
                      </p>

                      {scanResult.success && rewardNotice && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cero-lime/10 border border-cero-lime/30 text-xs font-semibold text-cero-lime">
                          <Wallet size={14} className="shrink-0" />
                          <span>
                            {rewardNotice.rewarded
                              ? `¡+$${DAILY_REWARD_AMOUNT.toFixed(2)} MXN en Monedero! Saldo actual: $${rewardNotice.newBalance.toFixed(2)}`
                              : `Monedero al día • Saldo acumulado: $${rewardNotice.newBalance.toFixed(2)} MXN`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-center sm:text-right shrink-0">
                      <div className="flex items-center justify-center sm:justify-end gap-1.5 mb-1">
                        {scanResult.success ? (
                          <Unlock size={20} className="text-emerald-400" />
                        ) : (
                          <Lock size={20} className="text-rose-400" />
                        )}
                        <span className={`text-xl font-black ${
                          scanResult.success ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {scanResult.success ? 'ACCESO AUTORIZADO' : 'ACCESO DENEGADO'}
                        </span>
                      </div>
                      <span className="text-[11px] text-cero-text-muted">
                        {scanResult.success ? 'Torniquete Liberado' : 'Torniquete Bloqueado'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Live Check-in Feed & Logs (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-cero-panel border border-cero-border rounded-2xl p-6 shadow-xl flex flex-col h-full">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-cero-border">
                  <div className="flex items-center gap-2.5">
                    <History size={20} className="text-cero-lime" />
                    <h3 className="text-lg font-bold text-white">Registro en Vivo</h3>
                  </div>
                  <button 
                    onClick={() => biometricsStore.clearLogs()}
                    className="text-xs text-cero-text-muted hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Limpiar historial
                  </button>
                </div>

                {/* Log List */}
                <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
                  {logs.length === 0 ? (
                    <div className="py-12 text-center text-cero-text-muted text-sm">
                      No hay registros de acceso recientes.
                    </div>
                  ) : (
                    logs.map(log => (
                      <div 
                        key={log.id}
                        className="bg-[#10161c] hover:bg-[#17202c] border border-cero-border rounded-xl p-3.5 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={log.memberAvatar} 
                            alt={log.memberName} 
                            className="w-11 h-11 rounded-full object-cover border border-cero-border shrink-0" 
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{log.memberName}</p>
                            <p className="text-xs text-cero-text-muted truncate font-mono">
                              {log.timeFormatted} • {log.planType}
                            </p>
                            <span className={`text-[10px] font-mono font-bold ${
                              log.similarity >= 95.0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              Similitud: {log.similarity}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            log.type === 'Entrada'
                              ? 'bg-cero-lime/10 text-cero-lime border border-cero-lime/20'
                              : 'bg-gray-500/10 text-gray-300 border border-gray-500/20'
                          }`}>
                            {log.type === 'Entrada' ? 'IN' : 'OUT'}
                          </span>

                          <span className={`w-2.5 h-2.5 rounded-full ${
                            log.status === 'Permitido' ? 'bg-emerald-400' : 'bg-rose-500'
                          }`} title={log.reason}></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-cero-border text-center">
                  <span className="text-xs text-cero-text-muted">
                    Comparación estructural facial en segundo plano • Mínimo 95.0%
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: REGISTER CLIENT WITH FACIAL BIOMETRICS */}
        {activeTab === 'register' && (
          <div className="max-w-4xl mx-auto bg-cero-panel border border-cero-border rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cero-border">
              <div className="p-3 bg-[#1e293b] rounded-xl text-cero-lime border border-cero-border">
                <UserPlus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Inscripción y Enrolamiento Facial</h2>
                <p className="text-xs text-cero-text-muted">Registra los datos personales y captura el rostro biométrico del nuevo cliente.</p>
              </div>
            </div>

            {registrationSuccess && (
              <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center gap-3 animate-fadeIn">
                <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold">¡Cliente y Biometría Facial Registrados con Éxito!</p>
                  <p className="text-xs text-emerald-200">El cliente ya puede ingresar utilizando el lector de rostro continuo.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleRegisterClient} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre Completo */}
                <div>
                  <label className="block text-xs font-bold text-cero-text-muted uppercase tracking-wider mb-2 font-mono">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofia Villarreal"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-[#10161c] border border-cero-border text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cero-lime transition-colors"
                  />
                </div>

                {/* Número Telefónico */}
                <div>
                  <label className="block text-xs font-bold text-cero-text-muted uppercase tracking-wider mb-2 font-mono">
                    Número Telefónico (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+52 55 1234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#10161c] border border-cero-border text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cero-lime transition-colors"
                  />
                </div>

                {/* Tipo de Plan */}
                <div>
                  <label className="block text-xs font-bold text-cero-text-muted uppercase tracking-wider mb-2 font-mono">
                    Tipo de Plan *
                  </label>
                  <select
                    value={formData.planType}
                    onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                    className="w-full bg-[#10161c] border border-cero-border text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cero-lime transition-colors cursor-pointer"
                  >
                    <option value="Mensual Premium">Mensual Premium ($55.00)</option>
                    <option value="Anual Premium">Anual Premium ($450.00)</option>
                    <option value="Mensual Básico">Mensual Básico ($35.00)</option>
                    <option value="Anual Estándar">Anual Estándar ($380.00)</option>
                    <option value="Pase por Día">Pase por Día ($10.00)</option>
                  </select>
                </div>

                {/* Estado de Membresía */}
                <div>
                  <label className="block text-xs font-bold text-cero-text-muted uppercase tracking-wider mb-2 font-mono">
                    Estado Inicial de Membresía
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#10161c] border border-cero-border text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-cero-lime transition-colors cursor-pointer"
                  >
                    <option value="Activo">Activo (Habilitado para entrar)</option>
                    <option value="Vencido">Vencido (Acceso bloqueado)</option>
                    <option value="Congelado">Congelado (Temporalmente inactivo)</option>
                  </select>
                </div>
              </div>

              {/* WhatsApp notification toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-[#10161c] border border-cero-border rounded-xl">
                <input
                  type="checkbox"
                  checked={formData.whatsappConnected}
                  onChange={(e) => setFormData({ ...formData, whatsappConnected: e.target.checked })}
                  className="w-4 h-4 rounded border-cero-border bg-cero-bg text-cero-lime focus:ring-cero-lime cursor-pointer"
                />
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Smartphone size={16} className="text-emerald-400" />
                  <span>Vincular y enviar confirmación biométrica por WhatsApp</span>
                </div>
              </label>

              {/* BIOMETRIC FACIAL CAPTURE SECTION */}
              <div className="space-y-4 p-6 bg-[#02111c] border border-cero-border rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <ScanFace size={18} className="text-cero-lime" />
                      Captura Biometría del Rostro *
                    </h3>
                    <p className="text-xs text-cero-text-muted mt-0.5">Elige cómo capturar o cargar la fotografía facial del cliente.</p>
                  </div>

                  {/* Mode switcher */}
                  <div className="flex bg-[#10161c] p-1 rounded-xl border border-cero-border">
                    <button
                      type="button"
                      onClick={() => { setEnrollmentMode('camera'); startCamera(registerVideoRef); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        enrollmentMode === 'camera' ? 'bg-cero-lime text-black' : 'text-cero-text-muted hover:text-white'
                      }`}
                    >
                      <Camera size={14} /> Cámara Web
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEnrollmentMode('upload'); stopCamera(); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        enrollmentMode === 'upload' ? 'bg-cero-lime text-black' : 'text-cero-text-muted hover:text-white'
                      }`}
                    >
                      <Upload size={14} /> Subir Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEnrollmentMode('samples'); stopCamera(); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        enrollmentMode === 'samples' ? 'bg-cero-lime text-black' : 'text-cero-text-muted hover:text-white'
                      }`}
                    >
                      <Sparkles size={14} /> Rostros Muestra
                    </button>
                  </div>
                </div>

                {/* Sub-view: WebCam capture */}
                {enrollmentMode === 'camera' && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative w-72 h-72 bg-black rounded-2xl overflow-hidden border-2 border-cero-lime/50 shadow-lg flex items-center justify-center">
                      <video
                        ref={registerVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Face alignment outline */}
                      <div className="absolute inset-4 border-2 border-dashed border-cero-lime/60 rounded-full pointer-events-none flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-cero-lime"></div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="bg-cero-lime hover:bg-cero-lime-hover text-black px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
                    >
                      <Camera size={18} /> Capturar Rostro
                    </button>
                  </div>
                )}

                {/* Sub-view: Upload Photo */}
                {enrollmentMode === 'upload' && (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-cero-border hover:border-cero-lime rounded-2xl p-8 transition-colors bg-[#10161c] cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload size={36} className="text-cero-text-muted mb-3" />
                    <p className="text-sm font-semibold text-white">Haz clic o arrastra la foto del cliente aquí</p>
                    <p className="text-xs text-cero-text-muted mt-1">Soporta JPG, PNG, WEBP</p>
                  </div>
                )}

                {/* Sub-view: Sample faces */}
                {enrollmentMode === 'samples' && (
                  <div>
                    <p className="text-xs text-cero-text-muted mb-3">Selecciona uno de los rostros de muestra predefinidos:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {SAMPLE_AVATARS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, avatarUrl: sample.url });
                            setCapturedPhoto(sample.url);
                          }}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                            formData.avatarUrl === sample.url
                              ? 'bg-cero-lime/10 border-cero-lime ring-2 ring-cero-lime/30'
                              : 'bg-[#10161c] border-cero-border hover:border-white/40'
                          }`}
                        >
                          <img src={sample.url} alt={sample.label} className="w-14 h-14 rounded-full object-cover" />
                          <span className="text-[11px] font-medium text-gray-300 text-center">{sample.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected/Captured Photo Preview */}
                {(capturedPhoto || formData.avatarUrl) && (
                  <div className="mt-4 p-4 bg-[#10161c] border border-cero-border rounded-xl flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={capturedPhoto || formData.avatarUrl} 
                        alt="Rostro seleccionado" 
                        className="w-16 h-16 rounded-xl object-cover border border-cero-lime"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-cero-lime text-black p-0.5 rounded-full">
                        <Check size={12} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Rostro Biométrico Asignado</p>
                      <p className="text-xs text-emerald-400 font-mono">Vector facial generado correctamente (Spatial HOG + Zonas Faciales)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-cero-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('scanner')}
                  className="px-6 py-3 border border-cero-border text-white text-sm font-semibold rounded-xl hover:bg-[#1e293b] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-cero-lime hover:bg-cero-lime-hover text-black px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <ShieldCheck size={18} /> Guardar Inscripción y Biometría
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: DIRECTORY OF REGISTERED BIOMETRIC MEMBERS (WITH DELETE BUTTON) */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 bg-cero-panel border border-cero-border rounded-2xl p-5">
              <div>
                <h2 className="text-lg font-bold text-white">Directorio de Miembros Biométricos</h2>
                <p className="text-xs text-cero-text-muted">Total de {members.length} clientes registrados en el sistema.</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => biometricsStore.resetDemoData()}
                  className="px-3.5 py-2 bg-[#1e293b] hover:bg-[#283548] border border-cero-border text-xs text-cero-text-muted hover:text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={14} /> Restaurar Clientes Demo
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="bg-cero-lime hover:bg-cero-lime-hover text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus size={14} /> + Inscribir Nuevo
                </button>
              </div>
            </div>

            {/* Members Cards Grid with Delete Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map(member => (
                <div 
                  key={member.id}
                  className="bg-cero-panel border border-cero-border hover:border-cero-lime/40 rounded-2xl p-5 transition-all shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <img 
                      src={member.avatarUrl} 
                      alt={member.fullName} 
                      className="w-16 h-16 rounded-2xl object-cover border border-cero-border shrink-0 shadow-inner"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-white truncate">{member.fullName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          member.status === 'Activo' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : member.status === 'Vencido'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                      <p className="text-xs text-cero-lime font-medium mt-0.5">{member.planType}</p>
                      <p className="text-[11px] text-cero-text-muted font-mono mt-1">ID: {member.id} • {member.phone}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-cero-border flex items-center justify-between gap-2">
                    <span className="text-[11px] text-cero-text-muted truncate">
                      Visita: <strong className="text-gray-300">{member.lastVisit || 'Hoy'}</strong>
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Delete Member Button */}
                      <button
                        onClick={() => setMemberToDelete(member)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:border-rose-500/50 rounded-lg transition-colors cursor-pointer"
                        title={`Eliminar a ${member.fullName}`}
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Test Access Button */}
                      <button
                        onClick={() => {
                          setActiveTab('scanner');
                          triggerFacialScan(member);
                        }}
                        className="bg-[#1e293b] hover:bg-cero-lime hover:text-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-cero-border transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ScanFace size={13} /> Probar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {memberToDelete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-cero-panel border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/30">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">¿Eliminar Miembro?</h3>
                  <p className="text-xs text-cero-text-muted">Esta acción borrará sus datos personales y registro biométrico.</p>
                </div>
              </div>

              <div className="p-4 bg-[#10161c] border border-cero-border rounded-xl flex items-center gap-4">
                <img 
                  src={memberToDelete.avatarUrl} 
                  alt={memberToDelete.fullName} 
                  className="w-12 h-12 rounded-xl object-cover border border-cero-border"
                />
                <div>
                  <p className="text-sm font-bold text-white">{memberToDelete.fullName}</p>
                  <p className="text-xs text-cero-text-muted">ID: {memberToDelete.id} • Plan: {memberToDelete.planType}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setMemberToDelete(null)}
                  className="px-4 py-2.5 border border-cero-border text-white text-sm font-semibold rounded-xl hover:bg-[#1e293b] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteMember(memberToDelete)}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <Trash2 size={16} /> Confirmar Eliminación
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
