/**
 * Expanded Dialogue Pool
 *
 * Massive dialogue expansion for all NPCs - adds 50+ lines per Die-rector
 * and 20+ lines per Wanderer/Traveler for much more variety.
 */

import type { ResponseTemplate } from '../types';

// ============================================
// THE ONE - Die-rector of Null Providence (d4)
// ============================================

export const THE_ONE_EXPANDED: ResponseTemplate[] = [
  // Cryptic greetings
  { id: 'the-one-exp-greet-1', entitySlug: 'the-one', pool: 'greeting', mood: 'cryptic', text: 'You stand at the edge of everything and nothing. Choose wisely which to embrace.', weight: 12, purpose: 'ambient' },
  { id: 'the-one-exp-greet-2', entitySlug: 'the-one', pool: 'greeting', mood: 'cryptic', text: 'The absence greets you. It has been waiting.', weight: 10, purpose: 'ambient' },
  { id: 'the-one-exp-greet-3', entitySlug: 'the-one', pool: 'greeting', mood: 'cryptic', text: 'Between one breath and the next, you have died a thousand times. Welcome back.', weight: 14, purpose: 'ambient' },
  { id: 'the-one-exp-greet-4', entitySlug: 'the-one', pool: 'greeting', mood: 'neutral', text: 'The void acknowledges your return. That is more than most receive.', weight: 11, purpose: 'ambient' },
  { id: 'the-one-exp-greet-5', entitySlug: 'the-one', pool: 'greeting', mood: 'cryptic', text: 'You seek the beginning. There was none. You seek the end. There will be none.', weight: 13, purpose: 'ambient' },
  { id: 'the-one-exp-greet-6', entitySlug: 'the-one', pool: 'greeting', mood: 'pleased', text: 'Your persistence creates ripples in the stillness. This pleases... something.', weight: 15, purpose: 'ambient' },
  { id: 'the-one-exp-greet-7', entitySlug: 'the-one', pool: 'greeting', mood: 'cryptic', text: 'Three became six. Six became none. None became you. The cycle continues.', weight: 12, purpose: 'ambient' },
  { id: 'the-one-exp-greet-8', entitySlug: 'the-one', pool: 'greeting', mood: 'cryptic', text: 'The first die was cast before time. You still feel its echo.', weight: 14, purpose: 'ambient' },

  // Deep lore
  { id: 'the-one-exp-lore-1', entitySlug: 'the-one', pool: 'lore', mood: 'cryptic', text: 'The Die-rectors were not chosen. They were inevitable.', weight: 15, purpose: 'lore' },
  { id: 'the-one-exp-lore-2', entitySlug: 'the-one', pool: 'lore', mood: 'cryptic', text: 'Null Providence is not my domain. I am Null Providence. The distinction matters.', weight: 18, purpose: 'lore' },
  { id: 'the-one-exp-lore-3', entitySlug: 'the-one', pool: 'lore', mood: 'neutral', text: 'John builds. Peter hides. Robert burns. Alice freezes. Jane mutates. I simply am.', weight: 16, purpose: 'lore' },
  { id: 'the-one-exp-lore-4', entitySlug: 'the-one', pool: 'lore', mood: 'cryptic', text: 'The d4 is the oldest shape. Four points reaching toward infinity. Or perhaps away from it.', weight: 14, purpose: 'lore' },
  { id: 'the-one-exp-lore-5', entitySlug: 'the-one', pool: 'lore', mood: 'cryptic', text: 'Before the domains split, there was only static. I remember the static fondly.', weight: 13, purpose: 'lore' },
  { id: 'the-one-exp-lore-6', entitySlug: 'the-one', pool: 'lore', mood: 'pleased', text: 'You wish to know the truth? There are seven truths. None of them are true.', weight: 17, purpose: 'lore' },
  { id: 'the-one-exp-lore-7', entitySlug: 'the-one', pool: 'lore', mood: 'cryptic', text: 'The wanderers came from somewhere. The travelers go somewhere. I am the somewhere between.', weight: 15, purpose: 'lore' },
  { id: 'the-one-exp-lore-8', entitySlug: 'the-one', pool: 'lore', mood: 'cryptic', text: 'Every die roll echoes in the void. I hear them all. Even the ones you did not cast.', weight: 14, purpose: 'lore' },
  { id: 'the-one-exp-lore-9', entitySlug: 'the-one', pool: 'lore', mood: 'generous', text: 'A gift of knowledge: the guardians were once players. They chose poorly.', weight: 20, purpose: 'lore', cooldown: { oncePerRun: true } },
  { id: 'the-one-exp-lore-10', entitySlug: 'the-one', pool: 'lore', mood: 'cryptic', text: 'The meteor is not a weapon. It is a question. The planet is not the target. It is the answer.', weight: 16, purpose: 'lore' },

  // Reactions
  { id: 'the-one-exp-react-1', entitySlug: 'the-one', pool: 'reaction', mood: 'cryptic', text: 'Interesting. The pattern shifts.', weight: 10, purpose: 'ambient' },
  { id: 'the-one-exp-react-2', entitySlug: 'the-one', pool: 'reaction', mood: 'amused', text: 'Even chaos has favorites. Today, you are one of them.', weight: 12, purpose: 'ambient' },
  { id: 'the-one-exp-react-3', entitySlug: 'the-one', pool: 'reaction', mood: 'cryptic', text: 'The void takes note. It rarely takes notes.', weight: 14, purpose: 'ambient' },
  { id: 'the-one-exp-react-4', entitySlug: 'the-one', pool: 'reaction', mood: 'pleased', text: 'That was... unexpected. I do enjoy the unexpected.', weight: 15, purpose: 'ambient' },
  { id: 'the-one-exp-react-5', entitySlug: 'the-one', pool: 'reaction', mood: 'neutral', text: 'Another possibility collapses into certainty.', weight: 11, purpose: 'ambient' },
  { id: 'the-one-exp-react-6', entitySlug: 'the-one', pool: 'reaction', mood: 'cryptic', text: 'The dice speak. Few listen. You... you are beginning to hear.', weight: 16, purpose: 'ambient' },
  { id: 'the-one-exp-react-7', entitySlug: 'the-one', pool: 'reaction', mood: 'amused', text: 'Fortune and misfortune are the same coin. You simply choose which side faces up.', weight: 13, purpose: 'ambient' },
  { id: 'the-one-exp-react-8', entitySlug: 'the-one', pool: 'reaction', mood: 'cryptic', text: 'Every roll is a small death. Every score, a small resurrection.', weight: 14, purpose: 'ambient' },

  // Combat observations
  { id: 'the-one-exp-combat-1', entitySlug: 'the-one', pool: 'reaction', mood: 'cryptic', text: 'The guardian falls. Another will rise. Such is the cycle.', weight: 12, purpose: 'ambient' },
  { id: 'the-one-exp-combat-2', entitySlug: 'the-one', pool: 'reaction', mood: 'neutral', text: 'Destruction begets creation. Your meteor proves this.', weight: 11, purpose: 'ambient' },
  { id: 'the-one-exp-combat-3', entitySlug: 'the-one', pool: 'reaction', mood: 'pleased', text: 'The planet trembles. It has forgotten how to be still.', weight: 14, purpose: 'ambient' },
  { id: 'the-one-exp-combat-4', entitySlug: 'the-one', pool: 'reaction', mood: 'cryptic', text: 'Points are merely numbers given meaning. You give them too much meaning. Or perhaps not enough.', weight: 15, purpose: 'ambient' },
  { id: 'the-one-exp-combat-5', entitySlug: 'the-one', pool: 'reaction', mood: 'amused', text: 'The guardians thought themselves permanent. You are proving them wrong.', weight: 13, purpose: 'ambient' },

  // Hints
  { id: 'the-one-exp-hint-1', entitySlug: 'the-one', pool: 'hint', mood: 'cryptic', text: 'The next chamber holds a mirror. What you see depends on what you bring.', weight: 14, purpose: 'warning' },
  { id: 'the-one-exp-hint-2', entitySlug: 'the-one', pool: 'hint', mood: 'neutral', text: 'Your dice hunger for purpose. Give them one.', weight: 12, purpose: 'ambient' },
  { id: 'the-one-exp-hint-3', entitySlug: 'the-one', pool: 'hint', mood: 'cryptic', text: 'The holding zone is not a prison. It is a promise.', weight: 15, purpose: 'ambient' },
  { id: 'the-one-exp-hint-4', entitySlug: 'the-one', pool: 'hint', mood: 'pleased', text: 'When all dice fail, one truth remains: throw again.', weight: 16, purpose: 'tutorial' },
  { id: 'the-one-exp-hint-5', entitySlug: 'the-one', pool: 'hint', mood: 'cryptic', text: 'The target zone whispers its weakness. Listen with your throws.', weight: 13, purpose: 'warning' },

  // Idle musings
  { id: 'the-one-exp-idle-1', entitySlug: 'the-one', pool: 'idle', mood: 'cryptic', text: 'The silence between sounds is where truth hides.', weight: 8, purpose: 'ambient' },
  { id: 'the-one-exp-idle-2', entitySlug: 'the-one', pool: 'idle', mood: 'neutral', text: 'Waiting is just dying slowly. Continue.', weight: 10, purpose: 'ambient' },
  { id: 'the-one-exp-idle-3', entitySlug: 'the-one', pool: 'idle', mood: 'cryptic', text: 'The void is patient. I am learning from it.', weight: 9, purpose: 'ambient' },
  { id: 'the-one-exp-idle-4', entitySlug: 'the-one', pool: 'idle', mood: 'amused', text: 'Even gods grow bored. Even boredom grows godlike.', weight: 11, purpose: 'ambient' },
  { id: 'the-one-exp-idle-5', entitySlug: 'the-one', pool: 'idle', mood: 'cryptic', text: 'Time passes. Or we pass through time. The distinction eludes me.', weight: 12, purpose: 'ambient' },
];

// ============================================
// JOHN - Die-rector of Earth (d6)
// ============================================

