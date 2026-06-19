import { Switch as MuiSwitch, FormControlLabel, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface SwitchProps {
  checked?: boolean;
  disabled?: boolean;
  size?: 'default' | 'small';
  /** Optional label rendered to the right. */
  label?: string;
  onChange?: (checked: boolean) => void;
  sx?: SxProps<Theme>;
}

/**
 * Switch - maps to the BONES "Switch" component (State=Off|On x Size=Default|Small).
 * NDG switches are red (the brand primary) when on, not green.
 */
export function Switch({ checked, disabled, size = 'default', label, onChange, sx }: SwitchProps) {
  const control = (
    <MuiSwitch
      checked={checked}
      disabled={disabled}
      size={size === 'small' ? 'small' : 'medium'}
      onChange={(e) => onChange?.(e.target.checked)}
      sx={{
        '& .Mui-checked': { color: tokens.colors.primary },
        '& .Mui-checked + .MuiSwitch-track': {
          backgroundColor: tokens.colors.primary,
          opacity: 0.5,
        },
        ...sx,
      }}
    />
  );

  if (!label) return control;
  return (
    <FormControlLabel
      control={control}
      label={label}
      disabled={disabled}
      sx={{ color: tokens.colors.text.primary }}
    />
  );
}
