import { MemberBiometricsRecord, RoutinePlan, LeaderboardMember, FitnessGoal } from '../types';
import { biometricsStore, BiometricMember } from './biometricsStore';

const BIOMETRICS_STORAGE_KEY = 'zona_cero_biometrics_history_v1';

const INITIAL_BIOMETRICS: Record<string, MemberBiometricsRecord[]> = {
  'ZC-1001': [
    { id: 'bio-1', member_id: 'ZC-1001', staff_name: 'Coach Valeria', weight: 84.5, body_fat_percentage: 19.2, muscle_mass_kg: 41.0, notes: 'Evaluación inicial. Buena masa muscular base.', measured_at: '2026-05-10' },
    { id: 'bio-2', member_id: 'ZC-1001', staff_name: 'Coach Valeria', weight: 83.2, body_fat_percentage: 17.8, muscle_mass_kg: 41.8, notes: 'Disminución de grasa visceral y aumento de fuerza en press militar.', measured_at: '2026-06-12' },
    { id: 'bio-3', member_id: 'ZC-1001', staff_name: 'Coach Valeria', weight: 82.0, body_fat_percentage: 16.1, muscle_mass_kg: 42.5, notes: 'Excelente recomposición corporal. Mantener superávit limpio.', measured_at: '2026-07-15' },
    { id: 'bio-4', member_id: 'ZC-1001', staff_name: 'Coach Valeria', weight: 81.3, body_fat_percentage: 14.8, muscle_mass_kg: 43.1, notes: 'Objetivo de hipertrofia cumpliéndose con alta definición.', measured_at: '2026-08-10' },
  ],
  'ZC-1002': [
    { id: 'bio-21', member_id: 'ZC-1002', staff_name: 'Coach Marcos', weight: 68.0, body_fat_percentage: 28.5, muscle_mass_kg: 27.2, notes: 'Inicio plan déficit calórico guiado.', measured_at: '2026-05-20' },
    { id: 'bio-22', member_id: 'ZC-1002', staff_name: 'Coach Marcos', weight: 66.2, body_fat_percentage: 26.0, muscle_mass_kg: 27.5, notes: 'Buena respuesta cardiovascular.', measured_at: '2026-06-25' },
    { id: 'bio-23', member_id: 'ZC-1002', staff_name: 'Coach Marcos', weight: 64.5, body_fat_percentage: 23.4, muscle_mass_kg: 28.0, notes: 'Gran consistencia en asistencia. -4kg totales de grasa.', measured_at: '2026-08-01' },
  ]
};

