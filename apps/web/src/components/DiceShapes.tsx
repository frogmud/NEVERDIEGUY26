import { Box, Typography } from '@mui/material';

interface DiceShapeProps {
  sides: 4 | 6 | 8 | 10 | 12 | 20;
  size?: number;
  color: string;
  value?: number | string;
  onClick?: () => void;
  disabled?: boolean;
  fontFamily?: string;
  fontScale?: number;
}

// SVG path data for each dice shape
const DICE_PATHS: Record<number, string> = {
  // Triangle (d4)
  4: 'M50 5 L95 90 L5 90 Z',
  // Square (d6)
  6: 'M10 10 L90 10 L90 90 L10 90 Z',
  // Hexagon rotated (d8)
  8: 'M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z',
  // Pentagon/diamond (d10)
  10: 'M50 5 L95 40 L80 95 L20 95 L5 40 Z',
  // Dodecagon-ish (d12)
  12: 'M50 5 L80 15 L95 40 L95 65 L80 90 L50 95 L20 90 L5 65 L5 40 L20 15 Z',
  // Octagon (d20)
  20: 'M30 5 L70 5 L95 30 L95 70 L70 95 L30 95 L5 70 L5 30 Z',
};

export function DiceShape({ sides, size = 48, color, value, onClick, disabled, fontFamily, fontScale = 0.4 }: DiceShapeProps) {
  const path = DICE_PATHS[sides];

  // Adjust text position for triangle (d4) - needs to be lower
  const textY = sides === 4 ? '62%' : '54%';
  const fontSize = size * fontScale;

  return (
    <Box
      onClick={disabled ? undefined : onClick}
      sx={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        maxWidth: size,
        maxHeight: size,
        overflow: 'hidden',
        flexShrink: 0,
        cursor: onClick && !disabled ? 'pointer' : 'default',
        opacity: disabled ? 0.5 : 1,
        transition: 'transform 0.15s ease, filter 0.15s ease',
        '&:hover': onClick && !disabled ? {
          transform: 'scale(1.1)',
          filter: 'brightness(1.15)',
        } : {},
        '&:active': onClick && !disabled ? {
          transform: 'scale(0.95)',
        } : {},
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ display: 'block', maxWidth: size, maxHeight: size }}
      >
        <path
          d={path}
          fill={color}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        />
        {value !== undefined && (
          <text
            x="50%"
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={fontSize}
            fontWeight="700"
            fontFamily={fontFamily || 'Inter, sans-serif'}
          >
            {value}
          </text>
        )}
      </svg>
    </Box>
  );
}

// Mini version for chips/selectors
interface DiceMiniProps {
  sides: 4 | 6 | 8 | 10 | 12 | 20;
  color: string;
  selected?: boolean;
  count?: number;
  onClick?: () => void;
}

export function DiceMini({ sides, color, selected, count, onClick }: DiceMiniProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease',
        '&:hover': onClick ? {
          transform: 'scale(1.1)',
        } : {},
      }}
    >
      <DiceShape
        sides={sides}
        size={40}
        color={selected ? color : `${color}60`}
        value={sides === 4 ? '4' : sides === 6 ? '6' : sides === 8 ? '8' : sides === 10 ? '10' : sides === 12 ? '12' : '20'}
      />
      {count !== undefined && count > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #1a1a1a',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1,
            }}
          >
            {count}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
