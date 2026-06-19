# Sample ranked cleanup plan (demo output)

This is the shape the skill produces. Numbers are from a real scan of `apps/web/src` (2026-06).
Nothing here is deleted - it is a plan. Ranked by value/risk, low-risk first.

## Findings

| # | Finding | Lines / refs | Class | Risk | What proves it safe | Follow-up step |
|---|---------|-------------|-------|------|---------------------|----------------|
| 1 | `EncounterPopup.tsx` not rendered | self-refs only | DELETE-candidate | LOW | `grep -rl EncounterPopup` excl. self = 0 | Decide: wire it into the Response Phase, or remove after explicit OK |
| 2 | Stale combat reducer actions in `RunContext` | 4 actions | QUARANTINE | LOW | They no longer own live combat; `CombatEngine` does | Comment + freeze; remove after `CombatSession` adapter |
| 3 | Old duel path `data/duels/config.ts` + meteor `EncounterPanel` | - | REPLACE | MED | Seeded `encounters/generator.ts` covers reveal/banter | Move call sites to the generator, verify parity, then retire |
| 4 | `CombatTerminal.tsx` | 1786 | FOLD | MED | Behavior preserved by extraction, covered by a room playtest | Split into `useCombatSession/useCombatVisuals/useJumpCheck/CombatStage/CombatFeed` |
| 5 | `RunContext.tsx` | 1724 | FOLD | MED-HIGH | Save shape unchanged (byte-compatible `SavedRunState`) | Split into reducer modules; persistence module last |
| 6 | `HomeDashboard.tsx` / `HomeChatter.tsx` | 3230 / 1970 | FOLD | MED | Not a combat blocker | Split after the combat slice; not first |
| 7 | Legacy `games/meteor`, `games/globe-meteor`, `Globe3D`, `DiceMeteor` | - | REPLACE/route-audit | HIGH | Requires a route audit + working replacement | Do NOT delete yet; gate behind route audit |
| 8 | Unseeded gameplay RNG (`Math.random()/Date.now()` in guardian/duel/encounter) | - | KEEP-but-fix | MED | Determinism follow-up, not a delete | Seed by `runSeed/domain/room/...` |

## Recommended order (low-risk first)
1. #2 QUARANTINE the stale combat actions (comment-only, LOW).
2. #1 Resolve `EncounterPopup` (wire or remove with OK, LOW).
3. #3 REPLACE the duel path with the seeded generator (MED).
4. #4 FOLD `CombatTerminal` into hooks (MED, needs playtest).
5. #5 FOLD `RunContext` reducer modules (MED-HIGH, persistence last).
6. #6 FOLD Home* after the combat slice.
7. #7 Legacy meteor/globe routes - route audit only, no deletion this pass.
8. #8 RNG seeding follow-up.

## Guardrail reminders applied here
- #7 stays REPLACE/route-audit, never DELETE, because the routes may still be reachable.
- #2 is QUARANTINE not DELETE because saves/other code may still reference the action types.
- HIGH-risk items (#5 persistence, #7 routes) require a Vercel preview playtest, not just a typecheck.
