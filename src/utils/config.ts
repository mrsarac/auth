import type { AuthConfig } from '../types';

const DEFAULT_CONFIG: Partial<AuthConfig> = {
  endpoint: 'https://auth.mustafasarac.com',
  scopes: ['openid', 'profile', 'email'],
};

export function createLogtoConfig(config: Partial<AuthConfig> & { appId: string }): AuthConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    endpoint: config.endpoint || DEFAULT_CONFIG.endpoint!,
    scopes: config.scopes || DEFAULT_CONFIG.scopes,
  };
}