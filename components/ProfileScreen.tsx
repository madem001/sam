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

  const currentLevelXP = 3020;
  const xpForNextLevel = 3250;
  const progressPercentage = (currentLevelXP / xpForNextLevel) * 100;

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
    <div className="bg-profile-light text-slate-800 dark:text-slate-200 h-full overflow-y-auto flex flex-col">
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
      <main className="flex-grow flex flex-col items-center px-4 pb-8">
        {/* Avatar with Progress Ring */}
        <div className="relative w-36 h-36 mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="8" cx="50" cy="50" r="45" fill="transparent"></circle>
            <circle 
              className="stroke-sky-500 dark:stroke-sky-400" 
              strokeWidth="8" 
              cx="50" cy="50" r="45" 
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={(2 * Math.PI * 45) * (1 - progressPercentage / 100)}
              transform="rotate(-90 50 50)"
            ></circle>
          </svg>
          <img src={user.imageUrl} alt={user.name} className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-4 border-white dark:border-slate-800" />
        </div>
        
        {/* User Info */}
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{user.name}</h2>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-slate-500 dark:text-slate-400">Nivel {user.level}</span>
          <span className="bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">PRO</span>
        </div>
        <div className="flex items-center space-x-3 mt-4">
            <button onClick={() => setIsEditModalOpen(true)} className="flex items-center space-x-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-5 py-2 rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition shadow-sm">
                {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                <ion-icon name="create-outline"></ion-icon>
                <span>Editar</span>
            </button>
            <button onClick={onLogout} className="flex items-center space-x-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold px-5 py-2 rounded-full hover:bg-red-200 dark:hover:bg-red-900/60 transition shadow-sm">
                {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                <ion-icon name="log-out-outline"></ion-icon>
                <span>Salir</span>
            </button>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full max-w-sm mt-6">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-cyan-400 to-sky-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">{currentLevelXP} P</span> / <span className="font-bold text-slate-700 dark:text-slate-300">{xpForNextLevel} P</span> para el siguiente nivel
          </p>
        </div>
        
        {/* Achievements Section */}
        <div className="w-full mt-8">
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-3 px-2">Mis Logros</h3>
          <div className="flex space-x-4 overflow-x-auto pb-4 horizontal-scrollbar px-2">
            {user.achievements.map(ach => (
              <div key={ach.id} className="flex-shrink-0 w-24 text-center">
                <div className="bg-white dark:bg-slate-700 rounded-full h-20 w-20 flex items-center justify-center shadow-md border-2 border-slate-200 dark:border-slate-600">
                  {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                  <ion-icon name={ach.icon} class="text-4xl text-sky-500 dark:text-sky-400"></ion-icon>
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-2 truncate">{ach.name}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Professor Cards Section */}
        <div className="w-full mt-8 flex flex-col items-center">
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">Mis Maestros</h3>
          {isLoadingProfessors ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
            </div>
          ) : (
            <>
              <div className="carousel-container w-full">
                <div className="carousel-track">
                  {professors.map((prof, index) => (
                    <div 
                      className="carousel-item" 
                      key={prof.id} 
                      style={getCardStyle(index)}
                      onClick={() => {
                          if (index === activeCardIndex) {
                            if (!prof.locked) setSelectedProfessor(prof);
                          } else {
                              setActiveCardIndex(index);
                          }
                      }}
                    >
                      <ProfessorCard professor={prof} isActive={index === activeCardIndex} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="thumbnail-gallery mt-4 horizontal-scrollbar">
                {professors.map((prof, index) => (
                  <div 
                    key={prof.id} 
                    className={`thumbnail-item ${index === activeCardIndex ? 'active' : ''}`}
                    onClick={() => setActiveCardIndex(index)}
                  >
                    <img src={prof.imageUrl} alt={prof.name} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      
      {selectedProfessor && <ProfessorDetailOverlay professor={selectedProfessor} onClose={() => setSelectedProfessor(null)} />}
      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onSave={handleSaveProfile} />
      <NotificationsPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} notifications={user.notifications || []} onJoinBattle={onJoinFromNotification} />
    </div>
  );
};

export default ProfileScreen;