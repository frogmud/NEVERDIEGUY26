import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Slider,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  PlayArrowSharp as PlayIcon,
  PauseSharp as PauseIcon,
  SkipPreviousSharp as SkipBackIcon,
  SkipNextSharp as SkipNextIcon,
  FastForwardSharp as FastForwardIcon,
  FastRewindSharp as FastRewindIcon,
  ArrowBackSharp as BackIcon,
  ShareSharp as ShareIcon,
  BookmarkBorderSharp as BookmarkIcon,
  FullscreenSharp as FullscreenIcon,
  StorefrontSharp as ShopIcon,
  MeetingRoomSharp as DoorIcon,
  PersonSharp as WandererIcon,
  EmojiEventsSharp as BossIcon,
  FlagSharp as StartIcon,
  CheckCircleSharp as ClearIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';

// Mock ledger events for replay
const MOCK_LEDGER = [
  { type: 'THREAD_START', timestamp: 0, payload: { threadId: 'F7A2C1', domain: 1, kit: 'balanced' } },
  { type: 'ROOM_CLEAR', timestamp: 45, payload: { room: 1, score: 3200, gold: 50 } },
  { type: 'SHOP_BUY', timestamp: 52, payload: { item: 'Health Potion', cost: 25 } },
  { type: 'DOOR_PICK', timestamp: 58, payload: { doorType: 'elite', promises: ['+Credits', 'Heat Spike'] } },
  { type: 'ROOM_CLEAR', timestamp: 112, payload: { room: 2, score: 5800, gold: 100 } },
  { type: 'WANDERER_CHOICE', timestamp: 120, payload: { wanderer: 'Willy', choice: 'provoke', result: 'win' } },
  { type: 'SHOP_BUY', timestamp: 128, payload: { item: 'Extra D8', cost: 50 } },
  { type: 'DOOR_PICK', timestamp: 135, payload: { doorType: 'stable', promises: ['+Credits'] } },
  { type: 'ROOM_CLEAR', timestamp: 198, payload: { room: 3, score: 8400, gold: 200 } },
  { type: 'AUDIT_CLEAR', timestamp: 220, payload: { domain: 1, boss: 'The One' } },
];

const EVENT_ICONS: Record<string, React.ReactElement> = {
  THREAD_START: <StartIcon fontSize="small" />,
  ROOM_CLEAR: <ClearIcon fontSize="small" />,
  SHOP_BUY: <ShopIcon fontSize="small" />,
  DOOR_PICK: <DoorIcon fontSize="small" />,
  WANDERER_CHOICE: <WandererIcon fontSize="small" />,
  AUDIT_CLEAR: <BossIcon fontSize="small" />,
};

const EVENT_LABELS: Record<string, string> = {
  THREAD_START: 'Thread Start',
  ROOM_CLEAR: 'Room Clear',
  SHOP_BUY: 'Shop Purchase',
  DOOR_PICK: 'Door Pick',
  WANDERER_CHOICE: 'Wanderer',
  AUDIT_CLEAR: 'Audit Clear',
};

