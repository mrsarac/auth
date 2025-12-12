import type { Request, Response, NextFunction } from 'express';
import type { GuestSession } from '../types';
import { DEFAULT_GUEST_LIMITS } from '../constants';

export interface GuestRequest extends Request {
  guestSession?: GuestSession;
  isGuest?: boolean;
}

export interface GuestMiddlewareOptions {
  maxActions?: number;
  sessionExpiry?: number;
  sessionHeader?: string;
}

const guestSessions = new Map<string, GuestSession>();

export function createGuestMiddleware(options: GuestMiddlewareOptions = {}) {
  const {
    maxActions = DEFAULT_GUEST_LIMITS.MAX_ACTIONS,
    sessionExpiry = DEFAULT_GUEST_LIMITS.SESSION_EXPIRY,
    sessionHeader = 'x-guest-session',
  } = options;

  return function guestMiddleware(
    req: GuestRequest,
    res: Response,
    next: NextFunction
  ): void {
    const sessionId = req.headers[sessionHeader] as string | undefined;

    if (!sessionId) {
      req.isGuest = false;
      next();
      return;
    }

    let session = guestSessions.get(sessionId);

    if (session && Date.now() - session.createdAt < sessionExpiry) {
      session.lastActiveAt = Date.now();
      req.guestSession = session;
      req.isGuest = true;
    } else if (!session) {
      session = {
        sessionId,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        actionsCount: 0,
        maxActions,
        hasUpgraded: false,
        data: {},
      };
      guestSessions.set(sessionId, session);
      req.guestSession = session;
      req.isGuest = true;
    } else {
      guestSessions.delete(sessionId);
      req.isGuest = false;
    }

    next();
  };
}

export function getGuestSession(sessionId: string): GuestSession | undefined {
  return guestSessions.get(sessionId);
}

export function isGuestMode(req: GuestRequest): boolean {
  return req.isGuest === true;
}