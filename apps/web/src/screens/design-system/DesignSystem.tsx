import { Box, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import { componentRegistry } from './componentData';
import { ComponentCard } from './ComponentCard';

export function DesignSystem() {
  const navigate = useNavigate();

  const handleComponentClick = (componentId: string) => {
    navigate(`/design-system/${componentId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Bones
        </Typography>
        <Typography variant="h6" sx={{ color: tokens.colors.text.secondary, mb: 0.5 }}>
          Design system for NEVER DIE GUY
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.disabled }}>
          {componentRegistry.length} components for the dice roguelike game and app
        </Typography>
      </Box>

      {/* Component Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {componentRegistry.map((component) => (
          <ComponentCard
            key={component.id}
            name={component.name}
            category={component.category}
            description={component.description}
            preview={component.preview}
            onClick={() => handleComponentClick(component.id)}
          />
        ))}
      </Box>
    </Container>
  );
}
