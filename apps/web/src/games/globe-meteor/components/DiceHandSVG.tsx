/**
 * DiceHandSVG - Google-style polyhedral dice selector
 *
 * Uses SVG shapes matching the Google dice roller aesthetic.
 * d4=triangle, d6=square, d8=diamond, d10=pentagon, d12=pentagon, d20=hexagon
 *
 * NEVER DIE GUY
 */

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

interface DiceType {
  sides: number;
  label: string;
  color: string;
}

interface DiceHandSVGProps {
  availableDice: DiceType[];
  selectedDice: DiceType[];
  maxDice: number;
  onToggleDice: (dice: DiceType) => void;
  disabled?: boolean;
}

/**
 * SVG paths for each die shape (Google dice roller style)
 */
const getDieShape = (sides: number): { path: string; viewBox: string } => {
  switch (sides) {
    case 4:
      // Triangle (d4)
      return {
        path: 'M50 8 L92 85 L8 85 Z',
        viewBox: '0 0 100 100',
      };
    case 6:
      // Square (d6)
      return {
        path: 'M15 15 L85 15 L85 85 L15 85 Z',
        viewBox: '0 0 100 100',
      };
    case 8:
      // Diamond/Octahedron face (d8)
      return {
        path: 'M50 5 L90 50 L50 95 L10 50 Z',
        viewBox: '0 0 100 100',
      };
    case 10:
      // Pentagon-ish (d10)
      return {
        path: 'M50 5 L95 38 L77 90 L23 90 L5 38 Z',
        viewBox: '0 0 100 100',
      };
    case 12:
      // Pentagon (d12)
      return {
        path: 'M50 5 L95 38 L77 90 L23 90 L5 38 Z',
        viewBox: '0 0 100 100',
      };
    case 20:
      // Hexagon (d20)
      return {
        path: 'M50 5 L90 27 L90 73 L50 95 L10 73 L10 27 Z',
        viewBox: '0 0 100 100',
      };
    default:
      return {
        path: 'M50 5 L90 27 L90 73 L50 95 L10 73 L10 27 Z',
        viewBox: '0 0 100 100',
      };
  }
};

/**
 * Individual die SVG component
 */
function DieSVG({
  dice,
  isSelected,
  canSelect,
  onClick,
  index,
  totalDice,
}: {
  dice: DiceType;
  isSelected: boolean;
  canSelect: boolean;
  onClick: () => void;
  index: number;
  totalDice: number;
}) {
  const { path, viewBox } = getDieShape(dice.sides);

  // Calculate fan angle - Balatro style spread
  const centerIndex = (totalDice - 1) / 2;
  const offsetFromCenter = index - centerIndex;
  const rotationAngle = offsetFromCenter * 3;
  const verticalOffset = Math.abs(offsetFromCenter) * 4;

  return (
    <Box
      onClick={canSelect ? onClick : undefined}
      sx={{
        width: 70,
        height: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: canSelect ? 'pointer' : 'not-allowed',
        transition: 'all 0.15s ease-out',
        transform: `
          rotate(${rotationAngle}deg)
          translateY(${isSelected ? -16 - verticalOffset : verticalOffset}px)
        `,
        opacity: !canSelect && !isSelected ? 0.4 : 1,
        '&:hover': canSelect
          ? {
              transform: `
                rotate(${rotationAngle}deg)
                translateY(${isSelected ? -20 - verticalOffset : -6 + verticalOffset}px)
              `,
            }
          : {},
        position: 'relative',
        zIndex: isSelected ? 10 : 1,
      }}
    >
      <svg
        width="56"
        height="56"
        viewBox={viewBox}
        style={{ overflow: 'visible' }}
      >
        {/* Die shape */}
        <path
          d={path}
          fill={isSelected ? dice.color : '#1a1a1a'}
          stroke={dice.color}
          strokeWidth={isSelected ? 4 : 3}
        />

        {/* Die label */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill={isSelected ? '#000' : '#fff'}
          fontSize="26"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          {dice.sides}
        </text>
      </svg>

      {/* Simple selection indicator line */}
      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 32,
            height: 3,
            borderRadius: 1.5,
            bgcolor: '#00e5ff',
          }}
        />
      )}
    </Box>
  );
}

/**
 * DiceHandSVG Component
 */
export function DiceHandSVG({
  availableDice,
  selectedDice,
  maxDice,
  onToggleDice,
  disabled = false,
}: DiceHandSVGProps) {
  const slotsRemaining = maxDice - selectedDice.length;
  const isMaxed = slotsRemaining === 0;

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
        pb: 1,
        zIndex: 100,
      }}
    >
      {/* Selection info */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 1,
          alignItems: 'center',
        }}
      >
        <Chip
          label={`${selectedDice.length}/${maxDice} DICE`}
          size="small"
          color={isMaxed ? 'secondary' : 'default'}
          sx={{
            fontWeight: 700,
            backgroundColor: isMaxed ? '#00e5ff' : 'rgba(0,0,0,0.7)',
            color: isMaxed ? '#000' : '#fff',
          }}
        />
        {selectedDice.length > 0 && (
          <Chip
            label={`${selectedDice.length}-${selectedDice.reduce(
              (sum, d) => sum + d.sides,
              0
            )} meteors`}
            size="small"
            sx={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          />
        )}
      </Box>

      {/* Dice row */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          alignItems: 'flex-end',
          height: 110,
          pt: 3,
        }}
      >
        {availableDice.map((dice, index) => {
          const isSelected = selectedDice.some((d) => d.label === dice.label);
          const canSelect = !disabled && (isSelected || !isMaxed);

          return (
            <DieSVG
              key={dice.label}
              dice={dice}
              isSelected={isSelected}
              canSelect={canSelect}
              onClick={() => onToggleDice(dice)}
              index={index}
              totalDice={availableDice.length}
            />
          );
        })}
      </Box>
    </Box>
  );
}

export default DiceHandSVG;
