/**
 * Code Connect mapping: BONES "Drawer" (node 73:867) <-> @neverdieguy/ui Drawer.
 * The body is a code slot; the BONES default fills it with the Eternal Stream chat.
 * Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { Drawer } from './Drawer';

figma.connect(
  Drawer,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=73-867',
  {
    example: () => (
      <Drawer open title="Eternal Stream" onClose={() => {}}>
        {/* drawer content */}
      </Drawer>
    ),
  },
);
