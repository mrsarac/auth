/**
 * @mrsarac/auth - Unified Authentication Package
 */

export type {
  AuthConfig,
  AuthUser,
  TokenPayload,
  GuestSession,
  QuotaInfo,
  VerifyTokenOptions,
} from './types';

export { createLogtoConfig } from './utils/config';
export { verifyToken, createJWKS } from './utils/tokenVerify';
export { syncUser, getUserByLogtoId } from './utils/userSync';
export { DEFAULT_TOKEN_DURATIONS } from './constants';