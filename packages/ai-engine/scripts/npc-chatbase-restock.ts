#!/usr/bin/env ts-node
/**
 * NPC Chatbase Restock Simulator v2
 *
 * Hyper-functional simulator for restocking NPC dialogue with quality control.
 * Combines hyperbolic time chamber mode, pantheon check-ins, and Claude-powered healing.
 *
 * Run with: npx tsx scripts/npc-chatbase-restock.ts
 *
 * Options:
 *   --hyperbolic=N        Run for N minutes in time chamber mode
 *   --include-pantheon    Die-rector check-ins every 2 simulated weeks
 *   --use-claude          Enable Claude for quality auditing + healing
 *   --heal-truncated      Auto-fix truncated entries with Claude
 *   --audit-existing      Run quality checks on existing chatbase JSONs
 *   --npc=slug            Filter to specific NPC
 *   --seed=X              Random seed (default: timestamp)
 *   --verbose             Show all activity
 *   --dry-run             Don't write files, just report
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Shared utilities
import {
  parseArgs,
  progressBar,
  setupGracefulShutdown,
  writeSimResults,
  printHeader,
  printSummary,
} from './lib';

// Canonical NPC data
import {
  ALL_NPCS,
  WANDERER_NPCS,
  TRAVELER_NPCS,
  PANTHEON_NPCS,
  getNPCDefinition,
  type EnhancedNPCConfig,
} from '../src/npcs/definitions';

// Seeded RNG
import { createSeededRng, type SeededRng } from '../src/core/seeded-rng';

// Dialogue templates
import { getTemplate, fillTemplate, NPC_ARCHETYPES } from './lib/dialogue-templates';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Config
// ============================================

interface Config {
  hyperbolic: number;      // Minutes to run (0 = single pass)
  includePantheon: boolean;
  useClaude: boolean;
  healTruncated: boolean;
  auditExisting: boolean;
  npc: string;
  seed: string;
  verbose: boolean;
  dryRun: boolean;
  iterations: number;
  maxTurns: number;
}

const DEFAULTS: Config = {
  hyperbolic: 0,
  includePantheon: false,
  useClaude: false,
  healTruncated: false,
  auditExisting: false,
  npc: '',
  seed: Date.now().toString(),
  verbose: false,
  dryRun: false,
  iterations: 3,
  maxTurns: 6,
};

// ============================================
// Types
// ============================================

interface QualityCheck {
  truncated: boolean;
  rambling: boolean;
  nonsense: boolean;
  offVoice: boolean;
  duplicate: boolean;
  issues: string[];
}

interface ChatbaseEntry {
  id: string;
  text: string;
  speaker: { slug: string; name: string; category: string };
  pool: string;
  mood: string;
  moodIntensity: number;
  contextTags: string[];
  metrics: { interestScore: number; source: string };
}

interface ConversationTurn {
  speaker: string;
  speakerName: string;
  text: string;
  mood: string;
  pool: string;
  reactionTo?: string;
  quality?: QualityCheck;
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  location: string;
  turns: ConversationTurn[];
  topic: string;
  startedBy: string;
  duration: number;
  simulatedDay: number;
  simulatedWeek: number;
}

interface PantheonMoment {
  id: string;
  dieRector: string;
  dieRectorName: string;
  domain: string;
  text: string;
  encounter: string;
  simulatedWeek: number;
  recentNpcs: string[];
}

interface RestockOutput {
  goodEntries: ChatbaseEntry[];
  healedEntries: ChatbaseEntry[];
  quarantinedEntries: Array<ChatbaseEntry & { qualityIssues: string[] }>;
  pantheonMoments: PantheonMoment[];
}

// ============================================
// Quality Detection
// ============================================

/**
 * Check if text appears truncated (incomplete sentence)
 * Ported from api/_lib/lookup.ts
 */
