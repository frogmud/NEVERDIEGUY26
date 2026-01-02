/**
 * ExpandableSection - Accordion-style expandable section
 *
 * Design pattern extracted from Stats component (Dec 29, 2024)
 * Used for 1v1, Arena, Favors sections that expand to show details.
 *
 * Features:
 * - Icon + Title on left, Value + Chevron on right
 * - Underline indicator when expanded
 * - Smooth collapse animation
 * - Hover highlight
 */

import { ReactNode } from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import { ExpandMoreSharp as ExpandMoreIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import { AssetImage } from './AssetImage';

export interface ExpandableSectionProps {
  /** Unique identifier for this section */
  id: string;
  /** Icon source (SVG/PNG path) or ReactNode */
  icon?: string | ReactNode;
  /** Section title */
  title: string;
  /** Value displayed on the right (e.g., "1000", "33") */
  value?: string | number;
  /** Whether this section is currently expanded */
  expanded: boolean;
  /** Toggle callback */
  onToggle: (id: string) => void;
  /** Content to show when expanded */
  children: ReactNode;
  /** Show bottom border (default true) */
  showBorder?: boolean;
}

export function ExpandableSection({
  id,
  icon,
  title,
  value,
  expanded,
  onToggle,
  children,
  showBorder = true,
}: ExpandableSectionProps) {
  const isExpanded = expanded;

  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === 'string') {
      return (
        <AssetImage
          src={icon}
          alt=""
          width={24}
          height={24}
          fallback="hide"
        />
      );
    }

    return icon;
  };

  return (
    <Box sx={{ borderBottom: showBorder ? `1px solid ${tokens.colors.border}` : 'none' }}>
      {/* Header Row */}
      <Box
        onClick={() => onToggle(id)}
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: isExpanded
            ? `2px solid ${tokens.colors.text.primary}`
            : '2px solid transparent',
          '&:hover': { bgcolor: tokens.colors.background.elevated },
        }}
      >
        {/* Left: Icon + Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {renderIcon()}
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>

        {/* Right: Value + Chevron */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {value !== undefined && (
            <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
              {value}
            </Typography>
          )}
          <ExpandMoreIcon
            sx={{
              color: tokens.colors.text.disabled,
              fontSize: 24,
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </Box>
      </Box>

      {/* Collapsible Content */}
      <Collapse in={isExpanded}>
        <Box sx={{ px: 2, py: 2, bgcolor: tokens.colors.background.paper }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}
