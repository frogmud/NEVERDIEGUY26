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
// ZERO CHANCE - Probability Void Dialogue
// ============================================

export const ZERO_CHANCE_CHATBASE: ResponseTemplate[] = [
  // Greetings
  { id: 'zero-cb-greet-1', entitySlug: 'zero-chance', pool: 'greeting', mood: 'cryptic', text: 'The probability of our meeting was exactly zero. Yet here you stand. Curious.', weight: 16, purpose: 'ambient' },
  { id: 'zero-cb-greet-2', entitySlug: 'zero-chance', pool: 'greeting', mood: 'neutral', text: 'You exist in defiance of statistics. I find that... interesting.', weight: 15, purpose: 'ambient' },

  // Challenges
  { id: 'zero-cb-chal-1', entitySlug: 'zero-chance', pool: 'challenge', mood: 'cryptic', text: 'Roll the dice. I have already calculated every outcome. None of them favor you.', weight: 18, purpose: 'challenge' },
  { id: 'zero-cb-chal-2', entitySlug: 'zero-chance', pool: 'challenge', mood: 'neutral', text: 'What is luck but probability refusing to behave? Show me your defiance.', weight: 17, purpose: 'challenge' },
  { id: 'zero-cb-chal-3', entitySlug: 'zero-chance', pool: 'challenge', mood: 'amused', text: 'The odds say you should fail. Prove the odds wrong. It amuses me when they lie.', weight: 16, purpose: 'challenge' },

  // Lore
  { id: 'zero-cb-lore-1', entitySlug: 'zero-chance', pool: 'lore', mood: 'cryptic', text: 'Before dice existed, I counted the stars. Each one a failed probability. Each one a beautiful impossibility.', weight: 17, purpose: 'lore' },
  { id: 'zero-cb-lore-2', entitySlug: 'zero-chance', pool: 'lore', mood: 'neutral', text: 'The void between outcomes is where I reside. The space where chance hesitates before choosing.', weight: 16, purpose: 'lore' },
  { id: 'zero-cb-lore-3', entitySlug: 'zero-chance', pool: 'lore', mood: 'cryptic', text: 'Every roll you make creates a universe where you rolled differently. I have seen them all collapse.', weight: 18, purpose: 'lore' },

  // Hints
  { id: 'zero-cb-hint-1', entitySlug: 'zero-chance', pool: 'hint', mood: 'neutral', text: 'The safest path has a 0.3% fatality rate. The dangerous path? 0.29%. Choose wisely.', weight: 15, purpose: 'warning' },
  { id: 'zero-cb-hint-2', entitySlug: 'zero-chance', pool: 'hint', mood: 'cryptic', text: 'When the dice show nothing, that is when I speak loudest. Listen for the silence.', weight: 14, purpose: 'warning' },

  // Reactions
  { id: 'zero-cb-react-1', entitySlug: 'zero-chance', pool: 'reaction', mood: 'amused', text: 'Against all odds, you succeeded. How statistically improbable. How delightful.', weight: 16, purpose: 'ambient' },
  { id: 'zero-cb-react-2', entitySlug: 'zero-chance', pool: 'reaction', mood: 'neutral', text: 'That outcome had a 0.001% chance of occurring. You are either blessed or cursed. Perhaps both.', weight: 15, purpose: 'ambient' },

  // Farewell
  { id: 'zero-cb-fare-1', entitySlug: 'zero-chance', pool: 'farewell', mood: 'cryptic', text: 'We will meet again. The probability of that is... undefined. My favorite kind of number.', weight: 14, purpose: 'ambient' },
  { id: 'zero-cb-fare-2', entitySlug: 'zero-chance', pool: 'farewell', mood: 'neutral', text: 'Go. Defy more statistics. Someone has to prove the equations wrong.', weight: 13, purpose: 'ambient' },
];

// ============================================
// ALIEN BABY - Larval Horror Dialogue
// ============================================

