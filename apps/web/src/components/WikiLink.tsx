import { Link as MuiLink, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { tokens } from '../theme';
import type { WikiCategory } from '../data/wiki/types';
import { getEntity, slugToName } from '../data/wiki';

interface WikiLinkProps {
  /** Entity slug - the stable identifier */
  slug: string;
  /** Optional category override (auto-detected from entity if not provided) */
  category?: WikiCategory;
  /** Optional display content (defaults to entity.name or slugToName) */
  children?: React.ReactNode;
  /** Link style: inline text link or clickable chip */
  variant?: 'inline' | 'chip';
  /** Whether to show "Unknown:" prefix for unresolved entities */
  showUnknownPrefix?: boolean;
}

/**
 * WikiLink - Slug-based navigation link with auto-resolved names
 *
 * Core principle: Pass slug, get working link with correct name.
 *
 * Usage:
 * ```tsx
 * <WikiLink slug="void-spawn" />           // Renders "Void Spawn" (from entity.name)
 * <WikiLink slug="null-providence" />      // Renders "Null Providence"
 * <WikiLink slug="unknown-thing" />        // Falls back to "Unknown Thing" (slugToName)
 *
 * // Override display text:
 * <WikiLink slug="void-spawn">The creature</WikiLink>
 *
 * // Chip variant for tags/pills:
 * <WikiLink slug="soul-fragment" variant="chip" />
 * ```
 */
export function WikiLink({
  slug,
  category: categoryOverride,
  children,
  variant = 'inline',
  showUnknownPrefix = false,
}: WikiLinkProps) {
  // Resolve entity from data layer
  const entity = getEntity(slug);

  // Determine category (from override, entity, or fall back to 'items')
  const category = categoryOverride ?? entity?.category ?? 'items';

  // Determine display name
  const displayName = children ?? entity?.name ?? slugToName(slug);
  const isUnresolved = !entity && showUnknownPrefix;

  // Build the route
  const to = `/wiki/${category}/${slug}`;

  if (variant === 'chip') {
    return (
      <Chip
        component={RouterLink}
        to={to}
        label={isUnresolved ? `Unknown: ${displayName}` : displayName}
        clickable
        size="small"
        sx={{
          backgroundColor: tokens.colors.background.elevated,
          color: entity ? tokens.colors.secondary : tokens.colors.text.disabled,
          border: `1px solid ${entity ? tokens.colors.secondary : tokens.colors.border}`,
          '&:hover': {
            backgroundColor: tokens.colors.background.paper,
            borderColor: tokens.colors.secondary,
          },
        }}
      />
    );
  }

  // Inline text link (default)
  return (
    <MuiLink
      component={RouterLink}
      to={to}
      sx={{
        color: entity ? tokens.colors.secondary : tokens.colors.text.disabled,
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline',
        },
      }}
    >
      {isUnresolved ? `Unknown: ${displayName}` : displayName}
    </MuiLink>
  );
}

/**
 * Helper: Check if a slug resolves to a valid entity
 * Useful for conditional rendering
 */
export function isValidWikiSlug(slug: string): boolean {
  return getEntity(slug) !== undefined;
}
