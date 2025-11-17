import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AllForAllService {
  async createGame(teacherId: string, data: {
    wordText: string;
    wordColor: string;
    correctAnswer: string;
  }) {
    return await prisma.allForAllGame.create({
      data: {
        teacherId,
        wordText: data.wordText,
        wordColor: data.wordColor,
        correctAnswer: data.correctAnswer,
        isActive: true
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async getGame(id: string) {
    return await prisma.allForAllGame.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true
          }
        },
        responses: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            rankPosition: 'asc'
          }
        }
      }
    });
  }

  async getActiveGame(teacherId: string) {
    return await prisma.allForAllGame.findFirst({
      where: {
        teacherId,
        isActive: true
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true
          }
        },
        responses: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            rankPosition: 'asc'
          }
        }
      }
    });
  }

  async getAllGames(teacherId?: string) {
    return await prisma.allForAllGame.findMany({
      where: teacherId ? { teacherId } : undefined,
      include: {
        teacher: {
          select: {
            id: true,
            name: true
          }
        },
        responses: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async submitResponse(gameId: string, studentId: string, data: {
    buttonPressed: string;
    isCorrect: boolean;
    responseTime: string;
  }) {
    const game = await prisma.allForAllGame.findUnique({
      where: { id: gameId },
      include: {
        responses: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!game) {
      throw new Error('Juego no encontrado');
    }

    if (!game.isActive) {
      throw new Error('El juego ya terminó');
    }

    const existingResponse = await prisma.allForAllResponse.findUnique({
      where: {
        gameId_studentId: {
          gameId,
          studentId
        }
      }
    });

    if (existingResponse) {
      throw new Error('Ya has respondido a este juego');
    }

    const rankPosition = game.responses.length + 1;

    let pointsAwarded = 0;
    if (data.isCorrect) {
      if (rankPosition === 1) pointsAwarded = 100;
      else if (rankPosition === 2) pointsAwarded = 75;
      else if (rankPosition === 3) pointsAwarded = 50;
      else pointsAwarded = 25;
    }

    const response = await prisma.allForAllResponse.create({
      data: {
        gameId,
        studentId,
        buttonPressed: data.buttonPressed,
        isCorrect: data.isCorrect,
        responseTime: data.responseTime,
        rankPosition,
        pointsAwarded
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    if (pointsAwarded > 0) {
      await prisma.user.update({
        where: { id: studentId },
        data: {
          points: {
            increment: pointsAwarded
          }
        }
      });
    }

    return response;
  }

  async endGame(gameId: string) {
    return await prisma.allForAllGame.update({
      where: { id: gameId },
      data: {
        isActive: false,
        endedAt: new Date()
      },
      include: {
        responses: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            rankPosition: 'asc'
          }
        }
      }
    });
  }

  async getGameResults(gameId: string) {
    const game = await this.getGame(gameId);

    if (!game) {
      throw new Error('Juego no encontrado');
    }

    return {
      game: {
        id: game.id,
        wordText: game.wordText,
        wordColor: game.wordColor,
        correctAnswer: game.correctAnswer,
        isActive: game.isActive,
        createdAt: game.createdAt,
        endedAt: game.endedAt
      },
      responses: game.responses,
      stats: {
        totalResponses: game.responses.length,
        correctResponses: game.responses.filter(r => r.isCorrect).length,
        incorrectResponses: game.responses.filter(r => !r.isCorrect).length,
        totalPointsAwarded: game.responses.reduce((sum, r) => sum + r.pointsAwarded, 0)
      }
    };
  }
}

export default new AllForAllService();
