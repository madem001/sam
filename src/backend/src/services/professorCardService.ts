import { PrismaClient, CardRarity } from '@prisma/client';

const prisma = new PrismaClient();

export class ProfessorCardService {
  async createProfessorCard(professorId: string, data: {
    rarity: CardRarity;
    attack: number;
    defense: number;
    speed: number;
    special?: string;
  }) {
    return await prisma.professorCard.create({
      data: {
        professorId,
        rarity: data.rarity,
        attack: data.attack,
        defense: data.defense,
        speed: data.speed,
        special: data.special,
        isUnlocked: true,
      },
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            subject: true,
          }
        }
      }
    });
  }

  async getProfessorCard(cardId: string) {
    return await prisma.professorCard.findUnique({
      where: { id: cardId },
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            subject: true,
          }
        }
      }
    });
  }

  async getAllProfessorCards() {
    return await prisma.professorCard.findMany({
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            subject: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getCardsByProfessor(professorId: string) {
    return await prisma.professorCard.findMany({
      where: { professorId },
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            subject: true,
          }
        }
      }
    });
  }

  async assignCardToStudent(studentId: string, cardId: string) {
    const card = await prisma.professorCard.findUnique({
      where: { id: cardId }
    });

    if (!card) {
      throw new Error('Tarjeta no encontrada');
    }

    const existingAssignment = await prisma.studentProfessorCard.findUnique({
      where: {
        studentId_cardId: {
          studentId,
          cardId
        }
      }
    });

    if (existingAssignment) {
      throw new Error('El estudiante ya tiene esta tarjeta');
    }

    return await prisma.studentProfessorCard.create({
      data: {
        studentId,
        cardId
      },
      include: {
        card: {
          include: {
            professor: {
              select: {
                id: true,
                name: true,
                avatar: true,
                subject: true,
              }
            }
          }
        }
      }
    });
  }

  async getStudentCards(studentId: string) {
    return await prisma.studentProfessorCard.findMany({
      where: { studentId },
      include: {
        card: {
          include: {
            professor: {
              select: {
                id: true,
                name: true,
                avatar: true,
                subject: true,
              }
            }
          }
        }
      },
      orderBy: {
        obtainedAt: 'desc'
      }
    });
  }

  async removeCardFromStudent(studentId: string, cardId: string) {
    return await prisma.studentProfessorCard.delete({
      where: {
        studentId_cardId: {
          studentId,
          cardId
        }
      }
    });
  }

  async updateProfessorCard(cardId: string, data: {
    rarity?: CardRarity;
    attack?: number;
    defense?: number;
    speed?: number;
    special?: string;
    isUnlocked?: boolean;
  }) {
    return await prisma.professorCard.update({
      where: { id: cardId },
      data,
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            subject: true,
          }
        }
      }
    });
  }

  async deleteProfessorCard(cardId: string) {
    return await prisma.professorCard.delete({
      where: { id: cardId }
    });
  }

  async giveProfessorPoints(studentId: string, professorId: string, points: number) {
    const existing = await prisma.studentProfessorPoints.findUnique({
      where: {
        studentId_professorId: {
          studentId,
          professorId
        }
      }
    });

    if (existing) {
      return await prisma.studentProfessorPoints.update({
        where: {
          studentId_professorId: {
            studentId,
            professorId
          }
        },
        data: {
          points: existing.points + points
        }
      });
    } else {
      return await prisma.studentProfessorPoints.create({
        data: {
          studentId,
          professorId,
          points
        }
      });
    }
  }

  async getStudentProfessorPoints(studentId: string) {
    return await prisma.studentProfessorPoints.findMany({
      where: { studentId },
      include: {
        professor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            subject: true,
          }
        }
      },
      orderBy: {
        points: 'desc'
      }
    });
  }
}

export default new ProfessorCardService();
