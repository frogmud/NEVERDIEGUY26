#!/usr/bin/env npx ts-node
/**
 * Editor Cleanup Utility
 *
 * Cleans dialogue logs for consistency:
 * - Removes en dashes (replaces with hyphens or commas)
 * - Converts past tense to present tense
 * - Trims verbose phrasing for succinctness
 *
 * Modes:
 * - auto: Applies all safe transformations automatically
 * - manual: Interactive review for ambiguous cases
 * - report: Dry-run showing what would change
 *
 * Usage:
 *   npx ts-node scripts/editor-cleanup.ts --mode auto --file chatbase/npcs/*.json
 *   npx ts-node scripts/editor-cleanup.ts --mode manual --file chatbase/npcs/john.json
 *   npx ts-node scripts/editor-cleanup.ts --mode report
 *
 * NEVER DIE GUY
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ============================================================
// TYPES
// ============================================================

interface CleanupResult {
  file: string;
  original: string;
  cleaned: string;
  changes: string[];
  needsReview: boolean;
}

interface CleanupStats {
  filesProcessed: number;
  entriesProcessed: number;
  autoFixed: number;
  needsManualReview: number;
  enDashesRemoved: number;
  tenseConverted: number;
  verboseTrimmed: number;
}

type CleanupMode = 'auto' | 'manual' | 'report';

// ============================================================
// CLEANUP RULES
// ============================================================

/**
 * En dash patterns to replace
 * En dash (U+2013) should become hyphen or comma based on context
 */
const EN_DASH_RULES: Array<{
  pattern: RegExp;
  replacement: string;
  description: string;
}> = [
  {
    // Range notation: "1-10" not "1\u201310"
    pattern: /(\d)\u2013(\d)/g,
    replacement: '$1-$2',
    description: 'en-dash in number range',
  },
  {
    // Parenthetical interjection: use comma
    pattern: /\s\u2013\s/g,
    replacement: ', ',
    description: 'en-dash as separator',
  },
  {
    // Em dash substitute: use comma or period
    pattern: /\u2013/g,
    replacement: '-',
    description: 'remaining en-dash',
  },
];

/**
 * Past to present tense conversions
 * Focus on common dialogue patterns
 */
const TENSE_CONVERSIONS: Array<{
  pattern: RegExp;
  replacement: string;
  safe: boolean; // Can apply automatically
}> = [
  // Safe: clear past tense indicators
  { pattern: /\bI was\b/g, replacement: 'I am', safe: true },
  { pattern: /\bHe was\b/g, replacement: 'He is', safe: true },
  { pattern: /\bShe was\b/g, replacement: 'She is', safe: true },
  { pattern: /\bIt was\b/g, replacement: 'It is', safe: true },
  { pattern: /\bThere was\b/g, replacement: 'There is', safe: true },
  { pattern: /\bThey were\b/g, replacement: 'They are', safe: true },
  { pattern: /\bWe were\b/g, replacement: 'We are', safe: true },

  // Needs review: context-dependent
  { pattern: /\bsaid\b/g, replacement: 'says', safe: false },
  { pattern: /\bwalked\b/g, replacement: 'walks', safe: false },
  { pattern: /\blooked\b/g, replacement: 'looks', safe: false },
  { pattern: /\bturned\b/g, replacement: 'turns', safe: false },
  { pattern: /\bmoved\b/g, replacement: 'moves', safe: false },
  { pattern: /\bcame\b/g, replacement: 'comes', safe: false },
  { pattern: /\bwent\b/g, replacement: 'goes', safe: false },
  { pattern: /\btook\b/g, replacement: 'takes', safe: false },
  { pattern: /\bgave\b/g, replacement: 'gives', safe: false },
  { pattern: /\bfelt\b/g, replacement: 'feels', safe: false },
];

/**
 * Verbose phrases to trim
 */
const VERBOSE_PATTERNS: Array<{
  pattern: RegExp;
  replacement: string;
  description: string;
}> = [
  {
    pattern: /\bin order to\b/gi,
    replacement: 'to',
    description: 'verbose: in order to -> to',
  },
  {
    pattern: /\bat this point in time\b/gi,
    replacement: 'now',
    description: 'verbose: at this point in time -> now',
  },
  {
    pattern: /\bdue to the fact that\b/gi,
    replacement: 'because',
    description: 'verbose: due to the fact that -> because',
  },
  {
    pattern: /\bin the event that\b/gi,
    replacement: 'if',
    description: 'verbose: in the event that -> if',
  },
  {
    pattern: /\bfor the purpose of\b/gi,
    replacement: 'for',
    description: 'verbose: for the purpose of -> for',
  },
  {
    pattern: /\bit is important to note that\b/gi,
    replacement: '',
    description: 'verbose: it is important to note that -> (remove)',
  },
  {
    pattern: /\bas a matter of fact\b/gi,
    replacement: 'in fact',
    description: 'verbose: as a matter of fact -> in fact',
  },
  {
    pattern: /\bthe fact that\b/gi,
    replacement: 'that',
    description: 'verbose: the fact that -> that',
  },
  {
    pattern: /\bbasically\b/gi,
    replacement: '',
    description: 'filler: basically -> (remove)',
  },
  {
    pattern: /\bactually\b/gi,
    replacement: '',
    description: 'filler: actually -> (remove)',
  },
];

