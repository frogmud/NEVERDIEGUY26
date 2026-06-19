import { Box, Typography, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface TabProps {
  label: string;
  /** Active tab: primary underline + bright text. */
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

/**
 * Tab - a single tab item. Maps to the BONES "Tabs" component
 * (State=Active|Inactive|Hover|Disabled). Compose a row of these for a tab bar.
 */
export function Tab({ label, active, disabled, onClick, sx }: TabProps) {
  return (
    <Box
      role="tab"
      aria-selected={active}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      sx={{
        px: 2,
        py: 1.5,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        borderBottom: '2px solid',
        borderColor: active ? tokens.colors.primary : 'transparent',
        transition: 'all 150ms ease',
        '&:hover': disabled
          ? undefined
          : { color: tokens.colors.text.primary, borderColor: active ? tokens.colors.primary : tokens.colors.border },
        ...sx,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: active ? 600 : 500,
          color: active ? tokens.colors.text.primary : tokens.colors.text.secondary,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
