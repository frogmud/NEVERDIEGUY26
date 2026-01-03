/**
 * Behavioral Patterns System
 *
 * Context-aware behavior that makes NPCs feel alive:
 * - Situational states: Combat, trading, idle, fleeing
 * - Reactive behaviors: How NPCs respond to events
 * - Behavioral archetypes: Predefined behavior packages
 * - State machines: Complex behavior sequences
 */

import type { MoodType, NPCCategory, RelationshipStats } from '../core/types';

// ============================================
// Behavioral States
// ============================================

export type BehavioralState =
  | 'idle'           // Default, nothing happening
  | 'alert'          // Something got attention
  | 'engaged'        // In active conversation
  | 'trading'        // Actively trading
  | 'threatened'     // Perceives danger
  | 'aggressive'     // Ready to attack
  | 'fleeing'        // Trying to escape
  | 'guarded'        // Defensive posture
  | 'friendly'       // Open and helpful
  | 'scheming'       // Planning something
  | 'distressed'     // Emotional state
  | 'celebrating'    // Happy event
  | 'mourning'       // Sad event
  | 'suspicious'     // Doesn't trust situation
  | 'cautious';      // Being careful

export interface StateTransition {
  from: BehavioralState | '*';
  to: BehavioralState;
  trigger: StateTrigger;
  priority: number;
  cooldown?: number;  // Turns before can trigger again
}

export type StateTrigger =
  | { type: 'mood_change'; mood: MoodType }
  | { type: 'relationship_threshold'; stat: keyof RelationshipStats; comparison: 'gt' | 'lt'; value: number }
  | { type: 'message_intent'; intent: string }
  | { type: 'npc_present'; slug: string }
  | { type: 'category_present'; category: NPCCategory }
  | { type: 'turn_count'; count: number }
  | { type: 'tension_level'; comparison: 'gt' | 'lt'; value: number }
  | { type: 'random'; chance: number };

// ============================================
// Behavioral Archetypes
// ============================================

export type BehavioralArchetype =
  | 'predator'       // Hunts and threatens
  | 'prey'           // Avoids and flees
  | 'merchant'       // Trade-focused
  | 'guardian'       // Protective
  | 'trickster'      // Unpredictable
  | 'sage'           // Knowledge-keeper
  | 'warrior'        // Combat-ready
  | 'diplomat'       // Peaceful resolver
  | 'opportunist'    // Self-serving
  | 'loyalist';      // Group-focused

export interface ArchetypeDefinition {
  name: BehavioralArchetype;
  preferredStates: BehavioralState[];
  avoidedStates: BehavioralState[];
  stateWeights: Partial<Record<BehavioralState, number>>;
  transitions: StateTransition[];
  moodBiases: Partial<Record<MoodType, number>>;
  responsePoolBiases: Partial<Record<string, number>>;
}

