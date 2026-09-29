import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import alunosRoutes from './routes/alunos.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' })); // fotos em base64

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'tatame-bjj-api' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'tatame-bjj-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunosRoutes);
// Passo 3: professores, turmas, presencas, financeiro, trilha,
// certificados, marketplace, parceiros, avisos, relatorios

app.use(errorHandler);

export default app;