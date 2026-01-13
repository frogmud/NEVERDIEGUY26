# NEVER DIE GUY - Next Steps to Production

Last updated: 2026-01-12

## Current State

The core Arena game mode is functional with:
- 6 domains x 3 rooms roguelike structure
- Dice throwing mechanics with element bonuses
- Item/loadout system affecting combat stats
- Shop between rooms
- Victory/defeat conditions
- Domain clear milestone indicator
- Stable multi-room progression (2nd room lockup fixed)

## Priority 1: Core Gameplay Polish

### Combat Feel
- [ ] Balance score goals per domain/tier (currently linear, may need curve)
- [ ] Tune throw/trade counts for optimal session length
- [ ] Add visual feedback for element bonus hits (flash die color on domain match)
- [ ] Consider adding combo/streak bonuses for consecutive high rolls

### Progression
- [ ] Implement domain transition screen (show next planet preview)
- [ ] Add run stats tracking (best roll, total damage, etc.)
- [ ] Persist high scores to leaderboard
- [ ] Save/load mid-run state (partial - needs testing)

### Shop
- [ ] Wire up shop items to actual effects (combat-effects.ts ready)
- [ ] Add item tooltips showing effect descriptions
- [ ] Balance item costs vs gold earned per room
- [ ] Add "reroll shop" option

## Priority 2: Meta Progression

### Unlocks
- [ ] Track domains cleared across runs
- [ ] Unlock new loadouts based on achievements
- [ ] Trophy/achievement system (trophies.md spec exists)

### Wiki Integration
- [ ] "Battle Now" on enemy pages fully working (done for characters)
- [ ] Show item effects on wiki item pages
- [ ] Link discovered items from runs to wiki

## Priority 3: Polish & UX

### Visual
- [ ] Loading states for domain transitions
- [ ] Particle effects on big rolls
- [ ] Screen shake options (currently minimal)
- [ ] Mobile responsive layout testing

### Audio
- [ ] Background music per domain
- [ ] More varied impact sounds
- [ ] Victory/defeat music stings

### Accessibility
- [ ] Keyboard navigation for dice selection
- [ ] Screen reader labels
- [ ] Color blind mode for dice elements

## Priority 4: Multiplayer (Post-MVP)

### VBots Mode
- [ ] Bot AI for turn-based challenges
- [ ] Shared globe, alternating turns
- [ ] Best of 3 format

### 1v1 Mode
- [ ] Real-time multiplayer infrastructure
- [ ] Matchmaking
- [ ] Ranked ladder

## Known Issues

- [ ] Passive event listener warning from OrbitControls (drei library, non-critical)
- [ ] Font GPOS/GSUB table warnings (font rendering, non-critical)
- [ ] Room 3-1 clear issue reported (needs investigation - may be HMR related)

## Deployment Checklist

- [ ] Environment variables configured (Vercel)
- [ ] Database/storage for leaderboards
- [ ] Analytics integration
- [ ] Error tracking (Sentry or similar)
- [ ] Performance profiling
- [ ] Bundle size optimization
- [ ] SEO meta tags
- [ ] Social preview images

## Quick Wins for Next Session

1. Test full 6-domain run end-to-end
2. Verify shop items apply bonuses correctly
3. Add domain transition "wipe" with planet name
4. Balance pass on score goals