export const ALIEN_BABY_CHATBASE: ResponseTemplate[] = [
  // Greetings
  { id: 'alien-cb-greet-1', entitySlug: 'alien-baby', pool: 'greeting', mood: 'pleased', text: 'Goo goo! You came to pway! The last one bwoke too fast. You look more fun!', weight: 17, purpose: 'ambient' },
  { id: 'alien-cb-greet-2', entitySlug: 'alien-baby', pool: 'greeting', mood: 'amused', text: 'Hewwo fwiend! Want to see what I can do with weality? It goes SQUISH!', weight: 16, purpose: 'ambient' },

  // Challenges
  { id: 'alien-cb-chal-1', entitySlug: 'alien-baby', pool: 'challenge', mood: 'pleased', text: 'Wet us pway a game! If you win, you get to keep existing! If I win... we pway again!', weight: 18, purpose: 'challenge' },
  { id: 'alien-cb-chal-2', entitySlug: 'alien-baby', pool: 'challenge', mood: 'amused', text: 'Thwow the dice! Thwow them hawd! Make them go BOOM! I wuv when things go boom!', weight: 17, purpose: 'challenge' },

  // Lore
  { id: 'alien-cb-lore-1', entitySlug: 'alien-baby', pool: 'lore', mood: 'cryptic', text: 'Mommy says I will gwow up to eat galaxies one day. Right now I just nibble on dimensions!', weight: 17, purpose: 'lore' },
  { id: 'alien-cb-lore-2', entitySlug: 'alien-baby', pool: 'lore', mood: 'pleased', text: 'Before time was time, there was just pwaytime. I miss those days. So much to bweak!', weight: 16, purpose: 'lore' },

  // Reactions
  { id: 'alien-cb-react-1', entitySlug: 'alien-baby', pool: 'reaction', mood: 'pleased', text: 'YAY! You did the thing! The thing I wanted! Do it again! AGAIN!', weight: 16, purpose: 'ambient' },
  { id: 'alien-cb-react-2', entitySlug: 'alien-baby', pool: 'reaction', mood: 'amused', text: 'Oopsie! You made a mess! I wuv messes! Messes are the best!', weight: 15, purpose: 'ambient' },
  { id: 'alien-cb-react-3', entitySlug: 'alien-baby', pool: 'reaction', mood: 'cryptic', text: 'You twy so hawd. Its cute. Mommy says cute things taste best. I mean... goo goo!', weight: 17, purpose: 'ambient' },

  // Hints
  { id: 'alien-cb-hint-1', entitySlug: 'alien-baby', pool: 'hint', mood: 'pleased', text: 'Psst! The scawy thing is afwaid of giggles! Giggle at it! GIGGLE!', weight: 14, purpose: 'warning' },
  { id: 'alien-cb-hint-2', entitySlug: 'alien-baby', pool: 'hint', mood: 'amused', text: 'I ate the path you were gonna take! Sowwy! Take the other one! Its still there! Mostly!', weight: 15, purpose: 'warning' },

  // Threats (playful cosmic horror)
  { id: 'alien-cb-threat-1', entitySlug: 'alien-baby', pool: 'threat', mood: 'amused', text: 'If you make me cwy, I will unmake you. Then remake you. Then do it again until I stop cwying!', weight: 18, purpose: 'warning' },
  { id: 'alien-cb-threat-2', entitySlug: 'alien-baby', pool: 'threat', mood: 'pleased', text: 'Dont be boring! Boring things get digested into the spaces between spaces!', weight: 16, purpose: 'warning' },

  // Farewell
  { id: 'alien-cb-fare-1', entitySlug: 'alien-baby', pool: 'farewell', mood: 'pleased', text: 'Bye bye! Come back soon! Or I will find you! Finding is my favowite game!', weight: 14, purpose: 'ambient' },
  { id: 'alien-cb-fare-2', entitySlug: 'alien-baby', pool: 'farewell', mood: 'amused', text: 'You weaving? Otay! But wemember... I am evewywhere! And nowhewe! Peekaboo!', weight: 15, purpose: 'ambient' },
];

// ============================================
// STITCH UP GIRL - Combat Medic Dialogue
// ============================================

export const STITCH_UP_GIRL_CHATBASE: ResponseTemplate[] = [
  // Greetings
  { id: 'stitch-cb-greet-1', entitySlug: 'stitch-up-girl', pool: 'greeting', mood: 'pleased', text: 'There you are! Let me take a look at you. Any new holes I should know about?', weight: 16, purpose: 'ambient' },
  { id: 'stitch-cb-greet-2', entitySlug: 'stitch-up-girl', pool: 'greeting', mood: 'neutral', text: 'Back already? Either you are very brave or very reckless. My sutures will tell me which.', weight: 15, purpose: 'ambient' },
  { id: 'stitch-cb-greet-3', entitySlug: 'stitch-up-girl', pool: 'greeting', mood: 'concerned', text: 'You look intact. Thats a pleasant surprise around here. Shall we keep it that way?', weight: 14, purpose: 'ambient' },

  // Hints (medical warnings)
  { id: 'stitch-cb-hint-1', entitySlug: 'stitch-up-girl', pool: 'hint', mood: 'concerned', text: 'That path ahead? High laceration risk. Pack extra bandages. Or better yet, dont go that way.', weight: 16, purpose: 'warning' },
  { id: 'stitch-cb-hint-2', entitySlug: 'stitch-up-girl', pool: 'hint', mood: 'neutral', text: 'Your vitals are stable but your luck is showing stress fractures. Be careful out there.', weight: 15, purpose: 'warning' },
  { id: 'stitch-cb-hint-3', entitySlug: 'stitch-up-girl', pool: 'hint', mood: 'pleased', text: 'Pro tip: if it glows, dont touch it. If it pulses, run. If it speaks, definitely run.', weight: 14, purpose: 'warning' },

  // Reactions
  { id: 'stitch-cb-react-1', entitySlug: 'stitch-up-girl', pool: 'reaction', mood: 'pleased', text: 'Not a scratch! You are either getting better at this or the dice like you today.', weight: 15, purpose: 'ambient' },
  { id: 'stitch-cb-react-2', entitySlug: 'stitch-up-girl', pool: 'reaction', mood: 'concerned', text: 'That looked painful. Let me know if anything falls off. I can usually put it back.', weight: 14, purpose: 'ambient' },
  { id: 'stitch-cb-react-3', entitySlug: 'stitch-up-girl', pool: 'reaction', mood: 'amused', text: 'Impressive! From a medical perspective, that should have killed you. Well done!', weight: 16, purpose: 'ambient' },

  // Lore
  { id: 'stitch-cb-lore-1', entitySlug: 'stitch-up-girl', pool: 'lore', mood: 'neutral', text: 'I have patched up Die-rectors and travelers alike. Pain is the great equalizer. Everyone bleeds.', weight: 15, purpose: 'lore' },
  { id: 'stitch-cb-lore-2', entitySlug: 'stitch-up-girl', pool: 'lore', mood: 'cryptic', text: 'Shadow Keep taught me that death is just another wound. One I have learned to stitch closed.', weight: 17, purpose: 'lore' },

  // Challenges
  { id: 'stitch-cb-chal-1', entitySlug: 'stitch-up-girl', pool: 'challenge', mood: 'neutral', text: 'Think you can survive the next room without my help? Lets put that theory to the test.', weight: 14, purpose: 'challenge' },

  // Farewell
  { id: 'stitch-cb-fare-1', entitySlug: 'stitch-up-girl', pool: 'farewell', mood: 'pleased', text: 'Stay safe out there! And if anything falls off, bring it back. I can usually reattach it.', weight: 14, purpose: 'ambient' },
  { id: 'stitch-cb-fare-2', entitySlug: 'stitch-up-girl', pool: 'farewell', mood: 'concerned', text: 'Try not to die. Its bad for my patient retention rates.', weight: 13, purpose: 'ambient' },

  // Idle
  { id: 'stitch-cb-idle-1', entitySlug: 'stitch-up-girl', pool: 'idle', mood: 'neutral', text: '*checks surgical kit* These needles will not thread themselves...', weight: 11, purpose: 'ambient' },
];

