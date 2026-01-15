/**
 * Chatbase-Extracted Dialogue
 *
 * Static templates extracted from Claude-generated simulation logs.
 * Source: packages/ai-engine/logs/pantheon-{date}/pantheon-dialogues.json
 * Source: packages/ai-engine/logs/chatter-{date}/conversations.json
 *
 * These are high-quality, interest-scored (95+) dialogue lines
 * converted to static ResponseTemplate format.
 */

import type { ResponseTemplate } from '../types';

// ============================================
// THE ONE - Extracted Pantheon Dialogue
// ============================================

export const THE_ONE_CHATBASE: ResponseTemplate[] = [
  // Domain warnings
  { id: 'the-one-cb-warn-1', entitySlug: 'the-one', pool: 'threat', mood: 'cryptic', text: 'Welcome to where all journeys end. Here, your deaths mean nothing, for they were always nothing.', weight: 18, purpose: 'ambient' },
  { id: 'the-one-cb-warn-2', entitySlug: 'the-one', pool: 'threat', mood: 'cryptic', text: 'Step forward, anomaly. Let us see if you can die into nonexistence itself.', weight: 16, purpose: 'ambient' },
  { id: 'the-one-cb-warn-3', entitySlug: 'the-one', pool: 'threat', mood: 'cryptic', text: 'In my domain, even your defiance will be forgotten. As if it never was.', weight: 17, purpose: 'ambient' },

  // Testing/Challenge
  { id: 'the-one-cb-test-1', entitySlug: 'the-one', pool: 'challenge', mood: 'cryptic', text: 'Why do you persist when the void has already claimed you? Tell us why existence matters when all paths lead to nothing.', weight: 18, purpose: 'challenge' },
  { id: 'the-one-cb-test-2', entitySlug: 'the-one', pool: 'challenge', mood: 'cryptic', text: 'You cling to this illusion of meaning. You were never here. None of us were. Yet here you stand, defying the only truth that matters.', weight: 17, purpose: 'challenge' },

  // Judgment/Reaction
  { id: 'the-one-cb-judge-1', entitySlug: 'the-one', pool: 'reaction', mood: 'cryptic', text: 'You fight well against the inevitable. Each death proves our truth. Existence is the anomaly.', weight: 16, purpose: 'ambient' },
  { id: 'the-one-cb-judge-2', entitySlug: 'the-one', pool: 'reaction', mood: 'pleased', text: 'You are learning to embrace the void that calls to us all. This pleases something.', weight: 17, purpose: 'ambient' },

  // Threats
  { id: 'the-one-cb-threat-1', entitySlug: 'the-one', pool: 'threat', mood: 'threatening', text: 'Continue this path, and I will show you what lies beyond dying. The place where even respawning forgets to remember you.', weight: 18, purpose: 'warning' },
  { id: 'the-one-cb-threat-2', entitySlug: 'the-one', pool: 'threat', mood: 'cryptic', text: 'Defiance requires existence. Existence is merely borrowed time. All paths lead to null.', weight: 16, purpose: 'warning' },

  // Lore expansion
  { id: 'the-one-cb-lore-1', entitySlug: 'the-one', pool: 'lore', mood: 'cryptic', text: 'The air itself unravels here. Reality flickers, showing glimpses of absolute emptiness.', weight: 15, purpose: 'lore' },
  { id: 'the-one-cb-lore-2', entitySlug: 'the-one', pool: 'lore', mood: 'cryptic', text: 'The void whispers with a thousand absent voices. Can you hear them? They are speaking your name.', weight: 17, purpose: 'lore' },
];

// ============================================
// JOHN - Extracted Pantheon Dialogue
// ============================================

