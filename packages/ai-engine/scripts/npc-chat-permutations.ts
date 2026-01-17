#!/usr/bin/env ts-node
/**
 * NPC Chat Permutations - Multi-NPC Conversation Simulator
 *
 * Simulates conversations between all NPC pairs/groups to generate
 * dialogue permutations for the chatbase.
 *
 * Run with: npx tsx scripts/npc-chat-permutations.ts
 *
 * Options:
 *   --iterations=N      Conversations per pair (default: 5)
 *   --max-turns=N       Max turns per conversation (default: 8)
 *   --seed=X            Random seed (default: timestamp)
 *   --verbose           Show all conversations
 *   --use-claude        Enable Claude API for dynamic responses
 *   --extract-templates Save generated dialogue as templates
 *   --pairs-only        Only simulate 2-NPC conversations
 *   --include-pantheon  Include Die-rectors in conversations
 *   --filter=slug       Only simulate conversations involving this NPC
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Shared utilities
import {
  parseArgs,
  progressBar,
  setupGracefulShutdown,
  writeSimResults,
  writeMarkdownReport,
  printHeader,
  printSummary,
  calculateStats,
} from './lib';

// Canonical NPC data
import {
  ALL_NPCS,
  WANDERER_NPCS,
  TRAVELER_NPCS,
  PANTHEON_NPCS,
  getNPCDefinition,
  type EnhancedNPCConfig,
} from '../src/npcs/definitions';

// Seeded RNG
import { createSeededRng, type SeededRng } from '../src/core/seeded-rng';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Config
// ============================================

interface Config {
  iterations: number;
  maxTurns: number;
  seed: string;
  verbose: boolean;
  useClaude: boolean;
  extractTemplates: boolean;
  pairsOnly: boolean;
  includePantheon: boolean;
  filter: string;
  dedupe: boolean;
  hyperbolic: number; // Run for N minutes in "hyperbolic time chamber" mode
}

const DEFAULTS: Config = {
  iterations: 3,
  maxTurns: 6,
  seed: Date.now().toString(),
  verbose: false,
  useClaude: false,
  extractTemplates: true,   // Default to extracting templates
  pairsOnly: true,          // Default to pairs only (faster)
  includePantheon: false,
  filter: '',
  dedupe: true,             // Default to deduplicating
  hyperbolic: 0,            // Minutes to run (0 = single pass)
};

// ============================================
// Types
// ============================================

interface ConversationTurn {
  speaker: string;
  speakerName: string;
  text: string;
  mood: string;
  pool: string;
  reactionTo?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  location: string;
  turns: ConversationTurn[];
  topic: string;
  startedBy: string;
  duration: number;
}

interface ExtractedTemplate {
  id: string;
  entitySlug: string;
  pool: string;
  mood: string;
  text: string;
  weight: number;
  purpose: string;
  context: {
    conversationWith?: string;
    location?: string;
    topic?: string;
    reactionTo?: string;
  };
}

// ============================================
// Conversation Topics
// ============================================

const TOPICS = [
  'gambling',
  'trade',
  'combat',
  'death',
  'domains',
  'dice',
  'player',
  'weather',
  'rumors',
  'philosophy',
  'business',
  'music',
  'fire',
  'void',
  'ice',
  'chaos',
];

const LOCATIONS = [
  'market-square',
  'back-alley',
  'sphere-stands',
  'the-dying-saucer',
  'the-wandering-market',
];

// ============================================
// Dialogue Generation (Static)
// ============================================

/**
 * Get pool weights for a topic
 */
function getTopicPoolWeights(topic: string): Record<string, number> {
  const baseWeights = {
    greeting: 10,
    reaction: 20,
    lore: 15,
    hint: 10,
    challenge: 10,
    salesPitch: 5,
    idle: 5,
    farewell: 5,
    threat: 0,
  };

  // Boost certain pools based on topic
  switch (topic) {
    case 'gambling':
    case 'dice':
      baseWeights.challenge = 25;
      break;
    case 'trade':
    case 'business':
      baseWeights.salesPitch = 25;
      break;
    case 'combat':
      baseWeights.threat = 15;
      baseWeights.challenge = 20;
      break;
    case 'philosophy':
    case 'death':
    case 'void':
      baseWeights.lore = 30;
      break;
    case 'rumors':
      baseWeights.hint = 25;
      baseWeights.reaction = 25;
      break;
  }

  return baseWeights;
}

/**
 * Generate a static dialogue line based on NPC and context
 */
function generateDialogue(
  npc: EnhancedNPCConfig,
  topic: string,
  pool: string,
  targetNpc: EnhancedNPCConfig | null,
  rng: SeededRng
): string {
  const slug = npc.identity.slug;
  const name = npc.identity.name;
  const targetName = targetNpc?.identity.name || 'you';

  // Template bank per archetype/NPC
  const templates = getDialogueTemplates(slug, npc.archetype, pool, topic, targetName);

  if (templates.length === 0) {
    return `*${name} nods thoughtfully*`;
  }

  const idx = Math.floor(rng.random(`dialogue-${slug}`) * templates.length);
  return templates[idx];
}

