/**
 * Code Connect mapping: BONES "Link" (node 102:1373) <-> @neverdieguy/ui Link.
 * The Figma `State` variants are interaction states of one component, so the mapping is a
 * single static example; the label text is read from the design. Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { Link } from './Link';

figma.connect(
  Link,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=102-1373',
  {
    example: () => <Link href="#">Read the design system guide</Link>,
  },
);
