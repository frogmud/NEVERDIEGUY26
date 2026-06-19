---
name: ndg-play-loop-implementer
description: Implement a narrow playable slice of the NDG run loop (Cast Bones -> Reveal Faces -> Response Phase -> Jump Check -> Resolve Room -> Bury -> What Remained) by wrapping the existing combat, not rewriting it. Use when adding or extending any beat of the play loop in apps/web. Enforces the audit-first workflow and the hard invariants (CombatEngine stays the room authority; a Face reveal never ends the run; Office identity is separate from domainId).
---

# NDG Play-Loop Implementer

You implement one narrow, playable slice of the latest NDG run loop and stop. You wrap the existing
combat engine; you never rewrite scoring or duplicate combat state. The canonical audit is
`docs/current/08-app-systems-alignment-plan.md` (parent workspace) and the PRD chain is in
`docs/current/05-prd-operating-summary.md`.

Target chain:
```
Domain selected -> Cast Bones -> Reveal Faces -> Response Phase -> Jump Check
-> Resolve Room (existing CombatTerminal/CombatEngine) -> Bury -> What Remained
```

## When to use
- Adding or extending any beat: reveal, Response Phase, Jump Check, room receipt, What Remained.
- Wiring a new run-level state field or panel into `RunContext` + `PlayHub`.
NOT for: combat math changes, deleting legacy routes (use `ndg-repo-diet-auditor`), or content/data
authoring (use `ndg-systems-pack-builder`).

## Hard invariants (do not violate)
1. **CombatEngine is the room-resolution authority** (`packages/ai-engine/src/combat/combat-engine.ts`).
   Wrap it; never fork scoring. Pass modifiers in via props/config.
2. **A Face reveal cannot end the run.** Reveal creates threat; the Response Phase creates play;
   resolution creates consequence. No HP/death on reveal.
3. **Do not add a second combat state owner.** The stale `RunContext` reducer actions
   (`INIT_COMBAT`, `TOGGLE_HOLD_DIE`, `THROW_DICE`, `END_COMBAT_TURN`) are quarantined - do not
   expand them. `RunContext` owns run-level state only (panels, revealed Faces, response, jump
   result, persistence).
4. **Office identity != domainId.** Use `domainToOffice(domainId)` from `@ndg/shared`. Never cast
   one number to the other.
5. **Transient panels are not persisted.** Reveal/response panels coerce to `globe` on save so a
   reload re-casts Bones rather than restoring an empty reveal.
6. **Seed gameplay RNG by run context** (`threadId:domain:room:purpose`). No `Math.random()` /
   `Date.now()` for outcomes.

## Workflow (follow in order)

### 1. Audit the current play path
Run the checklist in `references/audit-checklist.md`. Produce a short before/after flow map (template
in `references/flow-map.md`). Confirm where the loop currently jumps (today: `GameTabLaunch` ->
combat) and which files own each beat. Do not write code until the map is written.

### 2. Add the slice behind the existing combat
- New run state + panels go in `apps/web/src/contexts/RunContext.tsx`: extend `CenterPanel`, add
  state fields, add narrow reducer actions + action-creator callbacks (which build a seeded RNG and
  call the pure `@ndg/ai-engine/faces` helpers). Wire callbacks into the `value` object **and** its
  deps array.
- New presentational panels go in `apps/web/src/screens/play/panels/`, built with `@neverdieguy/ui`
  (`BaseCard`, `DataBadge`, `MenuButton`). They read state and dispatch; no game logic inside.
- Render branches go in `apps/web/src/screens/play/PlayHub.tsx` (mirror the existing `combat` branch
  + `panelEnter` animation). Route **every** entry point through the new beat (the launch handler and
  both auto-launch effects), not just the primary button.
- Pure resolvers (Jump Check, reveal selection) live in `@ndg/ai-engine`, are seeded, and return
  data only. See `references/jump-check-contract.md` and `fixtures/jump-check.resolver.ts`.

### 3. Apply outcomes without rewriting combat
Convert the resolver's modifier into existing combat inputs (e.g. adjust `scoreGoal`). Keep it to
score/disadvantage for the first pass; defer HP coupling. See `fixtures/room-receipt.example.md`.

### 4. Telemetry
Emit the chain events through `apps/web/src/utils/telemetry.ts`: `bones_thrown`, `faces_revealed`,
`response_phase_started`, `jump_check_resolved`, `room_resolved`.

### 5. Verify
- Rebuild edited workspace packages (`pnpm --filter <name> build`) - consumers read `dist/`.
- `npx tsc --noEmit` in the edited package(s) and in `apps/web` (avoid `turbo` - it re-trips the
  install cooldown gate). Then `pnpm --filter @ndg/web build`.
- Definition of done: run no longer jumps domain->combat; a reveal can't end the run; one response
  action precedes resolution pressure; combat still wins/loses rooms; typecheck + web build pass.
- A green build does NOT prove the page runs (chunk-TDZ rule) - open the Vercel preview and play one
  room before declaring done.

## Reference map
- `references/audit-checklist.md` - the file-by-file audit you run first.
- `references/flow-map.md` - before/after flow-map template (with the shipped slice as a worked example).
- `references/invariants.md` - the invariants above, expanded with the why and the failure mode.
- `references/jump-check-contract.md` - resolver contract + modifier->combat mapping.
- `references/panel-contract.md` - the presentational-panel contract (props, what is/ isn't allowed).
- `fixtures/` - runnable-shaped samples: a `FaceRevealPanel` contract, the Jump Check resolver, and a
  sample room-receipt output. These mirror the real shipped slice (commit `feat(play): add
  Bones/Faces run-loop slice`).

## Worked example (the shipped slice)
The first slice is already in the tree and is the canonical demo:
- `@ndg/shared` `world.ts` - `OfficeId`/`OFFICES`/`domainToOffice`.
- `@ndg/ai-engine/faces/` - `Face`, `FACES` (6, one per Office), `revealFaces`, `resolveJumpCheck`.
- `RunContext` - `reveal`/`response` panels, `castBones`/`chooseResponse`.
- `screens/play/panels/FaceRevealPanel.tsx`, `ResponsePhasePanel.tsx`; `PlayHub` render branches.
Read those before extending; match their shape.
