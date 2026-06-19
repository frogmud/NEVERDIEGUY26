/**
 * Code Connect mapping: BONES "Chip" (node 8:22) <-> @neverdieguy/ui Chip.
 * Style -> variant, Color -> color, label text from the design. Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { Chip } from './Chip';

figma.connect(
  Chip,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=8-22',
  {
    props: {
      variant: figma.enum('Style', {
        Solid: 'solid',
        Outline: 'outline',
      }),
      color: figma.enum('Color', {
        Neutral: 'neutral',
        Primary: 'primary',
        Success: 'success',
        Warning: 'warning',
        Error: 'error',
      }),
      label: figma.string('Label'),
    },
    example: ({ variant, color, label }) => (
      <Chip label={label} variant={variant} color={color} />
    ),
  },
);
