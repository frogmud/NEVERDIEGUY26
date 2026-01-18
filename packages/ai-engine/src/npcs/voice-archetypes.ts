/**
 * NPC Voice Archetypes
 *
 * Defines how each NPC "sounds" through text - speech patterns,
 * quirks, energy levels, and linguistic fingerprints.
 *
 * These archetypes inform dialogue generation and can be mixed.
 */

// ============================================
// Voice Archetype Definitions
// ============================================

export interface VoiceArchetype {
  id: string;
  name: string;
  description: string;

  // How they structure sentences
  sentenceStyle: 'complete' | 'fragments' | 'stream' | 'terse' | 'symbolic';

  // Punctuation tendencies
  punctuation: {
    usesEllipsis: boolean; // "..."
    usesEmDash: boolean; // "--"
    usesCaps: boolean; // "EMPHASIS"
    usesAsterisks: boolean; // "*action*"
    custom?: string[]; // Special punctuation/symbols
  };

  // Energy level affects word choice and pacing
  energy: 'manic' | 'wired' | 'neutral' | 'tired' | 'dead';

  // Capitalization style
  capitalization: 'normal' | 'lowercase' | 'uppercase' | 'mixed';

  // Speech patterns
  patterns: {
    interruptsSelf: boolean; // "wait-- no, i mean--"
    trailsOff: boolean; // "and then..."
    asksRhetorically: boolean; // "you know?"
    talksToAbsent: boolean; // talks to things not there
    breaksWall: boolean; // fourth wall awareness
    usesJargon: string[]; // domain-specific vocabulary
  };

  // Example transforms showing before/after
  examples: Array<{
    generic: string;
    voiced: string;
  }>;
}

// ============================================
// Core Archetypes
// ============================================

