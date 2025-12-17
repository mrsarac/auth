import type { Request, Response, NextFunction } from 'express';
import { verifyToken, verifyTokenMultiAudience } from '../utils/tokenVerify';
import type { AuthUser, TokenPayload } from '../types';
import { authLogger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  tokenPayload?: TokenPayload;
}

export interface AuthMiddlewareOptions {
  endpoint: string;
  audience: string | string[];
  getDbUserId?: (logtoId: string) => Promise<number | undefined>;
}

export function createAuthMiddleware(options: AuthMiddlewareOptions) {
  const { endpoint, audience, getDbUserId } = options;
  const issuer = `${endpoint}/oidc`;

  return async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const token = authHeader.replace('Bearer ', '');
      const payload = Array.isArray(audience)
        ? await verifyTokenMultiAudience(token, { issuer, audiences: audience })
        : await verifyToken(token, { issuer, audience });

      const user: AuthUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };

      if (getDbUserId) {
        try {
          user.dbUserId = await getDbUserId(payload.sub);
        } catch (err) {
          authLogger.warn('Could not fetch local user ID:', err);
        }
      }

      req.user = user;
      req.tokenPayload = payload;
      next();
    } catch (error) {
      authLogger.error('Auth middleware error:', error);
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

export const authMiddleware = createAuthMiddleware({
  endpoint: process.env.LOGTO_ENDPOINT || 'https://auth.mustafasarac.com',
  audience: process.env.API_RESOURCE || process.env.LOGTO_APP_ID || '',
});

export const optionalAuthMiddleware = createAuthMiddleware({
  endpoint: process.env.LOGTO_ENDPOINT || 'https://auth.mustafasarac.com',
  audience: process.env.API_RESOURCE || process.env.LOGTO_APP_ID || '',
});