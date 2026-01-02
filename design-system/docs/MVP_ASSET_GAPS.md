# MVP Asset Gap Analysis

Generated: 2026-01-02

## Summary
- **Found**: 456 assets match
- **Missing**: 25 references need attention

## Gap Categories

### 1. Path Mismatches (code uses wrong path)
MVP code references these paths, but files exist at different locations:

| MVP Reference | Actual Location |
|--------------|-----------------|
| `/assets/dice/d4.png` | `/assets/ui/dice/d4-01.png` |
| `/assets/dice/d6.png` | `/assets/ui/dice/d6-01.png` |
| `/assets/dice/d8.png` | `/assets/ui/dice/d8-01.png` |
| `/assets/dice/d10.png` | `/assets/ui/dice/d10-01.png` |
| `/assets/dice/d12.png` | `/assets/ui/dice/d12-01.png` |
| `/assets/dice/d20.png` | `/assets/ui/dice/d20-01.png` |
| `/assets/characters/shops/sprite-mr-bones-1.png` | `/assets/characters/shops/sprite-mr-bones.png` |
| `/assets/characters/shops/sprite-willy-1.png` | `/assets/characters/shops/sprite-willy.png` |
| `/assets/placeholders/portrait.png` | `/assets/placeholders/default.png` |

**Action**: Update MVP code to use correct paths

### 2. Template Patterns (not real files)
These are pattern references, not actual file paths:

- `/idle-XX.png` - Template for idle animation frames
- `/placeholder.png` - Generic fallback reference

**Action**: No DS changes needed - these are code patterns

### 3. Missing Illustrations
These illustrations are referenced but don't exist:

- `/illustrations/combat.svg`
- `/illustrations/dice.svg`
- `/illustrations/tutorial.svg`

**Action**: Create these illustrations or remove references

### 4. Missing Assets (need creation)
Files that don't exist in ndg26z either:

- `/assets/bronze-placard.svg`
- `/assets/token.svg`
- `/assets/ui/icons/skull-score.png`
- `/assets/enemies/shadow-knight.png`
- `/assets/items/consumables/fire-grenade.png`
- `/assets/items/consumables/lucky-charm.png`
- `/assets/items/consumables/mystery-box-supreme.png`
- `/assets/items/materials/bone-dust.svg`
- `/assets/items/materials/cursed-finger.svg` (duplicate name - exists in consumables)
- `/assets/items/weapons/dimensional-blade.png`
- `/assets/characters/shops/sprite-robert-1.png`

**Action**: Create assets or remove dead code references

## Recommendations

1. **Fix path mismatches in MVP code** - The dice paths are wrong
2. **Create missing illustrations** - combat, dice, tutorial SVGs needed for UI
3. **Audit dead references** - Remove or create the 11 missing asset files
4. **Note on Lottie**: MVP uses PascalCase (`Confetti1.lottie`), DS uses kebab-case (`confetti.lottie`). macOS filesystem handles this but explicit aliases recommended.
