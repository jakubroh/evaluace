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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await teacherAssignmentController.getAssignments(req, res);
    } catch (error) {
      next(error);
    }
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await teacherAssignmentController.createAssignment(req, res);
    } catch (error) {
      next(error);
    }
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await teacherAssignmentController.deleteAssignment(req, res);
    } catch (error) {
      next(error);
    }
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
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await teacherAssignmentController.updateAssignments(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router; 