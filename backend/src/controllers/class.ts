import { Request, Response } from 'express';
import { Pool } from 'pg';

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
  getClasses = async (req: AuthRequest, res: Response) => {
    try {
      let query = `
        SELECT c.*, s.name as school_name, u.email as director_email
        FROM classes c
        JOIN schools s ON c.school_id = s.id
        JOIN users u ON c.director_id = u.id
      `;
      const params: any[] = [];

      // Filtrování podle role a školy
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
      console.error('Chyba při získávání seznamu tříd:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };

  // Vytvoření nové třídy
  createClass = async (req: AuthRequest, res: Response) => {
    try {
      const { name, schoolId, directorId } = req.body;

      // Kontrola oprávnění
      if (req.user?.role === 'director') {
        if (directorId !== req.user.id) {
          return res.status(403).json({ message: 'Nemáte oprávnění vytvořit třídu pro jiného ředitele' });
        }
      }

      const result = await this.pool.query(
        `INSERT INTO classes (name, school_id, director_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, schoolId, directorId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Chyba při vytváření třídy:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };

  // Aktualizace třídy
  updateClass = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      // Kontrola oprávnění
      const classCheck = await this.pool.query(
        'SELECT director_id FROM classes WHERE id = $1',
        [id]
      );

      if (classCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Třída nebyla nalezena' });
      }

      if (req.user?.role === 'director' && classCheck.rows[0].director_id !== req.user.id) {
        return res.status(403).json({ message: 'Nemáte oprávnění upravit tuto třídu' });
      }

      const result = await this.pool.query(
        'UPDATE classes SET name = $1 WHERE id = $2 RETURNING *',
        [name, id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Chyba při aktualizaci třídy:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };

  // Smazání třídy
  deleteClass = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Kontrola oprávnění
      const classCheck = await this.pool.query(
        'SELECT director_id FROM classes WHERE id = $1',
        [id]
      );

      if (classCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Třída nebyla nalezena' });
      }

      if (req.user?.role === 'director' && classCheck.rows[0].director_id !== req.user.id) {
        return res.status(403).json({ message: 'Nemáte oprávnění smazat tuto třídu' });
      }

      // Kontrola, zda třída nemá aktivní evaluace
      const evaluationCheck = await this.pool.query(
        `SELECT id FROM evaluations 
         WHERE class_id = $1 
         AND end_date > NOW()`,
        [id]
      );

      if (evaluationCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Nelze smazat třídu s aktivními evaluacemi' });
      }

      await this.pool.query('DELETE FROM classes WHERE id = $1', [id]);
      res.status(204).send();
    } catch (error) {
      console.error('Chyba při mazání třídy:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };

  // Přiřazení učitelů a předmětů ke třídě
  assignTeachersAndSubjects = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { assignments } = req.body;

      // Kontrola oprávnění
      const classCheck = await this.pool.query(
        'SELECT director_id FROM classes WHERE id = $1',
        [id]
      );

      if (classCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Třída nebyla nalezena' });
      }

      if (req.user?.role === 'director' && classCheck.rows[0].director_id !== req.user.id) {
        return res.status(403).json({ message: 'Nemáte oprávnění spravovat tuto třídu' });
      }

      // Transakce pro přiřazení učitelů a předmětů
      await this.pool.query('BEGIN');

      try {
        // Nejprve smažeme stávající přiřazení
        await this.pool.query(
          'DELETE FROM class_subject_teachers WHERE class_id = $1',
          [id]
        );

        // Vložíme nová přiřazení
        for (const assignment of assignments) {
          await this.pool.query(
            `INSERT INTO class_subject_teachers (class_id, subject_id, teacher_id)
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
      console.error('Chyba při přiřazování učitelů a předmětů:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };
} 