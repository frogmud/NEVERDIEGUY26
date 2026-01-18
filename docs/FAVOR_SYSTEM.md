# Die-rector Favor System

## Overview

Items are no longer combat stat sticks. They are eternal treasures collected by Die-rectors across infinite re-cloned galaxies. As a fixer hired by these immortal beings, you gift items to earn their favor, which provides combat bonuses within their domains.

## Core Concept

**Lore**: Die-rectors are the last beings in this galaxy, eternally collecting "trash/treasure" from re-cloned dead planets. Items are gifts exchanged between eternal siblings, not equipment that directly boosts stats.

**Gameplay**: Giving items to Die-rectors increases favor. High favor provides score and gold multipliers when playing in that Die-rector's domain. Disliked items reduce favor.

## Die-rector Item Preferences

Each Die-rector has specific collection preferences:

### The One (Door 1 - Null Providence)
- **Element**: Void
- **Collects**: Artifacts, Quest items
- **Preferred**: void-crystal, null-charm, reality-anchor
- **Dislikes**: elemental-prism

### John (Door 2 - Earth)
- **Element**: Earth / Stone
- **Collects**: Armor, Materials, Weapons
- **Preferred**: earth-stone, iron-boots, heavy-shield, turtle-shell
- **Dislikes**: wind-feather

### Peter (Door 3 - Shadow Keep)
- **Element**: Life / Death
- **Collects**: Weapons, Armor, Artifacts
- **Preferred**: death-sigil, bone-dagger, skull-mask, shadow-cloak
- **Dislikes**: fire-ember

### Robert (Door 4 - Infernus)
- **Element**: Fire
- **Collects**: Weapons, Consumables
- **Preferred**: fire-ember, flame-sword, molten-hammer, inferno-grenade
- **Dislikes**: ice-shard

### Alice (Door 5 - Frost Reach)
- **Element**: Time / Ice
- **Collects**: Artifacts, Quest items, Armor
- **Preferred**: ice-shard, frozen-hourglass, temporal-anchor, frost-crown
- **Dislikes**: fire-ember

### Jane (Door 6 - Aberrant)
- **Element**: Air / Wind
- **Collects**: Artifacts, Consumables, Quest items
- **Preferred**: wind-feather, chaos-orb, aberrant-shard, storm-caller
- **Dislikes**: earth-stone

### Special Die-rectors (No Domain)

**Rhea** (Ancient Horror): Collects Artifacts, Quest items (Void element)

**King James** (Undying King): Collects Artifacts, Quest items, Armor (Death element)

**Zero Chance** (Probability Void): Collects Artifacts, Consumables (Void element)

**Alien Baby** (Larval Horror): Collects Consumables, Artifacts (Void element)

**Alien Old One** (Merged Horror): Collects Weapons, Artifacts, Materials (Void element)

## Favor Mechanics

### Favor Range
- **Minimum**: -100 (Enemy)
- **Maximum**: 100 (Devoted)
- **Starting**: 0 (Neutral)

### Favor Gain/Loss
When gifting an item to a Die-rector:
- **Preferred item**: +15 favor (strongest bonus)
- **Matching element**: +8 favor (moderate bonus)
- **Collected category**: +5 favor (minor bonus)
- **Disliked item**: -10 favor (penalty)

These bonuses stack. For example, giving Robert (Fire Die-rector) a fire-ember grants:
- +15 (preferred item)
- +8 (Fire element)
- +5 (Consumable category)
- **Total: +28 favor**

### Favor Levels

| Favor Range | Level | Combat Bonus |
|-------------|-------|--------------|
| 75 to 100 | Devoted | +50% score & gold |
| 50 to 74 | Allied | +30% score & gold |
| 25 to 49 | Friendly | +15% score & gold |
| -24 to 24 | Neutral | No bonus |
| -49 to -25 | Hostile | -10% score & gold |
| -100 to -50 | Enemy | -25% score & gold |

### Favor Decay
Favor trends toward neutral over time:
- **10% decay** per domain clear
- Prevents permanent max favor exploits
- Encourages continued gift-giving

## Combat Integration

### Domain Bonuses
When entering a domain, the active Die-rector's favor level determines your combat multipliers:

```typescript
// Example: Playing in Infernus (Robert's domain) with 80 favor
favorLevel: 'devoted'
scoreMultiplier: 1.5  // All combat scores multiplied by 1.5x
goldMultiplier: 1.5   // All gold rewards multiplied by 1.5x
```

### No Direct Combat Stats
Items no longer provide:
- Bonus throws (DEPRECATED)
- Bonus trades (DEPRECATED)
- Direct score multipliers (DEPRECATED)
- Element damage bonuses (DEPRECATED)

All combat bonuses come from Die-rector favor.

## Implementation Files

