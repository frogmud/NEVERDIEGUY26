#!/usr/bin/env ts-node
/**
 * Unified Simulation Runner
 *
 * Runs all simulation engines in sequence or parallel.
 * Run with: npx ts-node scripts/run-all-sims.ts
 *
 * Options:
 *   --parallel     Run all sims concurrently
 *   --only=X,Y,Z   Run only specific sims (ceelo,roguelike,synergy,economy,sphere,elo,wiki)
 *   --quick        Use reduced sample sizes for faster iteration
 *   --continuous   Keep running in a loop with delays
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Configuration
// ============================================

interface SimConfig {
  id: string;
  name: string;
  script: string;
  description: string;
  estimatedTime: string;
  outputFile: string;
  quickModeEnv?: Record<string, string>;
}

const SIMULATIONS: SimConfig[] = [
  {
    id: 'ceelo',
    name: 'Cee-Lo Gambling',
    script: 'run-simulation.ts',
    description: 'NPC gambling matches, lucky numbers, gold economy',
    estimatedTime: '~5s',
    outputFile: 'logs/simulation-results.json',
  },
  {
    id: 'roguelike',
    name: 'Roguelike Runs',
    script: 'run-roguelike-sim.ts',
    description: 'Full run outcomes, difficulty curves, item correlations',
    estimatedTime: '~10s',
    outputFile: 'logs/run-outcomes.json',
  },
  {
    id: 'synergy',
    name: 'Item Synergy',
    script: 'item-synergy-sim.ts',
    description: 'Item combo matrix, tier lists, balance flags',
    estimatedTime: '~15s',
    outputFile: 'logs/item-synergy.json',
  },
  {
    id: 'economy',
    name: 'Trade Economy',
    script: 'trade-economy-sim.ts',
    description: 'Shop pricing, haggle rates, inflation index',
    estimatedTime: '~8s',
    outputFile: 'logs/trade-economy.json',
  },
  {
    id: 'sphere',
    name: 'Sphere Damage',
    script: 'sphere-damage-sim.ts',
    description: 'Dice physics, zone heatmaps, EV tables',
    estimatedTime: '~12s',
    outputFile: 'logs/sphere-damage.json',
  },
  {
    id: 'elo',
    name: 'ELO Ladder',
    script: 'elo-ladder-sim.ts',
    description: 'Matchmaking calibration, K-factor analysis',
    estimatedTime: '~10s',
    outputFile: 'logs/elo-ladder.json',
  },
  {
    id: 'wiki',
    name: 'Wiki Coverage',
    script: 'wiki-coverage-sim.ts',
    description: 'Documentation gaps, broken links, coverage %',
    estimatedTime: '~2s',
    outputFile: 'logs/wiki-coverage.json',
  },
];

// ============================================
// CLI Argument Parsing
// ============================================

interface RunOptions {
  parallel: boolean;
  only: string[] | null;
  quick: boolean;
  continuous: boolean;
  delay: number;
}

function parseArgs(): RunOptions {
  const args = process.argv.slice(2);
  const options: RunOptions = {
    parallel: false,
    only: null,
    quick: false,
    continuous: false,
    delay: 60000, // 1 minute between continuous runs
  };

  for (const arg of args) {
    if (arg === '--parallel' || arg === '-p') {
      options.parallel = true;
    } else if (arg === '--quick' || arg === '-q') {
      options.quick = true;
    } else if (arg === '--continuous' || arg === '-c') {
      options.continuous = true;
    } else if (arg.startsWith('--only=')) {
      options.only = arg.replace('--only=', '').split(',').map(s => s.trim());
    } else if (arg.startsWith('--delay=')) {
      options.delay = parseInt(arg.replace('--delay=', ''), 10) * 1000;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
NEVER DIE GUY - Unified Simulation Runner
==========================================

Usage: npx ts-node scripts/run-all-sims.ts [options]

Options:
  --parallel, -p      Run all simulations concurrently
  --quick, -q         Use reduced sample sizes for faster iteration
  --continuous, -c    Keep running in a loop
  --only=X,Y,Z        Run only specific sims
  --delay=N           Seconds between continuous runs (default: 60)
  --help, -h          Show this help

Available Simulations:
${SIMULATIONS.map(s => `  ${s.id.padEnd(12)} ${s.name.padEnd(20)} ${s.description}`).join('\n')}

Examples:
  npx ts-node scripts/run-all-sims.ts
  npx ts-node scripts/run-all-sims.ts --parallel --quick
  npx ts-node scripts/run-all-sims.ts --only=ceelo,economy
  npx ts-node scripts/run-all-sims.ts --continuous --delay=300
`);
}

// ============================================
// Simulation Runner
// ============================================

interface SimResult {
  id: string;
  name: string;
  success: boolean;
  duration: number;
  outputFile: string;
  error?: string;
}

function runSimulation(sim: SimConfig, quick: boolean): Promise<SimResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const scriptPath = path.join(__dirname, sim.script);

    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      resolve({
        id: sim.id,
        name: sim.name,
        success: false,
        duration: 0,
        outputFile: sim.outputFile,
        error: `Script not found: ${scriptPath}`,
      });
      return;
    }

    const env = { ...process.env };
    if (quick && sim.quickModeEnv) {
      Object.assign(env, sim.quickModeEnv);
    }

    const child = spawn('npx', ['tsx', scriptPath], {
      cwd: path.join(__dirname, '..'),
      env,
      stdio: 'inherit',  // Stream output directly to console
      shell: true,
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      resolve({
        id: sim.id,
        name: sim.name,
        success: code === 0,
        duration,
        outputFile: sim.outputFile,
        error: code !== 0 ? `Exit code ${code}` : undefined,
      });
    });

    child.on('error', (err) => {
      const duration = Date.now() - startTime;
      resolve({
        id: sim.id,
        name: sim.name,
        success: false,
        duration,
        outputFile: sim.outputFile,
        error: err.message,
      });
    });
  });
}

// ============================================
// Progress Display
// ============================================

function clearLine(): void {
  process.stdout.write('\r\x1b[K');
}

function printProgress(current: number, total: number, simName: string): void {
  const pct = ((current / total) * 100).toFixed(0);
  const bar = '='.repeat(Math.floor(current / total * 30));
  const empty = ' '.repeat(30 - bar.length);
  process.stdout.write(`\r[${bar}${empty}] ${pct}% - Running ${simName}...`);
}

// ============================================
// Summary Report
// ============================================

interface SummaryData {
  timestamp: string;
  totalDuration: number;
  simsRun: number;
  simsSucceeded: number;
  simsFailed: number;
  results: SimResult[];
  highlights: Record<string, any>;
}

async function generateSummary(results: SimResult[]): Promise<SummaryData> {
  const highlights: Record<string, any> = {};

  // Extract key metrics from each output file
  for (const result of results) {
    if (!result.success) continue;

    const outputPath = path.join(__dirname, '..', result.outputFile);
    if (!fs.existsSync(outputPath)) continue;

    try {
      const data = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));

      switch (result.id) {
        case 'ceelo':
          if (data.leaderboard?.[0]) {
            highlights.ceeloLeader = {
              name: data.leaderboard[0].name,
              winRate: data.leaderboard[0].winRate,
              netGold: data.leaderboard[0].netGold,
            };
          }
          break;

        case 'roguelike':
          if (data.statistics) {
            highlights.roguelike = {
              successRate: data.statistics.successRate,
              avgRoomsCleared: data.statistics.avgRoomsCleared,
            };
          }
          break;

        case 'synergy':
          if (data.tierCounts) {
            highlights.synergy = {
              sTierCombos: data.tierCounts.S,
              fTierCombos: data.tierCounts.F,
            };
          }
          break;

        case 'economy':
          if (data.statistics) {
            highlights.economy = {
              inflationIndex: data.statistics.inflationIndex,
              avgGoldSpent: data.statistics.avgGoldSpent,
            };
          }
          break;

        case 'sphere':
          if (data.statistics?.[0]) {
            highlights.sphere = {
              d6AvgDamage: data.statistics.find((s: any) => s.diceType === 'd6')?.avgDamage,
              d20AvgDamage: data.statistics.find((s: any) => s.diceType === 'd20')?.avgDamage,
            };
          }
          break;

        case 'elo':
          if (data.configurations?.[0]) {
            highlights.elo = {
              bestConfig: data.recommendations?.bestConfig,
              correlation: data.recommendations?.correlation,
            };
          }
          break;

        case 'wiki':
          if (data.summary) {
            highlights.wiki = {
              coverage: data.summary.coveragePercent,
              gaps: data.gaps?.filter((g: any) => g.severity === 'critical').length,
            };
          }
          break;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  const totalDuration = results.reduce((s, r) => s + r.duration, 0);

  return {
    timestamp: new Date().toISOString(),
    totalDuration,
    simsRun: results.length,
    simsSucceeded: results.filter(r => r.success).length,
    simsFailed: results.filter(r => !r.success).length,
    results,
    highlights,
  };
}

function printSummary(summary: SummaryData): void {
  console.log('');
  console.log('='.repeat(70));
  console.log('SIMULATION RUN COMPLETE');
  console.log('='.repeat(70));
  console.log('');

  // Results table
  console.log('Results:');
  console.log('-'.repeat(70));
  for (const result of summary.results) {
    const status = result.success ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    const duration = `${(result.duration / 1000).toFixed(1)}s`;
    console.log(`  ${status} ${result.name.padEnd(20)} ${duration.padStart(8)}`);
    if (!result.success && result.error) {
      console.log(`       \x1b[31mError: ${result.error.slice(0, 60)}\x1b[0m`);
    }
  }
  console.log('-'.repeat(70));
  console.log(`Total: ${summary.simsSucceeded}/${summary.simsRun} passed in ${(summary.totalDuration / 1000).toFixed(1)}s`);
  console.log('');

  // Highlights
  if (Object.keys(summary.highlights).length > 0) {
    console.log('='.repeat(70));
    console.log('KEY METRICS');
    console.log('='.repeat(70));

    if (summary.highlights.ceeloLeader) {
      console.log(`Cee-Lo Leader:      ${summary.highlights.ceeloLeader.name} (${(summary.highlights.ceeloLeader.winRate * 100).toFixed(1)}% win rate)`);
    }
    if (summary.highlights.roguelike) {
      console.log(`Roguelike Success:  ${(summary.highlights.roguelike.successRate * 100).toFixed(1)}% (avg ${summary.highlights.roguelike.avgRoomsCleared.toFixed(1)} rooms)`);
    }
    if (summary.highlights.synergy) {
      console.log(`Item Synergies:     ${summary.highlights.synergy.sTierCombos} S-tier, ${summary.highlights.synergy.fTierCombos} F-tier combos`);
    }
    if (summary.highlights.economy) {
      console.log(`Economy:            Inflation index ${summary.highlights.economy.inflationIndex.toFixed(2)}`);
    }
    if (summary.highlights.sphere) {
      console.log(`Sphere Damage:      D6 avg ${summary.highlights.sphere.d6AvgDamage?.toFixed(0) || '?'}, D20 avg ${summary.highlights.sphere.d20AvgDamage?.toFixed(0) || '?'}`);
    }
    if (summary.highlights.elo) {
      console.log(`ELO System:         ${summary.highlights.elo.bestConfig} (${(summary.highlights.elo.correlation * 100).toFixed(0)}% skill correlation)`);
    }
    if (summary.highlights.wiki) {
      console.log(`Wiki Coverage:      ${(summary.highlights.wiki.coverage * 100).toFixed(0)}% (${summary.highlights.wiki.gaps} critical gaps)`);
    }
    console.log('');
  }
}

// ============================================
// Main Runner
// ============================================

async function runOnce(options: RunOptions): Promise<SummaryData> {
  // Filter simulations
  let simsToRun = SIMULATIONS;
  if (options.only) {
    simsToRun = SIMULATIONS.filter(s => options.only!.includes(s.id));
    if (simsToRun.length === 0) {
      console.error('No matching simulations found for:', options.only.join(', '));
      process.exit(1);
    }
  }

  console.log('='.repeat(70));
  console.log('NEVER DIE GUY - UNIFIED SIMULATION RUNNER');
  console.log('='.repeat(70));
  console.log(`Mode: ${options.parallel ? 'Parallel' : 'Sequential'}${options.quick ? ' (Quick)' : ''}`);
  console.log(`Simulations: ${simsToRun.map(s => s.id).join(', ')}`);
  console.log('='.repeat(70));
  console.log('');

  let results: SimResult[];

  if (options.parallel) {
    console.log('Running all simulations in parallel...');
    console.log('(Output will be interleaved)');
    console.log('');
    results = await Promise.all(simsToRun.map(sim => runSimulation(sim, options.quick)));
  } else {
    results = [];
    for (let i = 0; i < simsToRun.length; i++) {
      const sim = simsToRun[i];
      console.log('');
      console.log(`${'#'.repeat(70)}`);
      console.log(`# [${i + 1}/${simsToRun.length}] ${sim.name.toUpperCase()}`);
      console.log(`# ${sim.description}`);
      console.log(`${'#'.repeat(70)}`);
      console.log('');

      const result = await runSimulation(sim, options.quick);
      results.push(result);

      const status = result.success ? '\x1b[32m[OK]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
      console.log('');
      console.log(`${status} ${sim.name} completed in ${(result.duration / 1000).toFixed(1)}s`);
    }
  }

  const summary = await generateSummary(results);
  printSummary(summary);

  // Save summary
  const summaryPath = path.join(__dirname, '..', 'logs', 'unified-summary.json');
  const logDir = path.dirname(summaryPath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`Summary saved to: logs/unified-summary.json`);

  return summary;
}

async function main() {
  const options = parseArgs();

  if (options.continuous) {
    let runCount = 0;
    console.log(`Starting continuous mode (Ctrl+C to stop)`);
    console.log(`Delay between runs: ${options.delay / 1000}s`);
    console.log('');

    while (true) {
      runCount++;
      console.log(`\n${'#'.repeat(70)}`);
      console.log(`CONTINUOUS RUN #${runCount}`);
      console.log(`${'#'.repeat(70)}\n`);

      await runOnce(options);

      console.log(`\nNext run in ${options.delay / 1000}s... (Ctrl+C to stop)`);
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
  } else {
    await runOnce(options);
  }
}

main().catch(console.error);
