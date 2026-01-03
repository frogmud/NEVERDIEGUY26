/**
 * Home Screen Types
 *
 * Type definitions for mock data used on the homepage
 */

/** Challenge entry from Games & Challenges table */
export interface Challenge {
  id: number;
  name: string;
  userId: number | null;
  wikiCategory: string | null;
  wikiSlug: string | null;
  rating: number | null;
  record: string | null;
  type: 'Challenge Received' | 'Challenge Sent' | 'Challenge Suggested' | 'NPC Challenge' | 'Die-Rector Challenge';
  status: 'received' | 'sent' | 'suggested' | 'npc';
  mode: string;
  domain: string;
  domainName: string;
  time: string;
  taunt: string | null;
}

/** Game history entry from Game History table */
export interface GameHistoryEntry {
  players: [string, string];
  userIds: [number | null, number | null];
  mode: string;
  domain: string;
  result: [number, number];
  moves: number;
  when: string;
  wikiLinks: [WikiLink | null, WikiLink | null];
  reviewed: boolean;
}

/** Wiki link for NPC crossovers */
export interface WikiLink {
  category: string;
  slug: string;
}

/** Factoid displayed in the TopBar */
export interface Factoid {
  value: string;
  subtitle: string;
  domainSlug?: string;
}