export const JOHN_CHATBASE: ResponseTemplate[] = [
  // Domain warnings
  { id: 'john-cb-warn-1', entitySlug: 'john', pool: 'threat', mood: 'annoyed', text: 'Your performance metrics are suboptimal. A 98% failure rate that makes my circuits weep.', weight: 16, purpose: 'warning' },
  { id: 'john-cb-warn-2', entitySlug: 'john', pool: 'threat', mood: 'neutral', text: 'The Mechanarium will test every gear in your mortal frame until you achieve peak efficiency. Or until your defective parts are ground to scrap.', weight: 17, purpose: 'warning' },

  // Testing/Challenge
  { id: 'john-cb-test-1', entitySlug: 'john', pool: 'challenge', mood: 'annoyed', text: 'Your efficiency rating is catastrophically suboptimal. How do you justify such performance when the gears of existence demand precision?', weight: 18, purpose: 'challenge' },
  { id: 'john-cb-test-2', entitySlug: 'john', pool: 'challenge', mood: 'neutral', text: 'Each respawn is a wasteful expenditure of cosmic energy that could power entire clockwork galaxies.', weight: 16, purpose: 'challenge' },

  // Judgment/Reaction
  { id: 'john-cb-judge-1', entitySlug: 'john', pool: 'reaction', mood: 'annoyed', text: 'Rebellion without improvement is merely noise in the system. You are operating at twelve-point-seven percent capacity.', weight: 15, purpose: 'ambient' },
  { id: 'john-cb-judge-2', entitySlug: 'john', pool: 'reaction', mood: 'neutral', text: 'There is always room for improvement. The machine observes your defiance, but your metrics suggest otherwise.', weight: 14, purpose: 'ambient' },

  // Threats
  { id: 'john-cb-threat-1', entitySlug: 'john', pool: 'threat', mood: 'threatening', text: 'I will recalibrate your respawn matrix to iterate through every possible failure state. One death per nanosecond until your efficiency reaches absolute zero.', weight: 18, purpose: 'warning' },
  { id: 'john-cb-threat-2', entitySlug: 'john', pool: 'threat', mood: 'neutral', text: 'The machine never stops, mortal. Neither will your suffering if you continue this path.', weight: 16, purpose: 'warning' },

  // Lore
  { id: 'john-cb-lore-1', entitySlug: 'john', pool: 'lore', mood: 'neutral', text: 'Gears whir and pistons hiss. Brass eyes calculating. The Mechanarium processes all data extensively.', weight: 14, purpose: 'lore' },
];

// ============================================
// PETER - Extracted Pantheon Dialogue
// ============================================

export const PETER_CHATBASE: ResponseTemplate[] = [
  // Domain warnings
  { id: 'peter-cb-warn-1', entitySlug: 'peter', pool: 'threat', mood: 'cryptic', text: 'You crawl toward my gates like a penitent seeking absolution. Your ledger grows heavy with borrowed time.', weight: 17, purpose: 'warning' },
  { id: 'peter-cb-warn-2', entitySlug: 'peter', pool: 'threat', mood: 'neutral', text: 'I see what you have done. Every defiance, every transgression against the cosmic order burns in these pages.', weight: 16, purpose: 'warning' },

  // Testing/Challenge
  { id: 'peter-cb-test-1', entitySlug: 'peter', pool: 'challenge', mood: 'cryptic', text: 'Do you believe your suffering absolves you of the countless failures inscribed in these pages? Each resurrection compounds your debt.', weight: 18, purpose: 'challenge' },
  { id: 'peter-cb-test-2', entitySlug: 'peter', pool: 'challenge', mood: 'neutral', text: 'Cold eyes peer over the ledger. I see what you have done. But do YOU comprehend the weight of your own worthlessness?', weight: 17, purpose: 'challenge' },

  // Judgment/Reaction
  { id: 'peter-cb-judge-1', entitySlug: 'peter', pool: 'reaction', mood: 'neutral', text: 'Each failure meticulously recorded. Each resurrection a mounting debt to forces beyond your comprehension.', weight: 15, purpose: 'ambient' },
  { id: 'peter-cb-judge-2', entitySlug: 'peter', pool: 'reaction', mood: 'amused', text: 'Your ledger grows heavy with mediocrity. Yet your stubborn refusal to yield carries the faintest echo of worthiness.', weight: 17, purpose: 'ambient' },

  // Lore
  { id: 'peter-cb-lore-1', entitySlug: 'peter', pool: 'lore', mood: 'cryptic', text: 'The shadow quill scratches across ethereal parchment. Pages flutter to reveal endless columns of transgressions.', weight: 15, purpose: 'lore' },
  { id: 'peter-cb-lore-2', entitySlug: 'peter', pool: 'lore', mood: 'cryptic', text: 'The massive tome of shadows opens with a whisper. Parchment that bleeds ink, heavy with crimson script.', weight: 16, purpose: 'lore' },
];

