/**
 * Fake User Data System
 *
 * Generates realistic user data for testing. Currently generates 100 users,
 * but the seeded random system can scale to 500k+ without changing the API.
 *
 * Usage:
 *   import { getUser, getAllUsers, getTopUsers } from '../data/users';
 *   const user = getUser(101);
 *   const leaderboard = getTopUsers(50);
 */

// Seeded random for deterministic generation
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// Name components for generating realistic usernames
const NAME_PREFIXES = [
  'Death', 'Soul', 'Void', 'Crimson', 'Phantom', 'Dark', 'Shadow', 'Eternal',
  'Silent', 'Ice', 'Fire', 'Storm', 'Night', 'Blood', 'Steel', 'Iron',
  'Chaos', 'Neon', 'Cyber', 'Zero', 'Omega', 'Alpha', 'Nova', 'Apex',
  'Grim', 'Frost', 'Thunder', 'Lightning', 'Ash', 'Ember', 'Blaze', 'Raven',
];

const NAME_SUFFIXES = [
  'Walker', 'Reaper', 'Master', 'Blade', 'Rider', 'Hunter', 'Slayer', 'King',
  'Lord', 'Knight', 'Warrior', 'Striker', 'Crusher', 'Breaker', 'Killer', 'Seeker',
  'Storm', 'Flame', 'Shadow', 'Star', 'Wolf', 'Dragon', 'Phoenix', 'Viper',
  'Hawk', 'Falcon', 'Eagle', 'Bear', 'Tiger', 'Lion', 'Cobra', 'Serpent',
];

const NAME_STYLES = [
  (p: string, s: string, n: number) => `${p}${s}${n % 100}`,
  (p: string, s: string, n: number) => `${p}_${s}`,
  (p: string, s: string, n: number) => `xX_${p}${s}_Xx`,
  (p: string, s: string, n: number) => `${p}${s}`,
  (p: string, s: string, n: number) => `The${p}${s}`,
  (p: string, s: string, n: number) => `${p}${n % 1000}`,
  (p: string, s: string, n: number) => `${s}Of${p}`,
  (p: string, s: string, n: number) => `${p.toLowerCase()}_${s.toLowerCase()}`,
];

const COUNTRIES = ['US', 'UK', 'DE', 'JP', 'CA', 'AU', 'FR', 'KR', 'SE', 'NZ', 'BR', 'NO', 'ES', 'IT', 'NL', 'PL', 'MX', 'AR', 'RU', 'CN'];

const DOMAINS = ['Earth', 'Shadow Keep', 'Null Providence', 'Infernus', 'Frost Reach', 'Aberrant', 'Crimson Depths', 'Void Sanctum'];

const BIOS = [
  'Death walks with me. Always.',
  'Collecting souls since 2024',
  'The void calls to me',
  'My blade runs red',
  'You cannot catch what you cannot see',
  'Inspired by the legend himself',
  'Destruction is an art form',
  'What is dark matter? Me.',
  'The final letter. The final boss.',
  'Just here for a good time',
  'The quietest storms are the deadliest',
  'New here, learning fast!',
  'A flame that never dies',
  'Pushing pixels, taking names',
  'Fresh meat',
  'At the top of the food chain',
  'Cold as ice, twice as nice',
  'The beginning and the end',
  'I never die.',
  'Fear the reaper.',
  'Legends never die.',
  'GG EZ',
  'Try harder.',
  'Built different.',
  'No mercy.',
  'Victory or death.',
  'Pain is temporary, glory is forever.',
  'One shot, one kill.',
  'The hunt begins.',
  'Embrace the darkness.',
  'Light fears me.',
  'Born to win.',
];

const JOIN_MONTHS = [
  'Jan 2022', 'Mar 2022', 'Jun 2022', 'Sep 2022', 'Dec 2022',
  'Jan 2023', 'Feb 2023', 'Mar 2023', 'May 2023', 'Jul 2023', 'Sep 2023', 'Nov 2023',
  'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024',
  'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024',
];

const LAST_ONLINE = [
  'Just now', '2 min ago', '5 min ago', '15 min ago', '30 min ago',
  '1 hour ago', '2 hours ago', '5 hours ago', '12 hours ago',
  '1 day ago', '2 days ago', '3 days ago', '5 days ago',
  'Dec 28', 'Dec 27', 'Dec 26', 'Dec 25', 'Dec 20', 'Dec 15', 'Dec 10', 'Dec 01',
];

export interface User {
  id: number;
  name: string;
  rating: number;
  rank: number;
  level: number;
  wins: number;
  losses: number;
  draws: number;
  achievements: number;
  friends: number;
  points: number;
  joinDate: string;
  lastOnline: string;
  country: string;
  bio: string;
  favoriteDomain: string;
  avatar: string | null;
}

