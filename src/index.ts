/**
 * @mrsarac/auth - Unified Authentication Package
 */

// Types
export type {
  AuthConfig,
  AuthUser,
  TokenPayload,
  GuestSession,
  QuotaInfo,
  VerifyTokenOptions,
} from './types';

// Utils
export { createLogtoConfig } from './utils/config';
export { verifyToken, createJWKS, verifyTokenMultiAudience } from './utils/tokenVerify';
export { syncUser, getUserByLogtoId, type QueryFunction } from './utils/userSync';

// Constants
export { DEFAULT_TOKEN_DURATIONS, DEFAULT_GUEST_LIMITS, STORAGE_KEYS } from './constants';

// Middleware (re-export from middleware module)
export {
  createAuthMiddleware,
  authMiddleware,
  optionalAuthMiddleware,
  type AuthenticatedRequest,
  type AuthMiddlewareOptions,
} from './middleware/authMiddleware';

export {
  createGuestMiddleware,
  getGuestSession,
  isGuestMode,
  type GuestRequest,
  type GuestMiddlewareOptions,
} from './middleware/guestMode';