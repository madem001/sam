import { AuthData, User, Professor, Question, UserRole } from './src/frontend/types/types';
import { MOCK_USERS, MOCK_PROFESSORS, MOCK_QUESTIONS, MOCK_TRIVIA_QUESTIONS } from './mocks';
import { authApi } from './src/frontend/lib/api';

export { authApi };

// --- Simulación de latencia de red ---
const networkDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Login usando Supabase Auth + datos del perfil
 * @param authData - Datos de autenticación con información del usuario
 * @returns - El objeto de usuario con todos los datos
 */
export const login = async (authData: AuthData): Promise<User | null> => {

    if (authData.role === UserRole.Admin) {
        const adminUser: User = {
            id: 'admin-1',
            name: 'Administrador',
            role: UserRole.Admin,
            level: 99,
            points: 0,
            streak: 0,
            imageUrl: 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff&bold=true&size=128',
            unlockPoints: 9999,
        };
        return adminUser;
    }

    const userId = authData.userId || 'temp-' + Date.now();

    const user: User = {
        id: userId,
        name: authData.name || 'Usuario',
        role: authData.role,
        level: 1,
        points: 0,
        streak: 0,
        imageUrl: authData.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authData.name || 'U')}&background=e2e8f0&color=64748b&bold=true&size=128`,
        unlockPoints: 100,
        achievements: [],
        notifications: [],
    };

    if (authData.role === UserRole.Teacher && authData.subjects) {
        user.subjects = authData.subjects;
        user.skills = authData.skills;
        user.cycles = authData.cycles;
    }

    return user;
};

/**
 * Obtiene la lista completa de usuarios.
 * @returns - Un array de todos los usuarios de prueba.
 */
export const getAllUsers = async (): Promise<User[]> => {
    await networkDelay(200);
    return MOCK_USERS;
};

/**
 * Obtiene la lista de cartas de profesores.
 * @returns - Un array de todos los profesores de prueba.
 */
export const getProfessors = async (): Promise<Professor[]> => {
    await networkDelay(300);
    return MOCK_PROFESSORS;
};

/**
 * Obtiene las preguntas del banco de preguntas del profesor.
 * @returns - Un array de preguntas de prueba.
 */
export const getQuestionBank = async (): Promise<Question[]> => {
    await networkDelay(400);
    return MOCK_QUESTIONS;
};

/**
 * Obtiene las preguntas para el juego de trivia.
 * @returns - Un array de preguntas de trivia de prueba.
 */
export const getTriviaQuestions = async (): Promise<Question[]> => {
    await networkDelay(100);
    return MOCK_TRIVIA_QUESTIONS;
};