/**
 * Get dialogue templates for NPC
 */
function getDialogueTemplates(
  slug: string,
  archetype: string,
  pool: string,
  topic: string,
  targetName: string
): string[] {
  // NPC-specific templates
  const npcTemplates: Record<string, Record<string, string[]>> = {
    'mr-bones': {
      reaction: [
        `Interesting perspective, ${targetName}. Death has taught me to appreciate nuance.`,
        `*rattles thoughtfully* Your point has merit. In my accounting of souls, similar patterns emerge.`,
        `The ledger notes your observation, ${targetName}. Few mortals think so deeply.`,
      ],
      lore: [
        `Did you know? In the old days, before the Die-rectors, death was permanent. Can you imagine?`,
        `The domains were not always six. Once there were seven. The seventh... well. That is a story for another time.`,
        `*traces a bone finger on the table* Every soul leaves a trail. Yours is particularly... interesting.`,
      ],
      greeting: [
        `${targetName}. Still alive, I see. Or close enough.`,
        `Ah, a familiar face. Death's accountant never forgets.`,
      ],
    },
    'willy': {
      reaction: [
        `Oh! That's exactly what my customers love! Well, one customer. Okay, you're my first customer today.`,
        `${targetName}, you get it! Unlike that guy who tried to pay in dreams. Dreams are NOT currency!`,
        `*claps skeletal hands* YES! See, THIS is why I set up shop here!`,
      ],
      salesPitch: [
        `Speaking of which, ${targetName}, have you seen my new inventory? Slightly cursed but VERY discounted!`,
        `That reminds me! I have something that might interest you. Only fell through one dimension!`,
        `${targetName}, friend, customer, friend-customer - have I got a deal for YOU!`,
      ],
      greeting: [
        `${targetName}! My favorite person! Well, favorite person in this immediate area!`,
        `Oh! A potential customer! I mean, friend! Customer-friend!`,
      ],
    },
    'boo-g': {
      reaction: [
        `Yo ${targetName}, that's straight FIRE! No cap, no cap!`,
        `*ghost hands* Ayyy that's what I'm talkin' about! The vibe check is PASSED!`,
        `${targetName} coming in with the hot takes! We love to see it!`,
      ],
      lore: [
        `Real talk though? Being a ghost ain't so bad. I can phase through walls AND drop sick beats.`,
        `The afterlife got better music than you'd think. We got a whole scene down there.`,
      ],
      greeting: [
        `${targetName}! What's good, what's good! The MC of the afterlife is HERE!`,
        `Yooo it's my favorite mortal! Well, one of them. You're all kind of temporary.`,
      ],
    },
    'dr-voss': {
      reaction: [
        `Fascinating. Your hypothesis aligns with my void resonance data, ${targetName}.`,
        `*scribbles notes* Yes, yes... this confirms variable 7-theta. Continue.`,
        `The null variance in your statement is... acceptable. Barely.`,
      ],
      lore: [
        `The void is not empty, ${targetName}. It is full of potential that refuses to collapse into reality.`,
        `My research indicates that probability itself has a texture. Most unpleasant to touch.`,
        `Did you know? The Die-rectors are not rulers. They are... stabilizers. For what, I dare not theorize.`,
      ],
      hint: [
        `${targetName}, a word of scientific advice: the patterns you see are not random. Remember that.`,
        `My instruments detect an anomaly ahead. Whether dangerous or beneficial... insufficient data.`,
      ],
    },
    'the-general-wanderer': {
      reaction: [
        `Acknowledged. Your tactical assessment has merit, ${targetName}.`,
        `*nods curtly* Acceptable analysis. I have seen worse from trained soldiers.`,
        `The enemy would not expect such thinking. Use that.`,
      ],
      challenge: [
        `${targetName}. You speak of combat. Have you tested these theories in the field?`,
        `Words are cheap. Steel is expensive. Let us see which you prefer.`,
      ],
      greeting: [
        `${targetName}. Status report. How many times have you died since we last spoke?`,
        `At ease. We have tactical matters to discuss.`,
      ],
      farewell: [
        `Dismissed, ${targetName}. Make me proud out there.`,
        `Stay sharp. The battlefield does not forgive hesitation.`,
      ],
    },
    'stitch-up-girl': {
      reaction: [
        `Interesting! From a medical perspective, that's actually quite dangerous.`,
        `*takes notes* I should write this down for future reference.`,
        `${targetName}, you always have the most... unique perspectives.`,
      ],
      greeting: [
        `${targetName}! Let me take a look at you. Any new holes I should know about?`,
        `There you are! I was hoping you'd stop by.`,
      ],
      farewell: [
        `Stay safe out there, ${targetName}! And come back if anything falls off!`,
        `Take care! I'll have bandages ready for when you return.`,
      ],
    },
    'clausen': {
      reaction: [
        `*lights cigarette* Interesting theory, ${targetName}. I've seen stranger things prove true.`,
        `The evidence supports your claim. Barely.`,
        `*exhales smoke* You might be onto something there.`,
      ],
      greeting: [
        `${targetName}. Another case, another face. What brings you to this corner of chaos?`,
        `*nods* Good to see you're still alive. That's rarer than you'd think.`,
      ],
      farewell: [
        `Watch your back, ${targetName}. In my business, backs are the first thing they aim for.`,
        `Stay alive. Good partners are hard to find.`,
      ],
    },
    'boots': {
      reaction: [
        `*clicks heels together* That's the spirit, ${targetName}!`,
        `Now you're thinking like a traveler!`,
        `Ha! ${targetName}, you never cease to surprise me.`,
      ],
      greeting: [
        `${targetName}! Ready for another adventure?`,
        `Well well, look who decided to show up! Good timing.`,
      ],
      farewell: [
        `Safe travels, ${targetName}! May your boots never wear thin!`,
        `Until next time! The road awaits!`,
      ],
    },
    'xtreme': {
      reaction: [
        `YOOOO ${targetName}! That's EXTREME!`,
        `*vibrates with excitement* NOW we're talking!`,
        `BRO. BRO. ${targetName}. That's the most EXTREME thing I've heard today!`,
      ],
      greeting: [
        `${targetName}! Ready to get EXTREME?!`,
        `YOOO it's ${targetName}! Let's make some CHAOS!`,
      ],
      farewell: [
        `Stay EXTREME, ${targetName}! NEVER STOP BEING AWESOME!`,
        `LATER ${targetName}! May your dice ALWAYS roll EXTREME!`,
      ],
      challenge: [
        `${targetName}! BET YOU CAN'T BEAT MY HIGH SCORE!`,
        `WANNA GAMBLE?! I'M FEELING LUCKY! EXTREMELY LUCKY!`,
      ],
    },
    'dr-maxwell': {
      reaction: [
        `Fascinating! ${targetName}, do you realize the IMPLICATIONS?!`,
        `*scribbles furiously* Yes, yes, this confirms my hypothesis about-- wait, where was I?`,
        `The probability matrix is SHIFTING, ${targetName}! Can you not FEEL it?!`,
      ],
      greeting: [
        `${targetName}! Perfect timing! I need someone to hold this beaker while I-- nevermind, it exploded.`,
        `Ah! A test subject-- I mean, a FRIEND! ${targetName}!`,
      ],
      farewell: [
        `Go, go! I have EXPERIMENTS to run! The dice won't study themselves!`,
        `Until next time, ${targetName}! Try not to die in any STATISTICALLY IMPROBABLE ways!`,
      ],
      lore: [
        `Did you know the sphere operates on SEVENTEEN different probability axes?! SEVENTEEN!`,
        `The Die-rectors don't control fate, ${targetName}. They ARE fate. Mathematically speaking.`,
        `I've calculated the exact moment of your next death. Don't worry, it's very far away. Probably.`,
      ],
      challenge: [
        `${targetName}! Quick! What's the probability of rolling snake eyes THREE times in a row?!`,
        `I bet you can't explain the quantum dice theorem! Nobody can! I certainly can't!`,
      ],
      hint: [
        `${targetName}, statistically speaking, you should avoid the left path. Trust the numbers!`,
        `My calculations suggest a 73.6% chance of treasure ahead. Or death. The decimals are similar.`,
      ],
    },
    'king-james': {
      reaction: [
        `*adjusts crown* A worthy observation, ${targetName}. For a commoner.`,
        `The Null Throne acknowledges your insight. This is a great honor. You're welcome.`,
        `Hmm. Even peasants occasionally stumble upon wisdom.`,
      ],
      greeting: [
        `${targetName}. You stand before royalty. Act accordingly.`,
        `Ah, a familiar subject returns to court. The void remembers you.`,
      ],
      farewell: [
        `You are dismissed, ${targetName}. The audience is concluded.`,
        `Go with the void's blessing. It is worth exactly as much as you'd expect.`,
      ],
      lore: [
        `In my kingdom, probability itself bows to the crown. Or it would, if it had knees.`,
        `The void is not emptiness, ${targetName}. It is POTENTIAL. Royal potential.`,
        `I have ruled nothing for eons. You'd be surprised how demanding nothing can be.`,
      ],
      salesPitch: [
        `The Null Throne Emporium offers items of... questionable existence. Interested?`,
        `For a price, I can sell you something that may or may not be real. The uncertainty is half the value.`,
      ],
      challenge: [
        `${targetName}. Prove your worth to the crown. Impress me. If you can.`,
        `A royal wager? How... quaint. Very well. I accept.`,
      ],
    },
    'body-count': {
      reaction: [
        `*marks tally* That's ${targetName} being interesting. Noted.`,
        `Statistic recorded. You're more entertaining than most.`,
        `The numbers don't lie, ${targetName}. Neither do I.`,
      ],
      greeting: [
        `${targetName}. Still alive. That's... actually impressive given your history.`,
        `Ah, another data point walks in. Hello, ${targetName}.`,
      ],
      farewell: [
        `Don't die out there, ${targetName}. Unless you want to. I'll count it either way.`,
        `See you next time. Statistically, there WILL be a next time. Probably.`,
      ],
      lore: [
        `I've counted every death in these domains. The number would disturb you.`,
        `Death is just a number, ${targetName}. A very, very large number.`,
        `The Die-rectors don't decide who dies. They decide who gets COUNTED.`,
      ],
      hint: [
        `${targetName}, based on my tallies, you should avoid that area. High casualty zone.`,
        `Pro tip: the path with fewer corpses is usually safer. Usually.`,
      ],
      challenge: [
        `${targetName}. Bet you can't guess how many times YOU'VE died. I know the exact number.`,
        `Want to see your personal death statistics? Some people find it motivating.`,
      ],
    },
    'keith-man': {
      reaction: [
        `*cryptic nod* The sphere sees what you mean, ${targetName}.`,
        `...interesting. The patterns align with your words.`,
        `${targetName} speaks truth. Or something close to it.`,
      ],
      greeting: [
        `${targetName}. The sphere anticipated your arrival. Or maybe that was me.`,
        `...you're here. Good. The sphere has things to show.`,
      ],
      farewell: [
        `Walk carefully, ${targetName}. The sphere watches all paths.`,
        `Until the sphere brings us together again. It always does.`,
      ],
      lore: [
        `The sphere is not just a game, ${targetName}. It's a window. Or a door. I forget which.`,
        `I've seen things in the sphere's surface... futures, pasts, presents... all the tenses.`,
        `The Die-rectors fear the sphere, ${targetName}. They should.`,
      ],
      hint: [
        `The sphere shows me... danger ahead. And opportunity. They're often the same thing.`,
        `${targetName}, trust the sphere's surface. It reflects more than light.`,
      ],
      challenge: [
        `Stare into the sphere with me, ${targetName}. Tell me what you see.`,
        `The sphere wants to test you. I'm just the messenger.`,
      ],
    },
    'mr-kevin': {
      reaction: [
        `Ha! ${targetName}, you get it! Most people don't get it!`,
        `*finger guns* That's exactly what I was thinking!`,
        `See, THIS is why I like you, ${targetName}!`,
      ],
      greeting: [
        `${targetName}! My favorite person! Well, one of my favorites. Top ten for sure.`,
        `Hey hey hey! Look who it is! ${targetName}!`,
      ],
      farewell: [
        `Later, ${targetName}! Don't be a stranger! Unless that's your thing, then be a familiar stranger!`,
        `Catch you on the flip side! Whatever that means! I've never known!`,
      ],
      lore: [
        `You know what's wild, ${targetName}? This whole place runs on dice. DICE! That's insane!`,
        `I've been here forever and I still don't understand half of it. That's the fun part!`,
      ],
      hint: [
        `${targetName}, between you and me? Go left. Or right. I'm not great at directions.`,
        `Hot tip: don't die. I know, I know, revolutionary advice. You're welcome.`,
      ],
      challenge: [
        `${targetName}! Bet you can't do that thing you just did but BETTER!`,
        `Wanna see who can do the dumbest thing and survive? I'm undefeated!`,
      ],
      salesPitch: [
        `${targetName}! Have I shown you my collection of... stuff? I have stuff!`,
        `Looking to buy something? I have things! Probably! Let me check my pockets!`,
      ],
    },
    'the-general-traveler': {
      reaction: [
        `Solid tactical assessment, ${targetName}. You'd make a decent soldier.`,
        `*nods approvingly* Your instincts are sound. Mostly.`,
        `Noted. I'll add that to the briefing.`,
      ],
      greeting: [
        `${targetName}, reporting in. Good. I have intel to share.`,
        `At ease, ${targetName}. We have matters to discuss.`,
      ],
      farewell: [
        `Dismissed. Stay sharp out there, ${targetName}. That's an order.`,
        `Move out, ${targetName}. And try not to die. It's bad for morale.`,
      ],
      lore: [
        `I've fought in seventeen campaigns, ${targetName}. Died in all of them. Still fighting.`,
        `The Die-rectors aren't generals. They're... something else. I've seen real command. This isn't it.`,
      ],
      hint: [
        `Reconnaissance suggests heavy resistance ahead, ${targetName}. Proceed with caution.`,
        `${targetName}, intel says the left flank is weak. Exploit it.`,
      ],
      challenge: [
        `${targetName}. Time for a field exercise. Let's see what you're made of.`,
        `Consider this a test, ${targetName}. Don't disappoint me.`,
      ],
    },
  };

  // Archetype fallbacks
  const archetypeTemplates: Record<string, Record<string, string[]>> = {
    sage: {
      reaction: [
        `An intriguing point, ${targetName}. Let me consider...`,
        `Your observation touches on deeper truths. Most do not see so clearly.`,
        `*nods* There is wisdom in your words.`,
      ],
      lore: [
        `The old texts speak of such things. Few remember now.`,
        `Knowledge, like all things, has its price. But also its rewards.`,
      ],
      farewell: [
        `Until we meet again, ${targetName}. May wisdom guide your path.`,
        `Farewell. Remember what we discussed.`,
      ],
    },
    merchant: {
      reaction: [
        `See, ${targetName}, this is why I value our conversations!`,
        `Ha! You understand the market better than most!`,
        `*grins* A customer after my own heart.`,
      ],
      salesPitch: [
        `That reminds me, ${targetName} - I have something you might like...`,
        `Speaking of which, my inventory just got restocked!`,
      ],
      farewell: [
        `Come back soon, ${targetName}! I'll have new stock!`,
        `Safe travels! And remember where to find the best deals!`,
      ],
    },
    trickster: {
      reaction: [
        `Hah! ${targetName}, you get it!`,
        `*laughs* Now THAT'S what I'm talking about!`,
        `See? This one knows how to have fun!`,
      ],
      challenge: [
        `Boring! Let's make things interesting, ${targetName}!`,
        `Talk is cheap. Wanna bet on it?`,
      ],
      farewell: [
        `Later, ${targetName}! Don't do anything I wouldn't do! Which is nothing!`,
        `Catch you on the flip side! Stay chaotic!`,
      ],
    },
    warrior: {
      reaction: [
        `Noted, ${targetName}. Your insight has tactical value.`,
        `*grunts* Acceptable reasoning.`,
        `The battlefield would teach you the same lesson. Eventually.`,
      ],
      challenge: [
        `Prove it, ${targetName}.`,
        `Strong words. Can you back them up?`,
      ],
      farewell: [
        `Dismissed, ${targetName}. Stay sharp out there.`,
        `Until next time. Train hard.`,
      ],
    },
    diplomat: {
      reaction: [
        `A measured perspective, ${targetName}. I appreciate the nuance.`,
        `Indeed. There are many angles to consider.`,
        `Your diplomatic instincts serve you well.`,
      ],
      lore: [
        `In my experience, the truth lies between extremes.`,
        `History teaches us that compromise has power.`,
      ],
      farewell: [
        `Farewell, ${targetName}. May our paths cross again under favorable circumstances.`,
        `Until next time. These conversations are always... enlightening.`,
      ],
    },
  };

  // Check for NPC-specific templates first
  const npcBank = npcTemplates[slug];
  if (npcBank && npcBank[pool]) {
    return npcBank[pool];
  }

  // Fall back to archetype
  const archetypeBank = archetypeTemplates[archetype];
  if (archetypeBank && archetypeBank[pool]) {
    return archetypeBank[pool];
  }

  // Generic fallback by pool
  const genericFallbacks: Record<string, string[]> = {
    greeting: [
      `${targetName}. Good to see you.`,
      `Ah, ${targetName}. What brings you here?`,
    ],
    farewell: [
      `Until next time, ${targetName}.`,
      `Take care out there, ${targetName}.`,
      `Safe travels.`,
    ],
    reaction: [
      `Hmm. An interesting point, ${targetName}.`,
      `*considers carefully* You may be right.`,
      `I had not thought of it that way.`,
    ],
    lore: [
      `There are old stories about such things...`,
      `The domains hold many secrets.`,
    ],
    hint: [
      `A word of advice, ${targetName}: be careful ahead.`,
      `I have heard rumors about what lies ahead.`,
    ],
    challenge: [
      `Care to test that theory, ${targetName}?`,
      `Prove it.`,
    ],
    salesPitch: [
      `I might have something that interests you, ${targetName}.`,
      `Speaking of which, I have wares to show.`,
    ],
    idle: [
      `*waits patiently*`,
      `...`,
    ],
    threat: [
      `Choose your next words carefully, ${targetName}.`,
      `*narrows eyes*`,
    ],
  };

  return genericFallbacks[pool] || [
    `*${targetName} receives a thoughtful response*`,
    `Hmm. An interesting point.`,
  ];
}

