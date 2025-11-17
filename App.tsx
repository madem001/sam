import React, { useState, useEffect, useRef } from 'react';
import { Screen, User, UserRole, TeacherScreen, CustomModule, AuthData, Student, Notification } from './src/frontend/types/types';
import LoginScreen from './src/frontend/components/shared/LoginScreen';
import ProfileScreen from './src/frontend/components/student/ProfileScreen';
import BottomNav from './src/frontend/components/shared/BottomNav';
import AchievementsScreen from './src/frontend/components/student/AchievementsScreen';
import BattleLobbyScreen from './src/frontend/components/shared/BattleLobbyScreen';
import QuestionScreen from './src/frontend/components/shared/QuestionScreen';
import TriviaScreen from './src/frontend/components/student/TriviaScreen';
import WinnerScreen from './src/frontend/components/shared/WinnerScreen';
import LoserScreen from './src/frontend/components/shared/LoserScreen';
import TeacherDashboard from './src/frontend/components/teacher/TeacherDashboard';
import JoinBattleScreen from './src/frontend/components/student/JoinBattleScreen';
import LoadingScreen from './src/frontend/components/shared/LoadingScreen';
import AllForAllScreen from './src/frontend/components/student/AllForAllScreen';
// import { supabase } from './src/frontend/lib/supabase'; // DESHABILITADO - Usar backend local
import * as api from './api';

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState<Screen | string>(Screen.Profile);
  const [lastPointsWon, setLastPointsWon] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [joinBattleCode, setJoinBattleCode] = useState<string | null>(null);
  const theme = 'light';
  
  const [enabledModules, setEnabledModules] = useState<Set<Screen | TeacherScreen | string>>(
    new Set([
        Screen.Profile, Screen.JoinBattle, Screen.AllForAll, Screen.Achievements,
        TeacherScreen.Dashboard, TeacherScreen.BattleManager, TeacherScreen.AllForAll, TeacherScreen.QuestionBank, TeacherScreen.StudentList, TeacherScreen.Profile, 'rewards',
    ])
  );
  const [customModules, setCustomModules] = useState<CustomModule[]>([]);
  
  const appContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.className = 'light';

    const initializeApp = async () => {
      try {
        const savedUserId = localStorage.getItem('userId');

        if (savedUserId) {
          const profile = await api.authApi.getProfile(savedUserId);

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role as UserRole,
              imageUrl: profile.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
              points: profile.points || 0,
              level: profile.level || 1,
              streak: profile.streak || 0,
            });
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('userId');
          }
        }

        const users = await api.getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('❌ Error inicializando app:', error);
        localStorage.removeItem('userId');
      } finally {
        setIsAppLoading(false);
      }
    };

    initializeApp();
  }, []);
  
  
  useEffect(() => {
    if (user) {
        const updatedUser = allUsers.find(u => u.id === user.id);
        if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(user)) {
            setUser(updatedUser);
        }
    }
  }, [allUsers, user]);

  // DESHABILITADO - Usar WebSocket local en lugar de Supabase Realtime
  // useEffect(() => {
  //   if (!user || !isAuthenticated) return;

  //   const channel = supabase.channel('online-users', {
  //     config: {
  //       presence: {
  //         key: 'user_id',
  //       },
  //     },
  //   });

  //   channel
  //     .on('presence', { event: 'sync' }, () => {
  //     })
  //     .subscribe(async (status) => {
  //       if (status === 'SUBSCRIBED') {
  //         await channel.track({
  //           user_id: user.id,
  //           name: user.name,
  //           role: user.role,
  //           online_at: new Date().toISOString(),
  //         });
  //       }
  //     });

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [user, isAuthenticated]);


  const handleLoginSuccess = async (authData: AuthData) => {
    setIsLoading(true);

    try {
      const loggedInUser = await api.login(authData);

      if (loggedInUser) {
          setUser(loggedInUser);
          localStorage.setItem('userId', loggedInUser.id);

          if (loggedInUser.role === UserRole.Student) {
              setActiveScreen(Screen.Profile);
          } else if (loggedInUser.role === UserRole.Teacher) {
              setActiveScreen(TeacherScreen.Dashboard);
          }

          setIsAuthenticated(true);
      } else {
          console.error('❌ No se obtuvo usuario');
          alert("No se pudo obtener el usuario.");
      }
    } catch (error) {
      console.error('❌ Error en handleLoginSuccess:', error);
      alert('Error al iniciar sesión');
    }

    setIsLoading(false);
  };
  
  const handleLogout = () => {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('userId');
  };

  const handleUserUpdate = async (updatedData: Partial<User>) => {
    if (!user) return;

    try {
      const updates: { name?: string; avatar?: string } = {};
      if (updatedData.name) updates.name = updatedData.name;
      if (updatedData.imageUrl) updates.avatar = updatedData.imageUrl;

      if (Object.keys(updates).length > 0) {
        await api.authApi.updateProfile(user.id, updates);
      }

      setUser(prevUser => (prevUser ? { ...prevUser, ...updatedData } : null));
      setAllUsers(prevAllUsers => prevAllUsers.map(u => u.id === user?.id ? { ...u, ...updatedData } : u));
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
    }
  };

  const sendBattleInvitations = (studentIds: string[], roomCode: string, battleName: string, inviterName: string) => {
    // Esta lógica simula el envío. En un backend real, el servidor manejaría esto.
    // Aquí actualizamos el estado local para reflejar las notificaciones.
    setAllUsers(currentUsers => {
        return currentUsers.map(u => {
            if (studentIds.includes(u.id)) {
                const newNotification: Notification = {
                    id: `notif-${Date.now()}-${u.id}`,
                    message: `El ${inviterName} te ha invitado a la batalla "${battleName}".`,
                    read: false,
                    type: 'battle_invite',
                    payload: { battleName, roomCode, inviter: inviterName }
                };
                return {
                    ...u,
                    notifications: [newNotification, ...(u.notifications || [])]
                };
            }
            return u;
        });
    });
    alert(`Invitaciones enviadas a ${studentIds.length} estudiante(s).`);
  };

  const handleJoinFromNotification = (code: string) => {
    setJoinBattleCode(code);
    setActiveScreen(Screen.JoinBattle);
  };

  const handleMarkNotificationsRead = (notificationIds: string[]) => {
      if (!user) return;
      const idsToMark = new Set(notificationIds);
      const updatedNotifications = (user.notifications || []).map(n => 
          idsToMark.has(n.id) ? { ...n, read: true } : n
      );
      handleUserUpdate({ notifications: updatedNotifications });
  };

  const handleGameWin = (points: number) => {
    setLastPointsWon(points);
    setActiveScreen(Screen.Winner);
  };

  const handleGameLose = () => {
    setLastPointsWon(0);
    setActiveScreen(Screen.Loser);
  };

  const handleReturnToProfile = () => {
    setActiveScreen(Screen.Profile);
    setTimeout(() => setLastPointsWon(0), 2000);
  };

  const handleStartTrivia = () => {
    setActiveScreen(Screen.Trivia);
  };

  const handleQuestionGameComplete = (score: number) => {
    if (score > 0) {
      handleStartTrivia();
    } else {
      handleGameLose();
    }
  };

  const renderStudentContent = () => {
    if (!user) return null;
    let content;
    switch (activeScreen) {
      case Screen.Profile:
        content = (
            <ProfileScreen
                user={user}
                lastPointsWon={lastPointsWon}
                onLogout={handleLogout}
                onUpdateUser={handleUserUpdate}
                onJoinFromNotification={handleJoinFromNotification}
                onMarkAsRead={handleMarkNotificationsRead}
            />
        );
        break;
      case Screen.JoinBattle:
        content = <JoinBattleScreen onBack={() => setActiveScreen(Screen.Profile)} studentId={user.id} studentName={user.name} />;
        break;
      case Screen.BattleLobby:
        content = <BattleLobbyScreen onBack={() => setActiveScreen(Screen.JoinBattle)} />;
        break;
      case Screen.Achievements:
        content = <AchievementsScreen user={user} onBack={() => setActiveScreen(Screen.Profile)} />;
        break;
      case Screen.AllForAll:
        content = <AllForAllScreen userId={user.id} />;
        break;
      case Screen.Questions:
        content = <QuestionScreen onGameComplete={handleQuestionGameComplete} onBack={() => setActiveScreen(Screen.Profile)} />;
        break;
      case Screen.Trivia:
        content = <TriviaScreen onWin={handleGameWin} onLose={handleGameLose} onBack={() => setActiveScreen(Screen.Questions)} />;
        break;
      case Screen.Winner:
        content = <WinnerScreen points={lastPointsWon} onContinue={handleReturnToProfile} />;
        break;
      case Screen.Loser:
        content = <LoserScreen onContinue={handleReturnToProfile} />;
        break;
      default:
        const customModule = customModules.find(m => m.id === activeScreen && m.role === UserRole.Student && enabledModules.has(m.id as any));
        if (customModule) {
             content = <BattleLobbyScreen onBack={() => setActiveScreen(Screen.Profile)} />;
        } else {
            content = <ProfileScreen user={user} onLogout={handleLogout} onUpdateUser={handleUserUpdate} onJoinFromNotification={handleJoinFromNotification} onMarkAsRead={handleMarkNotificationsRead} />;
        }
        break;
    }
    return <div key={activeScreen} className="h-full">{content}</div>;
  };

  const renderAuthenticatedContent = () => {

      if (!user) {
        return null;
      }


      switch(user.role) {
          case UserRole.Teacher:
              const students = allUsers.filter(u => u.role === UserRole.Student);
              return <TeacherDashboard user={user} onLogout={handleLogout} enabledModules={enabledModules} customModules={customModules} students={students} onInviteStudents={(studentIds, roomCode, battleName) => sendBattleInvitations(studentIds, roomCode, battleName, user.name)} />;
          case UserRole.Student:
              return (
                <>
                    <main className="flex-1 overflow-y-auto">
                        {renderStudentContent()}
                    </main>
                    <BottomNav activeScreen={activeScreen as Screen} setActiveScreen={setActiveScreen} enabledModules={enabledModules} customModules={customModules} />
                </>
              );
          case UserRole.Admin:
              const allStudents = allUsers.filter(u => u.role === UserRole.Student);
              return <TeacherDashboard user={user} onLogout={handleLogout} enabledModules={enabledModules} customModules={customModules} students={allStudents} onInviteStudents={(studentIds, roomCode, battleName) => sendBattleInvitations(studentIds, roomCode, battleName, user.name)} theme={theme} onToggleTheme={handleToggleTheme} />;
          default:
            return null;
      }
  }
  
  const renderAppContent = () => {

      if (isAppLoading) {
        return <LoadingScreen />;
      }
      if (isLoading) {
          return (
              <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
              </div>
          );
      }

      if (isAuthenticated && user) {
        return renderAuthenticatedContent();
      } else {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
      }
  }

  return (
    <div ref={appContainerRef} className="relative w-full max-w-md h-screen mx-auto shadow-2xl overflow-hidden flex flex-col overflow-x-hidden transition-colors duration-300">
      {renderAppContent()}
    </div>
  );
};

export default App;