import { Box, Typography, Chip } from '@mui/material';
import {
  BoltSharp as SummonIcon,
  AutoAwesome as TributeIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import type { RollHistoryEntry } from '../../../hooks/useRollHistory';

// Gaming font style
const gamingFont = { fontFamily: tokens.fonts.gaming };

interface RollHistoryProps {
  history: RollHistoryEntry[];
  maxVisible?: number;
}

/**
 * Convert dice array to notation string
 * e.g., [6, 6, 20] → "2d6 + d20"
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
 * e.g., dice=[6,6,20], values=[3,5,17] → "[3,5] + [17]"
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

/**
 * Get color for die type
 */
function getDieColor(sides: number): string {
  switch (sides) {
    case 4:
      return '#8b4513'; // brown
    case 6:
      return '#cd853f'; // tan
    case 8:
      return '#9b59b6'; // purple
    case 10:
      return '#27ae60'; // green
    case 12:
      return '#2980b9'; // blue
    case 20:
      return '#c4a000'; // gold
    default:
      return tokens.colors.text.secondary;
  }
}

export function RollHistory({ history, maxVisible = 8 }: RollHistoryProps) {
  if (history.length === 0) {
    return (
      <Box
        sx={{
          p: 2,
          textAlign: 'center',
          color: tokens.colors.text.disabled,
        }}
      >
        <Typography sx={{ ...gamingFont, fontSize: '0.6rem' }}>
          No rolls yet
        </Typography>
      </Box>
    );
  }

  const visibleHistory = history.slice(0, maxVisible);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        maxHeight: 200,
        overflowY: 'auto',
        p: 1,
        '&::-webkit-scrollbar': {
          width: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: tokens.colors.border,
          borderRadius: 2,
        },
      }}
    >
      {visibleHistory.map((entry, index) => {
        const rollNumber = history.length - index;
        const isSummon = entry.type === 'summon';
        const primaryColor = isSummon ? '#3498db' : '#9b59b6';

        return (
          <Box
            key={`roll-${rollNumber}`}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              p: 1,
              bgcolor: tokens.colors.background.elevated,
              borderRadius: 1,
              borderLeft: `3px solid ${primaryColor}`,
            }}
          >
            {/* Roll number & type icon */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 28,
              }}
            >
              <Typography
                sx={{
                  ...gamingFont,
                  fontSize: '0.875rem',
                  color: tokens.colors.text.disabled,
                }}
              >
                #{rollNumber}
              </Typography>
              {isSummon ? (
                <SummonIcon sx={{ fontSize: 14, color: primaryColor }} />
              ) : (
                <TributeIcon sx={{ fontSize: 14, color: primaryColor }} />
              )}
            </Box>

            {/* Roll details */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Notation */}
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  color: tokens.colors.text.primary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {toNotation(entry.dice)}
              </Typography>

              {/* Values */}
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  color: tokens.colors.text.secondary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {formatValues(entry.dice, entry.values)}
              </Typography>

              {/* Stats row */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  mt: 0.5,
                  flexWrap: 'wrap',
                }}
              >
                {isSummon && entry.hits > 0 && (
                  <Chip
                    label={`${entry.hits} hit${entry.hits > 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.875rem',
                      bgcolor: 'rgba(231, 76, 60, 0.2)',
                      color: tokens.colors.error,
                      '& .MuiChip-label': { px: 0.75 },
                    }}
                  />
                )}
                {entry.score > 0 && (
                  <Chip
                    label={isSummon ? `+${entry.score}` : `+${entry.score}x`}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.875rem',
                      bgcolor: isSummon
                        ? 'rgba(39, 174, 96, 0.2)'
                        : 'rgba(155, 89, 182, 0.2)',
                      color: isSummon ? tokens.colors.success : '#9b59b6',
                      fontWeight: 700,
                      '& .MuiChip-label': { px: 0.75 },
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        );
      })}

      {history.length > maxVisible && (
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '0.875rem',
            color: tokens.colors.text.disabled,
            py: 0.5,
          }}
        >
          +{history.length - maxVisible} more
        </Typography>
      )}
    </Box>
  );
}
