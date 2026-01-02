/**
 * Game History Mock Data
 *
 * Sample game history entries for Game History table
 */

import type { GameHistoryEntry } from './types';

export const MOCK_HISTORY: GameHistoryEntry[] = [
  { players: ['DeathWalker99 (1850)', 'You (1500)'], userIds: [101, null], mode: '1v1', domain: 'Earth', result: [1, 0], moves: 33, when: '2 hours ago', wikiLinks: [null, null], reviewed: false },
  { players: ['You (1500)', 'SoulReaper (1200)'], userIds: [null, 102], mode: 'Arena', domain: 'Infernus', result: [1, 0], moves: 27, when: '5 hours ago', wikiLinks: [null, null], reviewed: false },
  { players: ['You (1500)', 'VoidMaster (950)'], userIds: [null, 103], mode: '1v1', domain: 'Shadow Keep', result: [1, 0], moves: 19, when: '1 day ago', wikiLinks: [null, null], reviewed: false },
  { players: ['John', 'You (1500)'], userIds: [null, null], mode: 'vsBots', domain: 'Earth', result: [0, 1], moves: 45, when: '1 day ago', wikiLinks: [{ category: 'pantheon', slug: 'john' }, null], reviewed: true },
  { players: ['CrimsonBlade (1650)', 'You (1500)'], userIds: [104, null], mode: '1v1', domain: 'Frost Reach', result: [1, 0], moves: 38, when: '2 days ago', wikiLinks: [null, null], reviewed: false },
  { players: ['You (1500)', 'PhantomRider (1500)'], userIds: [null, 105], mode: '1v1', domain: 'Earth', result: [1, 0], moves: 41, when: '3 days ago', wikiLinks: [null, null], reviewed: true },
  { players: ['You (1500)', 'NeverDie_Legend (1100)'], userIds: [null, 106], mode: '1v1', domain: 'Null Providence', result: [1, 0], moves: 22, when: '4 days ago', wikiLinks: [null, null], reviewed: false },
  { players: ['xX_Destroyer_Xx (1800)', 'You (1500)'], userIds: [107, null], mode: 'Arena', domain: 'Null Providence', result: [1, 0], moves: 55, when: '5 days ago', wikiLinks: [null, null], reviewed: true },
  { players: ['Mr. Bones', 'You (1500)'], userIds: [null, null], mode: 'vsBots', domain: 'Frost Reach', result: [0, 1], moves: 28, when: '6 days ago', wikiLinks: [{ category: 'wanderers', slug: 'mr-bones' }, null], reviewed: true },
  { players: ['You (1500)', 'DarkMatter42 (1400)'], userIds: [null, 108], mode: '1v1', domain: 'Shadow Keep', result: [1, 0], moves: 38, when: 'Dec 20', wikiLinks: [null, null], reviewed: false },
  { players: ['GrandMaster_Z (2000)', 'You (1500)'], userIds: [109, null], mode: 'Arena', domain: 'Infernus', result: [1, 0], moves: 60, when: 'Dec 19', wikiLinks: [null, null], reviewed: true },
  { players: ['You (1500)', 'ChillGamer (1100)'], userIds: [null, 110], mode: '1v1', domain: 'Aberrant', result: [1, 0], moves: 25, when: 'Dec 18', wikiLinks: [null, null], reviewed: true },
  { players: ['Alice', 'You (1500)'], userIds: [null, null], mode: 'vsBots', domain: 'Frost Reach', result: [1, 0], moves: 52, when: 'Dec 17', wikiLinks: [{ category: 'pantheon', slug: 'alice' }, null], reviewed: false },
  { players: ['SilentStorm (1700)', 'You (1500)'], userIds: [111, null], mode: '1v1', domain: 'Earth', result: [1, 0], moves: 47, when: 'Dec 16', wikiLinks: [null, null], reviewed: true },
  { players: ['You (1500)', 'FirstTimer (800)'], userIds: [null, 112], mode: '1v1', domain: 'Infernus', result: [1, 0], moves: 18, when: 'Dec 15', wikiLinks: [null, null], reviewed: true },
  { players: ['EternalFlame (1900)', 'You (1500)'], userIds: [113, null], mode: 'Arena', domain: 'Null Providence', result: [1, 0], moves: 52, when: 'Dec 14', wikiLinks: [null, null], reviewed: false },
  { players: ['You (1500)', 'PixelPusher (1300)'], userIds: [null, 114], mode: '1v1', domain: 'Shadow Keep', result: [1, 0], moves: 30, when: 'Dec 13', wikiLinks: [null, null], reviewed: true },
  { players: ['Robert', 'You (1500)'], userIds: [null, null], mode: 'vsBots', domain: 'Infernus', result: [1, 0], moves: 44, when: 'Dec 12', wikiLinks: [{ category: 'pantheon', slug: 'robert' }, null], reviewed: true },
  { players: ['You (1500)', 'NewKid2024 (1000)'], userIds: [null, 115], mode: '1v1', domain: 'Earth', result: [1, 0], moves: 20, when: 'Dec 11', wikiLinks: [null, null], reviewed: true },
  { players: ['Apex_Predator (2100)', 'You (1500)'], userIds: [116, null], mode: 'Arena', domain: 'Infernus', result: [1, 0], moves: 65, when: 'Dec 10', wikiLinks: [null, null], reviewed: false },
  { players: ['You (1500)', 'IceQueen (1550)'], userIds: [null, 117], mode: '1v1', domain: 'Frost Reach', result: [0, 1], moves: 40, when: 'Dec 09', wikiLinks: [null, null], reviewed: true },
  { players: ['Omega_Zero (2200)', 'You (1500)'], userIds: [118, null], mode: 'Arena', domain: 'Null Providence', result: [1, 0], moves: 70, when: 'Dec 08', wikiLinks: [null, null], reviewed: true },
  { players: ['Peter', 'You (1500)'], userIds: [null, null], mode: 'vsBots', domain: 'Shadow Keep', result: [0, 1], moves: 31, when: 'Dec 07', wikiLinks: [{ category: 'pantheon', slug: 'peter' }, null], reviewed: false },
  { players: ['DeathWalker99 (1850)', 'You (1500)'], userIds: [101, null], mode: '1v1', domain: 'Shadow Keep', result: [1, 0], moves: 42, when: 'Dec 06', wikiLinks: [null, null], reviewed: true },
  { players: ['You (1500)', 'SoulReaper (1200)'], userIds: [null, 102], mode: '1v1', domain: 'Earth', result: [1, 0], moves: 36, when: 'Dec 05', wikiLinks: [null, null], reviewed: true },
];
