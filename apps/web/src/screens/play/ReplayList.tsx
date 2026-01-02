import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  PlayArrowSharp as PlayIcon,
  SearchSharp as SearchIcon,
  BookmarkSharp as BookmarkIcon,
  BookmarkBorderSharp as BookmarkBorderIcon,
  ShareSharp as ShareIcon,
  DeleteSharp as DeleteIcon,
  CheckCircleSharp as VictoryIcon,
  CancelSharp as DefeatIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';

// Mock replay data
const MOCK_REPLAYS = [
  {
    id: 'abc123',
    threadId: 'F7A2C1',
    date: '2025-12-23',
    duration: '12:34',
    domain: 'The Caverns',
    result: 'victory',
    score: 24500,
    tier: 3,
    bookmarked: true,
  },
  {
    id: 'def456',
    threadId: 'B3E8D9',
    date: '2025-12-22',
    duration: '08:21',
    domain: 'The Forest',
    result: 'defeat',
    score: 12300,
    tier: 2,
    bookmarked: false,
  },
  {
    id: 'ghi789',
    threadId: '9C4F2A',
    date: '2025-12-22',
    duration: '15:47',
    domain: 'The Throne',
    result: 'victory',
    score: 45000,
    tier: 5,
    bookmarked: true,
  },
  {
    id: 'jkl012',
    threadId: 'E1D7B5',
    date: '2025-12-21',
    duration: '06:12',
    domain: 'The Meadow',
    result: 'defeat',
    score: 5400,
    tier: 1,
    bookmarked: false,
  },
  {
    id: 'mno345',
    threadId: 'A8C3F6',
    date: '2025-12-21',
    duration: '11:03',
    domain: 'The Ruins',
    result: 'victory',
    score: 31200,
    tier: 4,
    bookmarked: false,
  },
];

type FilterType = 'All' | 'Victories' | 'Defeats' | 'Bookmarked';

export function ReplayList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<Set<string>>(
    new Set(MOCK_REPLAYS.filter((r) => r.bookmarked).map((r) => r.id))
  );

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleShare = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`ndg://replay/${threadId}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    console.log('Delete replay:', id);
  };

  const filteredReplays = MOCK_REPLAYS.filter((replay) => {
    if (filter === 'Victories' && replay.result !== 'victory') return false;
    if (filter === 'Defeats' && replay.result !== 'defeat') return false;
    if (filter === 'Bookmarked' && !bookmarks.has(replay.id)) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        replay.threadId.toLowerCase().includes(query) ||
        replay.domain.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <Box>
      <PageHeader title="Match Replays" subtitle="Watch and analyze past runs" />

      {/* Search bar */}
      <TextField
        placeholder="Search by Thread ID or Domain..."
        size="small"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: tokens.colors.text.disabled }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            bgcolor: tokens.colors.background.paper,
          },
        }}
      />

      {/* Filter chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        {(['All', 'Victories', 'Defeats', 'Bookmarked'] as FilterType[]).map((f) => (
          <Chip
            key={f}
            label={f}
            onClick={() => setFilter(f)}
            sx={{
              backgroundColor: filter === f ? tokens.colors.background.elevated : 'transparent',
              borderColor: filter === f ? tokens.colors.text.secondary : tokens.colors.border,
              border: '1px solid',
              fontWeight: filter === f ? 600 : 400,
            }}
          />
        ))}
      </Box>

      {/* Replay list */}
      <Paper
        sx={{
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {filteredReplays.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: tokens.colors.text.disabled }}>
              No replays found
            </Typography>
          </Box>
        ) : (
          filteredReplays.map((replay, i) => (
            <Box
              key={replay.id}
              onClick={() => navigate(`/play/replay/${replay.threadId}`)}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderBottom:
                  i < filteredReplays.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': {
                  backgroundColor: tokens.colors.background.elevated,
                },
                '&:hover .action-btns': {
                  opacity: 1,
                },
              }}
            >
              {/* Result icon */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: tokens.colors.background.elevated,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {replay.result === 'victory' ? (
                  <VictoryIcon sx={{ color: tokens.colors.success, fontSize: 20 }} />
                ) : (
                  <DefeatIcon sx={{ color: tokens.colors.text.disabled, fontSize: 20 }} />
                )}
              </Box>

              {/* Main info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <Typography
                    sx={{
                      fontFamily: tokens.fonts.mono,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {replay.threadId}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: tokens.colors.text.disabled,
                      fontSize: '0.7rem',
                    }}
                  >
                    Tier {replay.tier}
                  </Typography>
                  {bookmarks.has(replay.id) && (
                    <BookmarkIcon sx={{ fontSize: 14, color: tokens.colors.warning }} />
                  )}
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: tokens.colors.text.secondary, fontSize: '0.75rem' }}
                >
                  {replay.domain} | {replay.date} | {replay.duration}
                </Typography>
              </Box>

              {/* Score */}
              <Box sx={{ textAlign: 'right', mr: 1 }}>
                <Typography
                  sx={{
                    fontFamily: tokens.fonts.mono,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: tokens.colors.text.primary,
                  }}
                >
                  {replay.score.toLocaleString()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: tokens.colors.text.disabled, fontSize: '0.65rem' }}
                >
                  {replay.result === 'victory' ? 'Archived' : 'Corrupted'}
                </Typography>
              </Box>

              {/* Action buttons */}
              <Box
                className="action-btns"
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  opacity: 0,
                  transition: 'opacity 0.15s',
                }}
              >
                <Tooltip title="Watch">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/play/replay/${replay.threadId}`);
                    }}
                  >
                    <PlayIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={bookmarks.has(replay.id) ? 'Remove bookmark' : 'Bookmark'}>
                  <IconButton size="small" onClick={(e) => toggleBookmark(e, replay.id)}>
                    {bookmarks.has(replay.id) ? (
                      <BookmarkIcon fontSize="small" sx={{ color: tokens.colors.warning }} />
                    ) : (
                      <BookmarkBorderIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Copy link">
                  <IconButton size="small" onClick={(e) => handleShare(e, replay.threadId)}>
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={(e) => handleDelete(e, replay.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))
        )}
      </Paper>

      {/* Stats summary */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Paper
          sx={{
            flex: 1,
            p: 2,
            textAlign: 'center',
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography variant="h5" sx={{ fontFamily: tokens.fonts.mono, fontWeight: 600 }}>
            {MOCK_REPLAYS.filter((r) => r.result === 'victory').length}
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
            Victories
          </Typography>
        </Paper>
        <Paper
          sx={{
            flex: 1,
            p: 2,
            textAlign: 'center',
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography variant="h5" sx={{ fontFamily: tokens.fonts.mono, fontWeight: 600 }}>
            {MOCK_REPLAYS.filter((r) => r.result === 'defeat').length}
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
            Defeats
          </Typography>
        </Paper>
        <Paper
          sx={{
            flex: 1,
            p: 2,
            textAlign: 'center',
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography variant="h5" sx={{ fontFamily: tokens.fonts.mono, fontWeight: 600 }}>
            {Math.round(
              (MOCK_REPLAYS.filter((r) => r.result === 'victory').length / MOCK_REPLAYS.length) *
                100
            )}
            %
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
            Win Rate
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
