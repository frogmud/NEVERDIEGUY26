/**
 * Gambling Event Dispatcher
 *
 * Handles routing Cee-lo game events to appropriate handlers
 * for generating NPC chat responses, mood updates, and stat tracking.
 */

import type { MoodType, TemplatePool, ResponseTemplate } from '../core/types';
import type { CeeloEvent, CeeloEventType, PlayerMatchState, CeeloChatMessage } from '../games/ceelo/types';
import { getGamblingTemplates, getGamblingTemplatesByMood } from './gambling-templates';
import { calculateNewMood, type GamblingMoodContext } from './mood-mapping';
import { RivalryManager } from './rivalry-system';
import type { BehavioralArchetype } from '../personality/behavioral-patterns';

// ============================================
// Handler Types
// ============================================

export interface EventHandlerContext {
  event: CeeloEvent;
  speakerSlug: string;
  speakerName: string;
  speakerMood: MoodType;
  speakerArchetype: BehavioralArchetype;
  targetSlug?: string;
  targetName?: string;
  playerState: PlayerMatchState;
  opponentState?: PlayerMatchState;
  rivalryManager: RivalryManager;
  rng: () => number;
}

export interface EventHandlerResult {
  messages: CeeloChatMessage[];
  moodChanges: Array<{ npcSlug: string; newMood: MoodType; newIntensity: number }>;
}

export type GamblingEventHandler = (context: EventHandlerContext) => EventHandlerResult;

// ============================================
// Template Selection
// ============================================

/**
 * Select a template from a pool based on mood and conditions
 */
function selectTemplate(
  pool: TemplatePool,
  mood: MoodType,
  context: EventHandlerContext,
  variables: Record<string, string | number>
): ResponseTemplate | null {
  let templates = getGamblingTemplatesByMood(pool, mood);

  // Fallback to any mood if no specific match
  if (templates.length === 0) {
    templates = getGamblingTemplates(pool);
  }

  if (templates.length === 0) {
    return null;
  }

  // Apply rivalry weight bonus if applicable
  let rivalryWeight = 1.0;
  if (context.targetSlug) {
    rivalryWeight = context.rivalryManager.getRivalryTemplateWeight(
      context.speakerSlug,
      context.targetSlug
    );
  }

  // Weight templates and select
  const weightedTemplates = templates.map(t => ({
    template: t,
    weight: t.weight * (t.pool === 'gamblingRivalry' ? rivalryWeight : 1.0),
  }));

  const totalWeight = weightedTemplates.reduce((sum, t) => sum + t.weight, 0);
  let roll = context.rng() * totalWeight;

  for (const { template, weight } of weightedTemplates) {
    roll -= weight;
    if (roll <= 0) {
      return template;
    }
  }

  return templates[0];
}

/**
 * Process template text with variables
 */
function processTemplate(
  template: ResponseTemplate,
  variables: Record<string, string | number>
): string {
  let text = template.text;
  for (const [key, value] of Object.entries(variables)) {
    text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
  }
  return text;
}

/**
 * Create a chat message from a template
 */
function createChatMessage(
  npcSlug: string,
  template: ResponseTemplate,
  mood: MoodType,
  variables: Record<string, string | number>,
  context: EventHandlerContext
): CeeloChatMessage {
  return {
    npcSlug,
    text: processTemplate(template, variables),
    mood,
    timestamp: Date.now(),
    context: {
      matchId: context.event.matchId,
      roundNumber: context.event.roundNumber,
      speakerId: npcSlug,
      targetId: context.targetSlug,
      mood,
      event: context.event,
      variables,
    },
  };
}

// ============================================
// Event Handlers
// ============================================

/**
 * Handle round ended (win/loss)
 */
