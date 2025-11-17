import { Router } from 'express';
import achievementController from '../controllers/achievementController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/definitions', authenticateToken, achievementController.createDefinition);
router.get('/definitions', achievementController.getAllDefinitions);
router.get('/definitions/:id', achievementController.getDefinitionById);
router.put('/definitions/:id', authenticateToken, achievementController.updateDefinition);
router.delete('/definitions/:id', authenticateToken, achievementController.deleteDefinition);

router.post('/unlock', authenticateToken, achievementController.unlockForUser);
router.get('/user/:userId', achievementController.getUserAchievements);
router.post('/check', authenticateToken, achievementController.checkAndUnlock);
router.get('/progress/:userId', achievementController.getProgress);

export default router;
