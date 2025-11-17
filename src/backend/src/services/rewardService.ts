import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RewardService {
  async createReward(teacherId: string, data: {
    name: string;
    description: string;
    costPoints: number;
    isActive?: boolean;
  }) {
    return await prisma.reward.create({
      data: {
        teacherId,
        name: data.name,
        description: data.description,
        costPoints: data.costPoints,
        isActive: data.isActive !== undefined ? data.isActive : true
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

  async getReward(id: string) {
    return await prisma.reward.findUnique({
      where: { id },
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

  async getAllRewards(teacherId?: string, activeOnly: boolean = false) {
    return await prisma.reward.findMany({
      where: {
        teacherId: teacherId,
        isActive: activeOnly ? true : undefined
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        costPoints: 'asc'
      }
    });
  }

  async updateReward(id: string, data: {
    name?: string;
    description?: string;
    costPoints?: number;
    isActive?: boolean;
  }) {
    return await prisma.reward.update({
      where: { id },
      data,
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

  async deleteReward(id: string) {
    return await prisma.reward.delete({
      where: { id }
    });
  }

  async redeemReward(studentId: string, rewardId: string) {
    const reward = await this.getReward(rewardId);

    if (!reward) {
      throw new Error('Recompensa no encontrada');
    }

    if (!reward.isActive) {
      throw new Error('Esta recompensa no está disponible');
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new Error('Estudiante no encontrado');
    }

    if (student.points < reward.costPoints) {
      throw new Error(`Puntos insuficientes. Necesitas ${reward.costPoints} puntos pero solo tienes ${student.points}`);
    }

    await prisma.user.update({
      where: { id: studentId },
      data: {
        points: {
          decrement: reward.costPoints
        }
      }
    });

    await prisma.notification.create({
      data: {
        userId: studentId,
        message: `Has canjeado: ${reward.name}`,
        type: 'reward_redeemed',
        payload: {
          rewardId: reward.id,
          rewardName: reward.name,
          pointsSpent: reward.costPoints
        }
      }
    });

    return {
      success: true,
      message: `Recompensa "${reward.name}" canjeada exitosamente`,
      pointsSpent: reward.costPoints,
      remainingPoints: student.points - reward.costPoints
    };
  }
}

export default new RewardService();
