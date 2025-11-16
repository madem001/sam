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
      className="relative flex-1 flex flex-col items-center justify-center py-4"
    >
      <ion-icon
        name={iconName}
        class={`text-2xl ${isActive ? 'invisible' : 'text-gray-600'}`}
        style={{ transition: 'none' }}
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

  const notchCenterX = activeIndex !== -1
    ? (activeIndex / navItems.length) * 100 + (50 / navItems.length)
    : 50;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10">
      {/* Floating Active Button */}
      {activeIndex !== -1 && (
        <div
          className="absolute transition-all duration-700 ease-in-out z-30"
          style={{
            left: `calc(${notchCenterX}% - 30px)`,
            bottom: '32px',
          }}
        >
          <div className="w-[60px] h-[60px] rounded-full bg-white shadow-2xl flex items-center justify-center">
            <div className="w-[52px] h-[52px] rounded-full bg-black flex items-center justify-center">
              <ion-icon
                name={navItems[activeIndex].iconName}
                class="text-2xl text-white"
              ></ion-icon>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar with curved notch */}
      <div className="relative" style={{ height: '70px' }}>
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 70"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8f9fa" />
            </linearGradient>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="-2" stdDeviation="4" floodOpacity="0.1"/>
            </filter>
          </defs>

          <path
            d={`
              M 0,18
              L ${notchCenterX * 4 - 50},18
              Q ${notchCenterX * 4 - 42},18 ${notchCenterX * 4 - 38},16
              Q ${notchCenterX * 4 - 32},12 ${notchCenterX * 4 - 28},9
              Q ${notchCenterX * 4 - 20},3 ${notchCenterX * 4},0
              Q ${notchCenterX * 4 + 20},3 ${notchCenterX * 4 + 28},9
              Q ${notchCenterX * 4 + 32},12 ${notchCenterX * 4 + 38},16
              Q ${notchCenterX * 4 + 42},18 ${notchCenterX * 4 + 50},18
              L 400,18
              L 400,70
              L 0,70
              Z
            `}
            fill="url(#barGradient)"
            filter="url(#shadow)"
            className="transition-all duration-700 ease-in-out"
          />
        </svg>

        {/* Navigation items */}
        <div className="relative flex justify-around items-center h-full px-6 z-10">
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
