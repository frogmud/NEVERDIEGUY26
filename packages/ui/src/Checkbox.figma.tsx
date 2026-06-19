/**
 * Code Connect mapping: BONES "Checkbox" (node 83:12) <-> @neverdieguy/ui Checkbox.
 * Figma `State` variant maps to the MUI-style boolean props (checked / indeterminate /
 * disabled). Excluded from the tsc build; parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { Checkbox } from './Checkbox';

figma.connect(
  Checkbox,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=83-12',
  {
    props: {
      checked: figma.enum('State', {
        Checked: true,
        Unchecked: false,
        Indeterminate: false,
        Disabled: false,
      }),
      indeterminate: figma.enum('State', {
        Indeterminate: true,
        Checked: false,
        Unchecked: false,
        Disabled: false,
      }),
      disabled: figma.enum('State', {
        Disabled: true,
        Checked: false,
        Unchecked: false,
        Indeterminate: false,
      }),
    },
    example: ({ checked, indeterminate, disabled }) => (
      <Checkbox checked={checked} indeterminate={indeterminate} disabled={disabled} />
    ),
  },
);
