import { useState } from 'react';
import { Box, Typography, Skeleton, Paper, Grid, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import {
  MoreVertSharp as MoreVertIcon,
  BookmarkSharp as BookmarkIcon,
  ShareSharp as ShareIcon,
  ThumbUpSharp as ThumbUpIcon,
  ThumbDownSharp as ThumbDownIcon,
  VisibilityOffSharp as HideIcon,
} from '@mui/icons-material';
import { tokens } from '../theme';
import { CardSection } from './CardSection';

// Placeholder text block
export function TextBlock({ lines = 3, width = '100%' }: { lines?: number; width?: string | number }) {
  return (
    <Box sx={{ width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
          sx={{ bgcolor: tokens.colors.background.elevated }}
        />
      ))}
    </Box>
  );
}

// Placeholder heading
export function Heading({ width = 200 }: { width?: number }) {
  return (
    <Skeleton
      variant="text"
      width={width}
      height={32}
      sx={{ bgcolor: tokens.colors.background.elevated }}
    />
  );
}

// Placeholder card with action menu
export function PlaceholderCard({ height = 200, onClick }: { height?: number; onClick?: () => void }) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  return (
    <Paper
      onClick={onClick}
      sx={{
        height,
        p: 2,
        backgroundColor: tokens.colors.background.paper,
        border: `1px solid ${tokens.colors.border}`,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: tokens.colors.primary,
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.3)`,
        },
        '&:hover .card-menu': { opacity: 1 },
      }}
    >
      {/* Card action menu button */}
      <IconButton
        className="card-menu"
        size="small"
        onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          opacity: 0,
          transition: 'opacity 0.2s',
          bgcolor: tokens.colors.background.elevated,
          zIndex: 10,
          '&:hover': { bgcolor: tokens.colors.background.paper },
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      {/* Action menu */}
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` } }}
      >
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <ThumbUpIcon fontSize="small" sx={{ mr: 1.5 }} /> More like this
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <ThumbDownIcon fontSize="small" sx={{ mr: 1.5 }} /> Less like this
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <BookmarkIcon fontSize="small" sx={{ mr: 1.5 }} /> Save
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>
          <ShareIcon fontSize="small" sx={{ mr: 1.5 }} /> Share
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ color: tokens.colors.text.disabled }}>
          <HideIcon fontSize="small" sx={{ mr: 1.5 }} /> Hide
        </MenuItem>
      </Menu>

      <Skeleton
        variant="rectangular"
        height={height * 0.5}
        sx={{ bgcolor: tokens.colors.background.elevated, mb: 2, borderRadius: 1, pointerEvents: 'none' }}
      />
      <Skeleton variant="text" width="80%" sx={{ bgcolor: tokens.colors.background.elevated }} />
      <Skeleton variant="text" width="60%" sx={{ bgcolor: tokens.colors.background.elevated }} />
    </Paper>
  );
}

// Placeholder list item
export function ListItem() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderBottom: `1px solid ${tokens.colors.border}`,
      }}
    >
      <Skeleton
        variant="circular"
        width={40}
        height={40}
        sx={{ bgcolor: tokens.colors.background.elevated }}
      />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="40%" sx={{ bgcolor: tokens.colors.background.elevated }} />
        <Skeleton variant="text" width="60%" sx={{ bgcolor: tokens.colors.background.elevated }} />
      </Box>
    </Box>
  );
}

// Placeholder button
export function PlaceholderButton({ width = 120 }: { width?: number }) {
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={40}
      sx={{ bgcolor: tokens.colors.primary, opacity: 0.3, borderRadius: 1 }}
    />
  );
}

// Placeholder form field
export function FormField({ label = true }: { label?: boolean }) {
  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Skeleton
          variant="text"
          width={80}
          sx={{ bgcolor: tokens.colors.background.elevated, mb: 0.5 }}
        />
      )}
      <Skeleton
        variant="rectangular"
        height={48}
        sx={{ bgcolor: tokens.colors.background.paper, borderRadius: 1 }}
      />
    </Box>
  );
}

// Page header
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

// Card grid
export function CardGrid({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 12 / columns }} key={i}>
          <PlaceholderCard />
        </Grid>
      ))}
    </Grid>
  );
}

