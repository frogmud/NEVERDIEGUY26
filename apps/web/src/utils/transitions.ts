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

// Balatro-style organic easing
export const EASING = {
  organic: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// Stagger helper for sequential animations
export const stagger = (index: number, baseDelay = 50) => ({
  animationDelay: `${index * baseDelay}ms`,
});

// Pop constants for scale interactions
export const POP = {
  // Scale multipliers for different pop intensities
  subtle: 1.02,
  normal: 1.05,
  strong: 1.1,
  dramatic: 1.2,
  // Duration for pop animations
  duration: {
    quick: 150,
    normal: 250,
    slow: 400,
  },
} as const;

// Wiggle keyframes for subtle oscillation
// Use with MUI's keyframes function: keyframes`${WIGGLE.subtle}`
export const WIGGLE = {
  subtle: `
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-2deg); }
    75% { transform: rotate(2deg); }
  `,
  normal: `
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-4deg); }
    75% { transform: rotate(4deg); }
  `,
  strong: `
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-8deg); }
    75% { transform: rotate(8deg); }
  `,
} as const;
