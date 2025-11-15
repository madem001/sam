import { AuthData, User, Professor, Question } from './types';
import { MOCK_USERS, MOCK_PROFESSORS, MOCK_QUESTIONS, MOCK_TRIVIA_QUESTIONS } from './mocks';

// --- Simulación de latencia de red ---
const networkDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Simula una llamada de login al backend.
 * Encuentra el primer usuario que coincide con el rol solicitado.
 * @param authData - Datos de autenticación, principalmente el rol.
 * @returns - El objeto de usuario o null si no se encuentra.
 */
export const login = async (authData: AuthData): Promise<User | null> => {
    await networkDelay(500);
    const user = MOCK_USERS.find(u => u.role === authData.role);
    return user || null;
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
