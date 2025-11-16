import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import EditProfileModal from '../EditProfileModal';
import { supabase } from '../../lib/supabase';
import { authApi } from '../../lib/api';

interface TeacherProfileScreenProps {
  user: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode, delay: string }> = ({ title, children, delay }) => (
    <div className="animate-stagger" style={{ '--stagger-delay': delay } as React.CSSProperties}>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-3 px-1">{title}</h2>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            {children}
        </div>
    </div>
);

const Tag: React.FC<{ text: string }> = ({ text }) => (
    <span className="bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 text-sm font-semibold px-3 py-1 rounded-full">
        {text}
    </span>
);

const TeacherProfileScreen: React.FC<TeacherProfileScreenProps> = ({ user, onLogout, theme, onToggleTheme }) => {
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
      .single();

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
    <div className="space-y-6">
        {/* User Info Section */}
        <div className="flex items-center space-x-4 p-2 animate-stagger" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
            <img src={editableUser.imageUrl} alt={editableUser.name} className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-lg" />
            <div className="flex-grow">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{editableUser.name}</h1>
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold">Rol: Docente</p>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={onToggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                    <ion-icon name={theme === 'light' ? 'moon-outline' : 'sunny-outline'} class="text-xl"></ion-icon>
                </button>
                 <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition flex items-center justify-center" 
                    aria-label="Editar perfil">
                    {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                    <ion-icon name="create-outline" class="text-xl"></ion-icon>
                </button>
                <button 
                    onClick={onLogout} 
                    className="p-2 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 transition flex items-center justify-center"
                    aria-label="Cerrar sesión"
                >
                    {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                    <ion-icon name="log-out-outline" class="text-xl"></ion-icon>
                </button>
            </div>
        </div>

        {/* Subjects Card */}
        <InfoCard title="Clases que imparte" delay="200ms">
            <div className="flex flex-wrap gap-2">
                {editableUser.subjects?.map(subject => <Tag key={subject} text={subject} />)}
            </div>
        </InfoCard>

        {/* Skills Card */}
        <InfoCard title="Habilidades" delay="300ms">
             <div className="flex flex-wrap gap-2">
                {editableUser.skills?.map(skill => <Tag key={skill} text={skill} />)}
            </div>
        </InfoCard>

        {/* Cycles Card */}
        <InfoCard title="Ciclos Académicos" delay="400ms">
             <div className="flex flex-wrap gap-2">
                {editableUser.cycles?.map(cycle => <Tag key={cycle} text={cycle} />)}
            </div>
        </InfoCard>

        {/* Card Unlock Configuration */}
        <InfoCard title="Configuración de Tarjeta" delay="500ms">
            <div className="space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Puntos necesarios para desbloquear tu tarjeta de profesor
                </p>
                <div className="flex items-center space-x-3">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Puntos Requeridos
                        </label>
                        <input
                            type="number"
                            min="10"
                            max="10000"
                            value={unlockPoints}
                            onChange={(e) => setUnlockPoints(Number(e.target.value))}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 disabled:opacity-50"
                        />
                    </div>
                    <div className="flex space-x-2 mt-5">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSaveUnlockPoints}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    Guardar
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        loadUnlockPoints();
                                    }}
                                    className="px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 transition"
                                >
                                    Cancelar
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
                            >
                                Editar
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2 mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <ion-icon name="information-circle" class="text-2xl text-amber-600 dark:text-amber-400"></ion-icon>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        Los estudiantes necesitarán <strong>{unlockPoints} puntos</strong> jugando tus batallas para desbloquear tu tarjeta
                    </p>
                </div>
            </div>
        </InfoCard>

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