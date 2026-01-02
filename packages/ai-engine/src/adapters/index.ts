/**
 * Game Adapters
 *
 * Bridge layers between game engines and the NDG AI Engine.
 */

export {
  PhaserAdapter,
  createPhaserAdapter,
} from './phaser-adapter';

export type {
  GameEventType,
  GameEvent,
  GameEventData,
  NPCChatMessage,
  QuickReply,
  PhaserAdapterConfig,
} from './phaser-adapter';
