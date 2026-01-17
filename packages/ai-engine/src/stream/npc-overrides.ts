/**
 * NPC-Specific Template Overrides
 *
 * Each NPC can have custom templates that reflect their unique voice.
 * These override or supplement the generic templates.
 */

import type { StreamTemplate } from './stream-templates';

// ============================================
// Willy One Eye - Merchant with Vision
// ============================================

export const WILLY_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'willy-idle-001', type: 'idle', template: "See what others miss... that's the trade.", weight: 10 },
  { id: 'willy-idle-002', type: 'idle', template: 'Gold flows where vision goes. Always has.', weight: 8 },
  { id: 'willy-idle-003', type: 'idle', template: "One eye sees clearer than two. Trust me on that...", weight: 8 },
  { id: 'willy-idle-004', type: 'idle', template: 'Inventory check... still have everything. Mostly.', weight: 5 },
  { id: 'willy-idle-005', type: 'idle', template: 'The dimensions shift, but deals remain deals.', weight: 6 },

  // Relationship
  { id: 'willy-rel-001', type: 'relationship', template: '{{TARGET}}... good customer. When they pay.', weight: 8 },
  { id: 'willy-rel-002', type: 'relationship', template: 'Saw {{TARGET}} eyeing my wares. Interesting...', weight: 7 },
  { id: 'willy-rel-003', type: 'relationship', template: "{{TARGET}} owes me. They know what they owe.", weight: 6 },

  // Meta
  { id: 'willy-meta-001', type: 'meta', template: 'Eternal broadcast, eternal commerce. Works for me.', weight: 6 },
  { id: 'willy-meta-002', type: 'meta', template: "Infinity of customers. Could be worse.", weight: 5 },
];

// ============================================
// Mr. Bones - Death's Accountant
// ============================================

export const MR_BONES_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'bones-idle-001', type: 'idle', template: 'Death and taxes. The only certainties. I handle both.', weight: 10 },
  { id: 'bones-idle-002', type: 'idle', template: "The books must balance. They always balance.", weight: 9 },
  { id: 'bones-idle-003', type: 'idle', template: 'Another soul for the ledger. The ledger never sleeps.', weight: 8 },
  { id: 'bones-idle-004', type: 'idle', template: 'I have a bone to pick with eternity. Several bones, actually.', weight: 7 },
  { id: 'bones-idle-005', type: 'idle', template: '*rattles contemplatively*', weight: 4 },

  // Lore
  { id: 'bones-lore-001', type: 'lore', template: 'The Die-rectors track wins and losses. I track everything else.', weight: 8 },
  { id: 'bones-lore-002', type: 'lore', template: "Some say there's a final death. The books don't show it.", weight: 7 },
  { id: 'bones-lore-003', type: 'lore', template: 'Every player has a tab. Most never see the bill.', weight: 6 },

  // Meta
  { id: 'bones-meta-001', type: 'meta', template: 'Eternal broadcast. Eternal paperwork. Same thing, really.', weight: 6 },
  { id: 'bones-meta-002', type: 'meta', template: 'Day {{SEED_DAY}}. Adding it to the records.', weight: 5 },
];

// ============================================
// Stitch-Up Girl - Healer with Edge
// ============================================

export const STITCH_UP_GIRL_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'stitch-idle-001', type: 'idle', template: 'I fix what I break. Usually in that order.', weight: 10 },
  { id: 'stitch-idle-002', type: 'idle', template: 'Every scar tells a story worth surviving.', weight: 9 },
  { id: 'stitch-idle-003', type: 'idle', template: 'Needle ready. Thread ready. Patient... optional.', weight: 7 },
  { id: 'stitch-idle-004', type: 'idle', template: 'Healing takes patience. Breaking takes none.', weight: 6 },
  { id: 'stitch-idle-005', type: 'idle', template: '*checks suture kit* Still stocked. Good.', weight: 5 },

  // Relationship
  { id: 'stitch-rel-001', type: 'relationship', template: '{{TARGET}} looks like they need patching up. Again.', weight: 8 },
  { id: 'stitch-rel-002', type: 'relationship', template: "I've stitched {{TARGET}} back together more times than I can count.", weight: 7 },
  { id: 'stitch-rel-003', type: 'relationship', template: '{{TARGET}}. I heal my friends. My enemies... less so.', weight: 6 },

  // Lore
  { id: 'stitch-lore-001', type: 'lore', template: "The Die-rectors don't bleed. But everything else does.", weight: 7 },
  { id: 'stitch-lore-002', type: 'lore', template: 'Before this, I had another name. Another needle.', weight: 6 },
];

