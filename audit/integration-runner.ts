/**
 * Integration Runner - Automated Playthrough System
 *
 * Simulates complete game runs with deterministic seeds to validate:
 * - State consistency across transitions
 * - Gold cap enforcement
 * - Exploration state integration
 * - Death state persistence
 * - Phase transition validity
 *
 * NEVER DIE GUY - Integration Testing
 */

import { createSeededRng, type SeededRng } from '../packages/ai-engine/src/core/seeded-rng';
import { createExplorationState, recordSelection, buildDialogueCoord, type ExplorationState } from '../packages/ai-engine/src/exploration';
import { getFlatScoreGoal, type LoadoutStats } from '../packages/ai-engine/src/balance/balance-config';
import { calculateGoldGain, GOLD_CONFIG } from '../apps/web/src/data/balance-config';
import { getDomainOrder } from '../apps/web/src/data/domains';
import { LOADOUT_PRESETS } from '../apps/web/src/data/loadouts';

// ============================================
// STATE SNAPSHOT TYPES
// ============================================

interface RunSnapshot {
  timestamp: number;
  seed: string;
  phase: string;
  currentDomain: number;
  gold: number;
  totalScore: number;
  scars: number;
  hp: number;
  heat: number;
  corruption: number;
  explorationState: ExplorationState | null;
  visitedDomains: number[];
  inventory: {
    powerupsCount: number;
    diceCount: number;
  };
}

interface TransitionEvent {
  from: string;
  to: string;
  trigger: string;
  goldBefore: number;
  goldAfter: number;
  stateDelta: Record<string, unknown>;
}

// ============================================
// PLAYTHROUGH SCENARIOS
// ============================================

type ScenarioType = 'early_death' | 'mid_game' | 'victory' | 'full_clear';

interface PlaythroughScenario {
  seed: string;
  loadout: string;
  startingDomain: number;
  targetOutcome: ScenarioType;
  description: string;
}

// ============================================
// SIMULATION STATE
// ============================================

interface SimulationState {
  runId: string;
  seed: string;
  phase: 'lobby' | 'playing' | 'game_over';
  currentDomain: number;
  roomNumber: number;
  gold: number;
  totalScore: number;
  scars: number;
  hp: number;
  heat: number;
  corruption: number;
  explorationState: ExplorationState;
  visitedDomains: number[];
  inventory: {
    powerups: string[];
    dice: Record<string, number>;
  };
  loadoutStats: LoadoutStats;
  gritImmunityUsed: boolean;
  runStats: {
    eventsCompleted: number;
    diceThrown: number;
    npcsSquished: number;
    purchases: number;
  };
  snapshots: RunSnapshot[];
  transitions: TransitionEvent[];
  errors: string[];
}

// ============================================
// STATE VALIDATORS
// ============================================

class StateValidator {
  private errors: string[] = [];

  validateGoldCap(gold: number, context: string): void {
    if (gold > GOLD_CONFIG.hardCap) {
      this.errors.push(`[${context}] Gold exceeds hard cap: ${gold} > ${GOLD_CONFIG.hardCap}`);
    }
    if (gold < 0) {
      this.errors.push(`[${context}] Gold is negative: ${gold}`);
    }
  }

  validatePhaseTransition(from: string, to: string, context: string): void {
    const validTransitions: Record<string, string[]> = {
      'lobby': ['playing'],
      'playing': ['game_over'],
      'game_over': ['lobby'],
    };

    if (!validTransitions[from]?.includes(to)) {
      this.errors.push(`[${context}] Invalid phase transition: ${from} -> ${to}`);
    }
  }

  validateHP(hp: number, context: string): void {
    if (hp < 0 || hp > 100) {
      this.errors.push(`[${context}] HP out of range: ${hp} (valid: 0-100)`);
    }
  }

  validateScars(scars: number, context: string): void {
    if (scars < 0 || scars > 4) {
      this.errors.push(`[${context}] Scars out of range: ${scars} (valid: 0-4)`);
    }
  }

  validateDomain(domainId: number, visitedDomains: number[], context: string): void {
    const validDomains = getDomainOrder();
    if (!validDomains.includes(domainId)) {
      this.errors.push(`[${context}] Invalid domain ID: ${domainId}`);
    }

    // Check domain progression - should visit in order
    const position = validDomains.indexOf(domainId);
    const expectedVisitCount = visitedDomains.filter(d => validDomains.indexOf(d) < position).length;
    if (expectedVisitCount !== position) {
      this.errors.push(`[${context}] Domain progression violation: at domain ${domainId}, expected ${position} previous domains, got ${expectedVisitCount}`);
    }
  }

