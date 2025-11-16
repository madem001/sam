import React, { useState, useEffect, useRef } from 'react';
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
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout, onUpdateUser, onJoinFromNotification, onMarkAsRead }) => {
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
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const cardContainerRef = useRef<HTMLDivElement>(null);
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

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragState({
      isDragging: true,
      startX: clientX,
      startY: clientY,
      currentX: 0,
      currentY: 0,
    });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragState(prev => ({
      ...prev,
      currentX: clientX - prev.startX,
      currentY: clientY - prev.startY,
    }));
  };

  const handleDragEnd = () => {
    if (!dragState.isDragging) return;

    const threshold = 100;
    const absX = Math.abs(dragState.currentX);

    if (absX > threshold) {
      if (dragState.currentX > 0 && activeCardIndex > 0) {
        setActiveCardIndex(prev => prev - 1);
      } else if (dragState.currentX < 0 && activeCardIndex < professors.length - 1) {
        setActiveCardIndex(prev => prev + 1);
      }
    }

    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
  };

  const getCardStyle = (index: number): React.CSSProperties => {
    const offset = index - activeCardIndex;
    const isActive = index === activeCardIndex;
    const isVisible = Math.abs(offset) < 3;

    if (!isVisible) {
        return {
          opacity: 0,
          transform: `translateX(${offset > 0 ? 100 : -100}%) scale(0.7)`,
          pointerEvents: 'none'
        };
    }

    let baseTranslateX = offset * 45;
    let baseScale = 1 - Math.abs(offset) * 0.12;
    let baseRotate = offset * 2;

    if (isActive && dragState.isDragging) {
      const dragRotate = dragState.currentX * 0.02;
      return {
        transform: `translateX(calc(${baseTranslateX}% + ${dragState.currentX}px))
                    translateY(${dragState.currentY}px)
                    scale(${baseScale})
                    rotate(${dragRotate}deg)`,
        zIndex: 100,
        opacity: 1,
        cursor: 'grabbing',
        transition: 'none',
      };
    }

    const zIndex = 100 - Math.abs(offset);
    const opacity = isActive ? 1 : 0.6 - Math.abs(offset) * 0.15;

    return {
      transform: `translateX(${baseTranslateX}%) scale(${baseScale}) rotate(${baseRotate}deg)`,
      zIndex,
      opacity,
      cursor: isActive ? 'grab' : 'pointer',
      transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
    };
  };

  const handleCardClick = async (index: number) => {
    if (dragState.isDragging) return;

    const prof = professors[index];
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
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* Compact Header */}
      <header className="absolute top-0 right-0 z-20 flex items-center justify-end px-6 py-4 gap-2">
        <button
          onClick={handleOpenNotifications}
          className="relative p-2.5 rounded-full bg-white/80 text-slate-600 hover:scale-110 transition-all shadow-lg backdrop-blur-sm"
        >
          <ion-icon name="notifications-outline" class="text-xl"></ion-icon>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden -mt-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Profile Card - Hero */}
        <div className="mb-8">
          <div className="overflow-visible p-0">
            {/* Profile Image Section */}
            <div className="relative h-80 bg-gradient-to-br from-teal-600 to-emerald-500">
              <img
                src={user.imageUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile Info Section with Curved Top */}
            <div className="relative bg-white -mt-10 rounded-t-[3rem] p-6 pt-10 text-center shadow-2xl">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">{user.name}</h1>
              <p className="text-sm text-slate-500 mb-4 flex items-center justify-center">
                <ion-icon name="location-outline" class="text-base mr-1"></ion-icon>
                Estudiante EduBattle
              </p>

              {/* Stats Row */}
              <div className="flex justify-around mb-5 pb-5 border-b border-slate-200">
                <div>
                  <div className="text-2xl font-bold text-slate-800">{professors.filter(p => !p.locked).length}</div>
                  <div className="text-xs text-slate-500">Cartas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{user.achievements?.length || 0}</div>
                  <div className="text-xs text-slate-500">Logros</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{professors.length}</div>
                  <div className="text-xs text-slate-500">Maestros</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
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

        <div className="max-w-2xl mx-auto px-6 space-y-8">
          {/* Achievements Section */}
          {user.achievements && user.achievements.length > 0 && (
            <div className="glass-card-modern p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-5 flex items-center justify-center">
                <ion-icon name="trophy" class="text-2xl mr-2 text-amber-500"></ion-icon>
                Mis Logros
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {user.achievements.map(ach => (
                  <div key={ach.id} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl mb-2">
                      <ion-icon name={ach.icon} class="text-3xl text-white"></ion-icon>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 text-center leading-tight">{ach.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professor Cards Section */}
          <div className="glass-card-modern p-6">
            {isLoadingProfessors ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
              </div>
            ) : professors.length === 0 ? (
              <div className="text-center py-12">
                <ion-icon name="school-outline" class="text-6xl text-slate-300"></ion-icon>
                <p className="text-slate-500 mt-3">No hay maestros disponibles</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  ref={cardContainerRef}
                  style={{ perspective: '1400px', height: '400px' }}
                  className="flex items-center justify-center w-full relative select-none"
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  <div style={{ position: 'relative', width: '280px', height: '380px', transformStyle: 'preserve-3d' }}>
                    {professors.map((prof, index) => (
                      <div
                        key={prof.id}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          ...getCardStyle(index)
                        }}
                        onMouseDown={index === activeCardIndex ? handleDragStart : undefined}
                        onTouchStart={index === activeCardIndex ? handleDragStart : undefined}
                        onClick={() => handleCardClick(index)}
                      >
                        <div style={{
                          transform: 'scale(0.9)',
                          filter: index === activeCardIndex ? 'none' : 'brightness(0.85)'
                        }}>
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

                <div className="flex justify-center items-center gap-2">
                  {professors.map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === activeCardIndex
                          ? 'w-8 bg-sky-500'
                          : 'w-2 bg-slate-300'
                      }`}
                      onClick={() => setActiveCardIndex(index)}
                    />
                  ))}
                </div>

                <div className="flex justify-center items-center gap-3 flex-wrap">
                  {professors.map((prof, index) => (
                    <button
                      key={prof.id}
                      className={`w-16 h-16 rounded-xl overflow-hidden transition-all ${
                        index === activeCardIndex
                          ? 'ring-3 ring-sky-500 scale-110 shadow-lg'
                          : 'opacity-60 hover:opacity-100 hover:scale-105'
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
