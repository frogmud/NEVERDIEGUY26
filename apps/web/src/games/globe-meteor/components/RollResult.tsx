/**
 * RollResult - Displays roll results after dice are fired
 *
 * Shows the breakdown of each die roll and total meteors.
 * Appears in the dice hand area during the 'result' phase.
 *
 * NEVER DIE GUY
 */

import React from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { RollResultData } from '../config';

interface RollResultProps {
  result: RollResultData | null;
  visible: boolean;
}

/**
 * SVG die shape for result display
 */
const getDieShape = (sides: number): string => {
  switch (sides) {
    case 4:
      return 'M50 8 L92 85 L8 85 Z';
    case 6:
      return 'M15 15 L85 15 L85 85 L15 85 Z';
    case 8:
      return 'M50 5 L90 50 L50 95 L10 50 Z';
    case 10:
    case 12:
      return 'M50 5 L95 38 L77 90 L23 90 L5 38 Z';
    case 20:
      return 'M50 5 L90 27 L90 73 L50 95 L10 73 L10 27 Z';
    default:
      return 'M50 5 L90 27 L90 73 L50 95 L10 73 L10 27 Z';
  }
};

/**
 * Individual die result display
 */
function DieResult({ dieType, roll, color, label }: {
  dieType: number;
  roll: number;
  color: string;
  label: string;
}) {
  const path = getDieShape(dieType);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      {/* Die shape with roll value */}
      <Box sx={{ position: 'relative', width: 50, height: 50 }}>
        <svg width="50" height="50" viewBox="0 0 100 100">
          <path
            d={path}
            fill={color}
            stroke={color}
            strokeWidth="3"
          />
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fill="#000"
            fontSize="28"
            fontWeight="bold"
            fontFamily="Inter, sans-serif"
          >
            {roll}
          </text>
        </svg>
      </Box>
      {/* Die label */}
      <Typography
        variant="caption"
        sx={{ color: color, fontWeight: 600, fontSize: '0.7rem' }}
      >
        {label.toUpperCase()}
      </Typography>
    </Box>
  );
}

/**
 * RollResult Component
 */
export function RollResult({ result, visible }: RollResultProps) {
  if (!result || !visible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pb: 2,
        zIndex: 100,
        animation: 'fadeIn 0.2s ease-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateX(-50%) translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
        },
      }}
    >
      {/* Roll breakdown */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          backgroundColor: 'rgba(0,0,0,0.85)',
          borderRadius: 2,
          px: 2,
          py: 1.5,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {result.rolls.map((roll, index) => (
          <React.Fragment key={index}>
            <DieResult
              dieType={roll.dieType}
              roll={roll.roll}
              color={roll.color}
              label={roll.label}
            />
            {index < result.rolls.length - 1 && (
              <Typography
                sx={{ color: 'text.secondary', fontSize: '1.2rem', px: 0.5 }}
              >
                +
              </Typography>
            )}
          </React.Fragment>
        ))}

        {/* Equals sign and total */}
        <Typography
          sx={{ color: 'text.secondary', fontSize: '1.2rem', px: 1 }}
        >
          =
        </Typography>
        <Chip
          label={`${result.totalMeteors} METEORS`}
          sx={{
            backgroundColor: '#00e5ff',
            color: '#000',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        />
      </Stack>
    </Box>
  );
}

export default RollResult;
