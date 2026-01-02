import { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  FlagSharp as FlagIcon,
  FullscreenSharp as FullscreenIcon,
} from '@mui/icons-material';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { CardSection } from '../../components/CardSection';
import { SidebarSetup } from '../../components/SidebarSetup';
import { ReportGameDialog } from '../../components/ReportGameDialog';
import { tokens } from '../../theme';
import { PhaserCanvas } from '../../games/meteor/PhaserCanvas';
import { MeteorScene, type DieData } from '../../games/meteor/MeteorScene';
import type { NPCRarity } from '../../games/meteor/config';
import { detectCombo, type ComboResult } from '../../games/meteor/comboDetector';
import { getDierectorBlessing } from '../../data/dice/favor';
import { getDiceConfig } from '../../data/dice/config';
import { EVENT_TEMPLATES, type EventType } from '../../games/meteor/gameConfig';
import { SoundManager } from '../../games/meteor/SoundManager';
import { GlobeScene } from '../../games/globe-meteor/GlobeScene';
import { useGameState, useDiceSelection, useRollHistory } from '../../hooks';
import {
  ComboPopup,
  ControlsPanel,
  FlyingDiceLayer,
  GameSidebar,
  SettingsModal,
  DoorOverlay,
  type FlyingDie,
  type GameConfig,
} from '../../games/meteor/components';
import type { DoorPreview } from '../../data/pools';

// Gaming font style
const gamingFont = { fontFamily: tokens.fonts.gaming };

// Default dice inventory (1 of each)
const DEFAULT_DICE_INVENTORY: Record<string, number> = {
  d4: 1,
  d6: 1,
  d8: 1,
  d10: 1,
  d12: 1,
  d20: 1,
};

// Props interface for controlled mode
interface DiceMeteorProps {
  scoreGoal?: number;
  initialSummons?: number;
  initialTributes?: number;
  domain?: number;
  eventIndex?: number;
  eventType?: EventType;
  gold?: number;
  diceInventory?: Record<string, number>;
  onWin?: (score: number, stats: { npcsSquished: number; diceThrown: number }) => void;
  onLose?: () => void;
  onSkip?: () => void;
  sidebarMode?: 'setup' | 'game';
  onStartGame?: (config: GameConfig) => void;
  // Door selection overlay (Round 30)
  showDoorOverlay?: boolean;
  doors?: DoorPreview[];
  onSelectDoor?: (door: DoorPreview) => void;
  tier?: number;
  domainName?: string;
  roomNumber?: number;
  backgroundImage?: string;
}

