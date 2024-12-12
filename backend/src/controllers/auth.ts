import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user';
import { Pool } from 'pg';

export class AuthController {
  private userModel: UserModel;

  constructor(pool: Pool) {
    this.userModel = new UserModel(pool);
  }

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const user = await this.userModel.findByEmail(email);

      if (!user) {
        return res.status(401).json({ message: 'Nesprávné přihlašovací údaje' });
      }

      const isValid = await this.userModel.verifyPassword(user, password);

      if (!isValid) {
        return res.status(401).json({ message: 'Nesprávné přihlašovací údaje' });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          role: user.role,
          schoolId: user.school_id 
        },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          schoolId: user.school_id,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    } catch (error) {
      console.error('Chyba při přihlášení:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };

  registerDirector = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, schoolId } = req.body;

    try {
      const existingUser = await this.userModel.findByEmail(email);

      if (existingUser) {
        return res.status(400).json({ message: 'Uživatel s tímto emailem již existuje' });
      }

      const user = await this.userModel.create({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        school_id: schoolId,
        role: 'director'
      });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          schoolId: user.school_id,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    } catch (error) {
      console.error('Chyba při registraci ředitele:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };

  registerAdmin = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    try {
      const existingUser = await this.userModel.findByEmail(email);

      if (existingUser) {
        return res.status(400).json({ message: 'Uživatel s tímto emailem již existuje' });
      }

      const user = await this.userModel.create({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role: 'admin'
      });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    } catch (error) {
      console.error('Chyba při registraci admina:', error);
      res.status(500).json({ message: 'Interní chyba serveru' });
    }
  };
} 