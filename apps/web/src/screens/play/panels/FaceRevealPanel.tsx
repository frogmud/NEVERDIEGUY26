/**
 * FaceRevealPanel - shows the 3 Faces revealed by Cast Bones.
 *
 * Pure presentational: reads state.revealedFaces from RunContext. A reveal never
 * ends the run (No-Instant-Death). Continue advances to the Response Phase.
 * Built with @neverdieguy/ui (BaseCard, DataBadge, MenuButton).
 */

import { Box, Typography } from '@mui/material';
import { BaseCard, DataBadge, MenuButton, type DataBadgeColor } from '@neverdieguy/ui';
import { OFFICES } from '@ndg/shared';
import { tokens } from '../../../theme';
import { useRun } from '../../../contexts/RunContext';

const OFFICE_BADGE_COLOR: Record<number, DataBadgeColor> = {
  1: 'secondary', // Favor
  2: 'success',   // Graveyard
  3: 'primary',   // Death
  4: 'warning',   // Myth
  5: 'primary',   // Archive
  6: 'error',     // Corruption
};

export function FaceRevealPanel() {
  const { state, transitionToPanel } = useRun();
  const faces = state.revealedFaces;

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        p: 3,
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '1.5rem',
            letterSpacing: '0.05em',
            color: tokens.colors.text.primary,
          }}
        >
          The Bones land
        </Typography>
        <Typography sx={{ color: tokens.colors.text.secondary, mt: 1 }}>
          Three Faces answer the throw.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {faces.map((face) => (
          <BaseCard key={face.id} surface="elevated" sx={{ width: 220, p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <DataBadge
                  label={OFFICES[face.officeId].office}
                  color={OFFICE_BADGE_COLOR[face.officeId] ?? 'primary'}
                />
                <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem' }}>
                  {face.revealRole}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontFamily: tokens.fonts.gaming,
                  fontSize: '1.1rem',
                  color: tokens.colors.text.primary,
                }}
              >
                {face.label}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {face.effects.map((effect, i) => (
                  <Typography
                    key={i}
                    sx={{ color: tokens.colors.text.secondary, fontSize: '0.8rem' }}
                  >
                    {effect}
                  </Typography>
                ))}
              </Box>
            </Box>
          </BaseCard>
        ))}
      </Box>

      <Box sx={{ width: 260 }}>
        <MenuButton
          title="Continue"
          subtitle="Answer the Faces"
          color="neutral"
          onClick={() => transitionToPanel('response')}
        />
      </Box>
    </Box>
  );
}
