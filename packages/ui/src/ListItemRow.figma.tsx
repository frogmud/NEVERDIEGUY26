/**
 * Code Connect mapping: BONES "List Item Row" (node 62:6) <-> @neverdieguy/ui ListItemRow.
 *
 * No variants - a name + meta line + trailing value. Mapped as a static example using the
 * BONES sample content (Aberrant Bow / Weapon - Rare / 120 trailing value).
 *
 * Excluded from the package tsc build (see tsconfig.json); parsed by the Code Connect CLI
 * via figma.config.json. See docs/ds/reconciliation.md.
 */
import figma from '@figma/code-connect';
import { ListItemRow } from './ListItemRow';

figma.connect(
  ListItemRow,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=62-6',
  {
    example: () => (
      <ListItemRow primary="Aberrant Bow" secondary="Weapon · Rare" action={<span>120</span>} />
    ),
  },
);
