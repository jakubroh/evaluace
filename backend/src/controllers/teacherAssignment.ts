import { Response } from 'express';
import { pool } from '../db/pool';
import { AuthRequest } from '../middleware/auth';

export const teacherAssignmentController = {
  // Získat všechna přiřazení pro třídu
  getAssignments: async (req: AuthRequest, res: Response) => {
    const { classId } = req.params;

    try {
      const result = await pool.query(
        `SELECT ta.id, ta.teacher_id, ta.subject_id, t.name as teacher_name, s.name as subject_name
         FROM teacher_assignments ta
         JOIN teachers t ON ta.teacher_id = t.id
         JOIN subjects s ON ta.subject_id = s.id
         WHERE ta.class_id = $1 AND t.school_id = $2`,
        [classId, req.user.schoolId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Chyba při získávání přiřazení:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  // Vytvořit nové přiřazení
  createAssignment: async (req: AuthRequest, res: Response) => {
    const { classId } = req.params;
    const { teacherId, subjectId } = req.body;

    try {
      // Ověření, že učitel a předmět patří ke stejné škole
      const validationResult = await pool.query(
        `SELECT t.id as teacher_exists, s.id as subject_exists
         FROM teachers t
         CROSS JOIN subjects s
         WHERE t.id = $1 AND s.id = $2 
         AND t.school_id = $3 AND s.school_id = $3`,
        [teacherId, subjectId, req.user.schoolId]
      );

      if (validationResult.rows.length === 0) {
        return res.status(400).json({ error: 'Neplatný učitel nebo předmět' });
      }

      // Kontrola duplicitního přiřazení
      const existingAssignment = await pool.query(
        'SELECT id FROM teacher_assignments WHERE class_id = $1 AND teacher_id = $2 AND subject_id = $3',
        [classId, teacherId, subjectId]
      );

      if (existingAssignment.rows.length > 0) {
        return res.status(400).json({ error: 'Toto přiřazení již existuje' });
      }

      const result = await pool.query(
        `INSERT INTO teacher_assignments (class_id, teacher_id, subject_id)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [classId, teacherId, subjectId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Chyba při vytváření přiřazení:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  // Smazat přiřazení
  deleteAssignment: async (req: AuthRequest, res: Response) => {
    const { classId, assignmentId } = req.params;

    try {
      const result = await pool.query(
        `DELETE FROM teacher_assignments ta
         USING teachers t
         WHERE ta.id = $1 AND ta.class_id = $2
         AND ta.teacher_id = t.id AND t.school_id = $3
         RETURNING ta.id`,
        [assignmentId, classId, req.user.schoolId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Přiřazení nebylo nalezeno' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Chyba při mazání přiřazení:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  // Aktualizovat všechna přiřazení pro třídu
  updateAssignments: async (req: AuthRequest, res: Response) => {
    const { classId } = req.params;
    const { assignments } = req.body;

    try {
      await pool.query('BEGIN');

      // Smazat všechna existující přiřazení pro třídu
      await pool.query(
        `DELETE FROM teacher_assignments ta
         USING teachers t
         WHERE ta.class_id = $1
         AND ta.teacher_id = t.id AND t.school_id = $2`,
        [classId, req.user.schoolId]
      );

      // Vložit nová přiřazení
      for (const assignment of assignments) {
        await pool.query(
          `INSERT INTO teacher_assignments (class_id, teacher_id, subject_id)
           VALUES ($1, $2, $3)`,
          [classId, assignment.teacherId, assignment.subjectId]
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