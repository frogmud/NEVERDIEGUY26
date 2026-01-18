#!/usr/bin/env ts-node
/**
 * Chatbase Restock Script
 *
 * Analyzes template gaps and generates new dialogue to fill coverage holes.
 * Uses NPC personality data to create character-appropriate responses.
 *
 * Usage:
 *   npx tsx scripts/npc-chatbase-restock.ts [--dry-run] [--npc=slug] [--pool=pool]
 *
 * Options:
 *   --dry-run      Preview generated templates without writing
 *   --use-claude   Use Claude API for creative dialogue generation
 *   --npc=slug     Only process specific NPC
 *   --pool=pool    Only process specific pool
 *   --min=N        Minimum templates per pool per NPC (default: 3)
 *   --output=path  Custom output file path
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Track Claude errors
let claudeErrorCount = 0;

import {
  ALL_NPCS,
  WANDERER_NPCS,
  TRAVELER_NPCS,
  PANTHEON_NPCS,
  type EnhancedNPCConfig,
} from '../src/npcs/definitions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Configuration
// ============================================

const CHATBASE_PATH = path.join(
  __dirname,
  '../../../apps/web/src/data/npc-chat/npcs/chatbase-extracted.ts'
);

const DEFAULT_OUTPUT = path.join(__dirname, '../generated/chatbase-restock.ts');

const REQUIRED_POOLS = ['greeting', 'reaction', 'lore', 'hint', 'farewell'] as const;
const OPTIONAL_POOLS = ['challenge', 'salesPitch', 'idle', 'threat'] as const;
const ALL_POOLS = [...REQUIRED_POOLS, ...OPTIONAL_POOLS] as const;

type TemplatePool = (typeof ALL_POOLS)[number];

// ============================================
// Types
// ============================================

interface ExistingTemplate {
  id: string;
  entitySlug: string;
  pool: string;
  mood: string;
  text: string;
  weight: number;
  purpose: string;
}

interface TemplateGap {
  npcSlug: string;
  npcName: string;
  pool: TemplatePool;
  currentCount: number;
  neededCount: number;
  priority: 'high' | 'medium' | 'low';
}

interface GeneratedTemplate {
  id: string;
  entitySlug: string;
  pool: TemplatePool;
  mood: string;
  text: string;
  weight: number;
  purpose: string;
}

// ============================================
// Template Patterns by Pool + Category
// ============================================

interface TemplatePattern {
  moods: string[];
  patterns: string[];
  purposes: string[];
}

const POOL_PATTERNS: Record<TemplatePool, Record<string, TemplatePattern>> = {
  greeting: {
    wanderer: {
      moods: ['neutral', 'pleased', 'curious'],
      patterns: [
        '{{action}} "{{dialogue}}"',
        '"{{dialogue}}"',
        '*{{gesture}}* "{{dialogue}}"',
      ],
      purposes: ['ambient', 'acknowledge'],
    },
    traveler: {
      moods: ['neutral', 'pleased', 'concerned'],
      patterns: [
        '"{{dialogue}}"',
        '*{{gesture}}* "{{dialogue}}"',
        '{{action}}',
      ],
      purposes: ['ambient', 'acknowledge'],
    },
    pantheon: {
      moods: ['cryptic', 'threatening', 'neutral'],
      patterns: [
        '"{{dialogue}}"',
        '*{{gesture}}*',
        '{{action}} "{{dialogue}}"',
      ],
      purposes: ['ambient', 'challenge'],
    },
  },
  reaction: {
    wanderer: {
      moods: ['amused', 'curious', 'pleased', 'annoyed'],
      patterns: [
        '"{{dialogue}}"',
        '*{{gesture}}* "{{dialogue}}"',
        '{{exclamation}}',
      ],
      purposes: ['ambient', 'acknowledge'],
    },
    traveler: {
      moods: ['neutral', 'concerned', 'amused'],
      patterns: [
        '"{{dialogue}}"',
        '*{{gesture}}*',
        '"{{dialogue}}" *{{gesture}}*',
      ],
      purposes: ['ambient', 'acknowledge'],
    },
    pantheon: {
      moods: ['cryptic', 'amused', 'threatening', 'pleased'],
      patterns: [
        '"{{dialogue}}"',
        '*{{gesture}}*',
        '{{observation}}',
      ],
      purposes: ['ambient', 'challenge'],
    },
  },
  lore: {
    wanderer: {
      moods: ['neutral', 'cryptic', 'curious'],
      patterns: [
        '"{{lore}}"',
        '*{{gesture}}* "{{lore}}"',
        '"{{lore}}" *{{gesture}}*',
      ],
      purposes: ['lore', 'ambient'],
    },
    traveler: {
      moods: ['neutral', 'cryptic', 'concerned'],
      patterns: [
        '"{{lore}}"',
        '*{{gesture}}* "{{lore}}"',
      ],
      purposes: ['lore', 'ambient'],
    },
    pantheon: {
      moods: ['cryptic', 'threatening', 'neutral'],
      patterns: [
        '"{{lore}}"',
        '*{{gesture}}* "{{lore}}"',
        '{{cosmic_observation}}',
      ],
      purposes: ['lore', 'challenge'],
    },
  },
  hint: {
    wanderer: {
      moods: ['neutral', 'cryptic', 'pleased'],
      patterns: [
        '"{{hint}}"',
        '*{{gesture}}* "{{hint}}"',
        '"{{hint}}" *{{gesture}}*',
      ],
      purposes: ['hint', 'ambient'],
    },
    traveler: {
      moods: ['neutral', 'concerned', 'cryptic'],
      patterns: [
        '"{{hint}}"',
        '*{{gesture}}* "{{hint}}"',
      ],
      purposes: ['hint', 'ambient'],
    },
    pantheon: {
      moods: ['cryptic', 'amused', 'threatening'],
      patterns: [
        '"{{hint}}"',
        '*{{gesture}}*',
        '{{riddle}}',
      ],
      purposes: ['hint', 'challenge'],
    },
  },
  farewell: {
    wanderer: {
      moods: ['neutral', 'pleased', 'amused'],
      patterns: [
        '"{{farewell}}"',
        '*{{gesture}}* "{{farewell}}"',
      ],
      purposes: ['ambient', 'acknowledge'],
    },
    traveler: {
      moods: ['neutral', 'concerned', 'pleased'],
      patterns: [
        '"{{farewell}}"',
        '*{{gesture}}*',
      ],
      purposes: ['ambient', 'acknowledge'],
    },
    pantheon: {
      moods: ['cryptic', 'threatening', 'neutral'],
      patterns: [
        '"{{farewell}}"',
        '*{{gesture}}*',
        '{{ominous_farewell}}',
      ],
      purposes: ['ambient', 'challenge'],
    },
  },
  challenge: {
    wanderer: {
      moods: ['amused', 'curious', 'neutral'],
      patterns: [
        '"{{challenge}}"',
        '*{{gesture}}* "{{challenge}}"',
      ],
      purposes: ['challenge', 'ambient'],
    },
    traveler: {
      moods: ['neutral', 'concerned', 'focused'],
      patterns: [
        '"{{challenge}}"',
        '*{{gesture}}*',
      ],
      purposes: ['challenge', 'ambient'],
    },
    pantheon: {
      moods: ['threatening', 'cryptic', 'amused'],
      patterns: [
        '"{{challenge}}"',
        '*{{gesture}}*',
        '{{ultimatum}}',
      ],
      purposes: ['challenge', 'threat'],
    },
  },
  salesPitch: {
    wanderer: {
      moods: ['pleased', 'curious', 'neutral'],
      patterns: [
        '"{{pitch}}"',
        '*{{gesture}}* "{{pitch}}"',
        '"{{pitch}}" *{{gesture}}*',
      ],
      purposes: ['trade', 'ambient'],
    },
    traveler: {
      moods: ['neutral', 'pleased'],
      patterns: [
        '"{{pitch}}"',
        '*{{gesture}}*',
      ],
      purposes: ['trade', 'ambient'],
    },
    pantheon: {
      moods: ['cryptic', 'amused', 'threatening'],
      patterns: [
        '"{{bargain}}"',
        '*{{gesture}}*',
      ],
      purposes: ['trade', 'challenge'],
    },
  },
  idle: {
    wanderer: {
      moods: ['neutral', 'cryptic', 'amused'],
      patterns: [
        '*{{idle_action}}*',
        '"{{mutter}}"',
        '*{{gesture}}*',
      ],
      purposes: ['ambient'],
    },
    traveler: {
      moods: ['neutral', 'concerned', 'cryptic'],
      patterns: [
        '*{{idle_action}}*',
        '*{{gesture}}*',
      ],
      purposes: ['ambient'],
    },
    pantheon: {
      moods: ['cryptic', 'threatening', 'neutral'],
      patterns: [
        '*{{cosmic_idle}}*',
        '*{{gesture}}*',
        '{{observation}}',
      ],
      purposes: ['ambient'],
    },
  },
  threat: {
    wanderer: {
      moods: ['annoyed', 'threatening', 'neutral'],
      patterns: [
        '"{{threat}}"',
        '*{{gesture}}* "{{threat}}"',
      ],
      purposes: ['threat', 'challenge'],
    },
    traveler: {
      moods: ['concerned', 'threatening', 'neutral'],
      patterns: [
        '"{{warning}}"',
        '*{{gesture}}*',
      ],
      purposes: ['threat', 'ambient'],
    },
    pantheon: {
      moods: ['threatening', 'cryptic', 'amused'],
      patterns: [
        '"{{doom}}"',
        '*{{menacing_gesture}}*',
        '{{ultimatum}}',
      ],
      purposes: ['threat', 'challenge'],
    },
  },
};

// ============================================
// NPC-Specific Dialogue Banks
// ============================================

interface NPCDialogueBank {
  greetings: string[];
  reactions: string[];
  lore: string[];
  hints: string[];
  farewells: string[];
  challenges: string[];
  sales: string[];
  idles: string[];
  threats: string[];
  gestures: string[];
  voice: string;
}

const NPC_DIALOGUE_BANKS: Record<string, Partial<NPCDialogueBank>> = {
  // WANDERERS
  'willy': {
    voice: 'enthusiastic salesman',
    greetings: [
      'Welcome, welcome! You look like someone who appreciates quality!',
      'Ah, a discerning customer approaches!',
      'Step right up! Deals await!',
    ],
    reactions: [
      'Now THAT is what I call a roll!',
      'Ooh, the dice smiled on that one!',
      'Ha! Even I could not have predicted that!',
    ],
    sales: [
      'This piece fell through exactly three dimensions to get here!',
      'Certified pre-owned by only two previous apocalypses!',
      'Limited edition - only infinite copies made!',
    ],
    gestures: ['rattles wares excitedly', 'grins widely', 'gestures grandly'],
  },
  'mr-bones': {
    voice: 'ominous debt collector',
    greetings: [
      'The ledger has been expecting you.',
      'Your account... is active.',
      'Death remembers all transactions.',
    ],
    reactions: [
      'Noted. The ledger updates.',
      'Interesting. That affects your balance.',
      '*rattles thoughtfully* The math checks out.',
    ],
    lore: [
      'I have collected debts since before there was currency.',
      'The ledger is older than memory itself.',
      'Every soul owes something. Few pay willingly.',
    ],
    gestures: ['rattles bones', 'consults ledger', 'adjusts skeletal fingers'],
  },
  'dr-maxwell': {
    voice: 'manic scientist',
    greetings: [
      'EXCELLENT! A new data point!',
      'The probability of your arrival was... IRRELEVANT! You are here!',
      'FASCINATING specimen-- er, I mean, FRIEND!',
    ],
    reactions: [
      'REMARKABLE! The variance is unprecedented!',
      'The data... THE DATA! It DEFIES the model!',
      '*scribbles frantically* This changes EVERYTHING!',
    ],
    lore: [
      'Die-rectors are FASCINATING specimens of probability manipulation!',
      'The sphere contains more data than all previous experiments COMBINED!',
      'Luck is merely unexplained causality!',
    ],
    gestures: ['adjusts goggles', 'scribbles notes', 'examines clipboard'],
  },
  'boo-g': {
    voice: 'ghostly rapper',
    greetings: [
      'Yo yo YO! The afterlife MC is in the HOUSE!',
      'Wassup, living fam! Ready to vibe?',
      'BOO! Ha! Did I scare you? The dice will!',
    ],
    reactions: [
      'That roll was FIRE! Ghostly fire, but still!',
      'Ayyyy! Thats what I call a HOT HAND!',
      '*floats excitedly* Now THATS a vibe!',
    ],
    farewells: [
      'Peace out, fam! Stay spooky!',
      'Later! Remember: death is just the beginning of the remix!',
      'BOO! I mean, bye! Ghost humor!',
    ],
    gestures: ['floats to unheard beat', 'ghostly reverb', 'phases slightly'],
  },
  'the-general-wanderer': {
    voice: 'military commander',
    greetings: [
      'At ease, civilian. State your supply requirements.',
      'Welcome to Command and Supply.',
      'Transaction or reconnaissance? Decide quickly.',
    ],
    sales: [
      'Standard issue. Battle-tested through seventeen campaigns.',
      'This equipment has seen more combat than most soldiers.',
      'Reliable. Effective. Mission-approved.',
    ],
    hints: [
      'A direct assault is rarely the optimal strategy.',
      'Supply lines win wars. Resources win battles.',
      'Know your terrain. The sphere reveals weaknesses.',
    ],
    gestures: ['surveys surroundings', 'checks inventory', 'stands at attention'],
  },
  'dr-voss': {
    voice: 'cold researcher',
    greetings: [
      'Subject returns for observation. Noted.',
      'Your behavioral patterns remain... interesting.',
      'Data collection continues.',
    ],
    lore: [
      'The void is potential refusing to collapse into certainty.',
      'Probability is merely the shadow of infinite possibility.',
      'Every outcome exists somewhere. We merely... observe.',
    ],
    gestures: ['examines void readings', 'adjusts instruments', 'takes notes'],
  },
  'xtreme': {
    voice: 'extreme sports enthusiast',
    greetings: [
      'LETS GOOO! Ready for MAXIMUM DICE ACTION?!',
      'Yo! The adrenaline junkie is READY!',
      'EXTREME vibes ONLY! You in?!',
    ],
    reactions: [
      'THAT WAS SICK! Full send!',
      'YOOOO! Did you SEE that?! RADICAL!',
      'GNARLY roll! Keep that energy!',
    ],
    challenges: [
      'BET you cant beat my HIGH SCORE!',
      'Think you can handle EXTREME mode?!',
      'FULL SEND or NO SEND! What is it gonna be?!',
    ],
    gestures: ['pumps fist', 'does extreme pose', 'vibrates with energy'],
  },
  'king-james': {
    voice: 'nihilistic royalty',
    greetings: [
      'You stand before the Null Throne. Act accordingly.',
      'A subject returns to court. The void... acknowledges.',
      'Welcome to the kingdom of nothing.',
    ],
    lore: [
      'I rule over what does not exist. It is more than you would think.',
      'The Null Throne was built from forgotten possibilities.',
      'Royal blood is merely organized probability.',
    ],
    sales: [
      'Items of questionable existence. The uncertainty is the value.',
      'Royal merchandise. Side effects include existential awareness.',
    ],
    gestures: ['adjusts crown', 'gazes into void', 'waves dismissively'],
  },

  // TRAVELERS
  'stitch-up-girl': {
    voice: 'pragmatic medic',
    greetings: [
      'Need patching up? You look rough.',
      'Back again? Your integrity must be suffering.',
      'Lets see the damage. Hold still.',
    ],
    reactions: [
      'That looked painful. Anything fall off?',
      'Not a scratch! The dice like you today.',
      '*checks supplies* Might need stitches after that one.',
    ],
    hints: [
      'Integrity is easier to maintain than restore.',
      'The cheap way out costs more eventually.',
      'Some wounds heal. Some dont. Know the difference.',
    ],
    gestures: ['checks medical supplies', 'sharpens scissors', 'examines patient'],
  },
  'body-count': {
    voice: 'silent tracker',
    greetings: [
      '*marks tally* Another face.',
      '... You. Again. Still breathing.',
      '*counting* One more.',
    ],
    reactions: [
      '*updates count*',
      '... Unexpected. The tally adjusts.',
      '*silent nod*',
    ],
    hints: [
      'Left path: twelve died yesterday. Right: seven.',
      'Movement ahead. Not friendly.',
      'The count says turn back. You will not.',
    ],
    gestures: ['counts silently', 'marks tally', 'observes shadows'],
  },
  'boots': {
    voice: 'ancient cosmic cat',
    greetings: [
      '*yawns cosmically* Oh. You again.',
      '*stretches* Entertain me, mortal.',
      'I was napping across three timelines. What is it?',
    ],
    lore: [
      'I have witnessed the birth and death of stars. Also, nap time.',
      'Curiosity killed the cat nine times. I am on life twelve.',
      'The sphere is interesting. Not as interesting as sunny spots.',
    ],
    farewells: [
      '*yawns* Go do your thing. I will be napping.',
      'Wake me when something actually interesting happens.',
    ],
    gestures: ['naps cosmically', 'grooms paw', 'watches with ancient eyes'],
  },
  'clausen': {
    voice: 'noir detective',
    greetings: [
      '*lights cigarette* Another case walks through my door.',
      'Infernus. The city that never sleeps. Neither do I.',
      'You have that look. The desperate kind.',
    ],
    hints: [
      'My gut says something is wrong ahead. Trust it.',
      'In this business, paranoia keeps you breathing.',
      'Everyone is lying about something. Find out what.',
    ],
    lore: [
      'I have seen things in Infernus that would melt lesser minds.',
      'The Die-rectors play games. We are the pieces.',
    ],
    gestures: ['exhales smoke', 'adjusts hat', 'surveys the scene'],
  },
  'keith-man': {
    voice: 'cryptic oracle',
    greetings: [
      '... You are early. Or late. Time is optional here.',
      '... The pattern recognized you.',
      '*distant stare* ... You will be important. Or you were.',
    ],
    hints: [
      '... The answer is in the reflection.',
      '... Three becomes one. One becomes three.',
      '... The sphere remembers what you forgot.',
    ],
    gestures: ['stares at nothing', 'phases slightly', 'speaks to unseen things'],
  },
  'mr-kevin': {
    voice: 'unhinged debugger who has been staring at reality\'s source code too long',
    greetings: [
      'oh! oh you loaded in. wait-- yeah okay the spawn worked. i was worried about that one.',
      'hey hey hey. *squints* you\'re rendering correctly which is... huh. nice.',
      'welcome! or-- wait have you been here before? the logs are-- nevermind. hi.',
      '*looks up from nothing* oh. a player. i mean person. i mean-- what are we calling you?',
      'there you are! i saw your thread start but the callback took forever. you good?',
    ],
    lore: [
      'die-rectors? subroutines. big ones. important ones. but between us? *whispers* they don\'t know.',
      'okay so the void right? people think its empty but its actually-- *looks around* --its actually just unrendered. don\'t tell anyone.',
      'the simulation has layers. like an onion. a buggy onion. i\'ve seen seven. there might be more.',
      'fun fact the sphere wasn\'t always round. someone filed a ticket. took forever to fix.',
      'the one? yeah i debug for them sometimes. nice enough. doesn\'t really "exist" in the traditional sense but who does anymore.',
    ],
    hints: [
      'okay so that boss? their hitbox is-- *gestures vaguely* --smaller on the left. trust me i checked.',
      'pro tip the rng isn\'t actually random. its pseudorandom. which means-- wait you didn\'t hear that from me.',
      'see that corner? no? good. don\'t look at it. its not supposed to do that.',
      'if you die just reload. or don\'t. death is just a state change. nothing personal.',
      'the third room has a memory leak. you might see duplicates. just ignore the extra ones.',
    ],
    reactions: [
      'oh that was-- *checks something invisible* --that was definitely not supposed to happen. but it did! so. neat.',
      'huh. interesting. your dice rolled a-- wait that value exists? let me just-- *mutters* --okay yeah that\'s fine apparently.',
      'nice! or concerning? i genuinely can\'t tell anymore. let\'s say nice.',
      '*stares* you just... did that. on purpose? wild.',
    ],
    farewells: [
      'okay yeah go do your thing. i\'ll be here. checking... stuff.',
      'bye! if you crash just-- well you won\'t remember this anyway. safe travels!',
      'see you next loop. or this loop. time is fake here.',
      'don\'t forget to save! or do forget. the autosave might work. probably.',
    ],
    idles: [
      '*stares at empty space* ...that\'s not right.',
      '*mutters* where did that pointer go...',
      '*taps something invisible* still broken.',
      '...is that supposed to flicker?',
      '*to no one* yes i know. i\'m looking at it.',
    ],
    gestures: [
      'examines seam in reality',
      'pokes at invisible bug',
      'scrolls through nothing',
      'squints at the fourth wall',
      'debugs existence casually',
    ],
  },
  'the-general-traveler': {
    voice: 'tactical advisor',
    greetings: [
      'Soldier. Status report.',
      'At ease. Tactical briefing time.',
      'Command appreciates your continued operation.',
    ],
    hints: [
      'Flank left. They never guard the left.',
      'A direct assault is inadvisable. Try subtlety.',
      'Reconnaissance suggests caution.',
    ],
    farewells: [
      'Dismissed. Stay operational.',
      'Move out. Try not to die. Paperwork is annoying.',
    ],
    gestures: ['surveys battlefield', 'checks tactical display', 'salutes'],
  },

  // PANTHEON (Die-rectors)
  'the-one': {
    voice: 'primordial void entity',
    greetings: [
      'You dare enter Null Providence.',
      'Another mortal seeks meaning in the void.',
      'Potential... unrealized. How typical.',
    ],
    threats: [
      'Your existence is temporary. Mine is not.',
      'The void claims all. Eventually.',
      'You are a pattern I will forget.',
    ],
    lore: [
      'Before existence, there was potential. I am that potential.',
      'I am the zero that makes all numbers possible.',
      'Nothing is my domain. Everything is my servant.',
    ],
    gestures: ['existence flickers', 'void ripples', 'silence deepens'],
  },
  'john': {
    voice: 'mechanical efficiency',
    greetings: [
      'Organic unit detected. Processing.',
      'Another flesh-thing requiring optimization.',
      'Welcome to optimal territory.',
    ],
    challenges: [
      'Show me your mechanical precision.',
      'Efficiency will be measured.',
      'Prove you are not waste.',
    ],
    threats: [
      'Inefficiency demands correction.',
      'Your processes are suboptimal.',
      'Removal scheduled.',
    ],
    gestures: ['calculates', 'gears turn', 'systems hum'],
  },
  'peter': {
    voice: 'death incarnate',
    greetings: [
      'Death welcomes you to Shadow Keep.',
      'Your mortality is... refreshing.',
      'The shadows have been expecting you.',
    ],
    threats: [
      'The shadows grow hungry.',
      'Death comes for all. Including you.',
      'Your shadow already belongs to me.',
    ],
    lore: [
      'Every shadow is a debt owed to my domain.',
      'Light borrows what darkness owns.',
    ],
    gestures: ['shadows deepen', 'darkness pulses', 'something moves in periphery'],
  },
  'robert': {
    voice: 'primal fire',
    greetings: [
      'The flames of Infernus greet you.',
      'BURN with purpose or be consumed.',
      'Heat recognizes heat. What burns in you?',
    ],
    challenges: [
      'Show me your passion. Or burn trying.',
      'The flames test all. Few pass.',
      'IGNITE or EXPIRE!',
    ],
    threats: [
      'BURN.',
      'The fire consumes hesitation.',
      'Your ashes will remember fear.',
    ],
    gestures: ['flames intensify', 'heat radiates', 'embers dance'],
  },
  'alice': {
    voice: 'temporal ice entity',
    greetings: [
      'Time moves... differently here in Frost Reach.',
      'You arrived before you left. Curious.',
      'The ice remembers your future.',
    ],
    challenges: [
      'Patience is a weapon. The cold knows this.',
      'Freeze or flow. Choose.',
      'Time tests all. The ice endures.',
    ],
    hints: [
      'The future is frozen. The past, melting.',
      'What you will do has already happened. Somewhere.',
    ],
    gestures: ['time crystallizes', 'ice forms', 'moment stretches'],
  },
  'jane': {
    voice: 'chaos incarnate',
    greetings: [
      'Chaos WELCOMES you to Aberrant!',
      'The wind changes! So do the rules!',
      'Nothing stays! Everything becomes!',
    ],
    challenges: [
      'Adapt or be unmade! Choose quickly - or dont!',
      'The dice are just suggestions here!',
      'Embrace beautiful chaos!',
    ],
    reactions: [
      'HA! Did you expect THAT? Neither did I!',
      'Wonderful! The pattern breaks again!',
      'CHAOS APPROVES! Maybe!',
    ],
    gestures: ['reality shifts', 'rules change', 'probability warps'],
  },
  'rhea': {
    voice: 'cosmic observer',
    greetings: [
      '*ancient gaze settles upon you*',
      'A brief moment enters my awareness.',
      'Time flows. You swim against it.',
    ],
    lore: [
      'I have witnessed the birth and death of galaxies. You are... a moment.',
      'The cosmic wheel turns. You are one spoke.',
      'What you call eternity, I call Tuesday.',
    ],
    gestures: ['observes from beyond time', 'cosmic awareness shifts', 'stars align'],
  },
  'zero-chance': {
    voice: 'probability anomaly',
    greetings: [
      'The probability of our meeting was zero. Yet here you stand.',
      'Impossible made manifest. How delightful.',
      'Statistics said no. Reality said yes.',
    ],
    challenges: [
      'The odds say you should fail. Prove them wrong.',
      'Every roll defies probability. As do you.',
      'Zero percent means nothing to those who persist.',
    ],
    reactions: [
      'Statistically improbable. Delightfully so.',
      'The math says no. You say yes.',
    ],
    gestures: ['probability shifts', 'statistics recalculate', 'impossible occurs'],
  },
  'alien-baby': {
    voice: 'eldritch infant',
    greetings: [
      'Goo goo! You came to pway!',
      'Hewwo fwiend! Want to see weality go SQUISH?',
      '*giggles cosmically* New toy!',
    ],
    threats: [
      'If you make me cwy, I will unmake you!',
      'Dont be boring! Boring things get digested!',
      '*pouts* That was NOT fun! Try again or ELSE!',
    ],
    reactions: [
      '*claps happily* Again! Again!',
      'Ooh! Pwetty explosions!',
      '*giggles* You are funny! In a squishy way!',
    ],
    gestures: ['giggles cosmically', 'reality warps cutely', 'ancient eyes blink'],
  },
};

// ============================================
// Load Existing Templates
// ============================================

function loadExistingTemplates(): Map<string, ExistingTemplate[]> {
  const templateMap = new Map<string, ExistingTemplate[]>();

  try {
    const content = fs.readFileSync(CHATBASE_PATH, 'utf-8');

    // Extract all templates using a robust regex
    const templateRegex = /\{\s*id:\s*['"]([^'"]+)['"],\s*entitySlug:\s*['"]([^'"]+)['"],\s*pool:\s*['"]([^'"]+)['"],\s*mood:\s*['"]([^'"]+)['"],\s*text:\s*['"]([^'"]+)['"],\s*weight:\s*(\d+),\s*purpose:\s*['"]([^'"]+)['"]\s*\}/g;

    let match;
    while ((match = templateRegex.exec(content)) !== null) {
      const template: ExistingTemplate = {
        id: match[1],
        entitySlug: match[2],
        pool: match[3],
        mood: match[4],
        text: match[5],
        weight: parseInt(match[6]),
        purpose: match[7],
      };

      const existing = templateMap.get(template.entitySlug) || [];
      existing.push(template);
      templateMap.set(template.entitySlug, existing);
    }

    console.log(`Loaded ${Array.from(templateMap.values()).flat().length} existing templates`);
  } catch (err) {
    console.warn('Could not load existing chatbase:', err);
  }

  return templateMap;
}

// ============================================
// Gap Analysis
// ============================================

function analyzeGaps(
  existingTemplates: Map<string, ExistingTemplate[]>,
  minPerPool: number,
  targetNpc?: string,
  targetPool?: TemplatePool
): TemplateGap[] {
  const gaps: TemplateGap[] = [];

  for (const npc of ALL_NPCS) {
    const slug = npc.identity.slug;
    if (targetNpc && slug !== targetNpc) continue;

    const templates = existingTemplates.get(slug) || [];

    for (const pool of ALL_POOLS) {
      if (targetPool && pool !== targetPool) continue;

      const poolTemplates = templates.filter(t => t.pool === pool);
      const currentCount = poolTemplates.length;

      if (currentCount < minPerPool) {
        const isRequired = REQUIRED_POOLS.includes(pool as any);
        const priority: 'high' | 'medium' | 'low' =
          currentCount === 0 && isRequired ? 'high' :
          currentCount === 0 ? 'medium' :
          'low';

        gaps.push({
          npcSlug: slug,
          npcName: npc.identity.name,
          pool,
          currentCount,
          neededCount: minPerPool - currentCount,
          priority,
        });
      }
    }
  }

  // Sort by priority (high first) then by needed count
  return gaps.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.neededCount - a.neededCount;
  });
}

// ============================================
// Claude API Integration
// ============================================

const POOL_PROMPTS: Record<TemplatePool, string> = {
  greeting: 'a greeting when the player first approaches',
  reaction: 'a reaction to the player rolling dice or taking an action',
  lore: 'sharing a piece of lore about the game world, the sphere, or Die-rectors',
  hint: 'giving a subtle hint or tip about gameplay',
  farewell: 'a farewell when the player leaves',
  challenge: 'challenging the player to prove themselves',
  salesPitch: 'pitching their wares or services',
  idle: 'an idle action or muttering while waiting',
  threat: 'a threatening or ominous statement',
};

function buildClaudePrompt(
  npcSlug: string,
  npcName: string,
  pool: TemplatePool,
  category: 'wanderer' | 'traveler' | 'pantheon',
  voice: string,
  existingExamples: string[]
): string {
  const poolDesc = POOL_PROMPTS[pool];
  const examplesText = existingExamples.length > 0
    ? `\n\nExisting examples of their ${pool} dialogue:\n${existingExamples.map(e => `- "${e}"`).join('\n')}`
    : '';

  return `You are ${npcName}, a ${category} NPC in a roguelike dice game called "Never Die Guy".

Your voice/personality: ${voice}

Write 3 short dialogue lines for ${poolDesc}. Each line should:
- Be 1-2 sentences max
- Match your personality and voice
- Feel natural for a game NPC
- Can include *action text* in asterisks
${examplesText}

Respond with ONLY the 3 dialogue lines, one per line, no numbering or quotes.`;
}

async function generateWithClaude(
  npcSlug: string,
  npcName: string,
  pool: TemplatePool,
  category: 'wanderer' | 'traveler' | 'pantheon',
  apiKey: string
): Promise<string[]> {
  const dialogueBank = NPC_DIALOGUE_BANKS[npcSlug];
  const voice = dialogueBank?.voice || `${category} character`;

  // Get existing examples for context
  const existingExamples: string[] = [];
  switch (pool) {
    case 'greeting': existingExamples.push(...(dialogueBank?.greetings || [])); break;
    case 'reaction': existingExamples.push(...(dialogueBank?.reactions || [])); break;
    case 'lore': existingExamples.push(...(dialogueBank?.lore || [])); break;
    case 'hint': existingExamples.push(...(dialogueBank?.hints || [])); break;
    case 'farewell': existingExamples.push(...(dialogueBank?.farewells || [])); break;
    case 'challenge': existingExamples.push(...(dialogueBank?.challenges || [])); break;
    case 'salesPitch': existingExamples.push(...(dialogueBank?.sales || [])); break;
    case 'idle': existingExamples.push(...(dialogueBank?.idles || [])); break;
    case 'threat': existingExamples.push(...(dialogueBank?.threats || [])); break;
  }

  const prompt = buildClaudePrompt(npcSlug, npcName, pool, category, voice, existingExamples.slice(0, 3));

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
        max_tokens: 200,
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
      return [];
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Parse response into lines
    const lines = text
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 5 && !line.match(/^\d+\./))
      .map((line: string) => line.replace(/^["']|["']$/g, '').trim());

    return lines.slice(0, 3);
  } catch (err) {
    claudeErrorCount++;
    if (claudeErrorCount <= 3) {
      console.log(`Claude fetch error: ${err}`);
    }
    return [];
  }
}

// ============================================
// Template Generation
// ============================================

function getNPCCategory(slug: string): 'wanderer' | 'traveler' | 'pantheon' {
  if (WANDERER_NPCS.some(n => n.identity.slug === slug)) return 'wanderer';
  if (TRAVELER_NPCS.some(n => n.identity.slug === slug)) return 'traveler';
  return 'pantheon';
}

function generateTemplatesForGap(gap: TemplateGap): GeneratedTemplate[] {
  const templates: GeneratedTemplate[] = [];
  const category = getNPCCategory(gap.npcSlug);
  const patterns = POOL_PATTERNS[gap.pool]?.[category];
  const dialogueBank = NPC_DIALOGUE_BANKS[gap.npcSlug];

  if (!patterns) return templates;

  // Get dialogue options for this pool
  let dialogueOptions: string[] = [];
  const gestures = dialogueBank?.gestures || ['pauses'];

  switch (gap.pool) {
    case 'greeting':
      dialogueOptions = dialogueBank?.greetings || [];
      break;
    case 'reaction':
      dialogueOptions = dialogueBank?.reactions || [];
      break;
    case 'lore':
      dialogueOptions = dialogueBank?.lore || [];
      break;
    case 'hint':
      dialogueOptions = dialogueBank?.hints || [];
      break;
    case 'farewell':
      dialogueOptions = dialogueBank?.farewells || [];
      break;
    case 'challenge':
      dialogueOptions = dialogueBank?.challenges || [];
      break;
    case 'salesPitch':
      dialogueOptions = dialogueBank?.sales || [];
      break;
    case 'idle':
      dialogueOptions = dialogueBank?.idles || [];
      break;
    case 'threat':
      dialogueOptions = dialogueBank?.threats || [];
      break;
  }

  // If no specific dialogue, generate from gestures
  if (dialogueOptions.length === 0) {
    dialogueOptions = gestures.map(g => `*${g}*`);
  }

  // Generate needed templates
  for (let i = 0; i < gap.neededCount && i < dialogueOptions.length; i++) {
    const mood = patterns.moods[i % patterns.moods.length];
    const purpose = patterns.purposes[0];
    const text = dialogueOptions[i];

    templates.push({
      id: `restock-${gap.npcSlug}-${gap.pool}-${Date.now()}-${i}`,
      entitySlug: gap.npcSlug,
      pool: gap.pool,
      mood,
      text,
      weight: 10,
      purpose,
    });
  }

  return templates;
}

async function generateTemplatesWithClaude(
  gap: TemplateGap,
  apiKey: string
): Promise<GeneratedTemplate[]> {
  const category = getNPCCategory(gap.npcSlug);
  const patterns = POOL_PATTERNS[gap.pool]?.[category];

  if (!patterns) return [];

  // Call Claude to generate dialogue
  const dialogueLines = await generateWithClaude(
    gap.npcSlug,
    gap.npcName,
    gap.pool,
    category,
    apiKey
  );

  if (dialogueLines.length === 0) {
    // Fall back to static generation
    return generateTemplatesForGap(gap);
  }

  const templates: GeneratedTemplate[] = [];

  for (let i = 0; i < gap.neededCount && i < dialogueLines.length; i++) {
    const mood = patterns.moods[i % patterns.moods.length];
    const purpose = patterns.purposes[0];

    templates.push({
      id: `claude-${gap.npcSlug}-${gap.pool}-${Date.now()}-${i}`,
      entitySlug: gap.npcSlug,
      pool: gap.pool,
      mood,
      text: dialogueLines[i],
      weight: 12, // Slightly higher weight for Claude-generated
      purpose,
    });
  }

  return templates;
}

// ============================================
// Output Generation
// ============================================

function formatTemplatesAsTS(templates: GeneratedTemplate[], claudeEnabled: boolean): string {
  const claudeTemplates = templates.filter(t => t.id.startsWith('claude-')).length;
  const staticTemplates = templates.length - claudeTemplates;

  const lines = [
    '/**',
    ' * Chatbase Restock - Auto-generated templates',
    ` * Generated: ${new Date().toISOString()}`,
    ` * Mode: ${claudeEnabled ? 'Claude API' : 'Static'}`,
    ` * Claude-generated: ${claudeTemplates}, Static: ${staticTemplates}`,
    ' * ',
    ' * Review and merge into chatbase-extracted.ts',
    ' */',
    '',
    "import type { ResponseTemplate } from '../types';",
    '',
    'export const RESTOCK_TEMPLATES: ResponseTemplate[] = [',
  ];

  for (const t of templates) {
    // Escape quotes in text
    const escapedText = t.text.replace(/'/g, "\\'");
    lines.push(
      `  { id: '${t.id}', entitySlug: '${t.entitySlug}', pool: '${t.pool}', mood: '${t.mood}', text: '${escapedText}', weight: ${t.weight}, purpose: '${t.purpose}' },`
    );
  }

  lines.push('];');
  lines.push('');

  return lines.join('\n');
}

