/**
 * History - Stats hub with right-side sections nav (Wiki pattern)
 */

import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  NavigateNextSharp as NextIcon,
  MenuSharp as MenuIcon,
  ChevronLeftSharp as BackIcon,
  InventorySharp as ItemsIcon,
  PestControlSharp as EnemyIcon,
  SportsEsportsSharp as RunsIcon,
  HeartBrokenSharp as DeathIcon,
  AccessTimeSharp as TimeIcon,
  StarSharp as RarityIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { CardSection } from '../../components/CardSection';
import { CardHeader } from '../../components/ds';
import { usePlayerData } from '../../hooks/usePlayerData';

// Helper to create wiki slug from display name
const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

// ============================================
// Types & Config
// ============================================

type HistorySection = 'overview' | 'items' | 'enemies' | 'milestones';

interface SectionConfig {
  id: HistorySection;
  label: string;
}

const sections: SectionConfig[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'items', label: 'Items' },
  { id: 'enemies', label: 'Enemies' },
  { id: 'milestones', label: 'Milestones' },
];

// ============================================
// Data
// ============================================

const overallStats = [
  { icon: ItemsIcon, label: 'Items Collected', value: '3,421', color: tokens.colors.success },
  { icon: EnemyIcon, label: 'Enemies Defeated', value: '12,847', color: tokens.colors.error },
  { icon: RunsIcon, label: 'Runs Completed', value: '247', color: tokens.colors.primary },
  { icon: DeathIcon, label: 'Total Deaths', value: '205', color: tokens.colors.text.secondary },
  { icon: TimeIcon, label: 'Time Played', value: '142h', color: tokens.colors.secondary },
  { icon: RarityIcon, label: 'Legendaries Found', value: '23', color: tokens.colors.rarity.legendary },
];

const itemsByRarity = [
  { rarity: 'Common', count: 1847, color: tokens.colors.rarity.common },
  { rarity: 'Uncommon', count: 892, color: tokens.colors.rarity.uncommon },
  { rarity: 'Rare', count: 456, color: tokens.colors.rarity.rare },
  { rarity: 'Epic', count: 178, color: tokens.colors.rarity.epic },
  { rarity: 'Legendary', count: 23, color: tokens.colors.rarity.legendary },
  { rarity: 'Unique', count: 25, color: tokens.colors.rarity.unique },
];

const recentItems = [
  { name: 'Chrono Dagger', slug: 'chrono-dagger', rarity: 'Epic', acquired: '2 hours ago' },
  { name: 'Shadow Blade', slug: 'shadow-blade', rarity: 'Rare', acquired: '5 hours ago' },
  { name: 'Null Sphere', slug: 'null-sphere', rarity: 'Rare', acquired: '6 hours ago' },
  { name: 'Dimensional Blade', slug: 'dimensional-blade', rarity: 'Legendary', acquired: 'Yesterday' },
];

const favoriteItems = [
  { name: 'Dimensional Blade', slug: 'dimensional-blade', rarity: 'Legendary', uses: 847 },
  { name: 'Void Axe', slug: 'void-axe', rarity: 'Epic', uses: 623 },
  { name: 'Gold Sword', slug: 'gold-sword', rarity: 'Rare', uses: 512 },
];

const itemCompletion = { collected: 3421, total: 5000 };

const enemiesByType = [
  { type: 'Minions', count: 8421, color: tokens.colors.text.secondary },
  { type: 'Elites', count: 2847, color: tokens.colors.rarity.rare },
  { type: 'Bosses', count: 156, color: tokens.colors.rarity.legendary },
  { type: 'Champions', count: 423, color: tokens.colors.rarity.epic },
];

const mostDefeated = [
  { name: 'Air Elemental', slug: 'air-elemental', count: 1247, domain: 'Aberrant' },
  { name: 'Lava Golem', slug: 'lava-golem', count: 892, domain: 'Infernus' },
  { name: 'Frost Giant', slug: 'frost-giant-i', count: 634, domain: 'Frost Reach' },
];

const bossProgress = [
  { name: 'Peter', slug: 'peter', defeats: 12, bestTime: '2m 34s' },
  { name: 'The One', slug: 'the-one', defeats: 8, bestTime: '4m 12s' },
  { name: 'Alice', slug: 'alice', defeats: 5, bestTime: '3m 45s' },
];

