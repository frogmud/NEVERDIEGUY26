# Scan commands (read-only)

Run from `apps/web/src` unless noted. All read-only; gather findings, do not change anything.

## 1. Large files (size bloat)
```bash
find . -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20
```
Flag anything > ~800 lines as a FOLD candidate (split into hooks/modules). Note: a big data file
(wiki entities, chatbase) is not automatically bloat - size alone isn't the verdict.

## 2. Unreferenced files / components (forgotten work)
For a suspect file `Foo.tsx`, count inbound references:
```bash
grep -rl "Foo" --include=*.ts --include=*.tsx . | grep -v "Foo.tsx" | wc -l
```
Zero references + not an entry/route = DELETE candidate (verify again right before removal).
Example: `EncounterPopup` is referenced only by itself today (polished but not rendered).

## 3. Stale routes / screens
```bash
# Find route declarations, then check each target is still reachable
grep -rn "path=\|<Route" . | head -40
```
Cross-check legacy play paths: `screens/play/Globe3D.tsx`, `screens/play/DiceMeteor.tsx`,
`games/meteor/`, `games/globe-meteor/`, old `EventSelection`, `DoorOverlay`.

## 4. Duplicate ownership (two systems own one concept)
```bash
grep -rn "INIT_COMBAT\|THROW_DICE\|TOGGLE_HOLD_DIE\|END_COMBAT_TURN" ../contexts/RunContext.tsx
```
These reducer actions duplicate `packages/ai-engine/src/combat/combat-engine.ts`. Authority =
engine; the reducer actions are the duplicate -> QUARANTINE.

## 5. Encounter path fan-out
```bash
ls ../../../packages/ai-engine/src/encounters; ls data/duels games/meteor 2>/dev/null
```
Newer seeded `encounters/generator.ts` should win; `data/duels/config.ts` + meteor entity paths are
REPLACE/RETIRE candidates once call sites move.

## 6. Import cycles
```bash
# from repo root, if madge is available without a fresh install:
npx --no-install madge --circular apps/web/src 2>/dev/null || echo "madge unavailable - do manual cycle check"
```
If `madge` would require a >1-day-old install that's blocked by the cooldown, skip it and trace
cycles by hand from the largest files' imports. Do not install tooling just to scan.

## 7. Unseeded gameplay RNG (correctness debt, not deletion)
```bash
grep -rn "Math.random()\|Date.now()" . | grep -iE "guardian|duel|encounter|roll|seed" | head
```
Flag for the RNG-cleanup follow-up (seed by `runSeed/domain/room/...`); classify KEEP-but-fix.
