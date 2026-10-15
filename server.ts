import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import Vercel serverless handlers
import healthHandler from './api/health.ts';
import chatHandler from './api/chat.ts';
import studyPlanHandler from './api/study-plan.ts';
import explainHandler from './api/explain.ts';
import quizHandler from './api/quiz.ts';
import careerHandler from './api/career-guidance.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

// Delegate API routes to Vercel serverless function handlers
app.all('/api/health', (req: Request, res: Response) => healthHandler(req as any, res as any));
app.all('/api/chat', (req: Request, res: Response) => chatHandler(req as any, res as any));
app.all('/api/study-plan', (req: Request, res: Response) => studyPlanHandler(req as any, res as any));
app.all('/api/explain', (req: Request, res: Response) => explainHandler(req as any, res as any));
app.all('/api/quiz', (req: Request, res: Response) => quizHandler(req as any, res as any));
app.all('/api/career-guidance', (req: Request, res: Response) => careerHandler(req as any, res as any));

// Setup Vite middleware in dev or static files in production
async function initServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SkillBridge AI] Local dev server running on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
