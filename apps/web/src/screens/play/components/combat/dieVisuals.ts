/**
 * Shared die-visual helpers for the combat reticle and damage overlays.
 * Lifted out of CombatTerminal so the presentational pieces can live in their
 * own files. Pure data + a color lookup, no component state.
 */
import { DICE_EFFECTS } from '../../../../games/globe-meteor/config';
import { tokens } from '../../../../theme';

// Die shape SVG paths for HUD reticle (centered at 50,50)
export const DIE_SHAPES: Record<number, { points: string }> = {
  4:  { points: '50,15 85,80 15,80' },                    // Triangle
  6:  { points: '50,10 90,50 50,90 10,50' },              // Diamond
  8:  { points: '50,10 87,30 87,70 50,90 13,70 13,30' },  // Hexagon
  10: { points: '50,10 95,40 80,90 20,90 5,40' },         // Pentagon
  12: { points: '50,5 75,15 90,35 90,65 75,85 50,95 25,85 10,65 10,35 25,15' }, // Decagon
  20: { points: '50,8 82,18 92,50 82,82 50,92 18,82 8,50 18,18' }, // Octagon
};

// Die size multipliers for range visualization (d4=smallest, d20=largest)
export const DIE_SIZES: Record<number, number> = {
  4: 0.4,
  6: 0.5,
  8: 0.6,
  10: 0.7,
  12: 0.85,
  20: 1.0,
};

// Die colors from config
export const getDieColor = (dieType: number): string => {
  const effect = DICE_EFFECTS[dieType];
  return effect?.color || tokens.colors.secondary;
};
