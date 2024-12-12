import { Router } from 'express';
import { AccessCodeController } from '../controllers/accessCode';
import { Pool } from 'pg';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validator';
import { authenticateJWT, checkSchoolAccess } from '../middleware/auth';

export const createAccessCodeRouter = (pool: Pool) => {
  const router = Router();
  const accessCodeController = new AccessCodeController(pool);

  // Generování kódů pro třídy
  router.post('/evaluation/:evaluationId/codes',
    authenticateJWT,
    [
      param('evaluationId').isInt().withMessage('Neplatné ID evaluace'),
      body('classes').isArray().withMessage('Zadejte seznam tříd'),
      body('classes.*').isString().withMessage('Název třídy musí být text'),
      validateRequest
    ],
    accessCodeController.generateCodes
  );

  // Seznam kódů pro evaluaci
  router.get('/evaluation/:evaluationId/codes',
    authenticateJWT,
    [
      param('evaluationId').isInt().withMessage('Neplatné ID evaluace'),
      validateRequest
    ],
    accessCodeController.listCodes
  );

  // Ověření kódu pro studenta
  router.post('/verify',
    [
      body('code')
        .isString()
        .isLength({ min: 6, max: 6 })
        .withMessage('Neplatný formát kódu'),
      validateRequest
    ],
    accessCodeController.verifyCode
  );

  // Smazání konkrétního kódu
  router.delete('/:id',
    authenticateJWT,
    [
      param('id').isInt().withMessage('Neplatné ID kódu'),
      validateRequest
    ],
    accessCodeController.deleteCode
  );

  // Smazání všech kódů pro evaluaci
  router.delete('/evaluation/:evaluationId',
    authenticateJWT,
    [
      param('evaluationId').isInt().withMessage('Neplatné ID evaluace'),
      validateRequest
    ],
    accessCodeController.deleteAllCodes
  );

  return router;
}; 