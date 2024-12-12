import { Pool } from 'pg';
import crypto from 'crypto';

export interface AccessCode {
  id: number;
  evaluation_id: number;
  code: string;
  class_name: string;
  is_used: boolean;
  created_at: Date;
}

export class AccessCodeModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private generateUniqueCode(): string {
    // Generuje 6místný alfanumerický kód (bez matoucích znaků jako 0, O, 1, I, l)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      code += chars[randomIndex];
    }
    return code;
  }

  async create(evaluationId: number, className: string): Promise<AccessCode> {
    let code: string;
    let result;
    
    // Pokus se vytvořit unikátní kód (max 3 pokusy)
    for (let i = 0; i < 3; i++) {
      code = this.generateUniqueCode();
      try {
        result = await this.pool.query(
          `INSERT INTO access_codes (evaluation_id, code, class_name)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [evaluationId, code, className]
        );
        break;
      } catch (error: any) {
        if (error.constraint === 'access_codes_code_key' && i < 2) {
          continue; // Zkus znovu s jiným kódem
        }
        throw error;
      }
    }

    if (!result) {
      throw new Error('Nepodařilo se vygenerovat unikátní kód');
    }

    return result.rows[0];
  }

  async findByCode(code: string): Promise<AccessCode | null> {
    const result = await this.pool.query(
      'SELECT * FROM access_codes WHERE code = $1',
      [code]
    );
    return result.rows[0] || null;
  }

  async markAsUsed(code: string): Promise<void> {
    await this.pool.query(
      'UPDATE access_codes SET is_used = true WHERE code = $1',
      [code]
    );
  }

  async listByEvaluation(evaluationId: number): Promise<AccessCode[]> {
    const result = await this.pool.query(
      'SELECT * FROM access_codes WHERE evaluation_id = $1 ORDER BY created_at DESC',
      [evaluationId]
    );
    return result.rows;
  }

  async delete(id: number): Promise<void> {
    await this.pool.query(
      'DELETE FROM access_codes WHERE id = $1',
      [id]
    );
  }

  async deleteForEvaluation(evaluationId: number): Promise<void> {
    await this.pool.query(
      'DELETE FROM access_codes WHERE evaluation_id = $1',
      [evaluationId]
    );
  }
} 