/**
 * Code Connect mapping: BONES `DataBadge` (node 60:16) <-> @neverdieguy/ui DataBadge.
 *
 * STATUS: ready to publish, NOT YET ACTIVE.
 * Code Connect requires a Dev/Full seat on a Figma Organization/Enterprise plan.
 * The current plan (kev.studio Pro) cannot publish or read Code Connect context,
 * so this file is intentionally excluded from the tsc build (see tsconfig.json
 * `exclude`) and @figma/code-connect is not yet a dependency.
 *
 * Before going live (post-upgrade), confirm the exact Figma property names below
 * via get_context_for_code_connect on node 60:16 - the "Rarity" variant name and
 * the "Label" text source are taken from the documented BONES spec, not yet
 * verified against the live component. Then:
 *   1. pnpm --filter @neverdieguy/ui add -D @figma/code-connect   (pin >24h old)
 *   2. npx figma connect publish --token <FIGMA_TOKEN>
 *
 * See docs/ds/reconciliation.md for the prop-model reconciliation rationale.
 */
// @ts-nocheck - @figma/code-connect is installed post-upgrade; see header.
import figma from '@figma/code-connect';
import { DataBadge } from './DataBadge';

figma.connect(
  DataBadge,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=60-16',
  {
    props: {
      // Figma "Rarity" variant -> code `rarity` prop (added during reconciliation).
      rarity: figma.enum('Rarity', {
        Common: 'common',
        Uncommon: 'uncommon',
        Rare: 'rare',
        Epic: 'epic',
        Legendary: 'legendary',
      }),
      // Badge text. Confirm whether this is a component text property or a named
      // text layer (figma.textContent) once the live component is readable.
      label: figma.string('Label'),
    },
    example: ({ rarity, label }) => (
      <DataBadge rarity={rarity} label={label} variant="outlined" />
    ),
  },
);
