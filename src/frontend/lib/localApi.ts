import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

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

  getProfile: async () => {
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
  createCard: async (cardData: {
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    attack: number;
    defense: number;
    speed: number;
    special?: string;
  }) => {
    const { data } = await api.post('/professor-cards', cardData);
    return data;
  },

  getAllCards: async () => {
    const { data } = await api.get('/professor-cards');
    return data;
  },

  getCardById: async (cardId: string) => {
    const { data } = await api.get(`/professor-cards/${cardId}`);
    return data;
  },

  getCardsByProfessor: async (professorId: string) => {
    const { data } = await api.get(`/professor-cards/professor/${professorId}`);
    return data;
  },

  updateCard: async (cardId: string, updates: any) => {
    const { data } = await api.put(`/professor-cards/${cardId}`, updates);
    return data;
  },

  deleteCard: async (cardId: string) => {
    const { data } = await api.delete(`/professor-cards/${cardId}`);
    return data;
  },

  assignCardToStudent: async (studentId: string, cardId: string) => {
    const { data } = await api.post('/professor-cards/assign', { studentId, cardId });
    return data;
  },

  getStudentCards: async (studentId: string) => {
    const { data } = await api.get(`/professor-cards/student/${studentId}`);
    return data;
  },

  removeCardFromStudent: async (studentId: string, cardId: string) => {
    const { data } = await api.delete(`/professor-cards/student/${studentId}/card/${cardId}`);
    return data;
  },

  giveProfessorPoints: async (studentId: string, points: number) => {
    const { data } = await api.post('/professor-cards/points', { studentId, points });
    return data;
  },

  getStudentProfessorPoints: async (studentId: string) => {
    const { data } = await api.get(`/professor-cards/points/student/${studentId}`);
    return data;
  }
};

export const achievementsApi = {
  createDefinition: async (achievementData: {
    name: string;
    description: string;
    icon: string;
    unlockCondition: string;
    pointsReward: number;
  }) => {
    const { data } = await api.post('/achievements/definitions', achievementData);
    return data;
  },

  getAllDefinitions: async () => {
    const { data } = await api.get('/achievements/definitions');
    return data;
  },

  getDefinitionById: async (id: string) => {
    const { data } = await api.get(`/achievements/definitions/${id}`);
    return data;
  },

  updateDefinition: async (id: string, updates: any) => {
    const { data } = await api.put(`/achievements/definitions/${id}`, updates);
    return data;
  },

  deleteDefinition: async (id: string) => {
    const { data } = await api.delete(`/achievements/definitions/${id}`);
    return data;
  },

  unlockForUser: async (userId: string, achievementId: string) => {
    const { data } = await api.post('/achievements/unlock', { userId, achievementId });
    return data;
  },

  getUserAchievements: async (userId: string) => {
    const { data } = await api.get(`/achievements/user/${userId}`);
    return data;
  },

  checkAndUnlock: async () => {
    const { data } = await api.post('/achievements/check');
    return data;
  },

  getProgress: async (userId: string) => {
    const { data } = await api.get(`/achievements/progress/${userId}`);
    return data;
  }
};

export const questionsApi = {
  createQuestionSet: async (setData: {
    name: string;
    questions: any[];
  }) => {
    const { data } = await api.post('/questions', setData);
    return data;
  },

  getQuestionSet: async (id: string) => {
    const { data } = await api.get(`/questions/${id}`);
    return data;
  },

  getAllQuestionSets: async () => {
    const { data } = await api.get('/questions');
    return data;
  },

  getTeacherQuestionSets: async (teacherId: string) => {
    const { data } = await api.get(`/questions/teacher/${teacherId}`);
    return data;
  },

  updateQuestionSet: async (id: string, updates: any) => {
    const { data } = await api.put(`/questions/${id}`, updates);
    return data;
  },

  deleteQuestionSet: async (id: string) => {
    const { data } = await api.delete(`/questions/${id}`);
    return data;
  },

  duplicateQuestionSet: async (id: string, newName: string) => {
    const { data } = await api.post(`/questions/${id}/duplicate`, { newName });
    return data;
  }
};

export const allForAllApi = {
  createGame: async (gameData: {
    wordText: string;
    wordColor: string;
    correctAnswer: string;
  }) => {
    const { data } = await api.post('/all-for-all', gameData);
    return data;
  },

  getGame: async (id: string) => {
    const { data } = await api.get(`/all-for-all/${id}`);
    return data;
  },

  getActiveGame: async () => {
    const { data } = await api.get('/all-for-all/active');
    return data;
  },

  getAllGames: async (teacherId?: string) => {
    const { data } = await api.get('/all-for-all', {
      params: { teacherId }
    });
    return data;
  },

  submitResponse: async (gameId: string, responseData: {
    buttonPressed: string;
    isCorrect: boolean;
    responseTime: string;
  }) => {
    const { data } = await api.post(`/all-for-all/${gameId}/response`, responseData);
    return data;
  },

  endGame: async (id: string) => {
    const { data } = await api.post(`/all-for-all/${id}/end`);
    return data;
  },

  getResults: async (id: string) => {
    const { data } = await api.get(`/all-for-all/${id}/results`);
    return data;
  }
};

export const rewardsApi = {
  createReward: async (rewardData: {
    name: string;
    description: string;
    costPoints: number;
    isActive?: boolean;
  }) => {
    const { data } = await api.post('/rewards', rewardData);
    return data;
  },

  getReward: async (id: string) => {
    const { data } = await api.get(`/rewards/${id}`);
    return data;
  },

  getAllRewards: async (teacherId?: string, activeOnly: boolean = false) => {
    const { data } = await api.get('/rewards', {
      params: { teacherId, activeOnly }
    });
    return data;
  },

  updateReward: async (id: string, updates: any) => {
    const { data } = await api.put(`/rewards/${id}`, updates);
    return data;
  },

  deleteReward: async (id: string) => {
    const { data } = await api.delete(`/rewards/${id}`);
    return data;
  },

  redeemReward: async (rewardId: string) => {
    const { data } = await api.post('/rewards/redeem', { rewardId });
    return data;
  }
};

export const notificationsApi = {
  createNotification: async (notificationData: {
    userId: string;
    message: string;
    type: string;
    payload?: any;
  }) => {
    const { data } = await api.post('/notifications', notificationData);
    return data;
  },

  getUserNotifications: async (unreadOnly: boolean = false) => {
    const { data } = await api.get('/notifications', {
      params: { unreadOnly }
    });
    return data;
  },

  getNotification: async (id: string) => {
    const { data } = await api.get(`/notifications/${id}`);
    return data;
  },

  markAsRead: async (id: string) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },

  deleteNotification: async (id: string) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },

  deleteAll: async () => {
    const { data } = await api.delete('/notifications');
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get('/notifications/unread-count');
    return data;
  },

  sendBulk: async (bulkData: {
    userIds: string[];
    message: string;
    type: string;
    payload?: any;
  }) => {
    const { data } = await api.post('/notifications/bulk', bulkData);
    return data;
  }
};