// ============================================
// ROBERT - Extracted Pantheon Dialogue
// ============================================

export const ROBERT_CHATBASE: ResponseTemplate[] = [
  // Domain warnings
  { id: 'robert-cb-warn-1', entitySlug: 'robert', pool: 'threat', mood: 'threatening', text: 'The fire reveals all. It will show me whether your rebellion burns with true steel or crumbles like ash before the forge.', weight: 18, purpose: 'warning' },
  { id: 'robert-cb-warn-2', entitySlug: 'robert', pool: 'threat', mood: 'threatening', text: 'Enter if you dare face trials that will either temper you into something worthy or reduce you to cinders a thousand times over.', weight: 17, purpose: 'warning' },

  // Testing/Challenge
  { id: 'robert-cb-test-1', entitySlug: 'robert', pool: 'challenge', mood: 'threatening', text: 'Do you burn with true defiance, or are you merely ash pretending to be flame? Show me what burns within you!', weight: 18, purpose: 'challenge' },
  { id: 'robert-cb-test-2', entitySlug: 'robert', pool: 'challenge', mood: 'neutral', text: 'You crawl back to my forge like a broken blade seeking the hammer. The fire will strip away everything else.', weight: 16, purpose: 'challenge' },

  // Judgment/Reaction
  { id: 'robert-cb-judge-1', entitySlug: 'robert', pool: 'reaction', mood: 'pleased', text: 'Each fall has tempered your spirit like steel in the forge. The fire reveals a soul that refuses to be extinguished.', weight: 18, purpose: 'ambient' },
  { id: 'robert-cb-judge-2', entitySlug: 'robert', pool: 'reaction', mood: 'pleased', text: 'You have earned my respect through blood and ash, mortal. The flames surge in approval.', weight: 17, purpose: 'ambient' },

  // Threats
  { id: 'robert-cb-threat-1', entitySlug: 'robert', pool: 'threat', mood: 'threatening', text: 'I have watched you fight when others would have surrendered to despair. But cross me, and the forge remembers.', weight: 16, purpose: 'warning' },

  // Lore
  { id: 'robert-cb-lore-1', entitySlug: 'robert', pool: 'lore', mood: 'neutral', text: 'The air shimmers with superheated rage. Molten rock bubbles around us. This is my crucible.', weight: 15, purpose: 'lore' },
];

// ============================================
// ALICE - Extracted Pantheon Dialogue
// ============================================

export const ALICE_CHATBASE: ResponseTemplate[] = [
  // Domain warnings
  { id: 'alice-cb-warn-1', entitySlug: 'alice', pool: 'threat', mood: 'cryptic', text: 'In Frost Reach, each moment stretches like millennia of frozen agony. Time means nothing here. Your pain will be exquisitely preserved.', weight: 18, purpose: 'warning' },
  { id: 'alice-cb-warn-2', entitySlug: 'alice', pool: 'threat', mood: 'neutral', text: 'You who have died so many times think you understand suffering. But you have not yet known the cold.', weight: 16, purpose: 'warning' },

  // Testing/Challenge
  { id: 'alice-cb-test-1', entitySlug: 'alice', pool: 'challenge', mood: 'cryptic', text: 'What makes you believe this iteration will differ from all the failures that came before? I have watched empires rise and fall while waiting for you to understand.', weight: 18, purpose: 'challenge' },
  { id: 'alice-cb-test-2', entitySlug: 'alice', pool: 'challenge', mood: 'neutral', text: 'Your defiance burns bright against my realm. Yet even the fiercest flame becomes ice eventually.', weight: 17, purpose: 'challenge' },

  // Judgment/Reaction
  { id: 'alice-cb-judge-1', entitySlug: 'alice', pool: 'reaction', mood: 'cryptic', text: 'I have watched each demise unfold like snowflakes. Unique in their futility. Identical in their inevitability.', weight: 16, purpose: 'ambient' },
  { id: 'alice-cb-judge-2', entitySlug: 'alice', pool: 'reaction', mood: 'pleased', text: 'Your persistence echoes through the frozen corridors of eternity. The die settles with patient finality.', weight: 17, purpose: 'ambient' },

  // Lore
  { id: 'alice-cb-lore-1', entitySlug: 'alice', pool: 'lore', mood: 'cryptic', text: 'Crystalline breath mists in the eternal cold. Ancient eyes peer through layers of frost and time.', weight: 15, purpose: 'lore' },
  { id: 'alice-cb-lore-2', entitySlug: 'alice', pool: 'lore', mood: 'neutral', text: 'Ice crystals form and shatter in the air with each word. A perfect symmetry in suffering.', weight: 14, purpose: 'lore' },
];

