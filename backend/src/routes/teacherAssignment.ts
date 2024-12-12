import { Router, Request, Response, NextFunction } from 'express';
import { teacherAssignmentController } from '../controllers/teacherAssignment';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';

const router = Router();

// Middleware pro ověření autentizace
router.use(authMiddleware);

// GET /api/classes/:classId/assignments - Získat všechna přiřazení pro třídu
router.get('/:classId/assignments',
  validateRequest({
    params: {
      classId: { type: 'number', required: true }
    }
  }),
  (req: Request, res: Response, next: NextFunction) => {
    teacherAssignmentController.getAssignments(req, res).catch(next);
  }
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
  (req: Request, res: Response, next: NextFunction) => {
    teacherAssignmentController.createAssignment(req, res).catch(next);
  }
);

// DELETE /api/classes/:classId/assignments/:assignmentId - Smazat přiřazení
router.delete('/:classId/assignments/:assignmentId',
  validateRequest({
    params: {
      classId: { type: 'number', required: true },
      assignmentId: { type: 'number', required: true }
    }
  }),
  (req: Request, res: Response, next: NextFunction) => {
    teacherAssignmentController.deleteAssignment(req, res).catch(next);
  }
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
  (req: Request, res: Response, next: NextFunction) => {
    teacherAssignmentController.updateAssignments(req, res).catch(next);
  }
);

export default router; 