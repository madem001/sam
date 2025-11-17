import { Request, Response } from 'express';
import professorCardService from '../services/professorCardService.js';

export class ProfessorCardController {
  async createCard(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { rarity, attack, defense, speed, special } = req.body;

      if (!rarity || attack === undefined || defense === undefined || speed === undefined) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      const card = await professorCardService.createProfessorCard(req.user.userId, {
        rarity,
        attack,
        defense,
        speed,
        special
      });

      return res.status(201).json(card);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAllCards(req: Request, res: Response) {
    try {
      const cards = await professorCardService.getAllProfessorCards();
      return res.status(200).json(cards);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getCardById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const card = await professorCardService.getProfessorCard(id);

      if (!card) {
        return res.status(404).json({ error: 'Tarjeta no encontrada' });
      }

      return res.status(200).json(card);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getCardsByProfessor(req: Request, res: Response) {
    try {
      const { professorId } = req.params;
      const cards = await professorCardService.getCardsByProfessor(professorId);
      return res.status(200).json(cards);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateCard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const card = await professorCardService.updateProfessorCard(id, updates);
      return res.status(200).json(card);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteCard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await professorCardService.deleteProfessorCard(id);
      return res.status(200).json({ message: 'Tarjeta eliminada' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async assignToStudent(req: Request, res: Response) {
    try {
      const { studentId, cardId } = req.body;

      if (!studentId || !cardId) {
        return res.status(400).json({ error: 'studentId y cardId son requeridos' });
      }

      const assignment = await professorCardService.assignCardToStudent(studentId, cardId);
      return res.status(201).json(assignment);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getStudentCards(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const cards = await professorCardService.getStudentCards(studentId);
      return res.status(200).json(cards);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async removeFromStudent(req: Request, res: Response) {
    try {
      const { studentId, cardId } = req.params;
      await professorCardService.removeCardFromStudent(studentId, cardId);
      return res.status(200).json({ message: 'Tarjeta removida del estudiante' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async giveProfessorPoints(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { studentId, points } = req.body;

      if (!studentId || !points) {
        return res.status(400).json({ error: 'studentId y points son requeridos' });
      }

      const result = await professorCardService.giveProfessorPoints(
        studentId,
        req.user.userId,
        points
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getStudentProfessorPoints(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const points = await professorCardService.getStudentProfessorPoints(studentId);
      return res.status(200).json(points);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new ProfessorCardController();
