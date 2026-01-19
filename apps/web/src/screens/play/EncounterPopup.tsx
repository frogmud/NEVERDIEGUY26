/**
 * EncounterPopup - Enemy Encounter During Flume Transit
 *
 * Fast, skippable encounters where enemies speak as vessels for Die-rectors.
 * Features:
 * - ASCII filter visual style
 * - Typewriter effect for dialogue
 * - Auto-skip countdown (2.5s default)
 * - Quick action buttons (COMPLY/DEFY/SKIP)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Button, LinearProgress, keyframes, Fade, Grow } from '@mui/material';
import { SkipNextSharp as SkipIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import type {
  EnemyEncounter,
  EncounterOption,
  EncounterResult,
  EncounterEffect,
} from '@ndg/ai-engine';
import { DIE_RECTOR_META, ENEMY_META } from '@ndg/ai-engine';

// ============================================
// Animations
// ============================================

const scanline = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100vh); }
`;

const glitch = keyframes`
  0%, 100% { transform: translateX(0); opacity: 1; }
  20% { transform: translateX(-2px); opacity: 0.8; }
  40% { transform: translateX(2px); }
  60% { transform: translateX(-1px); opacity: 0.9; }
  80% { transform: translateX(1px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

// ============================================
// Typewriter Hook
// ============================================

function useTypewriter(text: string, speed: number = 30, enabled: boolean = true) {
  const [displayed, setDisplayed] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      setIsComplete(true);
      return;
    }

    setDisplayed('');
    setIsComplete(false);

    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  const skip = useCallback(() => {
    setDisplayed(text);
    setIsComplete(true);
  }, [text]);

  return { displayed, isComplete, skip };
}

// ============================================
// Effect Preview
// ============================================

function EffectPreview({ effects }: { effects: EncounterEffect[] }) {
  if (effects.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
      {effects.map((effect, i) => {
        const isPositive = effect.value > 0;
        const color = isPositive ? tokens.colors.success : tokens.colors.error;
        const prefix = isPositive ? '+' : '';
        const label = effect.description || `${effect.type} ${prefix}${effect.value}`;

        return (
          <Typography
            key={i}
            variant="caption"
            sx={{
              color,
              fontFamily: tokens.fonts.mono,
              fontSize: '0.7rem',
              opacity: 0.8,
            }}
          >
            [{label}]
          </Typography>
        );
      })}
    </Box>
  );
}

// ============================================
// Option Button
// ============================================

interface OptionButtonProps {
  option: EncounterOption;
  onSelect: () => void;
  disabled: boolean;
  showPreview: boolean;
  dieRectorColor: string;
}

function OptionButton({ option, onSelect, disabled, showPreview, dieRectorColor }: OptionButtonProps) {
  const isSkip = option.id === 'skip' || option.isDefault;

  return (
    <Box sx={{ flex: 1, minWidth: 100 }}>
      <Button
        fullWidth
        variant={isSkip ? 'text' : 'contained'}
        onClick={onSelect}
        disabled={disabled}
        sx={{
          py: 1,
          fontFamily: tokens.fonts.gaming,
          fontSize: '0.9rem',
          letterSpacing: '0.05em',
          bgcolor: isSkip ? 'transparent' : `${dieRectorColor}cc`,
          color: isSkip ? tokens.colors.text.secondary : '#fff',
          border: isSkip ? `1px solid ${tokens.colors.border}` : 'none',
          '&:hover': {
            bgcolor: isSkip ? 'rgba(255,255,255,0.05)' : dieRectorColor,
            transform: 'scale(1.02)',
          },
          transition: 'all 150ms ease',
        }}
      >
        {option.label}
      </Button>
      {showPreview && <EffectPreview effects={option.effects} />}
    </Box>
  );
}

// ============================================
// Main Component
// ============================================

export interface EncounterPopupProps {
  encounter: EnemyEncounter;
  onComplete: (result: EncounterResult) => void;
  showEffectPreviews?: boolean;
  typewriterSpeed?: 'slow' | 'normal' | 'fast' | 'instant';
}

export function EncounterPopup({
  encounter,
  onComplete,
  showEffectPreviews = true,
  typewriterSpeed = 'normal',
}: EncounterPopupProps) {
  const [autoSkipProgress, setAutoSkipProgress] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [phase, setPhase] = useState<'entering' | 'dialogue' | 'options' | 'exiting'>('entering');
  const autoSkipRef = useRef<NodeJS.Timeout | null>(null);

  // Get speed in ms
  const speedMs = {
    slow: 50,
    normal: 30,
    fast: 15,
    instant: 0,
  }[typewriterSpeed];

  // Typewriter effect
  const { displayed, isComplete, skip: skipTypewriter } = useTypewriter(
    encounter.dialogue,
    speedMs,
    typewriterSpeed !== 'instant'
  );

  // Get metadata
  const dieRectorMeta = DIE_RECTOR_META[encounter.channeling];
  const enemyMeta = ENEMY_META[encounter.enemy];
  const dieRectorColor = encounter.dieRectorColor || dieRectorMeta?.color || '#1a1a2e';

  // Phase transitions
  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('dialogue'), 200);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    if (isComplete && phase === 'dialogue') {
      const optionsTimer = setTimeout(() => setPhase('options'), 300);
      return () => clearTimeout(optionsTimer);
    }
  }, [isComplete, phase]);

  // Auto-skip countdown
  useEffect(() => {
    if (phase !== 'options') return;

    const startTime = Date.now();
    const duration = encounter.autoSkipDelay;

    autoSkipRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setAutoSkipProgress(progress);

      if (elapsed >= duration) {
        handleSelect(encounter.options.find(o => o.isDefault) || encounter.options[0]);
      }
    }, 50);

    return () => {
      if (autoSkipRef.current) clearInterval(autoSkipRef.current);
    };
  }, [phase, encounter.autoSkipDelay, encounter.options]);

  // Handle option selection
  const handleSelect = useCallback((option: EncounterOption) => {
    if (selectedOption) return;

    setSelectedOption(option.id);
    if (autoSkipRef.current) clearInterval(autoSkipRef.current);
    setPhase('exiting');

    // Delay to show selection feedback
    setTimeout(() => {
      const result: EncounterResult = {
        encounterId: encounter.id,
        chosenOptionId: option.id,
        wasSkipped: option.isDefault ?? false,
        wasAutoSkipped: autoSkipProgress >= 100,
        effects: option.effects,
      };
      onComplete(result);
    }, 400);
  }, [selectedOption, encounter.id, autoSkipProgress, onComplete]);

  // Handle tap to skip typewriter
  const handleTap = useCallback(() => {
    if (!isComplete) {
      skipTypewriter();
    }
  }, [isComplete, skipTypewriter]);

  return (
    <Fade in={phase !== 'exiting'} timeout={300}>
      <Box
        onClick={handleTap}
        sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0, 0, 0, 0.92)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          overflow: 'hidden',
          cursor: !isComplete ? 'pointer' : 'default',
        }}
      >
        {/* ASCII Scanline Effect */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            bgcolor: 'rgba(255,255,255,0.05)',
            animation: `${scanline} 8s linear infinite`,
            pointerEvents: 'none',
          }}
        />

        {/* Content Container */}
        <Box
          sx={{
            maxWidth: 600,
            width: '90%',
            px: 3,
            py: 4,
          }}
        >
          {/* Enemy Label */}
          <Grow in={phase !== 'entering'} timeout={300}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: tokens.fonts.mono,
                  color: dieRectorColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  fontSize: '0.7rem',
                  opacity: 0.8,
                }}
              >
                [{enemyMeta?.name || encounter.enemy}] channeling [{dieRectorMeta?.name || encounter.channeling}]
              </Typography>
            </Box>
          </Grow>

          {/* Dialogue Box */}
          <Box
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              border: `1px solid ${dieRectorColor}40`,
              borderRadius: 1,
              p: 3,
              mb: 3,
              minHeight: 120,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                bgcolor: dieRectorColor,
                opacity: 0.6,
              },
            }}
          >
            {/* Eye indicator */}
            <Box
              sx={{
                position: 'absolute',
                top: -12,
                left: 24,
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: dieRectorColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: `${pulse} 2s ease-in-out infinite`,
                boxShadow: `0 0 20px ${dieRectorColor}`,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#000',
                }}
              />
            </Box>

            {/* Dialogue Text */}
            <Typography
              sx={{
                fontFamily: tokens.fonts.gaming,
                fontSize: '1.1rem',
                lineHeight: 1.6,
                color: tokens.colors.text.primary,
                textShadow: `0 0 10px ${dieRectorColor}40`,
                animation: phase === 'dialogue' ? `${glitch} 4s ease-in-out infinite` : 'none',
                whiteSpace: 'pre-wrap',
              }}
            >
              {displayed}
              {!isComplete && (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    width: '8px',
                    height: '1.1em',
                    bgcolor: dieRectorColor,
                    ml: 0.5,
                    animation: 'blink 0.8s step-end infinite',
                    '@keyframes blink': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0 },
                    },
                  }}
                />
              )}
            </Typography>

            {/* Tap to skip hint */}
            {!isComplete && (
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 12,
                  color: tokens.colors.text.secondary,
                  fontFamily: tokens.fonts.mono,
                  fontSize: '0.65rem',
                  opacity: 0.5,
                }}
              >
                tap to skip
              </Typography>
            )}
          </Box>

          {/* Options */}
          <Grow in={phase === 'options' || phase === 'exiting'} timeout={400}>
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  mb: 2,
                }}
              >
                {encounter.options.map((option) => (
                  <OptionButton
                    key={option.id}
                    option={option}
                    onSelect={() => handleSelect(option)}
                    disabled={!!selectedOption}
                    showPreview={showEffectPreviews}
                    dieRectorColor={dieRectorColor}
                  />
                ))}
              </Box>

              {/* Auto-skip progress */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SkipIcon sx={{ fontSize: 14, color: tokens.colors.text.secondary, opacity: 0.5 }} />
                <LinearProgress
                  variant="determinate"
                  value={autoSkipProgress}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: tokens.colors.text.secondary,
                      opacity: 0.5,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: tokens.fonts.mono,
                    fontSize: '0.65rem',
                    color: tokens.colors.text.secondary,
                    opacity: 0.5,
                    minWidth: 40,
                  }}
                >
                  {((encounter.autoSkipDelay - (autoSkipProgress / 100) * encounter.autoSkipDelay) / 1000).toFixed(1)}s
                </Typography>
              </Box>
            </Box>
          </Grow>
        </Box>

        {/* Encounter Type Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 24,
            right: 24,
            px: 2,
            py: 0.5,
            borderRadius: 1,
            bgcolor: 'rgba(0,0,0,0.6)',
            border: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontFamily: tokens.fonts.mono,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontSize: '0.65rem',
              color: tokens.colors.text.secondary,
            }}
          >
            {encounter.type}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
}

export default EncounterPopup;
