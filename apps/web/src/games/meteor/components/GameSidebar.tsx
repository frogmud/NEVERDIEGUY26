import { Box, Button, Typography, Chip } from '@mui/material';
import { tokens } from '../../../theme';
import { BronzePlacard } from '../../../components/BronzePlacard';
import { TokenIcon } from '../../../components/TokenIcon';
import type { RollHistoryEntry } from '../../../hooks/useRollHistory';

// Gaming font style
const gamingFont = { fontFamily: tokens.fonts.gaming };

interface GameSidebarProps {
  eventConfig: { label: string };
  scoreGoal: number;
  score: number;
  multiplier: number;
  selectedCount: number;
  summons: number;
  tributes: number;
  gold: number;
  domain: number;
  eventIndex: number;
  onSettingsOpen: () => void;
  history?: RollHistoryEntry[];
}

/**
 * Convert dice array to notation string
 * e.g., [6, 8, 10] -> "d6 + d8 + d10"
 */
function toNotation(dice: number[]): string {
  const counts: Record<number, number> = {};
  dice.forEach((d) => {
    counts[d] = (counts[d] || 0) + 1;
  });

  return Object.entries(counts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([sides, count]) => (count > 1 ? `${count}d${sides}` : `d${sides}`))
    .join(' + ');
}

/**
 * Format values grouped by die type
 * e.g., dice=[6,8,10], values=[2,6,4] -> "[2] + [6] + [4]"
 */
function formatValues(dice: number[], values: number[]): string {
  const groups: Record<number, number[]> = {};
  const order: number[] = [];

  dice.forEach((d, i) => {
    if (!groups[d]) {
      groups[d] = [];
      order.push(d);
    }
    groups[d].push(values[i]);
  });

  return order.map((d) => `[${groups[d].join(',')}]`).join(' + ');
}

