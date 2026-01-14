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

import { Box, Typography, Button } from '@mui/material';
import { tokens } from '../../../../theme';
import { TokenIcon } from '../../../../components/TokenIcon';

interface RollHistoryEntry {
  id: number;
  dice: string; // e.g., "d4 + d6 + d8"
  values: string; // e.g., "[1] + [2] + [5]"
  hits?: number;
  bonus?: string; // e.g., "+500" or "+1.36x"
}

/** Feed entry types for sidebar history */
type FeedEntryType = 'npc_chat' | 'roll' | 'trade';

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
}: GameTabPlayingProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Score To Beat - clean centered layout */}
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

      {/* Combat Feed - NPC Chat, Rolls, Trades (most recent at top, persists) */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}
      >
        {combatFeed.length === 0 ? (
          <Box sx={{ p: 2, color: tokens.colors.text.disabled, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '0.95rem' }}>No rolls yet</Typography>
          </Box>
        ) : (
          combatFeed.map((entry) => (
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
              bgcolor: '#3366FF',
              py: 1,
              px: 2,
              borderRadius: 50,
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                color: '#fff',
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
                color: '#fff',
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
              color: '#3366FF',
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
            color: '#000',
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.85rem',
            minWidth: 80,
            '&:hover': { bgcolor: '#d4b000' },
          }}
        >
          Pause
        </Button>
      </Box>

      {/* Gold */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: `1px solid ${tokens.colors.border}`,
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.25rem',
              color: tokens.colors.warning,
            }}
          >
            ${gold.toLocaleString()}
          </Typography>
        </Box>
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
            color: '#fff',
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.85rem',
            minWidth: 80,
            '&:hover': { bgcolor: '#c0033a' },
          }}
        >
          Info
        </Button>
      </Box>
    </Box>
  );
}
