# NEVER DIE GUY - app next steps

Picking up after the homepage UX + perf cycle. Status as of 2026-06-24:

- PR #83 (homepage boot UX, Eternal Stream perf + Drawer) is **merged and live on prod**, verified.
- Dependabot CI bumps #80 / #81 / #82 also merged. **0 open PRs.**
- Full background in the `ndg-homepage-perf` memory and `CLAUDE.md`.

---

## 1. Git hygiene (quick, do first)

- [ ] **Sync local `main`** - it is `behind 3` (the merged dependabot CI commits):
  ```bash
  git checkout main && git pull --ff-only
  ```
- [ ] **Prune confirmed-merged local branches** (fully in `origin/main`, safe `-d`):
  ```bash
  git branch -d chore/supply-chain-cooldown docs/readme-trim feat/concept-visual-pass \
                feat/ds-extract-tokens-ui fix/build-react-dedupe fix/chat-security-hardening
  ```
- [ ] **Force-delete the squash-merged branch** (`git cherry` can't see it, but the work shipped in #83):
  ```bash
  git branch -D fix/eternal-stream-drawer
  ```
- [ ] **Decide, then prune** (these still show "unmerged" - confirm each is superseded first):
  - `feat/code-connect-batch-2`, `feat/code-connect-batch-3`, `feat/code-connect-poc` - the Code
    Connect POC, which was **decided against** (needs Figma Org/Enterprise ~$300/yr; see the
    `figma-code-connect-pricing` memory). Likely safe to delete unless kept as reference.
  - `chore/dependabot-cleanup`, `fix/chunk-init-order` - check `git log origin/main` for an
    equivalent squash-merge before deleting.

## 2. Commit the dangling work (don't lose it)

Real uncommitted work is sitting in the tree:

- [ ] `CLAUDE.md` - +31 lines of legit doc additions ("Run end + failure" / GameOverModal, and a
  "Sprite Vectorization" section). Not committed.
- [ ] `.claude/skills/ndg-sprite-vectorizer/` - untracked skill (the PNG -> SVG pipeline).
- [ ] `design-system/brand/fonts/Gikit-Text.otf` + `Gikit-Title.otf` - untracked fonts.

These belong together (the CLAUDE.md "Sprite Vectorization" note documents the skill). Suggested one
commit: `chore: add sprite-vectorizer skill + Gikit fonts + CLAUDE.md docs`. Decide first whether the
`.otf` fonts should be tracked in git (size / licensing) or gitignored.

## 3. Phase 4 - design-system leverage on the homepage (the real follow-up)

`HomeDashboard.tsx` is **100% raw MUI - zero `@neverdieguy/ui` imports** - even though the DS exists
and CLAUDE.md says to dogfood it. This is the biggest remaining win from the original review.

- [ ] **Quick win first:** fix the stale top comment (`HomeDashboard.tsx:7`) - it still says
  "Right column (340px): Eternal Stream", but the stream is now a Drawer triggered by a button.
- [ ] Swap raw building blocks for DS equivalents, one type at a time, typechecking between each:
  - `<Dialog>` (7 in the file) -> DS `DialogHeader` for the chrome
  - `<Button>` / clickable `<Box>` -> DS `Button`
  - `<IconButton>` -> DS `IconButton`
  - `<Chip>` / inline badges -> DS `Chip` / `DataBadge`
- [ ] Validate cheaply per-package (avoid the pnpm install gate):
  ```bash
  cd apps/web && npx tsc --noEmit && npx vite build
  ```
- [ ] Ship as its own PR, separate from the UX change, for a clean diff. Click through the Vercel
  preview before prod - see the `ndg-prod-deploy-ops` memory (Vercel marks "Ready" even on a
  white-screen).

## 4. Optional - repo diet audit

- [ ] Read-only `ndg-repo-diet-auditor` pass for dead code / unused deps now that `HomeChatter.tsx`
  is gone, to catch other orphans before they accumulate.

---

### Guardrails (carry over)
- Do **not** run `pnpm` / `npm install` without asking - supply-chain cooldown (`minimumReleaseAge`)
  hard-fails packages <1 day old. Use per-package `tsc` / `vite` to validate.
- No emojis, no em dashes, sentence case.
- Commit / push only when asked; squash-merge with a `(#n)` subject; commits end with the
  `Co-Authored-By: Claude Opus 4.8` trailer.
