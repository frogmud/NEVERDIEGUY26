import { Checkbox as MuiCheckbox, FormControlLabel, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  /** Optional label rendered to the right of the box. */
  label?: string;
  onChange?: (checked: boolean) => void;
  sx?: SxProps<Theme>;
}

/**
 * Checkbox - maps to the BONES "Checkbox" component
 * (State=Unchecked|Checked|Indeterminate|Disabled). Checked state uses the brand
 * primary red.
 */
export function Checkbox({
  checked,
  indeterminate,
  disabled,
  label,
  onChange,
  sx,
}: CheckboxProps) {
  const box = (
    <MuiCheckbox
      checked={checked}
      indeterminate={indeterminate}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.checked)}
      sx={{
        color: tokens.colors.text.secondary,
        '&.Mui-checked': { color: tokens.colors.primary },
        '&.MuiCheckbox-indeterminate': { color: tokens.colors.primary },
        ...sx,
      }}
    />
  );

  if (!label) return box;
  return (
    <FormControlLabel
      control={box}
      label={label}
      disabled={disabled}
      sx={{ color: tokens.colors.text.primary }}
    />
  );
}
