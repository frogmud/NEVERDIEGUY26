#!/usr/bin/env ts-node
/**
 * Chatbase Extraction Script
 *
 * Extracts dialogue from simulation logs and builds a chatbase for instant lookups.
 *
 * Sources:
 * - Eternal logs: logs/eternal-X/days/day-NNNN.md
 * - Chatter logs: logs/chatter-X/conversations.json
 *
 * Output:
 * - chatbase/manifest.json
 * - chatbase/npcs/{slug}.json
 * - chatbase/indexes/by-pool.json
 * - chatbase/indexes/by-mood.json
 *
 * Usage:
 *   npx tsx scripts/extract-chatbase.ts [--verbose] [--min-interest=N]
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import type { NPCCategory, MoodType, TemplatePool } from '../src/core/types';
import type {
  ChatbaseEntry,
  ChatbaseMetrics,
  ChatbaseMetadata,
  ChatbaseTriggers,
  ChatbaseManifest,
  ChatbaseNPCFile,
} from '../src/search/chatbase-types';
import {
  hashContent,
  classifyPool,
  inferMood,
} from '../src/search/chatbase-types';

// ============================================
// Configuration
// ============================================

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const OUTPUT_DIR = path.join(__dirname, '..', 'chatbase');
const MIN_INTEREST_SCORE = 40;
const SCHEMA_VERSION = 1;

// ============================================
// NPC Name to Slug Mapping
// ============================================

const NAME_TO_SLUG: Record<string, string> = {
  // Wanderers
  'willy one eye': 'willy',
  'willy': 'willy',
  'mr. bones': 'mr-bones',
  'mr bones': 'mr-bones',
  'dr. maxwell': 'dr-maxwell',
  'dr maxwell': 'dr-maxwell',
  'boo g': 'boo-g',
  'boo-g': 'boo-g',
  'the general': 'the-general',
  'general': 'the-general',
  'dr. voss': 'dr-voss',
  'dr voss': 'dr-voss',
  'x-treme': 'xtreme',
  'xtreme': 'xtreme',
  'king james': 'king-james',

  // Travelers
  'stitch-up girl': 'stitch-up-girl',
  'stitch up girl': 'stitch-up-girl',
  'body count': 'body-count',
  'boots': 'boots',
  'detective clausen': 'clausen',
  'clausen': 'clausen',
  'keith man': 'keith-man',
  'mr. kevin': 'mr-kevin',
  'mr kevin': 'mr-kevin',

  // Pantheon
  'the one': 'the-one',
  'john': 'john',
  'peter': 'peter',
  'robert': 'robert',
  'alice': 'alice',
  'jane': 'jane',
  'rhea': 'rhea',
  'zero chance': 'zero-chance',
  'alien baby': 'alien-baby',
};

const SLUG_TO_CATEGORY: Record<string, NPCCategory> = {
  // Wanderers
  'willy': 'wanderers',
  'mr-bones': 'wanderers',
  'dr-maxwell': 'wanderers',
  'boo-g': 'wanderers',
  'the-general': 'wanderers',
  'dr-voss': 'wanderers',
  'xtreme': 'wanderers',
  'king-james': 'wanderers',

  // Travelers
  'stitch-up-girl': 'travelers',
  'body-count': 'travelers',
  'boots': 'travelers',
  'clausen': 'travelers',
  'keith-man': 'travelers',
  'mr-kevin': 'travelers',

  // Pantheon
  'the-one': 'pantheon',
  'john': 'pantheon',
  'peter': 'pantheon',
  'robert': 'pantheon',
  'alice': 'pantheon',
  'jane': 'pantheon',
  'rhea': 'pantheon',
  'zero-chance': 'pantheon',
  'alien-baby': 'pantheon',
};

const SLUG_TO_NAME: Record<string, string> = {
  'willy': 'Willy One Eye',
  'mr-bones': 'Mr. Bones',
  'dr-maxwell': 'Dr. Maxwell',
  'boo-g': 'Boo G',
  'the-general': 'The General',
  'dr-voss': 'Dr. Voss',
  'xtreme': 'X-treme',
  'king-james': 'King James',
  'stitch-up-girl': 'Stitch Up Girl',
  'body-count': 'Body Count',
  'boots': 'Boots',
  'clausen': 'Detective Clausen',
  'keith-man': 'Keith Man',
  'mr-kevin': 'Mr. Kevin',
  'the-one': 'The One',
  'john': 'John',
  'peter': 'Peter',
  'robert': 'Robert',
  'alice': 'Alice',
  'jane': 'Jane',
  'rhea': 'Rhea',
  'zero-chance': 'Zero Chance',
  'alien-baby': 'Alien Baby',
};

// ============================================
// Parsing Helpers
// ============================================

function normalizeNPCName(name: string): string | null {
  const lower = name.toLowerCase().trim();
  return NAME_TO_SLUG[lower] || null;
}

function parseVibes(vibesSection: string): Map<string, { mood: MoodType; intensity: number }> {
  const vibes = new Map<string, { mood: MoodType; intensity: number }>();
  const lines = vibesSection.split('\n').filter(l => l.startsWith('-'));

  for (const line of lines) {
    // Format: "- Willy One Eye: tilted (-3)"
    const match = line.match(/^-\s+(.+?):\s+(\w+)\s+\(([+-]?\d+)\)/);
    if (match) {
      const name = match[1];
      const moodWord = match[2].toLowerCase();
      const intensity = parseInt(match[3], 10);

      const slug = normalizeNPCName(name);
      if (slug) {
        // Map mood words to MoodType
        let mood: MoodType = 'neutral';
        if (moodWord === 'tilted') mood = 'annoyed';
        else if (moodWord === 'cold') mood = 'threatening';
        else if (moodWord === 'smug') mood = 'pleased';
        else if (moodWord === 'hot') mood = 'amused';

        vibes.set(slug, { mood, intensity });
      }
    }
  }

  return vibes;
}

function parseWeather(content: string): string | undefined {
  const match = content.match(/Weather:\s*(\w+)/i);
  return match ? match[1] : undefined;
}

function parseStreaks(highlightsSection: string): Map<string, { type: 'loss' | 'win'; streak: number }> {
  const streaks = new Map<string, { type: 'loss' | 'win'; streak: number }>();
  const lines = highlightsSection.split('\n');

  for (const line of lines) {
    // Format: "- Willy One Eye is on tilt (3 loss streak)"
    const lossMatch = line.match(/^-\s+(.+?)\s+is on tilt\s+\((\d+)\s+loss streak\)/i);
    if (lossMatch) {
      const slug = normalizeNPCName(lossMatch[1]);
      if (slug) {
        streaks.set(slug, { type: 'loss', streak: parseInt(lossMatch[2], 10) });
      }
    }

    // Win streak pattern (if any)
    const winMatch = line.match(/^-\s+(.+?)\s+is hot\s+\((\d+)\s+win streak\)/i);
    if (winMatch) {
      const slug = normalizeNPCName(winMatch[1]);
      if (slug) {
        streaks.set(slug, { type: 'win', streak: parseInt(winMatch[2], 10) });
      }
    }
  }

  return streaks;
}

interface OverheardEntry {
  speaker: string;
  speakerName: string;
  target?: string;
  targetName?: string;
  text: string;
}

function parseOverheard(overheardSection: string): OverheardEntry[] {
  const entries: OverheardEntry[] = [];

  // Split by speaker blocks: **Name** *(to Target)*
  const blocks = overheardSection.split(/(?=\*\*[^*]+\*\*)/);

  for (const block of blocks) {
    if (!block.trim()) continue;

    // Parse speaker and target
    const headerMatch = block.match(/^\*\*([^*]+)\*\*\s*\*?\(?(?:to\s+)?([^)]*?)?\)?\*?/);
    if (!headerMatch) continue;

    const speakerName = headerMatch[1].trim();
    const targetName = headerMatch[2]?.trim();

    const speakerSlug = normalizeNPCName(speakerName);
    if (!speakerSlug) continue;

    // Extract text (after the > quote marker)
    const textMatch = block.match(/>\s*(.+)/s);
    if (!textMatch) continue;

    const text = textMatch[1].trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
    if (!text || text.length < 10) continue; // Skip very short entries

    const targetSlug = targetName ? normalizeNPCName(targetName) : undefined;

    entries.push({
      speaker: speakerSlug,
      speakerName,
      target: targetSlug,
      targetName,
      text,
    });
  }

  return entries;
}

// ============================================
// Eternal Log Parser
// ============================================

interface EternalDayData {
  day: number;
  weather?: string;
  overheard: OverheardEntry[];
  vibes: Map<string, { mood: MoodType; intensity: number }>;
  streaks: Map<string, { type: 'loss' | 'win'; streak: number }>;
}

function parseEternalDay(content: string, filename: string): EternalDayData | null {
  // Extract day number
  const dayMatch = filename.match(/day-(\d+)\.md$/);
  if (!dayMatch) return null;
  const day = parseInt(dayMatch[1], 10);

  // Find sections
  const highlightsStart = content.indexOf('## Highlights');
  const overheardStart = content.indexOf('## Overheard');
  const vibesStart = content.indexOf('## Vibes');

  if (overheardStart === -1) return null;

  const weather = parseWeather(content);

  const highlightsSection = highlightsStart !== -1 && overheardStart !== -1
    ? content.substring(highlightsStart, overheardStart)
    : '';

  const overheardSection = vibesStart !== -1
    ? content.substring(overheardStart, vibesStart)
    : content.substring(overheardStart);

  const vibesSection = vibesStart !== -1
    ? content.substring(vibesStart)
    : '';

  const overheard = parseOverheard(overheardSection);
  const vibes = parseVibes(vibesSection);
  const streaks = parseStreaks(highlightsSection);

  return {
    day,
    weather,
    overheard,
    vibes,
    streaks,
  };
}

// ============================================
// Archetype & Debt Affinity Tagging
// ============================================

import type { PlayerArchetype } from '../src/player/player-profile';
import type { DebtTension } from '../src/player/debt-tension';

/**
 * Tag entries with archetype affinity based on text content
 */
