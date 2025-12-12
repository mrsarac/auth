'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLogto } from '@logto/react';
import type { AuthUser } from '../types';
import type { AuthContextValue } from './types';

export const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
  apiResource?: string;
  callbackUrl?: string;
  signOutUrl?: string;
}

export function AuthProvider({ children, apiResource, callbackUrl, signOutUrl }: AuthProviderProps) {
  const { isAuthenticated, isLoading, signIn, signOut, getIdTokenClaims, getAccessToken: logtoGetAccessToken } = useLogto();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (isAuthenticated) {
        try {
          const claims = await getIdTokenClaims();
          if (claims) {
            setUser({
              id: claims.sub,
              email: claims.email as string | undefined,
              name: claims.name as string | undefined,
              picture: claims.picture as string | undefined,
            });
          }
        } catch (error) {
          console.error('Failed to get user claims:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
    fetchUser();
  }, [isAuthenticated, getIdTokenClaims]);

  const login = async () => {
    const callback = callbackUrl || `${window.location.origin}/callback`;
    await signIn(callback);
  };

  const logout = async () => {
    const redirect = signOutUrl || window.location.origin;
    await signOut(redirect);
  };

  const getAccessToken = async (resource?: string): Promise<string | null> => {
    try {
      const targetResource = resource || apiResource;
      if (targetResource) {
        const token = await logtoGetAccessToken(targetResource);
        return token ?? null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  };

  const value: AuthContextValue = { isAuthenticated, isLoading, user, login, logout, getAccessToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}