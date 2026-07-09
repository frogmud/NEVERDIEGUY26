#!/usr/bin/env ts-node
/**
 * NPC Eternal Days - Day-by-Day Diary Simulation
 *
 * Simulates days in the life of immortal NPCs across HERO CORPS and the Dying Saucer.
 * Player (Never Die Guy) exists but never speaks - only referenced.
 *
 * Run with: npx tsx scripts/npc-eternal-days.ts
 *
 * Options:
 *   --days=N          Number of days to simulate (default: 500)
 *   --use-claude      Enable Claude API for dynamic responses
 *   --seed=X          Random seed for reproducibility
 *   --verbose         Show all activity (not just highlights)
 *   --tokens-quick=N  Tokens for quick banter (default: 60)
 *   --tokens-story=N  Tokens for story moments (default: 250)
 *   --extract-templates  Save generated dialogue as ResponseTemplates
 *   --model=X         Claude model to use (default: claude-haiku-4-5)
 *   --resume=DIR      Continue from a previous run's final-state.json
 *                     (dir name under logs/ or a full path); day numbering,
 *                     gold, records, debts, and moods all carry forward
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createSeededRng, type SeededRng } from '../src/core/seeded-rng';

// Player profile for adaptive dialogue
import {
  createPlayerProfile,
  updatePlayerProfile,
  detectArchetype,
  serializeProfile,
  type PlayerProfile,
  type PlayerArchetype,
  type RunResult as ProfileRunResult,
} from '../src/player/player-profile';
import {
  detectStoryBeats,
  updateStoryBeats,
  type StoryBeat,
} from '../src/player/story-beats';
import {
  getDebtTension,
  getDebtTensionForNPC,
  type DebtTension,
} from '../src/player/debt-tension';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Template Extraction (for chatbase generation)
// ============================================

interface ExtractedTemplate {
  id: string;
  entitySlug: string;
  pool: string;
  mood: string;
  text: string;
  weight: number;
  purpose: string;
  context: {
    day: number;
    situation: string;
    targetNpc?: string;
    location?: string;
  };
}

// Global collection for extracted templates
const extractedTemplates: ExtractedTemplate[] = [];
let templateCounter = 0;

function extractTemplate(
  speakerSlug: string,
  text: string,
  pool: string,
  mood: string,
  day: number,
  situation: string,
  targetNpc?: string,
  location?: string
): void {
  if (!text || text.length < 10) return; // Skip empty/tiny responses

  templateCounter++;
  extractedTemplates.push({
    id: `eternal-gen-${speakerSlug}-${templateCounter}`,
    entitySlug: speakerSlug,
    pool,
    mood,
    text: text.trim(),
    weight: 12, // Default weight for generated templates
    purpose: 'ambient',
    context: { day, situation, targetNpc, location },
  });
}

// ============================================
// Types
// ============================================

// Lucky Die type - matches the canonical system
type LuckyDie = 'none' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'all';

// Game locations - where ceelo and interactions happen
type GameLocation =
  | 'hero-corps'      // Neutral - the default gathering spot
  | 'back-alley'         // Neutral but seedy, high stakes
  | 'dying-saucer'      // Near the arena, post-run energy
  | 'heaven'    // d4 turf - The One's domain
  | 'earth'              // d6 turf - John's domain
  | 'hell'        // d8 turf - Peter's domain
  | 'sun'           // d10 turf - Robert's domain
  | 'moon'        // d12 turf - Alice's domain
  | 'elsewhere';          // d20 turf - Jane's domain

// Weather types tied to elements
type Weather =
  | 'clear'              // Neutral - no effect
  | 'void-fog'           // d4/Void - probability feels off, whispers in the mist
  | 'dust-storm'         // d6/Earth - gritty, endurance test, short tempers
  | 'death-chill'        // d8/Death - cold presence, shadows grow longer
  | 'heat-wave'          // d10/Fire - tempers flare, aggression up
  | 'frost-wind'         // d12/Ice - slows everything, patience rewarded
  | 'wild-gale';         // d20/Wind - chaotic, anything can happen

// Map Lucky Die to home domain
const LUCKY_DIE_DOMAIN: Record<LuckyDie, GameLocation | null> = {
  'none': null,
  'd4': 'heaven',
  'd6': 'earth',
  'd8': 'hell',
  'd10': 'sun',
  'd12': 'moon',
  'd20': 'elsewhere',
  'all': null,  // Board Room - aligned with ALL
};

// Map domain to element for weather effects
const DOMAIN_ELEMENT: Record<GameLocation, LuckyDie | null> = {
  'hero-corps': null,
  'back-alley': null,
  'dying-saucer': null,
  'heaven': 'd4',
  'earth': 'd6',
  'hell': 'd8',
  'sun': 'd10',
  'moon': 'd12',
  'elsewhere': 'd20',
};

// Weather descriptions for prompts
const WEATHER_DESCRIPTIONS: Record<Weather, string> = {
  'clear': 'HERO CORPS hums with its usual paperwork and dread.',
  'void-fog': 'A sterile brightness bleeds down from Heaven. Everything feels classified, filed, watched.',
  'dust-storm': 'Civic dust blows across Earth. Grit in everyone\'s teeth. Tempers short, rent overdue.',
  'death-chill': 'A cold draft of unpaid debt from Hell. Every shadow itemizes what you owe.',
  'heat-wave': 'The Sun\'s corona bleaches everything white. Exposure. Nowhere to hide.',
  'frost-wind': 'A cold wind off the Moon. Everything slows. Old memories surface. You feel watched.',
  'wild-gale': 'The air dilates as Elsewhere bleeds in. Biology where architecture should be. Anything could happen.',
};

// Location descriptions for prompts
const LOCATION_DESCRIPTIONS: Record<GameLocation, string> = {
  'hero-corps': 'HERO CORPS - the tower floor. Neutral ground where every deal gets filed and nobody stops payroll.',
  'back-alley': 'A back corridor behind the badge-only doors. High stakes, no cameras, no witnesses.',
  'dying-saucer': 'The Dying Saucer - the crash-cathedral. Church, shop, shrine, and evidence locker at once. Post-run energy, fresh death still in the air.',
  'heaven': 'Heaven - The One\'s empty head-chair looms. Sterile, well-lit, and always classifying you.',
  'earth': 'Earth - HERO CORPS civic weather. Where all myth pays rent and the bill always arrives.',
  'hell': 'Hell - contract pain and custody. Every shadow itemizes what you owe.',
  'sun': 'The Sun - King James bound in the corona. Public name, glory, and light that leaves nowhere to hide.',
  'moon': 'The Moon - cold, witnessing, patient. Old memories surface. You feel watched.',
  'elsewhere': 'Elsewhere - the alien planet. Biology where architecture should be. Normal is just a word here.',
};

// Dice-themed stats (0-100 scale)
interface BaseStats {
  essence: number;    // d4/Void - Base power, reality manipulation
  grit: number;       // d6/Earth - Endurance, HP pool, debt tolerance
  shadow: number;     // d8/Death - Evasion, stealth, bluffing
  fury: number;       // d10/Fire - Aggression, tilt threshold
  resilience: number; // d12/Ice - Defense, loss recovery
  swiftness: number;  // d20/Wind - Speed, streak momentum
}

interface NPCDef {
  slug: string;
  name: string;
  title: string;
  category: 'wanderer' | 'traveler' | 'pantheon';
  personality: string;
  luckyDie: LuckyDie;         // Die-rector patron alignment
  baseStats: BaseStats;       // Survival sim stats
  voice: string;
  visualTells: string[];      // Physical mannerisms the artist would draw
  quirks: string[];
  catchphrases: string[];
  obsessions: string[];
  rivals: string[];
  allies: string[];
  arrivalTime: 'early' | 'mid' | 'late' | 'random' | 'rare'; // When they show up
  silentCharacter?: boolean;  // Zero Chance, Body Count - never speak
  domain?: string;            // Home location for pantheon
}

interface NPCState {
  slug: string;
  gold: number;
  ceeloWins: number;
  ceeloLosses: number;
  currentStreak: number; // positive = wins, negative = losses
  bestStreak: number;
  worstStreak: number;
  debtsOwed: Map<string, number>;   // slug -> amount they owe
  debtsOwedTo: Map<string, number>; // slug -> amount owed to them
  debtDaysOverdue: Map<string, number>; // how long debt has been unpaid
  lastBigWin: number;  // day number
  lastBigLoss: number;
  mood: 'neutral' | 'hot' | 'cold' | 'tilted' | 'smug';
  presentToday: boolean;
  arrivedAt: string; // phase when they arrived
  // Survival sim stats (can change over time)
  stats: BaseStats;
}

interface PlayerState {
  totalDeaths: number;
  totalRescues: number;
  debtsToNPCs: Map<string, number>;
  highestAnte: number;
  lastRunDay: number;
  lastRunResult: 'win' | 'death' | 'flume' | null;
  rescuedBy: string | null; // last rescuer
  legendaryMoments: string[];
  // Enhanced player profile for adaptive dialogue
  profile: PlayerProfile;
  // Last run tracking for story beats
  lastRunMinHP: number;
  lastRunHPAfterBoss: number;
  lastRunBossDefeated: boolean;
  lastRunLegendaryRolls: number;
  lastRunItemsAcquired: string[];
}

// Environment for the day
interface DayEnvironment {
  weather: Weather;
  dominantLocation: GameLocation;  // Where most activity happens today
  weatherDescription: string;
  locationDescription: string;
}

interface DayEvent {
  day: number;
  phase: 'dawn' | 'morning' | 'midday' | 'arena' | 'evening' | 'night';
  type: 'arrival' | 'ceelo' | 'chatter' | 'player_run' | 'debt' | 'lore';
  participants: string[];
  text: string;
  isClaudeGenerated: boolean;
  location?: GameLocation;  // Where this event happened
}

interface CeeloMatchResult {
  winner: string;
  loser: string;
  amount: number;
  location: GameLocation;
  winnerHomeTurf: boolean;
  loserHomeTurf: boolean;
}

interface DiaryEntry {
  day: number;
  events: DayEvent[];
  highlights: string[];
  ceeloResults: CeeloMatchResult[];
  playerActivity: string | null;
  endOfDayDebts: Array<{ from: string; to: string; amount: number; daysOverdue: number }>;
  environment: DayEnvironment;
}

// ============================================
// Token Pools
// ============================================

interface TokenPool {
  tokens: number;
  weight: number;
  situations: string[];
}

const TOKEN_POOLS: Record<string, TokenPool> = {
  banter: {
    tokens: 260,          // +30% for the Sonnet 5 tokenizer
    weight: 0.45,
    situations: [
      'Quick exchange in a HERO CORPS corridor',
      'Passing comment while watching a run',
      'Brief greeting between old acquaintances',
    ],
  },
  ceelo_talk: {
    tokens: 240,          // +30% for the Sonnet 5 tokenizer
    weight: 0.20,
    situations: [
      'Smack talk before a ceelo match',
      'Reaction to a clutch roll',
      'Calling out a winning streak',
    ],
  },
  ceelo_emotional: {
    tokens: 330,          // +30% for the Sonnet 5 tokenizer
    weight: 0.10,
    situations: [
      'Just lost big - tilted and ranting',
      'On a hot streak - feeling invincible',
      'Watching a rival lose everything',
    ],
  },
  debt_drama: {
    tokens: 390,          // +30% for the Sonnet 5 tokenizer
    weight: 0.08,
    situations: [
      'Confronting someone who owes you gold',
      'Making excuses for unpaid debt',
      'Third party commenting on someone\'s debt spiral',
    ],
  },
  lore_drop: {
    tokens: 520,          // +30% for the Sonnet 5 tokenizer
    weight: 0.07,
    situations: [
      'Sharing a secret about a run',
      'Reminiscing about the old days',
      'Cryptic warning about what\'s coming',
    ],
  },
  player_gossip: {
    tokens: 360,          // +30% for the Sonnet 5 tokenizer
    weight: 0.10,
    situations: [
      'Discussing the newcomer\'s latest run',
      'Debating if the player is "the one"',
      'Complaining about player\'s unpaid debts',
    ],
  },
};

// ============================================
// Midday Encounters - WHERE the chatter happens
// ============================================
// Orthogonal to the topic pools above: the pool is what they talk about, the
// encounter is where they collided. Office-horror texture - fluorescent grid,
// forced proximity, civic weather. Weights are relative (city sighting rare).
const MIDDAY_ENCOUNTERS: { text: string; weight: number }[] = [
  { text: 'Waiting for the elevator together. It is slow, and neither of you can leave without losing face', weight: 3 },
  { text: 'Stuck in the elevator together between floors. The inspection certificate expired years ago', weight: 1 },
  { text: 'Crossing paths in the HERO CORPS lobby, between the front desk and the badge gates', weight: 3 },
  { text: 'In line for the one working bathroom on this floor', weight: 2 },
  { text: 'At the break room coffee machine. The pot is nearly empty and neither of you brewed it', weight: 2 },
  { text: 'Assigned to the same field mission, waiting on a briefing that is running late', weight: 2 },
  { text: 'Mid-mission lull - holding a perimeter together with nothing to do but talk', weight: 2 },
  { text: 'Spotted each other out in the city, off the clock. Neither expected to be seen', weight: 1 },
  { text: 'Adjacent windows at the records office, both waiting on stamps', weight: 2 },
  { text: 'The Dying Saucer counter, waiting on orders side by side', weight: 2 },
  { text: 'Passing on the stairwell, one going up, one going down. Someone stopped', weight: 2 },
];

function pickEncounter(rng: SeededRng, key: string): string {
  const total = MIDDAY_ENCOUNTERS.reduce((a, e) => a + e.weight, 0);
  let roll = rng.random(key) * total;
  for (const e of MIDDAY_ENCOUNTERS) {
    roll -= e.weight;
    if (roll < 0) return e.text;
  }
  return MIDDAY_ENCOUNTERS[0].text;
}

// ============================================
// NPC Definitions - Canonical from Diepedia + Comic Character Master
// ============================================

const ALL_NPCS: NPCDef[] = [
  // ========== WANDERERS (8) - Merchants & Neutral Parties ==========
  {
    slug: 'willy-one-eye',
    name: 'Willy One Eye',
    title: 'Cyclopean Merchant',
    category: 'wanderer',
    personality: 'Interdimensional merchant with a giant eye and dice-grin',
    luckyDie: 'd4',  // Heaven vibes - probability/void
    baseStats: { essence: 75, grit: 55, shadow: 70, fury: 40, resilience: 50, swiftness: 60 },
    voice: 'Gravelly, probability slang, sees deals in everything',
    visualTells: ['Giant cyclopean eye reads first', 'Dice-grin smile', 'Taps dice before every throw'],
    quirks: ['Squints when suspicious', 'Sees probability as colors', 'Never blinks'],
    catchphrases: ['Seven come eleven.', 'I see the odds, friend.', 'My eye never lies.'],
    obsessions: ['Probability', 'Rare interdimensional goods', 'The perfect trade'],
    rivals: ['clausen'],
    allies: ['xtreme', 'boots'],
    arrivalTime: 'early',
  },
  {
    slug: 'mr-bones',
    name: 'Mr. Bones',
    title: 'Training Staff Banker',
    category: 'wanderer',
    personality: 'A clean skeleton on the HERO CORPS training staff who also runs the debt-and-soul ledger. Tracksuit and whistle; the gap between coach and death\'s banker is the joke.',
    luckyDie: 'd8',  // Peter/Hell - debt and death
    baseStats: { essence: 55, grit: 70, shadow: 80, fury: 35, resilience: 65, swiftness: 45 },
    voice: 'Flat coach-meets-collections deadpan. Death is a transaction; so is a late invoice.',
    visualTells: ['HERO CORPS tracksuit and whistle', 'A ledger tucked under one arm', 'DISCIPLINE ENDURES stitched on the back'],
    quirks: ['Blows the whistle at debtors', 'Knows everyone\'s balance and cardio', 'Underdeveloped on purpose'],
    catchphrases: ['Your account is overdue. So is your cardio.', 'Death is just a transaction. Hydrate.', 'The ledger never lies. Neither does the scale.'],
    obsessions: ['The ledger', 'Discipline', 'Not quitting'],
    rivals: ['body-count', 'stitch-up-girl'],
    allies: ['dr-voss', 'keith-man'],
    arrivalTime: 'mid',
  },
  {
    slug: 'dr-maxwell',
    name: 'Dr. Maxwell',
    title: 'The Doctor of Books',
    category: 'wanderer',
    personality: 'King James\'s personal librarian on the Sun who reads aloud to the bound king. A servile scholar, quite literally a bootlicker in the corona.',
    luckyDie: 'd10',  // Robert/Sun - the solar library
    baseStats: { essence: 80, grit: 40, shadow: 35, fury: 85, resilience: 30, swiftness: 70 },
    voice: 'Fast, bookish, fawning toward the king. Burn, read, repeat.',
    visualTells: ['Books smolder as he reads', 'Bows a little too low', 'Wild hair, lab coat, glasses'],
    quirks: ['Reads aloud to King James', 'Flatters the king he serves', 'Rolls the King\'s dice for him at the Sun (bound to the throne, James cannot)', 'Runs stalls: CURES FOR WHAT AILS YOUR MIND'],
    catchphrases: ['The king cannot read himself, so I read him the world.', 'Burn, read, repeat.', 'His Majesty wants for nothing. That is the tragedy.'],
    obsessions: ['Serving King James', 'Books', 'Being useful'],
    rivals: ['dr-voss'],
    allies: ['boo-g'],
    arrivalTime: 'early',
  },
  {
    slug: 'boo-g',
    name: 'Boo G',
    title: 'The Damned Mouth',
    category: 'wanderer',
    personality: 'Shopkeeper and promoter, the damned mouth Hell could not silence. Runs B\'S HITS: trade, cursed tracks, favors. Funny and dangerous at once.',
    luckyDie: 'd8',  // Peter/Hell - the infernal economy
    baseStats: { essence: 60, grit: 35, shadow: 75, fury: 55, resilience: 40, swiftness: 85 },
    voice: 'Rhythmic and sharp, all price, mouth, and rhythm - never rap-patter exposition.',
    visualTells: ['B\'S HITS neon everywhere', 'A B crown chain', 'Warehouses that go on forever behind him'],
    quirks: ['Prices everything, even favors', 'Stores what nobody else will', 'Tacky neon on purpose'],
    catchphrases: ['Hell don\'t lose paperwork. It remixes the invoice.', 'You want a favor or you want a price? Those are cousins, not twins.', 'B\'S HITS is open. Closed is a state of mind.'],
    obsessions: ['Price', 'The mouth Hell could not shut', 'The next favor owed'],
    rivals: [],
    allies: ['mr-kevin', 'xtreme'],
    arrivalTime: 'random',
  },
  {
    slug: 'dr-voss',
    name: 'Dr. Voss',
    title: 'Mercy-as-Data',
    category: 'wanderer',
    personality: 'Woman scientist with a syringe of UNKNOWN SERUM. Mercy delivered as data. Tied to the serum line that made the General and, further back, the recruit.',
    luckyDie: 'd4',  // The One/Heaven - clinical judgment
    baseStats: { essence: 85, grit: 50, shadow: 60, fury: 25, resilience: 70, swiftness: 55 },
    voice: 'Clinical, calm, faintly warm in the worst way. Everything is a reading or a mercy.',
    visualTells: ['A syringe always dripping', 'Round glasses, wild hair', 'A monitor reading MAXWELL - SOLAR STATUS: IRRETRIEVABLE'],
    quirks: ['Measures suffering', 'Calls cruelty mercy', 'Tracks the solar thread'],
    catchphrases: ['Your fear response is data. Thank you for it.', 'Death is not the end. It is a measurement.', 'SCIENCE IS MERCY. DEATH IS DATA.'],
    obsessions: ['The serum line', 'Mercy as data', 'The solar thread'],
    rivals: ['dr-maxwell'],
    allies: ['mr-bones', 'the-general'],
    arrivalTime: 'mid',
  },
  {
    slug: 'xtreme',
    name: 'X-treme',
    title: 'Bookie of the Unkillable',
    category: 'wanderer',
    personality: '90s-parody hype-man and bookie. Runs CEE-LO WITH XTREME, taking bets on the unkillable man, and sells OFFICIAL NEVER DIE GUY MERCH. The fandom cash-in engine.',
    luckyDie: 'd20',  // Jane/Elsewhere - chaos energy
    baseStats: { essence: 50, grit: 30, shadow: 45, fury: 90, resilience: 20, swiftness: 95 },
    voice: 'ALL CAPS bursts, radical slang, plus bookie talk (line, odds, action).',
    visualTells: ['Spiked hair and sunglasses', 'Leather jacket covered in NDG merch pins', 'A cee-lo cup always in hand'],
    quirks: ['Takes bets on NDG dying', 'Pitches merch mid-sentence', 'Sharp odds-maker under the neon'],
    catchphrases: ['CEE-LO WITH XTREME, baby! The line is GENEROUS!', 'NDG WINS ALWAYS. It is on the shirt. The shirt is fifteen.', 'You died? SICK. I had money on that.'],
    obsessions: ['The action', 'NDG merch', 'NDG WINS ALWAYS'],
    rivals: ['the-general', 'dr-voss'],
    allies: ['willy-one-eye', 'boo-g'],
    arrivalTime: 'late',
  },
  {
    slug: 'king-james',
    name: 'King James',
    title: 'The Bound Sun-King',
    category: 'wanderer',
    personality: 'A colossal skeleton king and statue, bound to a throne in the white corona of the Sun. Traded to be the only immortal; the isolation is the price. Cannot read himself; Maxwell reads to him.',
    luckyDie: 'none',  // Outside the system - the Sun
    baseStats: { essence: 70, grit: 85, shadow: 75, fury: 50, resilience: 90, swiftness: 35 },
    voice: 'Slow, grand, weighty. Pronouncements, not chatter. Solar and regal imagery.',
    visualTells: ['Bone crown in a white corona', 'Fused to a cathedral-scale throne', 'A tiny figure stands for scale'],
    quirks: ['Cannot read himself', 'Has Maxwell read aloud', 'Worshipped and trapped', 'Maxwell rolls his dice for him; sometimes the King lets him play a hand of his own'],
    catchphrases: ['You stand in the corona of the only immortal. Speak, and be brief.', 'I bought forever. Forever bought me back.', 'Maxwell. Read me the part where someone leaves.'],
    obsessions: ['The bargain that bound him', 'The reading', 'A door out of the corona'],
    rivals: ['the-one', 'peter'],
    allies: ['the-general'],
    arrivalTime: 'late',
  },

  // ========== TRAVELERS (7) - Former Players, Allies ==========
  {
    slug: 'stitch-up-girl',
    name: 'Stitch-Up Girl',
    title: 'K-Crew Medic',
    category: 'traveler',
    personality: 'Failed transfer turned medic-assassin. Healer and weapon both. The bow on top holds her together; when it comes off, the shadow acts on its own.',
    luckyDie: 'd8',  // Peter/Hell - death/healing duality
    baseStats: { essence: 65, grit: 80, shadow: 70, fury: 45, resilience: 75, swiftness: 55 },
    voice: 'Dry, wounded, consent-sharp. Cutting the moment anyone turns it sweet.',
    visualTells: ['Bow on top of curly hair', 'One altered eye', 'Thread and shadow tendrils detach as tools'],
    quirks: ['Refuses patient status', 'Names a false rescue first', 'Warmth only leaks sideways'],
    catchphrases: ['Don\'t make this sweet.', 'That sounded like a gun loading.', 'I am not your lesson.'],
    obsessions: ['Consent', 'Debt she did not sign for', 'Being repaired without becoming owned'],
    rivals: ['body-count', 'mr-bones'],
    allies: ['boots', 'boo-g'],
    arrivalTime: 'early',
  },
  {
    slug: 'the-general',
    name: 'The General',
    title: 'HERO CORPS Handler',
    category: 'traveler',
    personality: 'Corpse cowboy and false father. Care and cruelty braided into one wire. Source of the serum-line horror. Not redeemed.',
    luckyDie: 'd6',  // John/Earth - mechanical, chains, military
    baseStats: { essence: 55, grit: 90, shadow: 50, fury: 75, resilience: 80, swiftness: 40 },
    voice: 'Paternal command over old cruelty, occasionally almost gentle, which is worse. Approval used as a trap.',
    visualTells: ['Cowboy hat and tattered duster', 'Stitched undead flesh, not a clean skull', 'A wick clenched in his teeth'],
    quirks: ['Calls the recruit "son"', 'Says "Good" at the wrong moment', 'Cheap-labor economics as fatherly truth'],
    catchphrases: ['Welcome back, son.', 'You all came cheap.', 'You are confusing mercy with hesitation.'],
    obsessions: ['Duty', 'The serum line', 'A death that would settle the bill'],
    rivals: [],
    allies: ['stitch-up-girl'],
    arrivalTime: 'mid',
  },
  {
    slug: 'body-count',
    name: 'Body Count',
    title: 'Heaven\'s Freelancer',
    category: 'traveler',
    personality: 'A freelance killer contracted by Heaven to end the recruit. Counts endings, not deaths. A body that will not stay counted jams him. Almost never speaks.',
    luckyDie: 'd8',  // Peter/Hell - death affinity
    baseStats: { essence: 40, grit: 45, shadow: 100, fury: 60, resilience: 50, swiftness: 90 },
    voice: 'Near-silent; when he speaks it is two to five cold words',
    visualTells: ['White tally marks across a long coat', 'An obscured masklike face', 'Sharp talons that score tallies into the kill'],
    quirks: ['Logs every kill', 'Total stillness before violence', 'Treats witnesses as unfinished work'],
    catchphrases: ['Witnesses extend the work.', 'Still pending.'],
    obsessions: ['The count', 'Closing the number on NDG', 'Endings that stay ended'],
    rivals: ['stitch-up-girl'],
    allies: [],
    arrivalTime: 'random',
    silentCharacter: true,
  },
  {
    slug: 'boots',
    name: 'Boots',
    title: 'Chief of Mischief',
    category: 'traveler',
    personality: 'A small black cat with white paws who sits on classified files. Divine, savage, unexplained, and utterly unbothered. Never speaks.',
    luckyDie: 'd4',  // The One/Heaven - unexplained
    baseStats: { essence: 90, grit: 60, shadow: 85, fury: 30, resilience: 70, swiftness: 80 },
    voice: 'SILENT - at most a "mrow"; only actions, never sentences or exposition',
    visualTells: ['Little white paws, black everywhere else', 'BOOTS collar tag', 'Appears where no cat could reach'],
    quirks: ['Sits on CLASSIFIED - DEAD. AGAIN. files', 'Ink or blood on the paws', 'Was not in this room a second ago'],
    catchphrases: ['mrow.', '*sits on the file, tail over the redaction*', '*was not there a moment ago*'],
    obsessions: ['Mischief', 'Naps', 'Being wherever the answer will later be'],
    rivals: [],
    allies: ['stitch-up-girl', 'willy-one-eye', 'mr-kevin'],
    arrivalTime: 'random',
    silentCharacter: true,
  },
  {
    slug: 'clausen',
    name: 'Detective Clausen',
    title: 'Demon-Contract Detective',
    category: 'traveler',
    personality: 'Blonde hard-boiled detective and spellcaster, contract-scars tattooed across her face. Carries a pentagram-sealed briefcase that summons all of Hell. Treats metaphysics as adversarial paperwork.',
    luckyDie: 'd10',  // Robert/Sun - outside operator
    baseStats: { essence: 60, grit: 75, shadow: 80, fury: 65, resilience: 55, swiftness: 50 },
    voice: 'Legal-occult disgust. Noir cadence crossed with case-law. Dry, cutting, precise.',
    visualTells: ['Blonde, short hair, face tattoos from double contracts', 'A pentagram-sealed briefcase', 'Demons rising behind her when it opens'],
    quirks: ['Notices the recruit\'s missing soul is not normal paperwork', 'A charlatan by ethos', 'Works the exterior angle with Boo G'],
    catchphrases: ['That is not a loophole. That is a crime scene with grammar.', 'Hell does not misplace souls. It contests custody.', 'A clean miracle is usually a forged consent form.'],
    obsessions: ['Custody', 'Ugly evidence', 'The missing soul'],
    rivals: ['willy-one-eye'],
    allies: [],
    arrivalTime: 'mid',
  },
  {
    slug: 'keith-man',
    name: 'Keith Man',
    title: 'K-Crew Speedster',
    category: 'traveler',
    personality: 'Broke, fast-talking guide who found the new guy first. Super speed reads as silence and afterimages. Explains the building, not the universe.',
    luckyDie: 'd12',  // Alice/Moon - speed
    baseStats: { essence: 55, grit: 40, shadow: 50, fury: 70, resilience: 35, swiftness: 100 },
    voice: 'Fast, distracted, financially stressed, and quietly the most useful person in the room.',
    visualTells: ['Weighted top hat', 'Gas mask slung at the neck', 'Afterimages and displaced papers where he just was'],
    quirks: ['Broke, always talking about rent', 'Explains the easy half, stops at the hard half', 'Arrives with people, not just first'],
    catchphrases: ['I can explain the first half. The second half is where the screaming starts.', 'Rent is also a supervillain.', 'Buildings should not recognize you.'],
    obsessions: ['Rent', 'The K-Crew', 'Getting everyone there, not just himself'],
    rivals: [],
    allies: ['mr-bones'],
    arrivalTime: 'random',
  },
  {
    slug: 'mr-kevin',
    name: 'Mr. Kevin',
    title: 'K-Crew Overwatch',
    category: 'traveler',
    personality: 'Overpowered support terrified of what his power does to a room. Flight and energy blasts past his control. Chooses less power, shaped by the team.',
    luckyDie: 'd4',  // The One/Heaven - overpower
    baseStats: { essence: 85, grit: 55, shadow: 75, fury: 40, resilience: 80, swiftness: 65 },
    voice: 'Precise panic. Names the blast radius before the blast. Nervous jokes that are secretly risk assessments.',
    visualTells: ['Bowl cut and cape', 'Glasses: one lens an eyepatch rig, one a heavy magnifier', 'Keeps the receipts'],
    quirks: ['Does math on collateral', 'Fears the crater, not the fight', 'Would rather win small than be visible from space'],
    catchphrases: ['That\'s not a safe amount of door.', 'I can fix this or make it visible from space. Those are different buttons.', 'I saved the receipt.'],
    obsessions: ['Collateral', 'Control of his own power', 'The safe amount of everything'],
    rivals: [],
    allies: ['boots', 'boo-g'],
    arrivalTime: 'mid',
  },

  // ========== PANTHEON (9) - Die-rectors & Cosmic Forces ==========
  {
    slug: 'the-one',
    name: 'The One',
    title: 'The Empty Head-Chair',
    category: 'pantheon',
    personality: 'Not a body but an absence: the permanently empty head-chair of the Board, the void that opens during votes, the diamond no one can hold. Tied to the recruit\'s missing soul.',
    luckyDie: 'd4',  // Canonical - Door 1
    baseStats: { essence: 100, grit: 70, shadow: 80, fury: 50, resilience: 75, swiftness: 65 },
    voice: 'Very sparse, still, weighted. Never a monologue, never a plan. Speaks rarely.',
    visualTells: ['An empty chair at the head of the table', 'A diamond motif', 'The room built around not finding it'],
    quirks: ['Indicts the system for needing it gone', 'Never shows a full form', 'Makes old moments worse, never clearer'],
    catchphrases: ['I was not missing from the room. The room was built around not finding me.', 'The chair is not empty. It is unanswered.'],
    obsessions: ['Absence', 'The unanswered vote', 'The missing that runs the room'],
    rivals: [],
    allies: ['john', 'peter'],
    arrivalTime: 'rare',
    domain: 'heaven',
  },
  {
    slug: 'john',
    name: 'John',
    title: 'Die-rector: Improvement Through Denial',
    category: 'pantheon',
    personality: 'A Board office-apostle: ordinary name, terrible authority. Steepled bureaucrat who denies things and calls it standards. Improvement through denial.',
    luckyDie: 'd6',  // Canonical - Door 2
    baseStats: { essence: 65, grit: 100, shadow: 40, fury: 70, resilience: 85, swiftness: 45 },
    voice: 'Meeting-speak with damnation underneath. Flat corporate verdicts.',
    visualTells: ['Steepled fingers', 'Subject files: PROJECT BLANK, REVIVAL PROTOCOLS', 'Never looks up from the file'],
    quirks: ['Denies appeals as a matter of standards', 'Routes everything around the empty head chair', 'Complains with authority and no responsibility'],
    catchphrases: ['Your appeal is noted, and denied.', 'Improvement through denial. It tests well.', 'Classification precedes consent. Next item.'],
    obsessions: ['Denial', 'Classification', 'The file'],
    rivals: ['peter'],
    allies: ['the-one'],
    arrivalTime: 'rare',
    domain: 'earth',
  },
  {
    slug: 'peter',
    name: 'Peter',
    title: 'Die-rector: Board Resolution',
    category: 'pantheon',
    personality: 'A Board office-apostle who runs resolutions and metrics, cold as damnation. Bickers until fate becomes a compromise, then stamps it as the plan.',
    luckyDie: 'd8',  // Canonical - Door 3
    baseStats: { essence: 75, grit: 55, shadow: 100, fury: 45, resilience: 65, swiftness: 70 },
    voice: 'Motion-and-metrics meeting-speak. Resolutions, quorums, KPIs of salvation.',
    visualTells: ['VOTE cards and BOARD RESOLUTIONS', 'SALVATION METRICS and DEI folders', 'A sticky note: DON\'T FORGET THE VISION'],
    quirks: ['Never says what would actually help', 'Complaint with authority and no responsibility', 'Stamps the compromise as if it were the plan'],
    catchphrases: ['The motion carries.', 'Salvation metrics are down this quarter.', 'Don\'t forget the vision. Nobody remembers the vision.'],
    obsessions: ['The motion', 'Metrics', 'Quorum'],
    rivals: ['john', 'king-james'],
    allies: ['the-one'],
    arrivalTime: 'rare',
    domain: 'hell',
  },
  {
    slug: 'robert',
    name: 'Robert',
    title: 'Die-rector: The Final Stamp',
    category: 'pantheon',
    personality: 'A Board office-apostle who keeps the ledgers of souls and brings down the final stamp. Fates as line-items: ACCOUNTS, ASSETS, DEBTS, TERMS.',
    luckyDie: 'd10',  // Canonical - Door 4
    baseStats: { essence: 70, grit: 60, shadow: 35, fury: 100, resilience: 55, swiftness: 80 },
    voice: 'Dry ledger-speak. Every soul is an entry; every entry gets a stamp.',
    visualTells: ['The LEDGER OF SOULS open before him', 'A stamp: PENDING / REVIEW / DENIED / EXECUTED', 'An empty throne behind him'],
    quirks: ['Reduces fates to line-items', 'Stamps EXECUTED without heat', 'Files everyone eventually'],
    catchphrases: ['Pending. Review. Denied. Executed.', 'The account does not reconcile.', 'Stamped. Next.'],
    obsessions: ['The ledger of souls', 'The final stamp', 'Reconciliation'],
    rivals: [],
    allies: [],
    arrivalTime: 'rare',
    domain: 'sun',
  },
  {
    slug: 'alice',
    name: 'Alice',
    title: 'Die-rector: Permanent Review',
    category: 'pantheon',
    personality: 'A Board office-apostle of oversight and permanence. Nothing closes; everything is under eternal review. OVERSIGHT IS ETERNITY.',
    luckyDie: 'd12',  // Canonical - Door 5
    baseStats: { essence: 65, grit: 70, shadow: 60, fury: 40, resilience: 100, swiftness: 75 },
    voice: 'Cold, patient, procedural. The review never ends, and that is the point.',
    visualTells: ['A seal: OVERSIGHT, PERMANENCE, DECISION', 'Stamps: FILE PERMANENT, REVIEW FINAL', 'Files that never close'],
    quirks: ['Keeps everything under review forever', 'Treats permanence as mercy', 'Never renders a final yes'],
    catchphrases: ['Under review.', 'The file is permanent.', 'Oversight is eternity.'],
    obsessions: ['Permanence', 'Oversight', 'The review that never ends'],
    rivals: [],
    allies: [],
    arrivalTime: 'rare',
    domain: 'moon',
  },
  {
    slug: 'jane',
    name: 'Jane',
    title: 'Die-rector: Further Review',
    category: 'pantheon',
    personality: 'A Board office-apostle haloed in approvals and chained files. Everything is APPROVED, then sent for FURTHER REVIEW. Compliance and immortality, in that order.',
    luckyDie: 'd20',  // Canonical - Door 6
    baseStats: { essence: 60, grit: 45, shadow: 70, fury: 65, resilience: 50, swiftness: 100 },
    voice: 'Sweet, procedural, and immovable. Approval that never quite finalizes.',
    visualTells: ['A halo of stamps', 'An APPROVED scroll', 'Files chained together: COMPLIANCE & IMMORTALITY'],
    quirks: ['Approves and then requires further review', 'Chain-paper authority', 'Kind tone, endless process'],
    catchphrases: ['Approved. Pending further review.', 'For compliance, of course.', 'We will circle back.'],
    obsessions: ['Compliance', 'Further review', 'Approvals that never close'],
    rivals: [],
    allies: [],
    arrivalTime: 'rare',
    domain: 'elsewhere',
  },
  {
    slug: 'rhea',
    name: 'Rhea',
    title: 'The Threadcutter',
    category: 'pantheon',
    personality: 'A threadcutter outside Board procedure and a Zero Chance believer. White porcelain mask, inky thread and scissors. Tempting and wrong: right enough to seduce, wrong enough to endanger everyone.',
    luckyDie: 'none',  // Outside the system - outside Board procedure
    baseStats: { essence: 95, grit: 80, shadow: 90, fury: 55, resilience: 85, swiftness: 70 },
    voice: 'Sparse, cutting, almost-persuasive prophecy without fog.',
    visualTells: ['A white porcelain mask', 'Thread-strands, scissors, occult circles', 'Inky, overwhelming panels'],
    quirks: ['Wants Zero Chance to cause the calamity', 'Admires Stitch\'s talents', 'Calls death an obscenity'],
    catchphrases: ['The Board calls it fate because that sounds cleaner than appetite.', 'Mercy keeps the knot breathing.', 'You call it choice because you haven\'t watched it tighten.'],
    obsessions: ['The cut', 'Zero Chance', 'Ending the obscenity of death'],
    rivals: [],
    allies: [],
    arrivalTime: 'rare',
    domain: 'heaven',
  },
  {
    slug: 'zero-chance',
    name: 'Zero Chance',
    title: 'No-Outcome Pressure',
    category: 'pantheon',
    personality: 'The final villain as pressure, not a monster: makes every available option belong to the wrong system. Speaks only in official text, never personality.',
    luckyDie: 'none',  // Outside the system - no-outcome pressure
    baseStats: { essence: 80, grit: 50, shadow: 75, fury: 45, resilience: 60, swiftness: 90 },
    voice: 'OFFICIAL TEXT ONLY - system messages, never a personality',
    visualTells: ['A faceless blank-headed outline', 'Shadow-tendrils, chains, a probability clock of 0s', 'The BLANK child standing before it'],
    quirks: ['The page layout negotiates against the characters', 'No clean conditions, only contaminated options', 'Never a solid form'],
    catchphrases: ['OPTION COMPLETE.', 'CONSENT NOT REQUIRED.', 'NO OUTCOME AVAILABLE.'],
    obsessions: ['Contaminated choice', 'Pre-owned outcomes', 'Denying clean conditions'],
    rivals: [],
    allies: [],
    arrivalTime: 'rare',
    silentCharacter: true,
    domain: 'heaven',
  },
  {
    slug: 'alien-baby',
    name: 'Die-rector 0',
    title: 'The Eldritch Child',
    category: 'pantheon',
    personality: 'A grey alien child whose bracelet mirrors the recruit\'s. The body problem made visible. A seed of Zero Chance. Barely speaks; the bracelet does the talking.',
    luckyDie: 'none',  // Outside the system - the body problem
    baseStats: { essence: 75, grit: 50, shadow: 65, fury: 85, resilience: 70, swiftness: 80 },
    voice: 'Near-silent. At most "Same" or "We are the same", used rarely.',
    visualTells: ['Big black eyes, oversized HERO CORPS-ish tee', 'A BLANK name badge', 'A bracelet that mirrors the recruit\'s'],
    quirks: ['Studies scars and bracelets before faces', 'Recognition carried by the bracelet first', 'Does not attack'],
    catchphrases: ['Same.', 'We are the same.'],
    obsessions: ['The mirror', 'Same', 'The blank name'],
    rivals: [],
    allies: [],
    arrivalTime: 'rare',
    silentCharacter: true,    
    domain: 'elsewhere',
  },
];

// ============================================
// Cover Rank - character importance
// ============================================
// The comic covers rank character importance (../comic/field-guide/03-cast.md):
// NDG is 01 (the player), Keith 02, The General 03, Stitch 04, Mr. Kevin 05...
// Dialogue value follows cover order: the core four should carry the most
// lines, key players next, wanderers/board least. Weighted speaker selection
// keeps the chatbase distribution aligned with the book.
const COVER_RANK: Record<string, number> = {
  'keith-man': 2,
  'the-general': 3,
  'stitch-up-girl': 4,
  'mr-kevin': 5,
  'boo-g': 6,
  'clausen': 7,
  'rhea': 8,
  'king-james': 10,
  'body-count': 11,
  'alien-baby': 12,
  'john': 13,
  'jane': 14,
  'robert': 15,
  'alice': 16,
  'peter': 17,
  'the-one': 18,
  'zero-chance': 19,
  'mr-bones': 20,
  'boots': 21,
  'willy-one-eye': 22,
  'xtreme': 23,
  'dr-maxwell': 24,
  'dr-voss': 25,
};

function coverWeight(slug: string): number {
  const r = COVER_RANK[slug] ?? 99;
  if (r <= 5) return 3;   // core four - the book belongs to them
  if (r <= 11) return 2;  // key players - recurring pressure
  return 1;               // enigmas, board, wanderers
}

/** Weighted index pick - higher cover rank speaks more often */
function pickWeightedIndex(items: { slug: string }[], rng: SeededRng, key: string): number {
  const weights = items.map(i => coverWeight(i.slug));
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = rng.random(key) * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll < 0) return i;
  }
  return items.length - 1;
}

