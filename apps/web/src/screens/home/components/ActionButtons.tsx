/**
 * ActionButtons - Primary action buttons with animated meta ad carousel
 *
 * Shows Continue, New Game, Review buttons on the left,
 * and animated meta ad banners on the right.
 * Each ad animates through its frames; user manually switches between ads.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import {
  ChevronRightSharp as ChevronRightIcon,
  PauseSharp as PauseIcon,
  PlayArrowSharp as PlayIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { AssetImage } from '../../../components/ds';

interface ActionButton {
  id: string;
  label: string;
  subtitle: string | null;
  icon: string;
}

const ACTION_BUTTONS: ActionButton[] = [
  { id: 'continue', label: 'Continue', subtitle: 'Domain 2 of 6', icon: '/illustrations/continue.svg' },
  { id: 'new', label: 'New Game', subtitle: null, icon: '/illustrations/newgame.svg' },
  { id: 'review', label: 'Review', subtitle: 'Learn from mistakes', icon: '/illustrations/review.svg' },
];

// Meta ads with frame animations (Boo G shop first as most important)
const META_ADS = [
  { id: 'shop', frameCount: 9, basePath: '/assets/meta-ads/shop/frame-', alt: "B's Hits - Boo G Shop", link: '/shop' },
  { id: 'play', frameCount: 13, basePath: '/assets/meta-ads/play/frame-', alt: 'Play Never Die Guy', link: '/play' },
  { id: 'wiki', frameCount: 1, basePath: '/assets/meta-ads/wiki/frame-', alt: 'Explore the Diepedia', link: '/wiki' },
];

// Generate frame path with zero-padded index
const getFramePath = (basePath: string, frameIndex: number) => {
  const paddedIndex = String(frameIndex + 1).padStart(2, '0');
  return `${basePath}${paddedIndex}.png`;
};

export function ActionButtons() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('continue');
  const [adIndex, setAdIndex] = useState(() => Math.floor(Math.random() * META_ADS.length));
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  const currentAd = META_ADS[adIndex];

  // Auto-animate frames within current ad (1200ms per frame)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % currentAd.frameCount);
    }, 1200);
    return () => clearInterval(interval);
  }, [currentAd.frameCount, isPaused]);

  // Reset to frame 1 when switching ads
  const handleAdChange = (newIndex: number) => {
    setAdIndex(newIndex);
    setFrameIndex(0);
  };

  const handleAdClick = () => {
    if (currentAd.link) {
      navigate(currentAd.link);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'stretch' }}>
      {/* Action buttons - vertical stack */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
        {ACTION_BUTTONS.map((btn) => (
          <ActionButtonCard
            key={btn.id}
            button={btn}
            isSelected={selected === btn.id}
            onClick={() => setSelected(btn.id)}
          />
        ))}
      </Box>

      {/* Animated Meta Ad - manual navigation between ads */}
      <AnimatedMetaAd
        ad={currentAd}
        frameIndex={frameIndex}
        adIndex={adIndex}
        totalAds={META_ADS.length}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onPrev={() => handleAdChange((adIndex - 1 + META_ADS.length) % META_ADS.length)}
        onNext={() => handleAdChange((adIndex + 1) % META_ADS.length)}
        onClick={handleAdClick}
      />
    </Box>
  );
}

/** Individual action button card */
function ActionButtonCard({
  button,
  isSelected,
  onClick,
}: {
  button: ActionButton;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isContinue = button.id === 'continue';

  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 3.5,
        py: 2,
        bgcolor: isSelected ? tokens.colors.background.elevated : tokens.colors.background.paper,
        border: isSelected
          ? `1px solid ${isContinue ? tokens.colors.primary : tokens.colors.text.disabled}`
          : 'none',
        borderRadius: '30px',
        cursor: 'pointer',
        minWidth: 280,
        boxShadow: '0px 3px 1px 0px rgba(0,0,0,0.5)',
        '&:hover': {
          bgcolor: isContinue ? `${tokens.colors.primary}20` : tokens.colors.background.elevated,
          borderColor: isContinue ? tokens.colors.primary : undefined,
        },
      }}
    >
      <AssetImage
        src={button.icon}
        alt={button.label}
        width={44}
        height={44}
        fallback="hide"
        sx={{ flexShrink: 0 }}
      />
      <Box>
        <Typography sx={{
          fontFamily: tokens.fonts.gaming,
          fontSize: '1.55rem',
          textShadow: '0px 1px 1px rgba(0,0,0,0.5)',
          lineHeight: 1.2,
        }}>
          {button.label}
        </Typography>
        {button.subtitle && (
          <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem' }}>
            {button.subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

/** Animated Meta Ad with frame-by-frame animation and manual ad switching */
function AnimatedMetaAd({
  ad,
  frameIndex,
  adIndex,
  totalAds,
  isPaused,
  onTogglePause,
  onPrev,
  onNext,
  onClick,
}: {
  ad: { id: string; frameCount: number; basePath: string; alt: string; link: string };
  frameIndex: number;
  adIndex: number;
  totalAds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onClick: () => void;
}) {
  const currentFramePath = getFramePath(ad.basePath, frameIndex);

  return (
    <Paper
      sx={{
        flex: 1,
        minWidth: 0,
        bgcolor: tokens.colors.background.paper,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: '30px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{
        flex: 1,
        bgcolor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: 180,
        cursor: 'pointer',
      }}>
        {/* Animated frame - clickable */}
        <Box
          component="img"
          src={currentFramePath}
          alt={ad.alt}
          onClick={onClick}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            inset: 0,
          }}
        />
        {/* Pause/Play button - top right */}
        <IconButton
          onClick={(e) => { e.stopPropagation(); onTogglePause(); }}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 16,
            color: tokens.colors.text.primary,
            '&:hover': { bgcolor: 'rgba(0,0,0,0.3)' },
          }}
        >
          {isPaused ? <PlayIcon sx={{ fontSize: 18 }} /> : <PauseIcon sx={{ fontSize: 18 }} />}
        </IconButton>
        {/* Navigation arrows */}
        <IconButton
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          size="small"
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: tokens.colors.text.primary,
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 20, transform: 'rotate(180deg)' }} />
        </IconButton>
        <IconButton
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          size="small"
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: tokens.colors.text.primary,
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
    </Paper>
  );
}
