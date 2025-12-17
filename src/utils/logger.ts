/**
 * @mrsarac/auth - Lightweight Logger Utility
 * Works in both browser and Node.js environments
 * Can be silenced via AUTH_LOG_LEVEL environment variable
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

function getLogLevel(): LogLevel {
  // Check for environment variable (Node.js) or window config (browser)
  if (typeof process !== 'undefined' && process.env?.AUTH_LOG_LEVEL) {
    return process.env.AUTH_LOG_LEVEL as LogLevel;
  }
  if (typeof window !== 'undefined' && (window as any).__AUTH_LOG_LEVEL__) {
    return (window as any).__AUTH_LOG_LEVEL__ as LogLevel;
  }
  // Default: show warnings and errors only
  return 'warn';
}

function shouldLog(level: LogLevel): boolean {
  const currentLevel = getLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

const PREFIX = '[@mrsarac/auth]';

export const authLogger = {
  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.debug(PREFIX, message, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (shouldLog('info')) {
      console.info(PREFIX, message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(PREFIX, message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error(PREFIX, message, ...args);
    }
  },
};

export default authLogger;