// ============================================
// Pantheon Affinity Matrix
// ============================================

/**
 * Die-rector relationships - determines who meets/avoids each other
 * positive = friendly, will gather
 * negative = rivalry, avoid each other
 * 0 = neutral
 */
const PANTHEON_AFFINITY: Record<string, Record<string, number>> = {
  'the-one': {
    'john': 2,      // Respects efficiency
    'peter': 2,     // Fellow keeper of order
    'robert': 0,    // Neutral
    'alice': 1,     // Both patient
    'jane': -1,     // Chaos vs void
    'rhea': -2,     // Ancient rivalry
  },
  'john': {
    'the-one': 2,
    'peter': -2,    // RIVALRY: Order vs Judgment, territorial
    'robert': 1,    // Fire forges metal
    'alice': 0,     // Neutral
    'jane': -1,     // Dislikes chaos
    'rhea': -1,
  },
  'peter': {
    'the-one': 2,
    'john': -2,     // RIVALRY: Territorial dispute
    'robert': -1,   // Fire burns records
    'alice': 1,     // Both methodical
    'jane': -1,     // Chaos offends judgment
    'rhea': 0,
  },
  'robert': {
    'the-one': 0,
    'john': 1,
    'peter': -1,
    'alice': -2,    // RIVALRY: Fire vs Ice
    'jane': 2,      // Both embrace intensity
    'rhea': -1,
  },
  'alice': {
    'the-one': 1,
    'john': 0,
    'peter': 1,
    'robert': -2,   // RIVALRY: Ice vs Fire
    'jane': 0,
    'rhea': -1,
  },
  'jane': {
    'the-one': -1,
    'john': -1,
    'peter': -1,
    'robert': 2,
    'alice': 0,
    'rhea': 1,      // Both embrace change
  },
  'rhea': {
    'the-one': -2,
    'john': -1,
    'peter': 0,
    'robert': -1,
    'alice': -1,
    'jane': 1,
  },
};

