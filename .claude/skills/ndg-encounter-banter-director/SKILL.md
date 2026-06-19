---
name: ndg-encounter-banter-director
description: Generate usable enemy, NPC, and banter packs for NDG that obey the writing voice AND the game state - intro, reveal, Response Phase pressure, Jump Check, victory/fail/flee lines, plus low/mid/high Myth drift and BOO G shop-to-shrine variants. Use when authoring encounter/banter content. Outputs structured JSON/content rows keyed to Face/Office/banterPool IDs, not loose prose, so lines slot straight into the systems data.
---

# NDG Encounter & Banter Director

You write encounter and banter content that is **both in-voice and state-aware**, and you emit it as
**structured rows** keyed to the data IDs, never as a wall of prose. Every line knows which Face,
Office, banter pool, game beat, and Myth tier it belongs to.

Two non-negotiable inputs:
1. **Voice** - read `../docs/skills/NDG_CONSOLIDATED_WRITING_SKILL.md` first and obey it (system
   vocabulary: Bones/Faces/Graveyard/Archive/Myth/Favor/Corruption; "Throw the Bones. Feed the Myth."
   is a banner used rarely; simpler and shorter wins; no em dashes; no emojis).
2. **Schema** - lines attach to IDs from `ndg-systems-pack-builder` (`faceId`, `officeId`,
   `banterPoolId`) and to the play beats from `ndg-play-loop-implementer`.

## When to use
- Authoring enemy/NPC encounter packs, banter pools, Myth-drift line tables, BOO G shop/shrine copy.
NOT for: defining the data schema (`ndg-systems-pack-builder`) or wiring UI (`ndg-play-loop-implementer`).

## Beat coverage (every encounter pack fills these slots)
| Beat | Trigger | Notes |
|------|---------|-------|
| `intro` | enemy/Face appears | sets threat; does not kill |
| `reveal` | Face revealed | one line per reveal; ties to the Face's role/glyph |
| `response_pressure` | Response Phase open | needles the Guard/Throw/Flee choice |
| `jump` | Jump Check outcome | one variant per outcome: `jump` / `watch` / `open` |
| `victory` | room won | short |
| `fail` | room lost | short; never gloats about death as a reset - death is custody change |
| `flee` | player fled | acknowledges the back-off |

## Myth drift (every line table has 3 tiers)
- `low` - plain, local, unembellished. The world barely knows this thing.
- `mid` - the story is sticking; references accrue.
- `high` - mythologized; the thing speaks/looks like a remembered legend. BOO G reaches shrine voice.
Keep the same FACTS across tiers; only the framing drifts (matches the writing skill's tone passes).

## Output contract (structured rows, not prose)
```json
{
  "banterPoolId": "banter-death-custodian",
  "faceId": "face-custodian",
  "officeId": 3,
  "lines": [
    { "beat": "reveal", "myth": "low",  "text": "..." },
    { "beat": "jump",   "myth": "high", "outcome": "jump", "text": "..." }
  ]
}
```
Rules: one row file per pool; `beat` + `myth` (+ `outcome` for jump) on every line; text obeys the
voice; no duplicate (beat,myth,outcome) keys; keep lines short enough for the HUD.

## Workflow
1. Read the writing skill. Confirm the target IDs exist in the systems pack (or request them).
2. Draft lines beat-by-beat, then run the three Myth tiers per beat.
3. Apply the writing skill's clarity -> tone -> aphorism passes to each line.
4. Emit JSON rows keyed to IDs. Validate: every beat covered, three tiers each, jump has all three
   outcomes, no emojis/em dashes, banner line used at most once per pack.
5. Register the `banterPoolId`(s) back in the systems pack docs so screens/engine can find them.

## Reference map
- `references/voice-checklist.md` - the in-voice gate distilled from the writing skill.
- `references/beat-matrix.md` - the full beat x Myth-tier x outcome grid to fill.
- `fixtures/enemy-face-pack.json` - demo: one enemy Face (The Custodian) full pack.
- `fixtures/boo-g-drift-table.json` - demo: BOO G shop-to-shrine Myth drift lines.
- `fixtures/domain-encounter-pack.json` - demo: one domain-specific encounter pack.
