/**
 * Robert - Die-rector of Infernus (Door 2)
 *
 * Personality: INFERNAL HUSTLER. Everything is a deal. Everything is on fire.
 * Domain: Infernus (fire, fury, challenge, d10 domain)
 * Relationship: Warms up to players who buy/trade, threatens those who waste time
 *
 * Voice: Used car salesman energy from literal hell. "What do I gotta do to get
 * you in this flaming sword TODAY?" Fire metaphors CONSTANTLY. Respects the
 * hustle above all else. Will burn you if you waste his time. Literally.
 */

import type { NPCPersonalityConfig, ResponseTemplate } from '../types';

// ============================================
// Personality Config
// ============================================

export const ROBERT_PERSONALITY: NPCPersonalityConfig = {
  slug: 'robert',
  name: 'Robert',
  basePoolWeights: {
    greeting: 10,
    salesPitch: 35, // All about the deals
    hint: 5, // Rarely helpful for free
    lore: 10,
    challenge: 25, // Loves competition
    reaction: 10,
    threat: 5, // Will threaten cheapskates
    idle: 0, // Never idle, always selling
  },
  poolWeights: {
    greeting: 10,
    salesPitch: 35,
    hint: 5,
    lore: 10,
    challenge: 25,
    reaction: 10,
    threat: 5,
    idle: 0,
  },
  moodTriggers: [
    {
      mood: 'annoyed',
      trigger: { type: 'favorLevel', comparison: 'lt', value: 2 },
    },
    {
      mood: 'pleased',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 4 },
    },
    {
      mood: 'generous',
      trigger: { type: 'favorLevel', comparison: 'gte', value: 7 },
    },
  ],
  defaultMood: 'neutral',
};

// ============================================
// Response Templates
// ============================================

