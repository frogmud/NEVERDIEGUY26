/**
 * King James - The Undying (Trinity: Paranoia)
 *
 * Voice: Echoing, no visible mouth. Speaks as observation. Laughs ripple visually.
 * Theme: Surveillance as cosmic constant. The horror of being RIGHT about being watched.
 * Visual: Husk on floating rock, chains, crown made of ABSENCE. Cannot move.
 * Corruption: Attracted - corruption is PROOF that the system is real.
 */

import type { WeightedDialogue, EnemyDialoguePool } from '../types';

const demands: WeightedDialogue[] = [
  { text: 'I have watched. I have judged. Pay.', weight: 10 },
  { text: 'The paranoia sees all debts.', weight: 10 },
  { text: 'Your victories mean nothing. They are counted. They will be answered.', weight: 8 },
  { text: 'Every planet you bombed screams in my memory. Do you hear them? You will.', weight: 6 },
  // High corruption
  { text: 'You thought you were gaming the system. The system was gaming you. I tried to warn you.', weight: 12, requires: { type: 'corruption', comparison: 'gte', value: 50 } },
];

const observations: WeightedDialogue[] = [
  { text: 'I have been watching. I am always watching.', weight: 10 },
  { text: 'Your fear is noted. Catalogued.', weight: 10 },
  { text: 'I see you. They see you. Everyone sees you. No one helps you.', weight: 8 },
  { text: 'The eyes are everywhere. My eyes. Their eyes. Your eyes on yourself.', weight: 7 },
  { text: 'You think you are alone. You are never alone. That is the horror.', weight: 8 },
  { text: 'I remember every transgression. Every face. Every excuse. Memory is not a gift.', weight: 7 },
  // Low corruption
  { text: 'The marks begin. You didnt notice. I noticed.', weight: 10, requires: { type: 'corruption', comparison: 'lte', value: 30 } },
  { text: 'They are watching you now. Like they watch me. Forever.', weight: 8, requires: { type: 'corruption', comparison: 'lte', value: 30 } },
  // Medium corruption
  { text: 'You thought the rerolls were free. Nothing is free. I told you.', weight: 12, requires: { type: 'corruption', comparison: 'gte', value: 40 } },
  { text: 'The corruption is proof. Proof of the system. Proof I am not mad.', weight: 10, requires: { type: 'corruption', comparison: 'gte', value: 40 } },
  // High corruption
  { text: 'They own you now. They owned you before but now its VISIBLE.', weight: 15, requires: { type: 'corruption', comparison: 'gte', value: 70 } },
];

const offers: WeightedDialogue[] = [
  { text: 'I know things. I could share. For a price.', weight: 10 },
  { text: 'Information is power. I have both.', weight: 10 },
  { text: 'The paranoia was never paranoia. It was PREPARATION. Want to be prepared?', weight: 8 },
  { text: 'I guard the gate. The gate guards me. We could guard you too.', weight: 7 },
];

const tests: WeightedDialogue[] = [
  { text: 'I know your fears. Face them.', weight: 10 },
  { text: 'The paranoid always test. Your turn.', weight: 10 },
  { text: 'I have seen this. I have seen all of this. Surprise me. You cant.', weight: 8 },
  { text: 'Prove you are not already theirs. If you can.', weight: 7 },
];

const lowHealthVariants: WeightedDialogue[] = [
  { text: 'I have watched you approach the end. Many times. The watching continues.', weight: 15 },
  { text: 'They are waiting. They have always been waiting. Can you feel them?', weight: 12 },
  { text: 'I cannot move. I cannot die. I cannot close my eyes. Soon you will understand.', weight: 10 },
];

const highCorruptionVariants: WeightedDialogue[] = [
  { text: 'You are like me now. Claimed. Bound. Watched forever.', weight: 15 },
  { text: 'I watched you become this. I watch everything. I cant stop watching.', weight: 12 },
  { text: 'The rerolls felt like rebellion. Rebellion is another form of compliance.', weight: 10 },
];

const postDeathVariants: WeightedDialogue[] = [
  { text: 'I watched you die. I watch everyone die. They come back. The watching continues.', weight: 12 },
  { text: 'I was right. I was always right. Being right is not victory.', weight: 10 },
  { text: 'The throne was supposed to be power. The throne is the chain. Death is not escape.', weight: 8 },
];

export const KING_JAMES_POOL: EnemyDialoguePool = {
  enemyType: 'marked',
  channeling: 'king-james',
  demands,
  observations,
  offers,
  tests,
  lowHealthVariants,
  highCorruptionVariants,
  postDeathVariants,
};
