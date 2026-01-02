/**
 * CardHeader - Standardized card header component
 *
 * Design pattern extracted from Homepage (Dec 28, 2024)
 * - Padding: px: 3, py: 2.25
 * - Typography: fontWeight 600, fontSize 1.125rem
 * - Border bottom separator
 * - Optional info tooltip, count, and action button
 */

import { ReactNode } from 'react';
import { Box, Typography, Tooltip, IconButton, TooltipProps } from '@mui/material';
import { OpenInNewSharp as OpenInNewIcon } from '@mui/icons-material';
import { tokens } from '../../theme';

interface CardHeaderProps {
  /** Card title */
  title: string;
  /** Optional count to display after title (e.g., "Games (14)") */
  count?: number;
  /** Optional info tooltip text */
  infoTooltip?: string;
  /** Optional tooltip placement */
  tooltipPlacement?: TooltipProps['placement'];
  /** Action type or custom ReactNode */
  action?: 'external' | ReactNode;
  /** Tooltip for external action */
  actionTooltip?: string;
  /** Click handler for action */
  onActionClick?: () => void;
  /** Additional content to render in the header (e.g., search bar, toggles) */
  children?: ReactNode;
}

export function CardHeader({
  title,
  count,
  infoTooltip,
  tooltipPlacement,
  action,
  actionTooltip,
  onActionClick,
  children,
}: CardHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2.25,
        borderBottom: `1px solid ${tokens.colors.border}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: '1.125rem' }}>
          {title}
          {count !== undefined && ` (${count})`}
        </Typography>
        {infoTooltip && <InfoTooltip title={infoTooltip} placement={tooltipPlacement} />}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {children}
        {action === 'external' ? (
          <Tooltip title={actionTooltip || 'View all'} arrow>
            <IconButton
              size="small"
              onClick={onActionClick}
              sx={{ color: tokens.colors.text.disabled }}
            >
              <OpenInNewIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        ) : (
          action
        )}
      </Box>
    </Box>
  );
}

/**
 * InfoTooltip - Small circular info icon with tooltip
 *
 * Design pattern: 18px circular bg with centered "i" text
 */
interface InfoTooltipProps {
  title: string;
  placement?: TooltipProps['placement'];
}

export function InfoTooltip({ title, placement }: InfoTooltipProps) {
  return (
    <Tooltip title={title} arrow placement={placement}>
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          bgcolor: tokens.colors.text.disabled,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 700,
            color: tokens.colors.background.paper,
          }}
        >
          i
        </Typography>
      </Box>
    </Tooltip>
  );
}
