/**
 * Variable Processor
 *
 * Process {{variable}} tokens in template text.
 * Supports player context, NPC context, and domain-specific variables.
 */

import type { ResponseContext, NPCPersonalityConfig } from './types';
import { describeFavorLevel, getFavorLevel } from './relationship';

// ============================================
// Variable Context
// ============================================

export interface VariableContext {
  // Player info
  playerName?: string;
  playerGold?: number;
  playerIntegrity?: number;
  playerLuckyNumber?: number;

  // NPC info
  npcName?: string;
  npcDomain?: string;
  npcElement?: string;

  // Run state
  currentDomain?: string;
  roomIndex?: number;
  heat?: number;

  // Relationship
  favorLevel?: number;

  // Item context (for shop messages)
  itemName?: string;
  itemPrice?: number;

  // Memory context (Phase 5)
  myTotalDeaths?: number;
  myDeathsThisRun?: number;
  witnessedDeaths?: number;
  witnessedDeathsThisRun?: number;
  survivalStreak?: number;
  longestSurvivalStreak?: number;
  sharedTraumaWith?: string;
  traumaBondCount?: number;
  lastVictim?: string;
  strikeCount?: number;
  degradationLevel?: string;

  // Domain-specific overrides
  domainVariables?: Record<string, string>;
}

// ============================================
// Variable Definitions
// ============================================

type VariableResolver = (ctx: VariableContext) => string;

const VARIABLE_RESOLVERS: Record<string, VariableResolver> = {
  // Player variables
  '{{playerName}}': (ctx) => ctx.playerName || 'Traveler',
  '{{gold}}': (ctx) => (ctx.playerGold ?? 0).toLocaleString(),
  '{{integrity}}': (ctx) => String(ctx.playerIntegrity ?? 100),
  '{{luckyNumber}}': (ctx) => String(ctx.playerLuckyNumber ?? 0),

  // NPC variables
  '{{npcName}}': (ctx) => ctx.npcName || 'Unknown',
  '{{domain}}': (ctx) => ctx.npcDomain || ctx.currentDomain || 'the void',
  '{{element}}': (ctx) => ctx.npcElement || 'unknown',

  // Relationship
  '{{favorLevel}}': (ctx) =>
    ctx.favorLevel !== undefined ? describeFavorLevel(ctx.favorLevel) : 'unknown',
  '{{favorNumber}}': (ctx) => String(ctx.favorLevel ?? 0),

  // Run state
  '{{currentDomain}}': (ctx) => ctx.currentDomain || 'the void',
  '{{roomIndex}}': (ctx) => String(ctx.roomIndex ?? 0),
  '{{heat}}': (ctx) => String(ctx.heat ?? 0),

  // Item context
  '{{itemName}}': (ctx) => ctx.itemName || 'mysterious item',
  '{{itemPrice}}': (ctx) => (ctx.itemPrice ?? 0).toLocaleString(),

  // Time expressions
  '{{timeGreeting}}': () => getTimeGreeting(),

  // Fallback for domain-specific (handled separately)
  '{{hazard}}': (ctx) => ctx.domainVariables?.['{{hazard}}'] || 'danger',
  '{{directorName}}': (ctx) => ctx.domainVariables?.['{{directorName}}'] || 'the director',

  // Memory variables (Phase 5)
  '{{myTotalDeaths}}': (ctx) => String(ctx.myTotalDeaths ?? 0),
  '{{myDeathsThisRun}}': (ctx) => String(ctx.myDeathsThisRun ?? 0),
  '{{witnessedDeaths}}': (ctx) => String(ctx.witnessedDeaths ?? 0),
  '{{witnessedDeathsThisRun}}': (ctx) => String(ctx.witnessedDeathsThisRun ?? 0),
  '{{survivalStreak}}': (ctx) => String(ctx.survivalStreak ?? 0),
  '{{longestSurvivalStreak}}': (ctx) => String(ctx.longestSurvivalStreak ?? 0),
  '{{sharedTraumaWith}}': (ctx) => ctx.sharedTraumaWith || 'no one',
  '{{traumaBondCount}}': (ctx) => String(ctx.traumaBondCount ?? 0),
  '{{lastVictim}}': (ctx) => ctx.lastVictim || 'no one',
  '{{strikeCount}}': (ctx) => String(ctx.strikeCount ?? 0),
  '{{degradationLevel}}': (ctx) => ctx.degradationLevel || 'normal',
};

