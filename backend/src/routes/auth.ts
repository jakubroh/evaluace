import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { Pool } from 'pg';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validator';
import { authenticateJWT, isAdmin } from '../middleware/auth';

export const createAuthRouter = (pool: Pool) => {
  const router = Router();
  const authController = new AuthController(pool);

  router.post('/login',
    [
      body('email').isEmail().withMessage('Zadejte platný email'),
      body('password').notEmpty().withMessage('Zadejte heslo'),
      validateRequest
    ],
    authController.login
  );

  // Registrace ředitele - pouze pro adminy
  router.post('/register/director',
    authenticateJWT,
    isAdmin,
    [
      body('email').isEmail().withMessage('Zadejte platný email'),
      body('password')
        .isLength({ min: 6 })
        .withMessage('Heslo musí mít alespoň 6 znaků'),
      body('firstName').notEmpty().withMessage('Zadejte jméno'),
      body('lastName').notEmpty().withMessage('Zadejte příjmení'),
      body('schoolId').isInt().withMessage('Zadejte platné ID školy'),
      validateRequest
    ],
    authController.registerDirector
  );

  // Registrace admina - pouze pro existující adminy
  router.post('/register/admin',
    authenticateJWT,
    isAdmin,
    [
      body('email').isEmail().withMessage('Zadejte platný email'),
      body('password')
        .isLength({ min: 6 })
        .withMessage('Heslo musí mít alespoň 6 znaků'),
      body('firstName').notEmpty().withMessage('Zadejte jméno'),
      body('lastName').notEmpty().withMessage('Zadejte příjmení'),
      validateRequest
    ],
    authController.registerAdmin
  );

  return router;
}; 