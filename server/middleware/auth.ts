import { Request, Response, NextFunction } from 'express';
import { firebaseConfig } from '../config.js';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  displayName?: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// In-memory cache for verified tokens (5-minute TTL)
interface CacheEntry {
  user: AuthenticatedUser;
  expiresAt: number;
}
const tokenCache = new Map<string, CacheEntry>();

/**
 * Verify Firebase ID Token via Firebase Identity Toolkit REST API
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<AuthenticatedUser | null> {
  if (!idToken || typeof idToken !== 'string') return null;

  const now = Date.now();
  const cached = tokenCache.get(idToken);
  if (cached && cached.expiresAt > now) {
    return cached.user;
  }

  // If apiKey is not available, fail verification
  if (!firebaseConfig.apiKey) {
    console.warn('[Auth Middleware] Firebase apiKey not found in config.');
    return null;
  }

  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.users && data.users.length > 0) {
      const fbUser = data.users[0];
      const user: AuthenticatedUser = {
        uid: fbUser.localId,
        email: fbUser.email,
        displayName: fbUser.displayName,
      };

      // Cache for 5 minutes
      tokenCache.set(idToken, {
        user,
        expiresAt: now + 5 * 60 * 1000,
      });

      return user;
    }
    return null;
  } catch (err) {
    console.error('[Auth Middleware] Error verifying token with Firebase Identity Toolkit:', err);
    return null;
  }
}

/**
 * Helper to extract user identity from either:
 * 1. Authorization: Bearer <idToken>
 * 2. x-user-id header (for client-authenticated requests)
 */
export async function resolveUserFromRequest(req: Request): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const verified = await verifyFirebaseIdToken(token);
      if (verified) return verified;
    }
  }

  // Fallback to validated x-user-id header if present
  const headerUserId = req.headers['x-user-id'];
  if (typeof headerUserId === 'string' && headerUserId.trim().length > 0) {
    const cleanId = headerUserId.trim();
    // Validate format (alphanumeric, underscore, dash, <= 128 chars)
    if (/^[a-zA-Z0-9_-]{1,128}$/.test(cleanId)) {
      return {
        uid: cleanId,
        email: (req.headers['x-user-email'] as string) || undefined,
      };
    }
  }

  return null;
}

/**
 * Require valid authentication middleware
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await resolveUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized: Authentication required. Please provide a valid Firebase token in Authorization header or x-user-id.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal authentication validation error' });
  }
}

/**
 * Optional authentication middleware (attaches user if present, proceeds otherwise)
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await resolveUserFromRequest(req);
    if (user) {
      req.user = user;
    }
  } catch {
    // Ignore error in optional auth
  }
  next();
}
