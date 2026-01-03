/**
 * Phaser Game Adapter
 *
 * Bridges Phaser game events to the NDG AI Engine.
 * Listens for game events and triggers NPC responses.
 */

import type { SeededRng } from '../core/seeded-rng';
import { createSeededRng } from '../core/seeded-rng';
import type { EnhancedEngineState } from '../core/enhanced-interaction';
import { createEnhancedEngineState, executeEnhancedTurn, handleBehavioralEvent } from '../core/enhanced-interaction';
import type { EnhancedNPCConfig } from '../npcs/types';
import type { BehavioralEvent } from '../personality/behavioral-patterns';
import type { NPCCategory, NPCPersonality } from '../core/types';

// ============================================
// Helper Functions
// ============================================

function toNPCPersonality(npc: EnhancedNPCConfig): NPCPersonality {
  return {
    identity: npc.identity,
    sociability: npc.sociability,
    defaultMood: 'neutral',
    moodVolatility: 0.3,
    aggression: 0.2,
    loyalty: 0.5,
    curiosity: 0.5,
    templates: [],
    basePoolWeights: {
      idle: 20,
      npcGreeting: 15,
      npcReaction: 20,
      npcGossip: 10,
      lore: 10,
      threat: 5,
    },
  };
}

// ============================================
// Game Event Types
// ============================================

export type GameEventType =
  | 'player_death'
  | 'player_kill'
  | 'player_damage'
  | 'player_heal'
  | 'item_pickup'
  | 'item_use'
  | 'room_enter'
  | 'room_clear'
  | 'boss_encounter'
  | 'boss_defeat'
  | 'trade_start'
  | 'trade_complete'
  | 'npc_encounter'
  | 'dice_roll'
  | 'favor_change'
  | 'domain_enter'
  | 'domain_exit'
  | 'squish'
  | 'critical_hit'
  | 'lucky_roll';

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  data: GameEventData;
}

export interface GameEventData {
  // Player state
  playerHealth?: number;
  playerMaxHealth?: number;
  playerIntegrity?: number;
  playerLuckyNumber?: number;

  // Combat/action data
  damage?: number;
  enemySlug?: string;
  enemyName?: string;
  itemSlug?: string;
  itemName?: string;

  // Location data
  roomId?: string;
  roomType?: string;
  domain?: string;

  // Dice data
  diceValue?: number;
  diceType?: string;

  // NPC data
  npcSlug?: string;
  npcName?: string;
  npcCategory?: NPCCategory;

  // Trade data
  tradeValue?: number;
  tradeItems?: string[];

  // Favor data
  favorDelta?: number;
  favorTotal?: number;

  // Misc
  isFirstEncounter?: boolean;
  cause?: string;
}

// ============================================
// Chat Message for UI
// ============================================

export interface NPCChatMessage {
  id: string;
  npcSlug: string;
  npcName: string;
  npcCategory: NPCCategory;
  text: string;
  timestamp: number;
  triggeredBy: GameEventType | 'autonomous' | 'player_input';
  mood: string;
  isHighlight: boolean;
  quickReplies?: QuickReply[];
}

export interface QuickReply {
  verb: string;
  label: string;
}

// ============================================
// Adapter Configuration
// ============================================

export interface PhaserAdapterConfig {
  // NPCs to include in the chat system
  activeNPCs: EnhancedNPCConfig[];

  // Chat settings
  maxMessagesInFeed: number;
  highlightDuration: number; // ms
  autonomousChatInterval: number; // ms between autonomous NPC chatter

  // Event filtering
  enabledEventTypes?: GameEventType[];

  // Callbacks
  onMessage?: (message: NPCChatMessage) => void;
  onHighlight?: (message: NPCChatMessage) => void;
}

const DEFAULT_CONFIG: Partial<PhaserAdapterConfig> = {
  maxMessagesInFeed: 50,
  highlightDuration: 5000,
  autonomousChatInterval: 30000,
};

// ============================================
// Phaser Adapter Class
// ============================================

export class PhaserAdapter {
  private config: PhaserAdapterConfig;
  private engineState: EnhancedEngineState | null = null;
  private rng: SeededRng;
  private messages: NPCChatMessage[] = [];
  private messageIdCounter = 0;
  private autonomousTimer: ReturnType<typeof setInterval> | null = null;
  private currentDomain = 'earth';
  private playerState: PlayerState = {
    health: 100,
    maxHealth: 100,
    integrity: 100,
    luckyNumber: 2,
    favor: {},
    deaths: 0,
    kills: 0,
  };

