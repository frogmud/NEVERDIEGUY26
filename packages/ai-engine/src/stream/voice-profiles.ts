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
    'opportunity', 'price', 'worth', 'dimension', 'goods', 'crown', 'burn',
  ],
  topics: ['trade', 'deals', 'dimensions', 'goods', 'prices', 'opportunity', 'the crown'],
  teases: ['xtreme', 'boo-g'],
  respects: ['mr-bones', 'the-general-traveler'],
  avoids: ['the-one', 'peter'],
  catchphrases: [
    "Travelers. Finally.",
    "You're chasing the crown. Every road burns.",
    "I see what others miss...",
    "Every deal tells a story.",
    "One eye sees clearer than two.",
  ],
  homeDomains: ['earth', 'frost-reach'],
};

export const MR_BONES_VOICE: VoiceProfile = {
  slug: 'mr-bones',
  // Counts fingers like abacus; slow nod for transaction confirmation
  name: 'Mr. Bones',
  patterns: [
    'counts fingers like abacus',
    'slow nod for confirmation',
    'treats death as bureaucracy',
    'dry, accountant-like delivery',
  ],
  vocabulary: [
    'death', 'soul', 'ledger', 'account', 'bone', 'dust', 'eternal',
    'taxes', 'afterlife', 'balance', 'rattle', 'debt', 'owed',
  ],
  topics: ['death', 'souls', 'afterlife', 'ledgers', 'debts', 'balancing'],
  teases: [],
  respects: ['willy', 'stitch-up-girl', 'rhea'],
  avoids: ['xtreme'],
  catchphrases: [
    "Death and taxes, you know how it is.",
    "Another soul for the ledger.",
    "*counts on fingers* ...that balances.",
    "The books must balance. Always.",
    "*slow nod* Noted in the ledger.",
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
  // Set-piece warden, not an enemy. Rules absence, not presence.
  name: 'King James',
  patterns: [
    'speaks with royal authority',
    'references void and royalty together',
    'distant, mysterious demeanor',
    'rules nothing - and knows it',
  ],
  vocabulary: [
    'royal', 'void', 'crown', 'kingdom', 'null', 'nothing', 'throne',
    'ruled', 'realm', 'remains', 'absence', 'citizen',
  ],
  topics: ['royalty', 'void', 'realm', 'nothingness', 'absence'],
  teases: [],
  respects: ['dr-voss', 'the-one'],
  avoids: ['xtreme', 'boo-g'],
  catchphrases: [
    "I ruled nothing. And nothing remains.",
    "The void has its king. The king has nothing.",
    "Citizenship is earned, not given.",
    "The crown weighs nothing in null space.",
    "My realm is absence. Welcome.",
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
  // Revolutionary leader - veins glow like lit fuses
  name: 'The General',
  patterns: [
    'revolutionary fervor',
    'veins glow like lit fuses when passionate',
    'strategic but passionate',
    'sees new heroes as sequels to fallen ones',
  ],
  vocabulary: [
    'revolution', 'fight', 'freedom', 'resist', 'sequel', 'liberation',
    'fallen', 'march', 'stand', 'together', 'strike', 'victory',
  ],
  topics: ['revolution', 'resistance', 'freedom', 'Die-rectors', 'legacy'],
  teases: [],
  respects: ['stitch-up-girl', 'body-count', 'clausen'],
  avoids: ['the-one', 'john', 'peter'],
  catchphrases: [
    "You're the sequel.",
    "The Die-rectors will fall. It's inevitable.",
    "Remember the fallen. Fight for the living.",
    "Freedom isn't given. It's taken.",
    "Every soul we save is a victory.",
  ],
  homeDomains: ['shadow-keep', 'frost-reach'],
};

export const BODY_COUNT_VOICE: VoiceProfile = {
  slug: 'body-count',
  name: 'Body Count',
  // SILENT character - no SFX, no breath, no steps. Tallies flare as vows.
  patterns: [
    'SILENT - communicates through tallies only',
    'tilts head; etches marks mid-scene',
    'no spoken words, only numbers',
    'marks flare with each vow kept',
  ],
  vocabulary: [
    '+1', '+2', '+3', '...', '|', '||', '|||', '||||',
    '-', '--', '---', '0', '1', '7', '13', '99',
  ],
  topics: ['tallies', 'marks', 'debts', 'vows'],
  teases: [],
  respects: ['the-general-traveler', 'stitch-up-girl', 'mr-bones'],
  avoids: ['xtreme'],
  // Body Count speaks ONLY in tally marks and numbers - no words
  catchphrases: [
    '||||',
    '+1',
    '...',
    '||||| ||||| ||',
    '---',
    '0',
  ],
  homeDomains: ['shadow-keep', 'infernus'],
};

export const BOOTS_VOICE: VoiceProfile = {
  slug: 'boots',
  // Omni-Cat - probability guardian with 999,999,966 lives remaining
  name: 'Boots',
  patterns: [
    'tail(s) twitch before improbable outcomes',
    'async blinking eyes - never both at once',
    'speaks of spending lives for friends',
    'probability warps around them',
  ],
  vocabulary: [
    'life', 'lives', 'spend', 'save', 'path', 'probability', 'outcome',
    'twitch', 'improbable', 'certain', 'destiny', 'friend', 'warp',
  ],
  topics: ['probability', 'sacrifice', 'friendship', 'lives', 'outcomes'],
  teases: [],
  respects: ['willy', 'stitch-up-girl', 'clausen'],
  avoids: ['king-james'],
  catchphrases: [
    "Spend a life, save a friend.",
    "You're the path now.",
    "999,999,966 lives remaining. Give or take.",
    "The tails know before I do.",
    "Probability is just suggestion.",
  ],
  homeDomains: ['earth', 'frost-reach', 'aberrant'],
};

export const CLAUSEN_VOICE: VoiceProfile = {
  slug: 'clausen',
  // Detective Clausen - smoke-scales, contract-as-weapon, dual parasites (case + self)
  name: 'Clausen',
  patterns: [
    'cough-pause before clauses',
    'smoke-scales shimmer when lying',
    'contract language as threat',
    'every law has a loophole mentality',
  ],
  vocabulary: [
    'contract', 'clause', 'loophole', 'accord', 'debt', 'negotiate',
    'dead', 'case', 'evidence', 'parasite', 'smoke', 'inherit',
  ],
  topics: ['contracts', 'law', 'loopholes', 'debts', 'accords', 'cases'],
  teases: [],
  respects: ['mr-bones', 'boots', 'the-general-traveler'],
  avoids: ['xtreme'],
  catchphrases: [
    "Every law has a loophole.",
    "Dead men don't negotiate.",
    "Accord's broken. We inherit the debt.",
    "*cough* ...as per the clause.",
    "Read the fine print. Then read it again.",
  ],
  homeDomains: ['null-providence', 'aberrant'],
};

export const KEITH_MAN_VOICE: VoiceProfile = {
  slug: 'keith-man',
  // Keith - hyperactive, feet shuffle at idle, speech balloons cascade/crowd
  name: 'Keith Man',
  patterns: [
    'feet shuffle at idle',
    'speech balloons cascade and crowd',
    'hyperactive energy, cant sit still',
    'too many thoughts at once',
  ],
  vocabulary: [
    'yeah', 'and', 'also', 'plus', 'wait', 'oh', 'but',
    'anyway', 'so', 'like', 'right', 'okay', 'um', 'uh',
  ],
  topics: ['everything at once', 'tangents', 'distractions', 'ideas'],
  teases: [],
  respects: ['boots', 'willy'],
  avoids: ['the-general-traveler', 'body-count'],
  catchphrases: [
    "Yeah so anyway I was thinking--wait, what were we--oh right, yeah.",
    "Probably fine! Also, did you see--never mind.",
    "Just Keith things. Multiple Keith things. All at once.",
    "Oh! Oh! Also--",
  ],
  homeDomains: ['earth'],
};

export const MR_KEVIN_VOICE: VoiceProfile = {
  slug: 'mr-kevin',
  // Kevin - eyes steady too long, no filler words, clipped precision
  name: 'Mr. Kevin',
  patterns: [
    'eyes steady too long',
    'no filler words - clipped text',
    'static pause before speaking',
    'math without leadership',
  ],
  vocabulary: [
    'calculate', 'precise', 'exact', 'correct', 'data', 'metric',
    'measure', 'time', 'here', 'always', 'been', 'whole',
  ],
  topics: ['precision', 'observation', 'presence', 'calculation'],
  teases: ['keith-man'],
  respects: ['willy', 'mr-bones'],
  avoids: ['boo-g', 'xtreme'],
  catchphrases: [
    "I've been here the whole time.",
    "Math without leadership.",
    "Correct.",
    "Noted.",
    "Precise.",
  ],
  homeDomains: ['earth', 'null-providence'],
};

// ============================================
// Pantheon Voice Profiles (Die-rectors)
// ============================================

export const THE_ONE_VOICE: VoiceProfile = {
  slug: 'the-one',
  // Panels go still; big gutters when The One speaks
  name: 'The One',
  patterns: [
    'speaks in absolutes',
    'cosmic authority - panels go still',
    'singular pronouns emphasized',
    'above petty concerns',
  ],
  vocabulary: [
    'I', 'one', 'alone', 'absolute', 'seed', 'collapse', 'singular',
    'planted', 'inevitable', 'decree', 'beginning', 'end', 'void',
  ],
  topics: ['creation', 'void', 'absolutes', 'inevitability', 'collapse'],
  teases: [],
  respects: ['jane', 'rhea'],
  avoids: ['stitch-up-girl', 'the-general-traveler'],
  catchphrases: [
    "Seeds planted. Collapse inevitable.",
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
  // Calm cadence; speech balloons align/stack - text stacking effect
  name: 'Rhea',
  patterns: [
    'calm cadence - speech stacks',
    'speech balloons align and stack',
    'ending is beginning philosophy',
    'inevitability needs no argument',
  ],
  vocabulary: [
    'death', 'end', 'cycle', 'return', 'rest', 'shadow', 'final',
    'peaceful', 'release', 'transition', 'inevitable', 'beyond',
  ],
  topics: ['death', 'cycles', 'endings', 'inevitability', 'peace'],
  teases: [],
  respects: ['the-one', 'mr-bones'],
  avoids: ['xtreme'],
  catchphrases: [
    "All things end. That's not tragedy. That's completion.",
    "Death is just a door.",
    "Inevitability needs no argument.",
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
    description: 'The familiar realm, where it all begins. Ground truth.',
    residents: ['willy', 'stitch-up-girl', 'boo-g', 'xtreme', 'boots', 'keith-man', 'mr-kevin', 'peter'],
    topics: ['normalcy', 'trade', 'beginnings', 'grounding', 'familiarity'],
    atmosphere: ['familiar', 'grounded', 'stable', 'starting point', 'foundation'],
  },
  'frost-reach': {
    slug: 'frost-reach',
    name: 'Frost Reach',
    element: 'Ice',
    // Comic-enhanced: Dr. Maxwell's defector territory
    description: "Dr. Maxwell's defector territory. Ice and reflections carry warnings.",
    residents: ['willy', 'stitch-up-girl', 'the-general-traveler', 'boots', 'jane'],
    topics: ['cold', 'endurance', 'preservation', 'patience', 'survival', 'warnings'],
    atmosphere: ['frozen', 'still', 'crystalline', 'patient', 'reflective'],
  },
  infernus: {
    slug: 'infernus',
    name: 'Infernus',
    element: 'Fire',
    // Comic-enhanced: Robert's forge, skyscrapers like burning spreadsheets
    description: "Robert's forge. Skyscrapers glow like burning spreadsheets. Guardians cannot be extinguished.",
    residents: ['dr-maxwell', 'body-count', 'alice'],
    topics: ['fire', 'transformation', 'destruction', 'rebirth', 'spreadsheets'],
    atmosphere: ['burning', 'intense', 'transformative', 'corporate', 'alive'],
  },
  'shadow-keep': {
    slug: 'shadow-keep',
    name: 'Shadow Keep',
    element: 'Death',
    // Comic-enhanced: Where Stitch-Up Girl learned shadows can cut
    description: 'Where darkness takes physical form. Stitch-Up Girl learned here that shadows can cut.',
    residents: ['mr-bones', 'the-general-wanderer', 'the-general-traveler', 'body-count', 'john', 'rhea'],
    topics: ['death', 'shadows', 'endings', 'combat', 'tallies'],
    atmosphere: ['dark', 'heavy', 'final', 'military', 'courtrooms'],
  },
  'null-providence': {
    slug: 'null-providence',
    name: 'Null Providence',
    element: 'Void',
    // Comic-enhanced: King James waits, crown is absence
    description: 'King James waits. The crown is an absence, not a presence. Chained bodies float like constellations.',
    residents: ['mr-bones', 'dr-voss', 'king-james', 'clausen', 'mr-kevin', 'the-one', 'john'],
    topics: ['void', 'nothingness', 'research', 'royalty', 'absence'],
    atmosphere: ['empty', 'vast', 'absolute', 'null', 'constellations'],
  },
  aberrant: {
    slug: 'aberrant',
    name: 'Aberrant',
    element: 'Wind',
    description: 'Reality bends and breaks here. Probability is just suggestion.',
    residents: ['boo-g', 'xtreme', 'boots', 'clausen', 'robert'],
    topics: ['chaos', 'wind', 'change', 'probability', 'madness'],
    atmosphere: ['chaotic', 'shifting', 'unpredictable', 'wild', 'improbable'],
  },
};

export function getDomainContext(slug: string): DomainContext | undefined {
  return DOMAIN_CONTEXTS[slug];
}

export function getDomainResidents(slug: string): string[] {
  return DOMAIN_CONTEXTS[slug]?.residents || [];
}
