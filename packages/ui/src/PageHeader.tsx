import { Fragment, ReactNode } from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export interface PageHeaderCrumb {
  label: string;
  /** When set, the crumb is interactive (the last crumb is usually static). */
  onClick?: () => void;
}

export interface PageHeaderProps {
  /** Page title (large, bold). */
  title: string;
  /** Optional breadcrumb trail, rendered with `›` separators above the title. */
  breadcrumbs?: PageHeaderCrumb[];
  /** Optional trailing action, right-aligned next to the title (e.g. a button). */
  action?: ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * PageHeader - breadcrumb + page title + optional action.
 *
 * Maps to the BONES "Page Header" component (Breadcrumb=Show|Hide x Action=None|Button).
 * The action is a slot so the page owns its button (no Button dependency yet).
 */
export function PageHeader({ title, breadcrumbs, action, sx }: PageHeaderProps) {
  return (
    <Box sx={{ ...sx }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.5,
            mb: 1,
          }}
        >
          {breadcrumbs.map((crumb, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ color: tokens.colors.text.disabled }}
                >
                  ›
                </Typography>
              )}
              <Typography
                component="span"
                variant="caption"
                onClick={crumb.onClick}
                sx={{
                  color: crumb.onClick ? tokens.colors.info : tokens.colors.text.secondary,
                  cursor: crumb.onClick ? 'pointer' : 'default',
                  '&:hover': crumb.onClick ? { textDecoration: 'underline' } : undefined,
                }}
              >
                {crumb.label}
              </Typography>
            </Fragment>
          ))}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {action}
      </Box>
    </Box>
  );
}
