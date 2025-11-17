import { Request, Response } from 'express';
import rewardService from '../services/rewardService.js';

export class RewardController {
  async createReward(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { name, description, costPoints, isActive } = req.body;

      if (!name || !description || costPoints === undefined) {
        return res.status(400).json({ error: 'name, description y costPoints son requeridos' });
      }

      const reward = await rewardService.createReward(req.user.userId, {
        name,
        description,
        costPoints,
        isActive
      });

      return res.status(201).json(reward);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getReward(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const reward = await rewardService.getReward(id);

      if (!reward) {
        return res.status(404).json({ error: 'Recompensa no encontrada' });
      }

      return res.status(200).json(reward);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAllRewards(req: Request, res: Response) {
    try {
      const { teacherId, activeOnly } = req.query;
      const rewards = await rewardService.getAllRewards(
        teacherId as string,
        activeOnly === 'true'
      );
      return res.status(200).json(rewards);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateReward(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const reward = await rewardService.updateReward(id, updates);
      return res.status(200).json(reward);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteReward(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await rewardService.deleteReward(id);
      return res.status(200).json({ message: 'Recompensa eliminada' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async redeemReward(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { rewardId } = req.body;

      if (!rewardId) {
        return res.status(400).json({ error: 'rewardId es requerido' });
      }

      const result = await rewardService.redeemReward(req.user.userId, rewardId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export default new RewardController();
