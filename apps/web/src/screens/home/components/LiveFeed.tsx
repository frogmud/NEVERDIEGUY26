/**
 * LiveFeed - Mixed trailer & flume showcase with navigation links
 *
 * Meta concept: In-universe broadcasts from the NEVER DIE GUY universe
 * Characters, flumes, and locations all exist in this connected world
 * Each clip links to a relevant part of the app (wiki, play, etc.)
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

// Mixed feed: trailers + flumes, all linking to different app areas
const feedItems: FeedItem[] = [
  // Character trailers -> wiki
  {
    id: 'ndg',
    title: 'Never Die Guy',
    subtitle: 'Arena Dominance',
    video: '/assets/videos/cursed/arena-dominance.mp4',
    link: '/wiki/travelers/never-die-guy',
    linkType: 'wiki',
  },
  {
    id: 'mrkevin',
    title: 'Mr. Kevin',
    subtitle: 'Day-Saving Escapade',
    video: '/assets/videos/cursed/heros-entrance.mp4',
    link: '/wiki/travelers/mr-kevin',
    linkType: 'wiki',
  },
  {
    id: 'clausen',
    title: 'Clausen',
    subtitle: 'Wanderings Through the Void',
    video: '/assets/videos/cursed/ambient-loop.mp4',
    link: '/wiki/wanderers/clausen',
    linkType: 'wiki',
  },
  {
    id: 'the-general',
    title: 'The General',
    subtitle: 'Final Stand',
    video: '/assets/videos/cursed/general-frank.mp4',
    link: '/wiki/pantheon/the-general',
    linkType: 'wiki',
  },
  {
    id: 'keith-man',
    title: 'Keith Man',
    subtitle: 'The Enigma',
    video: '/assets/videos/cursed/enigmatic-figure.mp4',
    link: '/shop/keith-man',
    linkType: 'shop',
  },
  {
    id: 'mister-bones',
    title: 'Mister Bones',
    subtitle: 'Grand Entrance',
    video: '/assets/videos/cursed/mister-bones.mp4',
    link: '/wiki/shops/mr-bones-emporium',
    linkType: 'wiki',
  },
  {
    id: 'stitchup-girl',
    title: 'Stitchup Girl',
    subtitle: 'Chaotic Debut',
    video: '/assets/videos/cursed/stitchup-girl.mp4',
    link: '/wiki/wanderers/stitchup-girl',
    linkType: 'wiki',
  },
  // Flumes -> wiki/play
  {
    id: 'flume-null',
    title: 'Flume of Null',
    subtitle: 'Visit The One',
    video: '/assets/flumes/cursed/flume-00001.mp4',
    link: '/wiki/domains/null-providence',
    linkType: 'wiki',
  },
  {
    id: 'flume-earth',
    title: 'Flume of Earth',
    subtitle: 'Visit John',
    video: '/assets/flumes/cursed/flume-00002.mp4',
    link: '/wiki/domains/earth',
    linkType: 'wiki',
  },
  {
    id: 'flume-shadow',
    title: 'Flume of Shadow',
    subtitle: 'Visit Peter',
    video: '/assets/flumes/cursed/flume-00003.mp4',
    link: '/wiki/domains/shadow-keep',
    linkType: 'wiki',
  },
  {
    id: 'flume-infernus',
    title: 'Flume of Infernus',
    subtitle: 'Visit Robert',
    video: '/assets/flumes/cursed/flume-00004.mp4',
    link: '/wiki/domains/infernus',
    linkType: 'wiki',
  },
  {
    id: 'flume-frost',
    title: 'Flume of Frost',
    subtitle: 'Visit Alice',
    video: '/assets/flumes/cursed/flume-00005.mp4',
    link: '/wiki/domains/frost-reach',
    linkType: 'wiki',
  },
  {
    id: 'flume-aberrant',
    title: 'Flume of Aberrant',
    subtitle: 'Visit Jane',
    video: '/assets/flumes/cursed/flume-00006.mp4',
    link: '/wiki/domains/aberrant',
    linkType: 'wiki',
  },
  {
    id: 'arena-preview',
    title: 'Arena Mode',
    subtitle: 'Enter the Gauntlet',
    video: '/assets/flumes/cursed/flume-00007.mp4',
    link: '/play/arena',
    linkType: 'play',
  },
  {
    id: 'vbots-preview',
    title: 'VBots Challenge',
    subtitle: 'Face the Die-rectors',
    video: '/assets/flumes/cursed/flume-00008.mp4',
    link: '/play/vbots',
    linkType: 'play',
  },
  {
    id: 'leaderboard-preview',
    title: 'Leaderboards',
    subtitle: 'Top Players',
    video: '/assets/flumes/cursed/flume-00009.mp4',
    link: '/leaderboard',
    linkType: 'leaderboard',
  },
  {
    id: 'flume-nexus',
    title: 'Return to Nexus',
    subtitle: 'The Hub Awaits',
    video: '/assets/flumes/cursed/flume-00010.mp4',
    link: '/wiki/domains/the-dying-saucer',
    linkType: 'wiki',
  },
  {
    id: 'flume-mystery-1',
    title: 'Unknown Portal',
    subtitle: '???',
    video: '/assets/flumes/cursed/flume-00011.mp4',
    link: '/wiki/domains',
    linkType: 'wiki',
  },
  {
    id: 'flume-mystery-2',
    title: 'Unstable Rift',
    subtitle: 'Danger Ahead',
    video: '/assets/flumes/cursed/flume-00012.mp4',
    link: '/play',
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

export function LiveFeed() {
  const { videoFeedEnabled, setVideoFeedEnabled } = useSettings();
  const [feedIndex, setFeedIndex] = useState(() => Math.floor(Math.random() * feedItems.length));
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
        <CardHeader title="Live Feed" infoTooltip="Broadcasts from the NEVER DIE GUY universe" />
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: tokens.colors.background.elevated,
          }}
        >
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
            Video feed disabled
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
            Enable video
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ borderRadius: '30px', overflow: 'hidden', bgcolor: tokens.colors.background.paper }}>
      {/* Header */}
      <CardHeader
        title="Live Feed"
        infoTooltip="Broadcasts from the NEVER DIE GUY universe"
        action={
          <Tooltip title="Next broadcast" arrow>
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
          Disable video
        </Typography>
      </Box>
    </Box>
  );
}
