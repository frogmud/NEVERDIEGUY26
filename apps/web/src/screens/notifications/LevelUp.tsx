import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Backdrop,
  Fade,
} from '@mui/material';
import {
  StarSharp as StarIcon,
  ArrowUpwardSharp as UpIcon,
  LocalFireDepartmentSharp as FireIcon,
  ShieldSharp as ShieldIcon,
  SpeedSharp as SpeedIcon,
  FavoriteSharp as HeartIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';

// Mock level up data
const levelUpData = {
  newLevel: 15,
  xpGained: 450,
  statIncreases: [
    { name: 'Fury', icon: FireIcon, before: 24, after: 26, color: tokens.colors.error },
    { name: 'Resilience', icon: ShieldIcon, before: 18, after: 19, color: tokens.colors.secondary },
    { name: 'Swiftness', icon: SpeedIcon, before: 21, after: 22, color: tokens.colors.success },
    { name: 'Grit', icon: HeartIcon, before: 30, after: 32, color: tokens.colors.primary },
  ],
  unlocksText: 'New ability slot unlocked!',
};

export function LevelUp() {
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(true);

  const handleContinue = () => {
    setShowOverlay(false);
    // In real app, navigate to previous page or profile
  };

  const handleReplay = () => {
    setShowOverlay(false);
    setTimeout(() => setShowOverlay(true), 100);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Level Up Notification Demo</Typography>
      <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
        This screen demonstrates the level up celebration overlay.
      </Typography>
      <Button variant="contained" onClick={handleReplay}>
        Show Level Up Animation
      </Button>

      {/* Level Up Overlay */}
      <Backdrop
        open={showOverlay}
        sx={{
          zIndex: 9999,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        }}
      >
        <Fade in={showOverlay}>
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: 400,
              p: 4,
            }}
          >
            {/* Level Badge */}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: `${tokens.colors.primary}20`,
                border: `3px solid ${tokens.colors.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: `0 0 40px ${tokens.colors.primary}60`,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': {
                    boxShadow: `0 0 40px ${tokens.colors.primary}60`,
                  },
                  '50%': {
                    boxShadow: `0 0 60px ${tokens.colors.primary}80`,
                  },
                },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: tokens.colors.primary,
                    lineHeight: 1,
                  }}
                >
                  {levelUpData.newLevel}
                </Typography>
              </Box>
            </Box>

            {/* Title */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: tokens.colors.primary,
              }}
            >
              Level Up!
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: tokens.colors.text.secondary, mb: 3 }}
            >
              +{levelUpData.xpGained} XP earned
            </Typography>

            {/* Stat Increases */}
            <Box
              sx={{
                bgcolor: tokens.colors.background.paper,
                borderRadius: 2,
                border: `1px solid ${tokens.colors.border}`,
                p: 2,
                mb: 3,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: tokens.colors.text.disabled,
                  display: 'block',
                  mb: 2,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Stat Increases
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {levelUpData.statIncreases.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Box
                      key={stat.name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Icon sx={{ fontSize: 18, color: stat.color }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {stat.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                        {stat.before}
                      </Typography>
                      <UpIcon sx={{ fontSize: 14, color: tokens.colors.success }} />
                      <Typography variant="body2" sx={{ color: tokens.colors.success, fontWeight: 600 }}>
                        {stat.after}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Unlock Text */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 3,
                py: 1,
                px: 2,
                bgcolor: `${tokens.colors.rarity.legendary}15`,
                borderRadius: 1,
                border: `1px solid ${tokens.colors.rarity.legendary}50`,
              }}
            >
              <StarIcon sx={{ color: tokens.colors.rarity.legendary }} />
              <Typography variant="body2" sx={{ color: tokens.colors.rarity.legendary }}>
                {levelUpData.unlocksText}
              </Typography>
            </Box>

            {/* Continue Button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              sx={{ minWidth: 200 }}
            >
              Continue
            </Button>
          </Box>
        </Fade>
      </Backdrop>
    </Container>
  );
}
