'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { GuestSession } from '../types';
import type { GuestModeContextValue } from './types';
import { DEFAULT_GUEST_LIMITS, STORAGE_KEYS } from '../constants';
import { authLogger } from '../utils/logger';

const GuestModeContext = createContext<GuestModeContextValue | null>(null);

function createSessionId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export interface GuestModeProviderProps {
  children: ReactNode;
  maxActions?: number;
  sessionExpiry?: number;
}

export function GuestModeProvider({ children, maxActions = DEFAULT_GUEST_LIMITS.MAX_ACTIONS, sessionExpiry = DEFAULT_GUEST_LIMITS.SESSION_EXPIRY }: GuestModeProviderProps) {
  const [session, setSession] = useState<GuestSession | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION);
      if (stored) {
        const parsed: GuestSession = JSON.parse(stored);
        if (Date.now() - parsed.createdAt < sessionExpiry && !parsed.hasUpgraded) {
          setSession(parsed);
          setIsGuest(true);
        } else {
          localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION);
        }
      }
    } catch (error) {
      authLogger.error('Failed to load guest session:', error);
    }
  }, [sessionExpiry]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.GUEST_SESSION, JSON.stringify(session));
    }
  }, [session]);

  const enterGuestMode = () => {
    const newSession: GuestSession = {
      sessionId: createSessionId(),
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      actionsCount: 0,
      maxActions,
      hasUpgraded: false,
      data: {},
    };
    setSession(newSession);
    setIsGuest(true);
  };

  const exitGuestMode = () => {
    if (session) localStorage.removeItem(STORAGE_KEYS.GUEST_SESSION);
    setSession(null);
    setIsGuest(false);
  };

  const canPerformAction = (): boolean => {
    if (!session) return false;
    return session.actionsCount < session.maxActions;
  };

  const performAction = (): boolean => {
    if (!session || !canPerformAction()) return false;
    setSession({ ...session, actionsCount: session.actionsCount + 1, lastActiveAt: Date.now() });
    return true;
  };

  const actionsRemaining = session ? Math.max(0, session.maxActions - session.actionsCount) : 0;

  const value: GuestModeContextValue = { isGuest, session, enterGuestMode, exitGuestMode, canPerformAction, performAction, actionsRemaining };

  return <GuestModeContext.Provider value={value}>{children}</GuestModeContext.Provider>;
}

export function useGuestMode(): GuestModeContextValue {
  const context = useContext(GuestModeContext);
  if (!context) throw new Error('useGuestMode must be used within a GuestModeProvider');
  return context;
}