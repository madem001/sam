import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
}

interface ProfessorCardDetailModalProps {
  cardId: string;
  professorName: string;
  teacherId: string;
  studentId: string;
  currentPoints: number;
  onClose: () => void;
  onRedeem: () => void;
}

const ProfessorCardDetailModal: React.FC<ProfessorCardDetailModalProps> = ({
  cardId,
  professorName,
  teacherId,
  studentId,
  currentPoints,
  onClose,
  onRedeem,
}) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    loadRewards();
  }, [teacherId]);

  const loadRewards = async () => {
    const { data } = await supabase
      .from('professor_rewards')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_active', true)
      .order('points_required', { ascending: true });

    if (data) {
      setRewards(data);
    }
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (currentPoints < reward.points_required) {
      alert('No tienes suficientes puntos');
      return;
    }

    if (!confirm(`¿Canjear "${reward.title}" por ${reward.points_required} puntos?`)) {
      return;
    }

    setIsRedeeming(true);

    try {
      const { error: redemptionError } = await supabase
        .from('student_reward_redemptions')
        .insert({
          student_id: studentId,
          reward_id: reward.id,
          teacher_id: teacherId,
          points_spent: reward.points_required,
          status: 'pending',
        });

      if (redemptionError) throw redemptionError;

      const { data: currentPointsData } = await supabase
        .from('student_professor_points')
        .select('points')
        .eq('student_id', studentId)
        .eq('professor_id', teacherId)
        .maybeSingle();

      if (currentPointsData) {
        const { error: updateError } = await supabase
          .from('student_professor_points')
          .update({ points: currentPointsData.points - reward.points_required })
          .eq('student_id', studentId)
          .eq('professor_id', teacherId);

        if (updateError) throw updateError;
      }

      alert('¡Recompensa canjeada! Tu profesor la aprobará pronto.');
      onRedeem();
      onClose();
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Error al canjear recompensa');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <ion-icon name="close-outline" class="text-3xl"></ion-icon>
          </button>

          <h2 className="text-3xl font-black mb-2">{professorName}</h2>
          <div className="flex items-center space-x-2">
            <ion-icon name="star" class="text-amber-300 text-2xl"></ion-icon>
            <span className="text-2xl font-bold">{currentPoints} puntos</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              🎁 Recompensas Disponibles
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Canjea tus puntos por estas recompensas
            </p>
          </div>

          {rewards.length === 0 ? (
            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-12 text-center">
              <ion-icon name="gift-outline" class="text-6xl text-slate-300 dark:text-slate-500 mb-4"></ion-icon>
              <p className="text-slate-500 dark:text-slate-400">
                No hay recompensas disponibles
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rewards.map((reward) => {
                const canAfford = currentPoints >= reward.points_required;

                return (
                  <div
                    key={reward.id}
                    className={`bg-gradient-to-r ${
                      canAfford
                        ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
                        : 'from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 border-slate-300 dark:border-slate-600'
                    } border-2 rounded-2xl p-6 transition-all hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                          {reward.title}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 mb-3">
                          {reward.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ion-icon name="star" class="text-amber-500 text-xl"></ion-icon>
                        <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {reward.points_required} puntos
                        </span>
                      </div>

                      <button
                        onClick={() => handleRedeemReward(reward)}
                        disabled={!canAfford || isRedeeming}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${
                          canAfford && !isRedeeming
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105'
                            : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Canjear' : 'Puntos insuficientes'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-slate-100 dark:bg-slate-700 p-4">
          <button
            onClick={onClose}
            className="w-full bg-slate-600 dark:bg-slate-500 text-white font-bold py-3 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-400 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCardDetailModal;
