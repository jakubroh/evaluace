import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { PoolClient } from 'pg';
import puppeteer from 'puppeteer';
import { AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';

interface EvaluationCriteria {
  [key: string]: number;
}

interface EvaluationData {
  teacherId: number;
  subjectId: number;
  classId: number;
  accessCodeId: number;
  criteria: EvaluationCriteria;
  comment?: string;
}

interface EvaluationRequest extends Request {
  body: EvaluationData;
}

interface EvaluationResponse {
  id: number;
  teacherId: number;
  subjectId: number;
  classId: number;
  accessCodeId: number;
  criteria: EvaluationCriteria;
  comment?: string;
  createdAt: Date;
}

interface EvaluationStats {
  totalResponses: number;
  averageScores: {
    [K in keyof EvaluationCriteria]: number;
  };
  completionRate: number;
}

export const evaluationValidation = {
  create: validateRequest({
    body: {
      name: { type: 'string', required: true },
      description: { type: 'string', required: true },
      startDate: { type: 'string', required: true },
      endDate: { type: 'string', required: true }
    }
  }),
  
  update: validateRequest({
    body: {
      name: { type: 'string', required: true },
      description: { type: 'string', required: true },
      startDate: { type: 'string', required: true },
      endDate: { type: 'string', required: true }
    },
    params: {
      id: { type: 'number', required: true }
    }
  }),
  
  saveResponse: validateRequest({
    body: {
      teacherId: { type: 'number', required: true },
      subjectId: { type: 'number', required: true },
      classId: { type: 'number', required: true },
      accessCodeId: { type: 'number', required: true },
      criteria: {
        type: 'object',
        required: true,
        properties: {
          preparation: { type: 'number', required: true },
          explanation: { type: 'number', required: true },
          engagement: { type: 'number', required: true },
          atmosphere: { type: 'number', required: true },
          individual: { type: 'number', required: true }
        }
      },
      comment: { type: 'string' }
    },
    params: {
      id: { type: 'number', required: true }
    }
  })
};

export const evaluationController = {
  async getEvaluations(req: AuthRequest, res: Response) {
    if (!req.user?.schoolId) {
      return res.status(400).json({ error: 'Chybí ID školy' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM evaluations WHERE school_id = $1 ORDER BY created_at DESC',
        [req.user.schoolId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Chyba při načítání evaluací:', err);
      res.status(500).json({ error: 'Interní chyba serveru' });
    } finally {
      client.release();
    }
  },

  async getEvaluation(req: AuthRequest, res: Response) {
    if (!req.user?.schoolId) {
      return res.status(400).json({ error: 'Chybí ID školy' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM evaluations WHERE id = $1 AND school_id = $2',
        [req.params.id, req.user.schoolId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Evaluace nenalezena' });
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Chyba při načítání evaluace:', err);
      res.status(500).json({ error: 'Interní chyba serveru' });
    } finally {
      client.release();
    }
  },

  async createEvaluation(req: AuthRequest, res: Response) {
    if (!req.user?.schoolId) {
      return res.status(400).json({ error: 'Chybí ID školy' });
    }

    const client = await pool.connect();
    try {
      const { name, description, startDate, endDate } = req.body;
      
      // Validace dat
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Neplatné datum' });
      }
      
      if (start >= end) {
        return res.status(400).json({ error: 'Datum začátku musí být před datem konce' });
      }
      
      const result = await client.query(
        'INSERT INTO evaluations (name, description, start_date, end_date, school_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description, startDate, endDate, req.user.schoolId]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Chyba při vytváření evaluace:', err);
      res.status(500).json({ error: 'Interní chyba serveru' });
    } finally {
      client.release();
    }
  },

  async updateEvaluation(req: AuthRequest, res: Response) {
    if (!req.user?.schoolId) {
      return res.status(400).json({ error: 'Chybí ID školy' });
    }

    const client = await pool.connect();
    try {
      const { name, description, startDate, endDate } = req.body;
      
      // Validace dat
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Neplatné datum' });
      }
      
      if (start >= end) {
        return res.status(400).json({ error: 'Datum začátku musí být před datem konce' });
      }
      
      const result = await client.query(
        'UPDATE evaluations SET name = $1, description = $2, start_date = $3, end_date = $4 WHERE id = $5 AND school_id = $6 RETURNING *',
        [name, description, startDate, endDate, req.params.id, req.user.schoolId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Evaluace nenalezena' });
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Chyba při aktualizaci evaluace:', err);
      res.status(500).json({ error: 'Interní chyba serveru' });
    } finally {
      client.release();
    }
  },

  async deleteEvaluation(req: AuthRequest, res: Response) {
    if (!req.user?.schoolId) {
      return res.status(400).json({ error: 'Chybí ID školy' });
    }

    const client = await pool.connect();
    try {
      // Kontrola existence odpovědí
      const responsesResult = await client.query(
        'SELECT COUNT(*) as count FROM evaluation_responses WHERE evaluation_id = $1',
        [req.params.id]
      );
      
      if (parseInt(responsesResult.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: 'Nelze smazat evaluaci, která již obsahuje odpovědi' 
        });
      }
      
      const result = await client.query(
        'DELETE FROM evaluations WHERE id = $1 AND school_id = $2 RETURNING *',
        [req.params.id, req.user.schoolId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Evaluace nenalezena' });
      }
      
      res.json({ message: 'Evaluace byla úspěšně smazána' });
    } catch (err) {
      console.error('Chyba při mazání evaluace:', err);
      res.status(500).json({ error: 'Interní chyba serveru' });
    } finally {
      client.release();
    }
  },

  async saveResponse(req: EvaluationRequest, res: Response) {
    const client = await pool.connect();
    try {
      const { teacherId, subjectId, classId, accessCodeId, criteria, comment } = req.body;
      
      // Validace hodnocení
      const scores = Object.values(criteria);
      if (scores.some(score => score < 1 || score > 5)) {
        return res.status(400).json({ 
          error: 'Hodnocení musí být v rozsahu 1-5' 
        });
      }
      
      await client.query('BEGIN');
      
      // Ověření platnosti přístupového kódu
      const codeResult = await client.query(
        'SELECT * FROM access_codes WHERE id = $1 AND evaluation_id = $2 AND used = false',
        [accessCodeId, req.params.id]
      );
      
      if (codeResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Neplatný přístupový kód' });
      }
      
      // Ověření existence učitele, předmětu a třídy
      const validationResult = await client.query(
        `SELECT 
          (SELECT EXISTS(SELECT 1 FROM teachers WHERE id = $1)) as teacher_exists,
          (SELECT EXISTS(SELECT 1 FROM subjects WHERE id = $2)) as subject_exists,
          (SELECT EXISTS(SELECT 1 FROM classes WHERE id = $3)) as class_exists`,
        [teacherId, subjectId, classId]
      );
      
      const { teacher_exists, subject_exists, class_exists } = validationResult.rows[0];
      
      if (!teacher_exists || !subject_exists || !class_exists) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: 'Neplatný učitel, předmět nebo třída' 
        });
      }
      
      // Uložení odpovědi
      const responseResult = await client.query(
        `INSERT INTO evaluation_responses 
        (evaluation_id, teacher_id, subject_id, class_id, access_code_id, criteria, comment) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
        [req.params.id, teacherId, subjectId, classId, accessCodeId, criteria, comment]
      );
      
      // Označení kódu jako použitého
      await client.query(
        'UPDATE access_codes SET used = true WHERE id = $1',
        [accessCodeId]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json(responseResult.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Chyba při ukládání odpovědi:', err);
      res.status(500).json({ error: 'Interní chyba serveru' });
    } finally {
      client.release();
    }
  },

  async getEvaluationResponses(req: Request, res: Response) {
    const client = await pool.connect();
    try {
      const result = await client.query(
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
        [req.params.id]
      );
      
      res.json(result.rows);
    } catch (err) {
      console.error('Chyba při načítání odpovědí:', err);
      res.status(500).json({ error: 'Interní chyba serveru' });
    } finally {
      client.release();
    }
  },

  async getEvaluationStats(req: Request, res: Response) {
    const client = await pool.connect();
    try {
      // Získání celkového počtu odpovědí
      const totalResult = await client.query(
        'SELECT COUNT(*) as total FROM evaluation_responses WHERE evaluation_id = $1',
        [req.params.id]
      );
      
      // Získání průměrných hodnot pro každé kritérium
      const averagesResult = await client.query(
        `SELECT 
          AVG((criteria->>'preparation')::numeric) as preparation,
          AVG((criteria->>'explanation')::numeric) as explanation,
          AVG((criteria->>'engagement')::numeric) as engagement,
          AVG((criteria->>'atmosphere')::numeric) as atmosphere,
          AVG((criteria->>'individual')::numeric) as individual
        FROM evaluation_responses 
        WHERE evaluation_id = $1`,
        [req.params.id]
      );
      
      // Získání počtu použitých a celkového počtu kódů
      const codesResult = await client.query(
        'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE used = true) as used FROM access_codes WHERE evaluation_id = $1',
        [req.params.id]
      );
      
      const stats: EvaluationStats = {
        totalResponses: parseInt(totalResult.rows[0].total),
        averageScores: averagesResult.rows[0],
        completionRate: codesResult.rows[0].total > 0 
          ? parseInt(codesResult.rows[0].used) / parseInt(codesResult.rows[0].total)
          : 0
      };
      
      res.json(stats);
    } catch (err) {
      console.error('Chyba při načítání statistik:', err);
      res.status(500).json({ error: 'Interní chyba serveru' });
    } finally {
      client.release();
    }
  },

  async exportToCSV(req: Request, res: Response) {
    const client = await pool.connect();
    try {
      const result = await client.query(
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
        [req.params.id]
      );
      
      const csvHeader = 'Učitel,Předmět,Třída,Příprava,Výklad,Zapojení,Atmosféra,Individuální přístup,Komentář,Datum\n';
      const csvRows = result.rows.map(row => {
        const criteria = row.criteria;
        return `"${row.teacher_name}","${row.subject_name}","${row.class_name}",${criteria.preparation},${criteria.explanation},${criteria.engagement},${criteria.atmosphere},${criteria.individual},"${row.comment || ''}","${new Date(row.created_at).toLocaleString('cs-CZ')}"`;
      }).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=evaluace-${req.params.id}.csv`);
      res.send(csvHeader + csvRows);
    } catch (err) {
      console.error('Chyba při exportu do CSV:', err);
      res.status(500).json({ error: 'Interní chyba serveru' });
    } finally {
      client.release();
    }
  },

  async exportToPDF(req: Request, res: Response) {
    const client = await pool.connect();
    try {
      // Získání dat pro PDF
      const [evaluationResult, responsesResult, statsResult] = await Promise.all([
        client.query('SELECT * FROM evaluations WHERE id = $1', [req.params.id]),
        client.query(
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
          [req.params.id]
        ),
        client.query(
          `SELECT 
            AVG((criteria->>'preparation')::numeric) as preparation,
            AVG((criteria->>'explanation')::numeric) as explanation,
            AVG((criteria->>'engagement')::numeric) as engagement,
            AVG((criteria->>'atmosphere')::numeric) as atmosphere,
            AVG((criteria->>'individual')::numeric) as individual
          FROM evaluation_responses 
          WHERE evaluation_id = $1`,
          [req.params.id]
        )
      ]);

      const evaluation = evaluationResult.rows[0];
      const responses = responsesResult.rows;
      const stats = statsResult.rows[0];

      // Generování HTML pro PDF
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #2563eb; }
            .stats { margin: 20px 0; }
            .responses { margin-top: 40px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>Report evaluace: ${evaluation.name}</h1>
          <p>${evaluation.description}</p>
          
          <div class="stats">
            <h2>Statistiky</h2>
            <table>
              <tr>
                <th>Kritérium</th>
                <th>Průměrné hodnocení</th>
              </tr>
              <tr>
                <td>Příprava na výuku</td>
                <td>${Number(stats.preparation).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Srozumitelnost výkladu</td>
                <td>${Number(stats.explanation).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Zapojení studentů</td>
                <td>${Number(stats.engagement).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Atmosféra ve třídě</td>
                <td>${Number(stats.atmosphere).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Individuální přístup</td>
                <td>${Number(stats.individual).toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <div class="responses">
            <h2>Odpovědi (${responses.length})</h2>
            ${responses.map(r => `
              <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd;">
                <p><strong>Učitel:</strong> ${r.teacher_name}</p>
                <p><strong>Předmět:</strong> ${r.subject_name}</p>
                <p><strong>Třída:</strong> ${r.class_name}</p>
                <p><strong>Hodnocení:</strong></p>
                <ul>
                  <li>Příprava: ${r.criteria.preparation}</li>
                  <li>Výklad: ${r.criteria.explanation}</li>
                  <li>Zapojení: ${r.criteria.engagement}</li>
                  <li>Atmosféra: ${r.criteria.atmosphere}</li>
                  <li>Individuální přístup: ${r.criteria.individual}</li>
                </ul>
                ${r.comment ? `<p><strong>Komentář:</strong> ${r.comment}</p>` : ''}
                <p><small>Vytvořeno: ${new Date(r.created_at).toLocaleString('cs-CZ')}</small></p>
              </div>
            `).join('')}
          </div>
        </body>
        </html>
      `;

      // Generování PDF pomocí puppeteer
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=evaluace-${req.params.id}-report.pdf`);
      res.send(pdf);
    } catch (err) {
      console.error('Chyba při exportu do PDF:', err);
      res.status(500).json({ error: 'Interní chyba serveru' });
    } finally {
      client.release();
    }
  }
}; 