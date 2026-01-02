/**
 * BoardAndPieces - Dice visual customization
 *
 * Clean design inspired by Chess.com settings:
 * - Hero dice preview with live 2D/3D toggle
 * - Simplified theme selection
 * - Toggle sections for effects
 */

import { useState, useRef, useEffect } from 'react';
import { Box, Typography, Switch, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { tokens } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';
import { DiceShape } from '../../../components/DiceShapes';
import { ZdogDice } from '../../../components/ZdogDice';
import { DICE_CONFIG, getDiceColor } from '../../../data/dice';
import { loadBoardSettings, saveBoardSettings, type BoardSettingsData } from '../../../data/player/storage';

// ============================================
// Balatro-style hover card (simplified)
// ============================================

interface BalatroCardProps {
  children: React.ReactNode;
  glowColor?: string;
  selected?: boolean;
  onClick?: () => void;
}

function BalatroCard({ children, glowColor, selected, onClick }: BalatroCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(500px) rotateX(0deg) rotateY(0deg)');
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || selected) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 20;
    const rotateX = ((centerY - y) / centerY) * 20;
    setTransform(`perspective(400px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.1)`);
  };

  const handleMouseLeave = () => {
    if (!selected) {
      setTransform('perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)');
    }
    setIsHovered(false);
  };

  const selectedTransform = 'perspective(400px) translateY(-16px) scale(1.15)';

  return (
    <Box
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      onClick={onClick}
      sx={{ cursor: 'pointer', p: 1, m: -1 }}
    >
      <Box
        sx={{
          transition: (isHovered && !selected) ? 'none' : 'all 0.3s ease-out',
          transform: selected ? selectedTransform : transform,
          filter: selected
            ? `drop-shadow(0 16px 24px rgba(0,0,0,0.5)) drop-shadow(0 0 20px ${glowColor || 'rgba(255,255,255,0.3)'})`
            : isHovered
              ? `drop-shadow(0 8px 16px rgba(0,0,0,0.4))`
              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          pointerEvents: 'none',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// ============================================
// Color themes (simplified to 2)
// ============================================

type ThemeId = 'classic' | 'monochrome';

const themes: { id: ThemeId; name: string }[] = [
  { id: 'classic', name: 'Classic' },
  { id: 'monochrome', name: 'Monochrome' },
];

const monochromeColors: Record<number, string> = {
  4: '#666666',
  6: '#777777',
  8: '#888888',
  10: '#999999',
  12: '#aaaaaa',
  20: '#bbbbbb',
};

// ============================================
// Size options
// ============================================

type SizeId = 'compact' | 'standard' | 'large';

const sizes: { id: SizeId; label: string; size: number }[] = [
  { id: 'compact', label: 'Compact', size: 32 },
  { id: 'standard', label: 'Standard', size: 48 },
  { id: 'large', label: 'Large', size: 64 },
];

// ============================================
// Component
// ============================================

export function BoardAndPiecesSection() {
  // Load settings from storage
  const [settings, setSettings] = useState<BoardSettingsData>(loadBoardSettings);
  const [selectedDice, setSelectedDice] = useState<number | null>(null);

  // Persist on change
  useEffect(() => {
    saveBoardSettings(settings);
  }, [settings]);

  // Destructure for convenience
  const { theme, size, use3D, showRollAnimation, showCritEffects, hapticFeedback } = settings;

  // Update helpers
  const updateSetting = <K extends keyof BoardSettingsData>(key: K, value: BoardSettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Get color based on theme
  const getColor = (sides: number) => {
    return theme === 'classic' ? getDiceColor(sides) : monochromeColors[sides];
  };

  const currentSize = sizes.find(s => s.id === size)?.size || 48;
  const showValue = size !== 'compact';

  return (
    <Box>
      <SectionHeader
        title="Board & Pieces"
        subtitle="Customize the look and feel of your dice"
        sx={{ mb: 3 }}
      />

      {/* Hero Dice Preview */}
      <CardSection sx={{ mb: 3 }}>
        {/* 2D/3D Toggle Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Your Dice Set
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: !use3D ? tokens.colors.text.primary : tokens.colors.text.disabled,
                fontWeight: !use3D ? 600 : 400,
              }}
            >
              2D
            </Typography>
            <Switch
              checked={use3D}
              onChange={() => updateSetting('use3D', !use3D)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: tokens.colors.primary,
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: tokens.colors.primary,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: use3D ? tokens.colors.text.primary : tokens.colors.text.disabled,
                fontWeight: use3D ? 600 : 400,
              }}
            >
              3D
            </Typography>
          </Box>
        </Box>

        {/* Dice Display */}
        <Box
          sx={{
            display: 'flex',
            gap: 2.5,
            justifyContent: 'center',
            flexWrap: 'wrap',
            py: 4,
            px: 2,
            borderRadius: '20px',
            backgroundColor: tokens.colors.background.elevated,
            minHeight: 140,
          }}
        >
          {DICE_CONFIG.map((config) => {
            const color = getColor(config.sides);
            const isSelected = selectedDice === config.sides;

            if (use3D) {
              return (
                <ZdogDice
                  key={config.sides}
                  sides={config.sides}
                  size={currentSize * 1.4}
                  color={color}
                  glowColor={`${color}60`}
                  selected={isSelected}
                  onClick={() => setSelectedDice(isSelected ? null : config.sides)}
                />
              );
            }

            return (
              <BalatroCard
                key={config.sides}
                glowColor={`${color}60`}
                selected={isSelected}
                onClick={() => setSelectedDice(isSelected ? null : config.sides)}
              >
                <DiceShape
                  sides={config.sides}
                  size={currentSize}
                  color={color}
                  value={showValue ? config.sides : undefined}
                  fontFamily={tokens.fonts.gaming}
                  fontScale={0.6}
                />
              </BalatroCard>
            );
          })}
        </Box>

        {/* Size Selector */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={size}
            exclusive
            onChange={(_, val) => val && updateSetting('size', val)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                px: 3,
                py: 0.75,
                border: `1px solid ${tokens.colors.border}`,
                color: tokens.colors.text.secondary,
                textTransform: 'none',
                '&.Mui-selected': {
                  backgroundColor: tokens.colors.background.elevated,
                  color: tokens.colors.text.primary,
                  fontWeight: 600,
                },
                '&:hover': {
                  backgroundColor: tokens.colors.background.elevated,
                },
              },
            }}
          >
            {sizes.map((s) => (
              <ToggleButton key={s.id} value={s.id}>
                {s.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </CardSection>

      {/* Theme Selection */}
      <CardSection sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
          Color Theme
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {themes.map((t) => (
            <Box
              key={t.id}
              onClick={() => updateSetting('theme', t.id)}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: '16px',
                border: `2px solid ${theme === t.id ? tokens.colors.primary : tokens.colors.border}`,
                backgroundColor: theme === t.id ? `${tokens.colors.primary}10` : 'transparent',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: tokens.colors.primary,
                },
              }}
            >
              {/* Mini dice preview */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 1.5 }}>
                {[4, 6, 20].map((sides) => (
                  <Box
                    key={sides}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '3px',
                      backgroundColor: t.id === 'classic' ? getDiceColor(sides) : monochromeColors[sides],
                    }}
                  />
                ))}
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: theme === t.id ? 600 : 400,
                  color: theme === t.id ? tokens.colors.text.primary : tokens.colors.text.secondary,
                }}
              >
                {t.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardSection>

      {/* Dice Effects */}
      <CardSection>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
          Dice Effects
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Roll Animation */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
              borderBottom: `1px solid ${tokens.colors.border}`,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Roll Animation
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                Animate dice when rolling
              </Typography>
            </Box>
            <Switch
              checked={showRollAnimation}
              onChange={() => updateSetting('showRollAnimation', !showRollAnimation)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: tokens.colors.primary },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: tokens.colors.primary },
              }}
            />
          </Box>

          {/* Crit Effects */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
              borderBottom: `1px solid ${tokens.colors.border}`,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Critical Hit Effects
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                Special effects on max rolls
              </Typography>
            </Box>
            <Switch
              checked={showCritEffects}
              onChange={() => updateSetting('showCritEffects', !showCritEffects)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: tokens.colors.primary },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: tokens.colors.primary },
              }}
            />
          </Box>

          {/* Haptic Feedback */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Haptic Feedback
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                Vibration on mobile devices
              </Typography>
            </Box>
            <Switch
              checked={hapticFeedback}
              onChange={() => updateSetting('hapticFeedback', !hapticFeedback)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: tokens.colors.primary },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: tokens.colors.primary },
              }}
            />
          </Box>
        </Box>
      </CardSection>
    </Box>
  );
}
