/**
 * ActionButtons - Primary action buttons with Boo-G Shop hero banner
 *
 * Shows Continue, New Game, Review buttons on the left,
 * and single Boo-G Shop hero banner on the right.
 * Banner is 60% opacity by default, becomes fully opaque on hover
 * and autoplays animation once. Links to /shop/barter (market).
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
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
];

// Single hero banner: Boo-G Shop only (links to barter market)
const HERO_BANNER = {
  id: 'shop',
  frameCount: 9,
  basePath: '/assets/meta-ads/shop/frame-',
  alt: "B's Hits - Boo G Shop",
  link: '/shop',
};

// Generate frame path with zero-padded index
const getFramePath = (basePath: string, frameIndex: number) => {
  const paddedIndex = String(frameIndex + 1).padStart(2, '0');
  return `${basePath}${paddedIndex}.png`;
};

export function ActionButtons() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('continue');
  const [frameIndex, setFrameIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  // Autoplay once on hover
  useEffect(() => {
    if (!isHovered || hasPlayedOnce) return;

    const interval = setInterval(() => {
      setFrameIndex((prev) => {
        const next = prev + 1;
        if (next >= HERO_BANNER.frameCount) {
          setHasPlayedOnce(true);
          clearInterval(interval);
          return HERO_BANNER.frameCount - 1; // Stay on last frame
        }
        return next;
      });
    }, 350); // Slower animation for single playthrough

    return () => clearInterval(interval);
  }, [isHovered, hasPlayedOnce]);

  // Reset animation when hover ends
  const handleMouseLeave = () => {
    setIsHovered(false);
    setFrameIndex(0);
    setHasPlayedOnce(false);
  };

  const handleBannerClick = () => {
    navigate(HERO_BANNER.link);
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
            onClick={() => {
              setSelected(btn.id);
              // Navigate to play - PlayHub handles continue vs new run logic
              navigate('/play');
            }}
          />
        ))}
      </Box>

      {/* Single Hero Banner - Boo-G Shop */}
      <HeroBanner
        frameIndex={frameIndex}
        isHovered={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleBannerClick}
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

/** Hero Banner - Single Boo-G shop ad with 60% opacity, hover to activate */
function HeroBanner({
  frameIndex,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  frameIndex: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}) {
  const currentFramePath = getFramePath(HERO_BANNER.basePath, frameIndex);

  return (
    <Tooltip title="Visit the market for B's Hits" arrow placement="bottom">
      <Paper
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        sx={{
          flex: 1,
          minWidth: 0,
          bgcolor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: '30px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          // 60% opacity default, full opacity on hover
          opacity: isHovered ? 1 : 0.6,
          transition: 'opacity 0.3s ease-in-out',
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
        }}>
          {/* Hero frame */}
          <Box
            component="img"
            src={currentFramePath}
            alt={HERO_BANNER.alt}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              inset: 0,
            }}
          />
        </Box>
      </Paper>
    </Tooltip>
  );
}
