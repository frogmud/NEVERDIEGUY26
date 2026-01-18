/**
 * DiceBagIcon - Visual indicator for persistent dice collection
 *
 * Shows the dice bag status in the combat UI:
 * - Bag icon with dice count badge
 * - Pulses when dice added/removed
 * - Click to expand and see bag contents
 *
 * NEVER DIE GUY
 */

import { useState, useEffect, useRef } from 'react';
import { Box, Badge, Typography, Collapse, Tooltip } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import { useRun } from '../../../contexts/RunContext';
import { tokens } from '../../../theme';

// Pulse animation for when bag contents change
const pulseGlow = keyframes`
  0% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.1); filter: brightness(1.3); }
  100% { transform: scale(1); filter: brightness(1); }
`;

// Shake animation for empty bag warning
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
`;

interface DiceBagIconProps {
  /** Position within parent (for custom placement) */
  position?: 'fixed' | 'absolute' | 'relative';
  /** Show expanded view by default */
  defaultExpanded?: boolean;
  /** Callback when bag is clicked */
  onClick?: () => void;
}

export function DiceBagIcon({
  position = 'relative',
  defaultExpanded = false,
  onClick,
}: DiceBagIconProps) {
  const { state, getDiceBagSummary } = useRun();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevCountRef = useRef<number | null>(null);

  const summary = getDiceBagSummary();
  const hasBag = !!state.diceBag;

  // Pulse when bag contents change
  useEffect(() => {
    if (!summary) return;

    const currentCount = summary.total;
    if (prevCountRef.current !== null && prevCountRef.current !== currentCount) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 400);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = currentCount;
  }, [summary]);

  const handleClick = () => {
    setExpanded(!expanded);
    onClick?.();
  };

  // No bag yet - show placeholder
  if (!hasBag || !summary) {
    return (
      <Box
        sx={{
          position,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1,
          borderRadius: '8px',
          bgcolor: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          opacity: 0.5,
        }}
      >
        <Typography variant="caption" sx={{ fontFamily: tokens.fonts.mono, color: '#666' }}>
          No dice bag
        </Typography>
      </Box>
    );
  }

  const { inBag, inHand, exhausted, consumed, total } = summary;
  const isEmpty = inBag === 0 && inHand === 0;

  return (
    <Box
      sx={{
        position,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      {/* Main bag icon with badge */}
      <Tooltip title={expanded ? 'Collapse bag' : 'View dice bag'} placement="right">
        <Box
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1,
            borderRadius: '8px',
            bgcolor: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.15)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            animation: isPulsing ? `${pulseGlow} 0.4s ease` : isEmpty ? `${shake} 0.5s ease` : 'none',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.5)',
              borderColor: 'rgba(255,255,255,0.25)',
              transform: 'scale(1.02)',
            },
          }}
        >
          {/* Bag icon (ASCII style) */}
          <Box
            sx={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: tokens.fonts.mono,
              fontSize: '1.5rem',
              color: isEmpty ? '#ff4444' : tokens.colors.primary,
            }}
          >
            {isEmpty ? '[X]' : '[=]'}
          </Box>

          {/* Dice count badge */}
          <Badge
            badgeContent={total}
            color={isEmpty ? 'error' : 'primary'}
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontFamily: tokens.fonts.mono,
                fontSize: '0.7rem',
                fontWeight: 'bold',
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: tokens.fonts.mono,
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              DICE BAG
            </Typography>
          </Badge>
        </Box>
      </Tooltip>

      {/* Expanded view - bag contents breakdown */}
      <Collapse in={expanded}>
        <Box
          sx={{
            mt: 0.5,
            p: 1,
            borderRadius: '8px',
            bgcolor: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* In Bag */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ fontFamily: tokens.fonts.mono, color: '#888' }}
            >
              In Bag:
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: tokens.fonts.mono,
                color: inBag > 0 ? tokens.colors.primary : '#666',
                fontWeight: 'bold',
              }}
            >
              {inBag}
            </Typography>
          </Box>

          {/* In Hand */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ fontFamily: tokens.fonts.mono, color: '#888' }}
            >
              In Hand:
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: tokens.fonts.mono,
                color: inHand > 0 ? '#66bb6a' : '#666',
                fontWeight: 'bold',
              }}
            >
              {inHand}
            </Typography>
          </Box>

          {/* Exhausted (can be recycled) */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography
              variant="caption"
              sx={{ fontFamily: tokens.fonts.mono, color: '#888' }}
            >
              Exhausted:
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: tokens.fonts.mono,
                color: exhausted > 0 ? '#ff9800' : '#666',
                fontWeight: 'bold',
              }}
            >
              {exhausted}
            </Typography>
          </Box>

          {/* Consumed (permanent) */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              variant="caption"
              sx={{ fontFamily: tokens.fonts.mono, color: '#888' }}
            >
              Consumed:
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: tokens.fonts.mono,
                color: consumed > 0 ? '#f44336' : '#666',
                fontWeight: 'bold',
              }}
            >
              {consumed}
            </Typography>
          </Box>

          {/* Visual separator */}
          <Box
            sx={{
              mt: 1,
              pt: 1,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontFamily: tokens.fonts.mono, color: '#aaa' }}
            >
              Active Total:
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: tokens.fonts.mono,
                color: tokens.colors.primary,
                fontWeight: 'bold',
              }}
            >
              {inBag + inHand + exhausted}
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

export default DiceBagIcon;