export const ARCHETYPE_DEFINITIONS: Record<BehavioralArchetype, ArchetypeDefinition> = {
  predator: {
    name: 'predator',
    preferredStates: ['aggressive', 'alert', 'scheming'],
    avoidedStates: ['fleeing', 'friendly', 'distressed'],
    stateWeights: { aggressive: 30, alert: 20, engaged: 15 },
    transitions: [
      { from: '*', to: 'aggressive', trigger: { type: 'relationship_threshold', stat: 'respect', comparison: 'lt', value: -30 }, priority: 8 },
      { from: 'idle', to: 'alert', trigger: { type: 'category_present', category: 'travelers' }, priority: 5 },
      { from: 'engaged', to: 'aggressive', trigger: { type: 'message_intent', intent: 'insult' }, priority: 9 },
    ],
    moodBiases: { threatening: 20, annoyed: 10 },
    responsePoolBiases: { threat: 25, hostile: 15 },
  },
  prey: {
    name: 'prey',
    preferredStates: ['fleeing', 'guarded', 'alert'],
    avoidedStates: ['aggressive', 'celebrating'],
    stateWeights: { guarded: 25, fleeing: 20, alert: 20 },
    transitions: [
      { from: '*', to: 'fleeing', trigger: { type: 'category_present', category: 'pantheon' }, priority: 9 },
      { from: 'idle', to: 'guarded', trigger: { type: 'tension_level', comparison: 'gt', value: 0.4 }, priority: 6 },
      { from: 'guarded', to: 'fleeing', trigger: { type: 'mood_change', mood: 'threatening' }, priority: 8 },
    ],
    moodBiases: { fearful: 25, curious: 10 },
    responsePoolBiases: { nervous: 20, escape: 15 },
  },
  merchant: {
    name: 'merchant',
    preferredStates: ['trading', 'friendly', 'engaged'],
    avoidedStates: ['fleeing', 'aggressive', 'distressed'],
    stateWeights: { trading: 35, friendly: 20, engaged: 20 },
    transitions: [
      { from: 'idle', to: 'trading', trigger: { type: 'message_intent', intent: 'trade' }, priority: 8 },
      { from: 'engaged', to: 'trading', trigger: { type: 'message_intent', intent: 'trade' }, priority: 7 },
      { from: 'trading', to: 'friendly', trigger: { type: 'relationship_threshold', stat: 'trust', comparison: 'gt', value: 30 }, priority: 5 },
    ],
    moodBiases: { generous: 15, pleased: 10, curious: 10 },
    responsePoolBiases: { trade: 30, merchant: 20 },
  },
  guardian: {
    name: 'guardian',
    preferredStates: ['guarded', 'alert', 'aggressive'],
    avoidedStates: ['fleeing', 'trading', 'scheming'],
    stateWeights: { guarded: 30, alert: 25, aggressive: 15 },
    transitions: [
      { from: '*', to: 'aggressive', trigger: { type: 'message_intent', intent: 'threat' }, priority: 9 },
      { from: 'idle', to: 'alert', trigger: { type: 'turn_count', count: 3 }, priority: 3 },
      { from: 'guarded', to: 'friendly', trigger: { type: 'relationship_threshold', stat: 'trust', comparison: 'gt', value: 50 }, priority: 6 },
    ],
    moodBiases: { annoyed: 10, threatening: 15 },
    responsePoolBiases: { protect: 25, warning: 20 },
  },
  trickster: {
    name: 'trickster',
    preferredStates: ['scheming', 'engaged', 'celebrating'],
    avoidedStates: ['mourning', 'guarded'],
    stateWeights: { scheming: 25, engaged: 20, celebrating: 15 },
    transitions: [
      { from: '*', to: 'scheming', trigger: { type: 'random', chance: 0.15 }, priority: 4 },
      { from: 'engaged', to: 'celebrating', trigger: { type: 'mood_change', mood: 'amused' }, priority: 6 },
      { from: 'threatened', to: 'scheming', trigger: { type: 'turn_count', count: 2 }, priority: 7 },
    ],
    moodBiases: { amused: 20, cryptic: 15 },
    responsePoolBiases: { joke: 25, trick: 20 },
  },
  sage: {
    name: 'sage',
    preferredStates: ['engaged', 'idle', 'guarded'],
    avoidedStates: ['aggressive', 'fleeing', 'celebrating'],
    stateWeights: { engaged: 30, idle: 20, guarded: 15 },
    transitions: [
      { from: 'idle', to: 'engaged', trigger: { type: 'message_intent', intent: 'question' }, priority: 8 },
      { from: 'engaged', to: 'guarded', trigger: { type: 'message_intent', intent: 'secret' }, priority: 6 },
    ],
    moodBiases: { cryptic: 25, curious: 15 },
    responsePoolBiases: { lore: 30, wisdom: 25 },
  },
  warrior: {
    name: 'warrior',
    preferredStates: ['alert', 'aggressive', 'guarded'],
    avoidedStates: ['fleeing', 'trading', 'scheming'],
    stateWeights: { alert: 25, aggressive: 25, guarded: 20 },
    transitions: [
      { from: '*', to: 'aggressive', trigger: { type: 'message_intent', intent: 'challenge' }, priority: 9 },
      { from: 'idle', to: 'alert', trigger: { type: 'tension_level', comparison: 'gt', value: 0.3 }, priority: 5 },
      { from: 'aggressive', to: 'guarded', trigger: { type: 'relationship_threshold', stat: 'respect', comparison: 'gt', value: 40 }, priority: 6 },
    ],
    moodBiases: { threatening: 15, annoyed: 10 },
    responsePoolBiases: { combat: 25, challenge: 20 },
  },
  diplomat: {
    name: 'diplomat',
    preferredStates: ['friendly', 'engaged', 'trading'],
    avoidedStates: ['aggressive', 'fleeing', 'threatened'],
    stateWeights: { friendly: 30, engaged: 25, trading: 15 },
    transitions: [
      { from: 'aggressive', to: 'engaged', trigger: { type: 'message_intent', intent: 'peace' }, priority: 8 },
      { from: 'threatened', to: 'engaged', trigger: { type: 'turn_count', count: 2 }, priority: 6 },
      { from: 'engaged', to: 'friendly', trigger: { type: 'relationship_threshold', stat: 'familiarity', comparison: 'gt', value: 30 }, priority: 5 },
    ],
    moodBiases: { pleased: 20, generous: 15, neutral: 10 },
    responsePoolBiases: { peace: 25, negotiate: 20 },
  },
  opportunist: {
    name: 'opportunist',
    preferredStates: ['scheming', 'trading', 'alert'],
    avoidedStates: ['mourning', 'distressed'],
    stateWeights: { scheming: 25, trading: 20, alert: 20 },
    transitions: [
      { from: '*', to: 'trading', trigger: { type: 'message_intent', intent: 'trade' }, priority: 9 },
      { from: 'engaged', to: 'scheming', trigger: { type: 'relationship_threshold', stat: 'debt', comparison: 'gt', value: 20 }, priority: 6 },
      { from: 'threatened', to: 'fleeing', trigger: { type: 'tension_level', comparison: 'gt', value: 0.7 }, priority: 8 },
    ],
    moodBiases: { curious: 15, amused: 10 },
    responsePoolBiases: { deal: 25, self_interest: 20 },
  },
  loyalist: {
    name: 'loyalist',
    preferredStates: ['friendly', 'guarded', 'engaged'],
    avoidedStates: ['scheming', 'fleeing'],
    stateWeights: { friendly: 30, guarded: 20, engaged: 20 },
    transitions: [
      { from: '*', to: 'aggressive', trigger: { type: 'message_intent', intent: 'betray' }, priority: 10 },
      { from: 'idle', to: 'friendly', trigger: { type: 'relationship_threshold', stat: 'trust', comparison: 'gt', value: 40 }, priority: 6 },
      { from: 'engaged', to: 'guarded', trigger: { type: 'npc_present', slug: 'the-one' }, priority: 7 },
    ],
    moodBiases: { pleased: 15, generous: 10 },
    responsePoolBiases: { ally: 25, protect: 20 },
  },
};

