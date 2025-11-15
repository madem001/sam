const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

const apiFetch = async (endpoint: string, options: FetchOptions = {}) => {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...restOptions,
    headers: finalHeaders,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const authApi = {
  register: async (email: string, password: string, name: string, role: 'STUDENT' | 'TEACHER') => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
      requiresAuth: false,
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      requiresAuth: false,
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  getMe: async () => {
    return apiFetch('/auth/me');
  },

  updateProfile: async (name?: string, avatar?: string) => {
    return apiFetch('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name, avatar }),
    });
  },

  getStudents: async () => {
    return apiFetch('/auth/students');
  },
};

export const battleApi = {
  createBattle: async (
    name: string,
    questionCount: number,
    groupCount: number,
    questions: { text: string; answers: string[]; correctIndex: number }[],
    studentsPerGroup?: number
  ) => {
    return apiFetch('/battles', {
      method: 'POST',
      body: JSON.stringify({ name, questionCount, groupCount, questions, studentsPerGroup }),
    });
  },

  getTeacherBattles: async () => {
    return apiFetch('/battles/teacher');
  },

  getBattle: async (battleId: string) => {
    return apiFetch(`/battles/${battleId}`);
  },

  getBattleGroups: async (battleId: string) => {
    return apiFetch(`/battles/${battleId}/groups`);
  },

  getBattleQuestions: async (battleId: string) => {
    return apiFetch(`/battles/${battleId}/questions`);
  },

  getBattleAnswers: async (battleId: string) => {
    return apiFetch(`/battles/${battleId}/answers`);
  },

  joinGroup: async (groupCode: string, studentId: string, studentName: string) => {
    return apiFetch('/battles/join', {
      method: 'POST',
      body: JSON.stringify({ groupCode, studentId, studentName }),
    });
  },

  submitAnswer: async (
    battleId: string,
    groupId: string,
    questionId: string,
    answerIndex: number,
    responseTimeMs: number
  ) => {
    return apiFetch('/battles/answer', {
      method: 'POST',
      body: JSON.stringify({ battleId, groupId, questionId, answerIndex, responseTimeMs }),
    });
  },

  startBattle: async (battleId: string) => {
    return apiFetch(`/battles/${battleId}/start`, {
      method: 'POST',
    });
  },

  nextQuestion: async (battleId: string) => {
    return apiFetch(`/battles/${battleId}/next`, {
      method: 'POST',
    });
  },

  getGroupMembers: async (groupId: string) => {
    return apiFetch(`/battles/groups/${groupId}/members`);
  },
};
