import request from 'supertest';
import { app } from '../index';
import { testPool } from './setup';
import jwt from 'jsonwebtoken';

describe('Evaluation API', () => {
  let adminToken: string;
  let directorToken: string;

  beforeAll(async () => {
    // Vytvořit testovací tokeny
    adminToken = jwt.sign(
      { id: 1, role: 'admin' },
      process.env.JWT_SECRET!
    );
    
    directorToken = jwt.sign(
      { id: 2, role: 'director', schoolId: 1 },
      process.env.JWT_SECRET!
    );
  });

  beforeEach(async () => {
    // Vyčistit relevantní tabulky před každým testem
    await testPool.query('DELETE FROM evaluation_responses');
    await testPool.query('DELETE FROM access_codes');
    await testPool.query('DELETE FROM evaluations');
  });

  describe('POST /api/evaluations/:id/responses', () => {
    it('mělo by uložit novou odpověď s platnými daty', async () => {
      // Vytvořit testovací evaluaci a přístupový kód
      const { rows: [evaluation] } = await testPool.query(
        `INSERT INTO evaluations (name, start_date, end_date, status)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Test Evaluace', new Date(), new Date(), 'active']
      );

      const { rows: [accessCode] } = await testPool.query(
        `INSERT INTO access_codes (evaluation_id, code, class_name)
         VALUES ($1, $2, $3) RETURNING id`,
        [evaluation.id, 'TEST123', '4.A']
      );

      const response = await request(app)
        .post(`/api/evaluations/${evaluation.id}/responses`)
        .send({
          teacherId: 1,
          subjectId: 1,
          classId: 1,
          accessCodeId: accessCode.id,
          criteria: {
            preparation: 5,
            explanation: 4,
            engagement: 4,
            atmosphere: 5,
            individual: 3
          },
          comment: 'Testovací komentář'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('mělo by vrátit chybu při neplatných hodnotách kritérií', async () => {
      const response = await request(app)
        .post('/api/evaluations/1/responses')
        .send({
          teacherId: 1,
          subjectId: 1,
          classId: 1,
          accessCodeId: 1,
          criteria: {
            preparation: 6, // Neplatná hodnota
            explanation: 4,
            engagement: 4,
            atmosphere: 5,
            individual: 3
          }
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/evaluations/:id/stats', () => {
    it('mělo by vrátit statistiky evaluace pro autorizovaného uživatele', async () => {
      // Vytvořit testovací evaluaci s odpověďmi
      const { rows: [evaluation] } = await testPool.query(
        `INSERT INTO evaluations (name, start_date, end_date, status)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Test Evaluace', new Date(), new Date(), 'active']
      );

      // Přidat několik testovacích odpovědí
      await testPool.query(
        `INSERT INTO evaluation_responses (evaluation_id, teacher_id, subject_id, class_id, criteria, comment)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [evaluation.id, 1, 1, 1, {
          preparation: 5,
          explanation: 4,
          engagement: 4,
          atmosphere: 5,
          individual: 3
        }, 'Test']
      );

      const response = await request(app)
        .get(`/api/evaluations/${evaluation.id}/stats`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalResponses');
      expect(response.body).toHaveProperty('averageScores');
      expect(response.body).toHaveProperty('completionRate');
    });

    it('mělo by vrátit chybu pro neautorizovaného uživatele', async () => {
      const response = await request(app)
        .get('/api/evaluations/1/stats');

      expect(response.status).toBe(401);
    });
  });
}); 