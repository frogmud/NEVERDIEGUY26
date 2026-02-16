/**
 * GameTabPlaying - In-game sidebar content
 *
 * Displays during active gameplay:
 * - Enemy sprite with score to beat
 * - Roll history
 * - Score/multiplier display
 * - Throws/Trades counters
 * - Domain/Event progress
 */

import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { tokens } from '../../../../theme';
import { TokenIcon } from '../../../../components/TokenIcon';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface RollHistoryEntry {
  id: number;
  dice: string; // e.g., "d4 + d6 + d8"
  values: string; // e.g., "[1] + [2] + [5]"
  hits?: number;
  bonus?: string; // e.g., "+500" or "+1.36x"
}

/** Feed entry types for sidebar history */
type FeedEntryType = 'npc_chat' | 'roll' | 'trade' | 'victory' | 'defeat';

interface FeedEntry {
  id: string;
  type: FeedEntryType;
  timestamp: number;
  // NPC chat fields
  npcSlug?: string;
  npcName?: string;
  text?: string;
  mood?: string;
  // Roll fields
  rollNotation?: string;
  rollTotal?: number;
  // Trade fields
  diceTraded?: number;
  multiplierGained?: number;
  // Victory/Defeat fields
  finalScore?: number;
  domains?: number;
}

// NPC colors by slug (Die-rectors have domain colors)
const NPC_COLORS: Record<string, string> = {
  'the-one': '#7c4dff',
  john: '#8d6e63',
  peter: '#9e9e9e',
  robert: '#ff5722',
  alice: '#00bcd4',
  jane: '#e91e63',
  willy: '#ffc107',
  'mr-bones': '#607d8b',
};

const getNpcColor = (slug: string): string => NPC_COLORS[slug] || tokens.colors.text.secondary;

interface GameTabPlayingProps {
  // Enemy/Goal
  enemySprite?: string;
  scoreToBeat: number;
  hideScoreToBeat?: boolean; // Hide during shop phase

  // Current score
  score: number;
  multiplier: number;
  goal: number;

  // Resources
  throws: number;
  trades: number;
  gold: number;

  // Progress
  domain: number;
  totalDomains: number;
  event: number;
  totalEvents: number;

  // Heat (streak-based difficulty)
  heat?: number;

  // Run timing
  runStartTime?: number;
  runEnded?: boolean;

  // Roll history
  rollHistory: RollHistoryEntry[];

  // Callbacks
  onOptions?: () => void;
  onInfo?: () => void;

  // Combat feed history
  combatFeed?: FeedEntry[];
}

