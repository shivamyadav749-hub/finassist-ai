import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PORT, IS_PROD } from './server/config.js';
import { generalLimiter } from './server/middleware/rateLimiter.js';
import { transactionRouter } from './server/routes/transactionRoutes.js';
import { ocrRouter } from './server/routes/ocrRoutes.js';
import { copilotRouter } from './server/routes/copilotRoutes.js';
import { reportRouter } from './server/routes/reportRoutes.js';
import { paypalRouter } from './server/routes/paypalRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// JSON body parser with 100kb payload limit for abuse prevention
app.use(express.json({ limit: '100kb' }));

// Favicon handler
app.get('/favicon.ico', (_req: Request, res: Response) => res.status(204).end());

// Global API rate limiter
app.use('/api', generalLimiter);

// System Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FinAssist AI Institutional Backend',
    version: '4.8.0',
  });
});

// Deprecated Mock Auth Endpoints Notice: Firebase Authentication is authoritative
app.all(['/api/auth/login', '/api/auth/register', '/api/auth/me'], (_req: Request, res: Response) => {
  return res.status(200).json({
    notice: 'Authoritative authentication is provided via Firebase Authentication client SDK.',
    authenticated: false,
    authSystem: 'Firebase Authentication (Google Identity Toolkit)',
  });
});

// Mount Modular API Routers
app.use('/api/transactions', transactionRouter);
app.use('/api/ocr', ocrRouter);
app.use('/api/ai', copilotRouter);
app.use('/api/reports', reportRouter);
app.use('/api/paypal', paypalRouter);

// Global Error Handler (Prevents stack trace leaks to client)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Server Error]:', err?.message || err);
  const status = err?.status || 500;
  return res.status(status).json({
    error: err?.message || 'An unexpected internal server error occurred.',
  });
});

// Vite Middleware (Dev) or Static Asset Serving (Production)
async function startServer() {
  if (!IS_PROD) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FinAssist AI server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
