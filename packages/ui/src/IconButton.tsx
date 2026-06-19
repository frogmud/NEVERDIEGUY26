import { ReactNode } from 'react';
import { IconButton as MuiIconButton, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface IconButtonProps {
  /** The icon to render (e.g. an MUI icon element). */
  children: ReactNode;
  /** Accessible label - required since the button has no text. */
  'aria-label': string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

/**
 * IconButton - maps to the BONES "IconButton" component (State=Default|Hover|Disabled).
 * A square icon-only button on a subtle surface.
 */
export function IconButton({
  children,
  'aria-label': ariaLabel,
  disabled,
  size = 'medium',
  onClick,
  sx,
}: IconButtonProps) {
  return (
    <MuiIconButton
      aria-label={ariaLabel}
      disabled={disabled}
      size={size}
      onClick={onClick}
      sx={{
        color: tokens.colors.text.primary,
        borderRadius: `${tokens.radius.md}px`,
        '&:hover': { backgroundColor: tokens.colors.background.elevated },
        '&.Mui-disabled': { color: tokens.colors.text.disabled },
        ...sx,
      }}
    >
      {children}
    </MuiIconButton>
  );
}
