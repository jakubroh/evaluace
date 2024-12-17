import { Router } from 'express';
import { AccessCodeController } from '../controllers/accessCode';
import { Pool } from 'pg';
import { validateRequest } from '../middleware/validator';
import { authenticateJWT, checkSchoolAccess } from '../middleware/auth';

export const createAccessCodeRouter = (pool: Pool) => {
  const router = Router();
  const accessCodeController = new AccessCodeController(pool);

  // Generování kódů pro třídy
  router.post('/evaluation/:evaluationId/codes',
    authenticateJWT,
    validateRequest({
      params: {
        evaluationId: { type: 'number', required: true }
      },
      body: {
        classes: {
          type: 'array',
          required: true,
          items: {
            type: 'string'
          }
        }
      }
    }),
    accessCodeController.generateCodes
  );

  // Seznam kódů pro evaluaci
  router.get('/evaluation/:evaluationId/codes',
    authenticateJWT,
    validateRequest({
      params: {
        evaluationId: { type: 'number', required: true }
      }
    }),
    accessCodeController.listCodes
  );

  // Ověření kódu pro studenta
  router.post('/verify',
    validateRequest({
      body: {
        code: {
          type: 'string',
          required: true
        }
      }
    }),
    accessCodeController.verifyCode
  );

  // Smazání konkrétního kódu
  router.delete('/:id',
    authenticateJWT,
    validateRequest({
      params: {
        id: { type: 'number', required: true }
      }
    }),
    accessCodeController.deleteCode
  );

  // Smazání všech kódů pro evaluaci
  router.delete('/evaluation/:evaluationId',
    authenticateJWT,
    validateRequest({
      params: {
        evaluationId: { type: 'number', required: true }
      }
    }),
    accessCodeController.deleteAllCodes
  );

  return router;
}; 