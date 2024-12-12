import { Router } from 'express';
import { ClassController } from '../controllers/class';
import { Pool } from 'pg';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validator';
import { authenticateJWT, isAdminOrDirector } from '../middleware/auth';

export const createClassRouter = (pool: Pool) => {
  const router = Router();
  const classController = new ClassController(pool);

  // Získání seznamu tříd
  router.get('/',
    authenticateJWT,
    isAdminOrDirector,
    classController.getClasses
  );

  // Vytvoření nové třídy
  router.post('/',
    authenticateJWT,
    isAdminOrDirector,
    [
      body('name').notEmpty().withMessage('Název třídy je povinný'),
      body('schoolId').isInt().withMessage('ID školy musí být číslo'),
      body('directorId').isInt().withMessage('ID ředitele musí být číslo'),
      validateRequest
    ],
    classController.createClass
  );

  // Aktualizace třídy
  router.put('/:id',
    authenticateJWT,
    isAdminOrDirector,
    [
      param('id').isInt().withMessage('ID třídy musí být číslo'),
      body('name').notEmpty().withMessage('Název třídy je povinný'),
      validateRequest
    ],
    classController.updateClass
  );

  // Smazání třídy
  router.delete('/:id',
    authenticateJWT,
    isAdminOrDirector,
    [
      param('id').isInt().withMessage('ID třídy musí být číslo'),
      validateRequest
    ],
    classController.deleteClass
  );

  // Přiřazení učitelů a předmětů ke třídě
  router.post('/:id/assignments',
    authenticateJWT,
    isAdminOrDirector,
    [
      param('id').isInt().withMessage('ID třídy musí být číslo'),
      body('assignments').isArray().withMessage('Přiřazení musí být pole'),
      body('assignments.*.subjectId').isInt().withMessage('ID předmětu musí být číslo'),
      body('assignments.*.teacherId').isInt().withMessage('ID učitele musí být číslo'),
      validateRequest
    ],
    classController.assignTeachersAndSubjects
  );

  return router;
}; 