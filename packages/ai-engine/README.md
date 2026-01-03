# @ndg/ai-engine

Chess tablebase-style dialogue system for NEVER DIE GUY. Pre-computes contextual NPC responses using Claude, indexes them for O(1) runtime lookups.

## Philosophy

Like Syzygy tablebases in chess - expensive offline computation, instant runtime retrieval.

```
OFFLINE (Claude + Simulation)     RUNTIME (Instant Lookup)
         |                                  |
    500+ days sim                    Player context
         |                                  |
    Claude generates                 Hash to bucket
         |                                  |
    Extract & index          -->     O(1) chatbase hit
         |                                  |
    chatbase/npcs/*.json             Contextual response
```

## Core Systems

### Player Profile (`src/player/`)
- **4 Archetypes**: aggressive, defensive, chaotic, balanced
- **Story Beats**: Memorable moments with TTL decay (close-call, crushing-victory, etc.)
- **Debt Tension**: Escalating levels (none/minor/notable/threatening)

### Chatbase (`src/search/`)
- **Triggers**: Match responses by archetype, story beat, debt, mood
- **Scoring**: Weighted relevance based on context match
- **Variables**: `{{debtAmount}}`, `{{winStreak}}`, `{{playerName}}` substitution

### Simulations (`scripts/`)
- `npc-eternal-days.ts` - NPC daily life sim with Claude dialogue
- `arena-run-sim.ts` - Roguelike run sim with profile tracking
- `extract-chatbase.ts` - Extract dialogue logs to indexed chatbase

## Quick Start

```bash
# Generate dialogue with Claude (needs ANTHROPIC_API_KEY)
npm run sim:eternal:claude

# Extract to chatbase
npm run sim:extract

# Run arena simulation (tracks player profile)
npx tsx scripts/arena-run-sim.ts --runs=100
```

## Output Structure

```
logs/
  eternal-{timestamp}/
    days/*.md           # Daily dialogue logs
    player-profile.json # Cumulative profile
    final-state.json    # Full simulation state

chatbase/
  manifest.json         # Index metadata
  npcs/
    mr-kevin.json       # Per-NPC dialogue entries
    stitch-up-girl.json
    ...
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `sim:eternal` | Run eternal simulation (no Claude) |
| `sim:eternal:claude` | Run with Claude dialogue generation |
| `sim:extract` | Extract logs to chatbase |
| `sim:pantheon` | Pantheon encounter sim |
| `sim:chatter` | Pre-game chatter sim |

## Key Types

```typescript
// Player profile for adaptive dialogue
interface PlayerProfile {
  playerName: string;
  archetype: 'aggressive' | 'defensive' | 'chaotic' | 'balanced';
  winStreak: number;
  lossStreak: number;
  storyBeats: StoryBeat[];  // Decaying memorable moments
  debtsTo: Record<string, number>;
  rescuedBy: Record<string, number>;
}

// Chatbase entry with triggers
interface ChatbaseEntry {
  text: string;
  speaker: { slug: string; name: string };
  triggers?: {
    playerArchetype?: PlayerArchetype;
    debtTension?: DebtTension;
    recentStoryBeat?: StoryBeatType;
  };
}
```

## Integration

```typescript
import { createChatbaseLookup, lookupDialogue } from '@ndg/ai-engine/chatbase';
import { createPlayerProfile } from '@ndg/ai-engine';

const engine = createChatbaseLookup('./chatbase');
const profile = createPlayerProfile();

const { text, confidence } = lookupDialogue(
  engine,
  'mr-kevin',      // NPC
  'reaction',      // Pool
  profile,         // Player context
  currentRun,
  seed
);
```

## Status

- [x] Player profile system (archetypes, story beats, debt tension)
- [x] Chatbase extraction with trigger tagging
- [x] Lookup engine with weighted scoring
- [x] Claude integration for dialogue generation
- [x] Arena run simulation with profile tracking
- [ ] Frontend integration (apps/web)
- [ ] Multiplayer profile sync