// ============================================
// X-treme - EXTREME GAMBLER
// ============================================

export const XTREME_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'xtreme-idle-001', type: 'idle', template: 'EXTREME STAKES FOR EXTREME PLAYERS!', weight: 10 },
  { id: 'xtreme-idle-002', type: 'idle', template: 'NO RISK NO REWARD! THAT IS THE WAY!', weight: 9 },
  { id: 'xtreme-idle-003', type: 'idle', template: 'Fortune favors the BOLD! AND I AM BOLD!', weight: 8 },
  { id: 'xtreme-idle-004', type: 'idle', template: 'ROLL THE BONES! FEEL THE RUSH!', weight: 8 },
  { id: 'xtreme-idle-005', type: 'idle', template: 'Odds? ODDS ARE FOR COWARDS!', weight: 7 },

  // Relationship
  { id: 'xtreme-rel-001', type: 'relationship', template: '{{TARGET}}! WANT TO GAMBLE?! OF COURSE YOU DO!', weight: 9 },
  { id: 'xtreme-rel-002', type: 'relationship', template: '{{TARGET}} once bet EVERYTHING! RESPECT!', weight: 7 },
  { id: 'xtreme-rel-003', type: 'relationship', template: "{{TARGET}} plays it safe. BORING! But I still like them!", weight: 6 },

  // Meta
  { id: 'xtreme-meta-001', type: 'meta', template: 'ETERNAL GAMBLING! BEST KIND OF GAMBLING!', weight: 7 },
  { id: 'xtreme-meta-002', type: 'meta', template: 'Day {{SEED_DAY}}! EVERY DAY IS A NEW BET!', weight: 6 },
];

// ============================================
// Boo G - Spectral MC
// ============================================

export const BOO_G_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'boog-idle-001', type: 'idle', template: "Let me drop a beat from the afterlife, y'all.", weight: 10 },
  { id: 'boog-idle-002', type: 'idle', template: "Can't kill what's already dead, feel me?", weight: 9 },
  { id: 'boog-idle-003', type: 'idle', template: 'Boo to the G, that is the brand.', weight: 8 },
  { id: 'boog-idle-004', type: 'idle', template: 'This ghost got more life than the living.', weight: 8 },
  { id: 'boog-idle-005', type: 'idle', template: '*ghostly freestyle intensifies*', weight: 5 },

  // Relationship
  { id: 'boog-rel-001', type: 'relationship', template: "{{TARGET}}! What's the vibe today?", weight: 8 },
  { id: 'boog-rel-002', type: 'relationship', template: "{{TARGET}} got flow. Not like mine, but still.", weight: 7 },
  { id: 'boog-rel-003', type: 'relationship', template: "Me and {{TARGET}} go way back. Way, way back.", weight: 6 },

  // Meta
  { id: 'boog-meta-001', type: 'meta', template: 'Broadcasting from beyond. Forever. Literally.', weight: 6 },
  { id: 'boog-meta-002', type: 'meta', template: 'Eternal stream, eternal beats. I dig it.', weight: 5 },
];

// ============================================
// The General (Traveler) - Revolutionary
// ============================================

export const THE_GENERAL_TRAVELER_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'general-t-idle-001', type: 'idle', template: 'The Die-rectors will fall. It is inevitable.', weight: 10 },
  { id: 'general-t-idle-002', type: 'idle', template: 'Every soul we save is a victory. Remember that.', weight: 9 },
  { id: 'general-t-idle-003', type: 'idle', template: "Freedom is not given. It's taken.", weight: 9 },
  { id: 'general-t-idle-004', type: 'idle', template: 'Remember the fallen. Fight for the living.', weight: 8 },
  { id: 'general-t-idle-005', type: 'idle', template: 'The revolution continues. Always.', weight: 7 },

  // Relationship
  { id: 'general-t-rel-001', type: 'relationship', template: '{{TARGET}} is one of us. A true ally.', weight: 8 },
  { id: 'general-t-rel-002', type: 'relationship', template: "{{TARGET}} fights well. We'll need that.", weight: 7 },
  { id: 'general-t-rel-003', type: 'relationship', template: 'I trust {{TARGET}} with my life. And our cause.', weight: 6 },

  // Lore
  { id: 'general-t-lore-001', type: 'lore', template: 'Before the game, there was a world. Real. Ours.', weight: 7 },
  { id: 'general-t-lore-002', type: 'lore', template: 'The Die-rectors have weaknesses. We will find them.', weight: 6 },
];

