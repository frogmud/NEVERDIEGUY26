import { DiceRoll } from '@dice-roller/rpg-dice-roller';

// Standard integer dice notation only: NdM, additional +/-NdM groups, optional +/-K modifier.
const DICE_NOTATION = /^\d+d\d+([+-]\d+d\d+)*([+-]\d+)?$/;

/**
 * Construct a DiceRoll after asserting the notation is plain integer dice syntax.
 *
 * rpg-dice-roller evaluates notation through mathjs, which is vulnerable to
 * prototype pollution via crafted expression strings (CVE-2026-41139). All dice
 * notation in NDG is app-built from integers (dice counts + sides + modifier), so
 * this guard should never reject in normal use - it's a hard invariant that keeps
 * any future code change from accidentally feeding untrusted input to mathjs.
 */
export function safeDiceRoll(notation: string): DiceRoll {
  if (!DICE_NOTATION.test(notation)) {
    throw new Error(`Refusing to roll non-integer dice notation: ${JSON.stringify(notation)}`);
  }
  return new DiceRoll(notation);
}
