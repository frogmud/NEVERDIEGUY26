import { Autocomplete as MuiAutocomplete, TextField, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface AutocompleteProps {
  options: string[];
  value?: string | null;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string | null) => void;
  sx?: SxProps<Theme>;
}

/**
 * Autocomplete - text field with a suggestion menu. Maps to the BONES "Autocomplete"
 * component (State=Default|Open).
 */
export function Autocomplete({
  options,
  value,
  placeholder,
  disabled,
  onChange,
  sx,
}: AutocompleteProps) {
  return (
    <MuiAutocomplete
      options={options}
      value={value ?? null}
      disabled={disabled}
      onChange={(_, v) => onChange?.(v)}
      sx={sx}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder={placeholder}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: tokens.colors.background.paper,
              '& fieldset': { borderColor: tokens.colors.border },
              '&.Mui-focused fieldset': { borderColor: tokens.colors.info },
            },
          }}
        />
      )}
    />
  );
}
