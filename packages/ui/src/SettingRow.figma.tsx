/**
 * Code Connect mapping: BONES "Setting Row" (node 71:25) <-> @neverdieguy/ui SettingRow.
 *
 * The Figma component has a `Control` variant (Switch | Chevron | Value). The code
 * SettingRow only models the Switch case (title + description + a Switch toggle), so the
 * mapping is restricted to `Control=Switch`. The Chevron and Value controls have no faithful
 * code counterpart yet - tracked in docs/ds/reconciliation.md (likely a ListItemRow-style
 * row or a `control` prop on SettingRow later).
 *
 * Excluded from the package tsc build (see tsconfig.json); parsed by the Code Connect CLI
 * via figma.config.json.
 */
import figma from '@figma/code-connect';
import { SettingRow } from './SettingRow';

figma.connect(
  SettingRow,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=71-25',
  {
    variant: { Control: 'Switch' },
    example: () => (
      <SettingRow
        title="Sound effects"
        description="Play sounds during runs"
        checked={false}
        onChange={() => {}}
      />
    ),
  },
);
