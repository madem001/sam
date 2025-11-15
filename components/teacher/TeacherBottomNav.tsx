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

const NavItem: React.FC<NavItemProps> = ({ label, iconName, isActive, onClick }) => {
  const activeClasses = 'text-white -translate-y-4';
  const inactiveClasses = 'text-indigo-200 dark:text-indigo-300 hover:text-white';

  return (
    <button
      onClick={onClick}
      className="relative flex-1 z-10 flex flex-col items-center justify-center w-full transition-all duration-300 ease-in-out"
    >
      <div className={`flex flex-col items-center transform transition-all duration-300 ease-in-out ${isActive ? activeClasses : ''}`}>
        {/* FIX: Changed 'className' to 'class' for web component compatibility. */}
        <ion-icon name={iconName} class="text-3xl"></ion-icon>
        <span className={`text-xs font-bold mt-1`}>{label}</span>
      </div>
    </button>
  );
};

const TeacherBottomNav: React.FC<TeacherBottomNavProps> = ({ activeScreen, setActiveScreen, enabledModules, customModules }) => {
  const allStandardNavItems = [
    { screen: TeacherScreen.Dashboard, label: 'Inicio', iconName: 'home-outline' },
    { screen: TeacherScreen.BattleManager, label: 'Batallas', iconName: 'flash-outline' },
    { screen: TeacherScreen.QuestionBank, label: 'Preguntas', iconName: 'book-outline'},
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

  return (
    <div className="absolute bottom-0 left-0 right-0 h-24 text-white z-10">
      {/* Background */}
      <div className="absolute bottom-0 w-full h-16 bg-indigo-700 dark:bg-indigo-900"></div>

      {/* Wave Indicator */}
      {activeIndex !== -1 && (
        <div
            className="absolute top-0 h-24 transition-transform duration-300 ease-in-out"
            style={{
                width: `${100 / navItems.length}%`,
                transform: `translateX(${activeIndex * 100}%)`
            }}
        >
            <div className="relative w-full h-full">
                <svg viewBox="0 0 100 96" preserveAspectRatio="none" className="w-full h-full text-indigo-700 dark:text-indigo-900" fill="currentColor">
                    <path d="M50 0C25 0 25 32 0 32V96H100V32C75 32 75 0 50 0Z"/>
                </svg>
            </div>
        </div>
      )}

       {/* Navigation Items Container */}
       <div className="absolute top-0 left-0 right-0 h-full flex justify-around items-center pt-2">
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
  );
};

export default TeacherBottomNav;