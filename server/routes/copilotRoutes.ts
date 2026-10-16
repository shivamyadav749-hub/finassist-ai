import { Router, Request, Response } from 'express';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { optionalAuth } from '../middleware/auth.js';
import { executeCopilotQuery } from '../services/geminiService.js';

export const copilotRouter = Router();

copilotRouter.post('/copilot', aiRateLimiter, optionalAuth, async (req: Request, res: Response) => {
  const { query, scenario, context } = req.body;
  const prompt = query || scenario;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'A valid query or scenario prompt string is required.' });
  }

  // Prevent denial-of-service via huge payloads
  if (prompt.length > 2000) {
    return res.status(400).json({ error: 'Prompt exceeds maximum allowed length of 2,000 characters.' });
  }

  try {
    const result = await executeCopilotQuery({
      prompt: prompt.trim(),
      context,
    });

    return res.json({
      text: result.text,
      simulation: result.simulation,
      source: result.source,
    });
  } catch (error: any) {
    console.error('[AI Copilot Route] Error executing query:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred while analyzing financial scenarios.',
    });
  }
});