function isTruncated(text: string): boolean {
  if (!text || text.length < 10) return true;

  const trimmed = text.trim();
  // Valid endings: . ! ? " ' * ) ] (for actions and quotes)
  const validEndings = /[.!?"\'\*\)\]]$/;
  if (validEndings.test(trimmed)) return false;

  // Common truncation patterns (ends with article, conjunction, preposition, comma)
  const truncatedEndings = /\b(the|a|an|to|of|in|for|and|but|or|with|as|at|by|from|my|his|her|its|our|their|this|that|these|those|shall|will|can|may|must|would|could|should),?\s*$/i;
  if (truncatedEndings.test(trimmed)) return true;

  // Ends with comma, colon, or open quote
  if (/[,:\"]$/.test(trimmed)) return true;

  return false;
}

/**
 * Check if text is rambling (too long for its pool type)
 */
function isRambling(text: string, pool: string): boolean {
  const maxLengths: Record<string, number> = {
    greeting: 200,
    farewell: 200,
    idle: 150,
    reaction: 250,
    threat: 250,
    challenge: 300,
    salesPitch: 350,
    lore: 500,
    hint: 300,
    gamblingTrashTalk: 250,
    gamblingBrag: 250,
    gamblingFrustration: 250,
  };

  const maxLen = maxLengths[pool] || 300;
  return text.length > maxLen;
}

/**
 * Run all quality checks on text
 */
function detectBadEntry(text: string, npcSlug: string, pool: string): QualityCheck {
  const issues: string[] = [];

  const truncated = isTruncated(text);
  if (truncated) issues.push('truncated');

  const rambling = isRambling(text, pool);
  if (rambling) issues.push(`rambling (${text.length} chars)`);

  return {
    truncated,
    rambling,
    nonsense: false,  // Set by Claude if --use-claude
    offVoice: false,  // Set by Claude if --use-claude
    duplicate: false, // Set by deduplication check
    issues,
  };
}

// ============================================
// Claude Integration
// ============================================

let Anthropic: any = null;
let anthropicClient: any = null;

async function loadAnthropicSDK(): Promise<boolean> {
  try {
    const module = await import('@anthropic-ai/sdk');
    Anthropic = module.default;
    return true;
  } catch {
    return false;
  }
}

async function getClaudeClient(): Promise<any> {
  if (!Anthropic) {
    throw new Error('Anthropic SDK not loaded');
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic();
  }
  return anthropicClient;
}

interface ClaudeAudit {
  coherence: number;
  voice: number;
  completeness: number;
  issue: string | null;
}

/**
 * Use Claude to audit dialogue quality
 */
async function auditWithClaude(entry: ChatbaseEntry): Promise<ClaudeAudit | null> {
  try {
    const client = await getClaudeClient();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      system: `You are a dialogue quality auditor for NEVER DIE GUY, a roguelike dice game.
Evaluate NPC dialogue for issues. Be strict but fair.`,
      messages: [{
        role: 'user',
        content: `NPC: ${entry.speaker.name}
Pool: ${entry.pool}
Text: "${entry.text}"

Rate 1-5:
- COHERENCE (makes sense?)
- VOICE (matches ${entry.speaker.name}'s personality?)
- COMPLETENESS (complete thought?)

Reply ONLY with JSON: {"coherence":N,"voice":N,"completeness":N,"issue":"brief note or null"}`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text.trim());
      } catch {
        return null;
      }
    }
    return null;
  } catch (err) {
    console.error('[claude-audit] Error:', err);
    return null;
  }
}

/**
 * Use Claude to heal truncated dialogue
 */
async function healTruncatedEntry(entry: ChatbaseEntry): Promise<string | null> {
  try {
    const client = await getClaudeClient();

    // Get NPC persona for voice consistency
    const npc = getNPCDefinition(entry.speaker.slug);
    const voice = npc?.voice || 'neutral and helpful';

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: `You are ${entry.speaker.name} from NEVER DIE GUY.
Voice: ${voice}
Complete truncated dialogue naturally in character.`,
      messages: [{
        role: 'user',
        content: `Complete this truncated dialogue (1-2 sentences max):
"${entry.text}"

Rules:
- Stay in character as ${entry.speaker.name}
- Match existing tone and style
- Make it a complete thought
- Themes: never die, healing, persistence

Reply with ONLY the completed dialogue, nothing else.`
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }
    return null;
  } catch (err) {
    console.error('[claude-heal] Error:', err);
    return null;
  }
}

// ============================================
// Pantheon Check-ins
// ============================================

// Time simulation: 1 conversation ≈ 1 hour of NPC time
const PANTHEON_WEEK_LENGTH = 168; // 7 days × 24 hours
const PANTHEON_FREQUENCY = PANTHEON_WEEK_LENGTH * 2; // Every 2 weeks

interface DieRectorDef {
  slug: string;
  name: string;
  domain: string;
  die: string;
  tone: string;
  catchphrases: string[];
}

const DIE_RECTORS: DieRectorDef[] = [
  {
    slug: 'the-one',
    name: 'The One',
    domain: 'Null Providence',
    die: 'd4',
    tone: 'cosmic existential',
    catchphrases: [
      'All paths lead to null.',
      'The void remembers.',
      'Existence is the anomaly.',
    ],
  },
  {
    slug: 'john',
    name: 'John',
    domain: 'Earth',
    die: 'd6',
    tone: 'disappointed efficiency',
    catchphrases: [
      'Efficiency is paramount.',
      'Your performance metrics are... suboptimal.',
      'The machine never stops.',
    ],
  },
  {
    slug: 'peter',
    name: 'Peter',
    domain: 'Shadow Keep',
    die: 'd8',
    tone: 'judgmental',
    catchphrases: [
      'I see what you\'ve done.',
      'Judgment is inevitable.',
      'Your ledger grows heavy.',
    ],
  },
  {
    slug: 'robert',
    name: 'Robert',
    domain: 'Infernus',
    die: 'd10',
    tone: 'challenging',
    catchphrases: [
      'The fire reveals all.',
      'Burn, and become stronger.',
      'Only through trial do we become worthy.',
    ],
  },
  {
    slug: 'alice',
    name: 'Alice',
    domain: 'Frost Reach',
    die: 'd12',
    tone: 'patient temporal',
    catchphrases: [
      'Time means nothing here.',
      'All becomes ice eventually.',
      'Patience is its own reward.',
    ],
  },
  {
    slug: 'jane',
    name: 'Jane',
    domain: 'Aberrant',
    die: 'd20',
    tone: 'chaotic appreciative',
    catchphrases: [
      'Roll the bones!',
      'Chaos is the only truth.',
      'Expect nothing. Accept everything.',
    ],
  },
];

function shouldPantheonIntervene(conversationCount: number): boolean {
  return conversationCount > 0 && conversationCount % PANTHEON_FREQUENCY === 0;
}

function generatePantheonCheckIn(
  conversationCount: number,
  recentNpcs: string[],
  rng: SeededRng
): PantheonMoment {
  const week = Math.floor(conversationCount / PANTHEON_WEEK_LENGTH);
  const dieRector = DIE_RECTORS[Math.floor(rng.random('pantheon') * DIE_RECTORS.length)];
  const catchphrase = dieRector.catchphrases[Math.floor(rng.random('phrase') * dieRector.catchphrases.length)];

  const npcNames = recentNpcs.slice(0, 3).join(', ');

  const texts = [
    `*${dieRector.name} observes from ${dieRector.domain}* ${catchphrase} I have watched ${npcNames} and their dealings. The patterns... are noted.`,
    `*a presence from ${dieRector.domain}* ${catchphrase} Week ${week} of mortal scheming. ${npcNames} continue as expected.`,
    `*${dieRector.name}'s voice echoes* ${catchphrase} The market persists. ${npcNames} play their roles. As do we all.`,
  ];

  return {
    id: `pantheon-${dieRector.slug}-week-${week}`,
    dieRector: dieRector.slug,
    dieRectorName: dieRector.name,
    domain: dieRector.domain,
    text: texts[Math.floor(rng.random('text') * texts.length)],
    encounter: 'observation',
    simulatedWeek: week,
    recentNpcs: recentNpcs.slice(0, 5),
  };
}

// ============================================
// Conversation Topics & Pools
// ============================================

const TOPICS = [
  'gambling', 'trade', 'combat', 'death', 'domains', 'dice',
  'player', 'weather', 'rumors', 'philosophy', 'business', 'music',
];

const LOCATIONS = [
  'market-square', 'back-alley', 'sphere-stands', 'the-wandering-market',
];

function getTopicPoolWeights(topic: string): Record<string, number> {
  // Rebalanced to fill underrepresented pools (greeting, farewell, hint, salesPitch, idle)
  const baseWeights: Record<string, number> = {
    greeting: 25,      // Was 10 - severely underrepresented
    farewell: 20,      // Was 5 - severely underrepresented
    hint: 20,          // Was 10 - severely underrepresented
    salesPitch: 15,    // Was 5 - severely underrepresented
    idle: 15,          // Was 5 - severely underrepresented
    lore: 15,
    reaction: 15,
    challenge: 10,
    threat: 5,
    // Deprioritize oversaturated pools:
    // gamblingTrashTalk, gamblingBrag, gamblingFrustration handled separately
  };

  switch (topic) {
    case 'gambling':
    case 'dice':
      baseWeights.challenge = 20;
      baseWeights.hint = 15;
      break;
    case 'trade':
    case 'business':
      baseWeights.salesPitch = 30;
      baseWeights.greeting = 20;
      break;
    case 'combat':
      baseWeights.threat = 15;
      baseWeights.challenge = 20;
      break;
    case 'philosophy':
    case 'death':
      baseWeights.lore = 25;
      baseWeights.hint = 20;
      break;
    case 'rumors':
      baseWeights.hint = 30;
      baseWeights.lore = 20;
      break;
    case 'weather':
    case 'domains':
      baseWeights.idle = 20;
      baseWeights.lore = 20;
      break;
  }

  return baseWeights;
}

function selectPool(weights: Record<string, number>, rng: SeededRng): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = rng.random('pool') * total;

  for (const [pool, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return pool;
  }

  return 'reaction';
}

// ============================================
// Dialogue Generation
// ============================================

const DOMAIN_NAMES = ['Null Providence', 'Earth', 'Shadow Keep', 'Infernus', 'Frost Reach', 'Aberrant'];
const DIE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

function generateDialogue(
  npc: EnhancedNPCConfig,
  topic: string,
  pool: string,
  targetNpc: EnhancedNPCConfig | null,
  rng: SeededRng
): string {
  const targetName = targetNpc?.identity.name || 'traveler';
  const domain = DOMAIN_NAMES[Math.floor(rng.random('domain') * DOMAIN_NAMES.length)];
  const die = DIE_TYPES[Math.floor(rng.random('die') * DIE_TYPES.length)];

  // Get template from archetype-aware template system
  const template = getTemplate(npc.identity.slug, pool, rng);

  if (!template) {
    // Fallback for unknown pools
    return `*acknowledges ${targetName}*`;
  }

  return fillTemplate(template, { target: targetName, domain, die });
}

function getMood(npc: EnhancedNPCConfig, rng: SeededRng): string {
  const moods = ['neutral', 'pleased', 'amused', 'curious', npc.defaultMood];
  return moods[Math.floor(rng.random('mood') * moods.length)];
}

// ============================================
// Conversation Simulation
// ============================================

function simulateConversation(
  participants: EnhancedNPCConfig[],
  location: string,
  rng: SeededRng,
  maxTurns: number,
  conversationCount: number
): Conversation {
  const topic = TOPICS[Math.floor(rng.random('topic') * TOPICS.length)];
  const turns: ConversationTurn[] = [];

  const firstSpeaker = participants[Math.floor(rng.random('first') * participants.length)];
  const poolWeights = getTopicPoolWeights(topic);

  let currentSpeakerIdx = participants.indexOf(firstSpeaker);
  let lastSpeaker: EnhancedNPCConfig | null = null;

  // Decide actual turn count
  let actualTurns = maxTurns;
  for (let t = 3; t < maxTurns; t++) {
    if (rng.random(`early-end-${t}`) < 0.15) {
      actualTurns = t + 1;
      break;
    }
  }

  for (let i = 0; i < actualTurns; i++) {
    const speaker = participants[currentSpeakerIdx];
    const others = participants.filter(p => p.identity.slug !== speaker.identity.slug);
    const target = others.length > 0 ? others[Math.floor(rng.random('target') * others.length)] : null;

    let pool: string;
    if (i === 0) {
      pool = 'greeting';
    } else if (i === actualTurns - 1) {
      pool = 'farewell';
    } else {
      const midConvoWeights = { ...poolWeights, farewell: 0, greeting: 0 };
      pool = selectPool(midConvoWeights, rng);
    }

    const mood = getMood(speaker, rng);
    const text = generateDialogue(speaker, topic, pool, target, rng);
    const quality = detectBadEntry(text, speaker.identity.slug, pool);

    turns.push({
      speaker: speaker.identity.slug,
      speakerName: speaker.identity.name,
      text,
      mood,
      pool,
      reactionTo: lastSpeaker?.identity.slug,
      quality,
    });

    lastSpeaker = speaker;
    currentSpeakerIdx = (currentSpeakerIdx + 1) % participants.length;
  }

  const simulatedDay = Math.floor(conversationCount / 24);
  const simulatedWeek = Math.floor(conversationCount / PANTHEON_WEEK_LENGTH);

  return {
    id: `conv-${rng.random('id').toString(36).slice(2, 8)}`,
    participants: participants.map(p => p.identity.slug),
    participantNames: participants.map(p => p.identity.name),
    location,
    turns,
    topic,
    startedBy: firstSpeaker.identity.slug,
    duration: turns.length,
    simulatedDay,
    simulatedWeek,
  };
}

function generatePairs(npcs: EnhancedNPCConfig[]): [EnhancedNPCConfig, EnhancedNPCConfig][] {
  const pairs: [EnhancedNPCConfig, EnhancedNPCConfig][] = [];
  for (let i = 0; i < npcs.length; i++) {
    for (let j = i + 1; j < npcs.length; j++) {
      pairs.push([npcs[i], npcs[j]]);
    }
  }
  return pairs;
}

// ============================================
// Main
// ============================================

async function main(): Promise<void> {
  const config = parseArgs(process.argv.slice(2), DEFAULTS);
  let rng = createSeededRng(config.seed);
  const startTime = Date.now();

  // Setup shutdown handler
  let interrupted = false;
  setupGracefulShutdown(() => {
    interrupted = true;
    console.log('\nSaving progress...');
  });

  printHeader('Chatbase Restock Simulator v2');
  console.log(`Seed: ${config.seed}`);
  console.log(`Hyperbolic: ${config.hyperbolic > 0 ? `${config.hyperbolic} minutes` : 'single pass'}`);
  console.log(`Include Pantheon: ${config.includePantheon}`);
  console.log(`Use Claude: ${config.useClaude}`);
  console.log(`Heal Truncated: ${config.healTruncated}`);

  // Load Claude SDK if needed
  if (config.useClaude || config.healTruncated) {
    const loaded = await loadAnthropicSDK();
    if (!loaded) {
      console.error('WARNING: @anthropic-ai/sdk not installed. Claude features disabled.');
      config.useClaude = false;
      config.healTruncated = false;
    }
  }

  // Select NPCs
  let npcs = [...WANDERER_NPCS, ...TRAVELER_NPCS];
  if (config.npc) {
    const filterNpc = npcs.find(n => n.identity.slug === config.npc);
    if (!filterNpc) {
      console.error(`NPC not found: ${config.npc}`);
      process.exit(1);
    }
    console.log(`Filtering to: ${filterNpc.identity.name}`);
  }

  const pairs = generatePairs(npcs);
  const filteredPairs = config.npc
    ? pairs.filter(([a, b]) => a.identity.slug === config.npc || b.identity.slug === config.npc)
    : pairs;

  console.log(`\nNPCs: ${npcs.length}`);
  console.log(`Pairs: ${filteredPairs.length}`);
  console.log(`Pantheon frequency: every ${PANTHEON_FREQUENCY} conversations (~2 weeks)`);

  // Output tracking - buffers that get flushed periodically
  const output: RestockOutput = {
    goodEntries: [],
    healedEntries: [],
    quarantinedEntries: [],
    pantheonMoments: [],
  };

  // Running stats (memory-efficient - only counts, not full data)
  const stats = {
    totalConversations: 0,
    totalTurns: 0,
    truncatedCount: 0,
    ramblingCount: 0,
    healedCount: 0,
    pantheonCount: 0,
    goodEntriesTotal: 0,
    healedEntriesTotal: 0,
    speakerCounts: {} as Record<string, number>,
    recentNpcs: [] as string[],
  };

  const conversationsPerPass = filteredPairs.length * config.iterations;
  let completed = 0;
  let passNumber = 0;
  const endTime = config.hyperbolic > 0 ? startTime + config.hyperbolic * 60 * 1000 : 0;

  // Setup output directory for streaming writes
  const logDir = path.join(__dirname, '../logs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(logDir, `restock-${timestamp}`);
  if (!config.dryRun) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const FLUSH_THRESHOLD = 500; // Flush to disk when buffer hits this size

  function flushBuffers(): void {
    if (config.dryRun) {
      // Just clear without writing
      output.goodEntries = [];
      output.healedEntries = [];
      output.pantheonMoments = [];
      return;
    }

    // Append good entries as JSONL (one JSON object per line)
    if (output.goodEntries.length > 0) {
      const lines = output.goodEntries.map(e => JSON.stringify(e)).join('\n') + '\n';
      fs.appendFileSync(path.join(outputDir, 'restocked-entries.jsonl'), lines);
      stats.goodEntriesTotal += output.goodEntries.length;
      output.goodEntries = [];
    }

    if (output.healedEntries.length > 0) {
      const lines = output.healedEntries.map(e => JSON.stringify(e)).join('\n') + '\n';
      fs.appendFileSync(path.join(outputDir, 'healed-entries.jsonl'), lines);
      stats.healedEntriesTotal += output.healedEntries.length;
      output.healedEntries = [];
    }

    if (output.pantheonMoments.length > 0) {
      const lines = output.pantheonMoments.map(e => JSON.stringify(e)).join('\n') + '\n';
      fs.appendFileSync(path.join(outputDir, 'pantheon-moments.jsonl'), lines);
      output.pantheonMoments = [];
    }
  }

  // Hyperbolic time chamber loop
  do {
    passNumber++;
    if (config.hyperbolic > 0) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.floor((endTime - Date.now()) / 1000);
      console.log(`\n--- Pass ${passNumber} | Elapsed: ${elapsed}s | Remaining: ${remaining}s ---`);
      rng = createSeededRng(`${config.seed}-pass-${passNumber}`);
      completed = 0;
    }

    // Simulate pair conversations
    for (const [npcA, npcB] of filteredPairs) {
      if (interrupted) break;

      for (let i = 0; i < config.iterations; i++) {
        const location = LOCATIONS[Math.floor(rng.random('location') * LOCATIONS.length)];
        const conv = simulateConversation([npcA, npcB], location, rng, config.maxTurns, stats.totalConversations);

        stats.totalConversations++;
        stats.totalTurns += conv.turns.length;

        // Track recent NPCs for pantheon
        stats.recentNpcs.push(...conv.participants);
        if (stats.recentNpcs.length > 20) {
          stats.recentNpcs = stats.recentNpcs.slice(-20);
        }

        // Process turns
        for (const turn of conv.turns) {
          stats.speakerCounts[turn.speaker] = (stats.speakerCounts[turn.speaker] || 0) + 1;

          if (turn.quality) {
            if (turn.quality.truncated) {
              stats.truncatedCount++;

              // Try to heal if enabled
              if (config.healTruncated && config.useClaude) {
                const healed = await healTruncatedEntry({
                  id: `heal-${turn.speaker}-${stats.totalConversations}`,
                  text: turn.text,
                  speaker: { slug: turn.speaker, name: turn.speakerName, category: 'wanderer' },
                  pool: turn.pool,
                  mood: turn.mood,
                  moodIntensity: 50,
                  contextTags: [conv.topic],
                  metrics: { interestScore: 70, source: 'healed' },
                });

                if (healed) {
                  stats.healedCount++;
                  output.healedEntries.push({
                    id: `healed-${turn.speaker}-${stats.totalConversations}`,
                    text: healed,
                    speaker: { slug: turn.speaker, name: turn.speakerName, category: 'wanderer' },
                    pool: turn.pool,
                    mood: turn.mood,
                    moodIntensity: 50,
                    contextTags: [conv.topic, 'healed'],
                    metrics: { interestScore: 75, source: 'claude_healed' },
                  });
                }
              }
            }

            if (turn.quality.rambling) {
              stats.ramblingCount++;
            }

            // Good entries go to output
            if (!turn.quality.truncated && !turn.quality.rambling && turn.text.length > 10) {
              output.goodEntries.push({
                id: `restock-${turn.speaker}-${stats.totalConversations}`,
                text: turn.text,
                speaker: { slug: turn.speaker, name: turn.speakerName, category: 'wanderer' },
                pool: turn.pool,
                mood: turn.mood,
                moodIntensity: 50,
                contextTags: [conv.topic, conv.location],
                metrics: { interestScore: 70, source: 'restock_sim' },
              });
            }
          }
        }

        // Pantheon check-in
        if (config.includePantheon && shouldPantheonIntervene(stats.totalConversations)) {
          const moment = generatePantheonCheckIn(stats.totalConversations, [...new Set(stats.recentNpcs)], rng);
          output.pantheonMoments.push(moment);
          stats.pantheonCount++;

          if (config.verbose) {
            console.log(`\n  [PANTHEON] ${moment.dieRectorName}: "${moment.text.substring(0, 60)}..."`);
          }
        }

        completed++;
        if (completed % 50 === 0 || config.verbose) {
          process.stdout.write(`\rProgress: ${progressBar(completed, conversationsPerPass)}`);
        }

        // Flush buffers periodically to prevent OOM
        if (output.goodEntries.length >= FLUSH_THRESHOLD) {
          flushBuffers();
        }
      }
    }

    // Flush at end of each pass
    flushBuffers();

  } while (config.hyperbolic > 0 && Date.now() < endTime && !interrupted);

  console.log(); // New line after progress

  // Final flush of any remaining buffered entries
  flushBuffers();

  const duration = Date.now() - startTime;

  // Write quality report
  if (!config.dryRun) {
    const report = `# Chatbase Restock Report

Generated: ${new Date().toISOString()}
Duration: ${Math.floor(duration / 1000)}s
Passes: ${passNumber}

## Statistics

- Total Conversations: ${stats.totalConversations}
- Total Turns: ${stats.totalTurns}
- Good Entries: ${stats.goodEntriesTotal}
- Truncated: ${stats.truncatedCount}
- Healed: ${stats.healedEntriesTotal}
- Rambling: ${stats.ramblingCount}
- Pantheon Moments: ${stats.pantheonCount}

## Top Speakers

${Object.entries(stats.speakerCounts)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10)
  .map(([slug, count]) => `- ${slug}: ${count} lines`)
  .join('\n')}

## Quality Summary

- Truncation Rate: ${((stats.truncatedCount / stats.totalTurns) * 100).toFixed(1)}%
- Rambling Rate: ${((stats.ramblingCount / stats.totalTurns) * 100).toFixed(1)}%
- Heal Success Rate: ${stats.truncatedCount > 0 ? ((stats.healedEntriesTotal / stats.truncatedCount) * 100).toFixed(1) : 0}%

## Output Files

- restocked-entries.jsonl (${stats.goodEntriesTotal} entries)
- healed-entries.jsonl (${stats.healedEntriesTotal} entries)
- pantheon-moments.jsonl (${stats.pantheonCount} entries)

Note: Output files are in JSONL format (one JSON object per line) for streaming efficiency.
`;

    fs.writeFileSync(path.join(outputDir, 'quality-report.md'), report);
    console.log(`\nOutput: ${outputDir}`);
  }

  // Print summary
  printSummary('Chatbase Restock', duration, {
    'Conversations': stats.totalConversations,
    'Total turns': stats.totalTurns,
    'Good entries': stats.goodEntriesTotal,
    'Truncated': stats.truncatedCount,
    'Healed': stats.healedEntriesTotal,
    'Pantheon moments': stats.pantheonCount,
    'Passes': passNumber,
  });
}

main().catch(console.error);
