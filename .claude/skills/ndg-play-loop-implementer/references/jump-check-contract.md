# Jump Check resolver contract

`resolveJumpCheck` lives in `packages/ai-engine/src/faces/jump-check.ts`. It is **pure and seeded**:
data in, data out, no side effects, no I/O.

## Signature
```ts
resolveJumpCheck(face: Face, response: ResponseChoice, rng: SeededRng, namespace?: string): JumpResult
```

## Types
```ts
type ResponseChoice = 'guard' | 'throw' | 'flee';
type JumpOutcome    = 'jump' | 'watch' | 'open';

interface JumpModifier {
  startScoreMult: number;     // multiplier on the room score target (1 = neutral)
  throwDisadvantage: number;  // disadvantage steps (0 = none)
}
interface JumpResult {
  outcome: JumpOutcome;
  message: string;            // short player-facing line
  modifier: JumpModifier;
}
```

## Rules
- Outcome weights come from `face.jumpProfile` (`aggressive | unstable | defensive | watching`).
- `guard` downgrades a `jump` to a `watch`. `flee` guarantees a small score cost but avoids the worst
  jump. `throw` takes raw profile odds.
- The modifier is **score/disadvantage only** for the current slice. No HP, no run-ending outcome
  (invariant 2). Adding HP is a deliberate future step, not a default.

## Mapping the modifier into combat (no scoring rewrite)
In `PlayHub`, fold the modifier into the existing `scoreGoal` prop:
```ts
const base = getFlatScoreGoal(domain);
const eased = base / (mod.startScoreMult || 1);            // >1 eases the room
const goal  = Math.round(eased * (1 + 0.05 * mod.throwDisadvantage)); // hardens per step
```
`startScoreMult > 1` (an `open`) lowers the target; `throwDisadvantage` (a `jump`) raises it. This is
the entire combat coupling - `CombatTerminal`/`CombatEngine` internals are untouched.

## Extending later
- HP coupling: add an optional `hpDelta` to `JumpModifier`, apply in `RunContext`, keep it never
  run-ending on reveal.
- Favor/Myth drift on `watch`/`open`: emit a record, don't change combat.
