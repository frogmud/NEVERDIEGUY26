/**
 * Code Connect mapping: BONES "Base Card" (node 9:8) <-> @neverdieguy/ui BaseCard.
 * Surface -> surface; State=Hover -> hover. Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { BaseCard } from './BaseCard';

figma.connect(
  BaseCard,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=9-8',
  {
    props: {
      surface: figma.enum('Surface', {
        Paper: 'paper',
        Elevated: 'elevated',
      }),
      hover: figma.enum('State', {
        Hover: true,
        Default: false,
      }),
    },
    example: ({ surface, hover }) => (
      <BaseCard surface={surface} hover={hover}>
        Card content
      </BaseCard>
    ),
  },
);
