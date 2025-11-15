import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

let io: SocketIOServer;

export const initWebSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.data.user.userId}`);

    socket.on('join-battle', (battleId: string) => {
      socket.join(`battle:${battleId}`);
      console.log(`Usuario ${socket.data.user.userId} se unió a la batalla ${battleId}`);
    });

    socket.on('leave-battle', (battleId: string) => {
      socket.leave(`battle:${battleId}`);
      console.log(`Usuario ${socket.data.user.userId} salió de la batalla ${battleId}`);
    });

    socket.on('join-group', (groupId: string) => {
      socket.join(`group:${groupId}`);
      console.log(`Usuario ${socket.data.user.userId} se unió al grupo ${groupId}`);
    });

    socket.on('leave-group', (groupId: string) => {
      socket.leave(`group:${groupId}`);
      console.log(`Usuario ${socket.data.user.userId} salió del grupo ${groupId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.data.user.userId}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io no ha sido inicializado');
  }
  return io;
};

export const broadcastBattleUpdate = (battleId: string, payload: any) => {
  if (io) {
    io.to(`battle:${battleId}`).emit('battle-update', {
      battleId,
      ...payload,
    });
  }
};

export const broadcastGroupUpdate = (battleId: string, groupId: string, payload?: any) => {
  if (io) {
    io.to(`battle:${battleId}`).emit('group-update', {
      battleId,
      groupId,
      ...payload,
    });
  }
};

export const notifyUser = (userId: string, message: string, payload?: any) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      message,
      payload,
      timestamp: new Date().toISOString(),
    });
  }
};
