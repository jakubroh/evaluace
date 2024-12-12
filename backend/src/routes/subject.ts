import express, { RequestHandler } from 'express';
import { subjectController } from '../controllers/subject';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';

const router = express.Router();

// Helper pro typově bezpečné handlery
const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware pro validaci
const validate = (schema: any): RequestHandler => {
  return (req, res, next) => {
    validateRequest(schema)(req, res, next);
  };
};

// Middleware pro ověření autentizace
router.use(authMiddleware);

// GET /api/subjects - Získat všechny předměty
router.get('/', asyncHandler(subjectController.getAllSubjects));

// POST /api/subjects - Vytvořit nový předmět
router.post('/',
  validate({
    body: {
      name: { type: 'string', required: true }
    }
  }),
  asyncHandler(subjectController.createSubject)
);

// PUT /api/subjects/:id - Upravit předmět
router.put('/:id',
  validate({
    params: {
      id: { type: 'number', required: true }
    },
    body: {
      name: { type: 'string', required: true }
    }
  }),
  asyncHandler(subjectController.updateSubject)
);

// DELETE /api/subjects/:id - Smazat předmět
router.delete('/:id',
  validate({
    params: {
      id: { type: 'number', required: true }
    }
  }),
  asyncHandler(subjectController.deleteSubject)
);

export default router; 