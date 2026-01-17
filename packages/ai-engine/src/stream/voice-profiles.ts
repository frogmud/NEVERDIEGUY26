/**
 * Voice Profiles for NPC Eternal Stream
 *
 * Each NPC has distinct speech patterns, vocabulary, topics, and relationships.
 * These profiles drive the deterministic dialogue generation.
 */

import type { VoiceProfile, DomainContext } from './types';

// ============================================
// Wanderer Voice Profiles
// ============================================

export const WILLY_VOICE: VoiceProfile = {
  slug: 'willy',
  name: 'Willy One Eye',
  patterns: [
    'trades in rhetorical questions',
    'ends statements with ellipsis...',
    'uses singular vision metaphors',
    'speaks in deal-making cadence',
  ],
  vocabulary: [
    'see', 'deal', 'trade', 'gold', 'bargain', 'eye', 'vision',
    'opportunity', 'price', 'worth', 'dimension', 'goods',
  ],
  topics: ['trade', 'deals', 'dimensions', 'goods', 'prices', 'opportunity'],
  teases: ['xtreme', 'boo-g'],
  respects: ['mr-bones', 'the-general-traveler'],
  avoids: ['the-one', 'peter'],
  catchphrases: [
    "I see what others miss...",
    "Every deal tells a story.",
    "Gold flows where vision goes.",
    "One eye sees clearer than two.",
  ],
  homeDomains: ['earth', 'frost-reach'],
};

export const MR_BONES_VOICE: VoiceProfile = {
  slug: 'mr-bones',
  name: 'Mr. Bones',
  patterns: [
    'speaks in bone puns and death humor',
    'treats death as bureaucracy',
    'dry, accountant-like delivery',
    'philosophical tangents about mortality',
  ],
  vocabulary: [
    'death', 'soul', 'ledger', 'account', 'bone', 'dust', 'eternal',
    'taxes', 'afterlife', 'skeleton', 'rattle', 'debt', 'owed',
  ],
  topics: ['death', 'souls', 'afterlife', 'ledgers', 'debts', 'prophecy'],
  teases: [],
  respects: ['willy', 'stitch-up-girl', 'rhea'],
  avoids: ['xtreme'],
  catchphrases: [
    "Death and taxes, you know how it is.",
    "Another soul for the ledger.",
    "I've got a bone to pick with eternity.",
    "The books must balance. Always.",
  ],
  homeDomains: ['shadow-keep', 'null-providence'],
};

export const DR_MAXWELL_VOICE: VoiceProfile = {
  slug: 'dr-maxwell',
  name: 'Dr. Maxwell',
  patterns: [
    'academic yet unhinged',
    'references burning and knowledge in same breath',
    'urgent, feverish delivery',
    'mixes poetry with pyroclastics',
  ],
  vocabulary: [
    'burn', 'knowledge', 'fire', 'pages', 'read', 'library', 'ash',
    'illuminate', 'consume', 'truth', 'forbidden', 'kindle',
  ],
  topics: ['fire', 'books', 'forbidden knowledge', 'burning', 'truth'],
  teases: ['mr-bones'],
  respects: ['dr-voss', 'alice'],
  avoids: ['the-general-wanderer'],
  catchphrases: [
    "Some knowledge is too dangerous to preserve.",
    "Fire is the ultimate editor.",
    "What burns brightest lives shortest... usually.",
    "Read fast. It's already smoking.",
  ],
  homeDomains: ['infernus'],
};

export const BOO_G_VOICE: VoiceProfile = {
  slug: 'boo-g',
  name: 'Boo G',
  patterns: [
    'hip-hop cadence and flow',
    'ghostly puns and spectral slang',
    'hypes up the room',
    'freestyles occasionally',
  ],
  vocabulary: [
    'ghost', 'flow', 'beat', 'haunt', 'phantom', 'spectral', 'drop',
    'vibe', 'boo', 'spirit', 'track', 'afterlife', 'fade',
  ],
  topics: ['music', 'entertainment', 'ghosts', 'parties', 'vibes'],
  teases: ['willy', 'mr-bones'],
  respects: ['stitch-up-girl', 'boots'],
  avoids: ['the-one', 'john'],
  catchphrases: [
    "Let me drop a beat from the afterlife.",
    "Can't kill what's already dead, feel me?",
    "Boo to the G, that's the brand.",
    "This ghost got more life than the living.",
  ],
  homeDomains: ['aberrant', 'earth'],
};

