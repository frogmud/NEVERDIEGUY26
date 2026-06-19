---
name: ndg-repo-diet-auditor
description: Audit the NDG app for bloated, forgotten, duplicated, or circular systems and produce a ranked cleanup plan WITHOUT casually deleting useful work. Use when the tree feels heavy, before a refactor, or when asked to "clean up" / find dead code. Outputs a quarantine/fold/replace/delete decision table with risk levels - it plans cleanup, it does not perform destructive deletes by default.
---

# NDG Repo Diet Auditor

The underlying systems are mostly fine; the problem is bloated and forgotten work layered on top.
Your job is to **find it and classify it**, never to delete it on sight. Default output is a plan,
not a diff. Deletion only happens when explicitly authorized and only on items classified DELETE
with a verified zero-reference check.

Anchor doc: `docs/current/08-app-systems-alignment-plan.md` (P1 Repo Diet section). Honor its
guardrails: do not delete old routes until a replacement works and a route audit is done; keep
deprecated item effects until Favor has equivalent live behavior; keep Cee-lo as a named minigame.

## When to use
- "Clean up", "what's dead", "this file is huge", pre-refactor scoping, duplicate-ownership hunts.
NOT for: implementing loop features (`ndg-play-loop-implementer`) or authoring content
(`ndg-systems-pack-builder`).

## The decision table (classify every finding)
| Class | Meaning | Action | When |
|-------|---------|--------|------|
| QUARANTINE | Live-looking but disagrees with the authority | Mark dead, stop expanding, add a comment pointing at the authority | Stale `RunContext` combat reducer actions vs `CombatEngine` |
| FOLD | Useful logic in the wrong/oversized home | Extract into hooks/modules behind the authority | `CombatTerminal` web-only add-ons -> `CombatSession` adapter |
| REPLACE | Superseded by a newer system, still wired | Swap call sites to the new system, then retire the old | old duel/wanderer path -> seeded encounter generator |
| DELETE | Zero references, no replacement risk | Remove only with explicit OK + verified zero refs | truly unreferenced files/exports |
| KEEP | Load-bearing, fine as-is | Leave it | seeded RNG, balance config |

Bias order: **QUARANTINE > FOLD > REPLACE > DELETE.** Prefer the least destructive class that
resolves the problem.

## Workflow
1. **Scan** - run `references/scan-commands.md` (large files, stale routes/components, duplicate
   ownership, import cycles, unreferenced exports). Record raw findings with line counts + ref counts.
2. **Classify** - put every finding in the decision table with a one-line justification and a risk
   level (see below). A finding with no replacement and any inbound reference is never DELETE.
3. **Rank** - order by (value of fixing) / (risk). Surface low-risk/high-value first.
4. **Plan** - emit a ranked cleanup plan (shape in `fixtures/sample-cleanup-plan.md`). Each item:
   class, files, risk, what proves it safe, and the exact follow-up step.
5. **Stop.** Do not delete unless explicitly authorized. If authorized, do DELETE items only, one
   branch, re-verify zero refs immediately before removal, then `tsc --noEmit` + web build.

## Risk levels
- **LOW** - unreferenced file/export; comment-only quarantine; pure additive extraction.
- **MED** - call-site swaps (REPLACE), splitting a large file (FOLD) where behavior must be preserved.
- **HIGH** - anything touching combat scoring, persistence/save shape, or a live route. Needs the
  loop-implementer invariants and a playtest, not just a typecheck.

## Guardrails (do not break)
- Never delete a route/screen that is still reachable, even if it looks legacy.
- Never collapse a duplicate by deleting the *authority*; retire the *duplicate*.
- A green typecheck/build does not prove a page runs (chunk-TDZ) - HIGH-risk items need a preview run.
- Preserve user/generated work; do not clean unrelated files in the same pass.

## Reference map
- `references/scan-commands.md` - the exact read-only commands to gather findings.
- `references/decision-table.md` - expanded class definitions + worked classifications.
- `fixtures/sample-cleanup-plan.md` - a real ranked plan over CombatTerminal/RunContext/duel/meteor.
