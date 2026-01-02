# MVP Asset Map - NEVER DIE GUY

**Version:** 1.0.0
**Generated:** 2026-01-02
**Status:** Pre-deployment audit

---

## Quick Stats

| Metric | Count |
|--------|-------|
| Total Assets | 4,627 |
| SVG | 3,647 (79%) |
| PNG | 926 (20%) |
| MVP Referenced | 481 |
| MVP Found | 456 (94.8%) |
| MVP Missing | 25 (5.2%) |

---

## Manual Cleanup Required

Run these commands before deployment:

```bash
# 1. Remove 30px portraits (too abstract at small size)
rm -rf /Users/kevin/atlas-t/ndg-ds-and-dam/assets/characters/portraits/30px
rm -rf /Users/kevin/atlas-t/ndg-ds-and-dam/assets/characters/portraits/30px-hifi

# 2. Fix peter portrait typo (potrait -> portrait)
cd /Users/kevin/atlas-t/ndg-ds-and-dam/assets/characters/portraits
for dir in 60px 60px-hifi 120px 120px-hifi 240px 240px-hifi; do
  mv "$dir/pantheon-potrait-peter-01.svg" "$dir/pantheon-portrait-peter-01.svg" 2>/dev/null
done

# 3. Fix peter sprite typo (wak -> walk)
cd /Users/kevin/atlas-t/ndg-ds-and-dam/assets/characters/pantheon/peter
mv pantheon-sprite-peter-wak-01.svg pantheon-sprite-peter-walk-01.svg
mv pantheon-sprite-peter-wak-02.svg pantheon-sprite-peter-walk-02.svg
```

---

## Page-by-Page Asset Requirements

### Navigation (All Pages)

| Asset | Path | Status |
|-------|------|--------|
| Logo | `/logos/ndg-skull-dome.svg` | OK |
| Play icon | `/assets/nav/nav1-play.svg` | OK |
| Wiki icon | `/assets/nav/nav2-wiki.svg` | OK |
| Progress icon | `/assets/nav/nav3-progress.svg` | OK |
| Market icon | `/assets/nav/nav4-market.svg` | OK |

---

### Home (`/`, `/home`)

#### Logged Out - Marketing LP

| Asset | Path | Status |
|-------|------|--------|
| Hero logo | `/logos/ndg-skull-dome.svg` | OK |
| NPC portraits | `/assets/characters/shops/*.png` | OK |

#### Logged In - Dashboard

| Component | Assets | Status |
|-----------|--------|--------|
| **ActionButtons** | `/assets/meta-ads/play/frame-*.png` (13) | OK |
| | `/assets/meta-ads/shop/frame-*.png` (9) | OK |
| | `/assets/meta-ads/wiki/frame-*.png` (1) | OK |
| **DailyWiki** | `/assets/nav/nav2-wiki.svg` | OK |
| **DailyHits** | `/assets/characters/shops/sprite-*.png` | OK |
| | `/assets/items/{category}/{slug}.svg` | OK |
| **LiveFeed** | `/assets/videos/cursed/*.mp4` (7) | OK |
| | `/assets/flumes/cursed/*.mp4` (12) | OK |
| **GameHistory** | `/illustrations/1v1.svg` | OK |
| | `/illustrations/playbots.svg` | OK |
| | `/illustrations/arenas.svg` | OK |
| **Stats** | Dynamic from wiki data | OK |

---

### Play Hub (`/play/*`)

| Page | Assets | Status |
|------|--------|--------|
| **PlayHub** | 3D Globe canvas (Phaser) | OK |
| | Domain textures `/assets/domains/*.png` | OK (10 files) |
| **MeteorGame** | Dice `/assets/ui/dice-svg/*.svg` | OK |
| | Enemies `/assets/enemies-svg/*.svg` | OK |
| | Items `/assets/items/**/*.svg` | OK |
| **PlayResults** | Trophy GIFs `/assets/trophies/*.gif` | OK |
| **GameTabPlaying** | `/assets/ui/icons/skull-score.png` | MISSING |

---

### Wiki (`/wiki/*`)

| Component | Assets | Status |
|-----------|--------|--------|
| **WikiIndex** | Category placeholders | OK |
| | `/assets/placeholders/enemies.png` | OK |
| | `/assets/placeholders/items.png` | OK |
| | `/assets/placeholders/domains.png` | OK |
| | `/assets/placeholders/travelers.png` | OK |
| | `/assets/placeholders/wanderers.png` | OK |
| | `/assets/placeholders/shops.png` | OK |
| | `/assets/placeholders/pantheon.png` | OK |
| **WikiEntity** | Entity-specific assets | OK |
| | Items: `/assets/items/{cat}/{slug}.svg` | OK |
| | Enemies: `/assets/enemies-svg/{slug}.svg` | OK |
| | Characters: `/assets/characters/**/*.svg` | OK |
| **FactionLore** | `/icons/faction-icon-*.svg` | OK (8) |

