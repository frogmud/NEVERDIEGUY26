import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  LockSharp as LockedIcon,
  StarSharp as StarIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';

interface DomainOption {
  slug: string;
  name: string;
  door: number;
  element: string;
  difficulty: string;
  levelRange: string;
  rarity: string;
  unlocked: boolean;
  recommended?: boolean;
}

const domainOptions: DomainOption[] = [
  { slug: 'the-dying-saucer', name: 'The Dying Saucer', door: 0, element: 'Neutral', difficulty: 'Easy', levelRange: '1-50', rarity: 'Unique', unlocked: true, recommended: true },
  { slug: 'earth', name: 'Earth', door: 2, element: 'Earth', difficulty: 'Normal', levelRange: '10-20', rarity: 'Epic', unlocked: true },
  { slug: 'shadow-keep', name: 'Shadow Keep', door: 3, element: 'Death', difficulty: 'Hard', levelRange: '25-35', rarity: 'Epic', unlocked: true },
  { slug: 'infernus', name: 'Infernus', door: 4, element: 'Fire', difficulty: 'Hard', levelRange: '20-30', rarity: 'Epic', unlocked: true },
  { slug: 'frost-reach', name: 'Frost Reach', door: 5, element: 'Ice', difficulty: 'Hard', levelRange: '25-35', rarity: 'Epic', unlocked: false },
  { slug: 'aberrant', name: 'Aberrant', door: 6, element: 'Wind', difficulty: 'Extreme', levelRange: '35-45', rarity: 'Legendary', unlocked: false },
  { slug: 'null-providence', name: 'Null Providence', door: 1, element: 'Void', difficulty: 'Extreme', levelRange: '35-45', rarity: 'Legendary', unlocked: false },
  { slug: 'the-board-room', name: 'The Board Room', door: 7, element: 'Neutral', difficulty: 'Extreme', levelRange: '50', rarity: 'Unique', unlocked: false },
];

const elementColors: Record<string, string> = {
  Void: '#7C4DFF',
  Earth: '#8D6E63',
  Death: '#455A64',
  Fire: '#FF5722',
  Ice: '#00BCD4',
  Wind: '#4CAF50',
  Neutral: '#9E9E9E',
};

const difficultyColors: Record<string, string> = {
  Easy: tokens.colors.success,
  Normal: '#4CAF50',
  Hard: tokens.colors.warning,
  Extreme: tokens.colors.error,
};

export function LocationSelector() {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const handleSelect = (domain: DomainOption) => {
    if (domain.unlocked) {
      setSelectedDomain(domain.slug);
    }
  };

  const handleStart = () => {
    if (selectedDomain) {
      // In real app, would start run with selected domain
      navigate('/play');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: tokens.colors.text.secondary }}
      >
        Back
      </Button>

      <PageHeader
        title="Choose Your Domain"
        subtitle="Select a starting location for your run"
      />

      {/* Domain Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {domainOptions.map((domain) => {
          const isSelected = selectedDomain === domain.slug;
          const rarityColor = RARITY_COLORS[domain.rarity.toLowerCase() as keyof typeof RARITY_COLORS] || tokens.colors.text.primary;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={domain.slug}>
              <Box
                onClick={() => domain.unlocked && handleSelect(domain)}
                sx={{
                  cursor: domain.unlocked ? 'pointer' : 'not-allowed',
                  opacity: domain.unlocked ? 1 : 0.5,
                  transition: 'all 0.2s',
                  '&:hover': domain.unlocked ? {
                    transform: 'translateY(-2px)',
                  } : {},
                }}
              >
              <CardSection
                padding={0}
                sx={{
                  border: isSelected ? `2px solid ${tokens.colors.primary}` : `1px solid ${tokens.colors.border}`,
                  '&:hover': domain.unlocked ? {
                    borderColor: tokens.colors.primary,
                  } : {},
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: `${elementColors[domain.element]}20`,
                    borderBottom: `1px solid ${tokens.colors.border}`,
                    position: 'relative',
                  }}
                >
                  {domain.recommended && (
                    <Chip
                      icon={<StarIcon sx={{ fontSize: 14 }} />}
                      label="Recommended"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: tokens.colors.warning,
                        color: '#000',
                        fontSize: '0.65rem',
                        height: 20,
                      }}
                    />
                  )}
                  {!domain.unlocked && (
                    <LockedIcon
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: tokens.colors.text.disabled,
                      }}
                    />
                  )}
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: tokens.fonts.gaming,
                      fontSize: '0.9rem',
                      color: rarityColor,
                    }}
                  >
                    {domain.name}
                  </Typography>
                  {domain.door > 0 && (
                    <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                      Door {domain.door}
                    </Typography>
                  )}
                </Box>

                {/* Stats */}
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                      Element
                    </Typography>
                    <Chip
                      label={domain.element}
                      size="small"
                      sx={{
                        bgcolor: `${elementColors[domain.element]}30`,
                        color: elementColors[domain.element],
                        fontSize: '0.65rem',
                        height: 20,
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                      Difficulty
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: difficultyColors[domain.difficulty],
                        fontWeight: 600,
                      }}
                    >
                      {domain.difficulty}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                      Level
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      {domain.levelRange}
                    </Typography>
                  </Box>
                </Box>
              </CardSection>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Selected Domain Info */}
      {selectedDomain && (
        <CardSection sx={{ mb: 3, bgcolor: tokens.colors.background.elevated }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                Selected Domain
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: tokens.fonts.gaming }}>
                {domainOptions.find(d => d.slug === selectedDomain)?.name}
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleStart}
            >
              Start Run
            </Button>
          </Box>
        </CardSection>
      )}

      {/* Info */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
          Unlock more domains by completing runs and reaching milestones
        </Typography>
      </Box>
    </Container>
  );
}