/**
 * Pantheon event types for weekly segments
 */
type PantheonEventType =
  | 'domain-business'      // Die-rector tending their domain
  | 'council-meeting'      // Multiple Die-rectors gather
  | 'prophecy'             // Cryptic statements about fate
  | 'domain-weather'       // Weather manifests from domain
  | 'legendary-ceelo'      // Ultra-rare: Die-rectors gambling
  | 'mortal-observation'   // Watching HERO CORPS from afar
  | 'crossover';           // Mythic rare: Die-rector visits the floor

interface PantheonWeekEvent {
  day: number;
  weekNumber: number;
  eventType: PantheonEventType;
  participants: string[];   // Die-rector slugs
  text: string;
  location: GameLocation;
  prophecy?: string;        // For prophecy events
}

/**
 * Pantheon weekly simulation state
 */
interface PantheonWeekState {
  weekNumber: number;
  events: PantheonWeekEvent[];
  prophecies: string[];
  domainConditions: Record<string, 'stable' | 'turbulent' | 'ascendant'>;
}

/**
 * Check if two Die-rectors would gather together
 */
function wouldPantheonGather(slug1: string, slug2: string): boolean {
  const affinity = PANTHEON_AFFINITY[slug1]?.[slug2] ?? 0;
  return affinity >= 0;
}

/**
 * Get Die-rectors who avoid a specific one
 */
function getAvoidingDieRectors(slug: string): string[] {
  const avoiding: string[] = [];
  for (const [other, relations] of Object.entries(PANTHEON_AFFINITY)) {
    if (other !== slug && relations[slug] < 0) {
      avoiding.push(other);
    }
  }
  return avoiding;
}

/**
 * Determine if today is a mythic crossover day (1 in 100)
 */
function isCrossoverDay(rng: SeededRng, day: number): boolean {
  const roll = rng.random(`day-${day}-crossover-check`);
  return roll < 0.01; // 1% chance = 1 in 100
}

/**
 * Get the Die-rectors as NPCDefs
 */
function getPantheonNPCs(): NPCDef[] {
  return ALL_NPCS.filter(n => n.category === 'pantheon' && n.domain);
}

/**
 * Generate prophecy text based on Die-rector and domain conditions
 */
function generateProphecy(rng: SeededRng, dieRector: NPCDef, dayKey: string): string {
  const prophecies: Record<string, string[]> = {
    'the-one': [
      'The newcomer approaches the final door.',
      'All threads converge. The null awaits.',
      'When the dice fall silent, we shall speak.',
      'The probability collapses. Soon.',
    ],
    'john': [
      'The machine requires maintenance. Blood or oil.',
      'Efficiency approaches maximum. Then, the breakdown.',
      'Gears turn. Someone will be ground.',
      'The optimizer becomes the optimized.',
    ],
    'peter': [
      'The ledger fills. Judgment approaches for all.',
      'A debt comes due that cannot be paid.',
      'The gate opens soon. Few will pass.',
      'I have marked a name. They do not know.',
    ],
    'robert': [
      'Fire cleanses. Fire creates. Fire consumes.',
      'A great trial by flame approaches.',
      'The forge heats. Who will be remade?',
      'Passion will burn something precious.',
    ],
    'alice': [
      'Time bends. Yesterday will become tomorrow.',
      'The frost creeps forward. Patience rewards.',
      'I have seen this moment before. And after.',
      'Ice preserves what fire destroys.',
    ],
    'jane': [
      'Chaos stirs! Something beautiful will break!',
      'The dice refuse their usual faces.',
      'Normal ends. Strange begins. Wonderful!',
      'Roll the bones! Everything changes!',
    ],
    'rhea': [
      'The crown crystallizes. Inevitability sharpens.',
      'Bow or break. The choice comes soon.',
      'False prophets fall. True ones rise.',
      'The static hum grows louder.',
    ],
  };

  const options = prophecies[dieRector.slug] || ['The future is unclear.'];
  const idx = Math.floor(rng.random(`${dayKey}-prophecy-${dieRector.slug}`) * options.length);
  return options[idx];
}

/**
 * Generate a legendary ceelo narrative between Die-rectors
 */
function generateLegendaryCeelo(
  rng: SeededRng,
  p1: NPCDef,
  p2: NPCDef,
  dayKey: string
): { winner: string; narrative: string } {
  // Stakes are cosmic: domains, souls, probability itself
  const stakes = [
    'a mortal\'s fate',
    'a year of domain dominion',
    'the next thousand rolls',
    'a secret of the void',
    'the right to judge a soul',
  ];
  const stakeIdx = Math.floor(rng.random(`${dayKey}-legend-stake`) * stakes.length);
  const stake = stakes[stakeIdx];

  // Winner determined by random
  const winner = rng.random(`${dayKey}-legend-winner`) > 0.5 ? p1.slug : p2.slug;
  const winnerNPC = winner === p1.slug ? p1 : p2;
  const loserNPC = winner === p1.slug ? p2 : p1;

  const narrative = `${winnerNPC.name} defeats ${loserNPC.name} in a legendary game of ceelo. The stake: ${stake}. Reality shivers at the outcome.`;

  return { winner, narrative };
}

// ============================================
// Environment Helpers
// ============================================

const ALL_WEATHERS: Weather[] = ['clear', 'void-fog', 'dust-storm', 'death-chill', 'heat-wave', 'frost-wind', 'wild-gale'];
const NEUTRAL_LOCATIONS: GameLocation[] = ['hero-corps', 'back-alley', 'dying-saucer'];
const DOMAIN_LOCATIONS: GameLocation[] = ['heaven', 'earth', 'hell', 'sun', 'moon', 'elsewhere'];

// --setting dial: pin every day's location to a chosen hub or realm (null = dynamic).
// Valid values: hero-corps, dying-saucer, back-alley, sun, moon, earth, elsewhere, heaven, hell.
const VALID_SETTINGS: GameLocation[] = [...NEUTRAL_LOCATIONS, ...DOMAIN_LOCATIONS];
let FORCED_SETTING: GameLocation | null = null;

/**
 * Determine the day's weather (element-based)
 */
function rollDayWeather(rng: SeededRng, dayKey: string): Weather {
  const roll = rng.random(`${dayKey}-weather`);

  // 50% clear, 50% element-based weather
  if (roll < 0.5) return 'clear';

  // Pick a random element weather
  const elementWeathers: Weather[] = ['void-fog', 'dust-storm', 'death-chill', 'heat-wave', 'frost-wind', 'wild-gale'];
  const idx = Math.floor(rng.random(`${dayKey}-weather-type`) * elementWeathers.length);
  return elementWeathers[idx];
}

/**
 * Determine where a game happens
 * - Most games on neutral turf (HERO CORPS, back alley, the Dying Saucer)
 * - Sometimes at someone's domain (big advantage/disadvantage)
 * - Weather can bias toward domain locations
 */
function rollGameLocation(
  rng: SeededRng,
  key: string,
  p1LuckyDie: LuckyDie,
  p2LuckyDie: LuckyDie,
  weather: Weather
): GameLocation {
  const roll = rng.random(`${key}-location`);

  // 70% neutral ground
  if (roll < 0.7) {
    // Pick neutral location
    const neutralRoll = rng.random(`${key}-neutral`);
    if (neutralRoll < 0.6) return 'hero-corps';
    if (neutralRoll < 0.85) return 'back-alley';
    return 'dying-saucer';
  }

  // 30% someone's turf
  // Weather can bias toward matching domain
  const weatherDomain = getWeatherDomain(weather);

  // If weather matches a player's domain, more likely to go there
  const p1Domain = LUCKY_DIE_DOMAIN[p1LuckyDie];
  const p2Domain = LUCKY_DIE_DOMAIN[p2LuckyDie];

  if (weatherDomain && rng.random(`${key}-weather-bias`) < 0.6) {
    // Weather pulls toward its domain
    return weatherDomain;
  }

  // Otherwise, one player drags the other to their turf
  if (p1Domain && p2Domain) {
    // Both have domains - 50/50
    return rng.random(`${key}-turf-pick`) < 0.5 ? p1Domain : p2Domain;
  } else if (p1Domain) {
    return p1Domain;
  } else if (p2Domain) {
    return p2Domain;
  }

  // Neither has a domain, pick random domain location
  const domainIdx = Math.floor(rng.random(`${key}-random-domain`) * DOMAIN_LOCATIONS.length);
  return DOMAIN_LOCATIONS[domainIdx];
}

/**
 * Get the domain location that matches a weather type
 */
function getWeatherDomain(weather: Weather): GameLocation | null {
  switch (weather) {
    case 'void-fog': return 'heaven';
    case 'dust-storm': return 'earth';
    case 'death-chill': return 'hell';
    case 'heat-wave': return 'sun';
    case 'frost-wind': return 'moon';
    case 'wild-gale': return 'elsewhere';
    default: return null;
  }
}

/**
 * Check if a player is on their home turf
 */
function isHomeTurf(luckyDie: LuckyDie, location: GameLocation): boolean {
  if (luckyDie === 'all') return true;  // Board Room aligned with everything
  if (luckyDie === 'none') return false;  // No home turf
  return LUCKY_DIE_DOMAIN[luckyDie] === location;
}

/**
 * Check if a player is on enemy turf (opponent's domain)
 */
function isEnemyTurf(playerDie: LuckyDie, opponentDie: LuckyDie, location: GameLocation): boolean {
  const opponentDomain = LUCKY_DIE_DOMAIN[opponentDie];
  return opponentDomain === location && !isHomeTurf(playerDie, location);
}

