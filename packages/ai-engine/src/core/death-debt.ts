/**
 * Death = Debt System
 *
 * When HP hits 0, an NPC "rescues" you.
 * You now owe them - affecting future runs.
 */

import { createSeededRng, type SeededRng } from './seeded-rng';

// ============================================
// Configuration
// ============================================

export interface DeathDebtConfig {
  // Who can rescue
  rescueNPCCategories: string[];     // ['wanderer', 'traveler']
  rescuePriorityByRelationship: boolean; // Higher trust = more likely

  // Debt calculation
  baseDebtAmount: number;            // Base gold owed (50)
  debtPerAnte: number;               // Additional per ante survived (25)
  debtInterestRate: number;          // Interest per run if unpaid (0.10 = 10%)
  maxDebtPerNPC: number;             // Cap on debt to single NPC (500)

  // Rescue effects
  rescueHealPercent: number;         // Heal to this % of max HP (0.30)
  itemsLostOnRescue: number;         // Items taken as "fee" (1)
  goldTakenOnRescue: number;         // % of gold taken (0.20 = 20%)

  // Debt consequences
  shopMarkupWhileIndebted: number;   // Price increase from debtor NPC (0.20)
  ceeloChallengeOnDebt: boolean;     // NPC challenges to ceelo to settle
  ceeloChallengeThreshold: number;   // Min debt to trigger challenge (100)
  hostileAtDebt: number;             // Debt level where NPC becomes hostile (300)

  // Flume rules
  flumeAvailableAtAnteEnd: boolean;  // Can flume at end of ante
  flumeWithDebtPaysItems: boolean;   // Fluming with debt = NPC takes items
  flumeDebtPaymentPercent: number;   // % of item value toward debt (0.50)
}

export const DEFAULT_DEATH_DEBT_CONFIG: DeathDebtConfig = {
  rescueNPCCategories: ['wanderer', 'traveler'],
  rescuePriorityByRelationship: true,
  baseDebtAmount: 50,
  debtPerAnte: 25,
  debtInterestRate: 0.10,
  maxDebtPerNPC: 500,
  rescueHealPercent: 0.30,
  itemsLostOnRescue: 1,
  goldTakenOnRescue: 0.20,
  shopMarkupWhileIndebted: 0.20,
  ceeloChallengeOnDebt: true,
  ceeloChallengeThreshold: 100,
  hostileAtDebt: 300,
  flumeAvailableAtAnteEnd: true,
  flumeWithDebtPaysItems: true,
  flumeDebtPaymentPercent: 0.50,
};

// ============================================
// Types
// ============================================

export interface NPCDebtRecord {
  npcSlug: string;
  npcName: string;
  npcCategory: string;
  totalDebt: number;
  debtHistory: DebtEvent[];
  lastInteractionRun: number;
  isHostile: boolean;
}

export interface DebtEvent {
  runNumber: number;
  type: 'rescue' | 'interest' | 'payment' | 'ceelo_loss' | 'ceelo_win' | 'flume_payment';
  amount: number;          // Positive = debt increased, Negative = debt paid
  description: string;
  timestamp: number;
}

export interface RescueResult {
  rescuerSlug: string;
  rescuerName: string;
  debtIncurred: number;
  hpRestored: number;
  itemsLost: string[];     // Item IDs taken
  goldTaken: number;
  newTotalDebt: number;
  dialogueKey: string;     // Key for rescue dialogue
}

export interface FlumeResult {
  success: boolean;
  itemsKept: string[];
  itemsLostToDebt: string[];
  debtPaid: number;
  remainingDebt: number;
  goldKept: number;
}

export interface DebtState {
  config: DeathDebtConfig;
  npcDebts: Map<string, NPCDebtRecord>;
  currentRun: number;
  totalDebtEver: number;
  totalDebtPaid: number;
  rescueCount: number;
}

// ============================================
// State Management
// ============================================