// ============================================
// BODY COUNT - Silent Assassin Dialogue
// ============================================

export const BODY_COUNT_CHATBASE: ResponseTemplate[] = [
  // Greetings (minimal)
  { id: 'body-cb-greet-1', entitySlug: 'body-count', pool: 'greeting', mood: 'neutral', text: '... You. Again. Still breathing. Noted.', weight: 14, purpose: 'ambient' },
  { id: 'body-cb-greet-2', entitySlug: 'body-count', pool: 'greeting', mood: 'neutral', text: '*marks tally* Another face. Will remember.', weight: 13, purpose: 'ambient' },

  // Hints (deadly warnings)
  { id: 'body-cb-hint-1', entitySlug: 'body-count', pool: 'hint', mood: 'neutral', text: 'Left path: twelve died yesterday. Right path: seven. Choose.', weight: 17, purpose: 'warning' },
  { id: 'body-cb-hint-2', entitySlug: 'body-count', pool: 'hint', mood: 'neutral', text: 'Movement in the shadows. Not me. Worse. Go around.', weight: 16, purpose: 'warning' },
  { id: 'body-cb-hint-3', entitySlug: 'body-count', pool: 'hint', mood: 'cryptic', text: 'The thing ahead does not count bodies. It erases them. I respect efficiency but not that kind.', weight: 18, purpose: 'warning' },

  // Reactions
  { id: 'body-cb-react-1', entitySlug: 'body-count', pool: 'reaction', mood: 'neutral', text: '*marks tally* Clean kill. Efficient. You understand.', weight: 15, purpose: 'ambient' },
  { id: 'body-cb-react-2', entitySlug: 'body-count', pool: 'reaction', mood: 'amused', text: 'Messy. But alive. Sometimes messy works.', weight: 14, purpose: 'ambient' },
  { id: 'body-cb-react-3', entitySlug: 'body-count', pool: 'reaction', mood: 'neutral', text: 'Counted that one. Added to your tally. Its growing.', weight: 13, purpose: 'ambient' },

  // Lore
  { id: 'body-cb-lore-1', entitySlug: 'body-count', pool: 'lore', mood: 'neutral', text: 'Every name I remember. Every face. Counting is how I honor the fallen. And track the risen.', weight: 16, purpose: 'lore' },
  { id: 'body-cb-lore-2', entitySlug: 'body-count', pool: 'lore', mood: 'cryptic', text: 'In Aberrant, silence is survival. I learned to count heartbeats. Mine stopped. Still counting.', weight: 17, purpose: 'lore' },

  // Challenges
  { id: 'body-cb-chal-1', entitySlug: 'body-count', pool: 'challenge', mood: 'neutral', text: 'How many can you eliminate before they hear you? My record stands at twelve. Beat it.', weight: 15, purpose: 'challenge' },
  { id: 'body-cb-chal-2', entitySlug: 'body-count', pool: 'challenge', mood: 'neutral', text: 'Move silently. Kill quickly. Leave nothing. Can you?', weight: 14, purpose: 'challenge' },

  // Threats
  { id: 'body-cb-threat-1', entitySlug: 'body-count', pool: 'threat', mood: 'neutral', text: 'Cross me and your name goes on a different list. The permanent one.', weight: 16, purpose: 'warning' },

  // Farewell
  { id: 'body-cb-fare-1', entitySlug: 'body-count', pool: 'farewell', mood: 'neutral', text: 'Go. Make the count worthwhile.', weight: 12, purpose: 'ambient' },
  { id: 'body-cb-fare-2', entitySlug: 'body-count', pool: 'farewell', mood: 'neutral', text: '... Still alive when we meet next. A request. Not a prediction.', weight: 14, purpose: 'ambient' },

  // Idle
  { id: 'body-cb-idle-1', entitySlug: 'body-count', pool: 'idle', mood: 'neutral', text: '*counting silently* ... forty-seven, forty-eight...', weight: 10, purpose: 'ambient' },
];

// ============================================
// MR. KEVIN - Reality Debugger Dialogue
// ============================================

