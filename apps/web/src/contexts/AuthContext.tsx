/**
 * Auth Context
 *
 * MVP: Everyone plays as "Never Die Guy" - no login required.
 * Each session gets a fresh random player number (NEVER DIE GUY #12345)
 * The number is "retired" when the session ends (browser close/refresh)
 *
 * Tracks whether user has started their first game to transform the home page.
 *
 * Usage:
 *   import { useAuth } from '../contexts/AuthContext';
 *   const { user, playerNumber, hasStartedGame, markGameStarted } = useAuth();
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type User } from '../data/users';

// Generate random 6-digit player number
function generatePlayerNumber(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

// Create user with player number
function createNeverDieGuy(playerNumber: number): User {
  return {
    id: playerNumber,
    name: `NDG`,
    playerNumber,
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

// Session storage key for player number (survives refresh, clears on close)
const SESSION_PLAYER_KEY = 'ndg_session_player';
// localStorage key for game started flag (persists across sessions)
const HAS_STARTED_GAME_KEY = 'ndg_has_started_game';

// Get or create session player number
function getSessionPlayerNumber(): number {
  const stored = sessionStorage.getItem(SESSION_PLAYER_KEY);
  if (stored) {
    return parseInt(stored, 10);
  }
  const newNumber = generatePlayerNumber();
  sessionStorage.setItem(SESSION_PLAYER_KEY, newNumber.toString());
  return newNumber;
}

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
  // Generate session-based player number (survives refresh, gone on close)
  const [playerNumber] = useState<number>(() => getSessionPlayerNumber());
  const [user] = useState<User>(() => createNeverDieGuy(playerNumber));

  // Check localStorage for game started flag (persists across sessions)
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