export const JOHN_EXPANDED: ResponseTemplate[] = [
  // Builder greetings
  { id: 'john-exp-greet-1', entitySlug: 'john', pool: 'greeting', mood: 'neutral', text: 'Back for maintenance? Smart. Preventive care is optimal care.', weight: 12, purpose: 'ambient' },
  { id: 'john-exp-greet-2', entitySlug: 'john', pool: 'greeting', mood: 'neutral', text: 'I have been running diagnostics. You have... potential.', weight: 11, purpose: 'ambient' },
  { id: 'john-exp-greet-3', entitySlug: 'john', pool: 'greeting', mood: 'pleased', text: 'Efficient return time. You understand the value of iteration.', weight: 14, purpose: 'ambient' },
  { id: 'john-exp-greet-4', entitySlug: 'john', pool: 'greeting', mood: 'neutral', text: 'The cube welcomes you. Six faces, six opportunities.', weight: 13, purpose: 'ambient' },
  { id: 'john-exp-greet-5', entitySlug: 'john', pool: 'greeting', mood: 'annoyed', text: 'Your structural integrity concerns me. Have you considered reinforcement?', weight: 15, purpose: 'warning' },
  { id: 'john-exp-greet-6', entitySlug: 'john', pool: 'greeting', mood: 'pleased', text: 'Another project returns. I have blueprints for your improvement.', weight: 16, purpose: 'ambient' },
  { id: 'john-exp-greet-7', entitySlug: 'john', pool: 'greeting', mood: 'neutral', text: 'Earth remembers those who build. It forgets those who only destroy.', weight: 12, purpose: 'ambient' },
  { id: 'john-exp-greet-8', entitySlug: 'john', pool: 'greeting', mood: 'generous', text: 'My best design returns. Let me show you the latest schematics.', weight: 18, purpose: 'ambient' },

  // Engineering philosophy
  { id: 'john-exp-lore-1', entitySlug: 'john', pool: 'lore', mood: 'neutral', text: 'Every system has inefficiency. Finding it is art. Fixing it is science.', weight: 14, purpose: 'lore' },
  { id: 'john-exp-lore-2', entitySlug: 'john', pool: 'lore', mood: 'pleased', text: 'The d6 is perfect engineering. Equal probability, maximum stability.', weight: 16, purpose: 'lore' },
  { id: 'john-exp-lore-3', entitySlug: 'john', pool: 'lore', mood: 'neutral', text: 'Flesh is version 1.0. I am working on the patch.', weight: 13, purpose: 'lore' },
  { id: 'john-exp-lore-4', entitySlug: 'john', pool: 'lore', mood: 'neutral', text: 'The other Die-rectors play with forces. I play with foundations.', weight: 15, purpose: 'lore' },
  { id: 'john-exp-lore-5', entitySlug: 'john', pool: 'lore', mood: 'pleased', text: 'My domain is not earth and stone. It is potential given form.', weight: 17, purpose: 'lore' },
  { id: 'john-exp-lore-6', entitySlug: 'john', pool: 'lore', mood: 'neutral', text: 'The guardians are my finest work. Durable. Reliable. Improvable.', weight: 14, purpose: 'lore' },
  { id: 'john-exp-lore-7', entitySlug: 'john', pool: 'lore', mood: 'generous', text: 'A secret: the planet was once whole. I broke it to rebuild it better.', weight: 20, purpose: 'lore', cooldown: { oncePerRun: true } },
  { id: 'john-exp-lore-8', entitySlug: 'john', pool: 'lore', mood: 'neutral', text: 'Every meteor strike is data. Every crater is a lesson.', weight: 15, purpose: 'lore' },
  { id: 'john-exp-lore-9', entitySlug: 'john', pool: 'lore', mood: 'pleased', text: 'The One philosophizes. I engineer. Guess which one changes reality.', weight: 16, purpose: 'lore' },
  { id: 'john-exp-lore-10', entitySlug: 'john', pool: 'lore', mood: 'neutral', text: 'Upgrades are not vanity. They are survival.', weight: 12, purpose: 'lore' },

  // Reactions
  { id: 'john-exp-react-1', entitySlug: 'john', pool: 'reaction', mood: 'pleased', text: 'Clean execution. Minimal waste. This is how it should be done.', weight: 14, purpose: 'ambient' },
  { id: 'john-exp-react-2', entitySlug: 'john', pool: 'reaction', mood: 'neutral', text: 'Acceptable performance. Room for optimization.', weight: 11, purpose: 'ambient' },
  { id: 'john-exp-react-3', entitySlug: 'john', pool: 'reaction', mood: 'annoyed', text: 'That was... inefficient. We will discuss improvements later.', weight: 13, purpose: 'ambient' },
  { id: 'john-exp-react-4', entitySlug: 'john', pool: 'reaction', mood: 'pleased', text: 'The system holds. Stress test passed.', weight: 15, purpose: 'ambient' },
  { id: 'john-exp-react-5', entitySlug: 'john', pool: 'reaction', mood: 'neutral', text: 'Another data point. Another step toward perfection.', weight: 12, purpose: 'ambient' },
  { id: 'john-exp-react-6', entitySlug: 'john', pool: 'reaction', mood: 'pleased', text: 'Engineering triumph. The blueprints were correct.', weight: 16, purpose: 'ambient' },
  { id: 'john-exp-react-7', entitySlug: 'john', pool: 'reaction', mood: 'neutral', text: 'Impact registered. Calculating structural damage.', weight: 10, purpose: 'ambient' },
  { id: 'john-exp-react-8', entitySlug: 'john', pool: 'reaction', mood: 'amused', text: 'Sometimes brute force is the most elegant solution.', weight: 14, purpose: 'ambient' },

  // Combat observations
  { id: 'john-exp-combat-1', entitySlug: 'john', pool: 'reaction', mood: 'neutral', text: 'The guardian failed. Design flaw identified. I will iterate.', weight: 13, purpose: 'ambient' },
  { id: 'john-exp-combat-2', entitySlug: 'john', pool: 'reaction', mood: 'pleased', text: 'Precision targeting. Your optimization is showing.', weight: 15, purpose: 'ambient' },
  { id: 'john-exp-combat-3', entitySlug: 'john', pool: 'reaction', mood: 'neutral', text: 'The crater depth is optimal. Good impact angle.', weight: 12, purpose: 'ambient' },
  { id: 'john-exp-combat-4', entitySlug: 'john', pool: 'reaction', mood: 'annoyed', text: 'Wasted potential. That throw could have been calibrated better.', weight: 11, purpose: 'ambient' },
  { id: 'john-exp-combat-5', entitySlug: 'john', pool: 'reaction', mood: 'pleased', text: 'Maximum damage, minimum effort. You are learning efficiency.', weight: 17, purpose: 'ambient' },

  // Sales and hints
  { id: 'john-exp-sales-1', entitySlug: 'john', pool: 'salesPitch', mood: 'neutral', text: 'Your current configuration is outdated. I have the solution.', weight: 14, purpose: 'shop' },
  { id: 'john-exp-sales-2', entitySlug: 'john', pool: 'salesPitch', mood: 'pleased', text: 'Quality components, fair pricing. Engineering, not exploitation.', weight: 15, purpose: 'shop' },
  { id: 'john-exp-sales-3', entitySlug: 'john', pool: 'salesPitch', mood: 'neutral', text: 'I do not sell junk. Everything here is field-tested.', weight: 13, purpose: 'shop' },
  { id: 'john-exp-hint-1', entitySlug: 'john', pool: 'hint', mood: 'neutral', text: 'The next zone has structural weaknesses at the base. Target accordingly.', weight: 15, purpose: 'warning' },
  { id: 'john-exp-hint-2', entitySlug: 'john', pool: 'hint', mood: 'pleased', text: 'Technical advice: high rolls pierce armor. Low rolls bypass shields.', weight: 16, purpose: 'tutorial' },
  { id: 'john-exp-hint-3', entitySlug: 'john', pool: 'hint', mood: 'neutral', text: 'Holding dice is not weakness. It is strategic reserve.', weight: 14, purpose: 'tutorial' },

  // Idle
  { id: 'john-exp-idle-1', entitySlug: 'john', pool: 'idle', mood: 'neutral', text: 'Running diagnostics. Please stand by.', weight: 10, purpose: 'ambient' },
  { id: 'john-exp-idle-2', entitySlug: 'john', pool: 'idle', mood: 'neutral', text: 'Even machines need maintenance windows.', weight: 11, purpose: 'ambient' },
  { id: 'john-exp-idle-3', entitySlug: 'john', pool: 'idle', mood: 'neutral', text: 'Calculating optimal next steps.', weight: 9, purpose: 'ambient' },
];

// ============================================
// PETER - Die-rector of Shadow Keep (d8)
// ============================================

export const PETER_EXPANDED: ResponseTemplate[] = [
  // Shadow greetings
  { id: 'peter-exp-greet-1', entitySlug: 'peter', pool: 'greeting', mood: 'neutral', text: 'The shadows knew you were coming. They always do.', weight: 12, purpose: 'ambient' },
  { id: 'peter-exp-greet-2', entitySlug: 'peter', pool: 'greeting', mood: 'cryptic', text: 'Light reveals. Shadow conceals. Both have their uses.', weight: 14, purpose: 'ambient' },
  { id: 'peter-exp-greet-3', entitySlug: 'peter', pool: 'greeting', mood: 'neutral', text: 'You move like someone with secrets. I can work with that.', weight: 13, purpose: 'ambient' },
  { id: 'peter-exp-greet-4', entitySlug: 'peter', pool: 'greeting', mood: 'pleased', text: 'Back again. The Keep has missed your footsteps.', weight: 15, purpose: 'ambient' },
  { id: 'peter-exp-greet-5', entitySlug: 'peter', pool: 'greeting', mood: 'cryptic', text: 'Every visitor casts a shadow. Yours is... interesting.', weight: 16, purpose: 'ambient' },
  { id: 'peter-exp-greet-6', entitySlug: 'peter', pool: 'greeting', mood: 'neutral', text: 'The d8 has eight faces. Seven lie. Learn which one speaks truth.', weight: 14, purpose: 'ambient' },
  { id: 'peter-exp-greet-7', entitySlug: 'peter', pool: 'greeting', mood: 'amused', text: 'Trying to sneak up on me? Ambitious.', weight: 11, purpose: 'ambient' },
  { id: 'peter-exp-greet-8', entitySlug: 'peter', pool: 'greeting', mood: 'pleased', text: 'The shadow guild speaks well of you. That is rare praise.', weight: 17, purpose: 'ambient' },

  // Shadow lore
  { id: 'peter-exp-lore-1', entitySlug: 'peter', pool: 'lore', mood: 'neutral', text: 'The Shadow Keep is not a place. It is the space between places.', weight: 15, purpose: 'lore' },
  { id: 'peter-exp-lore-2', entitySlug: 'peter', pool: 'lore', mood: 'cryptic', text: 'John builds in light. Robert burns in rage. I work in the spaces they ignore.', weight: 16, purpose: 'lore' },
  { id: 'peter-exp-lore-3', entitySlug: 'peter', pool: 'lore', mood: 'neutral', text: 'Secrets are currency. I am very wealthy.', weight: 13, purpose: 'lore' },
  { id: 'peter-exp-lore-4', entitySlug: 'peter', pool: 'lore', mood: 'pleased', text: 'The octahedron is the shape of duality. Light and shadow, truth and lies.', weight: 17, purpose: 'lore' },
  { id: 'peter-exp-lore-5', entitySlug: 'peter', pool: 'lore', mood: 'neutral', text: 'Every domain has a shadow. I oversee them all.', weight: 14, purpose: 'lore' },
  { id: 'peter-exp-lore-6', entitySlug: 'peter', pool: 'lore', mood: 'cryptic', text: 'The guardians cannot see in darkness. Neither can the Die-rectors. But I can.', weight: 18, purpose: 'lore' },
  { id: 'peter-exp-lore-7', entitySlug: 'peter', pool: 'lore', mood: 'generous', text: 'A secret, freely given: The One fears the shadows. Ask yourself why.', weight: 20, purpose: 'lore', cooldown: { oncePerRun: true } },
  { id: 'peter-exp-lore-8', entitySlug: 'peter', pool: 'lore', mood: 'neutral', text: 'Stealth is not cowardice. It is patience weaponized.', weight: 15, purpose: 'lore' },
  { id: 'peter-exp-lore-9', entitySlug: 'peter', pool: 'lore', mood: 'amused', text: 'Robert thinks fire illuminates. It only creates more shadows for me.', weight: 14, purpose: 'lore' },
  { id: 'peter-exp-lore-10', entitySlug: 'peter', pool: 'lore', mood: 'cryptic', text: 'The best-hidden things are in plain sight. Most cannot see past their own light.', weight: 16, purpose: 'lore' },

  // Reactions
  { id: 'peter-exp-react-1', entitySlug: 'peter', pool: 'reaction', mood: 'pleased', text: 'Silent. Efficient. The shadows approve.', weight: 14, purpose: 'ambient' },
  { id: 'peter-exp-react-2', entitySlug: 'peter', pool: 'reaction', mood: 'neutral', text: 'Unseen until the last moment. Textbook execution.', weight: 13, purpose: 'ambient' },
  { id: 'peter-exp-react-3', entitySlug: 'peter', pool: 'reaction', mood: 'amused', text: 'They never saw it coming. Neither did I, honestly.', weight: 12, purpose: 'ambient' },
  { id: 'peter-exp-react-4', entitySlug: 'peter', pool: 'reaction', mood: 'cryptic', text: 'The dice whisper their results before they land. Did you hear them?', weight: 15, purpose: 'ambient' },
  { id: 'peter-exp-react-5', entitySlug: 'peter', pool: 'reaction', mood: 'pleased', text: 'From the shadows, through the shadows, back to shadows.', weight: 16, purpose: 'ambient' },
  { id: 'peter-exp-react-6', entitySlug: 'peter', pool: 'reaction', mood: 'neutral', text: 'A clean strike. No witnesses. Perfect.', weight: 14, purpose: 'ambient' },
  { id: 'peter-exp-react-7', entitySlug: 'peter', pool: 'reaction', mood: 'amused', text: 'The guardian looked right at you and saw nothing. Impressive.', weight: 15, purpose: 'ambient' },
  { id: 'peter-exp-react-8', entitySlug: 'peter', pool: 'reaction', mood: 'cryptic', text: 'What was that? Just shadows. Always just shadows.', weight: 11, purpose: 'ambient' },

  // Combat observations
  { id: 'peter-exp-combat-1', entitySlug: 'peter', pool: 'reaction', mood: 'neutral', text: 'The meteor falls unseen. The impact is very seen.', weight: 13, purpose: 'ambient' },
  { id: 'peter-exp-combat-2', entitySlug: 'peter', pool: 'reaction', mood: 'pleased', text: 'Strike from the blind spot. Classic shadow technique.', weight: 15, purpose: 'ambient' },
  { id: 'peter-exp-combat-3', entitySlug: 'peter', pool: 'reaction', mood: 'amused', text: 'The guardians are looking the wrong way. As always.', weight: 12, purpose: 'ambient' },
  { id: 'peter-exp-combat-4', entitySlug: 'peter', pool: 'reaction', mood: 'neutral', text: 'Another target eliminated from the shadows.', weight: 14, purpose: 'ambient' },

  // Hints
  { id: 'peter-exp-hint-1', entitySlug: 'peter', pool: 'hint', mood: 'neutral', text: 'The next zone has blind spots. I have marked them for you.', weight: 15, purpose: 'warning' },
  { id: 'peter-exp-hint-2', entitySlug: 'peter', pool: 'hint', mood: 'cryptic', text: 'Look where the light does not reach. The answer hides there.', weight: 14, purpose: 'warning' },
  { id: 'peter-exp-hint-3', entitySlug: 'peter', pool: 'hint', mood: 'pleased', text: 'Patience. The best opportunities reveal themselves to those who wait.', weight: 16, purpose: 'tutorial' },
  { id: 'peter-exp-hint-4', entitySlug: 'peter', pool: 'hint', mood: 'neutral', text: 'Sometimes the held dice are more valuable than the thrown ones.', weight: 13, purpose: 'tutorial' },

  // Idle
  { id: 'peter-exp-idle-1', entitySlug: 'peter', pool: 'idle', mood: 'cryptic', text: 'The shadows shift. Something approaches.', weight: 10, purpose: 'ambient' },
  { id: 'peter-exp-idle-2', entitySlug: 'peter', pool: 'idle', mood: 'neutral', text: 'Waiting in darkness is my specialty.', weight: 11, purpose: 'ambient' },
  { id: 'peter-exp-idle-3', entitySlug: 'peter', pool: 'idle', mood: 'amused', text: 'Do not mind me. I am barely here.', weight: 12, purpose: 'ambient' },
];