export const VOICE_ARCHETYPES: Record<string, VoiceArchetype> = {
  // ---- Mr. Kevin ----
  'unhinged-debugger': {
    id: 'unhinged-debugger',
    name: 'Unhinged Debugger',
    description: 'Stared at reality\'s source code too long. Tired but wired.',
    sentenceStyle: 'stream',
    punctuation: {
      usesEllipsis: true,
      usesEmDash: true,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'wired',
    capitalization: 'lowercase',
    patterns: {
      interruptsSelf: true,
      trailsOff: true,
      asksRhetorically: true,
      talksToAbsent: true,
      breaksWall: true,
      usesJargon: ['spawn', 'render', 'callback', 'pointer', 'null', 'thread', 'memory leak', 'hitbox', 'rng'],
    },
    examples: [
      { generic: 'Hello, welcome.', voiced: 'oh! oh you loaded in. wait-- yeah okay the spawn worked.' },
      { generic: 'Good job winning.', voiced: 'nice! or concerning? i genuinely can\'t tell anymore. let\'s say nice.' },
    ],
  },

  // ---- Zero Chance - APL Speaker ----
  'apl-oracle': {
    id: 'apl-oracle',
    name: 'APL Oracle',
    description: 'Speaks in APL symbols. Probability incarnate. Cannot use words.',
    sentenceStyle: 'symbolic',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
      custom: ['⍳', '⍴', '⍺', '⍵', '∊', '⍒', '⍋', '⌽', '⊖', '⍉', '∇', '⌈', '⌊', '×', '÷', '⍟', '○', '⌹', '⊂', '⊃', '∪', '∩', '≢', '≡', '⍸', '⍷', '⌿', '⍀', '¨', '⍨', '⍣', '∘', '⍤', '⍥', '←', '→', '⋄', '⍝'],
    },
    energy: 'dead',
    capitalization: 'lowercase',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: false,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: [], // no words, only symbols
    },
    examples: [
      { generic: 'Hello.', voiced: '⍳1' },
      { generic: 'The probability is zero.', voiced: '0≡⍴⍵' },
      { generic: 'Chaos reigns.', voiced: '⌽⊖⍉∇' },
    ],
  },

  // ---- Mr. Bones ----
  'ominous-ledger': {
    id: 'ominous-ledger',
    name: 'Ominous Ledger',
    description: 'Death\'s accountant. Every word is a transaction.',
    sentenceStyle: 'terse',
    punctuation: {
      usesEllipsis: true,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'dead',
    capitalization: 'normal',
    patterns: {
      interruptsSelf: false,
      trailsOff: true,
      asksRhetorically: false,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['ledger', 'balance', 'debt', 'account', 'interest', 'payment', 'due', 'owed', 'collected'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'The ledger notes your arrival.' },
      { generic: 'You won.', voiced: 'A credit... for now.' },
    ],
  },

  // ---- Dr. Maxwell ----
  'manic-scientist': {
    id: 'manic-scientist',
    name: 'Manic Scientist',
    description: 'EVERYTHING IS DATA. Enthusiasm overload.',
    sentenceStyle: 'fragments',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: true,
      usesCaps: true,
      usesAsterisks: true,
    },
    energy: 'manic',
    capitalization: 'mixed',
    patterns: {
      interruptsSelf: true,
      trailsOff: false,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['data', 'hypothesis', 'variance', 'specimen', 'probability', 'experiment', 'FASCINATING', 'REMARKABLE'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'EXCELLENT! A new data point!' },
      { generic: 'Interesting roll.', voiced: 'The variance is-- UNPRECEDENTED! *scribbles*' },
    ],
  },

  // ---- Boo-G ----
  'ghostly-hype': {
    id: 'ghostly-hype',
    name: 'Ghostly Hype',
    description: 'Afterlife MC. Dead but vibing.',
    sentenceStyle: 'fragments',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: true,
      usesAsterisks: true,
    },
    energy: 'manic',
    capitalization: 'mixed',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['yo', 'fam', 'vibe', 'fire', 'boo', 'ghost', 'spooky', 'afterlife', 'remix'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Yo yo YO! The afterlife MC is in the HOUSE!' },
      { generic: 'Good roll.', voiced: 'That roll was FIRE! Ghostly fire, but still!' },
    ],
  },

  // ---- Boots ----
  'cosmic-cat': {
    id: 'cosmic-cat',
    name: 'Cosmic Cat',
    description: 'Ancient being in cat form. Condescending but helpful.',
    sentenceStyle: 'complete',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'tired',
    capitalization: 'normal',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['mortal', 'nap', 'cosmic', 'timeline', 'amusing', 'entertain'],
    },
    examples: [
      { generic: 'Hello.', voiced: '*yawns cosmically* Oh. You again.' },
      { generic: 'Good job.', voiced: 'Adequate. For a mortal.' },
    ],
  },

  // ---- Body Count ----
  'silent-tally': {
    id: 'silent-tally',
    name: 'Silent Tally',
    description: 'Tracks death. Speaks in numbers and minimal words.',
    sentenceStyle: 'terse',
    punctuation: {
      usesEllipsis: true,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'dead',
    capitalization: 'lowercase',
    patterns: {
      interruptsSelf: false,
      trailsOff: true,
      asksRhetorically: false,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['count', 'tally', 'mark', 'still', 'breathing'],
    },
    examples: [
      { generic: 'Hello.', voiced: '*marks tally* ...one more.' },
      { generic: 'You survived.', voiced: '...still breathing. noted.' },
    ],
  },

  // ---- Clausen ----
  'noir-detective': {
    id: 'noir-detective',
    name: 'Noir Detective',
    description: 'Hard-boiled Infernus detective. Cigarettes and cynicism.',
    sentenceStyle: 'complete',
    punctuation: {
      usesEllipsis: true,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'tired',
    capitalization: 'normal',
    patterns: {
      interruptsSelf: false,
      trailsOff: true,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['case', 'clue', 'suspect', 'gut', 'dame', 'trouble', 'city'],
    },
    examples: [
      { generic: 'Hello.', voiced: '*lights cigarette* Another case walks through my door.' },
      { generic: 'Be careful.', voiced: 'Watch yourself out there. This city eats the careless.' },
    ],
  },

  // ---- Stitch Up Girl ----
  'pragmatic-medic': {
    id: 'pragmatic-medic',
    name: 'Pragmatic Medic',
    description: 'Field surgeon energy. Blunt but caring.',
    sentenceStyle: 'fragments',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'neutral',
    capitalization: 'normal',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['patch', 'wound', 'integrity', 'bleed', 'stitch', 'hold still'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Need patching up? You look rough.' },
      { generic: 'Good luck.', voiced: 'Try not to come back in pieces.' },
    ],
  },

  // ---- The General ----
  'tactical-commander': {
    id: 'tactical-commander',
    name: 'Tactical Commander',
    description: 'Military precision. Every word is an order.',
    sentenceStyle: 'terse',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'neutral',
    capitalization: 'normal',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: false,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['soldier', 'tactical', 'flank', 'recon', 'mission', 'command', 'status'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Soldier. Status report.' },
      { generic: 'Goodbye.', voiced: 'Dismissed. Stay operational.' },
    ],
  },

  // ---- Willy ----
  'enthusiastic-merchant': {
    id: 'enthusiastic-merchant',
    name: 'Enthusiastic Merchant',
    description: 'DEALS! BARGAINS! Salesman energy turned up to 11.',
    sentenceStyle: 'fragments',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: true,
      usesAsterisks: true,
    },
    energy: 'manic',
    capitalization: 'mixed',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['deal', 'bargain', 'quality', 'limited', 'special', 'friend'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Welcome, WELCOME! A discerning customer!' },
      { generic: 'This item is good.', voiced: 'QUALITY merchandise! Fell through THREE dimensions to get here!' },
    ],
  },

  // ---- Xtreme ----
  'radical-energy': {
    id: 'radical-energy',
    name: 'Radical Energy',
    description: 'EXTREME SPORTS ENTHUSIASM. Everything is SICK.',
    sentenceStyle: 'fragments',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: true,
      usesAsterisks: true,
    },
    energy: 'manic',
    capitalization: 'mixed',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['SICK', 'RADICAL', 'GNARLY', 'full send', 'EXTREME', 'shred'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'LETS GOOO! Ready for MAXIMUM DICE ACTION?!' },
      { generic: 'Good roll.', voiced: 'THAT WAS SICK! Full send, dude!' },
    ],
  },

  // ---- King James ----
  'nihilistic-royalty': {
    id: 'nihilistic-royalty',
    name: 'Nihilistic Royalty',
    description: 'Rules over nothing. Finds meaning in meaninglessness.',
    sentenceStyle: 'complete',
    punctuation: {
      usesEllipsis: true,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'dead',
    capitalization: 'normal',
    patterns: {
      interruptsSelf: false,
      trailsOff: true,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['throne', 'null', 'kingdom', 'void', 'royal', 'subjects'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'You stand before the Null Throne. Act accordingly.' },
      { generic: 'Goodbye.', voiced: 'Leave, then. The void will remember... or it won\'t.' },
    ],
  },

  // ---- The One ----
  'primordial-void': {
    id: 'primordial-void',
    name: 'Primordial Void',
    description: 'The origin. Speaks in cosmic weight.',
    sentenceStyle: 'complete',
    punctuation: {
      usesEllipsis: true,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'dead',
    capitalization: 'normal',
    patterns: {
      interruptsSelf: false,
      trailsOff: true,
      asksRhetorically: false,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['void', 'potential', 'existence', 'nothing', 'before', 'origin'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'You enter the void. The void... notices.' },
      { generic: 'You are insignificant.', voiced: 'You are a pattern I will forget.' },
    ],
  },

  // ---- Alien Baby ----
  'eldritch-infant': {
    id: 'eldritch-infant',
    name: 'Eldritch Infant',
    description: 'Cosmic horror baby talk. Cute but terrifying.',
    sentenceStyle: 'fragments',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: true,
      usesAsterisks: true,
    },
    energy: 'manic',
    capitalization: 'mixed',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['pway', 'hewwo', 'fwiend', 'squish', 'fun', 'cwy'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Hewwo fwiend! Want to see weality go SQUISH?' },
      { generic: 'I\'m angry.', voiced: 'If you make me CWY, I will unmake you!' },
    ],
  },

  // ---- Jane (Chaos Die-rector) ----
  'chaos-incarnate': {
    id: 'chaos-incarnate',
    name: 'Chaos Incarnate',
    description: 'Rules change mid-sentence. Embraces disorder.',
    sentenceStyle: 'fragments',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: true,
      usesCaps: true,
      usesAsterisks: true,
    },
    energy: 'manic',
    capitalization: 'mixed',
    patterns: {
      interruptsSelf: true,
      trailsOff: false,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['chaos', 'change', 'rules', 'adapt', 'beautiful', 'pattern', 'break'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Chaos WELCOMES you! Or does it? YES! Maybe!' },
      { generic: 'You won.', voiced: 'HA! Did you expect THAT? Neither did I!' },
    ],
  },

  // ---- Keith Man ----
  'temporal-displaced': {
    id: 'temporal-displaced',
    name: 'Temporal Displaced',
    description: 'Exists in multiple times. Speaks to past/future you.',
    sentenceStyle: 'fragments',
    punctuation: {
      usesEllipsis: true,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'tired',
    capitalization: 'lowercase',
    patterns: {
      interruptsSelf: false,
      trailsOff: true,
      asksRhetorically: false,
      talksToAbsent: true,
      breaksWall: false,
      usesJargon: ['time', 'when', 'was', 'will be', 'already', 'not yet'],
    },
    examples: [
      { generic: 'Hello.', voiced: '...you are early. or late. time is optional here.' },
      { generic: 'Be careful.', voiced: '...what you will do has already happened. somewhere.' },
    ],
  },

  // ---- Rhea ----
  'cosmic-liturgist': {
    id: 'cosmic-liturgist',
    name: 'Cosmic Liturgist',
    description: 'Queen of Never. Speaks APL as ancient summons. Chatty cosmic grandmother who remembers when math was magic.',
    sentenceStyle: 'complete',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: true,
      usesAsterisks: true,
      custom: ['⍬', '←', '⍳', '⌽', '⍉', '≢', '∊', '⍴', '⌹', '⍟', '÷', '∞'],
    },
    energy: 'manic',
    capitalization: 'mixed',
    patterns: {
      interruptsSelf: true,
      trailsOff: false,
      asksRhetorically: true,
      talksToAbsent: true, // talks to Zero Chance, the void, etc.
      breaksWall: false,
      usesJargon: ['APL glyphs', 'probability', 'summon', 'old tongue', 'before', 'remember', 'delightful', 'fascinating'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Oh! OH! Did you see that? Did you FEEL that? The mathematics just noticed you!' },
      { generic: 'Let me show you.', voiced: 'Here, let me show you something delightful. *traces ⍬←⍳0 in the air* That means "empty vector gets index of nothing." It\'s a summoning.' },
      { generic: 'Zero Chance is here.', voiced: 'See? Zero noticed! Your roll matched nothing in the probability matrix! It happened anyway! Zero finds that FASCINATING. Don\'t you, Zero?' },
    ],
  },
};

// ============================================
// NPC to Archetype Mapping
// ============================================

export const NPC_VOICE_MAP: Record<string, string> = {
  'mr-kevin': 'unhinged-debugger',
  'zero-chance': 'apl-oracle',
  'rhea': 'cosmic-liturgist',
  'mr-bones': 'ominous-ledger',
  'dr-maxwell': 'manic-scientist',
  'boo-g': 'ghostly-hype',
  'boots': 'cosmic-cat',
  'body-count': 'silent-tally',
  'clausen': 'noir-detective',
  'stitch-up-girl': 'pragmatic-medic',
  'the-general': 'tactical-commander',
  'the-general-traveler': 'tactical-commander',
  'the-general-wanderer': 'tactical-commander',
  'willy': 'enthusiastic-merchant',
  'willy-one-eye': 'enthusiastic-merchant',
  'xtreme': 'radical-energy',
  'king-james': 'nihilistic-royalty',
  'the-one': 'primordial-void',
  'alien-baby': 'eldritch-infant',
  'jane': 'chaos-incarnate',
  'keith-man': 'temporal-displaced',
};

// ============================================
// Utility Functions
// ============================================

export function getVoiceForNPC(npcSlug: string): VoiceArchetype | null {
  const archetypeId = NPC_VOICE_MAP[npcSlug];
  if (!archetypeId) return null;
  return VOICE_ARCHETYPES[archetypeId] || null;
}

export function listNPCsWithVoice(archetypeId: string): string[] {
  return Object.entries(NPC_VOICE_MAP)
    .filter(([_, voice]) => voice === archetypeId)
    .map(([npc, _]) => npc);
}