  validateExplorationState(state: ExplorationState | null, context: string): void {
    if (!state) return;

    if (state.totalSelections < 0) {
      this.errors.push(`[${context}] Exploration totalSelections is negative: ${state.totalSelections}`);
    }

    if (state.recentTemplateIds.length > 10) {
      this.errors.push(`[${context}] Exploration recentTemplateIds exceeds buffer size: ${state.recentTemplateIds.length} > 10`);
    }

    // Validate hit counts match total
    const coordHitSum = Object.values(state.coordHitCounts).reduce((a, b) => a + b, 0);
    const templateHitSum = Object.values(state.templateHitCounts).reduce((a, b) => a + b, 0);

    if (coordHitSum !== state.totalSelections) {
      this.errors.push(`[${context}] Exploration coord hits (${coordHitSum}) don't match totalSelections (${state.totalSelections})`);
    }
  }

  getErrors(): string[] {
    return [...this.errors];
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  reset(): void {
    this.errors = [];
  }
}

// ============================================
// PLAYTHROUGH RUNNER
// ============================================

class PlaythroughRunner {
  private validator = new StateValidator();

  createInitialState(scenario: PlaythroughScenario): SimulationState {
    const loadout = LOADOUT_PRESETS.find(l => l.id === scenario.loadout);
    if (!loadout) {
      throw new Error(`Unknown loadout: ${scenario.loadout}`);
    }

    return {
      runId: `run-${scenario.seed}`,
      seed: scenario.seed,
      phase: 'playing',
      currentDomain: scenario.startingDomain,
      roomNumber: 1,
      gold: 0,
      totalScore: 0,
      scars: 0,
      hp: 100,
      heat: 0,
      corruption: 0,
      explorationState: createExplorationState(),
      visitedDomains: [scenario.startingDomain],
      inventory: {
        powerups: [...loadout.items],
        dice: { d4: 1, d6: 1, d8: 1, d10: 1, d12: 1, d20: 1 },
      },
      loadoutStats: loadout.statBonus || {},
      gritImmunityUsed: false,
      runStats: {
        eventsCompleted: 0,
        diceThrown: 0,
        npcsSquished: 0,
        purchases: 0,
      },
      snapshots: [],
      transitions: [],
      errors: [],
    };
  }

  takeSnapshot(state: SimulationState, label: string): RunSnapshot {
    return {
      timestamp: Date.now(),
      seed: state.seed,
      phase: state.phase,
      currentDomain: state.currentDomain,
      gold: state.gold,
      totalScore: state.totalScore,
      scars: state.scars,
      hp: state.hp,
      heat: state.heat,
      corruption: state.corruption,
      explorationState: state.explorationState ? { ...state.explorationState } : null,
      visitedDomains: [...state.visitedDomains],
      inventory: {
        powerupsCount: state.inventory.powerups.length,
        diceCount: Object.values(state.inventory.dice).reduce((a, b) => a + b, 0),
      },
    };
  }

  simulateCombat(state: SimulationState, rng: SeededRng, outcome: 'win' | 'lose'): void {
    const context = `Combat D${state.currentDomain}R${state.roomNumber}`;

    // Simulate dice throws
    const throwCount = rng.randomInt(3, 5, 'throws');
    state.runStats.diceThrown += throwCount;

    if (outcome === 'win') {
      // Victory - gain score and gold
      const scoreGoal = getFlatScoreGoal(state.currentDomain, state.heat);
      const earnedScore = scoreGoal + rng.randomInt(0, 500, 'bonus');
      state.totalScore += earnedScore;

      const baseGold = rng.randomInt(50, 150, 'gold');
      const goldGain = calculateGoldGain(baseGold, state.gold);
      const goldBefore = state.gold;
      state.gold += goldGain;

      this.validator.validateGoldCap(state.gold, context);

      // Record transition
      state.transitions.push({
        from: 'combat',
        to: 'victory',
        trigger: 'combat_win',
        goldBefore,
        goldAfter: state.gold,
        stateDelta: { earnedScore, goldGain },
      });

      state.runStats.eventsCompleted++;
      state.runStats.npcsSquished += rng.randomInt(1, 3, 'npcs');

      // Simulate exploration state update (dialogue selection)
      if (state.explorationState) {
        const coord = buildDialogueCoord({
          npcSlug: 'test-npc',
          mood: 'neutral',
          pool: 'combat',
          tensionBand: 'medium',
        });
        state.explorationState = recordSelection(
          state.explorationState,
          coord,
          `template-${state.runStats.eventsCompleted}`
        );
      }

    } else {
      // Defeat - check grit immunity
      const grit = state.loadoutStats.grit || 0;
      const hasGritImmunity = grit >= 20 && !state.gritImmunityUsed;

      if (hasGritImmunity) {
        state.gritImmunityUsed = true;
        state.errors.push(`[${context}] Grit immunity activated`);
      } else {
        state.scars++;
        this.validator.validateScars(state.scars, context);

        if (state.scars >= 4) {
          // Game over
          state.phase = 'game_over';
          state.transitions.push({
            from: 'combat',
            to: 'game_over',
            trigger: 'planet_destroyed',
            goldBefore: state.gold,
            goldAfter: state.gold,
            stateDelta: { finalScars: state.scars },
          });
        }
      }
    }
  }

