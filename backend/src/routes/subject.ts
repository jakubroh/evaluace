import express from 'express';
import { subjectController } from '../controllers/subject';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';

const router = express.Router();

// Middleware pro ověření autentizace
router.use(authMiddleware);

// GET /api/subjects - Získat všechny předměty
router.get('/', subjectController.getAllSubjects);

// POST /api/subjects - Vytvořit nový předmět
router.post('/',
  validateRequest({
    body: {
      name: { type: 'string', required: true }
    }
  }),
  subjectController.createSubject
);

// PUT /api/subjects/:id - Upravit předmět
router.put('/:id',
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    },
    body: {
      name: { type: 'string', required: true }
    }
  }),
  subjectController.updateSubject
);

// DELETE /api/subjects/:id - Smazat předmět
router.delete('/:id',
  validateRequest({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  subjectController.deleteSubject
);

export default router; 