/**
 * Game History Mock Data
 *
 * Sample game history entries for Game History table
 * MVP: All matches are against NPCs (Arena mode)
 */

import type { GameHistoryEntry } from './types';

export const MOCK_HISTORY: GameHistoryEntry[] = [
  { players: ['Boo G', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Aberrant', result: [0, 1], moves: 33, when: '2 hours ago', wikiLinks: [{ category: 'wanderers', slug: 'boo-g' }, null], reviewed: false },
  { players: ['You', 'John'], userIds: [null, null], mode: 'Arena', domain: 'Earth', result: [1, 0], moves: 27, when: '5 hours ago', wikiLinks: [null, { category: 'pantheon', slug: 'john' }], reviewed: false },
  { players: ['You', 'Alice'], userIds: [null, null], mode: 'Arena', domain: 'Frost Reach', result: [1, 0], moves: 19, when: '1 day ago', wikiLinks: [null, { category: 'pantheon', slug: 'alice' }], reviewed: false },
  { players: ['Mr. Bones', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Frost Reach', result: [0, 1], moves: 45, when: '1 day ago', wikiLinks: [{ category: 'wanderers', slug: 'mr-bones' }, null], reviewed: true },
  { players: ['Robert', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Infernus', result: [1, 0], moves: 38, when: '2 days ago', wikiLinks: [{ category: 'pantheon', slug: 'robert' }, null], reviewed: false },
  { players: ['You', 'Peter'], userIds: [null, null], mode: 'Arena', domain: 'Shadow Keep', result: [1, 0], moves: 41, when: '3 days ago', wikiLinks: [null, { category: 'pantheon', slug: 'peter' }], reviewed: true },
  { players: ['You', 'The General'], userIds: [null, null], mode: 'Arena', domain: 'Shadow Keep', result: [1, 0], moves: 22, when: '4 days ago', wikiLinks: [null, { category: 'wanderers', slug: 'the-general' }], reviewed: false },
  { players: ['Jane', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Aberrant', result: [1, 0], moves: 55, when: '5 days ago', wikiLinks: [{ category: 'pantheon', slug: 'jane' }, null], reviewed: true },
  { players: ['Willy One Eye', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Null Providence', result: [0, 1], moves: 28, when: '6 days ago', wikiLinks: [{ category: 'wanderers', slug: 'willy' }, null], reviewed: true },
  { players: ['You', 'The One'], userIds: [null, null], mode: 'Arena', domain: 'Null Providence', result: [1, 0], moves: 38, when: 'Dec 20', wikiLinks: [null, { category: 'pantheon', slug: 'the-one' }], reviewed: false },
  { players: ['Dr. Maxwell', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Infernus', result: [1, 0], moves: 60, when: 'Dec 19', wikiLinks: [{ category: 'wanderers', slug: 'dr-maxwell' }, null], reviewed: true },
  { players: ['You', 'X-treme'], userIds: [null, null], mode: 'Arena', domain: 'Earth', result: [1, 0], moves: 25, when: 'Dec 18', wikiLinks: [null, { category: 'wanderers', slug: 'xtreme' }], reviewed: true },
  { players: ['Dr. Voss', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Null Providence', result: [1, 0], moves: 52, when: 'Dec 17', wikiLinks: [{ category: 'wanderers', slug: 'dr-voss' }, null], reviewed: false },
  { players: ['Rhea', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Null Providence', result: [1, 0], moves: 47, when: 'Dec 16', wikiLinks: [{ category: 'pantheon', slug: 'rhea' }, null], reviewed: true },
  { players: ['You', 'Zero Chance'], userIds: [null, null], mode: 'Arena', domain: 'Null Providence', result: [1, 0], moves: 18, when: 'Dec 15', wikiLinks: [null, { category: 'pantheon', slug: 'zero-chance' }], reviewed: true },
  { players: ['King James', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Null Providence', result: [1, 0], moves: 52, when: 'Dec 14', wikiLinks: [{ category: 'wanderers', slug: 'king-james' }, null], reviewed: false },
  { players: ['You', 'Boo G'], userIds: [null, null], mode: 'Arena', domain: 'Aberrant', result: [1, 0], moves: 30, when: 'Dec 13', wikiLinks: [null, { category: 'wanderers', slug: 'boo-g' }], reviewed: true },
  { players: ['John', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Earth', result: [1, 0], moves: 44, when: 'Dec 12', wikiLinks: [{ category: 'pantheon', slug: 'john' }, null], reviewed: true },
  { players: ['You', 'Alice'], userIds: [null, null], mode: 'Arena', domain: 'Frost Reach', result: [1, 0], moves: 20, when: 'Dec 11', wikiLinks: [null, { category: 'pantheon', slug: 'alice' }], reviewed: true },
  { players: ['Mr. Bones', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Frost Reach', result: [1, 0], moves: 65, when: 'Dec 10', wikiLinks: [{ category: 'wanderers', slug: 'mr-bones' }, null], reviewed: false },
  { players: ['You', 'Robert'], userIds: [null, null], mode: 'Arena', domain: 'Infernus', result: [0, 1], moves: 40, when: 'Dec 09', wikiLinks: [null, { category: 'pantheon', slug: 'robert' }], reviewed: true },
  { players: ['Peter', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Shadow Keep', result: [1, 0], moves: 70, when: 'Dec 08', wikiLinks: [{ category: 'pantheon', slug: 'peter' }, null], reviewed: true },
  { players: ['The General', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Shadow Keep', result: [0, 1], moves: 31, when: 'Dec 07', wikiLinks: [{ category: 'wanderers', slug: 'the-general' }, null], reviewed: false },
  { players: ['Jane', 'You'], userIds: [null, null], mode: 'Arena', domain: 'Aberrant', result: [1, 0], moves: 42, when: 'Dec 06', wikiLinks: [{ category: 'pantheon', slug: 'jane' }, null], reviewed: true },
  { players: ['You', 'Willy One Eye'], userIds: [null, null], mode: 'Arena', domain: 'Earth', result: [1, 0], moves: 36, when: 'Dec 05', wikiLinks: [null, { category: 'wanderers', slug: 'willy' }], reviewed: true },
];
