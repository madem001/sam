import React from 'react';
import { TeacherScreen, Screen, CustomModule, UserRole } from '../../types';

interface TeacherBottomNavProps {
  activeScreen: TeacherScreen | string;
  setActiveScreen: (screen: TeacherScreen | string) => void;
  enabledModules: Set<Screen | TeacherScreen | string>;
  customModules: CustomModule[];
}

interface NavItemProps {
  label: string;
  iconName: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ iconName, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative flex-1 flex flex-col items-center justify-center py-4 transition-all duration-300"
    >
      <ion-icon
        name={iconName}
        class={`text-2xl transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-emerald-600'}`}
      ></ion-icon>
    </button>
  );
};

const TeacherBottomNav: React.FC<TeacherBottomNavProps> = ({ activeScreen, setActiveScreen, enabledModules, customModules }) => {
  const allStandardNavItems = [
    { screen: TeacherScreen.Dashboard, label: 'Inicio', iconName: 'home-outline' },
    { screen: TeacherScreen.BattleManager, label: 'Batallas', iconName: 'flash-outline' },
    { screen: TeacherScreen.QuestionBank, label: 'Preguntas', iconName: 'book-outline'},
    { screen: 'rewards', label: 'Recompensas', iconName: 'gift-outline'},
    { screen: TeacherScreen.StudentList, label: 'Estudiantes', iconName: 'people-outline'},
    { screen: TeacherScreen.Profile, label: 'Perfil', iconName: 'person-outline' },
  ];

  const standardNavItems = allStandardNavItems.filter(item => enabledModules.has(item.screen));

  const customNavItems = customModules
    .filter(module => module.role === UserRole.Teacher && enabledModules.has(module.id))
    .map(module => ({
        screen: module.id,
        label: module.name,
        iconName: module.icon
    }));

  const navItems = [...standardNavItems, ...customNavItems];
  const activeIndex = navItems.findIndex(item => item.screen === activeScreen);

  if (navItems.length === 0) return null;

  // Calculate notch position based on active index
  const notchXPercent = activeIndex !== -1
    ? (activeIndex / navItems.length) * 100 + (50 / navItems.length)
    : 50;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      {/* Floating Active Button */}
      {activeIndex !== -1 && (
        <div
          key={activeScreen}
          className="absolute transition-all duration-500 ease-out z-30"
          style={{
            left: `calc(${(activeIndex / navItems.length) * 100}% + ${50 / navItems.length}% - 32px)`,
            bottom: '45px',
          }}
        >
          <div className="relative">
            {/* Floating ball with white border */}
            <div className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                <ion-icon
                  name={navItems[activeIndex].iconName}
                  class="text-3xl text-white"
                ></ion-icon>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar with notch */}
      <div className="relative bg-white shadow-2xl overflow-visible" style={{ height: '80px' }}>
        {/* Notch cutout using clip-path */}
        <div
          className="absolute inset-0 bg-white shadow-lg transition-all duration-500 ease-out"
          style={{
            clipPath: activeIndex !== -1
              ? `path('M 0,25 L ${notchXPercent - 12.5}%,25 Q ${notchXPercent - 10}%,25 ${notchXPercent - 8}%,20 Q ${notchXPercent - 5}%,10 ${notchXPercent - 3}%,5 Q ${notchXPercent}%,0 ${notchXPercent + 3}%,5 Q ${notchXPercent + 5}%,10 ${notchXPercent + 8}%,20 Q ${notchXPercent + 10}%,25 ${notchXPercent + 12.5}%,25 L 100%,25 L 100%,100% L 0,100% Z')`
              : 'inset(25% 0 0 0 round 0)',
          }}
        />

        {/* Navigation items */}
        <div className="relative flex justify-around items-center h-full px-4 z-10">
          {navItems.map(item => (
            <NavItem
              key={item.screen}
              label={item.label}
              iconName={item.iconName}
              isActive={activeScreen === item.screen}
              onClick={() => setActiveScreen(item.screen)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherBottomNav;
