import { Request, Response } from 'express';
import authService from '../services/authService.js';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      if (role !== 'STUDENT' && role !== 'TEACHER') {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      const result = await authService.register(email, password, name, role);

      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const result = await authService.login(email, password);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { name, avatar } = req.body;
      const user = await authService.updateUser(req.user.userId, { name, avatar });

      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getStudents(req: Request, res: Response) {
    try {
      const students = await authService.getAllStudents();
      return res.status(200).json(students);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new AuthController();