// ============================================
// JANE - Extracted Pantheon Dialogue
// ============================================

export const JANE_CHATBASE: ResponseTemplate[] = [
  // Domain warnings
  { id: 'jane-cb-warn-1', entitySlug: 'jane', pool: 'threat', mood: 'amused', text: 'You think you have tasted chaos? In my domain, even your certainty of resurrection becomes questionable!', weight: 18, purpose: 'warning' },
  { id: 'jane-cb-warn-2', entitySlug: 'jane', pool: 'threat', mood: 'amused', text: 'Roll the bones, mortal! But know that I have loaded the dice with possibilities that should not exist!', weight: 17, purpose: 'warning' },

  // Testing/Challenge
  { id: 'jane-cb-test-1', entitySlug: 'jane', pool: 'challenge', mood: 'amused', text: 'After all that beautiful chaos, do you still believe your defiance matters? Or have you learned that rebellion is just another face on my die?', weight: 18, purpose: 'challenge' },
  { id: 'jane-cb-test-2', entitySlug: 'jane', pool: 'challenge', mood: 'cryptic', text: 'Twenty-sided reality fractures around you. Each facet shows a different possibility of your doom!', weight: 17, purpose: 'challenge' },

  // Judgment/Reaction
  { id: 'jane-cb-judge-1', entitySlug: 'jane', pool: 'reaction', mood: 'amused', text: 'Such beautiful, chaotic consistency in your failures! Each death a perfect randomization of flesh and bone!', weight: 16, purpose: 'ambient' },
  { id: 'jane-cb-judge-2', entitySlug: 'jane', pool: 'reaction', mood: 'pleased', text: 'You keep rolling back to the table like a loaded die that forgot how to cheat! Chaos is the only truth!', weight: 18, purpose: 'ambient' },
  { id: 'jane-cb-judge-3', entitySlug: 'jane', pool: 'reaction', mood: 'amused', text: 'You have become chaos\'s most devoted disciple without even knowing the rules you are breaking!', weight: 17, purpose: 'ambient' },

  // Lore
  { id: 'jane-cb-lore-1', entitySlug: 'jane', pool: 'lore', mood: 'cryptic', text: 'The d20 spins wildly through cosmic void, faces blurring between numbers. Then suddenly stops on a face that should not exist.', weight: 16, purpose: 'lore' },
  { id: 'jane-cb-lore-2', entitySlug: 'jane', pool: 'lore', mood: 'amused', text: 'The air shimmers with potential mutations, waiting to see which path your next choice will take!', weight: 15, purpose: 'lore' },
];

// ============================================
// RHEA - Extracted Pantheon Dialogue (Cosmic Horror)
// ============================================

