/**
 * ResponsePhasePanel - the playable beat after Face reveal.
 *
 * The player answers the primary Face with Guard / Throw Bones / Flee. The choice
 * resolves a Jump Check (score / disadvantage modifier only - never HP, never
 * run-ending). The result is shown before the room resolves.
 * Built with @neverdieguy/ui (MenuButton, BaseCard).
 */

import { Box, Typography } from '@mui/material';
import { BaseCard, MenuButton } from '@neverdieguy/ui';
import type { ResponseChoice } from '@ndg/ai-engine';
import { tokens } from '../../../theme';
import { useRun } from '../../../contexts/RunContext';

export function ResponsePhasePanel() {
  const { state, chooseResponse, transitionToPanel } = useRun();
  const face = state.revealedFaces[0];
  const result = state.jumpResult;

  // After a choice is resolved, show the Jump Check result + Continue.
  if (result) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          p: 3,
        }}
      >
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '1.3rem',
            color: tokens.colors.text.primary,
          }}
        >
          Jump Check
        </Typography>
        <BaseCard surface="elevated" sx={{ maxWidth: 420, p: 3, textAlign: 'center' }}>
          <Typography sx={{ color: tokens.colors.text.primary, fontSize: '1rem' }}>
            {result.message}
          </Typography>
          <Typography sx={{ color: tokens.colors.text.secondary, mt: 1.5, fontSize: '0.8rem' }}>
            {result.modifier.startScoreMult !== 1 &&
              `Room score x${result.modifier.startScoreMult.toFixed(2)}. `}
            {result.modifier.throwDisadvantage > 0 &&
              `Throw disadvantage +${result.modifier.throwDisadvantage}.`}
            {result.modifier.startScoreMult === 1 &&
              result.modifier.throwDisadvantage === 0 &&
              'The room is unchanged.'}
          </Typography>
        </BaseCard>
        <Box sx={{ width: 260 }}>
          <MenuButton
            title="Enter the room"
            subtitle="Resolve"
            color="red"
            onClick={() => transitionToPanel('combat')}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 3,
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '1.4rem',
            color: tokens.colors.text.primary,
          }}
        >
          Response Phase
        </Typography>
        {face && (
          <Typography sx={{ color: tokens.colors.text.secondary, mt: 1 }}>
            The {face.label} is watching. Answer it.
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: 280 }}>
        <MenuButton
          title="Guard"
          subtitle="Brace - soften a jump"
          color="neutral"
          onClick={() => chooseResponse('guard' as ResponseChoice)}
        />
        <MenuButton
          title="Throw Bones"
          subtitle="Take the Face head-on"
          color="red"
          onClick={() => chooseResponse('throw' as ResponseChoice)}
        />
        <MenuButton
          title="Flee"
          subtitle="Back off - minor cost"
          color="yellow"
          onClick={() => chooseResponse('flee' as ResponseChoice)}
        />
      </Box>
    </Box>
  );
}
