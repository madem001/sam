import { Router } from 'express';
import professorCardController from '../controllers/professorCardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, professorCardController.createCard);
router.get('/', professorCardController.getAllCards);
router.get('/:id', professorCardController.getCardById);
router.get('/professor/:professorId', professorCardController.getCardsByProfessor);
router.put('/:id', authenticateToken, professorCardController.updateCard);
router.delete('/:id', authenticateToken, professorCardController.deleteCard);

router.post('/assign', authenticateToken, professorCardController.assignToStudent);
router.get('/student/:studentId', professorCardController.getStudentCards);
router.delete('/student/:studentId/card/:cardId', authenticateToken, professorCardController.removeFromStudent);

router.post('/points', authenticateToken, professorCardController.giveProfessorPoints);
router.get('/points/student/:studentId', professorCardController.getStudentProfessorPoints);

export default router;