// Sidebar layout
export function SidebarLayout({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', gap: 4 }}>
      <Box sx={{ width: 280, flexShrink: 0 }}>{sidebar}</Box>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
}

// Infobox (wiki style)
export function Infobox() {
  return (
    <Paper
      sx={{
        p: 2,
        backgroundColor: tokens.colors.background.paper,
        border: `1px solid ${tokens.colors.border}`,
      }}
    >
      <Skeleton
        variant="rectangular"
        height={160}
        sx={{ bgcolor: tokens.colors.background.elevated, mb: 2, borderRadius: 1 }}
      />
      <Box sx={{ mb: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              py: 1,
              borderBottom: `1px solid ${tokens.colors.border}`,
            }}
          >
            <Skeleton variant="text" width={60} sx={{ bgcolor: tokens.colors.background.elevated }} />
            <Skeleton variant="text" width={80} sx={{ bgcolor: tokens.colors.background.elevated }} />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

// Stats row
export function StatsRow({ count = 4 }: { count?: number }) {
  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid size={{ xs: 6, md: 12 / count }} key={i}>
          <CardSection padding={2} sx={{ textAlign: 'center' }}>
            <Skeleton
              variant="text"
              width={60}
              height={40}
              sx={{ bgcolor: tokens.colors.background.elevated, mx: 'auto' }}
            />
            <Skeleton
              variant="text"
              width={80}
              sx={{ bgcolor: tokens.colors.background.elevated, mx: 'auto' }}
            />
          </CardSection>
        </Grid>
      ))}
    </Grid>
  );
}

// ============ SCREEN SKELETONS ============