---

### Shop/Market (`/shop/*`)

| Component | Assets | Status |
|-----------|--------|--------|
| **ShopHome** | `/assets/nav/nav4-market.svg` | OK |
| | `/assets/ui/currency/coin.png` | OK |
| **Market Tab** | NPC sprites `/assets/market/*/*.png` | OK |
| | NPC SVGs `/assets/market-svg/*/*.svg` | OK |
| **Tribute Tab** | King James portrait | OK |
| **SaucerTab** | `/illustrations/continue.svg` | OK |
| | `/illustrations/newgame.svg` | OK |
| | `/illustrations/review.svg` | OK |
| **ShopDetail** | Vendor animations (idle/walk/shop) | OK |
| **Receipt** | `/assets/ui/currency/coin.png` | OK |

---

### Progress (`/progress/*`)

| Component | Assets | Status |
|-----------|--------|--------|
| **Progress** | `/illustrations/leaderboard.svg` | OK |
| | `/illustrations/stats.svg` | OK |
| | `/illustrations/rewards.svg` | OK |
| | `/icons/fire.svg` (heat) | OK |
| **Leaderboard** | User avatars (dynamic) | OK |
| **History** | Match thumbnails (dynamic) | OK |
| **DailyReward** | Lottie confetti `/lottie/confetti.lottie` | OK |

---

### Help (`/help/*`)

| Page | Assets | Status |
|------|--------|--------|
| **DiceTypes** | `/illustrations/dice.svg` | MISSING |
| **GettingStarted** | `/illustrations/tutorial.svg` | MISSING |
| **CombatSystem** | `/illustrations/combat.svg` | MISSING |
| **FAQ** | None required | OK |
| **Contact** | None required | OK |

---

### Profile & Settings

| Page | Assets | Status |
|------|--------|--------|
| **Profile** | User avatar (dynamic) | OK |
| **EditProfile** | Avatar options | OK |
| **Settings** | None required | OK |

---

### Authentication

| Page | Assets | Status |
|------|--------|--------|
| **Login** | `/logos/ndg-skull-dome.svg` | OK |
| **Signup** | `/logos/ndg-skull-dome.svg` | OK |
| **ForgotPassword** | `/logos/ndg-skull-dome.svg` | OK |

---

## Missing Assets Summary

### Critical (Blocks Features)

| Asset | Used By | Action |
|-------|---------|--------|
| `/illustrations/dice.svg` | DiceTypes help | Create illustration |
| `/illustrations/tutorial.svg` | GettingStarted help | Create illustration |
| `/illustrations/combat.svg` | CombatSystem help | Create illustration |
| `/assets/ui/icons/skull-score.png` | GameTabPlaying | Create or source |

### Path Mismatches (Code Fix Required)

| Code Reference | Actual Path |
|----------------|-------------|
| `/assets/dice/d4.png` | `/assets/ui/dice/d4-01.png` |
| `/assets/dice/d6.png` | `/assets/ui/dice/d6-01.png` |
| `/assets/dice/d8.png` | `/assets/ui/dice/d8-01.png` |
| `/assets/dice/d10.png` | `/assets/ui/dice/d10-01.png` |
| `/assets/dice/d12.png` | `/assets/ui/dice/d12-01.png` |
| `/assets/dice/d20.png` | `/assets/ui/dice/d20-01.png` |

**Fix:** Either update code paths OR create symlinks/copies at expected locations.

### Non-Critical (Dead Code References)

These items are referenced but may be legacy/unused:
- `/assets/enemies/shadow-knight.png`
- `/assets/items/consumables/fire-grenade.png`
- `/assets/items/consumables/lucky-charm.png`
- `/assets/items/materials/bone-dust.svg`
- `/assets/items/weapons/dimensional-blade.png`

---

## Asset Categories by Vectorization Status

### Fully Vectorized (Production Ready)

| Category | PNG | SVG | Notes |
|----------|-----|-----|-------|
| Enemies | 42 | 42 | 100% |
| Market | 68 | 68 | 100% |
| Heroes | 6 | 6 | 100% |
| Factions | 8 | 8 | 100% |
| Dice | 18 | 36 | 100% + frame variants |
| Currency | 3 | 3 | 100% |
| Flumes | 7 | 7 | 100% |
| Portraits | 0 | 162 | 3 scales (60/120/240) + hifi |

### Partially Vectorized

| Category | PNG | SVG | Notes |
|----------|-----|-----|-------|
| Pantheon | 48 | 127 | Mixed, more SVG than PNG |
| Shops | 16 | 36 | Good coverage |
| Travelers | 44 | 168 | Extensive SVG |
| Items | ~450 | ~200 | Varies by subcategory |

### PNG Only (Intentional)