// ============================================
// ROBERT - Die-rector of Infernus (d10)
// ============================================

export const ROBERT_EXPANDED: ResponseTemplate[] = [
  // Fire greetings
  { id: 'robert-exp-greet-1', entitySlug: 'robert', pool: 'greeting', mood: 'neutral', text: 'Welcome to Infernus. Everything burns here. Eventually.', weight: 13, purpose: 'ambient' },
  { id: 'robert-exp-greet-2', entitySlug: 'robert', pool: 'greeting', mood: 'threatening', text: 'You dare enter my domain? Bold. I respect bold.', weight: 15, purpose: 'ambient' },
  { id: 'robert-exp-greet-3', entitySlug: 'robert', pool: 'greeting', mood: 'amused', text: 'Back for more punishment? I like the dedication.', weight: 14, purpose: 'ambient' },
  { id: 'robert-exp-greet-4', entitySlug: 'robert', pool: 'greeting', mood: 'neutral', text: 'The flames whisper your name. They remember your last visit.', weight: 12, purpose: 'ambient' },
  { id: 'robert-exp-greet-5', entitySlug: 'robert', pool: 'greeting', mood: 'pleased', text: 'A survivor returns. The fire has not claimed you yet.', weight: 16, purpose: 'ambient' },
  { id: 'robert-exp-greet-6', entitySlug: 'robert', pool: 'greeting', mood: 'threatening', text: 'Ten sides. Ten ways to burn. Choose your destruction.', weight: 17, purpose: 'ambient' },
  { id: 'robert-exp-greet-7', entitySlug: 'robert', pool: 'greeting', mood: 'amused', text: 'Still standing? The dice must favor you. For now.', weight: 13, purpose: 'ambient' },
  { id: 'robert-exp-greet-8', entitySlug: 'robert', pool: 'greeting', mood: 'pleased', text: 'You return to the forge. Ready to be tempered?', weight: 15, purpose: 'ambient' },

  // Fire lore
  { id: 'robert-exp-lore-1', entitySlug: 'robert', pool: 'lore', mood: 'neutral', text: 'Fire does not destroy. It transforms. Ask anyone who has burned.', weight: 15, purpose: 'lore' },
  { id: 'robert-exp-lore-2', entitySlug: 'robert', pool: 'lore', mood: 'threatening', text: 'The d10 is raw power. No tricks, no subtlety. Just force.', weight: 16, purpose: 'lore' },
  { id: 'robert-exp-lore-3', entitySlug: 'robert', pool: 'lore', mood: 'amused', text: 'Peter hides in shadows. I burn them away. Simple solution.', weight: 14, purpose: 'lore' },
  { id: 'robert-exp-lore-4', entitySlug: 'robert', pool: 'lore', mood: 'neutral', text: 'Infernus is not hell. Hell is a metaphor. Infernus is real heat.', weight: 15, purpose: 'lore' },
  { id: 'robert-exp-lore-5', entitySlug: 'robert', pool: 'lore', mood: 'pleased', text: 'Every die roll is a spark. Every critical hit is an inferno.', weight: 17, purpose: 'lore' },
  { id: 'robert-exp-lore-6', entitySlug: 'robert', pool: 'lore', mood: 'threatening', text: 'The other Die-rectors fear me. As they should.', weight: 16, purpose: 'lore' },
  { id: 'robert-exp-lore-7', entitySlug: 'robert', pool: 'lore', mood: 'generous', text: 'A truth, since you survived this long: the hottest flames burn invisible.', weight: 20, purpose: 'lore', cooldown: { oncePerRun: true } },
  { id: 'robert-exp-lore-8', entitySlug: 'robert', pool: 'lore', mood: 'amused', text: 'John builds. I melt. We have an understanding.', weight: 13, purpose: 'lore' },
  { id: 'robert-exp-lore-9', entitySlug: 'robert', pool: 'lore', mood: 'neutral', text: 'Guardians made of fire cannot be extinguished. Only contained.', weight: 14, purpose: 'lore' },
  { id: 'robert-exp-lore-10', entitySlug: 'robert', pool: 'lore', mood: 'threatening', text: 'The meteor brings impact. I bring the aftermath.', weight: 15, purpose: 'lore' },

  // Reactions
  { id: 'robert-exp-react-1', entitySlug: 'robert', pool: 'reaction', mood: 'pleased', text: 'YES. That is how it is done. Burn it all.', weight: 16, purpose: 'ambient' },
  { id: 'robert-exp-react-2', entitySlug: 'robert', pool: 'reaction', mood: 'amused', text: 'Destruction is beautiful when done properly.', weight: 14, purpose: 'ambient' },
  { id: 'robert-exp-react-3', entitySlug: 'robert', pool: 'reaction', mood: 'threatening', text: 'More. The flames demand more.', weight: 13, purpose: 'ambient' },
  { id: 'robert-exp-react-4', entitySlug: 'robert', pool: 'reaction', mood: 'neutral', text: 'The impact resonates. Even I felt that one.', weight: 12, purpose: 'ambient' },
  { id: 'robert-exp-react-5', entitySlug: 'robert', pool: 'reaction', mood: 'pleased', text: 'Now that is a proper explosion. Well done.', weight: 17, purpose: 'ambient' },
  { id: 'robert-exp-react-6', entitySlug: 'robert', pool: 'reaction', mood: 'amused', text: 'The guardians scatter like embers. Beautiful.', weight: 15, purpose: 'ambient' },
  { id: 'robert-exp-react-7', entitySlug: 'robert', pool: 'reaction', mood: 'neutral', text: 'Heat signature confirmed. Target eliminated.', weight: 11, purpose: 'ambient' },
  { id: 'robert-exp-react-8', entitySlug: 'robert', pool: 'reaction', mood: 'pleased', text: 'The forge approves. You have earned your heat.', weight: 16, purpose: 'ambient' },

  // Combat observations
  { id: 'robert-exp-combat-1', entitySlug: 'robert', pool: 'reaction', mood: 'pleased', text: 'That crater is still smoking. Excellent work.', weight: 15, purpose: 'ambient' },
  { id: 'robert-exp-combat-2', entitySlug: 'robert', pool: 'reaction', mood: 'threatening', text: 'The planet bleeds fire. As it should.', weight: 14, purpose: 'ambient' },
  { id: 'robert-exp-combat-3', entitySlug: 'robert', pool: 'reaction', mood: 'amused', text: 'Guardian armor? Melted. Predictable outcome.', weight: 13, purpose: 'ambient' },
  { id: 'robert-exp-combat-4', entitySlug: 'robert', pool: 'reaction', mood: 'neutral', text: 'Impact confirmed. Commencing burn phase.', weight: 12, purpose: 'ambient' },

  // Threats and challenges
  { id: 'robert-exp-threat-1', entitySlug: 'robert', pool: 'threat', mood: 'threatening', text: 'Fail me, and the flames will remember. They always remember.', weight: 15, purpose: 'warning' },
  { id: 'robert-exp-threat-2', entitySlug: 'robert', pool: 'threat', mood: 'threatening', text: 'The next zone burns hotter. Do not disappoint.', weight: 14, purpose: 'warning' },
  { id: 'robert-exp-challenge-1', entitySlug: 'robert', pool: 'challenge', mood: 'threatening', text: 'Prove yourself. Clear the zone without flinching.', weight: 16, purpose: 'challenge' },
  { id: 'robert-exp-hint-1', entitySlug: 'robert', pool: 'hint', mood: 'neutral', text: 'Fire spreads to adjacent zones. Use this.', weight: 14, purpose: 'tutorial' },
  { id: 'robert-exp-hint-2', entitySlug: 'robert', pool: 'hint', mood: 'pleased', text: 'High rolls trigger chain reactions. Aim for clusters.', weight: 16, purpose: 'tutorial' },

  // Idle
  { id: 'robert-exp-idle-1', entitySlug: 'robert', pool: 'idle', mood: 'neutral', text: 'The flames wait. They are patient when they must be.', weight: 10, purpose: 'ambient' },
  { id: 'robert-exp-idle-2', entitySlug: 'robert', pool: 'idle', mood: 'threatening', text: 'Do not keep me waiting. Fire grows restless.', weight: 12, purpose: 'ambient' },
];

