import { Request, Response } from 'express';
import achievementService from '../services/achievementService.js';

export class AchievementController {
  async createDefinition(req: Request, res: Response) {
    try {
      const { name, description, icon, unlockCondition, pointsReward } = req.body;

      if (!name || !description || !icon || !unlockCondition) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      const achievement = await achievementService.createAchievementDefinition({
        name,
        description,
        icon,
        unlockCondition,
        pointsReward: pointsReward || 0
      });

      return res.status(201).json(achievement);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAllDefinitions(req: Request, res: Response) {
    try {
      const achievements = await achievementService.getAllAchievementDefinitions();
      return res.status(200).json(achievements);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getDefinitionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const achievement = await achievementService.getAchievementDefinition(id);

      if (!achievement) {
        return res.status(404).json({ error: 'Logro no encontrado' });
      }

      return res.status(200).json(achievement);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateDefinition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const achievement = await achievementService.updateAchievementDefinition(id, updates);
      return res.status(200).json(achievement);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteDefinition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await achievementService.deleteAchievementDefinition(id);
      return res.status(200).json({ message: 'Logro eliminado' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async unlockForUser(req: Request, res: Response) {
    try {
      const { userId, achievementId } = req.body;

      if (!userId || !achievementId) {
        return res.status(400).json({ error: 'userId y achievementId son requeridos' });
      }

      const userAchievement = await achievementService.unlockAchievementForUser(userId, achievementId);
      return res.status(201).json(userAchievement);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getUserAchievements(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const achievements = await achievementService.getUserAchievements(userId);
      return res.status(200).json(achievements);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async checkAndUnlock(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const newAchievements = await achievementService.checkAndUnlockAchievements(req.user.userId);
      return res.status(200).json({
        message: `${newAchievements.length} logros desbloqueados`,
        achievements: newAchievements
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getProgress(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const progress = await achievementService.getAchievementProgress(userId);
      return res.status(200).json(progress);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new AchievementController();
