import { ReactNode } from 'react';
import { Link as MuiLink, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface LinkProps {
  children: ReactNode;
  href?: string;
  /** Render via a routing component (e.g. react-router Link) instead of an anchor. */
  component?: React.ElementType;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

/**
 * Link - maps to the BONES "Link" component (interactive text, State=Default..Visited).
 * Uses the interactive info accent; underlines on hover.
 */
export function Link({ children, href, component, onClick, sx }: LinkProps) {
  return (
    <MuiLink
      href={href}
      onClick={onClick}
      underline="hover"
      {...(component ? { component } : {})}
      sx={{
        color: tokens.colors.info,
        cursor: 'pointer',
        '&:hover': { color: tokens.colors.info },
        ...sx,
      }}
    >
      {children}
    </MuiLink>
  );
}
