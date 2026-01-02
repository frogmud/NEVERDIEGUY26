/**
 * History Factoids
 *
 * Random stats displayed in the TopBar
 */

import type { Factoid } from './types';

export const HISTORY_FACTOIDS: Factoid[] = [
  { value: '11 hours', subtitle: 'Time spent waiting for\nyour opponent' },
  { value: '47 kills', subtitle: 'Most kills in a\nsingle game' },
  { value: '12 games', subtitle: 'Longest active\nwin streak' },
  { value: '3,421', subtitle: 'Total items\ncollected' },
  { value: '89%', subtitle: 'Arena survival\nrate this month' },
  { value: 'Earth', subtitle: 'Most played\ndomain', domainSlug: 'earth' },
];
