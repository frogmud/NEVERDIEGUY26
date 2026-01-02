import { Box, Typography, Switch } from '@mui/material';
import { tokens } from '../theme';

interface SettingRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  isLast?: boolean;
  disabled?: boolean;
}

export function SettingRow({
  title,
  description,
  checked,
  onChange,
  isLast = false,
  disabled = false,
}: SettingRowProps) {
  return (
    <Box
      onClick={disabled ? undefined : onChange}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: isLast ? 'none' : `1px solid ${tokens.colors.border}`,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        '&:hover': {
          backgroundColor: disabled ? 'transparent' : tokens.colors.background.elevated,
        },
      }}
    >
      <Box>
        <Typography variant="body1">{title}</Typography>
        <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
          {description}
        </Typography>
      </Box>
      <Switch
        checked={checked}
        onClick={(e) => e.stopPropagation()}
        onChange={onChange}
        disabled={disabled}
      />
    </Box>
  );
}
