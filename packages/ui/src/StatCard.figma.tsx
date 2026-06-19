/**
 * Code Connect mapping: BONES "Stat Card" (node 62:1032) <-> @neverdieguy/ui StatCard.
 *
 * The Figma component has no variants - just a value over an uppercase label. Mapped as a
 * static example using the BONES sample content (value 142 / label RUNS).
 *
 * Excluded from the package tsc build (see tsconfig.json); parsed by the Code Connect CLI
 * via figma.config.json. See docs/ds/reconciliation.md.
 */
import figma from '@figma/code-connect';
import { StatCard } from './StatCard';

figma.connect(
  StatCard,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=62-1032',
  {
    props: {
      value: figma.string('142'),
      label: figma.string('RUNS'),
    },
    example: ({ value, label }) => <StatCard value={value} label={label} />,
  },
);
