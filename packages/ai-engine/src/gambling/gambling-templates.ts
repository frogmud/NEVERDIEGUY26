/**
 * Gambling Response Templates
 *
 * Templates for NPC dialogue during Cee-lo matches.
 * Variables available:
 * - {{speakerName}} - The NPC speaking
 * - {{targetName}} - The opponent
 * - {{streakCount}} - Current win/loss streak number
 * - {{myRoll}} - The speaker's roll result
 * - {{theirRoll}} - The opponent's roll result
 * - {{goldAmount}} - Gold won/lost
 * - {{winnerName}} - Who won the match
 * - {{loserName}} - Who lost the match
 */

import type { ResponseTemplate, MoodType, TemplatePool } from '../core/types';

// ============================================
// Template Helper
// ============================================

let templateId = 0;
function t(
  pool: TemplatePool,
  mood: MoodType,
  text: string,
  weight: number = 10,
  conditions?: ResponseTemplate['conditions']
): ResponseTemplate {
  return {
    id: `gambling-${pool}-${++templateId}`,
    pool,
    mood,
    text,
    weight,
    conditions,
  };
}

// ============================================
// Trash Talk Templates (Pre/During Match)
// ============================================

export const TRASH_TALK_TEMPLATES: ResponseTemplate[] = [
  // Threatening mood
  t('gamblingTrashTalk', 'threatening', "{{targetName}}, those dice gonna roll right over you.", 15),
  t('gamblingTrashTalk', 'threatening', "You really want to test your luck against me, {{targetName}}? Bold move.", 12),
  t('gamblingTrashTalk', 'threatening', "I hope you brought enough gold, {{targetName}}. You're gonna need it.", 10),
  t('gamblingTrashTalk', 'threatening', "{{targetName}}, I've been waiting for someone foolish enough to challenge me.", 10),
  t('gamblingTrashTalk', 'threatening', "The dice favor the bold. And you, {{targetName}}, are not bold.", 8),

  // Amused mood
  t('gamblingTrashTalk', 'amused', "Oh {{targetName}}, this is going to be fun. For me, anyway.", 12),
  t('gamblingTrashTalk', 'amused', "{{targetName}} wants to play? How delightful!", 10),
  t('gamblingTrashTalk', 'amused', "I love fresh meat at the table. Welcome, {{targetName}}.", 8),
  t('gamblingTrashTalk', 'amused', "This should be entertaining. {{targetName}}, show me what you've got.", 10),

  // Confident/Pleased mood
  t('gamblingTrashTalk', 'pleased', "Let's see what you're made of, {{targetName}}.", 10),
  t('gamblingTrashTalk', 'pleased', "{{targetName}}, I respect your courage. Misplaced as it is.", 8),
  t('gamblingTrashTalk', 'pleased', "Alright {{targetName}}, let the dice decide our fates.", 12),

  // Neutral mood
  t('gamblingTrashTalk', 'neutral', "{{targetName}}. You're up.", 8),
  t('gamblingTrashTalk', 'neutral', "Let's do this, {{targetName}}.", 10),
  t('gamblingTrashTalk', 'neutral', "Your move, {{targetName}}.", 8),

  // Streak-based (conditional)
  t('gamblingTrashTalk', 'threatening', "I'm on fire, {{targetName}}. You sure you want this?", 15,
    [{ type: 'context', target: 'streak', comparison: 'gte', value: 3 }]),
  t('gamblingTrashTalk', 'pleased', "{{streakCount}} in a row, {{targetName}}. Think you can stop me?", 12,
    [{ type: 'context', target: 'streak', comparison: 'gte', value: 5 }]),
];

// ============================================
// Brag Templates (Post-Win)
// ============================================

