/**
 * Code Connect mapping: BONES "MenuItem" (node 85:15) <-> @neverdieguy/ui MenuItem.
 * State -> selected / disabled. Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { MenuItem } from './Menu';

figma.connect(
  MenuItem,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=85-15',
  {
    props: {
      selected: figma.enum('State', {
        Selected: true,
        Default: false,
        Hover: false,
        Disabled: false,
      }),
      disabled: figma.enum('State', {
        Disabled: true,
        Default: false,
        Hover: false,
        Selected: false,
      }),
    },
    example: ({ selected, disabled }) => (
      <MenuItem label="Menu item" selected={selected} disabled={disabled} />
    ),
  },
);