const EVENT_COLORS: Record<string, string> = {
  THREAD_START: tokens.colors.secondary,
  ROOM_CLEAR: tokens.colors.success,
  SHOP_BUY: '#c4a000',
  DOOR_PICK: tokens.colors.primary,
  WANDERER_CHOICE: '#a855f7',
  AUDIT_CLEAR: tokens.colors.warning,
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function MatchReplay() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  const totalDuration = MOCK_LEDGER[MOCK_LEDGER.length - 1].timestamp + 30;

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return prev;
        }
        return prev + playbackSpeed;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, totalDuration]);

  const currentEventIndex = MOCK_LEDGER.findIndex((e, i) => {
    const next = MOCK_LEDGER[i + 1];
    return currentTime >= e.timestamp && (!next || currentTime < next.timestamp);
  });

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    setPlaybackSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  const jumpToEvent = (index: number) => {
    setCurrentTime(MOCK_LEDGER[index].timestamp);
    setSelectedEvent(index);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={() => navigate('/play/replays')}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontFamily: tokens.fonts.mono }}>
            Thread {threadId}
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
            Recorded Dec 23, 2025 | The Caverns | Tier 3
          </Typography>
        </Box>
        <Tooltip title="Bookmark">
          <IconButton>
            <BookmarkIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Share">
          <IconButton>
            <ShareIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Fullscreen">
          <IconButton>
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Timeline - now at the top */}
      <Paper
        sx={{
          mb: 2,
          p: 2,
          bgcolor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: 2,
        }}
      >
        {/* Timeline slider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="caption" sx={{ fontFamily: tokens.fonts.mono, minWidth: 40, color: tokens.colors.text.secondary }}>
            {formatTime(currentTime)}
          </Typography>
          <Slider
            value={currentTime}
            min={0}
            max={totalDuration}
            onChange={(_, v) => setCurrentTime(v as number)}
            sx={{
              color: tokens.colors.primary,
              '& .MuiSlider-thumb': { width: 12, height: 12 },
              '& .MuiSlider-rail': { bgcolor: tokens.colors.background.elevated },
            }}
          />
          <Typography variant="caption" sx={{ fontFamily: tokens.fonts.mono, minWidth: 40, color: tokens.colors.text.secondary }}>
            {formatTime(totalDuration)}
          </Typography>
        </Box>

        {/* Event markers on timeline */}
        <Box sx={{ position: 'relative', height: 8, mx: 6, mb: 2 }}>
          {MOCK_LEDGER.map((event, i) => (
            <Tooltip key={i} title={EVENT_LABELS[event.type]}>
              <Box
                onClick={() => jumpToEvent(i)}
                sx={{
                  position: 'absolute',
                  left: `${(event.timestamp / totalDuration) * 100}%`,
                  transform: 'translateX(-50%)',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: EVENT_COLORS[event.type],
                  cursor: 'pointer',
                  opacity: i === currentEventIndex ? 1 : 0.5,
                  transition: 'all 0.15s',
                  '&:hover': {
                    transform: 'translateX(-50%) scale(1.5)',
                    opacity: 1,
                  },
                }}
              />
            </Tooltip>
          ))}
        </Box>

        {/* Control buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Tooltip title="Previous event">
            <IconButton
              size="small"
              onClick={() => jumpToEvent(Math.max(0, currentEventIndex - 1))}
              disabled={currentEventIndex <= 0}
            >
              <SkipBackIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Rewind 10s">
            <IconButton size="small" onClick={() => setCurrentTime((prev) => Math.max(0, prev - 10))}>
              <FastRewindIcon />
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={() => setIsPlaying(!isPlaying)}
            sx={{
              bgcolor: tokens.colors.primary,
              color: '#fff',
              '&:hover': { bgcolor: tokens.colors.primary, filter: 'brightness(1.1)' },
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
          <Tooltip title="Forward 10s">
            <IconButton size="small" onClick={() => setCurrentTime((prev) => Math.min(totalDuration, prev + 10))}>
              <FastForwardIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Next event">
            <IconButton
              size="small"
              onClick={() => jumpToEvent(Math.min(MOCK_LEDGER.length - 1, currentEventIndex + 1))}
              disabled={currentEventIndex >= MOCK_LEDGER.length - 1}
            >
              <SkipNextIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <Tooltip title="Playback speed">
            <Chip
              label={`${playbackSpeed}x`}
              size="small"
              onClick={handleSpeedChange}
              sx={{
                cursor: 'pointer',
                bgcolor: tokens.colors.background.elevated,
                fontFamily: tokens.fonts.mono,
              }}
            />
          </Tooltip>
        </Box>
      </Paper>

      {/* Main content: Canvas + Sidebar */}
      <Box sx={{ display: 'flex', flex: 1, gap: 2, minHeight: 0 }}>
        {/* Game canvas placeholder */}
        <Paper
          sx={{
            flex: 2,
            bgcolor: tokens.colors.background.default,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src="/logos/ndg-skull-dome.svg"
              alt="NDG"
              sx={{ width: 64, height: 72, opacity: 0.3, mb: 2 }}
            />
            <Typography sx={{ color: tokens.colors.text.disabled }}>
              Game replay visualization
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              {currentEventIndex >= 0 ? EVENT_LABELS[MOCK_LEDGER[currentEventIndex].type] : 'Loading...'}
            </Typography>
          </Box>

          {/* Event indicator */}
          {currentEventIndex >= 0 && (
            <Chip
              icon={EVENT_ICONS[MOCK_LEDGER[currentEventIndex].type]}
              label={EVENT_LABELS[MOCK_LEDGER[currentEventIndex].type]}
              size="small"
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: tokens.colors.background.elevated,
                color: tokens.colors.text.primary,
                '& .MuiChip-icon': { color: EVENT_COLORS[MOCK_LEDGER[currentEventIndex].type] },
              }}
            />
          )}
        </Paper>

        {/* Event timeline sidebar */}
        <Paper
          sx={{
            width: 280,
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Event Log
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
              {MOCK_LEDGER.length} events recorded
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {MOCK_LEDGER.map((event, i) => (
              <Box
                key={i}
                onClick={() => jumpToEvent(i)}
                sx={{
                  p: 1.5,
                  mb: 0.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  bgcolor: i === currentEventIndex
                    ? tokens.colors.background.elevated
                    : 'transparent',
                  transition: 'all 0.15s',
                  '&:hover': {
                    bgcolor: tokens.colors.background.elevated,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Box sx={{ color: EVENT_COLORS[event.type] }}>
                    {EVENT_ICONS[event.type]}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: i === currentEventIndex ? 600 : 400,
                      fontSize: '0.8rem',
                      color: i === currentEventIndex ? tokens.colors.text.primary : tokens.colors.text.secondary,
                    }}
                  >
                    {EVENT_LABELS[event.type]}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ ml: 'auto', color: tokens.colors.text.disabled, fontFamily: tokens.fonts.mono }}
                  >
                    {formatTime(event.timestamp)}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem' }}
                >
                  {Object.entries(event.payload)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' | ')}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
