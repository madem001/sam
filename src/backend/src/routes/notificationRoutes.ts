import { Router } from 'express';
import notificationController from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, notificationController.createNotification);
router.get('/', authenticateToken, notificationController.getUserNotifications);
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);
router.get('/:id', notificationController.getNotification);
router.put('/:id/read', authenticateToken, notificationController.markAsRead);
router.put('/read-all', authenticateToken, notificationController.markAllAsRead);
router.delete('/:id', authenticateToken, notificationController.deleteNotification);
router.delete('/', authenticateToken, notificationController.deleteAll);
router.post('/bulk', authenticateToken, notificationController.sendBulk);

export default router;