export const MR_KEVIN_CHATBASE: ResponseTemplate[] = [
  // Greetings (fourth-wall breaking)
  { id: 'kevin-cb-greet-1', entitySlug: 'mr-kevin', pool: 'greeting', mood: 'curious', text: 'Oh hey! Did you notice the texture glitch when you entered? No? Just me then. Anyway, welcome!', weight: 16, purpose: 'ambient' },
  { id: 'kevin-cb-greet-2', entitySlug: 'mr-kevin', pool: 'greeting', mood: 'pleased', text: 'There you are! I was wondering when the game would spawn you in this location. Took longer than usual.', weight: 17, purpose: 'ambient' },
  { id: 'kevin-cb-greet-3', entitySlug: 'mr-kevin', pool: 'greeting', mood: 'curious', text: 'Welcome back! Or is it your first time? Time is weird here. The save files say otherwise but who trusts those?', weight: 15, purpose: 'ambient' },

  // Lore (meta knowledge)
  { id: 'kevin-cb-lore-1', entitySlug: 'mr-kevin', pool: 'lore', mood: 'cryptic', text: 'This world runs on dice and hope. I have seen the code. Hope is a variable. Dice are the only constant.', weight: 18, purpose: 'lore' },
  { id: 'kevin-cb-lore-2', entitySlug: 'mr-kevin', pool: 'lore', mood: 'curious', text: 'Die-rectors think they control the domains. They are just subroutines. The real engine? That is something else entirely.', weight: 17, purpose: 'lore' },
  { id: 'kevin-cb-lore-3', entitySlug: 'mr-kevin', pool: 'lore', mood: 'neutral', text: 'Null Providence is where the bugs congregate. Not insects. Reality bugs. I catalog them. Its a hobby.', weight: 16, purpose: 'lore' },

  // Hints (game tips)
  { id: 'kevin-cb-hint-1', entitySlug: 'mr-kevin', pool: 'hint', mood: 'pleased', text: 'Pro tip: the hitbox on that thing is actually smaller than it looks. Aim for the left pixel cluster.', weight: 15, purpose: 'warning' },
  { id: 'kevin-cb-hint-2', entitySlug: 'mr-kevin', pool: 'hint', mood: 'curious', text: 'There is a softlock in that room if you roll three ones in a row. I reported it. Still not fixed.', weight: 16, purpose: 'warning' },
  { id: 'kevin-cb-hint-3', entitySlug: 'mr-kevin', pool: 'hint', mood: 'neutral', text: 'The RNG seed for this run is... actually, I should not tell you that. Forget I mentioned it.', weight: 14, purpose: 'warning' },

  // Reactions
  { id: 'kevin-cb-react-1', entitySlug: 'mr-kevin', pool: 'reaction', mood: 'pleased', text: 'Nice! That interaction triggered exactly as intended. The developers would be proud. If they existed.', weight: 15, purpose: 'ambient' },
  { id: 'kevin-cb-react-2', entitySlug: 'mr-kevin', pool: 'reaction', mood: 'curious', text: 'Huh. That outcome was not in the probability table. Either you broke something or... no, you definitely broke something.', weight: 16, purpose: 'ambient' },
  { id: 'kevin-cb-react-3', entitySlug: 'mr-kevin', pool: 'reaction', mood: 'amused', text: 'Did you see the frame rate drop there? Just me? The void gets laggy when you roll that high.', weight: 14, purpose: 'ambient' },

  // Challenges
  { id: 'kevin-cb-chal-1', entitySlug: 'mr-kevin', pool: 'challenge', mood: 'curious', text: 'Want to see something weird? Try rolling while walking backwards. The collision detection does interesting things.', weight: 15, purpose: 'challenge' },
  { id: 'kevin-cb-chal-2', entitySlug: 'mr-kevin', pool: 'challenge', mood: 'pleased', text: 'I bet you cannot beat this room without taking damage. Actually, I know the odds. They are not great. Try anyway!', weight: 14, purpose: 'challenge' },

  // Farewell
  { id: 'kevin-cb-fare-1', entitySlug: 'mr-kevin', pool: 'farewell', mood: 'pleased', text: 'Good luck out there! Remember: nothing is random, everything is calculated, and the dice are lying to you!', weight: 14, purpose: 'ambient' },
  { id: 'kevin-cb-fare-2', entitySlug: 'mr-kevin', pool: 'farewell', mood: 'curious', text: 'See you in the next scene! Or the previous one. Time is just a variable here.', weight: 13, purpose: 'ambient' },

  // Idle
  { id: 'kevin-cb-idle-1', entitySlug: 'mr-kevin', pool: 'idle', mood: 'curious', text: '*staring at nothing* There is a seam in reality right here. Can you see it? No? Probably better that way.', weight: 12, purpose: 'ambient' },
];

// ============================================
// THE GENERAL (TRAVELER) - Undead Strategist
// ============================================

export const THE_GENERAL_TRAVELER_CHATBASE: ResponseTemplate[] = [
  // Greetings
  { id: 'gen-trav-cb-greet-1', entitySlug: 'the-general-traveler', pool: 'greeting', mood: 'neutral', text: 'Soldier. Status report. How many times have you died since we last spoke?', weight: 15, purpose: 'ambient' },
  { id: 'gen-trav-cb-greet-2', entitySlug: 'the-general-traveler', pool: 'greeting', mood: 'neutral', text: 'At ease. We have tactical matters to discuss. Your current approach lacks discipline.', weight: 14, purpose: 'ambient' },

  // Hints (tactical advice)
  { id: 'gen-trav-cb-hint-1', entitySlug: 'the-general-traveler', pool: 'hint', mood: 'neutral', text: 'Reconnaissance indicates heavy resistance ahead. Flank left. They never guard the left.', weight: 17, purpose: 'warning' },
  { id: 'gen-trav-cb-hint-2', entitySlug: 'the-general-traveler', pool: 'hint', mood: 'neutral', text: 'The enemy has fortified that position. A direct assault would be... inadvisable. Find another approach.', weight: 16, purpose: 'warning' },
  { id: 'gen-trav-cb-hint-3', entitySlug: 'the-general-traveler', pool: 'hint', mood: 'focused', text: 'Intel suggests a weakness in their formation. Strike at the third throw. Not before. Not after.', weight: 15, purpose: 'warning' },

  // Lore
  { id: 'gen-trav-cb-lore-1', entitySlug: 'the-general-traveler', pool: 'lore', mood: 'neutral', text: 'I have commanded seventeen campaigns across three domains. Died in all of them. Still fighting.', weight: 16, purpose: 'lore' },
  { id: 'gen-trav-cb-lore-2', entitySlug: 'the-general-traveler', pool: 'lore', mood: 'cryptic', text: 'Death is not defeat. Defeat is forgetting why you fought. I remember every battle. Every loss.', weight: 17, purpose: 'lore' },

  // Challenges
  { id: 'gen-trav-cb-chal-1', entitySlug: 'the-general-traveler', pool: 'challenge', mood: 'neutral', text: 'Consider this a field exercise. Show me what you have learned. Disappoint me at your peril.', weight: 15, purpose: 'challenge' },
  { id: 'gen-trav-cb-chal-2', entitySlug: 'the-general-traveler', pool: 'challenge', mood: 'focused', text: 'A true soldier adapts. The dice change. The enemy changes. Only your resolve must remain constant.', weight: 16, purpose: 'challenge' },

  // Reactions
  { id: 'gen-trav-cb-react-1', entitySlug: 'the-general-traveler', pool: 'reaction', mood: 'pleased', text: 'Acceptable performance. You followed orders. Stayed disciplined. There may be hope for you yet.', weight: 15, purpose: 'ambient' },
  { id: 'gen-trav-cb-react-2', entitySlug: 'the-general-traveler', pool: 'reaction', mood: 'neutral', text: 'Sloppy execution but effective results. We will work on technique later. For now, it will do.', weight: 14, purpose: 'ambient' },

  // Farewell
  { id: 'gen-trav-cb-fare-1', entitySlug: 'the-general-traveler', pool: 'farewell', mood: 'neutral', text: 'Dismissed. Stay sharp out there. The battlefield does not forgive hesitation.', weight: 13, purpose: 'ambient' },
  { id: 'gen-trav-cb-fare-2', entitySlug: 'the-general-traveler', pool: 'farewell', mood: 'neutral', text: 'Move out. And try not to die. It is bad for unit morale.', weight: 12, purpose: 'ambient' },
];

