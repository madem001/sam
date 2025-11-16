import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  is_active: boolean;
}

interface RewardsManagementScreenProps {
  teacherId: string;
  onBack: () => void;
}

const RewardsManagementScreen: React.FC<RewardsManagementScreenProps> = ({ teacherId, onBack }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    points_required: 100,
  });

  useEffect(() => {
    loadRewards();
  }, [teacherId]);

  const loadRewards = async () => {
    const { data } = await supabase
      .from('professor_rewards')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('points_required', { ascending: true });

    if (data) {
      setRewards(data);
    }
  };

  const handleCreateReward = async () => {
    if (!newReward.title.trim()) {
      alert('El título es requerido');
      return;
    }

    const { error } = await supabase
      .from('professor_rewards')
      .insert({
        teacher_id: teacherId,
        title: newReward.title,
        description: newReward.description,
        points_required: newReward.points_required,
        is_active: true,
      });

    if (error) {
      console.error('❌ Error al crear recompensa:', error);
      alert(`Error al crear recompensa: ${error.message}`);
      return;
    }

    setNewReward({ title: '', description: '', points_required: 100 });
    setIsCreating(false);
    loadRewards();
  };

  const handleToggleActive = async (rewardId: string, currentStatus: boolean) => {
    await supabase
      .from('professor_rewards')
      .update({ is_active: !currentStatus })
      .eq('id', rewardId);

    loadRewards();
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('¿Eliminar esta recompensa?')) return;

    await supabase
      .from('professor_rewards')
      .delete()
      .eq('id', rewardId);

    loadRewards();
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ion-icon name="arrow-back-outline" class="text-2xl"></ion-icon>
            <span>Volver</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            🎁 Gestión de Recompensas
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Crea recompensas que tus estudiantes pueden canjear con sus puntos
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all mb-6"
        >
          <ion-icon name={isCreating ? "close-outline" : "add-circle-outline"} class="text-2xl mr-2"></ion-icon>
          {isCreating ? 'Cancelar' : 'Nueva Recompensa'}
        </button>

        {isCreating && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Crear Nueva Recompensa</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={newReward.title}
                  onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                  placeholder="Ej: Borrar una tarea"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  placeholder="Detalles de la recompensa..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Puntos Requeridos
                </label>
                <input
                  type="number"
                  value={newReward.points_required}
                  onChange={(e) => setNewReward({ ...newReward, points_required: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                onClick={handleCreateReward}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Crear Recompensa
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {rewards.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center">
              <ion-icon name="gift-outline" class="text-6xl text-slate-300 dark:text-slate-600 mb-4"></ion-icon>
              <p className="text-slate-500 dark:text-slate-400">
                No hay recompensas creadas aún
              </p>
            </div>
          ) : (
            rewards.map((reward) => (
              <div
                key={reward.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 ${
                  !reward.is_active ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {reward.title}
                      </h3>
                      {!reward.is_active && (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                          INACTIVA
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                      {reward.description}
                    </p>
                    <div className="flex items-center space-x-2">
                      <ion-icon name="star" class="text-amber-500 text-xl"></ion-icon>
                      <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {reward.points_required} puntos
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(reward.id, reward.is_active)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        reward.is_active
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {reward.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDeleteReward(reward.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardsManagementScreen;
