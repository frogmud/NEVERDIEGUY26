import { useState, useCallback } from 'react';
import { Box, Typography, Button, IconButton, keyframes } from '@mui/material';
import {
  AddSharp as AddIcon,
  RemoveSharp as RemoveIcon,
  ClearSharp as ClearIcon,
} from '@mui/icons-material';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { DiceShape } from '../../../components/DiceShapes';
import { tokens } from '../../../theme';
import { getDiceTypes, DieSides } from '../../../data/dice';
import { stagger, EASING, POP } from '../../../utils/transitions';

// Dice configurations from Die-rector system
const DICE_TYPES = getDiceTypes();

type DiceTypeConfig = typeof DICE_TYPES[number];

// Animation keyframes - organic motion with overshoot
const rollPop = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(${POP.strong}); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
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

// Dice enter animation with organic bounce
const diceEnter = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(-20px);
  }
  60% {
    opacity: 1;
    transform: scale(${POP.normal}) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

interface DiceCount {
  [key: number]: number;
}

// Individual die result
interface DieResult {
  sides: DieSides;
  value: number;
  color: string;
}

interface RollResult {
  total: number;
  notation: string;
  output: string;
  dice: DieResult[];
}

interface DiceBuilderProps {
  onRoll?: (result: RollResult) => void;
  initialModifier?: number;
}

export function DiceBuilder({ onRoll, initialModifier = 0 }: DiceBuilderProps) {
  const [diceCounts, setDiceCounts] = useState<DiceCount>({});
  const [modifier, setModifier] = useState(initialModifier);
  const [result, setResult] = useState<RollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState<DieResult[]>([]);

  // Build notation string
  const buildNotation = useCallback(() => {
    const parts: string[] = [];
    DICE_TYPES.forEach((dice) => {
      const count = diceCounts[dice.sides] || 0;
      if (count > 0) {
        parts.push(`${count}d${dice.sides}`);
      }
    });
    if (parts.length === 0) return '';
    let notation = parts.join('+');
    if (modifier > 0) notation += `+${modifier}`;
    if (modifier < 0) notation += `${modifier}`;
    return notation;
  }, [diceCounts, modifier]);

  // Build array of dice to display
  const buildDiceArray = useCallback((): DieResult[] => {
    const dice: DieResult[] = [];
    DICE_TYPES.forEach((diceType) => {
      const count = diceCounts[diceType.sides] || 0;
      for (let i = 0; i < count; i++) {
        dice.push({
          sides: diceType.sides,
          value: 0, // Will be set during roll
          color: diceType.color,
        });
      }
    });
    return dice;
  }, [diceCounts]);

  const updateDiceCount = (sides: number, delta: number) => {
    setDiceCounts((prev) => {
      const current = prev[sides] || 0;
      const newCount = Math.max(0, current + delta);
      if (newCount === 0) {
        const { [sides]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [sides]: newCount };
    });
  };

  const addDie = (sides: number) => {
    updateDiceCount(sides, 1);
  };

  const clearDice = () => {
    setDiceCounts({});
    setModifier(0);
    setResult(null);
    setDisplayDice([]);
  };

  const rollDice = useCallback(() => {
    const notation = buildNotation();
    if (!notation) return;

    setIsRolling(true);
    const diceArray = buildDiceArray();

    let rollCount = 0;
    const maxRolls = 10;

    const rollInterval = setInterval(() => {
      // Show random values on each die during animation
      const tempDice = diceArray.map((die) => ({
        ...die,
        value: Math.floor(Math.random() * die.sides) + 1,
      }));
      setDisplayDice(tempDice);
      rollCount++;

      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);

        try {
          const roll = new DiceRoll(notation);

          // Parse individual dice results from the roll
          const finalDice: DieResult[] = [];
          let diceIndex = 0;

          // The roll.rolls contains the dice groups
          roll.rolls.forEach((rollGroup: unknown) => {
            if (rollGroup && typeof rollGroup === 'object' && 'rolls' in rollGroup) {
              const group = rollGroup as { rolls: Array<{ value: number }>, sides: number };
              const diceType = DICE_TYPES.find(d => d.sides === group.sides);
              if (diceType && Array.isArray(group.rolls)) {
                group.rolls.forEach((r: { value: number }) => {
                  finalDice.push({
                    sides: diceType.sides,
                    value: r.value,
                    color: diceType.color,
                  });
                });
              }
            }
          });

          // If parsing failed, fall back to random distribution
          if (finalDice.length === 0) {
            diceArray.forEach((die) => {
              finalDice.push({
                ...die,
                value: Math.floor(Math.random() * die.sides) + 1,
              });
            });
          }

          const rollResult: RollResult = {
            total: roll.total,
            notation: roll.notation,
            output: roll.output,
            dice: finalDice,
          };

          setResult(rollResult);
          setDisplayDice(finalDice);
          onRoll?.(rollResult);
        } catch {
          setDisplayDice([]);
        }

        setIsRolling(false);
      }
    }, 50);
  }, [buildNotation, buildDiceArray, onRoll]);

  const notation = buildNotation();
  const totalDice = Object.values(diceCounts).reduce((a, b) => a + b, 0);
  const total = result?.total ?? displayDice.reduce((sum, d) => sum + d.value, 0);

  // Calculate dice display size based on count
  const getDiceSize = () => {
    if (totalDice <= 2) return 80;
    if (totalDice <= 4) return 64;
    if (totalDice <= 6) return 56;
    if (totalDice <= 9) return 48;
    return 40;
  };

  const diceSize = getDiceSize();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        p: 3,
      }}
    >
      {/* Dice canvas - fixed area, no container */}
      <Box
        sx={{
          height: totalDice > 10 ? 'auto' : 160,
          minHeight: 160,
          width: 320,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          cursor: totalDice > 0 ? 'pointer' : 'default',
        }}
        onClick={totalDice > 0 ? rollDice : undefined}
      >
        {displayDice.length > 0 ? (
          displayDice.map((die, idx) => (
            <Box
              key={idx}
              sx={{
                animation: isRolling
                  ? `${rollShake} 0.12s ease-in-out infinite`
                  : `${rollPop} 0.4s ${EASING.organic}`,
                ...stagger(idx, 40), // 40ms stagger for beat-by-beat reveal
              }}
            >
              <DiceShape
                sides={die.sides}
                size={diceSize}
                color={die.color}
                value={die.value}
              />
            </Box>
          ))
        ) : totalDice > 0 ? (
          // Show placeholder dice before first roll with staggered entrance
          buildDiceArray().map((die, idx) => (
            <Box
              key={idx}
              sx={{
                opacity: 0.5,
                animation: `${diceEnter} 0.3s ${EASING.organic} forwards`,
                ...stagger(idx, 30),
              }}
            >
              <DiceShape
                sides={die.sides}
                size={diceSize}
                color={die.color}
                value="?"
              />
            </Box>
          ))
        ) : null}
      </Box>

      {/* Total and notation display */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {(result || displayDice.length > 0) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 1,
              animation: `${fadeIn} 0.2s ease-out`,
            }}
          >
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              Total
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: tokens.colors.text.primary,
                fontFamily: tokens.fonts.primary,
              }}
            >
              {total}
            </Typography>
            {modifier !== 0 && result && (
              <Typography variant="body2" sx={{ color: tokens.colors.text.disabled }}>
                (incl. {modifier >= 0 ? '+' : ''}{modifier})
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 24 }}>
          {notation ? (
            <>
              <Typography
                sx={{
                  fontFamily: tokens.fonts.mono,
                  fontSize: '0.875rem',
                  color: tokens.colors.text.disabled,
                }}
              >
                {notation}
              </Typography>
              <IconButton
                size="small"
                onClick={clearDice}
                sx={{ color: tokens.colors.text.disabled, p: 0.25 }}
              >
                <ClearIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </>
          ) : null}
        </Box>

        {/* Roll output breakdown */}
        {result && !isRolling && (
          <Typography
            variant="caption"
            sx={{
              color: tokens.colors.text.disabled,
              fontFamily: tokens.fonts.mono,
              animation: `${fadeIn} 0.2s ease-out`,
              textAlign: 'center',
              maxWidth: 300,
              fontSize: '0.7rem',
            }}
          >
            {result.output}
          </Typography>
        )}
      </Box>

      {/* Dice selector row - Google style shapes */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {DICE_TYPES.map((dice) => {
          const count = diceCounts[dice.sides] || 0;
          return (
            <Box key={dice.sides} sx={{ position: 'relative' }}>
              <DiceShape
                sides={dice.sides}
                size={48}
                color={count > 0 ? dice.color : `${dice.color}50`}
                value={dice.sides}
                onClick={() => addDie(dice.sides)}
              />
              {count > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: dice.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #1a1a1a',
                    animation: `${fadeIn} 0.15s ease-out`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1,
                    }}
                  >
                    {count}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Quantity controls per dice type */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: '100%',
          maxWidth: 340,
        }}
      >
        {DICE_TYPES.map((dice) => {
          const count = diceCounts[dice.sides] || 0;
          return (
            <Box
              key={dice.sides}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              {/* Mini dice shape */}
              <DiceShape
                sides={dice.sides}
                size={28}
                color={count > 0 ? dice.color : `${dice.color}40`}
                value={dice.sides}
              />

              {/* Quantity controls */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: tokens.colors.background.elevated,
                  borderRadius: 1,
                  flex: 1,
                  justifyContent: 'space-between',
                  border: `1px solid ${count > 0 ? dice.color : tokens.colors.border}`,
                  transition: 'border-color 0.15s ease',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => updateDiceCount(dice.sides, -1)}
                  disabled={count === 0}
                  sx={{ color: count > 0 ? dice.color : tokens.colors.text.disabled }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography
                  sx={{
                    minWidth: 32,
                    textAlign: 'center',
                    fontWeight: 600,
                    fontFamily: tokens.fonts.mono,
                    color: count > 0 ? tokens.colors.text.primary : tokens.colors.text.disabled,
                  }}
                >
                  {count}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => updateDiceCount(dice.sides, 1)}
                  sx={{ color: dice.color }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          );
        })}

        {/* Modifier row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mt: 1,
            pt: 1.5,
            borderTop: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography
            sx={{
              width: 28,
              fontWeight: 600,
              fontSize: '0.75rem',
              color: tokens.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            +/-
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: tokens.colors.background.elevated,
              borderRadius: 1,
              flex: 1,
              justifyContent: 'space-between',
              border: `1px solid ${modifier !== 0 ? tokens.colors.secondary : tokens.colors.border}`,
              transition: 'border-color 0.15s ease',
            }}
          >
            <IconButton
              size="small"
              onClick={() => setModifier((m) => m - 1)}
              sx={{ color: tokens.colors.text.secondary }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography
              sx={{
                minWidth: 32,
                textAlign: 'center',
                fontWeight: 600,
                fontFamily: tokens.fonts.mono,
                color: modifier !== 0 ? tokens.colors.text.primary : tokens.colors.text.disabled,
              }}
            >
              {modifier >= 0 ? `+${modifier}` : modifier}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setModifier((m) => m + 1)}
              sx={{ color: tokens.colors.text.secondary }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Roll button */}
      <Button
        variant="contained"
        onClick={rollDice}
        disabled={isRolling || totalDice === 0}
        fullWidth
        sx={{
          maxWidth: 340,
          py: 1.5,
          backgroundColor: tokens.colors.primary,
          fontWeight: 600,
          fontSize: '1rem',
          '&:hover': {
            backgroundColor: tokens.colors.primary,
            filter: 'brightness(1.1)',
          },
          '&:disabled': {
            backgroundColor: tokens.colors.background.elevated,
            color: tokens.colors.text.disabled,
          },
        }}
      >
        {isRolling ? 'Rolling...' : totalDice > 0 ? `Roll ${notation}` : 'Add dice to roll'}
      </Button>
    </Box>
  );
}
