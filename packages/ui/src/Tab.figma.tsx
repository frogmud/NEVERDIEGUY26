/**
 * Code Connect mapping: BONES "Tabs" (node 60:857) <-> @neverdieguy/ui Tab (a single tab).
 * The Figma `State` variant maps to the `active` / `disabled` booleans. Compose a row of
 * Tabs in code. Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { Tab } from './Tab';

figma.connect(
  Tab,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=60-857',
  {
    props: {
      active: figma.enum('State', {
        Active: true,
        Inactive: false,
        Hover: false,
        Disabled: false,
      }),
      disabled: figma.enum('State', {
        Disabled: true,
        Active: false,
        Inactive: false,
        Hover: false,
      }),
    },
    example: ({ active, disabled }) => (
      <Tab label="Items" active={active} disabled={disabled} />
    ),
  },
);
