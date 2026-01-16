# PLAN: Speedrun Optimization + QOL Improvements

## Target: 2-5 Minute Game (Currently 15-27 min)

---

## CRITICAL TIMING ANALYSIS

**Current Math:**
- 6 events × 45s timer = 270s (4.5 min) - JUST timers alone
- Add: shop visits, domain summaries, animations, decisions
- Result: 15-27 min total

**To Hit 2-5 Min Total:**
Option A: Reduce event timer to 15-20s
Option B: Reduce events from 6 to 3-4
Option C: Both (recommended for bullet chess feel)

---

## PHASE 1: TIMING REBALANCE (High Priority)

### 1.1 New "Bullet" Mode Config
```typescript
// New timing for 2-5 min runs
BULLET_EVENT_CONFIG = {
  throwsPerEvent: 3,        // Was 5
  tradesPerEvent: 1,        // Was 2
  eventDurationMs: 20000,   // 20s (was 45s)
  gracePeriodMs: 3000,      // 3s (was 5s)
}
```

### 1.2 Variant Timing Multipliers Adjustment
- Swift: 0.6x timer (12s), 0.5x goal
- Standard: 1.0x timer (20s), 1.0x goal
- Grueling: 1.3x timer (26s), 1.5x goal

### 1.3 Shop/Summary Speedup
- Auto-skip shop if player has no gold
- Domain summary: 2s auto-proceed option
- Reduce animation times by 50%

**Estimated Time After Phase 1:**
- 6 events × 20s = 120s (2 min) timers
- Shop/summaries: ~1 min
- **Total: 3-4 min** (hits target)

---

## PHASE 2: VICTORY SCREEN IMPROVEMENTS

### Current Stats (10):
1. Best Roll
2. Dice Rolled
3. Domains Cleared
4. Events Cleared
5. Gold Collected
6. Items Used
7. Accuracy
8. Perfect Events
9. Craters Taken
10. Total Score

### Improved Layout:
- Group into categories: COMBAT | ECONOMY | PERFORMANCE
- Add: Time Per Event (avg), Fastest Event, Total Run Time
- Add: Event Variants Chosen (swift/standard/grueling breakdown)
- Visual: Mini bar charts for score progression

---

## PHASE 3: SIDEBAR QOL

### 3.1 Event Tab - Show Difficulty
Add to GameTabPlaying:
```
Event: Domain 1 - Earth
Variant: SWIFT (12s timer)
Goal: 400 / Timer: 12s remaining
```

### 3.2 Info Tab - Latest Content
Update DomainInfoModal with:
- Current domain element/bonus info
- Active item effects summary
- Multiplier breakdown

---

## PHASE 4: PAUSE MENU FUNCTIONALITY

### Current SettingsModal Actions:
- Sound/Music toggles (exist)

### Add:
- Resume button
- Restart Run button
- Abandon Run (return to home)
- Quick Settings (skip animations toggle)

---

## PHASE 5: UNIT TEST SETUP

### 5.1 Vitest Configuration
- Install vitest + @testing-library/react
- Create test utils with game state mocks

### 5.2 Simulation Test Cases
```typescript
// Timing simulations
test('bullet mode completes in under 5 minutes')
test('swift variant average time < standard')
test('grueling variant provides higher rewards')

// Balance simulations
test('D1 clearable with average throws')
test('D6 requires multiplier strategy')
test('economy allows T1-T2 items by D3')
```

---

## IMPLEMENTATION ORDER

1. **Phase 1.1-1.2**: Timing config changes (zones.ts, FLAT_EVENT_CONFIG)
2. **Phase 3.1**: Show event variant in sidebar (quick win)
3. **Phase 2**: Victory screen improvements
4. **Phase 4**: Pause menu additions
5. **Phase 1.3**: Animation/shop speedups
6. **Phase 5**: Unit test infrastructure

---

## FILES TO MODIFY

- `/apps/web/src/types/zones.ts` - EVENT_VARIANTS timing
- `/apps/web/src/data/gameConfig.ts` - FLAT_EVENT_CONFIG values
- `/apps/web/src/screens/play/components/tabs/GameTabPlaying.tsx` - Show variant
- `/apps/web/src/components/GameOverModal.tsx` - Enhanced stats
- `/apps/web/src/components/SettingsModal.tsx` - Pause menu actions
- `/apps/web/vitest.config.ts` - New file for test setup
