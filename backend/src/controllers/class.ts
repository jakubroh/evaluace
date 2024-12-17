import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { AppError } from '../middleware/errorHandler';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: 'admin' | 'director';
    schoolId?: number;
  };
}

export class ClassController {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // Získání seznamu tříd podle oprávnění
  getClasses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let query = `
        SELECT c.*, s.name as school_name, u.email as director_email
        FROM classes c
        JOIN schools s ON c.school_id = s.id
        JOIN users u ON c.director_id = u.id
      `;
      const params: any[] = [];

      if (req.user?.role === 'director') {
        query += ' WHERE c.director_id = $1';
        params.push(req.user.id);
      } else if (req.user?.schoolId) {
        query += ' WHERE c.school_id = $1';
        params.push(req.user.schoolId);
      }

      query += ' ORDER BY c.name';

      const result = await this.pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  };

  // Vytvoření nové třídy
  createClass = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, schoolId, directorId } = req.body;

      if (req.user?.role === 'director' && directorId !== req.user.id) {
        throw new AppError(403, 'Nemáte oprávnění vytvořit třídu pro jiného ředitele');
      }

      const result = await this.pool.query(
        `INSERT INTO classes (name, school_id, director_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, schoolId, directorId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  };

  // Aktualizace třídy
  updateClass = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const classCheck = await this.pool.query(
        'SELECT director_id FROM classes WHERE id = $1',
        [id]
      );

      if (classCheck.rows.length === 0) {
        throw new AppError(404, 'Třída nebyla nalezena');
      }

      if (req.user?.role === 'director' && classCheck.rows[0].director_id !== req.user.id) {
        throw new AppError(403, 'Nemáte oprávnění upravit tuto třídu');
      }

      const result = await this.pool.query(
        'UPDATE classes SET name = $1 WHERE id = $2 RETURNING *',
        [name, id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  };

  // Smazání třídy
  deleteClass = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const classCheck = await this.pool.query(
        'SELECT director_id FROM classes WHERE id = $1',
        [id]
      );

      if (classCheck.rows.length === 0) {
        throw new AppError(404, 'Třída nebyla nalezena');
      }

      if (req.user?.role === 'director' && classCheck.rows[0].director_id !== req.user.id) {
        throw new AppError(403, 'Nemáte oprávnění smazat tuto třídu');
      }

      const evaluationCheck = await this.pool.query(
        `SELECT id FROM evaluations 
         WHERE class_id = $1 
         AND end_date > NOW()`,
        [id]
      );

      if (evaluationCheck.rows.length > 0) {
        throw new AppError(400, 'Nelze smazat třídu s aktivními evaluacemi');
      }

      await this.pool.query('DELETE FROM classes WHERE id = $1', [id]);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // Přiřazení učitelů a předmětů ke třídě
  assignTeachersAndSubjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { assignments } = req.body;

      const classCheck = await this.pool.query(
        'SELECT director_id FROM classes WHERE id = $1',
        [id]
      );

      if (classCheck.rows.length === 0) {
        throw new AppError(404, 'Třída nebyla nalezena');
      }

      if (req.user?.role === 'director' && classCheck.rows[0].director_id !== req.user.id) {
        throw new AppError(403, 'Nemáte oprávnění spravovat tuto třídu');
      }

      await this.pool.query('BEGIN');

      try {
        await this.pool.query(
          'DELETE FROM teacher_assignments WHERE class_id = $1',
          [id]
        );

        for (const assignment of assignments) {
          await this.pool.query(
            `INSERT INTO teacher_assignments (class_id, subject_id, teacher_id)
             VALUES ($1, $2, $3)`,
            [id, assignment.subjectId, assignment.teacherId]
          );
        }

        await this.pool.query('COMMIT');
        res.json({ message: 'Přiřazení bylo úspěšně aktualizováno' });
      } catch (error) {
        await this.pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      next(error);
    }
  };
} 