/**
 * Code Connect mapping: BONES "Page Header" (node 71:1165) <-> @neverdieguy/ui PageHeader.
 *
 * Figma variants: Breadcrumb=Show|Hide x Action=None|Button. Mapped to the code props:
 *   - Breadcrumb=Show  -> a sample breadcrumb trail; Hide -> omitted.
 *   - Action=Button    -> a sample action node; None -> omitted.
 * The action is a slot in code (the page supplies its own button), so the Button variant
 * is represented by a placeholder element here.
 *
 * Excluded from the package tsc build (see tsconfig.json); parsed by the Code Connect CLI
 * via figma.config.json. See docs/ds/reconciliation.md.
 */
import figma from '@figma/code-connect';
import { PageHeader } from './PageHeader';

figma.connect(
  PageHeader,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=71-1165',
  {
    props: {
      breadcrumbs: figma.enum('Breadcrumb', {
        Show: [
          { label: 'Wiki', onClick: () => {} },
          { label: 'Items', onClick: () => {} },
          { label: 'Cleaver' },
        ],
        Hide: undefined,
      }),
      action: figma.enum('Action', {
        Button: <button type="button">Button</button>,
        None: undefined,
      }),
    },
    example: ({ breadcrumbs, action }) => (
      <PageHeader title="Cleaver" breadcrumbs={breadcrumbs} action={action} />
    ),
  },
);
