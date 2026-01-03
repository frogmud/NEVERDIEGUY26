/**
 * ChallengeFlume - Domain teleporter system with global hourly rotation
 *
 * All players see the same domain each hour (community feel).
 * Cycles through domains with enhanced difficulty and rewards.
 * Reset allowed if first challenge incomplete, auto-resets after 3 hours.
 */

import { useState, useRef, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import {
  VolumeUpSharp as VolumeIcon,
  VolumeOffSharp as MuteIcon,
  RefreshSharp as RefreshIcon,
  OpenInNewSharp as LinkIcon,
  PlayArrowSharp as PlayIcon,
  PauseSharp as PauseIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { CardHeader } from '../../../components/ds';
import { useSettings } from '../../../contexts/SettingsContext';

interface FeedItem {
  id: string;
  title: string;
  subtitle: string;
  video: string;
  link: string; // where to navigate
  linkType: 'wiki' | 'play' | 'leaderboard' | 'shop';
}

// Domain flumes only - link to /play for actual gameplay
const feedItems: FeedItem[] = [
  {
    id: 'flume-null',
    title: 'Null Providence',
    subtitle: 'Challenge The One',
    video: '/assets/flumes/cursed/flume-00001.mp4',
    link: '/play?domain=null-providence',
    linkType: 'play',
  },
  {
    id: 'flume-earth',
    title: 'Earth',
    subtitle: 'Challenge John',
    video: '/assets/flumes/cursed/flume-00002.mp4',
    link: '/play?domain=earth',
    linkType: 'play',
  },
  {
    id: 'flume-shadow',
    title: 'Shadow Keep',
    subtitle: 'Challenge Peter',
    video: '/assets/flumes/cursed/flume-00003.mp4',
    link: '/play?domain=shadow-keep',
    linkType: 'play',
  },
  {
    id: 'flume-infernus',
    title: 'Infernus',
    subtitle: 'Challenge Robert',
    video: '/assets/flumes/cursed/flume-00004.mp4',
    link: '/play?domain=infernus',
    linkType: 'play',
  },
  {
    id: 'flume-frost',
    title: 'Frost Reach',
    subtitle: 'Challenge Alice',
    video: '/assets/flumes/cursed/flume-00005.mp4',
    link: '/play?domain=frost-reach',
    linkType: 'play',
  },
  {
    id: 'flume-aberrant',
    title: 'Aberrant',
    subtitle: 'Challenge Jane',
    video: '/assets/flumes/cursed/flume-00006.mp4',
    link: '/play?domain=aberrant',
    linkType: 'play',
  },
];

// Link type colors
const linkTypeColors: Record<FeedItem['linkType'], string> = {
  wiki: tokens.colors.secondary,
  play: tokens.colors.primary,
  leaderboard: tokens.colors.rarity.legendary,
  shop: tokens.colors.rarity.rare,
};

// Calculate global hourly index - same for all players
function getGlobalFlumeIndex(): number {
  const hoursSinceEpoch = Math.floor(Date.now() / (60 * 60 * 1000));
  return hoursSinceEpoch % feedItems.length;
}

export function ChallengeFlume() {
  const { videoFeedEnabled, setVideoFeedEnabled } = useSettings();
  // Global rotation: all players see same domain each hour
  const [feedIndex, setFeedIndex] = useState(getGlobalFlumeIndex);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeItem = feedItems[feedIndex];

  // Refresh to next item
  const goToNext = () => {
    setFeedIndex((feedIndex + 1) % feedItems.length);
  };

  // Play/pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Reload and play video when item changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [feedIndex]);

  // If video feed is disabled, show minimal re-enable option
  if (!videoFeedEnabled) {
    return (
      <Box sx={{ borderRadius: '30px', overflow: 'hidden', bgcolor: tokens.colors.background.paper }}>
        <CardHeader title="Challenge Flume" infoTooltip="Domain teleporter - rotates hourly, same for all players" />
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: tokens.colors.background.elevated,
          }}
        >
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
            Challenge Flume disabled
          </Typography>
          <Typography
            component="button"
            onClick={() => setVideoFeedEnabled(true)}
            sx={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: tokens.colors.secondary,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Enable flume
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ borderRadius: '30px', overflow: 'hidden', bgcolor: tokens.colors.background.paper }}>
      {/* Header */}
      <CardHeader
        title="Challenge Flume"
        infoTooltip="Domain teleporter - rotates hourly, same for all players. Enhanced difficulty and rewards."
        action={
          <Tooltip title="Next domain" arrow>
            <IconButton
              onClick={goToNext}
              size="small"
              sx={{ color: tokens.colors.text.disabled }}
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        }
      />

      {/* Video Container */}
      <Box sx={{ position: 'relative', aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        >
          <source src={activeItem.video} type="video/mp4" />
        </video>

        {/* Play/Pause button - center when paused, corner when playing */}
        {!isPlaying ? (
          <Box
            onClick={togglePlay}
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <IconButton
              sx={{
                color: tokens.colors.text.primary,
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                p: 1,
              }}
            >
              <PlayIcon sx={{ fontSize: 28, ml: 0.25 }} />
            </IconButton>
          </Box>
        ) : (
          <IconButton
            onClick={togglePlay}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              color: tokens.colors.text.primary,
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <PauseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}

        {/* Mute Toggle - only show when playing */}
        {isPlaying && (
          <IconButton
            onClick={() => setIsMuted(!isMuted)}
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              bgcolor: 'rgba(0,0,0,0.7)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.85)' },
            }}
            size="small"
          >
            {isMuted ? (
              <MuteIcon sx={{ fontSize: 18, color: tokens.colors.text.secondary }} />
            ) : (
              <VolumeIcon sx={{ fontSize: 18, color: tokens.colors.text.primary }} />
            )}
          </IconButton>
        )}

      </Box>

      {/* Item Title & Link */}
      <Box
        component={RouterLink}
        to={activeItem.link}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'background-color 0.15s',
          '&:hover': { bgcolor: tokens.colors.background.elevated },
        }}
      >
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.9rem',
            color: linkTypeColors[activeItem.linkType],
          }}
        >
          {activeItem.title}
        </Typography>
        <LinkIcon sx={{ fontSize: 18, color: tokens.colors.text.disabled }} />
      </Box>

      {/* Disable option */}
      <Box
        sx={{
          py: 1.5,
          borderTop: `1px solid ${tokens.colors.border}`,
          textAlign: 'center',
        }}
      >
        <Typography
          component="button"
          onClick={() => setVideoFeedEnabled(false)}
          sx={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: tokens.colors.text.disabled,
            '&:hover': { color: tokens.colors.text.secondary },
          }}
        >
          Disable flume
        </Typography>
      </Box>
    </Box>
  );
}

// Keep LiveFeed export for backwards compatibility
export { ChallengeFlume as LiveFeed };
