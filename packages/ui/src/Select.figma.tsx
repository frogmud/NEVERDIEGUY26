/**
 * Code Connect mapping: BONES "Select" (node 84:42) <-> @neverdieguy/ui Select.
 * State maps to error/disabled; options are a code concern (sample provided).
 * Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { Select } from './Select';

figma.connect(
  Select,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=84-42',
  {
    props: {
      error: figma.enum('State', {
        Error: true,
        Default: false,
        Focus: false,
        Disabled: false,
      }),
      disabled: figma.enum('State', {
        Disabled: true,
        Default: false,
        Focus: false,
        Error: false,
      }),
      placeholder: figma.string('Select rarity'),
    },
    example: ({ error, disabled, placeholder }) => (
      <Select
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        options={[
          { label: 'Common', value: 'common' },
          { label: 'Rare', value: 'rare' },
          { label: 'Legendary', value: 'legendary' },
        ]}
      />
    ),
  },
);
