/**
 * ControlsPanelPlayHold - Poker-style dice controls
 *
 * Players can:
 * - Toggle dice to hold (keep for next throw)
 * - THROW: Throw non-held dice at the sphere
 * - PLAY: Lock in current score, end turn
 * - HOLD: Keep held dice, draw replacements for rest
 */

import React from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  LockOutlined as HoldIcon,
  LockOpenOutlined as UnholdIcon,
} from '@mui/icons-material';
import { CardSection } from '../../../components/CardSection';
import { DiceShape } from '../../../components/DiceShapes';
import { tokens } from '../../../theme';
import type { HandDie, DiceHand } from '../types';

const gamingFont = { fontFamily: tokens.fonts.gaming };

interface ControlsPanelPlayHoldProps {
  /** Current dice hand state */
  hand: DiceHand;
  /** Toggle hold state for a die */
  onToggleHold: (dieId: string) => void;
  /** Throw non-held dice */
  onThrow: () => void;
  /** Lock in score and end turn */
  onPlay: () => void;
  /** Keep held dice, draw replacements */
  onHoldAndDraw: () => void;
  /** Current accumulated score this turn */
  turnScore?: number;
  /** Whether game is over */
  gameOver?: boolean;
  /** Small mode for compact display */
  isSmall?: boolean;
}

export function ControlsPanelPlayHold({
  hand,
  onToggleHold,
  onThrow,
  onPlay,
  onHoldAndDraw,
  turnScore = 0,
  gameOver = false,
  isSmall = false,
}: ControlsPanelPlayHoldProps) {
  const hasHeldDice = hand.dice.some((d) => d.held);
  const hasUnheldDice = hand.dice.some((d) => !d.held);
  const canThrow = hand.throwsRemaining > 0 && hasUnheldDice && !hand.throwing;
  const canHold = hand.throwsRemaining > 0 && hasHeldDice && !hand.throwing;
  const hasResults = hand.dice.some((d) => d.value !== null);

  return (
    <CardSection
      padding={isSmall ? 1 : 1.5}
      sx={{
        width: '100%',
        maxWidth: 480,
        mt: 1,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Throws remaining indicator */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
          mb: 1,
        }}
      >
        <Typography
          sx={{
            ...gamingFont,
            fontSize: '0.75rem',
            color: tokens.colors.text.secondary,
          }}
        >
          Throws:
        </Typography>
        {[...Array(hand.maxThrows)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor:
                i < hand.throwsRemaining
                  ? tokens.colors.secondary
                  : tokens.colors.background.elevated,
              border: `1px solid ${tokens.colors.border}`,
            }}
          />
        ))}
        {turnScore > 0 && (
          <Chip
            label={`+${turnScore}`}
            size="small"
            sx={{
              ...gamingFont,
              ml: 1,
              bgcolor: tokens.colors.success,
              color: '#fff',
              height: 20,
              fontSize: '0.7rem',
            }}
          />
        )}
      </Box>

      {/* Dice row with hold toggles */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isSmall ? 0.5 : 1,
          mb: isSmall ? 1 : 1.5,
        }}
      >
        {hand.dice.map((die) => {
          const diceSize = isSmall ? 36 : 48;
          return (
            <Box
              key={die.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {/* Die with value */}
              <Box
                onClick={() => !hand.throwing && onToggleHold(die.id)}
                sx={{
                  cursor: hand.throwing ? 'default' : 'pointer',
                  transform: die.held ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.15s',
                  opacity: die.held ? 1 : 0.7,
                  position: 'relative',
                  '&:hover': { opacity: 1 },
                }}
              >
                <DiceShape
                  sides={die.sides as 4 | 6 | 8 | 10 | 12 | 20}
                  size={diceSize}
                  color={die.color}
                  value={die.value ?? die.sides}
                />
                {/* Rolled value overlay */}
                {die.value !== null && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      ...gamingFont,
                      fontSize: isSmall ? '0.9rem' : '1.1rem',
                      color: '#fff',
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                      pointerEvents: 'none',
                    }}
                  >
                    {die.value}
                  </Box>
                )}
              </Box>

              {/* Hold indicator */}
              <Tooltip title={die.held ? 'Click to release' : 'Click to hold'}>
                <IconButton
                  size="small"
                  onClick={() => !hand.throwing && onToggleHold(die.id)}
                  disabled={hand.throwing}
                  sx={{
                    p: 0.25,
                    color: die.held
                      ? tokens.colors.warning
                      : tokens.colors.text.disabled,
                  }}
                >
                  {die.held ? (
                    <HoldIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <UnholdIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          );
        })}
      </Box>

      {/* Action buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: isSmall ? 1 : 1.5,
        }}
      >
        {/* THROW - Primary action */}
        <Button
          variant="contained"
          onClick={onThrow}
          disabled={!canThrow || gameOver}
          sx={{
            bgcolor: tokens.colors.secondary,
            minWidth: isSmall ? 80 : 100,
            py: isSmall ? 0.75 : 1,
            fontSize: isSmall ? '0.9rem' : '1rem',
            ...gamingFont,
            '&:hover': { bgcolor: '#00b8d9' },
            '&.Mui-disabled': {
              bgcolor: tokens.colors.background.elevated,
            },
          }}
        >
          Throw
        </Button>

        {/* PLAY - Lock in score */}
        <Button
          variant="contained"
          onClick={onPlay}
          disabled={!hasResults || hand.throwing || gameOver}
          sx={{
            bgcolor: tokens.colors.success,
            minWidth: isSmall ? 80 : 100,
            py: isSmall ? 0.75 : 1,
            fontSize: isSmall ? '0.9rem' : '1rem',
            ...gamingFont,
            '&:hover': { bgcolor: '#16a34a' },
            '&.Mui-disabled': {
              bgcolor: tokens.colors.background.elevated,
            },
          }}
        >
          Play
        </Button>

        {/* HOLD - Keep held, draw new */}
        <Button
          variant="outlined"
          onClick={onHoldAndDraw}
          disabled={!canHold || gameOver}
          sx={{
            borderColor: tokens.colors.warning,
            color: tokens.colors.warning,
            minWidth: isSmall ? 80 : 100,
            py: isSmall ? 0.75 : 1,
            fontSize: isSmall ? '0.9rem' : '1rem',
            ...gamingFont,
            '&:hover': {
              borderColor: tokens.colors.warning,
              bgcolor: 'rgba(255, 152, 0, 0.1)',
            },
            '&.Mui-disabled': {
              borderColor: tokens.colors.border,
              color: tokens.colors.text.disabled,
            },
          }}
        >
          Hold
        </Button>
      </Box>

      {/* Help text */}
      <Typography
        sx={{
          fontSize: '0.65rem',
          color: tokens.colors.text.disabled,
          textAlign: 'center',
          mt: 1,
        }}
      >
        Click dice to hold, then Throw or Play
      </Typography>
    </CardSection>
  );
}
