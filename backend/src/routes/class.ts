import { Router, RequestHandler } from 'express';
import { ClassController } from '../controllers/class';
import { Pool } from 'pg';
import { validateRequest } from '../middleware/validator';
import { authMiddleware, isAdminOrDirector } from '../middleware/auth';

export const createClassRouter = (pool: Pool) => {
  const router = Router();
  const classController = new ClassController(pool);

  // Helper pro typově bezpečné handlery
  const asyncHandler = (fn: RequestHandler): RequestHandler => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  // Získání seznamu tříd
  router.get('/',
    authMiddleware,
    isAdminOrDirector,
    asyncHandler(classController.getClasses)
  );

  // Vytvoření nové třídy
  router.post('/',
    authMiddleware,
    isAdminOrDirector,
    validateRequest({
      body: {
        name: { type: 'string', required: true },
        schoolId: { type: 'number', required: true },
        directorId: { type: 'number', required: true }
      }
    }),
    asyncHandler(classController.createClass)
  );

  // Aktualizace třídy
  router.put('/:id',
    authMiddleware,
    isAdminOrDirector,
    validateRequest({
      params: {
        id: { type: 'number', required: true }
      },
      body: {
        name: { type: 'string', required: true }
      }
    }),
    asyncHandler(classController.updateClass)
  );

  // Smazání třídy
  router.delete('/:id',
    authMiddleware,
    isAdminOrDirector,
    validateRequest({
      params: {
        id: { type: 'number', required: true }
      }
    }),
    asyncHandler(classController.deleteClass)
  );

  // Přiřazení učitelů a předmětů ke třídě
  router.post('/:id/assignments',
    authMiddleware,
    isAdminOrDirector,
    validateRequest({
      params: {
        id: { type: 'number', required: true }
      },
      body: {
        assignments: {
          type: 'array',
          required: true,
          items: {
            type: 'object',
            properties: {
              subjectId: { type: 'number', required: true },
              teacherId: { type: 'number', required: true }
            }
          }
        }
      }
    }),
    asyncHandler(classController.assignTeachersAndSubjects)
  );

  return router;
}; 