function tagArchetypeAffinity(entry: ChatbaseEntry): void {
  const text = entry.text.toLowerCase();
  entry.triggers ??= {};

  // Aggressive affinity - damage, attack, reckless
  if (
    text.includes('reckless') ||
    text.includes('damage') ||
    text.includes('destroy') ||
    text.includes('attack') ||
    text.includes('strike first') ||
    text.includes('all or nothing') ||
    text.includes('hit hard')
  ) {
    entry.triggers.playerArchetype = 'aggressive' as PlayerArchetype;
  }

  // Defensive affinity - survive, endure, patient
  if (
    text.includes('survive') ||
    text.includes('endure') ||
    text.includes('patient') ||
    text.includes('careful') ||
    text.includes('cautious') ||
    text.includes('protect') ||
    text.includes('shield')
  ) {
    entry.triggers.playerArchetype = 'defensive' as PlayerArchetype;
  }

  // Chaotic affinity - gamble, risk, chaos, luck
  if (
    text.includes('gamble') ||
    text.includes('risk') ||
    text.includes('chaos') ||
    text.includes('luck') ||
    text.includes('wild') ||
    text.includes('reroll') ||
    text.includes('unpredictable')
  ) {
    entry.triggers.playerArchetype = 'chaotic' as PlayerArchetype;
  }

  // Clean up empty triggers
  if (Object.keys(entry.triggers).length === 0) {
    entry.triggers = undefined;
  }
}

