import React, { useState, useEffect } from 'react';
import { GymMachine } from '../types';
import { gymEquipmentService } from '../lib/gymEquipmentService';
import { X, Dumbbell, MapPin, Tag, Wrench, CheckCircle2 } from 'lucide-react';

interface MachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineToEdit?: GymMachine | null;
  onSaved: (machine: GymMachine) => void;
}

const CATEGORIES: GymMachine['category'][] = [
  'Pierna',
  'Pecho',
  'Espalda',
  'Hombro / Brazo',
  'Cardio',
  'Funcional / Core'
];

const COMMON_ZONES = [
  'Zona de Fuerza Pesada',
  'Torres de Poleas & Cables',
  'Aislamiento Tren Inferior',
  'Torso & Fuerza',
  'Zona de Pesos Libres',
  'Aislamiento de Brazos',
  'Cardio Box Principal',
  'Zona Funcional & HIIT'
];

export const MachineModal: React.FC<MachineModalProps> = ({
  isOpen,
  onClose,
  machineToEdit,
  onSaved
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<GymMachine['category']>('Pierna');
  const [zone, setZone] = useState('Zona de Fuerza Pesada');
  const [status, setStatus] = useState<GymMachine['status']>('Disponible');
  const [targetMuscles, setTargetMuscles] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (machineToEdit) {
      setName(machineToEdit.name);
      setCode(machineToEdit.code);
      setCategory(machineToEdit.category);
      setZone(machineToEdit.zone);
      setStatus(machineToEdit.status);
      setTargetMuscles(machineToEdit.target_muscles.join(', '));
      setImageUrl(machineToEdit.image_url || '');
      setNotes(machineToEdit.notes || '');
    } else {
      setName('');
      setCode(`MAQ-${Math.floor(10 + Math.random() * 90)}`);
      setCategory('Pierna');
      setZone('Zona de Fuerza Pesada');
      setStatus('Disponible');
      setTargetMuscles('');
      setImageUrl('');
      setNotes('');
    }
  }, [machineToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const musclesArray = targetMuscles
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);

    const fallbackImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=350';

    if (machineToEdit) {
      const updated: Partial<GymMachine> = {
        name,
        code: code.trim().toUpperCase(),
        category,
        zone,
        status,
        target_muscles: musclesArray.length > 0 ? musclesArray : ['Músculo General'],
        image_url: fallbackImage,
        notes
      };
      gymEquipmentService.updateMachine(machineToEdit.id, updated);
      onSaved({ ...machineToEdit, ...updated } as GymMachine);
    } else {
      const newMachine = gymEquipmentService.addMachine({
        name,
        code: code.trim().toUpperCase() || `MAQ-${Date.now().toString().slice(-3)}`,
        category,
        zone,
        status,
        target_muscles: musclesArray.length > 0 ? musclesArray : ['Músculo General'],
        image_url: fallbackImage,
        notes
      });
      onSaved(newMachine);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-cero-panel border border-cero-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-cero-border bg-[#10161c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cero-lime/10 border border-cero-lime/20 text-cero-lime rounded-xl">
              <Dumbbell size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {machineToEdit ? 'Editar Máquina del Gimnasio' : 'Añadir Nueva Máquina al Gimnasio'}
              </h3>
              <p className="text-xs text-cero-text-muted">
                Registra el equipamiento para vincularlo a las rutinas de los miembros.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1">
                Nombre de la Máquina *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Prensa Inclinada 45° Hammer"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#10161c] border border-cero-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cero-lime"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1">
                Código / ID *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. LEG-01"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-[#10161c] border border-cero-border rounded-xl px-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-cero-lime"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1">
                Categoría Muscular
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full bg-[#10161c] border border-cero-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cero-lime"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1">
                Estado Operativo
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-[#10161c] border border-cero-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cero-lime"
              >
                <option value="Disponible">Disponible (En Servicio)</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1">
              Zona / Ubicación en el Gimnasio
            </label>
            <input
              type="text"
              list="zones-list"
              placeholder="Ej. Zona de Fuerza Pesada"
              value={zone}
              onChange={e => setZone(e.target.value)}
              className="w-full bg-[#10161c] border border-cero-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cero-lime"
            />
            <datalist id="zones-list">
              {COMMON_ZONES.map(z => (
                <option key={z} value={z} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1">
              Músculos Principales (separados por coma)
            </label>
            <input
              type="text"
              placeholder="Ej. Cuádriceps, Glúteo Mayor, Isquiotibiales"
              value={targetMuscles}
              onChange={e => setTargetMuscles(e.target.value)}
              className="w-full bg-[#10161c] border border-cero-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cero-lime"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1">
              URL de Imagen (Opcional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="w-full bg-[#10161c] border border-cero-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cero-lime"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-cero-text-muted uppercase mb-1">
              Notas Técnicas / Instrucciones de Carga
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Capacidad máxima 400kg. Ajustar seguro antes de comenzar."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#10161c] border border-cero-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cero-lime"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-cero-border flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-cero-border text-sm font-semibold text-gray-300 hover:bg-[#1e293b] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cero-lime text-black font-bold text-sm hover:bg-cero-lime-hover transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <CheckCircle2 size={16} />
              {machineToEdit ? 'Guardar Cambios' : 'Registrar Máquina'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
