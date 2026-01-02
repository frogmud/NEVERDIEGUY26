/**
 * Globe3D - Hybrid Globe + Flat Game Screen
 *
 * Strategic layer: 3D globe with zone markers
 * Tactical layer: DiceMeteor combat when zone is attacked
 *
 * NEVER DIE GUY
 */

import { useState, useCallback, useMemo } from 'react';
import { Box, IconButton, Typography, Fade } from '@mui/material';
import { ArrowBackSharp as BackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { hasSavedRun } from '../../data/player/storage';

import { GlobeScene } from '../../games/globe-meteor/GlobeScene';
import { useGlobeMeteorGame } from '../../games/globe-meteor/hooks/useGlobeMeteorGame';
import { PlaySidebar } from './components/PlaySidebar';
import { ZonePreview } from './components/ZonePreview';
import { DiceMeteor } from './DiceMeteor';
import { tokens } from '../../theme';

import {
  ZoneMarker,
  DomainState,
  GamePhase,
} from '../../types/zones';
import { generateDomain, getNextDomain, DOMAIN_CONFIGS } from '../../data/domains';

const SIDEBAR_WIDTH = 320;

export function Globe3D() {
  const navigate = useNavigate();

  // Game phase: globe (zone select) | transition (meteor barrage) | combat (flat game)
  const [gamePhase, setGamePhase] = useState<GamePhase>('globe');

  // Current domain state with zones
  const [currentDomain, setCurrentDomain] = useState<DomainState>(() => generateDomain(1));

  // Selected zone (null when none selected)
  const [selectedZone, setSelectedZone] = useState<ZoneMarker | null>(null);

  // Run stats
  const [runStats, setRunStats] = useState({
    totalScore: 0,
    zonesCleared: 0,
    gold: 0,
  });

  // Use the globe game hook for 3D interactions
  const {
    npcs,
    meteors,
    impacts,
    targetPosition,
    stats,
    handleGlobeClick,
    setLastInteraction,
    isIdle,
    launchMeteorsAt,
  } = useGlobeMeteorGame();

  // Handle zone click on globe
  const handleZoneClick = useCallback((zone: ZoneMarker) => {
    if (zone.cleared) return;
    setSelectedZone(zone);
  }, []);

  // Handle launch attack button
  const handleLaunchAttack = useCallback(() => {
    if (!selectedZone) return;

    // Trigger transition phase
    setGamePhase('transition');

    // Launch 3D meteor barrage at zone
    if (launchMeteorsAt) {
      launchMeteorsAt(selectedZone.lat, selectedZone.lng);
    }

    // After animation, transition to combat
    setTimeout(() => {
      setGamePhase('combat');
    }, 1500);
  }, [selectedZone, launchMeteorsAt]);

  // Handle combat completion
  const handleCombatWin = useCallback((score: number) => {
    if (!selectedZone) return;

    // Calculate gold reward
    const goldEarned =
      selectedZone.rewards.goldMin +
      Math.floor(Math.random() * (selectedZone.rewards.goldMax - selectedZone.rewards.goldMin));

    // Update run stats
    setRunStats((prev) => ({
      totalScore: prev.totalScore + score,
      zonesCleared: prev.zonesCleared + 1,
      gold: prev.gold + goldEarned,
    }));

    // Mark zone as cleared
    setCurrentDomain((prev) => ({
      ...prev,
      zones: prev.zones.map((z) =>
        z.id === selectedZone.id ? { ...z, cleared: true } : z
      ),
      clearedCount: prev.clearedCount + 1,
    }));

    // Check if domain is complete
    const newClearedCount = currentDomain.clearedCount + 1;
    if (newClearedCount >= currentDomain.totalZones) {
      // Advance to next domain
      const nextDomainId = getNextDomain(currentDomain.id);
      if (nextDomainId) {
        setCurrentDomain(generateDomain(nextDomainId));
      }
      // If no next domain, game is won (handled elsewhere)
    }

    // Return to globe view
    setSelectedZone(null);
    setGamePhase('globe');
  }, [selectedZone, currentDomain]);

  const handleCombatLose = useCallback(() => {
    // Return to globe view, zone remains active
    setSelectedZone(null);
    setGamePhase('globe');
  }, []);

  // Handle new run
  const handleNewRun = useCallback(() => {
    setCurrentDomain(generateDomain(1));
    setSelectedZone(null);
    setGamePhase('globe');
    setRunStats({ totalScore: 0, zonesCleared: 0, gold: 0 });
  }, []);

  // Render combat phase (DiceMeteor)
  if (gamePhase === 'combat' && selectedZone) {
    return (
      <DiceMeteor
        domain={currentDomain.id}
        eventType={selectedZone.eventType}
        tier={selectedZone.tier}
        scoreGoal={1000 * selectedZone.tier}
        initialSummons={3}
        initialTributes={3}
        gold={runStats.gold}
        domainName={currentDomain.name}
        roomNumber={currentDomain.clearedCount + 1}
        onWin={handleCombatWin}
        onLose={handleCombatLose}
        backgroundImage={currentDomain.background}
      />
    );
  }

  // Render globe phase (zone selection)
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        bgcolor: tokens.colors.background.default,
      }}
    >
      {/* Left: 3D Globe Area */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          minWidth: 0,
        }}
      >
        {/* Back button */}
        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 100 }}>
          <IconButton
            onClick={() => navigate('/play')}
            sx={{
              bgcolor: tokens.colors.background.paper,
              '&:hover': { bgcolor: tokens.colors.background.elevated },
            }}
          >
            <BackIcon />
          </IconButton>
        </Box>

        {/* Title */}
        <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
          <Typography
            sx={{
              fontFamily: tokens.fonts.gaming,
              fontSize: '1.5rem',
              color: tokens.colors.text.primary,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {currentDomain.name.toUpperCase()}
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: tokens.colors.text.secondary,
            }}
          >
            {selectedZone ? 'Launch attack on zone' : 'Select a zone to attack'}
          </Typography>
        </Box>

        {/* Domain progress */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 100,
            textAlign: 'right',
          }}
        >
          <Typography sx={{ fontSize: '0.85rem', color: tokens.colors.text.primary }}>
            Domain {currentDomain.id}/6
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.secondary }}>
            Zones: {currentDomain.clearedCount}/{currentDomain.totalZones}
          </Typography>
        </Box>

        {/* Run stats overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            display: 'flex',
            gap: 3,
            bgcolor: `${tokens.colors.background.paper}cc`,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            border: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: tokens.colors.primary }}>
              {runStats.totalScore}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary }}>
              SCORE
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffd700' }}>
              {runStats.gold}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary }}>
              GOLD
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: tokens.colors.secondary }}>
              {runStats.zonesCleared}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.secondary }}>
              CLEARED
            </Typography>
          </Box>
        </Box>

        {/* Transition overlay */}
        <Fade in={gamePhase === 'transition'}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 200,
              bgcolor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '2rem',
                color: tokens.colors.primary,
                textShadow: '0 0 20px rgba(233, 4, 65, 0.8)',
                animation: 'pulse 0.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.6 },
                },
              }}
            >
              LAUNCHING ATTACK...
            </Typography>
          </Box>
        </Fade>

        {/* 3D Scene with zones */}
        <GlobeScene
          npcs={npcs}
          meteors={meteors}
          impacts={impacts}
          onGlobeClick={handleGlobeClick}
          targetPosition={targetPosition}
          style="lowPoly"
          autoRotate={!selectedZone}
          onInteraction={() => setLastInteraction(Date.now())}
          isIdle={isIdle}
          // Zone props (need to add to GlobeScene)
          zones={currentDomain.zones}
          onZoneClick={handleZoneClick}
          selectedZone={selectedZone}
        />
      </Box>

      {/* Right: Sidebar */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          borderLeft: `1px solid ${tokens.colors.border}`,
          bgcolor: tokens.colors.background.paper,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {selectedZone ? (
          // Zone preview when selected
          <ZonePreview
            zone={selectedZone}
            domainBackground={currentDomain.background}
            domainName={currentDomain.name}
            onLaunch={handleLaunchAttack}
          />
        ) : (
          // Normal sidebar when no zone selected
          <PlaySidebar
            phase="lobby"
            width={SIDEBAR_WIDTH}
            onNewRun={handleNewRun}
            onContinue={() => navigate('/play')}
            hasSavedRun={hasSavedRun()}
          />
        )}
      </Box>
    </Box>
  );
}
