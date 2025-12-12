import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { TokenPayload, VerifyTokenOptions } from '../types';

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export function createJWKS(endpoint: string) {
  const jwksUrl = `${endpoint}/oidc/jwks`;
  if (!jwksCache.has(jwksUrl)) {
    jwksCache.set(jwksUrl, createRemoteJWKSet(new URL(jwksUrl)));
  }
  return jwksCache.get(jwksUrl)!;
}

export async function verifyToken(
  token: string,
  options: VerifyTokenOptions
): Promise<TokenPayload> {
  const endpoint = options.issuer.replace(/\/oidc$/, '');
  const JWKS = createJWKS(endpoint);

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: options.issuer,
    audience: options.audience,
    clockTolerance: options.clockTolerance || 60,
  });

  return payload as TokenPayload;
}

export async function verifyTokenMultiAudience(
  token: string,
  options: Omit<VerifyTokenOptions, 'audience'> & { audiences: string[] }
): Promise<TokenPayload> {
  for (const audience of options.audiences) {
    try {
      return await verifyToken(token, { ...options, audience });
    } catch {
      continue;
    }
  }
  throw new Error('Token invalid for all audiences');
}