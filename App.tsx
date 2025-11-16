import React, { useState, useEffect, useRef } from 'react';
import { Screen, User, UserRole, TeacherScreen, CustomModule, AuthData, Student, Notification } from './types';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import BottomNav from './components/BottomNav';
import AchievementsScreen from './components/AchievementsScreen';
import BattleLobbyScreen from './components/BattleLobbyScreen';
import QuestionScreen from './components/QuestionScreen';
import TriviaScreen from './components/TriviaScreen';
import WinnerScreen from './components/WinnerScreen';
import LoserScreen from './components/LoserScreen';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import JoinBattleScreen from './components/JoinBattleScreen';
import LoadingScreen from './components/LoadingScreen';
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [enabledModules, setEnabledModules] = useState<Set<Screen | TeacherScreen | string>>(
    new Set([
        Screen.Profile, Screen.JoinBattle, Screen.Achievements, Screen.Questions,
        TeacherScreen.Dashboard, TeacherScreen.BattleManager, TeacherScreen.QuestionBank, TeacherScreen.StudentList, TeacherScreen.Profile, 'rewards',
    ])
  );
  const [customModules, setCustomModules] = useState<CustomModule[]>([]);
  
  const appContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';
    setTheme(initialTheme);
    document.documentElement.className = initialTheme;

    const initializeApp = async () => {
      try {
        const savedUserId = localStorage.getItem('userId');

        if (savedUserId) {
          console.log('🔄 Restaurando sesión para usuario:', savedUserId);
          const profile = await api.authApi.getProfile(savedUserId);

          if (profile) {
            console.log('✅ Sesión restaurada:', profile);
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
            console.log('⚠️ Perfil no encontrado, limpiando sesión');
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
    document.documentElement.className = theme;
  }, [theme]);
  
  useEffect(() => {
    if (user) {
        const updatedUser = allUsers.find(u => u.id === user.id);
        if (updatedUser && JSON.stringify(updatedUser) !== JSON.stringify(user)) {
            setUser(updatedUser);
        }
    }
  }, [allUsers, user]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleLoginSuccess = async (authData: AuthData) => {
    console.log('🎯 App.handleLoginSuccess llamado con:', authData);
    setIsLoading(true);

    try {
      const loggedInUser = await api.login(authData);
      console.log('👤 Usuario logueado:', loggedInUser);

      if (loggedInUser) {
          setUser(loggedInUser);
          localStorage.setItem('userId', loggedInUser.id);
          console.log('✅ User state actualizado y sesión guardada');

          if (loggedInUser.role === UserRole.Student) {
              setActiveScreen(Screen.Profile);
              console.log('📱 Screen set to Profile');
          } else if (loggedInUser.role === UserRole.Teacher) {
              setActiveScreen(TeacherScreen.Dashboard);
              console.log('📱 Screen set to Teacher Dashboard');
          }

          setIsAuthenticated(true);
          console.log('✅ Autenticado correctamente');
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
      console.log('👋 Sesión cerrada');
  };

  const handleUserUpdate = async (updatedData: Partial<User>) => {
    if (!user) return;

    try {
      const updates: { name?: string; avatar?: string } = {};
      if (updatedData.name) updates.name = updatedData.name;
      if (updatedData.imageUrl) updates.avatar = updatedData.imageUrl;

      if (Object.keys(updates).length > 0) {
        await api.authApi.updateProfile(user.id, updates);
        console.log('✅ Perfil actualizado en la base de datos');
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
                theme={theme}
                onToggleTheme={handleToggleTheme}
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
        content = <AchievementsScreen user={user} theme={theme} onBack={() => setActiveScreen(Screen.Profile)} />;
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
            content = <ProfileScreen user={user} onLogout={handleLogout} onUpdateUser={handleUserUpdate} onJoinFromNotification={handleJoinFromNotification} onMarkAsRead={handleMarkNotificationsRead} theme={theme} onToggleTheme={handleToggleTheme} />;
        }
        break;
    }
    return <div key={activeScreen} className="h-full">{content}</div>;
  };

  const renderAuthenticatedContent = () => {
      console.log('🎨 renderAuthenticatedContent - user:', user);
      console.log('🎨 isAuthenticated:', isAuthenticated);
      console.log('🎨 activeScreen:', activeScreen);

      if (!user) {
        console.log('❌ No hay usuario');
        return null;
      }

      console.log('🎨 User role:', user.role, 'Comparando con Student:', UserRole.Student, 'Son iguales:', user.role === UserRole.Student);

      switch(user.role) {
          case UserRole.Teacher:
              console.log('👨‍🏫 Renderizando Teacher Dashboard');
              const students = allUsers.filter(u => u.role === UserRole.Student);
              return <TeacherDashboard user={user} onLogout={handleLogout} enabledModules={enabledModules} customModules={customModules} students={students} onInviteStudents={(studentIds, roomCode, battleName) => sendBattleInvitations(studentIds, roomCode, battleName, user.name)} theme={theme} onToggleTheme={handleToggleTheme} />;
          case UserRole.Student:
              console.log('👨‍🎓 Renderizando Student Screen');
              return (
                <>
                    <main className="flex-1 overflow-y-auto">
                        {renderStudentContent()}
                    </main>
                    <BottomNav activeScreen={activeScreen as Screen} setActiveScreen={setActiveScreen} enabledModules={enabledModules} customModules={customModules} />
                </>
              );
          case UserRole.Admin:
              console.log('👨‍💼 Renderizando Admin Screen');
              const allStudents = allUsers.filter(u => u.role === UserRole.Student);
              return <TeacherDashboard user={user} onLogout={handleLogout} enabledModules={enabledModules} customModules={customModules} students={allStudents} onInviteStudents={(studentIds, roomCode, battleName) => sendBattleInvitations(studentIds, roomCode, battleName, user.name)} theme={theme} onToggleTheme={handleToggleTheme} />;
          default:
            console.log('❌ Role no reconocido:', user.role);
            return null;
      }
  }
  
  const renderAppContent = () => {
      console.log('🖼️ renderAppContent - isAppLoading:', isAppLoading, 'isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', !!user);

      if (isAppLoading) {
        console.log('⏳ Mostrando LoadingScreen (app cargando)');
        return <LoadingScreen />;
      }
      if (isLoading) {
          console.log('⏳ Mostrando spinner (isLoading)');
          return (
              <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 dark:border-sky-400"></div>
              </div>
          );
      }

      if (isAuthenticated && user) {
        console.log('✅ Usuario autenticado, renderizando contenido');
        return renderAuthenticatedContent();
      } else {
        console.log('🔐 Mostrando LoginScreen');
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