// Milestone definitions - derived from player stats
interface MilestoneDef {
  name: string;
  desc: string;
  statKey: keyof import('../../data/player/storage').PlayerStats | 'stashCount';
  threshold: number;
}

const milestoneDefs: MilestoneDef[] = [
  // Profile - always achieved (prevents empty state)
  { name: 'Profile Created', desc: 'Create your player profile', statKey: 'runsCompleted', threshold: 0 },
  // Combat / Runs
  { name: 'First Roll', desc: 'Complete your first run', statKey: 'runsCompleted', threshold: 1 },
  { name: 'Dice Warrior', desc: 'Complete 10 runs', statKey: 'runsCompleted', threshold: 10 },
  { name: 'Roll Master', desc: 'Complete 50 runs', statKey: 'runsCompleted', threshold: 50 },
  { name: 'Dice Legend', desc: 'Complete 100 runs', statKey: 'runsCompleted', threshold: 100 },

  // Victories
  { name: 'First Victory', desc: 'Win your first run', statKey: 'runsWon', threshold: 1 },
  { name: 'Die-rector Slayer', desc: 'Win 6 runs (defeat all Die-rectors)', statKey: 'runsWon', threshold: 6 },
  { name: 'Champion', desc: 'Win 25 runs', statKey: 'runsWon', threshold: 25 },

  // Collection
  { name: 'Loot Finder', desc: 'Collect 10 items', statKey: 'itemsCollected', threshold: 10 },
  { name: 'Dice Collector', desc: 'Collect 50 items', statKey: 'itemsCollected', threshold: 50 },
  { name: 'Hoarder', desc: 'Collect 200 items', statKey: 'itemsCollected', threshold: 200 },

  // Economy
  { name: 'First Gold', desc: 'Earn 100 gold total', statKey: 'totalGoldEarned', threshold: 100 },
  { name: 'Merchant', desc: 'Earn 1,000 gold total', statKey: 'totalGoldEarned', threshold: 1000 },
  { name: 'Tycoon', desc: 'Earn 10,000 gold total', statKey: 'totalGoldEarned', threshold: 10000 },

  // Trading
  { name: 'First Sale', desc: 'Sell an item', statKey: 'itemsSold', threshold: 1 },
  { name: 'Trader', desc: 'Sell 25 items', statKey: 'itemsSold', threshold: 25 },
];

// ============================================
// Section Components
// ============================================

function OverviewSection() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Overview
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {overallStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <CardSection key={stat.label} padding={2} sx={{ textAlign: 'center' }}>
              <Icon sx={{ fontSize: 28, color: stat.color, mb: 1 }} />
              <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.75rem', mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                {stat.label}
              </Typography>
            </CardSection>
          );
        })}
      </Box>
    </Box>
  );
}

