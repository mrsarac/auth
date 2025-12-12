import type { AuthUser, GuestSession } from '../types';

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: (resource?: string) => Promise<string | null>;
}

export interface GuestModeContextValue {
  isGuest: boolean;
  session: GuestSession | null;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  canPerformAction: () => boolean;
  performAction: () => boolean;
  actionsRemaining: number;
}