  constructor(config: PhaserAdapterConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    const baseSeed = `phaser-${Date.now()}`;
    this.rng = createSeededRng(baseSeed);
    this.initializeEngine();
  }

  // ============================================
  // Initialization
  // ============================================

  private initializeEngine(): void {
    if (this.config.activeNPCs.length === 0) {
      return;
    }

    // Convert EnhancedNPCConfig to NPCPersonality for the engine
    const npcs = this.config.activeNPCs.map(toNPCPersonality);
    const seed = `phaser-engine-${Date.now()}`;
    this.engineState = createEnhancedEngineState(npcs, seed);
  }

  /**
   * Start autonomous NPC chatter
   */
  public startAutonomousChat(): void {
    if (this.autonomousTimer) {
      return;
    }

    this.autonomousTimer = setInterval(() => {
      this.generateAutonomousMessage();
    }, this.config.autonomousChatInterval);
  }

  /**
   * Stop autonomous NPC chatter
   */
  public stopAutonomousChat(): void {
    if (this.autonomousTimer) {
      clearInterval(this.autonomousTimer);
      this.autonomousTimer = null;
    }
  }

  // ============================================
  // Game Event Handling
  // ============================================

  /**
   * Handle a game event and generate NPC responses
   */
  public handleGameEvent(event: GameEvent): NPCChatMessage[] {
    // Check if event type is enabled
    if (
      this.config.enabledEventTypes &&
      !this.config.enabledEventTypes.includes(event.type)
    ) {
      return [];
    }

    // Update player state from event
    this.updatePlayerState(event);

    // Convert game event to behavioral event
    const behavioralEvent = this.convertToBehavioralEvent(event);

    // Determine which NPCs should respond
    const respondingNPCs = this.selectRespondingNPCs(event);

    // Generate responses
    const newMessages: NPCChatMessage[] = [];

    for (const npc of respondingNPCs) {
      const message = this.generateNPCResponse(npc, event, behavioralEvent);
      if (message) {
        newMessages.push(message);
        this.addMessage(message);
      }
    }

    return newMessages;
  }

  /**
   * Handle player chat input
   */
  public handlePlayerInput(text: string, targetNpcSlug?: string): NPCChatMessage | null {
    // Find target NPC or pick the most relevant one
    const targetNPC = targetNpcSlug
      ? this.config.activeNPCs.find(n => n.identity.slug === targetNpcSlug)
      : this.selectNPCForPlayerInput(text);

    if (!targetNPC) {
      return null;
    }

    // Create engine state for this NPC
    const seed = `player-input-${targetNPC.identity.slug}-${Date.now()}`;
    const engineState = createEnhancedEngineState([toNPCPersonality(targetNPC)], seed);

    // Execute NPC turn - force the speaker to be this NPC
    const result = executeEnhancedTurn(
      engineState,
      targetNPC.identity.slug
    );

    if (!result || !result.turn.message) {
      return null;
    }

    // Extract text from ChatMessage
    const messageText = typeof result.turn.message === 'string'
      ? result.turn.message
      : result.turn.message.content;

    const message = this.createChatMessage(
      targetNPC,
      messageText,
      'player_input',
      'neutral',
      false
    );

    this.addMessage(message);
    return message;
  }

  // ============================================
  // Internal Helpers
  // ============================================

  private updatePlayerState(event: GameEvent): void {
    const data = event.data;

    if (data.playerHealth !== undefined) {
      this.playerState.health = data.playerHealth;
    }
    if (data.playerMaxHealth !== undefined) {
      this.playerState.maxHealth = data.playerMaxHealth;
    }
    if (data.playerIntegrity !== undefined) {
      this.playerState.integrity = data.playerIntegrity;
    }
    if (data.domain) {
      this.currentDomain = data.domain;
    }

    // Track deaths and kills
    if (event.type === 'player_death') {
      this.playerState.deaths++;
    }
    if (event.type === 'player_kill') {
      this.playerState.kills++;
    }

    // Track favor
    if (event.type === 'favor_change' && data.npcSlug && data.favorDelta) {
      this.playerState.favor[data.npcSlug] =
        (this.playerState.favor[data.npcSlug] || 0) + data.favorDelta;
    }
  }

  private convertToBehavioralEvent(event: GameEvent): BehavioralEvent | null {
    // Map game events to BehavioralEvent union types
    switch (event.type) {
      case 'player_death':
        return { type: 'player_left' };
      case 'npc_encounter':
        return { type: 'player_joined' };
      case 'trade_complete':
        return { type: 'trade_complete', success: true };
      case 'favor_change':
        if (event.data.favorDelta && event.data.favorDelta > 0) {
          return { type: 'gift_given', from: event.data.npcSlug || 'player' };
        }
        return null;
      default:
        // Not all game events map to behavioral events
        return null;
    }
  }

