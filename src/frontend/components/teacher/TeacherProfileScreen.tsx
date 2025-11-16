import React, { useState, useEffect } from 'react';
import { User } from '../../types/types';
import EditTeacherProfileModal from './EditTeacherProfileModal';
// import { supabase } from '../../lib/supabase'; // DESHABILITADO - Ver GUIA_CONEXION_BACKEND.md
import { authApi } from '../../lib/api';

interface TeacherProfileScreenProps {
  user: User;
  onLogout: () => void;
}

const TeacherProfileScreen: React.FC<TeacherProfileScreenProps> = ({ user, onLogout }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editableUser, setEditableUser] = useState<User>(user);
  const [unlockPoints, setUnlockPoints] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    loadUnlockPoints();
  }, [user.id]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  const loadUnlockPoints = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('unlock_points')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      setUnlockPoints(data.unlock_points || 100);
    }
  };

  const handleSaveUnlockPoints = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ unlock_points: unlockPoints })
      .eq('id', user.id);

    if (error) {
      alert('Error al guardar');
      console.error(error);
    } else {
      setIsEditing(false);
    }
  };

  const handleSaveProfile = async (updatedData: {
    name: string;
    imageUrl: string;
    subjects: string[];
    skills: string[];
    cycles: string[];
  }) => {
    try {
      await authApi.updateProfile(user.id, {
        name: updatedData.name,
        avatar: updatedData.imageUrl,
        subjects: updatedData.subjects,
        skills: updatedData.skills,
        cycles: updatedData.cycles,
      });
      setEditableUser(prev => ({ ...prev, ...updatedData }));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('❌ Error guardando perfil:', error);
      alert('Error al guardar el perfil');
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden pb-24"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={handleScroll}
      >
        {/* Profile Card - Hero */}
        <div className="mb-4">
          <div className="overflow-visible p-0">
            {/* Profile Image Section with Parallax */}
            <div className="relative h-64 bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden">
              <img
                src={editableUser.imageUrl}
                alt={editableUser.name}
                className="w-full h-full object-cover transition-transform duration-100 ease-out"
                style={{
                  transform: `translateY(${Math.min(scrollY * 0.5, 100)}px) scale(${1 + Math.min(scrollY * 0.001, 0.3)})`,
                  objectPosition: 'center top'
                }}
              />
            </div>

            {/* Profile Info Section with Curved Top */}
            <div className="relative bg-white -mt-10 rounded-t-[3rem] p-5 pt-8 text-center shadow-2xl">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">{editableUser.name}</h1>
              <p className="text-sm text-slate-500 mb-4 flex items-center justify-center">
                <ion-icon name="school-outline" class="text-base mr-1"></ion-icon>
                Docente
              </p>

              {/* Stats Row */}
              <div className="flex justify-around mb-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-2xl font-bold text-slate-800">{editableUser.subjects?.length || 0}</div>
                  <div className="text-xs text-slate-500">Clases</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{editableUser.skills?.length || 0}</div>
                  <div className="text-xs text-slate-500">Habilidades</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{editableUser.cycles?.length || 0}</div>
                  <div className="text-xs text-slate-500">Ciclos</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Editar
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 bg-white border-2 border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 space-y-4">
          {/* Subjects Section */}
          {editableUser.subjects && editableUser.subjects.length > 0 && (
            <div className="glass-card-modern p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center justify-center">
                <ion-icon name="book" class="text-2xl mr-2 text-blue-500"></ion-icon>
                Clases que imparte
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {editableUser.subjects.map((subject, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl border border-blue-200"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {editableUser.skills && editableUser.skills.length > 0 && (
            <div className="glass-card-modern p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center justify-center">
                <ion-icon name="bulb" class="text-2xl mr-2 text-green-500"></ion-icon>
                Habilidades
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {editableUser.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-br from-green-50 to-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-xl border border-green-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cycles Section */}
          {editableUser.cycles && editableUser.cycles.length > 0 && (
            <div className="glass-card-modern p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center justify-center">
                <ion-icon name="calendar" class="text-2xl mr-2 text-purple-500"></ion-icon>
                Ciclos Académicos
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {editableUser.cycles.map((cycle, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 text-sm font-semibold px-4 py-2 rounded-xl border border-purple-200"
                  >
                    {cycle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Card Unlock Configuration */}
          <div className="glass-card-modern p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center justify-center">
              <ion-icon name="card" class="text-2xl mr-2 text-amber-500"></ion-icon>
              Configuración de Tarjeta
            </h3>

            <div className="space-y-4">
              <p className="text-slate-600 text-center text-sm">
                Puntos necesarios para que los estudiantes desbloqueen tu tarjeta de profesor
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 text-center">
                    Puntos Requeridos
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={unlockPoints}
                    onChange={(e) => setUnlockPoints(Number(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-gray-900 outline-none transition-colors disabled:opacity-50 disabled:bg-slate-50 text-center text-lg font-bold"
                  />
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveUnlockPoints}
                        className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          loadUnlockPoints();
                        }}
                        className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-all"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border-2 border-amber-200">
                <ion-icon name="information-circle" class="text-2xl text-amber-600 flex-shrink-0 mt-0.5"></ion-icon>
                <p className="text-sm text-amber-800">
                  Los estudiantes necesitarán <strong>{unlockPoints} puntos</strong> participando en tus batallas para desbloquear tu tarjeta de profesor en su colección.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <EditTeacherProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={editableUser}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default TeacherProfileScreen;
