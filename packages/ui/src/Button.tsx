import { ReactNode } from 'react';
import { Button as MuiButton, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export type ButtonVariant = 'contained' | 'outlined' | 'subtle' | 'text' | 'destructive';
export type ButtonSize = 'default' | 'small';

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

/**
 * Button - maps to the BONES "Button" component
 * (Style=Contained|Outlined|Subtle|Text|Destructive x Size=Default|Small x State).
 * Brand primary is red; Destructive uses the error red.
 */
export function Button({
  children,
  variant = 'contained',
  size = 'default',
  disabled,
  startIcon,
  endIcon,
  onClick,
  sx,
}: ButtonProps) {
  const variantSx: Record<ButtonVariant, SxProps<Theme>> = {
    contained: {
      backgroundColor: tokens.colors.primary,
      color: '#fff',
      '&:hover': { backgroundColor: tokens.colors.primary, filter: 'brightness(1.1)' },
    },
    outlined: {
      backgroundColor: 'transparent',
      color: tokens.colors.text.primary,
      border: `1px solid ${tokens.colors.border}`,
      '&:hover': { borderColor: tokens.colors.primary, color: tokens.colors.primary },
    },
    subtle: {
      backgroundColor: tokens.colors.background.elevated,
      color: tokens.colors.text.primary,
      '&:hover': { backgroundColor: tokens.colors.background.paper },
    },
    text: {
      backgroundColor: 'transparent',
      color: tokens.colors.text.primary,
      '&:hover': { backgroundColor: tokens.colors.background.elevated },
    },
    destructive: {
      backgroundColor: tokens.colors.error,
      color: '#fff',
      '&:hover': { backgroundColor: tokens.colors.error, filter: 'brightness(1.1)' },
    },
  };

  return (
    <MuiButton
      disableElevation
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={onClick}
      size={size === 'small' ? 'small' : 'medium'}
      sx={[
        {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: `${tokens.radius.md}px`,
          '&.Mui-disabled': {
            backgroundColor: tokens.colors.background.elevated,
            color: tokens.colors.text.disabled,
          },
        },
        variantSx[variant],
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </MuiButton>
  );
}
