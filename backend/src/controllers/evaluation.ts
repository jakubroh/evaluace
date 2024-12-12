import { Response } from 'express';
import { pool } from '../db/pool';
import { AuthRequest } from '../middleware/auth';

interface EvaluationData {
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface EvaluationResponse {
  teacherId: number;
  subjectId: number;
  classId: number;
  accessCodeId: number;
  criteria: {
    preparation: number;
    explanation: number;
    engagement: number;
    atmosphere: number;
    individual: number;
  };
  comment?: string;
}

export const evaluationController = {
  getEvaluations: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const result = await pool.query(
        'SELECT * FROM evaluations WHERE school_id = $1',
        [req.user.schoolId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Chyba při získávání evaluací:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  getEvaluation: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const result = await pool.query(
        'SELECT * FROM evaluations WHERE id = $1 AND school_id = $2',
        [req.params.id, req.user.schoolId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Evaluace nebyla nalezena' });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Chyba při získávání evaluace:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  createEvaluation: async (req: AuthRequest, res: Response): Promise<void> => {
    const data: EvaluationData = req.body;

    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const result = await pool.query(
        `INSERT INTO evaluations (name, start_date, end_date, status, school_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [data.name, data.startDate, data.endDate, data.status, req.user.schoolId]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Chyba při vytváření evaluace:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  updateEvaluation: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const data: EvaluationData = req.body;

    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const result = await pool.query(
        `UPDATE evaluations 
         SET name = $1, start_date = $2, end_date = $3, status = $4
         WHERE id = $5 AND school_id = $6
         RETURNING *`,
        [data.name, data.startDate, data.endDate, data.status, id, req.user.schoolId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Evaluace nebyla nalezena' });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Chyba při aktualizaci evaluace:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  deleteEvaluation: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const result = await pool.query(
        'DELETE FROM evaluations WHERE id = $1 AND school_id = $2 RETURNING id',
        [id, req.user.schoolId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Evaluace nebyla nalezena' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Chyba při mazání evaluace:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  getEvaluationStats: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      // Získat celkový počet odpovědí
      const responsesResult = await pool.query(
        'SELECT COUNT(*) FROM evaluation_responses WHERE evaluation_id = $1',
        [id]
      );

      // Získat průměrné hodnocení pro každé kritérium
      const averagesResult = await pool.query(
        `SELECT 
          AVG((criteria->>'preparation')::numeric) as preparation,
          AVG((criteria->>'explanation')::numeric) as explanation,
          AVG((criteria->>'engagement')::numeric) as engagement,
          AVG((criteria->>'atmosphere')::numeric) as atmosphere,
          AVG((criteria->>'individual')::numeric) as individual
         FROM evaluation_responses 
         WHERE evaluation_id = $1`,
        [id]
      );

      // Získat míru dokončení (počet použitých kódů / celkový počet kódů)
      const completionResult = await pool.query(
        `SELECT 
          CAST(COUNT(CASE WHEN is_used THEN 1 END) AS float) / 
          CAST(COUNT(*) AS float) as completion_rate
         FROM access_codes 
         WHERE evaluation_id = $1`,
        [id]
      );

      res.json({
        totalResponses: parseInt(responsesResult.rows[0].count),
        averageScores: averagesResult.rows[0],
        completionRate: completionResult.rows[0].completion_rate || 0
      });
    } catch (error) {
      console.error('Chyba při získávání statistik:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  getEvaluationResponses: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      const result = await pool.query(
        `SELECT 
          er.*,
          t.name as teacher_name,
          s.name as subject_name,
          c.name as class_name
         FROM evaluation_responses er
         JOIN teachers t ON er.teacher_id = t.id
         JOIN subjects s ON er.subject_id = s.id
         JOIN classes c ON er.class_id = c.id
         WHERE er.evaluation_id = $1
         ORDER BY er.created_at DESC`,
        [id]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('Chyba při získávání odpovědí:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  exportToCSV: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      // Získat data pro export
      const result = await pool.query(
        `SELECT 
          er.*,
          t.name as teacher_name,
          s.name as subject_name,
          c.name as class_name
         FROM evaluation_responses er
         JOIN teachers t ON er.teacher_id = t.id
         JOIN subjects s ON er.subject_id = s.id
         JOIN classes c ON er.class_id = c.id
         WHERE er.evaluation_id = $1
         ORDER BY er.created_at DESC`,
        [id]
      );

      // Vytvořit CSV
      const csv = [
        'Učitel,Předmět,Třída,Příprava,Výklad,Zapojení,Atmosféra,Individuální přístup,Komentář,Vytvořeno',
        ...result.rows.map(row => [
          row.teacher_name,
          row.subject_name,
          row.class_name,
          row.criteria.preparation,
          row.criteria.explanation,
          row.criteria.engagement,
          row.criteria.atmosphere,
          row.criteria.individual,
          row.comment || '',
          new Date(row.created_at).toLocaleString('cs-CZ')
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=evaluace-${id}.csv`);
      res.send(csv);
    } catch (error) {
      console.error('Chyba při exportu do CSV:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  exportToPDF: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      if (!req.user) {
        res.status(401).json({ error: 'Neautorizovaný přístup' });
        return;
      }

      // TODO: Implementovat generování PDF
      res.status(501).json({ error: 'Funkce není implementována' });
    } catch (error) {
      console.error('Chyba při exportu do PDF:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  },

  saveResponse: async (req: AuthRequest, res: Response): Promise<void> => {
    const { id: evaluationId } = req.params;
    const {
      teacherId,
      subjectId,
      classId,
      accessCodeId,
      criteria,
      comment
    }: EvaluationResponse = req.body;

    try {
      // Ověřit platnost přístupového kódu
      const accessCodeResult = await pool.query(
        'SELECT * FROM access_codes WHERE id = $1 AND evaluation_id = $2',
        [accessCodeId, evaluationId]
      );

      if (accessCodeResult.rows.length === 0) {
        res.status(400).json({ error: 'Neplatný přístupový kód' });
        return;
      }

      const accessCode = accessCodeResult.rows[0];
      if (accessCode.is_used) {
        res.status(400).json({ error: 'Tento kód již byl použit' });
        return;
      }

      // Začít transakci
      await pool.query('BEGIN');

      // Uložit odpověď
      const responseResult = await pool.query(
        `INSERT INTO evaluation_responses 
         (evaluation_id, teacher_id, subject_id, class_id, criteria, comment)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [evaluationId, teacherId, subjectId, classId, criteria, comment]
      );

      // Označit kód jako použitý
      await pool.query(
        'UPDATE access_codes SET is_used = true WHERE id = $1',
        [accessCodeId]
      );

      await pool.query('COMMIT');

      res.status(201).json(responseResult.rows[0]);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Chyba při ukládání odpovědi:', error);
      res.status(500).json({ error: 'Interní chyba serveru' });
    }
  }
}; 