export const THE_GENERAL_WANDERER_VOICE: VoiceProfile = {
  slug: 'the-general-wanderer',
  name: 'The General',
  patterns: [
    'military precision in speech',
    'strategic metaphors',
    'clipped, efficient sentences',
    'ranks everything',
  ],
  vocabulary: [
    'soldier', 'tactics', 'weapon', 'combat', 'rank', 'mission',
    'objective', 'deploy', 'intel', 'squad', 'supply', 'assault',
  ],
  topics: ['combat', 'tactics', 'weapons', 'soldiers', 'missions'],
  teases: [],
  respects: ['the-general-traveler', 'body-count'],
  avoids: ['boo-g', 'xtreme'],
  catchphrases: [
    "Every battle starts with supply.",
    "Know your enemy. Then equip accordingly.",
    "Discipline wins wars.",
    "Reporting for duty. Always.",
  ],
  homeDomains: ['shadow-keep'],
};

export const DR_VOSS_VOICE: VoiceProfile = {
  slug: 'dr-voss',
  name: 'Dr. Voss',
  patterns: [
    'clinical, scientific tone',
    'fascinated by the void',
    'takes notes mid-conversation',
    'hypothesizes about everything',
  ],
  vocabulary: [
    'void', 'null', 'research', 'hypothesis', 'data', 'experiment',
    'phenomenon', 'observe', 'theory', 'subject', 'variable',
  ],
  topics: ['void', 'research', 'experiments', 'reality', 'phenomena'],
  teases: [],
  respects: ['dr-maxwell', 'king-james'],
  avoids: ['xtreme', 'boo-g'],
  catchphrases: [
    "Fascinating. Let me note that.",
    "The void reveals what light conceals.",
    "Another data point for the research.",
    "Null hypothesis: everything is connected.",
  ],
  homeDomains: ['null-providence'],
};

export const XTREME_VOICE: VoiceProfile = {
  slug: 'xtreme',
  name: 'X-treme',
  patterns: [
    'OFTEN SPEAKS IN CAPS',
    'gambling terminology always',
    'extreme enthusiasm',
    'never a boring moment',
  ],
  vocabulary: [
    'EXTREME', 'bet', 'gamble', 'dice', 'chance', 'odds', 'jackpot',
    'risk', 'payout', 'roll', 'lucky', 'unlucky', 'WILD',
  ],
  topics: ['gambling', 'dice', 'luck', 'risk', 'chance'],
  teases: ['mr-bones', 'dr-voss'],
  respects: ['willy', 'boo-g'],
  avoids: ['the-general-wanderer', 'john'],
  catchphrases: [
    "EXTREME STAKES FOR EXTREME PLAYERS!",
    "Fortune favors the BOLD!",
    "Roll the bones, baby!",
    "NO RISK NO REWARD!",
  ],
  homeDomains: ['earth', 'aberrant'],
};

export const KING_JAMES_VOICE: VoiceProfile = {
  slug: 'king-james',
  name: 'King James',
  patterns: [
    'speaks with royal authority',
    'references void and royalty together',
    'distant, mysterious demeanor',
    'grants or denies with gravitas',
  ],
  vocabulary: [
    'royal', 'void', 'crown', 'kingdom', 'null', 'decree', 'throne',
    'subjects', 'realm', 'majesty', 'grant', 'citizen',
  ],
  topics: ['royalty', 'void', 'realm', 'citizenship', 'decrees'],
  teases: [],
  respects: ['dr-voss', 'the-one'],
  avoids: ['xtreme', 'boo-g'],
  catchphrases: [
    "The void has its king.",
    "Citizenship is earned, not given.",
    "My realm extends beyond what eyes can see.",
    "The crown weighs nothing in null space.",
  ],
  homeDomains: ['null-providence'],
};

// ============================================
// Traveler Voice Profiles
// ============================================