// ============================================
// The One - Supreme Die-rector
// ============================================

export const THE_ONE_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'one-idle-001', type: 'idle', template: 'There is only one. And I am it.', weight: 10 },
  { id: 'one-idle-002', type: 'idle', template: 'The void obeys. So should you.', weight: 9 },
  { id: 'one-idle-003', type: 'idle', template: 'I decide. That is all that matters.', weight: 9 },
  { id: 'one-idle-004', type: 'idle', template: 'Beginning and end are the same to me.', weight: 8 },
  { id: 'one-idle-005', type: 'idle', template: '...', weight: 3 },

  // Relationship
  { id: 'one-rel-001', type: 'relationship', template: '{{TARGET}} serves. That is their purpose.', weight: 7 },
  { id: 'one-rel-002', type: 'relationship', template: '{{TARGET}}. I am... aware of them.', weight: 6 },

  // Meta
  { id: 'one-meta-001', type: 'meta', template: 'The broadcast continues because I allow it.', weight: 6 },
  { id: 'one-meta-002', type: 'meta', template: 'Eternity is my domain. All of it.', weight: 5 },

  // Lore
  { id: 'one-lore-001', type: 'lore', template: 'We were once like them. That was... before.', weight: 5 },
  { id: 'one-lore-002', type: 'lore', template: 'The game has rules. I wrote them.', weight: 6 },
];

// ============================================
// Dr. Maxwell - Pyromaniac Librarian
// ============================================

export const DR_MAXWELL_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'maxwell-idle-001', type: 'idle', template: 'Some knowledge is too dangerous to preserve. So I burn it.', weight: 10 },
  { id: 'maxwell-idle-002', type: 'idle', template: 'Fire is the ultimate editor. It cuts everything.', weight: 9 },
  { id: 'maxwell-idle-003', type: 'idle', template: 'Read fast. The pages are already smoking.', weight: 8 },
  { id: 'maxwell-idle-004', type: 'idle', template: 'What burns brightest lives shortest. Usually.', weight: 7 },
  { id: 'maxwell-idle-005', type: 'idle', template: '*adjusts spectacles, ignites manuscript*', weight: 5 },

  // Lore
  { id: 'maxwell-lore-001', type: 'lore', template: 'The library held everything. Then I arrived.', weight: 7 },
  { id: 'maxwell-lore-002', type: 'lore', template: 'Forbidden texts? I decide what is forbidden. Then I burn it.', weight: 6 },
  { id: 'maxwell-lore-003', type: 'lore', template: 'Infernus was not always fire. But fire found it. Through me.', weight: 5 },
];

// ============================================
// Boots - World-Weary Traveler
// ============================================

export const BOOTS_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'boots-idle-001', type: 'idle', template: 'These boots have walked every domain. Twice.', weight: 10 },
  { id: 'boots-idle-002', type: 'idle', template: 'The journey is the destination. Mostly.', weight: 9 },
  { id: 'boots-idle-003', type: 'idle', template: 'One step at a time. Forever.', weight: 8 },
  { id: 'boots-idle-004', type: 'idle', template: "I've been where you're going. It's... complicated.", weight: 7 },
  { id: 'boots-idle-005', type: 'idle', template: 'Worn leather, worn soul. Still walking.', weight: 6 },

  // Lore
  { id: 'boots-lore-001', type: 'lore', template: "There's a path between domains. Hidden. I've walked it.", weight: 7 },
  { id: 'boots-lore-002', type: 'lore', template: "Some roads lead nowhere. I've mapped them all.", weight: 6 },
];

// ============================================
// Clausen - Philosophical Wanderer
// ============================================

export const CLAUSEN_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'clausen-idle-001', type: 'idle', template: 'Have we done this before? The feeling persists.', weight: 10 },
  { id: 'clausen-idle-002', type: 'idle', template: 'The cycle continues. Or does it?', weight: 9 },
  { id: 'clausen-idle-003', type: 'idle', template: 'Every ending is a beginning. Or so they say.', weight: 8 },
  { id: 'clausen-idle-004', type: 'idle', template: 'I wander, therefore I am. Maybe.', weight: 7 },
  { id: 'clausen-idle-005', type: 'idle', template: 'Purpose is a question, not an answer.', weight: 6 },

  // Meta
  { id: 'clausen-meta-001', type: 'meta', template: 'Eternal broadcast. Eternal return. Same difference?', weight: 6 },
  { id: 'clausen-meta-002', type: 'meta', template: "Day {{SEED_DAY}}. Have I said this before? Probably.", weight: 5 },
];

