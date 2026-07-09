# Sources of truth for the NDG canon loop

Paths are relative to the NEVERDIEGUY26 repo root. The parent workspace
(`/Users/kevin/Projects`) holds the comic and docs trees.

## 1. Comic canon / Field Guide - character and world LAW

`../comic/field-guide/` - read before writing or judging any NPC dialogue or lore.

| File | What it locks |
|------|---------------|
| `01-premise.md` | North star: unnamed engineered patriot, HERO CORPS, ownership vs choice, resurrection as debt |
| `02-canon-locks.md` | Non-negotiables: NDG has no verified name; soul stays unresolved; The General is never redeemed; Boots never talks (mrow only); Body Count is not a buddy; The One is not an answer machine |
| `03-cast.md` | Cover-anchored character entries: look, role, voice, do/don't. Includes the King James proxy-dice rule |
| `05-world.md` / `06-story.md` | Realms (Heaven, Hell, Sun, Moon, Elsewhere, Earth) and story shape |
| `09-reconciliation-log.md` | THE ledger for canon calls. Every sim-vs-canon contradiction gets a numbered, dated row here once the user rules on it |

Comic canon runs AHEAD of game code (per project memory): Heaven/Hell realms,
female Clausen, The One = the empty Board head chair. When game code and comic
canon disagree, the comic canon is the direction of travel.

### Cover rank = character importance (locked 2026-07-08)

The cover numbers in `03-cast.md` rank the characters: NDG 01 (the player),
Keith Man 02, The General 03, Stitch-Up Girl 04, Mr. Kevin 05 (the core four +
handler), then key players 06-11 (Boo G, Clausen, Rhea, Vicario, King James,
Body Count), enigmas/board 12-19, wanderers 20-25. **Dialogue value follows
cover order**: the sim weights speaker/target selection by rank (core four 3x,
key players 2x, rest 1x - `COVER_RANK` in `npc-eternal-days.ts`), the extractor
adds a rank bonus to interestScore (`COVER_RANK` in `extract-chatbase.ts` -
extract slugs differ, e.g. `willy`), and `measure.sh` warns when a core-four
character falls below the median entry count. Keep the three maps in sync if
covers are ever renumbered.

## 2. Writing style - style LAW

`../docs/skills/NDG_CONSOLIDATED_WRITING_SKILL.md`

Rules already baked into the sim prompt (STYLE block) and enforced mechanically:
- No em/en dashes anywhere (plain hyphen if needed)
- One punchline max per line; avoid the "that's not X, that's Y" wallpaper shape
- Keep the noun, keep the verb, cut the smoke; no trailer voice or cosmic filler
- Doom-poetic palette words (bone, grave, debt, witness, record, custody...) are
  placed, not sprinkled

## 3. Sim NPC definitions - the character MODEL

`packages/ai-engine/scripts/npc-eternal-days.ts` -> `ALL_NPCS`

Each def: personality, voice, visualTells, quirks, catchphrases, obsessions,
rivals/allies, luckyDie (realm affinity). The defs are the model; the chatbase is
samples drawn from them. "Carving a personality" = editing the def, then simming
a new leg to see it live. Keep defs in sync with Field Guide cast entries when a
reconciliation lands.

(`src/npcs/definitions.ts` + `api/_lib/npc-personas.ts` are the engine/app-side
persona sets - update them too when a canon change is player-facing.)

## 4. Run logs - world HISTORY

`packages/ai-engine/logs/eternal-<timestamp>/`
- `days/day-NNNN.md` - per-day record (written incrementally, crash-safe)
- `blog.md` - the readable serial, chaptered by pantheon week
- `final-state.json` - resume checkpoint (gold, records, debts, moods, profile)
- `extracted-templates.json` - the leg's template harvest

Gitignored: this machine holds the only copy. The chatbase is rebuilt from ALL
of these on every `sim:extract`, so the logs ARE the canon record. Back them up.

## 5. Chatbase - DERIVED output

`packages/ai-engine/chatbase/` (manifest.json, npcs/*.json, indexes/)

Never hand-edit. To remove lines: delete/fix the source run dir and re-extract.
To add lines: sim more. Consumed by `api/_lib/lookup.ts` in prod (lookup-only;
no free chat).
