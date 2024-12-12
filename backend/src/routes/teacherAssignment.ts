import { Router } from 'express';
import type { RequestHandler } from 'express';
import { teacherAssignmentController } from '../controllers/teacherAssignment';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';

const router = Router();

// Middleware pro ověření autentizace
router.use(authMiddleware);

// Wrapper pro handlery, který zajistí správné typování a zpracování chyb
const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// GET /api/classes/:classId/assignments - Získat všechna přiřazení pro třídu
router.get('/:classId/assignments',
  validateRequest({
    params: {
      classId: { type: 'number', required: true }
    }
  }),
  asyncHandler((req, res) => {
    return teacherAssignmentController.getAssignments(req, res);
  })
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
  asyncHandler((req, res) => {
    return teacherAssignmentController.createAssignment(req, res);
  })
);

// DELETE /api/classes/:classId/assignments/:assignmentId - Smazat přiřazení
router.delete('/:classId/assignments/:assignmentId',
  validateRequest({
    params: {
      classId: { type: 'number', required: true },
      assignmentId: { type: 'number', required: true }
    }
  }),
  asyncHandler((req, res) => {
    return teacherAssignmentController.deleteAssignment(req, res);
  })
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
  asyncHandler((req, res) => {
    return teacherAssignmentController.updateAssignments(req, res);
  })
);

export default router; 