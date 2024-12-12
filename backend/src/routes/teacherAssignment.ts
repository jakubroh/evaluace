import { Router, Response } from 'express';
import type { RequestHandler } from 'express';
import { teacherAssignmentController } from '../controllers/teacherAssignment';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';

const router = Router();

// Middleware pro ověření autentizace
router.use(authMiddleware);

// Helper pro typově bezpečné handlery
const asyncHandler = (fn: (req: AuthRequest, res: Response) => Promise<void>): RequestHandler => {
  return async (req, res, next): Promise<void> => {
    try {
      await fn(req as AuthRequest, res);
    } catch (error) {
      next(error);
    }
  };
};

// GET /api/classes/:classId/assignments - Získat všechna přiřazení pro třídu
router.get('/:classId/assignments',
  validateRequest({
    params: {
      classId: { type: 'number', required: true }
    }
  }) as RequestHandler,
  asyncHandler(teacherAssignmentController.getAssignments)
);

// POST /api/classes/:classId/assignments - Vytvořit nové přiřazení
router.post('/:classId/assignments',
  validateRequest({
    params: {
      classId: { type: 'number', required: true }
    },
    body: {
      teacherId: { type: 'number', required: true },
      subjectId: { type: 'number', required: true }
    }
  }) as RequestHandler,
  asyncHandler(teacherAssignmentController.createAssignment)
);

// DELETE /api/classes/:classId/assignments/:assignmentId - Smazat přiřazení
router.delete('/:classId/assignments/:assignmentId',
  validateRequest({
    params: {
      classId: { type: 'number', required: true },
      assignmentId: { type: 'number', required: true }
    }
  }) as RequestHandler,
  asyncHandler(teacherAssignmentController.deleteAssignment)
);

// PUT /api/classes/:classId/assignments - Aktualizovat všechna přiřazení pro třídu
router.put('/:classId/assignments',
  validateRequest({
    params: {
      classId: { type: 'number', required: true }
    },
    body: {
      assignments: {
        type: 'array',
        required: true,
        items: {
          type: 'object',
          properties: {
            teacherId: { type: 'number', required: true },
            subjectId: { type: 'number', required: true }
          }
        }
      }
    }
  }) as RequestHandler,
  asyncHandler(teacherAssignmentController.updateAssignments)
);

export default router; 