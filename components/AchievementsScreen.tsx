import React, { useState, useEffect } from 'react';
import { Achievement, User } from '../types';

interface AchievementsScreenProps {
  user: User;
  onBack: () => void;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ user, onBack }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const achievements: Achievement[] = [
    {
      id: 1,
      name: 'Primera Batalla',
      icon: 'shield-checkmark',
      description: '¡Completaste tu primera batalla! El comienzo de una gran trayectoria.',
      matchesPlayed: 1,
      pointsEarned: 50,
      levelAchieved: 1,
    },
    {
      id: 2,
      name: 'Velocidad Luz',
      icon: 'flash',
      description: 'Respondiste todas las preguntas en tiempo récord. ¡Nadie es más rápido!',
      matchesPlayed: 5,
      pointsEarned: 200,
      levelAchieved: 3,
    },
    {
      id: 3,
      name: 'Racha Imparable',
      icon: 'flame',
      description: 'Ganaste 5 batallas consecutivas sin perder. ¡Eres imparable!',
      matchesPlayed: 5,
      pointsEarned: 500,
      levelAchieved: 5,
    },
    {
      id: 4,
      name: 'Maestro Estratega',
      icon: 'bulb',
      description: 'Dominaste todas las categorías con respuestas perfectas.',
      matchesPlayed: 10,
      pointsEarned: 300,
      levelAchieved: 4,
    },
    {
      id: 5,
      name: 'Campeón Invicto',
      icon: 'trophy',
      description: 'Alcanzaste 10 victorias seguidas. ¡Eres una leyenda!',
      matchesPlayed: 10,
      pointsEarned: 1000,
      levelAchieved: 8,
    },
    {
      id: 6,
      name: 'Perfeccionista',
      icon: 'star',
      description: 'Conseguiste una puntuación perfecta en una batalla.',
      matchesPlayed: 3,
      pointsEarned: 150,
      levelAchieved: 2,
    },
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
  };

  const getAchievementColor = (achievementId: number): string => {
    const colors: { [key: number]: string } = {
      1: 'from-blue-500 to-blue-700',
      2: 'from-yellow-400 to-orange-500',
      3: 'from-red-500 to-pink-600',
      4: 'from-purple-500 to-indigo-600',
      5: 'from-amber-400 to-yellow-600',
      6: 'from-teal-400 to-cyan-600',
    };
    return colors[achievementId] || 'from-gray-500 to-gray-700';
  };

  const calculateParallax = (index: number) => {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    const deltaX = (mousePosition.x - screenCenterX) / 50;
    const deltaY = (mousePosition.y - screenCenterY) / 50;
    const depth = (index % 3) + 1;

    return {
      transform: `translate(${deltaX * depth}px, ${deltaY * depth}px)`,
    };
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 pb-0">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all shadow-lg"
        >
          <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6 relative z-10">
        {/* Avatar 3D Section */}
        <div className="flex flex-col items-center mt-6 mb-8">
          <div
            className="relative w-48 h-48 mb-6"
            style={{
              transform: `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth / 2) / 30}deg) rotateX(${-(mousePosition.y - window.innerHeight / 2) / 30}deg)`,
              transition: 'transform 0.2s ease-out',
            }}
          >
            {/* 3D Avatar Container */}
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl ring-4 ring-white/20">
              <img
                src={user.imageUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
              {/* 3D Effect Overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-black/20 to-transparent pointer-events-none"></div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-2xl opacity-30 -z-10"></div>
          </div>

          {/* User Info */}
          <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
          <div className="flex items-center gap-2 text-emerald-400">
            <ion-icon name="trophy" class="text-xl"></ion-icon>
            <span className="text-lg font-semibold">Nivel {user.level}</span>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{achievements.length}</div>
              <div className="text-sm text-slate-400">Logros</div>
            </div>
            <div className="w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {achievements.reduce((sum, ach) => sum + (ach.pointsEarned || 0), 0)}
              </div>
              <div className="text-sm text-slate-400">Puntos</div>
            </div>
            <div className="w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {achievements.reduce((sum, ach) => sum + (ach.matchesPlayed || 0), 0)}
              </div>
              <div className="text-sm text-slate-400">Batallas</div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <ion-icon name="ribbon" class="text-2xl"></ion-icon>
            Tus Logros
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <button
                key={achievement.id}
                onClick={() => handleAchievementClick(achievement)}
                className="relative group"
                style={calculateParallax(index)}
              >
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getAchievementColor(achievement.id)} p-6 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl`}>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Icon */}
                  <div className="relative z-10 flex flex-col items-center text-white">
                    <ion-icon name={achievement.icon} class="text-5xl mb-3"></ion-icon>
                    <h3 className="text-sm font-bold text-center leading-tight">{achievement.name}</h3>
                  </div>

                  {/* Badge corner */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <ion-icon name="checkmark" class="text-lg text-white"></ion-icon>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="relative max-w-md w-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all"
            >
              <ion-icon name="close" class="text-2xl"></ion-icon>
            </button>

            {/* Header with gradient */}
            <div className={`relative p-8 bg-gradient-to-br ${getAchievementColor(selectedAchievement.id)}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center text-white">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                  <ion-icon name={selectedAchievement.icon} class="text-6xl"></ion-icon>
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">{selectedAchievement.name}</h2>
                <p className="text-white/90 text-center text-sm">{selectedAchievement.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <ion-icon name="game-controller-outline" class="text-3xl text-blue-400"></ion-icon>
                  <div className="text-2xl font-bold text-white mt-2">{selectedAchievement.matchesPlayed}</div>
                  <div className="text-xs text-slate-400">Partidas</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <ion-icon name="star-outline" class="text-3xl text-yellow-400"></ion-icon>
                  <div className="text-2xl font-bold text-white mt-2">{selectedAchievement.pointsEarned}</div>
                  <div className="text-xs text-slate-400">Puntos</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <ion-icon name="trending-up-outline" class="text-3xl text-emerald-400"></ion-icon>
                  <div className="text-2xl font-bold text-white mt-2">{selectedAchievement.levelAchieved}</div>
                  <div className="text-xs text-slate-400">Nivel</div>
                </div>
              </div>

              {/* Achievement date */}
              <div className="mt-6 p-4 rounded-xl bg-white/5 flex items-center gap-3">
                <ion-icon name="calendar-outline" class="text-2xl text-slate-400"></ion-icon>
                <div>
                  <div className="text-sm font-semibold text-white">Desbloqueado</div>
                  <div className="text-xs text-slate-400">Durante tu aventura en EduBattle</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementsScreen;
