import React from 'react';

// FIX: Declare global type for 'ion-icon' custom element.
// This ensures it is recognized by TypeScript's JSX parser across the application.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // FIX: Updated the type definition for 'ion-icon' to be more specific,
      // which resolves TS errors and allows standard attributes like 'class'.
      'ion-icon': React.HTMLAttributes<HTMLElement> & {
        name?: string;
        class?: string;
      };
    }
  }
}

export enum Screen {
  Login = 'LOGIN',
  Profile = 'PROFILE',
  Achievements = 'ACHIEVEMENTS',
  Questions = 'QUESTIONS',
  Battle = 'BATTLE',
  JoinBattle = 'JOIN_BATTLE',
  BattleLobby = 'BATTLE_LOBBY',
  Trivia = 'TRIVIA',
  Winner = 'WINNER',
  Loser = 'LOSER',
  AllForAll = 'ALL_FOR_ALL',
}

export enum TeacherScreen {
  Dashboard = 'DASHBOARD',
  BattleManager = 'BATTLE_MANAGER',
  QuestionBank = 'QUESTION_BANK',
  StudentList = 'STUDENT_LIST',
  Profile = 'PROFILE',
  AllForAll = 'ALL_FOR_ALL_CONTROL',
}

export enum UserRole {
    Student = 'STUDENT',
    Teacher = 'TEACHER',
}

export interface Skill {
  name: string;
  score: number;
}

export interface Professor {
  id: number;
  name: string;
  title: string;
  imageUrl: string;
  skills: Skill[];
  locked: boolean;
}

export interface Achievement {
  id: number;
  name: string;
  icon: string; // ionicon name
  description: string;
  matchesPlayed?: number;
  pointsEarned?: number;
  levelAchieved?: number;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  type: 'battle_invite' | 'generic';
  payload?: {
    battleName: string;
    roomCode: string;
    inviter: string;
  };
}

export interface User {
  id: string; // FEAT: Added unique ID for user identification and targeting.
  name: string;
  level: number;
  imageUrl: string;
  avatarUrl?: string;
  achievements: Achievement[];
  role: UserRole;
  gender: 'male' | 'female';
  notifications?: Notification[]; // FEAT: Added notifications for battle invites.
  // Teacher-specific fields
  subjects?: string[];
  skills?: string[];
  cycles?: string[];
}

export interface Question {
    id: string;
    text: string;
    answers: string[];
    correctAnswerIndex: number;
}

export interface Student {
    id: string;
    name: string;
    level: number;
    imageUrl: string;
}

// Added for the new module management feature
export interface AppModule {
    id: Screen | TeacherScreen;
    name: string;
    description: string;
    role: UserRole.Student | UserRole.Teacher;
}

// Added for the new dynamic module creator feature
export interface CustomModule {
    id: string;
    name: string;
    icon: string;
    role: UserRole.Student | UserRole.Teacher;
    gameMode: 'individual' | 'group';
    accessMethod: 'code' | 'qr' | 'both';
}

// Added to standardize login/registration data payload
export interface AuthData {
    role: UserRole;
    name?: string;
    subjects?: string[];
    skills?: string[];
    cycles?: string[];
    imageUrl?: string;
}