import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';

const techStack = [
  'React',
  'TypeScript',
  'Vite',
  'Material UI',
  'Three.js',
  'Vercel',
];

export function AboutUs() {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 2 }}>
      <PageHeader
        title="About NEVER DIE GUY"
        subtitle="An enjoyable dice roguelike."
      />

      {/* Description */}
      <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
        NEVER DIE GUY is a dice-based roguelike where you throw dice at a globe,
        clear zones, and collect loot. Built for quick sessions and endless replayability.
      </Typography>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => navigate('/play')}
          sx={{
            bgcolor: tokens.colors.primary,
            '&:hover': { bgcolor: tokens.colors.primary },
          }}
        >
          Play Now
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/wiki')}
          sx={{
            borderColor: tokens.colors.border,
            color: tokens.colors.text.secondary,
            '&:hover': { borderColor: tokens.colors.text.secondary },
          }}
        >
          Explore Wiki
        </Button>
      </Box>

      {/* Tech Stack */}
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        Tech Stack
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {techStack.map((tech) => (
          <Box
            key={tech}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: tokens.colors.background.elevated,
              border: `1px solid ${tokens.colors.border}`,
            }}
          >
            <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
              {tech}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Creator */}
      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block' }}>
        USPTO Serial #99074782
      </Typography>
      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
        Created by{' '}
        <Box
          component="a"
          href="https://kgrz.design"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: tokens.colors.text.secondary, textDecoration: 'underline' }}
        >
          kgrz.design
        </Box>
      </Typography>
    </Box>
  );
}
