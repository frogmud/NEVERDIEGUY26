/**
 * FaceRevealPanel - shows the 3 Faces revealed by Cast Bones.
 *
 * Pure presentational: reads state.revealedFaces from RunContext. A reveal never
 * ends the run (No-Instant-Death). Continue advances to the Response Phase.
 * Visual language follows the BONES v2 Concept Prototype (node 134:5): each Face
 * is its Office's Die-rector portrait, tinted on the Office accent, with the Bone
 * shape that revealed it.
 */

import { Box, Typography } from '@mui/material';
import { BaseCard, DataBadge, MenuButton } from '@neverdieguy/ui';
import { OFFICES } from '@ndg/shared';
import { tokens } from '../../../theme';
import { useRun } from '../../../contexts/RunContext';
import { DiceShape } from '../../../components/DiceShapes';
import { OFFICE_PORTRAIT, OFFICE_BADGE_COLOR, OFFICE_ACCENT, OFFICE_BONE_SIDES } from './officeArt';

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
        gap: { xs: 2.5, sm: 4 },
        p: { xs: 2, sm: 3 },
        overflowY: 'auto',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            letterSpacing: '0.05em',
            color: tokens.colors.text.primary,
          }}
        >
          The Bones land
        </Typography>
        <Typography sx={{ color: tokens.colors.text.secondary, mt: 1, fontSize: '0.85rem' }}>
          Three Faces answer the throw.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.25, sm: 2 },
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 720,
        }}
      >
        {faces.map((face) => {
          const accent = OFFICE_ACCENT[face.officeId] ?? tokens.colors.primary;
          return (
            <BaseCard
              key={face.id}
              surface="elevated"
              sx={{
                width: { xs: 150, sm: 200 },
                p: { xs: 1.5, sm: 2 },
                borderTop: `3px solid ${accent}`,
                boxShadow: `0 0 24px -8px ${accent}`,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, alignItems: 'center' }}>
                {/* Office portrait haloed on the Office accent */}
                <Box
                  sx={{
                    position: 'relative',
                    width: 84,
                    height: 84,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
                    border: `1px solid ${accent}55`,
                  }}
                >
                  <Box
                    component="img"
                    src={OFFICE_PORTRAIT[face.officeId]}
                    alt={OFFICES[face.officeId].director}
                    sx={{ width: 64, height: 64, imageRendering: 'pixelated' }}
                  />
                  {/* The Bone that revealed this Face */}
                  <Box sx={{ position: 'absolute', bottom: -6, right: -6 }}>
                    <DiceShape sides={OFFICE_BONE_SIDES[face.officeId] ?? 6} size={28} color={accent} />
                  </Box>
                </Box>

                <DataBadge
                  label={OFFICES[face.officeId].office}
                  color={OFFICE_BADGE_COLOR[face.officeId] ?? 'primary'}
                />
                <Typography
                  sx={{
                    fontFamily: tokens.fonts.gaming,
                    fontSize: { xs: '0.95rem', sm: '1.1rem' },
                    color: tokens.colors.text.primary,
                    textAlign: 'center',
                  }}
                >
                  {face.label}
                </Typography>
                <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {face.revealRole}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%' }}>
                  {face.effects.map((effect, i) => (
                    <Typography
                      key={i}
                      sx={{ color: tokens.colors.text.secondary, fontSize: '0.75rem', textAlign: 'center' }}
                    >
                      {effect}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </BaseCard>
          );
        })}
      </Box>

      <Box sx={{ width: { xs: '100%', sm: 280 }, maxWidth: 320 }}>
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
