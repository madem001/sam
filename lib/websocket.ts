import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const initWebSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(WS_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket conectado');
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket desconectado');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión WebSocket:', error.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinBattle = (battleId: string) => {
  if (socket?.connected) {
    socket.emit('join-battle', battleId);
  }
};

export const leaveBattle = (battleId: string) => {
  if (socket?.connected) {
    socket.emit('leave-battle', battleId);
  }
};

export const joinGroup = (groupId: string) => {
  if (socket?.connected) {
    socket.emit('join-group', groupId);
  }
};

export const leaveGroup = (groupId: string) => {
  if (socket?.connected) {
    socket.emit('leave-group', groupId);
  }
};

export const onBattleUpdate = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('battle-update', callback);
  }
};

export const onGroupUpdate = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('group-update', callback);
  }
};

export const onNotification = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('notification', callback);
  }
};

export const offBattleUpdate = (callback?: (data: any) => void) => {
  if (socket) {
    socket.off('battle-update', callback);
  }
};

export const offGroupUpdate = (callback?: (data: any) => void) => {
  if (socket) {
    socket.off('group-update', callback);
  }
};

export const offNotification = (callback?: (data: any) => void) => {
  if (socket) {
    socket.off('notification', callback);
  }
};
