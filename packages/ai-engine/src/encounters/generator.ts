/**
 * Encounter Generator
 *
 * Generates enemy encounters using seeded RNG for reproducibility.
 * Same seed + encounter index = same encounter every time.
 */

import { createSeededRng, type SeededRng } from '../core/seeded-rng';
import type {
  EnemyEncounter,
  EncounterType,
  EncounterContext,
  EncounterOption,
  EncounterEffect,
  EnemyType,
  DieRectorSlug,
  EncounterTrigger,
} from './types';
import {
  DOMAIN_CONFIG,
  DIE_RECTOR_META,
  ENEMY_META,
  getDieRectorForDomain,
  pickEnemyForDomain,
  getDieRectorColor,
  getFilterIntensity,
  getTrinityMembers,
} from './domain-mapping';

// ============================================
// Voice Filtering
// ============================================

/**
 * Apply voice filter to make Die-rector speech sound like it's
 * coming through an enemy vessel. Higher intensity = more garbled.
 */
function applyVoiceFilter(text: string, intensity: number, rng: SeededRng): string {
  if (intensity < 0.2) return text; // Strong channel - minimal filter

  // Break into words
  const words = text.split(' ');
  const filtered: string[] = [];

  for (const word of words) {
    const roll = rng.random('filter');

    if (intensity > 0.7 && roll < 0.15) {
      // High intensity: occasionally drop words entirely
      filtered.push('...');
    } else if (intensity > 0.5 && roll < 0.1) {
      // Medium intensity: fragment words
      const fragment = word.slice(0, Math.ceil(word.length * 0.6));
      filtered.push(fragment + '-');
    } else if (intensity > 0.4 && roll < 0.08) {
      // Insert static
      filtered.push(word);
      filtered.push('*static*');
    } else {
      filtered.push(word);
    }
  }

  // Add occasional ellipses for hesitation
  let result = filtered.join(' ');
  if (intensity > 0.5 && rng.random('hesitation') < 0.3) {
    const insertPoint = Math.floor(result.length * (0.3 + rng.random('insert') * 0.4));
    result = result.slice(0, insertPoint) + '... ' + result.slice(insertPoint);
  }

  return result;
}

// ============================================
// Encounter Type Selection
// ============================================

interface EncounterTypeWeights {
  demand: number;
  observation: number;
  offer: number;
  test: number;
}

function getEncounterTypeWeights(ctx: EncounterContext): EncounterTypeWeights {
  const base: EncounterTypeWeights = {
    demand: 25,
    observation: 35,
    offer: 25,
    test: 15,
  };

  // Low health: more demands and offers (pressure or help)
  if (ctx.playerHealth < 30) {
    base.demand += 10;
    base.offer += 15;
    base.observation -= 15;
  }

  // High corruption: more observations (Die-rectors watching)
  if (ctx.corruption > 60) {
    base.observation += 15;
    base.demand -= 10;
  }

  // Many deaths: more offers (pity) and tests (proving yourself)
  if (ctx.deathCount > 5) {
    base.offer += 10;
    base.test += 10;
    base.observation -= 10;
  }

  // Good run (high grit): more tests (challenge accepted)
  if (ctx.grit > 50) {
    base.test += 15;
    base.demand += 5;
    base.observation -= 15;
  }

  return base;
}

function selectEncounterType(ctx: EncounterContext, rng: SeededRng): EncounterType {
  const weights = getEncounterTypeWeights(ctx);
  const total = weights.demand + weights.observation + weights.offer + weights.test;
  const roll = rng.random('encounter-type') * total;

  let cumulative = 0;
  if (roll < (cumulative += weights.demand)) return 'demand';
  if (roll < (cumulative += weights.observation)) return 'observation';
  if (roll < (cumulative += weights.offer)) return 'offer';
  return 'test';
}

// ============================================
// Trigger Detection
// ============================================

function detectTrigger(ctx: EncounterContext): EncounterTrigger {
  if (ctx.playerHealth < 25) return 'low_health';
  if (ctx.corruption > 70) return 'high_corruption';
  if (ctx.deathCount > 7) return 'many_deaths';
  if (ctx.grit > 60 && ctx.deathCount === 0) return 'good_run';
  return 'random';
}

// ============================================
// Die-Rector Selection
// ============================================

