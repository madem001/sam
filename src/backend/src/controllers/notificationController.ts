import { Request, Response } from 'express';
import notificationService from '../services/notificationService.js';

export class NotificationController {
  async createNotification(req: Request, res: Response) {
    try {
      const { userId, message, type, payload } = req.body;

      if (!userId || !message || !type) {
        return res.status(400).json({ error: 'userId, message y type son requeridos' });
      }

      const notification = await notificationService.createNotification(userId, {
        message,
        type,
        payload
      });

      return res.status(201).json(notification);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getUserNotifications(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { unreadOnly } = req.query;
      const notifications = await notificationService.getUserNotifications(
        req.user.userId,
        unreadOnly === 'true'
      );

      return res.status(200).json(notifications);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await notificationService.getNotification(id);

      if (!notification) {
        return res.status(404).json({ error: 'Notificación no encontrada' });
      }

      return res.status(200).json(notification);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await notificationService.markAsRead(id);
      return res.status(200).json(notification);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      await notificationService.markAllAsRead(req.user.userId);
      return res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await notificationService.deleteNotification(id);
      return res.status(200).json({ message: 'Notificación eliminada' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteAll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      await notificationService.deleteAllUserNotifications(req.user.userId);
      return res.status(200).json({ message: 'Todas las notificaciones eliminadas' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const count = await notificationService.getUnreadCount(req.user.userId);
      return res.status(200).json({ count });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async sendBulk(req: Request, res: Response) {
    try {
      const { userIds, message, type, payload } = req.body;

      if (!userIds || !Array.isArray(userIds) || !message || !type) {
        return res.status(400).json({ error: 'userIds (array), message y type son requeridos' });
      }

      await notificationService.sendBulkNotification(userIds, {
        message,
        type,
        payload
      });

      return res.status(201).json({ message: `${userIds.length} notificaciones enviadas` });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new NotificationController();
