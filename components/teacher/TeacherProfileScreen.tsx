import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import EditProfileModal from '../EditProfileModal';
import { supabase } from '../../lib/supabase';
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

  useEffect(() => {
    loadUnlockPoints();
  }, [user.id]);

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

  const handleSaveProfile = async (updatedData: { name: string; imageUrl: string }) => {
    try {
      await authApi.updateProfile(user.id, {
        name: updatedData.name,
        avatar: updatedData.imageUrl,
      });
      setEditableUser(prev => ({ ...prev, ...updatedData }));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('❌ Error guardando perfil:', error);
      alert('Error al guardar el perfil');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="px-6 pt-8 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-gray-700 to-gray-900"></div>

            <div className="relative px-6 pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-end -mt-16 gap-4">
                  <div className="relative">
                    <img
                      src={editableUser.imageUrl}
                      alt={editableUser.name}
                      className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl object-cover"
                    />
                  </div>
                  <div className="pb-2">
                    <h1 className="text-3xl font-bold text-slate-800">{editableUser.name}</h1>
                    <p className="text-gray-700 font-semibold mt-1">Docente</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all shadow-sm hover:shadow"
                    aria-label="Editar perfil"
                  >
                    <ion-icon name="create-outline" class="text-xl"></ion-icon>
                  </button>
                  <button
                    onClick={onLogout}
                    className="p-3 rounded-2xl bg-red-100 hover:bg-red-200 text-red-600 transition-all shadow-sm hover:shadow"
                    aria-label="Cerrar sesión"
                  >
                    <ion-icon name="log-out-outline" class="text-xl"></ion-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Card */}
          {editableUser.subjects && editableUser.subjects.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <ion-icon name="book" class="text-2xl text-white"></ion-icon>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Clases que imparte</h2>
              </div>
              <div className="flex flex-wrap gap-2">
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

          {/* Skills Card */}
          {editableUser.skills && editableUser.skills.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <ion-icon name="bulb" class="text-2xl text-white"></ion-icon>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Habilidades</h2>
              </div>
              <div className="flex flex-wrap gap-2">
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

          {/* Cycles Card */}
          {editableUser.cycles && editableUser.cycles.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <ion-icon name="calendar" class="text-2xl text-white"></ion-icon>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Ciclos Académicos</h2>
              </div>
              <div className="flex flex-wrap gap-2">
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
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                <ion-icon name="card" class="text-2xl text-white"></ion-icon>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Configuración de Tarjeta</h2>
            </div>

            <div className="space-y-4">
              <p className="text-slate-600">
                Puntos necesarios para que los estudiantes desbloqueen tu tarjeta de profesor
              </p>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Puntos Requeridos
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={unlockPoints}
                    onChange={(e) => setUnlockPoints(Number(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-gray-900 outline-none transition-colors disabled:opacity-50 disabled:bg-slate-50"
                  />
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveUnlockPoints}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          loadUnlockPoints();
                        }}
                        className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-all"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
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
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={editableUser}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default TeacherProfileScreen;
