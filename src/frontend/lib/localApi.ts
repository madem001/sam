import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (email: string, password: string, name: string, role: 'STUDENT' | 'TEACHER', avatar?: string) => {
    const { data } = await api.post('/auth/register', { email, password, name, role, avatar });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  updateProfile: async (userId: string, updates: { name?: string; avatar?: string }) => {
    const { data } = await api.put('/auth/profile', updates);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data }));
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getAllStudents: async () => {
    const { data } = await api.get('/auth/students');
    return data;
  }
};

export const battleApi = {
  createBattle: async (battleData: {
    name: string;
    questions: any[];
    timeLimit?: number;
    maxPlayers?: number;
  }) => {
    const { data } = await api.post('/battles', battleData);
    return data;
  },

  getBattleById: async (id: string) => {
    const { data } = await api.get(`/battles/${id}`);
    return data;
  },

  getActiveBattles: async () => {
    const { data } = await api.get('/battles/active');
    return data;
  },

  joinBattle: async (battleId: string) => {
    const { data } = await api.post(`/battles/${battleId}/join`);
    return data;
  },

  startBattle: async (battleId: string) => {
    const { data } = await api.post(`/battles/${battleId}/start`);
    return data;
  },

  submitAnswer: async (battleId: string, questionId: string, answer: string) => {
    const { data } = await api.post(`/battles/${battleId}/answer`, {
      questionId,
      answer
    });
    return data;
  },

  endBattle: async (battleId: string) => {
    const { data } = await api.post(`/battles/${battleId}/end`);
    return data;
  },

  getBattleResults: async (battleId: string) => {
    const { data } = await api.get(`/battles/${battleId}/results`);
    return data;
  }
};

let socket: Socket | null = null;

export const websocketApi = {
  connect: () => {
    const token = localStorage.getItem('auth_token');

    socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => socket,

  joinBattle: (battleId: string) => {
    if (socket) {
      socket.emit('battle:join', battleId);
      console.log('🎮 Unido a batalla:', battleId);
    }
  },

  leaveBattle: (battleId: string) => {
    if (socket) {
      socket.emit('battle:leave', battleId);
      console.log('👋 Saliendo de batalla:', battleId);
    }
  },

  onBattleUpdate: (callback: (data: any) => void) => {
    if (socket) {
      socket.on('battle:update', callback);
    }
  },

  onPlayerJoined: (callback: (data: any) => void) => {
    if (socket) {
      socket.on('battle:player-joined', callback);
    }
  },

  onBattleStarted: (callback: (data: any) => void) => {
    if (socket) {
      socket.on('battle:started', callback);
    }
  },

  onQuestionUpdate: (callback: (data: any) => void) => {
    if (socket) {
      socket.on('battle:question', callback);
    }
  },

  onAnswerSubmitted: (callback: (data: any) => void) => {
    if (socket) {
      socket.on('battle:answer-submitted', callback);
    }
  },

  onBattleEnded: (callback: (data: any) => void) => {
    if (socket) {
      socket.on('battle:ended', callback);
    }
  },

  offAllBattleEvents: () => {
    if (socket) {
      socket.off('battle:update');
      socket.off('battle:player-joined');
      socket.off('battle:started');
      socket.off('battle:question');
      socket.off('battle:answer-submitted');
      socket.off('battle:ended');
    }
  }
};

export const professorCardsApi = {
  getAllCards: async () => {
    console.warn('⚠️ Professor Cards API no implementada aún en backend');
    return [];
  },

  getStudentCards: async (studentId: string) => {
    console.warn('⚠️ Professor Cards API no implementada aún en backend');
    return [];
  },

  assignCardToStudent: async (studentId: string, cardId: string) => {
    console.warn('⚠️ Professor Cards API no implementada aún en backend');
    return null;
  }
};
