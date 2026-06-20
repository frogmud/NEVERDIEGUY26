/**
 * Jump Check - the monster pressure beat after the Response Phase.
 *
 * Seeded and pure. For this slice it applies a score / disadvantage modifier only -
 * never direct HP and never a run-ending outcome (No-Instant-Death rule).
 * See docs/current/08-app-systems-alignment-plan.md Step 4.
 */

import type { SeededRng } from '../core/seeded-rng';
import type { Face } from './face';

export type ResponseChoice = 'guard' | 'throw' | 'flee';

/** Jump Check outcomes. */
export type JumpOutcome = 'jump' | 'watch' | 'open';

export interface JumpModifier {
  /** Multiplier applied to the room's starting score (1 = neutral). */
  startScoreMult: number;
  /** Throw disadvantage steps for the upcoming room (0 = none). */
  throwDisadvantage: number;
}

export interface JumpResult {
  outcome: JumpOutcome;
  /** Short player-facing line. */
  message: string;
  modifier: JumpModifier;
}

const NEUTRAL: JumpModifier = { startScoreMult: 1, throwDisadvantage: 0 };

/**
 * Base jump weights per Face jumpProfile. Higher jump weight = more pressure.
 */
function profileWeights(face: Face): Array<{ item: JumpOutcome; weight: number }> {
  switch (face.jumpProfile) {
    case 'aggressive':
      return [{ item: 'jump', weight: 6 }, { item: 'watch', weight: 3 }, { item: 'open', weight: 1 }];
    case 'unstable':
      return [{ item: 'jump', weight: 5 }, { item: 'watch', weight: 2 }, { item: 'open', weight: 3 }];
    case 'defensive':
      return [{ item: 'jump', weight: 3 }, { item: 'watch', weight: 5 }, { item: 'open', weight: 2 }];
    case 'watching':
    default:
      return [{ item: 'jump', weight: 2 }, { item: 'watch', weight: 5 }, { item: 'open', weight: 3 }];
  }
}

/**
 * Resolve the Jump Check for a revealed Face given the player's response.
 * - guard softens a jump into a watch-like result.
 * - flee trades a guaranteed minor disadvantage to avoid the worst jump.
 * - throw takes the Face on directly (raw profile odds).
 */
export function resolveJumpCheck(
  face: Face,
  response: ResponseChoice,
  rng: SeededRng,
  namespace = 'jump',
): JumpResult {
  if (response === 'flee') {
    return {
      outcome: 'watch',
      message: `You back away. ${face.label} watches you go.`,
      modifier: { startScoreMult: 0.9, throwDisadvantage: 0 },
    };
  }

  let outcome = rng.randomWeighted(profileWeights(face), namespace) ?? 'watch';

  // Guard downgrades a jump to a watch.
  if (response === 'guard' && outcome === 'jump') {
    outcome = 'watch';
  }

  switch (outcome) {
    case 'jump':
      return {
        outcome,
        message: `${face.label} jumps. The room tightens.`,
        modifier: { startScoreMult: 0.8, throwDisadvantage: 1 },
      };
    case 'open':
      return {
        outcome,
        message: `${face.label} opens. A window appears.`,
        modifier: { startScoreMult: 1.15, throwDisadvantage: 0 },
      };
    case 'watch':
    default:
      return {
        outcome: 'watch',
        message: `${face.label} watches. No hit lands.`,
        modifier: { ...NEUTRAL },
      };
  }
}
