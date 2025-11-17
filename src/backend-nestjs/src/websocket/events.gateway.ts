import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeBattles = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);

    for (const [battleId, clients] of this.activeBattles.entries()) {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.activeBattles.delete(battleId);
        }
      }
    }
  }

  @SubscribeMessage('join-battle')
  handleJoinBattle(
    @MessageBody() data: { battleId: string; userId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { battleId, userId, userName } = data;

    client.join(battleId);

    if (!this.activeBattles.has(battleId)) {
      this.activeBattles.set(battleId, new Set());
    }
    this.activeBattles.get(battleId).add(client.id);

    this.server.to(battleId).emit('player-joined', {
      userId,
      userName,
      timestamp: new Date(),
    });

    console.log(`👤 ${userName} joined battle ${battleId}`);
  }

  @SubscribeMessage('leave-battle')
  handleLeaveBattle(
    @MessageBody() data: { battleId: string; userId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { battleId, userId, userName } = data;

    client.leave(battleId);

    const clients = this.activeBattles.get(battleId);
    if (clients) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.activeBattles.delete(battleId);
      }
    }

    this.server.to(battleId).emit('player-left', {
      userId,
      userName,
      timestamp: new Date(),
    });

    console.log(`👤 ${userName} left battle ${battleId}`);
  }

  @SubscribeMessage('battle-start')
  handleBattleStart(@MessageBody() data: { battleId: string }) {
    this.server.to(data.battleId).emit('battle-started', {
      battleId: data.battleId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('answer-submitted')
  handleAnswerSubmitted(
    @MessageBody() data: {
      battleId: string;
      userId: string;
      questionId: string;
      isCorrect: boolean;
      points: number;
    },
  ) {
    this.server.to(data.battleId).emit('answer-result', data);
  }

  @SubscribeMessage('battle-end')
  handleBattleEnd(@MessageBody() data: { battleId: string; results: any[] }) {
    this.server.to(data.battleId).emit('battle-ended', data);
  }

  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }
}
