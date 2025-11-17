import { Request, Response } from 'express';
import questionService from '../services/questionService.js';

export class QuestionController {
  async createQuestionSet(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { name, questions } = req.body;

      if (!name || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: 'name y questions (array) son requeridos' });
      }

      const questionSet = await questionService.createQuestionSet(req.user.userId, {
        name,
        questions
      });

      return res.status(201).json(questionSet);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getQuestionSet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const questionSet = await questionService.getQuestionSet(id);

      if (!questionSet) {
        return res.status(404).json({ error: 'Banco de preguntas no encontrado' });
      }

      return res.status(200).json(questionSet);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getAllQuestionSets(req: Request, res: Response) {
    try {
      const questionSets = await questionService.getAllQuestionSets();
      return res.status(200).json(questionSets);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getTeacherQuestionSets(req: Request, res: Response) {
    try {
      const { teacherId } = req.params;
      const questionSets = await questionService.getQuestionSetsByTeacher(teacherId);
      return res.status(200).json(questionSets);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateQuestionSet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const questionSet = await questionService.updateQuestionSet(id, updates);
      return res.status(200).json(questionSet);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteQuestionSet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await questionService.deleteQuestionSet(id);
      return res.status(200).json({ message: 'Banco de preguntas eliminado' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async duplicateQuestionSet(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { newName } = req.body;

      const duplicated = await questionService.duplicateQuestionSet(id, newName);
      return res.status(201).json(duplicated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new QuestionController();
