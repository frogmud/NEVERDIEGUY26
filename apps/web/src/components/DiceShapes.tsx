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

// SVG polygon points for each dice shape (matches in-game CombatTerminal)
const DICE_POINTS: Record<number, string> = {
  4:  '50,15 85,80 15,80',                                    // Triangle (d4)
  6:  '50,10 90,50 50,90 10,50',                              // Diamond (d6)
  8:  '50,10 87,30 87,70 50,90 13,70 13,30',                  // Hexagon (d8)
  10: '50,10 95,40 80,90 20,90 5,40',                         // Pentagon (d10)
  12: '50,5 75,15 90,35 90,65 75,85 50,95 25,85 10,65 10,35 25,15', // Decagon (d12)
  20: '50,8 82,18 92,50 82,82 50,92 18,82 8,50 18,18',        // Octagon (d20)
};

export function DiceShape({ sides, size = 48, color, value, onClick, disabled, fontFamily, fontScale = 0.4 }: DiceShapeProps) {
  const points = DICE_POINTS[sides];

  // Adjust text position for triangle (d4) - needs to be lower
  const textY = sides === 4 ? '58%' : '54%';
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
        <polygon
          points={points}
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
            border: '2px solid currentColor',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'inherit',
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