### Core System
- **packages/ai-engine/src/economy/favor.ts**: Favor calculation and state management
- **apps/web/src/data/wiki/types.ts**: Updated Pantheon and Item type definitions
- **apps/web/src/data/wiki/entities/pantheon.ts**: Die-rector preferences data

### Deprecated
- **apps/web/src/data/items/combat-effects.ts**: Legacy combat effects (marked DEPRECATED)

## Migration Notes

### For Developers

1. **Use favor bonuses instead of item stats**:
   ```typescript
   // OLD (deprecated)
   const bonuses = getBonusesFromInventory(itemSlugs);

   // NEW
   const favorBonus = getActiveFavorBonus(favorState, domainDieRectorSlug);
   const scoreMultiplier = favorBonus?.scoreMultiplier ?? 1.0;
   ```

2. **Track favor state in game state**:
   ```typescript
   import { createFavorState, updateFavor } from '@ndg/ai-engine/economy';

   // Initialize
   const favorState = createFavorState(['the-one', 'john', 'peter', 'robert', 'alice', 'jane']);

   // Gift item
   const favorChange = calculateFavorChange(
     itemSlug,
     item.element,
     item.itemType,
     dieRectorPreferences
   );
   const newFavorState = updateFavor(favorState, dieRectorSlug, favorChange);
   ```

3. **Apply favor decay between domains**:
   ```typescript
   import { applyFavorDecay } from '@ndg/ai-engine/economy';

   const decayedFavorState = applyFavorDecay(favorState);
   ```

### For Content Creators

Items should be designed around lore and Die-rector preferences, not combat stats:

```typescript
{
  slug: 'frozen-hourglass',
  name: 'Frozen Hourglass',
  itemType: 'Artifact',
  element: 'Ice',
  description: 'An hourglass where time itself has frozen mid-flow.',

  // NEW: Favor system fields
  collectibleBy: ['alice'],
  loreSignificance: 'Alice collects time-themed artifacts as reminders of her domain over temporal manipulation.',

  // DEPRECATED: No combat effects
  // effects: [{ type: 'multiplier', value: 0.2 }], // DON'T DO THIS
}
```

## UX Flow

### Gifting Items
1. Player encounters Die-rector in their domain
2. Player opens inventory and selects item to gift
3. System calculates favor change based on preferences
4. Favor updates and displays new level
5. Combat bonuses adjust if favor level changed

### Visual Feedback
- Show favor bar for each Die-rector (0-100 scale)
- Color-code favor levels (green = good, red = bad)
- Display active domain bonus in combat UI
- Animate favor changes with +/- indicators

### Strategic Depth
- Save preferred items for Die-rectors you want to favor
- Balance favor across multiple Die-rectors
- Consider domain difficulty when prioritizing favor
- Manage favor decay by re-gifting items

## Future Enhancements

1. **Favor-based dialogue**: Die-rectors acknowledge high/low favor in conversations
2. **Special rewards**: Unlock unique items at max favor (100)
3. **Rivalry system**: Favoring one Die-rector may anger their rival
4. **Board meetings**: All Die-rectors convene based on collective favor
5. **Favor trading**: Exchange favor between Die-rectors at a cost

## Examples

### Example 1: Building Favor with Robert
```typescript
// Player in Infernus (Robert's domain)
// Current favor: 10 (Neutral)

// Gift fire-ember
favorChange = +15 (preferred) + +8 (Fire) + +5 (Consumable) = +28
newFavor = 38 (Friendly)
scoreMultiplier = 1.15x

// Gift molten-hammer
favorChange = +15 (preferred) + +8 (Fire) + +5 (Weapon) = +28
newFavor = 66 (Allied)
scoreMultiplier = 1.30x

// Gift inferno-grenade
favorChange = +15 (preferred) + +8 (Fire) + +5 (Consumable) = +28
newFavor = 94 (Devoted)
scoreMultiplier = 1.50x
```

### Example 2: Angering Alice
```typescript
// Player in Frost Reach (Alice's domain)
// Current favor: 50 (Allied)

// Gift fire-ember (disliked)
favorChange = -10
newFavor = 40 (Friendly)
scoreMultiplier = 1.15x (downgraded from 1.30x)
```

### Example 3: Favor Decay
```typescript
// After clearing Door 2 (John's domain)
john: 80 favor -> 72 favor (10% decay toward 0)
alice: -40 favor -> -36 favor (10% decay toward 0)
```

## Conclusion

The favor system transforms items from mechanical stat boosts into meaningful narrative objects. Die-rectors are eternal collectors, and your gifts earn their favor. This creates strategic depth (which Die-rector to favor?) while grounding combat bonuses in lore (items are treasures, not equipment).

Items are eternal. Death is essential. NEVER DIE GUY.
