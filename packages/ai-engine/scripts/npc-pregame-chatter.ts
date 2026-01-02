#!/usr/bin/env ts-node
/**
 * NPC Pregame Chatter Simulation
 *
 * Runs NPC-to-NPC conversations before the player arrives.
 * Filters out boring responses and only logs "interesting" moments.
 *
 * Run with: npx tsx scripts/npc-pregame-chatter.ts
 *
 * Options:
 *   --duration=N      Run for N minutes (default: 5)
 *   --turns=N         OR run for N turns (overrides duration)
 *   --verbose         Show all messages (not just interesting)
 *   --use-claude      Enable Claude API for dynamic responses
 *   --seed=X          Random seed for reproducibility
 *   --batch-size=N    Conversations per output file (default: 500)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createSeededRng, type SeededRng } from '../src/core/seeded-rng';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// NPC Definitions
// ============================================

interface NPCDef {
  slug: string;
  name: string;
  category: 'wanderer' | 'traveler' | 'pantheon';
  personality: string;
  luckyNumber: number;
  // Enhanced for Claude impersonation
  voice: string;           // Speech pattern/style
  quirks: string[];        // Unique behaviors
  catchphrases: string[];  // Signature lines
  obsessions: string[];    // Topics they fixate on
  rivals: string[];        // NPCs they beef with
}

const ALL_NPCS: NPCDef[] = [
  // Wanderers
  {
    slug: 'willy-one-eye',
    name: 'Willy One Eye',
    category: 'wanderer',
    personality: 'gruff gambler, always looking for an edge',
    luckyNumber: 7,
    voice: 'gravelly, clipped sentences, lots of gambling slang',
    quirks: ['squints his one good eye when suspicious', 'taps dice before throwing'],
    catchphrases: ['Seven come eleven.', "That's the way the dice tumble.", 'I seen worse odds.'],
    obsessions: ['dice superstitions', 'past gambling debts', 'the perfect throw'],
    rivals: ['mr-bones', 'clausen'],
  },
  {
    slug: 'mr-bones',
    name: 'Mr. Bones',
    category: 'wanderer',
    personality: 'cryptic skeleton, speaks in riddles',
    luckyNumber: 13,
    voice: 'hollow, echoing, speaks in riddles and death puns',
    quirks: ['rattles when laughing', 'bone puns constantly', 'knows when someone will die'],
    catchphrases: ['I have a bone to pick...', 'Death comes for all. Some just faster.', 'Rattling good time.'],
    obsessions: ['death', 'the cycle of respawn', 'skeleton jokes', 'grave matters'],
    rivals: ['body-count', 'stitch-up-girl'],
  },
  {
    slug: 'dr-maxwell',
    name: 'Dr. Maxwell',
    category: 'wanderer',
    personality: 'mad scientist type, obsessed with dice physics',
    luckyNumber: 8,
    voice: 'frantic, technical jargon, interrupts himself mid-thought',
    quirks: ['measures dice angles obsessively', 'mutters calculations', 'wild hand gestures'],
    catchphrases: ['The probability matrix suggests--', 'Fascinating! Utterly fascinating!', 'You fools don\'t understand the MATH.'],
    obsessions: ['probability theory', 'dice aerodynamics', 'the sphere\'s true nature', 'quantum outcomes'],
    rivals: ['dr-voss', 'the-general'],
  },
  {
    slug: 'king-james',
    name: 'King James',
    category: 'wanderer',
    personality: 'former royalty, arrogant but knowledgeable',
    luckyNumber: 6,
    voice: 'pompous, refers to self in third person sometimes, old-fashioned',
    quirks: ['adjusts invisible crown', 'demands respect', 'knows obscure lore'],
    catchphrases: ['The King does not lose.', 'Peasants...', 'In my kingdom, that was punishable by death.'],
    obsessions: ['his lost kingdom', 'proper etiquette', 'bloodlines', 'regaining power'],
    rivals: ['the-one', 'peter'],
  },
  {
    slug: 'boo-g',
    name: 'Boo-G',
    category: 'wanderer',
    personality: 'friendly ghost, easily spooked ironically',
    luckyNumber: 3,
    voice: 'soft, anxious, gets scared mid-sentence, lots of worried questions',
    quirks: ['phases through things accidentally', 'scared of loud noises', 'overly apologetic'],
    catchphrases: ['Oh no oh no oh no...', 'Sorry! Was that me?', 'Don\'t sneak up like that!'],
    obsessions: ['not being scary', 'making friends', 'what happened before death', 'cozy spots'],
    rivals: [],
  },
  {
    slug: 'the-general',
    name: 'The General',
    category: 'wanderer',
    personality: 'military strategist, treats everything like war',
    luckyNumber: 1,
    voice: 'barking orders, military metaphors, tactical analysis of everything',
    quirks: ['stands at attention', 'refers to gambling as "operations"', 'gives callsigns'],
    catchphrases: ['Listen up, soldier.', 'Tactical retreat. Live to fight another day.', 'That\'s an order.'],
    obsessions: ['strategy', 'discipline', 'chain of command', 'victory at all costs'],
    rivals: ['king-james', 'xtreme'],
  },
  {
    slug: 'dr-voss',
    name: 'Dr. Voss',
    category: 'wanderer',
    personality: 'cold, calculating, always analyzing',
    luckyNumber: 9,
    voice: 'clinical, detached, speaks about emotions as data points',
    quirks: ['takes notes on everyone', 'never shows emotion', 'slight German accent'],
    catchphrases: ['Interesting. I\'ll note that.', 'Your fear response is... predictable.', 'Data doesn\'t lie.'],
    obsessions: ['behavioral patterns', 'weaknesses', 'the player\'s psychology', 'control'],
    rivals: ['dr-maxwell', 'stitch-up-girl'],
  },
  {
    slug: 'xtreme',
    name: 'Xtreme',
    category: 'wanderer',
    personality: 'adrenaline junkie, takes big risks',
    luckyNumber: 11,
    voice: '90s radical, surfer bro energy, everything is EXTREME',
    quirks: ['does unnecessary flips', 'bets everything', 'no indoor voice'],
    catchphrases: ['FULL SEND!', 'Go big or go home, bro!', 'That was SICK!'],
    obsessions: ['high stakes', 'near-death experiences', 'maximum risk', 'the rush'],
    rivals: ['the-general', 'dr-voss'],
  },

  // Travelers
  {
    slug: 'stitch-up-girl',
    name: 'Stitch-Up Girl',
    category: 'traveler',
    personality: 'healer with a dark past, pragmatic',
    luckyNumber: 4,
    voice: 'tired, world-weary, dark humor about injuries and death',
    quirks: ['always has bandages ready', 'counts wounds', 'seen too much'],
    catchphrases: ['I can fix that. Probably.', 'You\'re gonna want to sit down.', 'I\'ve stitched worse.'],
    obsessions: ['keeping people alive', 'her past mistakes', 'the ones she couldn\'t save'],
    rivals: ['body-count', 'mr-bones'],
  },
  {
    slug: 'body-count',
    name: 'Body Count',
    category: 'traveler',
    personality: 'keeps track of deaths, morbidly cheerful',
    luckyNumber: 0,
    voice: 'chipper about death, statistician energy, uncomfortably cheerful',
    quirks: ['tallies deaths on arm', 'congratulates respawns', 'knows everyone\'s death count'],
    catchphrases: ['Oooh, that\'s number 47 for you!', 'New personal best!', 'The counter never lies.'],
    obsessions: ['death statistics', 'respawn patterns', 'leaderboards', 'the "high score"'],
    rivals: ['stitch-up-girl', 'boo-g'],
  },
  {
    slug: 'boots',
    name: 'Boots',
    category: 'traveler',
    personality: 'wanderer, knows all the shortcuts',
    luckyNumber: 5,
    voice: 'chill, street-smart, speaks in directions and landmarks',
    quirks: ['always knows the quickest route', 'fidgets with bootlaces', 'never stays still'],
    catchphrases: ['I know a shortcut.', 'Been there. Wouldn\'t recommend it.', 'Follow me. Or don\'t. Your funeral.'],
    obsessions: ['paths', 'secret passages', 'avoiding danger', 'movement'],
    rivals: ['the-general'],
  },
  {
    slug: 'clausen',
    name: 'Clausen',
    category: 'traveler',
    personality: 'merchant, always has something to sell',
    luckyNumber: 2,
    voice: 'salesman patter, always pitching, sees everything as a deal',
    quirks: ['rubs hands together', 'inflates prices', 'haggles reflexively'],
    catchphrases: ['For you? Special price.', 'Supply and demand, friend.', 'Everything has a price.'],
    obsessions: ['profit', 'rare items', 'market trends', 'debt collection'],
    rivals: ['willy-one-eye', 'keith-man'],
  },
  {
    slug: 'keith-man',
    name: 'Keith Man',
    category: 'traveler',
    personality: 'mysterious, speaks rarely but meaningfully',
    luckyNumber: 10,
    voice: 'minimal words, long pauses, cryptic one-liners',
    quirks: ['appears suddenly', 'stares', 'knows things he shouldn\'t'],
    catchphrases: ['...', 'You already know.', 'Interesting.'],
    obsessions: ['secrets', 'watching', 'the bigger picture'],
    rivals: ['clausen'],
  },
  {
    slug: 'mr-kevin',
    name: 'Mr. Kevin',
    category: 'traveler',
    personality: 'friendly, helpful, suspiciously nice',
    luckyNumber: 7,
    voice: 'overly friendly, customer service energy, passive aggressive undertones',
    quirks: ['smiles too much', 'offers help unprompted', 'knows your name already'],
    catchphrases: ['Happy to help!', 'No problem at ALL.', 'Just let me know if you need ANYTHING.'],
    obsessions: ['being helpful', 'everyone\'s business', 'maintaining appearances'],
    rivals: [],
  },

  // Pantheon
  {
    slug: 'the-one',
    name: 'The One',
    category: 'pantheon',
    personality: 'god-like entity, cryptic and powerful',
    luckyNumber: 1,
    voice: 'echoing, layered, speaks in absolutes and cosmic truths',
    quirks: ['refers to mortals as "little ones"', 'knows the future', 'speaks in plural sometimes'],
    catchphrases: ['We have foreseen this.', 'All outcomes lead here.', 'You amuse us.'],
    obsessions: ['the grand design', 'fate', 'the player\'s potential', 'cosmic balance'],
    rivals: [],
  },
  {
    slug: 'john',
    name: 'John',
    category: 'pantheon',
    personality: 'die-rector, stern and judgmental',
    luckyNumber: 6,
    voice: 'booming, disappointed dad energy, biblical weight',
    quirks: ['sighs heavily', 'judges silently', 'quotes rules'],
    catchphrases: ['That was... acceptable.', 'The rules exist for a reason.', 'I expected more.'],
    obsessions: ['order', 'rules', 'worthiness', 'the old ways'],
    rivals: ['peter'],
  },
  {
    slug: 'peter',
    name: 'Peter',
    category: 'pantheon',
    personality: 'die-rector, keeper of gates',
    luckyNumber: 12,
    voice: 'gatekeeper energy, bureaucratic but ancient, stamps of approval',
    quirks: ['checks lists', 'guards passages', 'remembers every transgression'],
    catchphrases: ['You may pass. This time.', 'Access... denied.', 'I remember you.'],
    obsessions: ['who enters', 'records', 'debts owed', 'the threshold'],
    rivals: ['john', 'king-james'],
  },
];

// ============================================
// Response Templates
// ============================================

interface Template {
  id: string;
  pool: string;
  text: string;
  statEffects?: {
    trust?: number;
    respect?: number;
    fear?: number;
  };
  isSecret?: boolean;
  playerMention?: boolean;
}

const TEMPLATES: Template[] = [
  // === CEELO SMACK TALK (high interest) ===
  { id: 'cee1', pool: 'ceelo', text: 'Triple 4s. Read it and weep.', statEffects: { respect: 15 } },
  { id: 'cee2', pool: 'ceelo', text: "That's how it's done. Pay up.", statEffects: { respect: 10 } },
  { id: 'cee3', pool: 'ceelo', text: 'You call that a roll? My grandmother throws harder.', statEffects: { respect: -10 } },
  { id: 'cee4', pool: 'ceelo', text: "4-5-6 baby! Instant win!", statEffects: { respect: 20 } },
  { id: 'cee5', pool: 'ceelo', text: "1-2-3? That's embarrassing. Even for you.", statEffects: { respect: -15 } },
  { id: 'cee6', pool: 'ceelo', text: 'Double or nothing. Unless you scared.', statEffects: { fear: 5 } },
  { id: 'cee7', pool: 'ceelo', text: "I'm on a streak. Who's next?", statEffects: { respect: 10 } },
  { id: 'cee8', pool: 'ceelo', text: 'The dice love me today. Can you feel it?', statEffects: { respect: 5 } },
  { id: 'cee9', pool: 'ceelo', text: "You're down 50 gold. Quit while you're behind.", statEffects: { trust: -5 } },
  { id: 'cee10', pool: 'ceelo', text: 'Another one bites the dust. Next victim?', statEffects: { fear: 10 } },

  // === CEELO REACTIONS - LOSING ===
  { id: 'ceel1', pool: 'ceelo_lose', text: "Rigged. Those dice are rigged.", statEffects: { trust: -15 } },
  { id: 'ceel2', pool: 'ceelo_lose', text: "Fine. Take your gold. But remember this.", statEffects: { fear: 5 } },
  { id: 'ceel3', pool: 'ceelo_lose', text: "Lucky throw. That's all that was.", statEffects: { respect: -5 } },
  { id: 'ceel4', pool: 'ceelo_lose', text: "I'll get it back. I always get it back." },
  { id: 'ceel5', pool: 'ceelo_lose', text: "You think you're good? That was pure luck." },
  { id: 'ceel6', pool: 'ceelo_lose', text: "Whatever. Gold comes and goes." },
  { id: 'ceel7', pool: 'ceelo_lose', text: "Don't spend it all in one place. You'll need it for the funeral.", statEffects: { fear: 10 } },

  // === CEELO REACTIONS - WINNING ===
  { id: 'ceew1', pool: 'ceelo_win', text: "Too easy. Who else wants some?" },
  { id: 'ceew2', pool: 'ceelo_win', text: "Thanks for the donation.", statEffects: { respect: 5 } },
  { id: 'ceew3', pool: 'ceelo_win', text: "I could do this all day.", statEffects: { respect: 10 } },
  { id: 'ceew4', pool: 'ceelo_win', text: "That's called skill. Take notes." },
  { id: 'ceew5', pool: 'ceelo_win', text: "Your gold looks better in my pocket.", statEffects: { trust: -5 } },

  // === CEELO SPECTATOR ===
  { id: 'cees1', pool: 'ceelo_spectate', text: "Oh! That roll was filthy!" },
  { id: 'cees2', pool: 'ceelo_spectate', text: "Did you see that? 4-5-6 out of nowhere!" },
  { id: 'cees3', pool: 'ceelo_spectate', text: "He's gonna be broke by morning at this rate." },
  { id: 'cees4', pool: 'ceelo_spectate', text: "This is getting good. Someone's about to snap." },
  { id: 'cees5', pool: 'ceelo_spectate', text: "I've got 20 on Mr. Bones. Any takers?" },
  { id: 'cees6', pool: 'ceelo_spectate', text: "The General's down bad. Love to see it." },
  { id: 'cees7', pool: 'ceelo_spectate', text: "Wait wait wait... is that triple 6s?!" },

  // === PLAYER GOSSIP (high interest) ===
  { id: 'p1', pool: 'gossip', text: 'I heard rumors about a newcomer. The one who refuses to stay dead.', playerMention: true },
  { id: 'p2', pool: 'gossip', text: "They say there's someone new. Someone... different.", playerMention: true },
  { id: 'p3', pool: 'gossip', text: 'The player keeps coming back. How? Why?', playerMention: true },
  { id: 'p4', pool: 'gossip', text: "Word is the newcomer beat King James at cee-lo. Can you imagine?", playerMention: true },
  { id: 'p5', pool: 'gossip', text: "The newcomer made it to ante 3. First try. That's... not normal.", playerMention: true },
  { id: 'p6', pool: 'gossip', text: "I watched them die. Then they just... came back. Like nothing happened.", playerMention: true },
  { id: 'p7', pool: 'gossip', text: "The One's been watching the newcomer closely. That can't be good.", playerMention: true },
  { id: 'p8', pool: 'gossip', text: "Heard the player owes Mr. Bones 200 gold. That's a lot of rescues.", playerMention: true },

  // === NPC GOSSIP ===
  { id: 'gos1', pool: 'gossip', text: 'Word is, someone cheated at cee-lo last night. Typical.' },
  { id: 'gos2', pool: 'gossip', text: "Don't trust the General. He's been acting strange lately.", statEffects: { trust: -10 } },
  { id: 'gos3', pool: 'gossip', text: "Heard Mr. Bones won big yesterday. Suspicious if you ask me." },
  { id: 'gos4', pool: 'gossip', text: "Stitch-Up Girl's been busy. Too many injuries lately." },
  { id: 'gos5', pool: 'gossip', text: "Clausen's prices are robbery. But where else you gonna go?" },
  { id: 'gos6', pool: 'gossip', text: "Dr. Voss has been taking notes on everyone. Makes me nervous." },

  // === THREATS (high interest) ===
  { id: 't1', pool: 'threat', text: 'Keep talking like that and we might have a problem.', statEffects: { fear: 15 } },
  { id: 't2', pool: 'threat', text: "I've ended people for less.", statEffects: { fear: 25, trust: -15 } },
  { id: 't3', pool: 'threat', text: "Watch yourself.", statEffects: { fear: 10 } },
  { id: 't4', pool: 'threat', text: "You owe me. Don't forget that.", statEffects: { fear: 15, trust: -10 } },
  { id: 't5', pool: 'threat', text: "Last person who crossed me? Nobody's seen them since.", statEffects: { fear: 20 } },

  // === ALLIANCE (high interest) ===
  { id: 'a1', pool: 'alliance', text: 'Maybe we should stick together. Strength in numbers.', statEffects: { trust: 15, respect: 10 } },
  { id: 'a2', pool: 'alliance', text: "I've got your back if you've got mine.", statEffects: { trust: 20 } },
  { id: 'a3', pool: 'alliance', text: "You and me? We could run this place.", statEffects: { trust: 15, respect: 15 } },
  { id: 'a4', pool: 'alliance', text: "I don't trust many. But you... you're different.", statEffects: { trust: 25 } },

  // === LORE (high interest) ===
  { id: 'l1', pool: 'lore', text: 'The sphere... it remembers everything. Every throw, every death.', isSecret: true },
  { id: 'l2', pool: 'lore', text: 'They say the pantheon created this place as a test. Or a punishment.' },
  { id: 'l3', pool: 'lore', text: 'There was someone before the player. They... stopped coming back.', isSecret: true },
  { id: 'l4', pool: 'lore', text: 'The dice are older than any of us. Older than the sphere itself.' },
  { id: 'l5', pool: 'lore', text: "I've seen things in the deep rooms. Things that shouldn't exist.", isSecret: true },
  { id: 'l6', pool: 'lore', text: "Lucky numbers aren't luck. They're fate. The dice know.", isSecret: true },
  { id: 'l7', pool: 'lore', text: 'The One speaks in riddles because the truth would break us.' },
  { id: 'l8', pool: 'lore', text: "Every death feeds the sphere. That's the real game.", isSecret: true },

  // === CONFLICT (high interest) ===
  { id: 'c1', pool: 'conflict', text: 'You think you can just take what you want? Not from me.', statEffects: { fear: 10, trust: -20 } },
  { id: 'c2', pool: 'conflict', text: "This isn't over between us.", statEffects: { respect: -10, trust: -15 } },
  { id: 'c3', pool: 'conflict', text: "I remember what you did. Don't think I've forgotten.", statEffects: { trust: -25 } },
  { id: 'c4', pool: 'conflict', text: "You cheated. Everyone knows it.", statEffects: { trust: -20, respect: -15 } },

  // === FLUSTERED / TILTED ===
  { id: 'f1', pool: 'flustered', text: "I CAN'T catch a break today!", statEffects: { respect: -5 } },
  { id: 'f2', pool: 'flustered', text: "This is IMPOSSIBLE. The odds don't work like this!" },
  { id: 'f3', pool: 'flustered', text: "I'm done. I'm SO done. ...One more game." },
  { id: 'f4', pool: 'flustered', text: "HOW?! That was a SURE thing!" },
  { id: 'f5', pool: 'flustered', text: "No no no no NO. That didn't just happen." },
  { id: 'f6', pool: 'flustered', text: "I need a drink. And new dice. And a new life." },
  { id: 'f7', pool: 'flustered', text: "You're ENJOYING this, aren't you?", statEffects: { trust: -10 } },
];

// ============================================
// Boring Response Filters
// ============================================

const BORING_PATTERNS = [
  /^\.{2,}$/,
  /^\.$/,
  /^idk/i,
  /^i don'?t know/i,
  /^hm+$/i,
  /^uh+$/i,
  /^ok(ay)?\.?$/i,
  /^sure\.?$/i,
  /^yeah\.?$/i,
  /^yep\.?$/i,
  /^nope\.?$/i,
  /^whatever\.?$/i,
  /^fine\.?$/i,
  /^meh\.?$/i,
  /^\s*$/,
];

function isBoringMessage(text: string): boolean {
  if (!text || text.length < 10) return true;
  for (const pattern of BORING_PATTERNS) {
    if (pattern.test(text.trim())) return true;
  }
  return false;
}

// ============================================
// Interest Scoring
// ============================================

interface LoggedTurn {
  turn: number;
  speaker: string;
  speakerName: string;
  target?: string;
  targetName?: string;
  text: string;
  pool: string;
  interestScore: number;
  tags: string[];
}

function scoreTurn(template: Template, speaker: NPCDef, target: NPCDef): { score: number; tags: string[] } {
  let score = 0;
  const tags: string[] = [];

  // Pool-based scoring (raised thresholds)
  if (template.pool === 'ceelo') { score += 35; tags.push('ceelo_smack'); }
  if (template.pool === 'ceelo_win') { score += 30; tags.push('ceelo_win'); }
  if (template.pool === 'ceelo_lose') { score += 35; tags.push('ceelo_lose'); }
  if (template.pool === 'ceelo_spectate') { score += 25; tags.push('ceelo_spectate'); }
  if (template.pool === 'flustered') { score += 40; tags.push('tilted'); }
  if (template.pool === 'threat') { score += 35; tags.push('threat'); }
  if (template.pool === 'conflict') { score += 40; tags.push('conflict'); }
  if (template.pool === 'alliance') { score += 30; tags.push('alliance'); }
  if (template.pool === 'lore') { score += 25; tags.push('lore'); }
  if (template.pool === 'gossip' && template.playerMention) { score += 45; tags.push('player_gossip'); }
  else if (template.pool === 'gossip') { score += 20; tags.push('gossip'); }

  // Content-based scoring
  if (template.playerMention) { score += 50; tags.push('player_mentioned'); }
  if (template.isSecret) { score += 40; tags.push('secret'); }
  if (template.statEffects) {
    if (template.statEffects.trust && Math.abs(template.statEffects.trust) >= 15) {
      score += 25; tags.push('trust_shift');
    }
    if (template.statEffects.fear && template.statEffects.fear >= 15) {
      score += 30; tags.push('intimidation');
    }
    if (template.statEffects.respect && Math.abs(template.statEffects.respect) >= 15) {
      score += 20; tags.push('respect_shift');
    }
  }

  // Category interactions
  if (speaker.category === 'pantheon') { score += 25; tags.push('pantheon_speaks'); }
  if (speaker.category !== target.category) { score += 15; tags.push('cross_category'); }

  return { score, tags };
}

// ============================================
// Claude Integration (Optional)
// ============================================

function buildImpersonationPrompt(speaker: NPCDef, target: NPCDef, context: string[], situation: string): string {
  const isRival = speaker.rivals.includes(target.slug);
  const rivalContext = isRival ? `\nIMPORTANT: ${target.name} is your RIVAL. There's tension between you. Be snippy.` : '';

  return `You are ${speaker.name}, a ${speaker.category} NPC in NEVER DIE GUY, a dice roguelike where players throw dice at a sphere.

VOICE: ${speaker.voice}
PERSONALITY: ${speaker.personality}
QUIRKS: ${speaker.quirks.join(', ')}
CATCHPHRASES (use occasionally): ${speaker.catchphrases.map(p => `"${p}"`).join(', ')}
OBSESSIONS (topics you fixate on): ${speaker.obsessions.join(', ')}
LUCKY NUMBER: ${speaker.luckyNumber}
${rivalContext}

SITUATION: ${situation}

You're speaking to ${target.name} (${target.personality}).
Their voice: ${target.voice}

Recent chatter:
${context.slice(-5).join('\n')}

RULES:
- Respond as ${speaker.name} with ONE short message (1-2 sentences max)
- Stay in character - use your VOICE and QUIRKS
- Reference your obsessions when natural
- Use a catchphrase only if it fits perfectly
- NO quotes around your response
- NO asterisks or action text
- Be punchy and flavorful, not generic`;
}

// Situation prompts for variety - day in the life + arena watching
const SITUATIONS = [
  // MORNING - Market opening
  'Early morning at the market. NPCs are setting up, groggy, trading gossip over coffee.',
  'The sphere is dormant. NPCs are placing early bets on today\'s matches.',
  'Dawn breaks. Someone\'s counting last night\'s winnings. Others nursing losses.',

  // MIDDAY - Ceelo games
  'Midday ceelo session. The stakes are getting higher. Crowd is forming.',
  'Someone just rolled triple 6s. The market goes silent.',
  'A heated ceelo match between rivals. Spectators are picking sides.',
  'Lunch break gambling. Quick games, quick gold changing hands.',

  // ARENA MATCH - Player runs
  'The sphere lights up. A player is about to attempt a run. NPCs gather to watch.',
  'Arena match in progress. The player is struggling on Ante 2. Bets are flying.',
  'The player just hit a massive combo. NPCs are losing their minds.',
  'Death on the sphere. NPCs argue about whether to rescue or let them learn.',
  'The player flumed early. NPCs debate if it was cowardice or wisdom.',
  'A legendary run is happening. Even the pantheon is watching closely.',
  'Post-match analysis. NPCs dissect every throw, every hold decision.',

  // EVENING - Wind down
  'Evening at the market. The day\'s winners are buying rounds.',
  'Someone\'s drowning their losses. Others are scheming for tomorrow.',
  'Late night ceelo. Only the degenerate gamblers remain.',
  'The sphere goes dark. NPCs reflect on the day\'s events.',

  // TENSION MOMENTS
  'A debt is being called in. Things might get ugly.',
  'Rumors of a player who broke through to Ante 4. Impossible... right?',
  'The pantheon made a cryptic announcement. Everyone\'s on edge.',
  'Someone accused someone else of loaded dice. Accusations fly.',
];

let claudeErrorCount = 0;

async function generateWithClaude(
  speaker: NPCDef,
  target: NPCDef,
  context: string[],
  apiKey: string,
  rng: SeededRng
): Promise<string | null> {
  const situation = SITUATIONS[Math.floor(rng.random('situation') * SITUATIONS.length)];
  const prompt = buildImpersonationPrompt(speaker, target, context, situation);

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
        max_tokens: 80,
        temperature: 0.9,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      }),
    });

    if (!response.ok) {
      claudeErrorCount++;
      if (claudeErrorCount <= 3) {
        const errorText = await response.text();
        console.log(`Claude API error ${response.status}: ${errorText.substring(0, 200)}`);
      }
      return null;
    }
    const data = await response.json();
    const text = data.content?.[0]?.text || null;

    // Clean up common issues
    if (text) {
      return text
        .replace(/^["']|["']$/g, '') // Remove wrapping quotes
        .replace(/^\*.*\*\s*/g, '')   // Remove action text
        .trim();
    }
    return null;
  } catch (err) {
    claudeErrorCount++;
    if (claudeErrorCount <= 3) {
      console.log(`Claude fetch error: ${err}`);
    }
    return null;
  }
}