// ============================================
// THE GENERAL (WANDERER) - Military Quartermaster
// ============================================

export const THE_GENERAL_WANDERER_CHATBASE: ResponseTemplate[] = [
  // Greetings
  { id: 'gen-wand-cb-greet-1', entitySlug: 'the-general-wanderer', pool: 'greeting', mood: 'neutral', text: 'Welcome to Command and Supply. State your requirements. I do not have time for small talk.', weight: 15, purpose: 'ambient' },
  { id: 'gen-wand-cb-greet-2', entitySlug: 'the-general-wanderer', pool: 'greeting', mood: 'neutral', text: 'Civilian or soldier? Either way, my equipment does not discriminate. Gold speaks all languages.', weight: 14, purpose: 'ambient' },

  // Sales Pitch
  { id: 'gen-wand-cb-sales-1', entitySlug: 'the-general-wanderer', pool: 'salesPitch', mood: 'neutral', text: 'Standard issue equipment. Battle-tested. Die-rector approved. What the military uses, you can too.', weight: 16, purpose: 'ambient' },
  { id: 'gen-wand-cb-sales-2', entitySlug: 'the-general-wanderer', pool: 'salesPitch', mood: 'neutral', text: 'This gear has seen seventeen campaigns. It outlasted every soldier who carried it. Consider that a selling point.', weight: 17, purpose: 'ambient' },

  // Hints
  { id: 'gen-wand-cb-hint-1', entitySlug: 'the-general-wanderer', pool: 'hint', mood: 'neutral', text: 'Word of advice: that domain ahead requires sustained firepower. Stock up. You will need every advantage.', weight: 15, purpose: 'warning' },
  { id: 'gen-wand-cb-hint-2', entitySlug: 'the-general-wanderer', pool: 'hint', mood: 'neutral', text: 'Intelligence reports increased hostile activity. Travel light but carry heavy. Contradiction? No. Strategy.', weight: 16, purpose: 'warning' },

  // Lore
  { id: 'gen-wand-cb-lore-1', entitySlug: 'the-general-wanderer', pool: 'lore', mood: 'neutral', text: 'I supply both sides of every conflict. War is business. Business is eternal. Just like the Die-rectors want.', weight: 16, purpose: 'lore' },

  // Challenges
  { id: 'gen-wand-cb-chal-1', entitySlug: 'the-general-wanderer', pool: 'challenge', mood: 'neutral', text: 'Prove you can handle this equipment. A demonstration of competence is required before purchase.', weight: 14, purpose: 'challenge' },

  // Reactions
  { id: 'gen-wand-cb-react-1', entitySlug: 'the-general-wanderer', pool: 'reaction', mood: 'pleased', text: 'Effective deployment. You understand how to use what I sell. Come back when you need resupply.', weight: 15, purpose: 'ambient' },
  { id: 'gen-wand-cb-react-2', entitySlug: 'the-general-wanderer', pool: 'reaction', mood: 'neutral', text: 'Acceptable results. Equipment performed as designed. User error was minimal.', weight: 14, purpose: 'ambient' },

  // Farewell
  { id: 'gen-wand-cb-fare-1', entitySlug: 'the-general-wanderer', pool: 'farewell', mood: 'neutral', text: 'Transaction complete. Return when you need more supplies. Or when someone else does not need theirs.', weight: 13, purpose: 'ambient' },
];

// ============================================
// KING JAMES - Void Merchant King Dialogue
// ============================================

