/**
 * LiveRightNow - Live video stream widget
 *
 * Shows currently live matches with video player controls.
 */

import { useState } from 'react';
import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material';
import {
  PlayArrowSharp as PlayIcon,
  RefreshSharp as RefreshIcon,
  OpenInNewSharp as OpenInNewIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { InfoTooltip } from '../../../components/ds';

export function LiveRightNow() {
  const [progress] = useState(4); // Small progress to show the red bar

  return (
    <Paper sx={{
      bgcolor: tokens.colors.background.paper,
      borderRadius: '30px',
      overflow: 'hidden',
      border: `1px solid ${tokens.colors.border}`,
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2.25,
        borderBottom: `1px solid ${tokens.colors.border}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1.125rem', whiteSpace: 'nowrap' }}>
            Live Right Now
          </Typography>
          <InfoTooltip title="Watch live matches happening now" />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Tooltip title="Refresh feed" arrow>
            <IconButton size="small" sx={{ color: tokens.colors.text.disabled, p: 0.25 }}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open feed" arrow>
            <IconButton size="small" sx={{ color: tokens.colors.text.disabled, p: 0.25 }}>
              <OpenInNewIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content area with video and controls */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        px: 2,
        pb: 2,
        minHeight: 180,
      }}>
        {/* Video area with play button */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          my: 2,
        }}>
          <PlayButton />
        </Box>

        {/* Video scrubber */}
        <VideoScrubber progress={progress} duration="2:30" />
      </Box>
    </Paper>
  );
}

/** Circular play button */
function PlayButton() {
  return (
    <Box sx={{
      width: 56,
      height: 56,
      borderRadius: '50%',
      bgcolor: tokens.colors.background.elevated,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'transform 0.15s, background-color 0.15s',
      '&:hover': {
        transform: 'scale(1.05)',
        bgcolor: tokens.colors.background.paper,
      },
    }}>
      <PlayIcon sx={{ fontSize: 28, ml: 0.5, color: tokens.colors.text.primary }} />
    </Box>
  );
}

/** Video progress scrubber */
function VideoScrubber({ progress, duration }: { progress: number; duration: string }) {
  return (
    <Box>
      {/* Progress bar */}
      <Box sx={{ position: 'relative', height: 4, mb: 0.5 }}>
        {/* Rail */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: tokens.colors.background.elevated,
          borderRadius: 2,
        }} />
        {/* Track (progress) */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${progress}%`,
          height: 4,
          bgcolor: tokens.colors.primary,
          borderRadius: 2,
        }} />
        {/* Thumb */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: `${progress}%`,
          transform: 'translate(-50%, -50%)',
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: tokens.colors.primary,
          cursor: 'pointer',
        }} />
      </Box>
      {/* Time labels */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary }}>0:00</Typography>
        <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary }}>{duration}</Typography>
      </Box>
    </Box>
  );
}