export function DiceMeteor({
  scoreGoal: propScoreGoal = 5000,
  initialSummons = 3,
  initialTributes = 3,
  domain: propDomain = 1,
  eventIndex = 0,
  eventType = 'small',
  gold: propGold = 0,
  diceInventory = DEFAULT_DICE_INVENTORY,
  onWin,
  onLose,
  onSkip,
  sidebarMode = 'game',
  onStartGame,
  // Door overlay props (Round 30)
  showDoorOverlay = false,
  doors = [],
  onSelectDoor,
  tier = 1,
  domainName = 'The Meadow',
  roomNumber = 1,
  backgroundImage,
}: DiceMeteorProps = {}) {
  // Responsive breakpoints
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md')); // < 900px
  const isMedium = useMediaQuery(theme.breakpoints.between('md', 'lg')); // 900-1200px

  // Refs
  const sceneRef = useRef<MeteorScene | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);

  // Game state hook
  const {
    state,
    setScore,
    setSummons,
    setTributes,
    setMultiplier,
    incrementNPCsSquished,
    incrementDiceThrown,
    resetGame,
  } = useGameState(
    { scoreGoal: propScoreGoal, initialSummons, initialTributes, domain: propDomain, gold: propGold },
    { onWin, onLose }
  );

  // Dice selection hook
  const { availableDice, selectedDice, selectedDiceObjects, toggleDice, clearSelection } =
    useDiceSelection(diceInventory, sceneRef, state.gameOver);

  // Roll history hook
  const { history, startRoll, recordHit, finishRoll, addTributeRoll, clearHistory } = useRollHistory();

  // Get event config for badge display
  const eventConfig = EVENT_TEMPLATES[eventType];

  // Local UI state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeCombo, setActiveCombo] = useState<ComboResult | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [flyingDice, setFlyingDice] = useState<FlyingDie[]>([]);

  // Reset game (for standalone mode)
  const handleRestart = () => {
    resetGame();
    clearHistory();
    setActiveCombo(null);
    setFlyingDice([]);
  };

  // Handle NPC squish
  const handleNPCSquished = useCallback((rarity: NPCRarity, baseScore: number) => {
    const finalScore = baseScore * state.multiplier;
    setScore((prev) => prev + finalScore);
    recordHit(finalScore);
    incrementNPCsSquished();
  }, [state.multiplier, setScore, recordHit, incrementNPCsSquished]);

  // Handle all meteors landed
  const handleMeteorLanded = useCallback(() => {
    finishRoll();
    setMultiplier(1);
  }, [finishRoll, setMultiplier]);

  // Handle meteor start - creates flying dice animation
  const handleMeteorStart = useCallback((positions: Array<{ x: number; y: number }>) => {
    // Clear any existing flying dice
    setFlyingDice([]);
  }, []);

  // Summon action
  const handleSummon = () => {
    if (selectedDice.length === 0 || state.summons <= 0 || !sceneRef.current) return;

    // Use hook-provided selectedDiceObjects
    const selectedSides = selectedDiceObjects.map((d) => d.sides);

    // Roll dice using rpg-dice-roller library and build DieData for element system
    const diceData: DieData[] = selectedSides.map((sides) => {
      const roll = new DiceRoll(`1d${sides}`);
      const config = getDiceConfig(sides);
      return {
        sides: sides as 4 | 6 | 8 | 10 | 12 | 20,
        value: roll.total,
        element: config?.element || 'Neutral',
      };
    });
    const values = diceData.map((d) => d.value);

    // Detect duplicate dice for Dierector blessing
    const diceCounts: Record<number, number> = {};
    selectedSides.forEach((sides) => {
      diceCounts[sides] = (diceCounts[sides] || 0) + 1;
    });

    // Find any die type with 2+ selected and get the blessing
    let dierectorBonus = 0;
    Object.entries(diceCounts).forEach(([sides, count]) => {
      if (count >= 2) {
        const blessing = getDierectorBlessing(Number(sides), count);
        if (blessing) {
          dierectorBonus += blessing.bonusMultiplier;
        }
      }
    });

    // Detect combo
    const combo = detectCombo(values);

    // Show combo popup (if not 'none')
    if (combo.type !== 'none') {
      setActiveCombo(combo);
      SoundManager.playCombo(combo.type);
      setTimeout(() => setActiveCombo(null), 1500);
    }

    // Start roll tracking
    startRoll(selectedSides, values);

    // Get screen positions for animation
    const controlsRect = controlsRef.current?.getBoundingClientRect();
    const canvasRect = canvasContainerRef.current?.getBoundingClientRect();

    if (controlsRect && canvasRect) {
      const newFlyingDice = selectedDiceObjects.map((die, i) => ({
        id: Date.now() + i,
        sides: die.sides,
        value: values[i],
        color: die.color,
        startX: controlsRect.left + controlsRect.width / 2 - 20,
        startY: controlsRect.top - 40,
        endX: canvasRect.left + canvasRect.width / 2 + (Math.random() - 0.5) * 200,
        endY: canvasRect.top + canvasRect.height / 2 + (Math.random() - 0.5) * 100,
      }));
      setFlyingDice(newFlyingDice);
      setTimeout(() => setFlyingDice([]), 500);
    }

    // Drop meteors with combo effect and element data
    sceneRef.current.dropMeteors(diceData, combo.meteorEffect);

    // Track stats and clear selection
    incrementDiceThrown(selectedDice.length);
    clearSelection();
    setSummons((prev) => prev - 1);

    // Apply combo multiplier for this roll's scoring
    if (combo.multiplier !== 1) {
      setMultiplier(state.multiplier * combo.multiplier);
    }

    // Apply Dierector blessing bonus (additive)
    if (dierectorBonus > 0) {
      setMultiplier((prev) => prev + dierectorBonus);
    }
  };

  // Tribute action - roll-based multiplier boost
  const handleTribute = () => {
    if (selectedDice.length === 0 || state.tributes <= 0) return;

    // Get selected dice sides
    const selectedSides = selectedDiceObjects.map((d) => d.sides);

    // Roll dice using rpg-dice-roller library
    const values = selectedSides.map((sides) => {
      const roll = new DiceRoll(`1d${sides}`);
      return roll.total;
    });

    // Calculate boost: sum of (roll / maxSides)
    // e.g., d20 rolling 18 = 18/20 = 0.9x boost
    // e.g., d6 rolling 3 = 3/6 = 0.5x boost
    const boost = values.reduce((sum, value, i) => {
      return sum + value / selectedSides[i];
    }, 0);

    // Round boost to 2 decimal places for display
    const roundedBoost = Math.round(boost * 100) / 100;

    // Apply multiplier boost
    setMultiplier((prev) => prev + roundedBoost);

    // Add to roll history
    addTributeRoll(selectedSides, values, roundedBoost);

    // Clear selection and consume tribute
    clearSelection();
    setTributes((prev) => prev - 1);
  };

  // Scene ready callback
  const handleSceneReady = useCallback((scene: MeteorScene) => {
    sceneRef.current = scene;
    // Set up boss event if this is a boss event
    if (eventType === 'boss') {
      scene.setBossEvent(true, propDomain);
    }
  }, [eventType, propDomain]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isSmall ? 'column' : 'row',
        gap: 2,
        height: isSmall ? 'auto' : 'calc(100vh - 56px - 48px)',
        minHeight: isSmall ? 'auto' : 500,
        overflow: 'hidden',
      }}
    >
      {/* Main game area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 0,
          overflow: 'hidden',
          position: 'relative',
          py: 2,
        }}
      >
        {/* Top bar - above canvas, slides in when playing */}
        {sidebarMode === 'game' && (
        <CardSection
          padding={isSmall ? 0.75 : 1}
          sx={{
            width: '100%',
            maxWidth: 480,
            mb: 1,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: isSmall ? 1 : 1.5,
            borderRadius: 2,
            animation: 'slideInFromTop 0.3s ease-out',
            '@keyframes slideInFromTop': {
              '0%': { opacity: 0, transform: 'translateY(-20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Typography variant="body2" sx={{ ...gamingFont, fontSize: isSmall ? '0.75rem' : '0.875rem' }}>
            Domain [ {state.domain} ]
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, ...gamingFont, fontSize: isSmall ? '0.75rem' : '0.875rem' }}>
            Event [ {(eventIndex + 1).toString().padStart(3, '#')} ]
          </Typography>
          <Box sx={{ flex: 1, minWidth: isSmall ? 0 : 'auto' }} />
          {!isSmall && (
            <>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, ...gamingFont, fontSize: '0.7rem' }}>
                Run Time
              </Typography>
              <Typography variant="body2" sx={{ ...gamingFont, fontSize: '0.7rem' }}>
                ##:##
              </Typography>
            </>
          )}
        </CardSection>
        )}

        {/* Game canvas - narrow "lens" viewport */}
        <Paper
          ref={canvasContainerRef}
          sx={{
            width: '100%',
            maxWidth: 480, // Narrow lens
            aspectRatio: '4 / 3', // More portrait-ish
            mx: 'auto', // Center horizontally
            backgroundColor: 'transparent',
            border: `2px solid ${tokens.colors.border}`,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            boxShadow: `0 0 20px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)`,
          }}
        >
          {/* 3D Globe background - the actual game board */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
            }}
          >
            <GlobeScene
              npcs={[]}
              meteors={[]}
              impacts={[]}
              onGlobeClick={() => {}}
              targetPosition={null}
              style="lowPoly"
              autoRotate={true}
              isIdle={false}
              zones={[]}
            />
          </Box>

          {/* Phaser game layer (transparent) - meteors, NPCs, collisions */}
          <Box sx={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
          <PhaserCanvas
            onNPCSquished={handleNPCSquished}
            onMeteorLanded={handleMeteorLanded}
            onMeteorStart={handleMeteorStart}
            onSceneReady={handleSceneReady}
          />

          {/* Combo Popup */}
          <ComboPopup combo={activeCombo} />

          {/* Overlay controls */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              display: 'flex',
              gap: 1,
            }}
          >
            <Tooltip title="Report">
              <IconButton
                size="small"
                onClick={() => setReportOpen(true)}
                sx={{ bgcolor: tokens.colors.background.elevated }}
              >
                <FlagIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fullscreen">
              <IconButton
                size="small"
                onClick={() => {
                  const container = canvasContainerRef.current;
                  if (!container) return;

                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    container.requestFullscreen();
                  }
                }}
                sx={{ bgcolor: tokens.colors.background.elevated }}
              >
                <FullscreenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          </Box>
        </Paper>

        {/* Controls panel */}
        {sidebarMode === 'game' && (
          <ControlsPanel
            availableDice={availableDice}
            selectedDice={selectedDice}
            onToggle={toggleDice}
            onSummon={handleSummon}
            onTribute={handleTribute}
            summons={state.summons}
            tributes={state.tributes}
            gameOver={state.gameOver}
            history={history}
            isSmall={isSmall}
            controlsRef={controlsRef}
          />
        )}
      </Box>

      {/* Sidebar */}
      <Paper
        sx={{
          width: isSmall ? '100%' : isMedium ? 240 : 280,
          minWidth: isSmall ? 'auto' : 200,
          flexShrink: isSmall ? 1 : 0,
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
          maxHeight: isSmall ? 400 : 'none',
        }}
      >
        {/* Setup Mode - Show game configuration */}
        {sidebarMode === 'setup' && onStartGame && (
          <SidebarSetup onStart={onStartGame} />
        )}

        {/* Game Mode - Show game stats */}
        {sidebarMode === 'game' && (
          <GameSidebar
            eventConfig={eventConfig}
            scoreGoal={state.scoreGoal}
            score={state.score}
            multiplier={state.multiplier}
            selectedCount={selectedDice.length}
            summons={state.summons}
            tributes={state.tributes}
            gold={state.gold}
            domain={state.domain}
            eventIndex={eventIndex}
            onSettingsOpen={() => setSettingsOpen(true)}
            history={history}
          />
        )}
      </Paper>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onRestart={() => {
          handleRestart();
          setSettingsOpen(false);
        }}
        onSkip={onSkip}
      />

      {/* Report Dialog */}
      <ReportGameDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onBackToHome={handleRestart}
      />

      {/* Flying dice animation layer */}
      <FlyingDiceLayer flyingDice={flyingDice} />

      {/* Door selection overlay (Round 30) */}
      {showDoorOverlay && onSelectDoor && (
        <DoorOverlay
          doors={doors}
          onSelectDoor={onSelectDoor}
          tier={tier}
          domainName={domainName}
          roomNumber={roomNumber}
          open={showDoorOverlay}
        />
      )}
    </Box>
  );
}
