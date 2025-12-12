import { describe, it, expect } from 'vitest';
import { createLogtoConfig } from '../config';

describe('config', () => {
  describe('createLogtoConfig', () => {
    it('should create config with required appId', () => {
      const config = createLogtoConfig({ appId: 'test-app-id' });

      expect(config.appId).toBe('test-app-id');
      expect(config.endpoint).toBe('https://auth.mustafasarac.com');
      expect(config.scopes).toEqual(['openid', 'profile', 'email']);
    });

    it('should override default endpoint when provided', () => {
      const config = createLogtoConfig({
        appId: 'my-app',
        endpoint: 'https://custom-auth.example.com',
      });

      expect(config.endpoint).toBe('https://custom-auth.example.com');
    });

    it('should override default scopes when provided', () => {
      const customScopes = ['openid', 'profile', 'email', 'custom:scope'];
      const config = createLogtoConfig({
        appId: 'my-app',
        scopes: customScopes,
      });

      expect(config.scopes).toEqual(customScopes);
    });

    it('should include resources when provided', () => {
      const config = createLogtoConfig({
        appId: 'my-app',
        resources: ['https://api.example.com', 'https://api2.example.com'],
      });

      expect(config.resources).toEqual([
        'https://api.example.com',
        'https://api2.example.com',
      ]);
    });

    it('should merge all custom options with defaults', () => {
      const config = createLogtoConfig({
        appId: 'full-config-app',
        endpoint: 'https://auth.custom.com',
        scopes: ['openid', 'offline_access'],
        resources: ['https://api.custom.com'],
      });

      expect(config).toEqual({
        appId: 'full-config-app',
        endpoint: 'https://auth.custom.com',
        scopes: ['openid', 'offline_access'],
        resources: ['https://api.custom.com'],
      });
    });

    it('should use default endpoint when config.endpoint is empty string', () => {
      const config = createLogtoConfig({
        appId: 'my-app',
        endpoint: '',
      });

      expect(config.endpoint).toBe('https://auth.mustafasarac.com');
    });
  });
});
