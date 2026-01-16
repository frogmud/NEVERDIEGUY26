/**
 * BossHeartsHUD - Hearts-based HP display for boss encounters
 *
 * Displays boss name, title, and hearts that deplete as damage is dealt.
 * Hearts fill from right to left and empty left to right as HP decreases.
 *
 * Math:
 * - totalHp = maxHearts * hpPerHeart
 * - currentHp = totalHp - currentScore
 * - currentHearts = ceil(currentHp / hpPerHeart)
 * - hpInCurrentHeart = (currentHp % hpPerHeart) / hpPerHeart
 */

import { Box, Typography, keyframes } from '@mui/material';
import { FavoriteSharp as HeartIcon } from '@mui/icons-material';
import { tokens } from '../../../theme';
import type { BossDefinition } from '../../../data/boss-types';

// Pulse animation for the current heart being damaged
const pulseHeart = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
`;

// Shake animation when damage is dealt
const shakeHud = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
`;

interface BossHeartsHUDProps {
  boss: BossDefinition;
  currentScore: number;
  isHit?: boolean; // Triggers shake animation
}

export function BossHeartsHUD({ boss, currentScore, isHit = false }: BossHeartsHUDProps) {
  // Calculate hearts state
  const totalHp = boss.maxHearts * boss.hpPerHeart;
  const currentHp = Math.max(0, totalHp - currentScore);
  const currentHearts = Math.ceil(currentHp / boss.hpPerHeart);

  // HP remaining in the current (depleting) heart as percentage 0-1
  // When currentHp is exactly divisible, the heart is full (1.0)
  const hpInCurrentHeart = currentHearts > 0
    ? ((currentHp % boss.hpPerHeart) || boss.hpPerHeart) / boss.hpPerHeart
    : 0;

  // Get damage dealt for display
  const damagePercent = Math.min(100, Math.round((currentScore / totalHp) * 100));

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 100,
        animation: isHit ? `${shakeHud} 0.15s ease-out` : undefined,
      }}
    >
      {/* Boss name and title */}
      <Typography
        sx={{
          fontFamily: tokens.fonts.gaming,
          fontSize: '1.5rem',
          fontWeight: 700,
          color: boss.tint || tokens.colors.error,
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          letterSpacing: '0.05em',
        }}
      >
        {boss.name}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: tokens.colors.text.secondary,
          textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          mb: 1,
        }}
      >
        {boss.title}
      </Typography>

      {/* Hearts row */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          justifyContent: 'center',
          px: 2,
          py: 1,
          bgcolor: 'rgba(0,0,0,0.6)',
          borderRadius: '12px',
          border: `1px solid ${boss.tint || tokens.colors.error}40`,
        }}
      >
        {Array.from({ length: boss.maxHearts }).map((_, i) => {
          const heartIndex = i; // 0-indexed, left to right
          const isFull = heartIndex < currentHearts - 1;
          const isPartial = heartIndex === currentHearts - 1;
          const isEmpty = heartIndex >= currentHearts;

          const fillAmount = isFull ? 1 : isPartial ? hpInCurrentHeart : 0;

          return (
            <Heart
              key={i}
              filled={fillAmount}
              animate={isPartial}
              tint={boss.tint}
              size={28}
            />
          );
        })}
      </Box>

      {/* HP percentage (debug-style, subtle) */}
      <Typography
        sx={{
          fontSize: '0.65rem',
          color: tokens.colors.text.disabled,
          mt: 0.5,
        }}
      >
        {damagePercent}% damage
      </Typography>
    </Box>
  );
}

interface HeartProps {
  filled: number; // 0 = empty, 0.5 = half, 1 = full
  animate?: boolean;
  tint?: string;
  size?: number;
}

function Heart({ filled, animate = false, tint = '#ef4444', size = 28 }: HeartProps) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        animation: animate ? `${pulseHeart} 0.6s ease-in-out infinite` : undefined,
      }}
    >
      {/* Empty heart background */}
      <HeartIcon
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          color: '#333',
          fontSize: size,
        }}
      />

      {/* Filled portion (clipped from bottom up) */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'hidden',
          width: '100%',
          height: `${filled * 100}%`,
        }}
      >
        <HeartIcon
          sx={{
            color: tint,
            fontSize: size,
            filter: filled < 0.3 ? 'brightness(0.7)' : undefined,
          }}
        />
      </Box>

      {/* Glow effect for full hearts */}
      {filled === 1 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${tint}20 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
      )}
    </Box>
  );
}

export default BossHeartsHUD;
