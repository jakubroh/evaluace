import { Pool } from 'pg';

export interface Class {
  id: number;
  name: string;
  school_id: number;
  director_id: number;
  created_at: Date;
}

export interface TeacherAssignment {
  id: number;
  teacher_name: string;
  subject_name: string;
  teacher_id: number;
  subject_id: number;
}

export class ClassModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findById(id: number): Promise<Class | null> {
    const result = await this.pool.query(
      'SELECT * FROM classes WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findBySchool(schoolId: number): Promise<Class[]> {
    const result = await this.pool.query(
      'SELECT * FROM classes WHERE school_id = $1 ORDER BY name',
      [schoolId]
    );
    return result.rows;
  }

  async findByDirector(directorId: number): Promise<Class[]> {
    const result = await this.pool.query(
      'SELECT * FROM classes WHERE director_id = $1 ORDER BY name',
      [directorId]
    );
    return result.rows;
  }

  async create(data: { name: string; school_id: number; director_id: number }): Promise<Class> {
    const result = await this.pool.query(
      'INSERT INTO classes (name, school_id, director_id) VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.school_id, data.director_id]
    );
    return result.rows[0];
  }

  async update(id: number, data: { name: string }): Promise<Class | null> {
    const result = await this.pool.query(
      'UPDATE classes SET name = $1 WHERE id = $2 RETURNING *',
      [data.name, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM classes WHERE id = $1 RETURNING id',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async getTeacherAssignments(classId: number): Promise<TeacherAssignment[]> {
    const result = await this.pool.query(
      `SELECT 
        ta.id,
        t.name as teacher_name,
        s.name as subject_name,
        ta.teacher_id,
        ta.subject_id
      FROM teacher_assignments ta
      JOIN teachers t ON ta.teacher_id = t.id
      JOIN subjects s ON ta.subject_id = s.id
      WHERE ta.class_id = $1
      ORDER BY s.name, t.name`,
      [classId]
    );
    return result.rows;
  }

  async assignTeacher(data: { class_id: number; teacher_id: number; subject_id: number }): Promise<TeacherAssignment> {
    const result = await this.pool.query(
      `INSERT INTO teacher_assignments (class_id, teacher_id, subject_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.class_id, data.teacher_id, data.subject_id]
    );
    return result.rows[0];
  }

  async removeTeacherAssignment(assignmentId: number): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM teacher_assignments WHERE id = $1 RETURNING id',
      [assignmentId]
    );
    return (result.rowCount ?? 0) > 0;
  }
} 