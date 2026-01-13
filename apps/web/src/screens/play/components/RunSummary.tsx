/**
 * RunSummary - Post-combat room clear summary
 *
 * Balatro-style center panel showing results before shop.
 * NEVER DIE GUY
 */

import { Box, Typography, Button, Fade } from '@mui/material';
import { CheckCircleSharp as CheckIcon } from '@mui/icons-material';
import { tokens } from '../../../theme';

interface RunSummaryProps {
  score: number;
  gold: number;
  totalScore: number;
  totalGold: number;
  domainName?: string;
  domainProgress: { cleared: number; total: number };
  eventType?: 'small' | 'big' | 'boss';
  onContinue: () => void;
}

export function RunSummary({
  score,
  gold,
  totalScore,
  totalGold,
  domainName,
  domainProgress,
  eventType = 'small',
  onContinue,
}: RunSummaryProps) {
  // Title based on event type
  const title = eventType === 'boss' ? 'BOSS DEFEATED' : eventType === 'big' ? 'ELITE CLEARED' : 'ROOM CLEARED';
  const titleColor = eventType === 'boss' ? '#ff9800' : eventType === 'big' ? tokens.colors.secondary : tokens.colors.success;

  return (
    <Fade in={true} timeout={300}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 4,
          p: 4,
          bgcolor: `${tokens.colors.background.default}f0`,
        }}
      >
        {/* Victory icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: `${titleColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `3px solid ${titleColor}`,
          }}
        >
          <CheckIcon sx={{ fontSize: 48, color: titleColor }} />
        </Box>

        {/* Title */}
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '2.5rem',
            color: titleColor,
            textShadow: `0 0 20px ${titleColor}40`,
            letterSpacing: 4,
          }}
        >
          {title}
        </Typography>

        {/* Stats row */}
        <Box
          sx={{
            display: 'flex',
            gap: 6,
            p: 3,
            bgcolor: tokens.colors.background.paper,
            borderRadius: 3,
            border: `1px solid ${tokens.colors.border}`,
          }}
        >
          {/* Score gained */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '2.5rem',
                color: tokens.colors.primary,
              }}
            >
              +{score.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary, textTransform: 'uppercase', letterSpacing: 2 }}>
              Score
            </Typography>
          </Box>

          {/* Gold earned */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '2.5rem',
                color: '#ffd700',
              }}
            >
              +{gold}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary, textTransform: 'uppercase', letterSpacing: 2 }}>
              Gold
            </Typography>
          </Box>
        </Box>

        {/* Domain progress */}
        {domainName && (
          <Typography sx={{ color: tokens.colors.text.secondary }}>
            {domainName}: {domainProgress.cleared}/{domainProgress.total} zones cleared
          </Typography>
        )}

        {/* Totals */}
        <Box sx={{ display: 'flex', gap: 4, opacity: 0.7 }}>
          <Typography sx={{ fontSize: '0.875rem', color: tokens.colors.text.secondary }}>
            Total Score: <span style={{ color: tokens.colors.primary }}>{totalScore.toLocaleString()}</span>
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: tokens.colors.text.secondary }}>
            Total Gold: <span style={{ color: '#ffd700' }}>{totalGold}</span>
          </Typography>
        </Box>

        {/* Continue button */}
        <Button
          variant="contained"
          size="large"
          onClick={onContinue}
          sx={{
            mt: 2,
            bgcolor: tokens.colors.success,
            fontFamily: tokens.fonts.gaming,
            fontSize: '1.5rem',
            px: 6,
            py: 2,
            borderRadius: 2,
            boxShadow: `0 0 20px ${tokens.colors.success}40`,
            '&:hover': {
              bgcolor: tokens.colors.success,
              boxShadow: `0 0 30px ${tokens.colors.success}60`,
              transform: 'scale(1.02)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          CONTINUE TO SHOP
        </Button>
      </Box>
    </Fade>
  );
}
