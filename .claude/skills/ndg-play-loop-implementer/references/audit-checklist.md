# Play-path audit checklist

Run this before writing any code. Resolve every line to a concrete `file:symbol`.

## Entry / launch
- [ ] Where does a room start today? (`apps/web/src/screens/play/components/tabs/GameTabLaunch.tsx`
      primary button; `apps/web/src/screens/play/PlayHub.tsx` `handleLaunch` + the two auto-launch
      `useEffect`s, and the post-shop launch.) List **every** path that reaches combat.
- [ ] What player-facing label fires it? (Should read as Bones/Faces, not dice-first.)

## Run state ownership
- [ ] `RunContext.tsx` `CenterPanel` union - which panels exist?
- [ ] `RunState` interface - which fields are run-level vs combat-level?
- [ ] Reducer actions - which are live vs quarantined? (Stale combat actions: `INIT_COMBAT`,
      `TOGGLE_HOLD_DIE`, `THROW_DICE`, `END_COMBAT_TURN` - do not touch.)
- [ ] Persistence: the auto-save `useEffect` (`SavedRunState`) + `LOAD_RUN`/`START_RUN`/`RESET_RUN`.
      Confirm new fields are additive and transient panels are not persisted.

## Combat authority
- [ ] `packages/ai-engine/src/combat/combat-engine.ts` - the seeded engine API (target score, trades,
      time pressure, item hooks). This stays the authority.
- [ ] `apps/web/src/screens/play/components/CombatTerminal.tsx` - the combat surface + web-only
      add-ons (event timer/decay, guardians, draw events, feed, victory callback). What props feed it
      (`scoreGoal`, `onWin`, `onLose`, `isLobby`)? Your modifier rides in through these.

## Encounter / reveal hooks
- [ ] `packages/ai-engine/src/encounters/generator.ts` - seeded encounter generator (preferred for
      reveal/banter).
- [ ] `apps/web/src/screens/play/EncounterPopup.tsx` - polished but not rendered; reuse or replace?
- [ ] Legacy duel/meteor paths (`data/duels/config.ts`, `DiceMeteor`, `Globe3D`) - note but do not
      delete here.

## Identity
- [ ] `apps/web/src/data/domains.ts` vs `packages/ai-engine/src/encounters/domain-mapping.ts` vs the
      Office table. Use `domainToOffice` from `@ndg/shared`; never reuse `domainId` as `officeId`.

## Output of the audit
A before/after flow map (see `flow-map.md`) plus a one-line owner for each beat. Only then implement.
