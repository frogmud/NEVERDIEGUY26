# NEVER DIE GUY - Changelog

## [0.5.0] - 2026-01-24

### Production Polish & Audio System

Production readiness improvements, comprehensive audio feedback, and accessibility fixes.

#### Added

**Error Handling & SEO**
- ErrorBoundary component wrapping App for graceful crash recovery
- Open Graph and Twitter Card meta tags for social sharing
- Security headers in vercel.json (X-Frame-Options, CSP, etc.)

**Audio System Enhancements**
- Music toggle now functional (loops at 30% master volume)
- UI click sounds on high-priority buttons (homepage, sidebar, dialogs)
- Combat sound feedback: die holds, end turn, guardian destruction, draw events
- Sound effects respect masterVolume and soundEnabled settings

**Skip Events Feature**
- SKIP_ROOM action for forfeiting events without rewards
- Skip button in pause menu (non-boss zones only)
- +15 skip pressure penalty per skip

**Draw Event Bonuses**
- Straights, triples, and other patterns now apply score bonuses
- Visual feedback when bonus patterns detected

**Inventory Limits**
- Maximum 8 powerups enforced
- Maximum 6 upgrades enforced
- Purchase blocked when at capacity

**Analytics**
- Vercel Analytics integration for page views and web vitals

#### Changed

**Accessibility (WCAG)**
- Touch targets increased to 44px minimum
- AppSidebar IconButtons: 36px to 44px
- PlayHub FAB: medium to large (56px)
- Avatar tap targets: 24px to 32px with minHeight 44

**Fast Mode Improvements**
- Timer now scales with gameSpeed setting
- Animations use adjustDelay() for consistent timing

#### Fixed
- Draw events detected but bonuses not applied
- Boss system disabled for MVP (was causing edge cases)

---

## [0.4.0] - 2026-01-16

### Bullet Mode & QOL Polish

Faster gameplay with comprehensive stat tracking and quality-of-life improvements.

#### Added

**Bullet Mode Timing**
- Events now 20s (was 45s) for snappier gameplay
- 3 throws per event (was 5)
- 1 trade per event (was 2)
- 3s grace period (was 5s)
- Target run length: 3-5 minutes

**Event Variants**
- Swift: 0.6x goal/timer/gold (12s events)
- Standard: 1.0x all (20s events)
- Grueling: 1.5x goal/timer, 1.8x gold (30s events)
- Variant displayed in sidebar with color-coded border

**Victory Screen Overhaul**
- Stats organized into categories: COMBAT | PROGRESS | PERFORMANCE | ECONOMY
- Run time, average event time, fastest event tracking
- Variant breakdown pills (Swift x2, Std x3, etc.)
- Best roll tracking per run

**Pause Menu QOL**
- Prominent green Resume button at top
- Fast Mode toggle (1x/2x game speed)
- Skip Event button (forfeit current event)

**Info Modal Improvements**
- Domain element display with +50% bonus tip
- Event difficulty with multiplier breakdown
- Active loadout bonuses (Fury %, Resilience %)
- Inventory items list

#### Changed
- Goals scaled for 3-throw events: [500, 750, 1100, 1500, 2000, 2500]
- Gold rewards adjusted: [75, 125, 175, 250, 350, 500]

---

## [0.3.0] - 2026-01-16

### Boss Phase & Inventory System

Die-rector bosses and domain-scoped item persistence.

#### Added

**Boss Phase System**
- Die-rector bosses appear in zone 3 of each domain
- Hearts-based HP display (4-7 hearts based on domain)
- BossSprite with hit shake and low HP flicker effects
- BossHeartsHUD with pulse animations on depleting heart

| Domain | Die-rector | Hearts | Total HP |
|--------|------------|--------|----------|
| Null Providence | The One | 4 | 2000 |
| Earth | John | 5 | 3000 |
| Shadow Keep | Peter | 5 | 3500 |
| Infernus | Robert | 6 | 4800 |
| Frost Reach | Alice | 6 | 5400 |
| Aberrant | Jane | 7 | 7000 |

