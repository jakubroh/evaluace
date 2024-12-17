import { Router, Response, NextFunction, Request, RequestHandler } from 'express';
import { evaluationController } from '../controllers/evaluation';
import { authMiddleware, AuthRequest, isAdminOrDirector } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';

const router = Router();

// Helper pro typově bezpečné handlery
const asyncHandler = <T extends Request>(fn: (req: T, res: Response) => Promise<void>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as T, res)).catch(next);
  };
};

// Routy pro administrátory a ředitele
router.get('/',
  authMiddleware,
  isAdminOrDirector,
  asyncHandler<AuthRequest>(evaluationController.getEvaluations)
);

router.get('/:id',
  authMiddleware,
  isAdminOrDirector,
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler<AuthRequest>(evaluationController.getEvaluation)
);

router.post('/',
  authMiddleware,
  isAdminOrDirector,
  validateRequest({
    body: {
      name: { type: 'string', required: true },
      startDate: { type: 'string', required: true },
      endDate: { type: 'string', required: true },
      status: { type: 'string', required: true }
    }
  }),
  asyncHandler<AuthRequest>(evaluationController.createEvaluation)
);

router.put('/:id',
  authMiddleware,
  isAdminOrDirector,
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    },
    body: {
      name: { type: 'string', required: true },
      startDate: { type: 'string', required: true },
      endDate: { type: 'string', required: true },
      status: { type: 'string', required: true }
    }
  }),
  asyncHandler<AuthRequest>(evaluationController.updateEvaluation)
);

router.delete('/:id',
  authMiddleware,
  isAdminOrDirector,
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler<AuthRequest>(evaluationController.deleteEvaluation)
);

// Routy pro statistiky a export
router.get('/:id/stats',
  authMiddleware,
  isAdminOrDirector,
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler<AuthRequest>(evaluationController.getEvaluationStats)
);

router.get('/:id/responses',
  authMiddleware,
  isAdminOrDirector,
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler<AuthRequest>(evaluationController.getEvaluationResponses)
);

router.get('/:id/export/csv',
  authMiddleware,
  isAdminOrDirector,
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler<AuthRequest>(evaluationController.exportToCSV)
);

router.get('/:id/export/pdf',
  authMiddleware,
  isAdminOrDirector,
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler<AuthRequest>(evaluationController.exportToPDF)
);

// Veřejná routa pro ukládání odpovědí
router.post('/:id/responses',
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    },
    body: {
      teacherId: { type: 'number', required: true },
      subjectId: { type: 'number', required: true },
      classId: { type: 'number', required: true },
      accessCodeId: { type: 'number', required: true },
      criteria: {
        type: 'object',
        required: true,
        properties: {
          preparation: { type: 'number', required: true },
          explanation: { type: 'number', required: true },
          engagement: { type: 'number', required: true },
          atmosphere: { type: 'number', required: true },
          individual: { type: 'number', required: true }
        }
      },
      comment: { type: 'string', required: false }
    }
  }),
  asyncHandler<Request>(evaluationController.saveResponse)
);

export default router; 