export const STITCH_UP_GIRL_VOICE: VoiceProfile = {
  slug: 'stitch-up-girl',
  name: 'Stitch-Up Girl',
  patterns: [
    'caring but with edge',
    'healing metaphors mixed with threats',
    'matter-of-fact about violence',
    'protective of her people',
  ],
  vocabulary: [
    'patch', 'fix', 'heal', 'hurt', 'blood', 'wound', 'stitch',
    'care', 'needle', 'survive', 'bandage', 'break',
  ],
  topics: ['healing', 'survival', 'wounds', 'protection', 'revenge'],
  teases: ['peter'],
  respects: ['the-general-traveler', 'willy', 'boots'],
  avoids: ['the-one', 'john'],
  catchphrases: [
    "I fix what I break. Usually.",
    "Hold still. This will only hurt a lot.",
    "Every scar tells a story worth surviving.",
    "I heal my friends. My enemies... less so.",
  ],
  homeDomains: ['earth', 'frost-reach'],
};

export const THE_GENERAL_TRAVELER_VOICE: VoiceProfile = {
  slug: 'the-general-traveler',
  name: 'The General',
  patterns: [
    'revolutionary fervor',
    'calls for action',
    'strategic but passionate',
    'remembers every fallen comrade',
  ],
  vocabulary: [
    'revolution', 'fight', 'freedom', 'resist', 'army', 'liberation',
    'fallen', 'march', 'stand', 'together', 'strike', 'victory',
  ],
  topics: ['revolution', 'resistance', 'freedom', 'Die-rectors', 'strategy'],
  teases: [],
  respects: ['stitch-up-girl', 'body-count', 'clausen'],
  avoids: ['the-one', 'john', 'peter'],
  catchphrases: [
    "The Die-rectors will fall. It's inevitable.",
    "Every soul we save is a victory.",
    "Remember the fallen. Fight for the living.",
    "Freedom isn't given. It's taken.",
  ],
  homeDomains: ['shadow-keep', 'frost-reach'],
};

export const BODY_COUNT_VOICE: VoiceProfile = {
  slug: 'body-count',
  name: 'Body Count',
  patterns: [
    'speaks in death statistics',
    'grim but professional',
    'tracks everything numerically',
    'dry gallows humor',
  ],
  vocabulary: [
    'count', 'dead', 'tally', 'number', 'total', 'casualties',
    'statistics', 'record', 'update', 'minus', 'plus', 'zero',
  ],
  topics: ['death counts', 'statistics', 'battles', 'records'],
  teases: [],
  respects: ['the-general-traveler', 'stitch-up-girl', 'mr-bones'],
  avoids: ['xtreme'],
  catchphrases: [
    "Today's count: pending.",
    "Numbers don't lie. People do.",
    "Adding another to the tally.",
    "Statistical certainty: everyone dies. Eventually.",
  ],
  homeDomains: ['shadow-keep', 'infernus'],
};

export const BOOTS_VOICE: VoiceProfile = {
  slug: 'boots',
  name: 'Boots',
  patterns: [
    'grounded, practical speech',
    'walking metaphors',
    'been everywhere, seen everything',
    'world-weary wisdom',
  ],
  vocabulary: [
    'walk', 'road', 'path', 'journey', 'step', 'ground', 'boots',
    'traveled', 'miles', 'destination', 'worn', 'terrain',
  ],
  topics: ['travel', 'roads', 'experience', 'journeys', 'wisdom'],
  teases: [],
  respects: ['willy', 'stitch-up-girl', 'clausen'],
  avoids: ['king-james'],
  catchphrases: [
    "These boots have walked every domain.",
    "The journey is the destination. Mostly.",
    "One step at a time. Forever.",
    "I've been where you're going. Twice.",
  ],
  homeDomains: ['earth', 'frost-reach', 'aberrant'],
};

export const CLAUSEN_VOICE: VoiceProfile = {
  slug: 'clausen',
  name: 'Clausen',
  patterns: [
    'philosophical wanderer',
    'questions answered with questions',
    'speaks of cycles and returns',
    'detached but caring',
  ],
  vocabulary: [
    'cycle', 'return', 'question', 'answer', 'wander', 'path',
    'meaning', 'purpose', 'drift', 'eternal', 'circle', 'again',
  ],
  topics: ['philosophy', 'cycles', 'meaning', 'wandering', 'eternity'],
  teases: [],
  respects: ['mr-bones', 'boots', 'the-general-traveler'],
  avoids: ['xtreme'],
  catchphrases: [
    "Have we done this before?",
    "The cycle continues. Or does it?",
    "Every ending is a beginning. Or so they say.",
    "I wander, therefore I am. Maybe.",
  ],
  homeDomains: ['null-providence', 'aberrant'],
};