export function createDebtState(
  config: Partial<DeathDebtConfig> = {}
): DebtState {
  return {
    config: { ...DEFAULT_DEATH_DEBT_CONFIG, ...config },
    npcDebts: new Map(),
    currentRun: 0,
    totalDebtEver: 0,
    totalDebtPaid: 0,
    rescueCount: 0,
  };
}

export function getDebtToNPC(state: DebtState, npcSlug: string): number {
  return state.npcDebts.get(npcSlug)?.totalDebt ?? 0;
}

export function getTotalDebt(state: DebtState): number {
  let total = 0;
  for (const record of state.npcDebts.values()) {
    total += record.totalDebt;
  }
  return total;
}

export function isIndebtedTo(state: DebtState, npcSlug: string): boolean {
  return getDebtToNPC(state, npcSlug) > 0;
}

export function isHostileFromDebt(state: DebtState, npcSlug: string): boolean {
  const record = state.npcDebts.get(npcSlug);
  if (!record) return false;
  return record.totalDebt >= state.config.hostileAtDebt;
}

// ============================================
// Rescue Logic
// ============================================

export interface AvailableRescuer {
  slug: string;
  name: string;
  category: string;
  relationshipScore: number;  // Trust/respect from NPC system
  currentDebtToPlayer: number;
  willingnessToRescue: number; // 0-1, higher = more likely
}

export function selectRescuer(
  availableRescuers: AvailableRescuer[],
  state: DebtState,
  rng: SeededRng
): AvailableRescuer | null {
  // Filter to valid categories
  const validRescuers = availableRescuers.filter(
    (r) => state.config.rescueNPCCategories.includes(r.category)
  );

  if (validRescuers.length === 0) return null;

  // Weight by willingness and relationship
  const weighted = validRescuers.map((r) => ({
    rescuer: r,
    weight: r.willingnessToRescue *
      (state.config.rescuePriorityByRelationship
        ? Math.max(0.1, (r.relationshipScore + 100) / 200)
        : 1),
  }));

  const totalWeight = weighted.reduce((acc, w) => acc + w.weight, 0);
  let roll = rng.random('selectRescuer') * totalWeight;

  for (const { rescuer, weight } of weighted) {
    roll -= weight;
    if (roll <= 0) return rescuer;
  }

  return weighted[0]?.rescuer ?? null;
}

export function calculateRescueDebt(
  anteSurvived: number,
  config: DeathDebtConfig
): number {
  return config.baseDebtAmount + anteSurvived * config.debtPerAnte;
}

export function processRescue(
  state: DebtState,
  rescuer: AvailableRescuer,
  anteSurvived: number,
  playerMaxHP: number,
  playerGold: number,
  playerItems: Array<{ id: string; value: number }>
): { state: DebtState; result: RescueResult } {
  const debtAmount = calculateRescueDebt(anteSurvived, state.config);
  const hpRestored = Math.floor(playerMaxHP * state.config.rescueHealPercent);
  const goldTaken = Math.floor(playerGold * state.config.goldTakenOnRescue);

  // Select items to lose (lowest value first)
  const sortedItems = [...playerItems].sort((a, b) => a.value - b.value);
  const itemsLost = sortedItems
    .slice(0, state.config.itemsLostOnRescue)
    .map((i) => i.id);

  // Update or create debt record
  const existingRecord = state.npcDebts.get(rescuer.slug);
  const newDebt = Math.min(
    (existingRecord?.totalDebt ?? 0) + debtAmount,
    state.config.maxDebtPerNPC
  );

  const debtEvent: DebtEvent = {
    runNumber: state.currentRun,
    type: 'rescue',
    amount: debtAmount,
    description: `Rescued by ${rescuer.name} at ante ${anteSurvived}`,
    timestamp: Date.now(),
  };

  const newRecord: NPCDebtRecord = {
    npcSlug: rescuer.slug,
    npcName: rescuer.name,
    npcCategory: rescuer.category,
    totalDebt: newDebt,
    debtHistory: [...(existingRecord?.debtHistory ?? []), debtEvent],
    lastInteractionRun: state.currentRun,
    isHostile: newDebt >= state.config.hostileAtDebt,
  };

  const newState: DebtState = {
    ...state,
    npcDebts: new Map(state.npcDebts).set(rescuer.slug, newRecord),
    totalDebtEver: state.totalDebtEver + debtAmount,
    rescueCount: state.rescueCount + 1,
  };

  const result: RescueResult = {
    rescuerSlug: rescuer.slug,
    rescuerName: rescuer.name,
    debtIncurred: debtAmount,
    hpRestored,
    itemsLost,
    goldTaken,
    newTotalDebt: newDebt,
    dialogueKey: `rescue_${rescuer.category}_${anteSurvived}`,
  };

  return { state: newState, result };
}