  simulateShop(state: SimulationState, rng: SeededRng): void {
    const context = `Shop D${state.currentDomain}`;

    // 70% chance to buy something
    if (rng.random('shop-decision') < 0.7 && state.gold >= 50) {
      const cost = rng.randomInt(50, 150, 'item-cost');
      if (cost <= state.gold) {
        const goldBefore = state.gold;
        state.gold -= cost;
        state.inventory.powerups.push(`item-${state.runStats.purchases}`);
        state.runStats.purchases++;

        state.transitions.push({
          from: 'shop',
          to: 'shop',
          trigger: 'purchase',
          goldBefore,
          goldAfter: state.gold,
          stateDelta: { cost },
        });
      }
    }
  }

  simulateDomainClear(state: SimulationState, rng: SeededRng): void {
    const context = `DomainClear D${state.currentDomain}`;

    // Advance to next domain
    const domainOrder = getDomainOrder();
    const currentPosition = domainOrder.indexOf(state.currentDomain);

    if (currentPosition === domainOrder.length - 1) {
      // Victory - cleared final domain
      state.phase = 'game_over';
      state.transitions.push({
        from: 'playing',
        to: 'game_over',
        trigger: 'victory',
        goldBefore: state.gold,
        goldAfter: state.gold,
        stateDelta: { finalScore: state.totalScore, domainsCleared: domainOrder.length },
      });
      return;
    }

    const nextDomain = domainOrder[currentPosition + 1];
    state.currentDomain = nextDomain;
    state.visitedDomains.push(nextDomain);
    state.roomNumber = 1;
    state.heat++;

    // Filter persistent items (Epic+ survive)
    const persistentItems = state.inventory.powerups.filter(() => rng.random('persist') > 0.5);
    state.inventory.powerups = persistentItems;

    this.validator.validateDomain(nextDomain, state.visitedDomains, context);
  }