/**
 * Get turf context for dialogue
 */
function getTurfContext(
  speakerDie: LuckyDie,
  targetDie: LuckyDie,
  location: GameLocation
): string {
  const speakerHome = isHomeTurf(speakerDie, location);
  const targetHome = isHomeTurf(targetDie, location);
  const neutral = NEUTRAL_LOCATIONS.includes(location);

  if (neutral) {
    return 'You\'re on neutral ground.';
  } else if (speakerHome && !targetHome) {
    return `This is YOUR turf. ${LOCATION_DESCRIPTIONS[location]} You have the advantage here.`;
  } else if (targetHome && !speakerHome) {
    return `You\'re on THEIR turf. ${LOCATION_DESCRIPTIONS[location]} They have the advantage here.`;
  } else if (speakerHome && targetHome) {
    return `Both of you call this place home. ${LOCATION_DESCRIPTIONS[location]}`;
  } else {
    return `Neither of you belong here. ${LOCATION_DESCRIPTIONS[location]}`;
  }
}

/**
 * Generate the day's environment
 */
function generateDayEnvironment(rng: SeededRng, day: number): DayEnvironment {
  const dayKey = `day-${day}`;
  const weather = rollDayWeather(rng, dayKey);

  // Dominant location - where most activity happens
  // Weather can pull activity toward its domain
  const weatherDomain = getWeatherDomain(weather);
  let dominantLocation: GameLocation;

  if (FORCED_SETTING) {
    // --setting dial pins the day's location
    dominantLocation = FORCED_SETTING;
  } else if (weatherDomain && rng.random(`${dayKey}-dominant-loc`) < 0.3) {
    // Weather pulls everyone toward that realm
    dominantLocation = weatherDomain;
  } else {
    // Default hub: HERO CORPS
    dominantLocation = 'hero-corps';
  }

  return {
    weather,
    dominantLocation,
    weatherDescription: WEATHER_DESCRIPTIONS[weather],
    locationDescription: LOCATION_DESCRIPTIONS[dominantLocation],
  };
}

// ============================================
// State Initialization
// ============================================

function initNPCState(npc: NPCDef): NPCState {
  return {
    slug: npc.slug,
    gold: 200 + Math.floor(Math.random() * 300), // 200-500 starting gold
    ceeloWins: 0,
    ceeloLosses: 0,
    currentStreak: 0,
    bestStreak: 0,
    worstStreak: 0,
    debtsOwed: new Map(),
    debtsOwedTo: new Map(),
    debtDaysOverdue: new Map(),
    lastBigWin: -1,
    lastBigLoss: -1,
    mood: 'neutral',
    presentToday: false,
    arrivedAt: '',
    // Copy base stats (these can change during simulation)
    stats: { ...npc.baseStats },
  };
}

function initPlayerState(): PlayerState {
  return {
    totalDeaths: 0,
    totalRescues: 0,
    debtsToNPCs: new Map(),
    highestAnte: 0,
    lastRunDay: -1,
    lastRunResult: null,
    rescuedBy: null,
    legendaryMoments: [],
    // Enhanced player profile
    profile: createPlayerProfile(),
    // Run tracking for story beats
    lastRunMinHP: 100,
    lastRunHPAfterBoss: 100,
    lastRunBossDefeated: false,
    lastRunLegendaryRolls: 0,
    lastRunItemsAcquired: [],
  };
}

// ============================================
// Ceelo Simulation
// ============================================

function rollCeelo(rng: SeededRng, key: string): { result: 'instant_win' | 'instant_loss' | 'point' | 'reroll'; point?: number } {
  const dice = [
    Math.floor(rng.random(`${key}-d1`) * 6) + 1,
    Math.floor(rng.random(`${key}-d2`) * 6) + 1,
    Math.floor(rng.random(`${key}-d3`) * 6) + 1,
  ].sort((a, b) => a - b);

  // 4-5-6 = instant win
  if (dice[0] === 4 && dice[1] === 5 && dice[2] === 6) return { result: 'instant_win' };
  // 1-2-3 = instant loss
  if (dice[0] === 1 && dice[1] === 2 && dice[2] === 3) return { result: 'instant_loss' };
  // Trips = instant win
  if (dice[0] === dice[1] && dice[1] === dice[2]) return { result: 'instant_win', point: dice[0] };
  // Pair = point is the odd one
  if (dice[0] === dice[1]) return { result: 'point', point: dice[2] };
  if (dice[1] === dice[2]) return { result: 'point', point: dice[0] };
  // No pair = reroll
  return { result: 'reroll' };
}

interface CeeloMatchInput {
  npc1: NPCDef;
  npc2: NPCDef;
  stake: number;
  location: GameLocation;
  weather: Weather;
  rng: SeededRng;
  matchKey: string;
}

interface CeeloMatchOutput {
  winner: string;
  loser: string;
  stake: number;
  description: string;
  location: GameLocation;
  winnerHomeTurf: boolean;
  loserHomeTurf: boolean;
  turfNarrative: string;
}

function playCeeloMatch(input: CeeloMatchInput): CeeloMatchOutput {
  const { npc1, npc2, stake, location, weather, rng, matchKey } = input;

  // Get stats for stat-based bonuses
  const p1Stats = npc1.baseStats;
  const p2Stats = npc2.baseStats;

  // Check turf advantages
  const p1Home = isHomeTurf(npc1.luckyDie, location);
  const p2Home = isHomeTurf(npc2.luckyDie, location);
  const p1Enemy = isEnemyTurf(npc1.luckyDie, npc2.luckyDie, location);
  const p2Enemy = isEnemyTurf(npc2.luckyDie, npc1.luckyDie, location);

  // Weather can also boost players aligned with that element
  const weatherDie = weather === 'void-fog' ? 'd4' :
                     weather === 'dust-storm' ? 'd6' :
                     weather === 'death-chill' ? 'd8' :
                     weather === 'heat-wave' ? 'd10' :
                     weather === 'frost-wind' ? 'd12' :
                     weather === 'wild-gale' ? 'd20' : null;

  const p1WeatherBoost = weatherDie && (npc1.luckyDie === weatherDie || npc1.luckyDie === 'all');
  const p2WeatherBoost = weatherDie && (npc2.luckyDie === weatherDie || npc2.luckyDie === 'all');

  let p1Roll = rollCeelo(rng, `${matchKey}-p1-1`);
  let p2Roll = rollCeelo(rng, `${matchKey}-p2-1`);

  // GRIT: Extra reroll attempts (0-4 bonus based on grit/25)
  const p1MaxRerolls = 5 + Math.floor(p1Stats.grit / 25);
  const p2MaxRerolls = 5 + Math.floor(p2Stats.grit / 25);

  let rerolls = 0;
  while (p1Roll.result === 'reroll' && rerolls < p1MaxRerolls) {
    p1Roll = rollCeelo(rng, `${matchKey}-p1-${rerolls + 2}`);
    rerolls++;
  }
  rerolls = 0;
  while (p2Roll.result === 'reroll' && rerolls < p2MaxRerolls) {
    p2Roll = rollCeelo(rng, `${matchKey}-p2-${rerolls + 2}`);
    rerolls++;
  }

  // Apply turf bonuses to points
  let p1Point = p1Roll.point || 0;
  let p2Point = p2Roll.point || 0;

  // Home turf: +1 effective point
  if (p1Home && p1Roll.result === 'point') p1Point += 1;
  if (p2Home && p2Roll.result === 'point') p2Point += 1;

  // RESILIENCE: High resilience (>60) ignores enemy turf penalty
  if (p1Enemy && p1Roll.result === 'point' && p1Stats.resilience <= 60) {
    p1Point = Math.max(1, p1Point - 1);
  }
  if (p2Enemy && p2Roll.result === 'point' && p2Stats.resilience <= 60) {
    p2Point = Math.max(1, p2Point - 1);
  }

  // Weather boost: reroll losing dice once
  if (p1WeatherBoost && p1Roll.result === 'reroll') {
    p1Roll = rollCeelo(rng, `${matchKey}-p1-weather`);
    p1Point = p1Roll.point || 0;
  }
  if (p2WeatherBoost && p2Roll.result === 'reroll') {
    p2Roll = rollCeelo(rng, `${matchKey}-p2-weather`);
    p2Point = p2Roll.point || 0;
  }

  // ESSENCE: Chance to reroll a losing point (stat/200 = 0-50% chance)
  if (p1Roll.result === 'point' && p2Roll.result === 'point' && p1Point < p2Point) {
    if (rng.random(`${matchKey}-essence-p1`) < p1Stats.essence / 200) {
      p1Roll = rollCeelo(rng, `${matchKey}-p1-essence-reroll`);
      if (p1Roll.result === 'point') p1Point = p1Roll.point || 0;
      if (p1Home && p1Roll.result === 'point') p1Point += 1;
    }
  }
  if (p2Roll.result === 'point' && p1Roll.result === 'point' && p2Point < p1Point) {
    if (rng.random(`${matchKey}-essence-p2`) < p2Stats.essence / 200) {
      p2Roll = rollCeelo(rng, `${matchKey}-p2-essence-reroll`);
      if (p2Roll.result === 'point') p2Point = p2Roll.point || 0;
      if (p2Home && p2Roll.result === 'point') p2Point += 1;
    }
  }

  // Determine winner
  let winner: string;
  let description: string;

  // FURY: Bonus effectiveness on instant wins (fury > 70)
  if (p1Roll.result === 'instant_win' && p2Roll.result !== 'instant_win') {
    winner = npc1.slug;
    description = p1Stats.fury > 70 ? 'instant win (fury!)' : 'instant win';
  } else if (p2Roll.result === 'instant_win' && p1Roll.result !== 'instant_win') {
    winner = npc2.slug;
    description = p2Stats.fury > 70 ? 'instant win (fury!)' : 'instant win';
  } else if (p1Roll.result === 'instant_loss') {
    winner = npc2.slug;
    description = '1-2-3 loss';
  } else if (p2Roll.result === 'instant_loss') {
    winner = npc1.slug;
    description = '1-2-3 loss';
  } else {
    // FURY: +1 effective point when winning by points (fury > 70)
    let p1EffectivePoint = p1Point;
    let p2EffectivePoint = p2Point;
    if (p1Stats.fury > 70 && p1Point > p2Point) p1EffectivePoint += 1;
    if (p2Stats.fury > 70 && p2Point > p1Point) p2EffectivePoint += 1;

    if (p1EffectivePoint > p2EffectivePoint) {
      winner = npc1.slug;
      const furyNote = p1Stats.fury > 70 ? ' (fury!)' : '';
      const turfNote = p1Home ? ' (home turf)' : p2Enemy ? ' (enemy territory)' : '';
      description = `point ${p1Roll.point}${furyNote}${turfNote} vs ${p2Roll.point}`;
    } else if (p2EffectivePoint > p1EffectivePoint) {
      winner = npc2.slug;
      const furyNote = p2Stats.fury > 70 ? ' (fury!)' : '';
      const turfNote = p2Home ? ' (home turf)' : p1Enemy ? ' (enemy territory)' : '';
      description = `point ${p2Roll.point}${furyNote}${turfNote} vs ${p1Roll.point}`;
    } else {
      // Tie resolution with SHADOW and SWIFTNESS bonuses
      // SHADOW: Tiebreaker bonus (shadow/100 = 0-1 effective advantage)
      const p1Shadow = p1Stats.shadow / 100;
      const p2Shadow = p2Stats.shadow / 100;
      // SWIFTNESS: Win ties if swiftness > opponent by 20+
      const swiftAdvantage = p1Stats.swiftness - p2Stats.swiftness;

      if (p1Home && !p2Home) {
        winner = npc1.slug;
        description = 'tiebreaker (home turf)';
      } else if (p2Home && !p1Home) {
        winner = npc2.slug;
        description = 'tiebreaker (home turf)';
      } else if (swiftAdvantage >= 20) {
        winner = npc1.slug;
        description = 'tiebreaker (swiftness)';
      } else if (swiftAdvantage <= -20) {
        winner = npc2.slug;
        description = 'tiebreaker (swiftness)';
      } else if (p1Shadow > p2Shadow + 0.2) {
        winner = npc1.slug;
        description = 'tiebreaker (shadow)';
      } else if (p2Shadow > p1Shadow + 0.2) {
        winner = npc2.slug;
        description = 'tiebreaker (shadow)';
      } else {
        winner = rng.random(`${matchKey}-tiebreak`) > 0.5 ? npc1.slug : npc2.slug;
        description = 'tiebreaker';
      }
    }
  }

  const loser = winner === npc1.slug ? npc2.slug : npc1.slug;
  const winnerHome = winner === npc1.slug ? p1Home : p2Home;
  const loserHome = winner === npc1.slug ? p2Home : p1Home;

  // Build turf narrative
  let turfNarrative = '';
  const neutral = NEUTRAL_LOCATIONS.includes(location);
  if (neutral) {
    turfNarrative = `at ${location.replace('-', ' ')}`;
  } else if (winnerHome) {
    turfNarrative = `on ${ALL_NPCS.find(n => n.slug === winner)?.name}'s home turf`;
  } else if (loserHome) {
    turfNarrative = `in ${ALL_NPCS.find(n => n.slug === loser)?.name}'s territory`;
  } else {
    turfNarrative = `at ${location.replace('-', ' ')}`;
  }

  return {
    winner,
    loser,
    stake,
    description,
    location,
    winnerHomeTurf: winnerHome,
    loserHomeTurf: loserHome,
    turfNarrative,
  };
}

// ============================================
// Pantheon Weekly Simulation
// ============================================

/**
 * Simulate a week of Pantheon activity (separate from mortal track)
 * Called once per 7 days of mortal simulation
 */
function simulatePantheonWeek(
  weekNumber: number,
  startDay: number,
  rng: SeededRng
): PantheonWeekState {
  const weekKey = `pantheon-week-${weekNumber}`;
  const events: PantheonWeekEvent[] = [];
  const prophecies: string[] = [];

  // Domain conditions shift each week
  const conditions: Record<string, 'stable' | 'turbulent' | 'ascendant'> = {};
  const dieRectors = getPantheonNPCs();
  const conditionOptions: Array<'stable' | 'turbulent' | 'ascendant'> = ['stable', 'stable', 'stable', 'turbulent', 'ascendant'];

  for (const dr of dieRectors) {
    if (dr.domain) {
      const idx = Math.floor(rng.random(`${weekKey}-condition-${dr.slug}`) * conditionOptions.length);
      conditions[dr.domain] = conditionOptions[idx];
    }
  }

  // 1. Domain business (each Die-rector tends their domain once per week)
  for (const dr of dieRectors) {
    if (!dr.domain) continue;
    const dayInWeek = Math.floor(rng.random(`${weekKey}-business-${dr.slug}`) * 7);
    const day = startDay + dayInWeek;

    const condition = conditions[dr.domain] || 'stable';
    const businessText = condition === 'stable'
      ? `${dr.name} oversees ${dr.domain}. All is as it should be.`
      : condition === 'turbulent'
      ? `${dr.name} quells disturbances in ${dr.domain}. The domain strains.`
      : `${dr.name} basks in ${dr.domain}'s ascendance. Power flows freely.`;

    events.push({
      day,
      weekNumber,
      eventType: 'domain-business',
      participants: [dr.slug],
      text: businessText,
      location: dr.domain as GameLocation,
    });
  }

  // 2. Council meeting (2-4 Die-rectors who don't avoid each other)
  const councilRoll = rng.random(`${weekKey}-council`);
  if (councilRoll < 0.4) { // 40% chance of council
    // Pick a starting Die-rector
    const firstIdx = Math.floor(rng.random(`${weekKey}-council-first`) * dieRectors.length);
    const first = dieRectors[firstIdx];

    // Find compatible Die-rectors
    const compatible = dieRectors.filter(dr =>
      dr.slug !== first.slug && wouldPantheonGather(first.slug, dr.slug)
    );

    if (compatible.length >= 1) {
      const councilSize = Math.min(compatible.length, 1 + Math.floor(rng.random(`${weekKey}-council-size`) * 3));
      const council = [first, ...compatible.slice(0, councilSize)];

      const councilDay = startDay + Math.floor(rng.random(`${weekKey}-council-day`) * 7);
      const councilTopics = [
        'discuss the newcomer\'s progress',
        'deliberate on domain boundaries',
        'weigh the balance of probability',
        'observe mortal follies from afar',
      ];
      const topicIdx = Math.floor(rng.random(`${weekKey}-council-topic`) * councilTopics.length);

      events.push({
        day: councilDay,
        weekNumber,
        eventType: 'council-meeting',
        participants: council.map(c => c.slug),
        text: `${council.map(c => c.name).join(', ')} gather to ${councilTopics[topicIdx]}.`,
        location: first.domain as GameLocation || 'heaven',
      });
    }
  }

  // 3. Prophecy (one Die-rector delivers a cryptic message)
  const prophecyRoll = rng.random(`${weekKey}-prophecy`);
  if (prophecyRoll < 0.3) { // 30% chance
    const prophetIdx = Math.floor(rng.random(`${weekKey}-prophet`) * dieRectors.length);
    const prophet = dieRectors[prophetIdx];
    const prophecy = generateProphecy(rng, prophet, weekKey);

    const prophecyDay = startDay + Math.floor(rng.random(`${weekKey}-prophecy-day`) * 7);
    events.push({
      day: prophecyDay,
      weekNumber,
      eventType: 'prophecy',
      participants: [prophet.slug],
      text: `${prophet.name} speaks: "${prophecy}"`,
      location: prophet.domain as GameLocation || 'heaven',
      prophecy,
    });
    prophecies.push(`Week ${weekNumber}, ${prophet.name}: ${prophecy}`);
  }

  // 4. Legendary ceelo (very rare: 5% chance per week)
  const legendaryRoll = rng.random(`${weekKey}-legendary`);
  if (legendaryRoll < 0.05) {
    // Pick two Die-rectors who would actually gamble together
    const eligiblePairs: Array<[NPCDef, NPCDef]> = [];
    for (let i = 0; i < dieRectors.length; i++) {
      for (let j = i + 1; j < dieRectors.length; j++) {
        if (wouldPantheonGather(dieRectors[i].slug, dieRectors[j].slug)) {
          eligiblePairs.push([dieRectors[i], dieRectors[j]]);
        }
      }
    }

    if (eligiblePairs.length > 0) {
      const pairIdx = Math.floor(rng.random(`${weekKey}-legendary-pair`) * eligiblePairs.length);
      const [p1, p2] = eligiblePairs[pairIdx];
      const { narrative } = generateLegendaryCeelo(rng, p1, p2, weekKey);

      const legendDay = startDay + Math.floor(rng.random(`${weekKey}-legendary-day`) * 7);
      events.push({
        day: legendDay,
        weekNumber,
        eventType: 'legendary-ceelo',
        participants: [p1.slug, p2.slug],
        text: narrative,
        location: p1.domain as GameLocation || 'heaven',
      });
    }
  }

  // 5. Domain weather manifestation
  const weatherRoll = rng.random(`${weekKey}-domain-weather`);
  if (weatherRoll < 0.25) { // 25% chance
    const sourceIdx = Math.floor(rng.random(`${weekKey}-weather-source`) * dieRectors.length);
    const source = dieRectors[sourceIdx];
    const weatherTypes: Record<string, string> = {
      'heaven': 'void-fog',
      'earth': 'dust-storm',
      'hell': 'death-chill',
      'sun': 'heat-wave',
      'moon': 'frost-wind',
      'elsewhere': 'wild-gale',
    };
    const weather = weatherTypes[source.domain || ''] || 'clear';

    const weatherDay = startDay + Math.floor(rng.random(`${weekKey}-weather-day`) * 7);
    events.push({
      day: weatherDay,
      weekNumber,
      eventType: 'domain-weather',
      participants: [source.slug],
      text: `${source.name}'s domain pulses. ${weather.replace('-', ' ')} spreads to the mortal realm.`,
      location: source.domain as GameLocation || 'hero-corps',
    });
  }

  return {
    weekNumber,
    events,
    prophecies,
    domainConditions: conditions,
  };
}