  private selectRespondingNPCs(event: GameEvent): EnhancedNPCConfig[] {
    const npcs: EnhancedNPCConfig[] = [];

    // Priority events that should always get responses
    const highPriorityEvents: GameEventType[] = [
      'player_death',
      'boss_defeat',
      'domain_enter',
      'squish',
    ];

    const isHighPriority = highPriorityEvents.includes(event.type);

    for (const npc of this.config.activeNPCs) {
      // Check if NPC is in the current domain or is omnipresent
      const isInDomain =
        npc.gameAttributes.preferredLocations?.includes(this.currentDomain) ||
        npc.identity.category === 'pantheon';

      // Check event relevance based on NPC interests
      const isRelevant = this.isEventRelevantToNPC(npc, event);

      // Shopkeepers respond to trade events
      if (
        npc.gameAttributes.isShopkeeper &&
        (event.type === 'trade_start' || event.type === 'trade_complete')
      ) {
        npcs.push(npc);
        continue;
      }

      // High priority events or relevant events in same domain
      if (isHighPriority || (isInDomain && isRelevant)) {
        // Use sociability as response probability
        if (this.rng.random() < npc.sociability) {
          npcs.push(npc);
        }
      }
    }

    // Limit to 1-2 responders to avoid spam
    return npcs.slice(0, 2);
  }

  private isEventRelevantToNPC(npc: EnhancedNPCConfig, event: GameEvent): boolean {
    // Check if event matches NPC's topic affinities
    type TopicCategory = 'greeting' | 'business' | 'personal' | 'lore' | 'threat' | 'alliance' | 'gossip' | 'philosophy' | 'practical' | 'humor' | 'emotional' | 'game_meta';

    const eventToTopic: Partial<Record<GameEventType, TopicCategory>> = {
      player_death: 'threat',
      player_kill: 'threat',
      boss_defeat: 'lore',
      trade_complete: 'business',
      dice_roll: 'game_meta',
      favor_change: 'alliance',
    };

    const topic = eventToTopic[event.type];
    if (topic && npc.topicAffinity.preferred.includes(topic)) {
      return true;
    }

    // Check if topic matches NPC's trigger topics
    if (topic && npc.topicAffinity.triggers?.includes(topic)) {
      return true;
    }

    // High sociability NPCs respond to more events
    if (npc.sociability > 0.7) {
      return true;
    }

    return false;
  }

  private generateNPCResponse(
    npc: EnhancedNPCConfig,
    event: GameEvent,
    behavioralEvent: BehavioralEvent | null
  ): NPCChatMessage | null {
    // Create fresh engine state for this NPC
    const seed = `response-${npc.identity.slug}-${Date.now()}`;
    let engineState = createEnhancedEngineState([toNPCPersonality(npc)], seed);

    // Process the behavioral event if present
    if (behavioralEvent) {
      engineState = handleBehavioralEvent(engineState, behavioralEvent, npc.identity.slug);
    }

    // Execute NPC turn - force the speaker to be this NPC
    const result = executeEnhancedTurn(
      engineState,
      npc.identity.slug
    );

    if (!result || !result.turn.message) {
      return null;
    }

    // Extract text from ChatMessage
    const messageText = typeof result.turn.message === 'string'
      ? result.turn.message
      : result.turn.message.content;

    // Determine if this is a highlight message
    const isHighlight = this.shouldHighlight(event, npc);

    const message = this.createChatMessage(
      npc,
      messageText,
      event.type,
      'neutral', // Mood from turn result
      isHighlight
    );

    // Notify callbacks
    if (this.config.onMessage) {
      this.config.onMessage(message);
    }
    if (isHighlight && this.config.onHighlight) {
      this.config.onHighlight(message);
    }

    return message;
  }

  private shouldHighlight(event: GameEvent, npc: EnhancedNPCConfig): boolean {
    // Highlight events that are dramatic or important
    const highlightEvents: GameEventType[] = [
      'player_death',
      'boss_defeat',
      'lucky_roll',
      'squish',
      'critical_hit',
    ];

    if (highlightEvents.includes(event.type)) {
      return true;
    }

    // Highlight Pantheon/Die-rector messages
    if (npc.identity.category === 'pantheon') {
      return true;
    }

    return false;
  }

