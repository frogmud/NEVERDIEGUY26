/**
 * ResponsePhasePanel - the playable beat after Face reveal.
 *
 * The player answers the primary Face with Guard / Throw Bones / Flee. The choice
 * resolves a Jump Check (score / disadvantage modifier only - never HP, never
 * run-ending). Visual language follows the BONES v2 Concept Prototype (node 134:5):
 * a hero-vs-Die-rector face-off over a red action stack.
 */

import { Box, Typography } from '@mui/material';
import { BaseCard, MenuButton } from '@neverdieguy/ui';
import { OFFICES } from '@ndg/shared';
import type { ResponseChoice } from '@ndg/ai-engine';
import { tokens } from '../../../theme';
import { useRun } from '../../../contexts/RunContext';
import { OFFICE_PORTRAIT, OFFICE_ACCENT } from './officeArt';

export function ResponsePhasePanel() {
  const { state, chooseResponse, transitionToPanel } = useRun();
  const face = state.revealedFaces[0];
  const result = state.jumpResult;
  const accent = face ? OFFICE_ACCENT[face.officeId] ?? tokens.colors.primary : tokens.colors.primary;

  // After a choice is resolved, show the Jump Check result + Continue.
  if (result) {
    return (
      <Box sx={panelSx}>
        <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.3rem', color: tokens.colors.text.primary }}>
          Jump Check
        </Typography>
        <BaseCard surface="elevated" sx={{ maxWidth: 420, p: 3, textAlign: 'center', borderTop: `3px solid ${accent}` }}>
          <Typography sx={{ color: tokens.colors.text.primary, fontSize: '1rem' }}>{result.message}</Typography>
          <Typography sx={{ color: tokens.colors.text.secondary, mt: 1.5, fontSize: '0.8rem' }}>
            {result.modifier.startScoreMult !== 1 && `Room score x${result.modifier.startScoreMult.toFixed(2)}. `}
            {result.modifier.throwDisadvantage > 0 && `Throw disadvantage +${result.modifier.throwDisadvantage}.`}
            {result.modifier.startScoreMult === 1 && result.modifier.throwDisadvantage === 0 && 'The room is unchanged.'}
          </Typography>
        </BaseCard>
        <Box sx={{ width: { xs: '100%', sm: 280 }, maxWidth: 320 }}>
          <MenuButton title="Enter the room" subtitle="Resolve" color="red" onClick={() => transitionToPanel('combat')} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={panelSx}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: { xs: '1.2rem', sm: '1.4rem' }, color: tokens.colors.text.primary }}>
          Response Phase
        </Typography>
        {face && (
          <Typography sx={{ color: tokens.colors.text.secondary, mt: 1, fontSize: '0.85rem' }}>
            The {face.label} is watching. Answer it.
          </Typography>
        )}
      </Box>

      {/* Hero vs Die-rector face-off */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 2, sm: 4 }, width: '100%' }}>
        <Box
          component="img"
          src="/assets/heroes/hero-01.png"
          alt="Never Die Guy"
          sx={{ width: { xs: 88, sm: 110 }, height: 'auto', imageRendering: 'pixelated', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))' }}
        />
        <Typography sx={{ fontFamily: tokens.fonts.gaming, color: tokens.colors.text.disabled, fontSize: '1rem' }}>vs</Typography>
        {face && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
                border: `1px solid ${accent}66`,
              }}
            >
              <Box component="img" src={OFFICE_PORTRAIT[face.officeId]} alt={OFFICES[face.officeId].director} sx={{ width: 72, height: 72, imageRendering: 'pixelated' }} />
            </Box>
            <Box sx={{ px: 1, py: 0.25, borderRadius: '9999px', backgroundColor: `${accent}22`, border: `1px solid ${accent}55` }}>
              <Typography sx={{ color: accent, fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Watching</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Red action stack */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, width: { xs: '100%', sm: 300 }, maxWidth: 340 }}>
        <MenuButton title="Throw Bones" subtitle="Take the Face head-on" color="red" onClick={() => chooseResponse('throw' as ResponseChoice)} />
        <MenuButton title="Guard" subtitle="Brace - soften a jump" color="neutral" onClick={() => chooseResponse('guard' as ResponseChoice)} />
        <MenuButton title="Flee" subtitle="Back off - minor cost" color="yellow" onClick={() => chooseResponse('flee' as ResponseChoice)} />
      </Box>
    </Box>
  );
}

const panelSx = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: { xs: 2.5, sm: 3 },
  p: { xs: 2, sm: 3 },
  overflowY: 'auto',
} as const;
