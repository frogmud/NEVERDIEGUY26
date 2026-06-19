/**
 * ResponsePhasePanel - the single-creature encounter beat after Throw Bones.
 *
 * Collapses reveal + response into one screen (per the BONES v2 Concept Prototype,
 * node 134:5): the Bones land, one dominant Face/Die-rector stares at you, and you
 * answer with Flee or Slap. The choice resolves a Jump Check (score / disadvantage
 * modifier only - never HP, never run-ending; reveal cannot kill). The other Bones
 * that landed still ride along in state.revealedFaces for What Remained.
 */

import { Box, Typography } from '@mui/material';
import { BaseCard, DataBadge, MenuButton } from '@neverdieguy/ui';
import { OFFICES } from '@ndg/shared';
import type { ResponseChoice } from '@ndg/ai-engine';
import { tokens } from '../../../theme';
import { useRun } from '../../../contexts/RunContext';
import { DiceShape } from '../../../components/DiceShapes';
import { OFFICE_SPRITE, OFFICE_ACCENT, OFFICE_BADGE_COLOR, OFFICE_BONE_SIDES } from './officeArt';

export function ResponsePhasePanel() {
  const { state, chooseResponse, transitionToPanel } = useRun();
  const faces = state.revealedFaces;
  const face = faces[0];
  const result = state.jumpResult;
  const accent = face ? OFFICE_ACCENT[face.officeId] ?? tokens.colors.primary : tokens.colors.primary;

  // After a choice is resolved, show the Jump Check result + Enter the room.
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
      {/* The Bones that landed */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: { xs: '1.1rem', sm: '1.3rem' }, letterSpacing: '0.05em', color: tokens.colors.text.primary }}>
          The Bones land
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.25, justifyContent: 'center', mt: 1 }}>
          {faces.map((f, i) => (
            <DiceShape key={`${f.id}-${i}`} sides={OFFICE_BONE_SIDES[f.officeId] ?? 6} size={26} color={OFFICE_ACCENT[f.officeId] ?? tokens.colors.primary} />
          ))}
        </Box>
      </Box>

      {/* The dominant Face stares at you */}
      {face && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: { xs: 200, sm: 240 },
              height: { xs: 200, sm: 240 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `radial-gradient(circle, ${accent}24 0%, transparent 68%)`,
            }}
          >
            <Box
              component="img"
              src={OFFICE_SPRITE[face.officeId]}
              alt={OFFICES[face.officeId].director}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: `drop-shadow(0 0 18px ${accent}66) drop-shadow(0 8px 16px rgba(0,0,0,0.5))`,
              }}
            />
          </Box>
          <Typography sx={{ color: tokens.colors.text.secondary, fontSize: '0.85rem', fontStyle: 'italic' }}>
            Something stares at you.
          </Typography>
          <DataBadge label={OFFICES[face.officeId].office} color={OFFICE_BADGE_COLOR[face.officeId] ?? 'primary'} />
          <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: { xs: '1.3rem', sm: '1.6rem' }, color: tokens.colors.text.primary, textAlign: 'center' }}>
            {face.label}
          </Typography>
          {face.effects[0] && (
            <Typography sx={{ color: tokens.colors.text.secondary, fontSize: '0.8rem', textAlign: 'center', maxWidth: 320 }}>
              {face.effects[0]}
            </Typography>
          )}
        </Box>
      )}

      {/* Answer it: Flee / Slap */}
      <Box sx={{ display: 'flex', gap: { xs: 1.25, sm: 2 }, width: { xs: '100%', sm: 'auto' }, maxWidth: 420, justifyContent: 'center' }}>
        <Box sx={{ flex: 1, minWidth: { xs: 0, sm: 150 } }}>
          <MenuButton title="Flee" subtitle="Back off - minor cost" color="yellow" onClick={() => chooseResponse('flee' as ResponseChoice)} />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: 0, sm: 150 } }}>
          <MenuButton title="Slap" subtitle="Take it head-on" color="red" onClick={() => chooseResponse('throw' as ResponseChoice)} />
        </Box>
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
  gap: { xs: 2, sm: 2.5 },
  p: { xs: 2, sm: 3 },
  overflowY: 'auto',
} as const;
