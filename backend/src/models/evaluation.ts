import { pool } from '../db/pool';

export interface Evaluation {
  id: number;
  schoolId: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationResponse {
  id: number;
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
  createdAt: Date;
}

export const evaluationModel = {
  // Vytvořit novou evaluaci
  create: async (schoolId: number, data: Omit<Evaluation, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>) => {
    const result = await pool.query(
      `INSERT INTO evaluations (school_id, name, start_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [schoolId, data.name, data.startDate, data.endDate, data.isActive]
    );
    return result.rows[0];
  },

  // Získat evaluaci podle ID
  getById: async (id: number, schoolId: number) => {
    const result = await pool.query(
      'SELECT * FROM evaluations WHERE id = $1 AND school_id = $2',
      [id, schoolId]
    );
    return result.rows[0];
  },

  // Získat všechny evaluace pro školu
  getAllForSchool: async (schoolId: number) => {
    const result = await pool.query(
      'SELECT * FROM evaluations WHERE school_id = $1 ORDER BY created_at DESC',
      [schoolId]
    );
    return result.rows;
  },

  // Aktualizovat evaluaci
  update: async (id: number, schoolId: number, data: Partial<Omit<Evaluation, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>) => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(data.name);
      paramCount++;
    }
    if (data.startDate !== undefined) {
      updates.push(`start_date = $${paramCount}`);
      values.push(data.startDate);
      paramCount++;
    }
    if (data.endDate !== undefined) {
      updates.push(`end_date = $${paramCount}`);
      values.push(data.endDate);
      paramCount++;
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(data.isActive);
      paramCount++;
    }

    if (updates.length === 0) return null;

    values.push(id, schoolId);
    const result = await pool.query(
      `UPDATE evaluations 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount} AND school_id = $${paramCount + 1}
       RETURNING *`,
      values
    );
    return result.rows[0];
  },

  // Smazat evaluaci
  delete: async (id: number, schoolId: number) => {
    const result = await pool.query(
      'DELETE FROM evaluations WHERE id = $1 AND school_id = $2 RETURNING id',
      [id, schoolId]
    );
    return result.rows[0];
  },

  // Uložit odpověď na evaluaci
  saveResponse: async (data: Omit<EvaluationResponse, 'id' | 'createdAt'>) => {
    const result = await pool.query(
      `INSERT INTO evaluation_responses 
       (teacher_id, subject_id, class_id, access_code_id, 
        preparation_score, explanation_score, engagement_score,
        atmosphere_score, individual_score, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.teacherId,
        data.subjectId,
        data.classId,
        data.accessCodeId,
        data.criteria.preparation,
        data.criteria.explanation,
        data.criteria.engagement,
        data.criteria.atmosphere,
        data.criteria.individual,
        data.comment
      ]
    );
    return result.rows[0];
  },

  // Získat odpovědi pro evaluaci
  getResponses: async (evaluationId: number, schoolId: number) => {
    const result = await pool.query(
      `SELECT er.*, t.name as teacher_name, s.name as subject_name, c.name as class_name
       FROM evaluation_responses er
       JOIN teachers t ON er.teacher_id = t.id
       JOIN subjects s ON er.subject_id = s.id
       JOIN classes c ON er.class_id = c.id
       JOIN access_codes ac ON er.access_code_id = ac.id
       WHERE ac.evaluation_id = $1 AND t.school_id = $2`,
      [evaluationId, schoolId]
    );
    return result.rows;
  }
}; 