import React, { useState, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import { EventSelection } from './EventSelection';
import { DiceMeteor } from './DiceMeteor';
import { Shop } from './Shop';
import {
  GameOverModal,
  GameStartPanel,
  EncounterPanel,
  type GameConfig,
  type WandererChoiceResult,
  type RunStats,
} from '../../games/meteor/components';
import { type ThreadConfig } from '../../components/SidebarSetup';
import {
  getRandomEncounter,
  getAggressiveEncounter,
  shouldTriggerEncounter,
  shouldTriggerSkipEncounter,
} from '../../data/duels/config';
import type { DieSides, Wanderer } from '../../data/wiki/types';
import { getEncounterWanderer, createSeededRng, getAvailableDoors, type DoorPreview } from '../../data/pools';
import {
  createInitialGameState,
  DOMAINS,
  getEventScoreGoal,
  getEventSummons,
  getEventTributes,
  calculateGoldReward as calculateGoldRewardLegacy,
  createThreadStartEvent,
  createDoorPickEvent,
  createRoomClearEvent,
  createShopBuyEvent,
  createWandererChoiceEvent,
  type GameState,
  type Inventory,
  type LedgerEvent,
} from '../../games/meteor/gameConfig';
import { calculateGoldReward, applyHeatDifficulty, getTierForDomain, getLuckySynergy } from '../../data/balance-config';
import { getEntity } from '../../data/wiki';

export function MeteorGame() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);

  // Track current wanderer for encounters
  const [currentWanderer, setCurrentWanderer] = useState<Wanderer | null>(null);

  // Handle starting game from GameStartPanel (legacy) or SidebarSetup (ThreadConfig)
  const handleStartGame = useCallback((config: GameConfig | ThreadConfig) => {
    // Check if this is a ThreadConfig (has threadId)
    const isThreadConfig = 'threadId' in config && config.threadId;

    if (isThreadConfig) {
      const threadConfig = config as ThreadConfig;
      const threadStartEvent = createThreadStartEvent(
        threadConfig.threadId,
        threadConfig.protocolRoll,
        threadConfig.selectedTraveler
      );

      setGameState((prev) => ({
        ...prev,
        phase: 'playing',
        currentDomain: threadConfig.domain,
        currentEvent: 0,
        roomNumber: 1, // Round 30: Start at room 1
        // Thread Identity
        threadId: threadConfig.threadId,
        protocolRoll: threadConfig.protocolRoll,
        // Initialize ledger with THREAD_START
        ledger: [threadStartEvent],
        // Reset wanderer state for new thread
        favorTokens: 0,
        calmBonus: 0,
        heat: 0,
        tier: 1,
      }));
    } else {
      // Legacy path - just start with domain
      setGameState((prev) => ({
        ...prev,
        phase: 'playing',
        currentDomain: config.domain,
        currentEvent: 0,
        roomNumber: 1,
      }));
    }
  }, []);

  // Handle beginning an event
  const handleBeginEvent = useCallback((eventIndex: number) => {
    setGameState((prev) => ({
      ...prev,
      phase: 'playing',
      currentEvent: eventIndex,
    }));
  }, []);

  // Handle door selection (Round 30 - door overlay on Phaser, then play next room)
  const handleSelectDoor = useCallback((door: DoorPreview) => {
    setGameState((prev) => {
      // Create DOOR_PICK ledger event
      const doorPickEvent = createDoorPickEvent(
        door.doorType,
        door.promises,
        prev.roomNumber
      );

      // Advance to next room
      const nextRoom = prev.roomNumber + 1;

      return {
        ...prev,
        phase: 'playing',
        currentEvent: nextRoom - 1, // Keep currentEvent in sync (0-indexed)
        roomNumber: nextRoom,
        ledger: [...prev.ledger, doorPickEvent],
        // Increase heat if elite door
        heat: door.doorType === 'elite' ? prev.heat + 1 : prev.heat,
      };
    });
  }, []);

  // Handle skipping an event
  const handleSkipEvent = useCallback((eventIndex: number) => {
    setGameState((prev) => {
      const newCompletedEvents = [...prev.completedEvents];
      newCompletedEvents[eventIndex] = true;

      // Check if all events are done (skipped counts as done for progression)
      const nextEvent = eventIndex + 1;
      const allEventsDone = nextEvent >= 3;

      // Increment skip pressure (stacks)
      const newSkipPressure = prev.skipPressure + 1;

      // Check for aggressive encounter triggered by skipping
      if (shouldTriggerSkipEncounter(newSkipPressure)) {
        const encounter = getAggressiveEncounter(prev.currentDomain, 20 as DieSides);
        if (encounter) {
          return {
            ...prev,
            completedEvents: newCompletedEvents,
            currentEvent: allEventsDone ? prev.currentEvent : nextEvent,
            phase: 'encounter',
            skipPressure: newSkipPressure,
            currentEncounter: encounter,
            runStats: {
              ...prev.runStats,
              eventsSkipped: prev.runStats.eventsSkipped + 1,
            },
          };
        }
      }

      return {
        ...prev,
        completedEvents: newCompletedEvents,
        currentEvent: allEventsDone ? prev.currentEvent : nextEvent,
        phase: allEventsDone ? 'shop' : 'event_select',
        skipPressure: newSkipPressure,
        runStats: {
          ...prev.runStats,
          eventsSkipped: prev.runStats.eventsSkipped + 1,
        },
      };
    });
  }, []);

  // Handle event completion (win) - auto-continues to shop (no blocking overlay)
  const handleEventWin = useCallback((score: number, stats: { npcsSquished: number; diceThrown: number }) => {
    setGameState((prev) => {
      const domain = DOMAINS.find((d) => d.id === prev.currentDomain);
      const event = domain?.events[prev.currentEvent];

      // Calculate lucky number synergy for reward bonus
      // Look up traveler from ledger THREAD_START event
      const threadStartEvent = prev.ledger.find((e) => e.type === 'THREAD_START');
      const travelerSlug = threadStartEvent?.payload?.selectedTraveler as string | undefined;
      const traveler = travelerSlug ? getEntity(travelerSlug) : null;
      const luckyNumber = (traveler as { luckyNumber?: number } | null)?.luckyNumber ?? 0;

      const luckySynergy = getLuckySynergy({
        luckyNumber,
        protocolRoll: prev.protocolRoll,
        currentDomain: prev.currentDomain,
      });

      // Use balance config with heat multiplier + lucky synergy bonus
      const goldReward = event
        ? calculateGoldReward(event.rewardTier, prev.currentDomain, prev.heat, luckySynergy)
        : 50;

      const newCompletedEvents = [...prev.completedEvents];
      newCompletedEvents[prev.currentEvent] = true;

      // Create ROOM_CLEAR ledger event
      const roomClearEvent = createRoomClearEvent(prev.currentEvent, score, goldReward);

      // Auto-continue to shop (no intermediate event_complete phase)
      return {
        ...prev,
        phase: 'shop',
        completedEvents: newCompletedEvents,
        gold: prev.gold + goldReward,
        totalScore: prev.totalScore + score,
        ledger: [...prev.ledger, roomClearEvent],
        runStats: {
          ...prev.runStats,
          npcsSquished: prev.runStats.npcsSquished + stats.npcsSquished,
          diceThrown: prev.runStats.diceThrown + stats.diceThrown,
          eventsCompleted: prev.runStats.eventsCompleted + 1,
        },
      };
    });
  }, []);

  // Handle continuing after event win (Round 30: room clear -> shop -> door_select)
  const handleContinue = useCallback(() => {
    setGameState((prev) => {
      // Check for wanderer encounter using thread-based system
      if (prev.threadId && prev.protocolRoll) {
        const rng = createSeededRng(prev.threadId);
        const domain = DOMAINS.find(d => d.id === prev.currentDomain);
        const domainSlug = domain?.name.toLowerCase().replace(/\s+/g, '-') || 'the-meadow';

        // Base 25% chance, modified by sponsor and heat
        const encounterChance = 25 + (prev.heat * 5);
        if (rng.chance(`continue:room:${prev.roomNumber}:encounter`, encounterChance)) {
          const wanderer = getEncounterWanderer(domainSlug, prev.protocolRoll.sponsor, rng);
          if (wanderer) {
            // TODO: Wire wanderer encounter
          }
        }
      }

      // Legacy encounter system (for backwards compatibility)
      if (shouldTriggerEncounter()) {
        const encounter = getRandomEncounter(prev.currentDomain, 20 as DieSides, prev.skipPressure);
        if (encounter) {
          return {
            ...prev,
            phase: 'encounter',
            currentEncounter: encounter,
          };
        }
      }

      // Round 30 flow: Room clear -> Shop (always, shop leads to door_select or next domain)
      // Room 3 (boss) clear goes to shop, then shop advances domain
      return {
        ...prev,
        phase: 'shop',
      };
    });
  }, []);

  // Handle event loss
  const handleEventLose = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      phase: 'game_over',
      gameWon: false,
    }));
  }, []);

  // Handle shop done (Round 30: shop -> door_select if rooms remain, else next domain)
  const handleShopDone = useCallback(() => {
    setGameState((prev) => {
      // If there are more rooms in this domain, go to door_select overlay
      if (prev.roomNumber < 3) {
        return {
          ...prev,
          phase: 'door_select',
        };
      }

      // All rooms done in this domain - advance to next domain
      const nextDomain = prev.currentDomain + 1;

      // Check if game is won (all 6 domains cleared)
      if (nextDomain > 6) {
        return {
          ...prev,
          phase: 'game_over',
          gameWon: true,
        };
      }

      // Start new domain at room 1 (Round 31: tier progression via balance config)
      const domainsCleared = nextDomain - 1; // prev.currentDomain domains have been cleared
      const newTier = getTierForDomain(domainsCleared);

      return {
        ...prev,
        phase: 'playing', // Go directly to room 1 of new domain
        currentDomain: nextDomain,
        currentEvent: 0,
        roomNumber: 1,
        completedEvents: [false, false, false],
        // Tier progression based on domains cleared (Round 31)
        tier: newTier,
      };
    });
  }, []);

  // Handle restart
  const handleRestart = useCallback(() => {
    setGameState(createInitialGameState());
  }, []);

  // Handle audit prep done - proceed to boss room
  const handleAuditPrepDone = useCallback(() => {
    setGameState((prev) => {
      // Round 31: use balance config for tier progression
      const newTier = getTierForDomain(prev.currentDomain);
      return {
        ...prev,
        phase: 'playing', // Go directly to boss room
        // Tier progression based on domains cleared (Round 31)
        tier: newTier,
      };
    });
  }, []);

  // Handle encounter win
  const handleEncounterWin = useCallback((reward: { type: 'gold' | 'item'; amount: number }) => {
    setGameState((prev) => {
      const nextEvent = prev.currentEvent + 1;
      const allEventsDone = nextEvent >= 3 || prev.completedEvents.every((e) => e);

      return {
        ...prev,
        phase: allEventsDone ? 'shop' : 'event_select',
        currentEvent: allEventsDone ? prev.currentEvent : nextEvent,
        currentEncounter: null,
        gold: reward.type === 'gold' ? prev.gold + reward.amount : prev.gold,
        runStats: {
          ...prev.runStats,
          encountersWon: prev.runStats.encountersWon + 1,
        },
      };
    });
  }, []);

  // Handle encounter lose
  const handleEncounterLose = useCallback(() => {
    setGameState((prev) => {
      const nextEvent = prev.currentEvent + 1;
      const allEventsDone = nextEvent >= 3 || prev.completedEvents.every((e) => e);

      return {
        ...prev,
        phase: allEventsDone ? 'shop' : 'event_select',
        currentEvent: allEventsDone ? prev.currentEvent : nextEvent,
        currentEncounter: null,
        runStats: {
          ...prev.runStats,
          encountersLost: prev.runStats.encountersLost + 1,
        },
      };
    });
  }, []);

  // Handle encounter draw (pressure increases)
  const handleEncounterDraw = useCallback((drawCount: number, pressure: number) => {
    setGameState((prev) => ({
      ...prev,
      domainPressure: prev.domainPressure + pressure,
    }));
  }, []);

  // Handle decline encounter
  const handleEncounterDecline = useCallback(() => {
    setGameState((prev) => {
      const nextEvent = prev.currentEvent + 1;
      const allEventsDone = nextEvent >= 3 || prev.completedEvents.every((e) => e);

      return {
        ...prev,
        phase: allEventsDone ? 'shop' : 'event_select',
        currentEvent: allEventsDone ? prev.currentEvent : nextEvent,
        currentEncounter: null,
      };
    });
  }, []);

  // Handle wanderer choice (Accept/Decline/Provoke from Round 28 EncounterPanel)
  const handleWandererChoice = useCallback((result: WandererChoiceResult) => {
    const wandererSlug = currentWanderer?.slug || 'unknown';

    setGameState((prev) => {
      const effect = {
        favorTokens: result.favorTokens,
        calmBonus: result.calmBonus,
        heat: result.heat,
      };

      // Create ledger event
      const wandererEvent = createWandererChoiceEvent(wandererSlug, result.choice, effect);

      // Calculate next phase
      const nextEvent = prev.currentEvent + 1;
      const allEventsDone = nextEvent >= 3 || prev.completedEvents.every((e) => e);

      return {
        ...prev,
        phase: allEventsDone ? 'shop' : 'event_select',
        currentEvent: allEventsDone ? prev.currentEvent : nextEvent,
        currentEncounter: null,
        // Apply effects
        favorTokens: prev.favorTokens + (result.favorTokens || 0),
        calmBonus: prev.calmBonus + (result.calmBonus || 0),
        heat: prev.heat + (result.heat || 0),
        // Record in ledger
        ledger: [...prev.ledger, wandererEvent],
      };
    });
    // Clear current wanderer
    setCurrentWanderer(null);
  }, [currentWanderer]);

  // Handle shop purchase
  const handlePurchase = useCallback((cost: number, itemId: string, category: 'dice' | 'powerup' | 'upgrade') => {
    setGameState((prev) => {
      const newInventory = { ...prev.inventory };

      if (category === 'dice') {
        // Add dice to inventory
        newInventory.dice = { ...prev.inventory.dice };
        newInventory.dice[itemId] = (newInventory.dice[itemId] || 0) + 1;
      } else if (category === 'powerup') {
        newInventory.powerups = [...prev.inventory.powerups, itemId];
      } else if (category === 'upgrade') {
        newInventory.upgrades = [...prev.inventory.upgrades, itemId];
      }

      // Create SHOP_BUY ledger event
      const shopBuyEvent = createShopBuyEvent(itemId, cost, prev.tier);

      return {
        ...prev,
        gold: prev.gold - cost,
        inventory: newInventory,
        ledger: [...prev.ledger, shopBuyEvent],
      };
    });
  }, []);

  // Get current event config
  const domain = DOMAINS.find((d) => d.id === gameState.currentDomain);
  const currentEventConfig = domain?.events[gameState.currentEvent];

  // Calculate event-specific values (Round 31: heat affects difficulty)
  const baseScoreGoal = getEventScoreGoal(gameState.currentDomain, gameState.currentEvent);
  const scoreGoal = applyHeatDifficulty(baseScoreGoal, gameState.heat);
  const summons = getEventSummons(gameState.currentDomain, gameState.currentEvent);
  const tributes = getEventTributes(gameState.currentDomain);

  // Check if this is a fresh new run (sidebar shows setup options)
  const isNewRun =
    gameState.phase === 'event_select' &&
    gameState.currentDomain === 1 &&
    gameState.currentEvent === 0 &&
    !gameState.completedEvents.some(Boolean);

  // Generate doors for door_select phase (Round 30)
  const doorsForSelection = useMemo(() => {
    if (gameState.phase !== 'door_select' || !gameState.threadId) return [];
    const rng = createSeededRng(gameState.threadId);
    const domainSlug = domain?.name.toLowerCase().replace(/\s+/g, '-') || 'the-meadow';
    return getAvailableDoors(domainSlug, gameState.roomNumber, gameState.tier, rng);
  }, [gameState.phase, gameState.threadId, gameState.roomNumber, gameState.tier, domain?.name]);

  // Calculate lucky synergy for shop and rewards
  const luckySynergy = useMemo(() => {
    // Look up traveler from ledger THREAD_START event
    const threadStartEvent = gameState.ledger.find((e) => e.type === 'THREAD_START');
    const travelerSlug = threadStartEvent?.payload?.selectedTraveler as string | undefined;
    const traveler = travelerSlug ? getEntity(travelerSlug) : null;
    const luckyNumber = (traveler as { luckyNumber?: number } | null)?.luckyNumber ?? 0;

    return getLuckySynergy({
      luckyNumber,
      protocolRoll: gameState.protocolRoll,
      currentDomain: gameState.currentDomain,
    });
  }, [gameState.ledger, gameState.protocolRoll, gameState.currentDomain]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Game board with integrated sidebar - shows setup or game mode */}
      {/* Round 30: Also show DiceMeteor during door_select (overlay on top) */}
      {(gameState.phase === 'playing' || gameState.phase === 'door_select' || isNewRun) && (
        <DiceMeteor
          scoreGoal={scoreGoal}
          initialSummons={summons}
          initialTributes={tributes}
          domain={gameState.currentDomain}
          eventIndex={gameState.currentEvent}
          eventType={currentEventConfig?.type || 'small'}
          gold={gameState.gold}
          diceInventory={gameState.inventory.dice}
          onWin={handleEventWin}
          onLose={handleEventLose}
          onSkip={() => handleSkipEvent(gameState.currentEvent)}
          sidebarMode={isNewRun ? 'setup' : 'game'}
          onStartGame={handleStartGame}
          // Door overlay props (Round 30)
          showDoorOverlay={gameState.phase === 'door_select'}
          doors={doorsForSelection}
          onSelectDoor={handleSelectDoor}
          tier={gameState.tier}
          domainName={domain?.name || 'The Meadow'}
          roomNumber={gameState.roomNumber}
        />
      )}

      {/* Legacy event selection (deprecated in Round 30, kept for non-thread runs) */}
      {gameState.phase === 'event_select' && !isNewRun && (
        <EventSelection
          domainId={gameState.currentDomain}
          currentEvent={gameState.currentEvent}
          completedEvents={gameState.completedEvents}
          onBeginEvent={handleBeginEvent}
          onSkipEvent={handleSkipEvent}
          // Door selector props (Round 29)
          threadId={gameState.threadId || undefined}
          tier={gameState.tier}
          useDoorSelector={Boolean(gameState.threadId)}
          onSelectDoor={handleSelectDoor}
        />
      )}

      {gameState.phase === 'shop' && (
        <Shop
          gold={gameState.gold}
          domainId={gameState.currentDomain}
          onPurchase={handlePurchase}
          onContinue={handleShopDone}
          // Thread props (Round 28)
          threadId={gameState.threadId || undefined}
          tier={gameState.tier}
          // Wanderer effects (Round 31)
          favorTokens={gameState.favorTokens}
          // Lucky synergy - boosts rarity tier
          luckySynergy={luckySynergy}
        />
      )}

      {/* Audit Warning - pre-boss prep requisition */}
      {gameState.phase === 'audit_warning' && (
        <Shop
          gold={gameState.gold}
          domainId={gameState.currentDomain}
          onPurchase={handlePurchase}
          onContinue={handleAuditPrepDone}
          // Audit prep mode (Round 29)
          threadId={gameState.threadId || undefined}
          tier={gameState.tier}
          isAuditPrep={true}
          // Wanderer effects (Round 31)
          favorTokens={gameState.favorTokens}
          // Lucky synergy - boosts rarity tier
          luckySynergy={luckySynergy}
        />
      )}

      {gameState.phase === 'game_over' && (
        <GameOverModal
          open={true}
          isWin={gameState.gameWon}
          stats={{
            bestRoll: gameState.runStats.bestRoll || 0,
            mostRolled: gameState.runStats.mostRolled || 'd20',
            diceRolled: gameState.runStats.diceThrown,
            domains: gameState.currentDomain,
            reloads: gameState.runStats.reloads || 0,
            rooms: gameState.roomNumber,
            purchases: gameState.runStats.purchases || 0,
            shopRemixes: gameState.runStats.shopRemixes || 0,
            discoveries: gameState.runStats.discoveries || 0,
            seed: gameState.threadId || 'RANDOM',
            killedBy: gameState.runStats.killedBy,
          }}
          onNewRun={handleRestart}
          onMainMenu={handleRestart}
        />
      )}

      {/* Encounter panel (bottom sheet overlay) */}
      <EncounterPanel
        open={gameState.phase === 'encounter'}
        encounter={gameState.currentEncounter}
        onWin={handleEncounterWin}
        onLose={handleEncounterLose}
        onDraw={handleEncounterDraw}
        onDecline={handleEncounterDecline}
        // Wanderer mode props (Round 28)
        wanderer={currentWanderer}
        useWandererMode={Boolean(currentWanderer)}
        onWandererChoice={handleWandererChoice}
      />
    </Box>
  );
}