function selectDieRector(
  domain: number,
  corruption: number,
  rng: SeededRng
): DieRectorSlug {
  // Base case: domain's Die-rector
  const domainDieRector = getDieRectorForDomain(domain);

  // High corruption: chance for Trinity member to intrude
  if (corruption > 50) {
    const trinityChance = (corruption - 50) / 100; // 0-50% at 50-100 corruption
    if (rng.random('trinity-check') < trinityChance) {
      const trinity = getTrinityMembers();
      return rng.randomChoice(trinity, 'trinity-select') ?? trinity[0];
    }
  }

  return domainDieRector;
}

// ============================================
// Option Generation
// ============================================

function generateDemandOptions(
  dieRector: DieRectorSlug,
  ctx: EncounterContext
): EncounterOption[] {
  return [
    {
      id: 'comply',
      label: 'COMPLY',
      shortText: 'Give in',
      effects: [
        { type: 'favor', target: dieRector, value: 2, description: `+2 favor with ${DIE_RECTOR_META[dieRector].name}` },
        { type: 'grit', value: -5, description: '-5 grit' },
      ],
    },
    {
      id: 'defy',
      label: 'DEFY',
      shortText: 'Refuse',
      effects: [
        { type: 'favor', target: dieRector, value: -3, description: `-3 favor with ${DIE_RECTOR_META[dieRector].name}` },
        { type: 'grit', value: 8, description: '+8 grit' },
      ],
    },
    {
      id: 'skip',
      label: 'SKIP',
      shortText: '...',
      isDefault: true,
      effects: [
        { type: 'favor', target: dieRector, value: -1, description: 'Ignored' },
      ],
    },
  ];
}

function generateObservationOptions(
  dieRector: DieRectorSlug,
  _ctx: EncounterContext
): EncounterOption[] {
  return [
    {
      id: 'acknowledge',
      label: 'ACKNOWLEDGE',
      shortText: 'Nod',
      effects: [
        { type: 'favor', target: dieRector, value: 1, description: '+1 favor' },
      ],
    },
    {
      id: 'ignore',
      label: 'IGNORE',
      shortText: '...',
      isDefault: true,
      effects: [], // Observations are low-stakes
    },
  ];
}

function generateOfferOptions(
  dieRector: DieRectorSlug,
  ctx: EncounterContext
): EncounterOption[] {
  // Offer magnitude scales with desperation
  const magnitude = ctx.playerHealth < 30 || ctx.deathCount > 5 ? 'major' : 'minor';

  if (magnitude === 'major') {
    return [
      {
        id: 'accept',
        label: 'ACCEPT',
        shortText: 'Take deal',
        effects: [
          { type: 'resource', target: 'health', value: 25, description: '+25 health' },
          { type: 'corruption', value: 15, description: '+15 corruption' },
          { type: 'favor', target: dieRector, value: 3, description: '+3 favor (debt)' },
        ],
      },
      {
        id: 'decline',
        label: 'DECLINE',
        shortText: 'Refuse',
        effects: [
          { type: 'grit', value: 5, description: '+5 grit (integrity)' },
          { type: 'favor', target: dieRector, value: -1, description: '-1 favor' },
        ],
      },
      {
        id: 'skip',
        label: 'SKIP',
        shortText: '...',
        isDefault: true,
        effects: [],
      },
    ];
  }

  return [
    {
      id: 'accept',
      label: 'ACCEPT',
      shortText: 'Take it',
      effects: [
        { type: 'buff', value: 10, duration: 3, description: '+10% damage for 3 events' },
        { type: 'corruption', value: 5, description: '+5 corruption' },
      ],
    },
    {
      id: 'decline',
      label: 'DECLINE',
      shortText: 'No thanks',
      effects: [],
    },
    {
      id: 'skip',
      label: 'SKIP',
      shortText: '...',
      isDefault: true,
      effects: [],
    },
  ];
}

function generateTestOptions(
  dieRector: DieRectorSlug,
  _ctx: EncounterContext
): EncounterOption[] {
  return [
    {
      id: 'attempt',
      label: 'ATTEMPT',
      shortText: 'Try it',
      requiresRoll: true,
      successEffects: [
        { type: 'favor', target: dieRector, value: 4, description: '+4 favor (impressed)' },
        { type: 'grit', value: 10, description: '+10 grit' },
        { type: 'hint', value: 1, description: 'Hint unlocked' },
      ],
      failEffects: [
        { type: 'favor', target: dieRector, value: -2, description: '-2 favor (disappointed)' },
        { type: 'grit', value: -3, description: '-3 grit' },
      ],
      effects: [], // Placeholder, actual effects determined by roll
    },
    {
      id: 'decline',
      label: 'DECLINE',
      shortText: 'Not worth it',
      effects: [
        { type: 'favor', target: dieRector, value: -1, description: '-1 favor (coward)' },
      ],
    },
    {
      id: 'skip',
      label: 'SKIP',
      shortText: '...',
      isDefault: true,
      effects: [
        { type: 'favor', target: dieRector, value: -1, description: 'Ignored' },
      ],
    },
  ];
}

