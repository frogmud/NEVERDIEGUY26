/**
 * FIXTURE - the Jump Check resolver shape (mirrors
 * packages/ai-engine/src/faces/jump-check.ts). Pure + seeded. Copy/adapt; do not
 * import this file - the real one ships in @ndg/ai-engine.
 *
 * Demo run at the bottom shows the full mini workflow: face + choice + seeded rng -> result.
 */

export type ResponseChoice = 'guard' | 'throw' | 'flee';
export type JumpOutcome = 'jump' | 'watch' | 'open';

export interface JumpModifier {
  startScoreMult: number;
  throwDisadvantage: number;
}
export interface JumpResult {
  outcome: JumpOutcome;
  message: string;
  modifier: JumpModifier;
}

// Minimal Face shape needed here (real Face has more fields).
interface FaceLike {
  label: string;
  jumpProfile: 'aggressive' | 'unstable' | 'defensive' | 'watching';
}

// Stand-in for @ndg/ai-engine SeededRng (real one is namespaced mulberry32).
interface RngLike {
  randomWeighted<T>(items: Array<{ item: T; weight: number }>, ns?: string): T | undefined;
}

function profileWeights(face: FaceLike): Array<{ item: JumpOutcome; weight: number }> {
  switch (face.jumpProfile) {
    case 'aggressive': return [{ item: 'jump', weight: 6 }, { item: 'watch', weight: 3 }, { item: 'open', weight: 1 }];
    case 'unstable':   return [{ item: 'jump', weight: 5 }, { item: 'watch', weight: 2 }, { item: 'open', weight: 3 }];
    case 'defensive':  return [{ item: 'jump', weight: 3 }, { item: 'watch', weight: 5 }, { item: 'open', weight: 2 }];
    default:           return [{ item: 'jump', weight: 2 }, { item: 'watch', weight: 5 }, { item: 'open', weight: 3 }];
  }
}

export function resolveJumpCheck(
  face: FaceLike,
  response: ResponseChoice,
  rng: RngLike,
  namespace = 'jump',
): JumpResult {
  if (response === 'flee') {
    return {
      outcome: 'watch',
      message: `You back off the ${face.label}. It watches you go.`,
      modifier: { startScoreMult: 0.9, throwDisadvantage: 0 },
    };
  }
  let outcome = rng.randomWeighted(profileWeights(face), namespace) ?? 'watch';
  if (response === 'guard' && outcome === 'jump') outcome = 'watch';

  switch (outcome) {
    case 'jump': return { outcome, message: `The ${face.label} jumps. The room tightens.`, modifier: { startScoreMult: 0.8, throwDisadvantage: 1 } };
    case 'open': return { outcome, message: `The ${face.label} opens. A window appears.`, modifier: { startScoreMult: 1.15, throwDisadvantage: 0 } };
    default:     return { outcome: 'watch', message: `The ${face.label} watches. No hit lands.`, modifier: { startScoreMult: 1, throwDisadvantage: 0 } };
  }
}

// --- demo (illustrative; real rng comes from createSeededRng) ---
// const face = { label: 'The Custodian', jumpProfile: 'aggressive' as const };
// const rng = { randomWeighted: (items) => items[0].item }; // deterministic stub
// resolveJumpCheck(face, 'throw', rng)
//   => { outcome: 'jump', message: 'The Custodian jumps...', modifier: { startScoreMult: 0.8, throwDisadvantage: 1 } }
// resolveJumpCheck(face, 'guard', rng)   // guard downgrades the jump
//   => { outcome: 'watch', ... modifier: { startScoreMult: 1, throwDisadvantage: 0 } }