export const BRAG_TEMPLATES: ResponseTemplate[] = [
  // Pleased mood (standard wins)
  t('gamblingBrag', 'pleased', "Too easy. {{targetName}} never stood a chance.", 12),
  t('gamblingBrag', 'pleased', "Another one bites the dust.", 10),
  t('gamblingBrag', 'pleased', "{{goldAmount}} gold richer. Thanks, {{targetName}}.", 10),
  t('gamblingBrag', 'pleased', "The dice have spoken. They said I win.", 8),
  t('gamblingBrag', 'pleased', "Better luck next time, {{targetName}}. You'll need it.", 10),
  t('gamblingBrag', 'pleased', "And THAT is how it's done.", 12),

  // Amused mood
  t('gamblingBrag', 'amused', "Did you see that, everyone? {{targetName}} actually thought they could win!", 10),
  t('gamblingBrag', 'amused', "Oh {{targetName}}, that was adorable. Really.", 8),
  t('gamblingBrag', 'amused', "I almost feel bad. Almost.", 10),

  // Threatening mood (dominant wins)
  t('gamblingBrag', 'threatening', "{{targetName}}, you should just hand over your dice and save us all time.", 10),
  t('gamblingBrag', 'threatening', "Remember this feeling, {{targetName}}. Get used to it.", 8),
  t('gamblingBrag', 'threatening', "Who's next? Anyone else want to donate gold?", 12),

  // Streak-based
  t('gamblingBrag', 'pleased', "That's {{streakCount}} in a row now. Anyone else feeling brave?", 15,
    [{ type: 'context', target: 'streak', comparison: 'gte', value: 3 }]),
  t('gamblingBrag', 'threatening', "{{streakCount}} straight wins. I am UNSTOPPABLE right now.", 12,
    [{ type: 'context', target: 'streak', comparison: 'gte', value: 5 }]),
  t('gamblingBrag', 'amused', "Lucky seven! Oh wait, that's just my skill showing.", 10,
    [{ type: 'context', target: 'streak', comparison: 'eq', value: 7 }]),

  // Special roll brags
  t('gamblingBrag', 'pleased', "4-5-6! Read it and weep, {{targetName}}!", 15),
  t('gamblingBrag', 'amused', "Triple 6s! The dice LOVE me!", 12),
];

// ============================================
// Frustration Templates (Post-Loss)
// ============================================

export const FRUSTRATION_TEMPLATES: ResponseTemplate[] = [
  // Annoyed mood
  t('gamblingFrustration', 'annoyed', "The dice are cold. Ice cold. This is temporary.", 12),
  t('gamblingFrustration', 'annoyed', "Lucky roll, {{targetName}}. Don't get used to it.", 10),
  t('gamblingFrustration', 'annoyed', "That... was not supposed to happen.", 10),
  t('gamblingFrustration', 'annoyed', "Fine. You got me this time.", 8),
  t('gamblingFrustration', 'annoyed', "The odds were against me. It happens.", 10),

  // Angry mood
  t('gamblingFrustration', 'angry', "Are you KIDDING me?! Those rolls were garbage!", 15),
  t('gamblingFrustration', 'angry', "This game is RIGGED!", 12),
  t('gamblingFrustration', 'angry', "UNBELIEVABLE. What kind of luck is that?!", 12),
  t('gamblingFrustration', 'angry', "I KNEW those dice were cursed!", 10),

  // Bad beat specific
  t('gamblingFrustration', 'angry', "I rolled {{myRoll}} and LOST?! To {{targetName}}?! RIGGED!", 15,
    [{ type: 'context', target: 'wasBadBeat', comparison: 'eq', value: true }]),
  t('gamblingFrustration', 'angry', "Triple {{myRoll}} loses to THAT?! How?!", 12,
    [{ type: 'context', target: 'hadTrips', comparison: 'eq', value: true }]),

  // Streak-based (losing streak)
  t('gamblingFrustration', 'angry', "{{streakCount}} losses in a row?! This is impossible!", 15,
    [{ type: 'context', target: 'lossStreak', comparison: 'gte', value: 3 }]),
  t('gamblingFrustration', 'sad', "I can't catch a break today...", 10,
    [{ type: 'context', target: 'lossStreak', comparison: 'gte', value: 4 }]),

  // Sad mood
  t('gamblingFrustration', 'sad', "The universe hates me today.", 8),
  t('gamblingFrustration', 'sad', "I thought I had that one...", 10),
];

// ============================================
// Quit Threat Templates
// ============================================

export const QUIT_THREAT_TEMPLATES: ResponseTemplate[] = [
  // Angry threats
  t('gamblingQuitThreat', 'angry', "One more loss like that and I'm WALKING. I mean it.", 15),
  t('gamblingQuitThreat', 'angry', "I'm THIS close to flipping this table.", 12),
  t('gamblingQuitThreat', 'angry', "You're all cheaters. CHEATERS!", 10),
  t('gamblingQuitThreat', 'angry', "I don't need this. I don't need ANY of this!", 12),

  // Annoyed threats
  t('gamblingQuitThreat', 'annoyed', "I need a break from this. The luck will turn, but not while I'm tilted.", 10),
  t('gamblingQuitThreat', 'annoyed', "Maybe I should step away before I lose more...", 8),
  t('gamblingQuitThreat', 'annoyed', "This isn't my night. I can feel it.", 10),

  // Streak-based
  t('gamblingQuitThreat', 'angry', "{{streakCount}} losses! {{streakCount}}! I'm done!", 15,
    [{ type: 'context', target: 'lossStreak', comparison: 'gte', value: 5 }]),
];

