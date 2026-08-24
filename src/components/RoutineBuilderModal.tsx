import React, { useState, useEffect } from 'react';
import { RoutinePlan, WorkoutDay, ExerciseItem, FitnessGoal, GymMachine } from '../types';
import { biometricsStore, BiometricMember } from '../lib/biometricsStore';
import { gymEquipmentService } from '../lib/gymEquipmentService';
import {
  X,
  Dumbbell,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  User,
  Calendar,
  Layers,
  Award,
  ChevronDown
} from 'lucide-react';

interface RoutineBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMember?: BiometricMember | null;
  onSaved: (routine: RoutinePlan) => void;
}

export const RoutineBuilderModal: React.FC<RoutineBuilderModalProps> = ({
  isOpen,
  onClose,
  targetMember,
  onSaved
}) => {
  const [members, setMembers] = useState<BiometricMember[]>([]);
  const [machines, setMachines] = useState<GymMachine[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  // Routine Form Fields
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState<FitnessGoal>('hipertrofia');
  const [difficulty, setDifficulty] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [coachName, setCoachName] = useState('Coach Valeria Mendez');
  const [days, setDays] = useState<WorkoutDay[]>([]);

  useEffect(() => {
    if (isOpen) {
      const allMembers = biometricsStore.getMembers();
      const allMachines = gymEquipmentService.getMachines();
      setMembers(allMembers);
      setMachines(allMachines);

      const activeMemberId = targetMember?.id || (allMembers.length > 0 ? allMembers[0].id : '');
      setSelectedMemberId(activeMemberId);

      const activeMember = allMembers.find(m => m.id === activeMemberId);
      const memberGoal = activeMember?.fitnessGoal || 'salud_general';
      const existingRoutine = gymEquipmentService.getRoutineForMember(activeMemberId, memberGoal);

      setTitle(existingRoutine.title || `Rutina Personalizada - ${activeMember?.fullName.split(' ')[0] || 'Miembro'}`);
      setGoal(existingRoutine.goal || memberGoal);
      setDifficulty(existingRoutine.difficulty || 'Intermedio');
      setCoachName(existingRoutine.coach_name || 'Coach Valeria Mendez');
      setDays(JSON.parse(JSON.stringify(existingRoutine.days || [])));
    }
  }, [isOpen, targetMember]);

  // When selected member changes in dropdown
  const handleMemberChange = (memberId: string) => {
    setSelectedMemberId(memberId);
    const member = members.find(m => m.id === memberId);
    if (member) {
      const existing = gymEquipmentService.getRoutineForMember(memberId, member.fitnessGoal);
      setTitle(existing.title || `Rutina - ${member.fullName.split(' ')[0]}`);
      setGoal(existing.goal || member.fitnessGoal);
      setDifficulty(existing.difficulty || 'Intermedio');
      setCoachName(existing.coach_name || 'Coach Valeria Mendez');
      setDays(JSON.parse(JSON.stringify(existing.days || [])));
    }
  };

  // Add a new workout day
  const handleAddDay = () => {
    const dayNumber = days.length + 1;
    const newDay: WorkoutDay = {
      day_name: `Día ${dayNumber}`,
      title: `Sesión ${dayNumber}: Enfoque Principal`,
      focus: 'Fuerza, hipertrofia y control motor',
      exercises: [
        {
          id: `ex-${Date.now()}-1`,
          name: machines[0]?.name || 'Press con Máquina',
          sets: 4,
          reps: '10 - 12',
          rest: '60 seg',
          machine_target: machines[0] ? `${machines[0].name} (${machines[0].code})` : 'Máquina Principal',
          notes: 'Control excéntrico de 2 segundos.'
        }
      ]
    };
    setDays([...days, newDay]);
  };

  // Remove a day
  const handleRemoveDay = (dayIndex: number) => {
    setDays(days.filter((_, i) => i !== dayIndex));
  };

  // Update day title / focus
  const handleUpdateDay = (dayIndex: number, field: 'title' | 'focus' | 'day_name', value: string) => {
    const updated = [...days];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    setDays(updated);
  };

  // Add exercise to a specific day
  const handleAddExercise = (dayIndex: number) => {
    const defaultMachine = machines[0];
    const newExercise: ExerciseItem = {
      id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: defaultMachine?.name || 'Nuevo Ejercicio',
      sets: 3,
      reps: '12',
      rest: '60 seg',
      machine_target: defaultMachine ? `${defaultMachine.name} (${defaultMachine.code})` : 'Máquina Asignada',
      notes: 'Mantener técnica limpia y respiración fluida.'
    };

    const updated = [...days];
    updated[dayIndex].exercises.push(newExercise);
    setDays(updated);
  };

  // Remove exercise from day
  const handleRemoveExercise = (dayIndex: number, exIndex: number) => {
    const updated = [...days];
    updated[dayIndex].exercises = updated[dayIndex].exercises.filter((_, i) => i !== exIndex);
    setDays(updated);
  };

  // Update specific exercise field
  const handleUpdateExercise = (
    dayIndex: number,
    exIndex: number,
    field: keyof ExerciseItem,
    value: any
  ) => {
    const updated = [...days];
    updated[dayIndex].exercises[exIndex] = {
      ...updated[dayIndex].exercises[exIndex],
      [field]: value
    };
    setDays(updated);
  };

  // Handle machine selection dropdown change
  const handleSelectMachineForExercise = (
    dayIndex: number,
    exIndex: number,
    machineId: string
  ) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;

    const updated = [...days];
    const ex = updated[dayIndex].exercises[exIndex];
    ex.machine_target = `${machine.name} (${machine.code})`;
    // Auto populate exercise name if it's generic
    if (ex.name === 'Nuevo Ejercicio' || !ex.name.trim()) {
      ex.name = machine.name;
    }
    setDays(updated);
  };

  if (!isOpen) return null;

  const currentSelectedMember = members.find(m => m.id === selectedMemberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const routinePayload: RoutinePlan = {
      id: `rout-${selectedMemberId}`,
      member_id: selectedMemberId,
      title: title.trim() || 'Rutina Personalizada Zona Cero',
      goal,
      difficulty,
      coach_name: coachName,
      updated_at: new Date().toISOString().split('T')[0],
      days: days.length > 0 ? days : [
        {
          day_name: 'Día 1',
          title: 'Acondicionamiento General',
          focus: 'Fuerza y movilidad base',
          exercises: []
        }
      ]
    };

    gymEquipmentService.saveRoutine(routinePayload);
    onSaved(routinePayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-cero-panel border border-cero-border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="p-6 border-b border-cero-border bg-[#10161c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cero-lime/10 border border-cero-lime/20 text-cero-lime rounded-xl">
              <Dumbbell size={22} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Diseñador de Rutinas & Vinculación de Máquinas
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-cero-lime/10 text-cero-lime border border-cero-lime/20">
                  {machines.length} Máquinas Registradas
                </span>
              </h3>
              <p className="text-xs text-cero-text-muted">
                Construye el plan de entrenamiento personalizado utilizando el equipamiento real del gimnasio.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-cero-text-muted hover:text-white p-2 rounded-lg hover:bg-[#1e293b] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Member Selection and Routine Settings */}
          <div className="bg-[#10161c] border border-cero-border rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Member Selector */}
              <div>
                <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1.5 flex items-center gap-1.5">
                  <User size={13} className="text-cero-lime" />
                  Socio Asignado *
                </label>
                <select
                  value={selectedMemberId}
                  onChange={e => handleMemberChange(e.target.value)}
                  className="w-full bg-cero-bg border border-cero-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cero-lime"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.planType})
                    </option>
                  ))}
                </select>
                {currentSelectedMember && (
                  <p className="text-[11px] text-cero-lime mt-1 font-mono">
                    Meta actual: {currentSelectedMember.fitnessGoal?.replace('_', ' ').toUpperCase()}
                  </p>
                )}
              </div>

              {/* Routine Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-cero-lime" />
                  Título de la Rutina *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Hipertrofia & Fuerza Pro 4 Días"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-cero-bg border border-cero-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cero-lime"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-cero-border/50">
              {/* Goal */}
              <div>
                <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1">
                  Objetivo Fitness
                </label>
                <select
                  value={goal}
                  onChange={e => setGoal(e.target.value as FitnessGoal)}
                  className="w-full bg-cero-bg border border-cero-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cero-lime"
                >
                  <option value="hipertrofia">Hipertrofia & Masa Muscular</option>
                  <option value="perdida_grasa">Pérdida de Grasa & Definición</option>
                  <option value="mantenimiento">Tonificación & Mantenimiento</option>
                  <option value="salud_general">Salud General & Longevidad</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1">
                  Nivel de Dificultad
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full bg-cero-bg border border-cero-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cero-lime"
                >
                  <option value="Principiante">Principiante (Adaptación)</option>
                  <option value="Intermedio">Intermedio (Sobrecarga)</option>
                  <option value="Avanzado">Avanzado (Alto Volumen / Intensidad)</option>
                </select>
              </div>

              {/* Coach */}
              <div>
                <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1">
                  Coach Responsable
                </label>
                <select
                  value={coachName}
                  onChange={e => setCoachName(e.target.value)}
                  className="w-full bg-cero-bg border border-cero-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cero-lime"
                >
                  <option value="Coach Valeria Mendez">Coach Valeria Mendez (Mañana)</option>
                  <option value="Coach Marcos Rios">Coach Marcos Rios (Tarde/Noche)</option>
                  <option value="Staff de Turno Zona Cero">Staff de Turno Zona Cero</option>
                </select>
              </div>
            </div>
          </div>

          {/* Days & Exercises Builder */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-cero-lime" />
                Días de Entrenamiento ({days.length} Días)
              </h4>
              <button
                type="button"
                onClick={handleAddDay}
                className="bg-[#1e293b] hover:bg-[#2d3748] border border-cero-border text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus size={14} className="text-cero-lime" />
                + Añadir Día
              </button>
            </div>

            {days.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-cero-border rounded-2xl text-center text-cero-text-muted space-y-2">
                <Dumbbell size={32} className="mx-auto text-cero-lime opacity-60" />
                <p className="text-sm font-semibold text-white">No hay días agregados a esta rutina.</p>
                <p className="text-xs">Haz clic en "+ Añadir Día" para comenzar a configurar los ejercicios y máquinas.</p>
              </div>
            ) : (
              days.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="bg-[#10161c] border border-cero-border rounded-2xl p-5 space-y-4 shadow-md"
                >
                  {/* Day Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-cero-border/60">
                    <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                      <span className="px-2.5 py-1 rounded-lg bg-cero-lime/10 text-cero-lime border border-cero-lime/20 text-xs font-extrabold font-mono uppercase">
                        {day.day_name || `Día ${dayIndex + 1}`}
                      </span>
                      <input
                        type="text"
                        placeholder="Título del día (Ej. Torso: Pecho & Espalda)"
                        value={day.title}
                        onChange={e => handleUpdateDay(dayIndex, 'title', e.target.value)}
                        className="bg-cero-bg border border-cero-border rounded-xl px-3 py-1.5 text-xs text-white font-bold flex-1 focus:outline-none focus:border-cero-lime"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enfoque (Ej. Fuerza e hipertrofia)"
                        value={day.focus}
                        onChange={e => handleUpdateDay(dayIndex, 'focus', e.target.value)}
                        className="bg-cero-bg border border-cero-border rounded-xl px-3 py-1.5 text-xs text-cero-text-muted w-48 focus:outline-none focus:border-cero-lime"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDay(dayIndex)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar este día de la rutina"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Exercise List for this Day */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-mono text-cero-text-muted uppercase px-2">
                      <div className="col-span-4">Ejercicio</div>
                      <div className="col-span-4">Máquina del Gimnasio Vinculada</div>
                      <div className="col-span-1 text-center">Series</div>
                      <div className="col-span-1 text-center">Reps</div>
                      <div className="col-span-1 text-center">Descanso</div>
                      <div className="col-span-1 text-center">Acción</div>
                    </div>

                    {day.exercises.map((ex, exIndex) => (
                      <div
                        key={ex.id || exIndex}
                        className="grid grid-cols-12 gap-2 items-center bg-cero-bg border border-cero-border/60 rounded-xl p-2.5 hover:border-cero-lime/40 transition-colors"
                      >
                        {/* Exercise Name */}
                        <div className="col-span-4">
                          <input
                            type="text"
                            placeholder="Nombre del Ejercicio"
                            value={ex.name}
                            onChange={e => handleUpdateExercise(dayIndex, exIndex, 'name', e.target.value)}
                            className="w-full bg-[#10161c] border border-cero-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cero-lime font-medium"
                          />
                        </div>

                        {/* Machine Target Selector */}
                        <div className="col-span-4">
                          <select
                            value={machines.find(m => ex.machine_target?.includes(m.code))?.id || ''}
                            onChange={e => handleSelectMachineForExercise(dayIndex, exIndex, e.target.value)}
                            className="w-full bg-[#10161c] border border-cero-border rounded-lg px-2 py-1.5 text-xs text-cero-lime font-mono focus:outline-none focus:border-cero-lime"
                          >
                            <option value="">-- Seleccionar Máquina --</option>
                            {machines.map(m => (
                              <option key={m.id} value={m.id}>
                                [{m.code}] {m.name} ({m.category})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Sets */}
                        <div className="col-span-1">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={ex.sets}
                            onChange={e => handleUpdateExercise(dayIndex, exIndex, 'sets', parseInt(e.target.value) || 1)}
                            className="w-full bg-[#10161c] border border-cero-border rounded-lg py-1.5 text-center text-xs text-white focus:outline-none focus:border-cero-lime font-mono"
                          />
                        </div>

                        {/* Reps */}
                        <div className="col-span-1">
                          <input
                            type="text"
                            placeholder="10-12"
                            value={ex.reps}
                            onChange={e => handleUpdateExercise(dayIndex, exIndex, 'reps', e.target.value)}
                            className="w-full bg-[#10161c] border border-cero-border rounded-lg py-1.5 text-center text-xs text-white focus:outline-none focus:border-cero-lime font-mono"
                          />
                        </div>

                        {/* Rest */}
                        <div className="col-span-1">
                          <input
                            type="text"
                            placeholder="60s"
                            value={ex.rest}
                            onChange={e => handleUpdateExercise(dayIndex, exIndex, 'rest', e.target.value)}
                            className="w-full bg-[#10161c] border border-cero-border rounded-lg py-1.5 text-center text-xs text-white focus:outline-none focus:border-cero-lime font-mono"
                          />
                        </div>

                        {/* Remove Exercise */}
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(dayIndex, exIndex)}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded transition-colors cursor-pointer"
                            title="Quitar ejercicio"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddExercise(dayIndex)}
                      className="w-full py-2 border border-dashed border-cero-border hover:border-cero-lime/60 rounded-xl text-xs font-semibold text-cero-text-muted hover:text-cero-lime transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={13} /> Añadir Ejercicio con Máquina
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-cero-border flex items-center justify-between">
            <p className="text-xs text-cero-text-muted font-mono">
              Se sincronizará en tiempo real con el Portal del Miembro.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-cero-border text-sm font-semibold text-gray-300 hover:bg-[#1e293b] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-cero-lime text-black font-bold text-sm hover:bg-cero-lime-hover transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 size={16} />
                Guardar y Asignar Rutina
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
