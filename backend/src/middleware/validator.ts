import { Request, Response, NextFunction } from 'express';

interface ValidationSchema {
  type: string;
  required?: boolean;
  items?: {
    type: string;
    properties?: {
      [key: string]: ValidationSchema;
    };
  };
  properties?: {
    [key: string]: ValidationSchema;
  };
}

interface ValidationConfig {
  body?: {
    [key: string]: ValidationSchema;
  };
  params?: {
    [key: string]: ValidationSchema;
  };
  query?: {
    [key: string]: ValidationSchema;
  };
}

function validateValue(value: any, schema: ValidationSchema): boolean {
  if (schema.required && (value === undefined || value === null)) {
    return false;
  }

  if (value === undefined || value === null) {
    return true;
  }

  switch (schema.type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' || !isNaN(Number(value));
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      if (!Array.isArray(value)) return false;
      if (schema.items) {
        return value.every(item => validateValue(item, schema.items!));
      }
      return true;
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) return false;
      if (schema.properties) {
        return Object.entries(schema.properties).every(([key, propSchema]) => 
          validateValue(value[key], propSchema)
        );
      }
      return true;
    default:
      return false;
  }
}

export function validateRequest(config: ValidationConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    // Validace parametrů v URL
    if (config.params) {
      Object.entries(config.params).forEach(([key, schema]) => {
        const value = req.params[key];
        if (schema.type === 'number') {
          req.params[key] = Number(value);
        }
        if (!validateValue(req.params[key], schema)) {
          errors.push(`Neplatný parametr: ${key}`);
        }
      });
    }

    // Validace query parametrů
    if (config.query) {
      Object.entries(config.query).forEach(([key, schema]) => {
        const value = req.query[key];
        if (schema.type === 'number') {
          req.query[key] = Number(value as string) as any;
        }
        if (!validateValue(req.query[key], schema)) {
          errors.push(`Neplatný query parametr: ${key}`);
        }
      });
    }

    // Validace těla požadavku
    if (config.body) {
      Object.entries(config.body).forEach(([key, schema]) => {
        if (!validateValue(req.body[key], schema)) {
          errors.push(`Neplatná hodnota v těle požadavku: ${key}`);
        }
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  };
} 