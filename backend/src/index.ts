import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import accessCodeRoutes from './routes/accessCode';
import evaluationRoutes from './routes/evaluation';
import classRoutes from './routes/class';
import teacherRoutes from './routes/teacher';
import subjectRoutes from './routes/subject';
import teacherAssignmentRoutes from './routes/teacherAssignment';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// API routy
app.use('/api/auth', authRoutes);
app.use('/api/access-codes', accessCodeRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', teacherAssignmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Interní chyba serveru' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
}); 