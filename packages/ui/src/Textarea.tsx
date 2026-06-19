import { TextField, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface TextareaProps {
  value?: string;
  placeholder?: string;
  rows?: number;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  sx?: SxProps<Theme>;
}

/**
 * Textarea - multi-line text field. Maps to the BONES "Textarea" component
 * (State=Default|Focus|Error). MUI handles focus styling; `error` drives the error state.
 */
export function Textarea({
  value,
  placeholder,
  rows = 4,
  error,
  helperText,
  disabled,
  onChange,
  sx,
}: TextareaProps) {
  return (
    <TextField
      multiline
      fullWidth
      minRows={rows}
      value={value}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      disabled={disabled}
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
