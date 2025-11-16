import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
}

interface ProfessorData {
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  rating?: number;
  totalPointsEarned?: number;
}

interface ProfessorCardDetailModalProps {
  cardId: string;
  professorName: string;
  teacherId: string;
  studentId: string;
  currentPoints: number;
  professorImageUrl?: string;
  professorTitle?: string;
  professorDescription?: string;
  onClose: () => void;
  onRedeem: () => void;
}

const ProfessorCardDetailModal: React.FC<ProfessorCardDetailModalProps> = ({
  cardId,
  professorName,
  teacherId,
  studentId,
  currentPoints,
  professorImageUrl,
  professorTitle,
  professorDescription,
  onClose,
  onRedeem,
}) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [professorData, setProfessorData] = useState<ProfessorData | null>(null);

  useEffect(() => {
    loadProfessorData();
    loadRewards();
  }, [teacherId]);

  const loadProfessorData = async () => {
    const { data: cardData } = await supabase
      .from('professor_cards')
      .select('*')
      .eq('teacher_id', teacherId)
      .maybeSingle();

    if (cardData) {
      setProfessorData({
        name: cardData.name,
        title: cardData.title || 'Profesor',
        description: cardData.description || 'Experto en su área',
        imageUrl: cardData.avatar_base64 || cardData.image_url || professorImageUrl || '',
        rating: 4.8,
        totalPointsEarned: currentPoints,
      });
    }
  };

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

  if (!professorData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (showRewards) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white rounded-t-3xl w-full h-full max-h-[90vh] overflow-hidden flex flex-col m-0 md:rounded-3xl md:max-w-2xl md:h-auto">
          <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-4 text-white">
            <button
              onClick={() => setShowRewards(false)}
              className="absolute top-3 left-3 text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
            >
              <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
            </button>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
            >
              <ion-icon name="close-outline" class="text-xl"></ion-icon>
            </button>

            <h2 className="text-xl font-black text-center mt-1">Recompensas</h2>
            <div className="flex items-center justify-center space-x-1.5 mt-1">
              <ion-icon name="star" class="text-amber-300 text-base"></ion-icon>
              <span className="text-base font-bold">{currentPoints} puntos disponibles</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {rewards.length === 0 ? (
              <div className="bg-slate-100 rounded-2xl p-8 text-center">
                <ion-icon name="gift-outline" class="text-5xl text-slate-300 mb-3"></ion-icon>
                <p className="text-slate-500 text-sm">No hay recompensas disponibles</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rewards.map((reward) => {
                  const canAfford = currentPoints >= reward.points_required;

                  return (
                    <div
                      key={reward.id}
                      className={`bg-gradient-to-r ${
                        canAfford
                          ? 'from-green-50 to-emerald-50 border-green-300'
                          : 'from-slate-50 to-slate-100 border-slate-300'
                      } border-2 rounded-2xl p-4 transition-all`}
                    >
                      <div className="mb-3">
                        <h4 className="text-base font-bold text-slate-800 mb-1">
                          {reward.title}
                        </h4>
                        <p className="text-sm text-slate-600 leading-snug">{reward.description}</p>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-1.5">
                          <ion-icon name="star" class="text-amber-500 text-base"></ion-icon>
                          <span className="text-sm font-bold text-amber-600">
                            {reward.points_required} pts
                          </span>
                        </div>

                        <button
                          onClick={() => handleRedeemReward(reward)}
                          disabled={!canAfford || isRedeeming}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            canAfford && !isRedeeming
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Canjear' : 'Insuficiente'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-t-3xl w-full max-w-md overflow-hidden md:rounded-3xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 text-white hover:bg-black/20 rounded-full p-1.5 transition-colors"
        >
          <ion-icon name="close-outline" class="text-2xl"></ion-icon>
        </button>

        <div className="relative h-72 overflow-hidden">
          <img
            src={professorData.imageUrl}
            alt={professorData.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center gap-1.5 mb-1">
              <h2 className="text-2xl font-black">{professorData.name}</h2>
              <ion-icon name="checkmark-circle" class="text-blue-400 text-xl"></ion-icon>
            </div>
            <p className="text-white/90 text-xs leading-relaxed">
              {professorData.description}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5 mb-0.5">
                <ion-icon name="star" class="text-amber-500 text-base"></ion-icon>
                <span className="text-lg font-bold text-slate-800">{professorData.rating}</span>
              </div>
              <p className="text-[10px] text-slate-500">Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5 mb-0.5">
                <span className="text-lg font-bold text-slate-800">{currentPoints}</span>
              </div>
              <p className="text-[10px] text-slate-500">Puntos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5 mb-0.5">
                <span className="text-lg font-bold text-slate-800">{rewards.length}</span>
              </div>
              <p className="text-[10px] text-slate-500">Premios</p>
            </div>
          </div>

          <button
            onClick={() => setShowRewards(true)}
            className="w-full bg-white border-2 border-slate-800 text-slate-800 font-bold py-3 rounded-2xl hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <ion-icon name="gift-outline" class="text-lg"></ion-icon>
            <span className="text-sm">Ver Recompensas</span>
          </button>

          <button
            onClick={onClose}
            className="w-full bg-slate-100 text-slate-600 font-semibold py-2.5 rounded-2xl hover:bg-slate-200 transition-colors text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessorCardDetailModal;
