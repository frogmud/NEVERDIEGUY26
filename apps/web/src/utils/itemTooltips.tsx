import { Box, Typography, Chip } from '@mui/material';
import { tokens } from '../theme';
import type { Item } from '../data/wiki/types';

// Element icons mapping
const ELEMENT_ICONS: Record<string, string> = {
  Fire: '🔥',
  Water: '💧',
  Earth: '🪨',
  Air: '💨',
  Void: '🌌',
  Null: '⚫',
  Time: '⏰',
  Neutral: '⚪',
};

// Element colors mapping
const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#ef4444',
  Water: '#3b82f6',
  Earth: '#84cc16',
  Air: '#06b6d4',
  Void: '#8b5cf6',
  Null: '#1f2937',
  Time: '#f59e0b',
  Neutral: tokens.colors.text.secondary,
};

/**
 * Generate rich tooltip content from item wiki data
 * Shows: effects, dice effects, element affinity, persistence flag, tier info
 */
export function getItemTooltipContent(item: Item): React.ReactNode {
  const sections: React.ReactNode[] = [];

  // Effects section
  if (item.effects?.length) {
    sections.push(
      <Box key="effects" sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.text.primary, display: 'block', mb: 0.5 }}>
          Effects:
        </Typography>
        {item.effects.map((effect, i) => (
          <Typography key={`effect-${i}`} variant="body2" sx={{ fontSize: '0.75rem', pl: 1, mb: 0.25 }}>
            • {effect.name}: {effect.description}
          </Typography>
        ))}
      </Box>
    );
  }

  // Dice effects section
  if (item.diceEffects?.length) {
    sections.push(
      <Box key="dice-effects" sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.text.primary, display: 'block', mb: 0.5 }}>
          Dice Effects:
        </Typography>
        {item.diceEffects.map((de, i) => (
          <Box key={`dice-${i}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pl: 1, mb: 0.25 }}>
            <Chip
              label={`d${de.die}`}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                bgcolor: tokens.colors.primary,
                color: tokens.colors.text.primary,
                fontWeight: 700,
              }}
            />
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {de.effect}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  // Element affinity section
  if (item.element && item.element !== 'Neutral') {
    const elementIcon = ELEMENT_ICONS[item.element] || '✨';
    const elementColor = ELEMENT_COLORS[item.element] || tokens.colors.text.secondary;
    sections.push(
      <Box key="element" sx={{ mb: 1 }}>
        <Chip
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <span>{elementIcon}</span>
              <span>{item.element}</span>
            </Box>
          }
          size="small"
          sx={{
            bgcolor: `${elementColor}15`,
            color: elementColor,
            border: `1px solid ${elementColor}40`,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      </Box>
    );
  }

  // Persistence flag
  if (item.persistsAcrossDomains) {
    sections.push(
      <Box key="persistence" sx={{ mb: 1 }}>
        <Chip
          label="Persists Across Domains"
          size="small"
          sx={{
            bgcolor: `${tokens.colors.secondary}15`,
            color: tokens.colors.secondary,
            border: `1px solid ${tokens.colors.secondary}40`,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      </Box>
    );
  }

  // Tier info
  if (item.tier) {
    sections.push(
      <Box key="tier" sx={{ mt: 1, pt: 1, borderTop: `1px solid ${tokens.colors.border}` }}>
        <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontSize: '0.65rem' }}>
          Tier {item.tier}
        </Typography>
      </Box>
    );
  }

  if (sections.length === 0) return null;

  return (
    <Box sx={{ p: 1, maxWidth: 300 }}>
      {sections}
    </Box>
  );
}

/**
 * Check if an item has tooltip-worthy content
 */
export function hasTooltipContent(item: Item): boolean {
  return !!(
    item.effects?.length ||
    item.diceEffects?.length ||
    (item.element && item.element !== 'Neutral') ||
    item.persistsAcrossDomains ||
    item.tier
  );
}
