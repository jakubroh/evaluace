import { Router } from 'express';
import { evaluationController } from '../controllers/evaluation';
import { authMiddleware, isAdminOrDirector } from '../middleware/auth';
import { validateEvaluation } from '../middleware/validation';

const router = Router();

// Routy pro administrátory a ředitele
router.get('/', authMiddleware, isAdminOrDirector, evaluationController.getEvaluations);
router.get('/:id', authMiddleware, isAdminOrDirector, evaluationController.getEvaluation);
router.post('/', authMiddleware, isAdminOrDirector, evaluationController.createEvaluation);
router.put('/:id', authMiddleware, isAdminOrDirector, evaluationController.updateEvaluation);
router.delete('/:id', authMiddleware, isAdminOrDirector, evaluationController.deleteEvaluation);

// Routy pro statistiky a export
router.get('/:id/stats', authMiddleware, isAdminOrDirector, evaluationController.getEvaluationStats);
router.get('/:id/responses', authMiddleware, isAdminOrDirector, evaluationController.getEvaluationResponses);
router.get('/:id/export/csv', authMiddleware, isAdminOrDirector, evaluationController.exportToCSV);
router.get('/:id/export/pdf', authMiddleware, isAdminOrDirector, evaluationController.exportToPDF);

// Veřejná routa pro ukládání odpovědí
router.post('/:id/responses', validateEvaluation, evaluationController.saveResponse);

export default router; 