/**
 * NewGuyHome - the stripped "New Guy" launcher.
 *
 * The first-time / mobile entry point (Figma frames `28:6` mobile, `47:41`
 * desktop): a single-column hero + Die / Reroll / Continue + lifetime stats.
 * It wraps the SAME run entry points as HomeDashboard (sessionStorage loadout +
 * `/play`, `/play?continue=true`, corruption-costed reroll) so behaviour matches.
 *
 * NEVER DIE GUY
 */

import { useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MenuButton, StatCard } from '@neverdieguy/ui';
import { tokens } from '../../theme';
import { useSoundContext } from '../../contexts/SoundContext';
import {
  hasSavedRun,
  loadSavedRun,
  getRunHistoryStats,
  loadPlayerData,
  loadCorruptionData,
  saveCorruptionData,
  addCorruption,
  getRerollCorruptionCost,
  saveCurrentSeed,
  loadCurrentSeed,
} from '../../data/player/storage';
import { generateLoadout, type StartingLoadout } from '../../data/decrees';

// The new-guy flow has no NPC stream / domain picker; use the home defaults
// (domain 1, the same default HomeDashboard uses). A fresh seed each reroll
// still yields a new loadout regardless of NPC.
const DEFAULT_NPC_ID = 'mr-kevin';
const DEFAULT_DOMAIN = 1;

/** 1200 -> "1.2k". Keeps the stat tiles compact like the Figma. */
function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${n}`;
}

export function NewGuyHome() {
  const navigate = useNavigate();
  const { playUIClick } = useSoundContext();

  // Persisted starting loadout (shares the `ndg_current_seed` key with HomeDashboard).
  const [loadout, setLoadout] = useState<StartingLoadout>(() => {
    const savedSeed = loadCurrentSeed();
    const generated = generateLoadout(DEFAULT_NPC_ID, DEFAULT_DOMAIN, savedSeed || undefined);
    if (!savedSeed) saveCurrentSeed(generated.seed);
    return generated;
  });

  const [corruption, setCorruption] = useState(() => loadCorruptionData());
  const [rerollCount, setRerollCount] = useState(0);

  // Read-once snapshots for this mount.
  const savedRun = useMemo(() => (hasSavedRun() ? loadSavedRun() : null), []);
  const stats = useMemo(() => getRunHistoryStats(), []);
  const gold = useMemo(() => loadPlayerData().gold, []);

  const rerollCost = getRerollCorruptionCost(rerollCount);
  const rerollDisabled = corruption.level >= 100;

  // --- Actions (mirror HomeDashboard's entry points) ---

  const startRun = () => {
    playUIClick();
    sessionStorage.setItem(
      'ndg-starting-loadout',
      JSON.stringify({ ...loadout, quickLaunch: true, entryPoint: 'newguy' }),
    );
    navigate('/play');
  };

  const reroll = () => {
    if (rerollDisabled) return;
    playUIClick();
    const next = addCorruption(corruption, rerollCost);
    setCorruption(next);
    saveCorruptionData(next);
    setRerollCount((c) => c + 1);
    const newLoadout = generateLoadout(DEFAULT_NPC_ID, DEFAULT_DOMAIN);
    setLoadout(newLoadout);
    saveCurrentSeed(newLoadout.seed);
  };

  const continueRun = () => {
    playUIClick();
    navigate('/play?continue=true');
  };

  const continueSubtitle = savedRun
    ? `${savedRun.domainState?.name ?? 'Saved run'} - Room ${savedRun.roomNumber}`
    : '';

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // Roughly fill the viewport on larger screens so the launcher is centered;
        // natural flow on phones (the Shell handles top bar + bottom nav clearance).
        minHeight: { md: 'calc(100dvh - 120px)' },
        py: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 460,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        {/* Hero - the player character */}
        <Box
          sx={{
            width: { xs: 176, md: 200 },
            height: { xs: 176, md: 200 },
            borderRadius: `${tokens.radius.lg}px`,
            border: `1px solid ${tokens.colors.border}`,
            backgroundColor: tokens.colors.background.elevated,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            src="/assets/characters/travelers/sprite-never-die-guy-1.png"
            alt="Never Die Guy"
            sx={{ width: '88%', height: '88%', objectFit: 'contain', imageRendering: 'pixelated' }}
          />
        </Box>

        {/* Name + epithet */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
              lineHeight: 1.1,
              color: tokens.colors.text.primary,
            }}
          >
            NEVER DIE GUY
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', color: tokens.colors.text.secondary, mt: 0.5 }}>
            The Fixer
          </Typography>
        </Box>

        {/* Primary actions */}
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <MenuButton title="Die" color="red" onClick={startRun} />
          <MenuButton
            title="Reroll"
            subtitle={rerollDisabled ? 'Max corruption' : `+${rerollCost}% corruption`}
            color="yellow"
            disabled={rerollDisabled}
            onClick={reroll}
          />
          {savedRun && (
            <MenuButton
              title="Continue"
              subtitle={continueSubtitle}
              color="neutral"
              onClick={continueRun}
            />
          )}
        </Box>

        {/* Lifetime stats */}
        <Box sx={{ width: '100%', display: 'flex', gap: 1.5 }}>
          <StatCard label="Best" value={fmt(stats.bestScore)} sx={{ flex: 1 }} />
          <StatCard label="Tokens" value={fmt(gold)} sx={{ flex: 1 }} />
          <StatCard label="Deaths" value={`${stats.losses}`} sx={{ flex: 1 }} />
        </Box>
      </Box>
    </Box>
  );
}