// ============================================
// Variable Processing
// ============================================

/**
 * Process all variables in a template string
 */
export function processVariables(
  text: string,
  context: VariableContext
): string {
  let result = text;

  // Process known variables
  for (const [variable, resolver] of Object.entries(VARIABLE_RESOLVERS)) {
    if (result.includes(variable)) {
      result = result.replace(new RegExp(escapeRegex(variable), 'g'), resolver(context));
    }
  }

  // Process any domain-specific variables not in standard set
  if (context.domainVariables) {
    for (const [variable, value] of Object.entries(context.domainVariables)) {
      if (result.includes(variable)) {
        result = result.replace(new RegExp(escapeRegex(variable), 'g'), value);
      }
    }
  }

  return result;
}

/**
 * Check for undefined variables in a template (for linting)
 */
export function findUndefinedVariables(
  text: string,
  domainVariables: string[] = []
): string[] {
  const allVariables = text.match(/\{\{\w+\}\}/g) || [];
  const knownVariables = [
    ...Object.keys(VARIABLE_RESOLVERS),
    ...domainVariables,
  ];

  return allVariables.filter((v) => !knownVariables.includes(v));
}

/**
 * Get all known variable names (for documentation)
 */
export function getKnownVariables(): string[] {
  return Object.keys(VARIABLE_RESOLVERS);
}

// ============================================
// Context Building
// ============================================

/**
 * Build variable context from response context and NPC config
 */
export function buildVariableContext(
  responseContext: ResponseContext,
  npcConfig?: NPCPersonalityConfig,
  domainVariables?: Record<string, string>,
  memoryVariables?: Record<string, string | number>
): VariableContext {
  return {
    playerName: 'Traveler', // Could come from player profile
    playerGold: responseContext.playerGold,
    playerIntegrity: responseContext.playerIntegrity,
    playerLuckyNumber: responseContext.playerLuckyNumber,

    npcName: npcConfig?.name,
    // npcDomain and npcElement would come from wiki entity data

    currentDomain: responseContext.currentDomain,
    roomIndex: responseContext.roomIndex,
    heat: responseContext.heat,

    favorLevel: responseContext.relationship
      ? getFavorLevel(responseContext.relationship)
      : undefined,

    // Memory variables (Phase 5)
    myTotalDeaths: memoryVariables?.myTotalDeaths as number | undefined,
    myDeathsThisRun: memoryVariables?.myDeathsThisRun as number | undefined,
    witnessedDeaths: memoryVariables?.witnessedDeaths as number | undefined,
    witnessedDeathsThisRun: memoryVariables?.witnessedDeathsThisRun as number | undefined,
    survivalStreak: memoryVariables?.survivalStreak as number | undefined,
    longestSurvivalStreak: memoryVariables?.longestSurvivalStreak as number | undefined,
    sharedTraumaWith: memoryVariables?.sharedTraumaWith as string | undefined,
    traumaBondCount: memoryVariables?.traumaBondCount as number | undefined,

    domainVariables,
  };
}

// ============================================
// Helpers
// ============================================

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'late night';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// Variable Extraction (for templates)
// ============================================

/**
 * Extract all variable names from a template string
 */
export function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{\w+\}\}/g) || [];
  return [...new Set(matches)];
}

/**
 * Check if a template uses any variables
 */
export function hasVariables(text: string): boolean {
  return /\{\{\w+\}\}/.test(text);
}
