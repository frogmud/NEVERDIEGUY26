/**
 * TopBar - User info + Arena stats
 *
 * Shows user avatar, username, and two stat blocks:
 * - Arena Deaths with heat indicator
 * - Random history factoid (hidden on smaller screens)
 */

import { useState } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import {
  PublicSharp as CountryIcon,
  StarSharp as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../../theme';
import { AssetImage } from '../../../components/ds';
import { HISTORY_FACTOIDS, type Factoid } from '../../../data/home';
import { useAuth } from '../../../contexts/AuthContext';

export function TopBar() {
  const navigate = useNavigate();
  // Pick a random factoid once on mount
  const [factoid] = useState<Factoid>(() =>
    HISTORY_FACTOIDS[Math.floor(Math.random() * HISTORY_FACTOIDS.length)]
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {/* User */}
      <UserBadge />

      {/* Stats - inline, BIG, always right-aligned */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 6, ml: 'auto' }}>
        {/* Arena Deaths */}
        <StatBlock
          icon="/illustrations/arenas.svg"
          iconTooltip="Play Arena"
          onIconClick={() => navigate('/play')}
          value="310"
          label="Arena Deaths"
          badge={
            <Tooltip title="Average heat level when defeated" arrow>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'help' }}>
                <AssetImage src="/icons/fire.svg" alt="Heat" width={20} height={20} fallback="hide" />
                <Typography sx={{ fontSize: '1rem', color: tokens.colors.warning, fontWeight: 600 }}>4</Typography>
              </Box>
            </Tooltip>
          }
        />

        {/* History Factoid - hidden on smaller screens */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
          <StatBlock
            icon="/illustrations/history.svg"
            iconTooltip="View History"
            onIconClick={() => navigate('/history')}
            value={factoid.value}
            label={factoid.subtitle}
            onValueClick={factoid.domainSlug ? () => navigate(`/wiki/domains/${factoid.domainSlug}`) : undefined}
            valueClickable={!!factoid.domainSlug}
          />
        </Box>
      </Box>
    </Box>
  );
}

/** User avatar and name badge */
function UserBadge() {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <AssetImage
        src={user.avatar || '/assets/characters/portraits/60px/traveler-portrait-neverdieguy-02.svg'}
        alt={user.name}
        width={56}
        height={56}
        fallback="hide"
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>@{user.name}</Typography>
        <CountryIcon sx={{ fontSize: 18, color: tokens.colors.text.secondary }} />
        <StarIcon sx={{ fontSize: 18, color: tokens.colors.warning }} />
      </Box>
    </Box>
  );
}

/** Stat block with icon and big value */
function StatBlock({
  icon,
  iconTooltip,
  onIconClick,
  value,
  label,
  badge,
  onValueClick,
  valueClickable,
}: {
  icon: string;
  iconTooltip: string;
  onIconClick: () => void;
  value: string;
  label: string;
  badge?: React.ReactNode;
  onValueClick?: () => void;
  valueClickable?: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: 240 }}>
      <Tooltip title={iconTooltip} arrow>
        <Box onClick={onIconClick} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>
          <AssetImage src={icon} alt={iconTooltip} width={80} height={80} fallback="hide" />
        </Box>
      </Tooltip>
      <Box>
        <Typography
          onClick={onValueClick}
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '2.5rem',
            lineHeight: 1,
            ...(valueClickable && {
              cursor: 'pointer',
              '&:hover': { color: tokens.colors.secondary, textDecoration: 'underline' },
            }),
          }}
        >
          {value}
        </Typography>
        {badge ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary }}>{label}</Typography>
            {badge}
          </Box>
        ) : (
          <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.secondary, mt: 0.5, lineHeight: 1.2, whiteSpace: 'pre-line' }}>
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
