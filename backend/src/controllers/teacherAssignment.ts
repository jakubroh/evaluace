import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { AuthRequest } from '../middleware/auth';

export const teacherAssignmentController = {
  getAssignments: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const result = await pool.query(
        'SELECT * FROM teacher_assignments WHERE class_id = $1',
        [req.params.classId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Chyba při získávání přiřazení:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  createAssignment: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const { teacherId, subjectId } = req.body;
      const result = await pool.query(
        'INSERT INTO teacher_assignments (teacher_id, subject_id, class_id) VALUES ($1, $2, $3) RETURNING *',
        [teacherId, subjectId, req.params.classId]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Chyba při vytváření přiřazení:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  deleteAssignment: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const result = await pool.query(
        'DELETE FROM teacher_assignments WHERE id = $1 AND class_id = $2 RETURNING *',
        [req.params.assignmentId, req.params.classId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Přiřazení nebylo nalezeno' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Chyba při mazání přiřazení:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  updateAssignments: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const { assignments } = req.body;
      const classId = req.params.classId;

      await pool.query('BEGIN');

      // Smazat všechna stávající přiřazení pro třídu
      await pool.query(
        'DELETE FROM teacher_assignments WHERE class_id = $1',
        [classId]
      );

      // Vytvořit nová přiřazení
      for (const assignment of assignments) {
        await pool.query(
          'INSERT INTO teacher_assignments (teacher_id, subject_id, class_id) VALUES ($1, $2, $3)',
          [assignment.teacherId, assignment.subjectId, classId]
        );
      }

      await pool.query('COMMIT');
      res.status(200).json({ message: 'Přiřazení byla úspěšně aktualizována' });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Chyba při aktualizaci přiřazení:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  }
}; 