# Flow-map template

Write this before coding. Keep it to two small diagrams + an owner table.

## Before (template)
```
<entry screen> --(<action label>)--> <combat surface>
```

## After (template)
```
<entry screen> --(<new action>)--> <new beat 1> --> <new beat 2> --> <combat surface> --> <receipt>
```

## Owner table (template)
| Beat | File:symbol | State source | Notes |
|------|-------------|--------------|-------|
| ...  | ...         | ...          | ...   |

---

## Worked example - the shipped first slice

### Before
```
GameTabLaunch [LAUNCH] --> PlayHub transitionToPanel('combat') --> CombatTerminal
```

### After
```
GameTabLaunch [CAST BONES]
  -> PlayHub handleLaunch: castBones() + transitionToPanel('reveal')
  -> FaceRevealPanel (3 Faces)  --[Continue]-->  transitionToPanel('response')
  -> ResponsePhasePanel (Guard / Throw Bones / Flee) --> chooseResponse(choice)
       -> resolveJumpCheck -> shows Jump result --[Enter the room]--> transitionToPanel('combat')
  -> CombatTerminal (scoreGoal adjusted by jump modifier)
  -> portals / summary  (room receipt for this slice; full What Remained deferred)
```

### Owner table
| Beat | File:symbol | State source | Notes |
|------|-------------|--------------|-------|
| Cast Bones | `PlayHub.handleLaunch` + auto-launch effects | `RunContext.castBones` | routes all entry paths |
| Reveal | `screens/play/panels/FaceRevealPanel.tsx` | `state.revealedFaces` | `revealFaces(rng,3)` seeded by `threadId:domain:room:bones` |
| Response | `screens/play/panels/ResponsePhasePanel.tsx` | `state.responseChoice` | three `MenuButton`s |
| Jump Check | `@ndg/ai-engine` `resolveJumpCheck` | `state.jumpResult` | pure, seeded `:jump`; score/disadvantage only |
| Resolve | `CombatTerminal` via `PlayHub` | `adjustedScoreGoal` | combat math unchanged |
| Telemetry | `apps/web/src/utils/telemetry.ts` | - | bones_thrown/faces_revealed/response_phase_started/jump_check_resolved/room_resolved |
