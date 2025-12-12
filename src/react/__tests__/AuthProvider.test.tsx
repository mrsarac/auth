import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth, AuthContext } from '../AuthProvider';

// Mock @logto/react
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
const mockGetIdTokenClaims = vi.fn();
const mockGetAccessToken = vi.fn();

vi.mock('@logto/react', () => ({
  useLogto: vi.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
    signIn: mockSignIn,
    signOut: mockSignOut,
    getIdTokenClaims: mockGetIdTokenClaims,
    getAccessToken: mockGetAccessToken,
  })),
}));

import { useLogto } from '@logto/react';

const mockedUseLogto = vi.mocked(useLogto);

// Test component to access context
function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="isAuthenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="isLoading">{String(auth.isLoading)}</span>
      <span data-testid="userName">{auth.user?.name || 'no-user'}</span>
      <button onClick={auth.login}>Login</button>
      <button onClick={auth.logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseLogto.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      getIdTokenClaims: mockGetIdTokenClaims,
      getAccessToken: mockGetAccessToken,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children', () => {
    render(
      <AuthProvider>
        <div data-testid="child">Hello</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('should provide authentication state', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });
  });

  it('should fetch and set user when authenticated', async () => {
    const mockClaims = {
      sub: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
    };

    mockGetIdTokenClaims.mockResolvedValue(mockClaims);

    mockedUseLogto.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      getIdTokenClaims: mockGetIdTokenClaims,
      getAccessToken: mockGetAccessToken,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('userName')).toHaveTextContent('Test User');
    });
  });

  it('should set user to null when not authenticated', async () => {
    mockedUseLogto.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      getIdTokenClaims: mockGetIdTokenClaims,
      getAccessToken: mockGetAccessToken,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('userName')).toHaveTextContent('no-user');
    });
  });

  it('should handle getIdTokenClaims failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetIdTokenClaims.mockRejectedValue(new Error('Failed to get claims'));

    mockedUseLogto.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      getIdTokenClaims: mockGetIdTokenClaims,
      getAccessToken: mockGetAccessToken,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to get user claims:',
        expect.any(Error)
      );
      expect(screen.getByTestId('userName')).toHaveTextContent('no-user');
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle null claims gracefully', async () => {
    mockGetIdTokenClaims.mockResolvedValue(null);

    mockedUseLogto.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      signIn: mockSignIn,
      signOut: mockSignOut,
      getIdTokenClaims: mockGetIdTokenClaims,
      getAccessToken: mockGetAccessToken,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('userName')).toHaveTextContent('no-user');
    });
  });

  describe('login', () => {
    it('should call signIn with default callback URL', async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText('Login').click();
      });

      expect(mockSignIn).toHaveBeenCalledWith(
        'https://test.example.com/callback'
      );
    });

    it('should call signIn with custom callback URL', async () => {
      render(
        <AuthProvider callbackUrl="https://custom.example.com/auth/callback">
          <TestConsumer />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText('Login').click();
      });

      expect(mockSignIn).toHaveBeenCalledWith(
        'https://custom.example.com/auth/callback'
      );
    });
  });

  describe('logout', () => {
    it('should call signOut with default redirect URL', async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText('Logout').click();
      });

      expect(mockSignOut).toHaveBeenCalledWith('https://test.example.com');
    });

    it('should call signOut with custom signOut URL', async () => {
      render(
        <AuthProvider signOutUrl="https://custom.example.com/goodbye">
          <TestConsumer />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText('Logout').click();
      });

      expect(mockSignOut).toHaveBeenCalledWith(
        'https://custom.example.com/goodbye'
      );
    });
  });

  describe('getAccessToken', () => {
    it('should get access token with provided resource', async () => {
      mockGetAccessToken.mockResolvedValue('token123');

      let capturedAuth: ReturnType<typeof useAuth> | null = null;

      function TokenGetter() {
        capturedAuth = useAuth();
        return null;
      }

      render(
        <AuthProvider apiResource="https://api.example.com">
          <TokenGetter />
        </AuthProvider>
      );

      const token = await capturedAuth!.getAccessToken('https://other-api.com');

      expect(mockGetAccessToken).toHaveBeenCalledWith('https://other-api.com');
      expect(token).toBe('token123');
    });

    it('should use apiResource when no resource specified', async () => {
      mockGetAccessToken.mockResolvedValue('api-token');

      let capturedAuth: ReturnType<typeof useAuth> | null = null;

      function TokenGetter() {
        capturedAuth = useAuth();
        return null;
      }

      render(
        <AuthProvider apiResource="https://default-api.example.com">
          <TokenGetter />
        </AuthProvider>
      );

      const token = await capturedAuth!.getAccessToken();

      expect(mockGetAccessToken).toHaveBeenCalledWith(
        'https://default-api.example.com'
      );
      expect(token).toBe('api-token');
    });

    it('should return null when no resource available', async () => {
      let capturedAuth: ReturnType<typeof useAuth> | null = null;

      function TokenGetter() {
        capturedAuth = useAuth();
        return null;
      }

      render(
        <AuthProvider>
          <TokenGetter />
        </AuthProvider>
      );

      const token = await capturedAuth!.getAccessToken();

      expect(mockGetAccessToken).not.toHaveBeenCalled();
      expect(token).toBeNull();
    });

    it('should handle getAccessToken failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetAccessToken.mockRejectedValue(new Error('Token error'));

      let capturedAuth: ReturnType<typeof useAuth> | null = null;

      function TokenGetter() {
        capturedAuth = useAuth();
        return null;
      }

      render(
        <AuthProvider apiResource="https://api.example.com">
          <TokenGetter />
        </AuthProvider>
      );

      const token = await capturedAuth!.getAccessToken();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to get access token:',
        expect.any(Error)
      );
      expect(token).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should handle undefined token from logto', async () => {
      mockGetAccessToken.mockResolvedValue(undefined);

      let capturedAuth: ReturnType<typeof useAuth> | null = null;

      function TokenGetter() {
        capturedAuth = useAuth();
        return null;
      }

      render(
        <AuthProvider apiResource="https://api.example.com">
          <TokenGetter />
        </AuthProvider>
      );

      const token = await capturedAuth!.getAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('useAuth', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('AuthContext', () => {
    it('should be exported and have initial value of null', () => {
      expect(AuthContext).toBeDefined();
    });
  });
});
