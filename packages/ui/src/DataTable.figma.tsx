/**
 * Code Connect mapping: BONES "DataTable" (node 89:225) <-> @neverdieguy/ui DataTable.
 * State=Loading -> loading; State=Empty -> empty rows. Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { DataTable } from './DataTable';

figma.connect(
  DataTable,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=89-225',
  {
    props: {
      loading: figma.enum('State', {
        Loading: true,
        Default: false,
        Empty: false,
      }),
    },
    example: ({ loading }) => (
      <DataTable
        loading={loading}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'rarity', label: 'Rarity' },
          { key: 'type', label: 'Type' },
          { key: 'value', label: 'Value', align: 'right' },
        ]}
        rows={[
          { name: 'Aberrant Bow', rarity: 'Rare', type: 'Weapon', value: 120 },
          { name: 'Crown of Greed', rarity: 'Legendary', type: 'Relic', value: 999 },
        ]}
      />
    ),
  },
);
