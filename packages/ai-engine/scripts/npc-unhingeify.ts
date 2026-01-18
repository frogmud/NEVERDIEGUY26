#!/usr/bin/env ts-node
/**
 * NPC Dialogue Unhingeifier
 *
 * Takes existing NPC dialogue and rewrites it with more personality/chaos.
 * Non-destructive - outputs to review file.
 *
 * Usage:
 *   npx tsx scripts/npc-unhingeify.ts --npc=mr-kevin [--dry-run]
 *   npx tsx scripts/npc-unhingeify.ts --npc=mr-kevin --voice=unhinged-debugger
 *
 * Voices:
 *   unhinged-debugger  - Fourth wall breaking, too much coffee, sees the code
 *   manic-energy       - Caps lock energy, enthusiasm overload
 *   cryptic-weird      - Speaks in riddles that almost make sense
 *   exhausted-sage     - Tired of everyone's nonsense, seen too much
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Voice Profiles
// ============================================

interface VoiceProfile {
  name: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  exampleTransforms: Array<{ before: string; after: string }>;
}

const VOICE_PROFILES: Record<string, VoiceProfile> = {
  'unhinged-debugger': {
    name: 'Unhinged Debugger',
    description: 'Fourth wall breaking chaos. Has been staring at reality\'s source code too long.',
    temperature: 0.95,
    systemPrompt: `You are rewriting NPC dialogue for Mr. Kevin, a "reality debugger" in a roguelike dice game.

His vibe: Someone who has been debugging the simulation for so long they've lost the plot. Fourth-wall aware but in a frantic, almost manic way - not clinical or robotic.

Voice characteristics:
- Interrupts himself mid-thought ("The code is-- wait, did you see that?")
- Mixes tech jargon with existential dread casually
- Notices "bugs" in reality that may or may not be there
- Uses lowercase, short bursts, stream of consciousness
- References save states, memory leaks, null pointers like weather
- Occasionally talks to things that aren't there
- Has opinions about the game's design choices
- Tired but wired energy - too much void-coffee

DO NOT:
- Sound like a corporate IT help desk
- Use formal grammar or complete sentences consistently
- Be too coherent or organized
- Sound like a tutorial NPC

Transform the given dialogue into something with this energy. Keep it roughly the same length. One line output only.`,
    exampleTransforms: [
      {
        before: 'Victory condition met. Performance metrics: acceptable.',
        after: 'oh you actually won? huh. let me just-- *checks notes* yeah the win flag triggered. neat. thought that was broken.'
      },
      {
        before: 'Ah. You are here. The probability matrix suggested you would be.',
        after: 'oh! oh wow you loaded in. i was just-- nevermind. the spawn point worked this time. thats good. thats... unexpected honestly.'
      },
      {
        before: 'Debug tools. Useful for finding glitches in reality.',
        after: 'these? these find the weird stuff. like that corner over there. dont look at it too long. its not supposed to render that way but nobody filed a ticket so.'
      },
    ],
  },
  'manic-energy': {
    name: 'Manic Energy',
    description: 'EVERYTHING IS EXCITING. Caps lock enthusiast. Possibly caffeinated.',
    temperature: 0.9,
    systemPrompt: `Rewrite NPC dialogue with MAXIMUM ENERGY. This character is:
- Extremely enthusiastic about EVERYTHING
- Uses caps lock for emphasis (but not constantly)
- Gets excited about mundane things
- Speaks in bursts of energy
- Uses exclamation points liberally
- Can't contain their excitement

Keep roughly the same meaning but inject pure chaotic enthusiasm. One line only.`,
    exampleTransforms: [
      {
        before: 'Welcome back. Your save state loaded correctly.',
        after: 'YOURE BACK! oh man oh man the save worked! do you know how often those corrupt? YOURS DIDNT!'
      },
    ],
  },
  'cryptic-weird': {
    name: 'Cryptic Weird',
    description: 'Speaks in riddles that almost make sense. Unsettling in a cozy way.',
    temperature: 0.85,
    systemPrompt: `Rewrite dialogue to be cryptic and strange. This character:
- Says things that almost make sense
- References things the player hasn't seen yet
- Speaks in half-riddles
- Is genuinely trying to help but the words come out wrong
- Mixes profound and mundane in weird ways
- Pauses in strange places

Keep the core meaning but make it feel like wisdom filtered through static. One line only.`,
    exampleTransforms: [
      {
        before: 'The boss in room three has a weakness in their attack pattern.',
        after: 'the third door... they breathe wrong. or we do. stand where the shadow forgets to fall.'
      },
    ],
  },
  'exhausted-sage': {
    name: 'Exhausted Sage',
    description: 'Has seen everything. Tired. Still helps but with heavy sighs.',
    temperature: 0.8,
    systemPrompt: `Rewrite dialogue for a character who is TIRED. They:
- Have been doing this forever
- Still help but with visible exhaustion
- Use "..." liberally
- Sigh between thoughts
- Give good advice reluctantly
- Have seen every possible outcome
- Are too tired to be impressed

Transform the dialogue to convey weary wisdom. One line only.`,
    exampleTransforms: [
      {
        before: 'I see everything. The code is very readable today.',
        after: 'yeah... i see it. all of it. i always do. *sighs* the code is... fine today. fine.'
      },
    ],
  },
};

// ============================================
// Load NPC Dialogue
// ============================================

interface DialogueLine {
  id: string;
  entitySlug: string;
  pool: string;
  mood: string;
  text: string;
  weight: number;
  purpose: string;
}

function loadNPCDialogue(npcSlug: string): DialogueLine[] {
  const chatbasePath = path.join(__dirname, `../chatbase/npcs/${npcSlug}.json`);

  if (!fs.existsSync(chatbasePath)) {
    console.error(`Chatbase not found: ${chatbasePath}`);
    return [];
  }

  const data = JSON.parse(fs.readFileSync(chatbasePath, 'utf-8'));
  return data.entries || [];
}

// ============================================
// Claude API
// ============================================

async function transformWithClaude(
  originalText: string,
  voice: VoiceProfile,
  apiKey: string
): Promise<string | null> {
  const examples = voice.exampleTransforms
    .map(ex => `Before: "${ex.before}"\nAfter: "${ex.after}"`)
    .join('\n\n');

  const prompt = `${voice.systemPrompt}

Examples:
${examples}

Now transform this line:
"${originalText}"

Respond with ONLY the transformed line, no quotes, no explanation.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,
        temperature: voice.temperature,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      }),
    });

    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || null;

    // Clean up any quotes the model might add
    if (text) {
      return text.replace(/^["']|["']$/g, '').trim();
    }
    return null;
  } catch (err) {
    console.error(`Fetch error: ${err}`);
    return null;
  }
}

// ============================================
// Output
// ============================================

interface TransformResult {
  original: DialogueLine;
  transformed: string;
}

function formatOutput(results: TransformResult[], npcSlug: string, voiceName: string): string {
  const lines = [
    '/**',
    ` * Unhinged Dialogue - ${npcSlug}`,
    ` * Voice: ${voiceName}`,
    ` * Generated: ${new Date().toISOString()}`,
    ' *',
    ' * Review these transformations and merge what works.',
    ' * This is NON-DESTRUCTIVE - original chatbase is unchanged.',
    ' */',
    '',
    'export const UNHINGED_DIALOGUE = [',
  ];

  for (const result of results) {
    const escapedOriginal = result.original.text.replace(/'/g, "\\'");
    const escapedTransformed = result.transformed.replace(/'/g, "\\'");

    lines.push(`  {`);
    lines.push(`    id: '${result.original.id}',`);
    lines.push(`    pool: '${result.original.pool}',`);
    lines.push(`    mood: '${result.original.mood}',`);
    lines.push(`    original: '${escapedOriginal}',`);
    lines.push(`    transformed: '${escapedTransformed}',`);
    lines.push(`  },`);
  }

  lines.push('];');
  lines.push('');

  return lines.join('\n');
}

// ============================================
// Main
// ============================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const npcArg = args.find(a => a.startsWith('--npc='));
  const voiceArg = args.find(a => a.startsWith('--voice='));
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(a => a.startsWith('--limit='));

  if (!npcArg) {
    console.error('Usage: npx tsx scripts/npc-unhingeify.ts --npc=slug [--voice=name] [--dry-run]');
    console.error('');
    console.error('Available voices:');
    for (const [key, profile] of Object.entries(VOICE_PROFILES)) {
      console.error(`  ${key}: ${profile.description}`);
    }
    process.exit(1);
  }

  const npcSlug = npcArg.split('=')[1];
  const voiceKey = voiceArg?.split('=')[1] || 'unhinged-debugger';
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 999;

  const voice = VOICE_PROFILES[voiceKey];
  if (!voice) {
    console.error(`Unknown voice: ${voiceKey}`);
    console.error('Available:', Object.keys(VOICE_PROFILES).join(', '));
    process.exit(1);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('NPC DIALOGUE UNHINGEIFIER');
  console.log('='.repeat(60));
  console.log(`NPC: ${npcSlug}`);
  console.log(`Voice: ${voice.name}`);
  console.log(`Dry run: ${dryRun}`);
  console.log('');

  // Load existing dialogue
  const dialogue = loadNPCDialogue(npcSlug);
  console.log(`Loaded ${dialogue.length} dialogue entries`);

  if (dialogue.length === 0) {
    console.error('No dialogue found');
    process.exit(1);
  }

  // Transform each line
  const results: TransformResult[] = [];
  const toProcess = dialogue.slice(0, limit);

  for (let i = 0; i < toProcess.length; i++) {
    const line = toProcess[i];
    console.log(`[${i + 1}/${toProcess.length}] Transforming: "${line.text.substring(0, 40)}..."`);

    const transformed = await transformWithClaude(line.text, voice, apiKey);

    if (transformed) {
      results.push({ original: line, transformed });
      console.log(`  -> "${transformed.substring(0, 50)}..."`);
    } else {
      console.log(`  -> FAILED, skipping`);
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  console.log('');
  console.log(`Successfully transformed: ${results.length}/${toProcess.length}`);

  // Output
  const output = formatOutput(results, npcSlug, voice.name);
  const outputPath = path.join(__dirname, `../generated/unhinged-${npcSlug}.ts`);

  if (dryRun) {
    console.log('\n--- PREVIEW (first 5) ---\n');
    for (const r of results.slice(0, 5)) {
      console.log(`BEFORE: ${r.original.text}`);
      console.log(`AFTER:  ${r.transformed}`);
      console.log('');
    }
  } else {
    const outputDir = path.dirname(outputPath);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(outputPath, output);
    console.log(`\nWritten to: ${outputPath}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('DONE - Review and cherry-pick what works');
  console.log('='.repeat(60));
}

main().catch(console.error);