function ItemsSection() {
  const totalItems = itemsByRarity.reduce((sum, item) => sum + item.count, 0);
  const completionPercent = Math.round((itemCompletion.collected / itemCompletion.total) * 100);

  const rarityColors: Record<string, string> = {
    Common: tokens.colors.rarity.common,
    Uncommon: tokens.colors.rarity.uncommon,
    Rare: tokens.colors.rarity.rare,
    Epic: tokens.colors.rarity.epic,
    Legendary: tokens.colors.rarity.legendary,
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Items Collected
      </Typography>

      {/* Completion Progress */}
      <CardSection sx={{ mb: 3, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Collection Progress</Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.secondary }}>
            {itemCompletion.collected.toLocaleString()} / {itemCompletion.total.toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ height: 8, borderRadius: 4, bgcolor: tokens.colors.background.elevated, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${completionPercent}%`, bgcolor: tokens.colors.primary, borderRadius: 4 }} />
        </Box>
        <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, mt: 0.5, display: 'block' }}>
          {completionPercent}% complete
        </Typography>
      </CardSection>

      {/* By Rarity */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <CardHeader title="By Rarity" />
        <Box sx={{ p: 3 }}>
          {itemsByRarity.map((item, i) => (
            <Box
              key={item.rarity}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                borderBottom: i < itemsByRarity.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: item.color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {item.rarity}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: item.color }}>
                {item.count.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, width: 40, textAlign: 'right' }}>
                {Math.round((item.count / totalItems) * 100)}%
              </Typography>
            </Box>
          ))}
        </Box>
      </CardSection>

      {/* Recently Acquired */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <CardHeader title="Recently Acquired" />
        <Box sx={{ p: 3 }}>
          {recentItems.map((item, i) => (
            <Box
              key={item.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: i < recentItems.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Box>
                <MuiLink
                  component={RouterLink}
                  to={`/wiki/items/${item.slug}`}
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: rarityColors[item.rarity] || tokens.colors.secondary,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {item.name}
                </MuiLink>
                <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block' }}>
                  {item.rarity}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                {item.acquired}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardSection>

      {/* Favorites */}
      <CardSection padding={0}>
        <CardHeader title="Most Used Items" />
        <Box sx={{ p: 3 }}>
          {favoriteItems.map((item, i) => (
            <Box
              key={item.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: i < favoriteItems.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Box>
                <MuiLink
                  component={RouterLink}
                  to={`/wiki/items/${item.slug}`}
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: rarityColors[item.rarity] || tokens.colors.secondary,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {item.name}
                </MuiLink>
                <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block' }}>
                  {item.rarity}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.colors.secondary }}>
                {item.uses.toLocaleString()} uses
              </Typography>
            </Box>
          ))}
        </Box>
      </CardSection>
    </Box>
  );
}

function EnemiesSection() {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Enemies Defeated
      </Typography>

      {/* By Type */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <CardHeader title="By Type" />
        <Box sx={{ p: 3 }}>
          {enemiesByType.map((enemy, i) => (
            <Box
              key={enemy.type}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
                borderBottom: i < enemiesByType.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: enemy.color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {enemy.type}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: enemy.color }}>
                {enemy.count.toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardSection>

      {/* Most Defeated */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <CardHeader title="Most Defeated" />
        <Box sx={{ p: 3 }}>
          {mostDefeated.map((enemy, i) => (
            <Box
              key={enemy.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: i < mostDefeated.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Box>
                <MuiLink
                  component={RouterLink}
                  to={`/wiki/enemies/${enemy.slug}`}
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: tokens.colors.secondary,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {enemy.name}
                </MuiLink>
                <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block' }}>
                  {enemy.domain}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.colors.error }}>
                {enemy.count.toLocaleString()} kills
              </Typography>
            </Box>
          ))}
        </Box>
      </CardSection>

      {/* Die-rector Progress */}
      <CardSection padding={0}>
        <CardHeader title="Die-rector Progress" />
        <Box sx={{ p: 3 }}>
          {bossProgress.map((boss, i) => (
            <Box
              key={boss.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 1.5,
                borderBottom: i < bossProgress.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
              }}
            >
              <Box>
                <MuiLink
                  component={RouterLink}
                  to={`/wiki/pantheon/${boss.slug}`}
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: tokens.colors.rarity.legendary,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {boss.name}
                </MuiLink>
                <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block' }}>
                  Best: {boss.bestTime}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {boss.defeats} defeats
              </Typography>
            </Box>
          ))}
        </Box>
      </CardSection>
    </Box>
  );
}

function MilestonesSection() {
  const { playerData } = usePlayerData();
  const stats = playerData.stats;

  // Compute milestone status from player stats
  const computedMilestones = milestoneDefs.map((def) => {
    const currentValue = def.statKey === 'stashCount'
      ? playerData.stash.length
      : stats[def.statKey];

    const achieved = currentValue >= def.threshold;
    const progress = achieved ? 100 : Math.round((currentValue / def.threshold) * 100);

    return {
      ...def,
      achieved,
      progress,
      currentValue,
    };
  });

  const achievedMilestones = computedMilestones.filter(m => m.achieved);
  const pendingMilestones = computedMilestones.filter(m => !m.achieved);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Milestones
      </Typography>

      {/* Completed */}
      <CardSection padding={0} sx={{ mb: 3 }}>
        <CardHeader title={`Completed (${achievedMilestones.length}/${computedMilestones.length})`} />
        <Box sx={{ p: 3 }}>
          {achievedMilestones.length === 0 ? (
            <Typography variant="body2" sx={{ color: tokens.colors.text.disabled, textAlign: 'center', py: 2 }}>
              No milestones achieved yet. Start playing to unlock!
            </Typography>
          ) : (
            achievedMilestones.map((milestone, i) => (
              <Box
                key={milestone.name}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  py: 1.5,
                  borderBottom: i < achievedMilestones.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: tokens.colors.success,
                    mt: 0.75,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {milestone.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                    {milestone.desc}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </CardSection>

      {/* In Progress */}
      {pendingMilestones.length > 0 && (
        <CardSection padding={0}>
          <CardHeader title="In Progress" />
          <Box sx={{ p: 3 }}>
            {pendingMilestones.map((milestone, i) => (
              <Box
                key={milestone.name}
                sx={{
                  py: 1.5,
                  borderBottom: i < pendingMilestones.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.7 }}>
                    {milestone.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.primary }}>
                    {milestone.currentValue}/{milestone.threshold} ({milestone.progress}%)
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary, display: 'block', mb: 1 }}>
                  {milestone.desc}
                </Typography>
                <Box sx={{ height: 4, borderRadius: 2, bgcolor: tokens.colors.background.elevated, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${milestone.progress}%`,
                      bgcolor: tokens.colors.primary,
                      borderRadius: 2,
                      transition: 'width 0.3s',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </CardSection>
      )}
    </Box>
  );
}

