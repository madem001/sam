export enum UserRole {
  Student = 'STUDENT',
  Teacher = 'TEACHER',
  Admin = 'ADMIN'
}

export enum Screen {
  Login = 'LOGIN',
  Home = 'HOME',
  JoinBattle = 'JOIN_BATTLE',
  BattleLobby = 'BATTLE_LOBBY',
  StudentBattle = 'STUDENT_BATTLE',
  Profile = 'PROFILE',
  Achievements = 'ACHIEVEMENTS',
  Notifications = 'NOTIFICATIONS',
  TeacherDashboard = 'TEACHER_DASHBOARD'
}

export enum TeacherScreen {
  Dashboard = 'DASHBOARD',
  BattleManager = 'BATTLE_MANAGER',
  BattleControl = 'BATTLE_CONTROL',
  QuestionBank = 'QUESTION_BANK',
  StudentList = 'STUDENT_LIST',
  RewardsManagement = 'REWARDS_MANAGEMENT',
  Profile = 'PROFILE'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  level?: number;
  points?: number;
  streak?: number;
  imageUrl?: string;
  avatar?: string;
  unlockPoints?: number;
  subjects?: string[];
  skills?: string[];
  cycles?: string[];
  achievements?: Achievement[];
  notifications?: Notification[];
}

export interface Student extends User {
  role: UserRole.Student;
}

export interface Teacher extends User {
  role: UserRole.Teacher;
  subjects?: string[];
  skills?: string[];
  cycles?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface AuthData {
  userId?: string;
  name: string;
  email?: string;
  password?: string;
  role: UserRole;
  imageUrl?: string;
  subjects?: string[];
  skills?: string[];
  cycles?: string[];
}

export interface CustomModule {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface Professor {
  id: string;
  name: string;
  title: string;
  department: string;
  imageUrl: string;
  unlockPoints: number;
  locked: boolean;
}

export interface Question {
  id: string;
  text: string;
  answers: string[];
  correctIndex: number;
  category?: string;
  difficulty?: string;
}
