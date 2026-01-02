import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Collapse,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  WorkSharp as WorkIcon,
  LocationOnSharp as LocationIcon,
  ExpandMoreSharp as ExpandIcon,
  ExpandLessSharp as CollapseIcon,
  CodeSharp as CodeIcon,
  BrushSharp as ArtIcon,
  GroupsSharp as CommunityIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';

const openings = [
  {
    id: 'senior-backend',
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    icon: CodeIcon,
    description: 'Build scalable systems for real-time multiplayer, marketplace, and progression features.',
    requirements: [
      '5+ years backend development experience',
      'Strong TypeScript/Node.js skills',
      'Experience with real-time systems (WebSockets, Redis)',
      'Database design and optimization',
      'Game industry experience a plus',
    ],
  },
  {
    id: 'game-designer',
    title: 'Game Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    icon: WorkIcon,
    description: 'Design roguelike mechanics, balance dice systems, and craft engaging progression loops.',
    requirements: [
      '3+ years game design experience',
      'Deep knowledge of roguelike and RPG genres',
      'Strong math skills for balancing',
      'Experience with procedural generation',
      'Published titles preferred',
    ],
  },
  {
    id: 'pixel-artist',
    title: 'Pixel Artist',
    department: 'Art',
    location: 'Remote',
    type: 'Contract',
    icon: ArtIcon,
    description: 'Create character sprites, items, and environment tiles in our signature style.',
    requirements: [
      '2+ years pixel art experience',
      'Strong portfolio of game assets',
      'Animation skills required',
      'Familiarity with Aseprite or similar',
      'Comic book aesthetic appreciation',
    ],
  },
  {
    id: 'community-mod',
    title: 'Community Moderator',
    department: 'Community',
    location: 'Remote',
    type: 'Part-time',
    icon: CommunityIcon,
    description: 'Help maintain a positive, welcoming community across Discord and social platforms.',
    requirements: [
      'Active member of gaming communities',
      'Excellent communication skills',
      'Experience with Discord moderation',
      'Availability across time zones',
      'Passion for NEVER DIE GUY',
    ],
  },
];

const benefits = [
  'Competitive salary + equity',
  'Fully remote work',
  'Flexible hours',
  'Health insurance',
  'Game library stipend',
  'Conference budget',
  'Unlimited PTO',
  'Team game nights',
];

export function Careers() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);

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
        title="Careers"
        subtitle="Join the Die-rectors and shape the future of NEVER DIE GUY"
      />

      {/* Hero */}
      <CardSection
        sx={{
          mb: 4,
          textAlign: 'center',
          py: 4,
        }}
      >
        <Typography variant="h5" sx={{ fontFamily: tokens.fonts.gaming, mb: 2 }}>
          Build Games, Roll Dice, Have Fun
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, maxWidth: 500, mx: 'auto' }}>
          We're a small team with big ambitions. If you're passionate about roguelikes,
          fair play, and community-driven development, we'd love to hear from you.
        </Typography>
      </CardSection>

      {/* Open Positions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Open Positions</Typography>
        <Chip label={`${openings.length} openings`} size="small" color="primary" />
      </Box>

      <Box sx={{ mb: 4 }}>
        {openings.map((job) => {
          const Icon = job.icon;
          const isExpanded = expanded === job.id;

          return (
            <CardSection key={job.id} sx={{ mb: 2 }}>
              <Box
                onClick={() => setExpanded(isExpanded ? null : job.id)}
                sx={{ cursor: 'pointer' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        bgcolor: `${tokens.colors.primary}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ color: tokens.colors.primary }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {job.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip label={job.department} size="small" variant="outlined" />
                        <Chip
                          icon={<LocationIcon sx={{ fontSize: 14 }} />}
                          label={job.location}
                          size="small"
                          variant="outlined"
                        />
                        <Chip label={job.type} size="small" variant="outlined" />
                      </Box>
                    </Box>
                  </Box>
                  {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                </Box>
              </Box>

              <Collapse in={isExpanded}>
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${tokens.colors.border}` }}>
                  <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
                    {job.description}
                  </Typography>

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Requirements:</Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2, mb: 2 }}>
                    {job.requirements.map((req, i) => (
                      <li key={i}>
                        <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                          {req}
                        </Typography>
                      </li>
                    ))}
                  </Box>

                  <Button variant="contained" size="small">
                    Apply Now
                  </Button>
                </Box>
              </Collapse>
            </CardSection>
          );
        })}
      </Box>

      {/* Benefits */}
      <CardSection sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Benefits & Perks</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {benefits.map((benefit) => (
            <Chip key={benefit} label={benefit} size="small" variant="outlined" />
          ))}
        </Box>
      </CardSection>

      {/* No Fit? */}
      <CardSection sx={{ bgcolor: tokens.colors.background.elevated }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Don't see the right role?
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
          We're always interested in hearing from talented people. Send us your portfolio
          and tell us how you'd contribute to NEVER DIE GUY.
        </Typography>
        <Button variant="outlined" size="small">
          General Application
        </Button>
      </CardSection>
    </Box>
  );
}