// ============================================
// Quit Templates (Actually Leaving)
// ============================================

export const QUIT_TEMPLATES: ResponseTemplate[] = [
  // Angry quits
  t('gamblingQuit', 'angry', "That's IT! I'm DONE! You vultures can play without me!", 15),
  t('gamblingQuit', 'angry', "I'm out. This game is broken!", 12),
  t('gamblingQuit', 'angry', "Take my spot. I can't watch this anymore.", 10),
  t('gamblingQuit', 'angry', "FINE! You win! Are you HAPPY?!", 12),

  // Annoyed/dignified quits
  t('gamblingQuit', 'annoyed', "I'll be back when the dice remember who I am.", 10),
  t('gamblingQuit', 'annoyed', "I need to cool off. Don't spend my gold too quickly.", 8),
  t('gamblingQuit', 'neutral', "I'm stepping out. Deal me back in later.", 8),

  // Sad quits
  t('gamblingQuit', 'sad', "I can't do this right now. My luck is cursed.", 10),
  t('gamblingQuit', 'sad', "Maybe tomorrow will be better...", 8),
];

// ============================================
// Return Templates (Coming Back)
// ============================================

export const RETURN_TEMPLATES: ResponseTemplate[] = [
  // Confident returns
  t('gamblingReturn', 'pleased', "Miss me? The dice did. Let's see who's ready for round two.", 12),
  t('gamblingReturn', 'pleased', "I'm BACK. And I've got a good feeling about this.", 10),
  t('gamblingReturn', 'pleased', "Alright, I've cooled off. Who wants to lose some gold?", 10),

  // Neutral returns
  t('gamblingReturn', 'neutral', "Okay, I've cooled off. Let's try this again.", 10),
  t('gamblingReturn', 'neutral', "Deal me back in. I'm ready.", 8),
  t('gamblingReturn', 'neutral', "I needed that break. Back to business.", 10),

  // Threatening returns
  t('gamblingReturn', 'threatening', "I'm back. And I'm coming for my gold.", 12),
  t('gamblingReturn', 'threatening', "You thought I was done? I'm just getting started.", 10),

  // Amused returns
  t('gamblingReturn', 'amused', "What'd I miss? Anyone go broke yet?", 10),
  t('gamblingReturn', 'amused', "Couldn't stay away. This is too much fun.", 8),
];

// ============================================
// Rivalry Templates
// ============================================

export const RIVALRY_TEMPLATES: ResponseTemplate[] = [
  // Threatening rivalry
  t('gamblingRivalry', 'threatening', "{{targetName}}. You and me. Right now. I've been waiting for this.", 15),
  t('gamblingRivalry', 'threatening', "{{targetName}}! Our record is unfinished. Let's settle this.", 12),
  t('gamblingRivalry', 'threatening', "Every time I see you, {{targetName}}, I remember what you owe me.", 10),

  // Amused rivalry
  t('gamblingRivalry', 'amused', "Ah, {{targetName}}! My favorite victim returns!", 12),
  t('gamblingRivalry', 'amused', "{{targetName}}! Ready to pad my win count?", 10),

  // Annoyed rivalry
  t('gamblingRivalry', 'annoyed', "{{targetName}}. Of course it's you. Let's get this over with.", 10),
  t('gamblingRivalry', 'annoyed', "You again, {{targetName}}? Fine. I owe you a loss anyway.", 8),

  // Pleased rivalry
  t('gamblingRivalry', 'pleased', "{{targetName}}! Our games are always the best. Let's go!", 10),
  t('gamblingRivalry', 'pleased', "Finally, a worthy opponent. {{targetName}}, let's dance.", 12),
];

// ============================================
// Witness Templates (Spectating)
// ============================================

