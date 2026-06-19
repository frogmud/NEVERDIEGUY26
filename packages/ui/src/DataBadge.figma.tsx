/**
 * Code Connect mapping: BONES "Data Badge" (node 60:16) <-> @neverdieguy/ui DataBadge.
 *
 * The Figma component has a single `Rarity` variant (Common..Legendary) and renders
 * the rarity word as its label (a per-variant text layer, not a separate property).
 * So both the code `rarity` prop and the `label` text are mapped from that one variant.
 *
 * This file is excluded from the package tsc build (see tsconfig.json) - it is a Code
 * Connect template, not shipped runtime code. The Code Connect CLI parses it via
 * figma.config.json. Publish with `npx figma connect publish` (or the Figma MCP).
 *
 * See docs/ds/reconciliation.md for the prop-model reconciliation rationale.
 */
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
      // The badge label is the rarity word itself, derived from the same variant.
      label: figma.enum('Rarity', {
        Common: 'Common',
        Uncommon: 'Uncommon',
        Rare: 'Rare',
        Epic: 'Epic',
        Legendary: 'Legendary',
      }),
    },
    example: ({ rarity, label }) => (
      <DataBadge rarity={rarity} label={label} variant="outlined" />
    ),
  },
);