/**
 * Tag entries with debt tension level based on text content
 */
function tagDebtAffinity(entry: ChatbaseEntry): void {
  const text = entry.text.toLowerCase();

  // Check for debt-related keywords
  if (
    text.includes('owe') ||
    text.includes('debt') ||
    text.includes('pay up') ||
    text.includes('ledger') ||
    text.includes('gold you') ||
    text.includes('money you') ||
    text.includes('what you owe')
  ) {
    entry.triggers ??= {};

    // Determine tension level from language intensity
    if (
      text.includes('threaten') ||
      text.includes('regret') ||
      text.includes('suffer') ||
      text.includes('consequence') ||
      text.includes('patient. i am not') ||
      text.includes('not patient')
    ) {
      entry.triggers.debtTension = 'threatening' as DebtTension;
    } else if (
      text.includes('forget') ||
      text.includes('remember') ||
      text.includes('interest') ||
      text.includes('growing')
    ) {
      entry.triggers.debtTension = 'notable' as DebtTension;
    } else {
      entry.triggers.debtTension = 'minor' as DebtTension;
    }
  }
}

/**
 * Apply all affinity tags to an entry
 */
function tagEntry(entry: ChatbaseEntry): void {
  tagArchetypeAffinity(entry);
  tagDebtAffinity(entry);
}

