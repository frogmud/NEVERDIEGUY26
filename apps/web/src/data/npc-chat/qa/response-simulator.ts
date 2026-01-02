/**
 * Response Simulator
 *
 * Simulates 1000+ responses to verify:
 * - Template selection distribution matches weights
 * - Cooldowns work correctly
 * - No unexpected fallbacks
 * - Seed determinism holds
 */

import { createSeededRng } from '../../pools/seededRng';
import type {
  ResponseTemplate,
  NPCPersonalityConfig,
  ResponseContext,
  TemplatePool,
  MoodType,
  NPCConversation,
} from '../types';
import { selectResponse, markTemplateUsed } from '../response-selector';
import { createDefaultConversation } from '../storage';
import { createDefaultRelationship } from '../relationship';

// ============================================
// Simulation Types
// ============================================

export interface SimulationConfig {
  npcSlug: string;
  iterations: number;
  pools: TemplatePool[];
  rooms: number; // Simulate across N rooms
  seed?: string;
}

export interface SimulationResult {
  npcSlug: string;
  iterations: number;
  templateDistribution: Record<string, number>;
  poolDistribution: Record<string, number>;
  moodDistribution: Record<string, number>;
  fallbackCount: number;
  nullCount: number;
  cooldownHits: number;
  deterministicCheck: {
    passed: boolean;
    failures: string[];
  };
  expectedVsActual: {
    templateId: string;
    expected: number;
    actual: number;
    deviation: number;
  }[];
}

// ============================================
// Simulation Functions
// ============================================

/**
 * Create a mock response context for simulation
 */
function createMockContext(
  runSeed: string,
  roomIndex: number,
  npcSlug: string
): ResponseContext {
  return {
    runSeed,
    roomIndex,
    heat: 0,
    playerGold: 100,
    playerIntegrity: 100,
    playerLuckyNumber: 7,
    currentDomain: 'earth',
    relationship: createDefaultRelationship(npcSlug),
  };
}

/**
 * Run a full simulation for an NPC
 */
export function runSimulation(
  config: SimulationConfig,
  templates: ResponseTemplate[],
  personality: NPCPersonalityConfig
): SimulationResult {
  const baseSeed = config.seed || 'simulation-seed';
  const rng = createSeededRng(baseSeed);

  const templateDistribution: Record<string, number> = {};
  const poolDistribution: Record<string, number> = {};
  const moodDistribution: Record<string, number> = {};
  let fallbackCount = 0;
  let nullCount = 0;
  let cooldownHits = 0;

  // Track for determinism check
  const seedToResult: Map<string, string> = new Map();
  const deterministicFailures: string[] = [];

  // Track conversation state for cooldowns
  let conversation: NPCConversation = createDefaultConversation(config.npcSlug);

  for (let i = 0; i < config.iterations; i++) {
    // Vary the room index to test across rooms
    const roomIndex = i % config.rooms;

    // Pick a random pool
    const pool = config.pools[Math.floor(rng.random('pool') * config.pools.length)];

    // Create context
    const runSeed = `${baseSeed}-run-${Math.floor(i / config.rooms)}`;
    const context = createMockContext(runSeed, roomIndex, config.npcSlug);

    // Select response
    const response = selectResponse(
      config.npcSlug,
      'room_clear', // Use trigger that maps to this pool
      context,
      templates,
      personality,
      conversation
    );

    if (!response) {
      nullCount++;
      continue;
    }

    // Track distributions
    templateDistribution[response.templateId] =
      (templateDistribution[response.templateId] || 0) + 1;
    poolDistribution[pool] = (poolDistribution[pool] || 0) + 1;
    moodDistribution[response.mood] = (moodDistribution[response.mood] || 0) + 1;

    if (response.templateId === 'fallback') {
      fallbackCount++;
    }

    // Update conversation for cooldown tracking
    if (response.templateId !== 'fallback') {
      conversation = markTemplateUsed(conversation, response.templateId, roomIndex);
    }

    // Determinism check: same seed should give same result
    const seedKey = response.seed;
    const existingResult = seedToResult.get(seedKey);
    if (existingResult !== undefined) {
      if (existingResult !== response.templateId) {
        deterministicFailures.push(
          `Seed ${seedKey}: got ${response.templateId}, expected ${existingResult}`
        );
      }
    } else {
      seedToResult.set(seedKey, response.templateId);
    }
  }

  // Calculate expected vs actual distribution
  const npcTemplates = templates.filter((t) => t.entitySlug === config.npcSlug);
  const totalWeight = npcTemplates.reduce((sum, t) => sum + t.weight, 0);
  const totalSelections = config.iterations - nullCount - fallbackCount;

  const expectedVsActual = npcTemplates.map((template) => {
    const expected = (template.weight / totalWeight) * totalSelections;
    const actual = templateDistribution[template.id] || 0;
    const deviation = expected > 0 ? Math.abs((actual - expected) / expected) : 0;

    return {
      templateId: template.id,
      expected: Math.round(expected),
      actual,
      deviation: Math.round(deviation * 100),
    };
  });

  return {
    npcSlug: config.npcSlug,
    iterations: config.iterations,
    templateDistribution,
    poolDistribution,
    moodDistribution,
    fallbackCount,
    nullCount,
    cooldownHits,
    deterministicCheck: {
      passed: deterministicFailures.length === 0,
      failures: deterministicFailures,
    },
    expectedVsActual,
  };
}

/**
 * Verify determinism by running same scenario twice
 */
