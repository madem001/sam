import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AchievementService {
  async createAchievementDefinition(data: {
    name: string;
    description: string;
    icon: string;
    unlockCondition: string;
    pointsReward: number;
  }) {
    return await prisma.achievementDefinition.create({
      data
    });
  }

  async getAllAchievementDefinitions() {
    return await prisma.achievementDefinition.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getAchievementDefinition(id: string) {
    return await prisma.achievementDefinition.findUnique({
      where: { id }
    });
  }

  async updateAchievementDefinition(id: string, data: {
    name?: string;
    description?: string;
    icon?: string;
    unlockCondition?: string;
    pointsReward?: number;
  }) {
    return await prisma.achievementDefinition.update({
      where: { id },
      data
    });
  }

  async deleteAchievementDefinition(id: string) {
    return await prisma.achievementDefinition.delete({
      where: { id }
    });
  }

  async unlockAchievementForUser(userId: string, achievementId: string) {
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId
        }
      }
    });

    if (existing) {
      throw new Error('Usuario ya tiene este logro desbloqueado');
    }

    const achievement = await prisma.achievementDefinition.findUnique({
      where: { id: achievementId }
    });

    if (!achievement) {
      throw new Error('Logro no encontrado');
    }

    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId
      },
      include: {
        achievement: true
      }
    });

    if (achievement.pointsReward > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: achievement.pointsReward
          }
        }
      });
    }

    return userAchievement;
  }

  async getUserAchievements(userId: string) {
    return await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: {
        unlockedAt: 'desc'
      }
    });
  }

  async checkAndUnlockAchievements(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: true,
        battlesAsTeacher: true,
        battleAnswers: true
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const allDefinitions = await this.getAllAchievementDefinitions();
    const unlockedAchievements = [];

    for (const definition of allDefinitions) {
      const alreadyUnlocked = user.achievements.some(
        ua => ua.achievementId === definition.id
      );

      if (!alreadyUnlocked) {
        const shouldUnlock = this.evaluateUnlockCondition(user, definition.unlockCondition);

        if (shouldUnlock) {
          const unlocked = await this.unlockAchievementForUser(userId, definition.id);
          unlockedAchievements.push(unlocked);
        }
      }
    }

    return unlockedAchievements;
  }

  private evaluateUnlockCondition(user: any, condition: string): boolean {
    try {
      if (condition.includes('points>=')) {
        const threshold = parseInt(condition.split('>=')[1]);
        return user.points >= threshold;
      }

      if (condition.includes('level>=')) {
        const threshold = parseInt(condition.split('>=')[1]);
        return user.level >= threshold;
      }

      if (condition.includes('streak>=')) {
        const threshold = parseInt(condition.split('>=')[1]);
        return user.streak >= threshold;
      }

      if (condition.includes('battles_won>=')) {
        const threshold = parseInt(condition.split('>=')[1]);
        return user.battleAnswers.filter((a: any) => a.isCorrect).length >= threshold;
      }

      return false;
    } catch (error) {
      console.error('Error evaluating unlock condition:', error);
      return false;
    }
  }

  async getAchievementProgress(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: {
          include: {
            achievement: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const allDefinitions = await this.getAllAchievementDefinitions();

    return {
      total: allDefinitions.length,
      unlocked: user.achievements.length,
      achievements: allDefinitions.map(def => ({
        ...def,
        isUnlocked: user.achievements.some(ua => ua.achievementId === def.id),
        unlockedAt: user.achievements.find(ua => ua.achievementId === def.id)?.unlockedAt
      }))
    };
  }
}

export default new AchievementService();