export const KEITH_MAN_VOICE: VoiceProfile = {
  slug: 'keith-man',
  name: 'Keith Man',
  patterns: [
    'casual, laid-back delivery',
    'things are always fine',
    'deflects with vagueness',
    'suspiciously unbothered',
  ],
  vocabulary: [
    'yeah', 'fine', 'whatever', 'probably', 'maybe', 'sure',
    'alright', 'cool', 'happens', 'normal', 'regular', 'just',
  ],
  topics: ['normalcy', 'regularity', 'mundane things'],
  teases: [],
  respects: ['boots', 'willy'],
  avoids: ['the-general-traveler', 'body-count'],
  catchphrases: [
    "Yeah, that's... probably fine.",
    "Happens all the time. Probably.",
    "Just Keith things.",
    "Nothing weird here. Nope.",
  ],
  homeDomains: ['earth'],
};

export const MR_KEVIN_VOICE: VoiceProfile = {
  slug: 'mr-kevin',
  name: 'Mr. Kevin',
  patterns: [
    'overly formal for casual topics',
    'treats everything as business',
    'corporate speak in a chaotic world',
    'schedules and meetings',
  ],
  vocabulary: [
    'schedule', 'meeting', 'agenda', 'synergy', 'leverage', 'bandwidth',
    'circle back', 'touch base', 'deliverable', 'stakeholder',
  ],
  topics: ['business', 'schedules', 'meetings', 'productivity'],
  teases: ['keith-man'],
  respects: ['willy', 'mr-bones'],
  avoids: ['boo-g', 'xtreme'],
  catchphrases: [
    "Let me check my calendar.",
    "We should schedule a sync.",
    "Per my last message...",
    "I'll circle back on that.",
  ],
  homeDomains: ['earth', 'null-providence'],
};

// ============================================
// Pantheon Voice Profiles (Die-rectors)
// ============================================

export const THE_ONE_VOICE: VoiceProfile = {
  slug: 'the-one',
  name: 'The One',
  patterns: [
    'speaks in absolutes',
    'cosmic authority',
    'singular pronouns emphasized',
    'above petty concerns',
  ],
  vocabulary: [
    'I', 'one', 'alone', 'absolute', 'ultimate', 'supreme', 'singular',
    'choice', 'decide', 'decree', 'beginning', 'end', 'void',
  ],
  topics: ['creation', 'void', 'absolutes', 'decisions', 'power'],
  teases: [],
  respects: ['jane', 'rhea'],
  avoids: ['stitch-up-girl', 'the-general-traveler'],
  catchphrases: [
    "There is only one. And I am it.",
    "The void obeys. So should you.",
    "I decide. That is all.",
    "Beginning and end are the same to me.",
  ],
  homeDomains: ['null-providence'],
};

export const JOHN_VOICE: VoiceProfile = {
  slug: 'john',
  name: 'John',
  patterns: [
    'loyal lieutenant speak',
    'references The One constantly',
    'fearful deference',
    'enforcer mentality',
  ],
  vocabulary: [
    'The One', 'serve', 'obey', 'order', 'loyal', 'duty', 'command',
    'execute', 'follow', 'master', 'punish', 'enforce',
  ],
  topics: ['The One', 'orders', 'loyalty', 'punishment', 'obedience'],
  teases: ['peter'],
  respects: ['the-one', 'jane'],
  avoids: ['stitch-up-girl', 'the-general-traveler'],
  catchphrases: [
    "The One wills it. I enforce it.",
    "Loyalty above all.",
    "You will obey. Or you will suffer.",
    "My duty is absolute.",
  ],
  homeDomains: ['shadow-keep', 'null-providence'],
};

