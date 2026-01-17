# Divine Drama Engine - Multiplayer System

## Overview

Multiplayer racing mode where 2-8 players compete through identical seeds while Die-rectors develop opinions and intervene based on how players treat their dice.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PartyKit Cloud                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    party/room.ts                         │   │
│  │  - Room state management                                 │   │
│  │  - Favor calculation (Die-rector opinions)               │   │
│  │  - Intervention generation                               │   │
│  │  - WebSocket broadcasting                                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         React Client                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ contexts/PartyContext.tsx                                │   │
│  │  - WebSocket connection                                  │   │
│  │  - Room state subscription                               │   │
│  │  - Message sending                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ hooks/usePartyBridge.ts                                  │   │
│  │  - Syncs RunContext → PartyContext                       │   │
│  │  - Auto-detects dice events                              │   │
│  │  - Broadcasts progress                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ screens/play/multiplayer/                                │   │
│  │  - MultiplayerLobby (join/create rooms)                  │   │
│  │  - RaceHUD (leaderboard overlay)                         │   │
│  │  - InterventionToast (blessing/scorn alerts)             │   │
│  │  - QuickChatPanel (pre-baked phrases)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Key Files

### Server (PartyKit)
| File | Purpose |
|------|---------|
| `party/room.ts` | PartyKit room server |
| `party/package.json` | Server dependencies |
| `partykit.json` | PartyKit configuration |

### AI Engine (packages/ai-engine/src/multiplayer/)
| File | Purpose |
|------|---------|
| `favor-system.ts` | Die-rector memory, personality variance |
| `intervention-system.ts` | Blessing/Scorn generation |
| `room-types.ts` | Shared types (client/server) |
| `index.ts` | Barrel exports |

### Client (apps/web/src/)
| File | Purpose |
|------|---------|
| `contexts/PartyContext.tsx` | WebSocket state management |
| `hooks/usePartyBridge.ts` | RunContext ↔ PartyContext bridge |
| `screens/play/MultiplayerHub.tsx` | Main multiplayer wrapper |
| `screens/play/multiplayer/*.tsx` | UI components |

## Die-rector Memory System

### Dice-to-Die-rector Mapping
| Die | Die-rector | Element |
|-----|------------|---------|
| d4 | The One | Void |
| d6 | John | Earth |
| d8 | Peter | Death |
| d10 | Robert | Fire |
| d12 | Alice | Ice |
| d20 | Jane | Wind |

### Events That Affect Favor
| Event | Favor Delta | Notes |
|-------|-------------|-------|
| ROLLED | +3 | Used their die |
| HELD | +2 | Kept their die |
| CRIT | +8 | Max roll on their die |
| TRADED | -5 | Swapped away their die |
| IGNORED | -2 | Had die, threw others |
| SNAKE | -1 | Rolled 1 |

### Favor Thresholds
- **BLESSED** (>= +50): Active assistance
- **NEUTRAL** (-50 to +50): Normal behavior
- **SCORNED** (<= -50): Active hindrance

### Personality Variance
| Die-rector | Forgiveness | Grudge | Sensitivity | Notes |
|------------|-------------|--------|-------------|-------|
| The One | Slow | Slow | Low | Patient, hard to move |
| John | Conditional | Medium | Medium | Tracks efficiency |
| Peter | Never | Forever | High | Holds grudges forever |
| Robert | Fast | Fast | Very High | Volatile |
| Alice | Glacial | Eternal | Very Low | Almost impossible to shift |
| Jane | Random | Random | Chaotic | Unpredictable |

### Rivalry System
When scorned by one Die-rector, their rival may offer sympathy:
- **Robert** ↔ **Alice** (Fire vs Ice)
- **John** ↔ **Peter** (Territorial dispute)
- **The One** ↔ **Rhea** (Ancient rivalry)

## Room Flow

```
CREATE ROOM → LOBBY → COUNTDOWN → RACING → RESULTS → [NEXT MATCH | SET COMPLETE]
                ▲                              │
                └──────────────────────────────┘
```

### Room State
```typescript
interface RoomState {
  code: string;              // 4-char room code
  phase: 'lobby' | 'countdown' | 'racing' | 'results' | 'set_complete';
  config: RoomConfig;        // Match format, max players
  players: Record<string, RacePlayer>;
  favorMaps: Record<string, PlayerFavorMap>;  // Die-rector memory
  matchHistory: MatchResult[];
  setScores: SetScore[];
  recentEvents: Array<InterventionEvent | ChatEvent>;
}
```

## Development

### Local Testing
```bash
# Terminal 1: PartyKit dev server
pnpm dev:party

# Terminal 2: Vite dev server
pnpm dev:web
```

### Environment Variables
```
VITE_PARTYKIT_HOST=localhost:1999  # Local dev
VITE_PARTYKIT_HOST=ndg-multiplayer.partykit.dev  # Production
```

### Deployment
```bash
# Deploy PartyKit room server
pnpm deploy:party

# Web app auto-deploys via Vercel
```

## Quick Chat Phrases

### Positive
- "Nice throw!"
- "Well played."
- "Good luck!"
- "GG"

### Negative
- "Oops."
- "Not great..."
- "Unfortunate."
- "*sigh*"

### Neutral
- "Interesting..."
- "Hmm."
- "One moment."
- "..."

## Integration Points

### Combat Engine
The `usePartyBridge` hook automatically detects dice events:
- Compares combat state snapshots
- Emits ROLLED/HELD/TRADED events
- Reports CRIT/SNAKE after roll resolution

### Progress Broadcasting
- Auto-broadcasts every 2 seconds during race
- Manual broadcast on room clear
- Victory/death triggers finish event

### Intervention Effects
When a player crosses a favor threshold:
1. Server generates intervention event
2. Broadcasts to all clients
3. `InterventionToast` displays the message
4. Effects applied to player's game state

## Match Formats

| Format | Wins Needed |
|--------|-------------|
| bo1 | 1 |
| bo3 | 2 |
| bo5 | 3 |
| bo7 | 4 |

Die-rector memory **persists** across matches within a set.
Memory **resets** on rematch (new set).
