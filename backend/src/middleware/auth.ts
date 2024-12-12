import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    schoolId: number;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Chybí autorizační token' });
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
    return res.status(401).json({ error: 'Neplatný token' });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Přístup pouze pro administrátory' });
  }
  next();
};

export const isDirector = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'director') {
    return res.status(403).json({ message: 'Přístup pouze pro ředitele' });
  }
  next();
};

export const isAdminOrDirector = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!['admin', 'director'].includes(req.user?.role || '')) {
    return res.status(403).json({ message: 'Přístup pouze pro administrátory nebo ředitele' });
  }
  next();
};

export const checkSchoolAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
  const schoolId = parseInt(req.params.schoolId);
  
  if (req.user?.role === 'admin') {
    return next();
  }

  if (req.user?.role === 'director' && req.user?.schoolId === schoolId) {
    return next();
  }

  return res.status(403).json({ message: 'Nemáte přístup k této škole' });
}; 