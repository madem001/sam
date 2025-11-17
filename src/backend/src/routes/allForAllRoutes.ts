import { Router } from 'express';
import allForAllController from '../controllers/allForAllController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, allForAllController.createGame);
router.get('/', allForAllController.getAllGames);
router.get('/active', authenticateToken, allForAllController.getActiveGame);
router.get('/:id', allForAllController.getGame);
router.post('/:gameId/response', authenticateToken, allForAllController.submitResponse);
router.post('/:id/end', authenticateToken, allForAllController.endGame);
router.get('/:id/results', allForAllController.getResults);

export default router;
