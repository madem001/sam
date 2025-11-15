import React, { useState, useEffect } from 'react';
import { User, Professor, Achievement } from '../types';
import EditProfileModal from './EditProfileModal';
import NotificationsPanel from './NotificationsPanel';
import ProfessorCard from './ProfessorCard';
import ProfessorDetailOverlay from './ProfessorDetailOverlay';
import { getProfessors } from '../api';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isLoadingProfessors, setIsLoadingProfessors] = useState(true);
  const unreadCount = user.notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    getProfessors().then(data => {
      setProfessors(data);
      setIsLoadingProfessors(false);
    });
  }, []);

  const handleOpenNotifications = () => {
      setIsNotificationsOpen(true);
      const unreadIds = (user.notifications || []).filter(n => !n.read).map(n => n.id);
      if (unreadIds.length > 0) {
          setTimeout(() => onMarkAsRead(unreadIds), 1000);
      }
  };

  const handleSaveProfile = (updatedData: { name: string; imageUrl: string }) => {
    onUpdateUser(updatedData);
    setIsEditModalOpen(false);
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
      <main className="flex-1 flex flex-col items-center px-4 overflow-hidden">
        <div className="w-full max-w-2xl h-full flex flex-col">
          {/* Avatar and User Info - Compact */}
          <div className="flex items-center justify-between py-3 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative w-16 h-16">
                <img src={user.imageUrl} alt={user.name} className="w-full h-full rounded-full border-2 border-white dark:border-slate-700 shadow-md" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{user.name}</h2>
                <div className="flex space-x-2 mt-1">
                  <button onClick={() => setIsEditModalOpen(true)} className="text-xs bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition">
                      Editar
                  </button>
                  <button onClick={onLogout} className="text-xs bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold px-3 py-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900/60 transition">
                      Salir
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Section - Compact */}
          <div className="w-full py-3 flex-shrink-0">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Mis Logros</h3>
            <div className="flex justify-center gap-2">
              {user.achievements.slice(0, 6).map(ach => (
                <div key={ach.id} className="flex-shrink-0 text-center">
                  <div className="bg-white dark:bg-slate-700 rounded-full h-12 w-12 mx-auto flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-600">
                    <ion-icon name={ach.icon} class="text-2xl text-sky-500 dark:text-sky-400"></ion-icon>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Professor Cards Section - Takes remaining space */}
          <div className="flex-1 flex flex-col items-center min-h-0">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 flex-shrink-0">Mis Maestros</h3>
            {isLoadingProfessors ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
                <div style={{ perspective: '1000px', height: '280px' }} className="flex items-center justify-center w-full flex-shrink-0">
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
                        onClick={() => {
                            if (index === activeCardIndex) {
                              if (!prof.locked) setSelectedProfessor(prof);
                            } else {
                                setActiveCardIndex(index);
                            }
                        }}
                      >
                        <div style={{ transform: 'scale(0.85)' }}>
                          <ProfessorCard professor={prof} isActive={index === activeCardIndex} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center items-center gap-2 mt-3 flex-shrink-0">
                  {professors.map((prof, index) => (
                    <div
                      key={prof.id}
                      className={`w-10 h-12 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                        index === activeCardIndex
                          ? 'border-sky-500 scale-110'
                          : 'border-transparent opacity-60 hover:opacity-100'
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
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onSave={handleSaveProfile} />
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={user.notifications || []} onJoinBattle={onJoinFromNotification} />
    </div>
  );
};

export default ProfileScreen;