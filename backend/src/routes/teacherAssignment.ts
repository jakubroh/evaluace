import { Router, Response, NextFunction, Request, RequestHandler } from 'express';
import { teacherAssignmentController } from '../controllers/teacherAssignment';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';

const router = Router();

// Middleware pro ověření autentizace
router.use(authMiddleware);

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

// GET /api/classes/:classId/assignments - Získat všechna přiřazení pro třídu
router.get('/:classId/assignments',
  validate({
    params: {
      classId: { type: 'number', required: true }
    }
  }),
  asyncHandler(teacherAssignmentController.getAssignments)
);

// POST /api/classes/:classId/assignments - Vytvořit nové přiřazení
router.post('/:classId/assignments',
  validate({
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
  validate({
    params: {
      classId: { type: 'number', required: true },
      assignmentId: { type: 'number', required: true }
    }
  }),
  asyncHandler(teacherAssignmentController.deleteAssignment)
);

// PUT /api/classes/:classId/assignments - Aktualizovat všechna přiřazení pro třídu
router.put('/:classId/assignments',
  validate({
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