function generateOptions(
  type: EncounterType,
  dieRector: DieRectorSlug,
  ctx: EncounterContext
): EncounterOption[] {
  switch (type) {
    case 'demand':
      return generateDemandOptions(dieRector, ctx);
    case 'observation':
      return generateObservationOptions(dieRector, ctx);
    case 'offer':
      return generateOfferOptions(dieRector, ctx);
    case 'test':
      return generateTestOptions(dieRector, ctx);
  }
}

// ============================================
// Placeholder Dialogue (will be replaced by pools)
// ============================================

const PLACEHOLDER_DIALOGUE: Record<EncounterType, Record<DieRectorSlug, string[]>> = {
  demand: {
    'the-one': ['The void demands tribute.', 'Surrender something. Anything. The void is hungry.'],
    'john': ['The earth requires stability. Prove your worth.', 'You disturb the foundations. Compensate.'],
    'peter': ['The gate must be fed.', 'Passage is not free. Pay the toll.'],
    'robert': ['Feed the flames.', 'The fire hungers. As do I.'],
    'alice': ['The cold demands stillness.', 'Warmth is a privilege. Earn it.'],
    'jane': ['Change is required.', 'Mutate or be mutated. Choose.'],
    'rhea': ['Entropy claims all. Why resist?', 'The ending is inevitable. Hasten it.'],
    'king-james': ['I have watched. I have judged. Pay.', 'The paranoia sees all debts.'],
    'zero-chance': ['NOTHING DEMANDS NOTHING. BECOME NOTHING.', 'ZERO APPROACHES. ZERO COLLECTS.'],
  },
  observation: {
    'the-one': ['I see you. The void sees you.', 'Interesting. You persist.'],
    'john': ['The foundations note your passage.', 'Stable. For now.'],
    'peter': ['The gate watches. Always.', 'Your shadow precedes you.'],
    'robert': ['Your flame burns... adequately.', 'The fire remembers your heat.'],
    'alice': ['Cold suits you.', 'The frost has noticed you.'],
    'jane': ['You change. Slowly. But you change.', 'Mutation is inevitable. Yours progresses.'],
    'rhea': ['I saw this moment. I see all moments.', 'You are exactly where I expected.'],
    'king-james': ['I have been watching. I am always watching.', 'Your fear is noted. Catalogued.'],
    'zero-chance': ['ZERO OBSERVES. ZERO WAITS.', 'YOU EXIST. TEMPORARILY.'],
  },
  offer: {
    'the-one': ['The void offers... perspective.', 'Would you like to see nothing? It helps.'],
    'john': ['The earth offers stability. At a cost.', 'Roots require depth. I can provide depth.'],
    'peter': ['A shortcut. The gate permits... occasionally.', 'Shadows can carry. For a price.'],
    'robert': ['Power. Heat. Destruction. Interested?', 'I could make you burn brighter.'],
    'alice': ['Clarity. The cold brings clarity.', 'I can freeze your pain. Temporarily.'],
    'jane': ['Evolution is available. Upgrades exist.', 'I could make you... more.'],
    'rhea': ['I can show you the ending. It brings peace.', 'Accept inevitability. I can help.'],
    'king-james': ['I know things. I could share. For a price.', 'Information is power. I have both.'],
    'zero-chance': ['NOTHING IS OFFERED. NOTHING IS PEACEFUL.', 'BECOME ZERO. ZERO FEELS NOTHING.'],
  },
  test: {
    'the-one': ['Prove your existence has meaning.', 'Can you be more than nothing? Show me.'],
    'john': ['The foundations test all who pass.', 'Stability must be earned. Demonstrate.'],
    'peter': ['The gate judges worthiness.', 'Show me you deserve passage.'],
    'robert': ['Prove your flame is worthy.', 'Burn for me. Prove you can.'],
    'alice': ['Endure the cold. If you can.', 'The frost tests all. Your turn.'],
    'jane': ['Adapt. Now. I want to see.', 'Mutation is survival. Prove you can survive.'],
    'rhea': ['Defy inevitability. If you dare.', 'Can you resist the end? Show me.'],
    'king-james': ['I know your fears. Face them.', 'The paranoid always test. Your turn.'],
    'zero-chance': ['RESIST NOTHING. IF YOU CAN.', 'PROVE YOU ARE NOT ALREADY ZERO.'],
  },
};

