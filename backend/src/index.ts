import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { Pool } from 'pg';
import { errorHandler } from './middleware/errorHandler';
import { createAuthRouter } from './routes/auth';
import { createAccessCodeRouter } from './routes/accessCode';
import evaluationRoutes from './routes/evaluation';
import { createClassRouter } from './routes/class';
import teacherRoutes from './routes/teacher';
import subjectRoutes from './routes/subject';
import teacherAssignmentRoutes from './routes/teacherAssignment';

dotenv.config();

// Vytvoření databázového poolu
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

export const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100 // limit 100 požadavků na IP
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(limiter);

// API routy
app.use('/api/auth', createAuthRouter(pool));
app.use('/api/access-codes', createAccessCodeRouter(pool));
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/classes', createClassRouter(pool));
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', teacherAssignmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use(errorHandler);

// Spustit server pouze pokud není soubor importován (např. v testech)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server běží na portu ${PORT}`);
    console.log(`Prostředí: ${process.env.NODE_ENV}`);
    console.log(`CORS origin: ${process.env.CORS_ORIGIN}`);
  });
} 