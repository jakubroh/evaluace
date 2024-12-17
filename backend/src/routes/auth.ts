import { Router } from 'express';
import { AuthController } from '../controllers/auth';
import { Pool } from 'pg';
import { validateRequest } from '../middleware/validator';
import { authenticateJWT, isAdmin } from '../middleware/auth';

export const createAuthRouter = (pool: Pool) => {
  const router = Router();
  const authController = new AuthController(pool);

  router.post('/login',
    validateRequest({
      body: {
        email: { type: 'string', required: true },
        password: { type: 'string', required: true }
      }
    }),
    authController.login
  );

  // Registrace ředitele - pouze pro adminy
  router.post('/register/director',
    authenticateJWT,
    isAdmin,
    validateRequest({
      body: {
        email: { type: 'string', required: true },
        password: { type: 'string', required: true },
        firstName: { type: 'string', required: true },
        lastName: { type: 'string', required: true },
        schoolId: { type: 'number', required: true }
      }
    }),
    authController.registerDirector
  );

  // Registrace admina - pouze pro existující adminy
  router.post('/register/admin',
    authenticateJWT,
    isAdmin,
    validateRequest({
      body: {
        email: { type: 'string', required: true },
        password: { type: 'string', required: true },
        firstName: { type: 'string', required: true },
        lastName: { type: 'string', required: true }
      }
    }),
    authController.registerAdmin
  );

  return router;
}; 