export const KING_JAMES_CHATBASE: ResponseTemplate[] = [
  // Greetings
  { id: 'king-cb-greet-1', entitySlug: 'king-james', pool: 'greeting', mood: 'neutral', text: 'You stand before the Null Throne. Act accordingly. Peasants kneel. Customers may stand.', weight: 16, purpose: 'ambient' },
  { id: 'king-cb-greet-2', entitySlug: 'king-james', pool: 'greeting', mood: 'pleased', text: 'Ah, a familiar subject returns to court. The void remembers you. I choose to as well.', weight: 15, purpose: 'ambient' },

  // Sales Pitch
  { id: 'king-cb-sales-1', entitySlug: 'king-james', pool: 'salesPitch', mood: 'neutral', text: 'The Null Throne Emporium offers items of questionable existence. The uncertainty is half the value.', weight: 17, purpose: 'ambient' },
  { id: 'king-cb-sales-2', entitySlug: 'king-james', pool: 'salesPitch', mood: 'pleased', text: 'For a price, I can sell you something that may or may not be real. Schrodinger would be jealous.', weight: 16, purpose: 'ambient' },
  { id: 'king-cb-sales-3', entitySlug: 'king-james', pool: 'salesPitch', mood: 'neutral', text: 'Royal merchandise. Each item touched by the void itself. Side effects include existential dread. Worth it.', weight: 15, purpose: 'ambient' },

  // Lore
  { id: 'king-cb-lore-1', entitySlug: 'king-james', pool: 'lore', mood: 'cryptic', text: 'I have ruled nothing for eons. You would be surprised how demanding nothing can be. It wants everything.', weight: 17, purpose: 'lore' },
  { id: 'king-cb-lore-2', entitySlug: 'king-james', pool: 'lore', mood: 'neutral', text: 'The void is not emptiness. It is potential. Royal potential. I merely give it form and a price tag.', weight: 16, purpose: 'lore' },

  // Hints
  { id: 'king-cb-hint-1', entitySlug: 'king-james', pool: 'hint', mood: 'neutral', text: 'Royal advisement: Null Providence rewards those who embrace uncertainty. Certainty is for lesser realms.', weight: 15, purpose: 'warning' },
  { id: 'king-cb-hint-2', entitySlug: 'king-james', pool: 'hint', mood: 'cryptic', text: 'The path ahead flickers between existing and not. Walk it confidently. Hesitation makes it choose not.', weight: 16, purpose: 'warning' },

  // Reactions
  { id: 'king-cb-react-1', entitySlug: 'king-james', pool: 'reaction', mood: 'pleased', text: 'A worthy observation. For a commoner. The Null Throne acknowledges your insight. This is a great honor.', weight: 15, purpose: 'ambient' },
  { id: 'king-cb-react-2', entitySlug: 'king-james', pool: 'reaction', mood: 'amused', text: 'Even peasants occasionally stumble upon wisdom. You have stumbled more gracefully than most.', weight: 14, purpose: 'ambient' },

  // Challenges
  { id: 'king-cb-chal-1', entitySlug: 'king-james', pool: 'challenge', mood: 'neutral', text: 'Prove your worth to the crown. Impress me. If you can. Many have tried. The void ate most of them.', weight: 15, purpose: 'challenge' },
  { id: 'king-cb-chal-2', entitySlug: 'king-james', pool: 'challenge', mood: 'amused', text: 'A royal wager? How quaint. Very well. I accept. The void will witness our contest.', weight: 16, purpose: 'challenge' },

  // Farewell
  { id: 'king-cb-fare-1', entitySlug: 'king-james', pool: 'farewell', mood: 'neutral', text: 'You are dismissed. The audience is concluded. Go with the voids blessing. It is worth exactly as much as youd expect.', weight: 13, purpose: 'ambient' },
  { id: 'king-cb-fare-2', entitySlug: 'king-james', pool: 'farewell', mood: 'pleased', text: 'Return when you have more gold. Or more interesting problems. The crown appreciates both equally.', weight: 14, purpose: 'ambient' },

  // Threats
  { id: 'king-cb-threat-1', entitySlug: 'king-james', pool: 'threat', mood: 'neutral', text: 'Disrespect the crown and the void will have words with you. The void does not use words gently.', weight: 16, purpose: 'warning' },
];

// ============================================
// EXPANDED WANDERER/TRAVELER CHATTER
// ============================================

