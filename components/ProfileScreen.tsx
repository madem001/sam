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
    <div className="bg-profile-light text-slate-800 dark:text-slate-200 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-wider">Mi Perfil</h1>
        <div className="flex items-center space-x-3">
            <button onClick={onToggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                <ion-icon name={theme === 'light' ? 'moon-outline' : 'sunny-outline'} class="text-xl"></ion-icon>
            </button>
            <button onClick={handleOpenNotifications} className="relative">
                <img src={user.imageUrl} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-500 shadow-sm" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-sky-50 dark:ring-slate-900">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
      </header>

      {/* Main Profile Content */}
      <main className="flex-1 flex flex-col px-4 overflow-hidden">
        <div className="w-full max-w-3xl mx-auto h-full flex flex-col py-4">
          {/* Avatar and User Info */}
          <div className="flex flex-col items-center flex-shrink-0 mb-4">
            <div className="relative w-24 h-24 mb-3">
              <img src={user.imageUrl} alt={user.name} className="w-full h-full rounded-full border-4 border-white dark:border-slate-700 shadow-lg" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{user.name}</h2>
            <div className="flex space-x-2">
              <button onClick={() => setIsEditModalOpen(true)} className="flex items-center space-x-1 text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition shadow-sm">
                  <ion-icon name="create-outline"></ion-icon>
                  <span>Editar</span>
              </button>
              <button onClick={onLogout} className="flex items-center space-x-1 text-sm bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold px-4 py-2 rounded-full hover:bg-red-200 dark:hover:bg-red-900/60 transition shadow-sm">
                  <ion-icon name="log-out-outline"></ion-icon>
                  <span>Salir</span>
              </button>
            </div>
          </div>

          {/* Achievements Section */}
          <div className="w-full flex-shrink-0 mb-4">
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2 text-center">Mis Logros</h3>
            <div className="flex justify-center flex-wrap gap-3">
              {user.achievements.map(ach => (
                <div key={ach.id} className="flex-shrink-0 w-16 text-center">
                  <div className="bg-white dark:bg-slate-700 rounded-full h-14 w-14 mx-auto flex items-center justify-center shadow-md border-2 border-slate-200 dark:border-slate-600">
                    <ion-icon name={ach.icon} class="text-2xl text-sky-500 dark:text-sky-400"></ion-icon>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 truncate">{ach.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Professor Cards Section */}
          <div className="flex-1 flex flex-col items-center min-h-0 justify-center">
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-3 flex-shrink-0">Mis Maestros</h3>
            {isLoadingProfessors ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full">
                <div style={{ perspective: '1000px', height: '300px' }} className="flex items-center justify-center w-full mb-3">
                  <div style={{ position: 'relative', width: '240px', height: '300px', transformStyle: 'preserve-3d' }}>
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
                            console.log('🖱️ [PROFILE] Click en carta:', {
                              index,
                              activeCardIndex,
                              isActive: index === activeCardIndex,
                              locked: prof.locked,
                              professorId: prof.id,
                              cardId: prof.cardId,
                            });

                            if (index === activeCardIndex) {
                              if (!prof.locked) {
                                console.log('🔍 [PROFILE] Consultando puntos para profesor:', prof.id);
                                const { data: pointsData, error } = await supabase
                                  .from('student_professor_points')
                                  .select('points')
                                  .eq('student_id', user.id)
                                  .eq('professor_id', prof.id)
                                  .maybeSingle();

                                console.log('📊 [PROFILE] Puntos obtenidos:', pointsData, 'Error:', error);

                                console.log('✅ [PROFILE] Abriendo modal con:', {
                                  cardId: prof.cardId || '',
                                  teacherId: prof.id,
                                  professorName: prof.name,
                                  points: pointsData?.points || 0,
                                });

                                setSelectedCardForRedemption({
                                  cardId: prof.cardId || '',
                                  teacherId: prof.id,
                                  professorName: prof.name,
                                  points: pointsData?.points || 0,
                                });
                              } else {
                                console.log('🔒 [PROFILE] Carta bloqueada, no se puede abrir modal');
                              }
                            } else {
                                console.log('👉 [PROFILE] Activando carta en índice:', index);
                                setActiveCardIndex(index);
                            }
                        }}
                      >
                        <div style={{ transform: 'scale(0.9)' }}>
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
                <div className="flex justify-center items-center flex-wrap gap-2 max-w-md">
                  {professors.map((prof, index) => (
                    <div
                      key={prof.id}
                      className={`w-12 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        index === activeCardIndex
                          ? 'border-sky-500 ring-2 ring-sky-300'
                          : 'border-slate-300 dark:border-slate-600 opacity-60 hover:opacity-100'
                      }`}
                      onClick={() => setActiveCardIndex(index)}
                    >
                      <img src={prof.imageUrl} alt={prof.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {selectedProfessor && <ProfessorDetailOverlay professor={selectedProfessor} onClose={() => setSelectedProfessor(null)} />}
      {selectedCardForRedemption && (
        <>
          {console.log('🎴 [PROFILE] Renderizando ProfessorCardDetailModal:', selectedCardForRedemption)}
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
        </>
      )}
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onSave={handleSaveProfile} />
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={user.notifications || []} onJoinBattle={onJoinFromNotification} />
    </div>
  );
};

export default ProfileScreen;