export function GameTabPlaying({
  enemySprite = '/assets/enemies/shadow-knight.png',
  scoreToBeat = 0,
  hideScoreToBeat = false,
  score = 0,
  multiplier = 1,
  goal = 0,
  throws = 3,
  trades = 3,
  gold = 0,
  domain = 1,
  totalDomains = 6,
  event = 1,
  totalEvents = 3,
  rollHistory = [],
  onOptions,
  onInfo,
  combatFeed = [],
  heat = 0,
  runStartTime = 0,
  runEnded = false,
}: GameTabPlayingProps) {
  // Live timer update (freezes when run ends)
  const [elapsedTime, setElapsedTime] = useState('0:00');
  const frozenTimeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!runStartTime || runStartTime === 0) {
      setElapsedTime('0:00');
      return;
    }

    if (runEnded) {
      // Freeze: compute final time once and stop updating
      if (!frozenTimeRef.current) {
        const elapsed = Date.now() - runStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        frozenTimeRef.current = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
      setElapsedTime(frozenTimeRef.current);
      return;
    }

    frozenTimeRef.current = null;

    const updateTimer = () => {
      const elapsed = Date.now() - runStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [runStartTime, runEnded]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Score To Beat - clean centered layout (hidden during shop) */}
      {!hideScoreToBeat && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${tokens.colors.border}`,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '0.875rem',
              color: tokens.colors.text.secondary,
              mb: 0.5,
            }}
          >
            Score to Beat
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TokenIcon size={32} />
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '2rem',
                color: tokens.colors.primary,
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              {scoreToBeat.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Combat Feed - Rolls, Trades (most recent at top, persists) */}
      {/* NPC Chat filtered out - only shown in Homepage Eternal Stream */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}
      >
        {combatFeed.filter(e => e.type !== 'npc_chat').length === 0 ? (
          <Box sx={{ p: 2, color: tokens.colors.text.disabled, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.95rem' }}>No rolls yet</Typography>
          </Box>
        ) : (
          combatFeed.filter(e => e.type !== 'npc_chat').map((entry) => (
            <Box
              key={entry.id}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${tokens.colors.border}`,
              }}
            >
              {/* NPC Chat Entry */}
              {entry.type === 'npc_chat' && (
                <>
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: getNpcColor(entry.npcSlug || ''),
                      fontWeight: 700,
                      mb: 0.25,
                    }}
                  >
                    {entry.npcName}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      color: tokens.colors.text.primary,
                      lineHeight: 1.4,
                    }}
                  >
                    {entry.text}
                  </Typography>
                </>
              )}

              {/* Roll Entry */}
              {entry.type === 'roll' && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '1rem',
                      color: tokens.colors.primary,
                    }}
                  >
                    {entry.rollNotation}
                  </Typography>
                </Box>
              )}

              {/* Trade Entry */}
              {entry.type === 'trade' && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '0.9rem',
                      color: tokens.colors.warning,
                    }}
                  >
                    Traded {entry.diceTraded} dice for x{entry.multiplierGained} mult
                  </Typography>
                </Box>
              )}

              {/* Victory Entry */}
              {entry.type === 'victory' && (
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '1.2rem',
                      color: tokens.colors.success,
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    VICTORY
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      color: tokens.colors.text.secondary,
                    }}
                  >
                    {entry.domains}/6 Domains - {entry.finalScore?.toLocaleString()} pts
                  </Typography>
                </Box>
              )}

              {/* Defeat Entry */}
              {entry.type === 'defeat' && (
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '1.2rem',
                      color: tokens.colors.primary,
                      fontWeight: 700,
                      mb: 0.5,
                    }}
                  >
                    YOU DIED
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      color: tokens.colors.text.secondary,
                    }}
                  >
                    {entry.domains}/6 Domains - {entry.finalScore?.toLocaleString()} pts
                  </Typography>
                </Box>
              )}
            </Box>
          ))
        )}
      </Box>

      {/* Current Score Display - matches GameSidebar style */}
      <Box
        sx={{
          p: 1.5,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1rem' }}>Score</Typography>
          <Box
            sx={{
              flex: 1,
              bgcolor: tokens.colors.background.elevated,
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <TokenIcon size={24} />
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontWeight: 700,
                fontSize: '1.375rem',
                letterSpacing: '0.05em',
              }}
            >
              {score.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Run Timer - visible and prominent */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1rem' }}>Time</Typography>
          <Box
            sx={{
              flex: 1,
              bgcolor: tokens.colors.background.elevated,
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 24, color: tokens.colors.text.secondary }} />
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontWeight: 700,
                fontSize: '1.375rem',
                letterSpacing: '0.05em',
                color: runStartTime > 0 ? tokens.colors.text.primary : tokens.colors.text.disabled,
              }}
            >
              {elapsedTime}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Full-width Divider */}
      <Box sx={{ borderTop: `1px solid ${tokens.colors.border}` }} />

      {/* Multiplier Row: [blue] X [red] - pill style */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: `1px solid ${tokens.colors.border}`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Box
            sx={{
              flex: 1,
              bgcolor: tokens.colors.secondary,
              py: 1,
              px: 2,
              borderRadius: 50,
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                color: tokens.colors.background.default,
                fontWeight: 700,
                fontSize: '1.375rem',
              }}
            >
              {multiplier}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.875rem',
              color: tokens.colors.primary,
              fontWeight: 700,
            }}
          >
            X
          </Typography>
          <Box
            sx={{
              flex: 1,
              bgcolor: tokens.colors.primary,
              py: 1,
              px: 2,
              borderRadius: 50,
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                color: tokens.colors.text.primary,
                fontWeight: 700,
                fontSize: '1.375rem',
              }}
            >
              {goal}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Throws / Trades / Options */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          p: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
          flexShrink: 0,
        }}
      >
        {/* Throws */}
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${tokens.colors.border}`,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary, mb: 0.5 }}>
            Throws
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.25rem',
              color: tokens.colors.secondary,
            }}
          >
            {throws}
          </Typography>
        </Box>

        {/* Trades */}
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${tokens.colors.border}`,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary, mb: 0.5 }}>
            Trades
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.25rem',
              color: tokens.colors.primary,
            }}
          >
            {trades}
          </Typography>
        </Box>

        {/* Pause */}
        <Button
          variant="contained"
          onClick={onOptions}
          sx={{
            bgcolor: tokens.colors.warning,
            color: tokens.colors.background.default,
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.85rem',
            minWidth: 80,
            '&:hover': { filter: 'brightness(0.9)' },
          }}
        >
          Pause
        </Button>
      </Box>

      {/* Gold & Heat */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
          flexShrink: 0,
          display: 'flex',
          gap: 1,
        }}
      >
        {/* Gold */}
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${tokens.colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
          }}
        >
          <Box component="img" src="/assets/ui/currency-svg/coin.svg" alt="" sx={{ width: 20, height: 20 }} />
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.25rem',
              color: tokens.colors.warning,
            }}
          >
            {gold.toLocaleString()}
          </Typography>
        </Box>

        {/* Heat (only show when active) */}
        {heat > 0 && (
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${tokens.colors.primary}`,
              bgcolor: 'rgba(255, 59, 63, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
            }}
          >
            <Box
              component="img"
              src="/icons/fire.svg"
              alt=""
              sx={{
                width: 20,
                height: 20,
                imageRendering: 'pixelated',
              }}
            />
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '1.125rem',
                color: tokens.colors.primary,
              }}
            >
              Heat {heat}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Domain / Event / Info */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          p: 2,
          flexShrink: 0,
        }}
      >
        {/* Domain */}
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${tokens.colors.border}`,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary, mb: 0.5 }}>
            Domain
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1rem',
              color: tokens.colors.text.primary,
            }}
          >
            {domain}/{totalDomains}
          </Typography>
        </Box>

        {/* Event */}
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${tokens.colors.border}`,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary, mb: 0.5 }}>
            Event
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1rem',
              color: tokens.colors.text.primary,
            }}
          >
            {event}/{totalEvents}
          </Typography>
        </Box>

        {/* Info */}
        <Button
          variant="contained"
          onClick={onInfo}
          sx={{
            bgcolor: tokens.colors.primary,
            color: tokens.colors.text.primary,
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.85rem',
            minWidth: 80,
            '&:hover': { filter: 'brightness(1.1)' },
          }}
        >
          Info
        </Button>
      </Box>
    </Box>
  );
}