// ============================================
// State Machine
// ============================================

export interface NPCBehaviorState {
  current: BehavioralState;
  previous: BehavioralState | null;
  archetype: BehavioralArchetype;
  stateEnteredAt: number;
  transitionCooldowns: Record<string, number>;
  behaviorHistory: Array<{ state: BehavioralState; turn: number }>;
  turnsInState?: number;
  history?: BehavioralState[];
}

export function createBehaviorState(archetype: BehavioralArchetype): NPCBehaviorState {
  return {
    current: 'idle',
    previous: null,
    archetype,
    stateEnteredAt: 0,
    transitionCooldowns: {},
    behaviorHistory: [{ state: 'idle', turn: 0 }],
    turnsInState: 0,
    history: [],
  };
}

export function evaluateTransition(
  state: NPCBehaviorState,
  context: TransitionContext,
  rng: () => number
): BehavioralState | null {
  const archetype = ARCHETYPE_DEFINITIONS[state.archetype];
  const validTransitions: Array<{ to: BehavioralState; priority: number }> = [];

  for (const transition of archetype.transitions) {
    // Check "from" state
    if (transition.from !== '*' && transition.from !== state.current) {
      continue;
    }

    // Check cooldown
    const cooldownKey = `${transition.from}-${transition.to}`;
    if (state.transitionCooldowns[cooldownKey] &&
        state.transitionCooldowns[cooldownKey] > context.turnCount) {
      continue;
    }

    // Check trigger condition
    if (checkTrigger(transition.trigger, context, rng)) {
      validTransitions.push({ to: transition.to, priority: transition.priority });
    }
  }

  if (validTransitions.length === 0) return null;

  // Sort by priority and return highest
  validTransitions.sort((a, b) => b.priority - a.priority);
  return validTransitions[0].to;
}

export interface TransitionContext {
  turnCount: number;
  currentMood: MoodType;
  relationship: RelationshipStats;
  messageIntent: string | null;
  presentNPCs: string[];
  presentCategories: NPCCategory[];
  tension: number;
}

function checkTrigger(
  trigger: StateTrigger,
  context: TransitionContext,
  rng: () => number
): boolean {
  switch (trigger.type) {
    case 'mood_change':
      return context.currentMood === trigger.mood;

    case 'relationship_threshold':
      const statValue = context.relationship[trigger.stat];
      return trigger.comparison === 'gt'
        ? statValue > trigger.value
        : statValue < trigger.value;

    case 'message_intent':
      return context.messageIntent === trigger.intent;

    case 'npc_present':
      return context.presentNPCs.includes(trigger.slug);

    case 'category_present':
      return context.presentCategories.includes(trigger.category);

    case 'turn_count':
      return context.turnCount >= trigger.count;

    case 'tension_level':
      return trigger.comparison === 'gt'
        ? context.tension > trigger.value
        : context.tension < trigger.value;

    case 'random':
      return rng() < trigger.chance;
  }
}

