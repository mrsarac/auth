export interface AuthConfig {
  endpoint: string;
  appId: string;
  resources?: string[];
  scopes?: string[];
}

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  dbUserId?: number;
}

export interface TokenPayload {
  sub: string;
  iss: string;
  aud: string | string[];
  exp: number;
  iat: number;
  email?: string;
  name?: string;
  picture?: string;
}

export interface GuestSession {
  sessionId: string;
  createdAt: number;
  lastActiveAt: number;
  actionsCount: number;
  maxActions: number;
  hasUpgraded: boolean;
  data: Record<string, unknown>;
}

export interface QuotaInfo {
  limit: number;
  used: number;
  remaining: number;
  resetsAt: Date;
  period: 'daily' | 'monthly';
}

export interface VerifyTokenOptions {
  issuer: string;
  audience?: string | string[];
  clockTolerance?: number;
}