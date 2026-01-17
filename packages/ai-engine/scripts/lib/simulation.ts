/**
 * Base simulation interface and runner
 *
 * Provides a consistent pattern for all simulation scripts.
 */

import { parseArgs, setupGracefulShutdown, formatDuration } from './cli';
import {
  writeSimResults,
  writeCheckpoint,
  readCheckpoint,
  printHeader,
  printSummary,
} from './output';

// ============================================
// Types
// ============================================

export interface SimulationConfig {
  /** Simulation name (used for output files) */
  name: string;
  /** Random seed for reproducibility */
  seed: string;
  /** Enable verbose output */
  verbose: boolean;
  /** Dry run - don't write output files */
  dryRun: boolean;
  /** Checkpoint interval (iterations) */
  checkpointInterval?: number;
}

export interface SimulationResult<T> {
  success: boolean;
  data: T;
  errors: string[];
  warnings: string[];
  stats: Record<string, number | string>;
}

export interface SimulationRunner<TConfig extends SimulationConfig, TResult> {
  /** Default configuration */
  defaults: TConfig;
  /** Description for help text */
  description: string;
  /** Initialize simulation state */
  init: (config: TConfig) => Promise<void> | void;
  /** Run one iteration */
  iterate: (iteration: number, config: TConfig) => Promise<TResult> | TResult;
  /** Aggregate results */
  aggregate: (results: TResult[], config: TConfig) => SimulationResult<unknown>;
  /** Total iterations */
  totalIterations: (config: TConfig) => number;
  /** Optional cleanup */
  cleanup?: () => Promise<void> | void;
}

// ============================================
// Runner
// ============================================

/**
 * Run a simulation with standard patterns
 */
export async function runSimulation<TConfig extends SimulationConfig, TResult>(
  runner: SimulationRunner<TConfig, TResult>,
  args: string[] = process.argv.slice(2)
): Promise<void> {
  const startTime = Date.now();
  const config = parseArgs(args, runner.defaults);
  const results: TResult[] = [];
  const errors: string[] = [];

  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`${runner.defaults.name} - ${runner.description}`);
    console.log('\nOptions:');
    for (const [key, value] of Object.entries(runner.defaults)) {
      console.log(`  --${key.replace(/_/g, '-')}=${value}`);
    }
    return;
  }

  // Setup graceful shutdown
  let interrupted = false;
  setupGracefulShutdown(async () => {
    interrupted = true;
    if (runner.cleanup) await runner.cleanup();
  });

  // Check for checkpoint
  const checkpoint = readCheckpoint<{ iteration: number; results: TResult[] }>(
    config.name
  );
  let startIteration = 0;
  if (checkpoint) {
    console.log(`Resuming from checkpoint at iteration ${checkpoint.iteration}`);
    startIteration = checkpoint.iteration;
    results.push(...checkpoint.results);
  }

  // Print header
  printHeader(`Running ${config.name}`);
  console.log(`Seed: ${config.seed}`);
  console.log(`Verbose: ${config.verbose}`);
  console.log(`Dry run: ${config.dryRun}`);

  // Initialize
  try {
    await runner.init(config);
  } catch (err) {
    errors.push(`Init failed: ${err}`);
    console.error('Initialization failed:', err);
    return;
  }

  // Run iterations
  const total = runner.totalIterations(config);
  for (let i = startIteration; i < total && !interrupted; i++) {
    try {
      const result = await runner.iterate(i, config);
      results.push(result);

      // Progress
      if (config.verbose || i % Math.ceil(total / 20) === 0) {
        process.stdout.write(
          `\rProgress: ${i + 1}/${total} (${((i + 1) / total * 100).toFixed(1)}%)`
        );
      }

      // Checkpoint
      if (config.checkpointInterval && i % config.checkpointInterval === 0) {
        writeCheckpoint(config.name, { iteration: i + 1, results });
      }
    } catch (err) {
      errors.push(`Iteration ${i} failed: ${err}`);
      if (config.verbose) {
        console.error(`\nIteration ${i} failed:`, err);
      }
    }
  }
  console.log(); // New line after progress

  // Aggregate
  const aggregated = runner.aggregate(results, config);
  aggregated.errors.push(...errors);

  // Duration
  const duration = Date.now() - startTime;

  // Output
  if (!config.dryRun) {
    const filepath = writeSimResults(config.name, aggregated.data, config, {
      seed: config.seed,
      duration_ms: duration,
      errors: aggregated.errors.length > 0 ? aggregated.errors : undefined,
    });
    console.log(`Results written to: ${filepath}`);
  }

  // Summary
  printSummary(config.name, duration, {
    iterations: results.length,
    errors: aggregated.errors.length,
    ...aggregated.stats,
  });

  // Cleanup
  if (runner.cleanup) {
    await runner.cleanup();
  }
}

// ============================================
// Utilities
// ============================================

/**
 * Calculate statistics from numeric array
 */
export function calculateStats(values: number[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
} {
  if (values.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return { min, max, mean, median, stdDev };
}

/**
 * Group items by key
 */
export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

/**
 * Count occurrences
 */
export function countBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}
