import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  VisibilitySharp as ViewersIcon,  // Used in header
  ChatSharp as ChatIcon,
  SendSharp as SendIcon,
  FavoriteSharp as HeartIcon,
  FavoriteBorderSharp as HeartBorderIcon,
  VolumeUpSharp as VolumeIcon,
  VolumeOffSharp as MuteIcon,
  FullscreenSharp as FullscreenIcon,
  LocalFireDepartmentSharp as HeatIcon,
  StarSharp as FavorIcon,
  RemoveSharp as MinimizeIcon,
  AddSharp as ExpandIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';

// Mock chat messages
const MOCK_CHAT = [
  { id: 1, user: 'DiceKing99', message: 'nice combo!', time: '2:34' },
  { id: 2, user: 'NDGFan', message: 'go for the boss door', time: '2:35' },
  { id: 3, user: 'RollMaster', message: 'that d20 roll was insane', time: '2:36' },
  { id: 4, user: 'LuckyDice', message: 'what tier is this?', time: '2:37' },
  { id: 5, user: 'CasinoKing', message: 'tier 4 i think', time: '2:37' },
];

// Mock live stats
interface LiveStats {
  score: number;
  gold: number;
  domain: string;
  room: number;
  tier: number;
  heat: number;
  favor: number;
}

export function SpectateMode() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [viewerCount, setViewerCount] = useState(127);
  const [stats, setStats] = useState<LiveStats>({
    score: 18420,
    gold: 340,
    domain: 'The Ruins',
    room: 2,
    tier: 4,
    heat: 2,
    favor: 1,
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 3) - 1);
      setStats((prev) => ({
        ...prev,
        score: prev.score + Math.floor(Math.random() * 200),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendChat = () => {
    if (chatMessage.trim()) {
      // Would send via websocket in production
      setChatMessage('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <BackIcon />
        </IconButton>

        {/* Player info */}
        <Avatar sx={{ width: 40, height: 40, bgcolor: tokens.colors.primary }}>P</Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              ProDicer420
            </Typography>
            <Chip
              label="LIVE"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.6rem',
                bgcolor: tokens.colors.error,
                color: '#fff',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ViewersIcon sx={{ fontSize: 14, color: tokens.colors.text.secondary }} />
            <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
              {viewerCount} watching
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Tooltip title={isFollowing ? 'Unfollow' : 'Follow'}>
          <IconButton onClick={() => setIsFollowing(!isFollowing)}>
            {isFollowing ? (
              <HeartIcon sx={{ color: tokens.colors.error }} />
            ) : (
              <HeartBorderIcon />
            )}
          </IconButton>
        </Tooltip>
        <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
          <IconButton onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <MuteIcon /> : <VolumeIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Fullscreen">
          <IconButton>
            <FullscreenIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main content */}
      <Box sx={{ display: 'flex', flex: 1, gap: 2, minHeight: 0 }}>
        {/* Game view + stats */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Game canvas placeholder */}
          <Paper
            sx={{
              flex: 1,
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
                Live game stream
              </Typography>
            </Box>

            {/* Live indicator */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: 'rgba(0,0,0,0.7)',
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: tokens.colors.error,
                  animation: 'blink 1s infinite',
                  '@keyframes blink': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.3 },
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>
                LIVE
              </Typography>
            </Box>
          </Paper>

          {/* Live stats bar */}
          <Paper
            sx={{
              p: 2,
              bgcolor: tokens.colors.background.paper,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.2rem', color: tokens.colors.success }}
                >
                  {stats.score.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  Score
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.2rem', color: '#c4a000' }}>
                  {stats.gold}
                </Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  Gold
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1rem' }}>{stats.domain}</Typography>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  Room {stats.room}/3
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  label={`T${stats.tier}`}
                  size="small"
                  sx={{ bgcolor: `${tokens.colors.secondary}20`, color: tokens.colors.secondary }}
                />
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary, display: 'block' }}>
                  Tier
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <HeatIcon sx={{ fontSize: 16, color: tokens.colors.error }} />
                  <Typography sx={{ color: tokens.colors.error }}>{stats.heat}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  Heat
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  <FavorIcon sx={{ fontSize: 16, color: tokens.colors.success }} />
                  <Typography sx={{ color: tokens.colors.success }}>{stats.favor}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  Favor
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Chat sidebar */}
        <Paper
          sx={{
            width: isChatMinimized ? 'auto' : 300,
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.2s ease',
          }}
        >
          {/* Chat header */}
          <Box
            sx={{
              p: isChatMinimized ? 1 : 2,
              borderBottom: isChatMinimized ? 'none' : `1px solid ${tokens.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <ChatIcon sx={{ fontSize: 18 }} />
            {!isChatMinimized && (
              <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                Live Chat
              </Typography>
            )}
            <Tooltip title={isChatMinimized ? 'Expand chat' : 'Minimize chat'}>
              <IconButton size="small" onClick={() => setIsChatMinimized(!isChatMinimized)}>
                {isChatMinimized ? <ExpandIcon fontSize="small" /> : <MinimizeIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>

          {!isChatMinimized && (
            <>
              {/* Chat messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                {MOCK_CHAT.map((msg) => (
                  <Box key={msg.id} sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: tokens.colors.secondary,
                          fontSize: '0.8rem',
                        }}
                      >
                        {msg.user}
                      </Typography>
                      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                        {msg.time}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                      {msg.message}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Chat input */}
              <Box sx={{ p: 1, borderTop: `1px solid ${tokens.colors.border}` }}>
                <TextField
                  placeholder="Send a message..."
                  size="small"
                  fullWidth
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleSendChat} disabled={!chatMessage.trim()}>
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: tokens.colors.background.elevated,
                    },
                  }}
                />
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
