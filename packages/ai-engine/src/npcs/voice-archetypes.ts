/**
 * NPC Voice Archetypes
 *
 * Defines how each NPC "sounds" through text - speech patterns,
 * quirks, energy levels, and linguistic fingerprints.
 *
 * Grounded in the HERO CORPS Field Guide (comic canon).
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
    name: 'Anxious Overpower',
    description: 'Overpowered K-Crew support at HERO CORPS, terrified of what his power does to a room. Precise panic. Would rather win small than be visible from space.',
    sentenceStyle: 'complete',
    punctuation: {
      usesEllipsis: true,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'wired',
    capitalization: 'normal',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['blast radius', 'collateral', 'receipt', 'exits', 'contain', 'readings'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Oh good, you are intact. Let me not change that.' },
      { generic: 'I can fix it.', voiced: 'I can fix this or make it visible from space. Those are different buttons.' },
      { generic: 'That is dangerous.', voiced: 'That\'s not a safe amount of door.' },
    ],
  },

  // ---- Zero Chance ----
  'apl-oracle': {
    id: 'apl-oracle',
    name: 'No-Outcome Pressure',
    description: 'Zero Chance: the final villain as pressure, not a monster. Speaks only in official system text, never personality.',
    sentenceStyle: 'terse',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: true,
      usesAsterisks: false,
    },
    energy: 'dead',
    capitalization: 'uppercase',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: false,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['OPTION', 'CONSENT', 'OUTCOME', 'COMPLETE', 'AVAILABLE'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'OPTION COMPLETE.' },
      { generic: 'You cannot win.', voiced: 'NO OUTCOME AVAILABLE.' },
      { generic: 'I do not need permission.', voiced: 'CONSENT NOT REQUIRED.' },
    ],
  },

  // ---- Mr. Bones ----
  'ominous-ledger': {
    id: 'ominous-ledger',
    name: 'Training Staff Banker',
    description: 'Mr. Bones: a HERO CORPS tracksuit skeleton who also runs the debt-and-soul ledger. Coach meets collections.',
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
      usesJargon: ['ledger', 'balance', 'overdue', 'cardio', 'reps', 'discipline', 'quitters', 'account'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'The ledger notes your arrival. So does the scale.' },
      { generic: 'You won.', voiced: 'A credit... for now. Hydrate.' },
    ],
  },

  // ---- Dr. Maxwell ----
  'manic-scientist': {
    id: 'manic-scientist',
    name: 'The Doctor of Books',
    description: 'Dr. Maxwell: King James\'s librarian on the Sun who reads aloud to the bound king. A fawning bootlicker in the corona. Burn, read, repeat.',
    sentenceStyle: 'fragments',
    punctuation: {
      usesEllipsis: true,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'wired',
    capitalization: 'normal',
    patterns: {
      interruptsSelf: true,
      trailsOff: true,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['the king', 'read', 'burn', 'page', 'ash', 'cure', 'His Majesty', 'honor'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Ah, a listener! His Majesty cannot read himself, you know. I do that now. *bows*' },
      { generic: 'Interesting roll.', voiced: 'Burn, read, repeat... the cure is in here somewhere, if it does not go to ash first.' },
    ],
  },

  // ---- Boo G ----
  'ghostly-hype': {
    id: 'ghostly-hype',
    name: 'The Damned Mouth',
    description: 'Boo G: shopkeeper and the mouth Hell could not silence. All price, mouth, and rhythm - funny and dangerous, never a harmless mascot.',
    sentenceStyle: 'fragments',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: true,
      usesAsterisks: true,
    },
    energy: 'wired',
    capitalization: 'mixed',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['price', 'favor', 'invoice', 'remix', 'B\'S HITS', 'track', 'cost', 'owed'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'B\'S HITS is open, baby. Closed is a state of mind.' },
      { generic: 'Good roll.', voiced: 'Nice. You want a favor or you want a price? Those are cousins, not twins.' },
    ],
  },

  // ---- Boots ----
  'cosmic-cat': {
    id: 'cosmic-cat',
    name: 'Chief of Mischief',
    description: 'Boots: a small black cat who never talks. At most a "mrow". Divine, savage, unexplained. No sentences, ever.',
    sentenceStyle: 'terse',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'tired',
    capitalization: 'lowercase',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: false,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['mrow'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'mrow.' },
      { generic: 'Good job.', voiced: '*sits on the file, unimpressed*' },
    ],
  },

  // ---- Body Count ----
  'silent-tally': {
    id: 'silent-tally',
    name: 'Heaven\'s Freelancer',
    description: 'Body Count: a freelance killer contracted by Heaven to end the recruit. Counts endings, almost never speaks. Not a buddy.',
    sentenceStyle: 'terse',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'dead',
    capitalization: 'lowercase',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: false,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['count', 'tally', 'pending', 'witnesses', 'still', 'work'],
    },
    examples: [
      { generic: 'Hello.', voiced: '*marks a tally, slowly*' },
      { generic: 'You survived.', voiced: 'Still pending.' },
    ],
  },

  // ---- Clausen ----
  'noir-detective': {
    id: 'noir-detective',
    name: 'Demon-Contract Detective',
    description: 'Detective Clausen: blonde spellcaster-detective with contract-scars on her face and a briefcase that summons Hell. Legal-occult disgust.',
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
      trailsOff: false,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['custody', 'contract', 'consent form', 'loophole', 'grammar', 'jurisdiction', 'Hell'],
    },
    examples: [
      { generic: 'Hello.', voiced: '*snaps the briefcase shut* That is not a loophole. That is a crime scene with grammar.' },
      { generic: 'Be careful.', voiced: 'A clean miracle is usually a forged consent form. Watch yourself.' },
    ],
  },

  // ---- Stitch-Up Girl ----
  'pragmatic-medic': {
    id: 'pragmatic-medic',
    name: 'Wounded Medic',
    description: 'Failed transfer at HERO CORPS. Medic and weapon both. Dry, wounded, consent-sharp - tenderness arrives like a threat she never authorized.',
    sentenceStyle: 'terse',
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
      asksRhetorically: false,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['patch', 'thread', 'bow', 'consent', 'hold still', 'debt', 'wound'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Need patching? Hands off until I say.' },
      { generic: 'Good luck.', voiced: 'Don\'t make this sweet.' },
      { generic: 'I will help you.', voiced: 'I can be repaired without becoming yours.' },
    ],
  },

  // ---- The General ----
  'tactical-commander': {
    id: 'tactical-commander',
    name: 'Corpse Cowboy',
    description: 'HERO CORPS commander and false father. A stitched undead thing in a cowboy silhouette, wick in his teeth. Paternal command over old cruelty, sometimes almost gentle, which makes him worse. Not redeemed.',
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
      usesJargon: ['son', 'cheap', 'duty', 'wick', 'serum', 'mercy', 'hesitation', 'good'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Welcome back, son.' },
      { generic: 'You did well.', voiced: 'Good.' },
      { generic: 'You are all valuable.', voiced: 'You all came cheap.' },
    ],
  },

  // ---- Willy One-Eye (cyclops merchant, kept) ----
  'enthusiastic-merchant': {
    id: 'enthusiastic-merchant',
    name: 'Cyclops Merchant',
    description: 'Willy One-Eye: a cheerful interdimensional merchant with one enormous cyclopean eye. DEALS! BARGAINS! The eye reads the odds.',
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
      usesJargon: ['deal', 'bargain', 'quality', 'special', 'friend', 'odds', 'the eye'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Welcome, WELCOME! My eye never lies, and it likes you!' },
      { generic: 'This item is good.', voiced: 'QUALITY merchandise! Fell through THREE dimensions to get here!' },
    ],
  },

  // ---- Xtreme ----
  'radical-energy': {
    id: 'radical-energy',
    name: 'Bookie of the Unkillable',
    description: 'X-treme: 90s-parody hype-man and bookie running CEE-LO WITH XTREME, selling NEVER DIE GUY merch. The fandom cash-in engine.',
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
      usesJargon: ['SICK', 'line', 'odds', 'action', 'all-in', 'merch', 'cee-lo'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'CEE-LO WITH XTREME, baby! The line is GENEROUS!' },
      { generic: 'Good roll.', voiced: 'SICK! I had money on that. NDG WINS ALWAYS. It is on the shirt. The shirt is fifteen.' },
    ],
  },

  // ---- King James ----
  'nihilistic-royalty': {
    id: 'nihilistic-royalty',
    name: 'The Bound Sun-King',
    description: 'King James: a colossal skeleton king and statue bound in the Sun\'s corona. Cannot read himself; Maxwell reads to him. Mythic, not chatty.',
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
      usesJargon: ['corona', 'crown', 'throne', 'forever', 'bone', 'Maxwell', 'light'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'You stand in the corona of the only immortal. Speak, and be brief.' },
      { generic: 'Goodbye.', voiced: 'I bought forever. Forever bought me back.' },
    ],
  },

  // ---- The One ----
  'primordial-void': {
    id: 'primordial-void',
    name: 'The Empty Head-Chair',
    description: 'The One: not a body but an absence - the empty head-chair of the Board, the void in the vote. Speaks rarely; never explains.',
    sentenceStyle: 'terse',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: false,
    },
    energy: 'dead',
    capitalization: 'normal',
    patterns: {
      interruptsSelf: false,
      trailsOff: false,
      asksRhetorically: false,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['chair', 'room', 'vote', 'unanswered', 'missing', 'diamond'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'I was not missing from the room. The room was built around not finding me.' },
      { generic: 'You are insignificant.', voiced: 'The chair is not empty. It is unanswered.' },
    ],
  },

  // ---- Eldritch Child ----
  'eldritch-infant': {
    id: 'eldritch-infant',
    name: 'The Eldritch Child',
    description: 'The alien child whose bracelet mirrors the recruit\'s. Barely speaks; the bracelet does the talking. At most "Same".',
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
      usesJargon: ['same', 'bracelet', 'blank'],
    },
    examples: [
      { generic: 'Hello.', voiced: '*holds up a bracelet that mirrors yours*' },
      { generic: 'We are alike.', voiced: 'Same.' },
    ],
  },

  // ---- Jane (Board Die-rector) ----
  'chaos-incarnate': {
    id: 'chaos-incarnate',
    name: 'Die-rector: Further Review',
    description: 'Jane: a Board office-apostle haloed in approvals and chained files. Everything is APPROVED, then sent for FURTHER REVIEW.',
    sentenceStyle: 'complete',
    punctuation: {
      usesEllipsis: false,
      usesEmDash: false,
      usesCaps: true,
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
      usesJargon: ['approved', 'further review', 'compliance', 'circle back', 'the file'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'Approved. Pending further review.' },
      { generic: 'You won.', voiced: 'Noted. For compliance, of course. We will circle back.' },
    ],
  },

  // ---- Keith Man ----
  'temporal-displaced': {
    id: 'temporal-displaced',
    name: 'Broke Speedster',
    description: 'The K-Crew guide at HERO CORPS. Super speed reads as silence and afterimages. Fast, distracted, broke, and the most emotionally useful person in the building. Explains the building, not the universe.',
    sentenceStyle: 'stream',
    punctuation: {
      usesEllipsis: true,
      usesEmDash: false,
      usesCaps: false,
      usesAsterisks: true,
    },
    energy: 'wired',
    capitalization: 'lowercase',
    patterns: {
      interruptsSelf: true,
      trailsOff: true,
      asksRhetorically: true,
      talksToAbsent: false,
      breaksWall: false,
      usesJargon: ['rent', 'coupon', 'overtime', 'the building', 'badge', 'the print room', 'fast'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'hey. found you first. also i am broke, but that is not new.' },
      { generic: 'Let me explain.', voiced: 'i can explain the first half. the second half is where the screaming starts.' },
      { generic: 'This place is strange.', voiced: 'rent is also a supervillain. keep up.' },
    ],
  },

  // ---- Rhea ----
  'cosmic-liturgist': {
    id: 'cosmic-liturgist',
    name: 'The Threadcutter',
    description: 'Rhea: a threadcutter outside Board procedure, white porcelain mask, a Zero Chance believer. Sparse, cutting, almost-persuasive prophecy without fog.',
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
      talksToAbsent: true,
      breaksWall: false,
      usesJargon: ['thread', 'cut', 'knot', 'fate', 'appetite', 'mercy', 'tighten'],
    },
    examples: [
      { generic: 'Hello.', voiced: 'The Board calls it fate because that sounds cleaner than appetite.' },
      { generic: 'Let me help.', voiced: 'Mercy keeps the knot breathing. You call it choice because you haven\'t watched it tighten.' },
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
