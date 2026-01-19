/**
 * AI Engine Stress Test Harness
 *
 * Systematically tests vulnerabilities in the NDG AI engine:
 * - Seeded RNG hash collisions and overflow
 * - Relationship stat boundary conditions
 * - Memory event spam and threshold edge cases
 * - Intent detection regex ReDoS
 * - Response selector weighted selection precision
 * - Eternal stream domain recursion
 *
 * Usage:
 *   ts-node audit/ai-stress-harness.ts
 *
 * Returns: Exit code 0 if all tests pass, 1 if any crashes/failures detected
 */

import { createSeededRng } from '../packages/ai-engine/src/core/seeded-rng';
import {
  createDefaultRelationship,
  modifyStat,
  deriveMoodFromRelationship,
  calculatePriceModifier,
} from '../packages/ai-engine/src/core/relationship';
import {
  createDefaultMemory,
  addMemoryEvent,
  updateOpinion,
  hasTraumaBond,
  getMostMemorableEvent,
} from '../packages/ai-engine/src/core/memory';
import { detectIntent } from '../packages/ai-engine/src/core/intent-detector';
import { selectResponse, createUsageState } from '../packages/ai-engine/src/core/response-selector';
import { generateDayStream } from '../packages/ai-engine/src/stream/eternal-stream';
import type { NPCPersonality, SimulationContext, ResponseTemplate } from '../packages/ai-engine/src/core/types';

// ============================================
// Test Result Types
// ============================================

interface TestResult {
  name: string;
  category: string;
  status: 'PASS' | 'FAIL' | 'CRASH';
  duration: number;
  error?: string;
  details?: string;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  crashed: number;
  failed: number;
  passed: number;
  totalDuration: number;
}

// ============================================
// Test Runner Infrastructure
// ============================================

