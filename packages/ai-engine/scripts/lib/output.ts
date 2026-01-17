/**
 * Shared output utilities for simulation scripts
 *
 * Consolidates log directory management, JSON/MD writing, and result formatting.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ============================================
// Directory Management
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default log directory
const DEFAULT_LOG_DIR = path.resolve(__dirname, '../../logs');

/**
 * Ensure log directory exists
 */
export function ensureLogDir(logDir: string = DEFAULT_LOG_DIR): string {
  fs.mkdirSync(logDir, { recursive: true });
  return logDir;
}

/**
 * Get timestamped filename
 */
export function getTimestampedFilename(baseName: string, ext: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${baseName}-${timestamp}.${ext}`;
}

/**
 * Get simple date-based filename (for cumulative files)
 */
export function getDailyFilename(baseName: string, ext: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `${baseName}-${date}.${ext}`;
}

// ============================================
// JSON Output
// ============================================

export interface SimulationResult {
  name: string;
  timestamp: string;
  duration_ms: number;
  seed?: string;
  config: Record<string, unknown>;
  results: unknown;
  errors?: string[];
}

/**
 * Write simulation results to JSON
 */
export function writeSimResults(
  name: string,
  results: unknown,
  config: Record<string, unknown>,
  options: {
    logDir?: string;
    seed?: string;
    duration_ms?: number;
    errors?: string[];
    cumulative?: boolean; // Append to daily file vs timestamped
  } = {}
): string {
  const logDir = ensureLogDir(options.logDir);
  const filename = options.cumulative
    ? getDailyFilename(name, 'json')
    : getTimestampedFilename(name, 'json');
  const filepath = path.join(logDir, filename);

  const data: SimulationResult = {
    name,
    timestamp: new Date().toISOString(),
    duration_ms: options.duration_ms ?? 0,
    seed: options.seed,
    config,
    results,
    errors: options.errors,
  };

  if (options.cumulative && fs.existsSync(filepath)) {
    // Append to existing file
    const existing = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    const runs = Array.isArray(existing) ? existing : [existing];
    runs.push(data);
    fs.writeFileSync(filepath, JSON.stringify(runs, null, 2));
  } else {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  }

  return filepath;
}

/**
 * Write checkpoint for long-running simulations
 */
export function writeCheckpoint(
  name: string,
  state: unknown,
  logDir: string = DEFAULT_LOG_DIR
): string {
  ensureLogDir(logDir);
  const filepath = path.join(logDir, `${name}-checkpoint.json`);
  fs.writeFileSync(filepath, JSON.stringify(state, null, 2));
  return filepath;
}

/**
 * Read checkpoint if exists
 */
export function readCheckpoint<T>(
  name: string,
  logDir: string = DEFAULT_LOG_DIR
): T | null {
  const filepath = path.join(logDir, `${name}-checkpoint.json`);
  if (fs.existsSync(filepath)) {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8')) as T;
  }
  return null;
}

// ============================================
// Markdown Output
// ============================================

/**
 * Write markdown report
 */
export function writeMarkdownReport(
  name: string,
  content: string,
  options: {
    logDir?: string;
    cumulative?: boolean;
  } = {}
): string {
  const logDir = ensureLogDir(options.logDir);
  const filename = options.cumulative
    ? getDailyFilename(name, 'md')
    : getTimestampedFilename(name, 'md');
  const filepath = path.join(logDir, filename);

  if (options.cumulative && fs.existsSync(filepath)) {
    // Append with separator
    const existing = fs.readFileSync(filepath, 'utf-8');
    fs.writeFileSync(filepath, existing + '\n\n---\n\n' + content);
  } else {
    fs.writeFileSync(filepath, content);
  }

  return filepath;
}

/**
 * Generate markdown table from data
 */
export function markdownTable(
  headers: string[],
  rows: (string | number)[][]
): string {
  const headerRow = `| ${headers.join(' | ')} |`;
  const separator = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map(row => `| ${row.join(' | ')} |`);
  return [headerRow, separator, ...dataRows].join('\n');
}

/**
 * Format number for display
 */
export function formatNumber(n: number, decimals = 2): string {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(decimals);
}

/**
 * Format percentage
 */
export function formatPercent(ratio: number, decimals = 1): string {
  return `${(ratio * 100).toFixed(decimals)}%`;
}

// ============================================
// Console Output
// ============================================

/**
 * Print a section header
 */
export function printHeader(title: string, char = '='): void {
  const line = char.repeat(Math.max(title.length, 40));
  console.log(`\n${line}`);
  console.log(title);
  console.log(line);
}

/**
 * Print key-value stats
 */
export function printStats(stats: Record<string, string | number>): void {
  const maxKeyLen = Math.max(...Object.keys(stats).map(k => k.length));
  for (const [key, value] of Object.entries(stats)) {
    console.log(`  ${key.padEnd(maxKeyLen)}: ${value}`);
  }
}

/**
 * Print simulation summary
 */
export function printSummary(
  name: string,
  duration_ms: number,
  stats: Record<string, string | number>
): void {
  printHeader(`${name} Complete`);
  console.log(`Duration: ${(duration_ms / 1000).toFixed(2)}s`);
  printStats(stats);
}
