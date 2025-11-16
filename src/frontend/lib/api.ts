// ARCHIVO DESHABILITADO - Reemplazar con backend local
// Ver GUIA_CONEXION_BACKEND.md para implementar con API REST

export const authApi = {
  register: async (email: string, password: string, name: string, role: 'STUDENT' | 'TEACHER', avatar?: string) => {
    console.warn('⚠️ authApi está deshabilitado. Implementar con backend local.');
    console.log('Ver GUIA_CONEXION_BACKEND.md para crear localApi.ts');
    throw new Error('API no implementada. Ver GUIA_CONEXION_BACKEND.md');
  },

  login: async (email: string, password: string) => {
    console.warn('⚠️ authApi está deshabilitado. Implementar con backend local.');
    throw new Error('API no implementada. Ver GUIA_CONEXION_BACKEND.md');
  },

  logout: async () => {
    console.warn('⚠️ authApi está deshabilitado.');
  },

  updateProfile: async (userId: string, updates: any) => {
    console.warn('⚠️ authApi está deshabilitado.');
    throw new Error('API no implementada. Ver GUIA_CONEXION_BACKEND.md');
  }
};

export const professorCardsApi = {
  getAllCards: async () => {
    console.warn('⚠️ professorCardsApi está deshabilitado.');
    return [];
  },

  getStudentCards: async (studentId: string) => {
    console.warn('⚠️ professorCardsApi está deshabilitado.');
    return [];
  },

  assignCardToStudent: async (studentId: string, cardId: string) => {
    console.warn('⚠️ professorCardsApi está deshabilitado.');
    return null;
  }
};

export const battleApi = {
  // Stubs para compatibilidad
};