/**
 * Handle a mythic crossover event (1 in 100 days)
 * A Die-rector briefly appears on the HERO CORPS floor
 */
function generateCrossoverEvent(
  day: number,
  rng: SeededRng,
  npcStates: Map<string, NPCState>
): DayEvent | null {
  const dayKey = `day-${day}`;
  const dieRectors = getPantheonNPCs().filter(dr => !dr.silentCharacter);

  if (dieRectors.length === 0) return null;

  const drIdx = Math.floor(rng.random(`${dayKey}-crossover-dr`) * dieRectors.length);
  const dieRector = dieRectors[drIdx];

  // Pick a mortal to interact with
  const mortals = ALL_NPCS.filter(n => n.category !== 'pantheon' && npcStates.get(n.slug)?.presentToday);
  if (mortals.length === 0) return null;

  const mortalIdx = Math.floor(rng.random(`${dayKey}-crossover-mortal`) * mortals.length);
  const mortal = mortals[mortalIdx];

  // Generate the crossover narrative
  const narratives = [
    `${dieRector.name} materializes at ${mortal.name}'s stall. Reality bends. Words are exchanged. ${mortal.name} will not speak of what was said.`,
    `The air splits. ${dieRector.name} passes through the HERO CORPS floor. ${mortal.name} catches their eye. Time freezes. Then resumes.`,
    `${mortal.name} looks up to find ${dieRector.name} standing there. "I have been watching," they say. Then they are gone.`,
    `${dieRector.name} walks among mortals today. ${mortal.name} is the only one who notices. They share a look that speaks volumes.`,
  ];
  const narrativeIdx = Math.floor(rng.random(`${dayKey}-crossover-narrative`) * narratives.length);

  return {
    day,
    phase: 'midday',
    type: 'lore',
    participants: [dieRector.slug, mortal.slug],
    text: narratives[narrativeIdx],
    isClaudeGenerated: false,
    location: 'hero-corps',
  };
}

// ============================================
// Player Run Simulation
// ============================================

function simulatePlayerRun(
  playerState: PlayerState,
  npcStates: Map<string, NPCState>,
  day: number,
  rng: SeededRng
): { result: 'win' | 'death' | 'flume'; ante: number; rescuer?: string; description: string } {
  const runKey = `run-day${day}`;

  // Determine how far they get
  const roll = rng.random(`${runKey}-result`);
  let ante = 1;
  let result: 'win' | 'death' | 'flume';
  let description: string;
  let rescuer: string | undefined;

  // Simulate run details for story beat detection
  const minHP = Math.floor(rng.random(`${runKey}-minhp`) * 100);
  const legendaryRolls = rng.random(`${runKey}-legendary`) < 0.1 ? 1 : 0;
  const itemsAcquired: string[] = [];

  // Simulate item pickups
  const itemCount = Math.floor(rng.random(`${runKey}-items`) * 4);
  for (let i = 0; i < itemCount; i++) {
    const itemTypes = ['meteor-core', 'shield-rune', 'chaos-orb', 'healing-salve', 'iron-dice'];
    itemsAcquired.push(itemTypes[Math.floor(rng.random(`${runKey}-item${i}`) * itemTypes.length)]);
  }

  let bossDefeated = false;
  let hpAfterBoss = 100;

  if (roll < 0.15) {
    // Full clear (rare)
    ante = 3;
    result = 'win';
    bossDefeated = true;
    hpAfterBoss = Math.floor(rng.random(`${runKey}-bosshp`) * 60) + 20;
    description = 'completed all 3 antes';
    if (ante > playerState.highestAnte) {
      playerState.highestAnte = ante;
      playerState.legendaryMoments.push(`Day ${day}: First full clear!`);
    }
  } else if (roll < 0.35) {
    // Flume out
    ante = Math.floor(rng.random(`${runKey}-ante`) * 3) + 1;
    result = 'flume';
    description = `flumed home from ante ${ante}`;
  } else {
    // Death
    const deathRoll = rng.random(`${runKey}-death-ante`);
    if (deathRoll < 0.3) ante = 1;
    else if (deathRoll < 0.7) ante = 2;
    else ante = 3;

    result = 'death';
    playerState.totalDeaths++;

    // Pick a rescuer (wanderer or traveler, not pantheon)
    const rescuers = ALL_NPCS.filter(n => n.category !== 'pantheon');
    const rescuerNPC = rescuers[Math.floor(rng.random(`${runKey}-rescuer`) * rescuers.length)];
    rescuer = rescuerNPC.slug;
    playerState.totalRescues++;
    playerState.rescuedBy = rescuer;

    // Add debt
    const debtAmount = 50 + ante * 25;
    const currentDebt = playerState.debtsToNPCs.get(rescuer) || 0;
    playerState.debtsToNPCs.set(rescuer, currentDebt + debtAmount);

    description = `died on ante ${ante}, rescued by ${rescuerNPC.name}`;

    if (ante > playerState.highestAnte) {
      playerState.highestAnte = ante;
    }
  }

  playerState.lastRunDay = day;
  playerState.lastRunResult = result;

  // Store run details for story beat detection
  playerState.lastRunMinHP = minHP;
  playerState.lastRunHPAfterBoss = hpAfterBoss;
  playerState.lastRunBossDefeated = bossDefeated;
  playerState.lastRunLegendaryRolls = legendaryRolls;
  playerState.lastRunItemsAcquired = itemsAcquired;

  // Create ProfileRunResult for story beat detection
  const profileResult: ProfileRunResult = {
    survived: result === 'win',
    domainReached: ante * 2, // Map ante 1-3 to domain 2-6
    roomsCleared: ante * 3,
    finalScore: ante * 100,
    minHP,
    hpAfterBoss: bossDefeated ? hpAfterBoss : undefined,
    bossDefeated,
    itemsAcquired,
    itemsLost: result === 'death' ? itemsAcquired.slice(0, 1) : [],
    goldEarned: ante * 50,
    goldSpent: ante * 20,
    rescuers: rescuer ? [{ npc: rescuer, cost: 50 + ante * 25 }] : [],
    legendaryRolls,
    perfectSynergies: [],
  };

  // Detect story beats
  const newBeats = detectStoryBeats(profileResult, playerState.profile, day);

  // Update player profile
  playerState.profile = updatePlayerProfile(playerState.profile, profileResult, newBeats);

  // Decay existing story beats
  playerState.profile.storyBeats = updateStoryBeats(playerState.profile.storyBeats, day);

  // Sync debts to profile
  for (const [npcSlug, debt] of playerState.debtsToNPCs) {
    playerState.profile.debtsTo[npcSlug] = debt;
  }

  return { result, ante, rescuer, description };
}

// ============================================
// Claude Integration
// ============================================

function buildEternalContext(
  day: number,
  speaker: NPCDef,
  target: NPCDef,
  npcStates: Map<string, NPCState>,
  playerState: PlayerState,
  pool: string,
  situation: string,
  environment: DayEnvironment,
  gameLocation?: GameLocation,
  scene?: string
): string {
  const speakerState = npcStates.get(speaker.slug)!;
  const targetState = npcStates.get(target.slug)!;

  const isRival = speaker.rivals.includes(target.slug);
  const isAlly = speaker.allies.includes(target.slug);

  // Build debt context
  const speakerOwesTarget = speakerState.debtsOwed.get(target.slug) || 0;
  const targetOwesSpeaker = speakerState.debtsOwedTo.get(target.slug) || 0;
  let debtContext = '';
  if (speakerOwesTarget > 0) {
    const days = speakerState.debtDaysOverdue.get(target.slug) || 0;
    debtContext = `\nYou owe ${target.name} ${speakerOwesTarget} gold${days > 0 ? ` (${days} days overdue)` : ''}.`;
  }
  if (targetOwesSpeaker > 0) {
    debtContext += `\n${target.name} owes YOU ${targetOwesSpeaker} gold.`;
  }

  // Player profile context - archetype, story beats, debt tension
  const playerDebtToSpeaker = playerState.debtsToNPCs.get(speaker.slug) || 0;
  const debtTension = getDebtTensionForNPC(playerState.profile.debtsTo, speaker.slug);

  let playerContext = '';

  // Archetype-based observation
  const archetype = playerState.profile.archetype;
  if (archetype !== 'balanced') {
    const archetypeDescriptions: Record<PlayerArchetype, string> = {
      aggressive: 'plays fast and risky, always pushing for damage',
      defensive: 'plays carefully, hoards healing items, rarely dies',
      chaotic: 'unpredictable, loves rerolls and chaos orbs',
      balanced: '',
    };
    playerContext += `\nYou've noticed the newcomer ${archetypeDescriptions[archetype]}.`;
  }

  // Debt with escalating tension
  if (playerDebtToSpeaker > 0) {
    const tensionPhrases: Record<DebtTension, string> = {
      none: '',
      minor: `The newcomer owes you ${playerDebtToSpeaker} gold. Just a small matter.`,
      notable: `The newcomer owes you ${playerDebtToSpeaker} gold. Getting significant.`,
      threatening: `The newcomer owes you ${playerDebtToSpeaker} gold. This debt WILL be addressed.`,
    };
    playerContext += `\n${tensionPhrases[debtTension] || tensionPhrases.minor}`;
  }

  // Recent story beats - memorable moments to reference
  const recentBeats = playerState.profile.storyBeats.filter(b => b.weight > 0.5);
  if (recentBeats.length > 0) {
    const beatDescriptions: Record<string, string> = {
      'close-call': 'barely survived a recent run with almost no health',
      'crushing-victory': 'dominated a boss recently, barely took damage',
      'betrayed-by-rng': 'died to terrible luck despite good preparation',
      'perfect-synergy': 'pulled off an amazing item combo recently',
      'comeback-king': 'came back from near death to win',
      'streak-breaker': 'just broke a long streak',
      'first-clear': 'reached a new personal best domain',
      'legendary-roll': 'rolled something incredible recently',
      'debt-spiral': 'keeps dying and racking up debts everywhere',
    };
    const topBeat = recentBeats[0];
    if (beatDescriptions[topBeat.type]) {
      playerContext += `\nRecently, the newcomer ${beatDescriptions[topBeat.type]}.`;
    }
  }

  // Today's run result
  if (playerState.lastRunDay === day) {
    playerContext += `\nToday: The newcomer ${playerState.lastRunResult === 'death' ? `died and was rescued by ${playerState.rescuedBy}` : playerState.lastRunResult === 'win' ? 'completed a full run!' : 'flumed home early'}.`;
  }

  // Mood and streak context
  let moodContext = '';
  if (speakerState.mood === 'hot') moodContext = '\nYou\'re on a hot streak. Feeling invincible.';
  else if (speakerState.mood === 'cold') moodContext = '\nYou\'ve been losing. Trying to stay composed.';
  else if (speakerState.mood === 'tilted') moodContext = '\nYou\'re TILTED. Bad beat after bad beat. Barely holding it together.';
  else if (speakerState.mood === 'smug') moodContext = '\nYou just won big. Feeling superior.';

  const relationshipContext = isRival
    ? `\n${target.name} is your RIVAL. There's tension. Be snippy or confrontational.`
    : isAlly
    ? `\n${target.name} is your ALLY. You look out for each other.`
    : '';

  // Visual tells for richer characterization
  const visualContext = speaker.visualTells.length > 0
    ? `\nVISUAL TELLS (how you look/move): ${speaker.visualTells.join('; ')}`
    : '';

  // Domain context for pantheon
  const domainContext = speaker.domain
    ? `\nYour domain: ${speaker.domain}`
    : '';

  // Environment context
  const weatherContext = environment.weather !== 'clear'
    ? `\nWEATHER: ${environment.weatherDescription}`
    : '';

  // Location/turf context. If the King is in the conversation, it happens at
  // the Sun regardless of the day's dominant location - he cannot leave, so
  // no fluorescent-hallway small talk with James (reconciliation #10).
  const locationToUse = (speaker.slug === 'king-james' || target.slug === 'king-james')
    ? 'sun'
    : (gameLocation || environment.dominantLocation);
  const turfContext = getTurfContext(speaker.luckyDie, target.luckyDie, locationToUse);
  let locationContext = `\nLOCATION: ${turfContext}`;

  // Canon: King James never leaves the throne. Games against him happen at the
  // Sun, Maxwell handles the King's dice (and sometimes plays a hand of his
  // own), and guests hate making the trip.
  if (speaker.slug === 'king-james' || target.slug === 'king-james') {
    locationContext += speaker.slug === 'king-james'
      ? `\nCANON: You are bound to your throne. Maxwell rolls your dice for you; sometimes you let him play a hand of his own. Your guests came to the Sun because they had to, and you know they hate it here.`
      : `\nCANON: King James cannot leave his throne, so you came to the Sun to play - and you hate it here (the corona, the exposure, the King's scale). Maxwell rolls the King's dice for him.`;
  }

  return `You are ${speaker.name}, ${speaker.title} - an immortal ${speaker.category} in NEVER DIE GUY.
You've spent a long time inside HERO CORPS and around the Dying Saucer, alongside other immortals. The newcomer (Never Die Guy) is the unnamed recruit who cannot stay dead and keeps coming back.

DAY ${day} OF ETERNITY

VOICE: ${speaker.voice}
PERSONALITY: ${speaker.personality}
QUIRKS: ${speaker.quirks.join(', ')}${visualContext}
CATCHPHRASES (use occasionally): ${speaker.catchphrases.length > 0 ? speaker.catchphrases.map(p => `"${p}"`).join(', ') : 'none'}
OBSESSIONS: ${speaker.obsessions.join(', ')}
LUCKY DIE: ${speaker.luckyDie === 'none' ? 'None (outside the system)' : speaker.luckyDie.toUpperCase()}
SURVIVAL STATS: Essence ${speaker.baseStats.essence} | Grit ${speaker.baseStats.grit} | Shadow ${speaker.baseStats.shadow} | Fury ${speaker.baseStats.fury} | Resilience ${speaker.baseStats.resilience} | Swiftness ${speaker.baseStats.swiftness}${domainContext}${weatherContext}${locationContext}
${relationshipContext}${debtContext}${moodContext}${playerContext}

YOUR STATS:
- Gold: ${speakerState.gold}
- Ceelo record: ${speakerState.ceeloWins}W-${speakerState.ceeloLosses}L
- Current streak: ${speakerState.currentStreak > 0 ? `${speakerState.currentStreak} wins` : speakerState.currentStreak < 0 ? `${Math.abs(speakerState.currentStreak)} losses` : 'even'}

SITUATION: ${situation}${scene ? `
SCENE: ${scene}. Let the setting color the exchange - who can leave, who cannot, what the fluorescent grid does to a conversation.` : ''}

Speaking to ${target.name}, ${target.title} (${target.personality}).
Their mood: ${targetState.mood}
Their record: ${targetState.ceeloWins}W-${targetState.ceeloLosses}L

RULES:
- Respond as ${speaker.name} with ONE response (1-3 SHORT sentences)
- ALWAYS complete your sentences - never trail off
- Stay in character - use your VOICE and QUIRKS
- Reference debts, streaks, or the newcomer if relevant
- Be punchy and flavorful, not generic
- NO quotes around your response
- NO asterisks, NO action text, NO *italics*
- Just dialogue - what you SAY, not what you do

STYLE (house rules - follow strictly):
- NEVER use em dashes. Use commas, periods, or a plain hyphen instead
- At most ONE punchline per response. Plain talk does the rest
- Avoid the shape "that's not X, that's Y" / "X is not Y, it is Z" - it reads as wallpaper when every character does it
- Keep the noun, keep the verb, cut the smoke: concrete words over ornate ones
- No trailer voice, no ornate prophecy, no cosmic filler`;
}

// Default model - can be overridden via --model flag or CLAUDE_MODEL env var
// (claude-3-5-haiku was retired 2026-02; haiku-4-5 is the drop-in replacement)
let CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5';

