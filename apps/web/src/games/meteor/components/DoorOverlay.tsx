/**
 * DoorOverlay - Balatro-style door selection overlay
 *
 * Renders on top of the active Phaser game canvas without pausing.
 * Multi-preview UX: hover to expand, click to commit.
 */

import { useState } from 'react';
import { Box, Typography, Paper, Chip, Fade, Backdrop } from '@mui/material';
import {
  WorkspacePremiumSharp as TrophyIcon,
  MeetingRoomSharp as DoorIcon,
  LocalFireDepartmentSharp as FireIcon,
  DiamondSharp as DiamondIcon,
  AttachMoneySharp as MoneyIcon,
  StorageSharp as DataIcon,
  WarningAmberSharp as WarningIcon,
  AutoAwesomeSharp as SparkleIcon,
  GavelSharp as AuditIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import type { DoorPreview, DoorPromise } from '../../../data/pools';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// Promise type styling (same as EventSelection for consistency)
const PROMISE_CONFIG: Record<DoorPromise, { icon: React.ReactNode; color: string; label: string; description: string }> = {
  '+Credits': {
    icon: <MoneyIcon sx={{ fontSize: 14 }} />,
    color: tokens.colors.warning,
    label: 'Credits',
    description: 'Extra gold on room clear',
  },
  '+Data': {
    icon: <DataIcon sx={{ fontSize: 14 }} />,
    color: tokens.colors.secondary,
    label: 'Data',
    description: 'Bonus score multiplier',
  },
  'Rare Issuance': {
    icon: <DiamondIcon sx={{ fontSize: 14 }} />,
    color: '#a855f7',
    label: 'Rare',
    description: 'Higher rarity drops',
  },
  'Anomaly Chance': {
    icon: <SparkleIcon sx={{ fontSize: 14 }} />,
    color: '#ec4899',
    label: 'Anomaly',
    description: 'Chance for unique event',
  },
  'Wanderer Bias': {
    icon: <SparkleIcon sx={{ fontSize: 14 }} />,
    color: tokens.colors.success,
    label: 'Wanderer',
    description: 'Higher encounter chance',
  },
  'Heat Spike': {
    icon: <FireIcon sx={{ fontSize: 14 }} />,
    color: tokens.colors.error,
    label: 'Heat',
    description: 'Increases difficulty & rewards',
  },
  'Override': {
    icon: <WarningIcon sx={{ fontSize: 14 }} />,
    color: tokens.colors.error,
    label: 'Override',
    description: 'Special item guaranteed',
  },
};

// Door type styling
const DOOR_TYPE_CONFIG: Record<DoorPreview['doorType'], { color: string; bgColor: string; icon: React.ReactNode }> = {
  stable: { color: '#6b7280', bgColor: '#6b728020', icon: <DoorIcon /> },
  elite: { color: tokens.colors.warning, bgColor: `${tokens.colors.warning}20`, icon: <TrophyIcon /> },
  anomaly: { color: '#ec4899', bgColor: '#ec489920', icon: <SparkleIcon /> },
  audit: { color: tokens.colors.error, bgColor: `${tokens.colors.error}20`, icon: <AuditIcon /> },
};

interface DoorCardProps {
  door: DoorPreview;
  isHovered: boolean;
  isSelected: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}

function DoorCard({ door, isHovered, isSelected, onHover, onLeave, onSelect }: DoorCardProps) {
  const typeConfig = DOOR_TYPE_CONFIG[door.doorType];
  const difficultyBars = '|'.repeat(door.difficulty);

  return (
    <Paper
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onSelect}
      sx={{
        width: isHovered ? 240 : 180,
        bgcolor: isHovered ? typeConfig.bgColor : `${tokens.colors.background.paper}ee`,
        border: `2px solid ${isHovered || isSelected ? typeConfig.color : `${typeConfig.color}60`}`,
        borderRadius: 2,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.25s ease-out',
        transform: isHovered ? 'translateY(-16px) scale(1.05)' : isSelected ? 'scale(0.95)' : 'translateY(0)',
        opacity: isSelected ? 0.5 : 1,
        boxShadow: isHovered
          ? `0 8px 32px ${typeConfig.color}40, 0 0 0 2px ${typeConfig.color}`
          : '0 4px 12px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(8px)',
        zIndex: isHovered ? 10 : 1,
      }}
    >
      {/* Door Icon */}
      <Box
        sx={{
          width: isHovered ? 72 : 56,
          height: isHovered ? 72 : 56,
          bgcolor: typeConfig.bgColor,
          border: `2px solid ${typeConfig.color}`,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
          color: typeConfig.color,
          transition: 'all 0.2s',
          '& svg': { fontSize: isHovered ? 32 : 24 },
        }}
      >
        {typeConfig.icon}
      </Box>

      {/* Door Label */}
      <Typography
        sx={{
          ...gamingFont,
          fontSize: isHovered ? '0.8rem' : '0.7rem',
          color: typeConfig.color,
          fontWeight: 700,
          mb: 0.5,
          textAlign: 'center',
          transition: 'all 0.2s',
        }}
      >
        {door.label}
      </Typography>

      {/* Difficulty */}
      <Typography
        sx={{
          fontSize: '0.95rem',
          color: tokens.colors.text.disabled,
          letterSpacing: '0.15em',
          mb: 1,
        }}
      >
        {difficultyBars}
      </Typography>

      {/* Promise Badges */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', mb: isHovered ? 1.5 : 0 }}>
        {door.promises.map((promise, i) => {
          const config = PROMISE_CONFIG[promise];
          return (
            <Chip
              key={i}
              icon={config.icon as React.ReactElement}
              label={config.label}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.875rem',
                bgcolor: `${config.color}20`,
                color: config.color,
                border: `1px solid ${config.color}50`,
                '& .MuiChip-icon': { color: config.color, ml: 0.5 },
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          );
        })}
      </Box>

      {/* Expanded promise descriptions on hover */}
      <Fade in={isHovered} timeout={200}>
        <Box sx={{ display: isHovered ? 'block' : 'none', width: '100%' }}>
          {door.promises.map((promise, i) => {
            const config = PROMISE_CONFIG[promise];
            return (
              <Typography
                key={i}
                sx={{
                  fontSize: '0.875rem',
                  color: tokens.colors.text.secondary,
                  textAlign: 'center',
                  mb: 0.25,
                }}
              >
                <Box component="span" sx={{ color: config.color }}>
                  {config.label}:
                </Box>{' '}
                {config.description}
              </Typography>
            );
          })}
        </Box>
      </Fade>

      {/* Enter prompt on hover */}
      <Fade in={isHovered} timeout={200}>
        <Typography
          sx={{
            display: isHovered ? 'block' : 'none',
            ...gamingFont,
            fontSize: '1.25rem',
            color: typeConfig.color,
            mt: 1,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Click to Enter
        </Typography>
      </Fade>
    </Paper>
  );
}

export interface DoorOverlayProps {
  doors: DoorPreview[];
  onSelectDoor: (door: DoorPreview) => void;
  tier: number;
  domainName: string;
  roomNumber: number;
  open: boolean;
}

export function DoorOverlay({ doors, onSelectDoor, tier, domainName, roomNumber, open }: DoorOverlayProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (door: DoorPreview, index: number) => {
    if (selectedIndex !== null) return; // Prevent double-click

    setSelectedIndex(index);
    // Brief delay for visual feedback before transitioning
    setTimeout(() => {
      onSelectDoor(door);
    }, 300);
  };

  if (!open) return null;

  return (
    <>
      {/* Semi-transparent backdrop - does NOT pause Phaser */}
      <Backdrop
        open={open}
        sx={{
          zIndex: 100,
          bgcolor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Door selection container */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pb: 4,
          pt: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            sx={{
              ...gamingFont,
              fontSize: '0.95rem',
              color: tokens.colors.text.disabled,
              letterSpacing: '0.15em',
              mb: 0.5,
            }}
          >
            ROOM {roomNumber}/3 | TIER {tier}
          </Typography>
          <Typography
            sx={{
              ...gamingFont,
              fontSize: '1.25rem',
              color: tokens.colors.text.primary,
              mb: 0.5,
            }}
          >
            {domainName}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.95rem',
              color: tokens.colors.text.secondary,
            }}
          >
            Choose your path
          </Typography>
        </Box>

        {/* Door Cards */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            alignItems: 'flex-end', // Align to bottom so hover lift looks natural
            minHeight: 280, // Reserve space for hover expansion
          }}
        >
          {doors.map((door, index) => (
            <DoorCard
              key={index}
              door={door}
              isHovered={hoveredIndex === index}
              isSelected={selectedIndex === index}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
              onSelect={() => handleSelect(door, index)}
            />
          ))}
        </Box>

        {/* Room Progress Dots */}
        <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
          {[1, 2, 3].map((room) => (
            <Box
              key={room}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor:
                  room < roomNumber
                    ? tokens.colors.success
                    : room === roomNumber
                    ? tokens.colors.primary
                    : tokens.colors.background.elevated,
                border: `1px solid ${
                  room < roomNumber
                    ? tokens.colors.success
                    : room === roomNumber
                    ? tokens.colors.primary
                    : tokens.colors.border
                }`,
              }}
            />
          ))}
        </Box>
      </Box>
    </>
  );
}
