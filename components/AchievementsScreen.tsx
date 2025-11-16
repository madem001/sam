import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlock_condition: string;
  points_reward: number;
  unlocked?: boolean;
  unlocked_at?: string;
  matches_played?: number;
  points_earned?: number;
  level_achieved?: number;
}

interface AchievementsScreenProps {
  user: User;
  onBack: () => void;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ user, onBack }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [user.id]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const loadAchievements = async () => {
    try {
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points_reward', { ascending: true });

      if (achievementsError) throw achievementsError;

      const { data: studentAchievements, error: studentError } = await supabase
        .from('student_achievements')
        .select('*')
        .eq('student_id', user.id);

      if (studentError) throw studentError;

      const unlockedMap = new Map(
        (studentAchievements || []).map(sa => [sa.achievement_id, sa])
      );

      const enrichedAchievements = (allAchievements || []).map(ach => ({
        ...ach,
        unlocked: unlockedMap.has(ach.id),
        ...unlockedMap.get(ach.id),
      }));

      setAchievements(enrichedAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
  };

  const getAchievementColor = (icon: string, unlocked: boolean): string => {
    if (!unlocked) return 'from-gray-200 to-gray-300';

    const colors: { [key: string]: string } = {
      'shield-checkmark': 'from-blue-400 to-blue-600',
      'flash': 'from-yellow-400 to-orange-500',
      'flame': 'from-red-400 to-pink-500',
      'bulb': 'from-purple-400 to-indigo-500',
      'trophy': 'from-amber-400 to-yellow-500',
      'star': 'from-teal-400 to-cyan-500',
      'lock-open': 'from-emerald-400 to-green-500',
      'game-controller': 'from-rose-400 to-pink-500',
    };
    return colors[icon] || 'from-blue-400 to-blue-600';
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

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points_reward, 0);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="text-center">
          <ion-icon name="trophy" class="text-6xl text-blue-500 animate-pulse"></ion-icon>
          <p className="text-slate-600 mt-4">Cargando logros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-50 relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-10"
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
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white shadow-lg transition-all"
        >
          <ion-icon name="arrow-back-outline" class="text-xl"></ion-icon>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6 relative z-10">
        {/* 3D Cartoon Avatar Section */}
        <div className="flex flex-col items-center mt-6 mb-8">
          <div
            className="relative w-48 h-48 mb-6"
            style={{
              transform: `perspective(1000px) rotateY(${(mousePosition.x - window.innerWidth / 2) / 30}deg) rotateX(${-(mousePosition.y - window.innerHeight / 2) / 30}deg)`,
              transition: 'transform 0.2s ease-out',
            }}
          >
            {/* 3D Cartoon Avatar Container */}
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl ring-4 ring-blue-300/50 bg-gradient-to-br from-orange-300 to-orange-400">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Cartoon-style simplified avatar based on photo */}
                <div className="relative w-full h-full">
                  {/* Base face */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-orange-200 to-orange-300"></div>

                  {/* Photo overlay with cartoon filter */}
                  <img
                    src={user.imageUrl}
                    alt={user.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-full mix-blend-multiply opacity-60"
                    style={{ filter: 'contrast(1.2) saturate(1.5)' }}
                  />

                  {/* Cartoon highlights */}
                  <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white/40 blur-xl"></div>
                  <div className="absolute bottom-12 right-12 w-12 h-12 rounded-full bg-orange-600/20 blur-lg"></div>

                  {/* Eyes overlay for cartoon effect */}
                  <div className="absolute top-[35%] left-1/2 -translate-x-1/2 flex gap-8">
                    <div className="w-8 h-10 bg-white rounded-full shadow-inner relative">
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-5 bg-slate-800 rounded-full"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="w-8 h-10 bg-white rounded-full shadow-inner relative">
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-5 bg-slate-800 rounded-full"></div>
                      <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Smile */}
                  <div className="absolute top-[55%] left-1/2 -translate-x-1/2 w-12 h-6 border-b-4 border-slate-700 rounded-b-full"></div>
                </div>
              </div>

              {/* 3D Effect Overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-black/10 to-transparent pointer-events-none"></div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-2xl opacity-20 -z-10"></div>
          </div>

          {/* User Info */}
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{user.name}</h1>
          <div className="flex items-center gap-2 text-emerald-600">
            <ion-icon name="trophy" class="text-xl"></ion-icon>
            <span className="text-lg font-semibold">Nivel {user.level}</span>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">{unlockedCount}</div>
              <div className="text-sm text-slate-500">Logros</div>
            </div>
            <div className="w-px bg-slate-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">{totalPoints}</div>
              <div className="text-sm text-slate-500">Puntos</div>
            </div>
            <div className="w-px bg-slate-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800">{achievements.length}</div>
              <div className="text-sm text-slate-500">Totales</div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ion-icon name="ribbon" class="text-2xl text-blue-600"></ion-icon>
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
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getAchievementColor(achievement.icon, achievement.unlocked || false)} p-6 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl ${!achievement.unlocked ? 'opacity-50' : ''}`}>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Icon */}
                  <div className="relative z-10 flex flex-col items-center text-white">
                    <ion-icon name={achievement.icon} class="text-5xl mb-3"></ion-icon>
                    <h3 className="text-sm font-bold text-center leading-tight">{achievement.name}</h3>
                  </div>

                  {/* Badge corner */}
                  {achievement.unlocked && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                      <ion-icon name="checkmark" class="text-lg text-white"></ion-icon>
                    </div>
                  )}

                  {/* Lock icon for locked achievements */}
                  {!achievement.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ion-icon name="lock-closed" class="text-4xl text-slate-600/50"></ion-icon>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
            >
              <ion-icon name="close" class="text-2xl"></ion-icon>
            </button>

            {/* Header with gradient */}
            <div className={`relative p-8 bg-gradient-to-br ${getAchievementColor(selectedAchievement.icon, selectedAchievement.unlocked || false)}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center text-white">
                <div className="w-24 h-24 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mb-4 shadow-xl">
                  <ion-icon name={selectedAchievement.icon} class="text-6xl"></ion-icon>
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">{selectedAchievement.name}</h2>
                <p className="text-white/95 text-center text-sm">{selectedAchievement.description}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 bg-gradient-to-b from-slate-50 to-white">
              {selectedAchievement.unlocked ? (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <ion-icon name="game-controller-outline" class="text-3xl text-blue-500"></ion-icon>
                      <div className="text-2xl font-bold text-slate-800 mt-2">{selectedAchievement.matches_played || 0}</div>
                      <div className="text-xs text-slate-600">Partidas</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-yellow-50 border border-yellow-100">
                      <ion-icon name="star-outline" class="text-3xl text-yellow-500"></ion-icon>
                      <div className="text-2xl font-bold text-slate-800 mt-2">{selectedAchievement.points_reward}</div>
                      <div className="text-xs text-slate-600">Puntos</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                      <ion-icon name="trending-up-outline" class="text-3xl text-emerald-500"></ion-icon>
                      <div className="text-2xl font-bold text-slate-800 mt-2">{selectedAchievement.level_achieved || user.level}</div>
                      <div className="text-xs text-slate-600">Nivel</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <ion-icon name="checkmark-circle" class="text-2xl text-emerald-600"></ion-icon>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-800">¡Logro Desbloqueado!</div>
                      <div className="text-xs text-slate-600">
                        {selectedAchievement.unlocked_at
                          ? new Date(selectedAchievement.unlocked_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : 'Durante tu aventura en EduBattle'}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 text-center">
                  <ion-icon name="lock-closed-outline" class="text-5xl text-slate-400 mb-3"></ion-icon>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">Logro Bloqueado</h3>
                  <p className="text-sm text-slate-600 mb-4">{selectedAchievement.description}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700">
                    <ion-icon name="star" class="text-lg"></ion-icon>
                    <span className="text-sm font-semibold">+{selectedAchievement.points_reward} puntos al desbloquear</span>
                  </div>
                </div>
              )}
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
