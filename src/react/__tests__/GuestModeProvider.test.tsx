import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { GuestModeProvider, useGuestMode } from '../GuestModeProvider';
import { STORAGE_KEYS } from '../../constants';

// Test component to access context
function TestConsumer() {
  const guest = useGuestMode();
  return (
    <div>
      <span data-testid="isGuest">{String(guest.isGuest)}</span>
      <span data-testid="actionsRemaining">{guest.actionsRemaining}</span>
      <span data-testid="canPerform">{String(guest.canPerformAction())}</span>
      <span data-testid="sessionId">{guest.session?.sessionId || 'no-session'}</span>
      <button data-testid="enter" onClick={guest.enterGuestMode}>
        Enter
      </button>
      <button data-testid="exit" onClick={guest.exitGuestMode}>
        Exit
      </button>
      <button data-testid="perform" onClick={() => guest.performAction()}>
        Perform
      </button>
    </div>
  );
}

describe('GuestModeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children', () => {
    render(
      <GuestModeProvider>
        <div data-testid="child">Hello</div>
      </GuestModeProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('should initialize with no guest session', () => {
    render(
      <GuestModeProvider>
        <TestConsumer />
      </GuestModeProvider>
    );

    expect(screen.getByTestId('isGuest')).toHaveTextContent('false');
    expect(screen.getByTestId('actionsRemaining')).toHaveTextContent('0');
    expect(screen.getByTestId('sessionId')).toHaveTextContent('no-session');
  });

  describe('enterGuestMode', () => {
    it('should create a new guest session', async () => {
      render(
        <GuestModeProvider maxActions={5}>
          <TestConsumer />
        </GuestModeProvider>
      );

      await act(async () => {
        screen.getByTestId('enter').click();
      });

      expect(screen.getByTestId('isGuest')).toHaveTextContent('true');
      expect(screen.getByTestId('actionsRemaining')).toHaveTextContent('5');
      expect(screen.getByTestId('sessionId')).not.toHaveTextContent('no-session');
    });

    it('should use default maxActions when not specified', async () => {
      render(
        <GuestModeProvider>
          <TestConsumer />
        </GuestModeProvider>
      );

      await act(async () => {
        screen.getByTestId('enter').click();
      });

      expect(screen.getByTestId('actionsRemaining')).toHaveTextContent('3'); // DEFAULT_GUEST_LIMITS.MAX_ACTIONS
    });

    it('should persist session to localStorage', async () => {
      render(
        <GuestModeProvider>
          <TestConsumer />
        </GuestModeProvider>
      );

      await act(async () => {
        screen.getByTestId('enter').click();
      });

      // After state update, check localStorage synchronously
      const stored = localStorage.getItem(STORAGE_KEYS.GUEST_SESSION);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.sessionId).toMatch(/^guest_/);
    });
  });

  describe('exitGuestMode', () => {
    it('should clear guest session', async () => {
      render(
        <GuestModeProvider>
          <TestConsumer />
        </GuestModeProvider>
      );

      // Enter guest mode first
      await act(async () => {
        screen.getByTestId('enter').click();
      });

      expect(screen.getByTestId('isGuest')).toHaveTextContent('true');

      // Exit guest mode
      await act(async () => {
        screen.getByTestId('exit').click();
      });

      expect(screen.getByTestId('isGuest')).toHaveTextContent('false');
      expect(screen.getByTestId('sessionId')).toHaveTextContent('no-session');
    });

    it('should remove session from localStorage', async () => {
      render(
        <GuestModeProvider>
          <TestConsumer />
        </GuestModeProvider>
      );

      await act(async () => {
        screen.getByTestId('enter').click();
      });

      expect(localStorage.getItem(STORAGE_KEYS.GUEST_SESSION)).not.toBeNull();

      await act(async () => {
        screen.getByTestId('exit').click();
      });

      expect(localStorage.getItem(STORAGE_KEYS.GUEST_SESSION)).toBeNull();
    });

    it('should handle exit when no session exists', async () => {
      render(
        <GuestModeProvider>
          <TestConsumer />
        </GuestModeProvider>
      );

      // Should not throw
      await act(async () => {
        screen.getByTestId('exit').click();
      });

      expect(screen.getByTestId('isGuest')).toHaveTextContent('false');
    });
  });

  describe('canPerformAction', () => {
    it('should return true when actions remaining', async () => {
      render(
        <GuestModeProvider maxActions={3}>
          <TestConsumer />
        </GuestModeProvider>
      );

      await act(async () => {
        screen.getByTestId('enter').click();
      });

      expect(screen.getByTestId('canPerform')).toHaveTextContent('true');
    });

    it('should return false when no session', () => {
      render(
        <GuestModeProvider>
          <TestConsumer />
        </GuestModeProvider>
      );

      expect(screen.getByTestId('canPerform')).toHaveTextContent('false');
    });

    it('should return false when actions exhausted', async () => {
      render(
        <GuestModeProvider maxActions={1}>
          <TestConsumer />
        </GuestModeProvider>
      );

      await act(async () => {
        screen.getByTestId('enter').click();
      });

      await act(async () => {
        screen.getByTestId('perform').click();
      });

      expect(screen.getByTestId('canPerform')).toHaveTextContent('false');
    });
  });

  describe('performAction', () => {
    it('should decrement actions remaining', async () => {
      render(
        <GuestModeProvider maxActions={3}>
          <TestConsumer />
        </GuestModeProvider>
      );

      await act(async () => {
        screen.getByTestId('enter').click();
      });

      expect(screen.getByTestId('actionsRemaining')).toHaveTextContent('3');

      await act(async () => {
        screen.getByTestId('perform').click();
      });

      expect(screen.getByTestId('actionsRemaining')).toHaveTextContent('2');
    });

    it('should not decrement below zero', async () => {
      render(
        <GuestModeProvider maxActions={1}>
          <TestConsumer />
        </GuestModeProvider>
      );

      await act(async () => {
        screen.getByTestId('enter').click();
      });

      await act(async () => {
        screen.getByTestId('perform').click();
      });

      await act(async () => {
        screen.getByTestId('perform').click();
      });

      expect(screen.getByTestId('actionsRemaining')).toHaveTextContent('0');
    });

    it('should return false when no session', async () => {
      let result: boolean | undefined;

      function TestPerform() {
        const guest = useGuestMode();
        return (
          <button
            onClick={() => {
              result = guest.performAction();
            }}
          >
            Perform
          </button>
        );
      }

      render(
        <GuestModeProvider>
          <TestPerform />
        </GuestModeProvider>
      );

      await act(async () => {
        screen.getByText('Perform').click();
      });

      expect(result).toBe(false);
    });

    it('should return false when cannot perform action', async () => {
      let result: boolean | undefined;

      function TestPerform() {
        const guest = useGuestMode();
        return (
          <div>
            <button onClick={guest.enterGuestMode}>Enter</button>
            <button
              onClick={() => {
                result = guest.performAction();
              }}
            >
              Perform
            </button>
          </div>
        );
      }

      render(
        <GuestModeProvider maxActions={0}>
          <TestPerform />
        </GuestModeProvider>
      );

      await act(async () => {
        screen.getByText('Enter').click();
      });

      await act(async () => {
        screen.getByText('Perform').click();
      });

      expect(result).toBe(false);
    });
  });

  describe('session restoration from localStorage', () => {
    it('should restore valid session from localStorage', () => {
      const now = Date.now();

      const storedSession = {
        sessionId: 'restored-session',
        createdAt: now - 1000,
        lastActiveAt: now - 1000,
        actionsCount: 1,
        maxActions: 5,
        hasUpgraded: false,
        data: {},
      };

      localStorage.setItem(
        STORAGE_KEYS.GUEST_SESSION,
        JSON.stringify(storedSession)
      );

      render(
        <GuestModeProvider>
          <TestConsumer />
        </GuestModeProvider>
      );

      // useEffect runs synchronously in test
      expect(screen.getByTestId('isGuest')).toHaveTextContent('true');
      expect(screen.getByTestId('sessionId')).toHaveTextContent('restored-session');
      expect(screen.getByTestId('actionsRemaining')).toHaveTextContent('4');
    });

    it('should not restore expired session', () => {
      const now = Date.now();

      const expiredSession = {
        sessionId: 'expired-session',
        createdAt: now - 25 * 60 * 60 * 1000, // 25 hours ago (expired)
        lastActiveAt: now - 25 * 60 * 60 * 1000,
        actionsCount: 0,
        maxActions: 3,
        hasUpgraded: false,
        data: {},
      };

      localStorage.setItem(
        STORAGE_KEYS.GUEST_SESSION,
        JSON.stringify(expiredSession)
      );

      render(
        <GuestModeProvider>
          <TestConsumer />
        </GuestModeProvider>
      );

      expect(screen.getByTestId('isGuest')).toHaveTextContent('false');
      expect(localStorage.getItem(STORAGE_KEYS.GUEST_SESSION)).toBeNull();
    });

    it('should not restore upgraded session', () => {
      const now = Date.now();

      const upgradedSession = {
        sessionId: 'upgraded-session',
        createdAt: now - 1000,
        lastActiveAt: now - 1000,
        actionsCount: 2,
        maxActions: 3,
        hasUpgraded: true, // User upgraded to full account
        data: {},
      };

      localStorage.setItem(
        STORAGE_KEYS.GUEST_SESSION,
        JSON.stringify(upgradedSession)
      );

      render(
        <GuestModeProvider>
          <TestConsumer />
        </GuestModeProvider>
      );

      expect(screen.getByTestId('isGuest')).toHaveTextContent('false');
      expect(localStorage.getItem(STORAGE_KEYS.GUEST_SESSION)).toBeNull();
    });

    it('should handle invalid JSON in localStorage', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem(STORAGE_KEYS.GUEST_SESSION, 'invalid-json');

      render(
        <GuestModeProvider>
          <TestConsumer />
        </GuestModeProvider>
      );

      expect(screen.getByTestId('isGuest')).toHaveTextContent('false');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load guest session:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should respect custom sessionExpiry', () => {
      const now = Date.now();
      const shortExpiry = 1000 * 60 * 60; // 1 hour

      const session = {
        sessionId: 'short-expiry-session',
        createdAt: now - 2 * 60 * 60 * 1000, // 2 hours ago
        lastActiveAt: now - 2 * 60 * 60 * 1000,
        actionsCount: 0,
        maxActions: 3,
        hasUpgraded: false,
        data: {},
      };

      localStorage.setItem(
        STORAGE_KEYS.GUEST_SESSION,
        JSON.stringify(session)
      );

      render(
        <GuestModeProvider sessionExpiry={shortExpiry}>
          <TestConsumer />
        </GuestModeProvider>
      );

      expect(screen.getByTestId('isGuest')).toHaveTextContent('false');
    });
  });

  describe('useGuestMode', () => {
    it('should throw error when used outside GuestModeProvider', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useGuestMode must be used within a GuestModeProvider');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('actionsRemaining calculation', () => {
    it('should correctly calculate remaining actions', async () => {
      render(
        <GuestModeProvider maxActions={5}>
          <TestConsumer />
        </GuestModeProvider>
      );

      await act(async () => {
        screen.getByTestId('enter').click();
      });

      expect(screen.getByTestId('actionsRemaining')).toHaveTextContent('5');

      for (let i = 0; i < 3; i++) {
        await act(async () => {
          screen.getByTestId('perform').click();
        });
      }

      expect(screen.getByTestId('actionsRemaining')).toHaveTextContent('2');
    });

    it('should show 0 when no session', () => {
      render(
        <GuestModeProvider>
          <TestConsumer />
        </GuestModeProvider>
      );

      expect(screen.getByTestId('actionsRemaining')).toHaveTextContent('0');
    });
  });
});
