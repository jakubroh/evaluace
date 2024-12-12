import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    schoolId: number;
  };
}

export const authMiddleware: RequestHandler = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Chybí autorizační token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      id: number;
      email: string;
      role: string;
      schoolId: number;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Neplatný token' });
  }
};

export const isAdmin: RequestHandler = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Přístup pouze pro administrátory' });
    return;
  }
  next();
};

export const isDirector: RequestHandler = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'director') {
    res.status(403).json({ message: 'Přístup pouze pro ředitele' });
    return;
  }
  next();
};

export const isAdminOrDirector: RequestHandler = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!['admin', 'director'].includes(req.user?.role || '')) {
    res.status(403).json({ message: 'Přístup pouze pro administrátory nebo ředitele' });
    return;
  }
  next();
};

export const checkSchoolAccess: RequestHandler = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const schoolId = parseInt(req.params.schoolId);
  
  if (req.user?.role === 'admin') {
    next();
    return;
  }

  if (req.user?.role === 'director' && req.user?.schoolId === schoolId) {
    next();
    return;
  }

  res.status(403).json({ message: 'Nemáte přístup k této škole' });
}; 