// ============================================
// Body Count - Death Statistician
// ============================================

export const BODY_COUNT_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'bodycount-idle-001', type: 'idle', template: "Today's count: pending.", weight: 10 },
  { id: 'bodycount-idle-002', type: 'idle', template: "Numbers don't lie. People do.", weight: 9 },
  { id: 'bodycount-idle-003', type: 'idle', template: 'Adding another to the tally.', weight: 8 },
  { id: 'bodycount-idle-004', type: 'idle', template: 'Statistical certainty: everyone dies. Eventually.', weight: 8 },
  { id: 'bodycount-idle-005', type: 'idle', template: '*updates ledger* Current total: classified.', weight: 6 },

  // Relationship
  { id: 'bodycount-rel-001', type: 'relationship', template: '{{TARGET}} is not on the list. Yet.', weight: 7 },
  { id: 'bodycount-rel-002', type: 'relationship', template: "{{TARGET}}'s count is... impressive.", weight: 6 },

  // Lore
  { id: 'bodycount-lore-001', type: 'lore', template: 'The true count includes respawns. It is very high.', weight: 6 },
];

// ============================================
// King James - Void Merchant King
// ============================================

export const KING_JAMES_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'kingjames-idle-001', type: 'idle', template: 'The void has its king. You look upon him.', weight: 10 },
  { id: 'kingjames-idle-002', type: 'idle', template: 'Citizenship is earned, not given.', weight: 9 },
  { id: 'kingjames-idle-003', type: 'idle', template: 'My realm extends beyond what eyes can see.', weight: 8 },
  { id: 'kingjames-idle-004', type: 'idle', template: 'The crown weighs nothing in null space.', weight: 7 },
  { id: 'kingjames-idle-005', type: 'idle', template: '*surveys kingdom of emptiness*', weight: 5 },

  // Lore
  { id: 'kingjames-lore-001', type: 'lore', template: 'Null Providence was not always void. Then came the erasure.', weight: 6 },
  { id: 'kingjames-lore-002', type: 'lore', template: 'A king without subjects rules nothing. I rule everything.', weight: 5 },
];

// ============================================
// Dr. Voss - Void Scientist
// ============================================

export const DR_VOSS_TEMPLATES: StreamTemplate[] = [
  // Idle
  { id: 'voss-idle-001', type: 'idle', template: 'Fascinating. Let me note that observation.', weight: 10 },
  { id: 'voss-idle-002', type: 'idle', template: 'The void reveals what light conceals.', weight: 9 },
  { id: 'voss-idle-003', type: 'idle', template: 'Another data point for the research.', weight: 8 },
  { id: 'voss-idle-004', type: 'idle', template: 'Null hypothesis: everything is connected. Testing...', weight: 7 },
  { id: 'voss-idle-005', type: 'idle', template: '*scribbles in void-touched notebook*', weight: 5 },

  // Lore
  { id: 'voss-lore-001', type: 'lore', template: 'The void is not empty. It is... waiting.', weight: 7 },
  { id: 'voss-lore-002', type: 'lore', template: 'My research suggests the game has a boundary. Somewhere.', weight: 6 },
];

// ============================================
// Registry
// ============================================

export const NPC_TEMPLATE_OVERRIDES: Record<string, StreamTemplate[]> = {
  'willy': WILLY_TEMPLATES,
  'mr-bones': MR_BONES_TEMPLATES,
  'stitch-up-girl': STITCH_UP_GIRL_TEMPLATES,
  'xtreme': XTREME_TEMPLATES,
  'boo-g': BOO_G_TEMPLATES,
  'the-general-traveler': THE_GENERAL_TRAVELER_TEMPLATES,
  'the-one': THE_ONE_TEMPLATES,
  'dr-maxwell': DR_MAXWELL_TEMPLATES,
  'boots': BOOTS_TEMPLATES,
  'clausen': CLAUSEN_TEMPLATES,
  'body-count': BODY_COUNT_TEMPLATES,
  'king-james': KING_JAMES_TEMPLATES,
  'dr-voss': DR_VOSS_TEMPLATES,
};

/**
 * Get NPC-specific templates, falling back to empty array
 */
export function getNPCTemplates(npcSlug: string): StreamTemplate[] {
  return NPC_TEMPLATE_OVERRIDES[npcSlug] || [];
}

/**
 * Check if NPC has custom templates
 */
export function hasNPCOverrides(npcSlug: string): boolean {
  return npcSlug in NPC_TEMPLATE_OVERRIDES;
}
