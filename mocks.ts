import { User, UserRole, Professor, Question } from './src/frontend/types/types';

export const MOCK_USERS: User[] = [
    {
        id: 'student-alex-1', name: 'Alex Innovator', level: 1, imageUrl: 'https://picsum.photos/seed/student-default/200/200', avatarUrl: 'https://models.readyplayer.me/668d948b2d3ce445d45e45c4.glb', gender: 'male',
        achievements: [
            { id: 1, name: 'Primera Batalla', icon: 'flame-outline', description: 'Participa en tu primera batalla.', matchesPlayed: 1, pointsEarned: 30, levelAchieved: 1 },
            { id: 2, name: 'Maestro del Color', icon: 'color-palette-outline', description: 'Gana el desafío de colores sin fallar.', matchesPlayed: 5, pointsEarned: 100, levelAchieved: 3 },
            { id: 3, name: 'Rey de la Trivia', icon: 'help-circle-outline', description: 'Consigue 100 puntos en una trivia.', matchesPlayed: 3, pointsEarned: 100, levelAchieved: 5 },
        ], 
        role: UserRole.Student, notifications: [],
    },
    { 
        id: 'teacher-diana-1', name: 'Prof. Diana Salas', level: 1, imageUrl: 'https://picsum.photos/seed/teacher123/200/200', gender: 'female',
        achievements: [], role: UserRole.Teacher, subjects: ['Frontend'], skills: ['React'], cycles: ['5to'], notifications: [],
    },
    {
        id: 'student-ana-2', name: 'Ana García', level: 14, imageUrl: 'https://picsum.photos/seed/student1/100/100',
        role: UserRole.Student, gender: 'female', achievements: [], notifications: [],
    },
    {
        id: 'student-luis-3', name: 'Luis Pérez', level: 11, imageUrl: 'https://picsum.photos/seed/student2/100/100',
        role: UserRole.Student, gender: 'male', achievements: [], notifications: [],
    }
];

export const MOCK_PROFESSORS: Professor[] = [
    { id: 1, name: 'Dr. Ada Lovelace', title: 'Algoritmos', imageUrl: 'https://picsum.photos/seed/prof1/400/500', skills: [{ name: 'Lógica de Programación', score: 95 }, { name: 'Estructura de Datos', score: 88 }], locked: false },
    { id: 2, name: 'Dr. Alan Turing', title: 'Computación', imageUrl: 'https://picsum.photos/seed/prof2/400/500', skills: [{ name: 'Criptografía', score: 98 }, { name: 'Inteligencia Artificial', score: 92 }], locked: false },
    { id: 3, name: 'Dr. Grace Hopper', title: 'Sistemas', imageUrl: 'https://picsum.photos/seed/prof3/400/500', skills: [{ name: 'Compiladores', score: 92 }, { name: 'Arquitectura de Software', score: 85 }], locked: true },
    { id: 4, name: 'Dr. Tim Berners-Lee', title: 'Redes', imageUrl: 'https://picsum.photos/seed/prof4/400/500', skills: [{ name: 'Protocolos HTTP', score: 99 }, { name: 'Desarrollo Web', score: 94 }], locked: false },
    { id: 5, name: 'Dr. Margaret Hamilton', title: 'Software Engineering', imageUrl: 'https://picsum.photos/seed/prof5/400/500', skills: [{ name: 'Apollo Guidance Computer', score: 100 }, { name: 'Pruebas de Software', score: 96 }], locked: true },
];

export const MOCK_QUESTIONS: Question[] = [
    { id: 'q1', text: '¿Qué es un componente en React?', answers: ['Una función que retorna HTML', 'Una clase de CSS', 'Un archivo de video', 'Una base de datos'], correctAnswerIndex: 0 },
    { id: 'q2', text: '¿Cuál de estos es un hook de React?', answers: ['useLoop', 'useEffect', 'useIf', 'useStyle'], correctAnswerIndex: 1 },
];

export const MOCK_TRIVIA_QUESTIONS: Question[] = [
  {
    id: 'tq1',
    text: '¿Cuál es la capital de Francia?',
    answers: ['Londres', 'Berlín', 'París', 'Madrid'],
    correctAnswerIndex: 2,
  },
  {
    id: 'tq2',
    text: '¿Qué planeta es conocido como el Planeta Rojo?',
    answers: ['Tierra', 'Marte', 'Júpiter', 'Saturno'],
    correctAnswerIndex: 1,
  },
  {
    id: 'tq3',
    text: '¿Quién escribió "Don Quijote de la Mancha"?',
    answers: ['García Márquez', 'Shakespeare', 'Cervantes', 'Vargas Llosa'],
    correctAnswerIndex: 2,
  },
];
