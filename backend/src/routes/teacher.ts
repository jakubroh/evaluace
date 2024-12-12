import express from 'express';
import { teacherController } from '../controllers/teacher';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { RequestHandler } from 'express';

const router = express.Router();

// Middleware pro ověření autentizace
router.use(authMiddleware);

// Helper pro typově bezpečné handlery
const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// GET /api/teachers - Získat všechny učitele
router.get('/', asyncHandler(teacherController.getAllTeachers));

// POST /api/teachers - Vytvořit nového učitele
router.post('/',
  validateRequest({
    body: {
      name: { type: 'string', required: true }
    }
  }),
  asyncHandler(teacherController.createTeacher)
);

// PUT /api/teachers/:id - Upravit učitele
router.put('/:id',
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    },
    body: {
      name: { type: 'string', required: true }
    }
  }),
  asyncHandler(teacherController.updateTeacher)
);

// DELETE /api/teachers/:id - Smazat učitele
router.delete('/:id',
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler(teacherController.deleteTeacher)
);

export default router; 