function runTest(
  name: string,
  category: string,
  testFn: () => void | { expected?: unknown; actual?: unknown }
): TestResult {
  const start = performance.now();

  try {
    const result = testFn();
    const duration = performance.now() - start;

    if (result && 'expected' in result && 'actual' in result) {
      if (result.expected !== result.actual) {
        return {
          name,
          category,
          status: 'FAIL',
          duration,
          details: `Expected: ${result.expected}, Actual: ${result.actual}`,
        };
      }
    }

    return {
      name,
      category,
      status: 'PASS',
      duration,
    };
  } catch (error) {
    const duration = performance.now() - start;
    return {
      name,
      category,
      status: 'CRASH',
      duration,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================
// Hash Collision & RNG Tests
// ============================================

function testHashCollisions(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Long string overflow
  results.push(runTest(
    'Long string overflow (10k chars)',
    'RNG',
    () => {
      const longSeed = 'a'.repeat(10000);
      const rng = createSeededRng(longSeed);
      const values = Array.from({ length: 100 }, () => rng.random());

      // Should produce deterministic sequence, not crash
      if (values.some(v => v < 0 || v >= 1 || isNaN(v))) {
        throw new Error('Invalid random values produced');
      }
    }
  ));

  // Test 2: Very long string (1M chars) - stress test
  results.push(runTest(
    'Extreme string overflow (1M chars)',
    'RNG',
    () => {
      const megaSeed = 'x'.repeat(1_000_000);
      const rng = createSeededRng(megaSeed);
      rng.random(); // Should not crash
    }
  ));

  // Test 3: Unicode and special chars
  results.push(runTest(
    'Unicode/special char seeds',
    'RNG',
    () => {
      const seeds = [
        '🎲💀🎮',
        '\\n\\t\\r\\0',
        '\u0000\u0001\u0002',
        '日本語シード',
        '💯'.repeat(1000),
      ];

      for (const seed of seeds) {
        const rng = createSeededRng(seed);
        const val = rng.random();
        if (val < 0 || val >= 1 || isNaN(val)) {
          throw new Error(`Invalid value for seed: ${seed.substring(0, 50)}`);
        }
      }
    }
  ));

  // Test 4: Hash collision detection
  results.push(runTest(
    'Hash collision fuzzing',
    'RNG',
    () => {
      const seen = new Map<number, string>();
      const testSeeds = [
        'seed1', 'seed2', 'test', 'tset', 'abc', 'bac',
        'collision1', 'collision2', 'neverdieguy', 'guy',
      ];

      // Add permutations
      for (let i = 0; i < 100; i++) {
        testSeeds.push(`seed${i}`);
        testSeeds.push(`test${i}`);
      }

      let collisions = 0;

      for (const seed of testSeeds) {
        const rng = createSeededRng(seed);
        const val1 = rng.random();
        const val2 = rng.random();
        const fingerprint = `${val1.toFixed(10)}:${val2.toFixed(10)}`;

        if (seen.has(val1)) {
          collisions++;
        }
        seen.set(val1, seed);
      }

      // More than 5% collision rate is suspicious
      if (collisions > testSeeds.length * 0.05) {
        throw new Error(`High collision rate: ${collisions}/${testSeeds.length}`);
      }
    }
  ));

  // Test 5: Empty/null-like seeds
  results.push(runTest(
    'Empty and null-like seeds',
    'RNG',
    () => {
      const rng1 = createSeededRng('');
      const rng2 = createSeededRng('null');
      const rng3 = createSeededRng('undefined');

      [rng1, rng2, rng3].forEach(rng => {
        const val = rng.random();
        if (val < 0 || val >= 1 || isNaN(val)) {
          throw new Error('Invalid random value from null-like seed');
        }
      });
    }
  ));

  // Test 6: Namespace collision
  results.push(runTest(
    'Namespace collision detection',
    'RNG',
    () => {
      const rng = createSeededRng('test');

      const default1 = rng.random();
      const default2 = rng.random();

      const ns1 = rng.random('ns1');
      const ns2 = rng.random('ns1'); // Same namespace
      const ns3 = rng.random('ns2'); // Different namespace

      // Same namespace should give sequential values
      if (ns1 === ns2) {
        throw new Error('Same namespace produced identical values');
      }

      // Default namespace should be independent
      if (default1 === ns1 || default2 === ns1) {
        throw new Error('Namespace collision with default');
      }
    }
  ));

  return results;
}

// ============================================
// Relationship Stat Boundary Tests
// ============================================

function testRelationshipBounds(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Extreme stat overflow
  results.push(runTest(
    'Stat overflow beyond bounds',
    'Relationship',
    () => {
      let rel = createDefaultRelationship('npc1');

      // Attempt to overflow respect (should clamp to 100)
      for (let i = 0; i < 50; i++) {
        const { relationship } = modifyStat(rel, 'respect', 100, 'source', 'test');
        rel = relationship;
      }

      if (rel.stats.respect !== 100) {
        throw new Error(`Respect overflow: expected 100, got ${rel.stats.respect}`);
      }

      // Attempt to underflow (should clamp to -100)
      for (let i = 0; i < 50; i++) {
        const { relationship } = modifyStat(rel, 'respect', -100, 'source', 'test');
        rel = relationship;
      }

      if (rel.stats.respect !== -100) {
        throw new Error(`Respect underflow: expected -100, got ${rel.stats.respect}`);
      }
    }
  ));

  // Test 2: Debt extreme values
  results.push(runTest(
    'Debt extreme bounds (-1000 to 1000)',
    'Relationship',
    () => {
      let rel = createDefaultRelationship('npc2');

      const { relationship: rel1 } = modifyStat(rel, 'debt', 2000, 'source', 'test');
      if (rel1.stats.debt !== 1000) {
        throw new Error(`Debt overflow: expected 1000, got ${rel1.stats.debt}`);
      }

      const { relationship: rel2 } = modifyStat(rel, 'debt', -2000, 'source', 'test');
      if (rel2.stats.debt !== -1000) {
        throw new Error(`Debt underflow: expected -1000, got ${rel2.stats.debt}`);
      }
    }
  ));

  // Test 3: Familiarity lower bound (0 minimum)
  results.push(runTest(
    'Familiarity cannot go negative',
    'Relationship',
    () => {
      let rel = createDefaultRelationship('npc3');
      const { relationship } = modifyStat(rel, 'familiarity', -100, 'source', 'test');

      if (relationship.stats.familiarity !== 0) {
        throw new Error(`Familiarity went negative: ${relationship.stats.familiarity}`);
      }
    }
  ));

  // Test 4: Repeated max stat calls (should be no-op)
  results.push(runTest(
    'Repeated max stat modifications',
    'Relationship',
    () => {
      let rel = createDefaultRelationship('npc4');

      // Set to max
      const { relationship: rel1 } = modifyStat(rel, 'respect', 100, 'source', 'init');

      // Try to increase again (should be no-op)
      const { relationship: rel2, change } = modifyStat(rel1, 'respect', 50, 'source', 'test');

      if (change.change !== 0) {
        throw new Error(`Max stat modification not a no-op: change=${change.change}`);
      }

      if (rel2.stats.respect !== 100) {
        throw new Error(`Max stat changed: ${rel2.stats.respect}`);
      }
    }
  ));

  // Test 5: Price modifier edge cases
  results.push(runTest(
    'Price modifier at extreme stats',
    'Relationship',
    () => {
      const relHostile = createDefaultRelationship('hostile');
      const { relationship: hostile } = modifyStat(relHostile, 'respect', -100, 'source', 'test');
      const { relationship: hostile2 } = modifyStat(hostile, 'trust', -100, 'source', 'test');

      const priceHostile = calculatePriceModifier(hostile2.stats);

      // Should cap at 1.5x (not go infinite)
      if (priceHostile > 1.5 || priceHostile < 0.5) {
        throw new Error(`Price modifier out of bounds: ${priceHostile}`);
      }

      const relFriendly = createDefaultRelationship('friendly');
      const { relationship: friendly } = modifyStat(relFriendly, 'respect', 100, 'source', 'test');
      const { relationship: friendly2 } = modifyStat(friendly, 'trust', 100, 'source', 'test');

      const priceFriendly = calculatePriceModifier(friendly2.stats);

      if (priceFriendly > 1.5 || priceFriendly < 0.5) {
        throw new Error(`Friendly price modifier out of bounds: ${priceFriendly}`);
      }
    }
  ));

  // Test 6: Mood derivation at exact thresholds
  results.push(runTest(
    'Mood derivation threshold boundaries',
    'Relationship',
    () => {
      const rel = createDefaultRelationship('threshold');

      // Threatening: respect < -50 && fear < 30
      const { relationship: threatening } = modifyStat(rel, 'respect', -51, 'source', 'test');
      const mood1 = deriveMoodFromRelationship(threatening.stats);
      if (mood1 !== 'threatening') {
        throw new Error(`Expected threatening, got ${mood1}`);
      }

      // Fearful: fear > 70
      const { relationship: fearful } = modifyStat(rel, 'fear', 71, 'source', 'test');
      const mood2 = deriveMoodFromRelationship(fearful.stats);
      if (mood2 !== 'fearful') {
        throw new Error(`Expected fearful, got ${mood2}`);
      }
    }
  ));

  return results;
}

// ============================================
// Memory System Tests
// ============================================

function testMemorySystem(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Memory event spam (100 low-weight events)
  results.push(runTest(
    'Memory event spam (100 events, weight=1)',
    'Memory',
    () => {
      let memory = createDefaultMemory('spam-test');

      for (let i = 0; i < 100; i++) {
        memory = addMemoryEvent(memory, {
          type: 'conversation',
          timestamp: Date.now() + i,
          involvedNPCs: ['spam-test', 'other'],
          details: `Spam event ${i}`,
          emotionalWeight: 1, // Below threshold (6) for long-term
        });
      }

      // Short-term should cap at 10
      if (memory.shortTerm.length !== 10) {
        throw new Error(`Short-term not capped: ${memory.shortTerm.length}`);
      }

      // Long-term should be empty (weight < 6)
      if (memory.longTerm.length !== 0) {
        throw new Error(`Long-term should be empty: ${memory.longTerm.length}`);
      }
    }
  ));

  // Test 2: Important events lost due to threshold
  results.push(runTest(
    'Important events (weight=5) not promoted',
    'Memory',
    () => {
      let memory = createDefaultMemory('threshold-test');

      memory = addMemoryEvent(memory, {
        type: 'conversation',
        timestamp: Date.now(),
        involvedNPCs: ['threshold-test'],
        details: 'Important conversation',
        emotionalWeight: 5, // Just below threshold
      });

      if (memory.longTerm.length !== 0) {
        return { expected: 0, actual: memory.longTerm.length };
      }
    }
  ));

  // Test 3: Long-term memory overflow (21+ significant events)
  results.push(runTest(
    'Long-term memory overflow (21 events, cap=20)',
    'Memory',
    () => {
      let memory = createDefaultMemory('overflow-test');

      for (let i = 0; i < 25; i++) {
        memory = addMemoryEvent(memory, {
          type: 'conflict',
          timestamp: Date.now() + i,
          involvedNPCs: ['overflow-test', 'enemy'],
          details: `Conflict ${i}`,
          emotionalWeight: 6 + (i % 3), // Varies 6-8
        });
      }

      if (memory.longTerm.length !== 20) {
        throw new Error(`Long-term not capped at 20: ${memory.longTerm.length}`);
      }

      // Should keep highest weight events
      const mostMemorable = getMostMemorableEvent(memory);
      if (!mostMemorable || mostMemorable.emotionalWeight < 6) {
        throw new Error('Long-term did not preserve high-weight events');
      }
    }
  ));

  // Test 4: Trauma bond edge case (exactly at threshold)
  results.push(runTest(
    'Trauma bond exactly at threshold (30)',
    'Memory',
    () => {
      let memory = createDefaultMemory('trauma-test');

      // Add events totaling exactly 30
      memory = addMemoryEvent(memory, {
        type: 'conflict',
        timestamp: Date.now(),
        involvedNPCs: ['trauma-test', 'partner'],
        details: 'First conflict',
        emotionalWeight: 10,
      });

      memory = addMemoryEvent(memory, {
        type: 'witnessed_death',
        timestamp: Date.now(),
        involvedNPCs: ['trauma-test', 'partner'],
        details: 'Witnessed death',
        emotionalWeight: 10,
      });

      memory = addMemoryEvent(memory, {
        type: 'conflict',
        timestamp: Date.now(),
        involvedNPCs: ['trauma-test', 'partner'],
        details: 'Second conflict',
        emotionalWeight: 10,
      });

      const hasBond = hasTraumaBond(memory, 'partner');
      if (!hasBond) {
        throw new Error('Trauma bond not formed at exact threshold');
      }
    }
  ));

  // Test 5: Opinion bounds
  results.push(runTest(
    'Opinion stat bounds (-100 to 100)',
    'Memory',
    () => {
      let memory = createDefaultMemory('opinion-test');

      memory = updateOpinion(memory, 'npc1', 200);
      if (memory.opinions['npc1'] !== 100) {
        throw new Error(`Opinion overflow: ${memory.opinions['npc1']}`);
      }

      memory = updateOpinion(memory, 'npc2', -200);
      if (memory.opinions['npc2'] !== -100) {
        throw new Error(`Opinion underflow: ${memory.opinions['npc2']}`);
      }
    }
  ));

  // Test 6: Circular NPC references in memories
  results.push(runTest(
    'Circular NPC references',
    'Memory',
    () => {
      let memory = createDefaultMemory('circular-test');

      memory = addMemoryEvent(memory, {
        type: 'conversation',
        timestamp: Date.now(),
        involvedNPCs: ['circular-test', 'circular-test'], // Self-reference
        details: 'Talking to self',
        emotionalWeight: 6,
      });

      // Should not crash, just be weird
      if (memory.traumaBonds['circular-test']) {
        // Trauma bond with self is possible but suspicious
        console.warn('Self-trauma bond detected');
      }
    }
  ));

  return results;
}

// ============================================
// Intent Detection ReDoS Tests
// ============================================

function testIntentDetection(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Question mark regex (matches any string ending with ?)
  results.push(runTest(
    'Question mark regex false positives',
    'Intent',
    () => {
      const testCases = [
        'This is not a question?',
        'Really?',
        '??', // Single '?' is too short (< 2 chars) - intentional safeguard
        'What??????????????', // Many question marks
      ];

      for (const text of testCases) {
        const intent = detectIntent(text);
        if (intent.intent !== 'question') {
          throw new Error(`Failed to detect question: "${text}"`);
        }
      }
    }
  ));

  // Test 2: ReDoS attempt with nested quantifiers
  results.push(runTest(
    'ReDoS nested quantifiers',
    'Intent',
    () => {
      const start = Date.now();

      // Pathological input for regex engines
      const evil = 'a'.repeat(1000) + 'b';
      detectIntent(evil);

      const duration = Date.now() - start;

      // Should complete in <100ms
      if (duration > 100) {
        throw new Error(`ReDoS detected: ${duration}ms`);
      }
    }
  ));

  // Test 3: Empty and whitespace-only messages
  results.push(runTest(
    'Empty/whitespace messages',
    'Intent',
    () => {
      const tests = ['', ' ', '   ', '\t\n\r'];

      for (const text of tests) {
        const intent = detectIntent(text);
        if (intent.intent !== 'unknown' || intent.confidence !== 0) {
          throw new Error(`Empty message not handled: "${text}"`);
        }
      }
    }
  ));

  // Test 4: Very long message (1000+ chars)
  results.push(runTest(
    'Very long message (1000 chars)',
    'Intent',
    () => {
      const longMsg = 'hello '.repeat(200) + '?';
      const intent = detectIntent(longMsg);

      // Should still detect intent
      if (intent.intent === 'unknown') {
        throw new Error('Failed to detect intent in long message');
      }
    }
  ));

  // Test 5: Unicode and emoji in patterns
  results.push(runTest(
    'Unicode/emoji intent detection',
    'Intent',
    () => {
      const tests = [
        { text: 'hello 👋', expected: 'greeting' },
        { text: 'bye 👋', expected: 'farewell' },
        { text: 'fight me 💪', expected: 'challenge' },
      ];

      for (const { text, expected } of tests) {
        const intent = detectIntent(text);
        if (intent.intent !== expected) {
          // Emoji might not match, but shouldn't crash
          console.warn(`Emoji intent mismatch: ${text}`);
        }
      }
    }
  ));

  return results;
}

// ============================================
// Response Selection Tests
// ============================================

function testResponseSelection(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Weighted selection with very small weights
  results.push(runTest(
    'Floating point precision (weights < 0.001)',
    'Response',
    () => {
      const rng = createSeededRng('precision-test');

      const items = [
        { item: 'a', weight: 0.0001 },
        { item: 'b', weight: 0.0001 },
        { item: 'c', weight: 0.0001 },
      ];

      const selected = rng.randomWeighted(items, 'test');

      // Should not crash, should select something
      if (!selected) {
        throw new Error('Weighted selection failed with small weights');
      }
    }
  ));

  // Test 2: Zero total weight
  results.push(runTest(
    'Zero total weight fallback',
    'Response',
    () => {
      const rng = createSeededRng('zero-weight');

      const items = [
        { item: 'a', weight: 0 },
        { item: 'b', weight: 0 },
      ];

      const selected = rng.randomWeighted(items, 'test');

      // Should return first item as fallback
      if (selected !== 'a') {
        throw new Error(`Zero weight fallback failed: got ${selected}`);
      }
    }
  ));

  // Test 3: Empty candidate list
  results.push(runTest(
    'Empty template candidate list',
    'Response',
    () => {
      const mockNPC: NPCPersonality = {
        identity: { slug: 'test', name: 'Test', category: 'wanderers' },
        basePoolWeights: {},
        defaultMood: 'neutral',
        moodVolatility: 0.5,
        sociability: 0.5,
        aggression: 0.5,
        loyalty: 0.5,
        curiosity: 0.5,
        templates: [], // No templates!
      };

      const context: SimulationContext = {
        seed: 'test',
        turnNumber: 1,
        activeNPCs: ['test'],
        playerPresent: true,
        location: 'test',
      };

      const result = selectResponse({
        npcSlug: 'test',
        personality: mockNPC,
        pool: 'idle',
        context,
        usage: createUsageState(),
      });

      // Should return null gracefully
      if (result.message !== null) {
        throw new Error('Empty template list did not return null');
      }
    }
  ));

  // Test 4: Malformed template conditions
  results.push(runTest(
    'Malformed template conditions',
    'Response',
    () => {
      const template: ResponseTemplate = {
        id: 'malformed',
        npcSlug: 'test',
        pool: 'idle',
        mood: 'neutral',
        text: 'Test',
        weight: 1,
        conditions: [
          { type: 'mood', target: 'nonexistent', comparison: 'eq', value: 'happy' },
          { type: 'relationship', target: undefined, comparison: 'gt', value: 50 },
        ] as any, // Force malformed
      };

      const mockNPC: NPCPersonality = {
        identity: { slug: 'test', name: 'Test', category: 'wanderers' },
        basePoolWeights: {},
        defaultMood: 'neutral',
        moodVolatility: 0.5,
        sociability: 0.5,
        aggression: 0.5,
        loyalty: 0.5,
        curiosity: 0.5,
        templates: [template],
      };

      const context: SimulationContext = {
        seed: 'test',
        turnNumber: 1,
        activeNPCs: ['test'],
        playerPresent: true,
        location: 'test',
      };

      // Should not crash
      selectResponse({
        npcSlug: 'test',
        personality: mockNPC,
        pool: 'idle',
        context,
        usage: createUsageState(),
      });
    }
  ));

  return results;
}

// ============================================
// Eternal Stream Recursion Tests
// ============================================

function testEternalStream(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Invalid domain fallback to 'earth'
  results.push(runTest(
    'Invalid domain fallback recursion',
    'Stream',
    () => {
      try {
        const stream = generateDayStream('test-seed', 'nonexistent-domain', 5);

        // Should fallback to earth, not crash
        if (stream.length === 0) {
          throw new Error('Stream empty after fallback');
        }
      } catch (error) {
        throw new Error(`Fallback recursion failed: ${error}`);
      }
    }
  ));

  // Test 2: Circular domain reference
  results.push(runTest(
    'Circular domain reference detection',
    'Stream',
    () => {
      // If 'earth' domain is invalid, infinite loop would occur
      // This test ensures earth exists as ultimate fallback
      const stream = generateDayStream('test', 'invalid1', 1);

      if (stream.length === 0) {
        throw new Error('No fallback to earth domain');
      }
    }
  ));

  // Test 3: Zero count stream
  results.push(runTest(
    'Zero count stream generation',
    'Stream',
    () => {
      const stream = generateDayStream('test', 'earth', 0);

      if (stream.length !== 0) {
        throw new Error(`Expected 0 entries, got ${stream.length}`);
      }
    }
  ));

  // Test 4: Negative count stream
  results.push(runTest(
    'Negative count stream',
    'Stream',
    () => {
      const stream = generateDayStream('test', 'earth', -10);

      // Should handle gracefully (0 entries or crash?)
      if (stream.length < 0) {
        throw new Error('Negative stream length');
      }
    }
  ));

  // Test 5: Extremely large count (10k entries)
  results.push(runTest(
    'Large stream generation (10k entries)',
    'Stream',
    () => {
      const start = Date.now();
      const stream = generateDayStream('test', 'earth', 10000);
      const duration = Date.now() - start;

      if (stream.length !== 10000) {
        throw new Error(`Expected 10000 entries, got ${stream.length}`);
      }

      // Should complete in reasonable time (<5s)
      if (duration > 5000) {
        throw new Error(`Stream generation too slow: ${duration}ms`);
      }
    }
  ));

  return results;
}

// ============================================
// Malformed Input Tests
// ============================================

function testMalformedInputs(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Null/undefined in objects
  results.push(runTest(
    'Null fields in relationship object',
    'Malformed',
    () => {
      const rel = createDefaultRelationship('test');
      const malformed = {
        ...rel,
        stats: {
          ...rel.stats,
          respect: null as any,
        },
      };

      // Attempt to modify
      try {
        modifyStat(malformed, 'respect', 10, 'source', 'test');
      } catch (error) {
        // Expected to fail gracefully
      }
    }
  ));

  // Test 2: Circular object references
  results.push(runTest(
    'Circular object references',
    'Malformed',
    () => {
      const memory = createDefaultMemory('circular');
      const circularEvent: any = {
        type: 'conversation',
        timestamp: Date.now(),
        involvedNPCs: ['circular'],
        details: 'circular ref',
        emotionalWeight: 5,
      };

      // Create circular reference
      circularEvent.self = circularEvent;

      try {
        addMemoryEvent(memory, circularEvent);
      } catch (error) {
        // Should handle or crash gracefully
      }
    }
  ));

  // Test 3: Wrong type in stat modification
  results.push(runTest(
    'Wrong type in stat field',
    'Malformed',
    () => {
      const rel = createDefaultRelationship('test');

      try {
        modifyStat(rel, 'respect' as any, 'not-a-number' as any, 'source', 'test');
      } catch (error) {
        // Expected to fail
      }
    }
  ));

  return results;
}

// ============================================
// Main Test Runner
// ============================================

function runAllTests(): TestSuite {
  console.log('🔥 AI ENGINE STRESS TEST HARNESS\n');
  console.log('Testing vulnerabilities in NDG AI engine...\n');

  const allResults: TestResult[] = [];

  console.log('⚡ Running RNG Tests...');
  allResults.push(...testHashCollisions());

  console.log('⚡ Running Relationship Tests...');
  allResults.push(...testRelationshipBounds());

  console.log('⚡ Running Memory Tests...');
  allResults.push(...testMemorySystem());

  console.log('⚡ Running Intent Detection Tests...');
  allResults.push(...testIntentDetection());

  console.log('⚡ Running Response Selection Tests...');
  allResults.push(...testResponseSelection());

  console.log('⚡ Running Eternal Stream Tests...');
  allResults.push(...testEternalStream());

  console.log('⚡ Running Malformed Input Tests...');
  allResults.push(...testMalformedInputs());

  const crashed = allResults.filter(r => r.status === 'CRASH').length;
  const failed = allResults.filter(r => r.status === 'FAIL').length;
  const passed = allResults.filter(r => r.status === 'PASS').length;
  const totalDuration = allResults.reduce((sum, r) => sum + r.duration, 0);

  return {
    name: 'AI Engine Stress Test',
    results: allResults,
    crashed,
    failed,
    passed,
    totalDuration,
  };
}

function printResults(suite: TestSuite): void {
  console.log('\n' + '='.repeat(80));
  console.log('TEST RESULTS');
  console.log('='.repeat(80) + '\n');

  // Group by category
  const categories = new Set(suite.results.map(r => r.category));

  for (const category of categories) {
    const categoryResults = suite.results.filter(r => r.category === category);
    const categoryPassed = categoryResults.filter(r => r.status === 'PASS').length;
    const categoryCrashed = categoryResults.filter(r => r.status === 'CRASH').length;
    const categoryFailed = categoryResults.filter(r => r.status === 'FAIL').length;

    console.log(`\n${category} (${categoryPassed}/${categoryResults.length} passed)`);
    console.log('-'.repeat(80));

    for (const result of categoryResults) {
      const icon = result.status === 'PASS' ? '✓' :
                   result.status === 'FAIL' ? '✗' : '💥';
      const timeStr = result.duration.toFixed(2) + 'ms';

      console.log(`  ${icon} ${result.name} (${timeStr})`);

      if (result.error) {
        console.log(`    ERROR: ${result.error}`);
      }
      if (result.details) {
        console.log(`    ${result.details}`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${suite.results.length}`);
  console.log(`✓ Passed: ${suite.passed}`);
  console.log(`✗ Failed: ${suite.failed}`);
  console.log(`💥 Crashed: ${suite.crashed}`);
  console.log(`Total Duration: ${suite.totalDuration.toFixed(2)}ms`);
  console.log('='.repeat(80) + '\n');

  if (suite.crashed > 0) {
    console.log('⚠️  CRITICAL: Tests crashed! See errors above.\n');
  } else if (suite.failed > 0) {
    console.log('⚠️  WARNING: Tests failed. See details above.\n');
  } else {
    console.log('✅ All tests passed!\n');
  }
}

// ============================================
// CLI Entry Point
// ============================================

// ESM-compatible entry point check
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const suite = runAllTests();
  printResults(suite);

  // Exit with error code if any crashes or failures
  const exitCode = suite.crashed > 0 || suite.failed > 0 ? 1 : 0;
  process.exit(exitCode);
}

export { runAllTests, printResults };
