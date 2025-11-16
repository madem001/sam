import React, { useState, useEffect } from 'react';
import { User, Professor, Achievement } from '../types';
import EditProfileModal from './EditProfileModal';
import NotificationsPanel from './NotificationsPanel';
import ProfessorCard from './ProfessorCard';
import ProfessorDetailOverlay from './ProfessorDetailOverlay';
import ProfessorCardDetailModal from './ProfessorCardDetailModal';
import { professorCardsApi, authApi } from '../lib/api';
import { supabase } from '../lib/supabase';

interface ProfileScreenProps {
  user: User;
  lastPointsWon?: number;
  onLogout: () => void;
  onUpdateUser: (updatedData: Partial<User>) => void;
  onJoinFromNotification: (code: string) => void;
  onMarkAsRead: (notificationIds: string[]) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout, onUpdateUser, onJoinFromNotification, onMarkAsRead, theme, onToggleTheme }) => {
  console.log('👤 ProfileScreen renderizado con user:', user);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isLoadingProfessors, setIsLoadingProfessors] = useState(true);
  const [selectedCardForRedemption, setSelectedCardForRedemption] = useState<{
    cardId: string;
    teacherId: string;
    professorName: string;
    points: number;
  } | null>(null);
  const unreadCount = user.notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    const loadCards = async () => {
      if (!user.id) return;

      try {
        console.log('🎴 [PROFILE] Cargando cartas para estudiante:', user.id);
        const cards = await professorCardsApi.getStudentCards(user.id);
        console.log('🎴 [PROFILE] Cartas recibidas:', cards.length);

        const mappedProfessors: Professor[] = cards.map((c: any) => {
          console.log('🎴 [PROFILE] Carta:', c.card?.name, 'Puntos:', c.card?.points);
          return {
            id: c.card.teacher_id,
            cardId: c.card.id,
            name: c.card.name,
            subject: c.card.title,
            title: c.card.title,
            description: c.card.description,
            imageUrl: c.card.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.card.name)}&background=3b82f6&color=fff&bold=true&size=128`,
            locked: !c.unlocked,
            unlockPoints: c.card.unlock_points,
            points: c.card.points || 0,
          };
        });

        console.log('✅ [PROFILE] Cartas mapeadas:', mappedProfessors);
        setProfessors(mappedProfessors);
        setIsLoadingProfessors(false);
      } catch (error) {
        console.error('❌ [PROFILE] Error cargando cartas:', error);
        setIsLoadingProfessors(false);
      }
    };

    loadCards();
  }, [user.id]);

  const handleOpenNotifications = () => {
      setIsNotificationsOpen(true);
      const unreadIds = (user.notifications || []).filter(n => !n.read).map(n => n.id);
      if (unreadIds.length > 0) {
          setTimeout(() => onMarkAsRead(unreadIds), 1000);
      }
  };

  const handleSaveProfile = async (updatedData: { name: string; imageUrl: string }) => {
    try {
      await authApi.updateProfile(user.id, {
        name: updatedData.name,
        avatar: updatedData.imageUrl,
      });
      onUpdateUser(updatedData);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('❌ Error guardando perfil:', error);
      alert('Error al guardar el perfil');
    }
  };

  const getCardStyle = (index: number): React.CSSProperties => {
    const offset = index - activeCardIndex;
    const isVisible = Math.abs(offset) < 3;

    if (!isVisible) {
        return { opacity: 0, transform: `translateX(${offset > 0 ? 100 : -100}%) scale(0.7)`, pointerEvents: 'none' };
    }

    const translateX = offset * 40;
    const scale = 1 - Math.abs(offset) * 0.15;
    const zIndex = 100 - Math.abs(offset);
    const opacity = 1 - Math.abs(offset) * 0.3;

    return {
        transform: `translateX(${translateX}%) scale(${scale})`,
        zIndex,
        opacity,
        cursor: 'pointer'
    };
  };

  return (
    <div className="bg-profile-light h-full flex flex-col overflow-hidden">
      {/* Header con Glass Effect */}
      <header className="flex-shrink-0 backdrop-blur-xl bg-white/40 dark:bg-slate-900/40 border-b border-white/20 dark:border-slate-700/30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={user.imageUrl}
                alt={user.name}
                className="w-12 h-12 rounded-2xl border-2 border-white/50 dark:border-slate-600/50 shadow-xl object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{user.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Nivel {user.level}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-lg backdrop-blur-sm"
            >
              <ion-icon name={theme === 'light' ? 'moon-outline' : 'sunny-outline'} class="text-xl"></ion-icon>
            </button>
            <button
              onClick={handleOpenNotifications}
              className="relative p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-lg backdrop-blur-sm"
            >
              <ion-icon name="notifications-outline" class="text-xl"></ion-icon>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content con Scroll */}
      <main className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-4xl mx-auto space-y-6 pt-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card-modern p-4 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {user.level}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Nivel</div>
            </div>
            <div className="glass-card-modern p-4 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {professors.filter(p => !p.locked).length}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Cartas</div>
            </div>
            <div className="glass-card-modern p-4 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                {user.achievements?.length || 0}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Logros</div>
            </div>
          </div>

          {/* Achievements Section */}
          {user.achievements && user.achievements.length > 0 && (
            <div className="glass-card-modern p-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
                <ion-icon name="trophy" class="text-xl mr-2 text-amber-500"></ion-icon>
                Mis Logros
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {user.achievements.map(ach => (
                  <div key={ach.id} className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <ion-icon name={ach.icon} class="text-2xl text-white"></ion-icon>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2 text-center leading-tight">{ach.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professor Cards Section */}
          <div className="glass-card-modern p-5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center">
              <ion-icon name="people" class="text-xl mr-2 text-blue-500"></ion-icon>
              Mis Maestros
            </h3>

            {isLoadingProfessors ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
              </div>
            ) : professors.length === 0 ? (
              <div className="text-center py-12">
                <ion-icon name="school-outline" class="text-6xl text-slate-300 dark:text-slate-600"></ion-icon>
                <p className="text-slate-500 dark:text-slate-400 mt-3">No hay maestros disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Card Display */}
                <div style={{ perspective: '1000px', height: '280px' }} className="flex items-center justify-center w-full">
                  <div style={{ position: 'relative', width: '220px', height: '280px', transformStyle: 'preserve-3d' }}>
                    {professors.map((prof, index) => (
                      <div
                        key={prof.id}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease',
                          cursor: 'pointer',
                          ...getCardStyle(index)
                        }}
                        onClick={async () => {
                            if (index === activeCardIndex) {
                              if (!prof.locked) {
                                const { data: pointsData } = await supabase
                                  .from('student_professor_points')
                                  .select('points')
                                  .eq('student_id', user.id)
                                  .eq('professor_id', prof.id)
                                  .maybeSingle();

                                setSelectedCardForRedemption({
                                  cardId: prof.cardId || '',
                                  teacherId: prof.id,
                                  professorName: prof.name,
                                  points: pointsData?.points || 0,
                                });
                              }
                            } else {
                                setActiveCardIndex(index);
                            }
                        }}
                      >
                        <div style={{ transform: 'scale(0.85)' }}>
                          <ProfessorCard
                            professor={prof}
                            isActive={index === activeCardIndex}
                            points={prof.points || 0}
                            requiredPoints={prof.unlockPoints || 100}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  {professors.map((prof, index) => (
                    <button
                      key={prof.id}
                      className={`w-12 h-12 rounded-xl overflow-hidden transition-all ${
                        index === activeCardIndex
                          ? 'ring-2 ring-sky-500 scale-110 shadow-lg'
                          : 'opacity-50 hover:opacity-100 hover:scale-105'
                      }`}
                      onClick={() => setActiveCardIndex(index)}
                    >
                      <img src={prof.imageUrl} alt={prof.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 glass-card-modern p-4 flex items-center justify-center space-x-2 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all group"
            >
              <ion-icon name="create-outline" class="text-xl text-sky-500 group-hover:scale-110 transition-transform"></ion-icon>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Editar Perfil</span>
            </button>
            <button
              onClick={onLogout}
              className="flex-1 glass-card-modern p-4 flex items-center justify-center space-x-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
            >
              <ion-icon name="log-out-outline" class="text-xl text-red-500 group-hover:scale-110 transition-transform"></ion-icon>
              <span className="font-semibold text-red-600 dark:text-red-400">Cerrar Sesión</span>
            </button>
          </div>

        </div>
      </main>

      {selectedProfessor && <ProfessorDetailOverlay professor={selectedProfessor} onClose={() => setSelectedProfessor(null)} />}
      {selectedCardForRedemption && (
        <ProfessorCardDetailModal
          cardId={selectedCardForRedemption.cardId}
          professorName={selectedCardForRedemption.professorName}
          teacherId={selectedCardForRedemption.teacherId}
          studentId={user.id}
          currentPoints={selectedCardForRedemption.points}
          onClose={() => setSelectedCardForRedemption(null)}
          onRedeem={async () => {
            const cards = await professorCardsApi.getStudentCards(user.id);
            setProfessors(cards);
          }}
        />
      )}
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onSave={handleSaveProfile} />
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={user.notifications || []} onJoinBattle={onJoinFromNotification} />
    </div>
  );
};

export default ProfileScreen;
