import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  Chip,
  Grid,
  Skeleton,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  GroupsSharp as MembersIcon,
  PlaceSharp as TerritoryIcon,
  GavelSharp as PhilosophyIcon,
  PersonSharp as LeaderIcon,
  EmojiEventsSharp as GoalIcon,
} from '@mui/icons-material';
import { tokens, RARITY_COLORS } from '../../theme';
import { CardSection } from '../../components/CardSection';
import { SectionHeader } from '../../components/SectionHeader';

interface Faction {
  slug: string;
  name: string;
  motto: string;
  element: string;
  color: string;
  philosophy: string;
  territory: string;
  leader: string;
  memberCount: string;
  goals: string[];
  allies: string[];
  rivals: string[];
  notableMembers: {
    name: string;
    role: string;
    rarity: string;
  }[];
  beliefs: string[];
  history: string;
}

const factions: Record<string, Faction> = {
  'die-rectors': {
    slug: 'die-rectors',
    name: 'The Die-rectors',
    motto: 'The dice decide. We interpret.',
    element: 'All',
    color: '#7C4DFF',
    philosophy: 'The Die-rectors believe that probability is the fundamental force of the universe. Each roll of the dice represents a moment where reality chooses its path. They are not gods, but stewards of chance.',
    territory: 'Each Die-rector controls one of the eight Doors and its associated domain.',
    leader: 'The One (First Among Equals)',
    memberCount: '11 Die-rectors',
    goals: [
      'Maintain balance across all domains',
      'Guide travelers through their journeys',
      'Collect and redistribute probability',
      'Prevent any single outcome from becoming certain',
    ],
    allies: ['Wanderers', 'Travelers (sometimes)'],
    rivals: ['Those who seek to control fate'],
    notableMembers: [
      { name: 'The One', role: 'Overseer of Null Providence', rarity: 'Legendary' },
      { name: 'John', role: 'Master of Mechanarium', rarity: 'Legendary' },
      { name: 'Peter', role: 'Keeper of Shadow Keep', rarity: 'Legendary' },
      { name: 'Robert', role: 'Lord of Infernus', rarity: 'Legendary' },
      { name: 'Alice', role: 'Guardian of Frost Reach', rarity: 'Legendary' },
      { name: 'Jane', role: 'Mistress of the Aberrant', rarity: 'Legendary' },
    ],
    beliefs: [
      'Death is a transition, not an ending',
      'Every outcome has equal right to exist',
      'Probability must flow freely between domains',
      'The dice are sacred instruments of fate',
    ],
    history: 'The Die-rectors emerged during the Age of Doors, each claiming dominion over one of the fundamental aspects of reality. They are neither friends nor enemies to each other, but bound by their shared duty to the cosmic game.',
  },
  'travelers': {
    slug: 'travelers',
    name: 'The Travelers',
    motto: 'We die. We learn. We return.',
    element: 'Varied',
    color: '#4CAF50',
    philosophy: 'Travelers are mortals who have learned to navigate the domains. Each death teaches something new. Each return brings them closer to understanding the nature of existence itself.',
    territory: 'No fixed territory. Travelers roam freely between domains.',
    leader: 'No formal leader (Never Die Guy is de facto spokesperson)',
    memberCount: '~50 active travelers',
    goals: [
      'Master each domain through experience',
      'Accumulate power and knowledge',
      'Discover the truth behind the Doors',
      'Protect each other from permanent death',
    ],
    allies: ['Die-rectors (cautiously)', 'Wanderers'],
    rivals: ['Hostile domain inhabitants'],
    notableMembers: [
      { name: 'Never Die Guy', role: 'Tactical Death Master', rarity: 'Legendary' },
      { name: 'Stitch Up Girl', role: 'Combat Healer', rarity: 'Legendary' },
      { name: 'The General', role: 'Undead Strategist', rarity: 'Legendary' },
      { name: 'Boots', role: 'Swift Scout', rarity: 'Epic' },
      { name: 'Willy', role: 'Chaotic Wildcard', rarity: 'Epic' },
    ],
    beliefs: [
      'Death is data',
      'Every failure is a lesson',
      'The strongest bonds form between those who\'ve died together',
      'Lucky numbers are real and meaningful',
    ],
    history: 'The first Travelers appeared during the Age of Travelers, drawn to the Doors by curiosity, desperation, or fate. Over time, they developed techniques for surviving the domains and formed a loose community of shared experience.',
  },
  'wanderers': {
    slug: 'wanderers',
    name: 'The Wanderers',
    motto: 'Between the doors, we wait.',
    element: 'Neutral',
    color: '#9E9E9E',
    philosophy: 'Wanderers exist in the spaces between domains. They are formed from accumulated probability that has nowhere else to go. Neither fully alive nor truly dead, they observe and occasionally intervene.',
    territory: 'The Dying Saucer and liminal spaces between domains.',
    leader: 'Mr. Kevin (unofficial)',
    memberCount: '8 known Wanderers',
    goals: [
      'Maintain the neutral zones',
      'Trade with all factions equally',
      'Collect stories and memories',
      'Prevent domain collapse',
    ],
    allies: ['Everyone (neutral stance)'],
    rivals: ['None (officially)'],
    notableMembers: [
      { name: 'Mr. Kevin', role: 'Shopkeeper', rarity: 'Unique' },
      { name: 'Dr. Voss', role: 'Information Broker', rarity: 'Epic' },
      { name: 'Mama Hex', role: 'Fortune Teller', rarity: 'Epic' },
      { name: 'The Archivist', role: 'Memory Keeper', rarity: 'Epic' },
    ],
    beliefs: [
      'All outcomes are equally valid',
      'Trade is the universal language',
      'Neutrality is the highest virtue',
      'Every story deserves to be preserved',
    ],
    history: 'Wanderers began appearing after enough deaths had occurred across the domains. Some believe they are echoes of travelers who died too many times. Others think they are fragments of the Die-rectors themselves. The truth is likely stranger.',
  },
};

