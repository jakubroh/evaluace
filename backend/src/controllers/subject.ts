import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { AuthRequest } from '../middleware/auth';

export const subjectController = {
  // Získat všechny předměty
  getAllSubjects: async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        'SELECT id, name FROM subjects WHERE school_id = $1',
        [req.user.schoolId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Chyba při získávání předmětů:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  // Přidat nový předmět
  createSubject: async (req: AuthRequest, res: Response) => {
    const { name } = req.body;

    try {
      const result = await pool.query(
        'INSERT INTO subjects (name, school_id) VALUES ($1, $2) RETURNING id, name',
        [name, req.user.schoolId]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Chyba při vytváření předmětu:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  // Upravit předmět
  updateSubject: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
      const result = await pool.query(
        'UPDATE subjects SET name = $1 WHERE id = $2 AND school_id = $3 RETURNING id, name',
        [name, id, req.user.schoolId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Předmět nebyl nalezen' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Chyba při aktualizaci předmětu:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  // Smazat předmět
  deleteSubject: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        'DELETE FROM subjects WHERE id = $1 AND school_id = $2 RETURNING id',
        [id, req.user.schoolId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Předmět nebyl nalezen' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Chyba při mazání předmětu:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  }
}; 