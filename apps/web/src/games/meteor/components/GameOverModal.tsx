import { Box, Button, Paper, Typography, keyframes } from '@mui/material';
import { tokens } from '../../../theme';
import { getRandomQuip } from '../../../data/quips';
import { useMemo, useState, useEffect } from 'react';

// Gaming font style
const gamingFont = { fontFamily: tokens.fonts.gaming };

// Slide up animation for modal (fast, starts at 50% opacity)
const slideUp = keyframes`
  from {
    transform: translateY(50%);
    opacity: 0.5;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export interface RunStats {
  // Combat stats
  bestRoll: number;
  mostRolled: string;
  diceRolled: number;
  totalScore: number;
  // Progress stats
  domains: number;
  rooms: number;
  // Economy stats
  purchases: number;
  shopRemixes: number;
  goldEarned: number;
  // Performance stats
  totalTimeMs: number;
  avgEventTimeMs: number;
  fastestEventMs: number;
  // Variant breakdown
  variantCounts: { swift: number; standard: number; grueling: number };
  // Meta
  seed: string;
  killedBy?: string;
  // Legacy (kept for backwards compat)
  reloads?: number;
  discoveries?: number;
}

interface GameOverModalProps {
  open: boolean;
  isWin: boolean;
  stats: RunStats;
  onNewRun: () => void;
  onMainMenu: () => void;
  onClose?: () => void; // Optional: close when clicking outside the modal
  /** If true, renders within parent container instead of fixed fullscreen */
  contained?: boolean;
}

export function GameOverModal({
  open,
  isWin,
  stats,
  onNewRun,
  onMainMenu,
  onClose,
  contained = false,
}: GameOverModalProps) {
  // Get a random quip (memoized so it doesn't change on re-renders)
  const quip = useMemo(() => getRandomQuip(isWin), [isWin]);

  // Staged animation state
  const [stage, setStage] = useState(0);
  // 0 = nothing, 1 = modal visible, 2 = confetti, 3 = skull, 4 = speech bubble, 5 = typing

  // Typewriter effect for the quip
  const [displayedQuip, setDisplayedQuip] = useState('...');

  // Staged animation sequence
  useEffect(() => {
    if (!open) {
      setStage(0);
      setDisplayedQuip('...');
      return;
    }

    // Stage 1: Modal slides up (immediate)
    setStage(1);

    // Stage 2: Confetti behind skull (300ms)
    const t2 = setTimeout(() => setStage(2), 300);

    // Stage 3: Skull + speech bubble appear together (600ms)
    const t3 = setTimeout(() => setStage(3), 600);

    // Stage 4: Start typing (900ms)
    const t4 = setTimeout(() => {
      setStage(4);
      let index = 0;
      const timer = setInterval(() => {
        if (index < quip.length) {
          setDisplayedQuip(quip.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 40);
    }, 900);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [open, quip]);

  if (!open) return null;

  // Use theme-aligned colors (more muted)
  const bgColor = isWin ? 'rgba(48, 209, 88, 0.25)' : 'rgba(233, 4, 65, 0.25)';
  const accentColor = isWin ? tokens.colors.success : tokens.colors.primary;

  return (
    <Box
      onClick={onClose}
      sx={{
        position: contained ? 'absolute' : 'fixed',
        inset: 0,
        // When contained, parent handles the overlay; otherwise use our own
        bgcolor: contained ? 'transparent' : bgColor,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        zIndex: contained ? 100 : 1300,
        p: 3,
        cursor: onClose ? 'pointer' : 'default',
        overflow: 'auto',
      }}
    >
      {/* Stats Modal Card - left side */}
      <Paper
        onClick={(e) => e.stopPropagation()}
        sx={{
          bgcolor: tokens.colors.background.paper,
          border: `2px solid ${tokens.colors.border}`,
          borderRadius: 3,
          p: 0,
          width: 380,
          flexShrink: 0,
          overflow: 'hidden',
          animation: `${slideUp} 0.25s ease-out forwards`,
          cursor: 'default',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography
            variant="h3"
            sx={{
              ...gamingFont,
              fontSize: '2.5rem',
              color: accentColor,
              textAlign: 'center',
              textShadow: `0 0 20px ${accentColor}40`,
            }}
          >
            {isWin ? 'VICTORY' : 'YOU DIED'}
          </Typography>
        </Box>

        {/* Stats Grid - Organized by Category */}
        <Box sx={{ px: 3, pb: 2 }}>
          {/* Combat Section */}
          <Typography sx={{ ...gamingFont, fontSize: '0.7rem', color: tokens.colors.text.disabled, mb: 0.75, letterSpacing: '0.1em' }}>
            COMBAT
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
            <StatBox label="Total Score" value={stats.totalScore.toLocaleString()} color={tokens.colors.primary} />
            <StatBox label="Best Roll" value={stats.bestRoll.toLocaleString()} color="#C4A000" />
            <StatBox label="Dice Rolled" value={stats.diceRolled.toString()} color={tokens.colors.secondary} />
            <StatBox label="Most Rolled" value={stats.mostRolled} />
          </Box>

          {/* Progress Section */}
          <Typography sx={{ ...gamingFont, fontSize: '0.7rem', color: tokens.colors.text.disabled, mb: 0.75, letterSpacing: '0.1em' }}>
            PROGRESS
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
            <StatBox label="Domains" value={`${stats.domains}/6`} />
            <StatBox label="Events" value={stats.rooms.toString()} />
          </Box>

          {/* Difficulty Breakdown - Visual Pills */}
          {stats.variantCounts && (stats.variantCounts.swift + stats.variantCounts.standard + stats.variantCounts.grueling > 0) && (
            <Box sx={{ display: 'flex', gap: 0.75, mb: 2 }}>
              {stats.variantCounts.swift > 0 && (
                <Box sx={{ bgcolor: '#22c55e20', border: '1px solid #22c55e', borderRadius: 1, px: 1.5, py: 0.5 }}>
                  <Typography sx={{ ...gamingFont, fontSize: '0.75rem', color: '#22c55e' }}>
                    Swift x{stats.variantCounts.swift}
                  </Typography>
                </Box>
              )}
              {stats.variantCounts.standard > 0 && (
                <Box sx={{ bgcolor: '#f59e0b20', border: '1px solid #f59e0b', borderRadius: 1, px: 1.5, py: 0.5 }}>
                  <Typography sx={{ ...gamingFont, fontSize: '0.75rem', color: '#f59e0b' }}>
                    Std x{stats.variantCounts.standard}
                  </Typography>
                </Box>
              )}
              {stats.variantCounts.grueling > 0 && (
                <Box sx={{ bgcolor: '#ef444420', border: '1px solid #ef4444', borderRadius: 1, px: 1.5, py: 0.5 }}>
                  <Typography sx={{ ...gamingFont, fontSize: '0.75rem', color: '#ef4444' }}>
                    Hard x{stats.variantCounts.grueling}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Performance Section */}
          <Typography sx={{ ...gamingFont, fontSize: '0.7rem', color: tokens.colors.text.disabled, mb: 0.75, letterSpacing: '0.1em' }}>
            PERFORMANCE
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
            <StatBox label="Run Time" value={formatTime(stats.totalTimeMs)} />
            <StatBox label="Avg Event" value={formatTime(stats.avgEventTimeMs)} />
            <StatBox label="Fastest" value={formatTime(stats.fastestEventMs)} color="#22c55e" />
            <StatBox label="Gold Earned" value={`$${stats.goldEarned.toLocaleString()}`} color="#C4A000" />
          </Box>

          {/* Economy Section */}
          <Typography sx={{ ...gamingFont, fontSize: '0.7rem', color: tokens.colors.text.disabled, mb: 0.75, letterSpacing: '0.1em' }}>
            ECONOMY
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
            <StatBox label="Purchases" value={stats.purchases.toString()} color="#C4A000" />
            <StatBox label="Shop Remixes" value={stats.shopRemixes.toString()} />
          </Box>

          {/* Death info */}
          {!isWin && stats.killedBy && (
            <Box sx={{ mb: 2 }}>
              <StatBox label="Killed By" value={stats.killedBy} fullWidth />
            </Box>
          )}

          {/* Seed */}
          <Box
            sx={{
              p: 1.5,
              bgcolor: tokens.colors.background.elevated,
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ ...gamingFont, fontSize: '0.875rem', color: tokens.colors.text.secondary }}>
              Seed
            </Typography>
            <Typography sx={{ ...gamingFont, fontSize: '1rem', color: tokens.colors.text.primary }}>
              {stats.seed}
            </Typography>
          </Box>
        </Box>

        {/* Buttons */}
        <Box sx={{ p: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={onNewRun}
            sx={{
              bgcolor: accentColor,
              color: '#fff',
              ...gamingFont,
              fontSize: '1.25rem',
              py: 1.5,
              '&:hover': { bgcolor: isWin ? '#28a745' : '#b8033a' },
            }}
          >
            New Run
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={onMainMenu}
            sx={{
              bgcolor: accentColor,
              color: '#fff',
              ...gamingFont,
              fontSize: '1.25rem',
              py: 1.5,
              '&:hover': { bgcolor: isWin ? '#28a745' : '#b8033a' },
            }}
          >
            Main Menu
          </Button>
        </Box>
      </Paper>

      {/* Skull + Speech Bubble - right side, vertically centered */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'relative',
          width: 280,
          height: 240,
          flexShrink: 0,
          cursor: 'default',
        }}
      >
        {/* Speech Bubble - stage 3, positioned above skull */}
        <Paper
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: '#fff',
            color: '#000',
            p: 2,
            borderRadius: 2,
            width: 260,
            minHeight: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: stage >= 3 ? 1 : 0,
            zIndex: 2,
          }}
        >
          <Typography
            sx={{
              ...gamingFont,
              fontSize: '1.05rem',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {displayedQuip}
          </Typography>
        </Paper>

        {/* Skull - stage 3, positioned below speech bubble */}
        <Box
          component="img"
          src="/logos/ndg-skull-dome.svg"
          alt="Never Die Guy Skull"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 140,
            height: 140,
            opacity: stage >= 3 ? 1 : 0,
            zIndex: 1,
          }}
        />
      </Box>
    </Box>
  );
}

// Helper to format milliseconds as readable time
function formatTime(ms: number): string {
  if (!ms || ms <= 0) return '-';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper component for stat boxes
function StatBox({
  label,
  value,
  color,
  fullWidth,
}: {
  label: string;
  value: string;
  color?: string;
  fullWidth?: boolean;
}) {
  return (
    <Box
      sx={{
        bgcolor: tokens.colors.background.elevated,
        borderRadius: 1,
        p: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...(fullWidth && { gridColumn: '1 / -1' }),
      }}
    >
      <Typography sx={{ ...gamingFont, fontSize: '0.8rem', color: tokens.colors.text.secondary }}>
        {label}
      </Typography>
      <Typography sx={{ ...gamingFont, fontSize: '1rem', color: color || tokens.colors.text.primary }}>
        {value}
      </Typography>
    </Box>
  );
}
