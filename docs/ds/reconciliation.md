# Design system reconciliation ledger

Worklist for converging the BONES Figma design system and the code design system
(`@neverdieguy/tokens` + `@neverdieguy/ui`). Seeded during the Code Connect pass.

## Source of truth

- **Token values:** code wins. Canonical set lives in `packages/tokens/src/index.ts`,
  mirroring `design-system/tokens/*.json` (the brand's declared PRIMARY SOURCE) and the
  live app theme (`apps/web/src/theme.ts`). The live site runs these values.
- **Structure / tightness:** Figma (BONES) is the reference for which tokens are
  load-bearing. The curated package deliberately drops game-only tokens.
- When code and Figma disagree on a value, **correct the Figma variable** to match the
  canonical value (a cheap structural edit in a `use_figma` session). Do not change code
  to match Figma unless a row below is explicitly marked as a deliberate redesign.

## Status: Code Connect entitlement (resolved)

Code Connect requires a Dev/Full seat on a Figma Organization or Enterprise plan. The
workspace was upgraded to Organization (Dev seat) on 2026-06-19, unblocking it.

`DataBadge` (60:16) is mapped and `figma connect parse`-validated; `@figma/code-connect` is
a devDep of `@neverdieguy/ui`. The one remaining step is `figma connect publish` with a
Figma token to push the mapping to Dev Mode - see "Go live" at the bottom.

## Token drift

The "BONES" column is taken from the working-notes token table and **must be confirmed
against the live published variables** (couldn't be read on the current plan). The action
for every drift row is the same: update the Figma variable to the canonical value.

| Token | Canonical (code) | BONES (per notes) | Status |
|-------|------------------|-------------------|--------|
| bg / default | `#0a0a0a` | `#0a0a0a` | match |
| bg / paper | `#1a1a1a` | `#141414` | fix Figma |
| bg / elevated | `#242424` | `#1e1e1e` | fix Figma |
| border | `rgba(255,255,255,0.12)` | `#2a2a2a` | fix Figma |
| text / primary | `#ffffff` | `#f5f5f5` | fix Figma |
| text / secondary | `rgba(255,255,255,0.7)` | `#a0a0a0` | fix Figma |
| text / disabled | `rgba(255,255,255,0.5)` | `#5c5c5c` | fix Figma |
| primary | `#E90441` (red) | `#3b82f6` (blue) | fix Figma - blue is NOT primary, see below |
| success | `#30d158` | `#22c55e` | fix Figma |
| warning | `#ffd60a` | `#ffaa00` | fix Figma |
| error | `#ff453a` | `#ff4444` | fix Figma |
| secondary | `#00e5ff` (cyan) | `#a855f7` (purple) | **decision needed** (see below) |
| rarity / common | `#9e9e9e` | `#9aa3ad` | fix Figma |
| rarity / uncommon | `#4caf50` | `#22c55e` | fix Figma |
| rarity / rare | `#2196f3` (blue) | `#06b6d4` (cyan) | **ramp review** (see below) |
| rarity / epic | `#9c27b0` | `#c850e0` | **ramp review** |
| rarity / legendary | `#ff9800` (orange) | `#f3d24a` (gold) | **ramp review** |

### Decisions

- **`info` accent (the blue).** The blue `#3b82f6` that showed up in BONES is the
  interactive/info accent for surfaces where the saturated red button is too loud (links,
  info states). It is its own token, not a primary rebrand. Added to the canonical set as
  `colors.info` (provisional `#3b82f6`). Open: reconcile `info` (blue) vs the legacy
  `secondary` (cyan `#00e5ff`) vs `status.info` (cyan) - pick one interactive accent.
- **`secondary` cyan vs purple.** Code uses cyan `#00e5ff`; notes show purple `#a855f7`.
  Needs a deliberate call, tied to the `info` decision above.
- **Rarity ramp.** Code ramp (blue rare, orange legendary) vs BONES ramp (cyan rare, gold
  legendary). The BONES ramp may be the intended polished version. Code wins by default,
  but flag for a deliberate ramp review before correcting Figma - this is the one place a
  redesign-toward-Figma might be the right answer.

## Prop-model drift

| Component | Figma (BONES) | Code (before) | Resolution |
|-----------|---------------|---------------|------------|
| DataBadge (60:16) | `Rarity` variant: Common..Legendary | `color`: primary/secondary/... | **Done.** Added optional `rarity` prop to `@neverdieguy/ui` DataBadge; when set it tints from the rarity ramp and overrides `color`. Backward compatible. Code Connect maps `figma.enum('Rarity', ...)` -> `rarity`. |
| StatCard (62:1032) | no variants; value over uppercase label | `value`, `label`, `icon` | **Done.** Static mapping; value/label read via `figma.string`. |
| ListItemRow (62:6) | no variants; name + meta + trailing value | `primary`, `secondary`, `action` | **Done.** Static mapping; `primary`/`secondary` via `figma.string`, trailing value as `action`. |
| SettingRow (71:25) | `Control`: Switch / Chevron / Value | `title`, `description`, `checked`, Switch | **Partial.** Mapped only `Control=Switch` (matches code). Chevron + Value controls have no code home yet - see below. |
| Page Header (71:1165) | `Breadcrumb=Show\|Hide` x `Action=None\|Button`; breadcrumb + page title + Button | none previously | **Done.** Built `PageHeader` in `@neverdieguy/ui` (breadcrumb trail + bold title + `action` slot). Code Connect maps `figma.enum('Breadcrumb', ...)` -> `breadcrumbs` and `figma.enum('Action', ...)` -> `action`. The Figma display name keeps the space ("Page Header", intentional); the code identifier is `PageHeader` - the mapping binds by node id, so the names need not match. |

### Core interactive components (built + mapped)

New `@neverdieguy/ui` components, each a thin MUI wrapper styled from canonical tokens,
mapped to its BONES node:

| Component | BONES node | Variant -> prop mapping |
|-----------|------------|-------------------------|
| Button | 6:10 | `Style` -> `variant` (Contained/Outlined/Subtle/Text/Destructive); `Size` -> `size`; `State=Disabled` -> `disabled`. Start/End icon booleans left to code `startIcon`/`endIcon` slots. |
| Switch | 22:7 | `State=On` -> `checked`; `Size` -> `size`. Red when on (brand primary), not green. |
| Checkbox | 83:12 | `State` -> `checked` / `indeterminate` / `disabled`. Checked = primary red. |
| IconButton | 84:1409 | `State=Disabled` -> `disabled`; icon is a code child. |
| Link | 102:1373 | interaction-state variants -> one static example; uses the `info` accent. |
| Tab | 60:857 | `State` -> `active` / `disabled`. Single tab item; compose a row for a bar. |
| Textarea | 86:16 | `State=Error` -> `error`; multi-line field. |
| Select | 84:42 | `State` -> `error` / `disabled`; options are a code concern. |
| LinearProgress | 60:813 | `Color` -> `color` (Primary/Success/Warning/Error). |

### Open prop-model gaps
- **SettingRow Chevron / Value controls.** BONES models a settings row that ends in a chevron
  (navigates) or a static value (e.g. "High"), neither of which the code `SettingRow` supports.
  Options: add a `control?: 'switch' | 'chevron' | 'value'` prop (+ `value`/`onClick`), or route
  those cases through `ListItemRow`. Decide before mapping the other two variants.
- **PageHeader action slot.** The BONES `Action=Button` variant renders the BONES Button; code
  `PageHeader` takes `action` as a `ReactNode` slot so the page owns its button. When a code
  `Button` component lands, the mapping's placeholder action can point at it.

The draft mapping lives in `packages/ui/src/DataBadge.figma.tsx` (Figma property names are
per the documented spec, to be confirmed against the live component post-upgrade).

## Go live

- [x] Upgrade to Organization + Dev seat (2026-06-19).
- [x] `@figma/code-connect` added as a devDep of `@neverdieguy/ui`.
- [x] Confirmed live props via `get_context_for_code_connect`: node 60:16 has one `Rarity`
      variant (Common..Legendary); the label is the rarity word, mapped from the same variant.
- [x] `DataBadge.figma.tsx` authored and `figma connect parse`-validated (source resolves to
      the private-repo blob URL).
- [ ] **Publish:** from `packages/ui`, run
      `FIGMA_ACCESS_TOKEN=<token> npx figma connect publish`
      (token scopes: Code Connect write + File content read). Confirm the snippet renders in
      BONES Dev Mode for node 60:16.
- [ ] Correct the Figma variables per the token-drift table.
- [ ] Map the remaining components (see below).

## Next components to map (after DataBadge proves the pipeline)

The other extracted components, mapped to their BONES nodes:
StatCard (`62:1032`), ListItemRow (`62:6`), SettingRow (`71:25`), CardHeader / PageHeader
(`71:1165`), plus the raw-MUI components that still need a code home before they can be
mapped (Button, Chip, Input, Tabs, Checkbox, Select).
