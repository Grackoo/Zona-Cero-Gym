import { GymMachine, RoutinePlan, FitnessGoal } from '../types';
import { supabase } from './supabase';

const STORAGE_MACHINES_KEY = 'zona_cero_gym_machines_v1';
const STORAGE_ROUTINES_KEY = 'zona_cero_member_routines_v1';

export const INITIAL_MACHINES: GymMachine[] = [
  {
    id: 'm-101',
    name: 'Prensa Inclinada 45° Plate-Loaded',
    code: 'LEG-01',
    category: 'Pierna',
    zone: 'Zona de Fuerza Pesada',
    status: 'Disponible',
    target_muscles: ['Cuádriceps', 'Glúteo Mayor', 'Isquiotibiales'],
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=350',
    notes: 'Capacidad hasta 600kg en discos olímpicos. Revisar pernos de seguridad.'
  },
  {
    id: 'm-102',
    name: 'Hack Squat Hammer Strength',
    code: 'LEG-02',
    category: 'Pierna',
    zone: 'Zona de Fuerza Pesada',
    status: 'Disponible',
    target_muscles: ['Cuádriceps', 'Glúteo', 'Vasto Medial'],
    image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=350',
    notes: 'Base angular de 35°. Ideal para sentadilla profunda controlada.'
  },
  {
    id: 'm-103',
    name: 'Máquina Extensión de Cuádriceps Matrix',
    code: 'LEG-03',
    category: 'Pierna',
    zone: 'Aislamiento Tren Inferior',
    status: 'Disponible',
    target_muscles: ['Cuádriceps', 'Recto Femoral'],
    image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=350',
    notes: 'Pila de placas hasta 115kg. Ajuste de respaldo neumático.'
  },
  {
    id: 'm-104',
    name: 'Curl Femoral Tumbado / Acostado',
    code: 'LEG-04',
    category: 'Pierna',
    zone: 'Aislamiento Tren Inferior',
    status: 'Disponible',
    target_muscles: ['Isquiosurales', 'Bíceps Femoral'],
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=350',
    notes: 'Rodillo acolchado auto-alineable.'
  },
  {
    id: 'm-105',
    name: 'Press Pecho Convergente Inclinado Hammer',
    code: 'CHE-01',
    category: 'Pecho',
    zone: 'Torso & Fuerza',
    status: 'Disponible',
    target_muscles: ['Pectoral Superior (Clavicular)', 'Deltoides Anterior'],
    image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=350',
    notes: 'Brazos independientes para balance muscular simétrico.'
  },
  {
    id: 'm-106',
    name: 'Banca Olímpica Plana Eleiko #1',
    code: 'CHE-02',
    category: 'Pecho',
    zone: 'Zona de Pesos Libres',
    status: 'Disponible',
    target_muscles: ['Pectoral Mayor', 'Tríceps', 'Deltoides'],
    image_url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&q=80&w=350',
    notes: 'Barra olímpica de 20kg y seguros de resorte incluidos.'
  },
  {
    id: 'm-107',
    name: 'Torre de Polea Alta / Jalón Dorsal',
    code: 'PUL-01',
    category: 'Espalda',
    zone: 'Torres de Poleas & Cables',
    status: 'Disponible',
    target_muscles: ['Dorsal Ancho', 'Redondo Mayor', 'Bíceps'],
    image_url: 'https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&q=80&w=350',
    notes: 'Incluye agarradera ancha, agarre neutro y cuerda.'
  },
  {
    id: 'm-108',
    name: 'Remo con Barra T / T-Bar Row Plate Loaded',
    code: 'PUL-02',
    category: 'Espalda',
    zone: 'Espalda & Tracción',
    status: 'Disponible',
    target_muscles: ['Dorsal Medio', 'Romboides', 'Trapecio'],
    image_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=350',
    notes: 'Plataforma antideslizante con doble soporte de empuñadura.'
  },
  {
    id: 'm-109',
    name: 'Doble Polea Cruzada Ajustable (Cable Crossover)',
    code: 'CAB-01',
    category: 'Hombro / Brazo',
    zone: 'Torres de Poleas & Cables',
    status: 'Disponible',
    target_muscles: ['Hombros (Laterales)', 'Pectoral', 'Tríceps', 'Bíceps'],
    image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=350',
    notes: 'Regulación de altura en 20 posiciones.'
  },
  {
    id: 'm-110',
    name: 'Banco Predicador Scott con Barra Z',
    code: 'ARM-01',
    category: 'Hombro / Brazo',
    zone: 'Aislamiento de Brazos',
    status: 'Disponible',
    target_muscles: ['Bíceps Braquial', 'Braquiorradial'],
    image_url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&q=80&w=350',
    notes: 'Tapizado de alta densidad para soporte de codos.'
  },
  {
    id: 'm-111',
    name: 'Caminadora Comercial Matrix T70',
    code: 'CAR-01',
    category: 'Cardio',
    zone: 'Cardio Box Principal',
    status: 'Disponible',
    target_muscles: ['Sistema Cardiovascular', 'Piernas'],
    image_url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&q=80&w=350',
    notes: 'Inclinación de 0% a 15%, velocidad hasta 20 km/h con medidor de pulso.'
  },
  {
    id: 'm-112',
    name: 'Remo de Aire Concept2 & AirBike Rogue',
    code: 'CAR-02',
    category: 'Cardio',
    zone: 'Zona Funcional & HIIT',
    status: 'Disponible',
    target_muscles: ['Cuerpo Completo', 'Capacidad Aeróbica'],
    image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=350',
    notes: 'Monitor digital de vatios, calorías y distancia.'
  }
];