// ============================================
// Debt Payment
// ============================================

export function payDebt(
  state: DebtState,
  npcSlug: string,
  amount: number,
  paymentType: 'payment' | 'ceelo_win' | 'flume_payment' = 'payment'
): DebtState {
  const record = state.npcDebts.get(npcSlug);
  if (!record) return state;

  const actualPayment = Math.min(amount, record.totalDebt);
  const newDebt = record.totalDebt - actualPayment;

  const debtEvent: DebtEvent = {
    runNumber: state.currentRun,
    type: paymentType,
    amount: -actualPayment,
    description: `Paid ${actualPayment} gold`,
    timestamp: Date.now(),
  };

  const updatedRecord: NPCDebtRecord = {
    ...record,
    totalDebt: newDebt,
    debtHistory: [...record.debtHistory, debtEvent],
    lastInteractionRun: state.currentRun,
    isHostile: newDebt >= state.config.hostileAtDebt,
  };

  return {
    ...state,
    npcDebts: new Map(state.npcDebts).set(npcSlug, updatedRecord),
    totalDebtPaid: state.totalDebtPaid + actualPayment,
  };
}

export function addDebtFromCeeloLoss(
  state: DebtState,
  npcSlug: string,
  npcName: string,
  npcCategory: string,
  amount: number
): DebtState {
  const existingRecord = state.npcDebts.get(npcSlug);
  const newDebt = Math.min(
    (existingRecord?.totalDebt ?? 0) + amount,
    state.config.maxDebtPerNPC
  );

  const debtEvent: DebtEvent = {
    runNumber: state.currentRun,
    type: 'ceelo_loss',
    amount,
    description: `Lost ceelo match, owes ${amount} gold`,
    timestamp: Date.now(),
  };

  const newRecord: NPCDebtRecord = {
    npcSlug,
    npcName,
    npcCategory,
    totalDebt: newDebt,
    debtHistory: [...(existingRecord?.debtHistory ?? []), debtEvent],
    lastInteractionRun: state.currentRun,
    isHostile: newDebt >= state.config.hostileAtDebt,
  };

  return {
    ...state,
    npcDebts: new Map(state.npcDebts).set(npcSlug, newRecord),
    totalDebtEver: state.totalDebtEver + amount,
  };
}

// ============================================
// Interest / Run Progression
// ============================================

export function applyInterest(state: DebtState): DebtState {
  const newDebts = new Map(state.npcDebts);
  let totalInterest = 0;

  for (const [slug, record] of newDebts) {
    if (record.totalDebt > 0) {
      const interest = Math.floor(record.totalDebt * state.config.debtInterestRate);
      const newDebt = Math.min(
        record.totalDebt + interest,
        state.config.maxDebtPerNPC
      );

      if (interest > 0) {
        const debtEvent: DebtEvent = {
          runNumber: state.currentRun,
          type: 'interest',
          amount: interest,
          description: `Interest: ${(state.config.debtInterestRate * 100).toFixed(0)}%`,
          timestamp: Date.now(),
        };

        newDebts.set(slug, {
          ...record,
          totalDebt: newDebt,
          debtHistory: [...record.debtHistory, debtEvent],
          isHostile: newDebt >= state.config.hostileAtDebt,
        });

        totalInterest += interest;
      }
    }
  }

  return {
    ...state,
    npcDebts: newDebts,
    totalDebtEver: state.totalDebtEver + totalInterest,
    currentRun: state.currentRun + 1,
  };
}