export function transitionState(
  state: NPCBehaviorState,
  newState: BehavioralState,
  turnCount: number,
  cooldown?: number
): NPCBehaviorState {
  const cooldownKey = `${state.current}-${newState}`;

  return {
    ...state,
    current: newState,
    previous: state.current,
    stateEnteredAt: turnCount,
    transitionCooldowns: {
      ...state.transitionCooldowns,
      [cooldownKey]: cooldown ? turnCount + cooldown : 0,
    },
    behaviorHistory: [
      ...state.behaviorHistory.slice(-10),
      { state: newState, turn: turnCount },
    ],
    turnsInState: 0,
  };
}

// ============================================
// State-based Modifiers
// ============================================

export interface StateModifiers {
  moodBias: Partial<Record<MoodType, number>>;
  responseBias: Partial<Record<string, number>>;
  sociabilityMod: number;
  aggressionMod: number;
  trustMod: number;
}

export const STATE_MODIFIERS: Record<BehavioralState, StateModifiers> = {
  idle: {
    moodBias: {},
    responseBias: {},
    sociabilityMod: 0,
    aggressionMod: 0,
    trustMod: 0,
  },
  alert: {
    moodBias: { curious: 10 },
    responseBias: { observe: 15 },
    sociabilityMod: 0.1,
    aggressionMod: 0.1,
    trustMod: -0.1,
  },
  engaged: {
    moodBias: { pleased: 5, curious: 5 },
    responseBias: { conversation: 20 },
    sociabilityMod: 0.2,
    aggressionMod: 0,
    trustMod: 0.1,
  },
  trading: {
    moodBias: { curious: 10, generous: 5 },
    responseBias: { trade: 30, merchant: 20 },
    sociabilityMod: 0.3,
    aggressionMod: -0.2,
    trustMod: 0.1,
  },
  threatened: {
    moodBias: { fearful: 15, annoyed: 10 },
    responseBias: { defensive: 25 },
    sociabilityMod: -0.2,
    aggressionMod: 0.2,
    trustMod: -0.3,
  },
  aggressive: {
    moodBias: { threatening: 25, annoyed: 15 },
    responseBias: { threat: 30, hostile: 20 },
    sociabilityMod: -0.4,
    aggressionMod: 0.5,
    trustMod: -0.4,
  },
  fleeing: {
    moodBias: { fearful: 30 },
    responseBias: { escape: 30, panic: 20 },
    sociabilityMod: -0.5,
    aggressionMod: -0.3,
    trustMod: -0.2,
  },
  guarded: {
    moodBias: { annoyed: 5, neutral: 10 },
    responseBias: { cautious: 20 },
    sociabilityMod: -0.1,
    aggressionMod: 0.1,
    trustMod: -0.2,
  },
  friendly: {
    moodBias: { pleased: 15, generous: 10 },
    responseBias: { friendly: 25, helpful: 15 },
    sociabilityMod: 0.4,
    aggressionMod: -0.3,
    trustMod: 0.3,
  },
  scheming: {
    moodBias: { cryptic: 15, amused: 5 },
    responseBias: { cryptic: 20, scheme: 15 },
    sociabilityMod: 0.1,
    aggressionMod: 0.1,
    trustMod: -0.2,
  },
  distressed: {
    moodBias: { fearful: 10, annoyed: 10 },
    responseBias: { emotional: 25 },
    sociabilityMod: -0.2,
    aggressionMod: -0.1,
    trustMod: 0.1,
  },
  celebrating: {
    moodBias: { pleased: 20, amused: 15, generous: 10 },
    responseBias: { happy: 25, celebratory: 20 },
    sociabilityMod: 0.5,
    aggressionMod: -0.4,
    trustMod: 0.2,
  },
  mourning: {
    moodBias: { fearful: 5 },
    responseBias: { sad: 25, reflective: 15 },
    sociabilityMod: -0.3,
    aggressionMod: -0.2,
    trustMod: 0,
  },
  suspicious: {
    moodBias: { annoyed: 10, curious: 5 },
    responseBias: { suspicious: 25, questioning: 15 },
    sociabilityMod: -0.1,
    aggressionMod: 0.1,
    trustMod: -0.4,
  },
  cautious: {
    moodBias: { curious: 5 },
    responseBias: { careful: 20, hint: 15 },
    sociabilityMod: -0.1,
    aggressionMod: -0.1,
    trustMod: -0.2,
  },
};

