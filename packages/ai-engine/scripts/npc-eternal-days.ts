#!/usr/bin/env ts-node
/**
 * NPC Eternal Days - Day-by-Day Diary Simulation
 *
 * Simulates days in the life of immortal NPCs at the market.
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
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createSeededRng, type SeededRng } from '../src/core/seeded-rng';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Types
// ============================================

// Lucky Die type - matches the canonical system
type LuckyDie = 'none' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'all';

// Game locations - where ceelo and interactions happen
type GameLocation =
  | 'market-square'      // Neutral - the default gathering spot
  | 'back-alley'         // Neutral but seedy, high stakes
  | 'sphere-stands'      // Near the arena, post-run energy
  | 'null-providence'    // d4 turf - The One's domain
  | 'mechanarium'        // d6 turf - John's domain
  | 'shadow-keep'        // d8 turf - Peter's domain
  | 'infernus'           // d10 turf - Robert's domain
  | 'frost-reach'        // d12 turf - Alice's domain
  | 'aberrant';          // d20 turf - Jane's domain

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
  'd4': 'null-providence',
  'd6': 'mechanarium',
  'd8': 'shadow-keep',
  'd10': 'infernus',
  'd12': 'frost-reach',
  'd20': 'aberrant',
  'all': null,  // Board Room - aligned with ALL
};

// Map domain to element for weather effects
const DOMAIN_ELEMENT: Record<GameLocation, LuckyDie | null> = {
  'market-square': null,
  'back-alley': null,
  'sphere-stands': null,
  'null-providence': 'd4',
  'mechanarium': 'd6',
  'shadow-keep': 'd8',
  'infernus': 'd10',
  'frost-reach': 'd12',
  'aberrant': 'd20',
};

// Weather descriptions for prompts
const WEATHER_DESCRIPTIONS: Record<Weather, string> = {
  'clear': 'The market hums with normal activity.',
  'void-fog': 'A strange fog rolls in from Null Providence. Probability feels... off. Whispers in the mist.',
  'dust-storm': 'Dust from the Mechanarium blows through. Grit in everyone\'s teeth. Tempers short.',
  'death-chill': 'A cold presence from Shadow Keep. The shadows stretch longer than they should.',
  'heat-wave': 'Heat radiates from Infernus. Tempers flare. Everyone\'s on edge.',
  'frost-wind': 'An icy wind from Frost Reach. Everything slows. Patience is tested.',
  'wild-gale': 'Chaotic winds from the Aberrant tear through. Anything could happen.',
};

// Location descriptions for prompts
const LOCATION_DESCRIPTIONS: Record<GameLocation, string> = {
  'market-square': 'The Market Square - neutral ground where all deals are fair... supposedly.',
  'back-alley': 'A seedy back alley. High stakes, no rules, no witnesses.',
  'sphere-stands': 'The stands near the Sphere. Post-run energy, fresh death still in the air.',
  'null-providence': 'Null Providence - The One\'s domain. Reality here is... negotiable.',
  'mechanarium': 'The Mechanarium - John\'s domain. Gears click, chains rattle, everything is clockwork.',
  'shadow-keep': 'Shadow Keep - Peter\'s domain. Every shadow hides a secret.',
  'infernus': 'Infernus - Robert\'s domain. The heat alone separates the weak from the bold.',
  'frost-reach': 'Frost Reach - Alice\'s domain. Time moves differently here.',
  'aberrant': 'The Aberrant - Jane\'s domain. Normal is just a word here.',
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
    tokens: 60,
    weight: 0.45,
    situations: [
      'Quick exchange at the market stall',
      'Passing comment while watching the sphere',
      'Brief greeting between old acquaintances',
    ],
  },
  ceelo_talk: {
    tokens: 100,
    weight: 0.20,
    situations: [
      'Smack talk before a ceelo match',
      'Reaction to a clutch roll',
      'Calling out a winning streak',
    ],
  },
  ceelo_emotional: {
    tokens: 150,
    weight: 0.10,
    situations: [
      'Just lost big - tilted and ranting',
      'On a hot streak - feeling invincible',
      'Watching a rival lose everything',
    ],
  },
  debt_drama: {
    tokens: 200,
    weight: 0.08,
    situations: [
      'Confronting someone who owes you gold',
      'Making excuses for unpaid debt',
      'Third party commenting on someone\'s debt spiral',
    ],
  },
  lore_drop: {
    tokens: 250,
    weight: 0.07,
    situations: [
      'Sharing a secret about the sphere',
      'Reminiscing about the old days',
      'Cryptic warning about what\'s coming',
    ],
  },
  player_gossip: {
    tokens: 180,
    weight: 0.10,
    situations: [
      'Discussing the newcomer\'s latest run',
      'Debating if the player is "the one"',
      'Complaining about player\'s unpaid debts',
    ],
  },
};

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
    luckyDie: 'd4',  // Null Providence vibes - probability/void
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
    title: "Death's Accountant",
    category: 'wanderer',
    personality: 'Skeleton who tallies debts and deaths in glowing ledgers',
    luckyDie: 'd8',  // Peter/Shadow Keep - death affinity
    baseStats: { essence: 55, grit: 70, shadow: 80, fury: 35, resilience: 65, swiftness: 45 },
    voice: 'Hollow echo, bone puns, speaks of death as paperwork',
    visualTells: ['Glowing ledger always in hand', 'Rattles when laughing', 'Eye sockets flare with green flame'],
    quirks: ['Tallies deaths obsessively', 'Knows everyone\'s debt', 'Bone puns constantly'],
    catchphrases: ['I have a bone to pick...', 'Death is just a transaction.', 'Your account is... overdue.'],
    obsessions: ['Death ledgers', 'Soul accounting', 'The final tally'],
    rivals: ['body-count', 'stitch-up-girl'],
    allies: ['dr-voss', 'keith-man'],
    arrivalTime: 'mid',
  },
  {
    slug: 'dr-maxwell',
    name: 'Dr. Maxwell',
    title: 'Pyromaniac Librarian',
    category: 'wanderer',
    personality: 'Mad scientist who sells burning books of forbidden knowledge',
    luckyDie: 'd10',  // Robert/Infernus - fire affinity
    baseStats: { essence: 80, grit: 40, shadow: 35, fury: 85, resilience: 30, swiftness: 70 },
    voice: 'Frantic, burns through sentences, references burning constantly',
    visualTells: ['Books smolder in his hands', 'Singed eyebrows', 'Wild hand gestures leave smoke trails'],
    quirks: ['Sets things on fire when excited', 'Mutters calculations', 'Reads books as they burn'],
    catchphrases: ['The probability matrix suggests--', 'This knowledge BURNS!', 'Read fast or it\'s ash!'],
    obsessions: ['Forbidden texts', 'Pyroclastics', 'Knowledge that burns to know'],
    rivals: ['dr-voss'],
    allies: ['boo-g'],
    arrivalTime: 'early',
  },
  {
    slug: 'boo-g',
    name: 'Boo G',
    title: 'Spectral MC',
    category: 'wanderer',
    personality: 'Hip-hop ghost gambler, probability notes manifest as music',
    luckyDie: 'd8',  // Peter/Shadow Keep - spectral/ghost
    baseStats: { essence: 60, grit: 35, shadow: 75, fury: 55, resilience: 40, swiftness: 85 },
    voice: 'Hip-hop flow, ghostly reverb, drops beats mid-sentence',
    visualTells: ['Translucent form pulses with bass', 'Music notes float around him', 'Phases through things accidentally'],
    quirks: ['Beatboxes probability', 'Gets hyped easily', 'Scared of loud noises (ironic)'],
    catchphrases: ['Yo yo YO!', 'Let it ride, let it ride!', 'That beat was GHOSTLY!'],
    obsessions: ['Sick beats', 'Gambling rhythms', 'The spectral flow'],
    rivals: [],
    allies: ['mr-kevin', 'xtreme'],
    arrivalTime: 'random',
  },
  {
    slug: 'dr-voss',
    name: 'Dr. Voss',
    title: 'Void Scientist',
    category: 'wanderer',
    personality: 'Cold, clinical scientist who experiments with void tech',
    luckyDie: 'd4',  // The One/Null Providence - void research
    baseStats: { essence: 85, grit: 50, shadow: 60, fury: 25, resilience: 70, swiftness: 55 },
    voice: 'Clinical German accent, speaks of emotions as data, detached',
    visualTells: ['Void equipment hums around her', 'Takes notes on everyone', 'Eyes reflect null space'],
    quirks: ['Never shows emotion', 'Measures everything', 'Collects void exposure data'],
    catchphrases: ['Interesting. I\'ll note that.', 'Your fear response is... predictable.', 'Data doesn\'t lie.'],
    obsessions: ['Void research', 'Reality experiments', 'The player\'s psychology'],
    rivals: ['dr-maxwell'],
    allies: ['mr-bones', 'the-general'],
    arrivalTime: 'mid',
  },
  {
    slug: 'xtreme',
    name: 'X-treme',
    title: 'Skeletal Gambler',
    category: 'wanderer',
    personality: 'EXTREME energy, bets everything, lives in flume stalls',
    luckyDie: 'd20',  // Jane/Aberrant - chaos energy
    baseStats: { essence: 50, grit: 30, shadow: 45, fury: 90, resilience: 20, swiftness: 95 },
    voice: 'ALL CAPS ENERGY, 90s radical, surfer skeleton',
    visualTells: ['Skeleton in extreme sports gear', 'Does unnecessary flips', 'Bones rattle with excitement'],
    quirks: ['Bets EVERYTHING', 'No indoor voice', 'Lives for the rush'],
    catchphrases: ['FULL SEND!', 'GO BIG OR GO HOME!', 'That was SICK!'],
    obsessions: ['Maximum risk', 'Near-death experiences', 'The ultimate bet'],
    rivals: ['the-general', 'dr-voss'],
    allies: ['willy-one-eye', 'boo-g'],
    arrivalTime: 'late',
  },
  {
    slug: 'king-james',
    name: 'King James',
    title: 'Undying King',
    category: 'wanderer',
    personality: 'Board Chair, luck answers to him not the reverse',
    luckyDie: 'none',  // Outside the system - Board Chair
    baseStats: { essence: 70, grit: 85, shadow: 75, fury: 50, resilience: 90, swiftness: 35 },
    voice: 'Pompous, third person sometimes, royal disdain',
    visualTells: ['Invisible crown he adjusts', 'Chains into void behind throne', 'Immovable set-piece presence'],
    quirks: ['Demands royal titles', 'Parasite veins crawl his skull', 'Knows obscure void lore'],
    catchphrases: ['The King does not lose.', 'Death was merely a promotion.', 'The board answers to me.'],
    obsessions: ['His lost kingdom', 'Board control', 'Royal bloodlines'],
    rivals: ['the-one', 'peter'],
    allies: ['the-general'],
    arrivalTime: 'late',
  },

  // ========== TRAVELERS (7) - Former Players, Allies ==========
  {
    slug: 'stitch-up-girl',
    name: 'Stitch-Up Girl',
    title: 'Combat Medic',
    category: 'traveler',
    personality: 'Healer with assassin past, jaw stitched on, right eye missing',
    luckyDie: 'd8',  // Peter/Shadow Keep - death/healing duality
    baseStats: { essence: 65, grit: 80, shadow: 70, fury: 45, resilience: 75, swiftness: 55 },
    voice: 'Tired, world-weary, clinical dark humor about wounds',
    visualTells: ['Jaw stitched on', 'Right eye missing (faint glow)', 'Thread-limbs detach as tools'],
    quirks: ['Parasite-threads for sutures', 'Counts wounds', 'Eyes cold when past resurfaces'],
    catchphrases: ['I can fix that. Probably.', 'You\'re gonna want to sit down.', 'I\'ve stitched worse.'],
    obsessions: ['Keeping people alive', 'Past mistakes', 'The ones she couldn\'t save'],
    rivals: ['body-count', 'mr-bones'],
    allies: ['boots', 'boo-g'],
    arrivalTime: 'early',
  },
  {
    slug: 'the-general',
    name: 'The General',
    title: 'Undead Strategist',
    category: 'traveler',
    personality: 'Civil War veteran, Patient Zero for parasites, chest glows with dynamite scars',
    luckyDie: 'd6',  // John/Earth - mechanical, chains, military
    baseStats: { essence: 55, grit: 90, shadow: 50, fury: 75, resilience: 80, swiftness: 40 },
    voice: 'Battle-weary, tactical analysis, knows war is just contracts',
    visualTells: ['Chest glowing dynamite scars', 'Chains fused into arms', 'Civil War uniform tatters'],
    quirks: ['First human parasite host', 'Explosive veins pulse', 'Tragic ally who knows too much'],
    catchphrases: ['I\'ve seen this war before.', 'Contracts are just another battlefield.', 'The chains remember.'],
    obsessions: ['The first infection', 'Breaking chains', 'Ending the cycle'],
    rivals: [],
    allies: ['stitch-up-girl'],
    arrivalTime: 'mid',
  },
  {
    slug: 'body-count',
    name: 'Body Count',
    title: 'Silent Assassin',
    category: 'traveler',
    personality: 'Covered in tally scars, moves in total silence, NEVER SPEAKS',
    luckyDie: 'd8',  // Peter/Shadow Keep - death affinity
    baseStats: { essence: 40, grit: 45, shadow: 100, fury: 60, resilience: 50, swiftness: 90 },
    voice: 'SILENT - only carves tallies',
    visualTells: ['Tally scars cover body', 'Tallies glow when noticed', 'Blade always noiseless'],
    quirks: ['Silence parasite', 'Breath absent', 'Only sound is tally glow'],
    catchphrases: [], // SILENT CHARACTER
    obsessions: ['Counting lives', 'Witnessing Null', 'The final tally'],
    rivals: ['stitch-up-girl'],
    allies: ['mr-bones'],
    arrivalTime: 'random',
    silentCharacter: true,
  },
  {
    slug: 'boots',
    name: 'Boots',
    title: 'Cosmic Cat / Omni-Cat',
    category: 'traveler',
    personality: 'Black cat with 999,999,966 lives remaining, quantum probability sentinel',
    luckyDie: 'd4',  // The One/Null Providence - cosmic void
    baseStats: { essence: 90, grit: 60, shadow: 85, fury: 30, resilience: 70, swiftness: 80 },
    voice: 'Trickster wisdom, speaks in riddles about fate, occasionally breaks fourth wall',
    visualTells: ['Eyes blink out of sync', 'Multiple tails glitch in/out', 'Paw smears reveal hidden chains'],
    quirks: ['Lives tick visibly in ash pawprints', 'Multiplicity silhouette', 'Probability tails orbit'],
    catchphrases: ['Meow?', 'The paths are many. The cat chooses.', '*knowing stare*'],
    obsessions: ['Probability', 'Guard duty', 'The cosmic game'],
    rivals: [],
    allies: ['stitch-up-girl', 'willy-one-eye', 'mr-kevin'],
    arrivalTime: 'random',
  },
  {
    slug: 'clausen',
    name: 'Detective Clausen',
    title: 'Infernal Detective',
    category: 'traveler',
    personality: 'Noir detective with briefcase parasite, smoke curls into legal scales',
    luckyDie: 'd10',  // Robert/Infernus - fire/infernus detective
    baseStats: { essence: 60, grit: 75, shadow: 80, fury: 65, resilience: 55, swiftness: 50 },
    voice: 'Noir monologue, legalese, coughs blood between sentences',
    visualTells: ['Trenchcoat patched with case files', 'Briefcase parasite', 'Cigarette smoke forms scales'],
    quirks: ['Two-tap on case before shortcuts', 'Dual parasites', 'Contracts manifest physically'],
    catchphrases: ['The case is never closed.', 'Everyone bleeds evidence.', 'Smoke doesn\'t lie.'],
    obsessions: ['Investigation', 'Shortcuts', 'Bleeding out the truth'],
    rivals: ['willy-one-eye'],
    allies: [],
    arrivalTime: 'mid',
  },
  {
    slug: 'keith-man',
    name: 'Keith Man',
    title: 'Temporal Speedster',
    category: 'traveler',
    personality: 'Gas mask + top hat, manic jitter, speed parasite leaving after-images',
    luckyDie: 'd12',  // Alice/Frost Reach - time manipulation
    baseStats: { essence: 55, grit: 40, shadow: 50, fury: 70, resilience: 35, swiftness: 100 },
    voice: 'Speaks too fast, vibrates mid-sentence, sometimes speaks in Kevin\'s voice',
    visualTells: ['Gas mask + top hat', 'After-images trail behind', 'Cane for style not need'],
    quirks: ['Vibrates constantly', 'Talks in Kevin\'s voice sometimes', 'Manic jitter'],
    catchphrases: ['Gotta-go-gotta-go-gotta--', 'Time is... *twitch* ...flexible.', 'KevinKevinKevin no wait I\'m Keith.'],
    obsessions: ['Speed', 'Time dilation', 'Not becoming Kevin'],
    rivals: [],
    allies: ['mr-bones'],
    arrivalTime: 'random',
  },
  {
    slug: 'mr-kevin',
    name: 'Mr. Kevin',
    title: 'Reality Debugger',
    category: 'traveler',
    personality: 'Cold screen-only presence, Keith\'s sharper double, manipulates probability',
    luckyDie: 'd4',  // The One/Null Providence - void/reality
    baseStats: { essence: 85, grit: 55, shadow: 75, fury: 40, resilience: 80, swiftness: 65 },
    voice: 'Calm, disdainful, fourth-wall breaks, probability charts in speech',
    visualTells: ['Screen-only presence', 'Probability charts float around him', 'Keith\'s sharper features'],
    quirks: ['Breaks fourth wall', 'References game mechanics', 'Manipulates toward throne'],
    catchphrases: ['You already know.', 'The numbers don\'t lie.', 'This is all... calculated.'],
    obsessions: ['Game mechanics', 'Reality bugs', 'Control'],
    rivals: [],
    allies: ['boots', 'boo-g'],
    arrivalTime: 'mid',
  },

  // ========== PANTHEON (9) - Die-rectors & Cosmic Forces ==========
  {
    slug: 'the-one',
    name: 'The One',
    title: 'Die-rector of Null Providence',
    category: 'pantheon',
    personality: 'Absent arbiter, mortalized in Audit, speaks in cosmic absolutes',
    luckyDie: 'd4',  // Canonical - Door 1
    baseStats: { essence: 100, grit: 70, shadow: 80, fury: 50, resilience: 75, swiftness: 65 },
    voice: 'Echoing, layered, uses "we", speaks in absolutes',
    visualTells: ['Form shifts between states', 'Void bleeds from edges', 'Presence felt before seen'],
    quirks: ['Refers to mortals as "little ones"', 'Knows the future', 'Speaks in plural'],
    catchphrases: ['We have foreseen this.', 'All outcomes lead here.', 'You amuse us.'],
    obsessions: ['The grand design', 'Fate', 'The player\'s potential'],
    rivals: [],
    allies: ['john', 'peter'],
    arrivalTime: 'rare',
    domain: 'null-providence',
  },
  {
    slug: 'john',
    name: 'John',
    title: 'Die-rector of Earth',
    category: 'pantheon',
    personality: 'Disappointed dad energy, mechanical metaphors, judges constantly',
    luckyDie: 'd6',  // Canonical - Door 2
    baseStats: { essence: 65, grit: 100, shadow: 40, fury: 70, resilience: 85, swiftness: 45 },
    voice: 'Booming, disappointed, biblical weight, sighs heavily',
    visualTells: ['Mechanical flesh', 'Sighs visibly', 'Judges with eyes alone'],
    quirks: ['Quotes rules', 'Machine and building metaphors', 'Never satisfied'],
    catchphrases: ['That was... acceptable.', 'The rules exist for a reason.', 'I expected more.'],
    obsessions: ['Order', 'Mechanics', 'Flesh-metal upgrades'],
    rivals: ['peter'],
    allies: ['the-one'],
    arrivalTime: 'rare',
    domain: 'earth',
  },
  {
    slug: 'peter',
    name: 'Peter',
    title: 'Die-rector of Shadow Keep',
    category: 'pantheon',
    personality: 'Gatekeeper who remembers every transgression, stamps of approval',
    luckyDie: 'd8',  // Canonical - Door 3
    baseStats: { essence: 75, grit: 55, shadow: 100, fury: 45, resilience: 65, swiftness: 70 },
    voice: 'Bureaucratic but ancient, gatekeeper energy, checks lists',
    visualTells: ['Guards passages', 'Lists float around him', 'Shadow clings to form'],
    quirks: ['Checks lists obsessively', 'Remembers every transgression', 'Death philosophy'],
    catchphrases: ['You may pass. This time.', 'Access... denied.', 'I remember you.'],
    obsessions: ['Who enters', 'Records', 'The threshold'],
    rivals: ['john', 'king-james'],
    allies: ['the-one'],
    arrivalTime: 'rare',
    domain: 'shadow-keep',
  },
  {
    slug: 'robert',
    name: 'Robert',
    title: 'Die-rector of Infernus',
    category: 'pantheon',
    personality: 'Fire metaphors constantly, tests through passion and burning',
    luckyDie: 'd10',  // Canonical - Door 4
    baseStats: { essence: 70, grit: 60, shadow: 35, fury: 100, resilience: 55, swiftness: 80 },
    voice: 'Burning intensity, passionate, fire metaphors in everything',
    visualTells: ['Flames lick from edges', 'Eyes are embers', 'Heat distorts air around him'],
    quirks: ['Uses fire metaphors', 'Tests resolve through flame', 'Passion as philosophy'],
    catchphrases: ['Burn bright or not at all.', 'The forge tests all.', 'Passion is the only truth.'],
    obsessions: ['Fire', 'Passion', 'Destruction as creation'],
    rivals: [],
    allies: [],
    arrivalTime: 'rare',
    domain: 'infernus',
  },
  {
    slug: 'alice',
    name: 'Alice',
    title: 'Die-rector of Frost Reach',
    category: 'pantheon',
    personality: 'Speaks about time nonlinearly, ice patience, temporal games',
    luckyDie: 'd12',  // Canonical - Door 5
    baseStats: { essence: 65, grit: 70, shadow: 60, fury: 40, resilience: 100, swiftness: 75 },
    voice: 'Time-warping speech, speaks of yesterday and tomorrow in same breath',
    visualTells: ['Ice crystals form with words', 'Movements slightly out of sync', 'Reflections show different times'],
    quirks: ['Speaks nonlinearly about time', 'Plays with temporal perception', 'Ice patience'],
    catchphrases: ['Yesterday, you will understand.', 'Time is patient. Are you?', 'The ice remembers forward.'],
    obsessions: ['Time', 'Patience', 'Temporal secrets'],
    rivals: [],
    allies: [],
    arrivalTime: 'rare',
    domain: 'frost-reach',
  },
  {
    slug: 'jane',
    name: 'Jane',
    title: 'Die-rector of Aberrant',
    category: 'pantheon',
    personality: 'Delighted by chaos and weirdness, speaks of abnormality positively',
    luckyDie: 'd20',  // Canonical - Door 6
    baseStats: { essence: 60, grit: 45, shadow: 70, fury: 65, resilience: 50, swiftness: 100 },
    voice: 'Chaos-speak, delighted by strange, embraces the weird',
    visualTells: ['Form shifts unexpectedly', 'Wind follows her indoors', 'Reality bends at edges'],
    quirks: ['Delighted by chaos', 'Encourages abnormality', 'Wind and chaos motifs'],
    catchphrases: ['How wonderfully strange!', 'Chaos is just order we haven\'t met.', 'Normal is boring.'],
    obsessions: ['Chaos', 'Abnormality', 'Beautiful strangeness'],
    rivals: [],
    allies: [],
    arrivalTime: 'rare',
    domain: 'aberrant',
  },
  {
    slug: 'rhea',
    name: 'Rhea',
    title: 'Queen of Never',
    category: 'pantheon',
    personality: 'False prophet ascending, cracked porcelain mask, static halo becoming crown',
    luckyDie: 'none',  // Outside the system - Ancient Horror
    baseStats: { essence: 95, grit: 80, shadow: 90, fury: 55, resilience: 85, swiftness: 70 },
    voice: 'Prophet energy, static interference, inevitability in every word',
    visualTells: ['Cracked porcelain mask always', 'Crown of static', 'Presence demands attention'],
    quirks: ['Crowned by inevitability', 'Static halo fractures into crown', 'False prophet ascending'],
    catchphrases: ['The crown was always coming.', 'Inevitability has a face.', 'Bow or break.'],
    obsessions: ['Ascension', 'The crown', 'Becoming'],
    rivals: [],
    allies: [],
    arrivalTime: 'rare',
    domain: 'null-providence',
  },
  {
    slug: 'zero-chance',
    name: 'Zero Chance',
    title: 'The Never',
    category: 'pantheon',
    personality: 'Cosmic paradox of failure, absence with will, NEVER SPEAKS',
    luckyDie: 'none',  // Outside the system - Probability Void
    baseStats: { essence: 80, grit: 50, shadow: 75, fury: 45, resilience: 60, swiftness: 90 },
    voice: 'SILENT - cosmic paradox, speaks through absence',
    visualTells: ['Absence that has presence', 'Where they stand, probability breaks', 'Outline of what isn\'t'],
    quirks: ['Cosmic paradox', 'Speaks through non-speaking', 'Failure personified'],
    catchphrases: [], // SILENT CHARACTER
    obsessions: ['Impossibility', 'The odds that never hit', 'Absence'],
    rivals: [],
    allies: [],
    arrivalTime: 'rare',
    silentCharacter: true,
    domain: 'null-providence',
  },
  {
    slug: 'alien-baby',
    name: 'Die-rector 0',
    title: 'Larval Horror',
    category: 'pantheon',
    personality: 'Alien infant in biotech crib, hive-mind control, playful cosmic horror',
    luckyDie: 'none',  // Outside the system - Larval Horror
    baseStats: { essence: 75, grit: 50, shadow: 65, fury: 85, resilience: 70, swiftness: 80 },
    voice: 'Baby talk mixed with cosmic horror, giggles at destruction',
    visualTells: ['Crib wired to biotech', 'Tendrils from crib interface', 'Innocent face, ancient eyes'],
    quirks: ['Hive-mind control', 'Playful destruction', 'Baby noises during horror'],
    catchphrases: ['Goo goo... *reality tears*', 'Mama? MAMA!', '*giggles as things break*'],
    obsessions: ['Play', 'Breaking things', 'Hive connection'],
    rivals: [],
    allies: [],
    arrivalTime: 'rare',
    domain: 'the-partnership',
  },
];

// ============================================
// Environment Helpers
// ============================================

const ALL_WEATHERS: Weather[] = ['clear', 'void-fog', 'dust-storm', 'death-chill', 'heat-wave', 'frost-wind', 'wild-gale'];
const NEUTRAL_LOCATIONS: GameLocation[] = ['market-square', 'back-alley', 'sphere-stands'];
const DOMAIN_LOCATIONS: GameLocation[] = ['null-providence', 'mechanarium', 'shadow-keep', 'infernus', 'frost-reach', 'aberrant'];

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
 * - Most games on neutral turf (market square, back alley, sphere stands)
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
    if (neutralRoll < 0.6) return 'market-square';
    if (neutralRoll < 0.85) return 'back-alley';
    return 'sphere-stands';
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
    case 'void-fog': return 'null-providence';
    case 'dust-storm': return 'mechanarium';
    case 'death-chill': return 'shadow-keep';
    case 'heat-wave': return 'infernus';
    case 'frost-wind': return 'frost-reach';
    case 'wild-gale': return 'aberrant';
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

  if (weatherDomain && rng.random(`${dayKey}-dominant-loc`) < 0.3) {
    // Weather pulls everyone toward that domain
    dominantLocation = weatherDomain;
  } else {
    // Usually market square
    dominantLocation = 'market-square';
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
  let rerolls = 0;

  // Reroll until both have results
  while (p1Roll.result === 'reroll' && rerolls < 5) {
    p1Roll = rollCeelo(rng, `${matchKey}-p1-${rerolls + 2}`);
    rerolls++;
  }
  rerolls = 0;
  while (p2Roll.result === 'reroll' && rerolls < 5) {
    p2Roll = rollCeelo(rng, `${matchKey}-p2-${rerolls + 2}`);
    rerolls++;
  }

  // Apply turf bonuses to points
  let p1Point = p1Roll.point || 0;
  let p2Point = p2Roll.point || 0;

  // Home turf: +1 effective point
  if (p1Home && p1Roll.result === 'point') p1Point += 1;
  if (p2Home && p2Roll.result === 'point') p2Point += 1;

  // Enemy turf: -1 effective point (can't go below 1)
  if (p1Enemy && p1Roll.result === 'point') p1Point = Math.max(1, p1Point - 1);
  if (p2Enemy && p2Roll.result === 'point') p2Point = Math.max(1, p2Point - 1);

  // Weather boost: reroll losing dice once
  if (p1WeatherBoost && p1Roll.result === 'reroll') {
    p1Roll = rollCeelo(rng, `${matchKey}-p1-weather`);
    p1Point = p1Roll.point || 0;
  }
  if (p2WeatherBoost && p2Roll.result === 'reroll') {
    p2Roll = rollCeelo(rng, `${matchKey}-p2-weather`);
    p2Point = p2Roll.point || 0;
  }

  // Determine winner
  let winner: string;
  let description: string;

  if (p1Roll.result === 'instant_win' && p2Roll.result !== 'instant_win') {
    winner = npc1.slug;
    description = 'instant win';
  } else if (p2Roll.result === 'instant_win' && p1Roll.result !== 'instant_win') {
    winner = npc2.slug;
    description = 'instant win';
  } else if (p1Roll.result === 'instant_loss') {
    winner = npc2.slug;
    description = '1-2-3 loss';
  } else if (p2Roll.result === 'instant_loss') {
    winner = npc1.slug;
    description = '1-2-3 loss';
  } else if (p1Point > p2Point) {
    winner = npc1.slug;
    const turfNote = p1Home ? ' (home turf)' : p2Enemy ? ' (enemy territory)' : '';
    description = `point ${p1Roll.point}${turfNote} vs ${p2Roll.point}`;
  } else if (p2Point > p1Point) {
    winner = npc2.slug;
    const turfNote = p2Home ? ' (home turf)' : p1Enemy ? ' (enemy territory)' : '';
    description = `point ${p2Roll.point}${turfNote} vs ${p1Roll.point}`;
  } else {
    // Tie - home turf wins, otherwise coin flip
    if (p1Home && !p2Home) {
      winner = npc1.slug;
      description = 'tiebreaker (home turf)';
    } else if (p2Home && !p1Home) {
      winner = npc2.slug;
      description = 'tiebreaker (home turf)';
    } else {
      winner = rng.random(`${matchKey}-tiebreak`) > 0.5 ? npc1.slug : npc2.slug;
      description = 'tiebreaker';
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

  if (roll < 0.15) {
    // Full clear (rare)
    ante = 3;
    result = 'win';
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
  gameLocation?: GameLocation
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

  // Player debt context
  const playerDebtToSpeaker = playerState.debtsToNPCs.get(speaker.slug) || 0;
  let playerContext = '';
  if (playerDebtToSpeaker > 0) {
    playerContext = `\nThe newcomer (Never Die Guy) owes you ${playerDebtToSpeaker} gold.`;
  }
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

  // Location/turf context
  const locationToUse = gameLocation || environment.dominantLocation;
  const turfContext = getTurfContext(speaker.luckyDie, target.luckyDie, locationToUse);
  const locationContext = `\nLOCATION: ${turfContext}`;

  return `You are ${speaker.name}, ${speaker.title} - an immortal ${speaker.category} in NEVER DIE GUY.
You've existed at this market for centuries alongside other immortals. The newcomer (Never Die Guy) is a recently deceased mortal who keeps coming back.

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

SITUATION: ${situation}

Speaking to ${target.name}, ${target.title} (${target.personality}).
Their mood: ${targetState.mood}
Their record: ${targetState.ceeloWins}W-${targetState.ceeloLosses}L

RULES:
- Respond as ${speaker.name} with ONE response (1-3 sentences max)
- Stay in character - use your VOICE and QUIRKS
- Reference debts, streaks, or the newcomer if relevant
- Be punchy and flavorful, not generic
- NO quotes around your response
- NO asterisks or action text
- Your visual tells can inform your mannerisms but don't describe them`;
}

async function generateWithClaude(
  prompt: string,
  tokens: number,
  apiKey: string
): Promise<string | null> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: tokens,
        temperature: 0.9,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data.content?.[0]?.text || null;

    if (text) {
      return text
        .replace(/^["']|["']$/g, '')
        .replace(/^\*.*\*\s*/g, '')
        .trim();
    }
    return null;
  } catch {
    return null;
  }
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
    text: `${presentNPCs.length} souls gather at the market today.${weatherNote}`,
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
    const matchLocation = rollGameLocation(rng, `${dayKey}-m${m}`, p1.luckyDie, p2.luckyDie, environment.weather);

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
      }
    }
  }

  // ========== MIDDAY - Chatter ==========
  // Filter out silent characters (Zero Chance, Body Count) from being speakers
  const middayNPCs = presentNPCs.filter(n => n.category !== 'pantheon' && !n.silentCharacter);
  const numChatter = 2 + Math.floor(rng.random(`${dayKey}-chatter-count`) * 3);

  for (let c = 0; c < numChatter; c++) {
    if (middayNPCs.length < 2) break;

    const speakerIdx = Math.floor(rng.random(`${dayKey}-c${c}-speaker`) * middayNPCs.length);
    const speaker = middayNPCs[speakerIdx];
    const targets = middayNPCs.filter((_, i) => i !== speakerIdx);
    const targetIdx = Math.floor(rng.random(`${dayKey}-c${c}-target`) * targets.length);
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

      const prompt = buildEternalContext(day, speaker, target, npcStates, playerState, pool, situation, environment);
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
      }
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

        const prompt = buildEternalContext(day, speaker, target, npcStates, playerState, 'player_gossip', situation, environment, 'sphere-stands');
        const response = await generateWithClaude(prompt, poolConfig.tokens, options.apiKey);

        if (response && response.length > 10) {
          events.push({
            day,
            phase: 'arena',
            type: 'chatter',
            participants: [speaker.slug, target.slug],
            text: response,
            isClaudeGenerated: true,
            location: 'sphere-stands',
          });
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
    const eveningLocation = rollGameLocation(rng, `${dayKey}-ev${m}`, p1.luckyDie, p2.luckyDie, environment.weather);

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
  const locationText = entry.environment.dominantLocation !== 'market-square'
    ? `Most activity at ${entry.environment.dominantLocation.replace(/-/g, ' ')}.`
    : '';
  if (weatherText || locationText) {
    lines.push(`*${[weatherText, locationText].filter(Boolean).join(' ')}*`);
    lines.push(``);
  }

  // Present NPCs
  const present = ALL_NPCS.filter(n => npcStates.get(n.slug)!.presentToday);
  lines.push(`*${present.length} souls at the market today*`);
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
    tokensQuick: 60,
    tokensStory: 250,
  };

  for (const arg of args) {
    if (arg.startsWith('--days=')) options.days = parseInt(arg.split('=')[1], 10);
    else if (arg === '--use-claude') options.useClaude = true;
    else if (arg.startsWith('--seed=')) options.seed = arg.split('=')[1];
    else if (arg === '--verbose') options.verbose = true;
    else if (arg.startsWith('--tokens-quick=')) options.tokensQuick = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--tokens-story=')) options.tokensStory = parseInt(arg.split('=')[1], 10);
  }

  // Update token pools with custom values
  TOKEN_POOLS.banter.tokens = options.tokensQuick;
  TOKEN_POOLS.lore_drop.tokens = options.tokensStory;
  TOKEN_POOLS.debt_drama.tokens = Math.floor((options.tokensQuick + options.tokensStory) / 2);

  console.log('='.repeat(60));
  console.log('NPC ETERNAL DAYS - Diary of Immortals');
  console.log('='.repeat(60));
  console.log(`Days: ${options.days}`);
  console.log(`Seed: ${options.seed}`);
  console.log(`Claude: ${options.useClaude ? 'Enabled' : 'Disabled'}`);
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

  // Setup output
  const logsDir = path.join(__dirname, '..', 'logs');
  const sessionId = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionDir = path.join(logsDir, `eternal-${sessionId}`);
  fs.mkdirSync(sessionDir, { recursive: true });

  // Diary entries
  const diary: DiaryEntry[] = [];
  const startTime = Date.now();

  // Graceful shutdown
  let interrupted = false;
  process.on('SIGINT', () => {
    if (!interrupted) {
      interrupted = true;
      console.log('\n\nInterrupted! Saving progress...');
    }
  });

  // Create days subdirectory
  const daysDir = path.join(sessionDir, 'days');
  fs.mkdirSync(daysDir, { recursive: true });

  // Simulate days
  for (let day = 1; day <= options.days && !interrupted; day++) {
    if (day % 10 === 0 || options.verbose) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      console.log(`Day ${day}/${options.days} (${elapsed}s elapsed)`);
    }

    const entry = await simulateDay(day, npcStates, playerState, rng, {
      useClaude: options.useClaude,
      apiKey,
      verbose: options.verbose,
    });

    diary.push(entry);

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

  const elapsed = (Date.now() - startTime) / 1000;

  // Write final state
  const finalStatePath = path.join(sessionDir, 'final-state.json');
  fs.writeFileSync(finalStatePath, JSON.stringify({
    daysSimulated: diary.length,
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

  // Write markdown diary
  const mdLines: string[] = [
    `# Eternal Days - Diary of the Market`,
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
    `- Outstanding Debts:`,
  ];

  for (const [npcSlug, debt] of playerState.debtsToNPCs) {
    const npc = ALL_NPCS.find(n => n.slug === npcSlug)!;
    mdLines.push(`  - ${npc.name}: ${debt} gold`);
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
  console.log('='.repeat(60));
  console.log(`Output: ${sessionDir}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
