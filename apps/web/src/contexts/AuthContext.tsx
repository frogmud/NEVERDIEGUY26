/**
 * Auth Context
 *
 * Manages user authentication state throughout the app.
 *
 * Test Account:
 *   Username: Kevin
 *   Password: Kevin
 *
 * Usage:
 *   import { useAuth } from '../contexts/AuthContext';
 *   const { user, isAuthenticated, signIn, signOut } = useAuth();
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getUser, type User } from '../data/users';

// Kevin's special account (always ID 1)
const KEVIN_USER: User = {
  id: 1,
  name: 'Kevin',
  rating: 9999,
  rank: 0, // Beyond ranking
  level: 99,
  wins: 9999,
  losses: 0,
  draws: 0,
  achievements: 999,
  friends: 1337,
  points: 999999,
  joinDate: 'Since the beginning',
  lastOnline: 'Just now',
  country: 'US',
  bio: 'The Never Die Guy himself.',
  favoriteDomain: 'All of them',
  avatar: null,
};

// Test credentials
const TEST_ACCOUNTS: Record<string, { password: string; userId: number | 'kevin' }> = {
  kevin: { password: 'Kevin', userId: 'kevin' },
  Kevin: { password: 'Kevin', userId: 'kevin' },
  KEVIN: { password: 'Kevin', userId: 'kevin' },
  // Add more test accounts as needed
  test: { password: 'test', userId: 100 },
  demo: { password: 'demo', userId: 101 },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Check localStorage for persisted session
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ndg_auth_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check test accounts
    const account = TEST_ACCOUNTS[username];
    if (account && account.password === password) {
      let authUser: User;
      if (account.userId === 'kevin') {
        authUser = KEVIN_USER;
      } else {
        const foundUser = getUser(account.userId);
        if (!foundUser) {
          setError('User not found');
          setIsLoading(false);
          return false;
        }
        authUser = foundUser;
      }

      setUser(authUser);
      localStorage.setItem('ndg_auth_user', JSON.stringify(authUser));
      setIsLoading(false);
      return true;
    }

    setError('Invalid username or password');
    setIsLoading(false);
    return false;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ndg_auth_user');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        signIn,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