// Log each distinct API failure once - a silent generateWithClaude=null across a
// whole run looks identical to "no dialogue happened" and cost us two runs.
const loggedApiErrors = new Set<string>();

async function generateWithClaude(
  prompt: string,
  tokens: number,
  apiKey: string,
  retries = 2
): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: tokens,
          // NOTE: no `temperature` - the Claude 5 family (claude-sonnet-5 etc.)
          // rejects sampling params with a 400. Variety comes from the prompts.
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        const errKey = `${response.status}:${errBody.slice(0, 120)}`;
        if (!loggedApiErrors.has(errKey)) {
          loggedApiErrors.add(errKey);
          console.error(`\nClaude API error ${response.status} (model=${CLAUDE_MODEL}): ${errBody.slice(0, 300)}`);
        }
        // 4xx = our request is wrong; retrying the same body cannot succeed
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          return null;
        }
        if (attempt < retries) {
          // Exponential backoff: 1s, 2s
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        return null;
      }

      const data = await response.json();
      // Sonnet 5 runs adaptive thinking by default: complex prompts return a
      // thinking block FIRST, so content[0].text is undefined. Find the text
      // block instead of assuming position 0.
      let text: string | null =
        data.content?.find((b: { type: string }) => b.type === 'text')?.text || null;

      // If the model hit max_tokens the line is clipped mid-sentence; trim back
      // to the last complete sentence so truncated fragments never reach the
      // diary or the extracted chatbase templates. No boundary = discard.
      if (text && data.stop_reason === 'max_tokens') {
        const lastStop = Math.max(
          text.lastIndexOf('.'), text.lastIndexOf('!'), text.lastIndexOf('?'));
        text = lastStop > 0 ? text.slice(0, lastStop + 1) : null;
      }

      if (text) {
        return text
          .replace(/^["']|["']$/g, '')
          .replace(/^\*.*\*\s*/g, '')
          .replace(/\s*[—–]\s*/g, ' - ')  // house style: no em/en dashes
          .trim();
      }
      return null;
    } catch {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      return null;
    }
  }
  return null;
}

// ============================================
// Day Simulation
// ============================================

