/**
 * Auth Context
 *
 * MVP: Everyone plays as "Never Die Guy" - no login required.
 * Each player gets a unique number (NEVER DIE GUY #1, #2, etc.)
 * Tracks whether user has started their first game to transform the home page.
 *
 * Usage:
 *   import { useAuth } from '../contexts/AuthContext';
 *   const { user, playerNumber, hasStartedGame, markGameStarted } = useAuth();
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { type User } from '../data/users';
import { loadProfile } from '../data/player/storage';

// Create user with player number
function createNeverDieGuy(playerNumber: number): User {
  return {
    id: playerNumber,
    name: `NEVER DIE GUY #${playerNumber}`,
    rating: 1000,
    rank: 0,
    level: 1,
    wins: 0,
    losses: 0,
    draws: 0,
    achievements: 0,
    friends: 0,
    points: 0,
    joinDate: 'Today',
    lastOnline: 'Just now',
    country: 'US',
    bio: 'The Never Die Guy.',
    favoriteDomain: 'All of them',
    avatar: '/assets/characters/portraits/60px/traveler-portrait-neverdieguy-02.svg',
  };
}

// localStorage key for game started flag
const HAS_STARTED_GAME_KEY = 'ndg_has_started_game';

interface AuthContextType {
  user: User;
  playerNumber: number;
  isAuthenticated: boolean;
  hasStartedGame: boolean;
  markGameStarted: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Load player number from profile
  const [playerNumber, setPlayerNumber] = useState<number>(1);
  const [user, setUser] = useState<User>(() => createNeverDieGuy(1));

  // Load profile on mount to get player number
  useEffect(() => {
    const profile = loadProfile();
    setPlayerNumber(profile.playerNumber);
    setUser(createNeverDieGuy(profile.playerNumber));
  }, []);

  // Check localStorage for game started flag
  const [hasStartedGame, setHasStartedGame] = useState<boolean>(() => {
    return localStorage.getItem(HAS_STARTED_GAME_KEY) === 'true';
  });

  const markGameStarted = useCallback(() => {
    if (!hasStartedGame) {
      setHasStartedGame(true);
      localStorage.setItem(HAS_STARTED_GAME_KEY, 'true');
    }
  }, [hasStartedGame]);

  return (
    <AuthContext.Provider
      value={{
        user,
        playerNumber,
        isAuthenticated: true,
        hasStartedGame,
        markGameStarted,
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
