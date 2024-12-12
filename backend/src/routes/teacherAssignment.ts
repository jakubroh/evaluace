import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { teacherAssignmentController } from '../controllers/teacherAssignment';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';

const router = Router();

// Middleware pro ověření autentizace
router.use(authMiddleware);

// Helper pro typově bezpečné handlery
const asyncHandler = (fn: (req: AuthRequest, res: Response) => Promise<void>) => {
  return function(req: Request, res: Response, next: NextFunction): void {
    Promise.resolve(fn(req as AuthRequest, res)).catch(next);
  };
};

// GET /api/classes/:classId/assignments - Získat všechna přiřazení pro třídu
router.get('/:classId/assignments',
  validateRequest({
    params: {
      classId: { type: 'number', required: true }
    }
  }),
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
  }),
  asyncHandler(teacherAssignmentController.createAssignment)
);

// DELETE /api/classes/:classId/assignments/:assignmentId - Smazat přiřazení
router.delete('/:classId/assignments/:assignmentId',
  validateRequest({
    params: {
      classId: { type: 'number', required: true },
      assignmentId: { type: 'number', required: true }
    }
  }),
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
  }),
  asyncHandler(teacherAssignmentController.updateAssignments)
);

export default router; 