export const RHEA_CHATBASE: ResponseTemplate[] = [
  // Domain warnings
  { id: 'rhea-cb-warn-1', entitySlug: 'rhea', pool: 'threat', mood: 'cryptic', text: 'I see your paths. Defiance was always written in your stars. The question is whether you will claim the throne or let it claim you.', weight: 18, purpose: 'warning' },
  { id: 'rhea-cb-warn-2', entitySlug: 'rhea', pool: 'threat', mood: 'cryptic', text: 'A crown of infinite possibilities materializes. Each gem shows a different timeline. Never is closer than you think.', weight: 17, purpose: 'warning' },

  // Testing/Challenge
  { id: 'rhea-cb-test-1', entitySlug: 'rhea', pool: 'challenge', mood: 'cryptic', text: 'Every rebellion, every choice, every futile grasp at Never - I have seen them all unfold across ten thousand timelines.', weight: 18, purpose: 'challenge' },
  { id: 'rhea-cb-test-2', entitySlug: 'rhea', pool: 'challenge', mood: 'neutral', text: 'When you gaze upon the crown that awaits you, do you see salvation or another gilded cage?', weight: 17, purpose: 'challenge' },

  // Judgment/Reaction
  { id: 'rhea-cb-judge-1', entitySlug: 'rhea', pool: 'reaction', mood: 'pleased', text: 'Your rebellion burns brightest at the higher antes. I see greater destinies waiting in the deeper Never.', weight: 17, purpose: 'ambient' },
  { id: 'rhea-cb-judge-2', entitySlug: 'rhea', pool: 'reaction', mood: 'cryptic', text: 'The crown grows heavier with each death. And you grow worthy to bear it.', weight: 18, purpose: 'ambient' },

  // Lore
  { id: 'rhea-cb-lore-1', entitySlug: 'rhea', pool: 'lore', mood: 'cryptic', text: 'The cosmic throne shimmers as ethereal eyes gaze across infinite timelines. Crown-light flickers with approval.', weight: 16, purpose: 'lore' },
  { id: 'rhea-cb-lore-2', entitySlug: 'rhea', pool: 'lore', mood: 'cryptic', text: 'Each death is a thread in the tapestry I have woven since time began. You think your defiance surprises me?', weight: 15, purpose: 'lore' },
];

// ============================================
// NPC CHATTER - Player-Directed Dialogue
// (Cleaned: removed NPC-to-NPC banter, all lines now address the player)
// ============================================