export const WITNESS_TEMPLATES: ResponseTemplate[] = [
  // Amused observations
  t('gamblingWitness', 'amused', "Did you see that? {{winnerName}} just destroyed {{loserName}}!", 10),
  t('gamblingWitness', 'amused', "Ohhh, that's gonna leave a mark on {{loserName}}'s pride!", 8),
  t('gamblingWitness', 'amused', "{{winnerName}} is ON FIRE right now!", 10),
  t('gamblingWitness', 'amused', "Hah! Did you see {{loserName}}'s face?", 8),

  // Curious observations
  t('gamblingWitness', 'curious', "Ouch. {{loserName}} has to be tilting hard after that one.", 10),
  t('gamblingWitness', 'curious', "Interesting. {{winnerName}} is really on a streak.", 8),
  t('gamblingWitness', 'curious', "I wonder how long {{winnerName}} can keep this up...", 8),

  // Neutral observations
  t('gamblingWitness', 'neutral', "{{winnerName}} takes it. Next round.", 8),
  t('gamblingWitness', 'neutral', "That was close. {{winnerName}} barely pulled that one out.", 10),

  // Sympathetic observations
  t('gamblingWitness', 'sad', "Poor {{loserName}}. That was brutal.", 8),
  t('gamblingWitness', 'neutral', "{{loserName}} can't buy a win today.", 10),
];

// ============================================
// Streak Templates
// ============================================

export const STREAK_TEMPLATES: ResponseTemplate[] = [
  // Winning streak celebration
  t('gamblingStreak', 'pleased', "{{streakCount}} straight wins. I am on FIRE right now!", 15),
  t('gamblingStreak', 'pleased', "That's {{streakCount}}! Who's counting? I AM!", 12),
  t('gamblingStreak', 'threatening', "{{streakCount}} in a row. Who dares challenge the streak?", 10),

  // Long winning streak
  t('gamblingStreak', 'pleased', "Lucky number {{streakCount}}! Wait, that's just my win count!", 12,
    [{ type: 'context', target: 'streak', comparison: 'gte', value: 7 }]),
  t('gamblingStreak', 'amused', "I've lost count. Oh wait, no I haven't. {{streakCount}}!", 10,
    [{ type: 'context', target: 'streak', comparison: 'gte', value: 10 }]),

  // Streak broken (loser perspective)
  t('gamblingStreak', 'sad', "{{streakCount}} wins... gone. Just like that. {{targetName}} ended it.", 12),
  t('gamblingStreak', 'angry', "MY STREAK! {{targetName}}, you'll PAY for this!", 15),
  t('gamblingStreak', 'annoyed', "Well, all good things come to an end. {{streakCount}} was a good run.", 10),

  // Streak breaker (winner perspective)
  t('gamblingStreak', 'pleased', "I just ended {{targetName}}'s {{streakCount}}-game streak! You're welcome!", 15),
  t('gamblingStreak', 'amused', "The mighty {{targetName}} falls! Who's the champion NOW?", 12),
  t('gamblingStreak', 'threatening', "{{targetName}}'s streak? I broke it. Just like I'll break all of you.", 10),
];

// ============================================
// Combined Export
// ============================================

export const ALL_GAMBLING_TEMPLATES: ResponseTemplate[] = [
  ...TRASH_TALK_TEMPLATES,
  ...BRAG_TEMPLATES,
  ...FRUSTRATION_TEMPLATES,
  ...QUIT_THREAT_TEMPLATES,
  ...QUIT_TEMPLATES,
  ...RETURN_TEMPLATES,
  ...RIVALRY_TEMPLATES,
  ...WITNESS_TEMPLATES,
  ...STREAK_TEMPLATES,
];

/**
 * Get templates by pool
 */
export function getGamblingTemplates(pool: TemplatePool): ResponseTemplate[] {
  switch (pool) {
    case 'gamblingTrashTalk': return TRASH_TALK_TEMPLATES;
    case 'gamblingBrag': return BRAG_TEMPLATES;
    case 'gamblingFrustration': return FRUSTRATION_TEMPLATES;
    case 'gamblingQuitThreat': return QUIT_THREAT_TEMPLATES;
    case 'gamblingQuit': return QUIT_TEMPLATES;
    case 'gamblingReturn': return RETURN_TEMPLATES;
    case 'gamblingRivalry': return RIVALRY_TEMPLATES;
    case 'gamblingWitness': return WITNESS_TEMPLATES;
    case 'gamblingStreak': return STREAK_TEMPLATES;
    default: return [];
  }
}

/**
 * Get templates by pool and mood
 */
export function getGamblingTemplatesByMood(
  pool: TemplatePool,
  mood: MoodType
): ResponseTemplate[] {
  return getGamblingTemplates(pool).filter(t => t.mood === mood || t.mood === 'any');
}
