# Screen Inventory

Master index of all screens in NEVER DIE GUY with routes, components, and status.

## Screen Registry

| Screen | Route | Component | Status | Description |
|--------|-------|-----------|--------|-------------|
| Home | `/` | `Home.tsx` | Active | Landing page, Play CTA, daily wiki |
| PlayHub | `/play` | `PlayHub.tsx` | Active | Main game shell (progress bar + combat + sidebar) |
| Combat | (embedded) | `CombatTerminal.tsx` | Active | 3D globe, HUD, dice controls |
| Summary | (panel) | `RunSummary.tsx` | Active | Post-combat score display |
| Shop | (panel) | `Shop.tsx` | Active | Requisition items between rooms |
| Wiki | `/wiki` | `Wiki.tsx` | Active | Database/lore browser |
| Market | `/shop` | `MarketHub.tsx` | Active | NPC vendor interactions |
| Progress | `/progress` | `Progress.tsx` | Active | Leaderboards, history, stats |
| Settings | `/settings` | `Settings.tsx` | Active | Audio, visual, account |
| Profile | `/profile` | `Profile.tsx` | Active | User profile, achievements |

## PlayHub Center Panels

The PlayHub uses a single `centerPanel` state to swap content:

| CenterPanel | Trigger | Content | Notes |
|-------------|---------|---------|-------|
| `globe` | Default | 3D globe with zones | Lobby + Zone Select |
| `combat` | `selectZone()` | DiceMeteor Phaser game | Dice throwing gameplay |
| `summary` | `completeRoom()` | RunSummary | Score + gold earned |
| `shop` | `continueFromSummary()` | Shop | Item purchases |
| `doors` | (deprecated) | DoorOverlay | Replaced by Narrative Fork |

## Sidebar States

The sidebar (`PlaySidebar.tsx`) adapts based on game phase:

| Phase | Game Tab | Content |
|-------|----------|---------|
| Lobby | GameTab | New Run / Continue buttons, loadout selection |
| Zone Select | GameTabLaunch | Zone list with tier/time, Launch button |
| Combat | GameTabPlaying | Score, throws, trades, multiplier, combat feed |
| Summary | (hidden) | Summary shown in center panel |
| Shop | (hidden) | Shop shown in center panel |

**Additional Tabs:**
- **Bag** - Inventory view, loadout presets (lobby only)
- **Settings** - Sound toggle, music toggle, game speed slider, animations toggle, Back to Menu

## Screen Transitions

```
Home
  |
  v
PlayHub (centerPanel: globe)
  |
  +-- Lobby: New Run / Continue
  |     |
  |     v
  +-- Zone Select: 3 zones visible, pick one
        |
        v
      Combat (centerPanel: combat)
        |
        +-- Win: completeRoom()
        |     |
        |     v
        |   Summary (centerPanel: summary)
        |     |
        |     v
        |   Shop (centerPanel: shop)
        |     |
        |     +-- Zones remain: back to Zone Select
        |     +-- Domain cleared: generate next domain
        |     +-- All domains cleared: Game Over (win)
        |
        +-- Lose: failRoom()
              |
              v
            Game Over (modal)
              |
              v
            Home
```

## Shared Components

| Component | Used By | Purpose |
|-----------|---------|---------|
| `PlaySidebar` | PlayHub | Phase-aware sidebar with tabs |
| `CombatTerminal` | PlayHub | 3D globe + combat HUD |
| `CombatHUD` | CombatTerminal | Dice hand, throw/trade buttons |
| `GlobeScene` | CombatTerminal | Three.js 3D scene |
| `TransitionWipe` | PlayHub | Panel swap animations |
| `DamageFlash` | CombatTerminal | Impact visualization |
| `CardSection` | Multiple | Styled container with rounded corners |

## Files

**Screens:**
- `/apps/web/src/screens/home/Home.tsx`
- `/apps/web/src/screens/play/PlayHub.tsx`
- `/apps/web/src/screens/play/Shop.tsx`

**Play Components:**
- `/apps/web/src/screens/play/components/CombatTerminal.tsx`
- `/apps/web/src/screens/play/components/PlaySidebar.tsx`
- `/apps/web/src/screens/play/components/RunSummary.tsx`
- `/apps/web/src/screens/play/components/tabs/GameTab.tsx`
- `/apps/web/src/screens/play/components/tabs/GameTabLaunch.tsx`
- `/apps/web/src/screens/play/components/tabs/GameTabPlaying.tsx`
- `/apps/web/src/screens/play/components/tabs/BagTab.tsx`
- `/apps/web/src/screens/play/components/tabs/SettingsTab.tsx`

**Contexts:**
- `/apps/web/src/contexts/RunContext.tsx`
- `/apps/web/src/contexts/SoundContext.tsx`
- `/apps/web/src/contexts/GameSettingsContext.tsx`
