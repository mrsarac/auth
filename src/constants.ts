export const DEFAULT_TOKEN_DURATIONS = {
  HIGH_SECURITY: 60 * 60,        // 1 hour
  BALANCED: 60 * 60 * 24,        // 24 hours
  CONVENIENCE: 60 * 60 * 24 * 7, // 7 days
} as const;

export const DEFAULT_GUEST_LIMITS = {
  MAX_ACTIONS: 3,
  SESSION_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export const STORAGE_KEYS = {
  GUEST_SESSION: 'mrsarac_guest_session',
  TOKEN_DURATION_PREF: 'mrsarac_token_duration',
} as const;