export function FactionLore() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Default to die-rectors if no id
  const faction = factions[id || 'die-rectors'] || factions['die-rectors'];

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: tokens.colors.text.secondary }}
      >
        Back
      </Button>

      {/* Header */}
      <Box
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          bgcolor: `${faction.color}10`,
          border: `1px solid ${faction.color}30`,
        }}
      >
        <Chip
          label={faction.element}
          size="small"
          sx={{
            bgcolor: `${faction.color}20`,
            color: faction.color,
            mb: 2,
          }}
        />
        <Typography
          variant="h3"
          sx={{
            fontFamily: tokens.fonts.gaming,
            color: faction.color,
            mb: 1,
          }}
        >
          {faction.name}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontStyle: 'italic',
            color: tokens.colors.text.secondary,
          }}
        >
          "{faction.motto}"
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <CardSection sx={{ textAlign: 'center', height: '100%' }}>
            <LeaderIcon sx={{ color: faction.color, mb: 1 }} />
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              Leader
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {faction.leader}
            </Typography>
          </CardSection>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <CardSection sx={{ textAlign: 'center', height: '100%' }}>
            <MembersIcon sx={{ color: faction.color, mb: 1 }} />
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              Members
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {faction.memberCount}
            </Typography>
          </CardSection>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <CardSection sx={{ textAlign: 'center', height: '100%' }}>
            <TerritoryIcon sx={{ color: faction.color, mb: 1 }} />
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              Territory
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
              {faction.territory.substring(0, 40)}...
            </Typography>
          </CardSection>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <CardSection sx={{ textAlign: 'center', height: '100%' }}>
            <PhilosophyIcon sx={{ color: faction.color, mb: 1 }} />
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              Standing
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {faction.allies.length} Allies
            </Typography>
          </CardSection>
        </Grid>
      </Grid>

      {/* Philosophy */}
      <SectionHeader title="Philosophy" icon={<PhilosophyIcon />} sx={{ mb: 2 }} />
      <CardSection sx={{ mb: 4 }}>
        <Typography variant="body1" sx={{ color: tokens.colors.text.secondary }}>
          {faction.philosophy}
        </Typography>
      </CardSection>

      {/* Core Beliefs */}
      <SectionHeader title="Core Beliefs" sx={{ mb: 2 }} />
      <CardSection sx={{ mb: 4 }}>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          {faction.beliefs.map((belief, i) => (
            <li key={i}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {belief}
              </Typography>
            </li>
          ))}
        </Box>
      </CardSection>

      {/* Goals */}
      <SectionHeader title="Faction Goals" icon={<GoalIcon />} sx={{ mb: 2 }} />
      <CardSection sx={{ mb: 4 }}>
        {faction.goals.map((goal, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: 1.5,
              borderBottom: i < faction.goals.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: `${faction.color}20`,
                color: faction.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {i + 1}
            </Box>
            <Typography variant="body2">{goal}</Typography>
          </Box>
        ))}
      </CardSection>

      {/* Notable Members */}
      <SectionHeader title="Notable Members" icon={<MembersIcon />} sx={{ mb: 2 }} />
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {faction.notableMembers.map((member) => {
          const rarityColor = RARITY_COLORS[member.rarity.toLowerCase() as keyof typeof RARITY_COLORS] || tokens.colors.text.primary;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={member.name}>
              <CardSection
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: tokens.colors.background.elevated },
                }}
              >
                <Skeleton
                  variant="circular"
                  width={48}
                  height={48}
                  sx={{ bgcolor: tokens.colors.background.elevated, flexShrink: 0 }}
                />
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: rarityColor,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {member.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: tokens.colors.text.secondary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {member.role}
                  </Typography>
                </Box>
              </CardSection>
            </Grid>
          );
        })}
      </Grid>

      {/* Relationships */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionHeader title="Allies" sx={{ mb: 2 }} />
          <CardSection>
            {faction.allies.map((ally, i) => (
              <Chip
                key={i}
                label={ally}
                size="small"
                sx={{
                  mr: 1,
                  mb: 1,
                  bgcolor: `${tokens.colors.success}20`,
                  color: tokens.colors.success,
                }}
              />
            ))}
          </CardSection>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionHeader title="Rivals" sx={{ mb: 2 }} />
          <CardSection>
            {faction.rivals.length > 0 ? faction.rivals.map((rival, i) => (
              <Chip
                key={i}
                label={rival}
                size="small"
                sx={{
                  mr: 1,
                  mb: 1,
                  bgcolor: `${tokens.colors.error}20`,
                  color: tokens.colors.error,
                }}
              />
            )) : (
              <Typography variant="body2" sx={{ color: tokens.colors.text.disabled }}>
                No known rivals
              </Typography>
            )}
          </CardSection>
        </Grid>
      </Grid>

      {/* History */}
      <SectionHeader title="History" sx={{ mb: 2 }} />
      <CardSection>
        <Typography variant="body1" sx={{ color: tokens.colors.text.secondary }}>
          {faction.history}
        </Typography>
      </CardSection>
    </Container>
  );
}
