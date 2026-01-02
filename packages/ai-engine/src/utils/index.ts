/**
 * Utilities Module
 *
 * Helper utilities for NDG AI Engine.
 */

export {
  ChatLogger,
  getGlobalChatLogger,
  resetGlobalChatLogger,
  DEFAULT_LOGGER_CONFIG,
  type ChatLogEntry,
  type ChatLogSession,
  type ChatLoggerConfig,
} from './chat-logger';

export {
  SimulationPersistenceManager,
  getGlobalPersistence,
  resetGlobalPersistence,
  getStorageAdapter,
  calculateCatchUpMatches,
  DEFAULT_PERSISTENCE_CONFIG,
  type SimulationPersistence,
  type StatisticsPersistence,
  type RivalriesPersistence,
  type QuitStatesPersistence,
  type ChatLogsPersistence,
  type PersistenceConfig,
  type StorageAdapter,
} from './persistence';