// ============================================
// Flume Logic
// ============================================

export function processFlume(
  state: DebtState,
  playerItems: Array<{ id: string; value: number }>,
  playerGold: number
): { state: DebtState; result: FlumeResult } {
  const totalDebt = getTotalDebt(state);

  if (totalDebt === 0 || !state.config.flumeWithDebtPaysItems) {
    // No debt or no payment required
    return {
      state,
      result: {
        success: true,
        itemsKept: playerItems.map((i) => i.id),
        itemsLostToDebt: [],
        debtPaid: 0,
        remainingDebt: totalDebt,
        goldKept: playerGold,
      },
    };
  }

  // Calculate item value toward debt
  const sortedItems = [...playerItems].sort((a, b) => b.value - a.value);
  let debtToPay = totalDebt;
  const itemsLost: string[] = [];
  const itemsKept: string[] = [];

  for (const item of sortedItems) {
    if (debtToPay > 0) {
      const paymentValue = Math.floor(item.value * state.config.flumeDebtPaymentPercent);
      debtToPay -= paymentValue;
      itemsLost.push(item.id);
    } else {
      itemsKept.push(item.id);
    }
  }

  const debtPaid = totalDebt - Math.max(0, debtToPay);

  // Distribute payment across NPCs (proportional to debt)
  let newState = state;
  for (const [slug, record] of state.npcDebts) {
    if (record.totalDebt > 0) {
      const proportion = record.totalDebt / totalDebt;
      const payment = Math.floor(debtPaid * proportion);
      newState = payDebt(newState, slug, payment, 'flume_payment');
    }
  }

  return {
    state: newState,
    result: {
      success: true,
      itemsKept,
      itemsLostToDebt: itemsLost,
      debtPaid,
      remainingDebt: getTotalDebt(newState),
      goldKept: playerGold,
    },
  };
}

// ============================================
// Shop Price Calculation
// ============================================

export function getShopPriceMultiplier(
  state: DebtState,
  npcSlug: string
): number {
  const debt = getDebtToNPC(state, npcSlug);
  if (debt <= 0) return 1.0;

  return 1.0 + state.config.shopMarkupWhileIndebted;
}

export function shouldChallengeToCeelo(
  state: DebtState,
  npcSlug: string,
  npcWealth: number
): boolean {
  if (!state.config.ceeloChallengeOnDebt) return false;

  const debt = getDebtToNPC(state, npcSlug);
  return debt >= state.config.ceeloChallengeThreshold && npcWealth >= 100;
}

// ============================================
// Summary & Analysis
// ============================================

export interface DebtSummary {
  totalDebt: number;
  totalDebtEver: number;
  totalPaid: number;
  rescueCount: number;
  npcBreakdown: Array<{
    npcSlug: string;
    npcName: string;
    debt: number;
    isHostile: boolean;
    eventCount: number;
  }>;
}

export function getDebtSummary(state: DebtState): DebtSummary {
  const npcBreakdown: DebtSummary['npcBreakdown'] = [];

  for (const [slug, record] of state.npcDebts) {
    npcBreakdown.push({
      npcSlug: slug,
      npcName: record.npcName,
      debt: record.totalDebt,
      isHostile: record.isHostile,
      eventCount: record.debtHistory.length,
    });
  }

  // Sort by debt descending
  npcBreakdown.sort((a, b) => b.debt - a.debt);

  return {
    totalDebt: getTotalDebt(state),
    totalDebtEver: state.totalDebtEver,
    totalPaid: state.totalDebtPaid,
    rescueCount: state.rescueCount,
    npcBreakdown,
  };
}
