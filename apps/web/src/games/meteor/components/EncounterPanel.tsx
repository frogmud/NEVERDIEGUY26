import { useState, useCallback } from 'react';
import { Box, Typography, Button, Avatar, Chip } from '@mui/material';
import {
  HandshakeSharp as AcceptIcon,
  BlockSharp as DeclineIcon,
  LocalFireDepartmentSharp as ProvokeIcon,
  AutoAwesomeSharp as FavorIcon,
  SpaSharp as CalmIcon,
  WhatshotSharp as HeatIcon,
} from '@mui/icons-material';
import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { BottomSheet } from '../../../components/BottomSheet';
import { tokens } from '../../../theme';
import type { EncounterState } from '../gameConfig';
import type { Wanderer } from '../../../data/wiki/types';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// Wanderer choice result - what the player gets
export interface WandererChoiceResult {
  choice: 'accept' | 'decline' | 'provoke';
  favorTokens?: number;  // Accept: +1 favor
  calmBonus?: number;    // Decline: +1 calm
  heat?: number;         // Provoke: +1 heat
  reward?: { type: 'gold' | 'item'; amount: number };
  duelRequired?: boolean;
}

interface EncounterPanelProps {
  open: boolean;
  encounter: EncounterState | null;
  onWin: (reward: { type: 'gold' | 'item'; amount: number }) => void;
  onLose: () => void;
  onDraw: (drawCount: number, pressure: number) => void;
  onDecline: () => void;
  // New wanderer props
  wanderer?: Wanderer | null;
  useWandererMode?: boolean;
  onWandererChoice?: (result: WandererChoiceResult) => void;
}

type DuelPhase = 'challenge' | 'rolling' | 'result';
type DuelResult = 'win' | 'lose' | 'draw' | null;

// Wanderer encounter phase
type WandererPhase = 'choice' | 'duel' | 'result';