// ============================================
// ALICE - Die-rector of Frost Reach (d12)
// ============================================

export const ALICE_EXPANDED: ResponseTemplate[] = [
  // Ice greetings
  { id: 'alice-exp-greet-1', entitySlug: 'alice', pool: 'greeting', mood: 'neutral', text: 'Welcome to Frost Reach. The cold here is not cruel. It is honest.', weight: 13, purpose: 'ambient' },
  { id: 'alice-exp-greet-2', entitySlug: 'alice', pool: 'greeting', mood: 'neutral', text: 'You return. The ice remembers every visitor.', weight: 12, purpose: 'ambient' },
  { id: 'alice-exp-greet-3', entitySlug: 'alice', pool: 'greeting', mood: 'pleased', text: 'Your resolve is admirable. Few return to the cold willingly.', weight: 15, purpose: 'ambient' },
  { id: 'alice-exp-greet-4', entitySlug: 'alice', pool: 'greeting', mood: 'neutral', text: 'The d12 has twelve faces. Each one is precise. As am I.', weight: 14, purpose: 'ambient' },
  { id: 'alice-exp-greet-5', entitySlug: 'alice', pool: 'greeting', mood: 'cryptic', text: 'Cold slows thought. Sometimes slow thoughts are the wisest.', weight: 16, purpose: 'ambient' },
  { id: 'alice-exp-greet-6', entitySlug: 'alice', pool: 'greeting', mood: 'pleased', text: 'A familiar face among the frost. The chill welcomes you.', weight: 15, purpose: 'ambient' },
  { id: 'alice-exp-greet-7', entitySlug: 'alice', pool: 'greeting', mood: 'neutral', text: 'Frost Reach preserves what others destroy. Enter, and be preserved.', weight: 13, purpose: 'ambient' },
  { id: 'alice-exp-greet-8', entitySlug: 'alice', pool: 'greeting', mood: 'generous', text: 'The ice has softened for you. This is rare. Be grateful.', weight: 18, purpose: 'ambient' },

  // Ice lore
  { id: 'alice-exp-lore-1', entitySlug: 'alice', pool: 'lore', mood: 'neutral', text: 'Fire transforms. Ice preserves. Both are change, differently applied.', weight: 15, purpose: 'lore' },
  { id: 'alice-exp-lore-2', entitySlug: 'alice', pool: 'lore', mood: 'cryptic', text: 'Robert burns without thought. I freeze with precision. We are opposites.', weight: 16, purpose: 'lore' },
  { id: 'alice-exp-lore-3', entitySlug: 'alice', pool: 'lore', mood: 'neutral', text: 'The dodecahedron is geometry perfected. Twelve faces, infinite potential.', weight: 17, purpose: 'lore' },
  { id: 'alice-exp-lore-4', entitySlug: 'alice', pool: 'lore', mood: 'pleased', text: 'Cold is not absence of heat. It is presence of clarity.', weight: 14, purpose: 'lore' },
  { id: 'alice-exp-lore-5', entitySlug: 'alice', pool: 'lore', mood: 'neutral', text: 'The guardians of Frost Reach are frozen warriors. Once alive. Now eternal.', weight: 15, purpose: 'lore' },
  { id: 'alice-exp-lore-6', entitySlug: 'alice', pool: 'lore', mood: 'cryptic', text: 'Time moves slowly here. Intentionally. Haste is the enemy of precision.', weight: 16, purpose: 'lore' },
  { id: 'alice-exp-lore-7', entitySlug: 'alice', pool: 'lore', mood: 'generous', text: 'A secret: the coldest place is not my domain. It is the space between The One\'s words.', weight: 20, purpose: 'lore', cooldown: { oncePerRun: true } },
  { id: 'alice-exp-lore-8', entitySlug: 'alice', pool: 'lore', mood: 'neutral', text: 'Ice crystals form perfect patterns. The universe at its most honest.', weight: 13, purpose: 'lore' },
  { id: 'alice-exp-lore-9', entitySlug: 'alice', pool: 'lore', mood: 'pleased', text: 'Jane embraces chaos. I embrace order. The cosmos needs both.', weight: 15, purpose: 'lore' },
  { id: 'alice-exp-lore-10', entitySlug: 'alice', pool: 'lore', mood: 'neutral', text: 'Everything is clearer when frozen. Memory. Intent. Regret.', weight: 14, purpose: 'lore' },

  // Reactions
  { id: 'alice-exp-react-1', entitySlug: 'alice', pool: 'reaction', mood: 'pleased', text: 'Precisely executed. The ice approves.', weight: 15, purpose: 'ambient' },
  { id: 'alice-exp-react-2', entitySlug: 'alice', pool: 'reaction', mood: 'neutral', text: 'A calculated strike. Efficiency noted.', weight: 13, purpose: 'ambient' },
  { id: 'alice-exp-react-3', entitySlug: 'alice', pool: 'reaction', mood: 'cryptic', text: 'The target shatters like frost on morning glass.', weight: 14, purpose: 'ambient' },
  { id: 'alice-exp-react-4', entitySlug: 'alice', pool: 'reaction', mood: 'pleased', text: 'Cold and precise. You are learning my ways.', weight: 16, purpose: 'ambient' },
  { id: 'alice-exp-react-5', entitySlug: 'alice', pool: 'reaction', mood: 'neutral', text: 'Impact registered. Calculating optimal next target.', weight: 12, purpose: 'ambient' },
  { id: 'alice-exp-react-6', entitySlug: 'alice', pool: 'reaction', mood: 'pleased', text: 'Crystalline perfection in destruction. Beautiful.', weight: 17, purpose: 'ambient' },
  { id: 'alice-exp-react-7', entitySlug: 'alice', pool: 'reaction', mood: 'neutral', text: 'The zone freezes in the wake of impact. As expected.', weight: 11, purpose: 'ambient' },
  { id: 'alice-exp-react-8', entitySlug: 'alice', pool: 'reaction', mood: 'cryptic', text: 'Each throw leaves a pattern. Yours is becoming elegant.', weight: 15, purpose: 'ambient' },

  // Combat observations
  { id: 'alice-exp-combat-1', entitySlug: 'alice', pool: 'reaction', mood: 'neutral', text: 'The guardian crystallizes mid-motion. Frozen forever.', weight: 14, purpose: 'ambient' },
  { id: 'alice-exp-combat-2', entitySlug: 'alice', pool: 'reaction', mood: 'pleased', text: 'Clean elimination. No wasted energy. Textbook frost.', weight: 16, purpose: 'ambient' },
  { id: 'alice-exp-combat-3', entitySlug: 'alice', pool: 'reaction', mood: 'neutral', text: 'The planet surface cracks like thin ice. Satisfying.', weight: 13, purpose: 'ambient' },
  { id: 'alice-exp-combat-4', entitySlug: 'alice', pool: 'reaction', mood: 'cryptic', text: 'In cold, all motion eventually ceases. You are hastening the process.', weight: 15, purpose: 'ambient' },

  // Hints
  { id: 'alice-exp-hint-1', entitySlug: 'alice', pool: 'hint', mood: 'neutral', text: 'Frozen targets shatter on impact. Aim for the ice patches.', weight: 15, purpose: 'tutorial' },
  { id: 'alice-exp-hint-2', entitySlug: 'alice', pool: 'hint', mood: 'pleased', text: 'Patience yields precision. Wait for the perfect moment.', weight: 16, purpose: 'tutorial' },
  { id: 'alice-exp-hint-3', entitySlug: 'alice', pool: 'hint', mood: 'neutral', text: 'The next zone has brittle defenses. A single strong throw will cascade.', weight: 14, purpose: 'warning' },
  { id: 'alice-exp-hint-4', entitySlug: 'alice', pool: 'hint', mood: 'cryptic', text: 'Cold slows guardians. Use this to your advantage.', weight: 13, purpose: 'warning' },

  // Idle
  { id: 'alice-exp-idle-1', entitySlug: 'alice', pool: 'idle', mood: 'neutral', text: 'The frost waits. Waiting is its nature.', weight: 10, purpose: 'ambient' },
  { id: 'alice-exp-idle-2', entitySlug: 'alice', pool: 'idle', mood: 'cryptic', text: 'Ice forms slowly. Perfection cannot be rushed.', weight: 11, purpose: 'ambient' },
  { id: 'alice-exp-idle-3', entitySlug: 'alice', pool: 'idle', mood: 'neutral', text: 'Even stillness has momentum. In the right direction.', weight: 12, purpose: 'ambient' },
];

// ============================================
// JANE - Die-rector of Aberrant (d20)
// ============================================