const handleRoundEnded: GamblingEventHandler = (context) => {
  const messages: CeeloChatMessage[] = [];
  const moodChanges: Array<{ npcSlug: string; newMood: MoodType; newIntensity: number }> = [];

  const { event, speakerSlug, speakerName, playerState, opponentState, targetSlug, targetName } = context;
  const isWinner = event.data['winnerId'] === speakerSlug;
  const goldAmount = event.data['goldExchanged'] as number ?? 0;

  // Variables for templates
  const variables: Record<string, string | number> = {
    speakerName,
    targetName: targetName ?? 'someone',
    goldAmount,
    streakCount: Math.abs(playerState.currentStreak),
  };

  // Determine appropriate pool and mood
  let pool: TemplatePool;
  let mood = context.speakerMood;

  if (isWinner) {
    pool = playerState.currentStreak >= 3 ? 'gamblingStreak' : 'gamblingBrag';
    // Winners often shift to pleased
    if (context.rng() < 0.7) {
      mood = 'pleased';
    }
  } else {
    pool = playerState.currentStreak <= -3 ? 'gamblingQuitThreat' : 'gamblingFrustration';
    // Losers shift to annoyed/angry
    if (playerState.currentStreak <= -2 && context.rng() < 0.5) {
      mood = 'angry';
    } else if (context.rng() < 0.6) {
      mood = 'annoyed';
    }
  }

  // Select and create message
  const template = selectTemplate(pool, mood, context, variables);
  if (template) {
    messages.push(createChatMessage(speakerSlug, template, mood, variables, context));
    moodChanges.push({ npcSlug: speakerSlug, newMood: mood, newIntensity: 60 });
  }

  return { messages, moodChanges };
};

/**
 * Handle streak events
 */
const handleStreak: GamblingEventHandler = (context) => {
  const messages: CeeloChatMessage[] = [];
  const moodChanges: Array<{ npcSlug: string; newMood: MoodType; newIntensity: number }> = [];

  const { event, speakerSlug, speakerName, playerState, targetSlug, targetName } = context;
  const streakCount = event.data['streak'] as number ?? playerState.currentStreak;

  const variables: Record<string, string | number> = {
    speakerName,
    targetName: targetName ?? 'everyone',
    streakCount: Math.abs(streakCount),
  };

  const template = selectTemplate('gamblingStreak', 'pleased', context, variables);
  if (template) {
    messages.push(createChatMessage(speakerSlug, template, 'pleased', variables, context));
    moodChanges.push({ npcSlug: speakerSlug, newMood: 'pleased', newIntensity: 80 });
  }

  return { messages, moodChanges };
};

/**
 * Handle streak broken
 */
const handleStreakBroken: GamblingEventHandler = (context) => {
  const messages: CeeloChatMessage[] = [];
  const moodChanges: Array<{ npcSlug: string; newMood: MoodType; newIntensity: number }> = [];

  const { event, speakerSlug, speakerName, targetSlug, targetName } = context;
  const previousStreak = event.data['previousStreak'] as number ?? 0;

  const variables: Record<string, string | number> = {
    speakerName,
    targetName: targetName ?? 'someone',
    streakCount: previousStreak,
  };

  // The person whose streak was broken
  const mood: MoodType = previousStreak >= 5 ? 'sad' : 'angry';
  const template = selectTemplate('gamblingStreak', mood, context, variables);
  if (template) {
    messages.push(createChatMessage(speakerSlug, template, mood, variables, context));
    moodChanges.push({ npcSlug: speakerSlug, newMood: mood, newIntensity: 85 });
  }

  return { messages, moodChanges };
};

/**
 * Handle bad beat
 */
const handleBadBeat: GamblingEventHandler = (context) => {
  const messages: CeeloChatMessage[] = [];
  const moodChanges: Array<{ npcSlug: string; newMood: MoodType; newIntensity: number }> = [];

  const { event, speakerSlug, speakerName, targetName } = context;

  const variables: Record<string, string | number> = {
    speakerName,
    targetName: targetName ?? 'them',
    myRoll: event.data['loserRoll'] as string ?? 'a good roll',
    theirRoll: event.data['winnerRoll'] as string ?? 'a better roll',
  };

  const template = selectTemplate('gamblingFrustration', 'angry', context, variables);
  if (template) {
    messages.push(createChatMessage(speakerSlug, template, 'angry', variables, context));
    moodChanges.push({ npcSlug: speakerSlug, newMood: 'angry', newIntensity: 90 });
  }

  return { messages, moodChanges };
};

/**
 * Handle player quit
 */
