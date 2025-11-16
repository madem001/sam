import React, { useState } from 'react';
import { Achievement, User } from '../types';
import ParallaxAvatar from './ParallaxAvatar';

const iconColors: { [key: string]: string } = {
    'flame-outline': '#f97316', // orange-500
    'color-palette-outline': '#6b7280', // gray-500
    'help-circle-outline': '#4b5563', // gray-600
    'id-card-outline': '#374151', // gray-700
    'trending-up-outline': '#1f2937', // gray-800
    'checkmark-done-circle-outline': '#22c55e', // green-500
};

const StatItem: React.FC<{ icon: string; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="text-center">
        <div className="text-3xl text-slate-700">
            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
            <ion-icon name={icon}></ion-icon>
        </div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
    </div>
);


interface AchievementsScreenProps {
  user: User;
  onBack: () => void;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ user, onBack }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const achievements = user.achievements;

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
  };
  
  if (!achievements || achievements.length === 0) {
    return (
      <div className="relative p-4 bg-achievements-light h-full flex flex-col items-center justify-center text-center">
        <button
            onClick={onBack}
            className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors shadow-md"
            aria-label="Regresar"
        >
            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
            <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
        </button>
        {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
        <ion-icon name="shield-outline" class="text-7xl text-slate-400"></ion-icon>
        <h1 className="text-2xl font-bold text-slate-700 mt-4">Aún no hay logros</h1>
        <p className="text-slate-500 mt-2">¡Participa en una batalla para empezar a ganar!</p>
      </div>
    );
  }

  return (
    <div className="relative bg-achievements-light h-full">
      <button
            onClick={onBack}
            className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/50 backdrop-blur-sm text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-colors shadow-md"
            aria-label="Regresar"
        >
            {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
            <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
      </button>
      
      {/* Hero Banner */}
      <div className="hero-banner-light animate-stagger" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
          <div className="avatar-container">
            <ParallaxAvatar imageUrl={user.imageUrl} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-4">{user.name}</h1>
          <p className="text-sky-600 font-semibold">Nivel {user.level}</p>
      </div>
      
      {/* Achievements Collection */}
      <div className="p-4 relative z-10 animate-stagger" style={{ '--stagger-delay': '200ms' } as React.CSSProperties}>
        <h2 className="text-xl font-bold text-slate-700 mb-4 px-1">
          Tu Colección
        </h2>
        <div className="achievement-collection-grid">
          {achievements.map((ach, index) => {
            const glowColor = iconColors[ach.icon] || '#e5e7eb';
            return (
              <button 
                key={ach.id} 
                onClick={() => handleAchievementClick(ach)}
                className="achievement-card-light animate-stagger"
                style={{ 
                    '--stagger-delay': `${300 + index * 50}ms`,
                    '--glow-color': glowColor 
                } as React.CSSProperties}
              >
                  {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                  <ion-icon name={ach.icon}></ion-icon>
                  <h3>{ach.name}</h3>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="achievement-modal-overlay" onClick={() => setSelectedAchievement(null)}>
            <div className="achievement-modal-content" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => setSelectedAchievement(null)}
                    className="absolute top-3 right-3 text-slate-600 bg-white/50 dark:bg-slate-900/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/80 dark:hover:bg-slate-900/80 transition"
                >
                    {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                    <ion-icon name="close-outline" class="text-2xl"></ion-icon>
                </button>

                <div className="p-6 text-center">
                    <div className="text-7xl mx-auto" style={{ color: iconColors[selectedAchievement.icon] || '#374151' }}>
                        {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
                        <ion-icon name={selectedAchievement.icon}></ion-icon>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mt-2">{selectedAchievement.name}</h2>
                    <p className="text-slate-600 mt-1 text-sm">{selectedAchievement.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-white/50 p-4">
                   <StatItem icon="game-controller-outline" label="Partidas" value={selectedAchievement.matchesPlayed || '-'} />
                   <StatItem icon="star-outline" label="Puntos" value={selectedAchievement.pointsEarned || '-'} />
                   <StatItem icon="trending-up-outline" label="Nivel" value={selectedAchievement.levelAchieved || '-'} />
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsScreen;