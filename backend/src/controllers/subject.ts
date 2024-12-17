import { Response, NextFunction } from 'express';
import { pool } from '../db/pool';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const subjectController = {
  // Získat všechny předměty
  getAllSubjects: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Neautorizovaný přístup');
      }

      const result = await pool.query(
        'SELECT id, name FROM subjects WHERE school_id = $1',
        [req.user.schoolId]
      );
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Přidat nový předmět
  createSubject: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { name } = req.body;

    try {
      if (!req.user) {
        throw new AppError(401, 'Neautorizovaný přístup');
      }

      const result = await pool.query(
        'INSERT INTO subjects (name, school_id) VALUES ($1, $2) RETURNING id, name',
        [name, req.user.schoolId]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // Upravit předmět
  updateSubject: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { name } = req.body;

    try {
      if (!req.user) {
        throw new AppError(401, 'Neautorizovaný přístup');
      }

      const result = await pool.query(
        'UPDATE subjects SET name = $1 WHERE id = $2 AND school_id = $3 RETURNING id, name',
        [name, id, req.user.schoolId]
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'Předmět nebyl nalezen');
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // Smazat předmět
  deleteSubject: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    try {
      if (!req.user) {
        throw new AppError(401, 'Neautorizovaný přístup');
      }

      const result = await pool.query(
        'DELETE FROM subjects WHERE id = $1 AND school_id = $2 RETURNING id',
        [id, req.user.schoolId]
      );

      if (result.rows.length === 0) {
        throw new AppError(404, 'Předmět nebyl nalezen');
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}; 