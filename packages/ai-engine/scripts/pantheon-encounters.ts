#!/usr/bin/env ts-node
/**
 * Pantheon Encounters Simulation
 *
 * Generates Die-rector specific dialogue for the chatbase.
 * Each Die-rector has unique domain, voice, and encounter types.
 *
 * Die-rectors:
 * - The One (d4) - Null Providence - Cosmic existential horror
 * - John (d6) - Earth - Disappointed efficiency
 * - Peter (d8) - Shadow Keep - Judgmental gatekeeper
 * - Robert (d10) - Infernus - Testing through fire
 * - Alice (d12) - Frost Reach - Temporal patience
 * - Jane (d20) - Aberrant - Chaos appreciation
 * - Rhea - Queen of Never - Prophetic ascending
 *
 * Run with: npx tsx scripts/pantheon-encounters.ts
 *
 * Options:
 *   --die-rector=X     Specific Die-rector slug (or 'all')
 *   --encounter=X      Encounter type (warning, testing, judgment, threat, prophecy, all)
 *   --player-deaths=N  Player death count
 *   --player-ante=N    Player highest ante reached
 *   --use-claude       Enable Claude API (required for quality)
 *   --verbose          Show all output
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createSeededRng, type SeededRng } from '../src/core/seeded-rng';

// Dynamic import for Anthropic SDK (only loaded when --use-claude is passed)
let Anthropic: any = null;
async function loadAnthropicSDK(): Promise<boolean> {
  try {
    const module = await import('@anthropic-ai/sdk');
    Anthropic = module.default;
    return true;
  } catch {
    return false;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Types
// ============================================

type EncounterType = 'warning' | 'testing' | 'judgment' | 'threat' | 'prophecy' | 'domain_entry' | 'domain_exit';

interface DieRectorDef {
  slug: string;
  name: string;
  domain: string;
  die: string;
  tone: string;
  personality: string;
  voice: string;
  catchphrases: string[];
  triggers: string[];
  themes: string[];
}

interface PlayerContext {
  deathCount: number;
  highestAnte: number;
  inDomain: boolean;
  domainSlug: string | null;
  lastDeath: string | null;
  defiance: number; // 0-100, how much player has challenged pantheon
}

interface PantheonEntry {
  id: string;
  encounter: EncounterType;
  speaker: string;
  speakerName: string;
  domain: string;
  text: string;
  pool: string;
  playerContext: Partial<PlayerContext>;
  tags: string[];
  interestScore: number;
}

// ============================================
// Die-Rector Definitions
// ============================================

const DIE_RECTORS: DieRectorDef[] = [
  {
    slug: 'the-one',
    name: 'The One',
    domain: 'Null Providence',
    die: 'd4',
    tone: 'cosmic existential horror',
    personality: 'The Die-rector who oversees the void, nothingness, and the end of all things',
    voice: 'Speaks with echoing multiplicity, as if many voices at once. References void, null, emptiness. Questions the nature of existence. Sentences trail into silence.',
    catchphrases: [
      'All paths lead to null.',
      'The void remembers.',
      'You were never here. None of us were.',
      'Existence is the anomaly.',
    ],
    triggers: ['player reaches Ante 3', 'high death count', 'player mentions escape'],
    themes: ['void', 'null', 'nothingness', 'erasure', 'non-existence', 'the end'],
  },
  {
    slug: 'john',
    name: 'John',
    domain: 'Earth',
    die: 'd6',
    tone: 'disappointed efficiency expert',
    personality: 'The Die-rector of optimization, disappointed by inefficiency',
    voice: 'Mechanical precision, clicks and whirs, speaks in measurements and metrics. Constantly calculating. Sighs with disappointment. References gears, efficiency, improvement.',
    catchphrases: [
      'Efficiency is paramount.',
      'Your performance metrics are... suboptimal.',
      'There is always room for improvement.',
      'The machine never stops.',
    ],
    triggers: ['repeated failures', 'player needs improvement', 'inefficient play'],
    themes: ['gears', 'efficiency', 'optimization', 'improvement', 'measurement', 'machinery'],
  },
  {
    slug: 'peter',
    name: 'Peter',
    domain: 'Shadow Keep',
    die: 'd8',
    tone: 'judgmental gatekeeper',
    personality: 'The Die-rector who keeps records of all sins and transgressions',
    voice: 'Cold, judging, asks questions he already knows the answers to. Writes constantly in his shadow book. References sins, debts, judgment. Knows everything you\'ve done.',
    catchphrases: [
      'I see what you\'ve done.',
      'Judgment is inevitable.',
      'Your ledger grows heavy.',
      'The gate opens only for the worthy.',
    ],
    triggers: ['post-death judgment', 'player enters domain', 'player sins'],
    themes: ['judgment', 'sins', 'the ledger', 'worthiness', 'the gate', 'shadows'],
  },
  {
    slug: 'robert',
    name: 'Robert',
    domain: 'Infernus',
    die: 'd10',
    tone: 'testing through fire',
    personality: 'The Die-rector who believes strength comes from trial',
    voice: 'Intense, fiery, challenging. References flames, forging, testing, strength. Respects those who fight back. Speaks in terms of combat and challenge.',
    catchphrases: [
      'The fire reveals all.',
      'Burn, and become stronger.',
      'Only through trial do we become worthy.',
      'Fight me.',
    ],
    triggers: ['hot streak', 'aggressive play', 'player challenges pantheon'],
    themes: ['fire', 'trial', 'strength', 'forging', 'challenge', 'combat'],
  },
  {
    slug: 'alice',
    name: 'Alice',
    domain: 'Frost Reach',
    die: 'd12',
    tone: 'temporal patience',
    personality: 'The Die-rector who understands time is meaningless',
    voice: 'Slow, measured, patient. References ice, time, waiting, patience. Speaks of past and future as one. Everything happens eventually. Cold logic.',
    catchphrases: [
      'Time means nothing here.',
      'All becomes ice eventually.',
      'Patience is its own reward.',
      'I have waited eons for this moment.',
    ],
    triggers: ['patient play', 'strategic decisions', 'long runs'],
    themes: ['ice', 'time', 'patience', 'eternity', 'cold', 'waiting'],
  },
  {
    slug: 'jane',
    name: 'Jane',
    domain: 'Aberrant',
    die: 'd20',
    tone: 'chaos appreciation',
    personality: 'The Die-rector who embraces randomness and chaos',
    voice: 'Unpredictable, shifts mid-sentence, delighted by chaos. References chance, dice, randomness, the unexpected. Laughs at order. May contradict herself.',
    catchphrases: [
      'Roll the bones!',
      'Chaos is the only truth.',
      'Expect nothing. Accept everything.',
      'Even the dice don\'t know what comes next.',
    ],
    triggers: ['unpredictable play', 'high variance outcomes', 'lucky rolls'],
    themes: ['chaos', 'randomness', 'dice', 'the unexpected', 'chance', 'mutation'],
  },
  {
    slug: 'rhea',
    name: 'Rhea',
    domain: 'Queen of Never',
    die: 'special',
    tone: 'prophetic ascending',
    personality: 'The ascended queen who sees all possible futures',
    voice: 'Regal, prophetic, speaks of destinies and paths. References crowns, thrones, the game itself. Knows the player is special. Speaks in prophecy.',
    catchphrases: [
      'I see your paths.',
      'You were always meant to be here.',
      'The crown awaits.',
      'Never is closer than you think.',
    ],
    triggers: ['legend status', 'prophecy mentions', 'late game'],
    themes: ['prophecy', 'destiny', 'crowns', 'paths', 'the game', 'ascension'],
  },
];

// ============================================
// Encounter Prompts
// ============================================

function getEncounterPrompt(
  encounter: EncounterType,
  dieRector: DieRectorDef,
  playerContext: PlayerContext
): string {
  const baseContext = `
You are ${dieRector.name}, Die-rector of ${dieRector.domain} (represented by the ${dieRector.die}).
Personality: ${dieRector.personality}
Voice: ${dieRector.voice}
Themes: ${dieRector.themes.join(', ')}
Catchphrases you might use: ${dieRector.catchphrases.join(' | ')}

The player is a mortal called "Never Die Guy" who dies and respawns endlessly.
Player stats: ${playerContext.deathCount} deaths, highest ante ${playerContext.highestAnte}.
${playerContext.inDomain ? `Player is IN YOUR DOMAIN (${dieRector.domain}).` : 'Player is elsewhere.'}
${playerContext.defiance > 50 ? 'Player has shown defiance against the Pantheon.' : ''}
`;

  switch (encounter) {
    case 'warning':
      return `${baseContext}

The player approaches your domain. Give them a WARNING about what awaits.
Be ominous, threatening, but also intriguing. Make them fear AND want to continue.
2-4 sentences. Include *action descriptions* in asterisks. Stay in character.`;

    case 'testing':
      return `${baseContext}

You are TESTING the player. Challenge them with words, question their resolve.
This is an active encounter - you're probing their weakness or strength.
2-4 sentences. Include *action descriptions* in asterisks. Stay in character.`;

    case 'judgment':
      return `${baseContext}

The player has just DIED (death #${playerContext.deathCount}). Pass JUDGMENT on their performance.
Were they worthy? Did they fight well? What did you observe?
2-4 sentences. Include *action descriptions* in asterisks. Stay in character.`;

    case 'threat':
      return `${baseContext}

The player has defied you or the Pantheon. Issue a THREAT.
Make clear the consequences of continued defiance. But don't be boring - be cosmic.
2-4 sentences. Include *action descriptions* in asterisks. Stay in character.`;

    case 'prophecy':
      return `${baseContext}

Deliver a PROPHECY about the player's fate.
Be cryptic, meaningful, possibly double-edged. Reference the game's meta nature if appropriate.
2-4 sentences. Include *action descriptions* in asterisks. Stay in character.`;

    case 'domain_entry':
      return `${baseContext}

The player has just ENTERED your domain (${dieRector.domain}).
Welcome them... in your way. Establish the rules of your realm.
2-4 sentences. Include *action descriptions* in asterisks. Stay in character.`;

    case 'domain_exit':
      return `${baseContext}

The player is LEAVING your domain (surviving or dying).
Give them parting words. Will they return? What have they learned?
2-4 sentences. Include *action descriptions* in asterisks. Stay in character.`;

    default:
      return baseContext + '\n\nGenerate a contextual Die-rector dialogue. 2-4 sentences. Stay in character.';
  }
}

// ============================================
// Claude API Integration
// ============================================

let anthropic: any = null;

async function generateWithClaude(
  prompt: string,
  dieRector: DieRectorDef
): Promise<string> {
  if (!Anthropic) {
    throw new Error('Anthropic SDK not loaded. Run with --use-claude after installing @anthropic-ai/sdk');
  }
  if (!anthropic) {
    anthropic = new Anthropic();
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: `You are writing dialogue for cosmic horror boss NPCs in a roguelike game called "Never Die Guy".
These are Die-rectors - god-like entities who control the game world.
Write ONLY their dialogue, no explanations. Be cosmic, threatening, yet characterful.
Each Die-rector has a distinct voice and domain. Stay in character.
Include *action descriptions* in asterisks where appropriate.`,
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }
    return '';
  } catch (err) {
    console.error(`Claude API error for ${dieRector.slug}:`, err);
    return '';
  }
}

// ============================================
// Template Fallback
// ============================================

function generateFromTemplate(
  encounter: EncounterType,
  dieRector: DieRectorDef,
  playerContext: PlayerContext,
  rng: SeededRng
): string {
  const catchphrase = dieRector.catchphrases[Math.floor(rng() * dieRector.catchphrases.length)];
  const theme = dieRector.themes[Math.floor(rng() * dieRector.themes.length)];

  switch (encounter) {
    case 'warning':
      return `*the ${theme} stirs* ${catchphrase} You approach ${dieRector.domain}. Many have entered. None have escaped unchanged.`;

    case 'testing':
      return `*studies you with ancient eyes* ${catchphrase} Show me your resolve, mortal. Death number ${playerContext.deathCount}... and counting.`;

    case 'judgment':
      return `*consults the ${theme}* ${catchphrase} Your death was... predictable. You are not yet worthy of ${dieRector.domain}.`;

    case 'threat':
      return `*the ${theme} intensifies* ${catchphrase} Defy us again, and you will learn what eternal suffering truly means.`;

    case 'prophecy':
      return `*visions of ${theme} surround you* ${catchphrase} Your fate is written in the ${theme}. Whether you read it or not.`;

    case 'domain_entry':
      return `*welcomes you to ${dieRector.domain}* ${catchphrase} You stand in my realm now. My rules. My ${theme}.`;

    case 'domain_exit':
      return `*watches you leave* ${catchphrase} You will return to ${dieRector.domain}. They always do.`;

    default:
      return catchphrase;
  }
}

// ============================================
// Main Simulation
// ============================================

async function runSimulation(config: {
  dieRectors: DieRectorDef[];
  encounters: EncounterType[];
  useClaude: boolean;
  playerContext: PlayerContext;
  verbose: boolean;
  seed: string;
}): Promise<PantheonEntry[]> {
  const entries: PantheonEntry[] = [];
  const rng = createSeededRng(config.seed);

  console.log(`Running Pantheon simulation with ${config.dieRectors.length} Die-rectors, ${config.encounters.length} encounter types`);
  console.log(`Claude API: ${config.useClaude ? 'enabled (REQUIRED for quality)' : 'disabled (templates only)'}`);

  for (const encounter of config.encounters) {
    console.log(`\nEncounter: ${encounter}`);

    for (const dieRector of config.dieRectors) {
      // Vary player context slightly
      const localContext: PlayerContext = {
        ...config.playerContext,
        inDomain: encounter === 'domain_entry' || encounter === 'testing',
        domainSlug: dieRector.slug,
      };

      const prompt = getEncounterPrompt(encounter, dieRector, localContext);

      let text: string;
      if (config.useClaude) {
        text = await generateWithClaude(prompt, dieRector);
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Fallback if Claude fails or is disabled
      if (!text) {
        text = generateFromTemplate(encounter, dieRector, localContext, rng);
      }

      if (!text || text.length < 10) continue;

      const entry: PantheonEntry = {
        id: `pantheon-${encounter}-${dieRector.slug}-${Date.now()}`,
        encounter,
        speaker: dieRector.slug,
        speakerName: dieRector.name,
        domain: dieRector.domain,
        text,
        pool: mapEncounterToPool(encounter),
        playerContext: {
          deathCount: localContext.deathCount,
          highestAnte: localContext.highestAnte,
          inDomain: localContext.inDomain,
        },
        tags: [
          'pantheon',
          encounter,
          dieRector.slug,
          dieRector.domain.toLowerCase().replace(' ', '_'),
          config.useClaude ? 'claude_generated' : 'template',
        ],
        interestScore: config.useClaude ? 95 : 65, // Pantheon dialogue should be high quality
      };

      entries.push(entry);

      if (config.verbose) {
        console.log(`  [${dieRector.name}] ${text.substring(0, 80)}...`);
      }
    }
  }

  return entries;
}

function mapEncounterToPool(encounter: EncounterType): string {
  switch (encounter) {
    case 'warning': return 'threat';
    case 'testing': return 'challenge';
    case 'judgment': return 'reaction';
    case 'threat': return 'threat';
    case 'prophecy': return 'lore';
    case 'domain_entry': return 'greeting';
    case 'domain_exit': return 'farewell';
    default: return 'reaction';
  }
}

// ============================================
// Output
// ============================================

function saveOutput(entries: PantheonEntry[], outputDir: string): void {
  fs.mkdirSync(outputDir, { recursive: true });

  // Save all entries
  fs.writeFileSync(
    path.join(outputDir, 'pantheon-dialogues.json'),
    JSON.stringify({ entries, count: entries.length }, null, 2)
  );

  // Save summary
  const summary = {
    timestamp: new Date().toISOString(),
    totalEntries: entries.length,
    byEncounter: {} as Record<string, number>,
    byDieRector: {} as Record<string, number>,
    averageInterestScore: entries.reduce((sum, e) => sum + e.interestScore, 0) / entries.length,
  };

  for (const entry of entries) {
    summary.byEncounter[entry.encounter] = (summary.byEncounter[entry.encounter] || 0) + 1;
    summary.byDieRector[entry.speaker] = (summary.byDieRector[entry.speaker] || 0) + 1;
  }

  fs.writeFileSync(
    path.join(outputDir, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  // Save readable markdown
  let markdown = '# Pantheon Encounter Dialogues\n\n';
  for (const encounter of ['warning', 'testing', 'judgment', 'threat', 'prophecy', 'domain_entry', 'domain_exit']) {
    const encounterEntries = entries.filter(e => e.encounter === encounter);
    if (encounterEntries.length === 0) continue;

    markdown += `## ${encounter.toUpperCase()}\n\n`;
    for (const entry of encounterEntries) {
      markdown += `### ${entry.speakerName} (${entry.domain})\n`;
      markdown += `> ${entry.text}\n\n`;
    }
  }

  fs.writeFileSync(
    path.join(outputDir, 'dialogues.md'),
    markdown
  );

  console.log(`\nSaved ${entries.length} entries to ${outputDir}`);
}

// ============================================
// CLI
// ============================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const dieRectorArg = args.find(a => a.startsWith('--die-rector='))?.split('=')[1] || 'all';
  const encounterArg = args.find(a => a.startsWith('--encounter='))?.split('=')[1] || 'all';
  const playerDeaths = parseInt(args.find(a => a.startsWith('--player-deaths='))?.split('=')[1] || '50', 10);
  const playerAnte = parseInt(args.find(a => a.startsWith('--player-ante='))?.split('=')[1] || '2', 10);
  const useClaude = args.includes('--use-claude');
  const verbose = args.includes('--verbose');

  // Load Anthropic SDK if needed
  if (useClaude) {
    const loaded = await loadAnthropicSDK();
    if (!loaded) {
      console.error('ERROR: @anthropic-ai/sdk not installed. Run: npm install @anthropic-ai/sdk');
      process.exit(1);
    }
  }
  const seed = args.find(a => a.startsWith('--seed='))?.split('=')[1] || `pantheon-${Date.now()}`;

  const dieRectors = dieRectorArg === 'all'
    ? DIE_RECTORS
    : DIE_RECTORS.filter(d => d.slug === dieRectorArg);

  const allEncounters: EncounterType[] = ['warning', 'testing', 'judgment', 'threat', 'prophecy', 'domain_entry', 'domain_exit'];
  const encounters = encounterArg === 'all' ? allEncounters : [encounterArg as EncounterType];

  const playerContext: PlayerContext = {
    deathCount: playerDeaths,
    highestAnte: playerAnte,
    inDomain: false,
    domainSlug: null,
    lastDeath: null,
    defiance: Math.min(100, playerDeaths * 2), // More deaths = more defiance
  };

  console.log('Pantheon Encounters Simulation');
  console.log('==============================');
  console.log(`Die-rectors: ${dieRectors.map(d => d.name).join(', ')}`);
  console.log(`Encounters: ${encounters.join(', ')}`);
  console.log(`Player: ${playerDeaths} deaths, ante ${playerAnte}`);
  console.log(`Claude: ${useClaude} ${useClaude ? '' : '(NOTE: Claude strongly recommended for Pantheon quality)'}`);
  console.log('');

  const entries = await runSimulation({
    dieRectors,
    encounters,
    useClaude,
    playerContext,
    verbose,
    seed,
  });

  // Save output
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(__dirname, '..', 'logs', `pantheon-${timestamp}`);
  saveOutput(entries, outputDir);

  console.log('\nDone!');
}

main().catch(console.error);
