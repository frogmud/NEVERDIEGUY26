/**
 * Code Connect mapping: BONES "IconButton" (node 84:1409) <-> @neverdieguy/ui IconButton.
 * The Figma `State` variant drives the `disabled` prop; the icon is a code child (the BONES
 * sample uses a menu icon). Excluded from the tsc build; parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import MenuIcon from '@mui/icons-material/Menu';
import { IconButton } from './IconButton';

figma.connect(
  IconButton,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=84-1409',
  {
    props: {
      disabled: figma.enum('State', {
        Disabled: true,
        Default: false,
        Hover: false,
      }),
    },
    example: ({ disabled }) => (
      <IconButton aria-label="menu" disabled={disabled}>
        <MenuIcon />
      </IconButton>
    ),
  },
);
