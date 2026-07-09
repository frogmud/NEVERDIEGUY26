---
name: ndg-canon-sim
description: Run the NDG canon loop - eternal-days NPC simulation -> chatbase extract -> measure -> reconcile -> repeat. Use when the user wants to sim NPC dialogue/plotlines, continue the eternal world, extract or QA the chatbase, read a run's blog against the Field Guide, or reconcile a canon contradiction the sim surfaced. Sources of truth for lore, style, and world state are locked in references/sources-of-truth.md.
---

# NDG Canon Sim Loop

The eternal-days sim generates day-by-day NPC life (ceelo gambling, debts, moods, realm
weather, pantheon weeks) with claude-sonnet-5 dialogue. It is the primary chatbase and
canon generator. The loop deepens ONE continuous world - never reset it casually.

```
sim (continue) -> extract -> measure -> reconcile canon/defs -> repeat
```

## The loop (run from repo root)

```bash
pnpm sim:canon:week            # ONLY for a brand-new world (fresh state, day 1)
pnpm sim:canon:continue        # +7 days resumed from the latest run
pnpm sim:canon:continue:month  # +30 days resumed (long leg)
pnpm sim:extract               # rebuild chatbase/ from ALL logs (free, idempotent)
.claude/skills/ndg-canon-sim/scripts/measure.sh   # QA the latest leg + chatbase
```

- `:continue` scripts use `--resume=latest`: gold, records, debts, moods, player
  profile, and day numbering carry forward. `sim:canon:day/week/month` (no
  `:continue`) start FRESH worlds - confirm with the user before running one.
- Cost ~1.8 cents/sim-day (~13c/week, ~55c/month). Budget is never the constraint;
  duplicate-sounding dialogue is. Prefer weekly legs while voices are still being
  tuned; monthly legs once they feel locked.
- Direct invocation for custom legs:
  `cd packages/ai-engine && set -a; . ../../.env; set +a; npx tsx scripts/npc-eternal-days.ts --use-claude --model=claude-sonnet-5 --extract-templates --days=N --resume=latest --seed=<unique>`

## Measure (after every leg)

1. Run `scripts/measure.sh` - checks the latest run + chatbase for: truncated lines,
   em/en dashes, King James venue violations (his games must be `at sun`), dialogue
   volume per day, catchphrase wear counts, chatbase pool/NPC distribution.
2. Read the leg's `blog.md` (chronological, chaptered by pantheon week) with the
   Field Guide open. Hunt for:
   - **Voice drift** - an NPC sounding off-model vs their Field Guide entry
   - **Catchphrase wear** - the same line quoted verbatim across days
   - **Emergent plotlines worth canonizing** (e.g. proxy dice, debt arcs)
   - **Canon contradictions** (e.g. a throne-bound character walking around)
3. Report findings to the user as: keep / tune / reconcile.

## Reconcile (when the sim contradicts canon or invents something good)

1. The user makes the canon call (never decide lore unilaterally).
2. Record it in the Field Guide reconciliation log
   (`../comic/field-guide/09-reconciliation-log.md`, numbered table row, dated).
3. Update the affected Field Guide cast entries (`03-cast.md`).
4. Enforce it in the sim: NPC defs (`ALL_NPCS` in
   `packages/ai-engine/scripts/npc-eternal-days.ts`) and/or mechanics (e.g. the
   King James venue override exists at BOTH ceelo call sites - morning and evening).
5. Worked example: reconciliation log entry 10 (King James proxy dice at the Sun).

## Sources of truth (locked - see references/sources-of-truth.md for full detail)

| Rank | Source | Governs |
|------|--------|---------|
| 1 | `../comic/field-guide/` (esp. 02-canon-locks, 03-cast, 09-reconciliation-log) | Character law, canon locks. Comic canon runs AHEAD of game code. |
| 2 | `../docs/skills/NDG_CONSOLIDATED_WRITING_SKILL.md` | Style law (no em dashes, aphorism budget, doom-poetic palette) |
| 3 | `ALL_NPCS` in `scripts/npc-eternal-days.ts` | The sim's character model - defs are the model, chatbase is samples |
| 4 | `packages/ai-engine/logs/eternal-*` | World history. Gitignored - the only copy. Deleting a run dir removes its lines on next extract. |
| 5 | `packages/ai-engine/chatbase/` | DERIVED. Never hand-edit; re-run sim:extract instead. |

## Gotchas

- **Never pass `temperature`** - the Claude 5 family 400s on sampling params. The
  script omits it; do not add it back.
- **`--resume=latest`** picks the newest `logs/eternal-*` with a `final-state.json`.
  A stray test run becomes "latest" - delete test runs immediately, and never use
  seeds that could be mistaken for canon legs.
- Style rules live in the sim prompt (STYLE block in `buildEternalContext`) plus
  mechanical dash scrubs in sim output AND extractor. Truncated (max_tokens) lines
  are trimmed to the last full sentence or dropped.
- Transient API 500s are logged and retried; a string of `0 lines of dialogue`
  heartbeat days means real API trouble - check the logged error.
- Ctrl-C once = finish current day and flush finals; twice = force quit. A crashed
  leg still writes everything completed.
- `sim:restock` / `sim:audit` read the app-side chatbase
  (`apps/web/src/data/npc-chat/npcs/chatbase-extracted.ts`), which is NOT synced
  from `packages/ai-engine/chatbase/` yet. Flag this if using them.