export function getStateModifiers(state: BehavioralState): StateModifiers {
  return STATE_MODIFIERS[state];
}

// ============================================
// Behavioral Events
// ============================================

export type BehavioralEvent =
  | { type: 'player_joined' }
  | { type: 'player_left' }
  | { type: 'npc_died'; slug: string }
  | { type: 'trade_complete'; success: boolean }
  | { type: 'threat_made'; by: string }
  | { type: 'secret_revealed'; knowledge: string }
  | { type: 'alliance_formed'; with: string }
  | { type: 'betrayal'; by: string }
  | { type: 'gift_given'; from: string }
  | { type: 'insult_received'; from: string };

export interface EventReaction {
  stateChange?: BehavioralState;
  moodChange?: MoodType;
  intensityChange?: number;
  responsePool?: string;
  relationshipChanges?: Array<{ slug: string; stat: keyof RelationshipStats; change: number }>;
}

export function reactToEvent(
  state: NPCBehaviorState,
  event: BehavioralEvent,
  archetype: BehavioralArchetype
): EventReaction {
  const archetypeDef = ARCHETYPE_DEFINITIONS[archetype];
  const reaction: EventReaction = {};

  switch (event.type) {
    case 'player_joined':
      if (archetypeDef.preferredStates.includes('friendly')) {
        reaction.stateChange = 'engaged';
        reaction.moodChange = 'curious';
      } else if (archetypeDef.preferredStates.includes('aggressive')) {
        reaction.stateChange = 'alert';
      }
      break;

    case 'npc_died':
      if (archetypeDef.avoidedStates.includes('fleeing')) {
        reaction.stateChange = 'guarded';
      } else {
        reaction.stateChange = 'fleeing';
        reaction.moodChange = 'fearful';
      }
      break;

    case 'trade_complete':
      if (event.success) {
        reaction.moodChange = 'pleased';
        reaction.stateChange = 'friendly';
      } else {
        reaction.moodChange = 'annoyed';
      }
      break;

    case 'threat_made':
      if (archetype === 'predator' || archetype === 'warrior') {
        reaction.stateChange = 'aggressive';
        reaction.moodChange = 'threatening';
      } else if (archetype === 'prey' || archetype === 'diplomat') {
        reaction.stateChange = 'threatened';
        reaction.moodChange = 'fearful';
      }
      break;

    case 'secret_revealed':
      reaction.stateChange = 'alert';
      reaction.moodChange = 'curious';
      reaction.responsePool = 'react_secret';
      break;

    case 'betrayal':
      reaction.stateChange = 'aggressive';
      reaction.moodChange = 'threatening';
      reaction.intensityChange = 30;
      reaction.relationshipChanges = [
        { slug: event.by, stat: 'trust', change: -50 },
        { slug: event.by, stat: 'respect', change: -30 },
      ];
      break;

    case 'gift_given':
      reaction.moodChange = 'pleased';
      reaction.intensityChange = 15;
      reaction.relationshipChanges = [
        { slug: event.from, stat: 'trust', change: 10 },
        { slug: event.from, stat: 'debt', change: 5 },
      ];
      break;

    case 'insult_received':
      if (archetypeDef.preferredStates.includes('aggressive')) {
        reaction.stateChange = 'aggressive';
        reaction.moodChange = 'threatening';
      } else {
        reaction.moodChange = 'annoyed';
      }
      reaction.relationshipChanges = [
        { slug: event.from, stat: 'respect', change: -15 },
      ];
      break;
  }

  return reaction;
}

// ============================================
// Behavioral Summary for Context
// ============================================

export interface BehaviorSummary {
  currentState: BehavioralState;
  archetype: BehavioralArchetype;
  turnsInState: number;
  recentStates: BehavioralState[];
  modifiers: StateModifiers;
  isStable: boolean;  // Has been in same state for 3+ turns
}

export function summarizeBehavior(
  state: NPCBehaviorState,
  currentTurn: number
): BehaviorSummary {
  const turnsInState = currentTurn - state.stateEnteredAt;
  const recentStates = state.behaviorHistory.slice(-5).map(h => h.state);

  return {
    currentState: state.current,
    archetype: state.archetype,
    turnsInState,
    recentStates,
    modifiers: getStateModifiers(state.current),
    isStable: turnsInState >= 3,
  };
}
