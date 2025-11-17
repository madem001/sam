import { Router } from 'express';
import questionController from '../controllers/questionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, questionController.createQuestionSet);
router.get('/', questionController.getAllQuestionSets);
router.get('/:id', questionController.getQuestionSet);
router.get('/teacher/:teacherId', questionController.getTeacherQuestionSets);
router.put('/:id', authenticateToken, questionController.updateQuestionSet);
router.delete('/:id', authenticateToken, questionController.deleteQuestionSet);
router.post('/:id/duplicate', authenticateToken, questionController.duplicateQuestionSet);

export default router;