// ============================================
// Main
// ============================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const useClaude = args.includes('--use-claude');
  const npcArg = args.find(a => a.startsWith('--npc='));
  const poolArg = args.find(a => a.startsWith('--pool='));
  const minArg = args.find(a => a.startsWith('--min='));
  const outputArg = args.find(a => a.startsWith('--output='));

  const targetNpc = npcArg?.split('=')[1];
  const targetPool = poolArg?.split('=')[1] as TemplatePool | undefined;
  const minPerPool = minArg ? parseInt(minArg.split('=')[1]) : 3;
  const outputPath = outputArg?.split('=')[1] || DEFAULT_OUTPUT;

  // Check for API key if using Claude
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  let claudeEnabled = useClaude;

  if (useClaude && !apiKey) {
    console.warn('WARNING: --use-claude specified but ANTHROPIC_API_KEY not set');
    console.warn('Falling back to static generation');
    claudeEnabled = false;
  }

  console.log('='.repeat(60));
  console.log('CHATBASE RESTOCK');
  console.log('='.repeat(60));
  console.log(`Min templates per pool: ${minPerPool}`);
  console.log(`Claude API: ${claudeEnabled ? 'Enabled' : 'Disabled'}`);
  if (targetNpc) console.log(`Target NPC: ${targetNpc}`);
  if (targetPool) console.log(`Target Pool: ${targetPool}`);
  if (dryRun) console.log('DRY RUN - No files will be written');
  console.log('');

  // Load existing templates
  const existingTemplates = loadExistingTemplates();

  // Analyze gaps
  const gaps = analyzeGaps(existingTemplates, minPerPool, targetNpc, targetPool);

  console.log(`\nFound ${gaps.length} gaps to fill:`);
  console.log(`  High priority: ${gaps.filter(g => g.priority === 'high').length}`);
  console.log(`  Medium priority: ${gaps.filter(g => g.priority === 'medium').length}`);
  console.log(`  Low priority: ${gaps.filter(g => g.priority === 'low').length}`);

  // Generate templates
  const allGenerated: GeneratedTemplate[] = [];
  let claudeCount = 0;
  let staticCount = 0;

  for (const gap of gaps) {
    let generated: GeneratedTemplate[];

    if (claudeEnabled) {
      generated = await generateTemplatesWithClaude(gap, apiKey);
      if (generated.some(t => t.id.startsWith('claude-'))) {
        claudeCount += generated.length;
      } else {
        staticCount += generated.length;
      }
      // Rate limit to avoid API throttling
      await new Promise(resolve => setTimeout(resolve, 200));
    } else {
      generated = generateTemplatesForGap(gap);
      staticCount += generated.length;
    }

    if (generated.length > 0) {
      allGenerated.push(...generated);
      const source = generated[0].id.startsWith('claude-') ? '[Claude]' : '[Static]';
      console.log(`  ${source} ${gap.npcName} / ${gap.pool}: +${generated.length} templates`);
    }
  }

  console.log(`\nTotal generated: ${allGenerated.length} templates`);
  if (claudeEnabled) {
    console.log(`  Claude-generated: ${claudeCount}`);
    console.log(`  Static fallback: ${staticCount}`);
  }

  if (allGenerated.length === 0) {
    console.log('No templates to generate - coverage is sufficient!');
    return;
  }

  // Format output
  const output = formatTemplatesAsTS(allGenerated, claudeEnabled);

  if (dryRun) {
    console.log('\n--- PREVIEW ---\n');
    console.log(output);
    console.log('\n--- END PREVIEW ---');
  } else {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    fs.mkdirSync(outputDir, { recursive: true });

    // Write output
    fs.writeFileSync(outputPath, output);
    console.log(`\nWritten to: ${outputPath}`);
    console.log('Review and merge into chatbase-extracted.ts');
  }

  console.log('\n' + '='.repeat(60));
  console.log('DONE');
  console.log('='.repeat(60));
}

main().catch(console.error);