export function GameSidebar({
  eventConfig,
  scoreGoal,
  score,
  multiplier,
  selectedCount,
  summons,
  tributes,
  gold,
  domain,
  eventIndex,
  onSettingsOpen,
  history = [],
}: GameSidebarProps) {
  return (
    <>
      {/* Event zone - square persistent area at top */}
      <Box
        sx={{
          aspectRatio: '1 / 1',
          borderBottom: `1px solid ${tokens.colors.border}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        {/* Bronze placard with label overlay */}
        <Box sx={{ position: 'relative', width: 100, height: 78, mb: 1.5 }}>
          <BronzePlacard size={100} />
          <Typography
            sx={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              ...gamingFont,
              fontSize: '0.75rem',
              color: '#1f1f1f',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {eventConfig.label}
          </Typography>
        </Box>
        <Typography
          sx={{
            ...gamingFont,
            fontSize: '0.875rem',
            color: tokens.colors.text.secondary,
            mb: 0.5,
          }}
        >
          Score at least
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TokenIcon size={28} />
          <Typography
            sx={{
              color: tokens.colors.error,
              fontWeight: 700,
              fontSize: '2rem',
              ...gamingFont,
              letterSpacing: '0.05em',
            }}
          >
            {scoreGoal}
          </Typography>
        </Box>
      </Box>

      {/* Roll History - no border, scrollable */}
      <Box
        sx={{
          p: 1,
          flex: 1,
          minHeight: 80,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: tokens.colors.border,
            borderRadius: 2,
          },
        }}
      >
        {history.length === 0 ? (
          <Typography
            sx={{
              color: tokens.colors.text.disabled,
              textAlign: 'center',
              py: 3,
              ...gamingFont,
              fontSize: '0.95rem',
            }}
          >
            No rolls yet
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {history.slice(0, 10).map((entry, index) => {
              const rollNumber = history.length - index;
              const isSummon = entry.type === 'summon';

              return (
                <Box
                  key={`roll-${rollNumber}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 0.75,
                    py: 0.5,
                  }}
                >
                  {/* Move number */}
                  <Typography
                    sx={{
                      ...gamingFont,
                      fontSize: '0.7rem',
                      color: tokens.colors.text.disabled,
                      minWidth: 20,
                    }}
                  >
                    #{rollNumber}
                  </Typography>

                  {/* Dice notation column */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        color: tokens.colors.text.primary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {toNotation(entry.dice)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.95rem',
                        fontFamily: 'monospace',
                        color: tokens.colors.text.secondary,
                      }}
                    >
                      {formatValues(entry.dice, entry.values)}
                    </Typography>
                  </Box>

                  {/* Result chips */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, alignItems: 'flex-end' }}>
                    {isSummon && entry.hits > 0 && (
                      <Chip
                        label={`${entry.hits} hit${entry.hits > 1 ? 's' : ''}`}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.625rem',
                          bgcolor: 'rgba(231, 76, 60, 0.2)',
                          color: tokens.colors.error,
                          '& .MuiChip-label': { px: 0.5 },
                        }}
                      />
                    )}
                    {entry.score > 0 && (
                      <Chip
                        label={isSummon ? `+${entry.score}` : `+${entry.score}x`}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.625rem',
                          bgcolor: isSummon
                            ? 'rgba(39, 174, 96, 0.2)'
                            : 'rgba(155, 89, 182, 0.2)',
                          color: isSummon ? tokens.colors.success : '#9b59b6',
                          fontWeight: 700,
                          '& .MuiChip-label': { px: 0.5 },
                        }}
                      />
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Current score */}
      <Box sx={{ p: 1.5, borderBottom: `1px solid ${tokens.colors.border}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <Typography sx={{ ...gamingFont, fontSize: '1rem' }}>Score</Typography>
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
                ...gamingFont,
                fontWeight: 700,
                fontSize: '1.375rem',
                letterSpacing: '0.05em',
              }}
            >
              {score}
            </Typography>
          </Box>
        </Box>

        {/* Multiplier display */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Box
            sx={{
              flex: 1,
              bgcolor: '#3498db',
              py: 1,
              px: 2,
              borderRadius: 50,
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                ...gamingFont,
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.375rem',
              }}
            >
              {multiplier.toFixed(0)}
            </Typography>
          </Box>
          <Typography
            sx={{
              ...gamingFont,
              fontSize: '1.875rem',
              color: tokens.colors.error,
              fontWeight: 700,
            }}
          >
            X
          </Typography>
          <Box
            sx={{
              flex: 1,
              bgcolor: tokens.colors.error,
              py: 1,
              px: 2,
              borderRadius: 50,
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                ...gamingFont,
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.375rem',
              }}
            >
              {selectedCount}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats grid - 2 column layout with buttons stacked on right */}
      <Box sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {/* Left column - stats */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {/* Summons & Tributes row */}
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              <StatBox label="Summons" value={summons} color="#3498db" />
              <StatBox label="Tributes" value={tributes} color={tokens.colors.error} />
            </Box>

            {/* Gold row */}
            <Box
              sx={{
                bgcolor: tokens.colors.background.elevated,
                p: 1,
                borderRadius: 1,
                textAlign: 'center',
                border: `1px solid ${tokens.colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ ...gamingFont, fontSize: '1.375rem', color: '#C4A000' }}>
                ${gold}
              </Typography>
            </Box>

            {/* Domain & Events row */}
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              <SmallStatBox label="Domain" value={`${domain}/6`} />
              <SmallStatBox label="Event" value={`${eventIndex + 1}/3`} />
            </Box>
          </Box>

          {/* Right column - buttons stacked */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, width: 90 }}>
            <Button
              variant="contained"
              onClick={onSettingsOpen}
              sx={{
                flex: 1,
                bgcolor: '#C4A000',
                ...gamingFont,
                fontSize: '0.95rem',
                minHeight: 0,
                '&:hover': { bgcolor: '#a08300' },
              }}
            >
              Options
            </Button>
            <Button
              variant="contained"
              sx={{
                flex: 1,
                bgcolor: tokens.colors.error,
                ...gamingFont,
                fontSize: '0.95rem',
                minHeight: 0,
                '&:hover': { bgcolor: '#c0392b' },
              }}
            >
              Info
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}

// Helper component for stat boxes
function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: tokens.colors.background.elevated,
        p: 1,
        borderRadius: 1,
        textAlign: 'center',
        border: `1px solid ${tokens.colors.border}`,
      }}
    >
      <Typography
        sx={{
          color: tokens.colors.text.disabled,
          ...gamingFont,
          fontSize: '0.7rem',
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ ...gamingFont, fontSize: '1.375rem', color }}>
        {value}
      </Typography>
    </Box>
  );
}

// Helper component for smaller stat boxes
function SmallStatBox({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: tokens.colors.background.elevated,
        p: 0.75,
        borderRadius: 1,
        textAlign: 'center',
        border: `1px solid ${tokens.colors.border}`,
      }}
    >
      <Typography
        sx={{
          color: tokens.colors.text.disabled,
          ...gamingFont,
          fontSize: '0.625rem',
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ ...gamingFont, fontSize: '1rem' }}>{value}</Typography>
    </Box>
  );
}
