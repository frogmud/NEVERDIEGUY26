/**
 * The One - Void Die-rector Dialogue Pool
 *
 * Voice: Cold, detached, philosophical. Speaks in absolutes.
 * Domain: Null Providence (Domain 1)
 * Theme: Existential void, meta-awareness, bureaucracy of nothing
 */

import type { WeightedDialogue, EnemyDialoguePool } from '../types';

const demands: WeightedDialogue[] = [
  { text: 'The void demands tribute.', weight: 10 },
  { text: 'Surrender something. Anything. The void is hungry.', weight: 8 },
  { text: 'Your existence was approved by committee. The committee demands payment.', weight: 7 },
  { text: 'Form NULL-0 requires your signature. In blood. Or goo. Whichever.', weight: 6 },
  { text: 'Appeals are heard on the third Tuesday of Never. You missed it. Pay the fee.', weight: 5 },
  // High corruption variants
  { text: 'You owe nothing. Nothing is expensive.', weight: 8, requires: { type: 'corruption', comparison: 'gte', value: 60 } },
];

const observations: WeightedDialogue[] = [
  { text: 'I see you. The void sees you.', weight: 10 },
  { text: 'Interesting. You persist.', weight: 10 },
  { text: 'You roll the dice. The dice have already rolled you. This is the nature of play.', weight: 8 },
  { text: 'The game plays itself. You are the interface. The interface has opinions. How quaint.', weight: 7 },
  { text: 'Win, lose - these are player words. The game only knows: continue, or dont.', weight: 7 },
  { text: 'Before the six, there was one. Before the one, there was none. I am what remains of none.', weight: 5 },
  { text: 'History is a circle. I have walked the circle. It goes nowhere.', weight: 6 },
  // Low health variants
  { text: 'You approach nothing. Nothing is patient.', weight: 12, requires: { type: 'health', comparison: 'lte', value: 25 } },
  // High death count
  { text: 'I have seen this exact moment seven thousand times. It never gets old. That is a lie.', weight: 10, requires: { type: 'deaths', comparison: 'gte', value: 10 } },
];

const offers: WeightedDialogue[] = [
  { text: 'The void offers... perspective.', weight: 10 },
  { text: 'Would you like to see nothing? It helps.', weight: 8 },
  { text: 'I could show you the space between. Its quiet there.', weight: 7 },
  { text: 'Free will is the games best feature. Its also the games only lie. Want to see?', weight: 6 },
  // High corruption - better offers
  { text: 'You are already nothing. Let me make it official.', weight: 12, requires: { type: 'corruption', comparison: 'gte', value: 70 } },
];

const tests: WeightedDialogue[] = [
  { text: 'Prove your existence has meaning.', weight: 10 },
  { text: 'Can you be more than nothing? Show me.', weight: 10 },
  { text: 'You chose. Interesting. The choice was also chosen. But... interesting.', weight: 7 },
  { text: 'Defy the void. If you can. You cannot. But the attempt is noted.', weight: 6 },
];

// Contextual variants for extreme states
const lowHealthVariants: WeightedDialogue[] = [
  { text: 'The nothing approaches. Do you hear it? It sounds like silence.', weight: 15 },
  { text: 'Your form destabilizes. The void is sympathetic. Sympathetic means patient.', weight: 12 },
];

const highCorruptionVariants: WeightedDialogue[] = [
  { text: 'You are no longer asking. You are being answered.', weight: 15 },
  { text: 'The corruption completes. Welcome to nothing. Nothing is very quiet.', weight: 12 },
  { text: 'The rerolls were prayers. The answer is nothing. The answer is always nothing.', weight: 10 },
];

const postDeathVariants: WeightedDialogue[] = [
  { text: 'You return. The nothing noted your absence. The nothing notes everything.', weight: 12 },
  { text: 'Death is a formality here. The paperwork is the real burden.', weight: 10 },
];

export const THE_ONE_POOL: EnemyDialoguePool = {
  enemyType: 'nullspawn', // Default, overridden by generator
  channeling: 'the-one',
  demands,
  observations,
  offers,
  tests,
  lowHealthVariants,
  highCorruptionVariants,
  postDeathVariants,
};