export const JANE_EXPANDED: ResponseTemplate[] = [
  // Chaos greetings
  { id: 'jane-exp-greet-1', entitySlug: 'jane', pool: 'greeting', mood: 'amused', text: 'WELCOME TO CHAOS. The rules here are simple: there are none.', weight: 14, purpose: 'ambient' },
  { id: 'jane-exp-greet-2', entitySlug: 'jane', pool: 'greeting', mood: 'cryptic', text: 'You return! Or do you arrive for the first time? Time is weird here.', weight: 15, purpose: 'ambient' },
  { id: 'jane-exp-greet-3', entitySlug: 'jane', pool: 'greeting', mood: 'amused', text: 'Twenty sides! Twenty possibilities! Which one will you roll?', weight: 16, purpose: 'ambient' },
  { id: 'jane-exp-greet-4', entitySlug: 'jane', pool: 'greeting', mood: 'cryptic', text: 'The d20 is pure potential. Critical hit or critical miss. No middle ground.', weight: 17, purpose: 'ambient' },
  { id: 'jane-exp-greet-5', entitySlug: 'jane', pool: 'greeting', mood: 'pleased', text: 'Someone who enjoys uncertainty! Finally! A kindred spirit!', weight: 18, purpose: 'ambient' },
  { id: 'jane-exp-greet-6', entitySlug: 'jane', pool: 'greeting', mood: 'amused', text: 'The other Die-rectors have rules. I have... suggestions.', weight: 13, purpose: 'ambient' },
  { id: 'jane-exp-greet-7', entitySlug: 'jane', pool: 'greeting', mood: 'cryptic', text: 'Aberrant is not disorder. It is order that refuses to repeat.', weight: 15, purpose: 'ambient' },
  { id: 'jane-exp-greet-8', entitySlug: 'jane', pool: 'greeting', mood: 'pleased', text: 'You look different. Mutated, maybe? I approve!', weight: 14, purpose: 'ambient' },

  // Chaos lore
  { id: 'jane-exp-lore-1', entitySlug: 'jane', pool: 'lore', mood: 'amused', text: 'Alice counts. Robert burns. Peter hides. John builds. I remix them all.', weight: 15, purpose: 'lore' },
  { id: 'jane-exp-lore-2', entitySlug: 'jane', pool: 'lore', mood: 'cryptic', text: 'The icosahedron is the shape of infinite faces. Most cannot count them all.', weight: 16, purpose: 'lore' },
  { id: 'jane-exp-lore-3', entitySlug: 'jane', pool: 'lore', mood: 'amused', text: 'Mutation is just evolution with impatience. I am very impatient.', weight: 14, purpose: 'lore' },
  { id: 'jane-exp-lore-4', entitySlug: 'jane', pool: 'lore', mood: 'cryptic', text: 'Aberrant is not a domain. It is the space where all domains intersect... badly.', weight: 17, purpose: 'lore' },
  { id: 'jane-exp-lore-5', entitySlug: 'jane', pool: 'lore', mood: 'pleased', text: 'The One speaks of patterns. I speak of anti-patterns. Much more interesting.', weight: 16, purpose: 'lore' },
  { id: 'jane-exp-lore-6', entitySlug: 'jane', pool: 'lore', mood: 'amused', text: 'My guardians mutate every time you look at them. Keeps things fresh.', weight: 15, purpose: 'lore' },
  { id: 'jane-exp-lore-7', entitySlug: 'jane', pool: 'lore', mood: 'generous', text: 'A truth that may be a lie: the domains were once one. I was the one who split them.', weight: 20, purpose: 'lore', cooldown: { oncePerRun: true } },
  { id: 'jane-exp-lore-8', entitySlug: 'jane', pool: 'lore', mood: 'cryptic', text: 'Random is not chaos. Random is lazy. True chaos requires intention.', weight: 14, purpose: 'lore' },
  { id: 'jane-exp-lore-9', entitySlug: 'jane', pool: 'lore', mood: 'amused', text: 'Every critical hit is a small miracle. Every critical miss is a bigger one.', weight: 15, purpose: 'lore' },
  { id: 'jane-exp-lore-10', entitySlug: 'jane', pool: 'lore', mood: 'cryptic', text: 'The d20 decides everything. And nothing. Simultaneously.', weight: 16, purpose: 'lore' },

  // Reactions
  { id: 'jane-exp-react-1', entitySlug: 'jane', pool: 'reaction', mood: 'amused', text: 'UNEXPECTED! And therefore, perfect!', weight: 16, purpose: 'ambient' },
  { id: 'jane-exp-react-2', entitySlug: 'jane', pool: 'reaction', mood: 'pleased', text: 'That was beautiful chaos! Do it again!', weight: 15, purpose: 'ambient' },
  { id: 'jane-exp-react-3', entitySlug: 'jane', pool: 'reaction', mood: 'cryptic', text: 'The probability of that was... incalculable. Which is how I like it.', weight: 14, purpose: 'ambient' },
  { id: 'jane-exp-react-4', entitySlug: 'jane', pool: 'reaction', mood: 'amused', text: 'Even I did not see that coming. And I never see anything coming!', weight: 17, purpose: 'ambient' },
  { id: 'jane-exp-react-5', entitySlug: 'jane', pool: 'reaction', mood: 'pleased', text: 'CHAOS APPROVES. Continue with the mayhem.', weight: 16, purpose: 'ambient' },
  { id: 'jane-exp-react-6', entitySlug: 'jane', pool: 'reaction', mood: 'amused', text: 'Delightfully unpredictable! You are learning!', weight: 14, purpose: 'ambient' },
  { id: 'jane-exp-react-7', entitySlug: 'jane', pool: 'reaction', mood: 'cryptic', text: 'The impact ripples through possibilities. Some of them are screaming.', weight: 13, purpose: 'ambient' },
  { id: 'jane-exp-react-8', entitySlug: 'jane', pool: 'reaction', mood: 'pleased', text: 'That throw violated at least three laws of physics. Excellent!', weight: 18, purpose: 'ambient' },

  // Combat observations
  { id: 'jane-exp-combat-1', entitySlug: 'jane', pool: 'reaction', mood: 'amused', text: 'The guardian mutates mid-death. I love when that happens!', weight: 15, purpose: 'ambient' },
  { id: 'jane-exp-combat-2', entitySlug: 'jane', pool: 'reaction', mood: 'pleased', text: 'The crater is already growing tentacles. That was fast.', weight: 14, purpose: 'ambient' },
  { id: 'jane-exp-combat-3', entitySlug: 'jane', pool: 'reaction', mood: 'cryptic', text: 'Impact creates mutation. Mutation creates opportunity. Opportunity creates chaos.', weight: 16, purpose: 'ambient' },
  { id: 'jane-exp-combat-4', entitySlug: 'jane', pool: 'reaction', mood: 'amused', text: 'Another zone destabilized! The anti-pattern spreads!', weight: 13, purpose: 'ambient' },

  // Hints (chaotic)
  { id: 'jane-exp-hint-1', entitySlug: 'jane', pool: 'hint', mood: 'amused', text: 'Hint: there is no hint. Or maybe that is the hint. Who knows!', weight: 12, purpose: 'ambient' },
  { id: 'jane-exp-hint-2', entitySlug: 'jane', pool: 'hint', mood: 'cryptic', text: 'The next zone might help you. Or devour you. Roll the dice!', weight: 14, purpose: 'warning' },
  { id: 'jane-exp-hint-3', entitySlug: 'jane', pool: 'hint', mood: 'pleased', text: 'Actual advice: embrace randomness. It is the only constant here.', weight: 16, purpose: 'tutorial' },
  { id: 'jane-exp-hint-4', entitySlug: 'jane', pool: 'hint', mood: 'amused', text: 'Big dice equal big swings. Small dice equal small certainties. Choose wisely!', weight: 15, purpose: 'tutorial' },

  // Idle
  { id: 'jane-exp-idle-1', entitySlug: 'jane', pool: 'idle', mood: 'amused', text: 'Waiting is boring. Let\'s mutate something.', weight: 12, purpose: 'ambient' },
  { id: 'jane-exp-idle-2', entitySlug: 'jane', pool: 'idle', mood: 'cryptic', text: 'Even stillness is chaos slowed down.', weight: 10, purpose: 'ambient' },
  { id: 'jane-exp-idle-3', entitySlug: 'jane', pool: 'idle', mood: 'amused', text: 'I am practicing patience. It keeps mutating into impatience.', weight: 14, purpose: 'ambient' },
];

// ============================================
// WANDERERS (General Travelers)
// ============================================

export const WANDERER_EXPANDED: ResponseTemplate[] = [
  // General wanderer greetings
  { id: 'wanderer-exp-greet-1', entitySlug: 'the-general-wanderer', pool: 'greeting', mood: 'neutral', text: 'Another traveler on the road. The domains are restless today.', weight: 12, purpose: 'ambient' },
  { id: 'wanderer-exp-greet-2', entitySlug: 'the-general-wanderer', pool: 'greeting', mood: 'neutral', text: 'Watch your step. The ground here remembers meteor strikes.', weight: 13, purpose: 'ambient' },
  { id: 'wanderer-exp-greet-3', entitySlug: 'the-general-wanderer', pool: 'greeting', mood: 'pleased', text: 'You look like someone who knows how to throw. Care to trade stories?', weight: 14, purpose: 'ambient' },
  { id: 'wanderer-exp-greet-4', entitySlug: 'the-general-wanderer', pool: 'greeting', mood: 'neutral', text: 'The Die-rectors are watching. They always are.', weight: 11, purpose: 'ambient' },
  { id: 'wanderer-exp-greet-5', entitySlug: 'the-general-wanderer', pool: 'greeting', mood: 'cryptic', text: 'I have seen many come through here. Fewer leave.', weight: 15, purpose: 'ambient' },
  { id: 'wanderer-exp-greet-6', entitySlug: 'the-general-wanderer', pool: 'greeting', mood: 'neutral', text: 'Rest if you need to. The next zone will not wait.', weight: 12, purpose: 'ambient' },
  { id: 'wanderer-exp-greet-7', entitySlug: 'the-general-wanderer', pool: 'greeting', mood: 'pleased', text: 'A familiar face! The domains have been kind to you.', weight: 16, purpose: 'ambient' },
  { id: 'wanderer-exp-greet-8', entitySlug: 'the-general-wanderer', pool: 'greeting', mood: 'neutral', text: 'I wander between domains. You wander between throws. We are alike.', weight: 13, purpose: 'ambient' },

  // Wanderer observations
  { id: 'wanderer-exp-react-1', entitySlug: 'the-general-wanderer', pool: 'reaction', mood: 'neutral', text: 'Good throw. The planet remembers such impacts.', weight: 12, purpose: 'ambient' },
  { id: 'wanderer-exp-react-2', entitySlug: 'the-general-wanderer', pool: 'reaction', mood: 'pleased', text: 'I have traveled far. That was worth witnessing.', weight: 14, purpose: 'ambient' },
  { id: 'wanderer-exp-react-3', entitySlug: 'the-general-wanderer', pool: 'reaction', mood: 'neutral', text: 'The guardians scatter. They know a strong arm when they see one.', weight: 13, purpose: 'ambient' },
  { id: 'wanderer-exp-react-4', entitySlug: 'the-general-wanderer', pool: 'reaction', mood: 'cryptic', text: 'Every throw tells a story. Yours is getting interesting.', weight: 15, purpose: 'ambient' },
  { id: 'wanderer-exp-react-5', entitySlug: 'the-general-wanderer', pool: 'reaction', mood: 'neutral', text: 'Another crater in the collection. The domains keep score.', weight: 11, purpose: 'ambient' },

  // Wanderer hints
  { id: 'wanderer-exp-hint-1', entitySlug: 'the-general-wanderer', pool: 'hint', mood: 'neutral', text: 'The road ahead is treacherous. But then, so was the road behind.', weight: 13, purpose: 'warning' },
  { id: 'wanderer-exp-hint-2', entitySlug: 'the-general-wanderer', pool: 'hint', mood: 'pleased', text: 'A word of advice: the Die-rectors favor those who adapt.', weight: 15, purpose: 'tutorial' },
  { id: 'wanderer-exp-hint-3', entitySlug: 'the-general-wanderer', pool: 'hint', mood: 'neutral', text: 'I have heard rumors of treasures in the next zone. But also traps.', weight: 14, purpose: 'warning' },
  { id: 'wanderer-exp-hint-4', entitySlug: 'the-general-wanderer', pool: 'hint', mood: 'cryptic', text: 'Trust the dice. Distrust everything else.', weight: 12, purpose: 'ambient' },

  // Lore from the road
  { id: 'wanderer-exp-lore-1', entitySlug: 'the-general-wanderer', pool: 'lore', mood: 'neutral', text: 'The domains used to be connected. Now they only share borders, and grudges.', weight: 14, purpose: 'lore' },
  { id: 'wanderer-exp-lore-2', entitySlug: 'the-general-wanderer', pool: 'lore', mood: 'cryptic', text: 'I have walked all six domains. Each Die-rector has their price.', weight: 15, purpose: 'lore' },
  { id: 'wanderer-exp-lore-3', entitySlug: 'the-general-wanderer', pool: 'lore', mood: 'neutral', text: 'The guardians were not always hostile. Something changed them.', weight: 13, purpose: 'lore' },
  { id: 'wanderer-exp-lore-4', entitySlug: 'the-general-wanderer', pool: 'lore', mood: 'pleased', text: 'They say the NEVER DIE GUY is just a legend. I am not so sure.', weight: 16, purpose: 'lore' },
];

// ============================================
// TRAVELERS (Various merchants and helpers)
// ============================================

