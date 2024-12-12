import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { AuthRequest } from '../middleware/auth';

export const teacherController = {
  // Získat všechny učitele
  getAllTeachers: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const result = await pool.query(
        'SELECT id, name FROM teachers WHERE school_id = $1',
        [req.user.schoolId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Chyba při získávání učitelů:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  // Přidat nového učitele
  createTeacher: async (req: AuthRequest, res: Response): Promise<void> => {
    const { name } = req.body;

    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const result = await pool.query(
        'INSERT INTO teachers (name, school_id) VALUES ($1, $2) RETURNING id, name',
        [name, req.user.schoolId]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Chyba při vytváření učitele:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  // Upravit učitele
  updateTeacher: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name } = req.body;

    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const result = await pool.query(
        'UPDATE teachers SET name = $1 WHERE id = $2 AND school_id = $3 RETURNING id, name',
        [name, id, req.user.schoolId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Učitel nebyl nalezen' });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Chyba při aktualizaci učitele:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  // Smazat učitele
  deleteTeacher: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const result = await pool.query(
        'DELETE FROM teachers WHERE id = $1 AND school_id = $2 RETURNING id',
        [id, req.user.schoolId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Učitel nebyl nalezen' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Chyba při mazání učitele:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  }
}; 