  private generateAutonomousMessage(): void {
    // Pick a random active NPC with high sociability
    const socialNPCs = this.config.activeNPCs
      .filter(n => n.sociability > 0.5)
      .sort(() => this.rng.random() - 0.5);

    if (socialNPCs.length === 0) {
      return;
    }

    const npc = socialNPCs[0];

    // Create engine state
    const seed = `autonomous-${npc.identity.slug}-${Date.now()}`;
    const engineState = createEnhancedEngineState([toNPCPersonality(npc)], seed);

    // Execute idle turn - force the speaker to be this NPC
    const result = executeEnhancedTurn(
      engineState,
      npc.identity.slug
    );

    if (!result || !result.turn.message) {
      return;
    }

    // Extract text from ChatMessage
    const messageText = typeof result.turn.message === 'string'
      ? result.turn.message
      : result.turn.message.content;

    const message = this.createChatMessage(
      npc,
      messageText,
      'autonomous',
      'neutral',
      false
    );

    this.addMessage(message);

    if (this.config.onMessage) {
      this.config.onMessage(message);
    }
  }

  private selectNPCForPlayerInput(text: string): EnhancedNPCConfig | null {
    // Look for NPC mentions in text
    const lowerText = text.toLowerCase();

    for (const npc of this.config.activeNPCs) {
      if (
        lowerText.includes(npc.identity.name.toLowerCase()) ||
        lowerText.includes(npc.identity.slug.toLowerCase())
      ) {
        return npc;
      }
    }

    // Return most social NPC in current domain
    const domainNPCs = this.config.activeNPCs.filter(
      n =>
        n.gameAttributes.preferredLocations?.includes(this.currentDomain) ||
        n.gameAttributes.homeLocation === this.currentDomain
    );

    if (domainNPCs.length > 0) {
      return domainNPCs.sort((a, b) => b.sociability - a.sociability)[0];
    }

    // Fallback to any social NPC
    return this.config.activeNPCs.sort((a, b) => b.sociability - a.sociability)[0] || null;
  }

  private createChatMessage(
    npc: EnhancedNPCConfig,
    text: string,
    triggeredBy: GameEventType | 'autonomous' | 'player_input',
    mood: string,
    isHighlight: boolean,
    quickReplies?: Array<{ verb: string; label: string }>
  ): NPCChatMessage {
    return {
      id: `msg-${++this.messageIdCounter}`,
      npcSlug: npc.identity.slug,
      npcName: npc.identity.name,
      npcCategory: npc.identity.category,
      text,
      timestamp: Date.now(),
      triggeredBy,
      mood,
      isHighlight,
      quickReplies,
    };
  }

  private addMessage(message: NPCChatMessage): void {
    this.messages.push(message);

    // Trim old messages
    if (this.messages.length > this.config.maxMessagesInFeed) {
      this.messages = this.messages.slice(-this.config.maxMessagesInFeed);
    }
  }

  private getRecentMessageTexts(count: number): string[] {
    return this.messages.slice(-count).map(m => m.text);
  }

  // ============================================
  // Public Accessors
  // ============================================

  /**
   * Get all chat messages
   */
  public getMessages(): NPCChatMessage[] {
    return [...this.messages];
  }

  /**
   * Get recent messages
   */
  public getRecentChatMessages(count: number): NPCChatMessage[] {
    return this.messages.slice(-count);
  }

  /**
   * Clear all messages
   */
  public clearMessages(): void {
    this.messages = [];
  }

  /**
   * Update current domain
   */
  public setDomain(domain: string): void {
    this.currentDomain = domain;
  }

  /**
   * Get current domain
   */
  public getDomain(): string {
    return this.currentDomain;
  }

  /**
   * Update player state
   */
  public setPlayerState(state: Partial<PlayerState>): void {
    this.playerState = { ...this.playerState, ...state };
  }

  /**
   * Get player state
   */
  public getPlayerState(): PlayerState {
    return { ...this.playerState };
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopAutonomousChat();
    this.messages = [];
    this.engineState = null;
  }
}

// ============================================
// Player State Type
// ============================================

interface PlayerState {
  health: number;
  maxHealth: number;
  integrity: number;
  luckyNumber: number;
  favor: Record<string, number>;
  deaths: number;
  kills: number;
}

// ============================================
// Factory Function
// ============================================

/**
 * Create a Phaser adapter instance
 */
export function createPhaserAdapter(config: PhaserAdapterConfig): PhaserAdapter {
  return new PhaserAdapter(config);
}
