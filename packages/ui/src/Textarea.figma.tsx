/**
 * Code Connect mapping: BONES "Textarea" (node 86:16) <-> @neverdieguy/ui Textarea.
 * State=Error -> error; placeholder text read from the design. Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { Textarea } from './Textarea';

figma.connect(
  Textarea,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=86-16',
  {
    props: {
      error: figma.enum('State', {
        Error: true,
        Default: false,
        Focus: false,
      }),
      placeholder: figma.string('Describe the item...'),
    },
    example: ({ error, placeholder }) => (
      <Textarea placeholder={placeholder} error={error} />
    ),
  },
);
