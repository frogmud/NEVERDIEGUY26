/**
 * Shared simulation utilities
 *
 * All scripts should import from this module for consistent patterns.
 */

// CLI utilities
export {
  parseArgs,
  progressBar,
  logProgress,
  createSpinner,
  generateHelp,
  setupGracefulShutdown,
  formatDuration,
  validateRequired,
} from './cli';

// Output utilities
export {
  ensureLogDir,
  getTimestampedFilename,
  getDailyFilename,
  writeSimResults,
  writeCheckpoint,
  readCheckpoint,
  writeMarkdownReport,
  markdownTable,
  formatNumber,
  formatPercent,
  printHeader,
  printStats,
  printSummary,
  type SimulationResult,
} from './output';

// Simulation runner
export {
  runSimulation,
  calculateStats,
  groupBy,
  countBy,
  type SimulationConfig,
  type SimulationRunner,
} from './simulation';

// NPC data adapters
export {
  toSimpleNPC,
  getAllSimpleNPCs,
  getSimpleNPCsByCategory,
  getSimpleNPC,
  SIMPLE_ALL_NPCS,
  SIMPLE_WANDERERS,
  SIMPLE_TRAVELERS,
  SIMPLE_PANTHEON,
  ALL_NPCS,
  WANDERER_NPCS,
  TRAVELER_NPCS,
  PANTHEON_NPCS,
  getNPCDefinition,
  type SimpleNPC,
  type EnhancedNPCConfig,
} from './npc-adapter';