**Domain-Scoped Inventory**
- Common/Uncommon items expire after defeating domain boss
- Epic/Legendary/Unique items persist across domains
- Rare items can be flagged with `persistsAcrossDomains: true`
- BagTab shows active inventory during gameplay

**Homepage Improvements**
- Quick question chips for prebaked FAQ responses
- NPC-offered items become actual starting inventory
- Improved chat wiring between homepage and run

**Shop Redesign**
- Illustration-first minimal UI
- Cleaner item presentation

#### Changed
- Black sky backgrounds for boss zones (removed color shifting)
- Loadout cards hidden during gameplay (items come from NPC offerings)

---

## [0.2.0] - 2026-01-09

### Combat Polish & NPC Chat

Visual feedback improvements and NPC dialogue quality.

#### Added

**Context-Aware NPC Chat**
- Situational triggers based on game state (low health, high score, combos)
- Template interpolation with game variables ({score}, {goal}, {multiplier})
- Pool-based dialogue selection weighted by interest score

**Roll-Scaled Explosions**
- Explosion intensity scales with roll value (0.5x for roll of 1, 1.5x for max roll)
- High rolls trigger bonus effects (embers, double shockwave, more smoke)
- Low rolls produce subtle, minimal effects

**Die-Type Impact Patterns**
- d4: Triangle burst (3 meteors)
- d6: Diamond pattern (4 meteors)
- d8: Star pattern (8 meteors)
- d10: Spiral pattern
- d12: Pentagon pattern (5 meteors)
- d20: Chaotic scatter
- Random rotation prevents camera-aligned lines

#### Changed
- Doubled reticle and explosion sizes for better visibility
- Reduced particle count (20->12) for better performance
- Conditional effects based on roll intensity

#### Fixed
- Throw button spam exploit (disabled during throw/resolve phases)
- NPC dialogue no longer addresses other NPCs by name (filters "Xtreme", "Maxwell", etc.)
- Dice row layout padding reduced for cleaner appearance

---

## [0.1.0] - 2026-01-02

### Major Milestone: Balatro-Style Combat System

The core dice combat loop is now functional with proper Balatro-style mechanics.

#### Added

**Combat Engine (@ndg/ai-engine)**
- `throwsRemaining` state - 3 throws per turn, resets each turn
- `holdsRemaining` state - 3 holds per room (strategic resource)
- Proper hold/throw mechanics where held dice keep values
- Turn flow: draw -> select -> throw -> resolve -> enemy -> check

**Dice System**
- 6 die types (d4, d6, d8, d10, d12, d20) with elements
- Dice pool management with exhaustion/recycling
- `rollHand()` only rolls unheld dice

**CombatHUD**
- Throws indicator (3 dots per turn)
- Holds indicator (3 dots per room)
- Staggered dice loading animation (150ms apart)
- Roll button disabled when no throws left
- End button always available for early scoring

**CombatTerminal**
- Inline combat view in PlayHub
- Globe visualization with meteors/impacts
- Reticle targeting during select phase
- Connected to real CombatEngine

**Visual Effects**
- Meteor projectiles with trails
- Impact explosions with shockwaves
- Die-type-specific colors and sizes
- Pulsing target reticle

#### Fixed
- Spam-roll exploit (now limited to 3 throws)
- Hold stacking issue (holds now properly consumed)
- Dice animation overlap with skull logo

#### Technical
- Added `throwsRemaining` to CombatState interface
- Added `throwsRemaining` to RunCombatState interface
- Updated rollHand to preserve held dice values
- Combat phases properly transition

---

## Development Notes

### Architecture

```
@ndg/ai-engine          # Game logic package
├── combat/             # Combat system
├── core/               # Seeded RNG, utilities
└── npc/                # NPC dialogue (future)

apps/web                # React frontend
├── games/              # Game components
├── screens/play/       # Play hub + combat
└── contexts/           # State management
```

### Next Steps

1. Grid-based entity damage from dice
2. Element combo bonuses
3. Bless/Curse modifiers
4. Globe rotation for attack angles
5. Visual hit feedback on enemies

---

*NEVER DIE GUY*