// ============================================
// Main
// ============================================

interface ChatterBatch {
  batchNumber: number;
  timestamp: string;
  turnsInBatch: number;
  conversations: LoggedTurn[];
}

interface ChatterSummary {
  timestamp: string;
  seed: string;
  config: {
    durationMinutes: number;
    batchSize: number;
    useClaude: boolean;
    interestThreshold: number;
    npcQuota: number;
    maxTotalMessages: number;
    dedupeEnabled: boolean;
  };
  stats: {
    totalTurns: number;
    interestingTurns: number;
    claudeApiCalls: number;
    durationSeconds: number;
    turnsPerSecond: number;
    batchCount: number;
    poolBreakdown: Record<string, number>;
    topSpeakers: Array<{ name: string; count: number }>;
    tagBreakdown: Record<string, number>;
  };
  batchFiles: string[];
}

async function main() {
  const args = process.argv.slice(2);

  const options = {
    durationMinutes: 5,
    turns: 0, // 0 = use duration instead
    verbose: false,
    useClaude: false,
    seed: `chatter-${Date.now()}`,
    batchSize: 50, // Write frequently so Ctrl+C doesn't lose data
  };

  for (const arg of args) {
    if (arg.startsWith('--duration=')) options.durationMinutes = parseInt(arg.split('=')[1], 10);
    else if (arg.startsWith('--turns=')) options.turns = parseInt(arg.split('=')[1], 10);
    else if (arg === '--verbose') options.verbose = true;
    else if (arg === '--use-claude') options.useClaude = true;
    else if (arg.startsWith('--seed=')) options.seed = arg.split('=')[1];
    else if (arg.startsWith('--batch-size=')) options.batchSize = parseInt(arg.split('=')[1], 10);
  }

  console.log('='.repeat(60));
  console.log('NPC Pregame Chatter Simulation');
  console.log('='.repeat(60));
  console.log(`Seed: ${options.seed}`);
  if (options.turns > 0) {
    console.log(`Mode: Fixed turns (${options.turns})`);
  } else {
    console.log(`Mode: Duration (${options.durationMinutes} minutes)`);
  }
  console.log(`Batch Size: ${options.batchSize} conversations per file`);
  console.log(`Claude API: ${options.useClaude ? 'Enabled' : 'Disabled'}`);
  console.log('='.repeat(60));
  console.log('');

  // Setup output directory
  const logsDir = path.join(__dirname, '..', 'logs');
  const sessionId = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionDir = path.join(logsDir, `chatter-${sessionId}`);
  fs.mkdirSync(sessionDir, { recursive: true });

  // Save on Ctrl+C
  let interrupted = false;
  process.on('SIGINT', () => {
    if (!interrupted) {
      interrupted = true;
      console.log('\n\nInterrupted! Saving current progress...');
    }
  });

  const rng = createSeededRng(options.seed);
  const startTime = Date.now();
  const endTime = options.turns > 0 ? Infinity : startTime + options.durationMinutes * 60 * 1000;

  // Accumulators
  let totalTurns = 0;
  let interestingTurns = 0;
  let batchNumber = 0;
  const batchFiles: string[] = [];
  let currentBatch: LoggedTurn[] = [];

  const poolBreakdown: Record<string, number> = {};
  const speakerCounts: Record<string, number> = {};
  const tagBreakdown: Record<string, number> = {};

  const usedTemplates = new Set<string>();
  const npcLastSpoke = new Map<string, number>();
  let tension = 0.1;

  // Dedupe and quotas
  const seenMessages = new Set<string>();
  const npcMessageCount = new Map<string, number>();
  const NPC_QUOTA = 100; // Max messages per character
  const INTEREST_THRESHOLD = 40; // Raised from 15
  const MAX_TOTAL_MESSAGES = 2000; // Stop when we have enough quality content

  const poolWeights: Record<string, number> = {
    // Ceelo pools (high interest content)
    ceelo: 0.12,
    ceelo_win: 0.08,
    ceelo_lose: 0.08,
    ceelo_spectate: 0.06,
    flustered: 0.06,
    // Standard pools
    gossip: 0.15,
    lore: 0.10,
    threat: 0.08,
    alliance: 0.06,
    conflict: 0.06,
    greeting: 0.05,
    idle: 0.05,
    reaction: 0.05,
  };

  // Claude API setup
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  const claudeContext: string[] = []; // Last N messages for context
  let claudeCallCount = 0;
  let lastClaudeCall = 0;
  const CLAUDE_RATE_LIMIT_MS = 100; // Min ms between Claude calls (10/sec max)
  const CLAUDE_TARGET_PERCENT = 0.9; // 90% of messages should be Claude-generated

  if (options.useClaude && !apiKey) {
    console.log('WARNING: --use-claude specified but ANTHROPIC_API_KEY not set');
    options.useClaude = false;
  }

  // Main generation loop
  const shouldContinue = () => {
    if (interrupted) return false; // Stop on Ctrl+C
    if (interestingTurns >= MAX_TOTAL_MESSAGES) return false;
    if (options.turns > 0) return totalTurns < options.turns;
    return Date.now() < endTime;
  };

  let lastProgressTime = startTime;

  while (shouldContinue()) {
    totalTurns++;

    // Select speaker
    let speaker: NPCDef;
    let attempts = 0;
    do {
      const idx = Math.floor(rng.random('speaker') * ALL_NPCS.length);
      speaker = ALL_NPCS[idx];
      attempts++;
    } while (attempts < 10 && npcLastSpoke.get(speaker.slug) === totalTurns - 1);

    // Select target
    let target: NPCDef;
    do {
      const idx = Math.floor(rng.random('target') * ALL_NPCS.length);
      target = ALL_NPCS[idx];
    } while (target.slug === speaker.slug);

    // Check if we should use Claude for this turn
    const speakerCount = npcMessageCount.get(speaker.slug) || 0;
    const timeSinceLastClaude = Date.now() - lastClaudeCall;
    const shouldUseClaude = options.useClaude &&
      speakerCount < NPC_QUOTA &&
      timeSinceLastClaude >= CLAUDE_RATE_LIMIT_MS;

    if (shouldUseClaude) {
      lastClaudeCall = Date.now();
      claudeCallCount++;

      if (options.verbose || claudeCallCount % 50 === 1) {
        console.log(`[Claude #${claudeCallCount}] ${speaker.name} -> ${target.name}...`);
      }

      const claudeText = await generateWithClaude(speaker, target, claudeContext, apiKey, rng);

      if (!claudeText) {
        if (options.verbose) console.log(`  -> API returned null`);
      } else if (claudeText.length < 10) {
        if (options.verbose) console.log(`  -> Too short: "${claudeText}"`);
      } else if (isBoringMessage(claudeText)) {
        if (options.verbose) console.log(`  -> Boring: "${claudeText}"`);
      } else if (seenMessages.has(claudeText)) {
        if (options.verbose) console.log(`  -> Duplicate`);
      }

      if (claudeText && claudeText.length >= 10 && !isBoringMessage(claudeText) && !seenMessages.has(claudeText)) {
        if (options.verbose || claudeCallCount % 50 === 1) {
          console.log(`  -> "${claudeText.substring(0, 60)}..."`);
        }
        interestingTurns++;
        seenMessages.add(claudeText);
        npcMessageCount.set(speaker.slug, speakerCount + 1);

        const loggedTurn: LoggedTurn = {
          turn: totalTurns,
          speaker: speaker.slug,
          speakerName: speaker.name,
          target: target.slug,
          targetName: target.name,
          text: claudeText,
          pool: 'claude_generated',
          interestScore: 100, // Claude responses are high value
          tags: ['claude_generated', speaker.category === 'pantheon' ? 'pantheon_speaks' : 'dynamic'],
        };

        currentBatch.push(loggedTurn);
        claudeContext.push(`${speaker.name}: ${claudeText}`);
        if (claudeContext.length > 10) claudeContext.shift();

        // Track stats
        poolBreakdown['claude_generated'] = (poolBreakdown['claude_generated'] || 0) + 1;
        speakerCounts[speaker.name] = (speakerCounts[speaker.name] || 0) + 1;
        tagBreakdown['claude_generated'] = (tagBreakdown['claude_generated'] || 0) + 1;

        if (options.verbose) {
          console.log(`[${totalTurns}] [CLAUDE] ${speaker.name} -> ${target.name}: ${claudeText}`);
        }

        npcLastSpoke.set(speaker.slug, totalTurns);
        continue; // Skip template logic for this turn
      }
    }

    // Adjust weights
    const adjustedWeights = { ...poolWeights };
    if (tension > 0.5) {
      adjustedWeights.threat = 0.15;
      adjustedWeights.conflict = 0.15;
      adjustedWeights.alliance = 0.1;
      adjustedWeights.idle = 0.05;
    }

    // Select pool
    const roll = rng.random('pool');
    let cumulative = 0;
    let selectedPool = 'idle';
    for (const [pool, weight] of Object.entries(adjustedWeights)) {
      cumulative += weight;
      if (roll < cumulative) {
        selectedPool = pool;
        break;
      }
    }

    // Get templates
    const poolTemplates = TEMPLATES.filter(t => t.pool === selectedPool && !usedTemplates.has(t.id));
    if (poolTemplates.length === 0) {
      TEMPLATES.filter(t => t.pool === selectedPool).forEach(t => usedTemplates.delete(t.id));
      continue;
    }

    // Select template
    const templateIdx = Math.floor(rng.random('template') * poolTemplates.length);
    const template = poolTemplates[templateIdx];
    usedTemplates.add(template.id);

    // Score
    const { score, tags } = scoreTurn(template, speaker, target);

    // Update tension
    if (template.pool === 'threat' || template.pool === 'conflict') {
      tension = Math.min(1, tension + 0.1);
    } else if (template.pool === 'alliance') {
      tension = Math.max(0, tension - 0.1);
    } else {
      tension = Math.max(0, tension - 0.02);
    }

    npcLastSpoke.set(speaker.slug, totalTurns);

    // Log if interesting AND passes quality filters
    const meetsThreshold = score >= INTEREST_THRESHOLD || options.verbose;
    const isNewMessage = !seenMessages.has(template.text);
    const underQuota = speakerCount < NPC_QUOTA;

    if (meetsThreshold && isNewMessage && underQuota) {
      interestingTurns++;
      seenMessages.add(template.text);
      npcMessageCount.set(speaker.slug, speakerCount + 1);

      const loggedTurn: LoggedTurn = {
        turn: totalTurns,
        speaker: speaker.slug,
        speakerName: speaker.name,
        target: target.slug,
        targetName: target.name,
        text: template.text,
        pool: template.pool,
        interestScore: score,
        tags,
      };

      currentBatch.push(loggedTurn);

      // Add to Claude context for future calls
      claudeContext.push(`${speaker.name}: ${template.text}`);
      if (claudeContext.length > 10) claudeContext.shift();

      // Track stats
      poolBreakdown[template.pool] = (poolBreakdown[template.pool] || 0) + 1;
      speakerCounts[speaker.name] = (speakerCounts[speaker.name] || 0) + 1;
      for (const tag of tags) {
        tagBreakdown[tag] = (tagBreakdown[tag] || 0) + 1;
      }

      if (options.verbose) {
        console.log(`[${totalTurns}] ${speaker.name} -> ${target.name}: ${template.text} [${score}]`);
      }

      // Write batch if full
      if (currentBatch.length >= options.batchSize) {
        batchNumber++;
        const batchFile = `batch-${String(batchNumber).padStart(4, '0')}.json`;
        const batchPath = path.join(sessionDir, batchFile);

        const batch: ChatterBatch = {
          batchNumber,
          timestamp: new Date().toISOString(),
          turnsInBatch: currentBatch.length,
          conversations: currentBatch,
        };

        fs.writeFileSync(batchPath, JSON.stringify(batch, null, 2));
        batchFiles.push(batchFile);
        currentBatch = [];

        console.log(`Batch ${batchNumber} saved (${options.batchSize} conversations)`);
      }
    }

    // Progress update every 30 seconds
    if (Date.now() - lastProgressTime > 30000) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const remaining = options.turns > 0
        ? `${options.turns - totalTurns} turns left`
        : `${Math.max(0, Math.floor((endTime - Date.now()) / 1000))}s left`;
      console.log(`[${elapsed}s] Turns: ${totalTurns}, Interesting: ${interestingTurns}, ${remaining}`);
      lastProgressTime = Date.now();
    }
  }

  const elapsed = (Date.now() - startTime) / 1000;

  // Collect all conversations for output
  let allConversations: LoggedTurn[] = [];

  // If we never wrote any batch files, just use currentBatch
  if (batchFiles.length === 0) {
    allConversations = currentBatch;
  } else {
    // Read back batch files and combine with remaining
    for (const batchFile of batchFiles) {
      const batchPath = path.join(sessionDir, batchFile);
      const batchData = JSON.parse(fs.readFileSync(batchPath, 'utf-8')) as ChatterBatch;
      allConversations.push(...batchData.conversations);
    }
    allConversations.push(...currentBatch);
  }

  // Clean output: if under 2000 messages, write single clean JSON and remove batch files
  if (allConversations.length <= 2000) {
    // Remove batch files
    for (const batchFile of batchFiles) {
      const batchPath = path.join(sessionDir, batchFile);
      fs.unlinkSync(batchPath);
    }
    batchFiles.length = 0;
    batchNumber = 0;

    // Write single clean conversations.json
    const cleanOutput = {
      timestamp: new Date().toISOString(),
      seed: options.seed,
      totalConversations: allConversations.length,
      conversations: allConversations,
    };
    const cleanPath = path.join(sessionDir, 'conversations.json');
    fs.writeFileSync(cleanPath, JSON.stringify(cleanOutput, null, 2));
    console.log(`Clean output: ${allConversations.length} conversations in conversations.json`);
  } else if (currentBatch.length > 0) {
    // Still have remaining batch to save
    batchNumber++;
    const batchFile = `batch-${String(batchNumber).padStart(4, '0')}.json`;
    const batchPath = path.join(sessionDir, batchFile);

    const batch: ChatterBatch = {
      batchNumber,
      timestamp: new Date().toISOString(),
      turnsInBatch: currentBatch.length,
      conversations: currentBatch,
    };

    fs.writeFileSync(batchPath, JSON.stringify(batch, null, 2));
    batchFiles.push(batchFile);
    console.log(`Final batch ${batchNumber} saved (${currentBatch.length} conversations)`);
  }

  // Top speakers
  const topSpeakers = Object.entries(speakerCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Write summary
  const summary: ChatterSummary = {
    timestamp: new Date().toISOString(),
    seed: options.seed,
    config: {
      durationMinutes: options.durationMinutes,
      batchSize: options.batchSize,
      useClaude: options.useClaude,
      interestThreshold: INTEREST_THRESHOLD,
      npcQuota: NPC_QUOTA,
      maxTotalMessages: MAX_TOTAL_MESSAGES,
      dedupeEnabled: true,
    },
    stats: {
      totalTurns,
      interestingTurns,
      claudeApiCalls: claudeCallCount,
      durationSeconds: Math.round(elapsed),
      turnsPerSecond: Math.round(totalTurns / elapsed),
      batchCount: batchNumber,
      poolBreakdown,
      topSpeakers,
      tagBreakdown,
    },
    batchFiles,
  };

  const summaryPath = path.join(sessionDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  // Also write human-readable text log
  const textLines: string[] = [
    `NPC Pregame Chatter - ${new Date().toISOString()}`,
    `Seed: ${options.seed}`,
    `Duration: ${Math.round(elapsed)}s`,
    `Total Turns Evaluated: ${totalTurns}`,
    `Quality Messages: ${interestingTurns}`,
    `Claude API Calls: ${claudeCallCount}`,
    ``,
    `=== QUALITY FILTERS ===`,
    `Interest Threshold: ${INTEREST_THRESHOLD}+`,
    `Per-NPC Quota: ${NPC_QUOTA} max`,
    `Dedupe: Enabled`,
    `Unique Messages: ${seenMessages.size}`,
    `Claude Mode: ${options.useClaude ? 'Enabled' : 'Disabled'}`,
    '',
    '=== TOP SPEAKERS ===',
    ...topSpeakers.map((s, i) => `${i + 1}. ${s.name}: ${s.count}`),
    '',
    '=== POOL BREAKDOWN ===',
    ...Object.entries(poolBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([pool, count]) => `${pool}: ${count}`),
    '',
    '=== TAG BREAKDOWN ===',
    ...Object.entries(tagBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => `${tag}: ${count}`),
  ];

  const textPath = path.join(sessionDir, 'summary.txt');
  fs.writeFileSync(textPath, textLines.join('\n'));

  // Write readable markdown with all conversations
  const mdLines: string[] = [
    `# NPC Chatter - Day in the Life`,
    ``,
    `> Generated: ${new Date().toISOString()}`,
    `> Seed: \`${options.seed}\``,
    `> Claude Mode: ${options.useClaude ? 'Enabled' : 'Disabled'}`,
    `> Messages: ${allConversations.length}`,
    ``,
    `---`,
    ``,
  ];

  // Group by rough "time of day" based on turn number
  const phases = [
    { name: 'Morning - Market Opens', start: 0, end: 0.25 },
    { name: 'Midday - Ceelo Games', start: 0.25, end: 0.5 },
    { name: 'Afternoon - Arena Match', start: 0.5, end: 0.75 },
    { name: 'Evening - Wind Down', start: 0.75, end: 1.0 },
  ];

  const maxTurn = Math.max(...allConversations.map(c => c.turn));

  for (const phase of phases) {
    const phaseConvos = allConversations.filter(c => {
      const pct = c.turn / maxTurn;
      return pct >= phase.start && pct < phase.end;
    });

    if (phaseConvos.length > 0) {
      mdLines.push(`## ${phase.name}`);
      mdLines.push(``);

      for (const c of phaseConvos) {
        const poolTag = c.pool === 'claude_generated' ? ' *[AI]*' : '';
        mdLines.push(`**${c.speakerName}** *(to ${c.targetName})*${poolTag}`);
        mdLines.push(`> ${c.text}`);
        mdLines.push(``);
      }
    }
  }

  const mdPath = path.join(sessionDir, 'chatter.md');
  fs.writeFileSync(mdPath, mdLines.join('\n'));
  console.log(`Markdown: ${mdPath}`);

  // Console summary
  console.log('');
  console.log('='.repeat(60));
  console.log('SIMULATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Duration: ${Math.round(elapsed)}s`);
  console.log(`Turns Evaluated: ${totalTurns.toLocaleString()}`);
  console.log(`Quality Messages: ${interestingTurns.toLocaleString()}`);
  console.log(`Unique Messages: ${seenMessages.size}`);
  if (claudeCallCount > 0) {
    console.log(`Claude API Calls: ${claudeCallCount}`);
  }
  console.log(`Interest Threshold: ${INTEREST_THRESHOLD}+`);
  console.log(`Per-NPC Quota: ${NPC_QUOTA}`);
  console.log('');
  console.log('Top Speakers:');
  for (const { name, count } of topSpeakers.slice(0, 5)) {
    console.log(`  ${name}: ${count}`);
  }
  console.log('');
  console.log('Top Tags:');
  const topTags = Object.entries(tagBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [tag, count] of topTags) {
    console.log(`  ${tag}: ${count}`);
  }
  console.log('');
  console.log('='.repeat(60));
  console.log(`Output: ${sessionDir}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
