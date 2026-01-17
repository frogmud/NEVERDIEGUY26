/**
 * MultiplayerHub - Wrapper for multiplayer race mode
 *
 * Flow:
 * 1. Show lobby (create/join room)
 * 2. Wait for race start
 * 3. Race with overlays (HUD, interventions, chat)
 * 4. Show results
 *
 * NEVER DIE GUY
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { useParty, useRun } from '../../contexts';
import { usePartyBridge } from '../../hooks/usePartyBridge';
import { PlayHub } from './PlayHub';
import {
  MultiplayerLobby,
  RaceHUD,
  InterventionToast,
  QuickChatPanel,
} from './multiplayer';

type MultiplayerPhase = 'lobby' | 'racing' | 'results';

export function MultiplayerHub() {
  const navigate = useNavigate();
  const { roomCode: urlRoomCode } = useParams<{ roomCode?: string }>();
  const { roomState, connect } = useParty();
  const { startRun } = useRun();

  const [phase, setPhase] = useState<MultiplayerPhase>('lobby');
  const [raceSeed, setRaceSeed] = useState<string | null>(null);

  // Bridge to sync game state to party room
  const { active: bridgeActive } = usePartyBridge();

  // Auto-join room if URL has room code
  useEffect(() => {
    if (urlRoomCode && !roomState) {
      // Would need player name - prompt or use stored name
      // For now, just navigate to lobby
    }
  }, [urlRoomCode, roomState]);

  // Watch for race start from party room
  useEffect(() => {
    if (roomState?.phase === 'racing' && raceSeed && phase === 'lobby') {
      setPhase('racing');
      // Start the run with shared seed
      startRun(raceSeed);
    }
  }, [roomState?.phase, raceSeed, phase, startRun]);

  // Watch for race end
  useEffect(() => {
    if (roomState?.phase === 'results' || roomState?.phase === 'set_complete') {
      setPhase('results');
    }
  }, [roomState?.phase]);

  // Handle race start from lobby
  const handleRaceStart = useCallback((seed: string) => {
    setRaceSeed(seed);
    setPhase('racing');
    startRun(seed);
  }, [startRun]);

  // Handle back to solo play
  const handleBack = useCallback(() => {
    navigate('/play');
  }, [navigate]);

  // ----------------------------------------
  // LOBBY PHASE
  // ----------------------------------------

  if (phase === 'lobby') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <MultiplayerLobby onRaceStart={handleRaceStart} onBack={handleBack} />
      </Box>
    );
  }

  // ----------------------------------------
  // RACING PHASE
  // ----------------------------------------

  if (phase === 'racing') {
    return (
      <Box sx={{ position: 'relative' }}>
        {/* Main game view */}
        <PlayHub />

        {/* Multiplayer overlays */}
        <RaceHUD position="top-right" />
        <InterventionToast />
        <QuickChatPanel position="bottom-left" />
      </Box>
    );
  }

  // ----------------------------------------
  // RESULTS PHASE
  // ----------------------------------------

  if (phase === 'results') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <MultiplayerResults
          onNextMatch={() => setPhase('lobby')}
          onExit={handleBack}
        />
      </Box>
    );
  }

  return null;
}

// ============================================
// RESULTS COMPONENT
// ============================================

import { Typography, Button, Stack, Card, CardContent, Chip, Divider, List, ListItem, ListItemText, ListItemIcon, Avatar } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ReplayIcon from '@mui/icons-material/Replay';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { tokens } from '../../theme';

interface MultiplayerResultsProps {
  onNextMatch: () => void;
  onExit: () => void;
}

function MultiplayerResults({ onNextMatch, onExit }: MultiplayerResultsProps) {
  const { roomState, isHost, nextMatch, rematch } = useParty();

  if (!roomState) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No room data</Typography>
        <Button onClick={onExit}>Exit</Button>
      </Box>
    );
  }

  const latestMatch = roomState.matchHistory[roomState.matchHistory.length - 1];
  const isSetComplete = roomState.phase === 'set_complete';

  // Find set winner
  const setWinner = roomState.setScores.reduce(
    (max, s) => (s.wins > (max?.wins ?? 0) ? s : max),
    null as (typeof roomState.setScores)[0] | null
  );

  return (
    <Card sx={{ maxWidth: 500, width: '100%', bgcolor: tokens.surface.panel }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <EmojiEventsIcon sx={{ fontSize: 48, color: tokens.status.gold, mb: 1 }} />
          <Typography variant="h5">
            {isSetComplete ? 'Set Complete!' : `Match ${latestMatch?.matchNumber} Complete`}
          </Typography>
          {isSetComplete && setWinner && (
            <Typography variant="h6" color="text.secondary">
              {roomState.players[setWinner.playerId]?.name} wins the set!
            </Typography>
          )}
        </Box>

        {/* Rankings */}
        {latestMatch && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Match Rankings
            </Typography>
            <List dense>
              {latestMatch.rankings.map((rank, i) => (
                <ListItem key={rank.playerId}>
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor:
                          i === 0
                            ? tokens.status.gold
                            : i === 1
                              ? tokens.status.silver
                              : tokens.surface.elevated,
                        fontSize: '0.85rem',
                      }}
                    >
                      {i + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={rank.playerName}
                    secondary={`${rank.finalScore.toLocaleString()} pts`}
                  />
                  <Chip
                    label={rank.status}
                    size="small"
                    color={rank.status === 'victory' ? 'success' : 'error'}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Set Scores */}
        {roomState.setScores.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Set Score
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
              {roomState.setScores.map((score) => {
                const player = roomState.players[score.playerId];
                return (
                  <Chip
                    key={score.playerId}
                    label={`${player?.name}: ${score.wins}`}
                    sx={{
                      fontWeight: 700,
                      bgcolor: score.playerId === setWinner?.playerId ? tokens.status.gold : tokens.surface.elevated,
                      color: score.playerId === setWinner?.playerId ? '#000' : undefined,
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Actions */}
        <Stack spacing={2}>
          {!isSetComplete && isHost && (
            <Button
              variant="contained"
              size="large"
              onClick={nextMatch}
              startIcon={<ReplayIcon />}
            >
              Next Match
            </Button>
          )}

          {isSetComplete && (
            <Button
              variant="contained"
              size="large"
              onClick={rematch}
              startIcon={<ReplayIcon />}
            >
              Rematch (New Set)
            </Button>
          )}

          {!isHost && !isSetComplete && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Waiting for host to start next match...
            </Typography>
          )}

          <Button
            variant="outlined"
            onClick={onExit}
            startIcon={<ExitToAppIcon />}
          >
            Leave Room
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
