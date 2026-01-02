import { useState, useEffect, useRef, useCallback } from 'react';
import { SoundManager } from '../games/meteor/SoundManager';

export interface GameStateConfig {
  scoreGoal: number;
  initialSummons: number;
  initialTributes: number;
  domain: number;
  gold: number;
}

export interface GameState {
  score: number;
  scoreGoal: number;
  summons: number;
  tributes: number;
  multiplier: number;
  domain: number;
  gold: number;
  gameOver: boolean;
  isWin: boolean;
}

export interface GameStats {
  npcsSquished: number;
  diceThrown: number;
}

export interface UseGameStateReturn {
  state: GameState;
  stats: GameStats;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setSummons: React.Dispatch<React.SetStateAction<number>>;
  setTributes: React.Dispatch<React.SetStateAction<number>>;
  setMultiplier: React.Dispatch<React.SetStateAction<number>>;
  incrementNPCsSquished: () => void;
  incrementDiceThrown: (count: number) => void;
  resetGame: () => void;
}

export function useGameState(
  config: GameStateConfig,
  callbacks?: {
    onWin?: (score: number, stats: GameStats) => void;
    onLose?: () => void;
  }
): UseGameStateReturn {
  const [score, setScore] = useState(0);
  const [scoreGoal] = useState(config.scoreGoal);
  const [summons, setSummons] = useState(config.initialSummons);
  const [tributes, setTributes] = useState(config.initialTributes);
  const [multiplier, setMultiplier] = useState(1);
  const [domain] = useState(config.domain);
  const [gold] = useState(config.gold);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  // Track stats for callbacks
  const statsRef = useRef<GameStats>({ npcsSquished: 0, diceThrown: 0 });

  // Check for game over when summons run out
  useEffect(() => {
    if (summons <= 0 && !gameOver) {
      // Small delay to let final meteor animations complete
      const timeout = setTimeout(() => {
        const won = score >= scoreGoal;
        setGameOver(true);
        setIsWin(won);

        // Play victory or defeat sound
        if (won) {
          SoundManager.playVictory();
        } else {
          SoundManager.playDefeat();
        }

        // Call appropriate callback
        if (won && callbacks?.onWin) {
          callbacks.onWin(score, statsRef.current);
        } else if (!won && callbacks?.onLose) {
          callbacks.onLose();
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [summons, score, scoreGoal, gameOver, callbacks]);

  const incrementNPCsSquished = useCallback(() => {
    statsRef.current.npcsSquished += 1;
  }, []);

  const incrementDiceThrown = useCallback((count: number) => {
    statsRef.current.diceThrown += count;
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setSummons(config.initialSummons);
    setTributes(config.initialTributes);
    setMultiplier(1);
    setGameOver(false);
    setIsWin(false);
    statsRef.current = { npcsSquished: 0, diceThrown: 0 };
  }, [config.initialSummons, config.initialTributes]);

  return {
    state: {
      score,
      scoreGoal,
      summons,
      tributes,
      multiplier,
      domain,
      gold,
      gameOver,
      isWin,
    },
    stats: statsRef.current,
    setScore,
    setSummons,
    setTributes,
    setMultiplier,
    incrementNPCsSquished,
    incrementDiceThrown,
    resetGame,
  };
}