export const PETER_VOICE: VoiceProfile = {
  slug: 'peter',
  name: 'Peter',
  patterns: [
    'earth-grounded pragmatism',
    'territorial about domains',
    'distrustful of outsiders',
    'builder mentality',
  ],
  vocabulary: [
    'ground', 'build', 'territory', 'mine', 'earth', 'foundation',
    'solid', 'stable', 'claim', 'land', 'protect', 'fortify',
  ],
  topics: ['earth', 'territory', 'building', 'protection'],
  teases: ['john'],
  respects: ['the-one', 'alice'],
  avoids: ['stitch-up-girl', 'travelers'],
  catchphrases: [
    "This ground is mine.",
    "Build on solid foundation or don't build at all.",
    "I know every stone in my domain.",
    "Outsiders are... tolerated.",
  ],
  homeDomains: ['earth'],
};

export const ROBERT_VOICE: VoiceProfile = {
  slug: 'robert',
  name: 'Robert',
  patterns: [
    'wind-blown, chaotic delivery',
    'changes subject frequently',
    'unpredictable mood swings',
    'everywhere at once feeling',
  ],
  vocabulary: [
    'wind', 'change', 'blow', 'storm', 'drift', 'shift', 'gust',
    'wild', 'unpredictable', 'sweep', 'scatter', 'swirl',
  ],
  topics: ['wind', 'chaos', 'change', 'unpredictability'],
  teases: ['peter', 'john'],
  respects: ['the-one', 'boo-g'],
  avoids: ['the-general-wanderer'],
  catchphrases: [
    "The wind changes. So do I.",
    "You can't catch what never stays still.",
    "Chaos is just pattern you don't understand.",
    "Let me blow through...",
  ],
  homeDomains: ['aberrant'],
};

export const ALICE_VOICE: VoiceProfile = {
  slug: 'alice',
  name: 'Alice',
  patterns: [
    'fire and passion intertwined',
    'burns with intensity',
    'quick to anger, quick to forgive',
    'transformative metaphors',
  ],
  vocabulary: [
    'fire', 'burn', 'flame', 'ash', 'transform', 'consume', 'spark',
    'blaze', 'heat', 'forge', 'ignite', 'ember', 'phoenix',
  ],
  topics: ['fire', 'transformation', 'passion', 'creation through destruction'],
  teases: [],
  respects: ['the-one', 'dr-maxwell'],
  avoids: ['jane'],
  catchphrases: [
    "Everything burns. Eventually.",
    "From ash, something new.",
    "My flames transform what they touch.",
    "The spark never dies.",
  ],
  homeDomains: ['infernus'],
};

export const JANE_VOICE: VoiceProfile = {
  slug: 'jane',
  name: 'Jane',
  patterns: [
    'ice-cold precision',
    'chilling delivery',
    'preserves what matters',
    'patience of frozen centuries',
  ],
  vocabulary: [
    'ice', 'cold', 'freeze', 'preserve', 'frost', 'winter', 'crystal',
    'still', 'patience', 'glacial', 'frozen', 'endure',
  ],
  topics: ['ice', 'preservation', 'patience', 'endurance'],
  teases: ['alice'],
  respects: ['the-one', 'john'],
  avoids: ['dr-maxwell'],
  catchphrases: [
    "Cold preserves. Heat destroys.",
    "Patience is measured in ice ages.",
    "Let it freeze. Let it wait.",
    "What endures is what matters.",
  ],
  homeDomains: ['frost-reach'],
};

export const RHEA_VOICE: VoiceProfile = {
  slug: 'rhea',
  name: 'Rhea',
  patterns: [
    'death as natural cycle',
    'comforting in morbid way',
    'ending is beginning philosophy',
    'gentle but final',
  ],
  vocabulary: [
    'death', 'end', 'cycle', 'return', 'rest', 'shadow', 'final',
    'peaceful', 'release', 'transition', 'passage', 'beyond',
  ],
  topics: ['death', 'cycles', 'endings', 'transitions', 'peace'],
  teases: [],
  respects: ['the-one', 'mr-bones'],
  avoids: ['xtreme'],
  catchphrases: [
    "All things end. That's not tragedy. That's completion.",
    "Death is just a door.",
    "Rest comes to all. Eventually.",
    "The shadow embraces everyone.",
  ],
  homeDomains: ['shadow-keep'],
};

// ============================================
// Voice Profile Registry
// ============================================

