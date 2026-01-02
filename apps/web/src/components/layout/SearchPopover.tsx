import { Box, Popover, Paper, Typography, Skeleton } from '@mui/material';
import { tokens } from '../../theme';
import type { AnyEntity } from '../../data/wiki';
import { getCategoryInfo } from '../../data/wiki/helpers';

interface SearchPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  searchValue: string;
  searchResults: AnyEntity[];
  onResultClick: (entity: AnyEntity) => void;
  onViewAll: () => void;
}

export function SearchPopover({
  open,
  anchorEl,
  onClose,
  searchValue,
  searchResults,
  onResultClick,
  onViewAll,
}: SearchPopoverProps) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      disableAutoFocus
      disableEnforceFocus
      sx={{ mt: 1 }}
    >
      <Paper sx={{ width: 320, p: 2, bgcolor: tokens.colors.background.paper }}>
        {searchResults.length > 0 ? (
          <>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, mb: 1, display: 'block' }}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchValue}"
            </Typography>
            {searchResults.map((entity) => {
              const categoryInfo = getCategoryInfo(entity.category);
              return (
                <Box
                  key={entity.slug}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: tokens.colors.background.elevated },
                  }}
                  onMouseDown={() => onResultClick(entity)}
                >
                  <Skeleton
                    variant="rectangular"
                    width={40}
                    height={40}
                    sx={{ bgcolor: tokens.colors.background.elevated, borderRadius: 1 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                      {entity.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: categoryInfo.color }}>
                      {categoryInfo.label}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            <Box
              sx={{
                pt: 1,
                mt: 1,
                borderTop: `1px solid ${tokens.colors.border}`,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: tokens.colors.primary,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
                onMouseDown={onViewAll}
              >
                View all results
              </Typography>
            </Box>
          </>
        ) : (
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, textAlign: 'center', py: 2 }}>
            No results found for "{searchValue}"
          </Typography>
        )}
      </Paper>
    </Popover>
  );
}