// Generate a user deterministically from their ID
function generateUser(id: number): User {
  const seed = id * 12345;
  const r = (offset: number) => seededRandom(seed + offset);

  // Generate username
  const prefixIdx = Math.floor(r(1) * NAME_PREFIXES.length);
  const suffixIdx = Math.floor(r(2) * NAME_SUFFIXES.length);
  const styleIdx = Math.floor(r(3) * NAME_STYLES.length);
  const prefix = NAME_PREFIXES[prefixIdx];
  const suffix = NAME_SUFFIXES[suffixIdx];
  const name = NAME_STYLES[styleIdx](prefix, suffix, id);

  // Generate stats with bell curve distribution
  // Higher IDs tend to be newer/lower ranked (for realistic leaderboard)
  const skillFactor = Math.max(0.1, 1 - (id - 100) / 150); // 100-250 range maps to 1.0-0.1
  const baseRating = 800 + Math.floor(r(4) * 1500 * skillFactor);
  const rating = Math.min(2500, Math.max(600, baseRating));

  const level = Math.floor(5 + r(5) * 95 * skillFactor);
  const totalGames = Math.floor(20 + r(6) * 800 * skillFactor);
  const winRate = 0.35 + r(7) * 0.35 * skillFactor;
  const wins = Math.floor(totalGames * winRate);
  const draws = Math.floor(totalGames * r(8) * 0.05);
  const losses = totalGames - wins - draws;

  const achievements = Math.floor(5 + r(9) * 195 * skillFactor);
  const friends = Math.floor(5 + r(10) * 550 * skillFactor);
  const points = Math.floor(500 + r(11) * 90000 * skillFactor);

  const joinDateIdx = Math.floor(r(12) * JOIN_MONTHS.length * (1 - skillFactor * 0.5));
  const lastOnlineIdx = Math.floor(r(13) * LAST_ONLINE.length);
  const countryIdx = Math.floor(r(14) * COUNTRIES.length);
  const bioIdx = Math.floor(r(15) * BIOS.length);
  const domainIdx = Math.floor(r(16) * DOMAINS.length);

  return {
    id,
    name,
    rating,
    rank: 0, // Will be calculated after sorting
    level,
    wins,
    losses,
    draws,
    achievements,
    friends,
    points,
    joinDate: JOIN_MONTHS[joinDateIdx] || 'Jan 2024',
    lastOnline: LAST_ONLINE[lastOnlineIdx] || 'Recently',
    country: COUNTRIES[countryIdx] || 'US',
    bio: BIOS[bioIdx] || 'No bio set.',
    favoriteDomain: DOMAINS[domainIdx] || 'Earth',
    avatar: null,
  };
}

// Pre-generate 100 users and sort by points for ranking
const USER_COUNT = 100;
const START_ID = 100;

const generatedUsers: User[] = [];
for (let i = 0; i < USER_COUNT; i++) {
  generatedUsers.push(generateUser(START_ID + i));
}

// Sort by points descending and assign ranks
generatedUsers.sort((a, b) => b.points - a.points);
generatedUsers.forEach((user, idx) => {
  user.rank = idx + 1;
});

// Create lookup map
const userMap = new Map<number, User>();
generatedUsers.forEach(user => {
  userMap.set(user.id, user);
});

// ============ PUBLIC API ============

/**
 * Get a user by ID. Returns undefined if not found.
 */
export function getUser(id: number): User | undefined {
  // For IDs in our range, use the map
  if (userMap.has(id)) {
    return userMap.get(id);
  }
  // For IDs outside our pre-generated range, generate on-demand
  // This supports scaling to 500k+ users
  if (id >= START_ID) {
    const user = generateUser(id);
    // Estimate rank based on points (rough approximation)
    user.rank = Math.max(1, USER_COUNT - Math.floor((user.points / 90000) * USER_COUNT));
    return user;
  }
  return undefined;
}

/**
 * Get all pre-generated users, sorted by rank (points descending).
 */
export function getAllUsers(): User[] {
  return [...generatedUsers];
}

/**
 * Get top N users by points.
 */
export function getTopUsers(count: number): User[] {
  return generatedUsers.slice(0, count);
}

/**
 * Get users for leaderboard display (with pagination support).
 */
export function getLeaderboardUsers(offset: number = 0, limit: number = 50): User[] {
  return generatedUsers.slice(offset, offset + limit);
}

/**
 * Search users by name (case-insensitive partial match).
 */
export function searchUsers(query: string): User[] {
  const q = query.toLowerCase();
  return generatedUsers.filter(u => u.name.toLowerCase().includes(q));
}

/**
 * Get random users for suggestions/matchmaking.
 */
export function getRandomUsers(count: number, excludeIds: number[] = []): User[] {
  const available = generatedUsers.filter(u => !excludeIds.includes(u.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get users by rating range (for matchmaking).
 */
export function getUsersByRating(minRating: number, maxRating: number): User[] {
  return generatedUsers.filter(u => u.rating >= minRating && u.rating <= maxRating);
}

/**
 * Get user's record as formatted string.
 */
export function getUserRecord(user: User): string {
  return `${user.wins} / ${user.draws} / ${user.losses}`;
}
