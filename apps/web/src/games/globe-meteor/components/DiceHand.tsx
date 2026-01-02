/**
 * DiceHand - Balatro-style card hand for dice selection
 *
 * Displays available dice as hoverable/selectable cards at the bottom of the screen.
 * Selected dice float up and glow. Supports multi-select up to maxDice.
 *
 * NEVER DIE GUY
 */

import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';

interface DiceType {
  sides: number;
  label: string;
  color: string;
}

interface DiceHandProps {
  availableDice: DiceType[];
  selectedDice: DiceType[];
  maxDice: number;
  onToggleDice: (dice: DiceType) => void;
  disabled?: boolean;
}

/**
 * Single dice card component
 */
function DiceCard({
  dice,
  isSelected,
  onClick,
  disabled,
  index,
  totalCards,
}: {
  dice: DiceType;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
  index: number;
  totalCards: number;
}) {
  // Calculate fan angle for card spread
  const centerIndex = (totalCards - 1) / 2;
  const offsetFromCenter = index - centerIndex;
  const rotationAngle = offsetFromCenter * 3; // degrees
  const verticalOffset = Math.abs(offsetFromCenter) * 4; // pixels

  return (
    <Paper
      onClick={disabled ? undefined : onClick}
      elevation={isSelected ? 12 : 4}
      sx={{
        width: 70,
        height: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: isSelected ? dice.color : '#1a1a1a',
        border: `3px solid ${dice.color}`,
        borderRadius: 2,
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: `
          rotate(${rotationAngle}deg)
          translateY(${isSelected ? -20 - verticalOffset : verticalOffset}px)
          scale(${isSelected ? 1.1 : 1})
        `,
        boxShadow: isSelected
          ? `0 0 20px ${dice.color}, 0 10px 40px rgba(0,0,0,0.5)`
          : '0 4px 12px rgba(0,0,0,0.3)',
        opacity: disabled && !isSelected ? 0.5 : 1,
        '&:hover': disabled
          ? {}
          : {
              transform: `
                rotate(${rotationAngle}deg)
                translateY(${isSelected ? -24 - verticalOffset : -8 + verticalOffset}px)
                scale(${isSelected ? 1.15 : 1.08})
              `,
              boxShadow: `0 0 30px ${dice.color}80, 0 15px 50px rgba(0,0,0,0.5)`,
            },
        position: 'relative',
        zIndex: isSelected ? 10 : 1,
      }}
    >
      {/* Dice icon */}
      <CasinoIcon
        sx={{
          fontSize: 32,
          color: isSelected ? '#000' : dice.color,
          filter: isSelected ? 'none' : `drop-shadow(0 0 4px ${dice.color}80)`,
        }}
      />

      {/* Dice label */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 900,
          color: isSelected ? '#000' : dice.color,
          mt: 0.5,
        }}
      >
        {dice.label.toUpperCase()}
      </Typography>

      {/* Dice range */}
      <Typography
        variant="caption"
        sx={{
          color: isSelected ? '#000' : 'text.secondary',
          opacity: 0.8,
        }}
      >
        1-{dice.sides}
      </Typography>

      {/* Selected indicator */}
      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: '#00e5ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#000',
            boxShadow: '0 2px 8px rgba(0,229,255,0.5)',
          }}
        >
          {/* Could show order number here */}
        </Box>
      )}
    </Paper>
  );
}

/**
 * DiceHand Component
 *
 * Renders a fan of dice cards at the bottom of the screen.
 */
export function DiceHand({
  availableDice,
  selectedDice,
  maxDice,
  onToggleDice,
  disabled = false,
}: DiceHandProps) {
  const slotsRemaining = maxDice - selectedDice.length;
  const isMaxed = slotsRemaining === 0;

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pb: 2,
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
            label={`${selectedDice.reduce((sum, d) => sum + 1, 0)}-${selectedDice.reduce(
              (sum, d) => sum + d.sides,
              0
            )} meteors`}
            size="small"
            sx={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          />
        )}
      </Box>

      {/* Dice cards */}
      <Box
        sx={{
          display: 'flex',
          gap: -1, // Negative gap for overlapping cards
          alignItems: 'flex-end',
          perspective: '1000px',
          height: 130, // Fixed height to contain lifted cards
          pt: 4, // Padding for lifted cards
        }}
      >
        {availableDice.map((dice, index) => {
          const isSelected = selectedDice.some((d) => d.label === dice.label);
          const canSelect = isSelected || !isMaxed;

          return (
            <DiceCard
              key={dice.label}
              dice={dice}
              isSelected={isSelected}
              onClick={() => onToggleDice(dice)}
              disabled={disabled || !canSelect}
              index={index}
              totalCards={availableDice.length}
            />
          );
        })}
      </Box>
    </Box>
  );
}

export default DiceHand;