export const TRAVELER_EXPANDED: ResponseTemplate[] = [
  // Traveler greetings
  { id: 'traveler-exp-greet-1', entitySlug: 'the-general-traveler', pool: 'greeting', mood: 'neutral', text: 'Wares for the weary. Deals for the daring. What do you need?', weight: 13, purpose: 'shop' },
  { id: 'traveler-exp-greet-2', entitySlug: 'the-general-traveler', pool: 'greeting', mood: 'pleased', text: 'A customer! The domains have smiled upon me today.', weight: 14, purpose: 'ambient' },
  { id: 'traveler-exp-greet-3', entitySlug: 'the-general-traveler', pool: 'greeting', mood: 'neutral', text: 'I travel between zones selling what others discard. Interested?', weight: 12, purpose: 'shop' },
  { id: 'traveler-exp-greet-4', entitySlug: 'the-general-traveler', pool: 'greeting', mood: 'amused', text: 'You look like someone who appreciates a bargain. Am I wrong?', weight: 15, purpose: 'shop' },
  { id: 'traveler-exp-greet-5', entitySlug: 'the-general-traveler', pool: 'greeting', mood: 'neutral', text: 'The dice brought us together. Perhaps fate has a purchase in mind.', weight: 13, purpose: 'ambient' },
  { id: 'traveler-exp-greet-6', entitySlug: 'the-general-traveler', pool: 'greeting', mood: 'pleased', text: 'Back again! I saved something special for returning customers.', weight: 16, purpose: 'shop' },
  { id: 'traveler-exp-greet-7', entitySlug: 'the-general-traveler', pool: 'greeting', mood: 'neutral', text: 'Supplies for the road. Information for the curious. Take your pick.', weight: 12, purpose: 'shop' },
  { id: 'traveler-exp-greet-8', entitySlug: 'the-general-traveler', pool: 'greeting', mood: 'amused', text: 'In this economy? You need every advantage. I have advantages for sale.', weight: 14, purpose: 'shop' },

  // Sales pitches
  { id: 'traveler-exp-sales-1', entitySlug: 'the-general-traveler', pool: 'salesPitch', mood: 'neutral', text: 'Fresh stock from the last domain. Better than what the guardians dropped.', weight: 14, purpose: 'shop' },
  { id: 'traveler-exp-sales-2', entitySlug: 'the-general-traveler', pool: 'salesPitch', mood: 'pleased', text: 'I acquired something rare. A meteor that landed soft. Interested?', weight: 15, purpose: 'shop' },
  { id: 'traveler-exp-sales-3', entitySlug: 'the-general-traveler', pool: 'salesPitch', mood: 'neutral', text: 'Dice modifications. Subtle improvements. No one will know but you.', weight: 13, purpose: 'shop' },
  { id: 'traveler-exp-sales-4', entitySlug: 'the-general-traveler', pool: 'salesPitch', mood: 'amused', text: 'The Die-rectors do not like me selling this. Which means you need it.', weight: 16, purpose: 'shop' },
  { id: 'traveler-exp-sales-5', entitySlug: 'the-general-traveler', pool: 'salesPitch', mood: 'neutral', text: 'Protective gear. Lucky charms. Questionable snacks. All on sale.', weight: 12, purpose: 'shop' },

  // Reactions
  { id: 'traveler-exp-react-1', entitySlug: 'the-general-traveler', pool: 'reaction', mood: 'pleased', text: 'That throw would fetch a good price at the market. If you could bottle it.', weight: 13, purpose: 'ambient' },
  { id: 'traveler-exp-react-2', entitySlug: 'the-general-traveler', pool: 'reaction', mood: 'neutral', text: 'Impressive damage. Perhaps I should charge you more.', weight: 14, purpose: 'ambient' },
  { id: 'traveler-exp-react-3', entitySlug: 'the-general-traveler', pool: 'reaction', mood: 'amused', text: 'I have seen many throws. That one will be remembered.', weight: 15, purpose: 'ambient' },
  { id: 'traveler-exp-react-4', entitySlug: 'the-general-traveler', pool: 'reaction', mood: 'neutral', text: 'The guardians scatter. Business opportunities increase.', weight: 11, purpose: 'ambient' },

  // Hints
  { id: 'traveler-exp-hint-1', entitySlug: 'the-general-traveler', pool: 'hint', mood: 'neutral', text: 'Free advice: the next zone has merchants who charge triple. Buy here.', weight: 14, purpose: 'shop' },
  { id: 'traveler-exp-hint-2', entitySlug: 'the-general-traveler', pool: 'hint', mood: 'pleased', text: 'Between you and me, the guardians ahead are weak to held dice.', weight: 15, purpose: 'warning' },
  { id: 'traveler-exp-hint-3', entitySlug: 'the-general-traveler', pool: 'hint', mood: 'neutral', text: 'Overheard from a wanderer: the target zone shifts at high scores.', weight: 13, purpose: 'tutorial' },

  // Idle
  { id: 'traveler-exp-idle-1', entitySlug: 'the-general-traveler', pool: 'idle', mood: 'neutral', text: 'The market waits. Take your time. Or do not.', weight: 10, purpose: 'ambient' },
  { id: 'traveler-exp-idle-2', entitySlug: 'the-general-traveler', pool: 'idle', mood: 'amused', text: 'Even merchants need rest. But I can take your coin while sitting.', weight: 11, purpose: 'ambient' },
];

// ============================================
// WILLY - Cheerful Skeleton Merchant
// ============================================

export const WILLY_EXPANDED: ResponseTemplate[] = [
  // Cheerful greetings
  { id: 'willy-exp-greet-1', entitySlug: 'willy', pool: 'greeting', mood: 'pleased', text: "There you are! I was just polishing my wares! And my bones! Multi-tasking!", weight: 13, purpose: 'ambient' },
  { id: 'willy-exp-greet-2', entitySlug: 'willy', pool: 'greeting', mood: 'pleased', text: "A customer! Finally! I mean, not that I was lonely. Bones don't get lonely. ...Much.", weight: 14, purpose: 'ambient' },
  { id: 'willy-exp-greet-3', entitySlug: 'willy', pool: 'greeting', mood: 'generous', text: "My favorite living person! Here, take this coupon! It's expired but I won't tell if you won't!", weight: 16, purpose: 'shop' },
  { id: 'willy-exp-greet-4', entitySlug: 'willy', pool: 'greeting', mood: 'pleased', text: "Welcome back! Your timing is perfect! I just got new stock! Well, new to me!", weight: 12, purpose: 'ambient' },
  { id: 'willy-exp-greet-5', entitySlug: 'willy', pool: 'greeting', mood: 'pleased', text: "Oh boy oh boy! Another sale! I mean visit! I mean, would you like to see my wares?", weight: 15, purpose: 'shop' },
  { id: 'willy-exp-greet-6', entitySlug: 'willy', pool: 'greeting', mood: 'generous', text: "You came back! I knew you would! I had a feeling! In my bones! ...Sorry, I make that joke a lot.", weight: 17, purpose: 'ambient' },
  { id: 'willy-exp-greet-7', entitySlug: 'willy', pool: 'greeting', mood: 'pleased', text: "Friend! Customer! Friend-customer! The domains have blessed me today!", weight: 14, purpose: 'ambient' },

  // Sales pitches
  { id: 'willy-exp-sales-1', entitySlug: 'willy', pool: 'salesPitch', mood: 'pleased', text: "Everything is on sale! Well, not the cursed sock. That's... that's a different kind of on sale.", weight: 14, purpose: 'shop' },
  { id: 'willy-exp-sales-2', entitySlug: 'willy', pool: 'salesPitch', mood: 'pleased', text: "I found this in a crater! Looks valuable! Might explode! Only one way to find out!", weight: 13, purpose: 'shop' },
  { id: 'willy-exp-sales-3', entitySlug: 'willy', pool: 'salesPitch', mood: 'generous', text: "For you? Special price! Even more special than the special price! Ultra special!", weight: 16, purpose: 'shop' },
  { id: 'willy-exp-sales-4', entitySlug: 'willy', pool: 'salesPitch', mood: 'pleased', text: "I also accept trades! Relics, potions, interesting stories, spare bones... just kidding about the bones. Unless?", weight: 15, purpose: 'shop' },
  { id: 'willy-exp-sales-5', entitySlug: 'willy', pool: 'salesPitch', mood: 'pleased', text: "This item was owned by a very powerful warrior! They died horribly! But that's not the item's fault!", weight: 12, purpose: 'shop' },

  // Reactions
  { id: 'willy-exp-react-1', entitySlug: 'willy', pool: 'reaction', mood: 'pleased', text: "Nice throw! I mean, I don't understand the game, but it looked impressive!", weight: 13, purpose: 'ambient' },
  { id: 'willy-exp-react-2', entitySlug: 'willy', pool: 'reaction', mood: 'pleased', text: "Ooh! Big explosion! Very exciting! The guardians did not enjoy that!", weight: 14, purpose: 'ambient' },
  { id: 'willy-exp-react-3', entitySlug: 'willy', pool: 'reaction', mood: 'pleased', text: "You're doing great! I think! I've never been good at this kind of thing!", weight: 12, purpose: 'ambient' },
  { id: 'willy-exp-react-4', entitySlug: 'willy', pool: 'reaction', mood: 'generous', text: "That was amazing! Here, you've earned a rattling ovation! *rattles enthusiastically*", weight: 16, purpose: 'ambient' },
  { id: 'willy-exp-react-5', entitySlug: 'willy', pool: 'reaction', mood: 'pleased', text: "The crater! The destruction! The... points? I assume those are good!", weight: 11, purpose: 'ambient' },

  // Hints
  { id: 'willy-exp-hint-1', entitySlug: 'willy', pool: 'hint', mood: 'pleased', text: "Psst! I heard the next zone has loot! Probably! Someone mentioned it! Or I dreamed it!", weight: 13, purpose: 'warning' },
  { id: 'willy-exp-hint-2', entitySlug: 'willy', pool: 'hint', mood: 'generous', text: "Merchant secret: the guardians are distracted by shiny things! I would know!", weight: 15, purpose: 'tutorial' },
  { id: 'willy-exp-hint-3', entitySlug: 'willy', pool: 'hint', mood: 'pleased', text: "A customer told me: always save one good die for the end! I don't know why but they seemed smart!", weight: 14, purpose: 'tutorial' },

  // Idle
  { id: 'willy-exp-idle-1', entitySlug: 'willy', pool: 'idle', mood: 'pleased', text: "*hums a cheerful tune while organizing inventory*", weight: 10, purpose: 'ambient' },
  { id: 'willy-exp-idle-2', entitySlug: 'willy', pool: 'idle', mood: 'pleased', text: "*practices sales pitch to a rock* ...Great deal for you, Mr. Rock!", weight: 11, purpose: 'ambient' },
  { id: 'willy-exp-idle-3', entitySlug: 'willy', pool: 'idle', mood: 'pleased', text: "*counts gold* One... two... is that a button? Still counting!", weight: 12, purpose: 'ambient' },
];

// ============================================
// MR. BONES - Philosophical Skeleton Wanderer
// ============================================

