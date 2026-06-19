# Decision table - expanded

For each finding, pick the **least destructive** class that resolves the problem.

## QUARANTINE
The code looks alive but contradicts the system that actually owns the behavior. Don't expand it;
mark it dead and point at the authority. No deletion yet (other code or saves may still reference it).
- Example: `RunContext` actions `INIT_COMBAT / TOGGLE_HOLD_DIE / THROW_DICE / END_COMBAT_TURN`.
  Authority is `CombatEngine`. Add a comment, stop wiring new callers, plan removal after the
  `CombatSession` adapter lands.

## FOLD
Logic is valuable but lives in an oversized or wrong home. Extract behind the authority without
behavior change.
- Example: `CombatTerminal.tsx` (~1.8k lines) mixes engine calls with web-only add-ons (event
  timer/decay, guardian targeting, draw-event bonuses, feed history). Fold into
  `useCombatSession / useCombatVisuals / useJumpCheck / CombatStage / CombatFeed`.
- Example: `RunContext.tsx` (~1.7k lines) -> reducer modules (run lifecycle, travel, reveal/response,
  persistence, world-state). MED risk: persistence shape must stay byte-compatible.

## REPLACE
A newer system supersedes an older one that is still wired in. Move call sites, verify parity, then
retire the old path.
- Example: old duel/wanderer path (`data/duels/config.ts`, meteor `EncounterPanel`) -> seeded
  `encounters/generator.ts`. Keep Cee-lo as a named minigame, not the default response phase.

## DELETE
Zero inbound references, no replacement risk, not a reachable route. Only with explicit OK and a
re-verified zero-reference check immediately before removal.
- Candidate gate: `grep -rl` count is 0 (excluding self) AND not in any route table AND not a
  public package export.

## KEEP (incl. KEEP-but-fix)
Load-bearing. Leave behavior; may still carry a correctness follow-up (e.g. unseeded RNG) tracked
separately, not a cleanup delete.

## Never
- Delete the authority to resolve a duplicate (retire the duplicate instead).
- Delete a reachable route/screen because it "looks legacy".
- Bundle unrelated cleanups into one pass.
