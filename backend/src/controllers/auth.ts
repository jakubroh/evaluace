import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user';
import { Pool } from 'pg';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  private userModel: UserModel;

  constructor(pool: Pool) {
    this.userModel = new UserModel(pool);
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    try {
      const user = await this.userModel.findByEmail(email);

      if (!user) {
        throw new AppError(401, 'Nesprávné přihlašovací údaje');
      }

      const isValid = await this.userModel.verifyPassword(user, password);

      if (!isValid) {
        throw new AppError(401, 'Nesprávné přihlašovací údaje');
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
      next(error);
    }
  };

  registerDirector = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password, firstName, lastName, schoolId } = req.body;

    try {
      const existingUser = await this.userModel.findByEmail(email);

      if (existingUser) {
        throw new AppError(400, 'Uživatel s tímto emailem již existuje');
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
      next(error);
    }
  };

  registerAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password, firstName, lastName } = req.body;

    try {
      const existingUser = await this.userModel.findByEmail(email);

      if (existingUser) {
        throw new AppError(400, 'Uživatel s tímto emailem již existuje');
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
      next(error);
    }
  };
} 