| Category | Count | Reason |
|----------|-------|--------|
| Domains (textures) | 10 | 3D planet mapping |
| Domain Backgrounds | 295 | Photorealistic renders |
| Placeholders | 8 | Fallback images |
| Trophies | 10 GIF | Animated achievements |

### Needs Vectorization

| Category | PNG | SVG | Priority |
|----------|-----|-----|----------|
| Wanderers | 48 | 0 | Medium - for consistency |

---

## Design Token Usage by Page

### Color Tokens

| Page Type | Primary Colors Used |
|-----------|---------------------|
| Home | `primary` (#E90441), `secondary` (#00e5ff) |
| Play | Dice colors (d4-d20 palette), `rarity.*` |
| Wiki | `rarity.*` for item tiers, faction colors |
| Shop | `currency.gold` (#c4a000), `secondary` |
| Progress | `primary`, heat colors |

### Rarity Colors (6-tier)

```
common:    #9e9e9e (gray)
uncommon:  #4caf50 (green)
rare:      #2196f3 (blue)
epic:      #9c27b0 (purple)
legendary: #ff9800 (orange)
unique:    #e91e63 (pink)
```

### Typography

| Context | Font |
|---------|------|
| UI Text | Inter |
| Code/Data | IBM Plex Mono |
| Game HUD | m6x11plus |

---

## Recommended Sync Command

After cleanup, sync assets to app:

```bash
cd /Users/kevin/atlas-t/ndg-ds-and-dam
./scripts/sync-to-app.sh
```

This syncs:
- `enemies-svg/` → ndg26z
- `market-svg/` → ndg26z
- `flumes-svg/` → ndg26z
- `heroes-svg/` → ndg26z
- `characters/portraits/` → ndg26z
- `ui/dice-svg/` → ndg26z
- `ui/currency-svg/` → ndg26z
- `icons/` → ndg26z
- `domains/` → ndg26z

---

## Pre-Deployment Checklist

- [ ] Remove 30px portrait directories
- [ ] Fix `potrait` → `portrait` typo in peter files
- [ ] Fix `wak` → `walk` typo in peter sprites
- [ ] Create 3 missing illustrations (dice, tutorial, combat)
- [ ] Create skull-score.png for game UI
- [ ] Fix dice path references in code OR create symlinks
- [ ] Run sync script
- [ ] Verify all pages load without 404 asset errors

---

## File Structure Reference

```
ndg-ds-and-dam/
├── assets/
│   ├── characters/
│   │   ├── pantheon/        # 48 PNG, 127 SVG
│   │   ├── shops/           # 16 PNG, 36 SVG
│   │   ├── travelers/       # 44 PNG, 168 SVG
│   │   ├── wanderers/       # 48 PNG only
│   │   └── portraits/
│   │       ├── 60px/        # 54 SVG (use for 30px needs)
│   │       ├── 60px-hifi/   # 54 SVG high-fidelity
│   │       ├── 120px/       # 54 SVG
│   │       ├── 120px-hifi/  # 54 SVG high-fidelity
│   │       ├── 240px/       # 54 SVG
│   │       └── 240px-hifi/  # 54 SVG high-fidelity
│   ├── enemies/             # 42 PNG
│   ├── enemies-svg/         # 42 SVG
│   ├── market/              # 68 PNG (14 vendors)
│   ├── market-svg/          # 68 SVG
│   ├── items/               # ~450 mixed
│   ├── domains/
│   │   ├── *.png            # 10 textures
│   │   ├── backgrounds/
│   │   │   ├── photorealistic/  # 295 PNG
│   │   │   └── pixel-art/       # 5 PNG
│   │   └── backgrounds-svg/     # 5 SVG
│   ├── ui/
│   │   ├── dice/            # 18 PNG
│   │   ├── dice-svg/        # 36 SVG
│   │   ├── chests/          # 8 PNG + 8 SVG
│   │   ├── currency/        # 3 PNG
│   │   ├── currency-svg/    # 3 SVG
│   │   └── skulls/          # 36 SVG
│   ├── flumes/              # 7 PNG + 31 MP4
│   ├── flumes-svg/          # 7 SVG
│   ├── heroes/              # 6 PNG
│   ├── heroes-svg/          # 6 SVG
│   ├── factions/            # 8 PNG + 8 SVG
│   ├── trophies/            # 10 GIF
│   ├── videos/              # 7 MP4
│   ├── placeholders/        # 8 PNG
│   └── wiki/                # 2 PNG
├── icons/                   # 9 SVG (factions + heat)
├── illustrations/           # 16 SVG
├── nav/                     # 4-8 SVG
├── logos/                   # Brand SVGs
├── lottie/                  # 5 animations
├── tokens/                  # 5 JSON
├── docs/                    # 7 MD
├── scripts/                 # 4 shell scripts
├── gallery/                 # HTML browser
└── manifest.json            # Inventory
```

---

## Contact

For asset requests or issues, update `docs/MVP_ASSET_GAPS.md` and regenerate this map.
