#!/usr/bin/env tsx
/**
 * Integration Test Runner - Executable Script
 *
 * Runs automated playthroughs and outputs results.
 *
 * Usage:
 *   npx tsx audit/run-tests.ts
 *   pnpm test:integration
 */

import { runIntegrationTests } from './integration-runner';
import * as fs from 'fs';
import * as path from 'path';

console.log('┌─────────────────────────────────────────┐');
console.log('│  NEVER DIE GUY - Integration Runner    │');
console.log('│  Automated State Consistency Testing   │');
console.log('└─────────────────────────────────────────┘\n');

const startTime = Date.now();

// Run all integration tests
const { scenarios, results, summary } = runIntegrationTests();

const duration = ((Date.now() - startTime) / 1000).toFixed(2);

// Output summary
console.log('\n┌─────────────────────────────────────────┐');
console.log('│           TEST SUMMARY                  │');
console.log('└─────────────────────────────────────────┘');
console.log(`  Total Scenarios: ${summary.totalRuns}`);
console.log(`  Passed: ${summary.passed} ✓`);
console.log(`  Failed: ${summary.failed} ${summary.failed > 0 ? '✗' : ''}`);
console.log(`  Total Errors: ${summary.errors.length}`);
console.log(`  Duration: ${duration}s\n`);

// Output detailed errors if any
if (summary.errors.length > 0) {
  console.log('┌─────────────────────────────────────────┐');
  console.log('│           ERROR DETAILS                 │');
  console.log('└─────────────────────────────────────────┘\n');

  summary.errors.forEach((error, idx) => {
    console.log(`${idx + 1}. ${error}`);
  });
  console.log('');
}

// Output per-scenario results
console.log('┌─────────────────────────────────────────┐');
console.log('│        SCENARIO RESULTS                 │');
console.log('└─────────────────────────────────────────┘\n');

results.forEach((result, idx) => {
  const scenario = scenarios[idx];
  const status = result.errors.length === 0 ? '✓' : '✗';
  const finalPhase = result.phase;
  const domainsCleared = result.visitedDomains.length;

  console.log(`${status} ${scenario.seed} - ${scenario.description}`);
  console.log(`   Loadout: ${scenario.loadout}, Domains: ${domainsCleared}, Phase: ${finalPhase}`);
  console.log(`   Score: ${result.totalScore}, Gold: ${result.gold}, Scars: ${result.scars}/${4}`);

  if (result.errors.length > 0) {
    console.log(`   Errors (${result.errors.length}):`);
    result.errors.slice(0, 3).forEach(err => {
      console.log(`     - ${err}`);
    });
    if (result.errors.length > 3) {
      console.log(`     ... and ${result.errors.length - 3} more`);
    }
  }

  console.log('');
});

// Write results to JSON for programmatic access
const outputPath = path.join(__dirname, 'test-results.json');
const output = {
  timestamp: new Date().toISOString(),
  duration: parseFloat(duration),
  summary,
  scenarios: scenarios.map((scenario, idx) => ({
    ...scenario,
    result: {
      phase: results[idx].phase,
      domainsCleared: results[idx].visitedDomains.length,
      finalScore: results[idx].totalScore,
      finalGold: results[idx].gold,
      finalScars: results[idx].scars,
      errors: results[idx].errors,
      snapshotCount: results[idx].snapshots.length,
      transitionCount: results[idx].transitions.length,
    },
  })),
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Results written to: ${outputPath}\n`);

// Exit with appropriate code
if (summary.failed > 0) {
  console.log('⚠️  Some tests failed. See errors above.\n');
  process.exit(1);
} else {
  console.log('✅ All tests passed!\n');
  process.exit(0);
}
