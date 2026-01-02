import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  CardGiftcardSharp as GiftIcon,
  LocalFireDepartmentSharp as FireIcon,
  StarSharp as StarIcon,
  CheckCircleSharp as CheckIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';
import {
  loadDailyReward,
  saveDailyReward,
  getTodayDateString,
  canClaimToday,
  type DailyRewardData,
} from '../../data/player/storage';

// Reward definitions for each day
const REWARD_DEFINITIONS = [
  { day: 1, reward: '50 Gold', icon: 'gold' },
  { day: 2, reward: '100 Gold', icon: 'gold' },
  { day: 3, reward: 'Potion x2', icon: 'potion' },
  { day: 4, reward: '200 Gold', icon: 'gold' },
  { day: 5, reward: 'Rare Candy', icon: 'candy' },
  { day: 6, reward: '500 Gold', icon: 'gold' },
  { day: 7, reward: 'Mystery Box', icon: 'mystery', special: true },
];

export function DailyReward() {
  const [rewardData, setRewardData] = useState<DailyRewardData>(loadDailyReward);
  const [showClaimed, setShowClaimed] = useState(false);
  const [claimedReward, setClaimedReward] = useState<string | null>(null);

  // Check if streak was broken (missed a day)
  useEffect(() => {
    const data = loadDailyReward();
    if (data.lastClaimDate) {
      const lastClaim = new Date(data.lastClaimDate);
      const today = new Date(getTodayDateString());
      const diffDays = Math.floor((today.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));

      // If more than 1 day passed, reset streak
      if (diffDays > 1) {
        const resetData = { ...data, currentStreak: 0, weekProgress: [] };
        saveDailyReward(resetData);
        setRewardData(resetData);
      }
    }
  }, []);

  // Build weekly rewards based on progress
  const weeklyRewards = useMemo(() => {
    const currentDay = (rewardData.weekProgress.length % 7) + 1;
    const canClaim = canClaimToday(rewardData);

    return REWARD_DEFINITIONS.map((def) => ({
      ...def,
      claimed: rewardData.weekProgress.includes(def.day),
      isToday: def.day === currentDay && canClaim,
    }));
  }, [rewardData]);

  const todayReward = weeklyRewards.find(r => r.isToday);

  const handleClaim = () => {
    if (!todayReward || !canClaimToday(rewardData)) return;

    const newProgress = [...rewardData.weekProgress, todayReward.day];
    // Reset week if completed
    const weekProgress = newProgress.length >= 7 ? [] : newProgress;

    const updatedData: DailyRewardData = {
      lastClaimDate: getTodayDateString(),
      currentStreak: rewardData.currentStreak + 1,
      weekProgress,
      totalClaimed: rewardData.totalClaimed + 1,
    };

    saveDailyReward(updatedData);
    setRewardData(updatedData);
    setClaimedReward(todayReward.reward);
    setShowClaimed(true);
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <PageHeader title="Daily Rewards" subtitle="Claim your daily bonus" />

      {/* Streak Banner */}
      <CardSection padding={2} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: `${tokens.colors.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FireIcon sx={{ fontSize: 24, color: tokens.colors.primary }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            Current Streak
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {rewardData.currentStreak} Days
          </Typography>
        </Box>
      </CardSection>

      {/* Today's Reward - Featured */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Today's Reward
        </Typography>
        <CardSection
          padding={3}
          sx={{
            textAlign: 'center',
            border: `1px solid ${todayReward ? tokens.colors.primary : tokens.colors.success}50`,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: todayReward ? `${tokens.colors.primary}20` : `${tokens.colors.success}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            {todayReward ? (
              <GiftIcon sx={{ fontSize: 40, color: tokens.colors.primary }} />
            ) : (
              <CheckIcon sx={{ fontSize: 40, color: tokens.colors.success }} />
            )}
          </Box>
          {todayReward ? (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {todayReward.reward}
              </Typography>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
                Day {todayReward.day} of 7
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleClaim}
                sx={{ minWidth: 200 }}
              >
                Claim Reward
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: tokens.colors.success }}>
                Claimed!
              </Typography>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                Come back tomorrow for your next reward
              </Typography>
            </>
          )}
        </CardSection>
      </Box>

      {/* Weekly Progress */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        This Week
      </Typography>
      <CardSection padding={2}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
          }}
        >
          {weeklyRewards.map((day) => (
            <Box
              key={day.day}
              sx={{
                textAlign: 'center',
                opacity: day.claimed ? 0.6 : 1,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: 1,
                  bgcolor: day.isToday
                    ? `${tokens.colors.primary}20`
                    : day.special
                    ? `${tokens.colors.rarity.legendary}15`
                    : tokens.colors.background.elevated,
                  border: day.isToday
                    ? `2px solid ${tokens.colors.primary}`
                    : day.special
                    ? `2px solid ${tokens.colors.rarity.legendary}`
                    : `1px solid ${tokens.colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 0.5,
                  position: 'relative',
                }}
              >
                {day.claimed ? (
                  <CheckIcon sx={{ color: tokens.colors.success }} />
                ) : day.special ? (
                  <StarIcon sx={{ color: tokens.colors.rarity.legendary }} />
                ) : (
                  <GiftIcon
                    sx={{
                      color: day.isToday
                        ? tokens.colors.primary
                        : tokens.colors.text.disabled,
                    }}
                  />
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: day.isToday
                    ? tokens.colors.primary
                    : tokens.colors.text.secondary,
                  fontWeight: day.isToday ? 600 : 400,
                }}
              >
                Day {day.day}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardSection>

      {/* Claim Confirmation Dialog */}
      <Dialog
        open={showClaimed}
        onClose={() => setShowClaimed(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: `${tokens.colors.success}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckIcon sx={{ fontSize: 40, color: tokens.colors.success }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Reward Claimed!
          </Typography>
          <Typography variant="h6" sx={{ color: tokens.colors.primary, mb: 1 }}>
            {claimedReward}
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
            Come back tomorrow for more rewards!
          </Typography>
          <Button
            variant="contained"
            onClick={() => setShowClaimed(false)}
          >
            Continue
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
