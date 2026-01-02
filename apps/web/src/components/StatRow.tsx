import { Box, Typography } from '@mui/material';
import { tokens } from '../theme';

interface StatRowProps {
  label: string;
  value: string | number;
  valueColor?: string;
  bold?: boolean;
}

export function StatRow({ label, value, valueColor, bold }: StatRowProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: bold ? 600 : 400,
          color: valueColor || tokens.colors.text.primary,
        }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Typography>
    </Box>
  );
}