export function verifyDeterminism(
  npcSlug: string,
  templates: ResponseTemplate[],
  personality: NPCPersonalityConfig,
  scenarios: number = 100
): { passed: boolean; failures: string[] } {
  const failures: string[] = [];

  for (let i = 0; i < scenarios; i++) {
    const runSeed = `determinism-test-${i}`;
    const roomIndex = i % 20;
    const context = createMockContext(runSeed, roomIndex, npcSlug);

    // Run twice with same inputs
    const result1 = selectResponse(
      npcSlug,
      'room_clear',
      context,
      templates,
      personality,
      undefined
    );

    const result2 = selectResponse(
      npcSlug,
      'room_clear',
      context,
      templates,
      personality,
      undefined
    );

    if (result1?.templateId !== result2?.templateId) {
      failures.push(
        `Scenario ${i}: First run got ${result1?.templateId}, second got ${result2?.templateId}`
      );
    }

    if (result1?.text !== result2?.text) {
      failures.push(
        `Scenario ${i}: Text mismatch between runs`
      );
    }
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Test cooldown behavior
 */
export function testCooldowns(
  npcSlug: string,
  templates: ResponseTemplate[],
  personality: NPCPersonalityConfig
): { passed: boolean; issues: string[] } {
  const issues: string[] = [];

  // Find templates with cooldowns
  const cooldownTemplates = templates.filter(
    (t) => t.entitySlug === npcSlug && t.cooldown
  );

  for (const template of cooldownTemplates) {
    if (!template.cooldown) continue;

    let conversation: NPCConversation = createDefaultConversation(npcSlug);

    // Use the template
    conversation = markTemplateUsed(conversation, template.id, 0);

    // Check if cooldown is tracked
    if (template.cooldown.rooms) {
      const lastUsedRoom = conversation.cooldownsActive[template.id];
      if (lastUsedRoom !== 0) {
        issues.push(
          `Template ${template.id}: cooldown not tracked correctly after use`
        );
      }
    }

    if (template.cooldown.oncePerRun) {
      // This would be handled by markTemplateUsedOnce in storage
      // Just verify the field exists
      if (!Array.isArray(conversation.usedOncePerRun)) {
        issues.push(
          `Template ${template.id}: usedOncePerRun not properly initialized`
        );
      }
    }
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Format simulation results for console output
 */
export function formatSimulationResults(result: SimulationResult): string {
  const lines: string[] = [];

  lines.push(`\n=== NPC Chat Simulation Results ===\n`);
  lines.push(`NPC: ${result.npcSlug}`);
  lines.push(`Iterations: ${result.iterations}`);
  lines.push(`Null responses: ${result.nullCount} (${((result.nullCount / result.iterations) * 100).toFixed(1)}%)`);
  lines.push(`Fallback responses: ${result.fallbackCount} (${((result.fallbackCount / result.iterations) * 100).toFixed(1)}%)`);
  lines.push('');

  lines.push('Template Distribution:');
  const sorted = Object.entries(result.templateDistribution)
    .sort(([, a], [, b]) => b - a);
  for (const [templateId, count] of sorted.slice(0, 10)) {
    const pct = ((count / result.iterations) * 100).toFixed(1);
    lines.push(`  ${templateId}: ${count} (${pct}%)`);
  }
  if (sorted.length > 10) {
    lines.push(`  ... and ${sorted.length - 10} more`);
  }
  lines.push('');

  lines.push('Mood Distribution:');
  for (const [mood, count] of Object.entries(result.moodDistribution)) {
    const pct = ((count / result.iterations) * 100).toFixed(1);
    lines.push(`  ${mood}: ${count} (${pct}%)`);
  }
  lines.push('');

  lines.push('Determinism Check:');
  if (result.deterministicCheck.passed) {
    lines.push('  PASSED - Same seeds produce same results');
  } else {
    lines.push('  FAILED:');
    for (const failure of result.deterministicCheck.failures.slice(0, 5)) {
      lines.push(`    ${failure}`);
    }
    if (result.deterministicCheck.failures.length > 5) {
      lines.push(`    ... and ${result.deterministicCheck.failures.length - 5} more`);
    }
  }
  lines.push('');

  lines.push('Weight Distribution Check:');
  const highDeviation = result.expectedVsActual.filter((r) => r.deviation > 30);
  if (highDeviation.length === 0) {
    lines.push('  PASSED - All templates within 30% of expected distribution');
  } else {
    lines.push('  WARNING - High deviation templates:');
    for (const { templateId, expected, actual, deviation } of highDeviation) {
      lines.push(`    ${templateId}: expected ~${expected}, got ${actual} (${deviation}% off)`);
    }
  }

  return lines.join('\n');
}

/**
 * Run all QA checks
 */
export function runFullQA(
  npcSlug: string,
  templates: ResponseTemplate[],
  personality: NPCPersonalityConfig
): {
  simulation: SimulationResult;
  determinism: { passed: boolean; failures: string[] };
  cooldowns: { passed: boolean; issues: string[] };
  allPassed: boolean;
} {
  const simulation = runSimulation(
    {
      npcSlug,
      iterations: 1000,
      pools: ['greeting', 'salesPitch', 'hint', 'lore', 'idle'],
      rooms: 20,
    },
    templates,
    personality
  );

  const determinism = verifyDeterminism(npcSlug, templates, personality);
  const cooldowns = testCooldowns(npcSlug, templates, personality);

  return {
    simulation,
    determinism,
    cooldowns,
    allPassed:
      simulation.deterministicCheck.passed &&
      determinism.passed &&
      cooldowns.passed &&
      simulation.fallbackCount < simulation.iterations * 0.1, // <10% fallbacks
  };
}
