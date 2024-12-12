import { Router, Response, NextFunction, Request } from 'express';
import { teacherAssignmentController } from '../controllers/teacherAssignment';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { ParamsDictionary } from 'express-serve-static-core';

const router = Router();

type AsyncHandler<P = ParamsDictionary, ResBody = any, ReqBody = any> = (
  req: AuthRequest & { params: P } & { body: ReqBody },
  res: Response<ResBody>
) => Promise<void>;

// Middleware pro ověření autentizace
router.use(authMiddleware);

// Helper pro typově bezpečné handlery
const asyncHandler = <P = ParamsDictionary, ResBody = any, ReqBody = any>(
  fn: AsyncHandler<P, ResBody, ReqBody>
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req as AuthRequest & { params: P } & { body: ReqBody }, res);
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
  }),
  asyncHandler<{ classId: string }>(teacherAssignmentController.getAssignments)
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
  asyncHandler<
    { classId: string },
    any,
    { teacherId: number; subjectId: number }
  >(teacherAssignmentController.createAssignment)
);

// DELETE /api/classes/:classId/assignments/:assignmentId - Smazat přiřazení
router.delete('/:classId/assignments/:assignmentId',
  validateRequest({
    params: {
      classId: { type: 'number', required: true },
      assignmentId: { type: 'number', required: true }
    }
  }),
  asyncHandler<{ classId: string; assignmentId: string }>(
    teacherAssignmentController.deleteAssignment
  )
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
  asyncHandler<
    { classId: string },
    any,
    { assignments: Array<{ teacherId: number; subjectId: number }> }
  >(teacherAssignmentController.updateAssignments)
);

export default router; 