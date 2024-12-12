import { Pool } from 'pg';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  email: string;
  password: string;
  role: string;
  school_id: number;
  first_name: string;
  last_name: string;
  created_at: Date;
}

export class UserModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async create(userData: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    
    const result = await this.pool.query(
      `INSERT INTO users (email, password, role, school_id, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userData.email,
        hashedPassword,
        userData.role || 'user',
        userData.school_id,
        userData.first_name,
        userData.last_name
      ]
    );
    
    return result.rows[0];
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
} 