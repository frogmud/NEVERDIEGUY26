# NEVER DIE GUY - Next Steps to Production

Last updated: 2026-01-16

## Current State

The Arena game mode is feature-complete with:
- 6 domains x 3 rooms roguelike structure
- Bullet mode timing (20s events, 3 throws, 3-5 min runs)
- Event variants (Swift/Standard/Grueling difficulty)
- Boss phase with Die-rectors in zone 3
- Domain-scoped inventory (items expire/persist based on rarity)
- Dice throwing mechanics with element bonuses
- Item/loadout system affecting combat stats
- Shop between rooms (illustration-first UI)
- Victory screen with categorized stats
- Pause menu with Resume and Fast Mode toggle
- Info modal with domain element and active bonuses

## Priority 1: Testing & Verification

### Full Run Testing
- [ ] Complete 6-domain run end-to-end
- [ ] Verify boss HP depletes correctly in zone 3
- [ ] Confirm item expiry on domain clear works
- [ ] Test all three event variants feel balanced
- [ ] Verify victory screen stats populate correctly

### Edge Cases
- [ ] What happens if you skip all events?
- [ ] Boss defeat with exactly 0 HP remaining
- [ ] Fast Mode during boss phase
- [ ] Domain transition with full inventory

## Priority 2: Mobile & Responsiveness

### Layout
- [ ] Homepage responsive on tablet/mobile
- [ ] Play screen touch controls for dice
- [ ] Sidebar collapse/expand on small screens
- [ ] Victory modal fits on mobile

### Touch
- [ ] Dice selection tap targets large enough
- [ ] Throw button accessible on all screen sizes
- [ ] Info modal scrollable on small screens

## Priority 3: Persistence & Leaderboards

### High Scores
- [ ] Save best run stats locally
- [ ] Leaderboard API integration
- [ ] Display top scores on homepage

### Run History
- [ ] Track completed runs
- [ ] Show run history in profile/stats screen
- [ ] Achievements/trophies for milestones

## Priority 4: Audio Polish

### Music
- [ ] Background music per domain
- [ ] Boss phase music change
- [ ] Victory/defeat stings

### SFX
- [ ] Volume controls in settings
- [ ] More varied impact sounds
- [ ] UI feedback sounds (hover, click)

## Deployment Checklist

- [x] TypeScript build passing
- [x] Vercel auto-deploy on push to main
- [x] Asset optimization (removed unused backgrounds)
- [ ] Environment variables audit
- [ ] Error tracking (Sentry or similar)
- [ ] Analytics integration
- [ ] SEO meta tags
- [ ] Social preview images
- [ ] Custom domain setup

## Known Issues

- [ ] Passive event listener warning from OrbitControls (drei library, non-critical)
- [ ] Font GPOS/GSUB table warnings (font rendering, non-critical)

## Quick Wins for Next Session

1. Test full 6-domain run and note any issues
2. Mobile layout pass on Play screen
3. Add volume slider to settings
4. Verify Vercel production build works
