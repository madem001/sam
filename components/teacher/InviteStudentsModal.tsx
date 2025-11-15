import React, { useState } from 'react';
import { User } from '../../types';

interface InviteStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: User[];
  onInvite: (studentIds: string[]) => void;
  battleName: string;
}

const InviteStudentsModal: React.FC<InviteStudentsModalProps> = ({ isOpen, onClose, students, onInvite, battleName }) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleToggleStudent = (studentId: string) => {
    const newSet = new Set(selectedStudentIds);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudentIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.size === students.length) {
        setSelectedStudentIds(new Set()); // Deselect all
    } else {
        setSelectedStudentIds(new Set(students.map(s => s.id))); // Select all
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInvite(Array.from(selectedStudentIds));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ animationDuration: '0.3s' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-slide-up" style={{ animationDuration: '0.4s' }}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-slate-800">Invitar a "{battleName}"</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
            <ion-icon name="close-outline" class="text-2xl"></ion-icon>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-4 space-y-4">
            <div className="flex justify-between items-center px-2">
                <p className="text-sm font-semibold text-slate-600">{selectedStudentIds.size} de {students.length} seleccionados</p>
                <button type="button" onClick={handleSelectAll} className="text-sm font-semibold text-sky-600 hover:underline">
                    {selectedStudentIds.size === students.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-2 bg-slate-50">
              {students.map(student => (
                <label key={student.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-slate-100 transition-colors has-[:checked]:bg-sky-50 has-[:checked]:border-sky-300 border-2 border-transparent">
                  <input 
                    type="checkbox" 
                    checked={selectedStudentIds.has(student.id)} 
                    onChange={() => handleToggleStudent(student.id)} 
                    className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <img src={student.imageUrl} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                  <span className="font-medium text-slate-700">{student.name}</span>
                </label>
              ))}
            </div>
        </form>

        <div className="p-4 border-t bg-slate-50/70">
            <button 
              type="submit"
              onClick={handleSubmit}
              disabled={selectedStudentIds.size === 0}
              className="w-full py-3 rounded-lg bg-sky-500 text-white font-bold shadow-md hover:bg-sky-600 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Enviar {selectedStudentIds.size > 0 ? selectedStudentIds.size : ''} Invitacion(es)
            </button>
        </div>
      </div>
    </div>
  );
};

export default InviteStudentsModal;