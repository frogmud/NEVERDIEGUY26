/**
 * DamageFlash - Visual feedback when damage is dealt.
 * Shows a flash effect and floating damage numbers.
 * Lifted out of CombatTerminal (behavior unchanged).
 */
import { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../../../../theme';
import { getDieColor } from './dieVisuals';

export function DamageFlash({
  impacts,
  scoreGained
}: {
  impacts: Array<{ id: string; dieType: number; timestamp: number }>;
  scoreGained: number;
}) {
  const [flashOpacity] = useState(0);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: string; value: number; opacity: number; y: number }>>([]);
  const lastImpactCount = useRef(0);

  // Trigger damage number on new impacts (flash removed for accessibility)
  useEffect(() => {
    if (impacts.length > lastImpactCount.current && impacts.length > 0) {
      // Add damage number for the score gained
      if (scoreGained > 0) {
        const newDamage = {
          id: `dmg-${Date.now()}`,
          value: scoreGained,
          opacity: 1,
          y: 0,
        };
        setDamageNumbers(prev => [...prev, newDamage]);

        // Animate the damage number
        let frame = 0;
        const animateDamage = () => {
          frame++;
          setDamageNumbers(prev =>
            prev.map(d =>
              d.id === newDamage.id
                ? { ...d, opacity: Math.max(0, 1 - frame / 30), y: frame * 2 }
                : d
            ).filter(d => d.opacity > 0)
          );
          if (frame < 30) {
            requestAnimationFrame(animateDamage);
          }
        };
        requestAnimationFrame(animateDamage);
      }
    }
    lastImpactCount.current = impacts.length;
  }, [impacts.length, scoreGained]);

  // Get primary color from latest impact
  const latestImpact = impacts[impacts.length - 1];
  const flashColor = latestImpact ? getDieColor(latestImpact.dieType) : tokens.colors.primary;

  return (
    <>
      {/* Localized flash effect - centered circle at reticle position */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${flashColor}80 0%, ${flashColor}40 40%, transparent 70%)`,
          opacity: flashOpacity,
          transition: 'opacity 0.1s ease-out',
          pointerEvents: 'none',
          zIndex: 15,
        }}
      />

      {/* Floating damage numbers */}
      {damageNumbers.map(dmg => (
        <Typography
          key={dmg.id}
          sx={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: `translate(-50%, -${dmg.y}px)`,
            fontFamily: tokens.fonts.gaming,
            fontSize: '2rem',
            fontWeight: 700,
            color: tokens.colors.warning,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,193,7,0.5)',
            opacity: dmg.opacity,
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          +{dmg.value.toLocaleString()}
        </Typography>
      ))}
    </>
  );
}
