/**
 * PartyKit Room Server - Divine Drama Engine
 *
 * Handles multiplayer racing rooms with Die-rector favor tracking.
 *
 * NEVER DIE GUY
 */

import type * as Party from 'partykit/server';

// Import from ai-engine package
import {
  type ClientMessage,
  type ServerMessage,
  type RoomState,
  type RacePlayer,
  type RoomConfig,
  type MatchResult,
  type ProgressUpdate,
  type PlayerFinishResult,
  type ChatEvent,
  type DiceEvent,
  type PlayerFavorMap,
  type InterventionEvent,
  generateSeed,
  getSetWinner,
  QUICK_CHAT_PHRASES,
  createInitialFavorMap,
  processDiceEvent,
  generateIntervention,
  checkRivalrySympathy,
} from '@ndg/ai-engine';

// ============================================
// ROOM SERVER
// ============================================

export default class RaceRoom implements Party.Server {
  private state: RoomState | null = null;

  constructor(readonly room: Party.Room) {}

  // ----------------------------------------
  // LIFECYCLE
  // ----------------------------------------

  async onStart() {
    // Load persisted state if exists
    const stored = await this.room.storage.get<RoomState>('state');
    if (stored) {
      this.state = stored;
    }
  }

  async onClose() {
    // Persist state before shutdown
    if (this.state) {
      await this.room.storage.put('state', this.state);
    }
  }

