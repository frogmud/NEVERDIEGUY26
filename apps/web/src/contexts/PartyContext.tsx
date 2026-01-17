/**
 * PartyContext - Multiplayer Room State Management
 *
 * Manages WebSocket connection to PartyKit room and exposes
 * multiplayer state to React components.
 *
 * NEVER DIE GUY
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

import type {
  ClientMessage,
  ServerMessage,
  RoomState,
  RacePlayer,
  ProgressUpdate,
  PlayerFinishResult,
  InterventionEvent,
  ChatEvent,
  MatchResult,
  SetScore,
} from '@ndg/ai-engine/multiplayer';

import type { DiceEvent } from '@ndg/ai-engine/multiplayer';

// ============================================
// CONTEXT TYPES
// ============================================

interface PartyContextValue {
  // Connection state
  connected: boolean;
  connecting: boolean;
  error: string | null;

  // Room state
  roomState: RoomState | null;
  myPlayerId: string | null;
  isHost: boolean;

  // Derived state
  players: RacePlayer[];
  myPlayer: RacePlayer | null;
  interventions: InterventionEvent[];
  chatMessages: ChatEvent[];

  // Actions
  connect: (roomCode: string, playerName: string) => void;
  disconnect: () => void;
  createRoom: (playerName: string) => void;
  startSet: () => void;
  sendProgress: (progress: ProgressUpdate) => void;
  sendDiceEvents: (events: DiceEvent[]) => void;
  sendQuickChat: (phraseId: string) => void;
  finishRace: (result: PlayerFinishResult) => void;
  nextMatch: () => void;
  rematch: () => void;
}

const PartyContext = createContext<PartyContextValue | null>(null);

// ============================================
// PARTYKIT CONFIG
// ============================================

// PartyKit host - can be configured via env
// Local dev: localhost:1999 (default PartyKit dev server)
// Production: deployed PartyKit URL
const PARTYKIT_HOST =
  import.meta.env.VITE_PARTYKIT_HOST ||
  (import.meta.env.DEV ? 'localhost:1999' : 'ndg-multiplayer.partykit.dev');

const WS_PROTOCOL = import.meta.env.DEV ? 'ws' : 'wss';

// ============================================
// PROVIDER
// ============================================

interface PartyProviderProps {
  children: ReactNode;
}

export function PartyProvider({ children }: PartyProviderProps) {
  // Connection state
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Room state
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  // WebSocket ref
  const wsRef = useRef<WebSocket | null>(null);
  const pendingNameRef = useRef<string | null>(null);

  // ----------------------------------------
  // MESSAGE HANDLERS
  // ----------------------------------------

  const handleMessage = useCallback((event: MessageEvent) => {
    let msg: ServerMessage;
    try {
      msg = JSON.parse(event.data) as ServerMessage;
    } catch {
      console.error('[Party] Invalid message from server');
      return;
    }

    switch (msg.type) {
      case 'ROOM_STATE':
        setRoomState(msg.state);
        break;

      case 'PLAYER_JOINED':
        setRoomState((prev) =>
          prev
            ? {
                ...prev,
                players: { ...prev.players, [msg.player.id]: msg.player },
              }
            : prev
        );
        break;

      case 'PLAYER_LEFT':
        setRoomState((prev) => {
          if (!prev) return prev;
          const { [msg.playerId]: _, ...rest } = prev.players;
          return { ...prev, players: rest };
        });
        break;

      case 'COUNTDOWN_START':
        setRoomState((prev) =>
          prev
            ? { ...prev, phase: 'countdown', countdownEnd: msg.endsAt }
            : prev
        );
        break;

      case 'RACE_START':
        setRoomState((prev) =>
          prev
            ? {
                ...prev,
                phase: 'racing',
                currentSeed: msg.seed,
                currentMatchNumber: msg.matchNumber,
                matchStartTime: Date.now(),
              }
            : prev
        );
        break;

      case 'PROGRESS_BROADCAST':
        setRoomState((prev) => {
          if (!prev) return prev;
          const player = prev.players[msg.playerId];
          if (!player) return prev;
          return {
            ...prev,
            players: {
              ...prev.players,
              [msg.playerId]: {
                ...player,
                currentDomain: msg.progress.currentDomain,
                roomsCleared: msg.progress.roomsCleared,
                totalScore: msg.progress.totalScore,
                lastUpdateTime: Date.now(),
              },
            },
          };
        });
        break;

      case 'PLAYER_FINISHED':
        setRoomState((prev) => {
          if (!prev) return prev;
          const player = prev.players[msg.playerId];
          if (!player) return prev;
          return {
            ...prev,
            players: {
              ...prev.players,
              [msg.playerId]: {
                ...player,
                status: msg.result.status,
                totalScore: msg.result.finalScore,
                lastUpdateTime: msg.result.finishTime,
              },
            },
          };
        });
        break;

      case 'MATCH_END':
        setRoomState((prev) =>
          prev
            ? {
                ...prev,
                phase: 'results',
                matchHistory: [...prev.matchHistory, msg.result],
              }
            : prev
        );
        break;

      case 'SET_END':
        setRoomState((prev) =>
          prev
            ? {
                ...prev,
                phase: 'set_complete',
                setScores: msg.finalScores,
              }
            : prev
        );
        break;

      case 'INTERVENTION':
        setRoomState((prev) =>
          prev
            ? {
                ...prev,
                recentEvents: [...prev.recentEvents, msg.event].slice(-50),
              }
            : prev
        );
        break;

      case 'CHAT':
        setRoomState((prev) =>
          prev
            ? {
                ...prev,
                recentEvents: [...prev.recentEvents, msg.event].slice(-50),
              }
            : prev
        );
        break;

      case 'ERROR':
        setError(msg.message);
        break;
    }
  }, []);

  // ----------------------------------------
  // CONNECTION MANAGEMENT
  // ----------------------------------------

  const connect = useCallback((roomCode: string, playerName: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setConnecting(true);
    setError(null);
    pendingNameRef.current = playerName;

    const ws = new WebSocket(`${WS_PROTOCOL}://${PARTYKIT_HOST}/parties/race/${roomCode.toLowerCase()}`);

    ws.onopen = () => {
      setConnected(true);
      setConnecting(false);
      setMyPlayerId(ws.url); // Use connection URL as temp ID until server assigns

      // Send join message
      const msg: ClientMessage = { type: 'JOIN', playerName };
      ws.send(JSON.stringify(msg));
    };

    ws.onmessage = handleMessage;

    ws.onerror = () => {
      setError('Connection failed');
      setConnecting(false);
    };

    ws.onclose = () => {
      setConnected(false);
      setRoomState(null);
      wsRef.current = null;
    };

    wsRef.current = ws;
  }, [handleMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      const msg: ClientMessage = { type: 'LEAVE' };
      wsRef.current.send(JSON.stringify(msg));
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
    setRoomState(null);
    setMyPlayerId(null);
  }, []);

  const createRoom = useCallback((playerName: string) => {
    // Generate room code client-side, server will accept it
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    connect(code, playerName);
  }, [connect]);

  // ----------------------------------------
  // SEND HELPERS
  // ----------------------------------------

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const startSet = useCallback(() => {
    send({ type: 'START_SET' });
  }, [send]);

  const sendProgress = useCallback((progress: ProgressUpdate) => {
    send({ type: 'PROGRESS_UPDATE', progress });
  }, [send]);

  const sendDiceEvents = useCallback((events: DiceEvent[]) => {
    send({ type: 'DICE_EVENTS', events });
  }, [send]);

  const sendQuickChat = useCallback((phraseId: string) => {
    send({ type: 'QUICK_CHAT', phraseId });
  }, [send]);

  const finishRace = useCallback((result: PlayerFinishResult) => {
    send({ type: 'FINISH', result });
  }, [send]);

  const nextMatch = useCallback(() => {
    send({ type: 'NEXT_MATCH' });
  }, [send]);

  const rematch = useCallback(() => {
    send({ type: 'REMATCH' });
  }, [send]);

  // ----------------------------------------
  // DERIVED STATE
  // ----------------------------------------

  const players = roomState ? Object.values(roomState.players) : [];

  // Find my player by checking connected state and host flag
  const myPlayer = players.find((p) => p.connected && p.isHost) ?? players.find((p) => p.connected) ?? null;

  const isHost = roomState?.config.hostId === myPlayer?.id;

  const interventions = (roomState?.recentEvents ?? []).filter(
    (e): e is InterventionEvent => 'dierectorSlug' in e
  );

  const chatMessages = (roomState?.recentEvents ?? []).filter(
    (e): e is ChatEvent => 'phraseId' in e
  );

  // ----------------------------------------
  // CLEANUP
  // ----------------------------------------

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // ----------------------------------------
  // CONTEXT VALUE
  // ----------------------------------------

  const value: PartyContextValue = {
    connected,
    connecting,
    error,
    roomState,
    myPlayerId,
    isHost,
    players,
    myPlayer,
    interventions,
    chatMessages,
    connect,
    disconnect,
    createRoom,
    startSet,
    sendProgress,
    sendDiceEvents,
    sendQuickChat,
    finishRace,
    nextMatch,
    rematch,
  };

  return <PartyContext.Provider value={value}>{children}</PartyContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function useParty(): PartyContextValue {
  const context = useContext(PartyContext);
  if (!context) {
    throw new Error('useParty must be used within a PartyProvider');
  }
  return context;
}

// ============================================
// HOOKS FOR SPECIFIC FEATURES
// ============================================

/**
 * Hook to get race leaderboard sorted by progress
 */
export function useRaceLeaderboard(): RacePlayer[] {
  const { players } = useParty();

  return [...players].sort((a, b) => {
    // Victory first
    if (a.status === 'victory' && b.status !== 'victory') return -1;
    if (b.status === 'victory' && a.status !== 'victory') return 1;

    // Then by rooms cleared
    if (a.roomsCleared !== b.roomsCleared) {
      return b.roomsCleared - a.roomsCleared;
    }

    // Then by score
    return b.totalScore - a.totalScore;
  });
}

/**
 * Hook to get latest interventions
 */
export function useInterventions(limit = 5): InterventionEvent[] {
  const { interventions } = useParty();
  return interventions.slice(-limit);
}

/**
 * Hook to track match countdown
 */
export function useCountdown(): { counting: boolean; secondsLeft: number } {
  const { roomState } = useParty();
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (roomState?.phase !== 'countdown' || !roomState.countdownEnd) {
      setSecondsLeft(0);
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(0, roomState.countdownEnd! - Date.now());
      setSecondsLeft(Math.ceil(remaining / 1000));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 100);

    return () => clearInterval(interval);
  }, [roomState?.phase, roomState?.countdownEnd]);

  return {
    counting: roomState?.phase === 'countdown',
    secondsLeft,
  };
}
