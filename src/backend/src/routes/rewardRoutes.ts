import { Router } from 'express';
import rewardController from '../controllers/rewardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, rewardController.createReward);
router.get('/', rewardController.getAllRewards);
router.get('/:id', rewardController.getReward);
router.put('/:id', authenticateToken, rewardController.updateReward);
router.delete('/:id', authenticateToken, rewardController.deleteReward);
router.post('/redeem', authenticateToken, rewardController.redeemReward);

export default router;
