# Narrative Integration

Documentation for narrative systems including Narrative Fork zone selection, Die-rector dialogue, and future expansion points.

## Narrative Fork (Zone Selection)

Replaces explicit "door cards" with minimal narrative choices like Balatro.

### Concept

Instead of showing zone stats, present narrative options that hint at difficulty:

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

### Implementation

**Component:** `NarrativeFork.tsx`

**Props:**
```typescript
interface NarrativeForkProps {
  domain: Domain;
  options: NarrativeOption[];
  onSelect: (index: number) => void;
}

interface NarrativeOption {
  text: string;       // Narrative choice text
  zoneType: ZoneType; // Hidden: stable | elite | anomaly
}
```

**UI:**
- Minimal text panel in sidebar
- Radio buttons or clickable list
- No difficulty stars, no tier badges
- Zone type revealed only after selection

### Narrative Templates

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
  caverns: {
    stable: "Crystal veins mark the safest tunnel...",
    elite: "Echoes suggest something large below...",
    anomaly: "The walls themselves seem to breathe..."
  },
  ruins: {
    stable: "Moss-covered stairs descend steadily...",
    elite: "Collapsed pillars block the obvious path...",
    anomaly: "Whispers call from the sealed chamber..."
  },
  shadowRealm: {
    stable: "Faint torchlight guides the way...",
    elite: "The darkness here has weight and presence...",
    anomaly: "Reality folds upon itself ahead..."
  },
  abyss: {
    stable: "The void parts to reveal passage...",
    elite: "Something ancient stirs in the depths...",
    anomaly: "The boundary between worlds thins..."
  }
};
```

### Skip Penalty

"Turn back" option adds Heat (+20% boss difficulty):

```typescript
const options = [
  ...zoneNarratives,
  { text: "Turn back (the Die-rector notes your hesitation...)", zoneType: 'skip' }
];
```

## Die-Rector Dialogue

Each domain has a Die-Rector patron who delivers narrative prompts.

### Die-Rectors by Domain

| Domain | Die-Rector | Die | Element |
|--------|------------|-----|---------|
| Meadow | The One | d4 | Void |
| Forest | John | d6 | Earth |
| Caverns | Jane | d8 | Death |
| Ruins | King James | d10 | Fire |
| Shadow Realm | Peter | d12 | Ice |
| Abyss | Robert | d20 | Wind |

### Dialogue Points

Die-Rector dialogue appears at:
1. **Zone Selection** - Presents narrative fork options
2. **Combat Start** - Brief domain-specific flavor
3. **Victory** - Praise or acknowledgment
4. **Defeat** - Taunt or consequence warning

### Future: NPC Chat System

Integration with `ndg26x_adaptive_ai_chat_system`:

- NPCs have knowledge of app lore
- Trade/barter affects player stats
- Dialogue choices influence meters
- Deterministic templates with variation

## Future Systems

### Nerd/Jock Meter

Balance meter affecting spell casting:

```typescript
interface MeterState {
  nerdMeter: number;  // 0-100
  jockMeter: number;  // 0-100
}
```

**Triggers:**
- Dialogue choices shift meters
- Combat actions shift meters
- Certain items provide buffs

**Effects:**
- Spells require meter balance
- Imbalance causes spell failures
- Some abilities scale with meter extremes

### Text Adventure Intro

Pre-first-combat narrative:

```
[Screen fades to dark]

You stand at the threshold.
The dice await.

[Dice fall into frame, settle]

Your journey begins...

[Player input advances to Zone Select]
```

### Encounter Dialogue

NPC encounters with consequence choices:

```
A wanderer blocks your path.

"Looking for trouble, or just passing through?"

- "Just passing" -> +calmBonus, no combat
- "Let's go!" -> +jockMeter, combat possible
- "What wisdom do you offer?" -> +nerdMeter, lore unlock
```

## Files

- `/apps/web/src/data/narrativeForks.ts` - Narrative templates
- `/apps/web/src/games/meteor/components/NarrativeFork.tsx` - Selection UI
- `/apps/web/src/data/wiki/entities/pantheon.ts` - Die-Rector data
- `/apps/web/src/contexts/RunContext.tsx` - State integration