// ============================================
// Main Component
// ============================================

export function History() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeSection, setActiveSection] = useState<HistorySection>('overview');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleSectionClick = (section: SectionConfig) => {
    setActiveSection(section.id);
    setMobileDrawerOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'items':
        return <ItemsSection />;
      case 'enemies':
        return <EnemiesSection />;
      case 'milestones':
        return <MilestonesSection />;
      default:
        return <OverviewSection />;
    }
  };

  // Right-side sections nav
  const sectionsNav = (
    <Box
      sx={{
        position: { md: 'sticky' },
        top: { md: 80 },
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 2, color: tokens.colors.text.secondary }}>
        Sections
      </Typography>
      {sections.map((section) => (
        <Typography
          key={section.id}
          variant="body2"
          onClick={() => handleSectionClick(section)}
          sx={{
            color: activeSection === section.id ? tokens.colors.text.primary : tokens.colors.secondary,
            fontWeight: activeSection === section.id ? 600 : 400,
            cursor: 'pointer',
            mb: 1,
            '&:hover': { textDecoration: 'underline' },
            '&:last-child': { mb: 0 },
          }}
        >
          {section.label}
        </Typography>
      ))}
    </Box>
  );

  // Mobile drawer content
  const drawerContent = (
    <Box sx={{ py: 2 }}>
      {sections.map((section) => (
        <Box
          key={section.id}
          onClick={() => handleSectionClick(section)}
          sx={{
            px: 3,
            py: 1.5,
            cursor: 'pointer',
            bgcolor: activeSection === section.id ? tokens.colors.background.elevated : 'transparent',
            '&:hover': { bgcolor: tokens.colors.background.elevated },
          }}
        >
          <Typography
            sx={{
              fontSize: '0.9rem',
              fontWeight: activeSection === section.id ? 600 : 400,
              color: activeSection === section.id ? tokens.colors.text.primary : tokens.colors.text.secondary,
            }}
          >
            {section.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Mobile Header */}
      {isMobile && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <IconButton size="small" onClick={() => setMobileDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {sections.find(s => s.id === activeSection)?.label || 'History'}
          </Typography>
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 260,
              bgcolor: tokens.colors.background.paper,
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderBottom: `1px solid ${tokens.colors.border}`,
            }}
          >
            <IconButton size="small" onClick={() => setMobileDrawerOpen(false)}>
              <BackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              History
            </Typography>
          </Box>
          {drawerContent}
        </Drawer>
      )}

      {/* Main Layout */}
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          flexDirection: { xs: 'column', md: 'row' },
          maxWidth: 900,
          mx: 'auto',
        }}
      >
        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NextIcon fontSize="small" sx={{ color: tokens.colors.text.disabled }} />}
            sx={{ mb: 3 }}
          >
            <MuiLink
              component={RouterLink}
              to="/"
              sx={{
                color: tokens.colors.secondary,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Home
            </MuiLink>
            <MuiLink
              component={RouterLink}
              to="/progress"
              sx={{
                color: tokens.colors.secondary,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Progress
            </MuiLink>
            <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>
              History
            </Typography>
          </Breadcrumbs>

          {renderSection()}
        </Box>

        {/* Right Sidebar */}
        {!isMobile && (
          <Box sx={{ width: 160, flexShrink: 0 }}>
            {sectionsNav}
          </Box>
        )}
      </Box>
    </Box>
  );
}