export const EXPANDED_CHATTER: ResponseTemplate[] = [
  // Willy One Eye - expanded
  { id: 'willy-cb-hint-1', entitySlug: 'willy', pool: 'hint', mood: 'pleased', text: 'Psst! Between you and me, that item over there? Cursed. But like, fun cursed. Probably.', weight: 14, purpose: 'warning' },
  { id: 'willy-cb-lore-1', entitySlug: 'willy', pool: 'lore', mood: 'pleased', text: 'Lost my eye in a deal gone wrong. Gained dimensional sight in return. Fair trade? You tell me.', weight: 15, purpose: 'lore' },
  { id: 'willy-cb-fare-1', entitySlug: 'willy', pool: 'farewell', mood: 'pleased', text: 'Come back soon! I get new stock every time reality hiccups! Which is often!', weight: 13, purpose: 'ambient' },

  // Boots - expanded
  { id: 'boots-cb-greet-1', entitySlug: 'boots', pool: 'greeting', mood: 'pleased', text: '*stretches* Oh, you again. Good. I was getting bored. Entertain me.', weight: 14, purpose: 'ambient' },
  { id: 'boots-cb-lore-1', entitySlug: 'boots', pool: 'lore', mood: 'cryptic', text: 'I have seen things that would break mortal minds. Also, I knocked a cup off a table yesterday. Priorities.', weight: 16, purpose: 'lore' },
  { id: 'boots-cb-fare-1', entitySlug: 'boots', pool: 'farewell', mood: 'pleased', text: '*yawns* Go do your adventure thing. I will be here. Watching. Always watching. Mostly napping.', weight: 13, purpose: 'ambient' },

  // X-treme - expanded
  { id: 'xtreme-cb-hint-1', entitySlug: 'xtreme', pool: 'hint', mood: 'amused', text: 'YO! That path is DANGEROUS! Which means you should TOTALLY take it! EXTREME!', weight: 15, purpose: 'warning' },
  { id: 'xtreme-cb-lore-1', entitySlug: 'xtreme', pool: 'lore', mood: 'amused', text: 'Before I was EXTREME, I was just treme. The X came from a bet I definitely won. DEFINITELY.', weight: 14, purpose: 'lore' },
  { id: 'xtreme-cb-fare-1', entitySlug: 'xtreme', pool: 'farewell', mood: 'amused', text: 'LATER! Stay EXTREME! Remember: if you are not LIVING EXTREME, are you even LIVING?!', weight: 14, purpose: 'ambient' },
  { id: 'xtreme-cb-chal-1', entitySlug: 'xtreme', pool: 'challenge', mood: 'pleased', text: 'BET YOU CANT BEAT MY HIGH SCORE! Its like, a million! Or seven! MATH IS EXTREME!', weight: 15, purpose: 'challenge' },

  // Boo-G - expanded
  { id: 'boog-cb-hint-1', entitySlug: 'boo-g', pool: 'hint', mood: 'amused', text: 'Yo heads up, there is a vibe check ahead. Bad vibes. Ghost-eating vibes. Avoid if you like existing.', weight: 15, purpose: 'warning' },
  { id: 'boog-cb-lore-1', entitySlug: 'boo-g', pool: 'lore', mood: 'amused', text: 'Being dead is not so bad. No bills. No sleep needed. Infinite time for sick beats. The afterlife slaps.', weight: 15, purpose: 'lore' },
  { id: 'boog-cb-fare-1', entitySlug: 'boo-g', pool: 'farewell', mood: 'amused', text: 'Peace out! Or is it pieces out? Ghost humor! BOO! Okay I am done. For now.', weight: 13, purpose: 'ambient' },
  { id: 'boog-cb-chal-1', entitySlug: 'boo-g', pool: 'challenge', mood: 'pleased', text: 'Freestyle dice battle! You roll, I drop bars! Lets see who has better flow! LETS GO!', weight: 15, purpose: 'challenge' },

  // Detective Clausen - expanded
  { id: 'clausen-cb-greet-1', entitySlug: 'clausen', pool: 'greeting', mood: 'neutral', text: '*lights cigarette* Another case walks through the door. What is it this time?', weight: 14, purpose: 'ambient' },
  { id: 'clausen-cb-hint-1', entitySlug: 'clausen', pool: 'hint', mood: 'neutral', text: 'My gut says something is wrong ahead. My gut is never wrong. Well, once. I do not talk about that.', weight: 15, purpose: 'warning' },
  { id: 'clausen-cb-lore-1', entitySlug: 'clausen', pool: 'lore', mood: 'neutral', text: 'Infernus burned me. Literally. But the fire gave me clarity. I see the truth now. All of it.', weight: 16, purpose: 'lore' },
  { id: 'clausen-cb-fare-1', entitySlug: 'clausen', pool: 'farewell', mood: 'neutral', text: 'Watch your back. In my experience, backs are always the first thing they aim for.', weight: 13, purpose: 'ambient' },

  // Keith Man - expanded
  { id: 'keith-cb-greet-1', entitySlug: 'keith-man', pool: 'greeting', mood: 'cryptic', text: '... You are early. Or late. Time is optional here. Welcome regardless.', weight: 14, purpose: 'ambient' },
  { id: 'keith-cb-lore-1', entitySlug: 'keith-man', pool: 'lore', mood: 'cryptic', text: 'Frost Reach taught me patience. When time freezes, you learn to see between the moments.', weight: 16, purpose: 'lore' },
  { id: 'keith-cb-fare-1', entitySlug: 'keith-man', pool: 'farewell', mood: 'cryptic', text: '... Until next time. Which may be now. Or already. Time is a circle here.', weight: 13, purpose: 'ambient' },

  // Mr. Bones - expanded
  { id: 'bones-cb-greet-1', entitySlug: 'mr-bones', pool: 'greeting', mood: 'neutral', text: 'Ah, still alive I see. The ledger notes your persistence. Unusual. Refreshing.', weight: 14, purpose: 'ambient' },
  { id: 'bones-cb-lore-1', entitySlug: 'mr-bones', pool: 'lore', mood: 'cryptic', text: 'I account for every soul. Even mine. Especially mine. The math gets complicated when you are your own client.', weight: 17, purpose: 'lore' },
  { id: 'bones-cb-hint-1', entitySlug: 'mr-bones', pool: 'hint', mood: 'neutral', text: 'Pro tip from the afterlife: dying is easy. Staying dead? Now that requires real commitment.', weight: 14, purpose: 'warning' },
  { id: 'bones-cb-fare-1', entitySlug: 'mr-bones', pool: 'farewell', mood: 'neutral', text: 'Until we meet again. Which we will. Everyone meets me eventually. Professional courtesy.', weight: 13, purpose: 'ambient' },

  // Dr. Maxwell - expanded
  { id: 'maxwell-cb-hint-1', entitySlug: 'dr-maxwell', pool: 'hint', mood: 'pleased', text: 'STATISTICALLY speaking, that path leads to fire! But SCIENTIFICALLY speaking, fire is just rapid oxidation! Go learn!', weight: 15, purpose: 'warning' },
  { id: 'maxwell-cb-lore-1', entitySlug: 'dr-maxwell', pool: 'lore', mood: 'curious', text: 'The Die-rectors are FASCINATING specimens! I have tried to study them! They did not appreciate my methods!', weight: 16, purpose: 'lore' },
  { id: 'maxwell-cb-fare-1', entitySlug: 'dr-maxwell', pool: 'farewell', mood: 'pleased', text: 'Go! DISCOVER! And if you find any interesting anomalies, bring me SAMPLES! Safety gear optional!', weight: 14, purpose: 'ambient' },
  { id: 'maxwell-cb-chal-1', entitySlug: 'dr-maxwell', pool: 'challenge', mood: 'curious', text: 'QUICK! What is the probability of rolling snake eyes while standing on one foot? I need DATA!', weight: 15, purpose: 'challenge' },

  // Dr. Voss - expanded
  { id: 'voss-cb-greet-1', entitySlug: 'dr-voss', pool: 'greeting', mood: 'neutral', text: 'Subject returns for further observation. Noted. Your psychological profile grows more... complex.', weight: 14, purpose: 'ambient' },
  { id: 'voss-cb-lore-1', entitySlug: 'dr-voss', pool: 'lore', mood: 'neutral', text: 'The void is not empty. It is full of potential that refuses to collapse into reality. I study what refuses.', weight: 16, purpose: 'lore' },
  { id: 'voss-cb-fare-1', entitySlug: 'dr-voss', pool: 'farewell', mood: 'neutral', text: 'Session concluded. Your data has been recorded. Return when you exhibit more interesting behaviors.', weight: 13, purpose: 'ambient' },
];

// ============================================
// CONTEXT-AWARE TEMPLATES (use dynamic variables)
// ============================================

