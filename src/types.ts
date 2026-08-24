export type FitnessGoal = 'perdida_grasa' | 'hipertrofia' | 'mantenimiento' | 'salud_general';

export interface Member {
  id: string;
  full_name: string;
  member_id: string;
  plan_type: string;
  status: 'Active' | 'Overdue' | 'Frozen' | 'Activo' | 'Vencido' | 'Congelado';
  last_visit: string;
  avatar_url?: string;
  phone?: string;
  access_token?: string;
  member_pin?: string;
  birth_date?: string;
  fitness_goal?: FitnessGoal;
}

export interface GymMachine {
  id: string;
  name: string;
  code: string;
  category: 'Pierna' | 'Pecho' | 'Espalda' | 'Hombro / Brazo' | 'Cardio' | 'Funcional / Core';
  zone: string;
  status: 'Disponible' | 'En Mantenimiento' | 'Fuera de Servicio';
  target_muscles: string[];
  image_url?: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  image_url?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: string;
  avatar_url?: string;
}

export interface MemberWallet {
  id?: string;
  member_id: string;
  balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface WalletTransaction {
  id: string;
  member_id: string;
  amount: number;
  type: 'checkin_reward' | 'pos_redemption' | 'manual_adjustment';
  description: string;
  created_at: string;
}

export interface MemberBiometricsRecord {
  id: string;
  member_id: string;
  staff_id?: string;
  staff_name?: string;
  weight: number; // kg
  body_fat_percentage?: number; // %
  muscle_mass_kg?: number; // kg
  notes?: string;
  measured_at: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  machine_target?: string;
  notes?: string;
}

export interface WorkoutDay {
  day_name: string;
  title: string;
  focus: string;
  exercises: ExerciseItem[];
}

export interface RoutinePlan {
  id: string;
  member_id: string;
  title: string;
  goal: FitnessGoal;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  coach_name: string;
  updated_at: string;
  days: WorkoutDay[];
}

export interface LeaderboardMember {
  id: string;
  name: string;
  avatar: string;
  checkins_month: number;
  streak_days: number;
  goal: FitnessGoal;
  age: number;
  rank: number;
}
