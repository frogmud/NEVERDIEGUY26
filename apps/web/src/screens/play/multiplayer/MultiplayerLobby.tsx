/**
 * MultiplayerLobby - Create or join multiplayer race rooms
 *
 * Flow:
 * 1. Enter name
 * 2. Create room (generates code) or Join room (enter code)
 * 3. Wait in lobby for host to start
 * 4. Race begins with shared seed
 *
 * NEVER DIE GUY
 */

import { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import GroupIcon from '@mui/icons-material/Group';
import { tokens } from '../../../theme';
import { useParty, useCountdown } from '../../../contexts';
import { useEternalStream } from '../../../hooks/useEternalStream';
import { EternalStreamFeed } from '../../../components/EternalStreamFeed';
import type { MatchFormat } from '@ndg/ai-engine/multiplayer';

// ============================================
// LOBBY STATES
// ============================================

type LobbyView = 'entry' | 'create' | 'join' | 'waiting';

interface MultiplayerLobbyProps {
  onRaceStart: (seed: string) => void;
  onBack: () => void;
}

export function MultiplayerLobby({ onRaceStart, onBack }: MultiplayerLobbyProps) {
  const {
    connected,
    connecting,
    error,
    roomState,
    isHost,
    players,
    connect,
    createRoom,
    disconnect,
    startSet,
  } = useParty();

  const { counting, secondsLeft } = useCountdown();

  // Eternal stream for connecting/waiting states
  const { entries: streamEntries } = useEternalStream({
    seed: roomState?.code || undefined,
    domain: 'earth',
    active: connecting || (connected && players.length < 2),
    revealInterval: 2500,
  });

  // Local state
  const [view, setView] = useState<LobbyView>('entry');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [matchFormat, setMatchFormat] = useState<MatchFormat>('bo3');
  const [copied, setCopied] = useState(false);

  // ----------------------------------------
  // HANDLERS
  // ----------------------------------------

  const handleCreate = useCallback(() => {
    if (!playerName.trim()) return;
    createRoom(playerName.trim());
    setView('waiting');
  }, [playerName, createRoom]);

  const handleJoin = useCallback(() => {
    if (!playerName.trim() || !roomCode.trim()) return;
    connect(roomCode.trim().toUpperCase(), playerName.trim());
    setView('waiting');
  }, [playerName, roomCode, connect]);

  const handleCopyCode = useCallback(() => {
    if (roomState?.code) {
      navigator.clipboard.writeText(roomState.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [roomState?.code]);

  const handleStart = useCallback(() => {
    startSet();
  }, [startSet]);

  const handleLeave = useCallback(() => {
    disconnect();
    setView('entry');
    setRoomCode('');
  }, [disconnect]);

  // Race started - notify parent
  if (roomState?.phase === 'racing' && roomState.currentSeed) {
    onRaceStart(roomState.currentSeed);
  }

  // ----------------------------------------
  // ENTRY VIEW
  // ----------------------------------------

  if (view === 'entry') {
    return (
      <Box sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          Multiplayer Race
        </Typography>

        <TextField
          fullWidth
          label="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value.slice(0, 16))}
          placeholder="Enter your name..."
          sx={{ mb: 3 }}
          inputProps={{ maxLength: 16 }}
        />

        <Stack spacing={2}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!playerName.trim()}
            onClick={() => setView('create')}
            startIcon={<GroupIcon />}
          >
            Create Room
          </Button>

          <Button
            variant="outlined"
            size="large"
            fullWidth
            disabled={!playerName.trim()}
            onClick={() => setView('join')}
          >
            Join Room
          </Button>

          <Divider sx={{ my: 2 }} />

          <Button variant="text" onClick={onBack}>
            Back to Solo Play
          </Button>
        </Stack>
      </Box>
    );
  }

  // ----------------------------------------
  // CREATE VIEW
  // ----------------------------------------

  if (view === 'create' && !connected) {
    return (
      <Box sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          Create Room
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Match Format
        </Typography>

        <ToggleButtonGroup
          value={matchFormat}
          exclusive
          onChange={(_, v) => v && setMatchFormat(v)}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="bo1">Best of 1</ToggleButton>
          <ToggleButton value="bo3">Best of 3</ToggleButton>
          <ToggleButton value="bo5">Best of 5</ToggleButton>
        </ToggleButtonGroup>

        <Stack spacing={2}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleCreate}
            disabled={connecting}
            startIcon={connecting ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          >
            {connecting ? 'Creating...' : 'Create Room'}
          </Button>

          <Button variant="text" onClick={() => setView('entry')}>
            Back
          </Button>
        </Stack>
      </Box>
    );
  }

  // ----------------------------------------
  // JOIN VIEW
  // ----------------------------------------

  if (view === 'join' && !connected) {
    return (
      <Box sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          Join Room
        </Typography>

        <TextField
          fullWidth
          label="Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="XXXX"
          sx={{ mb: 3 }}
          inputProps={{
            maxLength: 4,
            style: { textTransform: 'uppercase', letterSpacing: '0.5em', textAlign: 'center' },
          }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleJoin}
            disabled={connecting || roomCode.length !== 4}
            startIcon={connecting ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          >
            {connecting ? 'Joining...' : 'Join Room'}
          </Button>

          <Button variant="text" onClick={() => setView('entry')}>
            Back
          </Button>
        </Stack>
      </Box>
    );
  }

  // ----------------------------------------
  // WAITING VIEW (Connected to room)
  // ----------------------------------------

  if (connected && roomState) {
    return (
      <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
        {/* Room Code Header */}
        <Card
          sx={{
            mb: 3,
            bgcolor: tokens.surface.panel,
            textAlign: 'center',
          }}
        >
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Room Code
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'monospace',
                  letterSpacing: '0.3em',
                  fontWeight: 700,
                }}
              >
                {roomState.code}
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                <IconButton onClick={handleCopyCode} size="small">
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Share this code with friends
            </Typography>
          </CardContent>
        </Card>

        {/* Match Format */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Format: {roomState.config.matchFormat.toUpperCase()}
        </Typography>

        {/* Player List */}
        <Card sx={{ mb: 3, bgcolor: tokens.surface.panel }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Players ({players.length}/{roomState.config.maxPlayers})
            </Typography>
            <List dense>
              {players.map((player) => (
                <ListItem key={player.id}>
                  <ListItemIcon>
                    {player.isHost ? (
                      <StarIcon sx={{ color: tokens.status.gold }} />
                    ) : (
                      <PersonIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={player.name}
                    secondary={player.isHost ? 'Host' : null}
                  />
                  <Chip
                    label={player.connected ? 'Ready' : 'Disconnected'}
                    size="small"
                    color={player.connected ? 'success' : 'default'}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Countdown */}
        {counting && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h2" sx={{ color: tokens.status.warning }}>
              {secondsLeft}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Race starting...
            </Typography>
          </Box>
        )}

        {/* Actions */}
        <Stack spacing={2}>
          {isHost && !counting && (
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleStart}
              disabled={players.length < 2}
              startIcon={<PlayArrowIcon />}
            >
              Start Race ({players.length}/2 min)
            </Button>
          )}

          {!isHost && !counting && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Waiting for host to start...
            </Typography>
          )}

          <Button
            variant="outlined"
            onClick={handleLeave}
            startIcon={<ExitToAppIcon />}
          >
            Leave Room
          </Button>
        </Stack>
      </Box>
    );
  }

  // Fallback loading state with eternal stream
  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Connecting to room...
        </Typography>
      </Box>

      {/* Eternal Broadcast - ambient NPC chatter while connecting */}
      <Box
        sx={{
          bgcolor: tokens.surface.panel,
          borderRadius: 1,
          p: 2,
          maxHeight: 200,
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ mb: 1.5, display: 'block' }}
        >
          Eternal Broadcast
        </Typography>
        <EternalStreamFeed entries={streamEntries} maxVisible={4} />
      </Box>
    </Box>
  );
}
