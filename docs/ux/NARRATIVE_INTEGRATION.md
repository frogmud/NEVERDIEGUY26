# Narrative Integration

Documentation for the narrative systems of NEVER DIE GUY, including The Fixer's role, Die-rector relationships, and NPC dialogue.

## The Fixer's Role

You are **Guy "Never Die Guy" Smith**, aka **The Fixer** - a clone sent on intergalactic squabbles by six siblings (the Die-rectors) who control fate.

### Core Identity

- **Clone of a clone of a clone** - Immortality is questioned, not guaranteed
- **Mercenary for all six** - You serve whichever sibling needs you
- **Neutral party in sibling rivalry** - But your actions have consequences

### Gameplay Implications

- Die-rectors supply meteors (dice) from their resurrected planets
- Trading with NPCs affects your standing with specific Die-rectors
- Surviving members of destroyed planets may offer quests or grudges
- Your "death" just means another clone is deployed

## The Die-rectors (Pantheon)

Six siblings who share control of fate - and a very annoying 100/6 split.

### Sibling Overview

| Domain | Die-Rector | Die | Element | Personality |
|--------|------------|-----|---------|-------------|
| Meadow | The One | d4 | Void | Enigmatic, minimal |
| Forest | John | d6 | Earth | Practical, grounded |
| Caverns | Jane | d8 | Death | Calculating, precise |
| Ruins | King James | d10 | Fire | Regal, demanding |
| Shadow Realm | Peter | d12 | Ice | Cold, observant |
| Abyss | Robert | d20 | Wind | Chaotic, unpredictable |

### Sibling Dynamics

- **Constant rivalry** - Each wants to expand their domain
- **Shared chat system** - Required by Pantheon bylaws (100/6 split is annoying to divide)
- **Resource competition** - Meteors used to rebuild planets are also used as weapons
- **All use The Fixer** - You're the one constant in their conflicts

### Domain Control

Each Die-rector controls:
- One domain (their "territory")
- Resources from that domain's resurrected planets
- NPCs loyal to their cause (wanderers, travelers, shopkeepers)
- The planet you're currently destroying (from their siblings' perspective)

## Meteor Economy

The circular economy of destruction and rebirth.

### The Cycle

```
Dead Planets → Resurrected → Resources Harvested → Meteors Created
                                                        ↓
                                            Given to The Fixer
                                                        ↓
                                            Thrown at Sibling Planets
                                                        ↓
                                            Planets Destroyed → Dead Planets
```

### Meteors = Dice

- **d4-d20** map to meteor variants
- **Elements** match Die-rector domains
- **Harvested from resurrected planets** - nothing truly dies
- **Weapons and building materials** - same resource, different use

### Trading

- NPCs trade meteors, items, and information
- Trades affect Die-rector favor
- Some items persist across domains (cross-sibling influence)
- Economy reflects the recycled nature of the universe

## NPC Chat System

### Character Types

| Type | Role | Dialogue Style |
|------|------|----------------|
| **Pantheon (Die-rectors)** | Domain patrons | Regal, demanding, competitive |
| **Wanderers** | Travelers between domains | World-weary, informative |
| **Travelers** | Visitors from other realms | Curious, foreign perspective |
| **Shopkeepers** | Commerce NPCs | Transactional, gossipy |

### Dialogue Triggers

Die-rector dialogue appears at:
1. **Zone Selection** - Presents narrative fork options
2. **Combat Start** - Domain-specific flavor
3. **Victory** - Acknowledgment (begrudging or pleased)
4. **Defeat** - Taunt or reassurance (another clone incoming)

### Chatbase System

Client-side dialogue at `apps/web/src/services/chatbase.ts`:

**Features:**
- Pool-based dialogue selection (greeting, idle, threat, gamblingTrashTalk)
- Interest-score weighted random selection
- Mood compatibility filtering based on player context
- Template interpolation with game state ({score}, {goal}, {multiplier}, {turns})

**Character Filtering:**
- Filters out NPC-to-NPC dialogue
- Ensures dialogue is player-directed
- Maintains character voice consistency

## Narrative Fork (Zone Selection)

Minimal narrative choices that hint at difficulty.

### Presentation

Instead of explicit zone stats, present narrative options:

**Before (explicit):**
```
[Zone A: Stable]  [Zone B: Elite]  [Zone C: Anomaly]
```

**After (narrative):**
```
The path diverges...

- Press through the mist
- Investigate the disturbance
- Follow the strange signal
```

### Templates by Domain

18 templates total (6 domains x 3 zone types):

```typescript
const NARRATIVE_FORKS: Record<Domain, Record<ZoneType, string>> = {
  meadow: {
    stable: "Follow the worn trail through the grass...",
    elite: "The meadow rustles unnaturally ahead...",
    anomaly: "Something glimmers where the flowers don't grow..."
  },
  forest: {
    stable: "The path winds between ancient oaks...",
    elite: "Shadows move against the wind in the canopy...",
    anomaly: "A clearing pulses with unnatural light..."
  },
  // ... etc
};
```

### Skip Penalty

"Turn back" option increases boss difficulty:

```typescript
{ text: "Turn back (the Die-rector notes your hesitation...)", zoneType: 'skip' }
```

## Future Systems

### Favor System

Track standing with each Die-rector:
- Actions in their domain affect favor
- High favor unlocks special dialogue, items
- Low favor increases domain difficulty
- Trading affects cross-sibling relationships

### Clone Memory

What persists between deaths:
- Die-rector relationships (they remember you... or do they?)
- Certain items (marked as "persists")
- Meta-progression unlocks
- The question: are you really the same Fixer?

## Files

| File | Purpose |
|------|---------|
| `/apps/web/src/data/narrativeForks.ts` | Narrative templates |
| `/apps/web/src/data/wiki/entities/pantheon.ts` | Die-Rector data |
| `/apps/web/src/services/chatbase.ts` | Dialogue lookup |
| `/apps/web/src/contexts/RunContext.tsx` | State integration |
| `/packages/ai-engine/src/npcs/` | NPC personality engine |
