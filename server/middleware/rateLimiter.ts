import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * In-memory sliding window rate limiter
 */
export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  name?: string;
}) {
  const store = new Map<string, RateLimitRecord>();
  const { windowMs, maxRequests, message = 'Rate limit exceeded. Please try again later.', name = 'global' } = options;

  // Periodic cleanup every 2 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  }, 120000);

  return (req: Request, res: Response, next: NextFunction) => {
    // Generate key based on Authorization token, x-forwarded-for, or socket remoteAddress
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-client';
    const authHeader = req.headers.authorization || (req.headers['x-user-id'] as string) || '';
    const key = `${name}:${authHeader ? 'auth:' + authHeader.slice(-16) : 'ip:' + clientIp}`;

    const now = Date.now();
    const existing = store.get(key);

    if (!existing || now > existing.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      return next();
    }

    if (existing.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((existing.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(existing.resetTime / 1000));
      return res.status(429).json({
        error: message,
        retryAfter: retryAfterSeconds,
      });
    }

    existing.count += 1;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - existing.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(existing.resetTime / 1000));
    next();
  };
}

// 60 requests per minute general rate limiter
export const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  name: 'general',
  message: 'Too many requests. Please slow down and try again shortly.',
});

// 20 requests per minute for AI Copilot
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 25,
  name: 'ai-copilot',
  message: 'AI Copilot rate limit reached (25 requests/min). Please wait a moment before sending more queries.',
});

// 30 requests per minute for OCR Ingestion
export const ocrRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  name: 'ocr-scanner',
  message: 'OCR invoice scanning limit reached. Please wait a minute before scanning additional invoices.',
});
