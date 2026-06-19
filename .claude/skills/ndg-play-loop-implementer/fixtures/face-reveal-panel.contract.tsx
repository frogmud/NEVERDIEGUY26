/**
 * FIXTURE - the FaceRevealPanel contract (mirrors
 * apps/web/src/screens/play/panels/FaceRevealPanel.tsx). Shows the dumb-panel shape:
 * read state, render @neverdieguy/ui, dispatch on interaction. No game logic.
 *
 * This is a teaching copy. The real panel imports from the app; do not import this.
 */

import { Box, Typography } from '@mui/material';
import { BaseCard, DataBadge, MenuButton, type DataBadgeColor } from '@neverdieguy/ui';
import { OFFICES } from '@ndg/shared';
import { tokens } from '../../../theme';            // real path from panels/
import { useRun } from '../../../contexts/RunContext';

// Office -> semantic badge color (not rarity).
const OFFICE_BADGE_COLOR: Record<number, DataBadgeColor> = {
  1: 'secondary', 2: 'success', 3: 'primary', 4: 'warning', 5: 'primary', 6: 'error',
};

export function FaceRevealPanel() {
  const { state, transitionToPanel } = useRun();   // read + dispatch only
  const faces = state.revealedFaces;               // logic already done in castBones()

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
               alignItems: 'center', justifyContent: 'center', gap: 4, p: 3 }}>
      <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.5rem', color: tokens.colors.text.primary }}>
        The Bones land
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {faces.map((face) => (
          <BaseCard key={face.id} surface="elevated" sx={{ width: 220, p: 2 }}>
            <DataBadge label={OFFICES[face.officeId].office} color={OFFICE_BADGE_COLOR[face.officeId]} />
            <Typography sx={{ fontFamily: tokens.fonts.gaming, mt: 1 }}>{face.label}</Typography>
            {face.effects.map((e, i) => (
              <Typography key={i} sx={{ color: tokens.colors.text.secondary, fontSize: '0.8rem' }}>{e}</Typography>
            ))}
          </BaseCard>
        ))}
      </Box>

      {/* dispatch only - the next beat is the Response Phase */}
      <Box sx={{ width: 260 }}>
        <MenuButton title="Continue" subtitle="Answer the Faces" color="neutral"
                    onClick={() => transitionToPanel('response')} />
      </Box>
    </Box>
  );
}

/*
 * CONTRACT CHECKLIST
 * - reads state.revealedFaces (never computes them here)
 * - renders @neverdieguy/ui (BaseCard/DataBadge/MenuButton), tokens for style
 * - dispatches transitionToPanel only; no RNG, no scoring, no persistence
 * - cannot end the run (no HP, no runEnded)
 */
