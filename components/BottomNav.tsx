import React from 'react';
import { Screen, TeacherScreen, CustomModule, UserRole } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen | string) => void;
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
        class={`text-2xl transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-600'}`}
      ></ion-icon>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen, enabledModules, customModules }) => {
  const allStandardNavItems = [
    { screen: Screen.Profile, label: 'Perfil', iconName: 'person-outline' },
    { screen: Screen.JoinBattle, label: 'Batalla', iconName: 'flash-outline' },
    { screen: Screen.Achievements, label: 'Logros', iconName: 'trophy-outline' },
    { screen: Screen.Questions, label: 'Preguntas', iconName: 'help-circle-outline' },
  ];

  const standardNavItems = allStandardNavItems.filter(item => enabledModules.has(item.screen));

  const customNavItems = customModules
    .filter(module => module.role === UserRole.Student && enabledModules.has(module.id))
    .map(module => ({
        screen: module.id,
        label: module.name,
        iconName: module.icon
    }));

  const navItems = [...standardNavItems, ...customNavItems];

  const activeIndex = navItems.findIndex(item => item.screen === activeScreen);

  if (navItems.length === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      {/* Bouncing Ball Indicator */}
      {activeIndex !== -1 && (
        <div
          key={activeScreen}
          className="absolute transition-all duration-500 ease-out"
          style={{
            left: `calc(${(activeIndex / navItems.length) * 100}% + ${50 / navItems.length}% - 28px)`,
            top: '-28px',
          }}
        >
          <div className="relative">
            {/* Ball with bounce animation */}
            <div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 shadow-xl flex items-center justify-center"
              style={{
                animation: 'bounce-tab 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
              }}
            >
              <ion-icon
                name={navItems[activeIndex].iconName}
                class="text-3xl text-white"
              ></ion-icon>
            </div>
            {/* Shadow */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black/20 rounded-full blur-sm animate-pulse"
            ></div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-slate-200 rounded-t-3xl shadow-2xl">
        <div className="flex justify-around items-center h-20 px-4">
          {navItems.map(item => (
            <NavItem
              key={item.screen}
              label={item.label}
              iconName={item.iconName}
              isActive={activeScreen === item.screen}
              onClick={() => setActiveScreen(item.screen as Screen)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
