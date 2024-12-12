import { Request, Response } from 'express';
import { AccessCodeModel } from '../models/accessCode';
import { Pool } from 'pg';

export class AccessCodeController {
  private accessCodeModel: AccessCodeModel;
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
    this.accessCodeModel = new AccessCodeModel(pool);
  }

  generateCodes = async (req: Request, res: Response) => {
    const { evaluationId } = req.params;
    const { classes } = req.body;

    try {
      const codes = await Promise.all(
        classes.map((className: string) =>
          this.accessCodeModel.create(parseInt(evaluationId), className)
        )
      );

      res.status(201).json(codes);
    } catch (error) {
      console.error('Chyba při generování kódů:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };

  listCodes = async (req: Request, res: Response) => {
    const { evaluationId } = req.params;

    try {
      const codes = await this.accessCodeModel.listByEvaluation(parseInt(evaluationId));
      res.json(codes);
    } catch (error) {
      console.error('Chyba při načítání kódů:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };

  verifyCode = async (req: Request, res: Response) => {
    const { code } = req.body;

    try {
      const accessCode = await this.accessCodeModel.findByCode(code);

      if (!accessCode) {
        return res.status(404).json({ message: 'Neplatný přístupový kód' });
      }

      if (accessCode.is_used) {
        return res.status(400).json({ message: 'Tento kód již byl použit' });
      }

      // Ověř, zda je evaluace aktivní
      const now = new Date();
      const result = await this.pool.query(
        `SELECT * FROM evaluations 
         WHERE id = $1 
         AND start_date <= $2 
         AND end_date >= $2 
         AND status = 'active'`,
        [accessCode.evaluation_id, now]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Evaluace není aktivní' });
      }

      // Označ kód jako použitý
      await this.accessCodeModel.markAsUsed(code);

      res.json({
        evaluationId: accessCode.evaluation_id,
        className: accessCode.class_name
      });
    } catch (error) {
      console.error('Chyba při ověřování kódu:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };

  deleteCode = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await this.accessCodeModel.delete(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error('Chyba při mazání kódu:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };

  deleteAllCodes = async (req: Request, res: Response) => {
    const { evaluationId } = req.params;

    try {
      await this.accessCodeModel.deleteForEvaluation(parseInt(evaluationId));
      res.status(204).send();
    } catch (error) {
      console.error('Chyba při mazání kódů:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };
} 