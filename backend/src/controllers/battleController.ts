import { Request, Response } from 'express';
import battleService from '../services/battleService.js';
import { broadcastBattleUpdate, broadcastGroupUpdate } from '../websocket/index.js';

export class BattleController {
  async createBattle(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { name, questionCount, groupCount, questions } = req.body;

      if (!name || !questionCount || !groupCount || !questions) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      const result = await battleService.createBattle(req.user.userId, {
        name,
        questionCount,
        groupCount,
        questions,
      });

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getBattle(req: Request, res: Response) {
    try {
      const { battleId } = req.params;
      const battle = await battleService.getBattleById(battleId);

      if (!battle) {
        return res.status(404).json({ error: 'Batalla no encontrada' });
      }

      return res.status(200).json(battle);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getTeacherBattles(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const battles = await battleService.getTeacherBattles(req.user.userId);
      return res.status(200).json(battles);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getBattleGroups(req: Request, res: Response) {
    try {
      const { battleId } = req.params;
      const groups = await battleService.getBattleGroups(battleId);

      return res.status(200).json(groups);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getBattleQuestions(req: Request, res: Response) {
    try {
      const { battleId } = req.params;
      const questions = await battleService.getBattleQuestions(battleId);

      return res.status(200).json(questions);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async joinGroup(req: Request, res: Response) {
    try {
      const { groupCode, studentId, studentName } = req.body;

      if (!groupCode || !studentId || !studentName) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      const result = await battleService.joinGroup({ groupCode, studentId, studentName });

      broadcastGroupUpdate(result.group.battleId, result.group.id);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async submitAnswer(req: Request, res: Response) {
    try {
      const { battleId, groupId, questionId, answerIndex, responseTimeMs } = req.body;

      if (battleId === undefined || groupId === undefined || questionId === undefined || answerIndex === undefined) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      const result = await battleService.submitAnswer({
        battleId,
        groupId,
        questionId,
        answerIndex,
        responseTimeMs: responseTimeMs || 0,
      });

      broadcastGroupUpdate(battleId, groupId);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async startBattle(req: Request, res: Response) {
    try {
      const { battleId } = req.params;

      const battle = await battleService.startBattle(battleId);

      broadcastBattleUpdate(battleId, {
        status: battle.status,
        currentQuestionIndex: battle.currentQuestionIndex,
      });

      return res.status(200).json(battle);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async nextQuestion(req: Request, res: Response) {
    try {
      const { battleId } = req.params;

      const battle = await battleService.nextQuestion(battleId);

      broadcastBattleUpdate(battleId, {
        status: battle.status,
        currentQuestionIndex: battle.currentQuestionIndex,
      });

      return res.status(200).json(battle);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getGroupMembers(req: Request, res: Response) {
    try {
      const { groupId } = req.params;
      const members = await battleService.getGroupMembers(groupId);

      return res.status(200).json(members);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getBattleAnswers(req: Request, res: Response) {
    try {
      const { battleId } = req.params;
      const answers = await battleService.getBattleAnswers(battleId);

      return res.status(200).json(answers);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new BattleController();