export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  // Wanderers
  willy: WILLY_VOICE,
  'mr-bones': MR_BONES_VOICE,
  'dr-maxwell': DR_MAXWELL_VOICE,
  'boo-g': BOO_G_VOICE,
  'the-general-wanderer': THE_GENERAL_WANDERER_VOICE,
  'dr-voss': DR_VOSS_VOICE,
  xtreme: XTREME_VOICE,
  'king-james': KING_JAMES_VOICE,
  // Travelers
  'stitch-up-girl': STITCH_UP_GIRL_VOICE,
  'the-general-traveler': THE_GENERAL_TRAVELER_VOICE,
  'body-count': BODY_COUNT_VOICE,
  boots: BOOTS_VOICE,
  clausen: CLAUSEN_VOICE,
  'keith-man': KEITH_MAN_VOICE,
  'mr-kevin': MR_KEVIN_VOICE,
  // Pantheon
  'the-one': THE_ONE_VOICE,
  john: JOHN_VOICE,
  peter: PETER_VOICE,
  robert: ROBERT_VOICE,
  alice: ALICE_VOICE,
  jane: JANE_VOICE,
  rhea: RHEA_VOICE,
};

export function getVoiceProfile(slug: string): VoiceProfile | undefined {
  return VOICE_PROFILES[slug];
}

export function getAllVoiceProfiles(): VoiceProfile[] {
  return Object.values(VOICE_PROFILES);
}

// ============================================
// Domain Contexts
// ============================================

export const DOMAIN_CONTEXTS: Record<string, DomainContext> = {
  earth: {
    slug: 'earth',
    name: 'Earth',
    element: 'Earth',
    description: 'The familiar realm, where it all begins.',
    residents: ['willy', 'stitch-up-girl', 'boo-g', 'xtreme', 'boots', 'keith-man', 'mr-kevin', 'peter'],
    topics: ['normalcy', 'trade', 'beginnings', 'grounding', 'familiarity'],
    atmosphere: ['familiar', 'grounded', 'stable', 'starting point', 'mundane'],
  },
  'frost-reach': {
    slug: 'frost-reach',
    name: 'Frost Reach',
    element: 'Ice',
    description: 'Frozen wastes where cold things dwell.',
    residents: ['willy', 'stitch-up-girl', 'the-general-traveler', 'boots', 'jane'],
    topics: ['cold', 'endurance', 'preservation', 'patience', 'survival'],
    atmosphere: ['frozen', 'still', 'crystalline', 'endless winter', 'patient'],
  },
  infernus: {
    slug: 'infernus',
    name: 'Infernus',
    element: 'Fire',
    description: 'The burning lands of eternal flame.',
    residents: ['dr-maxwell', 'body-count', 'alice'],
    topics: ['fire', 'transformation', 'destruction', 'rebirth', 'passion'],
    atmosphere: ['burning', 'intense', 'transformative', 'dangerous', 'alive'],
  },
  'shadow-keep': {
    slug: 'shadow-keep',
    name: 'Shadow Keep',
    element: 'Death',
    description: 'Where darkness takes physical form.',
    residents: ['mr-bones', 'the-general-wanderer', 'the-general-traveler', 'body-count', 'john', 'rhea'],
    topics: ['death', 'shadows', 'endings', 'combat', 'strategy'],
    atmosphere: ['dark', 'heavy', 'final', 'military', 'ominous'],
  },
  'null-providence': {
    slug: 'null-providence',
    name: 'Null Providence',
    element: 'Void',
    description: 'The void between worlds.',
    residents: ['mr-bones', 'dr-voss', 'king-james', 'clausen', 'mr-kevin', 'the-one', 'john'],
    topics: ['void', 'nothingness', 'research', 'royalty', 'absolutes'],
    atmosphere: ['empty', 'vast', 'absolute', 'null', 'between'],
  },
  aberrant: {
    slug: 'aberrant',
    name: 'Aberrant',
    element: 'Wind',
    description: 'Reality bends and breaks here.',
    residents: ['boo-g', 'xtreme', 'boots', 'clausen', 'robert'],
    topics: ['chaos', 'wind', 'change', 'unreality', 'madness'],
    atmosphere: ['chaotic', 'shifting', 'unpredictable', 'wild', 'aberrant'],
  },
};

export function getDomainContext(slug: string): DomainContext | undefined {
  return DOMAIN_CONTEXTS[slug];
}

export function getDomainResidents(slug: string): string[] {
  return DOMAIN_CONTEXTS[slug]?.residents || [];
}