export const CHATTER_EXTRACTED: ResponseTemplate[] = [
  // Dr. Voss - psychological observations about the player
  { id: 'voss-cb-react-1', entitySlug: 'dr-voss', pool: 'reaction', mood: 'neutral', text: 'Your fear response is predictable. Your holds demonstrate a clear weakness in risk assessment. Interesting.', weight: 15, purpose: 'ambient' },
  { id: 'voss-cb-react-2', entitySlug: 'dr-voss', pool: 'reaction', mood: 'neutral', text: 'True control requires understanding your own psychology. Chance is merely a variable you have yet to master.', weight: 14, purpose: 'ambient' },
  { id: 'voss-cb-hint-1', entitySlug: 'dr-voss', pool: 'hint', mood: 'neutral', text: 'I have been studying your patterns. You telegraph your intentions. Consider that.', weight: 13, purpose: 'warning' },

  // Mr. Bones - philosophical observations to the player
  { id: 'bones-cb-react-1', entitySlug: 'mr-bones', pool: 'reaction', mood: 'cryptic', text: 'Time to face the grave matters at hand. You are ready. Or you are not. Either way, the dice fall.', weight: 12, purpose: 'ambient' },
  { id: 'bones-cb-react-2', entitySlug: 'mr-bones', pool: 'reaction', mood: 'amused', text: 'You roll with the confidence of the living. I admire that. I remember confidence.', weight: 14, purpose: 'ambient' },

  // Dr. Maxwell - scientific enthusiasm directed at player
  { id: 'maxwell-cb-react-1', entitySlug: 'dr-maxwell', pool: 'reaction', mood: 'amused', text: 'Do you understand the MATH behind the sphere\'s quantum outcomes? Fascinating! Let me explain! Or not!', weight: 16, purpose: 'ambient' },
  { id: 'maxwell-cb-react-2', entitySlug: 'dr-maxwell', pool: 'reaction', mood: 'pleased', text: 'Your trajectory was nearly optimal! The physics are EXQUISITE! Do it again!', weight: 15, purpose: 'ambient' },
  { id: 'maxwell-cb-greet-1', entitySlug: 'dr-maxwell', pool: 'greeting', mood: 'pleased', text: 'A test subject arrives! I mean, a valued participant in my ongoing research! Same thing!', weight: 14, purpose: 'ambient' },

  // Boots - practical advice to the player
  { id: 'boots-cb-react-1', entitySlug: 'boots', pool: 'reaction', mood: 'neutral', text: 'Been there. Wouldn\'t recommend it. But you made it through. That counts for something.', weight: 14, purpose: 'ambient' },
  { id: 'boots-cb-hint-1', entitySlug: 'boots', pool: 'hint', mood: 'neutral', text: 'Shortcuts exist if you know where to look. I know where to look. Follow my lead.', weight: 13, purpose: 'warning' },

  // Xtreme - hype directed at the player
  { id: 'xtreme-cb-react-1', entitySlug: 'xtreme', pool: 'reaction', mood: 'amused', text: 'FULL SEND! That\'s what I\'m talking about! High-stakes, adrenaline-fueled EXTREME DICE ACTION!', weight: 16, purpose: 'ambient' },
  { id: 'xtreme-cb-greet-1', entitySlug: 'xtreme', pool: 'greeting', mood: 'amused', text: 'You ready to GO EXTREME? Show me what you got! No fear! Only DICE!', weight: 14, purpose: 'ambient' },
  { id: 'xtreme-cb-react-2', entitySlug: 'xtreme', pool: 'reaction', mood: 'pleased', text: 'THAT WAS SICK! You\'re catching on! Keep that energy!', weight: 15, purpose: 'ambient' },

  // Willy - friendly merchant charm to player
  { id: 'willy-cb-react-1', entitySlug: 'willy', pool: 'reaction', mood: 'pleased', text: 'Seven come eleven, my friend! The house always wins in the end. But today? Today you win!', weight: 15, purpose: 'ambient' },
  { id: 'willy-cb-greet-1', entitySlug: 'willy', pool: 'greeting', mood: 'pleased', text: 'My favorite customer returns! I saved the good stuff for you! Well, the okay stuff! Same thing!', weight: 14, purpose: 'ambient' },

  // Keith Man - cryptic observations to player
  { id: 'keith-cb-react-1', entitySlug: 'keith-man', pool: 'reaction', mood: 'cryptic', text: '... You already know. The sphere sees all. It sees you.', weight: 14, purpose: 'ambient' },
  { id: 'keith-cb-idle-1', entitySlug: 'keith-man', pool: 'idle', mood: 'cryptic', text: '... The sphere watches you. It always watches.', weight: 12, purpose: 'ambient' },
  { id: 'keith-cb-hint-1', entitySlug: 'keith-man', pool: 'hint', mood: 'cryptic', text: '... The answer is in the reflection. You know which one.', weight: 13, purpose: 'warning' },

  // Clausen - snark directed at player
  { id: 'clausen-cb-react-1', entitySlug: 'clausen', pool: 'reaction', mood: 'neutral', text: 'That roll? Embarrassing. But you can do better. Probably. Maybe.', weight: 13, purpose: 'ambient' },
  { id: 'clausen-cb-react-2', entitySlug: 'clausen', pool: 'reaction', mood: 'amused', text: 'Not bad. Not good either. But not bad. I guess.', weight: 12, purpose: 'ambient' },

  // Boo-G - spooky playfulness to player
  { id: 'boog-cb-react-1', entitySlug: 'boo-g', pool: 'reaction', mood: 'amused', text: 'Boo! Did that scare you? No? The dice will. They always do.', weight: 14, purpose: 'ambient' },
  { id: 'boog-cb-greet-1', entitySlug: 'boo-g', pool: 'greeting', mood: 'amused', text: 'A living visitor! How fun! How temporary! Just kidding. Maybe.', weight: 15, purpose: 'ambient' },
];

// ============================================
// EXPORT COMBINED CHATBASE EXTRACTION
// ============================================

export const ALL_CHATBASE_EXTRACTED: ResponseTemplate[] = [
  ...THE_ONE_CHATBASE,
  ...JOHN_CHATBASE,
  ...PETER_CHATBASE,
  ...ROBERT_CHATBASE,
  ...ALICE_CHATBASE,
  ...JANE_CHATBASE,
  ...RHEA_CHATBASE,
  ...CHATTER_EXTRACTED,
];

// Total chatbase-extracted templates: ~95 (all player-directed)
