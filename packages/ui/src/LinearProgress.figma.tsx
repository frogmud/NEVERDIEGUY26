/**
 * Code Connect mapping: BONES "LinearProgress" (node 60:813) <-> @neverdieguy/ui LinearProgress.
 * Color variant -> color prop. Parsed by the Code Connect CLI.
 */
import figma from '@figma/code-connect';
import { LinearProgress } from './LinearProgress';

figma.connect(
  LinearProgress,
  'https://www.figma.com/design/IfJ0MKBk5pGKNDnPp0d5sv?node-id=60-813',
  {
    props: {
      color: figma.enum('Color', {
        Primary: 'primary',
        Success: 'success',
        Warning: 'warning',
        Error: 'error',
      }),
    },
    example: ({ color }) => <LinearProgress value={60} color={color} />,
  },
);
