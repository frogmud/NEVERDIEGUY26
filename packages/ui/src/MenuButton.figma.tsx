/**
 * Code Connect mapping: BONES "Menu Button" (node 32:25) <-> @neverdieguy/ui MenuButton.
 * Color -> color; State=Disabled -> disabled. Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { MenuButton } from './MenuButton';

figma.connect(
  MenuButton,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=32-25',
  {
    props: {
      color: figma.enum('Color', {
        Red: 'red',
        Yellow: 'yellow',
        Neutral: 'neutral',
        Blue: 'blue',
      }),
      disabled: figma.enum('State', {
        Disabled: true,
        Default: false,
      }),
    },
    example: ({ color, disabled }) => (
      <MenuButton title="Die" subtitle="+5% corruption" color={color} disabled={disabled} />
    ),
  },
);
