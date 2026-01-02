import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  CasinoSharp as DiceIcon,
  GroupsSharp as CommunityIcon,
  AutoAwesomeSharp as MagicIcon,
  PublicSharp as GlobalIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';

const stats = [
  { label: 'Players', value: '2M+' },
  { label: 'Dice Rolled', value: '500M+' },
  { label: 'Items Traded', value: '10M+' },
  { label: 'Years Running', value: '3+' },
];

const values = [
  {
    icon: DiceIcon,
    title: 'Fair Play',
    description: 'Every roll matters. Our RNG is cryptographically verified and auditable.',
  },
  {
    icon: CommunityIcon,
    title: 'Community First',
    description: 'Built by players, for players. Your feedback shapes our roadmap.',
  },
  {
    icon: MagicIcon,
    title: 'Endless Discovery',
    description: 'No two runs are the same. Procedural content keeps you exploring.',
  },
  {
    icon: GlobalIcon,
    title: 'Play Anywhere',
    description: 'Cross-platform progression. Your runs persist forever.',
  },
];

export function AboutUs() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 2 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: tokens.colors.text.secondary }}
      >
        Back
      </Button>

      <PageHeader
        title="About NEVER DIE GUY"
        subtitle="A dice roguelike where death is just the beginning."
      />

      {/* Hero */}
      <Box
        sx={{
          textAlign: 'center',
          p: 4,
          mb: 4,
          bgcolor: tokens.colors.background.elevated,
          borderRadius: 2,
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: tokens.colors.primary,
          }}
        >
          <DiceIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h5" sx={{ fontFamily: tokens.fonts.gaming, mb: 2 }}>
          A Dice-Based Roguelike
        </Typography>
        <Typography variant="body1" sx={{ color: tokens.colors.text.secondary, maxWidth: 500, mx: 'auto' }}>
          NEVER DIE GUY is a community-driven roguelike where every roll of the dice
          shapes your destiny. Trade items, challenge friends, and build legendary characters
          across procedurally generated domains.
        </Typography>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 2,
          mb: 4,
        }}
      >
        {stats.map((stat) => (
          <CardSection key={stat.label} sx={{ textAlign: 'center', py: 3 }}>
            <Typography
              variant="h4"
              sx={{ fontFamily: tokens.fonts.gaming, color: tokens.colors.primary }}
            >
              {stat.value}
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
              {stat.label}
            </Typography>
          </CardSection>
        ))}
      </Box>

      {/* Our Story */}
      <CardSection sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Our Story</Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
          NEVER DIE GUY started as a passion project in 2022, born from a love of classic
          roguelikes and tabletop dice games. What began as a simple prototype has grown
          into a thriving community of players who share our belief that the best games
          are built together.
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
          Today, we're a small but dedicated team committed to creating a fair, fun, and
          endlessly replayable experience. Every update is shaped by player feedback, and
          every feature is designed to enhance the core dice-rolling gameplay that makes
          each run unique.
        </Typography>
      </CardSection>

      {/* Values */}
      <Typography variant="h6" sx={{ mb: 2 }}>Our Values</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 4 }}>
        {values.map((value) => {
          const Icon = value.icon;
          return (
            <CardSection key={value.title}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ bgcolor: `${tokens.colors.primary}20` }}>
                  <Icon sx={{ color: tokens.colors.primary }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                    {value.description}
                  </Typography>
                </Box>
              </Box>
            </CardSection>
          );
        })}
      </Box>

      {/* Brand */}
      <CardSection sx={{ bgcolor: tokens.colors.background.elevated }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              NEVER DIE GUY
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
              USPTO Serial #99074782
            </Typography>
          </Box>
          <Chip label="Kevin Grzejka Design LLC" size="small" variant="outlined" />
        </Box>
      </CardSection>
    </Box>
  );
}
