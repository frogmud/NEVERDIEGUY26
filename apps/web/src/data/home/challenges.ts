/**
 * Challenge Mock Data
 *
 * Sample challenges for Games & Challenges table.
 * User data is sourced from src/data/users.ts
 */

import type { Challenge } from './types';
import { getUser, getUserRecord } from '../users';

// Helper to build challenge from user ID
function buildPlayerChallenge(
  id: number,
  userId: number,
  type: Challenge['type'],
  status: Challenge['status'],
  mode: string,
  domain: string,
  domainName: string,
  time: string
): Challenge {
  const user = getUser(userId);
  return {
    id,
    name: user?.name || `Player ${userId}`,
    userId,
    wikiCategory: null,
    wikiSlug: null,
    rating: user?.rating || 1000,
    record: user ? getUserRecord(user) : '0 / 0 / 0',
    type,
    status,
    mode,
    domain,
    domainName,
    time,
    taunt: null,
  };
}

export const MOCK_CHALLENGES: Challenge[] = [
  // Player challenges - userIds from centralized user database
  buildPlayerChallenge(1, 100, 'Challenge Received', 'received', '1v1', 'earth', 'Earth', '2 hours ago'),
  buildPlayerChallenge(2, 101, 'Challenge Sent', 'sent', '1v1', 'shadow-keep', 'Shadow Keep', '5 hours ago'),
  buildPlayerChallenge(4, 102, 'Challenge Received', 'received', 'Arena', 'frost-reach', 'Frost Reach', '1 day ago'),
  buildPlayerChallenge(5, 103, 'Challenge Suggested', 'suggested', '1v1', 'aberrant', 'Aberrant', 'Similar skill'),
  buildPlayerChallenge(7, 104, 'Challenge Sent', 'sent', 'Arena', 'infernus', 'Infernus', '3 days ago'),
  buildPlayerChallenge(8, 105, 'Challenge Suggested', 'suggested', '1v1', 'earth', 'Earth', 'Rematch?'),
  // NPC challenges - Pantheon, Wanderers, Travelers (domain only, no locations)
  { id: 3, name: 'John', userId: null, wikiCategory: 'pantheon', wikiSlug: 'john', rating: null, record: null, type: 'NPC Challenge', status: 'npc', mode: 'Bots', domain: 'earth', domainName: 'Earth', time: 'Available', taunt: 'Let me upgrade your understanding of pain.' },
  { id: 6, name: 'Mr. Bones', userId: null, wikiCategory: 'wanderers', wikiSlug: 'mr-bones', rating: null, record: null, type: 'NPC Challenge', status: 'npc', mode: 'Bots', domain: 'frost-reach', domainName: 'Frost Reach', time: 'Ready', taunt: 'Your soul has depreciated. Time to collect.' },
];
