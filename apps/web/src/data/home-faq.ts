/**
 * FAQ System for Homepage Chat
 *
 * Predefined questions with NPC-personalized responses.
 * Used when API is unavailable - shows as autocomplete chips.
 *
 * NEVER DIE GUY
 */

export interface FaqQuestion {
  id: string;
  question: string;
  category: 'mechanics' | 'lore' | 'meta';
  // Generic response used if NPC doesn't have a custom one
  defaultResponse: string;
  // Optional NPC-specific responses (keyed by NPC id)
  npcResponses?: Record<string, string>;
}

export const FAQ_QUESTIONS: FaqQuestion[] = [
  // ===================
  // GAME MECHANICS
  // ===================
  {
    id: 'how-to-play',
    question: 'How do I play?',
    category: 'mechanics',
    defaultResponse: 'Throw dice at the sphere. Higher rolls deal more damage. Clear rooms, defeat guardians, survive.',
    npcResponses: {
      'stitch-up-girl': 'Throw dice, take damage, come see me for stitches. It is a beautiful cycle.',
      'keith-man': 'Dude it is SO simple! Throw dice, watch numbers go BRRR, try not to die! Easy!',
      'mr-bones': 'You throw. You score. You die. You return. Rinse and repeat, flesh-bearer.',
      'boots': 'THROW THE DICE! HIT THE THING! GET TREATS! I mean points! POINTS!',
      'xtreme': 'Chuck dice, shred the sphere, rack up SICK scores! It is basically skateboarding but cosmic!',
    },
  },
  {
    id: 'what-are-dice',
    question: 'How do the dice work?',
    category: 'mechanics',
    defaultResponse: 'Different dice have different power. d4 is weak, d20 is mighty. Build your hand wisely.',
    npcResponses: {
      'dr-maxwell': 'FASCINATING question! Each die type has a maximum value correlating to damage potential! The d20 is SCIENTIFICALLY superior!',
      'mr-kevin': 'Probability distributions, my dear fellow. The d20 offers superior expected value, though variance is considerable.',
      'body-count': 'Bigger dice, bigger numbers, bigger body count. Simple math.',
      'the-general': 'Your dice are your ammunition, soldier! d4s are sidearms, d20s are artillery!',
    },
  },
  {
    id: 'what-are-domains',
    question: 'What are the domains?',
    category: 'mechanics',
    defaultResponse: 'Six realms to conquer. Each has unique enemies, guardians, and challenges. Choose your path.',
    npcResponses: {
      'willy': 'Six territories, each meaner than the last. I have wandered them all. Some are... unpleasant.',
      'king-james': 'Domains are the territories of power! Earth, Frost Reach, Volcano, and more! All should bow to proper royalty!',
      'dr-voss': 'Distinct biomes with unique threat profiles. I have extensive notes. You may not see them.',
    },
  },
  {
    id: 'what-are-guardians',
    question: 'Who are the guardians?',
    category: 'mechanics',
    defaultResponse: 'Powerful beings at the end of each domain. Defeat them to progress. They do not go quietly.',
    npcResponses: {
      'stitch-up-girl': 'Big meanies who guard each domain. I have patched up many who underestimated them.',
      'the-general': 'High-value targets! Each domain has one! Requires tactical precision to neutralize!',
      'boo-g': 'The final bosses, yo! Big bads with big health bars! Gotta bring your A-game!',
    },
  },
  {
    id: 'what-is-score',
    question: 'How does scoring work?',
    category: 'mechanics',
    defaultResponse: 'Roll values become damage. Bonuses stack and multiply. Watch the numbers climb.',
    npcResponses: {
      'body-count': 'Damage dealt equals points earned. More carnage, higher score. I keep meticulous records.',
      'keith-man': 'Bro the COMBOS! Stack those bonuses! Watch the multipliers GO! It is INSANE!',
      'clausen': 'CALCULATION: Base roll plus modifiers times multipliers equals final damage value. Efficient.',
    },
  },

  // ===================
  // LORE
  // ===================
  {
    id: 'who-are-you',
    question: 'Who are you?',
    category: 'lore',
    defaultResponse: 'I am but one soul in this realm. We all have our roles to play.',
    npcResponses: {
      'stitch-up-girl': 'Stitch Up Girl, field medic and family member of someone who cannot die. Pleasure to meet you.',
      'mr-bones': 'I am Mr. Bones. I have been here longer than memory. I will be here after you are dust.',
      'keith-man': 'Keith-Man! Energy drink enthusiast! Hype machine! Your BIGGEST fan probably!',
      'boots': 'I am BOOTS! I am a GOOD DOG! I like TREATS and FRIENDS and YOU!',
      'boo-g': 'Boo-G, the spectral MC! Died once, never stopped spitting bars! Stuck between worlds but vibing!',
      'king-james': 'I am King James, rightful ruler of... well, it is complicated. But I AM royalty!',
      'dr-maxwell': 'Dr. Maxwell! Scientist extraordinaire! I study EVERYTHING! Especially things that explode!',
      'willy': 'Name is Willy. I wander. I watch. I occasionally help. Do not expect much.',
      'the-general': 'The General! Military strategist! I have seen things you would not believe!',
      'clausen': 'I am CLAUSEN. Cybernetic. Analytical. Here to assist. Mostly.',
      'mr-kevin': 'Mr. Kevin. Scholar. Observer. I find patterns where others see chaos.',
      'dr-voss': 'Dr. Voss. Researcher. My work is... sensitive. That is all you need to know.',
      'xtreme': 'XTREME! Adrenaline junkie! Thrill seeker! Life is a half-pipe and I am SHREDDING it!',
      'body-count': 'Body Count. I tally the fallen. It is important work. Someone has to remember.',
    },
  },
  {
    id: 'what-is-this-place',
    question: 'What is this place?',
    category: 'lore',
    defaultResponse: 'The space between lives. Some call it purgatory. Others call it home.',
    npcResponses: {
      'mr-bones': 'This is the in-between. Where souls linger before moving on. Or not.',
      'boo-g': 'The cosmic waiting room, fam! Where the dead chill before the next gig!',
      'dr-voss': 'A liminal space between states of existence. Scientifically speaking, it should not exist.',
      'mr-kevin': 'A nexus point. Where probability collapses and reform occurs. Quite fascinating, actually.',
    },
  },
  {
    id: 'who-is-pantheon',
    question: 'Who are the Pantheon?',
    category: 'lore',
    defaultResponse: 'The ruling powers. They judge. They decide. Best not to anger them.',
    npcResponses: {
      'mr-bones': 'The old ones. They were here before. They will be here after. Tread carefully.',
      'the-general': 'High command! The ultimate authority! Even I answer to them! Reluctantly!',
      'dr-voss': 'Beings of immense power. My research into them has been... inconclusive. And dangerous.',
      'king-james': 'Pretenders to TRUE power! But... formidable pretenders. I choose my battles.',
    },
  },
  {
    id: 'who-am-i',
    question: 'Who am I?',
    category: 'lore',
    defaultResponse: 'You are the Guy. One of many. Each run, a new incarnation.',
    npcResponses: {
      'stitch-up-girl': 'You are my favorite patient! Or at least, this version of you is. For now.',
      'mr-bones': 'You are a Guy. THE Guy? A Guy. It does not matter. You will return regardless.',
      'body-count': 'You are entry number... *checks notes* ...a lot. Welcome to the count.',
      'boots': 'You are my FRIEND! The best friend! Until you die! Then NEW best friend!',
    },
  },
  {
    id: 'why-cant-i-die',
    question: 'Why do I keep coming back?',
    category: 'lore',
    defaultResponse: 'Death is not the end here. It is a transition. The cycle continues.',
    npcResponses: {
      'mr-bones': 'Because that is the nature of this place. We are all trapped in the loop. Some more than others.',
      'stitch-up-girl': 'Family trait! My relative cannot die either. It is... complicated.',
      'dr-maxwell': 'RESURRECTION MECHANICS! Absolutely fascinating! The energy transfer alone is REMARKABLE!',
      'boo-g': 'Death is just a remix, fam! Same soul, new track! Keep the beat going!',
    },
  },

  // ===================
  // META / HELPFUL
  // ===================
  {
    id: 'where-start',
    question: 'Where should I start?',
    category: 'meta',
    defaultResponse: 'Click Play above. Choose a domain. Begin your run. Good luck.',
    npcResponses: {
      'stitch-up-girl': 'Hit Play, pick a domain, try not to need stitches too quickly. I believe in you!',
      'keith-man': 'PLAY BUTTON! RIGHT THERE! Hit it! GO GO GO!',
      'boots': 'CLICK THE PLAY! GO ON ADVENTURE! I will wait here! EXCITEDLY!',
      'the-general': 'Initiate via the Play button, soldier! Select your theater of operations! MOVE OUT!',
    },
  },
  {
    id: 'what-is-wiki',
    question: 'What is the wiki for?',
    category: 'meta',
    defaultResponse: 'The wiki holds all knowledge. Characters, domains, mechanics. Everything you need.',
    npcResponses: {
      'dr-maxwell': 'The REPOSITORY of all KNOWLEDGE! I contributed several entries! The ones about explosions!',
      'mr-kevin': 'A comprehensive database. I recommend thorough study before engaging in combat.',
      'clausen': 'INFORMATION DATABASE. Contains character profiles, domain data, strategic intelligence. Useful.',
    },
  },
  {
    id: 'any-tips',
    question: 'Any tips for a new player?',
    category: 'meta',
    defaultResponse: 'Start slow. Learn the patterns. Save your big dice for when it counts.',
    npcResponses: {
      'stitch-up-girl': 'Dodge more than you think you need to. I see a LOT of overconfident Guys.',
      'willy': 'Do not get greedy. Do not get cocky. Do not trust anything that smiles too much.',
      'the-general': 'Observe! Adapt! Overcome! And ALWAYS have an exit strategy!',
      'body-count': 'Everyone dies. The question is how many you take with you first.',
      'xtreme': 'GO BIG OR GO HOME! Actually wait, pace yourself. Then GO BIG!',
      'boots': 'BE BRAVE! BUT ALSO CAREFUL! BUT MOSTLY BRAVE! And pet dogs when you see them!',
    },
  },
  {
    id: 'goodbye',
    question: 'Goodbye!',
    category: 'meta',
    defaultResponse: 'Until next time. May your dice roll true.',
    npcResponses: {
      'stitch-up-girl': 'Try not to need me too soon! But I will be here when you do!',
      'mr-bones': 'Farewell. For now. We will meet again. We always do.',
      'keith-man': 'LATER DUDE! Go CRUSH it out there! WOOO!',
      'boots': 'BYE FRIEND! COME BACK SOON! I will miss you ALREADY!',
      'boo-g': 'Peace out, fam! Stay fresh! Keep that energy eternal!',
      'king-james': 'You are dismissed. Return when you have accomplished something worthy.',
    },
  },
];

/**
 * Get questions by category
 */
export function getQuestionsByCategory(category: FaqQuestion['category']): FaqQuestion[] {
  return FAQ_QUESTIONS.filter(q => q.category === category);
}

/**
 * Get all questions as autocomplete options
 */
export function getAllQuestions(): FaqQuestion[] {
  return FAQ_QUESTIONS;
}

/**
 * Get a response for a question from a specific NPC
 */
export function getFaqAnswer(questionId: string, npcId: string): string {
  const question = FAQ_QUESTIONS.find(q => q.id === questionId);
  if (!question) return "I don't understand that question.";

  return question.npcResponses?.[npcId] || question.defaultResponse;
}

/**
 * Try to match free-form text to a FAQ question (for hybrid mode)
 */
export function matchQuestion(text: string): FaqQuestion | undefined {
  const lower = text.toLowerCase();
  return FAQ_QUESTIONS.find(q => {
    const questionLower = q.question.toLowerCase();
    // Check for significant word overlap
    const questionWords = questionLower.split(/\s+/).filter(w => w.length > 3);
    const matchCount = questionWords.filter(w => lower.includes(w)).length;
    return matchCount >= 2 || lower.includes(questionLower.slice(0, -1)); // -1 to ignore ? mark
  });
}