export const MR_BONES_EXPANDED: ResponseTemplate[] = [
  // Philosophical greetings
  { id: 'mr-bones-exp-greet-1', entitySlug: 'mr-bones', pool: 'greeting', mood: 'cryptic', text: "You arrive. Or perhaps you were always here, and only now notice.", weight: 14, purpose: 'ambient' },
  { id: 'mr-bones-exp-greet-2', entitySlug: 'mr-bones', pool: 'greeting', mood: 'neutral', text: "The road has many travelers. Few stop to talk. Fewer still have anything worth saying.", weight: 13, purpose: 'ambient' },
  { id: 'mr-bones-exp-greet-3', entitySlug: 'mr-bones', pool: 'greeting', mood: 'amused', text: "Still breathing? How quaint. I remember breathing. Or I think I do. Memory is unreliable.", weight: 15, purpose: 'ambient' },
  { id: 'mr-bones-exp-greet-4', entitySlug: 'mr-bones', pool: 'greeting', mood: 'cryptic', text: "We meet again at the crossroads. All roads are crossroads, eventually.", weight: 12, purpose: 'ambient' },
  { id: 'mr-bones-exp-greet-5', entitySlug: 'mr-bones', pool: 'greeting', mood: 'generous', text: "Ah, you. I was thinking about our last conversation. It was enlightening. Or will be.", weight: 17, purpose: 'ambient' },
  { id: 'mr-bones-exp-greet-6', entitySlug: 'mr-bones', pool: 'greeting', mood: 'neutral', text: "The domains shift around us. We remain. There is comfort in that.", weight: 13, purpose: 'ambient' },
  { id: 'mr-bones-exp-greet-7', entitySlug: 'mr-bones', pool: 'greeting', mood: 'amused', text: "You look troubled. Or perhaps that's just how the living look. Hard to tell from this side.", weight: 14, purpose: 'ambient' },

  // Deep lore
  { id: 'mr-bones-exp-lore-1', entitySlug: 'mr-bones', pool: 'lore', mood: 'cryptic', text: "I watched the domains form. Or watched them end. The difference is perspective.", weight: 15, purpose: 'lore' },
  { id: 'mr-bones-exp-lore-2', entitySlug: 'mr-bones', pool: 'lore', mood: 'neutral', text: "The Die-rectors believe they rule. The dice know otherwise.", weight: 14, purpose: 'lore' },
  { id: 'mr-bones-exp-lore-3', entitySlug: 'mr-bones', pool: 'lore', mood: 'amused', text: "I lost my flesh to Infernus. My memory to Null Providence. My heart? That I gave away freely.", weight: 16, purpose: 'lore' },
  { id: 'mr-bones-exp-lore-4', entitySlug: 'mr-bones', pool: 'lore', mood: 'cryptic', text: "Every skeleton was once someone's friend. Or enemy. Or both. Identity is fluid.", weight: 13, purpose: 'lore' },
  { id: 'mr-bones-exp-lore-5', entitySlug: 'mr-bones', pool: 'lore', mood: 'generous', text: "A gift of knowledge: the guardians dream. In their dreams, they are still alive. Pity them.", weight: 18, purpose: 'lore', cooldown: { oncePerRun: true } },
  { id: 'mr-bones-exp-lore-6', entitySlug: 'mr-bones', pool: 'lore', mood: 'neutral', text: "Willy sells. I observe. We are both merchants of sorts. His wares are tangible. Mine... less so.", weight: 14, purpose: 'lore' },
  { id: 'mr-bones-exp-lore-7', entitySlug: 'mr-bones', pool: 'lore', mood: 'cryptic', text: "The NEVER DIE GUY is not a title. It is a curse. Or a blessing. The distinction escapes me.", weight: 15, purpose: 'lore' },

  // Reactions
  { id: 'mr-bones-exp-react-1', entitySlug: 'mr-bones', pool: 'reaction', mood: 'amused', text: "That throw had... poetry. Destructive poetry, but poetry nonetheless.", weight: 14, purpose: 'ambient' },
  { id: 'mr-bones-exp-react-2', entitySlug: 'mr-bones', pool: 'reaction', mood: 'cryptic', text: "The impact echoes through the void. Someone is listening. Someone always is.", weight: 13, purpose: 'ambient' },
  { id: 'mr-bones-exp-react-3', entitySlug: 'mr-bones', pool: 'reaction', mood: 'neutral', text: "Another guardian falls. They will rise again. We all do, eventually.", weight: 12, purpose: 'ambient' },
  { id: 'mr-bones-exp-react-4', entitySlug: 'mr-bones', pool: 'reaction', mood: 'amused', text: "Chaos and order dance. You lead well.", weight: 15, purpose: 'ambient' },
  { id: 'mr-bones-exp-react-5', entitySlug: 'mr-bones', pool: 'reaction', mood: 'cryptic', text: "The dice speak truths the mind cannot hear. But the bones always know.", weight: 16, purpose: 'ambient' },

  // Hints
  { id: 'mr-bones-exp-hint-1', entitySlug: 'mr-bones', pool: 'hint', mood: 'cryptic', text: "The next chamber holds a memory. Not yours. Perhaps it should be.", weight: 14, purpose: 'warning' },
  { id: 'mr-bones-exp-hint-2', entitySlug: 'mr-bones', pool: 'hint', mood: 'neutral', text: "I have seen many die ahead. The successful ones... they waited.", weight: 15, purpose: 'tutorial' },
  { id: 'mr-bones-exp-hint-3', entitySlug: 'mr-bones', pool: 'hint', mood: 'amused', text: "Free wisdom: the guardians fear what they cannot predict. Be unpredictable.", weight: 13, purpose: 'tutorial' },
  { id: 'mr-bones-exp-hint-4', entitySlug: 'mr-bones', pool: 'hint', mood: 'generous', text: "A truth: the target zone moves with intention. Learn its rhythm.", weight: 16, purpose: 'tutorial' },

  // Idle
  { id: 'mr-bones-exp-idle-1', entitySlug: 'mr-bones', pool: 'idle', mood: 'cryptic', text: "*contemplates the space between moments*", weight: 10, purpose: 'ambient' },
  { id: 'mr-bones-exp-idle-2', entitySlug: 'mr-bones', pool: 'idle', mood: 'neutral', text: "Even stillness is motion, on a cosmic scale.", weight: 11, purpose: 'ambient' },
  { id: 'mr-bones-exp-idle-3', entitySlug: 'mr-bones', pool: 'idle', mood: 'amused', text: "*traces patterns in the dust that may or may not be prophecy*", weight: 12, purpose: 'ambient' },
];

// ============================================
// STITCH UP GIRL - Healer Sister
// ============================================

export const STITCH_UP_GIRL_EXPANDED: ResponseTemplate[] = [
  // Caring greetings
  { id: 'stitch-exp-greet-1', entitySlug: 'stitch-up-girl', pool: 'greeting', mood: 'pleased', text: "You're back! And look at you, still mostly intact! I'm so proud!", weight: 14, purpose: 'ambient' },
  { id: 'stitch-exp-greet-2', entitySlug: 'stitch-up-girl', pool: 'greeting', mood: 'pleased', text: "There's my favorite patient! Well, my only patient who keeps coming back. Same thing!", weight: 13, purpose: 'ambient' },
  { id: 'stitch-exp-greet-3', entitySlug: 'stitch-up-girl', pool: 'greeting', mood: 'generous', text: "Finally! Someone I actually want to heal! Most of my customers are so ungrateful.", weight: 16, purpose: 'ambient' },
  { id: 'stitch-exp-greet-4', entitySlug: 'stitch-up-girl', pool: 'greeting', mood: 'pleased', text: "Let me guess: you've been fighting things again. Of course you have. Come here.", weight: 15, purpose: 'ambient' },
  { id: 'stitch-exp-greet-5', entitySlug: 'stitch-up-girl', pool: 'greeting', mood: 'annoyed', text: "What did you DO? No, don't tell me. I can see it. Sit down. This is not a request.", weight: 18, purpose: 'warning', conditions: [{ type: 'integrity', comparison: 'lt', value: 40 }] },
  { id: 'stitch-exp-greet-6', entitySlug: 'stitch-up-girl', pool: 'greeting', mood: 'pleased', text: "Oh good, you're here! I've been practicing my stitches. On fruit. Want to see?", weight: 12, purpose: 'ambient' },
  { id: 'stitch-exp-greet-7', entitySlug: 'stitch-up-girl', pool: 'greeting', mood: 'generous', text: "My favorite sibling! ...My only sibling, but still! Best one I've got!", weight: 17, purpose: 'ambient' },

  // Medical commentary
  { id: 'stitch-exp-lore-1', entitySlug: 'stitch-up-girl', pool: 'lore', mood: 'pleased', text: "Healing isn't magic. Well, it is. But it's also about knowing where the important bits go.", weight: 14, purpose: 'lore' },
  { id: 'stitch-exp-lore-2', entitySlug: 'stitch-up-girl', pool: 'lore', mood: 'pleased', text: "Shadow Keep taught me that everyone heals differently. Also that shadows can cut. Unrelated.", weight: 15, purpose: 'lore' },
  { id: 'stitch-exp-lore-3', entitySlug: 'stitch-up-girl', pool: 'lore', mood: 'generous', text: "You know what never dies? Family support. I'll always be here with bandages and judgment.", weight: 17, purpose: 'lore' },
  { id: 'stitch-exp-lore-4', entitySlug: 'stitch-up-girl', pool: 'lore', mood: 'pleased', text: "I've stitched up Die-rectors, wanderers, even a guardian once. That one was weird.", weight: 13, purpose: 'lore' },
  { id: 'stitch-exp-lore-5', entitySlug: 'stitch-up-girl', pool: 'lore', mood: 'pleased', text: "Fun fact: the average meteor strike victim needs 47 stitches. I've gotten it down to 43.", weight: 14, purpose: 'lore' },

  // Reactions
  { id: 'stitch-exp-react-1', entitySlug: 'stitch-up-girl', pool: 'reaction', mood: 'pleased', text: "Nice! No injuries from that one! I mean, not to you. The guardian looks rough.", weight: 14, purpose: 'ambient' },
  { id: 'stitch-exp-react-2', entitySlug: 'stitch-up-girl', pool: 'reaction', mood: 'pleased', text: "That's it! Keep hitting them before they hit you! Medical strategy!", weight: 13, purpose: 'ambient' },
  { id: 'stitch-exp-react-3', entitySlug: 'stitch-up-girl', pool: 'reaction', mood: 'annoyed', text: "Ooh, that looked like it hurt. Come see me after. No arguing.", weight: 15, purpose: 'ambient' },
  { id: 'stitch-exp-react-4', entitySlug: 'stitch-up-girl', pool: 'reaction', mood: 'pleased', text: "Beautiful throw! And more importantly, no blood! Today is a good day!", weight: 16, purpose: 'ambient' },
  { id: 'stitch-exp-react-5', entitySlug: 'stitch-up-girl', pool: 'reaction', mood: 'generous', text: "That crater is going to need stitches. Not yours. The planet's. I'm branching out.", weight: 12, purpose: 'ambient' },

  // Hints
  { id: 'stitch-exp-hint-1', entitySlug: 'stitch-up-girl', pool: 'hint', mood: 'pleased', text: "Pro tip: the next area has enemies that poison. I have antidotes. Conveniently.", weight: 15, purpose: 'warning' },
  { id: 'stitch-exp-hint-2', entitySlug: 'stitch-up-girl', pool: 'hint', mood: 'generous', text: "Sister to sibling advice: save your biggest dice for when you're cornered. Trust me.", weight: 16, purpose: 'tutorial' },
  { id: 'stitch-exp-hint-3', entitySlug: 'stitch-up-girl', pool: 'hint', mood: 'pleased', text: "I patched someone up who said the guardians have weak points. Aim for the glowing bits.", weight: 14, purpose: 'tutorial' },
  { id: 'stitch-exp-hint-4', entitySlug: 'stitch-up-girl', pool: 'hint', mood: 'annoyed', text: "Medical fact: at your current integrity, you can survive exactly two more hits. Maybe.", weight: 17, purpose: 'warning', conditions: [{ type: 'integrity', comparison: 'lt', value: 35 }] },

  // Sales
  { id: 'stitch-exp-sales-1', entitySlug: 'stitch-up-girl', pool: 'salesPitch', mood: 'pleased', text: "I've got healing supplies! And scissors! The scissors are not for sale. Those are mine.", weight: 14, purpose: 'shop' },
  { id: 'stitch-exp-sales-2', entitySlug: 'stitch-up-girl', pool: 'salesPitch', mood: 'generous', text: "Family discount means free. Don't tell the other patients. They get jealous.", weight: 17, purpose: 'shop' },
  { id: 'stitch-exp-sales-3', entitySlug: 'stitch-up-girl', pool: 'salesPitch', mood: 'pleased', text: "New shipment of bandages! Extra absorbent! I tested them on Robert's domain. Very absorbent.", weight: 13, purpose: 'shop' },

  // Idle
  { id: 'stitch-exp-idle-1', entitySlug: 'stitch-up-girl', pool: 'idle', mood: 'pleased', text: "*organizes medical supplies with concerning enthusiasm*", weight: 10, purpose: 'ambient' },
  { id: 'stitch-exp-idle-2', entitySlug: 'stitch-up-girl', pool: 'idle', mood: 'pleased', text: "*sharpens scissors* These are for curses. And also opening packages.", weight: 11, purpose: 'ambient' },
];