export const INITIAL_ROUTINES: Record<string, RoutinePlan> = {
  'hipertrofia': {
    id: 'rout-101',
    member_id: 'a1111111-1111-1111-1111-111111111101', // Carlos Mendoza
    title: 'Hipertrofia & Fuerza Pro (Zona Cero)',
    goal: 'hipertrofia',
    difficulty: 'Avanzado',
    coach_name: 'Coach Valeria Mendez',
    updated_at: '2026-08-20',
    days: [
      {
        day_name: 'Día 1',
        title: 'Torso: Pecho, Espalda & Hombro',
        focus: 'Fuerza e hipertrofia superior',
        exercises: [
          { id: 'e1', name: 'Press Banca Plano con Barra', sets: 4, reps: '8 - 10', rest: '90 seg', machine_target: 'Banca Olímpica Eleiko #1 (CHE-02)', notes: 'RPE 8. Controlar la fase excéntrica 2 seg.' },
          { id: 'e2', name: 'Remo con Barra T', sets: 4, reps: '10 - 12', rest: '90 seg', machine_target: 'Remo T-Bar Plate Loaded (PUL-02)', notes: 'Retracción escapular completa al final del recorrido.' },
          { id: 'e3', name: 'Press Inclinado Convergente', sets: 3, reps: '10 - 12', rest: '75 seg', machine_target: 'Press Pecho Convergente Hammer (CHE-01)', notes: 'Enfoque en porción clavicular.' },
          { id: 'e4', name: 'Jalón al Pecho Agarre Neutro', sets: 3, reps: '12 - 15', rest: '60 seg', machine_target: 'Torre de Polea Alta (PUL-01)', notes: 'Drop set en la última serie.' },
          { id: 'e5', name: 'Elevaciones Laterales en Polea', sets: 4, reps: '15', rest: '45 seg', machine_target: 'Doble Polea Cruzada (CAB-01)', notes: 'Mantener tensión continua.' }
        ]
      },
      {
        day_name: 'Día 2',
        title: 'Pierna: Enfoque Cuádriceps & Glúteo',
        focus: 'Potencia y volumen de tren inferior',
        exercises: [
          { id: 'e6', name: 'Sentadilla Hack Profunda', sets: 4, reps: '6 - 8', rest: '120 seg', machine_target: 'Hack Squat Hammer Strength (LEG-02)', notes: 'Bajar hasta romper paralelo con talones bien apoyados.' },
          { id: 'e7', name: 'Prensa Inclinada 45°', sets: 4, reps: '10 - 12', rest: '90 seg', machine_target: 'Prensa Inclinada 45° (LEG-01)', notes: 'Pies a la anchura de hombros en posición media.' },
          { id: 'e8', name: 'Extensión de Cuádriceps con Pausa', sets: 3, reps: '12 - 15', rest: '60 seg', machine_target: 'Extensión de Cuádriceps Matrix (LEG-03)', notes: 'Pausa de 1 segundo arriba en contracción máxima.' },
          { id: 'e9', name: 'Curl Femoral Tumbado', sets: 4, reps: '10 - 12', rest: '75 seg', machine_target: 'Curl Femoral Tumbado (LEG-04)', notes: 'Control excéntrico de 3 segundos.' }
        ]
      },
      {
        day_name: 'Día 3',
        title: 'Brazos & Aislamiento Metabólico',
        focus: 'Densidad y congestión en bíceps/tríceps',
        exercises: [
          { id: 'e10', name: 'Curl de Bíceps en Banco Scott', sets: 4, reps: '10 - 12', rest: '60 seg', machine_target: 'Banco Predicador Scott (ARM-01)', notes: 'Extensión completa sin balanceo.' },
          { id: 'e11', name: 'Extensiones de Tríceps en Polea Alta', sets: 4, reps: '12 - 15', rest: '60 seg', machine_target: 'Doble Polea Cruzada (CAB-01)', notes: 'Abrir cuerda al final.' }
        ]
      }
    ]
  },
  'perdida_grasa': {
    id: 'rout-102',
    member_id: 'a1111111-1111-1111-1111-111111111102', // Elia Hernandez
    title: 'Definición Metabólica & Acondicionamiento',
    goal: 'perdida_grasa',
    difficulty: 'Intermedio',
    coach_name: 'Coach Marcos Rios',
    updated_at: '2026-08-22',
    days: [
      {
        day_name: 'Día 1',
        title: 'Full Body Push + Intervalos HIIT',
        focus: 'Gasto calórico elevado y preservación muscular',
        exercises: [
          { id: 'f1', name: 'Prensa Inclinada 45° a Reps Altas', sets: 4, reps: '15 - 20', rest: '45 seg', machine_target: 'Prensa Inclinada 45° (LEG-01)', notes: 'Ritmo dinámico sin perder técnica.' },
          { id: 'f2', name: 'Press Pecho Convergente', sets: 4, reps: '12 - 15', rest: '45 seg', machine_target: 'Press Pecho Convergente Hammer (CHE-01)', notes: 'Movimiento fluido.' },
          { id: 'f3', name: 'Intervalos en Remo Concept2', sets: 6, reps: '30s max / 30s relax', rest: '30 seg', machine_target: 'Remo de Aire Concept2 (CAR-02)', notes: 'Máxima potencia de remada.' },
          { id: 'f4', name: 'Caminata Inclinada Quema Grasa', sets: 1, reps: '20 min', rest: '-', machine_target: 'Caminadora Matrix T70 (CAR-01)', notes: 'Inclinación 8%, velocidad 5.5 km/h.' }
        ]
      },
      {
        day_name: 'Día 2',
        title: 'Full Body Pull & Cadena Posterior',
        focus: 'Espalda, isquios y gasto metabólico',
        exercises: [
          { id: 'f5', name: 'Jalón en Polea al Pecho', sets: 4, reps: '12 - 15', rest: '45 seg', machine_target: 'Torre de Polea Alta (PUL-01)', notes: 'Conexión mente-músculo.' },
          { id: 'f6', name: 'Curl Femoral Tumbado', sets: 4, reps: '12 - 15', rest: '45 seg', machine_target: 'Curl Femoral Tumbado (LEG-04)', notes: 'Apretar glúteos contra el banco.' }
        ]
      }
    ]
  }
};