export function EncounterPanel({
  open,
  encounter,
  onWin,
  onLose,
  onDraw,
  onDecline,
  wanderer,
  useWandererMode = false,
  onWandererChoice,
}: EncounterPanelProps) {
  const [phase, setPhase] = useState<DuelPhase>('challenge');
  const [playerRoll, setPlayerRoll] = useState<number | null>(null);
  const [npcRoll, setNpcRoll] = useState<number | null>(null);
  const [result, setResult] = useState<DuelResult>(null);
  const [drawCount, setDrawCount] = useState(0);

  // Wanderer mode state
  const [wandererPhase, setWandererPhase] = useState<WandererPhase>('choice');
  const [pendingChoice, setPendingChoice] = useState<WandererChoiceResult | null>(null);

  // Handle wanderer choice
  const handleWandererChoice = useCallback((choice: 'accept' | 'decline' | 'provoke') => {
    let result: WandererChoiceResult;

    switch (choice) {
      case 'accept':
        result = {
          choice: 'accept',
          favorTokens: 1,
          reward: { type: 'gold', amount: 50 },
        };
        break;
      case 'decline':
        result = {
          choice: 'decline',
          calmBonus: 1,
        };
        break;
      case 'provoke':
        result = {
          choice: 'provoke',
          heat: 1,
          duelRequired: true,
          reward: { type: 'gold', amount: 100 },
        };
        break;
    }

    setPendingChoice(result);

    if (result.duelRequired) {
      setWandererPhase('duel');
    } else {
      setWandererPhase('result');
    }
  }, []);

  // Confirm wanderer choice result
  const handleConfirmWandererChoice = useCallback(() => {
    if (pendingChoice && onWandererChoice) {
      onWandererChoice(pendingChoice);
    }
    // Reset state
    setWandererPhase('choice');
    setPendingChoice(null);
  }, [pendingChoice, onWandererChoice]);

  const handleRoll = useCallback(() => {
    if (!encounter) return;

    setPhase('rolling');

    // Roll both dice
    const playerDiceRoll = new DiceRoll(`1d${encounter.playerDice}`);
    const npcDiceRoll = new DiceRoll(`1d${encounter.npcDice}`);

    const playerTotal = playerDiceRoll.total;
    const npcTotal = npcDiceRoll.total + encounter.npcBonus;

    // Animate the reveal
    setTimeout(() => {
      setPlayerRoll(playerDiceRoll.total);
    }, 300);

    setTimeout(() => {
      setNpcRoll(npcDiceRoll.total);
    }, 600);

    setTimeout(() => {
      setPhase('result');

      if (playerTotal > npcTotal) {
        setResult('win');
      } else if (playerTotal < npcTotal) {
        setResult('lose');
      } else {
        setResult('draw');
        setDrawCount((prev) => prev + 1);
      }
    }, 900);
  }, [encounter]);

  const handleContinue = useCallback(() => {
    if (!encounter) return;

    if (result === 'win') {
      onWin(encounter.reward);
    } else if (result === 'lose') {
      onLose();
    } else if (result === 'draw') {
      // Pressure increases by 10 per draw
      const pressure = (drawCount + 1) * 10;
      onDraw(drawCount + 1, pressure);
      // Reset for another roll
      setPhase('challenge');
      setPlayerRoll(null);
      setNpcRoll(null);
      setResult(null);
    }
  }, [result, encounter, drawCount, onWin, onLose, onDraw]);

  const handleDecline = useCallback(() => {
    // Reset state
    setPhase('challenge');
    setPlayerRoll(null);
    setNpcRoll(null);
    setResult(null);
    setDrawCount(0);
    onDecline();
  }, [onDecline]);

  // Guard for legacy mode
  if (!useWandererMode && !encounter) return null;

  // Wanderer mode UI
  if (useWandererMode && wanderer) {
    return (
      <BottomSheet open={open} height="auto" showHandle={true}>
        <Box
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Wanderer Header */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                ...gamingFont,
                fontSize: '0.7rem',
                color: tokens.colors.text.disabled,
                letterSpacing: '0.1em',
                mb: 0.5,
              }}
            >
              WANDERER ENCOUNTER
            </Typography>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: tokens.colors.background.elevated,
                border: `3px solid ${tokens.colors.secondary}`,
                fontSize: '1.875rem',
                mx: 'auto',
                mb: 1,
              }}
            >
              {wanderer.name[0]}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {wanderer.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {wanderer.role || 'A mysterious traveler'}
            </Typography>
          </Box>

          {/* Choice Phase */}
          {wandererPhase === 'choice' && (
            <>
              <Typography
                variant="body2"
                sx={{ textAlign: 'center', color: tokens.colors.text.secondary, maxWidth: 300 }}
              >
                The wanderer offers you a deal. How do you respond?
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Accept */}
                <Button
                  variant="contained"
                  onClick={() => handleWandererChoice('accept')}
                  startIcon={<AcceptIcon />}
                  sx={{
                    bgcolor: tokens.colors.success,
                    minWidth: 100,
                    flexDirection: 'column',
                    py: 1.5,
                    gap: 0.5,
                    '&:hover': { bgcolor: tokens.colors.success, filter: 'brightness(1.1)' },
                  }}
                >
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>Accept</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FavorIcon sx={{ fontSize: 12 }} />
                    <Typography sx={{ fontSize: '0.6rem' }}>+1 Favor</Typography>
                  </Box>
                </Button>

                {/* Decline */}
                <Button
                  variant="outlined"
                  onClick={() => handleWandererChoice('decline')}
                  startIcon={<DeclineIcon />}
                  sx={{
                    borderColor: tokens.colors.text.secondary,
                    color: tokens.colors.text.secondary,
                    minWidth: 100,
                    flexDirection: 'column',
                    py: 1.5,
                    gap: 0.5,
                    '&:hover': { borderColor: tokens.colors.text.primary, bgcolor: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>Decline</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalmIcon sx={{ fontSize: 12 }} />
                    <Typography sx={{ fontSize: '0.6rem' }}>+1 Calm</Typography>
                  </Box>
                </Button>

                {/* Provoke */}
                <Button
                  variant="contained"
                  onClick={() => handleWandererChoice('provoke')}
                  startIcon={<ProvokeIcon />}
                  sx={{
                    bgcolor: tokens.colors.error,
                    minWidth: 100,
                    flexDirection: 'column',
                    py: 1.5,
                    gap: 0.5,
                    '&:hover': { bgcolor: tokens.colors.error, filter: 'brightness(1.1)' },
                  }}
                >
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>Provoke</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <HeatIcon sx={{ fontSize: 12 }} />
                    <Typography sx={{ fontSize: '0.6rem' }}>+1 Heat + Duel</Typography>
                  </Box>
                </Button>
              </Box>
            </>
          )}

          {/* Duel Phase (when provoke is chosen) */}
          {wandererPhase === 'duel' && (
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                label="DUEL INITIATED"
                sx={{
                  bgcolor: `${tokens.colors.error}20`,
                  color: tokens.colors.error,
                  mb: 2,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You've challenged the wanderer. Roll to determine the outcome.
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  // Skip actual duel for now, go straight to result
                  setWandererPhase('result');
                }}
              >
                Roll for Duel
              </Button>
            </Box>
          )}

          {/* Result Phase */}
          {wandererPhase === 'result' && pendingChoice && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: pendingChoice.choice === 'accept'
                    ? tokens.colors.success
                    : pendingChoice.choice === 'decline'
                    ? tokens.colors.text.secondary
                    : tokens.colors.error,
                  mb: 1,
                }}
              >
                {pendingChoice.choice === 'accept' && 'Deal Accepted'}
                {pendingChoice.choice === 'decline' && 'Politely Declined'}
                {pendingChoice.choice === 'provoke' && 'Duel Won!'}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                {pendingChoice.favorTokens && (
                  <Chip
                    icon={<FavorIcon />}
                    label={`+${pendingChoice.favorTokens} Favor`}
                    size="small"
                    sx={{ bgcolor: `${tokens.colors.success}20`, color: tokens.colors.success }}
                  />
                )}
                {pendingChoice.calmBonus && (
                  <Chip
                    icon={<CalmIcon />}
                    label={`+${pendingChoice.calmBonus} Calm`}
                    size="small"
                    sx={{ bgcolor: `${tokens.colors.secondary}20`, color: tokens.colors.secondary }}
                  />
                )}
                {pendingChoice.heat && (
                  <Chip
                    icon={<HeatIcon />}
                    label={`+${pendingChoice.heat} Heat`}
                    size="small"
                    sx={{ bgcolor: `${tokens.colors.error}20`, color: tokens.colors.error }}
                  />
                )}
                {pendingChoice.reward && (
                  <Chip
                    label={`+${pendingChoice.reward.amount} ${pendingChoice.reward.type}`}
                    size="small"
                    sx={{ bgcolor: `${tokens.colors.warning}20`, color: tokens.colors.warning }}
                  />
                )}
              </Box>

              <Button
                variant="contained"
                onClick={handleConfirmWandererChoice}
                sx={{
                  bgcolor: tokens.colors.primary,
                  minWidth: 120,
                  '&:hover': { bgcolor: tokens.colors.primary, filter: 'brightness(1.1)' },
                }}
              >
                Continue
              </Button>
            </Box>
          )}
        </Box>
      </BottomSheet>
    );
  }

  // Legacy encounter mode (fallback)
  if (!encounter) return null;

  return (
    <BottomSheet open={open} height="auto" showHandle={true}>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/* NPC Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: tokens.colors.background.elevated,
              border: `2px solid ${tokens.colors.border}`,
            }}
          >
            {encounter.npcName[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {encounter.npcName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Challenges you to a dice duel
            </Typography>
          </Box>
        </Box>

        {/* Draw count warning */}
        {drawCount > 0 && (
          <Chip
            label={`${drawCount} draw${drawCount > 1 ? 's' : ''} - Domain pressure +${drawCount * 10}%`}
            color="warning"
            size="small"
          />
        )}

        {/* Dice display */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            my: 2,
          }}
        >
          {/* Player die */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Your Die
            </Typography>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                bgcolor: tokens.colors.background.elevated,
                border: `2px solid ${tokens.colors.secondary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 0.5,
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: tokens.colors.secondary }}>
                {playerRoll ?? `d${encounter.playerDice}`}
              </Typography>
            </Box>
          </Box>

          {/* VS */}
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: tokens.colors.text.secondary }}
          >
            VS
          </Typography>

          {/* NPC die */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {encounter.npcName.split(' ')[0]}'s Die
              {encounter.npcBonus > 0 && ` (+${encounter.npcBonus})`}
            </Typography>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                bgcolor: tokens.colors.background.elevated,
                border: `2px solid ${tokens.colors.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 0.5,
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: tokens.colors.primary }}>
                {npcRoll ?? `d${encounter.npcDice}`}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Result message */}
        {phase === 'result' && (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color:
                result === 'win'
                  ? tokens.colors.success
                  : result === 'lose'
                    ? tokens.colors.error
                    : tokens.colors.warning,
            }}
          >
            {result === 'win' && 'You Win!'}
            {result === 'lose' && 'You Lose'}
            {result === 'draw' && 'Draw - Roll Again!'}
          </Typography>
        )}

        {/* Reward preview */}
        {phase === 'challenge' && (
          <Typography variant="body2" color="text.secondary">
            Win to earn: {encounter.reward.amount}{' '}
            {encounter.reward.type === 'gold' ? 'gold' : 'item'}
          </Typography>
        )}

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          {phase === 'challenge' && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRoll}
                sx={{ minWidth: 120 }}
              >
                Roll!
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleDecline}
                sx={{ minWidth: 120 }}
              >
                Decline
              </Button>
            </>
          )}

          {phase === 'rolling' && (
            <Typography color="text.secondary">Rolling...</Typography>
          )}

          {phase === 'result' && (
            <Button
              variant="contained"
              color={result === 'win' ? 'success' : result === 'draw' ? 'warning' : 'error'}
              onClick={handleContinue}
              sx={{ minWidth: 120 }}
            >
              {result === 'draw' ? 'Roll Again' : 'Continue'}
            </Button>
          )}
        </Box>
      </Box>
    </BottomSheet>
  );
}
