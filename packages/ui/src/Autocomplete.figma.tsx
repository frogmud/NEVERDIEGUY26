/**
 * Code Connect mapping: BONES "Autocomplete" (node 87:21) <-> @neverdieguy/ui Autocomplete.
 * State=Default|Open are runtime states of one component, so a single static example.
 * Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { Autocomplete } from './Autocomplete';

figma.connect(
  Autocomplete,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=87-21',
  {
    example: () => (
      <Autocomplete
        placeholder="Search items"
        options={['Aberrant Bow', 'Skull Charm', 'Crown of Greed']}
      />
    ),
  },
);
