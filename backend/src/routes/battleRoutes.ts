import { Router } from 'express';
import battleController from '../controllers/battleController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, requireRole('TEACHER'), battleController.createBattle);
router.get('/teacher', authenticateToken, requireRole('TEACHER'), battleController.getTeacherBattles);
router.get('/:battleId', authenticateToken, battleController.getBattle);
router.get('/:battleId/groups', authenticateToken, battleController.getBattleGroups);
router.get('/:battleId/questions', authenticateToken, battleController.getBattleQuestions);
router.get('/:battleId/answers', authenticateToken, battleController.getBattleAnswers);
router.post('/join', authenticateToken, battleController.joinGroup);
router.post('/answer', authenticateToken, battleController.submitAnswer);
router.post('/:battleId/start', authenticateToken, requireRole('TEACHER'), battleController.startBattle);
router.post('/:battleId/next', authenticateToken, requireRole('TEACHER'), battleController.nextQuestion);
router.get('/groups/:groupId/members', authenticateToken, battleController.getGroupMembers);

export default router;