const SAMPLE_ROUTINES: Record<string, RoutinePlan> = {
  'hipertrofia': {
    id: 'rout-1',
    member_id: 'ZC-1001',
    title: 'Hipertrofia & Fuerza Pro 4 Días',
    goal: 'hipertrofia',
    difficulty: 'Avanzado',
    coach_name: 'Coach Valeria Mendez',
    updated_at: '2026-08-01',
    days: [
      {
        day_name: 'Día 1',
        title: 'Torso: Pecho & Espalda',
        focus: 'Fuerza e hipertrofia superior',
        exercises: [
          { id: 'e1', name: 'Press Banca Plano con Barra', sets: 4, reps: '8 - 10', rest: '90 seg', machine_target: 'Banca Olímpica #2', notes: 'RPE 8. Controlar la fase excéntrica 2 segundos.' },
          { id: 'e2', name: 'Remo con Barra T o Mancuernas', sets: 4, reps: '10 - 12', rest: '90 seg', machine_target: 'Estación Remo Dorsal', notes: 'Retracción escapular completa al final del recorrido.' },
          { id: 'e3', name: 'Press Inclinado con Mancuernas', sets: 3, reps: '10 - 12', rest: '75 seg', machine_target: 'Banca Inclinable 30°', notes: 'Enfoque en porción clavicular del pectoral.' },
          { id: 'e4', name: 'Jalón al Pecho Agarre Neutro', sets: 3, reps: '12 - 15', rest: '60 seg', machine_target: 'Polea Alta Torre C', notes: 'Drop set en la última serie.' },
        ]
      },
      {
        day_name: 'Día 2',
        title: 'Pierna: Enfoque Cuádriceps & Glúteo',
        focus: 'Potencia y volumen de tren inferior',
        exercises: [
          { id: 'e5', name: 'Sentadilla Hack / Squat Libre', sets: 4, reps: '6 - 8', rest: '120 seg', machine_target: 'Hack Squat Hammer', notes: 'Bajar hasta romper paralelo con talones bien apoyados.' },
          { id: 'e6', name: 'Prensa Inclinada 45°', sets: 4, reps: '10 - 12', rest: '90 seg', machine_target: 'Prensa Plate-Loaded', notes: 'Pies a la anchura de los hombros en posición media.' },
          { id: 'e7', name: 'Extensión de Cuádriceps', sets: 3, reps: '15 + pausa', rest: '60 seg', machine_target: 'Máquina Extensión #1', notes: 'Pausa de 1 segundo arriba en contracción máxima.' },
          { id: 'e8', name: 'Elevación de Talones de Pie', sets: 4, reps: '15 - 20', rest: '45 seg', machine_target: 'Máquina Gemelos', notes: 'Estiramiento profundo en la parte baja.' },
        ]
      },
      {
        day_name: 'Día 3',
        title: 'Hombro & Brazos (Bíceps / Tríceps)',
        focus: 'Densidad y aislamiento de brazos',
        exercises: [
          { id: 'e9', name: 'Press Militar con Mancuernas', sets: 4, reps: '8 - 10', rest: '90 seg', machine_target: 'Banca 85°', notes: 'No arquear la zona lumbar.' },
          { id: 'e10', name: 'Elevaciones Laterales en Polea', sets: 4, reps: '12 - 15', rest: '60 seg', machine_target: 'Polea Doble Crossover', notes: 'Codos ligeramente flexionados.' },
          { id: 'e11', name: 'Curl de Bíceps en Banco Scott', sets: 3, reps: '10 - 12', rest: '60 seg', machine_target: 'Banco Predicador', notes: 'Extensión controlada sin bloquear articulación.' },
          { id: 'e12', name: 'Extensiones de Tríceps en Polea Alta', sets: 3, reps: '12 - 15', rest: '60 seg', machine_target: 'Cuerda Tríceps Torre A', notes: 'Abrir la cuerda al final de la extensión.' },
        ]
      },
      {
        day_name: 'Día 4',
        title: 'Pierna: Isquiosurales & Espalda Baja',
        focus: 'Cadena posterior y estabilidad',
        exercises: [
          { id: 'e13', name: 'Peso Muerto Rumano', sets: 4, reps: '8 - 10', rest: '120 seg', machine_target: 'Barra Olímpica', notes: 'Bisagra de cadera manteniendo espalda neutra.' },
          { id: 'e14', name: 'Curl Femoral Tumbado', sets: 4, reps: '10 - 12', rest: '75 seg', machine_target: 'Máquina Femoral Tumbado', notes: 'Apretar glúteos contra el banco.' },
          { id: 'e15', name: 'Hip Thrust con Barra', sets: 3, reps: '10 - 12', rest: '90 seg', machine_target: 'Banco Hip Thrust con Pad', notes: 'Mantener barbilla pegada al pecho al subir.' },
        ]
      }
    ]
  },
  'perdida_grasa': {
    id: 'rout-2',
    member_id: 'ZC-1002',
    title: 'Definición Metabólica & Acondicionamiento',
    goal: 'perdida_grasa',
    difficulty: 'Intermedio',
    coach_name: 'Coach Marcos Rios',
    updated_at: '2026-08-05',
    days: [
      {
        day_name: 'Día 1',
        title: 'Full Body Push + Intervalos HIIT',
        focus: 'Gasto calórico elevado y preservación muscular',
        exercises: [
          { id: 'f1', name: 'Sentadilla Goblet con Mancuerna', sets: 4, reps: '12 - 15', rest: '45 seg', machine_target: 'Zona Funcional', notes: 'Ritmo dinámico sin perder técnica.' },
          { id: 'f2', name: 'Press Pecho en Máquina Convergente', sets: 4, reps: '12 - 15', rest: '45 seg', machine_target: 'Chest Press Matrix', notes: 'Movimiento fluido y constante.' },
          { id: 'f3', name: 'Paso de Granjero con Mancuernas', sets: 3, reps: '40 metros', rest: '60 seg', machine_target: 'Pista de Césped Sintético', notes: 'Mantener postura erguida y abdomen firme.' },
          { id: 'f4', name: 'Remo en Concept2 / AirBike', sets: 5, reps: '30s max / 30s descanso', rest: '30 seg', machine_target: 'Cardio Box #4', notes: 'Máxima potencia cardiovascular.' },
        ]
      },
      {
        day_name: 'Día 2',
        title: 'Full Body Pull & Core',
        focus: 'Espalda, bíceps y aceleración metabólica',
        exercises: [
          { id: 'f5', name: 'Jalón en Polea al Pecho', sets: 4, reps: '12 - 15', rest: '45 seg', machine_target: 'Polea Alta', notes: 'Conexión mente-músculo en dorsales.' },
          { id: 'f6', name: 'Prensa Inclinada a Repeticiones Altas', sets: 4, reps: '15 - 20', rest: '60 seg', machine_target: 'Prensa 45°', notes: 'Tensión constante en piernas.' },
          { id: 'f7', name: 'Plancha Abdominal con Toque de Hombros', sets: 3, reps: '16 toques', rest: '45 seg', machine_target: 'Colchoneta', notes: 'Cadera estable sin rotar.' },
        ]
      }
    ]
  },
  'mantenimiento': {
    id: 'rout-3',
    member_id: 'ZC-1004',
    title: 'Tonificación y Fuerza Funcional',
    goal: 'mantenimiento',
    difficulty: 'Intermedio',
    coach_name: 'Coach Valeria Mendez',
    updated_at: '2026-08-08',
    days: [
      {
        day_name: 'Día 1',
        title: 'Fuerza General y Movilidad',
        focus: 'Salud articular y mantenimiento',
        exercises: [
          { id: 'm1', name: 'Prensa de Piernas', sets: 3, reps: '12', rest: '60 seg', machine_target: 'Prensa 45°', notes: 'Movimiento limpio.' },
          { id: 'm2', name: 'Remo Sentado en Polea', sets: 3, reps: '12', rest: '60 seg', machine_target: 'Remo Bajo', notes: 'Control postural.' },
          { id: 'm3', name: 'Press de Hombros con Mancuernas', sets: 3, reps: '12', rest: '60 seg', machine_target: 'Mancuernas', notes: 'Empuje vertical firme.' },
        ]
      }
    ]
  },
  'salud_general': {
    id: 'rout-4',
    member_id: 'ZC-1003',
    title: 'Acondicionamiento Físico Integral & Longevidad',
    goal: 'salud_general',
    difficulty: 'Principiante',
    coach_name: 'Coach Marcos Rios',
    updated_at: '2026-08-02',
    days: [
      {
        day_name: 'Día 1',
        title: 'Fuerza Base & Movilidad Articular',
        focus: 'Activación muscular completa sin sobrecargas',
        exercises: [
          { id: 's1', name: 'Sentadilla en Caja o Silla', sets: 3, reps: '10 - 12', rest: '60 seg', machine_target: 'Caja Pliométrica 45cm', notes: 'Aprender el patrón de movimiento básico.' },
          { id: 's2', name: 'Remo en Máquina Asistida', sets: 3, reps: '12', rest: '60 seg', machine_target: 'Máquina Remo Sentado', notes: 'Cuidar cuello y hombros relajados.' },
          { id: 's3', name: 'Caminata Inclinada en Cinta', sets: 1, reps: '20 min', rest: '-', machine_target: 'Caminadora #5 (Inclinación 5-8%)', notes: 'Mantener pulso en zona 2 (quema grasa suave).' },
        ]
      }
    ]
  }
};

