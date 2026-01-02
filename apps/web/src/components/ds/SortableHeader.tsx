/**
 * SortableHeader - Table column header with sort functionality
 *
 * Design pattern extracted from Games & Challenges / Game History tables (Dec 29, 2024)
 * Provides clickable column headers with ascending/descending sort indicators.
 *
 * Features:
 * - Click to toggle sort direction
 * - Visual indicator for active sort column
 * - Customizable alignment
 * - Hover state feedback
 */

import { Box, TableCell } from '@mui/material';
import {
  ExpandMoreSharp as ExpandMoreIcon,
  ExpandLessSharp as ExpandLessIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';

/** Sort configuration for table state */
export type SortConfig = { column: string; direction: 'asc' | 'desc' } | null;

export interface SortableHeaderProps {
  /** Column identifier for sort state */
  column: string;
  /** Display label */
  label: string;
  /** Current sort configuration */
  sortConfig: SortConfig;
  /** Sort handler callback */
  onSort: (column: string) => void;
  /** Optional fixed width */
  width?: number | string;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}

export function SortableHeader({
  column,
  label,
  sortConfig,
  onSort,
  width,
  align = 'left',
}: SortableHeaderProps) {
  const isActive = sortConfig?.column === column;

  const getJustify = () => {
    switch (align) {
      case 'center': return 'center';
      case 'right': return 'flex-end';
      default: return 'flex-start';
    }
  };

  return (
    <TableCell
      onClick={() => onSort(column)}
      sx={{
        color: tokens.colors.text.disabled,
        fontSize: '0.7rem',
        py: 0.75,
        width,
        cursor: 'pointer',
        userSelect: 'none',
        '&:hover': { color: tokens.colors.text.secondary },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          justifyContent: getJustify(),
        }}
      >
        {label}
        {isActive && (
          sortConfig.direction === 'asc'
            ? <ExpandLessIcon sx={{ fontSize: 14 }} />
            : <ExpandMoreIcon sx={{ fontSize: 14 }} />
        )}
      </Box>
    </TableCell>
  );
}
