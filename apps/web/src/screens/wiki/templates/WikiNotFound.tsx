import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SearchSharp as SearchIcon } from '@mui/icons-material';
import { tokens } from '../../../theme';

interface WikiNotFoundProps {
  slug?: string;
  category?: string;
}

export function WikiNotFound({ slug, category }: WikiNotFoundProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        <SearchIcon sx={{ fontSize: 64, color: tokens.colors.text.disabled, mb: 2 }} />

        <Typography variant="h4" sx={{ mb: 2 }}>
          Entity Not Found
        </Typography>

        <Typography variant="body1" sx={{ color: tokens.colors.text.secondary, mb: 1 }}>
          {slug ? (
            <>
              Could not find <strong>{slug}</strong>
              {category && <> in category <strong>{category}</strong></>}.
            </>
          ) : (
            'No entity specified.'
          )}
        </Typography>

        <Typography variant="body2" sx={{ color: tokens.colors.text.disabled, mb: 4 }}>
          The entity may not exist yet or the URL might be incorrect.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => navigate('/wiki')}>
            Wiki Home
          </Button>
          <Button variant="contained" onClick={() => navigate('/wiki/browse')}>
            Browse All
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
