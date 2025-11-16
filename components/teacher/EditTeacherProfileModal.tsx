import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface EditTeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedData: {
    name: string;
    imageUrl: string;
    subjects: string[];
    skills: string[];
    cycles: string[];
  }) => void;
}

const EditTeacherProfileModal: React.FC<EditTeacherProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [name, setName] = useState(user.name);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(user.imageUrl);
  const [subjects, setSubjects] = useState<string[]>(user.subjects || []);
  const [skills, setSkills] = useState<string[]>(user.skills || []);
  const [cycles, setCycles] = useState<string[]>(user.cycles || []);
  const [newSubject, setNewSubject] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newCycle, setNewCycle] = useState('');

  useEffect(() => {
    setName(user.name);
    setImagePreview(user.imageUrl);
    setImageFile(null);
    setSubjects(user.subjects || []);
    setSkills(user.skills || []);
    setCycles(user.cycles || []);
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddCycle = () => {
    if (newCycle.trim() && !cycles.includes(newCycle.trim())) {
      setCycles([...cycles, newCycle.trim()]);
      setNewCycle('');
    }
  };

  const handleRemoveCycle = (cycle: string) => {
    setCycles(cycles.filter(c => c !== cycle));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name,
      imageUrl: imagePreview,
      subjects,
      skills,
      cycles,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">Editar Perfil</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2">
            <ion-icon name="close-outline" class="text-3xl"></ion-icon>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <img src={imagePreview} alt="Vista previa" className="w-32 h-32 rounded-3xl object-cover border-4 border-slate-200 shadow-lg" />
            <label htmlFor="profile-picture" className="cursor-pointer bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl">
              Cambiar Foto
            </label>
            <input
              id="profile-picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Nombre</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-gray-900 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Clases que imparte</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                placeholder="Ej: Matemáticas"
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-gray-900 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-xl border border-blue-200 flex items-center gap-2"
                >
                  {subject}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(subject)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ion-icon name="close-circle" class="text-lg"></ion-icon>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Habilidades</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Ej: Gamificación"
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-gray-900 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-br from-green-50 to-green-100 text-green-700 px-4 py-2 rounded-xl border border-green-200 flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <ion-icon name="close-circle" class="text-lg"></ion-icon>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ciclos Académicos</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCycle}
                onChange={(e) => setNewCycle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCycle())}
                placeholder="Ej: 2024-1"
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-gray-900 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleAddCycle}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-all"
              >
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {cycles.map((cycle, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 px-4 py-2 rounded-xl border border-purple-200 flex items-center gap-2"
                >
                  {cycle}
                  <button
                    type="button"
                    onClick={() => handleRemoveCycle(cycle)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <ion-icon name="close-circle" class="text-lg"></ion-icon>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-slate-700 bg-white border-2 border-slate-200 hover:bg-slate-50 font-semibold transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTeacherProfileModal;
