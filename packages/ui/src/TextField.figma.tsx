/**
 * Code Connect mapping: BONES "Text Field" (node 10:17) <-> @neverdieguy/ui TextField.
 * State=Error -> error; label / placeholder / helper text read from the design.
 * Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { TextField } from './TextField';

figma.connect(
  TextField,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=10-17',
  {
    props: {
      error: figma.enum('State', {
        Error: true,
        Default: false,
        Focus: false,
      }),
    },
    example: ({ error }) => (
      <TextField label="Label" placeholder="Enter value…" error={error} />
    ),
  },
);