export const gymEquipmentService = {
  // Get all machines
  getMachines(): GymMachine[] {
    try {
      const data = localStorage.getItem(STORAGE_MACHINES_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_MACHINES_KEY, JSON.stringify(INITIAL_MACHINES));
        return INITIAL_MACHINES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_MACHINES;
    }
  },

  // Add new gym machine
  addMachine(machine: Omit<GymMachine, 'id'> & { id?: string }): GymMachine {
    const machines = this.getMachines();
    const newMachine: GymMachine = {
      ...machine,
      id: machine.id || `m-${Date.now()}`
    };

    const updated = [newMachine, ...machines];
    localStorage.setItem(STORAGE_MACHINES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('zona_cero_machines_updated'));
    return newMachine;
  },

  // Update existing machine
  updateMachine(id: string, updates: Partial<GymMachine>): void {
    const machines = this.getMachines();
    const updated = machines.map(m => m.id === id ? { ...m, ...updates } : m);
    localStorage.setItem(STORAGE_MACHINES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('zona_cero_machines_updated'));
  },

  // Delete machine
  deleteMachine(id: string): void {
    const machines = this.getMachines();
    const updated = machines.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_MACHINES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('zona_cero_machines_updated'));
  },

  // Get all routines map (memberId -> RoutinePlan)
  getRoutinesMap(): Record<string, RoutinePlan> {
    try {
      const data = localStorage.getItem(STORAGE_ROUTINES_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_ROUTINES_KEY, JSON.stringify(INITIAL_ROUTINES));
        return INITIAL_ROUTINES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ROUTINES;
    }
  },

  // Get specific routine for a member (or fallback to template for their goal)
  getRoutineForMember(memberId: string, fallbackGoal: FitnessGoal = 'salud_general'): RoutinePlan {
    const routines = this.getRoutinesMap();
    if (routines[memberId]) {
      return routines[memberId];
    }
    // Check if there is a template by goal
    if (routines[fallbackGoal]) {
      return {
        ...routines[fallbackGoal],
        member_id: memberId
      };
    }
    return {
      id: `rout-${memberId}`,
      member_id: memberId,
      title: 'Plan de Acondicionamiento Base',
      goal: fallbackGoal,
      difficulty: 'Principiante',
      coach_name: 'Coach de Turno',
      updated_at: new Date().toISOString().split('T')[0],
      days: [
        {
          day_name: 'Día 1',
          title: 'Full Body & Movilidad',
          focus: 'Adaptación general con máquinas base',
          exercises: [
            { id: 'e-base-1', name: 'Prensa Inclinada 45°', sets: 3, reps: '12', rest: '60 seg', machine_target: 'Prensa Inclinada 45° (LEG-01)', notes: 'Movimiento controlado.' },
            { id: 'e-base-2', name: 'Jalón en Polea Alta', sets: 3, reps: '12', rest: '60 seg', machine_target: 'Torre de Polea Alta (PUL-01)', notes: 'Tronco firme.' },
            { id: 'e-base-3', name: 'Caminata en Cinta', sets: 1, reps: '15 min', rest: '-', machine_target: 'Caminadora Matrix T70 (CAR-01)', notes: 'Calentamiento y quema suave.' }
          ]
        }
      ]
    };
  },

  // Save or assign a routine to a member
  saveRoutine(routine: RoutinePlan): void {
    const routines = this.getRoutinesMap();
    const updated = {
      ...routines,
      [routine.member_id]: {
        ...routine,
        updated_at: new Date().toISOString().split('T')[0]
      }
    };
    localStorage.setItem(STORAGE_ROUTINES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('zona_cero_routines_updated', { detail: { routine } }));
  },

  // Delete routine
  deleteRoutine(memberId: string): void {
    const routines = this.getRoutinesMap();
    const updated = { ...routines };
    delete updated[memberId];
    localStorage.setItem(STORAGE_ROUTINES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('zona_cero_routines_updated'));
  }
};
