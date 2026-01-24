import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface TutorialState {
  swipeGestureSeen: boolean;
  canvasInteractionSeen: boolean;
  newRunTutorialSeen: boolean;
}

interface TutorialContextValue {
  tutorialState: TutorialState;
  shouldShowSwipeTutorial: boolean;
  shouldShowNewRunTutorial: boolean;
  markSwipeTutorialSeen: () => void;
  markCanvasInteractionSeen: () => void;
  markNewRunTutorialSeen: () => void;
  resetTutorials: () => void;
}

const TutorialContext = createContext<TutorialContextValue | undefined>(undefined);

const STORAGE_KEY = 'ndg_tutorial_state';

// Default tutorial state
const DEFAULT_STATE: TutorialState = {
  swipeGestureSeen: false,
  canvasInteractionSeen: false,
  newRunTutorialSeen: false,
};

// Load tutorial state from localStorage
function loadTutorialState(): TutorialState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load tutorial state:', error);
  }
  return DEFAULT_STATE;
}

// Save tutorial state to localStorage
function saveTutorialState(state: TutorialState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save tutorial state:', error);
  }
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [tutorialState, setTutorialState] = useState<TutorialState>(loadTutorialState);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveTutorialState(tutorialState);
  }, [tutorialState]);

  // Check if user has a saved run (if they do, skip tutorial)
  const hasSavedRun = (): boolean => {
    try {
      const runState = localStorage.getItem('ndg_run_state');
      if (runState) {
        const parsed = JSON.parse(runState);
        // Consider it a saved run if they've started a run (has domain/room progress)
        return !!(parsed.currentDomain || parsed.currentRoom || parsed.score > 0);
      }
    } catch (error) {
      // Ignore parse errors
    }
    return false;
  };

  // Tutorial should show if:
  // 1. User hasn't seen it before (!swipeGestureSeen)
  // 2. User doesn't have a saved run
  const shouldShowSwipeTutorial = !tutorialState.swipeGestureSeen && !hasSavedRun();

  // New run tutorial should show if user hasn't seen it yet
  const shouldShowNewRunTutorial = !tutorialState.newRunTutorialSeen;

  const markSwipeTutorialSeen = () => {
    setTutorialState((prev) => ({ ...prev, swipeGestureSeen: true }));
  };

  const markCanvasInteractionSeen = () => {
    setTutorialState((prev) => ({ ...prev, canvasInteractionSeen: true }));
  };

  const markNewRunTutorialSeen = () => {
    setTutorialState((prev) => ({ ...prev, newRunTutorialSeen: true }));
  };

  const resetTutorials = () => {
    setTutorialState(DEFAULT_STATE);
  };

  const value: TutorialContextValue = {
    tutorialState,
    shouldShowSwipeTutorial,
    shouldShowNewRunTutorial,
    markSwipeTutorialSeen,
    markCanvasInteractionSeen,
    markNewRunTutorialSeen,
    resetTutorials,
  };

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}

export function useTutorial(): TutorialContextValue {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
}
