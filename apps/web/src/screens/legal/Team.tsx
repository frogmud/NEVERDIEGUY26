import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  LinkSharp as LinkIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';

const leadership = [
  {
    name: 'Kevin Grzejka',
    role: 'Founder & Creative Director',
    avatar: 'KG',
    bio: 'Game designer with 10+ years experience. Previously at major studios working on RPGs and roguelikes.',
    color: tokens.colors.primary,
  },
  {
    name: 'Die-rector Jane',
    role: 'Lead Developer',
    avatar: 'DJ',
    bio: 'Full-stack engineer specializing in real-time systems and procedural generation.',
    color: tokens.colors.secondary,
  },
  {
    name: 'Die-rector Robert',
    role: 'Art Director',
    avatar: 'DR',
    bio: 'Visual artist bringing the dice-based world to life with a unique comic book aesthetic.',
    color: tokens.colors.warning,
  },
  {
    name: 'Die-rector Alice',
    role: 'Community Manager',
    avatar: 'DA',
    bio: 'Building bridges between players and developers. Your voice in the team.',
    color: '#00e5ff',
  },
];

const departments = [
  { name: 'Engineering', count: 4 },
  { name: 'Design', count: 2 },
  { name: 'Art', count: 3 },
  { name: 'Community', count: 2 },
  { name: 'QA', count: 2 },
];

export function Team() {
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
        title="Our Team"
        subtitle="The Die-rectors behind NEVER DIE GUY"
      />

      {/* Team Size */}
      <CardSection sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Team Overview</Typography>
          <Chip label="13 Team Members" size="small" color="primary" />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {departments.map((dept) => (
            <Chip
              key={dept.name}
              label={`${dept.name} (${dept.count})`}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      </CardSection>

      {/* Leadership */}
      <Typography variant="h6" sx={{ mb: 2 }}>Leadership</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 4 }}>
        {leadership.map((person) => (
          <CardSection key={person.name}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: person.color,
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '1rem',
                }}
              >
                {person.avatar}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {person.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: tokens.colors.primary, display: 'block', mb: 1 }}
                    >
                      {person.role}
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ color: tokens.colors.text.secondary }}>
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  {person.bio}
                </Typography>
              </Box>
            </Box>
          </CardSection>
        ))}
      </Box>

      {/* Culture */}
      <CardSection sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Our Culture</Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
          We're a remote-first team spread across multiple time zones, united by our passion
          for games and our commitment to building something special. We believe in:
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Transparency</strong> - Open development and honest communication
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Player Focus</strong> - Every decision considers the player experience
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Continuous Learning</strong> - We grow together through feedback
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Work-Life Balance</strong> - Sustainable pace for sustainable games
            </Typography>
          </li>
        </Box>
      </CardSection>

      {/* Join Us */}
      <CardSection>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Want to join the team?
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              We're always looking for passionate people
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => navigate('/about/careers')}>
            View Openings
          </Button>
        </Box>
      </CardSection>
    </Box>
  );
}
