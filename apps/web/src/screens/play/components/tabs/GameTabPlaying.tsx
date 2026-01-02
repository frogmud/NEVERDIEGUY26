/**
 * GameTabPlaying - In-game sidebar content
 *
 * Displays during active gameplay:
 * - Enemy sprite with score to beat
 * - Roll history
 * - Score/multiplier display
 * - Summons/Tributes counters
 * - Domain/Event progress
 */

import { Box, Typography, ButtonBase, Button } from '@mui/material';
import { tokens } from '../../../../theme';

interface RollHistoryEntry {
  id: number;
  dice: string; // e.g., "d4 + d6 + d8"
  values: string; // e.g., "[1] + [2] + [5]"
  hits?: number;
  bonus?: string; // e.g., "+500" or "+1.36x"
}

interface GameTabPlayingProps {
  // Enemy/Goal
  enemySprite?: string;
  scoreToBeat: number;

  // Current score
  score: number;
  multiplier: number;
  goal: number;

  // Resources
  summons: number;
  tributes: number;
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
}

export function GameTabPlaying({
  enemySprite = '/assets/enemies/shadow-knight.png',
  scoreToBeat = 0,
  score = 0,
  multiplier = 1,
  goal = 0,
  summons = 3,
  tributes = 3,
  gold = 0,
  domain = 1,
  totalDomains = 6,
  event = 1,
  totalEvents = 3,
  rollHistory = [],
  onOptions,
  onInfo,
}: GameTabPlayingProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Enemy + Score To Beat */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}
      >
        {/* Enemy Sprite */}
        <Box
          sx={{
            width: 64,
            height: 64,
            bgcolor: tokens.colors.background.elevated,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={enemySprite}
            alt="Enemy"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              imageRendering: 'pixelated',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </Box>

        {/* Score To Beat */}
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1rem',
              color: tokens.colors.text.primary,
              mb: 0.5,
            }}
          >
            Score To Beat
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src="/assets/ui/icons/skull-score.png"
              alt=""
              sx={{ width: 20, height: 20 }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <Typography
              sx={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '1.25rem',
                color: tokens.colors.error,
                letterSpacing: '0.1em',
              }}
            >
              {String(scoreToBeat).padStart(5, '0')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Roll History */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}
      >
        {rollHistory.length === 0 ? (
          <Box sx={{ p: 2, color: tokens.colors.text.disabled, textAlign: 'center' }}>
            <Typography variant="body2">No rolls yet</Typography>
          </Box>
        ) : (
          rollHistory.map((roll, index) => (
            <Box
              key={roll.id}
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${tokens.colors.border}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
              }}
            >
              {/* Roll number */}
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  color: tokens.colors.text.disabled,
                  fontFamily: 'monospace',
                  width: 20,
                  flexShrink: 0,
                }}
              >
                #{rollHistory.length - index}
              </Typography>

              {/* Dice + Values */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    color: tokens.colors.text.primary,
                    fontFamily: 'monospace',
                  }}
                >
                  {roll.dice}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    color: tokens.colors.text.secondary,
                    fontFamily: 'monospace',
                  }}
                >
                  {roll.values}
                </Typography>
              </Box>

              {/* Hits/Bonus */}
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                {roll.hits !== undefined && (
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      color: tokens.colors.success,
                    }}
                  >
                    {roll.hits} hit{roll.hits !== 1 ? 's' : ''}
                  </Typography>
                )}
                {roll.bonus && (
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: roll.bonus.includes('x') ? tokens.colors.secondary : tokens.colors.success,
                      fontWeight: 600,
                    }}
                  >
                    {roll.bonus}
                  </Typography>
                )}
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* Score Display */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary }}>
            Score
          </Typography>
          <Box
            component="img"
            src="/assets/ui/icons/skull-score.png"
            alt=""
            sx={{ width: 16, height: 16 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1rem',
              color: tokens.colors.text.primary,
            }}
          >
            {score.toLocaleString()}
          </Typography>
        </Box>

        {/* Multiplier Row: [green] X [red/blue] */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: 2,
              bgcolor: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '1.25rem',
                color: '#fff',
              }}
            >
              {multiplier}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '1.25rem',
                color: tokens.colors.text.secondary,
              }}
            >
              X
            </Typography>
          </Box>
          <Box
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: 2,
              bgcolor: goal > 0 ? '#3b82f6' : tokens.colors.error,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '1.25rem',
                color: '#fff',
              }}
            >
              {goal}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Summons / Tributes / Options */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          p: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
        }}
      >
        {/* Summons */}
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
            Summons
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.25rem',
              color: '#22c55e',
            }}
          >
            {summons}
          </Typography>
        </Box>

        {/* Tributes */}
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
            Tributes
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.25rem',
              color: '#22c55e',
            }}
          >
            {tributes}
          </Typography>
        </Box>

        {/* Options */}
        <Button
          variant="contained"
          onClick={onOptions}
          sx={{
            bgcolor: '#eab308',
            color: '#000',
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.85rem',
            minWidth: 80,
            '&:hover': { bgcolor: '#ca8a04' },
          }}
        >
          Options
        </Button>
      </Box>

      {/* Gold */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${tokens.colors.border}`,
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
            bgcolor: tokens.colors.error,
            color: '#fff',
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.85rem',
            minWidth: 80,
            '&:hover': { bgcolor: '#b91c1c' },
          }}
        >
          Info
        </Button>
      </Box>
    </Box>
  );
}
