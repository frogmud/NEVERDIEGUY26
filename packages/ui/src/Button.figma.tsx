/**
 * Code Connect mapping: BONES "Button" (node 6:10) <-> @neverdieguy/ui Button.
 * Style -> variant, Size -> size, State=Disabled -> disabled. The Start/End icon booleans
 * are left to the code `startIcon`/`endIcon` slots (not mapped). Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { Button } from './Button';

figma.connect(
  Button,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=6-10',
  {
    props: {
      variant: figma.enum('Style', {
        Contained: 'contained',
        Outlined: 'outlined',
        Subtle: 'subtle',
        Text: 'text',
        Destructive: 'destructive',
      }),
      size: figma.enum('Size', {
        Default: 'default',
        Small: 'small',
      }),
      disabled: figma.enum('State', {
        Disabled: true,
        Default: false,
        Hover: false,
      }),
    },
    example: ({ variant, size, disabled }) => (
      <Button variant={variant} size={size} disabled={disabled}>
        Button
      </Button>
    ),
  },
);
