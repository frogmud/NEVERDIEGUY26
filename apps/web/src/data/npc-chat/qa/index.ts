/**
 * NPC Chat QA Harness
 *
 * Tools for validating templates and simulating responses.
 */

// Template Linter
export {
  lintTemplate,
  lintNPCTemplates,
  lintAll,
  formatLintResults,
} from './template-linter';
export type { LintSeverity, LintIssue, LintResult } from './template-linter';

// Response Simulator
export {
  runSimulation,
  verifyDeterminism,
  testCooldowns,
  formatSimulationResults,
  runFullQA,
} from './response-simulator';
export type { SimulationConfig, SimulationResult } from './response-simulator';