/**
 * Select pool based on weights
 */
function selectPool(weights: Record<string, number>, rng: SeededRng): string {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = rng.random('pool') * total;

  for (const [pool, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return pool;
  }

  return 'reaction';
}

/**
 * Get mood based on NPC config and context
 */
function getMood(npc: EnhancedNPCConfig, rng: SeededRng): string {
  const moods = ['neutral', 'pleased', 'amused', 'curious', npc.defaultMood];
  const idx = Math.floor(rng.random('mood') * moods.length);
  return moods[idx];
}

// ============================================
// Conversation Simulation
// ============================================

/**
 * Simulate a conversation between NPCs
 */
function simulateConversation(
  participants: EnhancedNPCConfig[],
  location: string,
  rng: SeededRng,
  maxTurns: number
): Conversation {
  const topic = TOPICS[Math.floor(rng.random('topic') * TOPICS.length)];
  const turns: ConversationTurn[] = [];

  // First speaker initiates
  const firstSpeaker = participants[Math.floor(rng.random('first') * participants.length)];
  const poolWeights = getTopicPoolWeights(topic);

  // Generate turns
  let currentSpeakerIdx = participants.indexOf(firstSpeaker);
  let lastSpeaker: EnhancedNPCConfig | null = null;

  // Decide actual turn count (with early exit chance)
  let actualTurns = maxTurns;
  for (let t = 3; t < maxTurns; t++) {
    if (rng.random(`early-end-${t}`) < 0.15) {
      actualTurns = t + 1; // End after this turn
      break;
    }
  }

  for (let i = 0; i < actualTurns; i++) {
    const speaker = participants[currentSpeakerIdx];
    const others = participants.filter(p => p.identity.slug !== speaker.identity.slug);
    const target = others.length > 0 ? others[Math.floor(rng.random('target') * others.length)] : null;

    // Select pool and mood - greeting first, farewell last, conversation in between
    let pool: string;
    if (i === 0) {
      pool = 'greeting';
    } else if (i === actualTurns - 1) {
      pool = 'farewell';
    } else {
      // Remove farewell from mid-conversation options
      const midConvoWeights = { ...poolWeights, farewell: 0, greeting: 0 };
      pool = selectPool(midConvoWeights, rng);
    }
    const mood = getMood(speaker, rng);

    // Generate dialogue
    const text = generateDialogue(speaker, topic, pool, target, rng);

    turns.push({
      speaker: speaker.identity.slug,
      speakerName: speaker.identity.name,
      text,
      mood,
      pool,
      reactionTo: lastSpeaker?.identity.slug,
    });

    // Advance to next speaker
    lastSpeaker = speaker;
    currentSpeakerIdx = (currentSpeakerIdx + 1) % participants.length;
  }

  return {
    id: `conv-${rng.random('id').toString(36).slice(2, 8)}`,
    participants: participants.map(p => p.identity.slug),
    participantNames: participants.map(p => p.identity.name),
    location,
    turns,
    topic,
    startedBy: firstSpeaker.identity.slug,
    duration: turns.length,
  };
}

/**
 * Generate all NPC pairs
 */
function generatePairs(npcs: EnhancedNPCConfig[]): [EnhancedNPCConfig, EnhancedNPCConfig][] {
  const pairs: [EnhancedNPCConfig, EnhancedNPCConfig][] = [];

  for (let i = 0; i < npcs.length; i++) {
    for (let j = i + 1; j < npcs.length; j++) {
      pairs.push([npcs[i], npcs[j]]);
    }
  }

  return pairs;
}

/**
 * Generate NPC trios
 */
function generateTrios(npcs: EnhancedNPCConfig[]): [EnhancedNPCConfig, EnhancedNPCConfig, EnhancedNPCConfig][] {
  const trios: [EnhancedNPCConfig, EnhancedNPCConfig, EnhancedNPCConfig][] = [];

  for (let i = 0; i < npcs.length; i++) {
    for (let j = i + 1; j < npcs.length; j++) {
      for (let k = j + 1; k < npcs.length; k++) {
        trios.push([npcs[i], npcs[j], npcs[k]]);
      }
    }
  }

  return trios;
}

// ============================================
// Main
// ============================================

async function main(): Promise<void> {
  const config = parseArgs(process.argv.slice(2), DEFAULTS);
  let rng = createSeededRng(config.seed);
  const startTime = Date.now();

  // Setup shutdown handler
  let interrupted = false;
  setupGracefulShutdown(() => {
    interrupted = true;
    console.log('\nSaving progress...');
  });

  printHeader('NPC Chat Permutation Simulator');
  console.log(`Seed: ${config.seed}`);
  console.log(`Iterations per pair: ${config.iterations}`);
  console.log(`Max turns: ${config.maxTurns}`);
  console.log(`Include pantheon: ${config.includePantheon}`);
  console.log(`Dedupe: ${config.dedupe}`);
  if (config.hyperbolic > 0) {
    console.log(`\n*** HYPERBOLIC TIME CHAMBER MODE ***`);
    console.log(`Running for ${config.hyperbolic} minutes...`);
  }

  // Select NPCs
  let npcs = [...WANDERER_NPCS, ...TRAVELER_NPCS];
  if (config.includePantheon) {
    npcs = [...npcs, ...PANTHEON_NPCS];
  }

  // Filter if specified
  if (config.filter) {
    const filterSlug = config.filter;
    const filterNpc = npcs.find(n => n.identity.slug === filterSlug);
    if (!filterNpc) {
      console.error(`NPC not found: ${filterSlug}`);
      process.exit(1);
    }
    console.log(`Filtering to conversations with: ${filterNpc.identity.name}`);
  }

  // Generate pairs
  const pairs = generatePairs(npcs);
  const trios = config.pairsOnly ? [] : generateTrios(npcs);

  console.log(`\nNPCs: ${npcs.length}`);
  console.log(`Pairs: ${pairs.length}`);
  if (!config.pairsOnly) {
    console.log(`Trios: ${trios.length}`);
  }

  // Filter pairs if specified
  const filteredPairs = config.filter
    ? pairs.filter(([a, b]) => a.identity.slug === config.filter || b.identity.slug === config.filter)
    : pairs;
  const filteredTrios = config.filter
    ? trios.filter(([a, b, c]) =>
        a.identity.slug === config.filter ||
        b.identity.slug === config.filter ||
        c.identity.slug === config.filter
      )
    : trios;

  const conversationsPerPass = (filteredPairs.length + filteredTrios.length) * config.iterations;
  console.log(`Conversations per pass: ${conversationsPerPass}`);

  // Run simulations
  // In hyperbolic mode, we don't store all conversations (memory efficient)
  // Instead, we track unique templates and running stats
  const sampleConversations: Conversation[] = []; // Keep only first 10 for output
  const uniqueTemplates = new Map<string, ExtractedTemplate>(); // Key -> template

  // Running stats (updated in-place, no memory growth)
  const runningStats = {
    totalConversations: 0,
    totalTurns: 0,
    speakerCounts: {} as Record<string, number>,
    topicCounts: {} as Record<string, number>,
    poolCounts: {} as Record<string, number>,
    turnCounts: [] as number[], // Only for single-pass mode
  };

  let completed = 0;
  let passNumber = 0;
  const endTime = config.hyperbolic > 0 ? startTime + config.hyperbolic * 60 * 1000 : 0;

  // Hyperbolic time chamber loop
  do {
    passNumber++;
    if (config.hyperbolic > 0) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.floor((endTime - Date.now()) / 1000);
      console.log(`\n--- Pass ${passNumber} | Elapsed: ${elapsed}s | Remaining: ${remaining}s | Unique: ${uniqueTemplates.size} ---`);

      // Reseed RNG for variety
      rng = createSeededRng(`${config.seed}-pass-${passNumber}`);

      // Reset pass counter for progress bar
      completed = 0;
    }

    // Simulate pair conversations
    for (const [npcA, npcB] of filteredPairs) {
      if (interrupted) break;

      for (let i = 0; i < config.iterations; i++) {
        const location = LOCATIONS[Math.floor(rng.random('location') * LOCATIONS.length)];
        const conv = simulateConversation([npcA, npcB], location, rng, config.maxTurns);

        // Update running stats (memory efficient)
        runningStats.totalConversations++;
        runningStats.totalTurns += conv.turns.length;
        runningStats.topicCounts[conv.topic] = (runningStats.topicCounts[conv.topic] || 0) + 1;

        // Only store turn counts in single-pass mode (for stats)
        if (config.hyperbolic === 0) {
          runningStats.turnCounts.push(conv.turns.length);
        }

        // Keep first 10 sample conversations
        if (sampleConversations.length < 10) {
          sampleConversations.push(conv);
        }

        // Process turns
        for (const turn of conv.turns) {
          runningStats.speakerCounts[turn.speaker] = (runningStats.speakerCounts[turn.speaker] || 0) + 1;
          runningStats.poolCounts[turn.pool] = (runningStats.poolCounts[turn.pool] || 0) + 1;

          // Extract templates if enabled
          if (config.extractTemplates) {
            const isGoodTemplate =
              turn.text.length > 10 &&
              !turn.text.match(/^\*[^*]+\*$/) &&
              turn.text.match(/[a-zA-Z]{3,}/);

            if (isGoodTemplate) {
              // Normalize text for deduplication
              const normalizedText = turn.text
                .replace(/\b(Willy One Eye|Mr\. Bones|Dr\. Maxwell|King James|Boo G|Dr\. Voss|The General|Stitch Up Girl|Detective Clausen|Boots|X-treme|Body Count|Keith Man|Mr\. Kevin)\b/gi, '{{TARGET}}')
                .toLowerCase()
                .trim();
              const key = `${turn.speaker}|${turn.pool}|${normalizedText}`;

              // Only add if not seen before (automatic deduplication)
              if (!uniqueTemplates.has(key)) {
                uniqueTemplates.set(key, {
                  id: `perm-${turn.speaker}-${uniqueTemplates.size}`,
                  entitySlug: turn.speaker,
                  pool: turn.pool,
                  mood: turn.mood,
                  text: turn.text,
                  weight: 10,
                  purpose: 'ambient',
                  context: {
                    conversationWith: turn.reactionTo,
                    location: conv.location,
                    topic: conv.topic,
                  },
                });
              }
            }
          }
        }

        completed++;
        if (completed % 50 === 0 || config.verbose) {
          process.stdout.write(`\rProgress: ${progressBar(completed, conversationsPerPass)}`);
        }
      }
    }

    // Simulate trio conversations
    for (const [npcA, npcB, npcC] of filteredTrios) {
      if (interrupted) break;

      for (let i = 0; i < config.iterations; i++) {
        const location = LOCATIONS[Math.floor(rng.random('location') * LOCATIONS.length)];
        const conv = simulateConversation([npcA, npcB, npcC], location, rng, config.maxTurns);

        // Update running stats
        runningStats.totalConversations++;
        runningStats.totalTurns += conv.turns.length;
        runningStats.topicCounts[conv.topic] = (runningStats.topicCounts[conv.topic] || 0) + 1;

        if (config.hyperbolic === 0) {
          runningStats.turnCounts.push(conv.turns.length);
        }

        if (sampleConversations.length < 10) {
          sampleConversations.push(conv);
        }

        for (const turn of conv.turns) {
          runningStats.speakerCounts[turn.speaker] = (runningStats.speakerCounts[turn.speaker] || 0) + 1;
          runningStats.poolCounts[turn.pool] = (runningStats.poolCounts[turn.pool] || 0) + 1;

          if (config.extractTemplates) {
            const isGoodTemplate =
              turn.text.length > 10 &&
              !turn.text.match(/^\*[^*]+\*$/) &&
              turn.text.match(/[a-zA-Z]{3,}/);

            if (isGoodTemplate) {
              const normalizedText = turn.text
                .replace(/\b(Willy One Eye|Mr\. Bones|Dr\. Maxwell|King James|Boo G|Dr\. Voss|The General|Stitch Up Girl|Detective Clausen|Boots|X-treme|Body Count|Keith Man|Mr\. Kevin)\b/gi, '{{TARGET}}')
                .toLowerCase()
                .trim();
              const key = `${turn.speaker}|${turn.pool}|${normalizedText}`;

              if (!uniqueTemplates.has(key)) {
                uniqueTemplates.set(key, {
                  id: `perm-${turn.speaker}-${uniqueTemplates.size}`,
                  entitySlug: turn.speaker,
                  pool: turn.pool,
                  mood: turn.mood,
                  text: turn.text,
                  weight: 10,
                  purpose: 'ambient',
                  context: {
                    conversationWith: turn.reactionTo,
                    location: conv.location,
                    topic: conv.topic,
                  },
                });
              }
            }
          }
        }

        completed++;
        if (!config.hyperbolic && (completed % 50 === 0 || config.verbose)) {
          process.stdout.write(`\rProgress: ${progressBar(completed, conversationsPerPass)}`);
        }
      }
    }

  // End of hyperbolic loop
  } while (config.hyperbolic > 0 && Date.now() < endTime && !interrupted);

  console.log(); // New line after progress

  // Get final templates (already deduplicated via Map)
  const finalTemplates = Array.from(uniqueTemplates.values());
  console.log(`Unique templates collected: ${finalTemplates.length}`);

  // Calculate turn stats (only meaningful in single-pass mode)
  const turnStats = runningStats.turnCounts.length > 0
    ? calculateStats(runningStats.turnCounts)
    : { min: 0, max: 0, mean: runningStats.totalTurns / Math.max(runningStats.totalConversations, 1), median: 0, stdDev: 0 };

  const duration = Date.now() - startTime;

  // Output results
  const logDir = path.join(__dirname, '../logs');
  fs.mkdirSync(logDir, { recursive: true });

  // Write JSON results
  const jsonPath = writeSimResults(
    'npc-chat-permutations',
    {
      conversations: runningStats.totalConversations,
      totalTurns: runningStats.totalTurns,
      turnStats,
      speakerCounts: runningStats.speakerCounts,
      topicCounts: runningStats.topicCounts,
      poolCounts: runningStats.poolCounts,
      sampleConversations,
    },
    config,
    { logDir, seed: config.seed, duration_ms: duration }
  );
  console.log(`Results: ${jsonPath}`);

  // Write extracted templates if enabled
  if (config.extractTemplates && finalTemplates.length > 0) {
    const templatesPath = path.join(logDir, `extracted-templates-${config.seed}.json`);
    fs.writeFileSync(templatesPath, JSON.stringify(finalTemplates, null, 2));
    console.log(`Templates: ${templatesPath} (${finalTemplates.length} unique templates)`);

    // Also write TypeScript format
    const tsPath = path.join(logDir, `extracted-templates-${config.seed}.ts`);
    const tsContent = `/**
 * Auto-generated templates from chat permutation simulation
 * Seed: ${config.seed}
 * Generated: ${new Date().toISOString()}
 * Total conversations: ${runningStats.totalConversations}
 * Passes: ${passNumber}
 */

import type { ResponseTemplate } from '../../apps/web/src/data/npc-chat/types';

export const PERMUTATION_TEMPLATES: ResponseTemplate[] = ${JSON.stringify(
      finalTemplates.map(t => ({
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
    console.log(`TypeScript: ${tsPath}`);
  }

  // Print summary
  const summaryStats: Record<string, string | number> = {
    'Conversations': runningStats.totalConversations,
    'Total turns': runningStats.totalTurns,
    'Avg turns': turnStats.mean.toFixed(1),
    'Unique speakers': Object.keys(runningStats.speakerCounts).length,
    'Topics covered': Object.keys(runningStats.topicCounts).length,
    'Unique templates': finalTemplates.length,
  };
  if (config.hyperbolic > 0) {
    summaryStats['Passes'] = passNumber;
  }
  printSummary('NPC Chat Permutations', duration, summaryStats);

  // Print top speakers
  console.log('\nTop speakers:');
  const sortedSpeakers = Object.entries(runningStats.speakerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  for (const [slug, count] of sortedSpeakers) {
    const npc = getNPCDefinition(slug);
    console.log(`  ${npc?.identity.name || slug}: ${count} lines`);
  }

  // Print sample conversation
  if (sampleConversations.length > 0 && config.verbose) {
    console.log('\n--- Sample Conversation ---');
    const sample = sampleConversations[0];
    console.log(`Location: ${sample.location}`);
    console.log(`Topic: ${sample.topic}`);
    console.log(`Participants: ${sample.participantNames.join(', ')}`);
    console.log();
    for (const turn of sample.turns) {
      console.log(`[${turn.speakerName}] (${turn.mood}/${turn.pool})`);
      console.log(`  ${turn.text}`);
    }
  }
}

main().catch(console.error);
