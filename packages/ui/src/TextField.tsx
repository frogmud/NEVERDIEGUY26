import { TextField as MuiTextField, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface TextFieldProps {
  value?: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  disabled?: boolean;
  type?: string;
  onChange?: (value: string) => void;
  sx?: SxProps<Theme>;
}

/**
 * TextField - single-line text input. Maps to the BONES "Text Field" component
 * (State=Default|Focus|Error). MUI handles focus styling; `error` drives the error state.
 */
export function TextField({
  value,
  label,
  placeholder,
  helperText,
  error,
  disabled,
  type,
  onChange,
  sx,
}: TextFieldProps) {
  return (
    <MuiTextField
      fullWidth
      size="small"
      value={value}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      error={error}
      disabled={disabled}
      type={type}
      onChange={(e) => onChange?.(e.target.value)}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: tokens.colors.background.paper,
          '& fieldset': { borderColor: tokens.colors.border },
          '&.Mui-focused fieldset': { borderColor: tokens.colors.info },
        },
        ...sx,
      }}
    />
  );
}