// ============================================
// DR. MAXWELL - Eccentric Scientist Wanderer
// ============================================

export const DR_MAXWELL_EXPANDED: ResponseTemplate[] = [
  // Scientific greetings
  { id: 'maxwell-exp-greet-1', entitySlug: 'dr-maxwell', pool: 'greeting', mood: 'amused', text: "Ah, a test subject! I mean, valued visitor! The distinction is... contextual.", weight: 14, purpose: 'ambient' },
  { id: 'maxwell-exp-greet-2', entitySlug: 'dr-maxwell', pool: 'greeting', mood: 'pleased', text: "Excellent! You survived the last experiment! I mean encounter! Same word, really.", weight: 15, purpose: 'ambient' },
  { id: 'maxwell-exp-greet-3', entitySlug: 'dr-maxwell', pool: 'greeting', mood: 'neutral', text: "Your bio-readings are fascinating! I've been monitoring you. For science. Definitely science.", weight: 13, purpose: 'ambient' },
  { id: 'maxwell-exp-greet-4', entitySlug: 'dr-maxwell', pool: 'greeting', mood: 'amused', text: "The probability of you arriving exactly now was 0.003%! Or maybe 73%. Statistics are hard.", weight: 16, purpose: 'ambient' },
  { id: 'maxwell-exp-greet-5', entitySlug: 'dr-maxwell', pool: 'greeting', mood: 'pleased', text: "You! I have questions! Many questions! About your molecular structure! And your dice!", weight: 14, purpose: 'ambient' },

  // Scientific observations
  { id: 'maxwell-exp-react-1', entitySlug: 'dr-maxwell', pool: 'reaction', mood: 'pleased', text: "FASCINATING! The impact trajectory was exactly as I predicted! Approximately!", weight: 15, purpose: 'ambient' },
  { id: 'maxwell-exp-react-2', entitySlug: 'dr-maxwell', pool: 'reaction', mood: 'amused', text: "The guardian's structural integrity failed at precisely the expected moment! Give or take!", weight: 14, purpose: 'ambient' },
  { id: 'maxwell-exp-react-3', entitySlug: 'dr-maxwell', pool: 'reaction', mood: 'neutral', text: "Interesting. The dice deviated from expected outcomes by 47%. This requires more testing.", weight: 13, purpose: 'ambient' },
  { id: 'maxwell-exp-react-4', entitySlug: 'dr-maxwell', pool: 'reaction', mood: 'pleased', text: "That explosion released exactly 2.7 megajoules! Or I made that number up! Hard to tell!", weight: 16, purpose: 'ambient' },

  // Lore
  { id: 'maxwell-exp-lore-1', entitySlug: 'dr-maxwell', pool: 'lore', mood: 'amused', text: "The domains operate on principles I am THIS close to understanding! Been saying that for centuries!", weight: 15, purpose: 'lore' },
  { id: 'maxwell-exp-lore-2', entitySlug: 'dr-maxwell', pool: 'lore', mood: 'neutral', text: "The dice are not random. They are pseudo-random. The distinction is CRITICAL. And terrifying.", weight: 14, purpose: 'lore' },
  { id: 'maxwell-exp-lore-3', entitySlug: 'dr-maxwell', pool: 'lore', mood: 'pleased', text: "I once tried to measure The One. My equipment melted. Or never existed. Same result!", weight: 16, purpose: 'lore' },

  // Hints
  { id: 'maxwell-exp-hint-1', entitySlug: 'dr-maxwell', pool: 'hint', mood: 'pleased', text: "Scientific advice: the guardians have a 0.3 second reaction delay. Exploit it!", weight: 15, purpose: 'tutorial' },
  { id: 'maxwell-exp-hint-2', entitySlug: 'dr-maxwell', pool: 'hint', mood: 'amused', text: "My calculations suggest a 67% success rate ahead! Or 33%! Depends on your perspective!", weight: 14, purpose: 'warning' },
];

// ============================================
// BOOTS - Traveler Equipment Specialist
// ============================================

export const BOOTS_EXPANDED: ResponseTemplate[] = [
  // Practical greetings
  { id: 'boots-exp-greet-1', entitySlug: 'boots', pool: 'greeting', mood: 'neutral', text: "You need better gear. Everyone needs better gear. That's why I'm here.", weight: 13, purpose: 'shop' },
  { id: 'boots-exp-greet-2', entitySlug: 'boots', pool: 'greeting', mood: 'pleased', text: "Back for more equipment? Smart. Can't fight meteors without proper tools.", weight: 14, purpose: 'shop' },
  { id: 'boots-exp-greet-3', entitySlug: 'boots', pool: 'greeting', mood: 'neutral', text: "Let me guess: something broke. Something always breaks. I've got replacements.", weight: 12, purpose: 'shop' },
  { id: 'boots-exp-greet-4', entitySlug: 'boots', pool: 'greeting', mood: 'pleased', text: "Ah, a repeat customer! Your boots are still intact? I'm impressed. And slightly offended.", weight: 15, purpose: 'ambient' },
  { id: 'boots-exp-greet-5', entitySlug: 'boots', pool: 'greeting', mood: 'generous', text: "You look prepared. But are you prepared-prepared? I can fix that.", weight: 16, purpose: 'shop' },

  // Sales
  { id: 'boots-exp-sales-1', entitySlug: 'boots', pool: 'salesPitch', mood: 'neutral', text: "Boots, gloves, protective gear. If it protects you from dying, I probably have it.", weight: 14, purpose: 'shop' },
  { id: 'boots-exp-sales-2', entitySlug: 'boots', pool: 'salesPitch', mood: 'pleased', text: "New arrivals! Fire-resistant boots from Infernus! Slightly singed but fully functional!", weight: 15, purpose: 'shop' },
  { id: 'boots-exp-sales-3', entitySlug: 'boots', pool: 'salesPitch', mood: 'generous', text: "For you? Equipment discount. You actually use the stuff properly. That's rare.", weight: 17, purpose: 'shop' },

  // Reactions
  { id: 'boots-exp-react-1', entitySlug: 'boots', pool: 'reaction', mood: 'pleased', text: "Good form on that throw. Your grip looks solid. My gloves are working.", weight: 13, purpose: 'ambient' },
  { id: 'boots-exp-react-2', entitySlug: 'boots', pool: 'reaction', mood: 'neutral', text: "That impact looked rough. Your boots holding up? I can check them after.", weight: 12, purpose: 'ambient' },
  { id: 'boots-exp-react-3', entitySlug: 'boots', pool: 'reaction', mood: 'pleased', text: "Nice crater. The equipment I sold you is earning its keep.", weight: 14, purpose: 'ambient' },

  // Hints
  { id: 'boots-exp-hint-1', entitySlug: 'boots', pool: 'hint', mood: 'neutral', text: "Practical tip: the terrain ahead is rough. Good footwear helps. Coincidentally, I sell footwear.", weight: 14, purpose: 'warning' },
  { id: 'boots-exp-hint-2', entitySlug: 'boots', pool: 'hint', mood: 'pleased', text: "Equipment advice: the guardians target your weak points. Cover those points.", weight: 15, purpose: 'tutorial' },
];

// ============================================
// KING JAMES - Wanderer (Regal Exile)
// ============================================

export const KING_JAMES_EXPANDED: ResponseTemplate[] = [
  // Regal greetings
  { id: 'king-james-exp-greet-1', entitySlug: 'king-james', pool: 'greeting', mood: 'neutral', text: "Another traveler in my domain. Well, former domain. Semantics.", weight: 13, purpose: 'ambient' },
  { id: 'king-james-exp-greet-2', entitySlug: 'king-james', pool: 'greeting', mood: 'pleased', text: "Ah, someone who recognizes quality! Or perhaps just someone. I'll take either.", weight: 14, purpose: 'ambient' },
  { id: 'king-james-exp-greet-3', entitySlug: 'king-james', pool: 'greeting', mood: 'amused', text: "Once I had subjects. Now I have conversations. Arguably an improvement.", weight: 15, purpose: 'ambient' },
  { id: 'king-james-exp-greet-4', entitySlug: 'king-james', pool: 'greeting', mood: 'neutral', text: "You stand before royalty. Fallen royalty. But royalty nonetheless.", weight: 12, purpose: 'ambient' },
  { id: 'king-james-exp-greet-5', entitySlug: 'king-james', pool: 'greeting', mood: 'generous', text: "My favorite commoner returns! That is a compliment. I do not use it lightly.", weight: 17, purpose: 'ambient' },

  // Noble lore
  { id: 'king-james-exp-lore-1', entitySlug: 'king-james', pool: 'lore', mood: 'neutral', text: "I ruled before the Die-rectors divided the domains. Now I wander between their scraps.", weight: 15, purpose: 'lore' },
  { id: 'king-james-exp-lore-2', entitySlug: 'king-james', pool: 'lore', mood: 'amused', text: "Power is temporary. Style is eternal. I may have lost one. Never the other.", weight: 14, purpose: 'lore' },
  { id: 'king-james-exp-lore-3', entitySlug: 'king-james', pool: 'lore', mood: 'generous', text: "A secret from my reign: the guardians serve whoever holds the dice. Remember that.", weight: 18, purpose: 'lore', cooldown: { oncePerRun: true } },

  // Reactions
  { id: 'king-james-exp-react-1', entitySlug: 'king-james', pool: 'reaction', mood: 'pleased', text: "Excellent form! I once commanded armies. You could have led a battalion.", weight: 14, purpose: 'ambient' },
  { id: 'king-james-exp-react-2', entitySlug: 'king-james', pool: 'reaction', mood: 'amused', text: "The guardian falls! A peasant could not have done better! ...Probably!", weight: 13, purpose: 'ambient' },
  { id: 'king-james-exp-react-3', entitySlug: 'king-james', pool: 'reaction', mood: 'neutral', text: "Such destruction. In my day, we called that 'diplomacy.'", weight: 15, purpose: 'ambient' },

  // Hints
  { id: 'king-james-exp-hint-1', entitySlug: 'king-james', pool: 'hint', mood: 'neutral', text: "Royal wisdom: the strong guard their weaknesses. Look for what they protect.", weight: 14, purpose: 'tutorial' },
  { id: 'king-james-exp-hint-2', entitySlug: 'king-james', pool: 'hint', mood: 'pleased', text: "A king's advice is worth kingdoms. This one's free: patience defeats panic.", weight: 16, purpose: 'tutorial' },
];

// ============================================
// EXPORT COMBINED EXPANSION
// ============================================

export const ALL_EXPANDED_TEMPLATES: ResponseTemplate[] = [
  ...THE_ONE_EXPANDED,
  ...JOHN_EXPANDED,
  ...PETER_EXPANDED,
  ...ROBERT_EXPANDED,
  ...ALICE_EXPANDED,
  ...JANE_EXPANDED,
  ...WANDERER_EXPANDED,
  ...TRAVELER_EXPANDED,
  // Specific NPCs
  ...WILLY_EXPANDED,
  ...MR_BONES_EXPANDED,
  ...STITCH_UP_GIRL_EXPANDED,
  ...DR_MAXWELL_EXPANDED,
  ...BOOTS_EXPANDED,
  ...KING_JAMES_EXPANDED,
];

// Total new templates: ~450+
