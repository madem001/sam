# 🔌 GUÍA DE CONEXIÓN BACKEND - FRONTEND

Esta guía te muestra exactamente qué archivos modificar para conectar el frontend con el backend local.

---

## 📋 ÍNDICE

1. [APIs del Backend](#1-apis-del-backend)
2. [WebSocket para Realtime](#2-websocket-para-realtime)
3. [Conectar Frontend con Backend](#3-conectar-frontend-con-backend)
4. [Variables de Entorno](#4-variables-de-entorno)
5. [Ejemplo Completo](#5-ejemplo-completo)

---

## 1. APIs DEL BACKEND

### 📁 Ubicación de Archivos del Backend

```
src/backend/src/
├── routes/           # Define las rutas HTTP
│   ├── authRoutes.ts
│   ├── battleRoutes.ts
│   └── allForAllRoutes.ts (CREAR)
├── controllers/      # Maneja las peticiones
│   ├── authController.ts
│   ├── battleController.ts
│   └── allForAllController.ts (CREAR)
└── services/         # Lógica de negocio
    ├── authService.ts
    ├── battleService.ts
    └── allForAllService.ts (CREAR)
```

---

### 🛠️ PASO 1: Crear Rutas Nuevas

#### Archivo: `src/backend/src/routes/allForAllRoutes.ts` (CREAR NUEVO)

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as allForAllController from '../controllers/allForAllController';

const router = Router();

// Crear juego All for All
router.post('/', authenticate, allForAllController.createGame);

// Obtener juegos activos
router.get('/active', authenticate, allForAllController.getActiveGames);

// Enviar respuesta
router.post('/:gameId/response', authenticate, allForAllController.submitResponse);

// Terminar juego
router.post('/:gameId/end', authenticate, allForAllController.endGame);

// Obtener respuestas de un juego
router.get('/:gameId/responses', authenticate, allForAllController.getResponses);

export default router;
```

#### Archivo: `src/backend/src/server.ts` (MODIFICAR)

```typescript
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import battleRoutes from './routes/battleRoutes';
import allForAllRoutes from './routes/allForAllRoutes'; // AGREGAR
import { setupWebSocket } from './websocket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = setupWebSocket(httpServer);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/all-for-all', allForAllRoutes); // AGREGAR

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});

// Exportar io para usar en otros archivos
export { io };
```

---

### 🛠️ PASO 2: Crear Controllers

#### Archivo: `src/backend/src/controllers/allForAllController.ts` (CREAR NUEVO)

```typescript
import { Request, Response } from 'express';
import * as allForAllService from '../services/allForAllService';
import { io } from '../server';

export const createGame = async (req: Request, res: Response) => {
  try {
    const { wordText, wordColor, correctAnswer } = req.body;
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const game = await allForAllService.createGame({
      teacherId,
      wordText,
      wordColor,
      correctAnswer
    });

    // Emitir evento WebSocket
    io.emit('all-for-all:game-started', game);

    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getActiveGames = async (req: Request, res: Response) => {
  try {
    const games = await allForAllService.getActiveGames();
    res.json(games);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const submitResponse = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { buttonPressed, responseTime } = req.body;
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const response = await allForAllService.submitResponse({
      gameId,
      studentId,
      buttonPressed,
      responseTime
    });

    // Emitir actualización en tiempo real
    io.to(`game-${gameId}`).emit('all-for-all:new-response', response);

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const endGame = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const teacherId = req.user?.id;

    const game = await allForAllService.endGame(gameId, teacherId!);

    // Emitir fin de juego
    io.to(`game-${gameId}`).emit('all-for-all:game-ended', game);

    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getResponses = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const responses = await allForAllService.getResponses(gameId);
    res.json(responses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
```

---

### 🛠️ PASO 3: Crear Services

#### Archivo: `src/backend/src/services/allForAllService.ts` (CREAR NUEVO)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createGame = async (data: {
  teacherId: string;
  wordText: string;
  wordColor: string;
  correctAnswer: string;
}) => {
  // Verificar si hay otro juego activo
  const activeGame = await prisma.allForAllGame.findFirst({
    where: {
      isActive: true,
      teacherId: { not: data.teacherId }
    }
  });

  if (activeGame) {
    throw new Error('Ya hay un juego activo. Espera a que termine.');
  }

  // Crear nuevo juego
  const game = await prisma.allForAllGame.create({
    data: {
      teacherId: data.teacherId,
      wordText: data.wordText,
      wordColor: data.wordColor,
      correctAnswer: data.correctAnswer,
      isActive: true
    }
  });

  return game;
};

export const getActiveGames = async () => {
  return await prisma.allForAllGame.findMany({
    where: { isActive: true },
    include: {
      teacher: {
        select: { id: true, name: true }
      }
    }
  });
};

export const submitResponse = async (data: {
  gameId: string;
  studentId: string;
  buttonPressed: string;
  responseTime: string;
}) => {
  // Obtener el juego
  const game = await prisma.allForAllGame.findUnique({
    where: { id: data.gameId }
  });

  if (!game) {
    throw new Error('Juego no encontrado');
  }

  // Verificar respuesta correcta
  const isCorrect = data.buttonPressed === game.correctAnswer;

  // Contar respuestas existentes para calcular ranking
  const existingResponses = await prisma.allForAllResponse.count({
    where: { gameId: data.gameId }
  });

  const rankPosition = existingResponses + 1;

  // Calcular puntos (más puntos para respuestas más rápidas)
  let pointsAwarded = 0;
  if (isCorrect) {
    if (rankPosition === 1) pointsAwarded = 100;
    else if (rankPosition === 2) pointsAwarded = 80;
    else if (rankPosition === 3) pointsAwarded = 60;
    else pointsAwarded = Math.max(40 - (rankPosition * 2), 10);
  }

  // Crear respuesta
  const response = await prisma.allForAllResponse.create({
    data: {
      gameId: data.gameId,
      studentId: data.studentId,
      buttonPressed: data.buttonPressed,
      isCorrect,
      responseTime: data.responseTime,
      rankPosition,
      pointsAwarded
    },
    include: {
      student: {
        select: { id: true, name: true, avatarBase64: true }
      }
    }
  });

  return response;
};

export const endGame = async (gameId: string, teacherId: string) => {
  const game = await prisma.allForAllGame.findUnique({
    where: { id: gameId }
  });

  if (!game) {
    throw new Error('Juego no encontrado');
  }

  if (game.teacherId !== teacherId) {
    throw new Error('No tienes permiso para terminar este juego');
  }

  return await prisma.allForAllGame.update({
    where: { id: gameId },
    data: {
      isActive: false,
      endedAt: new Date()
    }
  });
};

export const getResponses = async (gameId: string) => {
  return await prisma.allForAllResponse.findMany({
    where: { gameId },
    include: {
      student: {
        select: { id: true, name: true, avatarBase64: true }
      }
    },
    orderBy: { rankPosition: 'asc' }
  });
};
```

---

## 2. WEBSOCKET PARA REALTIME

### 📁 Archivo: `src/backend/src/websocket/index.ts` (MODIFICAR)

```typescript
import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

export function setupWebSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('✅ Cliente conectado:', socket.id);

    // ========================================
    // BATALLAS
    // ========================================
    socket.on('battle:join', (battleId: string) => {
      socket.join(`battle-${battleId}`);
      console.log(`Usuario ${socket.id} se unió a batalla ${battleId}`);
    });

    socket.on('battle:leave', (battleId: string) => {
      socket.leave(`battle-${battleId}`);
    });

    // ========================================
    // ALL FOR ALL
    // ========================================
    socket.on('all-for-all:join', (gameId: string) => {
      socket.join(`game-${gameId}`);
      console.log(`Usuario ${socket.id} se unió a All for All ${gameId}`);
    });

    socket.on('all-for-all:leave', (gameId: string) => {
      socket.leave(`game-${gameId}`);
    });

    // ========================================
    // DESCONEXIÓN
    // ========================================
    socket.on('disconnect', () => {
      console.log('❌ Cliente desconectado:', socket.id);
    });
  });

  return io;
}

// Funciones helper para emitir eventos
export function emitBattleUpdate(io: any, battleId: string, data: any) {
  io.to(`battle-${battleId}`).emit('battle:update', data);
}

export function emitAllForAllUpdate(io: any, gameId: string, data: any) {
  io.to(`game-${gameId}`).emit('all-for-all:update', data);
}
```

---

## 3. CONECTAR FRONTEND CON BACKEND

### 📁 Archivo: `src/frontend/lib/localApi.ts` (CREAR NUEVO)

```typescript
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

// ========================================
// CONFIGURACIÓN DE AXIOS
// ========================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token JWT en todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========================================
// API DE AUTENTICACIÓN
// ========================================

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  register: async (email: string, password: string, name: string, role: 'STUDENT' | 'TEACHER') => {
    const { data } = await api.post('/auth/register', { email, password, name, role });
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
};

// ========================================
// API DE ALL FOR ALL
// ========================================

export const allForAllApi = {
  createGame: async (gameData: {
    wordText: string;
    wordColor: string;
    correctAnswer: string;
  }) => {
    const { data } = await api.post('/all-for-all', gameData);
    return data;
  },

  getActiveGames: async () => {
    const { data } = await api.get('/all-for-all/active');
    return data;
  },

  submitResponse: async (gameId: string, responseData: {
    buttonPressed: string;
    responseTime: string;
  }) => {
    const { data } = await api.post(`/all-for-all/${gameId}/response`, responseData);
    return data;
  },

  endGame: async (gameId: string) => {
    const { data } = await api.post(`/all-for-all/${gameId}/end`);
    return data;
  },

  getResponses: async (gameId: string) => {
    const { data } = await api.get(`/all-for-all/${gameId}/responses`);
    return data;
  }
};

// ========================================
// API DE BATALLAS (ejemplo básico)
// ========================================

export const battleApi = {
  create: async (battleData: any) => {
    const { data } = await api.post('/battles', battleData);
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/battles/${id}`);
    return data;
  },

  // ... más endpoints según necesites
};

// ========================================
// WEBSOCKET
// ========================================

let socket: Socket | null = null;

export const websocketApi = {
  connect: () => {
    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
    const token = localStorage.getItem('auth_token');

    socket = io(WS_URL, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  // Unirse a sala de All for All
  joinAllForAll: (gameId: string) => {
    if (socket) {
      socket.emit('all-for-all:join', gameId);
    }
  },

  // Salir de sala
  leaveAllForAll: (gameId: string) => {
    if (socket) {
      socket.emit('all-for-all:leave', gameId);
    }
  },

  // Escuchar actualizaciones
  onAllForAllUpdate: (callback: (data: any) => void) => {
    if (socket) {
      socket.on('all-for-all:update', callback);
    }
  },

  onNewResponse: (callback: (data: any) => void) => {
    if (socket) {
      socket.on('all-for-all:new-response', callback);
    }
  },

  onGameEnded: (callback: (data: any) => void) => {
    if (socket) {
      socket.on('all-for-all:game-ended', callback);
    }
  },

  // Limpiar listeners
  offAllEvents: () => {
    if (socket) {
      socket.off('all-for-all:update');
      socket.off('all-for-all:new-response');
      socket.off('all-for-all:game-ended');
    }
  }
};
```

---

## 4. VARIABLES DE ENTORNO

### 📁 Archivo: `.env` en la RAÍZ del proyecto (CREAR)

```env
# Frontend
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

### 📁 Archivo: `.env.example` en la RAÍZ (CREAR)

```env
# Frontend - URLs del backend
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

---

## 5. EJEMPLO COMPLETO: USAR EN UN COMPONENTE

### 📁 Archivo: `src/frontend/components/teacher/AllForAllControlScreen.tsx` (MODIFICAR)

```typescript
import React, { useState, useEffect } from 'react';
import { allForAllApi, websocketApi } from '../../lib/localApi';

interface AllForAllControlScreenProps {
  teacherId: string;
}

const AllForAllControlScreen: React.FC<AllForAllControlScreenProps> = ({ teacherId }) => {
  const [activeGame, setActiveGame] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [wordText, setWordText] = useState('ROJO');
  const [wordColor, setWordColor] = useState('blue');
  const [correctAnswer, setCorrectAnswer] = useState<'text' | 'color'>('color');

  useEffect(() => {
    // Conectar WebSocket al montar el componente
    websocketApi.connect();

    // Escuchar nuevas respuestas en tiempo real
    websocketApi.onNewResponse((response) => {
      console.log('Nueva respuesta:', response);
      setResponses(prev => [...prev, response]);
    });

    // Escuchar cuando el juego termina
    websocketApi.onGameEnded((game) => {
      console.log('Juego terminado:', game);
      setActiveGame(null);
    });

    return () => {
      // Limpiar al desmontar
      if (activeGame) {
        websocketApi.leaveAllForAll(activeGame.id);
      }
      websocketApi.offAllEvents();
    };
  }, [activeGame]);

  const startGame = async () => {
    try {
      console.log('🎮 Iniciando juego...');

      const game = await allForAllApi.createGame({
        wordText: wordText.toUpperCase(),
        wordColor: wordColor,
        correctAnswer: correctAnswer
      });

      console.log('✅ Juego creado:', game);
      setActiveGame(game);
      setResponses([]);

      // Unirse a la sala de WebSocket
      websocketApi.joinAllForAll(game.id);

    } catch (error: any) {
      console.error('❌ Error:', error);
      alert(error.response?.data?.error || 'Error al crear el juego');
    }
  };

  const endGame = async () => {
    if (!activeGame) return;

    try {
      await allForAllApi.endGame(activeGame.id);
      websocketApi.leaveAllForAll(activeGame.id);
      setActiveGame(null);
      setResponses([]);
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error al terminar el juego');
    }
  };

  const loadResponses = async () => {
    if (!activeGame) return;

    try {
      const data = await allForAllApi.getResponses(activeGame.id);
      setResponses(data);
    } catch (error) {
      console.error('Error cargando respuestas:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All for All - Control</h1>

      {!activeGame ? (
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Configurar Juego</h2>

          <div className="mb-4">
            <label className="block mb-2">Palabra:</label>
            <select
              value={wordText}
              onChange={(e) => setWordText(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="ROJO">ROJO</option>
              <option value="AZUL">AZUL</option>
              <option value="VERDE">VERDE</option>
              <option value="AMARILLO">AMARILLO</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Color del texto:</label>
            <select
              value={wordColor}
              onChange={(e) => setWordColor(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="red">Rojo</option>
              <option value="blue">Azul</option>
              <option value="green">Verde</option>
              <option value="yellow">Amarillo</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Respuesta correcta:</label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value as 'text' | 'color')}
              className="w-full p-2 border rounded"
            >
              <option value="text">Lo que dice el texto</option>
              <option value="color">El color del texto</option>
            </select>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-green-500 text-white p-3 rounded font-bold hover:bg-green-600"
          >
            Iniciar Juego
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Juego Activo</h2>

          <div className="mb-6 p-4 bg-gray-800 rounded">
            <p className="text-4xl font-bold text-center" style={{ color: wordColor }}>
              {wordText}
            </p>
          </div>

          <button
            onClick={loadResponses}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Actualizar Respuestas
          </button>

          <button
            onClick={endGame}
            className="mb-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Terminar Juego
          </button>

          <h3 className="font-bold mb-2">Respuestas ({responses.length}):</h3>
          <div className="space-y-2">
            {responses.map((response, idx) => (
              <div key={idx} className="p-3 border rounded">
                <span className="font-bold">#{response.rankPosition}</span> -{' '}
                {response.student.name} - {response.buttonPressed} -{' '}
                {response.isCorrect ? '✅' : '❌'} - {response.pointsAwarded} pts
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllForAllControlScreen;
```

---

## 🚀 CÓMO EJECUTAR TODO

### 1. Iniciar Backend

```bash
cd src/backend
npm install
npm run dev
```

Verás: `🚀 Backend corriendo en http://localhost:3001`

### 2. Iniciar Frontend

```bash
# En otra terminal, desde la raíz
npm run dev:frontend
```

Verás: Frontend en `http://localhost:5173`

### 3. O Ejecutar Todo Junto

```bash
# Desde la raíz
npm run dev
```

Esto ejecuta backend y frontend simultáneamente.

---

## ✅ CHECKLIST

Para cada funcionalidad que quieras agregar:

- [ ] Crear ruta en `src/backend/src/routes/`
- [ ] Crear controller en `src/backend/src/controllers/`
- [ ] Crear service en `src/backend/src/services/`
- [ ] Agregar endpoints en `src/frontend/lib/localApi.ts`
- [ ] Si necesita realtime, agregar eventos en `src/backend/src/websocket/index.ts`
- [ ] Modificar componente del frontend para usar la nueva API

---

## 📝 RESUMEN DE ARCHIVOS CLAVE

| Tipo | Backend | Frontend |
|------|---------|----------|
| **Rutas HTTP** | `src/backend/src/routes/*.ts` | - |
| **Lógica** | `src/backend/src/services/*.ts` | - |
| **WebSocket** | `src/backend/src/websocket/index.ts` | - |
| **Cliente API** | - | `src/frontend/lib/localApi.ts` |
| **Componentes** | - | `src/frontend/components/**/*.tsx` |
| **Variables** | `src/backend/.env` | `.env` (raíz) |

---

## 🎯 SIGUIENTE PASO

1. Copia el código de `localApi.ts`
2. Crea las rutas, controllers y services para All for All
3. Modifica `AllForAllControlScreen.tsx` para usar la nueva API
4. Prueba que funcione

¡Repite este proceso para cada módulo que necesites!
