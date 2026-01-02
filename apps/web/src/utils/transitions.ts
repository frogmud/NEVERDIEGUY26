/**
 * Simple Transition Constants
 *
 * Chess.com-style minimal animations.
 * Round 31: UX Polish
 */

// Timing constants (in ms)
export const DURATION = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// CSS transition strings
export const TRANSITIONS = {
  fast: `all ${DURATION.fast}ms ease-out`,
  normal: `all ${DURATION.normal}ms ease-out`,
  slow: `all ${DURATION.slow}ms ease-out`,
  // Specific transitions
  opacity: `opacity ${DURATION.normal}ms ease-out`,
  transform: `transform ${DURATION.normal}ms ease-out`,
  background: `background-color ${DURATION.fast}ms ease-out`,
} as const;

// Common animation patterns for MUI sx prop
export const FADE = {
  in: {
    opacity: 1,
    transition: TRANSITIONS.normal,
  },
  out: {
    opacity: 0,
    transition: TRANSITIONS.fast,
  },
} as const;

export const SCALE = {
  normal: {
    transform: 'scale(1)',
    transition: TRANSITIONS.normal,
  },
  up: {
    transform: 'scale(1.02)',
    transition: TRANSITIONS.fast,
  },
  down: {
    transform: 'scale(0.98)',
    transition: TRANSITIONS.fast,
  },
} as const;

// Slide patterns (for panels/overlays)
export const SLIDE = {
  inFromBottom: {
    transform: 'translateY(0)',
    opacity: 1,
    transition: TRANSITIONS.normal,
  },
  outToBottom: {
    transform: 'translateY(8px)',
    opacity: 0,
    transition: TRANSITIONS.fast,
  },
  inFromTop: {
    transform: 'translateY(0)',
    opacity: 1,
    transition: TRANSITIONS.normal,
  },
  outToTop: {
    transform: 'translateY(-8px)',
    opacity: 0,
    transition: TRANSITIONS.fast,
  },
} as const;

// Button press feedback
export const BUTTON_PRESS = {
  idle: {
    transform: 'scale(1)',
    transition: TRANSITIONS.fast,
  },
  active: {
    transform: 'scale(0.97)',
    transition: `transform 50ms ease-out`,
  },
} as const;

// Hover effect (subtle)
export const HOVER = {
  lift: {
    transform: 'translateY(-2px)',
    transition: TRANSITIONS.fast,
  },
  reset: {
    transform: 'translateY(0)',
    transition: TRANSITIONS.fast,
  },
} as const;
