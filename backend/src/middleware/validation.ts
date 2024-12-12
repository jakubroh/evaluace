import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateEvaluation = [
  body('teacherId').isInt().withMessage('ID učitele musí být číslo'),
  body('subjectId').isInt().withMessage('ID předmětu musí být číslo'),
  body('classId').isInt().withMessage('ID třídy musí být číslo'),
  body('accessCodeId').isInt().withMessage('ID přístupového kódu musí být číslo'),
  body('criteria').isObject().withMessage('Kritéria musí být objekt'),
  body('criteria.*').isInt({ min: 1, max: 5 }).withMessage('Hodnocení musí být číslo mezi 1 a 5'),
  body('comment').optional().isString().withMessage('Komentář musí být text'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateAccessCode = [
  body('code').isString().isLength({ min: 6 }).withMessage('Přístupový kód musí mít alespoň 6 znaků'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
]; 