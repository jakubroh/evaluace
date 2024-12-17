import { Pool } from 'pg';

export interface Teacher {
  id: number;
  name: string;
  school_id: number;
  created_at: Date;
}

export class TeacherModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findById(id: number): Promise<Teacher | null> {
    const result = await this.pool.query(
      'SELECT * FROM teachers WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findBySchool(schoolId: number): Promise<Teacher[]> {
    const result = await this.pool.query(
      'SELECT * FROM teachers WHERE school_id = $1 ORDER BY name',
      [schoolId]
    );
    return result.rows;
  }

  async create(data: { name: string; school_id: number }): Promise<Teacher> {
    const result = await this.pool.query(
      'INSERT INTO teachers (name, school_id) VALUES ($1, $2) RETURNING *',
      [data.name, data.school_id]
    );
    return result.rows[0];
  }

  async update(id: number, data: { name: string }): Promise<Teacher | null> {
    const result = await this.pool.query(
      'UPDATE teachers SET name = $1 WHERE id = $2 RETURNING *',
      [data.name, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM teachers WHERE id = $1 RETURNING id',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
} 