#!/usr/bin/env ts-node
/**
 * NPC-Player Dialogue Simulation
 *
 * Generates player-NPC interaction dialogues for chatbase population.
 * Covers scenarios missing from NPC-NPC chatter:
 * - First meetings (mythology-based)
 * - Shop/trade interactions
 * - Post-death rescue conversations
 * - Streak acknowledgments
 * - Debt collection
 *
 * Run with: npx tsx scripts/npc-player-dialogue.ts
 *
 * Options:
 *   --scenario=X       Scenario type (first_meeting, shop, rescue, streak, debt, all)
 *   --npc-category=X   NPC category filter (wanderer, traveler, pantheon, all)
 *   --player-deaths=N  Simulate player with N deaths
 *   --player-streak=N  Simulate player with streak (positive=wins, negative=losses)
 *   --player-debt=N    Simulate player debt amount
 *   --myth-status=X    Player myth status (unknown, rumored, legend, prophecy)
 *   --use-claude       Enable Claude API for dialogue generation
 *   --batch-size=N     Dialogues per output batch (default: 100)
 *   --verbose          Show all output
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { createSeededRng, type SeededRng } from '../src/core/seeded-rng';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Types
// ============================================

type ScenarioType = 'first_meeting' | 'shop' | 'rescue' | 'streak' | 'debt' | 'pre_run' | 'post_run';
type NPCCategory = 'wanderer' | 'traveler' | 'pantheon';
type MythStatus = 'unknown' | 'rumored' | 'legend' | 'prophecy';

interface PlayerState {
  deathCount: number;
  rescueCount: number;
  currentStreak: number;  // Positive = wins, negative = losses
  highestAnte: number;
  totalDebt: number;
  debtsTo: Record<string, number>;
  mythStatus: MythStatus;
  lastRunResult: 'win' | 'death' | 'flume' | null;
  rescuedBy: string | null;
}

interface NPCDef {
  slug: string;
  name: string;
  category: NPCCategory;
  personality: string;
  voice: string;
  quirks: string[];
  catchphrases: string[];
  obsessions: string[];
  rivals: string[];
}

interface DialogueEntry {
  id: string;
  scenario: ScenarioType;
  speaker: string;
  speakerName: string;
  speakerCategory: NPCCategory;
  target: 'player';
  text: string;
  pool: string;
  playerState: Partial<PlayerState>;
  tags: string[];
  interestScore: number;
}

// ============================================
// NPC Definitions (subset for player interactions)
// ============================================

const WANDERERS: NPCDef[] = [
  {
    slug: 'willy-one-eye',
    name: 'Willy One Eye',
    category: 'wanderer',
    personality: 'gruff gambler, always looking for an edge',
    voice: 'gravelly, clipped sentences, gambling slang',
    quirks: ['squints suspiciously', 'taps dice'],
    catchphrases: ['Seven come eleven.', 'I seen worse odds.'],
    obsessions: ['dice', 'debts', 'the perfect throw'],
    rivals: ['mr-bones', 'clausen'],
  },
  {
    slug: 'mr-bones',
    name: 'Mr. Bones',
    category: 'wanderer',
    personality: 'cryptic skeleton, death puns',
    voice: 'hollow, echoing, death puns and riddles',
    quirks: ['rattles when laughing', 'knows when you\'ll die'],
    catchphrases: ['I have a bone to pick...', 'Death comes for all.'],
    obsessions: ['death', 'the cycle', 'grave matters'],
    rivals: ['body-count', 'stitch-up-girl'],
  },
  {
    slug: 'dr-maxwell',
    name: 'Dr. Maxwell',
    category: 'wanderer',
    personality: 'mad scientist, obsessed with probability',
    voice: 'frantic, technical jargon, interrupts himself',
    quirks: ['mutters calculations', 'wild gestures'],
    catchphrases: ['The probability matrix suggests--', 'Fascinating!'],
    obsessions: ['probability', 'dice physics', 'the sphere'],
    rivals: ['dr-voss', 'the-general'],
  },
  {
    slug: 'king-james',
    name: 'King James',
    category: 'wanderer',
    personality: 'former royalty, arrogant',
    voice: 'pompous, third person, old-fashioned',
    quirks: ['adjusts invisible crown', 'demands respect'],
    catchphrases: ['The King does not lose.', 'Peasants...'],
    obsessions: ['his lost kingdom', 'bloodlines', 'power'],
    rivals: ['the-one', 'peter'],
  },
];

const TRAVELERS: NPCDef[] = [
  {
    slug: 'stitch-up-girl',
    name: 'Stitch-Up Girl',
    category: 'traveler',
    personality: 'field medic, dark humor about death',
    voice: 'sardonic, medical terms, gallows humor',
    quirks: ['always checking vitals', 'carries needle'],
    catchphrases: ['You look like death. I should know.', 'Hold still.'],
    obsessions: ['patching people up', 'death statistics', 'scars'],
    rivals: ['mr-bones', 'dr-voss'],
  },
  {
    slug: 'boots',
    name: 'Boots',
    category: 'traveler',
    personality: 'seen-it-all guide, knows shortcuts',
    voice: 'laconic, world-weary, practical',
    quirks: ['taps boots on ground', 'sighs often'],
    catchphrases: ['Been there.', 'Your funeral.', 'Follow me. Or don\'t.'],
    obsessions: ['escape routes', 'shortcuts', 'survival'],
    rivals: ['the-general'],
  },
  {
    slug: 'clausen',
    name: 'Detective Clausen',
    category: 'traveler',
    personality: 'noir detective, investigates the void',
    voice: 'hard-boiled, metaphors, smoke references',
    quirks: ['two-taps briefcase', 'coughs blood sometimes'],
    catchphrases: ['The case may be cold...', 'Everyone\'s got a tell.'],
    obsessions: ['unsolved cases', 'the truth', 'who runs this place'],
    rivals: ['willy-one-eye', 'peter'],
  },
  {
    slug: 'keith-man',
    name: 'Keith Man',
    category: 'traveler',
    personality: 'cryptic prophet, speaks in fragments',
    voice: 'incomplete sentences, trailing off, prophetic',
    quirks: ['stares into middle distance', 'knows things'],
    catchphrases: ['... You already know.', 'The sphere sees all.', '...'],
    obsessions: ['the sphere', 'prophecy', 'knowing'],
    rivals: [],
  },
];

const PANTHEON: NPCDef[] = [
  {
    slug: 'the-one',
    name: 'The One',
    category: 'pantheon',
    personality: 'Die-rector of Null Providence, cosmic horror',
    voice: 'echoing, cosmic, speaks of void and nothingness',
    quirks: ['reality warps around them', 'never blinks'],
    catchphrases: ['All paths lead to null.', 'The void remembers.'],
    obsessions: ['the void', 'null', 'erasing existence'],
    rivals: [],
  },
  {
    slug: 'john',
    name: 'John',
    category: 'pantheon',
    personality: 'Die-rector of Earth, disappointed authority',
    voice: 'mechanical, precise, tired disappointment',
    quirks: ['clicks and whirs', 'measures everything'],
    catchphrases: ['Efficiency is paramount.', 'You could do better.'],
    obsessions: ['optimization', 'failure analysis', 'improvement'],
    rivals: [],
  },
  {
    slug: 'peter',
    name: 'Peter',
    category: 'pantheon',
    personality: 'Die-rector of Shadow Keep, judgmental gatekeeper',
    voice: 'cold, judging, asks questions he knows answers to',
    quirks: ['writes in shadow book', 'knows your sins'],
    catchphrases: ['I see what you\'ve done.', 'Judgment is inevitable.'],
    obsessions: ['sins', 'judgment', 'the gate'],
    rivals: [],
  },
];

const ALL_NPCS = [...WANDERERS, ...TRAVELERS, ...PANTHEON];

// ============================================
// Scenario Prompts
// ============================================

function getScenarioPrompt(
  scenario: ScenarioType,
  npc: NPCDef,
  playerState: PlayerState
): string {
  const baseContext = `
You are ${npc.name}, a ${npc.category} NPC in the Never Die Guy roguelike.
Personality: ${npc.personality}
Voice: ${npc.voice}
Quirks: ${npc.quirks.join(', ')}
Catchphrases you use: ${npc.catchphrases.join(' | ')}
Obsessions: ${npc.obsessions.join(', ')}

The player is a mortal who dies and respawns endlessly, trying to beat the sphere.
Player stats: ${playerState.deathCount} deaths, highest ante ${playerState.highestAnte}, ${playerState.mythStatus} status.
${playerState.totalDebt > 0 ? `Player owes ${playerState.totalDebt} gold in total debts.` : ''}
${playerState.currentStreak !== 0 ? `Player is on a ${Math.abs(playerState.currentStreak)} ${playerState.currentStreak > 0 ? 'win' : 'loss'} streak.` : ''}
`;

  switch (scenario) {
    case 'first_meeting':
      return `${baseContext}

This is the FIRST TIME you're meeting this player. Based on their ${playerState.mythStatus} status:
- unknown: You know nothing, treat them as a random newcomer
- rumored: You've heard whispers about them, be curious or dismissive
- legend: Their deeds are known, react accordingly (respect, fear, or challenge)
- prophecy: You believe they're part of a greater story

Generate a first meeting dialogue. 1-3 sentences. Be in character. Include an action in *asterisks* if appropriate.`;

    case 'shop':
      return `${baseContext}

The player is browsing your wares. You're a merchant trying to make a sale.
${playerState.debtsTo[npc.slug] ? `They owe you ${playerState.debtsTo[npc.slug]} gold.` : ''}

Generate a sales pitch or shop interaction. 1-3 sentences. Mention items, prices, or deals. Be in character.`;

    case 'rescue':
      return `${baseContext}

The player just DIED and you've found their corpse. You're reviving them.
This is death #${playerState.deathCount} for them.
${playerState.rescuedBy === npc.slug ? 'You\'ve rescued them before.' : 'This is your first time rescuing them.'}

Generate a post-death rescue dialogue. Comment on their death, offer advice, or establish debt terms. 2-4 sentences. Be in character.`;

    case 'streak':
      const streakType = playerState.currentStreak > 0 ? 'winning' : 'losing';
      const streakNum = Math.abs(playerState.currentStreak);
      return `${baseContext}

The player is on a ${streakNum}-${streakType} streak. React to this.
${streakType === 'winning' ? 'They\'re hot, dominating, maybe getting cocky.' : 'They\'re tilted, struggling, maybe need encouragement or mockery.'}

Generate a reaction to their streak. 1-3 sentences. Be in character.`;

    case 'debt':
      const debtAmount = playerState.debtsTo[npc.slug] || 100;
      return `${baseContext}

The player owes you ${debtAmount} gold. It's time to collect or negotiate.
Be firm, threatening, or offer a deal. Your ${npc.category === 'pantheon' ? 'cosmic authority' : 'business interests'} demand payment.

Generate a debt collection dialogue. 2-4 sentences. Be in character.`;

    case 'pre_run':
      return `${baseContext}

The player is about to start a run. Give them advice, a hint, or a warning about what's ahead.
Their highest ante is ${playerState.highestAnte}. They've died ${playerState.deathCount} times.

Generate pre-run dialogue. 1-3 sentences. Be helpful, cryptic, or challenging. Be in character.`;

    case 'post_run':
      const result = playerState.lastRunResult;
      return `${baseContext}

The player just finished a run. Result: ${result || 'unknown'}.
${result === 'death' ? 'They died. Again.' : result === 'win' ? 'They actually won!' : 'They escaped early.'}

Generate post-run reaction. 1-3 sentences. Comment on their performance. Be in character.`;

    default:
      return baseContext + '\n\nGenerate a contextual dialogue. 1-3 sentences. Be in character.';
  }
}

// ============================================
// Claude API Integration
// ============================================

let anthropic: Anthropic | null = null;

async function generateWithClaude(
  prompt: string,
  npc: NPCDef
): Promise<string> {
  if (!anthropic) {
    anthropic = new Anthropic();
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: `You are a dialogue writer for NPCs in a roguelike game. Write only the NPC's dialogue, no explanations. Be concise and in character. Include *action descriptions* in asterisks where appropriate.`,
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }
    return '';
  } catch (err) {
    console.error(`Claude API error for ${npc.slug}:`, err);
    return '';
  }
}

// ============================================
// Template Fallback
// ============================================

function generateFromTemplate(
  scenario: ScenarioType,
  npc: NPCDef,
  playerState: PlayerState,
  rng: SeededRng
): string {
  // Use a catchphrase as fallback
  const catchphrase = npc.catchphrases[Math.floor(rng() * npc.catchphrases.length)];

  switch (scenario) {
    case 'first_meeting':
      return `*${npc.quirks[0]}* ${catchphrase} So you're the one they've been talking about.`;

    case 'shop':
      return `${catchphrase} I've got what you need. For a price.`;

    case 'rescue':
      return `*drags you from the void* Death number ${playerState.deathCount}? ${catchphrase}`;

    case 'streak':
      if (playerState.currentStreak > 0) {
        return `${catchphrase} Don't let it go to your head.`;
      } else {
        return `${catchphrase} Maybe try not dying next time.`;
      }

    case 'debt':
      const debt = playerState.debtsTo[npc.slug] || 100;
      return `You owe me ${debt} gold. ${catchphrase} Pay up.`;

    case 'pre_run':
      return `${catchphrase} Watch yourself out there.`;

    case 'post_run':
      return `${catchphrase} I expected as much.`;

    default:
      return catchphrase;
  }
}

// ============================================
// Main Simulation
// ============================================

async function runSimulation(config: {
  scenarios: ScenarioType[];
  npcCategories: NPCCategory[];
  useClaude: boolean;
  batchSize: number;
  playerState: PlayerState;
  verbose: boolean;
  seed: string;
}): Promise<DialogueEntry[]> {
  const entries: DialogueEntry[] = [];
  const rng = createSeededRng(config.seed);

  // Filter NPCs by category
  const npcs = ALL_NPCS.filter(
    npc => config.npcCategories.includes('all' as any) || config.npcCategories.includes(npc.category)
  );

  console.log(`Running simulation with ${npcs.length} NPCs, ${config.scenarios.length} scenarios`);
  console.log(`Claude API: ${config.useClaude ? 'enabled' : 'disabled'}`);

  for (const scenario of config.scenarios) {
    console.log(`\nScenario: ${scenario}`);

    for (const npc of npcs) {
      // Vary player state slightly for each NPC
      const localPlayerState: PlayerState = {
        ...config.playerState,
        debtsTo: {
          ...config.playerState.debtsTo,
          [npc.slug]: Math.floor(rng() * 500) + 50, // Random debt
        },
      };

      const prompt = getScenarioPrompt(scenario, npc, localPlayerState);

      let text: string;
      if (config.useClaude) {
        text = await generateWithClaude(prompt, npc);
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Fallback if Claude fails or is disabled
      if (!text) {
        text = generateFromTemplate(scenario, npc, localPlayerState, rng);
      }

      if (!text || text.length < 10) continue;

      const entry: DialogueEntry = {
        id: `pd-${scenario}-${npc.slug}-${Date.now()}`,
        scenario,
        speaker: npc.slug,
        speakerName: npc.name,
        speakerCategory: npc.category,
        target: 'player',
        text,
        pool: mapScenarioToPool(scenario),
        playerState: {
          deathCount: localPlayerState.deathCount,
          currentStreak: localPlayerState.currentStreak,
          mythStatus: localPlayerState.mythStatus,
        },
        tags: [
          scenario,
          npc.category,
          `player_${localPlayerState.mythStatus}`,
          config.useClaude ? 'claude_generated' : 'template',
        ],
        interestScore: config.useClaude ? 85 : 60,
      };

      entries.push(entry);

      if (config.verbose) {
        console.log(`  [${npc.name}] ${text.substring(0, 60)}...`);
      }
    }
  }

  return entries;
}

function mapScenarioToPool(scenario: ScenarioType): string {
  switch (scenario) {
    case 'first_meeting': return 'greeting';
    case 'shop': return 'salesPitch';
    case 'rescue': return 'reaction';
    case 'streak': return 'reaction';
    case 'debt': return 'threat';
    case 'pre_run': return 'hint';
    case 'post_run': return 'reaction';
    default: return 'reaction';
  }
}

// ============================================
// Output
// ============================================

function saveOutput(entries: DialogueEntry[], outputDir: string): void {
  fs.mkdirSync(outputDir, { recursive: true });

  // Save all entries
  fs.writeFileSync(
    path.join(outputDir, 'dialogues.json'),
    JSON.stringify({ entries, count: entries.length }, null, 2)
  );

  // Save summary
  const summary = {
    timestamp: new Date().toISOString(),
    totalEntries: entries.length,
    byScenario: {} as Record<string, number>,
    bySpeaker: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
  };

  for (const entry of entries) {
    summary.byScenario[entry.scenario] = (summary.byScenario[entry.scenario] || 0) + 1;
    summary.bySpeaker[entry.speaker] = (summary.bySpeaker[entry.speaker] || 0) + 1;
    summary.byCategory[entry.speakerCategory] = (summary.byCategory[entry.speakerCategory] || 0) + 1;
  }

  fs.writeFileSync(
    path.join(outputDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log(`\nSaved ${entries.length} entries to ${outputDir}`);
}

// ============================================
// CLI
// ============================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const scenarioArg = args.find(a => a.startsWith('--scenario='))?.split('=')[1] || 'all';
  const categoryArg = args.find(a => a.startsWith('--npc-category='))?.split('=')[1] || 'all';
  const playerDeaths = parseInt(args.find(a => a.startsWith('--player-deaths='))?.split('=')[1] || '10', 10);
  const playerStreak = parseInt(args.find(a => a.startsWith('--player-streak='))?.split('=')[1] || '0', 10);
  const playerDebt = parseInt(args.find(a => a.startsWith('--player-debt='))?.split('=')[1] || '100', 10);
  const mythStatus = (args.find(a => a.startsWith('--myth-status='))?.split('=')[1] || 'rumored') as MythStatus;
  const useClaude = args.includes('--use-claude');
  const verbose = args.includes('--verbose');
  const seed = args.find(a => a.startsWith('--seed='))?.split('=')[1] || `player-sim-${Date.now()}`;

  const allScenarios: ScenarioType[] = ['first_meeting', 'shop', 'rescue', 'streak', 'debt', 'pre_run', 'post_run'];
  const scenarios = scenarioArg === 'all' ? allScenarios : [scenarioArg as ScenarioType];

  const allCategories: NPCCategory[] = ['wanderer', 'traveler', 'pantheon'];
  const npcCategories = categoryArg === 'all' ? allCategories : [categoryArg as NPCCategory];

  const playerState: PlayerState = {
    deathCount: playerDeaths,
    rescueCount: Math.floor(playerDeaths * 0.7),
    currentStreak: playerStreak,
    highestAnte: Math.min(3, Math.floor(playerDeaths / 20)),
    totalDebt: playerDebt,
    debtsTo: {},
    mythStatus,
    lastRunResult: playerDeaths > 0 ? 'death' : null,
    rescuedBy: null,
  };

  console.log('NPC-Player Dialogue Simulation');
  console.log('==============================');
  console.log(`Scenarios: ${scenarios.join(', ')}`);
  console.log(`NPC Categories: ${npcCategories.join(', ')}`);
  console.log(`Player: ${playerDeaths} deaths, streak ${playerStreak}, ${mythStatus} status`);
  console.log(`Claude: ${useClaude}`);
  console.log('');

  const entries = await runSimulation({
    scenarios,
    npcCategories,
    useClaude,
    batchSize: 100,
    playerState,
    verbose,
    seed,
  });

  // Save output
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(__dirname, '..', 'logs', `player-dialogue-${timestamp}`);
  saveOutput(entries, outputDir);

  console.log('\nDone!');
}

main().catch(console.error);
