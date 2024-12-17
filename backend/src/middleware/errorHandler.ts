import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
  }

  // Chyby validace
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Chyba validace',
      errors: err.message
    });
  }

  // Chyby databáze
  if (err.name === 'QueryError' || err.message.includes('duplicate key')) {
    return res.status(400).json({
      status: 'error',
      message: 'Chyba databáze',
      ...(process.env.NODE_ENV === 'development' ? { detail: err.message } : {})
    });
  }

  // Neočekávané chyby
  return res.status(500).json({
    status: 'error',
    message: 'Interní chyba serveru',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}; 