// ============================================
// Entry Creation
// ============================================

function createEntryFromEternal(
  overheard: OverheardEntry,
  dayData: EternalDayData,
  logPath: string
): ChatbaseEntry {
  const speakerSlug = overheard.speaker;
  const speakerName = SLUG_TO_NAME[speakerSlug] || overheard.speakerName;
  const category = SLUG_TO_CATEGORY[speakerSlug] || 'wanderers';

  // Get mood from vibes
  const vibeData = dayData.vibes.get(speakerSlug);
  const mood = vibeData?.mood || inferMood(overheard.text);
  const moodIntensity = vibeData?.intensity || 0;

  // Get streak info
  const streakData = dayData.streaks.get(speakerSlug);

  // Classify pool
  const pool = classifyPool(overheard.text);

  // Build context tags
  const contextTags: string[] = [];
  if (dayData.weather) contextTags.push(`weather:${dayData.weather}`);
  if (streakData) {
    contextTags.push(`${streakData.type}_streak`);
    if (streakData.streak >= 3) contextTags.push('tilted');
  }
  if (overheard.target) {
    const targetCategory = SLUG_TO_CATEGORY[overheard.target];
    if (targetCategory) contextTags.push(`target_${targetCategory}`);
  }

  // Build triggers
  const triggers: ChatbaseTriggers = {};
  if (streakData && streakData.streak >= 3) {
    triggers.streak = { type: streakData.type, min: streakData.streak };
  }

  const contentHash = hashContent(speakerSlug, overheard.text, overheard.target);

  const entry: ChatbaseEntry = {
    id: `cb-${speakerSlug}-${contentHash}`,
    text: overheard.text,
    speaker: {
      slug: speakerSlug,
      name: speakerName,
      category,
    },
    pool,
    mood,
    moodIntensity,
    contextTags,
    triggers: Object.keys(triggers).length > 0 ? triggers : undefined,
    metrics: {
      interestScore: 70, // Default for eternal logs
      source: 'eternal_sim',
    },
    metadata: {
      extractedFrom: logPath,
      extractedDay: dayData.day,
      extractedAt: new Date().toISOString(),
      version: SCHEMA_VERSION,
    },
  };

  if (overheard.target) {
    const targetName = SLUG_TO_NAME[overheard.target] || overheard.targetName || overheard.target;
    entry.target = {
      slug: overheard.target,
      name: targetName,
      category: SLUG_TO_CATEGORY[overheard.target] || 'wanderers',
    };
  }

  // Apply affinity tags
  tagEntry(entry);

  return entry;
}