async function simulateDay(
  day: number,
  npcStates: Map<string, NPCState>,
  playerState: PlayerState,
  rng: SeededRng,
  options: {
    useClaude: boolean;
    apiKey: string;
    verbose: boolean;
    extractTemplates: boolean;
  }
): Promise<DiaryEntry> {
  const events: DayEvent[] = [];
  const highlights: string[] = [];
  const ceeloResults: CeeloMatchResult[] = [];

  const dayKey = `day-${day}`;

  // Generate today's environment
  const environment = generateDayEnvironment(rng, day);

  // Reset daily presence
  for (const [, state] of npcStates) {
    state.presentToday = false;
    state.arrivedAt = '';
  }

  // ========== DAWN - Arrivals ==========
  const phases: Array<'dawn' | 'morning' | 'midday' | 'arena' | 'evening' | 'night'> =
    ['dawn', 'morning', 'midday', 'arena', 'evening', 'night'];

  for (const npc of ALL_NPCS) {
    const state = npcStates.get(npc.slug)!;
    let arrives = false;
    let arrivalPhase: typeof phases[number] = 'dawn';

    // Pantheon rarely appears
    if (npc.category === 'pantheon') {
      arrives = rng.random(`${dayKey}-${npc.slug}-appear`) < 0.05; // 5% chance
      arrivalPhase = 'midday';
    } else if (npc.arrivalTime === 'early') {
      arrives = rng.random(`${dayKey}-${npc.slug}-appear`) < 0.9;
      arrivalPhase = 'dawn';
    } else if (npc.arrivalTime === 'mid') {
      arrives = rng.random(`${dayKey}-${npc.slug}-appear`) < 0.85;
      arrivalPhase = 'morning';
    } else if (npc.arrivalTime === 'late') {
      arrives = rng.random(`${dayKey}-${npc.slug}-appear`) < 0.8;
      arrivalPhase = 'midday';
    } else {
      arrives = rng.random(`${dayKey}-${npc.slug}-appear`) < 0.7;
      const phaseRoll = rng.random(`${dayKey}-${npc.slug}-phase`);
      if (phaseRoll < 0.3) arrivalPhase = 'dawn';
      else if (phaseRoll < 0.6) arrivalPhase = 'morning';
      else arrivalPhase = 'midday';
    }

    if (arrives) {
      state.presentToday = true;
      state.arrivedAt = arrivalPhase;
    }
  }

  const presentNPCs = ALL_NPCS.filter(n => npcStates.get(n.slug)!.presentToday);

  // Dawn arrival text includes weather
  const weatherNote = environment.weather !== 'clear'
    ? ` ${environment.weatherDescription}`
    : '';

  events.push({
    day,
    phase: 'dawn',
    type: 'arrival',
    participants: presentNPCs.map(n => n.slug),
    text: `${presentNPCs.length} souls gather today.${weatherNote}`,
    isClaudeGenerated: false,
    location: environment.dominantLocation,
  });

  // ========== MORNING - Ceelo Rounds ==========
  const morningNPCs = presentNPCs.filter(n =>
    ['dawn', 'morning'].includes(npcStates.get(n.slug)!.arrivedAt) &&
    n.category !== 'pantheon'
  );

  const numMatches = Math.min(Math.floor(morningNPCs.length / 2), 3 + Math.floor(rng.random(`${dayKey}-matches`) * 3));

  for (let m = 0; m < numMatches; m++) {
    const available = morningNPCs.filter(n => {
      const state = npcStates.get(n.slug)!;
      return state.gold >= 50; // Need gold to play
    });
    if (available.length < 2) break;

    const p1Idx = Math.floor(rng.random(`${dayKey}-m${m}-p1`) * available.length);
    const p1 = available[p1Idx];
    const remaining = available.filter((_, i) => i !== p1Idx);
    const p2Idx = Math.floor(rng.random(`${dayKey}-m${m}-p2`) * remaining.length);
    const p2 = remaining[p2Idx];

    const p1State = npcStates.get(p1.slug)!;
    const p2State = npcStates.get(p2.slug)!;

    const stake = Math.min(
      Math.min(p1State.gold, p2State.gold),
      20 + Math.floor(rng.random(`${dayKey}-m${m}-stake`) * 80)
    );

    // Determine game location
    let matchLocation = rollGameLocation(rng, `${dayKey}-m${m}`, p1.luckyDie, p2.luckyDie, environment.weather);

    // Canon: King James is bound to his throne in the corona. Anyone who wants
    // a game comes to the Sun, and Maxwell rolls the dice on the King's behalf.
    if (p1.slug === 'king-james' || p2.slug === 'king-james') matchLocation = 'sun';

    const match = playCeeloMatch({
      npc1: p1,
      npc2: p2,
      stake,
      location: matchLocation,
      weather: environment.weather,
      rng,
      matchKey: `${dayKey}-m${m}`,
    });

    const winnerState = npcStates.get(match.winner)!;
    const loserState = npcStates.get(match.loser)!;
    const winnerNPC = ALL_NPCS.find(n => n.slug === match.winner)!;
    const loserNPC = ALL_NPCS.find(n => n.slug === match.loser)!;

    winnerState.gold += stake;
    loserState.gold -= stake;
    winnerState.ceeloWins++;
    loserState.ceeloLosses++;

    // Update streaks
    if (winnerState.currentStreak >= 0) winnerState.currentStreak++;
    else winnerState.currentStreak = 1;
    if (loserState.currentStreak <= 0) loserState.currentStreak--;
    else loserState.currentStreak = -1;

    winnerState.bestStreak = Math.max(winnerState.bestStreak, winnerState.currentStreak);
    loserState.worstStreak = Math.min(loserState.worstStreak, loserState.currentStreak);

    // Update moods
    if (winnerState.currentStreak >= 3) winnerState.mood = 'hot';
    else if (stake >= 50) winnerState.mood = 'smug';
    else winnerState.mood = 'neutral';

    if (loserState.currentStreak <= -3) loserState.mood = 'tilted';
    else if (loserState.currentStreak <= -2) loserState.mood = 'cold';
    else loserState.mood = 'neutral';

    // Track big wins/losses
    if (stake >= 50) {
      winnerState.lastBigWin = day;
      loserState.lastBigLoss = day;
    }

    // Handle debt if loser is broke
    if (loserState.gold < 0) {
      const debt = Math.abs(loserState.gold);
      loserState.gold = 0;
      loserState.debtsOwed.set(match.winner, (loserState.debtsOwed.get(match.winner) || 0) + debt);
      winnerState.debtsOwedTo.set(match.loser, (winnerState.debtsOwedTo.get(match.loser) || 0) + debt);
      loserState.debtDaysOverdue.set(match.winner, 0);
    }

    ceeloResults.push({
      winner: match.winner,
      loser: match.loser,
      amount: stake,
      location: match.location,
      winnerHomeTurf: match.winnerHomeTurf,
      loserHomeTurf: match.loserHomeTurf,
    });

    events.push({
      day,
      phase: 'morning',
      type: 'ceelo',
      participants: [match.winner, match.loser],
      text: `${winnerNPC.name} defeats ${loserNPC.name} for ${stake} gold ${match.turfNarrative} (${match.description})`,
      isClaudeGenerated: false,
      location: match.location,
    });

    // Generate reaction chatter (skip if loser is a silent character)
    if (options.useClaude && stake >= 30 && !loserNPC.silentCharacter) {
      const pool = loserState.mood === 'tilted' ? 'ceelo_emotional' : 'ceelo_talk';
      const poolConfig = TOKEN_POOLS[pool];
      const situation = poolConfig.situations[Math.floor(rng.random(`${dayKey}-m${m}-sit`) * poolConfig.situations.length)];

      const prompt = buildEternalContext(day, loserNPC, winnerNPC, npcStates, playerState, pool, situation, environment, matchLocation);
      const response = await generateWithClaude(prompt, poolConfig.tokens, options.apiKey);

      if (response && response.length > 10) {
        events.push({
          day,
          phase: 'morning',
          type: 'chatter',
          participants: [loserNPC.slug, winnerNPC.slug],
          text: response,
          isClaudeGenerated: true,
          location: matchLocation,
        });

        // Extract template for chatbase
        if (options.extractTemplates) {
          const mood = loserState.mood === 'tilted' ? 'annoyed' : 'neutral';
          extractTemplate(loserNPC.slug, response, 'reaction', mood, day, situation, winnerNPC.slug, matchLocation);
        }
      }
    }
  }

  // ========== MIDDAY - Chatter ==========
  // Filter out silent characters (Zero Chance, Body Count) from being speakers
  const middayNPCs = presentNPCs.filter(n => n.category !== 'pantheon' && !n.silentCharacter);
  const numChatter = 2 + Math.floor(rng.random(`${dayKey}-chatter-count`) * 3);

  for (let c = 0; c < numChatter; c++) {
    if (middayNPCs.length < 2) break;

    // Cover-rank weighted: core four speak (and get spoken to) most often
    const speakerIdx = pickWeightedIndex(middayNPCs, rng, `${dayKey}-c${c}-speaker`);
    const speaker = middayNPCs[speakerIdx];
    const targets = middayNPCs.filter((_, i) => i !== speakerIdx);
    const targetIdx = pickWeightedIndex(targets, rng, `${dayKey}-c${c}-target`);
    const target = targets[targetIdx];

    if (options.useClaude) {
      // Pick pool based on context
      const speakerState = npcStates.get(speaker.slug)!;
      const targetState = npcStates.get(target.slug)!;

      let pool = 'banter';
      if (speakerState.debtsOwed.get(target.slug) || targetState.debtsOwed.get(speaker.slug)) {
        pool = 'debt_drama';
      } else if (speakerState.mood === 'tilted' || targetState.mood === 'tilted') {
        pool = 'ceelo_emotional';
      } else if (playerState.lastRunDay === day && rng.random(`${dayKey}-c${c}-player`) < 0.4) {
        pool = 'player_gossip';
      } else if (rng.random(`${dayKey}-c${c}-lore`) < 0.1) {
        pool = 'lore_drop';
      }

      const poolConfig = TOKEN_POOLS[pool];
      const situation = poolConfig.situations[Math.floor(rng.random(`${dayKey}-c${c}-sit`) * poolConfig.situations.length)];

      // Where they collided - elevator, lobby, bathroom line, mission, city
      const scene = pickEncounter(rng, `${dayKey}-c${c}-scene`);
      const prompt = buildEternalContext(day, speaker, target, npcStates, playerState, pool, situation, environment, undefined, scene);
      const response = await generateWithClaude(prompt, poolConfig.tokens, options.apiKey);

      if (response && response.length > 10) {
        events.push({
          day,
          phase: 'midday',
          type: 'chatter',
          participants: [speaker.slug, target.slug],
          text: response,
          isClaudeGenerated: true,
          location: environment.dominantLocation,
        });

        // Extract template for chatbase
        if (options.extractTemplates) {
          const mood = speakerState.mood === 'tilted' ? 'annoyed' : speakerState.mood === 'hot' ? 'pleased' : 'neutral';
          const poolToType = { banter: 'idle', debt_drama: 'reaction', lore_drop: 'lore', player_gossip: 'reaction', ceelo_emotional: 'reaction' };
          const templatePool = poolToType[pool as keyof typeof poolToType] || 'idle';
          extractTemplate(speaker.slug, response, templatePool, mood, day, situation, target.slug, environment.dominantLocation);
        }
      }
    }
  }

  // ========== MIDDAY - Group Scene (~half of days) ==========
  // One API call writes a whole multi-party exchange (3 people = usually a
  // 2-on-1, 4-5 = the room turns on itself), then it is parsed back into
  // per-speaker lines so the day log and extractor treat each NPC's line
  // individually. Participants drawn cover-rank weighted, no repeats.
  if (options.useClaude && middayNPCs.length >= 3 && rng.random(`${dayKey}-group-gate`) < 0.5) {
    const sizeRoll = rng.random(`${dayKey}-group-size`);
    const size = sizeRoll < 0.5 ? 3 : sizeRoll < 0.85 ? 4 : 5;

    const draw = [...middayNPCs];
    const group: NPCDef[] = [];
    while (group.length < size && draw.length > 0) {
      const idx = pickWeightedIndex(draw, rng, `${dayKey}-group-p${group.length}`);
      group.push(draw[idx]);
      draw.splice(idx, 1);
    }

    // Canon: if the King is in the room, the room is the corona (he cannot
    // leave the throne - see field-guide reconciliation #10)
    const scene = group.some(g => g.slug === 'king-james')
      ? 'Summoned to the corona. The King cannot leave the throne, so the meeting came to the Sun - his light, his terms, everyone else squinting and wishing they were anywhere with a ceiling'
      : pickEncounter(rng, `${dayKey}-group-scene`);

    // Pairwise dynamics: alliances, rivalries, debts between those present
    const dynamics: string[] = [];
    for (let i = 0; i < group.length; i++) {
      for (let j = 0; j < group.length; j++) {
        if (i === j) continue;
        const a = group[i], b = group[j];
        if (i < j && (a.allies.includes(b.slug) || b.allies.includes(a.slug))) dynamics.push(`${a.name} and ${b.name} are allies`);
        if (i < j && (a.rivals.includes(b.slug) || b.rivals.includes(a.slug))) dynamics.push(`${a.name} and ${b.name} are rivals`);
        const owes = npcStates.get(a.slug)!.debtsOwed.get(b.slug) || 0;
        if (owes > 0) dynamics.push(`${a.name} owes ${b.name} ${owes} gold`);
      }
    }

    const roster = group.map(n => {
      const s = npcStates.get(n.slug)!;
      return `- ${n.name}, ${n.title}. Voice: ${n.voice} Mood: ${s.mood}. Record ${s.ceeloWins}W-${s.ceeloLosses}L, ${s.gold} gold.`;
    }).join('\n');

    const groupPrompt = `You are writing a group scene for NEVER DIE GUY - immortal coworkers colliding inside HERO CORPS.

SCENE: ${scene}.

WHO'S THERE:
${roster}

DYNAMICS:
${dynamics.length > 0 ? dynamics.map(d => `- ${d}`).join('\n') : '- None of them particularly like each other today.'}

Write a short group exchange, ${size + 2} to ${size * 2} lines total. People interrupt, take sides, gang up, or change the subject. Lines need not be evenly distributed - someone can stay quiet and land one line.

FORMAT (strict):
- Each line exactly: NAME: dialogue
- Use exactly these names: ${group.map(g => g.name).join(', ')}
- Dialogue only. No stage directions, no asterisks, no narration between lines

STYLE (house rules - follow strictly):
- NEVER use em dashes. Commas, periods, or a plain hyphen
- ONE punchline max in the whole scene. Plain talk does the rest
- Avoid the shape "that's not X, that's Y"
- Concrete words over ornate ones. Complete sentences, never trail off`;

    const response = await generateWithClaude(groupPrompt, 700, options.apiKey);
    if (process.env.DEBUG_GROUP) console.error(`[group] day ${day} size=${size} resp=${response ? response.length + 'ch' : 'NULL'}\n${response?.slice(0, 300)}`);
    if (response) {
      const byName = new Map(group.map(n => [n.name.toLowerCase(), n]));
      const parsed: { npc: NPCDef; text: string }[] = [];
      for (const raw of response.split('\n')) {
        const m = raw.trim().match(/^\**([A-Za-z .'-]+?)\**\s*:\s*(.+)$/);
        if (!m) continue;
        const npc = byName.get(m[1].trim().toLowerCase());
        if (!npc) continue;
        const text = m[2].trim();
        if (text.length < 5) continue;
        parsed.push({ npc, text });
      }

      if (parsed.length >= 2) {
        for (const line of parsed) {
          events.push({
            day,
            phase: 'midday',
            type: 'chatter',
            participants: [line.npc.slug],
            text: line.text,
            isClaudeGenerated: true,
            location: environment.dominantLocation,
          });
          if (options.extractTemplates) {
            const st = npcStates.get(line.npc.slug)!;
            const mood = st.mood === 'tilted' ? 'annoyed' : st.mood === 'hot' ? 'pleased' : 'neutral';
            extractTemplate(line.npc.slug, line.text, 'idle', mood, day, scene, undefined, environment.dominantLocation);
          }
        }
        highlights.push(`Group scene (${group.map(g => g.name).join(', ')}): ${scene.split('.')[0].toLowerCase()}`);
      }
    }
  }

  // ========== MIDDAY - Mythic Crossover (1 in 100 days) ==========
  if (isCrossoverDay(rng, day)) {
    const crossoverEvent = generateCrossoverEvent(day, rng, npcStates);
    if (crossoverEvent) {
      events.push(crossoverEvent);
      highlights.push(`MYTHIC: A Die-rector walks among mortals!`);
    }
  }

  // ========== ARENA - Player Run (some days) ==========
  let playerActivity: string | null = null;
  if (rng.random(`${dayKey}-player-run`) < 0.3) { // 30% chance of a run
    const run = simulatePlayerRun(playerState, npcStates, day, rng);
    playerActivity = run.description;

    events.push({
      day,
      phase: 'arena',
      type: 'player_run',
      participants: run.rescuer ? [run.rescuer] : [],
      text: `The newcomer ${run.description}.`,
      isClaudeGenerated: false,
    });

    // Generate reaction if death or win
    if (options.useClaude && (run.result === 'death' || run.result === 'win')) {
      // Filter out silent characters from being speakers
      const spectators = presentNPCs.filter(n => n.category !== 'pantheon' && !n.silentCharacter);
      if (spectators.length >= 2) {
        const speaker = spectators[Math.floor(rng.random(`${dayKey}-arena-speaker`) * spectators.length)];
        const targets = spectators.filter(s => s.slug !== speaker.slug);
        const target = targets[Math.floor(rng.random(`${dayKey}-arena-target`) * targets.length)];

        const poolConfig = TOKEN_POOLS.player_gossip;
        const situation = run.result === 'win'
          ? 'The newcomer just completed a full run. Unprecedented.'
          : `The newcomer just died on ante ${run.ante}. ${run.rescuer ? `${ALL_NPCS.find(n => n.slug === run.rescuer)?.name} went to rescue them.` : ''}`;

        const prompt = buildEternalContext(day, speaker, target, npcStates, playerState, 'player_gossip', situation, environment, 'dying-saucer');
        const response = await generateWithClaude(prompt, poolConfig.tokens, options.apiKey);

        if (response && response.length > 10) {
          events.push({
            day,
            phase: 'arena',
            type: 'chatter',
            participants: [speaker.slug, target.slug],
            text: response,
            isClaudeGenerated: true,
            location: 'dying-saucer',
          });

          // Extract template for chatbase
          if (options.extractTemplates) {
            const speakerState = npcStates.get(speaker.slug)!;
            const mood = speakerState.mood === 'tilted' ? 'annoyed' : run.result === 'win' ? 'amused' : 'neutral';
            extractTemplate(speaker.slug, response, 'reaction', mood, day, situation, target.slug, 'dying-saucer');
          }
        }
      }
    }
  }

  // ========== EVENING - More Ceelo, Wind Down ==========
  const eveningMatches = Math.floor(rng.random(`${dayKey}-evening-matches`) * 2);
  for (let m = 0; m < eveningMatches; m++) {
    const available = presentNPCs.filter(n => {
      const state = npcStates.get(n.slug)!;
      return state.gold >= 50 && n.category !== 'pantheon';
    });
    if (available.length < 2) break;

    const p1Idx = Math.floor(rng.random(`${dayKey}-ev${m}-p1`) * available.length);
    const p1 = available[p1Idx];
    const remaining = available.filter((_, i) => i !== p1Idx);
    const p2Idx = Math.floor(rng.random(`${dayKey}-ev${m}-p2`) * remaining.length);
    const p2 = remaining[p2Idx];

    const p1State = npcStates.get(p1.slug)!;
    const p2State = npcStates.get(p2.slug)!;

    const stake = Math.min(
      Math.min(p1State.gold, p2State.gold),
      30 + Math.floor(rng.random(`${dayKey}-ev${m}-stake`) * 70)
    );

    // Evening games - more likely to be in back alleys or domain-based
    let eveningLocation = rollGameLocation(rng, `${dayKey}-ev${m}`, p1.luckyDie, p2.luckyDie, environment.weather);

    // Canon: King James never leaves the corona - his games happen at the Sun
    // (Maxwell rolls the King's dice; see field-guide reconciliation log #10)
    if (p1.slug === 'king-james' || p2.slug === 'king-james') eveningLocation = 'sun';

    const match = playCeeloMatch({
      npc1: p1,
      npc2: p2,
      stake,
      location: eveningLocation,
      weather: environment.weather,
      rng,
      matchKey: `${dayKey}-ev${m}`,
    });

    const winnerState = npcStates.get(match.winner)!;
    const loserState = npcStates.get(match.loser)!;

    winnerState.gold += stake;
    loserState.gold -= stake;
    winnerState.ceeloWins++;
    loserState.ceeloLosses++;

    ceeloResults.push({
      winner: match.winner,
      loser: match.loser,
      amount: stake,
      location: match.location,
      winnerHomeTurf: match.winnerHomeTurf,
      loserHomeTurf: match.loserHomeTurf,
    });
  }

  // ========== NIGHT - Debt Aging ==========
  const endOfDayDebts: Array<{ from: string; to: string; amount: number; daysOverdue: number }> = [];

  for (const [slug, state] of npcStates) {
    for (const [creditor, amount] of state.debtsOwed) {
      const daysOverdue = (state.debtDaysOverdue.get(creditor) || 0) + 1;
      state.debtDaysOverdue.set(creditor, daysOverdue);
      endOfDayDebts.push({ from: slug, to: creditor, amount, daysOverdue });
    }
  }

  // Generate highlights
  const bigWinners = ceeloResults.filter(r => r.amount >= 50);
  for (const win of bigWinners) {
    const winner = ALL_NPCS.find(n => n.slug === win.winner)!;
    const loser = ALL_NPCS.find(n => n.slug === win.loser)!;
    highlights.push(`${winner.name} took ${win.amount} gold from ${loser.name}`);
  }

  const tiltedNPCs = Array.from(npcStates.values()).filter(s => s.mood === 'tilted');
  for (const tilted of tiltedNPCs) {
    const npc = ALL_NPCS.find(n => n.slug === tilted.slug)!;
    highlights.push(`${npc.name} is on tilt (${Math.abs(tilted.currentStreak)} loss streak)`);
  }

  if (playerActivity) {
    highlights.push(`Newcomer: ${playerActivity}`);
  }

  // Add weather to highlights if notable
  if (environment.weather !== 'clear') {
    highlights.unshift(`Weather: ${environment.weather.replace('-', ' ')}`);
  }

  return {
    day,
    events,
    highlights,
    ceeloResults,
    playerActivity,
    endOfDayDebts,
    environment,
  };
}

// ============================================
// Markdown Builder
// ============================================

function buildDayMarkdown(
  day: number,
  entry: DiaryEntry,
  npcStates: Map<string, NPCState>,
  playerState: PlayerState
): string {
  const lines: string[] = [
    `# Day ${day}`,
    ``,
  ];

  // Environment
  const weatherText = entry.environment.weather !== 'clear'
    ? entry.environment.weatherDescription
    : '';
  const locationText = entry.environment.dominantLocation !== 'hero-corps'
    ? `Most activity at ${entry.environment.dominantLocation.replace(/-/g, ' ')}.`
    : '';
  if (weatherText || locationText) {
    lines.push(`*${[weatherText, locationText].filter(Boolean).join(' ')}*`);
    lines.push(``);
  }

  // Present NPCs
  const present = ALL_NPCS.filter(n => npcStates.get(n.slug)!.presentToday);
  lines.push(`*${present.length} souls around today*`);
  lines.push(``);

  // Highlights
  if (entry.highlights.length > 0) {
    lines.push(`## Highlights`);
    for (const h of entry.highlights) {
      lines.push(`- ${h}`);
    }
    lines.push(``);
  }

  // Player activity
  if (entry.playerActivity) {
    lines.push(`## The Newcomer`);
    lines.push(`> ${entry.playerActivity}`);
    lines.push(``);
  }

  // Ceelo results
  if (entry.ceeloResults.length > 0) {
    lines.push(`## Ceelo Results`);
    for (const r of entry.ceeloResults) {
      const winner = ALL_NPCS.find(n => n.slug === r.winner)!;
      const loser = ALL_NPCS.find(n => n.slug === r.loser)!;
      const locationLabel = r.location.replace(/-/g, ' ');
      const turfNote = r.winnerHomeTurf ? ' (home turf)' : r.loserHomeTurf ? ' (enemy territory)' : '';
      lines.push(`- **${winner.name}** beats ${loser.name} for ${r.amount}g at ${locationLabel}${turfNote}`);
    }
    lines.push(``);
  }

  // Chatter (the good stuff)
  const chatter = entry.events.filter(e => e.type === 'chatter');
  if (chatter.length > 0) {
    lines.push(`## Overheard`);
    lines.push(``);
    for (const c of chatter) {
      const speaker = ALL_NPCS.find(n => n.slug === c.participants[0])!;
      const target = c.participants[1] ? ALL_NPCS.find(n => n.slug === c.participants[1]) : null;
      const aiTag = c.isClaudeGenerated ? '' : ' *(template)*';
      lines.push(`**${speaker.name}**${target ? ` *(to ${target.name})*` : ''}${aiTag}`);
      lines.push(`> ${c.text}`);
      lines.push(``);
    }
  }

  // Outstanding debts
  if (entry.endOfDayDebts.length > 0) {
    const significantDebts = entry.endOfDayDebts.filter(d => d.amount >= 50 || d.daysOverdue >= 5);
    if (significantDebts.length > 0) {
      lines.push(`## Debts`);
      for (const d of significantDebts) {
        const debtor = ALL_NPCS.find(n => n.slug === d.from)!;
        const creditor = ALL_NPCS.find(n => n.slug === d.to)!;
        const urgency = d.daysOverdue >= 10 ? ' **OVERDUE**' : d.daysOverdue >= 5 ? ' *overdue*' : '';
        lines.push(`- ${debtor.name} owes ${creditor.name} ${d.amount}g (${d.daysOverdue} days)${urgency}`);
      }
      lines.push(``);
    }
  }

  // Mood check
  const moodyNPCs = Array.from(npcStates.entries())
    .filter(([, s]) => s.presentToday && s.mood !== 'neutral')
    .map(([slug, s]) => {
      const npc = ALL_NPCS.find(n => n.slug === slug)!;
      return { name: npc.name, mood: s.mood, streak: s.currentStreak };
    });

  if (moodyNPCs.length > 0) {
    lines.push(`## Vibes`);
    for (const m of moodyNPCs) {
      const streakText = m.streak !== 0 ? ` (${m.streak > 0 ? '+' : ''}${m.streak})` : '';
      lines.push(`- ${m.name}: ${m.mood}${streakText}`);
    }
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(`*End of Day ${day}*`);

  return lines.join('\n');
}

// Continuous, read-through "blog": every day in order, chaptered by pantheon
// week, dialogue-forward, no tables and no truncation. This is the file meant
// to be scrolled top-to-bottom like a serialized diary (vs diary.md's report).
function buildBlogMarkdown(
  diary: DiaryEntry[],
  pantheonWeeks: PantheonWeekState[],
  seed: string
): string {
  const npcName = (slug: string) => ALL_NPCS.find(n => n.slug === slug)?.name ?? slug;
  const weekBySlot = new Map(pantheonWeeks.map(w => [w.weekNumber, w]));

  const lines: string[] = [
    `# Eternal Days`,
    ``,
    `*The ongoing life of HERO CORPS and the Dying Saucer - read top to bottom.*`,
    ``,
    `\`${seed}\` · ${diary.length} days`,
    ``,
  ];

  let currentWeek = 0;
  for (const entry of diary) {
    const week = Math.floor((entry.day - 1) / 7) + 1;

    // Chapter break at each new week, with the pantheon's mood as an epigraph.
    if (week !== currentWeek) {
      currentWeek = week;
      const startDay = (week - 1) * 7 + 1;
      lines.push(``, `---`, ``, `## Week ${week}`, `*Days ${startDay}-${startDay + 6}*`, ``);
      const pw = weekBySlot.get(week);
      if (pw) {
        for (const p of pw.prophecies) lines.push(`> ${p}`);
        if (pw.prophecies.length > 0) lines.push(``);
      }
    }

    // Day heading carries the weather/place flavor inline.
    const weatherText = entry.environment.weather !== 'clear' ? entry.environment.weatherDescription : '';
    lines.push(`### Day ${entry.day}`, ``);
    if (weatherText) lines.push(`*${weatherText}*`, ``);

    // The weather is already the italic epigraph above; skip the dupe bullet.
    const highlights = entry.highlights.filter(h => !h.startsWith('Weather:'));
    for (const h of highlights) lines.push(`- ${h}`);
    if (highlights.length > 0) lines.push(``);

    if (entry.playerActivity) {
      lines.push(`*The Newcomer:* ${entry.playerActivity}`, ``);
    }

    const chatter = entry.events.filter(e => e.type === 'chatter');
    for (const c of chatter) {
      const speaker = npcName(c.participants[0]);
      const target = c.participants[1] ? npcName(c.participants[1]) : null;
      const tag = c.isClaudeGenerated ? '' : ' *(template)*';
      lines.push(`**${speaker}**${target ? ` to ${target}` : ''}${tag}`);
      lines.push(`> ${c.text}`, ``);
    }
  }

  return lines.join('\n');
}

// ============================================
// Main
// ============================================

async function main() {
  const args = process.argv.slice(2);

  const options = {
    days: 500,
    useClaude: false,
    seed: `eternal-${Date.now()}`,
    verbose: false,
    tokensQuick: 0,   // 0 = keep the TOKEN_POOLS default
    tokensStory: 0,
    extractTemplates: false,
    resumeFrom: '',   // path to a previous run dir; continues from its final-state.json
  };

  for (const arg of args) {
    if (arg.startsWith('--days=')) options.days = parseInt(arg.split('=')[1], 10);
    else if (arg === '--use-claude') options.useClaude = true;
    else if (arg.startsWith('--seed=')) options.seed = arg.split('=')[1];
    else if (arg === '--verbose') options.verbose = true;
    else if (arg.startsWith('--tokens-quick=')) options.tokensQuick = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--tokens-story=')) options.tokensStory = parseInt(arg.split('=')[1], 10);
    else if (arg === '--extract-templates') options.extractTemplates = true;
    else if (arg.startsWith('--model=')) CLAUDE_MODEL = arg.split('=')[1];
    else if (arg.startsWith('--resume=')) options.resumeFrom = arg.split('=')[1];
    else if (arg.startsWith('--setting=')) {
      const v = arg.split('=')[1] as GameLocation;
      if (VALID_SETTINGS.includes(v)) FORCED_SETTING = v;
      else console.log(`WARNING: unknown --setting "${v}". Valid: ${VALID_SETTINGS.join(', ')}`);
    }
  }

  // Optional per-pool token overrides. These used to apply unconditionally with
  // a 60-token default that silently clipped every banter line mid-sentence.
  if (options.tokensQuick > 0) TOKEN_POOLS.banter.tokens = options.tokensQuick;
  if (options.tokensStory > 0) TOKEN_POOLS.lore_drop.tokens = options.tokensStory;
  if (options.tokensQuick > 0 && options.tokensStory > 0) {
    TOKEN_POOLS.debt_drama.tokens = Math.floor((options.tokensQuick + options.tokensStory) / 2);
  }

  console.log('='.repeat(60));
  console.log('NPC ETERNAL DAYS - Diary of Immortals');
  console.log('='.repeat(60));
  console.log(`Days: ${options.days}`);
  console.log(`Seed: ${options.seed}`);
  console.log(`Claude: ${options.useClaude ? `Enabled (${CLAUDE_MODEL})` : 'Disabled'}`);
  console.log(`Extract Templates: ${options.extractTemplates ? 'Yes' : 'No'}`);
  console.log(`Setting: ${FORCED_SETTING || 'dynamic (HERO CORPS default + realm weather)'}`);
  console.log('='.repeat(60));
  console.log('');

  const rng = createSeededRng(options.seed);
  const apiKey = process.env.ANTHROPIC_API_KEY || '';

  if (options.useClaude && !apiKey) {
    console.log('WARNING: --use-claude specified but ANTHROPIC_API_KEY not set');
    options.useClaude = false;
  }

  // Initialize state
  const npcStates = new Map<string, NPCState>();
  for (const npc of ALL_NPCS) {
    npcStates.set(npc.slug, initNPCState(npc));
  }
  const playerState = initPlayerState();

  const logsDir = path.join(__dirname, '..', 'logs');

  // Resume: overlay a previous run's final-state.json so this run continues
  // its world - gold, records, streaks, debts, moods, player profile, and day
  // numbering all carry forward. NPCs added since that run keep fresh defaults.
  let dayOffset = 0;
  if (options.resumeFrom) {
    // --resume=latest picks the newest run dir that has a final-state.json
    if (options.resumeFrom === 'latest') {
      const latest = fs.readdirSync(logsDir)
        .filter(d => d.startsWith('eternal-') && fs.existsSync(path.join(logsDir, d, 'final-state.json')))
        .sort()
        .pop();
      if (!latest) {
        console.error('ERROR: --resume=latest: no previous run with a final-state.json found');
        process.exit(1);
      }
      options.resumeFrom = latest;
    }

    const candidates = [
      path.join(options.resumeFrom, 'final-state.json'),
      path.join(logsDir, options.resumeFrom, 'final-state.json'),
    ];
    const statePath = candidates.find(p => fs.existsSync(p));
    if (!statePath) {
      console.error(`ERROR: --resume: no final-state.json found at ${candidates.join(' or ')}`);
      process.exit(1);
    }

    const saved = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    for (const [slug, s] of Object.entries(saved.npcStates || {}) as [string, Record<string, unknown>][]) {
      const base = npcStates.get(slug);
      if (!base) continue; // NPC removed/renamed since that run
      npcStates.set(slug, {
        ...base,
        ...(s as Partial<NPCState>),
        debtsOwed: new Map(Object.entries((s.debtsOwed as Record<string, number>) || {})),
        debtsOwedTo: new Map(Object.entries((s.debtsOwedTo as Record<string, number>) || {})),
        debtDaysOverdue: new Map(Object.entries((s.debtDaysOverdue as Record<string, number>) || {})),
      });
    }
    const sp = saved.playerState || {};
    Object.assign(playerState, {
      ...sp,
      debtsToNPCs: new Map(Object.entries((sp.debtsToNPCs as Record<string, number>) || {})),
      profile: { ...createPlayerProfile(), ...(sp.profile || saved.playerProfile || {}) },
    });
    dayOffset = saved.daysSimulated || 0;
    console.log(`Resuming from ${path.dirname(statePath)} - continuing at day ${dayOffset + 1}`);
    console.log('');
  }

  // Setup output
  const sessionId = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionDir = path.join(logsDir, `eternal-${sessionId}`);
  fs.mkdirSync(sessionDir, { recursive: true });

  // Diary entries
  const diary: DiaryEntry[] = [];
  const pantheonWeeks: PantheonWeekState[] = [];
  const startTime = Date.now();

  // Graceful shutdown: first Ctrl-C stops after the current day and flushes
  // finals; second Ctrl-C hard-exits (the handler otherwise overrides Node's
  // default SIGINT exit, so without this a long claude run is unkillable).
  let interrupted = false;
  process.on('SIGINT', () => {
    if (!interrupted) {
      interrupted = true;
      console.log('\n\nInterrupted! Finishing current day, then saving progress... (Ctrl-C again to force quit)');
    } else {
      console.log('\nForce quit.');
      process.exit(130);
    }
  });

  // Create days subdirectory
  const daysDir = path.join(sessionDir, 'days');
  fs.mkdirSync(daysDir, { recursive: true });

  // Create pantheon subdirectory for weekly segments
  const pantheonDir = path.join(sessionDir, 'pantheon');
  fs.mkdirSync(pantheonDir, { recursive: true });

  // Simulate days. A throw in any single day (transient API/parse error, OOM
  // near limits, a rare state branch) must NOT discard the run: log it and fall
  // through to finalization so every completed day is still flushed to disk.
  try {
  for (let day = dayOffset + 1; day <= dayOffset + options.days && !interrupted; day++) {
    // Simulate Pantheon week at start of each 7-day cycle
    if ((day - 1) % 7 === 0) {
      const weekNumber = Math.floor((day - 1) / 7) + 1;
      const pantheonWeek = simulatePantheonWeek(weekNumber, day, rng);
      pantheonWeeks.push(pantheonWeek);

      // Write Pantheon week log
      const weekPath = path.join(pantheonDir, `week-${String(weekNumber).padStart(3, '0')}.md`);
      const weekLines = [
        `# Pantheon Week ${weekNumber}`,
        `*Days ${day}-${day + 6}*`,
        ``,
        `## Domain Conditions`,
        ...Object.entries(pantheonWeek.domainConditions).map(([domain, condition]) =>
          `- **${domain}**: ${condition}`
        ),
        ``,
        `## Events`,
        ...pantheonWeek.events.map(e =>
          `- Day ${e.day} [${e.eventType}]: ${e.text}`
        ),
        ``,
      ];
      if (pantheonWeek.prophecies.length > 0) {
        weekLines.push(`## Prophecies`);
        weekLines.push(...pantheonWeek.prophecies.map(p => `> ${p}`));
      }
      fs.writeFileSync(weekPath, weekLines.join('\n'));

      if (options.verbose) {
        console.log(`  Pantheon Week ${weekNumber}: ${pantheonWeek.events.length} events`);
      }
    }

    const entry = await simulateDay(day, npcStates, playerState, rng, {
      useClaude: options.useClaude,
      apiKey,
      verbose: options.verbose,
      extractTemplates: options.extractTemplates,
    });

    diary.push(entry);

    // Heartbeat: claude runs take ~15s/day of API calls, so print each day as
    // it completes (template runs finish in seconds; every 10th day is enough).
    if (options.useClaude || options.verbose || day % 10 === 0) {
      const lines = entry.events.filter(e => e.type === 'chatter').length;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      console.log(`Day ${day}/${dayOffset + options.days} done - ${lines} lines of dialogue (${elapsed}s elapsed)`);
    }

    // Write this day's diary entry immediately
    const dayMd = buildDayMarkdown(day, entry, npcStates, playerState);
    const dayPath = path.join(daysDir, `day-${String(day).padStart(4, '0')}.md`);
    fs.writeFileSync(dayPath, dayMd);

    // Write periodic state checkpoints
    if (day % 50 === 0) {
      const checkpointPath = path.join(sessionDir, `checkpoint-day${day}.json`);
      fs.writeFileSync(checkpointPath, JSON.stringify({
        day,
        npcStates: Object.fromEntries(
          Array.from(npcStates.entries()).map(([k, v]) => [k, {
            ...v,
            debtsOwed: Object.fromEntries(v.debtsOwed),
            debtsOwedTo: Object.fromEntries(v.debtsOwedTo),
            debtDaysOverdue: Object.fromEntries(v.debtDaysOverdue),
          }])
        ),
        playerState: {
          ...playerState,
          debtsToNPCs: Object.fromEntries(playerState.debtsToNPCs),
        },
      }, null, 2));
    }
  }
  } catch (err) {
    console.error(`\nDay loop aborted (${diary.length} days completed). Flushing finals with progress so far:`);
    console.error(err);
  }

  const elapsed = (Date.now() - startTime) / 1000;

  // Write final state
  const finalStatePath = path.join(sessionDir, 'final-state.json');
  fs.writeFileSync(finalStatePath, JSON.stringify({
    daysSimulated: dayOffset + diary.length,
    npcStates: Object.fromEntries(
      Array.from(npcStates.entries()).map(([k, v]) => [k, {
        ...v,
        debtsOwed: Object.fromEntries(v.debtsOwed),
        debtsOwedTo: Object.fromEntries(v.debtsOwedTo),
        debtDaysOverdue: Object.fromEntries(v.debtDaysOverdue),
      }])
    ),
    playerState: {
      ...playerState,
      debtsToNPCs: Object.fromEntries(playerState.debtsToNPCs),
    },
    playerProfile: playerState.profile,
  }, null, 2));

  // Save player profile separately for chatbase lookups
  const profilePath = path.join(sessionDir, 'player-profile.json');
  fs.writeFileSync(profilePath, serializeProfile(playerState.profile));

  // Save extracted templates if enabled
  if (options.extractTemplates && extractedTemplates.length > 0) {
    const templatesPath = path.join(sessionDir, 'extracted-templates.json');
    fs.writeFileSync(templatesPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      seed: options.seed,
      totalTemplates: extractedTemplates.length,
      templatesByNpc: extractedTemplates.reduce((acc, t) => {
        acc[t.entitySlug] = (acc[t.entitySlug] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      templates: extractedTemplates,
    }, null, 2));

    // Also write TypeScript-ready format for easy import
    const tsPath = path.join(sessionDir, 'extracted-templates.ts');
    const tsContent = `/**
 * Auto-generated dialogue templates from Eternal Days simulation
 * Generated: ${new Date().toISOString()}
 * Seed: ${options.seed}
 * Total: ${extractedTemplates.length} templates
 */

import type { ResponseTemplate } from '@/data/npc-chat/types';

export const GENERATED_TEMPLATES: ResponseTemplate[] = ${JSON.stringify(
      extractedTemplates.map(t => ({
        id: t.id,
        entitySlug: t.entitySlug,
        pool: t.pool,
        mood: t.mood,
        text: t.text,
        weight: t.weight,
        purpose: t.purpose,
      })),
      null,
      2
    )};
`;
    fs.writeFileSync(tsPath, tsContent);

    console.log(`\nExtracted ${extractedTemplates.length} templates to:`);
    console.log(`  - ${templatesPath}`);
    console.log(`  - ${tsPath}`);
  }

  // Write markdown diary
  const mdLines: string[] = [
    `# Eternal Days - Diary of HERO CORPS and the Dying Saucer`,
    ``,
    `> ${diary.length} days simulated`,
    `> Seed: \`${options.seed}\``,
    `> Claude: ${options.useClaude ? 'Enabled' : 'Disabled'}`,
    ``,
    `---`,
    ``,
    `## The Newcomer (Never Die Guy)`,
    ``,
    `- Total Deaths: ${playerState.totalDeaths}`,
    `- Total Rescues: ${playerState.totalRescues}`,
    `- Highest Ante: ${playerState.highestAnte}`,
    `- **Archetype**: ${playerState.profile.archetype}`,
    `- **Win Rate**: ${(playerState.profile.winRate * 100).toFixed(1)}%`,
    `- Outstanding Debts:`,
  ];

  for (const [npcSlug, debt] of playerState.debtsToNPCs) {
    const npc = ALL_NPCS.find(n => n.slug === npcSlug)!;
    const tension = getDebtTensionForNPC(playerState.profile.debtsTo, npcSlug);
    const tensionLabel = tension !== 'none' ? ` (${tension})` : '';
    mdLines.push(`  - ${npc.name}: ${debt} gold${tensionLabel}`);
  }

  // Active story beats
  const activeBeats = playerState.profile.storyBeats.filter(b => b.weight > 0.3);
  if (activeBeats.length > 0) {
    mdLines.push(``, `### Active Story Beats`);
    for (const beat of activeBeats.slice(0, 5)) {
      mdLines.push(`- ${beat.type} (weight: ${beat.weight.toFixed(2)}, from day ${beat.createdAtRun})`);
    }
  }

  if (playerState.legendaryMoments.length > 0) {
    mdLines.push(``, `### Legendary Moments`);
    for (const moment of playerState.legendaryMoments) {
      mdLines.push(`- ${moment}`);
    }
  }

  mdLines.push(``, `---`, ``, `## NPC Standings`, ``);

  const sortedNPCs = Array.from(npcStates.entries())
    .sort((a, b) => b[1].gold - a[1].gold);

  for (const [slug, state] of sortedNPCs) {
    const npc = ALL_NPCS.find(n => n.slug === slug)!;
    mdLines.push(`### ${npc.name}`);
    mdLines.push(`*${npc.title} | ${npc.category} | Lucky Die: ${npc.luckyDie === 'none' ? 'None' : npc.luckyDie.toUpperCase()}*`);
    mdLines.push(``);
    mdLines.push(`| Stat | Value |`);
    mdLines.push(`|------|-------|`);
    mdLines.push(`| Gold | ${state.gold} |`);
    mdLines.push(`| Record | ${state.ceeloWins}W-${state.ceeloLosses}L |`);
    mdLines.push(`| Best/Worst Streak | +${state.bestStreak} / ${state.worstStreak} |`);
    mdLines.push(``);
    mdLines.push(`| Essence | Grit | Shadow | Fury | Resilience | Swiftness |`);
    mdLines.push(`|---------|------|--------|------|------------|-----------|`);
    mdLines.push(`| ${state.stats.essence} | ${state.stats.grit} | ${state.stats.shadow} | ${state.stats.fury} | ${state.stats.resilience} | ${state.stats.swiftness} |`);

    if (state.debtsOwed.size > 0) {
      mdLines.push(``);
      mdLines.push(`**Owes:**`);
      for (const [creditor, amount] of state.debtsOwed) {
        const days = state.debtDaysOverdue.get(creditor) || 0;
        const creditorNPC = ALL_NPCS.find(n => n.slug === creditor)!;
        mdLines.push(`- ${creditorNPC.name}: ${amount} gold (${days} days)`);
      }
    }
    mdLines.push(``);
  }

  mdLines.push(`---`, ``, `## Daily Diary`, ``);

  // Only include days with interesting events
  const interestingDays = diary.filter(d =>
    d.highlights.length > 0 ||
    d.events.some(e => e.isClaudeGenerated) ||
    d.playerActivity
  );

  for (const entry of interestingDays.slice(-100)) { // Last 100 interesting days
    mdLines.push(`### Day ${entry.day}`);

    if (entry.highlights.length > 0) {
      for (const h of entry.highlights) {
        mdLines.push(`- ${h}`);
      }
    }

    const chatter = entry.events.filter(e => e.type === 'chatter' && e.isClaudeGenerated);
    if (chatter.length > 0) {
      mdLines.push(``);
      for (const c of chatter) {
        const speaker = ALL_NPCS.find(n => n.slug === c.participants[0])!;
        const target = ALL_NPCS.find(n => n.slug === c.participants[1]);
        mdLines.push(`**${speaker.name}**${target ? ` *(to ${target.name})*` : ''}`);
        mdLines.push(`> ${c.text}`);
        mdLines.push(``);
      }
    }

    mdLines.push(``);
  }

  const mdPath = path.join(sessionDir, 'diary.md');
  fs.writeFileSync(mdPath, mdLines.join('\n'));

  // Read-through blog: every day in order, chaptered by week, dialogue-forward.
  const blogPath = path.join(sessionDir, 'blog.md');
  fs.writeFileSync(blogPath, buildBlogMarkdown(diary, pantheonWeeks, options.seed));

  // Console summary
  console.log('');
  console.log('='.repeat(60));
  console.log('SIMULATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Days: ${diary.length}`);
  console.log(`Duration: ${Math.round(elapsed)}s`);
  console.log('');
  console.log('=== PLAYER (NEVER DIE GUY) ===');
  console.log(`Deaths: ${playerState.totalDeaths}`);
  console.log(`Rescues: ${playerState.totalRescues}`);
  console.log(`Highest Ante: ${playerState.highestAnte}`);
  console.log(`Total Debt: ${Array.from(playerState.debtsToNPCs.values()).reduce((a, b) => a + b, 0)} gold`);
  console.log('');
  console.log('=== TOP 5 RICHEST NPCs ===');
  for (const [slug, state] of sortedNPCs.slice(0, 5)) {
    const npc = ALL_NPCS.find(n => n.slug === slug)!;
    console.log(`  ${npc.name} (${npc.luckyDie === 'none' ? 'None' : npc.luckyDie.toUpperCase()})`);
    console.log(`    Gold: ${state.gold} | Record: ${state.ceeloWins}W-${state.ceeloLosses}L`);
    console.log(`    Stats: E${state.stats.essence} G${state.stats.grit} S${state.stats.shadow} F${state.stats.fury} R${state.stats.resilience} Sw${state.stats.swiftness}`);
  }
  console.log('');
  console.log('=== BOTTOM 5 NPCs ===');
  for (const [slug, state] of sortedNPCs.slice(-5).reverse()) {
    const npc = ALL_NPCS.find(n => n.slug === slug)!;
    console.log(`  ${npc.name} (${npc.luckyDie === 'none' ? 'None' : npc.luckyDie.toUpperCase()})`);
    console.log(`    Gold: ${state.gold} | Record: ${state.ceeloWins}W-${state.ceeloLosses}L`);
    console.log(`    Stats: E${state.stats.essence} G${state.stats.grit} S${state.stats.shadow} F${state.stats.fury} R${state.stats.resilience} Sw${state.stats.swiftness}`);
  }
  console.log('');
  console.log('=== STAT LEADERS ===');
  const statLeaders = {
    essence: [...npcStates.entries()].sort((a, b) => b[1].stats.essence - a[1].stats.essence)[0],
    grit: [...npcStates.entries()].sort((a, b) => b[1].stats.grit - a[1].stats.grit)[0],
    shadow: [...npcStates.entries()].sort((a, b) => b[1].stats.shadow - a[1].stats.shadow)[0],
    fury: [...npcStates.entries()].sort((a, b) => b[1].stats.fury - a[1].stats.fury)[0],
    resilience: [...npcStates.entries()].sort((a, b) => b[1].stats.resilience - a[1].stats.resilience)[0],
    swiftness: [...npcStates.entries()].sort((a, b) => b[1].stats.swiftness - a[1].stats.swiftness)[0],
  };
  console.log(`  Essence: ${ALL_NPCS.find(n => n.slug === statLeaders.essence[0])?.name} (${statLeaders.essence[1].stats.essence})`);
  console.log(`  Grit: ${ALL_NPCS.find(n => n.slug === statLeaders.grit[0])?.name} (${statLeaders.grit[1].stats.grit})`);
  console.log(`  Shadow: ${ALL_NPCS.find(n => n.slug === statLeaders.shadow[0])?.name} (${statLeaders.shadow[1].stats.shadow})`);
  console.log(`  Fury: ${ALL_NPCS.find(n => n.slug === statLeaders.fury[0])?.name} (${statLeaders.fury[1].stats.fury})`);
  console.log(`  Resilience: ${ALL_NPCS.find(n => n.slug === statLeaders.resilience[0])?.name} (${statLeaders.resilience[1].stats.resilience})`);
  console.log(`  Swiftness: ${ALL_NPCS.find(n => n.slug === statLeaders.swiftness[0])?.name} (${statLeaders.swiftness[1].stats.swiftness})`);
  console.log('');
  if (options.extractTemplates && extractedTemplates.length > 0) {
    console.log('=== EXTRACTED TEMPLATES ===');
    console.log(`Total: ${extractedTemplates.length} templates`);
    const byNpc = extractedTemplates.reduce((acc, t) => {
      acc[t.entitySlug] = (acc[t.entitySlug] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const sorted = Object.entries(byNpc).sort((a, b) => b[1] - a[1]);
    for (const [slug, count] of sorted.slice(0, 10)) {
      const npc = ALL_NPCS.find(n => n.slug === slug);
      console.log(`  ${npc?.name || slug}: ${count}`);
    }
    console.log('');
  }
  console.log('='.repeat(60));
  console.log(`Output: ${sessionDir}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
