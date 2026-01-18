/**
 * EternalStreamFeed - Display for eternal stream entries with NPC reactions
 *
 * Shows NPC chatter during lobby connecting/waiting states.
 * Newest entry highlighted, older entries fade progressively.
 * Reactions displayed as compact icon clusters.
 */

import { Box, Typography, Fade, keyframes, Tooltip, Chip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ReportIcon from '@mui/icons-material/Report';
import { tokens } from '../theme';
import type { StreamEntry, StreamReaction, ReactionType } from '@ndg/ai-engine/stream';

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pulseReaction = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

interface EternalStreamFeedProps {
  entries: StreamEntry[];
  maxVisible?: number;
  showReactions?: boolean;
}

/**
 * Get icon and color for reaction type
 */
function getReactionDisplay(type: ReactionType) {
  switch (type) {
    case 'love':
      return { icon: FavoriteIcon, color: '#e91e63' };
    case 'like':
      return { icon: ThumbUpIcon, color: '#4caf50' };
    case 'dislike':
      return { icon: ThumbDownIcon, color: '#ff9800' };
    case 'report':
      return { icon: ReportIcon, color: '#f44336' };
  }
}

/**
 * Group reactions by type for compact display
 */
function groupReactions(reactions: StreamReaction[]): Map<ReactionType, StreamReaction[]> {
  const grouped = new Map<ReactionType, StreamReaction[]>();
  for (const reaction of reactions) {
    const existing = grouped.get(reaction.type) || [];
    existing.push(reaction);
    grouped.set(reaction.type, existing);
  }
  return grouped;
}

interface ReactionClusterProps {
  reactions: StreamReaction[];
  isNewest: boolean;
}

function ReactionCluster({ reactions, isNewest }: ReactionClusterProps) {
  if (!reactions || reactions.length === 0) return null;

  const grouped = groupReactions(reactions);
  const reactionTypes: ReactionType[] = ['love', 'like', 'dislike', 'report'];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0.5,
        ml: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {reactionTypes.map(type => {
        const typeReactions = grouped.get(type);
        if (!typeReactions || typeReactions.length === 0) return null;

        const { icon: Icon, color } = getReactionDisplay(type);
        const reactorNames = typeReactions.map(r => r.reactorName).join(', ');

        return (
          <Tooltip
            key={type}
            title={`${reactorNames} ${type === 'love' ? 'loved' : type === 'like' ? 'liked' : type === 'dislike' ? 'disliked' : 'reported'} this`}
            arrow
            placement="top"
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                px: 0.5,
                py: 0.25,
                borderRadius: 1,
                bgcolor: `${color}15`,
                animation: isNewest ? `${pulseReaction} 0.4s ease-out` : 'none',
              }}
            >
              <Icon sx={{ fontSize: 12, color }} />
              {typeReactions.length > 1 && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.65rem',
                    color,
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {typeReactions.length}
                </Typography>
              )}
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

export function EternalStreamFeed({
  entries,
  maxVisible = 5,
  showReactions = true,
}: EternalStreamFeedProps) {
  const visible = entries.slice(0, maxVisible);

  if (visible.length === 0) {
    return (
      <Typography
        variant="body2"
        sx={{
          color: tokens.text.secondary,
          fontStyle: 'italic',
          fontSize: '0.8rem',
        }}
      >
        Tuning in...
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {visible.map((entry, idx) => {
        const isNewest = idx === 0;
        // Progressive fade: newest = 1, older = dimmer
        const opacity = isNewest ? 1 : Math.max(0.3, 0.7 - idx * 0.12);
        const hasReactions = showReactions && entry.reactions && entry.reactions.length > 0;

        return (
          <Fade in key={entry.id} timeout={isNewest ? 400 : 0}>
            <Box
              sx={{
                opacity,
                animation: isNewest ? `${fadeIn} 300ms ease-out` : 'none',
              }}
            >
              {/* Main content row */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: tokens.text.secondary,
                    fontFamily: tokens.fonts.mono,
                    fontSize: '0.7rem',
                    minWidth: 75,
                    flexShrink: 0,
                    textAlign: 'right',
                  }}
                >
                  {entry.speakerName}:
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{
                      color: tokens.text.primary,
                      fontSize: '0.8rem',
                      fontStyle: entry.type === 'meta' ? 'italic' : 'normal',
                      lineHeight: 1.4,
                    }}
                  >
                    {entry.content}
                  </Typography>
                  {/* Tagged NPCs as chips */}
                  {entry.taggedNPCs && entry.taggedNPCs.length > 0 && (
                    <Box sx={{ display: 'inline-flex', gap: 0.5, ml: 0.5 }}>
                      {entry.taggedNPCs.map(tag => (
                        <Chip
                          key={tag}
                          label={`@${tag}`}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            bgcolor: `${tokens.brand.primary}20`,
                            color: tokens.brand.primary,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
              {/* Reactions row */}
              {hasReactions && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.25 }}>
                  <ReactionCluster reactions={entry.reactions!} isNewest={isNewest} />
                </Box>
              )}
            </Box>
          </Fade>
        );
      })}
    </Box>
  );
}
