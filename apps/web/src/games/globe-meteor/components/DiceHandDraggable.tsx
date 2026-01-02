/**
 * DiceHandDraggable - Drag-and-drop dice selector
 *
 * Drag dice from the hand onto the globe to fire meteors.
 * Supports dragging multiple dice into a "roll pool" before firing.
 *
 * NEVER DIE GUY
 */

import React, { useState, useRef } from 'react';
import { Box, Typography, Chip } from '@mui/material';

interface DiceType {
  sides: number;
  label: string;
  color: string;
}

interface DiceHandDraggableProps {
  availableDice: DiceType[];
  selectedDice: DiceType[];
  maxDice: number;
  onToggleDice: (dice: DiceType) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDropOnGlobe?: (dice: DiceType[], lat: number, lng: number) => void;
  disabled?: boolean;
}

/**
 * SVG paths for each die shape
 */
const getDieShape = (sides: number): { path: string; viewBox: string } => {
  switch (sides) {
    case 4:
      return { path: 'M50 8 L92 85 L8 85 Z', viewBox: '0 0 100 100' };
    case 6:
      return { path: 'M15 15 L85 15 L85 85 L15 85 Z', viewBox: '0 0 100 100' };
    case 8:
      return { path: 'M50 5 L90 50 L50 95 L10 50 Z', viewBox: '0 0 100 100' };
    case 10:
      return { path: 'M50 5 L95 38 L77 90 L23 90 L5 38 Z', viewBox: '0 0 100 100' };
    case 12:
      return { path: 'M50 5 L95 38 L77 90 L23 90 L5 38 Z', viewBox: '0 0 100 100' };
    case 20:
      return { path: 'M50 5 L90 27 L90 73 L50 95 L10 73 L10 27 Z', viewBox: '0 0 100 100' };
    default:
      return { path: 'M50 5 L90 27 L90 73 L50 95 L10 73 L10 27 Z', viewBox: '0 0 100 100' };
  }
};

/**
 * Draggable die component
 */
function DraggableDie({
  dice,
  isSelected,
  canSelect,
  onSelect,
  index,
  totalDice,
  onDragStart,
  onDragEnd,
}: {
  dice: DiceType;
  isSelected: boolean;
  canSelect: boolean;
  onSelect: () => void;
  index: number;
  totalDice: number;
  onDragStart: (dice: DiceType) => void;
  onDragEnd: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const { path, viewBox } = getDieShape(dice.sides);

  const centerIndex = (totalDice - 1) / 2;
  const offsetFromCenter = index - centerIndex;
  const rotationAngle = offsetFromCenter * 4;
  const verticalOffset = Math.abs(offsetFromCenter) * 3;

  const handleDragStart = (e: React.DragEvent) => {
    if (!canSelect) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    onDragStart(dice);

    // Create drag image
    const dragImage = document.createElement('div');
    dragImage.innerHTML = `
      <svg width="60" height="60" viewBox="${viewBox}">
        <path d="${path}" fill="${dice.color}" stroke="${dice.color}" stroke-width="2"/>
        <text x="50" y="58" text-anchor="middle" fill="#fff" font-size="24" font-weight="bold">${dice.sides}</text>
      </svg>
    `;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 30, 30);
    e.dataTransfer.setData('text/plain', JSON.stringify(dice));

    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <Box
      draggable={canSelect}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={canSelect ? onSelect : undefined}
      sx={{
        width: 65,
        height: 75,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: canSelect ? 'grab' : 'not-allowed',
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: `
          rotate(${rotationAngle}deg)
          translateY(${isSelected ? -18 - verticalOffset : verticalOffset}px)
          scale(${isSelected ? 1.12 : 1})
        `,
        opacity: isDragging ? 0.3 : (!canSelect && !isSelected ? 0.4 : 1),
        filter: isSelected ? `drop-shadow(0 0 10px ${dice.color})` : 'none',
        '&:hover': canSelect
          ? {
              transform: `
                rotate(${rotationAngle}deg)
                translateY(${isSelected ? -22 - verticalOffset : -6 + verticalOffset}px)
                scale(${isSelected ? 1.18 : 1.08})
              `,
              filter: `drop-shadow(0 0 14px ${dice.color}80)`,
              cursor: 'grab',
            }
          : {},
        '&:active': canSelect
          ? { cursor: 'grabbing' }
          : {},
        position: 'relative',
        zIndex: isSelected ? 10 : 1,
      }}
    >
      <svg width="55" height="55" viewBox={viewBox}>
        {isSelected && (
          <defs>
            <filter id={`glow-${dice.sides}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}
        <path
          d={path}
          fill={isSelected ? dice.color : '#1a1a1a'}
          stroke={dice.color}
          strokeWidth="4"
          filter={isSelected ? `url(#glow-${dice.sides})` : undefined}
        />
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

      {isSelected && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 35,
            height: 3,
            borderRadius: 1.5,
            bgcolor: '#00e5ff',
            boxShadow: '0 0 6px #00e5ff',
          }}
        />
      )}
    </Box>
  );
}

/**
 * DiceHandDraggable Component
 */
export function DiceHandDraggable({
  availableDice,
  selectedDice,
  maxDice,
  onToggleDice,
  onDragStart,
  onDragEnd,
  disabled = false,
}: DiceHandDraggableProps) {
  const slotsRemaining = maxDice - selectedDice.length;
  const isMaxed = slotsRemaining === 0;

  const handleDragStart = (dice: DiceType) => {
    // Auto-select the die when dragging starts if not already selected
    if (!selectedDice.some((d) => d.label === dice.label)) {
      onToggleDice(dice);
    }
    onDragStart?.();
  };

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
        pb: 1.5,
      }}
    >
      {/* Status chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'center' }}>
        <Chip
          label={`${selectedDice.length}/${maxDice}`}
          size="small"
          sx={{
            fontWeight: 700,
            backgroundColor: isMaxed ? '#00e5ff' : 'rgba(0,0,0,0.7)',
            color: isMaxed ? '#000' : '#fff',
            minWidth: 50,
          }}
        />
        {selectedDice.length > 0 && (
          <Chip
            label={`${selectedDice.length}-${selectedDice.reduce((s, d) => s + d.sides, 0)}`}
            size="small"
            sx={{ backgroundColor: 'rgba(0,0,0,0.7)', fontWeight: 600 }}
          />
        )}
        {selectedDice.length > 0 && (
          <Typography
            variant="caption"
            sx={{
              color: '#00e5ff',
              fontWeight: 600,
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.6 },
              },
            }}
          >
            DRAG TO GLOBE
          </Typography>
        )}
      </Box>

      {/* Dice hand */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.25,
          alignItems: 'flex-end',
          height: 100,
          pt: 2,
        }}
      >
        {availableDice.map((dice, index) => {
          const isSelected = selectedDice.some((d) => d.label === dice.label);
          const canSelect = !disabled && (isSelected || !isMaxed);

          return (
            <DraggableDie
              key={dice.label}
              dice={dice}
              isSelected={isSelected}
              canSelect={canSelect}
              onSelect={() => onToggleDice(dice)}
              index={index}
              totalDice={availableDice.length}
              onDragStart={handleDragStart}
              onDragEnd={() => onDragEnd?.()}
            />
          );
        })}
      </Box>
    </Box>
  );
}

export default DiceHandDraggable;