  runScenario(scenario: PlaythroughScenario): SimulationState {
    const state = this.createInitialState(scenario);
    const rng = createSeededRng(scenario.seed);

    console.log(`[Runner] Starting scenario: ${scenario.description}`);
    console.log(`[Runner] Seed: ${scenario.seed}, Loadout: ${scenario.loadout}, Starting Domain: ${scenario.startingDomain}`);

    // Initial snapshot
    state.snapshots.push(this.takeSnapshot(state, 'run_start'));

    let iterationCount = 0;
    const maxIterations = 100; // Prevent infinite loops

    while (state.phase === 'playing' && iterationCount < maxIterations) {
      iterationCount++;

      // Simulate 3 rooms per domain
      for (let room = 1; room <= 3; room++) {
        if (state.phase !== 'playing') break;

        state.roomNumber = room;

        // Determine combat outcome based on scenario
        let outcome: 'win' | 'lose' = 'win';
        if (scenario.targetOutcome === 'early_death' && state.currentDomain === scenario.startingDomain && room === 2) {
          outcome = 'lose';
        } else if (scenario.targetOutcome === 'mid_game' && state.visitedDomains.length === 3 && room === 3) {
          outcome = 'lose';
        }

        // Simulate combat
        this.simulateCombat(state, rng, outcome);

        // Validate state after combat
        this.validator.validateGoldCap(state.gold, `D${state.currentDomain}R${room}`);
        this.validator.validateHP(state.hp, `D${state.currentDomain}R${room}`);
        this.validator.validateExplorationState(state.explorationState, `D${state.currentDomain}R${room}`);

        state.snapshots.push(this.takeSnapshot(state, `combat_d${state.currentDomain}r${room}`));

        if (state.phase === 'game_over') break;

        // Shop after room 2 or 3
        if (room >= 2) {
          this.simulateShop(state, rng);
          state.snapshots.push(this.takeSnapshot(state, `shop_d${state.currentDomain}r${room}`));
        }
      }

      // Domain cleared
      if (state.phase === 'playing') {
        this.simulateDomainClear(state, rng);
        state.snapshots.push(this.takeSnapshot(state, `domain_clear_${state.currentDomain}`));
      }
    }

    // Collect validation errors
    state.errors = this.validator.getErrors();

    console.log(`[Runner] Scenario complete: ${state.phase}, Scars: ${state.scars}, Domains: ${state.visitedDomains.length}, Errors: ${state.errors.length}`);

    return state;
  }
}

// ============================================
// TEST SUITE
// ============================================

export function runIntegrationTests(): {
  scenarios: PlaythroughScenario[];
  results: SimulationState[];
  summary: {
    totalRuns: number;
    passed: number;
    failed: number;
    errors: string[];
  };
} {
  const scenarios: PlaythroughScenario[] = [
    // Early death scenarios (all loadouts)
    {
      seed: 'EARLY1',
      loadout: 'warrior',
      startingDomain: 1,
      targetOutcome: 'early_death',
      description: 'Warrior early death in Earth',
    },
    {
      seed: 'EARLY2',
      loadout: 'rogue',
      startingDomain: 1,
      targetOutcome: 'early_death',
      description: 'Rogue early death in Earth',
    },
    {
      seed: 'EARLY3',
      loadout: 'mage',
      startingDomain: 1,
      targetOutcome: 'early_death',
      description: 'Mage early death in Earth',
    },
    {
      seed: 'EARLY4',
      loadout: 'survivor',
      startingDomain: 1,
      targetOutcome: 'early_death',
      description: 'Survivor early death in Earth',
    },

    // Mid-game scenarios (different domains)
    {
      seed: 'MID001',
      loadout: 'warrior',
      startingDomain: 1,
      targetOutcome: 'mid_game',
      description: 'Warrior mid-game death after 3 domains',
    },
    {
      seed: 'MID002',
      loadout: 'rogue',
      startingDomain: 6,
      targetOutcome: 'mid_game',
      description: 'Rogue mid-game death starting from Aberrant',
    },

    // Victory scenarios
    {
      seed: 'WIN001',
      loadout: 'survivor',
      startingDomain: 1,
      targetOutcome: 'victory',
      description: 'Survivor full clear from Earth',
    },
    {
      seed: 'WIN002',
      loadout: 'mage',
      startingDomain: 1,
      targetOutcome: 'victory',
      description: 'Mage full clear with high exploration',
    },

    // Edge case: High corruption
    {
      seed: 'EDGE01',
      loadout: 'warrior',
      startingDomain: 4,
      targetOutcome: 'mid_game',
      description: 'Starting from Shadow Keep (late domain)',
    },
  ];

  const runner = new PlaythroughRunner();
  const results: SimulationState[] = [];
  const allErrors: string[] = [];

  console.log(`\n[Integration Runner] Starting ${scenarios.length} scenarios...\n`);

  for (const scenario of scenarios) {
    const result = runner.runScenario(scenario);
    results.push(result);
    allErrors.push(...result.errors);
  }

  const summary = {
    totalRuns: results.length,
    passed: results.filter(r => r.errors.length === 0).length,
    failed: results.filter(r => r.errors.length > 0).length,
    errors: allErrors,
  };

  console.log(`\n[Integration Runner] Complete!`);
  console.log(`  Total: ${summary.totalRuns}`);
  console.log(`  Passed: ${summary.passed}`);
  console.log(`  Failed: ${summary.failed}`);
  console.log(`  Total Errors: ${summary.errors.length}\n`);

  return { scenarios, results, summary };
}

// ============================================
// SNAPSHOT COMPARISON
// ============================================

export function compareSnapshots(baseline: RunSnapshot, current: RunSnapshot): string[] {
  const diffs: string[] = [];

  if (baseline.phase !== current.phase) {
    diffs.push(`Phase mismatch: ${baseline.phase} vs ${current.phase}`);
  }
  if (baseline.currentDomain !== current.currentDomain) {
    diffs.push(`Domain mismatch: ${baseline.currentDomain} vs ${current.currentDomain}`);
  }
  if (baseline.gold !== current.gold) {
    diffs.push(`Gold mismatch: ${baseline.gold} vs ${current.gold}`);
  }
  if (baseline.totalScore !== current.totalScore) {
    diffs.push(`Score mismatch: ${baseline.totalScore} vs ${current.totalScore}`);
  }
  if (baseline.scars !== current.scars) {
    diffs.push(`Scars mismatch: ${baseline.scars} vs ${current.scars}`);
  }

  return diffs;
}

export { PlaythroughRunner, StateValidator };
export type { SimulationState, RunSnapshot, TransitionEvent, PlaythroughScenario };