function getPlaceholderDialogue(
  type: EncounterType,
  dieRector: DieRectorSlug,
  rng: SeededRng
): string {
  const pool = PLACEHOLDER_DIALOGUE[type][dieRector] ?? PLACEHOLDER_DIALOGUE[type]['the-one'];
  return rng.randomChoice(pool, 'dialogue') ?? pool[0];
}

// ============================================
// Main Generator
// ============================================

export interface GeneratorOptions {
  forceType?: EncounterType;
  forceDieRector?: DieRectorSlug;
  forceEnemy?: EnemyType;
}

/**
 * Generate an encounter for the current game state
 */
export function generateEncounter(
  ctx: EncounterContext,
  options: GeneratorOptions = {}
): EnemyEncounter {
  // Create seeded RNG from run seed + encounter index
  const encounterSeed = `${ctx.runSeed}-encounter-${ctx.encounterIndex}`;
  const rng = createSeededRng(encounterSeed);

  // Select encounter type
  const type = options.forceType ?? selectEncounterType(ctx, rng);

  // Select Die-rector (may be Trinity member at high corruption)
  const dieRector = options.forceDieRector ?? selectDieRector(ctx.currentDomain, ctx.corruption, rng);

  // Select enemy type
  const enemy = options.forceEnemy ?? pickEnemyForDomain(ctx.currentDomain, () => rng.random('enemy'));

  // Get base dialogue
  const originalDialogue = getPlaceholderDialogue(type, dieRector, rng);

  // Apply voice filter based on enemy channel strength
  const filterIntensity = getFilterIntensity(enemy);
  const filteredDialogue = applyVoiceFilter(originalDialogue, filterIntensity, rng);

  // Generate options
  const encounterOptions = generateOptions(type, dieRector, ctx);

  // Detect trigger
  const trigger = detectTrigger(ctx);

  // Get Die-rector color
  const dieRectorColor = getDieRectorColor(dieRector);

  // Build encounter
  const encounter: EnemyEncounter = {
    id: `enc-${ctx.runSeed}-${ctx.encounterIndex}`,
    type,
    enemy,
    channeling: dieRector,
    dialogue: filteredDialogue,
    originalDialogue,
    options: encounterOptions,
    autoSkipDelay: 2500,
    trigger,
    dieRectorColor,
    voiceFilter: DOMAIN_CONFIG[ctx.currentDomain]?.voiceFilter ?? 'void',
  };

  return encounter;
}

/**
 * Generate a sequence of encounters for a run preview
 * (Used for debugging/testing seeded generation)
 */
export function generateEncounterSequence(
  runSeed: string,
  count: number,
  baseContext: Partial<EncounterContext> = {}
): EnemyEncounter[] {
  const encounters: EnemyEncounter[] = [];

  for (let i = 0; i < count; i++) {
    const ctx: EncounterContext = {
      runSeed,
      encounterIndex: i,
      currentDomain: Math.floor(i / 3) % 6 + 1,
      playerHealth: baseContext.playerHealth ?? 100,
      corruption: baseContext.corruption ?? 0,
      deathCount: baseContext.deathCount ?? 0,
      grit: baseContext.grit ?? 0,
      favorStates: baseContext.favorStates ?? {},
      ignoredCounts: baseContext.ignoredCounts ?? {},
    };

    encounters.push(generateEncounter(ctx));
  }

  return encounters;
}

/**
 * Verify seeded generation produces identical results
 */
export function verifySeededGeneration(runSeed: string): boolean {
  const seq1 = generateEncounterSequence(runSeed, 5);
  const seq2 = generateEncounterSequence(runSeed, 5);

  for (let i = 0; i < 5; i++) {
    if (seq1[i].id !== seq2[i].id) return false;
    if (seq1[i].type !== seq2[i].type) return false;
    if (seq1[i].enemy !== seq2[i].enemy) return false;
    if (seq1[i].channeling !== seq2[i].channeling) return false;
    if (seq1[i].dialogue !== seq2[i].dialogue) return false;
  }

  return true;
}
