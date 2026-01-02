/**
 * Home Screen Shared Styles
 *
 * Reusable style constants for consistency across home screen components.
 */

import { tokens } from '../../theme';

// Small icon button styling
export const smallIconSx = {
  p: 0.5,
  '&:hover': { bgcolor: `${tokens.colors.text.disabled}15` },
};

// Shared table column widths for consistency between both tables
export const tableColWidths = {
  type: 70,          // First col: game type icon + label (sortable)
  player: 'auto',    // Player name(s) with icons - flex
  domain: 120,       // Domain name
  record: 90,        // Record (W/D/L) or Result - same width, left aligned
  when: 100,         // When? timestamp
  action: 56,        // Square action button (single)
  actionDouble: 100, // Two action buttons side by side
};

// Consistent row height for both tables
export const tableRowHeight = 56;