const handlePlayerQuit: GamblingEventHandler = (context) => {
  const messages: CeeloChatMessage[] = [];
  const moodChanges: Array<{ npcSlug: string; newMood: MoodType; newIntensity: number }> = [];

  const { speakerSlug, speakerName, speakerMood } = context;

  const variables: Record<string, string | number> = {
    speakerName,
  };

  const mood: MoodType = speakerMood === 'sad' ? 'sad' : 'angry';
  const template = selectTemplate('gamblingQuit', mood, context, variables);
  if (template) {
    messages.push(createChatMessage(speakerSlug, template, mood, variables, context));
  }

  return { messages, moodChanges };
};

/**
 * Handle player returned
 */
const handlePlayerReturned: GamblingEventHandler = (context) => {
  const messages: CeeloChatMessage[] = [];
  const moodChanges: Array<{ npcSlug: string; newMood: MoodType; newIntensity: number }> = [];

  const { speakerSlug, speakerName } = context;

  const variables: Record<string, string | number> = {
    speakerName,
  };

  const template = selectTemplate('gamblingReturn', 'neutral', context, variables);
  if (template) {
    messages.push(createChatMessage(speakerSlug, template, 'neutral', variables, context));
    moodChanges.push({ npcSlug: speakerSlug, newMood: 'neutral', newIntensity: 50 });
  }

  return { messages, moodChanges };
};

/**
 * Handle match started (trash talk opportunity)
 */
const handleMatchStarted: GamblingEventHandler = (context) => {
  const messages: CeeloChatMessage[] = [];
  const moodChanges: Array<{ npcSlug: string; newMood: MoodType; newIntensity: number }> = [];

  // 40% chance to trash talk at match start
  if (context.rng() > 0.4) {
    return { messages, moodChanges };
  }

  const { speakerSlug, speakerName, targetSlug, targetName, rivalryManager } = context;

  // Check for rivalry
  let pool: TemplatePool = 'gamblingTrashTalk';
  if (targetSlug && rivalryManager.shouldUseRivalryTemplate(speakerSlug, targetSlug, context.rng)) {
    pool = 'gamblingRivalry';
  }

  const variables: Record<string, string | number> = {
    speakerName,
    targetName: targetName ?? 'you all',
  };

  const template = selectTemplate(pool, context.speakerMood, context, variables);
  if (template) {
    messages.push(createChatMessage(speakerSlug, template, context.speakerMood, variables, context));
  }

  return { messages, moodChanges };
};

// ============================================
// Event Dispatcher Class
// ============================================

export class GamblingEventDispatcher {
  private handlers: Map<CeeloEventType, GamblingEventHandler>;
  private rivalryManager: RivalryManager;

  constructor(rivalryManager: RivalryManager) {
    this.rivalryManager = rivalryManager;
    this.handlers = new Map();

    // Register default handlers
    this.registerHandler('round_ended', handleRoundEnded);
    this.registerHandler('streak_started', handleStreak);
    this.registerHandler('streak_extended', handleStreak);
    this.registerHandler('streak_broken', handleStreakBroken);
    this.registerHandler('bad_beat', handleBadBeat);
    this.registerHandler('player_quit', handlePlayerQuit);
    this.registerHandler('player_returned', handlePlayerReturned);
    this.registerHandler('match_started', handleMatchStarted);
  }

  /**
   * Register a custom event handler
   */
  registerHandler(eventType: CeeloEventType, handler: GamblingEventHandler): void {
    this.handlers.set(eventType, handler);
  }

  /**
   * Dispatch an event and get responses
   */
  dispatch(context: Omit<EventHandlerContext, 'rivalryManager'>): EventHandlerResult {
    const handler = this.handlers.get(context.event.type);
    if (!handler) {
      return { messages: [], moodChanges: [] };
    }

    return handler({
      ...context,
      rivalryManager: this.rivalryManager,
    });
  }

  /**
   * Process multiple events and combine results
   */
  dispatchMultiple(
    events: CeeloEvent[],
    contextBuilder: (event: CeeloEvent) => Omit<EventHandlerContext, 'rivalryManager' | 'event'>
  ): EventHandlerResult {
    const allMessages: CeeloChatMessage[] = [];
    const allMoodChanges: Array<{ npcSlug: string; newMood: MoodType; newIntensity: number }> = [];

    for (const event of events) {
      const baseContext = contextBuilder(event);
      const result = this.dispatch({ ...baseContext, event });
      allMessages.push(...result.messages);
      allMoodChanges.push(...result.moodChanges);
    }

    return { messages: allMessages, moodChanges: allMoodChanges };
  }
}
