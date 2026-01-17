/**
 * RaceHUD - Overlay showing multiplayer race progress
 *
 * Displays:
 * - Leaderboard with player positions
 * - Progress bars for each player
 * - Recent interventions
 *
 * NEVER DIE GUY
 */

import { Box, Paper, Typography, LinearProgress, Stack, Chip, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SkullIcon from '@mui/icons-material/Dangerous';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { tokens } from '../../../theme';
import { useRaceLeaderboard, useParty } from '../../../contexts';
import type { RacePlayer } from '@ndg/ai-engine/multiplayer';

// ============================================
// CONSTANTS
// ============================================

const TOTAL_ROOMS = 18; // 6 domains x 3 rooms

// ============================================
// PLAYER ROW
// ============================================

interface PlayerRowProps {
  player: RacePlayer;
  rank: number;
  isMe: boolean;
}

function PlayerRow({ player, rank, isMe }: PlayerRowProps) {
  const progress = (player.roomsCleared / TOTAL_ROOMS) * 100;

  const getStatusIcon = () => {
    switch (player.status) {
      case 'victory':
        return <EmojiEventsIcon sx={{ color: tokens.status.gold, fontSize: 16 }} />;
      case 'dead':
        return <SkullIcon sx={{ color: tokens.status.error, fontSize: 16 }} />;
      case 'racing':
        return <DirectionsRunIcon sx={{ color: tokens.status.info, fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const getRankColor = () => {
    if (rank === 1) return tokens.status.gold;
    if (rank === 2) return tokens.status.silver;
    if (rank === 3) return tokens.status.bronze;
    return tokens.text.secondary;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        px: 1,
        borderRadius: 1,
        bgcolor: isMe ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
        border: isMe ? `1px solid ${tokens.accent.primary}` : '1px solid transparent',
      }}
    >
      {/* Rank */}
      <Typography
        variant="caption"
        sx={{
          width: 20,
          fontWeight: 700,
          color: getRankColor(),
          textAlign: 'center',
        }}
      >
        {rank}
      </Typography>

      {/* Avatar / Status */}
      <Avatar
        sx={{
          width: 24,
          height: 24,
          bgcolor: player.connected ? tokens.surface.elevated : tokens.surface.panel,
        }}
      >
        {getStatusIcon() || <PersonIcon sx={{ fontSize: 14 }} />}
      </Avatar>

      {/* Name */}
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          fontWeight: isMe ? 600 : 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {player.name}
        {isMe && (
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            (you)
          </Typography>
        )}
      </Typography>

      {/* Domain indicator */}
      <Chip
        label={`D${player.currentDomain}`}
        size="small"
        sx={{
          height: 20,
          fontSize: '0.7rem',
          bgcolor: tokens.surface.elevated,
        }}
      />

      {/* Progress bar */}
      <Box sx={{ width: 60 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: tokens.surface.panel,
            '& .MuiLinearProgress-bar': {
              bgcolor:
                player.status === 'victory'
                  ? tokens.status.success
                  : player.status === 'dead'
                    ? tokens.status.error
                    : tokens.accent.primary,
            },
          }}
        />
      </Box>
    </Box>
  );
}

// ============================================
// RACE HUD
// ============================================

interface RaceHUDProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function RaceHUD({ position = 'top-right' }: RaceHUDProps) {
  const leaderboard = useRaceLeaderboard();
  const { myPlayer, roomState } = useParty();

  if (!roomState || roomState.phase !== 'racing') {
    return null;
  }

  const positionStyles = {
    'top-left': { top: 16, left: 16 },
    'top-right': { top: 16, right: 16 },
    'bottom-left': { bottom: 16, left: 16 },
    'bottom-right': { bottom: 16, right: 16 },
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        ...positionStyles[position],
        width: 280,
        maxHeight: 300,
        overflow: 'auto',
        bgcolor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
        border: `1px solid ${tokens.surface.border}`,
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: `1px solid ${tokens.surface.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="overline" sx={{ fontWeight: 600 }}>
          Race - Match {roomState.currentMatchNumber}
        </Typography>
        <Chip
          label={`${leaderboard.filter((p) => p.status === 'racing').length} racing`}
          size="small"
          sx={{ height: 18, fontSize: '0.65rem' }}
        />
      </Box>

      {/* Leaderboard */}
      <Stack sx={{ p: 0.5 }}>
        {leaderboard.map((player, index) => (
          <PlayerRow
            key={player.id}
            player={player}
            rank={index + 1}
            isMe={player.id === myPlayer?.id}
          />
        ))}
      </Stack>

      {/* Set Score (if multi-match) */}
      {roomState.setScores.length > 0 && (
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            borderTop: `1px solid ${tokens.surface.border}`,
            display: 'flex',
            gap: 1,
            justifyContent: 'center',
          }}
        >
          {roomState.setScores.map((score) => {
            const player = roomState.players[score.playerId];
            return (
              <Chip
                key={score.playerId}
                label={`${player?.name?.slice(0, 8) ?? '?'}: ${score.wins}`}
                size="small"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            );
          })}
        </Box>
      )}
    </Paper>
  );
}