const SAMPLE_LEADERBOARD: LeaderboardMember[] = [
  { id: 'ZC-1005', name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250&h=250', checkins_month: 24, streak_days: 18, goal: 'hipertrofia', age: 29, rank: 1 },
  { id: 'ZC-1001', name: 'Carlos Mendoza', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250', checkins_month: 22, streak_days: 14, goal: 'hipertrofia', age: 27, rank: 2 },
  { id: 'ZC-1002', name: 'Elia Hernandez', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250&h=250', checkins_month: 20, streak_days: 11, goal: 'perdida_grasa', age: 24, rank: 3 },
  { id: 'ZC-1004', name: 'Elena Rodriguez', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=250&h=250', checkins_month: 16, streak_days: 6, goal: 'mantenimiento', age: 31, rank: 4 },
  { id: 'ZC-1003', name: 'Maria Lopez', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250&h=250', checkins_month: 12, streak_days: 3, goal: 'salud_general', age: 37, rank: 5 },
  { id: 'ZC-1006', name: 'Roberto Valdés', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250', checkins_month: 11, streak_days: 2, goal: 'perdida_grasa', age: 44, rank: 6 },
  { id: 'ZC-1007', name: 'Diego Santillán', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250', checkins_month: 19, streak_days: 9, goal: 'hipertrofia', age: 22, rank: 7 },
  { id: 'ZC-1008', name: 'Ana Sofía Garza', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250&h=250', checkins_month: 15, streak_days: 5, goal: 'perdida_grasa', age: 23, rank: 8 },
  { id: 'ZC-1009', name: 'Fernando Ortiz', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250', checkins_month: 14, streak_days: 4, goal: 'salud_general', age: 39, rank: 9 },
];

export const memberPortalService = {
  // Get biometrics history for a member
  getBiometricsHistory(memberId: string): MemberBiometricsRecord[] {
    try {
      const data = localStorage.getItem(BIOMETRICS_STORAGE_KEY);
      const store: Record<string, MemberBiometricsRecord[]> = data ? JSON.parse(data) : INITIAL_BIOMETRICS;
      if (!data) {
        localStorage.setItem(BIOMETRICS_STORAGE_KEY, JSON.stringify(INITIAL_BIOMETRICS));
      }
      return store[memberId] || [
        {
          id: `bio-def-${memberId}`,
          member_id: memberId,
          staff_name: 'Coach de Turno',
          weight: 75.0,
          body_fat_percentage: 20.0,
          muscle_mass_kg: 35.0,
          notes: 'Medición base registrada en sistema.',
          measured_at: '2026-08-01'
        }
      ];
    } catch {
      return INITIAL_BIOMETRICS[memberId] || [];
    }
  },

  // Get routine plan by member goal
  getRoutinePlan(member: BiometricMember): RoutinePlan {
    const goal = member.fitnessGoal || 'salud_general';
    const plan = SAMPLE_ROUTINES[goal] || SAMPLE_ROUTINES['salud_general'];
    return {
      ...plan,
      member_id: member.id
    };
  },

  // Get leaderboard with age brackets and goals
  getLeaderboard(filterAge: 'all' | '<25' | '25-35' | '36+', filterGoal: 'all' | FitnessGoal): LeaderboardMember[] {
    return SAMPLE_LEADERBOARD.filter(item => {
      // Age filter
      let matchAge = true;
      if (filterAge === '<25') matchAge = item.age < 25;
      else if (filterAge === '25-35') matchAge = item.age >= 25 && item.age <= 35;
      else if (filterAge === '36+') matchAge = item.age >= 36;

      // Goal filter
      const matchGoal = filterGoal === 'all' || item.goal === filterGoal;

      return matchAge && matchGoal;
    }).sort((a, b) => b.checkins_month - a.checkins_month)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }
};
