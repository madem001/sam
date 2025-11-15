import React, { useState, useEffect, useRef } from 'react';
import { TeacherScreen, User, Screen, CustomModule, Student } from '../../types';
import TeacherBottomNav from './TeacherBottomNav';
import DashboardScreen from './DashboardScreen';
import TeacherProfileScreen from './TeacherProfileScreen';
import BattleManagerScreen from './BattleManagerScreen';
import QuestionBankScreen from './QuestionBankScreen';
import StudentListScreen from './StudentListScreen';
import BattleLobbyScreen from '../BattleLobbyScreen';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
  enabledModules: Set<Screen | TeacherScreen | string>;
  customModules: CustomModule[];
  students: User[];
  onInviteStudents: (studentIds: string[], roomCode: string, battleName: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout, enabledModules, customModules, students, onInviteStudents, theme, onToggleTheme }) => {
  const [activeScreen, setActiveScreen] = useState<TeacherScreen | string>(TeacherScreen.Dashboard);
  
  const navigateTo = (screen: TeacherScreen) => setActiveScreen(screen);

  const renderContent = () => {
    let content;
    const handleBack = () => setActiveScreen(TeacherScreen.Dashboard);
    switch (activeScreen) {
      case TeacherScreen.Dashboard:
        content = <DashboardScreen navigateTo={navigateTo}/>;
        break;
      case TeacherScreen.BattleManager:
        content = <BattleManagerScreen students={students} onInvite={onInviteStudents} onBack={handleBack} />;
        break;
      case TeacherScreen.QuestionBank:
        content = <QuestionBankScreen onBack={handleBack} />;
        break;
      case TeacherScreen.StudentList:
        content = <StudentListScreen onBack={handleBack} />;
        break;
      case TeacherScreen.Profile:
        content = <TeacherProfileScreen user={user} onLogout={onLogout} theme={theme} onToggleTheme={onToggleTheme} />;
        break;
      default:
        const customModule = customModules.find(m => m.id === activeScreen);
        if (customModule) {
            content = <BattleLobbyScreen onBack={handleBack} />; // Placeholder for custom modules
        } else {
            content = <DashboardScreen navigateTo={navigateTo} />;
        }
        break;
    }
    return <div key={activeScreen as string}>{content}</div>;
  };

  return (
    <>
      <main className="flex-grow overflow-y-auto p-4 md:p-6 pb-32 bg-slate-50 dark:bg-slate-900">
        {renderContent()}
      </main>
      <TeacherBottomNav 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
        enabledModules={enabledModules} 
        customModules={customModules} 
      />
    </>
  );
};

export default TeacherDashboard;