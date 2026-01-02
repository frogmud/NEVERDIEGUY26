import { Paper, type SxProps, type Theme } from '@mui/material';
import { tokens } from '../theme';

interface CardSectionProps {
  children: React.ReactNode;
  padding?: number;
  sx?: SxProps<Theme>;
}

export function CardSection({ children, padding = 2, sx }: CardSectionProps) {
  return (
    <Paper
      sx={{
        p: padding,
        backgroundColor: tokens.colors.background.paper,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: '30px',
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}
