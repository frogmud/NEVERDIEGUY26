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
import type { JumpResult, ResponseChoice } from '@ndg/ai-engine';
import { tokens } from '../../../theme';
import { useRun } from '../../../contexts/RunContext';
import { DiceShape } from '../../../components/DiceShapes';
import { OFFICE_SPRITE, OFFICE_ACCENT, OFFICE_BADGE_COLOR, OFFICE_BONE_SIDES } from './officeArt';

const RESPONSE_ACTIONS: Array<{
  choice: ResponseChoice;
  title: string;
  subtitle: string;
  color: 'red' | 'yellow';
}> = [
  { choice: 'flee', title: 'Flee', subtitle: 'Leave pressure on the floor', color: 'yellow' },
  { choice: 'throw', title: 'Slap', subtitle: 'Answer before the room closes', color: 'red' },
];

function getJumpDetail(result: JumpResult): string {
  const { startScoreMult, throwDisadvantage } = result.modifier;

  if (startScoreMult > 1) {
    return 'The room opens. Score target drops.';
  }

  if (startScoreMult < 1 && throwDisadvantage > 0) {
    return 'The room tightens. Score target rises and the throw gets worse.';
  }

  if (startScoreMult < 1) {
    return 'You keep your skin. The room asks for more.';
  }

  if (throwDisadvantage > 0) {
    return 'The next throw carries disadvantage.';
  }

  return 'No room modifier.';
}

export function ResponsePhasePanel() {
  const { state, chooseResponse, transitionToPanel } = useRun();
  const faces = state.revealedFaces;
  const face = faces[0];
  const result = state.jumpResult;
  const accent = face ? OFFICE_ACCENT[face.officeId] ?? tokens.colors.primary : tokens.colors.primary;
  const office = face ? OFFICES[face.officeId] : null;

  if (!face) {
    return (
      <Box sx={panelSx}>
        <BaseCard surface="elevated" sx={cardSx}>
          <Typography sx={eyebrowSx}>No Face answered</Typography>
          <Typography sx={titleSx}>The room is quiet.</Typography>
          <Box sx={singleActionSx}>
            <MenuButton title="Enter the room" subtitle="Resolve" color="red" onClick={() => transitionToPanel('combat')} />
          </Box>
        </BaseCard>
      </Box>
    );
  }

  // After a choice is resolved, show the Jump Check result + Enter the room.
  if (result) {
    return (
      <Box sx={panelSx}>
        <BaseCard surface="elevated" sx={{ ...cardSx, maxWidth: 520 }}>
          <Typography sx={eyebrowSx}>Jump Check</Typography>
          <Typography sx={titleSx}>{result.message}</Typography>
          <Typography sx={bodySx}>{getJumpDetail(result)}</Typography>
          <Box sx={singleActionSx}>
            <MenuButton title="Enter the room" subtitle="Resolve" color="red" onClick={() => transitionToPanel('combat')} />
          </Box>
        </BaseCard>
      </Box>
    );
  }

  return (
    <Box sx={panelSx}>
      <BaseCard surface="elevated" sx={cardSx}>
        <Box sx={contentGridSx}>
          <Box sx={spriteWrapSx}>
            <Box
              component="img"
              src={OFFICE_SPRITE[face.officeId]}
              alt={office?.director ?? face.label}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: `drop-shadow(0 0 14px ${accent}55) drop-shadow(0 8px 16px rgba(0,0,0,0.45))`,
              }}
            />
          </Box>

          <Box sx={copySx}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <DataBadge label={office?.office ?? 'Office'} color={OFFICE_BADGE_COLOR[face.officeId] ?? 'primary'} />
              <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.75rem' }}>{office?.director}</Typography>
            </Box>

            <Box>
              <Typography sx={eyebrowSx}>Bones landed</Typography>
              <Typography sx={titleSx}>{face.label}</Typography>
              <Typography sx={bodySx}>{face.effects[0] ?? 'Something stares back.'}</Typography>
            </Box>

            <Box sx={boneStripSx}>
              {faces.map((f, i) => (
                <DiceShape
                  key={`${f.id}-${i}`}
                  sides={OFFICE_BONE_SIDES[f.officeId] ?? 6}
                  size={28}
                  color={OFFICE_ACCENT[f.officeId] ?? tokens.colors.primary}
                />
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={actionRowSx}>
          {RESPONSE_ACTIONS.map((action) => (
            <MenuButton
              key={action.choice}
              title={action.title}
              subtitle={action.subtitle}
              color={action.color}
              onClick={() => chooseResponse(action.choice)}
            />
          ))}
        </Box>
      </BaseCard>
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

const cardSx = {
  width: '100%',
  maxWidth: 760,
  p: { xs: 2, sm: 3 },
  borderRadius: 2,
} as const;

const contentGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'minmax(220px, 280px) minmax(0, 1fr)' },
  gap: { xs: 2, md: 3 },
  alignItems: 'center',
} as const;

const spriteWrapSx = {
  width: '100%',
  maxWidth: { xs: 220, md: 280 },
  aspectRatio: '1 / 1',
  mx: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

const copySx = {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  textAlign: { xs: 'center', md: 'left' },
  alignItems: { xs: 'center', md: 'flex-start' },
} as const;

const eyebrowSx = {
  fontFamily: tokens.fonts.mono,
  color: tokens.colors.text.disabled,
  fontSize: '0.72rem',
  textTransform: 'uppercase',
} as const;

const titleSx = {
  color: tokens.colors.text.primary,
  fontFamily: tokens.fonts.gaming,
  fontSize: { xs: '1.15rem', sm: '1.45rem' },
  lineHeight: 1.35,
} as const;

const bodySx = {
  color: tokens.colors.text.secondary,
  fontSize: '0.9rem',
  lineHeight: 1.6,
  maxWidth: 420,
} as const;

const boneStripSx = {
  display: 'flex',
  gap: 1,
  justifyContent: { xs: 'center', md: 'flex-start' },
} as const;

const actionRowSx = {
  width: '100%',
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
  gap: 1.5,
  mt: 2.5,
} as const;

const singleActionSx = {
  width: '100%',
  maxWidth: 320,
  mt: 2.5,
} as const;