// Leaderboard skeleton
export function LeaderboardSkeleton() {
  return (
    <Box>
      {/* Period chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
        {[80, 90, 100, 80].map((w, i) => (
          <Skeleton key={i} variant="rounded" width={w} height={32} sx={{ bgcolor: tokens.colors.background.elevated, borderRadius: '16px' }} />
        ))}
      </Box>

      {/* Podium */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
        {[0.9, 1.1, 0.9].map((scale, i) => (
          <Paper
            key={i}
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: tokens.colors.background.paper,
              border: `1px solid ${tokens.colors.border}`,
              transform: `scale(${scale})`,
            }}
          >
            <Skeleton variant="circular" width={64} height={64} sx={{ bgcolor: tokens.colors.background.elevated, mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" width={100} sx={{ bgcolor: tokens.colors.background.elevated, mx: 'auto' }} />
            <Skeleton variant="text" width={60} sx={{ bgcolor: tokens.colors.background.elevated, mx: 'auto' }} />
          </Paper>
        ))}
      </Box>

      {/* List items */}
      <Paper sx={{ bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Box key={i} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: i < 9 ? `1px solid ${tokens.colors.border}` : 'none' }}>
            <Skeleton variant="text" width={32} sx={{ bgcolor: tokens.colors.background.elevated }} />
            <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: tokens.colors.background.elevated }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" sx={{ bgcolor: tokens.colors.background.elevated }} />
            </Box>
            <Skeleton variant="text" width={80} sx={{ bgcolor: tokens.colors.background.elevated }} />
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

// Progress dashboard skeleton
export function ProgressSkeleton() {
  return (
    <Box>
      {/* Nav cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 4 }}>
        {[0, 1, 2].map((i) => (
          <Paper key={i} sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '30px', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="rectangular" width={80} height={80} sx={{ bgcolor: tokens.colors.background.elevated, borderRadius: 2 }} />
            <Skeleton variant="text" width={120} height={32} sx={{ bgcolor: tokens.colors.background.elevated }} />
          </Paper>
        ))}
      </Box>

      {/* Two column layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        {/* Streaks card */}
        <CardSection padding={0}>
          <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
            <Skeleton variant="text" width={120} sx={{ bgcolor: tokens.colors.background.elevated }} />
          </Box>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
              <Skeleton variant="circular" width={64} height={64} sx={{ bgcolor: tokens.colors.background.elevated }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={100} height={48} sx={{ bgcolor: tokens.colors.background.elevated }} />
                <Skeleton variant="text" width={180} sx={{ bgcolor: tokens.colors.background.elevated }} />
              </Box>
            </Box>
            {[0, 1, 2, 3].map((i) => (
              <Box key={i} sx={{ py: 1.5, borderTop: `1px solid ${tokens.colors.border}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: tokens.colors.background.elevated }} />
                  <Skeleton variant="text" width="50%" sx={{ bgcolor: tokens.colors.background.elevated }} />
                  <Skeleton variant="text" width={60} sx={{ bgcolor: tokens.colors.background.elevated, ml: 'auto' }} />
                </Box>
              </Box>
            ))}
          </Box>
        </CardSection>

        {/* Stats card */}
        <CardSection padding={0}>
          <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
            <Skeleton variant="text" width={120} sx={{ bgcolor: tokens.colors.background.elevated }} />
          </Box>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
              {[0, 1, 2, 3].map((i) => (
                <Box key={i} sx={{ p: 2, borderRadius: '18px', bgcolor: tokens.colors.background.elevated, textAlign: 'center' }}>
                  <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: tokens.colors.background.paper, mx: 'auto', mb: 1 }} />
                  <Skeleton variant="text" width={60} height={32} sx={{ bgcolor: tokens.colors.background.paper, mx: 'auto' }} />
                  <Skeleton variant="text" width={80} sx={{ bgcolor: tokens.colors.background.paper, mx: 'auto' }} />
                </Box>
              ))}
            </Box>
          </Box>
        </CardSection>
      </Box>
    </Box>
  );
}

// History page skeleton
export function HistorySkeleton() {
  return (
    <Box>
      {/* Stats grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, mb: 4 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSection key={i} padding={2} sx={{ textAlign: 'center' }}>
            <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: tokens.colors.background.elevated, mx: 'auto', mb: 1 }} />
            <Skeleton variant="text" width={60} height={32} sx={{ bgcolor: tokens.colors.background.elevated, mx: 'auto' }} />
            <Skeleton variant="text" width={80} sx={{ bgcolor: tokens.colors.background.elevated, mx: 'auto' }} />
          </CardSection>
        ))}
      </Box>

      {/* Two column layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4 }}>
        {[0, 1].map((col) => (
          <CardSection key={col} padding={0}>
            <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
              <Skeleton variant="text" width={140} sx={{ bgcolor: tokens.colors.background.elevated }} />
            </Box>
            <Box sx={{ p: 3 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderBottom: i < 5 ? `1px solid ${tokens.colors.border}` : 'none' }}>
                  <Skeleton variant="circular" width={12} height={12} sx={{ bgcolor: tokens.colors.background.elevated }} />
                  <Skeleton variant="text" width="40%" sx={{ bgcolor: tokens.colors.background.elevated }} />
                  <Skeleton variant="text" width={50} sx={{ bgcolor: tokens.colors.background.elevated, ml: 'auto' }} />
                </Box>
              ))}
            </Box>
          </CardSection>
        ))}
      </Box>

      {/* Milestones */}
      <CardSection padding={0}>
        <Box sx={{ px: 3, py: 2.25, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Skeleton variant="text" width={100} sx={{ bgcolor: tokens.colors.background.elevated }} />
        </Box>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Box key={i} sx={{ p: 2, borderRadius: '18px', bgcolor: tokens.colors.background.elevated }}>
                <Skeleton variant="text" width="80%" sx={{ bgcolor: tokens.colors.background.paper, mb: 0.5 }} />
                <Skeleton variant="text" width="60%" sx={{ bgcolor: tokens.colors.background.paper }} />
              </Box>
            ))}
          </Box>
        </Box>
      </CardSection>
    </Box>
  );
}

// Wiki index skeleton
export function WikiIndexSkeleton() {
  return (
    <Box>
      {/* Hero */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2, pb: 4 }}>
        <Skeleton variant="circular" width={160} height={160} sx={{ bgcolor: tokens.colors.background.elevated, mb: 3 }} />
        <Skeleton variant="text" width={300} height={60} sx={{ bgcolor: tokens.colors.background.elevated, mb: 1 }} />
        <Skeleton variant="text" width={200} sx={{ bgcolor: tokens.colors.background.elevated }} />
      </Box>

      {/* Category tabs */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={100} height={40} sx={{ bgcolor: tokens.colors.background.elevated, borderRadius: '20px' }} />
        ))}
      </Box>

      {/* Grid of items */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Paper key={i} sx={{ bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Skeleton variant="rectangular" width={48} height={48} sx={{ bgcolor: tokens.colors.background.elevated, borderRadius: 1 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="80%" sx={{ bgcolor: tokens.colors.background.elevated }} />
                <Skeleton variant="text" width="50%" sx={{ bgcolor: tokens.colors.background.elevated }} />
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

// Home page skeleton
export function HomeSkeleton() {
  return (
    <Box>
      {/* Top row - hero + widgets */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3, mb: 3 }}>
        {/* Hero card */}
        <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '30px', p: 3, height: 300 }}>
          <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: tokens.colors.background.elevated, borderRadius: 2 }} />
        </Paper>

        {/* Side widgets */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '30px', p: 3, flex: 1 }}>
            <Skeleton variant="text" width={100} sx={{ bgcolor: tokens.colors.background.elevated, mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Skeleton variant="rectangular" width={80} height={120} sx={{ bgcolor: tokens.colors.background.elevated, borderRadius: 1 }} />
              <Box sx={{ flex: 1 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" width={56} height={56} sx={{ bgcolor: tokens.colors.background.elevated, borderRadius: 1, mb: 1, display: 'inline-block', mr: 1 }} />
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Bottom row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Paper key={i} sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '30px', p: 3, height: 200 }}>
            <Skeleton variant="text" width={120} sx={{ bgcolor: tokens.colors.background.elevated, mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={120} sx={{ bgcolor: tokens.colors.background.elevated, borderRadius: 2 }} />
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