  // ----------------------------------------
  // CONNECTION HANDLING
  // ----------------------------------------

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // If no room exists yet, wait for JOIN message with host config
    if (this.state) {
      // Send current room state to new connection
      this.send(conn, { type: 'ROOM_STATE', state: this.state });
    }
  }

  async onDisconnect(conn: Party.Connection) {
    if (!this.state) return;

    const player = this.state.players[conn.id];
    if (!player) return;

    // Mark as disconnected (don't remove immediately, allow reconnect)
    player.connected = false;

    // Broadcast disconnect
    this.broadcast({ type: 'PLAYER_LEFT', playerId: conn.id });

    await this.persist();
  }

  // ----------------------------------------
  // MESSAGE HANDLING
  // ----------------------------------------

  async onMessage(message: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message) as ClientMessage;
    } catch {
      this.send(sender, { type: 'ERROR', message: 'Invalid message format' });
      return;
    }

    switch (msg.type) {
      case 'JOIN':
        await this.handleJoin(sender, msg.playerName);
        break;

      case 'LEAVE':
        await this.handleLeave(sender);
        break;

      case 'START_SET':
        await this.handleStartSet(sender);
        break;

      case 'PROGRESS_UPDATE':
        await this.handleProgressUpdate(sender, msg.progress);
        break;

      case 'DICE_EVENTS':
        await this.handleDiceEvents(sender, msg.events);
        break;

      case 'QUICK_CHAT':
        await this.handleQuickChat(sender, msg.phraseId);
        break;

      case 'FINISH':
        await this.handleFinish(sender, msg.result);
        break;

      case 'NEXT_MATCH':
        await this.handleNextMatch(sender);
        break;

      case 'REMATCH':
        await this.handleRematch(sender);
        break;
    }
  }

  // ----------------------------------------
  // JOIN / LEAVE
  // ----------------------------------------

  private async handleJoin(conn: Party.Connection, playerName: string) {
    // Create room if first player
    if (!this.state) {
      this.state = this.createRoom(conn.id, playerName);
    } else {
      // Check if player already exists (reconnect)
      const existing = this.state.players[conn.id];
      if (existing) {
        existing.connected = true;
        existing.name = playerName;
      } else {
        // Add new player
        if (this.state.phase !== 'lobby') {
          this.send(conn, { type: 'ERROR', message: 'Race already in progress' });
          return;
        }

        if (Object.keys(this.state.players).length >= this.state.config.maxPlayers) {
          this.send(conn, { type: 'ERROR', message: 'Room is full' });
          return;
        }

        const player = this.createPlayer(conn.id, playerName, false);
        this.state.players[conn.id] = player;

        // Initialize favor map
        this.state.favorMaps[conn.id] = createInitialFavorMap(conn.id, playerName);

        this.broadcast({ type: 'PLAYER_JOINED', player });
      }
    }

    // Send full state to joining player
    this.send(conn, { type: 'ROOM_STATE', state: this.state });
    await this.persist();
  }

  private async handleLeave(conn: Party.Connection) {
    if (!this.state) return;

    const player = this.state.players[conn.id];
    if (!player) return;

    // Remove player
    delete this.state.players[conn.id];
    delete this.state.favorMaps[conn.id];

    // If host left, assign new host
    if (player.isHost) {
      const remaining = Object.values(this.state.players);
      if (remaining.length > 0) {
        remaining[0].isHost = true;
        this.state.config.hostId = remaining[0].id;
      }
    }

    this.broadcast({ type: 'PLAYER_LEFT', playerId: conn.id });
    await this.persist();
  }

  // ----------------------------------------
  // RACE FLOW
  // ----------------------------------------

  private async handleStartSet(conn: Party.Connection) {
    if (!this.state) return;

    // Only host can start
    if (this.state.config.hostId !== conn.id) {
      this.send(conn, { type: 'ERROR', message: 'Only host can start' });
      return;
    }

    // Need at least 2 players
    if (Object.keys(this.state.players).length < 2) {
      this.send(conn, { type: 'ERROR', message: 'Need at least 2 players' });
      return;
    }

    // Start countdown
    const countdownMs = 3000;
    const endsAt = Date.now() + countdownMs;

    this.state.phase = 'countdown';
    this.state.countdownEnd = endsAt;

    this.broadcast({ type: 'COUNTDOWN_START', endsAt });

    // Schedule race start
    setTimeout(() => this.startRace(), countdownMs);

    await this.persist();
  }

  private async startRace() {
    if (!this.state) return;

    const seed = this.state.config.seed ?? generateSeed();
    const matchNumber = this.state.currentMatchNumber + 1;

    this.state.phase = 'racing';
    this.state.currentMatchNumber = matchNumber;
    this.state.currentSeed = seed;
    this.state.matchStartTime = Date.now();

    // Reset player states
    for (const player of Object.values(this.state.players)) {
      player.status = 'racing';
      player.currentDomain = 1;
      player.roomsCleared = 0;
      player.totalScore = 0;
      player.lastUpdateTime = Date.now();
    }

    this.broadcast({ type: 'RACE_START', seed, matchNumber });
    await this.persist();
  }

  private async handleProgressUpdate(conn: Party.Connection, progress: ProgressUpdate) {
    if (!this.state) return;

    const player = this.state.players[conn.id];
    if (!player || player.status !== 'racing') return;

    player.currentDomain = progress.currentDomain;
    player.roomsCleared = progress.roomsCleared;
    player.totalScore = progress.totalScore;
    player.lastUpdateTime = Date.now();

    this.broadcast({
      type: 'PROGRESS_BROADCAST',
      playerId: conn.id,
      progress,
    });

    // Don't persist on every progress update (too frequent)
  }

  private async handleDiceEvents(conn: Party.Connection, events: DiceEvent[]) {
    if (!this.state) return;

    const favorMap = this.state.favorMaps[conn.id];
    if (!favorMap) return;

    const player = this.state.players[conn.id];
    if (!player) return;

    const interventions: InterventionEvent[] = [];

    // Process each dice event
    for (const event of events) {
      const { updatedMap, thresholdCrossings } = processDiceEvent(favorMap, event);
      this.state.favorMaps[conn.id] = updatedMap;

      // Generate interventions for threshold crossings
      for (const crossing of thresholdCrossings) {
        const intervention = generateIntervention(
          crossing.dierectorSlug,
          conn.id,
          player.name,
          crossing.newState
        );

        if (intervention) {
          interventions.push(intervention);

          // Check for rivalry sympathy on scorn
          if (crossing.newState === 'SCORNED') {
            const sympathy = checkRivalrySympathy(
              crossing.dierectorSlug,
              conn.id,
              player.name,
              updatedMap
            );
            if (sympathy) {
              interventions.push(sympathy);
            }
          }
        }
      }
    }

    // Broadcast interventions
    for (const intervention of interventions) {
      this.state.recentEvents.push(intervention);
      this.broadcast({ type: 'INTERVENTION', event: intervention });
    }

    // Trim event log
    if (this.state.recentEvents.length > 50) {
      this.state.recentEvents = this.state.recentEvents.slice(-50);
    }

    await this.persist();
  }

  private async handleFinish(conn: Party.Connection, result: PlayerFinishResult) {
    if (!this.state) return;

    const player = this.state.players[conn.id];
    if (!player || player.status !== 'racing') return;

    player.status = result.status;
    player.totalScore = result.finalScore;
    player.lastUpdateTime = result.finishTime;

    this.broadcast({
      type: 'PLAYER_FINISHED',
      playerId: conn.id,
      result,
    });

    // Check if all players finished
    const allFinished = Object.values(this.state.players).every(
      (p) => p.status === 'victory' || p.status === 'dead'
    );

    if (allFinished) {
      await this.endMatch();
    }

    await this.persist();
  }

  private async endMatch() {
    if (!this.state) return;

    const players = Object.values(this.state.players);

    // Sort by: victory first, then by score
    const rankings = players
      .map((p) => ({
        playerId: p.id,
        playerName: p.name,
        finalScore: p.totalScore,
        status: p.status as 'victory' | 'dead',
        finishTime: p.lastUpdateTime,
      }))
      .sort((a, b) => {
        // Victory beats dead
        if (a.status !== b.status) {
          return a.status === 'victory' ? -1 : 1;
        }
        // Higher score wins
        return b.finalScore - a.finalScore;
      });

    const matchResult: MatchResult = {
      matchNumber: this.state.currentMatchNumber,
      seed: this.state.currentSeed,
      rankings,
      winnerId: rankings[0]?.playerId ?? null,
      durationMs: Date.now() - (this.state.matchStartTime ?? Date.now()),
    };

    this.state.matchHistory.push(matchResult);

    // Update set scores
    if (matchResult.winnerId) {
      const score = this.state.setScores.find((s) => s.playerId === matchResult.winnerId);
      if (score) {
        score.wins++;
      } else {
        this.state.setScores.push({ playerId: matchResult.winnerId, wins: 1 });
      }
    }

    // Check for set winner
    const setWinner = getSetWinner(this.state.setScores, this.state.config.matchFormat);

    if (setWinner) {
      this.state.phase = 'set_complete';
      this.broadcast({
        type: 'SET_END',
        finalScores: this.state.setScores,
        winnerId: setWinner,
      });
    } else {
      this.state.phase = 'results';
      this.broadcast({ type: 'MATCH_END', result: matchResult });
    }

    await this.persist();
  }

  private async handleNextMatch(conn: Party.Connection) {
    if (!this.state) return;

    // Only host can advance
    if (this.state.config.hostId !== conn.id) {
      this.send(conn, { type: 'ERROR', message: 'Only host can start next match' });
      return;
    }

    if (this.state.phase !== 'results') {
      this.send(conn, { type: 'ERROR', message: 'Cannot start next match now' });
      return;
    }

    // Start next match (favor memory preserved)
    await this.startRace();
  }

  private async handleRematch(conn: Party.Connection) {
    if (!this.state) return;

    if (this.state.phase !== 'set_complete') {
      this.send(conn, { type: 'ERROR', message: 'Set not complete' });
      return;
    }

    // Reset for new set (but keep room)
    this.state.phase = 'lobby';
    this.state.currentMatchNumber = 0;
    this.state.matchHistory = [];
    this.state.setScores = [];

    // Reset favor maps (new set, fresh opinions)
    for (const playerId of Object.keys(this.state.favorMaps)) {
      const player = this.state.players[playerId];
      if (player) {
        this.state.favorMaps[playerId] = createInitialFavorMap(playerId, player.name);
      }
    }

    // Reset player states
    for (const player of Object.values(this.state.players)) {
      player.status = 'lobby';
      player.currentDomain = 1;
      player.roomsCleared = 0;
      player.totalScore = 0;
    }

    this.broadcast({ type: 'ROOM_STATE', state: this.state });
    await this.persist();
  }

  // ----------------------------------------
  // QUICK CHAT
  // ----------------------------------------

  private async handleQuickChat(conn: Party.Connection, phraseId: string) {
    if (!this.state) return;

    const player = this.state.players[conn.id];
    if (!player) return;

    const phrase = QUICK_CHAT_PHRASES.find((p) => p.id === phraseId);
    if (!phrase) return;

    const event: ChatEvent = {
      id: `chat_${Date.now()}_${conn.id}`,
      playerId: conn.id,
      playerName: player.name,
      phraseId,
      text: phrase.text,
      timestamp: Date.now(),
    };

    this.state.recentEvents.push(event);
    this.broadcast({ type: 'CHAT', event });

    // Trim event log
    if (this.state.recentEvents.length > 50) {
      this.state.recentEvents = this.state.recentEvents.slice(-50);
    }
  }

  // ----------------------------------------
  // HELPERS
  // ----------------------------------------

  private createRoom(hostId: string, hostName: string): RoomState {
    const config: RoomConfig = {
      matchFormat: 'bo3',
      maxPlayers: 8,
      allowSpectators: false,
      hostId,
    };

    const host = this.createPlayer(hostId, hostName, true);

    return {
      code: this.room.id.toUpperCase().slice(0, 4),
      createdAt: Date.now(),
      config,
      phase: 'lobby',
      players: { [hostId]: host },
      currentMatchNumber: 0,
      currentSeed: '',
      matchHistory: [],
      setScores: [],
      favorMaps: {
        [hostId]: createInitialFavorMap(hostId, hostName),
      },
      recentEvents: [],
    };
  }

  private createPlayer(id: string, name: string, isHost: boolean): RacePlayer {
    return {
      id,
      name,
      status: 'lobby',
      connected: true,
      isHost,
      currentDomain: 1,
      roomsCleared: 0,
      totalScore: 0,
      lastUpdateTime: Date.now(),
    };
  }

  private send(conn: Party.Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg));
  }

  private broadcast(msg: ServerMessage) {
    this.room.broadcast(JSON.stringify(msg));
  }

  private async persist() {
    if (this.state) {
      await this.room.storage.put('state', this.state);
    }
  }
}