interface ChatterConversation {
  turn: number;
  speaker: string;
  speakerName: string;
  target: string;
  targetName: string;
  text: string;
  pool: string;
  interestScore: number;
  tags: string[];
}

function createEntryFromChatter(
  conv: ChatterConversation,
  logPath: string
): ChatbaseEntry {
  const speakerSlug = conv.speaker;
  const speakerName = SLUG_TO_NAME[speakerSlug] || conv.speakerName;
  const category = SLUG_TO_CATEGORY[speakerSlug] || 'wanderers';

  // Use original pool or classify
  let pool: TemplatePool | 'claude_generated';
  if (conv.pool === 'claude_generated') {
    pool = classifyPool(conv.text) as TemplatePool;
  } else {
    pool = conv.pool as TemplatePool;
  }

  // Infer mood
  const mood = inferMood(conv.text);

  // Build context tags from original tags
  const contextTags = [...conv.tags];
  if (conv.target) {
    const targetCategory = SLUG_TO_CATEGORY[conv.target];
    if (targetCategory) contextTags.push(`target_${targetCategory}`);
  }

  const contentHash = hashContent(speakerSlug, conv.text, conv.target);

  const entry: ChatbaseEntry = {
    id: `cb-${speakerSlug}-${contentHash}`,
    text: conv.text,
    speaker: {
      slug: speakerSlug,
      name: speakerName,
      category,
    },
    pool,
    mood,
    moodIntensity: 0,
    contextTags,
    metrics: {
      interestScore: conv.interestScore,
      source: 'chatter_sim',
      originalPool: conv.pool === 'claude_generated' ? 'claude_generated' : undefined,
    },
    metadata: {
      extractedFrom: logPath,
      extractedTurn: conv.turn,
      extractedAt: new Date().toISOString(),
      version: SCHEMA_VERSION,
    },
  };

  if (conv.target) {
    const targetName = SLUG_TO_NAME[conv.target] || conv.targetName;
    entry.target = {
      slug: conv.target,
      name: targetName,
      category: SLUG_TO_CATEGORY[conv.target] || 'wanderers',
    };
  }

  // Apply affinity tags
  tagEntry(entry);

  return entry;
}

// ============================================
// Main Extraction Logic
// ============================================

async function extractEternalLogs(verbose: boolean): Promise<ChatbaseEntry[]> {
  const entries: ChatbaseEntry[] = [];
  const eternalDirs = fs.readdirSync(LOGS_DIR)
    .filter(d => d.startsWith('eternal-'))
    .map(d => path.join(LOGS_DIR, d));

  if (verbose) {
    console.log(`Found ${eternalDirs.length} eternal log directories`);
  }

  for (const eternalDir of eternalDirs) {
    const daysDir = path.join(eternalDir, 'days');
    if (!fs.existsSync(daysDir)) continue;

    const dayFiles = fs.readdirSync(daysDir)
      .filter(f => f.endsWith('.md'))
      .sort();

    if (verbose) {
      console.log(`  Processing ${dayFiles.length} days from ${path.basename(eternalDir)}`);
    }

    for (const dayFile of dayFiles) {
      const filePath = path.join(daysDir, dayFile);
      const content = fs.readFileSync(filePath, 'utf-8');
      const dayData = parseEternalDay(content, dayFile);

      if (!dayData) continue;

      for (const overheard of dayData.overheard) {
        const entry = createEntryFromEternal(overheard, dayData, filePath);
        entries.push(entry);
      }
    }
  }

  return entries;
}

