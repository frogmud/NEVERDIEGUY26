import {
  FormControl,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  SxProps,
  Theme,
} from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  sx?: SxProps<Theme>;
}

/**
 * Select - single-choice dropdown field. Maps to the BONES "Select" component
 * (State=Default|Focus|Error|Disabled).
 */
export function Select({
  value,
  options,
  placeholder,
  error,
  helperText,
  disabled,
  onChange,
  sx,
}: SelectProps) {
  return (
    <FormControl fullWidth error={error} disabled={disabled} sx={sx}>
      <MuiSelect
        displayEmpty
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value as string)}
        renderValue={(selected) =>
          selected ? options.find((o) => o.value === selected)?.label ?? selected : (placeholder ?? '')
        }
        sx={{
          backgroundColor: tokens.colors.background.paper,
          color: value ? tokens.colors.text.primary : tokens.colors.text.disabled,
          '& fieldset': { borderColor: tokens.colors.border },
          '&.Mui-focused fieldset': { borderColor: tokens.colors.info },
        }}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