// ============================================================
// CLEANUP FUNCTIONS
// ============================================================

function removeEnDashes(text: string): { result: string; count: number } {
  let result = text;
  let count = 0;

  for (const rule of EN_DASH_RULES) {
    const matches = result.match(rule.pattern);
    if (matches) {
      count += matches.length;
      result = result.replace(rule.pattern, rule.replacement);
    }
  }

  return { result, count };
}

function convertTense(
  text: string,
  autoOnly: boolean
): { result: string; count: number; needsReview: string[] } {
  let result = text;
  let count = 0;
  const needsReview: string[] = [];

  for (const conv of TENSE_CONVERSIONS) {
    if (autoOnly && !conv.safe) {
      // Check if pattern exists but skip
      const matches = text.match(conv.pattern);
      if (matches) {
        needsReview.push(`"${matches[0]}" -> "${conv.replacement}"`);
      }
      continue;
    }

    const matches = result.match(conv.pattern);
    if (matches) {
      count += matches.length;
      result = result.replace(conv.pattern, conv.replacement);
    }
  }

  return { result, count, needsReview };
}

function trimVerbose(text: string): { result: string; count: number } {
  let result = text;
  let count = 0;

  for (const pattern of VERBOSE_PATTERNS) {
    const matches = result.match(pattern.pattern);
    if (matches) {
      count += matches.length;
      result = result.replace(pattern.pattern, pattern.replacement);
    }
  }

  // Clean up double spaces from removals
  result = result.replace(/\s{2,}/g, ' ').trim();

  return { result, count };
}

function cleanText(
  text: string,
  autoOnly: boolean = true
): {
  result: string;
  changes: string[];
  needsReview: boolean;
  stats: { enDash: number; tense: number; verbose: number };
} {
  const changes: string[] = [];
  let result = text;
  let needsReview = false;

  // 1. Remove en dashes
  const dashResult = removeEnDashes(result);
  if (dashResult.count > 0) {
    changes.push(`Removed ${dashResult.count} en-dash(es)`);
    result = dashResult.result;
  }

  // 2. Convert tense
  const tenseResult = convertTense(result, autoOnly);
  if (tenseResult.count > 0) {
    changes.push(`Converted ${tenseResult.count} past tense verb(s)`);
    result = tenseResult.result;
  }
  if (tenseResult.needsReview.length > 0) {
    needsReview = true;
    changes.push(`Manual review needed: ${tenseResult.needsReview.join(', ')}`);
  }

  // 3. Trim verbose
  const verboseResult = trimVerbose(result);
  if (verboseResult.count > 0) {
    changes.push(`Trimmed ${verboseResult.count} verbose phrase(s)`);
    result = verboseResult.result;
  }

  return {
    result,
    changes,
    needsReview,
    stats: {
      enDash: dashResult.count,
      tense: tenseResult.count,
      verbose: verboseResult.count,
    },
  };
}

// ============================================================
// FILE PROCESSING
// ============================================================

interface ChatbaseEntry {
  id: string;
  text: string;
  [key: string]: unknown;
}

interface ChatbaseFile {
  npc: {
    slug: string;
    name: string;
    [key: string]: unknown;
  };
  entries: ChatbaseEntry[];
}

function processJsonFile(
  filePath: string,
  mode: CleanupMode
): { results: CleanupResult[]; stats: CleanupStats } {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data: ChatbaseFile = JSON.parse(content);

  const results: CleanupResult[] = [];
  const stats: CleanupStats = {
    filesProcessed: 1,
    entriesProcessed: 0,
    autoFixed: 0,
    needsManualReview: 0,
    enDashesRemoved: 0,
    tenseConverted: 0,
    verboseTrimmed: 0,
  };

  for (const entry of data.entries) {
    stats.entriesProcessed++;

    const cleaned = cleanText(entry.text, mode === 'auto');

    if (cleaned.changes.length > 0) {
      results.push({
        file: filePath,
        original: entry.text,
        cleaned: cleaned.result,
        changes: cleaned.changes,
        needsReview: cleaned.needsReview,
      });

      stats.enDashesRemoved += cleaned.stats.enDash;
      stats.tenseConverted += cleaned.stats.tense;
      stats.verboseTrimmed += cleaned.stats.verbose;

      if (cleaned.needsReview) {
        stats.needsManualReview++;
      } else {
        stats.autoFixed++;
      }

      // Apply changes in auto mode
      if (mode === 'auto' && !cleaned.needsReview) {
        entry.text = cleaned.result;
      }
    }
  }

  // Write back in auto mode
  if (mode === 'auto') {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  }

  return { results, stats };
}

