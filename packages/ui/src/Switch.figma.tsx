/**
 * Code Connect mapping: BONES "Switch" (node 22:7) <-> @neverdieguy/ui Switch.
 * State=On|Off -> checked; Size=Default|Small -> size. NDG switches are red when on.
 * Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { Switch } from './Switch';

figma.connect(
  Switch,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=22-7',
  {
    props: {
      checked: figma.enum('State', {
        On: true,
        Off: false,
      }),
      size: figma.enum('Size', {
        Default: 'default',
        Small: 'small',
      }),
    },
    example: ({ checked, size }) => <Switch checked={checked} size={size} />,
  },
);
