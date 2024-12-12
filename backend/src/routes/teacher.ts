import express from 'express';
import { teacherController } from '../controllers/teacher';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';

const router = express.Router();

// Middleware pro ověření autentizace
router.use(authMiddleware);

// GET /api/teachers - Získat všechny učitele
router.get('/', teacherController.getAllTeachers);

// POST /api/teachers - Vytvořit nového učitele
router.post('/',
  validateRequest({
    body: {
      name: { type: 'string', required: true }
    }
  }),
  teacherController.createTeacher
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
  teacherController.updateTeacher
);

// DELETE /api/teachers/:id - Smazat učitele
router.delete('/:id',
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  teacherController.deleteTeacher
);

export default router; 