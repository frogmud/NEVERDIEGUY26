# Invariants - the why and the failure mode

| # | Invariant | Why | Failure mode if broken |
|---|-----------|-----|------------------------|
| 1 | CombatEngine is the room authority | One seeded source of truth for scoring; the loop wrapper must not fork it | Two scoring systems drift; saves and replays desync |
| 2 | A reveal never ends the run | The product's core promise is "not reveal-and-die" - reveal=threat, response=play, resolution=consequence | The beat the game exists to prove is gone; player has no agency |
| 3 | One combat state owner | `RunContext` had stale combat reducer actions that disagree with the engine on hold/trade | Expanding them re-creates the duplicate-owner bug the audit is retiring |
| 4 | Office identity != domainId | Worldbuilding needs jurisdiction (Office/Door) separate from place/travel order | Numeric collisions wire the wrong Die-rector/Office to a domain |
| 5 | Transient panels not persisted | A reload mid-reveal would restore an empty reveal panel | Player stuck on a blank reveal with no Faces |
| 6 | Seed gameplay RNG by run context | Determinism for replays, fairness, and telemetry | `Math.random()`/`Date.now()` makes outcomes irreproducible |

## Quick self-check before committing
- Did I touch `combat-engine.ts` scoring? -> stop, you should be wrapping it.
- Can any reveal path deal HP or set `runEnded`? -> stop.
- Did I add a new combat reducer action to `RunContext`? -> stop, use the engine.
- Did I use `domainId` where an `OfficeId` belongs? -> use `domainToOffice`.
- Is any outcome RNG unseeded? -> seed it `threadId:domain:room:purpose`.
