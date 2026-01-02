/**
 * Membership - Subscription status and benefits
 */

import { Box, Typography, Button, Chip } from '@mui/material';
import {
  StarSharp as StarIcon,
  CheckCircleSharp as CheckIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardSection } from '../../../components/CardSection';

const freeBenefits = [
  'Core roguelike experience',
  'Access to all domains',
  'Basic character progression',
  'Community features',
];

const premiumBenefits = [
  'All free benefits',
  'Exclusive cosmetics & themes',
  'Priority matchmaking',
  'Extended history & stats',
  'Ad-free experience',
  'Early access to new content',
];

export function MembershipSection() {
  const isPremium = false; // Would come from user context

  return (
    <Box>
      <SectionHeader
        title="Membership"
        subtitle="Your subscription status"
        sx={{ mb: 3 }}
      />

      {/* Current Status */}
      <CardSection sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: isPremium ? `${tokens.colors.rarity.legendary}20` : tokens.colors.background.elevated,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StarIcon
              sx={{
                color: isPremium ? tokens.colors.rarity.legendary : tokens.colors.text.disabled,
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {isPremium ? 'Premium' : 'Free'}
              </Typography>
              <Chip
                label={isPremium ? 'Active' : 'Current Plan'}
                size="small"
                sx={{
                  bgcolor: isPremium ? `${tokens.colors.success}20` : tokens.colors.background.elevated,
                  color: isPremium ? tokens.colors.success : tokens.colors.text.secondary,
                  fontSize: '0.7rem',
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              {isPremium
                ? 'Renews on March 15, 2025'
                : 'Upgrade to unlock premium features'}
            </Typography>
          </Box>
        </Box>

        {!isPremium && (
          <Button
            variant="contained"
            fullWidth
            startIcon={<StarIcon />}
            sx={{
              bgcolor: tokens.colors.rarity.legendary,
              '&:hover': { bgcolor: tokens.colors.rarity.legendary },
            }}
          >
            Upgrade to Premium
          </Button>
        )}
      </CardSection>

      {/* Benefits Comparison */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        {/* Free Tier */}
        <CardSection sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
            Free
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {freeBenefits.map((benefit) => (
              <Box key={benefit} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckIcon sx={{ fontSize: 18, color: tokens.colors.text.secondary, mt: 0.25 }} />
                <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                  {benefit}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardSection>

        {/* Premium Tier */}
        <CardSection
          sx={{
            flex: 1,
            border: `1px solid ${tokens.colors.rarity.legendary}40`,
            bgcolor: `${tokens.colors.rarity.legendary}08`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <StarIcon sx={{ color: tokens.colors.rarity.legendary, fontSize: 20 }} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Premium
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {premiumBenefits.map((benefit) => (
              <Box key={benefit} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckIcon sx={{ fontSize: 18, color: tokens.colors.rarity.legendary, mt: 0.25 }} />
                <Typography variant="body2">{benefit}</Typography>
              </Box>
            ))}
          </Box>
        </CardSection>
      </Box>

      {/* Payment Info (if premium) */}
      {isPremium && (
        <CardSection sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
            Payment Method
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              Visa ending in 4242
            </Typography>
            <Button variant="outlined" size="small">
              Manage
            </Button>
          </Box>
        </CardSection>
      )}
    </Box>
  );
}
