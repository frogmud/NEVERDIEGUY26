/**
 * EventTimer - Countdown timer with visual states.
 * Shows the event countdown with color escalation and a grace-period marker.
 * Lifted out of CombatTerminal (behavior unchanged).
 */
import { Box, Typography, LinearProgress } from '@mui/material';
import { FLAT_EVENT_CONFIG } from '@ndg/ai-engine';
import { tokens } from '../../../../theme';

export function EventTimer({
  timeRemainingMs,
  isGracePeriod,
  isPaused,
}: {
  timeRemainingMs: number;
  isGracePeriod: boolean;
  isPaused: boolean;
}) {
  const { eventDurationMs, gracePeriodMs } = FLAT_EVENT_CONFIG;
  const progress = (timeRemainingMs / eventDurationMs) * 100;
  const seconds = Math.ceil(timeRemainingMs / 1000);

  // Color thresholds (from TIMER_BALANCE_SPEC)
  // 45-30s: Green, 30-15s: Yellow, 15-5s: Orange, 5-0s: Red
  const getTimerColor = () => {
    if (isGracePeriod) return tokens.colors.secondary; // Blue during grace
    if (seconds > 30) return tokens.colors.success; // Green
    if (seconds > 15) return tokens.colors.warning; // Yellow
    if (seconds > 5) return tokens.colors.rarity.legendary; // Orange
    return tokens.colors.error; // Red
  };

  const color = getTimerColor();

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* Timer bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 1,
          bgcolor: 'rgba(255,255,255,0.1)',
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
            transition: isPaused ? 'none' : 'transform 0.1s linear',
          },
        }}
      />
      {/* Grace period marker */}
      <Box
        sx={{
          position: 'absolute',
          right: `${(gracePeriodMs / eventDurationMs) * 100}%`,
          top: 0,
          width: 2,
          height: 6,
          bgcolor: 'rgba(255,255,255,0.4)',
        }}
      />
      {/* Time display - simplified, just seconds */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '0.85rem',
            fontWeight: 700,
            color,
            textShadow: seconds <= 5 ? `0 0 8px ${color}` : 'none',
          }}
        >
          {seconds}s
        </Typography>
      </Box>
    </Box>
  );
}