async function extractChatterLogs(verbose: boolean, minInterest: number): Promise<ChatbaseEntry[]> {
  const entries: ChatbaseEntry[] = [];
  const chatterDirs = fs.readdirSync(LOGS_DIR)
    .filter(d => d.startsWith('chatter-'))
    .map(d => path.join(LOGS_DIR, d));

  if (verbose) {
    console.log(`Found ${chatterDirs.length} chatter log directories`);
  }

  for (const chatterDir of chatterDirs) {
    const conversationsFile = path.join(chatterDir, 'conversations.json');
    if (!fs.existsSync(conversationsFile)) continue;

    const content = fs.readFileSync(conversationsFile, 'utf-8');
    const data = JSON.parse(content);

    const conversations: ChatterConversation[] = data.conversations || [];

    if (verbose) {
      console.log(`  Processing ${conversations.length} conversations from ${path.basename(chatterDir)}`);
    }

    for (const conv of conversations) {
      // Filter by interest score
      if (conv.interestScore < minInterest) continue;

      // Skip very short entries
      if (!conv.text || conv.text.length < 15) continue;

      const entry = createEntryFromChatter(conv, conversationsFile);
      entries.push(entry);
    }
  }

  return entries;
}

function deduplicateEntries(entries: ChatbaseEntry[]): ChatbaseEntry[] {
  const seen = new Map<string, ChatbaseEntry>();

  for (const entry of entries) {
    const key = entry.id;
    const existing = seen.get(key);

    if (!existing || entry.metrics.interestScore > existing.metrics.interestScore) {
      seen.set(key, entry);
    }
  }

  return Array.from(seen.values());
}

// ============================================
// Output Generation
// ============================================

function buildNPCFiles(entries: ChatbaseEntry[]): Map<string, ChatbaseNPCFile> {
  const npcFiles = new Map<string, ChatbaseNPCFile>();

  for (const entry of entries) {
    const slug = entry.speaker.slug;

    if (!npcFiles.has(slug)) {
      npcFiles.set(slug, {
        npc: {
          slug,
          name: entry.speaker.name,
          category: entry.speaker.category,
        },
        entryCount: 0,
        pools: {},
        moods: {},
        entries: [],
      });
    }

    const file = npcFiles.get(slug)!;
    file.entries.push(entry);
    file.entryCount++;
    file.pools[entry.pool] = (file.pools[entry.pool] || 0) + 1;
    file.moods[entry.mood] = (file.moods[entry.mood] || 0) + 1;
  }

  return npcFiles;
}

function buildManifest(
  entries: ChatbaseEntry[],
  npcFiles: Map<string, ChatbaseNPCFile>,
  eternalDirs: string[],
  chatterDirs: string[],
  originalCount: number
): ChatbaseManifest {
  const entriesBySpeaker: Record<string, number> = {};
  const entriesByPool: Record<string, number> = {};
  const entriesByMood: Record<string, number> = {};
  let totalInterest = 0;
  let canonicalCount = 0;

  for (const entry of entries) {
    entriesBySpeaker[entry.speaker.slug] = (entriesBySpeaker[entry.speaker.slug] || 0) + 1;
    entriesByPool[entry.pool] = (entriesByPool[entry.pool] || 0) + 1;
    entriesByMood[entry.mood] = (entriesByMood[entry.mood] || 0) + 1;
    totalInterest += entry.metrics.interestScore;
    if (entry.metrics.isCanonical) canonicalCount++;
  }

  const indexes: ChatbaseManifest['indexes'] = [];
  for (const [slug, file] of npcFiles) {
    indexes.push({
      name: slug,
      type: 'by-speaker',
      entryCount: file.entryCount,
      path: `npcs/${slug}.json`,
    });
  }

  return {
    version: `${SCHEMA_VERSION}.0.0`,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    sources: {
      eternalLogDirs: eternalDirs,
      chatterLogDirs: chatterDirs,
      totalDaysProcessed: eternalDirs.length * 300, // Approximate
      totalConversationsProcessed: originalCount,
    },
    stats: {
      totalEntries: entries.length,
      entriesBySpeaker,
      entriesByPool,
      entriesByMood,
      averageInterestScore: entries.length > 0 ? totalInterest / entries.length : 0,
      deduplicationRatio: originalCount > 0 ? entries.length / originalCount : 1,
      canonicalCount,
    },
    indexes,
  };
}