// ============================================================
// INTERACTIVE MODE
// ============================================================

async function interactiveReview(results: CleanupResult[]): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  console.log('\n--- Manual Review Mode ---\n');

  for (const result of results.filter((r) => r.needsReview)) {
    console.log('FILE:', result.file);
    console.log('ORIGINAL:', result.original);
    console.log('CLEANED:', result.cleaned);
    console.log('CHANGES:', result.changes.join(', '));

    const answer = await question('\nApply? (y/n/q): ');

    if (answer.toLowerCase() === 'q') {
      break;
    }

    if (answer.toLowerCase() === 'y') {
      // Apply the change
      const content = fs.readFileSync(result.file, 'utf-8');
      const data: ChatbaseFile = JSON.parse(content);

      const entry = data.entries.find((e) => e.text === result.original);
      if (entry) {
        entry.text = result.cleaned;
        fs.writeFileSync(result.file, JSON.stringify(data, null, 2) + '\n');
        console.log('Applied.');
      }
    } else {
      console.log('Skipped.');
    }

    console.log('---');
  }

  rl.close();
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let mode: CleanupMode = 'report';
  let files: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--mode' && args[i + 1]) {
      mode = args[i + 1] as CleanupMode;
      i++;
    } else if (args[i] === '--file' && args[i + 1]) {
      files.push(args[i + 1]);
      i++;
    } else if (!args[i].startsWith('--')) {
      files.push(args[i]);
    }
  }

  // Default to all chatbase files
  if (files.length === 0) {
    const chatbasePath = path.join(__dirname, '..', 'chatbase', 'npcs');
    if (fs.existsSync(chatbasePath)) {
      files = fs.readdirSync(chatbasePath)
        .filter((f) => f.endsWith('.json'))
        .map((f) => path.join(chatbasePath, f));
    }
  }

  console.log(`\nEditor Cleanup - Mode: ${mode.toUpperCase()}`);
  console.log(`Processing ${files.length} file(s)...\n`);

  const allResults: CleanupResult[] = [];
  const totalStats: CleanupStats = {
    filesProcessed: 0,
    entriesProcessed: 0,
    autoFixed: 0,
    needsManualReview: 0,
    enDashesRemoved: 0,
    tenseConverted: 0,
    verboseTrimmed: 0,
  };

  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.warn(`File not found: ${file}`);
      continue;
    }

    try {
      const { results, stats } = processJsonFile(file, mode);
      allResults.push(...results);

      totalStats.filesProcessed += stats.filesProcessed;
      totalStats.entriesProcessed += stats.entriesProcessed;
      totalStats.autoFixed += stats.autoFixed;
      totalStats.needsManualReview += stats.needsManualReview;
      totalStats.enDashesRemoved += stats.enDashesRemoved;
      totalStats.tenseConverted += stats.tenseConverted;
      totalStats.verboseTrimmed += stats.verboseTrimmed;

      console.log(`  ${path.basename(file)}: ${stats.entriesProcessed} entries, ${stats.autoFixed} fixed`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }

  // Print summary
  console.log('\n--- Summary ---');
  console.log(`Files processed: ${totalStats.filesProcessed}`);
  console.log(`Entries processed: ${totalStats.entriesProcessed}`);
  console.log(`Auto-fixed: ${totalStats.autoFixed}`);
  console.log(`Needs manual review: ${totalStats.needsManualReview}`);
  console.log(`En-dashes removed: ${totalStats.enDashesRemoved}`);
  console.log(`Tense converted: ${totalStats.tenseConverted}`);
  console.log(`Verbose trimmed: ${totalStats.verboseTrimmed}`);

  // Report mode: show all changes
  if (mode === 'report') {
    console.log('\n--- Proposed Changes ---');
    for (const result of allResults.slice(0, 20)) {
      console.log(`\nFILE: ${path.basename(result.file)}`);
      console.log(`BEFORE: ${result.original.slice(0, 100)}...`);
      console.log(`AFTER:  ${result.cleaned.slice(0, 100)}...`);
      console.log(`CHANGES: ${result.changes.join(', ')}`);
    }
    if (allResults.length > 20) {
      console.log(`\n... and ${allResults.length - 20} more changes`);
    }
  }

  // Manual mode: interactive review
  if (mode === 'manual' && totalStats.needsManualReview > 0) {
    await interactiveReview(allResults);
  }

  console.log('\nDone.');
}

main().catch(console.error);
