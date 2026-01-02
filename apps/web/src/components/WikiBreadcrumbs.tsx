import { Breadcrumbs, Typography, Link as MuiLink } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';
import { tokens } from '../theme';
import type { WikiCategory } from '../data/wiki/types';
import { getCategoryInfo } from '../data/wiki/helpers';

interface WikiBreadcrumbsProps {
  /** The wiki category (enemies, items, domains, etc.) */
  category: WikiCategory;
  /** The entity name (final breadcrumb, not clickable) */
  entityName: string;
}

/**
 * WikiBreadcrumbs - Simple 3-level breadcrumb navigation
 *
 * Format: Wiki > Category > Entity Name
 *
 * - "Wiki" links to /wiki
 * - Category links to /wiki/:category
 * - Entity name shows current page (not clickable)
 */
export function WikiBreadcrumbs({ category, entityName }: WikiBreadcrumbsProps) {
  const categoryInfo = getCategoryInfo(category);

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" sx={{ color: tokens.colors.text.disabled }} />}
      sx={{ mb: 2 }}
    >
      {/* Wiki Home */}
      <MuiLink
        component={RouterLink}
        to="/wiki"
        sx={{
          color: tokens.colors.secondary,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        Wiki
      </MuiLink>

      {/* Category */}
      <MuiLink
        component={RouterLink}
        to={`/wiki/${category}`}
        sx={{
          color: tokens.colors.secondary,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        {categoryInfo.pluralLabel}
      </MuiLink>

      {/* Current Entity (not clickable) */}
      <Typography
        color="text.primary"
        sx={{ fontSize: '0.875rem' }}
      >
        {entityName}
      </Typography>
    </Breadcrumbs>
  );
}
