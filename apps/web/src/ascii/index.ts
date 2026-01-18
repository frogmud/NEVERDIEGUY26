/**
 * ASCII Animation System
 *
 * Brand-defining visual framework for NEVER DIE GUY.
 * Provides particle-based ASCII animations for transitions and effects.
 */

// Core engine
export { AsciiEngine } from './AsciiEngine';
export type { AsciiEngineConfig, ScatterOptions, ReformOptions, AnimationMode } from './AsciiEngine';

// Particle system
export { createParticle, resetParticle, DEFAULT_PHYSICS } from './AsciiParticle';
export type { AsciiParticle, ParticlePhysics } from './AsciiParticle';

// React components
export { AsciiCanvas } from './AsciiCanvas';
export type { AsciiCanvasProps, AsciiCanvasHandle } from './AsciiCanvas';

// Hooks
export { useAsciiAnimation, useWipeAnimation, useReformAnimation } from './hooks/useAsciiAnimation';
export type { UseAsciiAnimationOptions, UseAsciiAnimationReturn, AnimationPhase } from './hooks/useAsciiAnimation';

// Presets
export { NDG_SKULL, DEFAULT_SKULL, SKULL_CONFIG } from './presets/skull';

// Utilities
export { svgToAsciiGrid, generateSkullGrid, SKULL_ASCII_GRID } from './utils/svgToAscii';
export {
  CHAR_SET_DENSE,
  CHAR_SET_STANDARD,
  CHAR_SET_MINIMAL,
  CHAR_SET_BLOCK,
  CHAR_SET_DEATH,
  CHAR_SET_SPARK,
  CHAR_SET_SCORE,
  brightnessToChar,
  luminanceToChar,
} from './utils/charSets';
