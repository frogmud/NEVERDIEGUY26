/**
 * CombatHUD - Turn-based combat overlay for dice throwing
 *
 * Layout (matching mockup):
 * - Top section: Dice hand with hold toggles
 * - Bottom toolbar: Roll | Bless-Curse toggle | Hold
 *
 * Simple, clean design with no MUI icons in buttons.
 *
 * NEVER DIE GUY
 */

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tooltip,
  keyframes,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { CardSection } from '../../../components/CardSection';
import { DiceShape } from '../../../components/DiceShapes';
import { tokens } from '../../../theme';
import type { RunCombatState } from '../../../contexts/RunContext';
import type { Die } from '@ndg/ai-engine';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// Animations
const diceRoll = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.1); }
  50% { transform: rotate(180deg) scale(1); }
  75% { transform: rotate(270deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
`;

const dicePopIn = keyframes`
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  70% { transform: scale(1.2) rotate(10deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

const valuePop = keyframes`
  0% { transform: translate(-50%, -50%) scale(0); }
  70% { transform: translate(-50%, -50%) scale(1.3); }
  100% { transform: translate(-50%, -50%) scale(1); }
`;


// Use dice colors from design system (mapped to elements by die type)
const getDieColor = (sides: number): string => {
  const dieKey = `d${sides}` as keyof typeof tokens.colors.game.dice;
  return tokens.colors.game.dice[dieKey] || tokens.colors.primary;
};

// Button colors matching mockup
const BUTTON_COLORS = {
  roll: '#3366FF',        // Blue
  hold: tokens.colors.primary, // Red #E90441
  toggle: {
    bg: tokens.colors.background.default,
    border: 'rgba(255,255,255,0.3)',
    active: tokens.colors.background.elevated,
  },
};

interface CombatHUDProps {
  combatState: RunCombatState;
  onToggleHold: (dieId: string) => void;
  onHoldAll?: () => void;
  onHoldNone?: () => void;
  onThrow: () => void;
  onEndTurn: () => void;
  isSmall?: boolean;
  isDisabled?: boolean;
  /** Die types of active guardians (for showing "Hits Guardian" feedback) */
  guardianDieTypes?: number[];
  /** True if this is the last zone in the domain */
  isDomainClear?: boolean;
}

/**
 * Action Button - Large rounded button for Roll/Hold
 */
function ActionButton({
  label,
  color,
  onClick,
  disabled,
  isSmall,
}: {
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
  isSmall?: boolean;
}) {
  return (
    <Box
      component="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        ...gamingFont,
        fontSize: isSmall ? '1.1rem' : '1.4rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        color: tokens.colors.text.primary,
        bgcolor: disabled ? tokens.colors.background.elevated : color,
        border: 'none',
        borderRadius: 2,
        px: isSmall ? 3 : 4,
        py: isSmall ? 1.5 : 2,
        minWidth: isSmall ? 100 : 140,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s ease-out',
        boxShadow: disabled ? 'none' : `0 4px 16px ${color}66`,
        '&:hover:not(:disabled)': {
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 20px ${color}88`,
        },
        '&:active:not(:disabled)': {
          transform: 'translateY(0)',
        },
      }}
    >
      {label}
    </Box>
  );
}

/**
 * Holding Toggle - Single button that switches between "hold all" and "use all"
 */
function HoldingToggle({
  onAll,
  onNone,
  isSmall,
  heldCount,
  totalCount,
}: {
  onAll?: () => void;
  onNone?: () => void;
  isSmall?: boolean;
  heldCount: number;
  totalCount: number;
}) {
  // If all are held, show "use all" (release). Otherwise show "hold all"
  const allHeld = heldCount === totalCount && totalCount > 0;
  const label = allHeld ? 'use all' : 'hold all';
  const onClick = allHeld ? onNone : onAll;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Typography sx={{ ...gamingFont, fontSize: '0.7rem', color: tokens.colors.text.secondary }}>
        holding: {heldCount}/{totalCount}
      </Typography>
      <Box
        component="button"
        onClick={onClick}
        sx={{
          ...gamingFont,
          fontSize: isSmall ? '0.75rem' : '0.85rem',
          fontWeight: 600,
          color: tokens.colors.text.secondary,
          bgcolor: 'transparent',
          border: `1px solid ${BUTTON_COLORS.toggle.border}`,
          borderRadius: 2,
          px: isSmall ? 1.5 : 2,
          py: isSmall ? 0.5 : 0.75,
          cursor: 'pointer',
          transition: 'all 0.15s ease-out',
          minWidth: 80,
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.15)',
            color: tokens.colors.text.primary,
          },
        }}
      >
        {label}
      </Box>
    </Box>
  );
}

/**
 * Dice Hand Row - Shows dice with hold toggles
 */
function DiceHandRow({
  hand,
  onToggleHold,
  disabled,
  isSmall,
  isEmpty,
  isRolling,
  turnNumber = 1,
  guardianDieTypes = [],
}: {
  hand: Die[];
  onToggleHold: (dieId: string) => void;
  disabled: boolean;
  isSmall: boolean;
  isEmpty?: boolean;
  isRolling?: boolean;
  turnNumber?: number;
  guardianDieTypes?: number[];
}) {
  // Track which guardian types have been claimed by unheld dice (for "Hits Guardian" display)
  const guardianTargetCounts: Record<number, number> = {};
  for (const dt of guardianDieTypes) {
    guardianTargetCounts[dt] = (guardianTargetCounts[dt] || 0) + 1;
  }
  const usedTargetCounts: Record<number, number> = {};
  const diceSize = isSmall ? 48 : 64;

  // Show empty state in lobby - darker rectangle with message
  if (isEmpty) {
    return (
      <Box
        sx={{
          width: '100%',
          height: diceSize + 30,
          bgcolor: tokens.colors.background.elevated,
          borderRadius: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ ...gamingFont, fontSize: '0.9rem', color: tokens.colors.text.disabled }}>
          0/5 dice loaded
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: isSmall ? 1 : 2,
        mb: 1,
        py: 0.5,
        // Fixed height to prevent layout shifts during roll animation
        minHeight: diceSize + 20,
      }}
    >
      {hand.map((die, index) => {
        const baseDieColor = getDieColor(die.sides);
        const isHeld = die.isHeld;
        const isSelected = !isHeld; // Unheld = selected for throwing/trading
        const justRolled = die.rollValue !== null && isSelected;
        const dieColor = baseDieColor;
        // Show lock icon only after turn 1
        const showLockIcon = isHeld && turnNumber > 1;

        // Check if this unheld die targets a guardian
        let hitsGuardian = false;
        if (isSelected && guardianDieTypes.length > 0) {
          const guardianCount = guardianTargetCounts[die.sides] || 0;
          const usedCount = usedTargetCounts[die.sides] || 0;
          if (usedCount < guardianCount) {
            hitsGuardian = true;
            usedTargetCounts[die.sides] = usedCount + 1;
          }
        }

        return (
          <Box
            key={die.id}
            onClick={() => !disabled && onToggleHold(die.id)}
            sx={{
              cursor: disabled ? 'default' : 'pointer',
              // HELD = raised up, UNHELD = pressed down (ready to throw)
              transform: isHeld ? 'scale(1.02) translateY(-4px)' : 'scale(0.95) translateY(4px)',
              transition: isRolling ? 'none' : 'all 0.15s ease-out',
              opacity: 1,
              position: 'relative',
              // Subtle shadow only, no glow
              filter: isSelected ? `drop-shadow(0 2px 6px ${dieColor}44)` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animation: isRolling && isSelected ? `${diceRoll} 0.3s ease-in-out` : 'none',
              '&:hover': {
                transform: isHeld ? 'scale(1.05) translateY(-4px)' : 'scale(1) translateY(0)',
              },
            }}
          >
            <DiceShape
              sides={die.sides as 4 | 6 | 8 | 10 | 12 | 20}
              size={diceSize}
              color={dieColor}
              value={die.rollValue ?? undefined}
            />
            {/* Roll value overlay with pop animation */}
            {die.rollValue !== null && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  ...gamingFont,
                  fontSize: isSmall ? '1.2rem' : '1.6rem',
                  fontWeight: 700,
                  color: tokens.colors.text.primary,
                  textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                  pointerEvents: 'none',
                  animation: justRolled ? `${valuePop} 0.3s ease-out` : 'none',
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                {die.rollValue}
              </Box>
            )}
            {/* Lock icon - only shown after turn 1 */}
            {showLockIcon && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'rgba(30,30,30,0.9)',
                  borderRadius: '4px',
                  px: 0.5,
                  py: 0.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LockIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
              </Box>
            )}
            {/* "Hits Guardian" note - shown when this die will target a guardian */}
            {hitsGuardian && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: 'rgba(30,30,30,0.9)',
                  borderRadius: '4px',
                  px: 0.5,
                  py: 0.25,
                  whiteSpace: 'nowrap',
                }}
              >
                <Typography
                  sx={{
                    ...gamingFont,
                    fontSize: '0.55rem',
                    color: tokens.colors.warning,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Hits Guardian
                </Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * CombatHUD Component
 *
 * Main combat interface - dice display + action toolbar
 */
export function CombatHUD({
  combatState,
  onToggleHold,
  onHoldAll,
  onHoldNone,
  onThrow,
  onEndTurn,
  isSmall = false,
  isDisabled: isDisabledProp = false,
  guardianDieTypes = [],
  isDomainClear = false,
}: CombatHUDProps) {
  const {
    phase,
    hand,
    throwsRemaining,
    turnNumber,
    targetScore,
    currentScore,
  } = combatState;

  // Count held/unheld dice
  const heldCount = hand.filter(d => d.isHeld).length;
  const unheldCount = hand.length - heldCount;

  // Track rolling animation
  const [isRolling, setIsRolling] = useState(false);
  const prevPhaseRef = useRef(phase);

  // Trigger rolling animation when phase changes to throw/resolve
  useEffect(() => {
    if (prevPhaseRef.current !== phase) {
      if (phase === 'throw' || phase === 'resolve') {
        setIsRolling(true);
        const timer = setTimeout(() => setIsRolling(false), 400);
        return () => clearTimeout(timer);
      }
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  // Disable actions during throw/resolve phases and rolling animation to prevent multiple clicks
  const isDisabled = isDisabledProp || phase === 'throw' || phase === 'resolve' || phase === 'victory' || phase === 'defeat' || isRolling;
  const allRolled = hand.every((d) => d.rollValue !== null);

  // Victory/Defeat: Hide HUD - GameOverModal in PlayHub handles the overlay
  if (phase === 'victory' || phase === 'defeat') {
    return null;
  }

  return (
    <CardSection
      padding={isSmall ? 1.5 : 2}
      sx={{
        width: '100%',
        maxWidth: 520,
        mx: 'auto',
        mt: 1.5,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* Dice Hand - nothing above for cleaner UI */}
      <DiceHandRow
        hand={hand}
        onToggleHold={onToggleHold}
        disabled={isDisabled}
        isSmall={isSmall}
        isEmpty={isDisabledProp}
        isRolling={isRolling}
        turnNumber={turnNumber}
        guardianDieTypes={guardianDieTypes}
      />

      {/* Action toolbar - Throw | Holding | Trade - always reserve space for consistent height */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isSmall ? 1.5 : 2.5,
          minHeight: isSmall ? 44 : 52,
          opacity: isDisabledProp ? 0 : 1,
          visibility: isDisabledProp ? 'hidden' : 'visible',
          transition: 'opacity 0.2s ease',
        }}
      >
        {/* THROW button */}
        <ActionButton
          label="Throw"
          color={BUTTON_COLORS.roll}
          onClick={onThrow}
          disabled={isDisabled || unheldCount === 0 || throwsRemaining <= 0}
          isSmall={isSmall}
        />

        {/* Holding toggle - all/none quick select */}
        <HoldingToggle
          onAll={onHoldAll}
          onNone={onHoldNone}
          isSmall={isSmall}
          heldCount={heldCount}
          totalCount={hand.length}
        />

        {/* TRADE button - trades unheld dice for multiplier */}
        <ActionButton
          label="Trade"
          color={BUTTON_COLORS.hold}
          onClick={onEndTurn}
          disabled={isDisabled || unheldCount === 0}
          isSmall={isSmall}
        />
      </Box>

      {/* Info tooltip for holding dice - always reserve space */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 1.5,
          minHeight: 20,
          opacity: isDisabledProp ? 0 : 1,
          visibility: isDisabledProp ? 'hidden' : 'visible',
        }}
      >
        <Tooltip
          title="Holding dice preserves them for the next hand. Select dice to toggle held status. 'All' and 'None' can be used to reselect and deselect the whole hand for actions."
          arrow
          placement="bottom"
          slotProps={{
            tooltip: {
              sx: { maxWidth: 280 },
            },
          }}
        >
          <InfoOutlinedIcon
            sx={{
              fontSize: 14,
              color: tokens.colors.text.disabled,
              cursor: 'help',
              '&:hover': { color: tokens.colors.text.secondary },
            }}
          />
        </Tooltip>
      </Box>
    </CardSection>
  );
}

export default CombatHUD;