// ============================================
// Main
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const minInterestArg = args.find(a => a.startsWith('--min-interest='));
  const minInterest = minInterestArg
    ? parseInt(minInterestArg.split('=')[1], 10)
    : MIN_INTEREST_SCORE;

  console.log('Chatbase Extraction');
  console.log('===================');
  console.log(`Logs directory: ${LOGS_DIR}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Min interest score: ${minInterest}`);
  console.log('');

  // Extract from all sources
  console.log('Extracting eternal logs...');
  const eternalEntries = await extractEternalLogs(verbose);
  console.log(`  Found ${eternalEntries.length} entries from eternal logs`);

  console.log('Extracting chatter logs...');
  const chatterEntries = await extractChatterLogs(verbose, minInterest);
  console.log(`  Found ${chatterEntries.length} entries from chatter logs`);

  // Combine and deduplicate
  const allEntries = [...eternalEntries, ...chatterEntries];
  const originalCount = allEntries.length;

  console.log('Deduplicating...');
  const entries = deduplicateEntries(allEntries);
  console.log(`  ${originalCount} -> ${entries.length} entries (${((1 - entries.length / originalCount) * 100).toFixed(1)}% reduction)`);

  // Build output structures
  const npcFiles = buildNPCFiles(entries);

  const eternalDirs = fs.readdirSync(LOGS_DIR)
    .filter(d => d.startsWith('eternal-'));
  const chatterDirs = fs.readdirSync(LOGS_DIR)
    .filter(d => d.startsWith('chatter-'));

  const manifest = buildManifest(entries, npcFiles, eternalDirs, chatterDirs, originalCount);

  // Create output directory structure
  console.log('Writing output...');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'npcs'), { recursive: true });
  fs.mkdirSync(path.join(OUTPUT_DIR, 'indexes'), { recursive: true });

  // Write manifest
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log(`  Written: manifest.json`);

  // Write NPC files
  for (const [slug, file] of npcFiles) {
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'npcs', `${slug}.json`),
      JSON.stringify(file, null, 2)
    );
  }
  console.log(`  Written: ${npcFiles.size} NPC files`);

  // Write pool index
  const poolIndex: Record<string, string[]> = {};
  for (const entry of entries) {
    if (!poolIndex[entry.pool]) poolIndex[entry.pool] = [];
    poolIndex[entry.pool].push(entry.id);
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'indexes', 'by-pool.json'),
    JSON.stringify(poolIndex, null, 2)
  );

  // Write mood index
  const moodIndex: Record<string, string[]> = {};
  for (const entry of entries) {
    if (!moodIndex[entry.mood]) moodIndex[entry.mood] = [];
    moodIndex[entry.mood].push(entry.id);
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'indexes', 'by-mood.json'),
    JSON.stringify(moodIndex, null, 2)
  );
  console.log(`  Written: pool and mood indexes`);

  // Summary
  console.log('');
  console.log('Summary');
  console.log('-------');
  console.log(`Total entries: ${entries.length}`);
  console.log(`NPCs with entries: ${npcFiles.size}`);
  console.log(`Average interest score: ${manifest.stats.averageInterestScore.toFixed(1)}`);
  console.log('');
  console.log('Entries by pool:');
  for (const [pool, count] of Object.entries(manifest.stats.entriesByPool).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pool}: ${count}`);
  }
  console.log('');
  console.log('Entries by NPC (top 10):');
  const sortedNPCs = Object.entries(manifest.stats.entriesBySpeaker)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  for (const [npc, count] of sortedNPCs) {
    console.log(`  ${npc}: ${count}`);
  }

  console.log('');
  console.log('Done! Chatbase written to:', OUTPUT_DIR);
}

main().catch(console.error);
