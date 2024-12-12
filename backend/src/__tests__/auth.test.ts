import request from 'supertest';
import { app } from '../index';
import { testPool } from './setup';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

describe('Auth API', () => {
  beforeEach(async () => {
    // Vyčistit tabulku users před každým testem
    await testPool.query('DELETE FROM users');
  });

  describe('POST /api/auth/login', () => {
    it('mělo by vrátit token při správných přihlašovacích údajích', async () => {
      // Vytvořit testovacího uživatele
      const hashedPassword = await bcrypt.hash('test123', 10);
      await testPool.query(
        `INSERT INTO users (email, password, role, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5)`,
        ['test@test.cz', hashedPassword, 'admin', 'Test', 'User']
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.cz',
          password: 'test123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@test.cz');
    });

    it('mělo by vrátit chybu při nesprávných přihlašovacích údajích', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'neexistuje@test.cz',
          password: 'test123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/register/director', () => {
    it('mělo by vytvořit nového ředitele při správných údajích', async () => {
      // Nejprve vytvořit admin účet pro autorizaci
      const adminToken = jwt.sign(
        { id: 1, role: 'admin' },
        process.env.JWT_SECRET!
      );

      const response = await request(app)
        .post('/api/auth/register/director')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'reditel@skola.cz',
          password: 'heslo123',
          firstName: 'Jan',
          lastName: 'Novák',
          schoolId: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toHaveProperty('email', 'reditel@skola.cz');
      expect(response.body.user).toHaveProperty('role', 'director');
    });

    it('mělo by vrátit chybu při pokusu o registraci bez admin práv', async () => {
      const response = await request(app)
        .post('/api/auth/register/director')
        .send({
          email: 'reditel@skola.cz',
          password: 'heslo123',
          firstName: 'Jan',
          lastName: 'Novák',
          schoolId: 1
        });

      expect(response.status).toBe(401);
    });
  });
}); 