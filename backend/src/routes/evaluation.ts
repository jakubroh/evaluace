import { Router, Response, NextFunction, Request, RequestHandler } from 'express';
import { evaluationController } from '../controllers/evaluation';
import { authMiddleware, AuthRequest, isAdminOrDirector } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';

const router = Router();

// Helper pro typově bezpečné handlery
const asyncHandler = (fn: (req: AuthRequest, res: Response) => Promise<void>): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req as AuthRequest, res)).catch(next);
  };
};

// Middleware pro validaci
const validate = (schema: any): RequestHandler => {
  return (req, res, next) => {
    validateRequest(schema)(req, res, next);
  };
};

// Routy pro administrátory a ředitele
router.get('/',
  authMiddleware,
  isAdminOrDirector,
  asyncHandler(evaluationController.getEvaluations)
);

router.get('/:id',
  authMiddleware,
  isAdminOrDirector,
  validate({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler(evaluationController.getEvaluation)
);

router.post('/',
  authMiddleware,
  isAdminOrDirector,
  validate({
    body: {
      name: { type: 'string', required: true },
      startDate: { type: 'string', required: true },
      endDate: { type: 'string', required: true },
      status: { type: 'string', required: true }
    }
  }),
  asyncHandler(evaluationController.createEvaluation)
);

router.put('/:id',
  authMiddleware,
  isAdminOrDirector,
  validate({
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
  asyncHandler(evaluationController.updateEvaluation)
);

router.delete('/:id',
  authMiddleware,
  isAdminOrDirector,
  validate({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler(evaluationController.deleteEvaluation)
);

// Routy pro statistiky a export
router.get('/:id/stats',
  authMiddleware,
  isAdminOrDirector,
  validate({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler(evaluationController.getEvaluationStats)
);

router.get('/:id/responses',
  authMiddleware,
  isAdminOrDirector,
  validate({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler(evaluationController.getEvaluationResponses)
);

router.get('/:id/export/csv',
  authMiddleware,
  isAdminOrDirector,
  validate({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler(evaluationController.exportToCSV)
);

router.get('/:id/export/pdf',
  authMiddleware,
  isAdminOrDirector,
  validate({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler(evaluationController.exportToPDF)
);

// Veřejná routa pro ukládání odpovědí
router.post('/:id/responses',
  validate({
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
  asyncHandler(evaluationController.saveResponse)
);

export default router; 