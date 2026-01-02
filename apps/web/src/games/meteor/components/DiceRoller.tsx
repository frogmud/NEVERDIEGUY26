import { useState, useCallback } from 'react';
import { Box, Typography, Button, TextField, keyframes } from '@mui/material';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { DiceShape } from '../../../components/DiceShapes';
import { LottieTrigger } from '../../../components/LottieOverlay';
import { tokens } from '../../../theme';
import { getDiceTypes } from '../../../data/dice';

// Dice configurations from Die-rector system
const DICE_TYPES = getDiceTypes();

// Animation keyframes
const rollPop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

const rollShake = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
  75% { transform: rotate(-4deg); }
  100% { transform: rotate(0deg); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
`;

export interface DiceResult {
  value: number;
  notation: string;
  output: string;
  diceType: typeof DICE_TYPES[number];
}

interface DiceRollerProps {
  onRoll?: (result: DiceResult, history: DiceResult[]) => void;
  onSpecialRoll?: (type: 'confetti' | 'skull' | 'star') => void;
  initialDice?: 4 | 6 | 8 | 10 | 12 | 20 | null;
  compact?: boolean;
  externalLottie?: boolean;
}

export function DiceRoller({
  onRoll,
  onSpecialRoll,
  initialDice = null,
  compact = false,
  externalLottie = false,
}: DiceRollerProps) {
  const [selectedDice, setSelectedDice] = useState<typeof DICE_TYPES[number] | null>(
    initialDice ? DICE_TYPES.find(d => d.sides === initialDice) || null : null
  );
  const [result, setResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollHistory, setRollHistory] = useState<DiceResult[]>([]);
  const [notation, setNotation] = useState('');
  const [notationError, setNotationError] = useState('');

  // Lottie triggers (increment to play)
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [skullTrigger, setSkullTrigger] = useState(0);
  const [starTrigger, setStarTrigger] = useState(0);

  // Check for special rolls and trigger lotties
  const checkSpecialRolls = useCallback((roll: DiceRoll, diceType: typeof DICE_TYPES[number]) => {
    const output = roll.output;

    // Check for nat 20 on d20
    if (diceType.sides === 20 && roll.total === 20) {
      if (externalLottie) {
        onSpecialRoll?.('confetti');
      } else {
        setConfettiTrigger(t => t + 1);
      }
      return;
    }

    // Check for nat 1 on d20
    if (diceType.sides === 20 && roll.total === 1) {
      if (externalLottie) {
        onSpecialRoll?.('skull');
      } else {
        setSkullTrigger(t => t + 1);
      }
      return;
    }

    // Check for max roll on any die (mini celebration)
    if (roll.total === diceType.sides) {
      if (externalLottie) {
        onSpecialRoll?.('star');
      } else {
        setStarTrigger(t => t + 1);
      }
      return;
    }

    // Check for exploding dice (output contains "!")
    if (output.includes('!')) {
      if (externalLottie) {
        onSpecialRoll?.('star');
      } else {
        setStarTrigger(t => t + 1);
      }
    }
  }, [externalLottie, onSpecialRoll]);

  const performRoll = useCallback((diceNotation: string, diceType: typeof DICE_TYPES[number]) => {
    try {
      const roll = new DiceRoll(diceNotation);
      checkSpecialRolls(roll, diceType);
      return {
        value: roll.total,
        notation: roll.notation,
        output: roll.output,
        diceType,
      };
    } catch {
      return null;
    }
  }, [checkSpecialRolls]);

  const rollDice = useCallback(() => {
    if (!selectedDice) return;

    setIsRolling(true);
    setNotationError('');

    const diceNotation = `1d${selectedDice.sides}`;

    let rollCount = 0;
    const maxRolls = 8;
    const rollInterval = setInterval(() => {
      const tempResult = Math.floor(Math.random() * selectedDice.sides) + 1;
      setResult(tempResult);
      rollCount++;

      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);

        const rollResult = performRoll(diceNotation, selectedDice);

        if (rollResult) {
          setResult(rollResult.value);
          const newHistory = [...rollHistory.slice(-4), rollResult];
          setRollHistory(newHistory);
          onRoll?.(rollResult, newHistory);
        }

        setIsRolling(false);
      }
    }, 60);
  }, [selectedDice, rollHistory, onRoll, performRoll]);

  // Roll custom notation
  const rollNotation = useCallback(() => {
    if (!notation.trim()) return;

    setIsRolling(true);
    setNotationError('');

    // Use selected dice or default to d20 for notation rolls
    const diceForNotation = selectedDice ?? DICE_TYPES.find(d => d.sides === 20)!;

    let rollCount = 0;
    const maxRolls = 8;
    const rollInterval = setInterval(() => {
      const tempResult = Math.floor(Math.random() * 20) + 1;
      setResult(tempResult);
      rollCount++;

      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);

        const rollResult = performRoll(notation.trim(), diceForNotation);

        if (rollResult) {
          setResult(rollResult.value);
          const newHistory = [...rollHistory.slice(-4), rollResult];
          setRollHistory(newHistory);
          onRoll?.(rollResult, newHistory);
          setNotation('');
        } else {
          setNotationError('Invalid');
          setResult(null);
        }

        setIsRolling(false);
      }
    }, 60);
  }, [notation, selectedDice, rollHistory, onRoll, performRoll]);

  const total = rollHistory.reduce((sum, r) => sum + r.value, 0);
  const diceSize = compact ? 80 : 140;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: compact ? 1.5 : 3,
        p: compact ? 2 : 3,
        position: 'relative',
        height: compact ? 340 : 'auto',
        justifyContent: compact ? 'flex-start' : 'flex-start',
      }}
    >
      {/* Lottie overlays - behind dice (only if not external) */}
      {!externalLottie && (
        <>
          <LottieTrigger type="confetti" trigger={confettiTrigger} size={180} behind />
          <LottieTrigger type="skull" trigger={skullTrigger} size={120} behind />
          <LottieTrigger type="star" trigger={starTrigger} size={120} behind />
        </>
      )}

      {/* Dice display - fixed size container */}
      <Box
        sx={{
          width: diceSize,
          height: diceSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: selectedDice ? 'pointer' : 'default',
          position: 'relative',
          zIndex: 1,
        }}
        onClick={selectedDice ? rollDice : undefined}
      >
        <Box
          sx={{
            animation: isRolling
              ? `${rollShake} 0.15s ease-in-out infinite`
              : result
              ? `${rollPop} 0.3s ease-out`
              : 'none',
            opacity: selectedDice ? (result === null ? 0.5 : 1) : 0.3,
            transition: 'opacity 0.2s ease',
          }}
        >
          <DiceShape
            sides={selectedDice?.sides ?? 20}
            size={diceSize}
            color={selectedDice?.color ?? tokens.colors.text.disabled}
            value={selectedDice ? (result ?? '?') : '?'}
          />
        </Box>
      </Box>

      {/* Total display */}
      {rollHistory.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            animation: `${fadeIn} 0.2s ease-out`,
            minHeight: 32,
          }}
        >
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            Total
          </Typography>
          <Typography
            variant={compact ? 'h6' : 'h5'}
            sx={{
              fontWeight: 700,
              color: tokens.colors.text.primary,
              fontFamily: tokens.fonts.primary,
            }}
          >
            {total}
          </Typography>
        </Box>
      )}

      {/* Placeholder for total when no rolls yet */}
      {rollHistory.length === 0 && <Box sx={{ minHeight: 32 }} />}

      {/* Dice type selector - shaped */}
      <Box
        sx={{
          display: 'flex',
          gap: compact ? 0.75 : 1,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {DICE_TYPES.map((dice) => (
          <DiceShape
            key={dice.sides}
            sides={dice.sides}
            size={compact ? 32 : 36}
            color={selectedDice?.sides === dice.sides ? dice.color : `${dice.color}40`}
            value={dice.sides}
            onClick={() => {
              setSelectedDice(dice);
              setResult(null);
              setRollHistory([]);
            }}
          />
        ))}
      </Box>

      {/* Roll button */}
      <Button
        variant="contained"
        onClick={rollDice}
        disabled={isRolling || !selectedDice}
        size={compact ? 'small' : 'medium'}
        sx={{
          px: compact ? 3 : 4,
          py: compact ? 0.75 : 1,
          backgroundColor: selectedDice?.color ?? tokens.colors.text.disabled,
          fontWeight: 600,
          '&:hover': {
            backgroundColor: selectedDice?.color ?? tokens.colors.text.disabled,
            filter: 'brightness(1.1)',
          },
          '&:disabled': {
            backgroundColor: selectedDice ? `${selectedDice.color}80` : tokens.colors.text.disabled,
            color: 'rgba(255,255,255,0.5)',
          },
        }}
      >
        {isRolling ? 'Rolling...' : 'Roll'}
      </Button>

      {/* Notation input - compact only */}
      {compact && (
        <TextField
          size="small"
          placeholder="2d6+3, 4d6kh3..."
          value={notation}
          onChange={(e) => {
            setNotation(e.target.value);
            setNotationError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && rollNotation()}
          error={!!notationError}
          disabled={isRolling}
          sx={{
            width: '100%',
            maxWidth: 220,
            '& .MuiOutlinedInput-root': {
              backgroundColor: tokens.colors.background.elevated,
              fontFamily: tokens.fonts.mono,
              fontSize: '0.75rem',
              '& fieldset': {
                borderColor: notationError ? tokens.colors.error : tokens.colors.border,
              },
            },
            '& .MuiOutlinedInput-input': {
              textAlign: 'center',
              py: 0.75,
            },
          }}
        />
      )}
    </Box>
  );
}

// Export history display component for external use
export function DiceHistory({ history }: { history: DiceResult[] }) {
  if (history.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.75,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
        py: 1,
      }}
    >
      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, mr: 0.5 }}>
        History:
      </Typography>
      {history.map((roll, idx) => (
        <DiceShape
          key={idx}
          sides={roll.diceType.sides}
          size={20}
          color={roll.diceType.color}
          value={roll.value}
        />
      ))}
    </Box>
  );
}
