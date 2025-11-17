import { Request, Response } from 'express';
import allForAllService from '../services/allForAllService.js';

export class AllForAllController {
  async createGame(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { wordText, wordColor, correctAnswer } = req.body;

      if (!wordText || !wordColor || !correctAnswer) {
        return res.status(400).json({ error: 'wordText, wordColor y correctAnswer son requeridos' });
      }

      const game = await allForAllService.createGame(req.user.userId, {
        wordText,
        wordColor,
        correctAnswer
      });

      return res.status(201).json(game);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getGame(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const game = await allForAllService.getGame(id);

      if (!game) {
        return res.status(404).json({ error: 'Juego no encontrado' });
      }

      return res.status(200).json(game);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getActiveGame(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const game = await allForAllService.getActiveGame(req.user.userId);

      if (!game) {
        return res.status(404).json({ error: 'No hay juego activo' });
      }

      return res.status(200).json(game);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAllGames(req: Request, res: Response) {
    try {
      const { teacherId } = req.query;
      const games = await allForAllService.getAllGames(teacherId as string);
      return res.status(200).json(games);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async submitResponse(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { gameId } = req.params;
      const { buttonPressed, isCorrect, responseTime } = req.body;

      if (buttonPressed === undefined || isCorrect === undefined || !responseTime) {
        return res.status(400).json({ error: 'buttonPressed, isCorrect y responseTime son requeridos' });
      }

      const response = await allForAllService.submitResponse(gameId, req.user.userId, {
        buttonPressed,
        isCorrect,
        responseTime
      });

      return res.status(201).json(response);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async endGame(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const game = await allForAllService.endGame(id);
      return res.status(200).json(game);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getResults(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const results = await allForAllService.getGameResults(id);
      return res.status(200).json(results);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new AllForAllController();