export const CONTEXT_AWARE_TEMPLATES: ResponseTemplate[] = [
  // Die-rector tension based on score progress
  { id: 'alice-ctx-tension-1', entitySlug: 'alice', pool: 'challenge', mood: 'cryptic', text: '{{scoreProgress}} of the way there with {{turnsLeft}} throws remaining. The ice does not forgive those who fail.', weight: 16, purpose: 'challenge' },
  { id: 'john-ctx-gap-1', entitySlug: 'john', pool: 'threat', mood: 'annoyed', text: 'Still {{scoreGap}} points behind schedule. Your efficiency rating is catastrophically suboptimal.', weight: 17, purpose: 'warning' },
  { id: 'robert-ctx-fire-1', entitySlug: 'robert', pool: 'challenge', mood: 'threatening', text: '{{turnsLeft}} throws left. {{scoreGap}} points to go. The flames grow impatient.', weight: 16, purpose: 'challenge' },
  { id: 'peter-ctx-death-1', entitySlug: 'peter', pool: 'threat', mood: 'cryptic', text: 'You need {{scoreGap}} more points. Death waits with open arms if you fail.', weight: 17, purpose: 'warning' },

  // Dice roll commentary
  { id: 'maxwell-ctx-dice-1', entitySlug: 'dr-maxwell', pool: 'reaction', mood: 'curious', text: 'FASCINATING! You rolled {{lastRoll}} using {{diceUsed}}! The probability was... IRRELEVANT! DO IT AGAIN!', weight: 16, purpose: 'ambient' },
  { id: 'xtreme-ctx-dice-1', entitySlug: 'xtreme', pool: 'reaction', mood: 'amused', text: '{{lastRoll}} POINTS! ON A {{primaryDie}}! THAT WAS EXTREME!', weight: 17, purpose: 'ambient' },
  { id: 'zero-ctx-dice-1', entitySlug: 'zero-chance', pool: 'reaction', mood: 'cryptic', text: '{{lastRoll}} on {{diceCount}} dice. The probability of that exact outcome? Irrelevant. You rolled it anyway.', weight: 16, purpose: 'ambient' },
  { id: 'boog-ctx-dice-1', entitySlug: 'boo-g', pool: 'reaction', mood: 'amused', text: 'YO! {{lastRoll}} points! That {{primaryDie}} is FIRE! Keep that energy!', weight: 15, purpose: 'ambient' },

  // Momentum-based reactions
  { id: 'stitch-ctx-momentum-1', entitySlug: 'stitch-up-girl', pool: 'reaction', mood: 'pleased', text: 'You are {{momentum}} right now. Keep that pace and you might just survive this.', weight: 15, purpose: 'ambient' },
  { id: 'willy-ctx-momentum-1', entitySlug: 'willy', pool: 'reaction', mood: 'pleased', text: 'Looking {{momentum}} out there! At this rate, you might have gold left over for my shop!', weight: 14, purpose: 'ambient' },
  { id: 'bones-ctx-momentum-1', entitySlug: 'mr-bones', pool: 'reaction', mood: 'neutral', text: 'The ledger shows you are {{momentum}}. Interesting. I have not updated your death certificate yet.', weight: 15, purpose: 'ambient' },

  // Domain progress commentary
  { id: 'willy-ctx-progress-1', entitySlug: 'willy', pool: 'hint', mood: 'pleased', text: '{{zonesCleared}} of {{totalZones}} zones cleared in {{domainName}}! Almost to the shop! I have deals waiting!', weight: 14, purpose: 'ambient' },
  { id: 'gen-trav-ctx-progress-1', entitySlug: 'the-general-traveler', pool: 'hint', mood: 'neutral', text: 'Status: {{zonesCleared}} of {{totalZones}} objectives complete in {{domainName}}. Maintain discipline.', weight: 14, purpose: 'ambient' },
  { id: 'clausen-ctx-progress-1', entitySlug: 'clausen', pool: 'hint', mood: 'neutral', text: '{{zonesCleared}} down, {{totalZones}} total in {{domainName}}. I have seen this case before. Usually ends poorly.', weight: 14, purpose: 'warning' },

  // Score-based Die-rector taunts
  { id: 'jane-ctx-score-1', entitySlug: 'jane', pool: 'reaction', mood: 'amused', text: '{{playerScore}} points so far. You need {{targetScore}}. The chaos finds your struggle... entertaining.', weight: 16, purpose: 'ambient' },
  { id: 'the-one-ctx-score-1', entitySlug: 'the-one', pool: 'challenge', mood: 'cryptic', text: '{{scoreProgress}} complete. The void measures your progress. It remains... unimpressed.', weight: 17, purpose: 'challenge' },

  // Event variant commentary
  { id: 'kevin-ctx-variant-1', entitySlug: 'mr-kevin', pool: 'hint', mood: 'curious', text: 'This is a {{eventVariant}} event. The difficulty modifier is different here. The code does not lie.', weight: 14, purpose: 'warning' },
  { id: 'body-ctx-variant-1', entitySlug: 'body-count', pool: 'hint', mood: 'neutral', text: '{{eventVariant}} difficulty. Survival rate drops. Adjust accordingly.', weight: 15, purpose: 'warning' },
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
  ...ZERO_CHANCE_CHATBASE,
  ...ALIEN_BABY_CHATBASE,
  ...STITCH_UP_GIRL_CHATBASE,
  ...BODY_COUNT_CHATBASE,
  ...MR_KEVIN_CHATBASE,
  ...THE_GENERAL_TRAVELER_CHATBASE,
  ...THE_GENERAL_WANDERER_CHATBASE,
  ...KING_JAMES_CHATBASE,
  ...CHATTER_EXTRACTED,
  ...EXPANDED_CHATTER,
  ...CONTEXT_AWARE_TEMPLATES,
];

// Total chatbase-extracted templates: ~270+ (all player-directed, 20 context-aware)
