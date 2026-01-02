import { Box } from '@mui/material';
import { DiceShape } from '../../../components/DiceShapes';

export interface FlyingDie {
  id: number;
  sides: number;
  value: number;
  color: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface FlyingDiceLayerProps {
  flyingDice: FlyingDie[];
}

export function FlyingDiceLayer({ flyingDice }: FlyingDiceLayerProps) {
  return (
    <>
      {flyingDice.map((dice) => {
        const dx = dice.endX - dice.startX;
        const dy = dice.endY - dice.startY;
        return (
          <Box
            key={dice.id}
            sx={{
              position: 'fixed',
              left: dice.startX,
              top: dice.startY,
              zIndex: 9999,
              pointerEvents: 'none',
              '--fly-dx': `${dx}px`,
              '--fly-dy': `${dy}px`,
              animation: 'flyDice 0.4s ease-out forwards',
            }}
          >
            <DiceShape
              sides={dice.sides as 4 | 6 | 8 | 10 | 12 | 20}
              size={50}
              color={dice.color}
              value={dice.value}
            />
          </Box>
        );
      })}
    </>
  );
}