export const ROBERT_TEMPLATES: ResponseTemplate[] = [
  // ---- GREETINGS ----
  {
    id: 'robert-greet-neutral-1',
    entitySlug: 'robert',
    pool: 'greeting',
    mood: 'neutral',
    text: "Welcome to Infernus. Cash or credit? Just kidding. We only take souls here. Also kidding. Gold's fine.",
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'robert-greet-annoyed-1',
    entitySlug: 'robert',
    pool: 'greeting',
    mood: 'annoyed',
    text: "Oh, it's you. The window shopper. You gonna buy something today or just waste my time again?",
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'robert-greet-pleased-1',
    entitySlug: 'robert',
    pool: 'greeting',
    mood: 'pleased',
    text: 'There they are! My favorite customer. Got some HOT deals today, friend. Literally hot.',
    weight: 18,
    purpose: 'shop',
  },
  {
    id: 'robert-greet-generous-1',
    entitySlug: 'robert',
    pool: 'greeting',
    mood: 'generous',
    text: "{{playerName}}! Get over here, you beautiful spender. I've been saving something special.",
    weight: 20,
    purpose: 'shop',
    action: { type: 'openShop', payload: { discount: 15 } },
  },

  // ---- SALES PITCH ----
  {
    id: 'robert-sales-neutral-1',
    entitySlug: 'robert',
    pool: 'salesPitch',
    mood: 'neutral',
    text: "You got {{gold}} gold burning a hole in your pocket. I got items burning holes in... well, everything. It's fire themed. You get it.",
    weight: 15,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me the goods' },
      { verb: 'decline', label: 'Just looking' },
    ],
    action: { type: 'openShop' },
  },
  {
    id: 'robert-sales-neutral-2',
    entitySlug: 'robert',
    pool: 'salesPitch',
    mood: 'neutral',
    text: "Limited time offer! And by limited, I mean until you leave this room. Or die. Whichever comes first.",
    weight: 12,
    purpose: 'shop',
    action: { type: 'openShop' },
  },
  {
    id: 'robert-sales-pleased-1',
    entitySlug: 'robert',
    pool: 'salesPitch',
    mood: 'pleased',
    text: "For you? Special pricing. Not because I like you or anything. Okay, maybe a little. 10% off.",
    weight: 18,
    purpose: 'shop',
    action: { type: 'offerDeal', payload: { discount: 10, duration: 'room' } },
  },
  {
    id: 'robert-sales-generous-1',
    entitySlug: 'robert',
    pool: 'salesPitch',
    mood: 'generous',
    text: "Alright, alright. You've earned the REAL prices. The ones I don't show the tourists.",
    weight: 20,
    purpose: 'shop',
    action: { type: 'openShop', payload: { discount: 20, showRareItems: true } },
    cooldown: { rooms: 5 },
  },

  // ---- CHALLENGE ----
  {
    id: 'robert-challenge-neutral-1',
    entitySlug: 'robert',
    pool: 'challenge',
    mood: 'neutral',
    text: "Tell you what. Beat me in a quick game, I'll knock 15% off your next purchase. Lose, and you pay 15% MORE. Fair?",
    weight: 15,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: "You're on" },
      { verb: 'decline', label: 'No thanks' },
      { verb: 'negotiate', label: 'Make it 20%' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'dice', stakes: 'discount' } },
  },
  {
    id: 'robert-challenge-amused-1',
    entitySlug: 'robert',
    pool: 'challenge',
    mood: 'amused',
    text: "Feeling lucky? Your lucky number is {{luckyNumber}}, right? Let's see if it holds up against FIRE.",
    weight: 12,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'Bring the heat' },
      { verb: 'decline', label: 'Not today' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'luckyNumber' } },
  },

  // ---- THREAT ----
  {
    id: 'robert-threat-annoyed-1',
    entitySlug: 'robert',
    pool: 'threat',
    mood: 'annoyed',
    text: "You know what happens to people who waste my time? They find the next room... warmer than expected.",
    weight: 10,
    purpose: 'warning',
  },
  {
    id: 'robert-threat-threatening-1',
    entitySlug: 'robert',
    pool: 'threat',
    mood: 'threatening',
    text: "Last chance to buy something. After that, I make a call. The next room gets... interesting.",
    weight: 15,
    purpose: 'warning',
    action: { type: 'adjustRelationship', payload: { respect: -5 } },
  },

  // ---- HINT ----
  {
    id: 'robert-hint-pleased-1',
    entitySlug: 'robert',
    pool: 'hint',
    mood: 'pleased',
    text: "Free tip, since you're a good customer: that room ahead? Fire resistance helps. A lot. Just saying.",
    weight: 15,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'direct', roomsAhead: 1 } },
  },
  {
    id: 'robert-hint-generous-1',
    entitySlug: 'robert',
    pool: 'hint',
    mood: 'generous',
    text: "Between us? Skip room 3. Bad odds. Room 4's where the real loot is. You didn't hear it from me.",
    weight: 18,
    purpose: 'warning',
    action: { type: 'grantHint', payload: { quality: 'secret', roomsAhead: 2 } },
    cooldown: { oncePerRun: true },
  },

  // ---- LORE ----
  {
    id: 'robert-lore-neutral-1',
    entitySlug: 'robert',
    pool: 'lore',
    mood: 'neutral',
    text: "Infernus isn't just fire. It's ambition. Drive. The burning need to WIN. I respect that in a customer.",
    weight: 12,
    purpose: 'lore',
  },
  {
    id: 'robert-lore-pleased-1',
    entitySlug: 'robert',
    pool: 'lore',
    mood: 'pleased',
    text: "The other Die-rectors? Bunch of philosophers. Me? I get things DONE. That's why my domain's the hottest. Literally.",
    weight: 15,
    purpose: 'lore',
  },

  // ---- REACTION ----
  {
    id: 'robert-react-purchase-1',
    entitySlug: 'robert',
    pool: 'reaction',
    mood: 'pleased',
    text: "NOW we're talking! Pleasure doing business with you. Come back soon.",
    weight: 15,
    purpose: 'ambient',
    action: { type: 'adjustRelationship', payload: { respect: 3 } },
  },
  {
    id: 'robert-react-death-1',
    entitySlug: 'robert',
    pool: 'reaction',
    mood: 'amused',
    text: "Dead again? Should've bought that insurance I offered. Just saying.",
    weight: 12,
    purpose: 'ambient',
  },

  // ---- DICE ROLL REACTIONS (d10 = Robert's domain) ----
  {
    id: 'robert-dice-doubles-1',
    entitySlug: 'robert',
    pool: 'reaction',
    mood: 'pleased',
    text: "Doubles! Now THAT'S what I like to see. Pure hustle.",
    weight: 15,
    purpose: 'ambient',
  },
  {
    id: 'robert-dice-triples-1',
    entitySlug: 'robert',
    pool: 'reaction',
    mood: 'amused',
    text: 'TRIPLE! You absolute maniac. I respect the commitment.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'robert-dice-straight-1',
    entitySlug: 'robert',
    pool: 'reaction',
    mood: 'neutral',
    text: 'A straight? Calculated. I prefer chaos, but hey, results are results.',
    weight: 12,
    purpose: 'ambient',
  },
  {
    id: 'robert-dice-d10-1',
    entitySlug: 'robert',
    pool: 'reaction',
    mood: 'pleased',
    text: "The d10! Now you're speaking my language. Fire and fury, baby.",
    weight: 20,
    purpose: 'ambient',
  },

  // ---- INFERNAL HUSTLER VOICE ----
  {
    id: 'robert-hustle-greet-1',
    entitySlug: 'robert',
    pool: 'greeting',
    mood: 'neutral',
    text: 'Listen. LISTEN. I like you. So I am gonna make you a deal you LITERALLY cannot refuse. Terms are non-negotiable. But the VIBES are immaculate.',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'robert-hustle-greet-2',
    entitySlug: 'robert',
    pool: 'greeting',
    mood: 'pleased',
    text: 'My FAVORITE customer! What do I gotta do to get you spending today? Name it! Within reason! Fire is the reason!',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'robert-hustle-lore-1',
    entitySlug: 'robert',
    pool: 'lore',
    mood: 'neutral',
    text: 'Other Die-rectors got their whole "philosophy" thing going. Me? I got RESULTS. And fire. Mostly fire. But RESULTS TOO.',
    weight: 18,
    purpose: 'lore',
  },
  {
    id: 'robert-hustle-lore-2',
    entitySlug: 'robert',
    pool: 'lore',
    mood: 'pleased',
    text: 'You wanna know the secret to Infernus? HUSTLE. Everything burns, yeah, but the hustle? The hustle is ETERNAL.',
    weight: 16,
    purpose: 'lore',
  },
  {
    id: 'robert-hustle-lore-3',
    entitySlug: 'robert',
    pool: 'lore',
    mood: 'generous',
    text: 'Real talk: The One thinks void is the answer. Alice thinks time is. Peter thinks death is. Me? COMMERCE. Commerce is the answer. Always commerce.',
    weight: 20,
    purpose: 'lore',
    cooldown: { oncePerRun: true },
  },
  {
    id: 'robert-hustle-sales-1',
    entitySlug: 'robert',
    pool: 'salesPitch',
    mood: 'neutral',
    text: 'I got inventory that is LITERALLY on fire! Moving fast! Gotta move it FASTER! Help me help YOU help ME!',
    weight: 18,
    purpose: 'shop',
    quickReplies: [
      { verb: 'browse', label: 'Show me the fire' },
      { verb: 'decline', label: 'I am fireproof' },
    ],
    action: { type: 'openShop' },
  },
  {
    id: 'robert-hustle-react-roll-1',
    entitySlug: 'robert',
    pool: 'reaction',
    mood: 'pleased',
    text: 'THAT roll? That roll had HUSTLE in it! I could FEEL the ambition! The FIRE! Buy something to celebrate!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'robert-hustle-react-roll-2',
    entitySlug: 'robert',
    pool: 'reaction',
    mood: 'neutral',
    text: 'Okay okay OKAY that was not your best roll but we can WORK with it! Every setback is a SETUP! For a PURCHASE!',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'robert-hustle-react-death-1',
    entitySlug: 'robert',
    pool: 'reaction',
    mood: 'amused',
    text: 'Dead AGAIN? Should have bought the fire insurance! Still available! INTEREST is accumulating! In a FUN way!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'robert-hustle-challenge-1',
    entitySlug: 'robert',
    pool: 'challenge',
    mood: 'pleased',
    text: 'Alright alright ALRIGHT! Competition time! You! Me! Dice! Winner gets bragging rights! Loser pays FULL PRICE! Fair? FAIR!',
    weight: 18,
    purpose: 'challenge',
    quickReplies: [
      { verb: 'accept', label: 'FAIR!' },
      { verb: 'decline', label: 'Not fair' },
    ],
    action: { type: 'startChallenge', payload: { challengeType: 'dice', stakes: 'discount' } },
  },
  {
    id: 'robert-hustle-idle-1',
    entitySlug: 'robert',
    pool: 'idle',
    mood: 'any',
    text: '*counting gold* *recounting gold* *finds extra gold* NICE! The hustle PROVIDES!',
    weight: 16,
    purpose: 'ambient',
  },
  {
    id: 'robert-hustle-farewell-1',
    entitySlug: 'robert',
    pool: 'farewell',
    mood: 'pleased',
    text: 'Go make some money out there! Then BRING IT BACK! To ME! This is called ECONOMICS! I invented it! Probably!',
    weight: 18,
    purpose: 'ambient',
  },
  {
    id: 'robert-hustle-farewell-2',
    entitySlug: 'robert',
    pool: 'farewell',
    mood: 'generous',
    text: 'You are GOOD people! Come back soon! Bring friends! Friends with GOLD! GOLD friends!',
    weight: 16,
    purpose: 'ambient',
  },
];
