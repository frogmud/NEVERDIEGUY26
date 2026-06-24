import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  FormControlLabel,
  Grid,
  Switch,
} from '@mui/material';
import {
  PlaceSharp as LocationIcon,
  WarningSharp as DifficultyIcon,
  LockSharp as RequirementIcon,
  ExploreSharp as RegionIcon,
  PeopleSharp as NPCIcon,
  PestControlSharp as EnemyIcon,
  Inventory2Sharp as ItemIcon,
  ArrowForwardSharp as ArrowIcon,
  StorefrontSharp as ShopIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { PageHeader } from '../../../components/Placeholder';
import { WikiLayout, WikiSectionAnchor, toAnchorId, type WikiSection } from '../../../components/WikiLayout';
import { WikiBreadcrumbs } from '../../../components/WikiBreadcrumbs';
import { WikiLink } from '../../../components/WikiLink';
import { BaseCard } from '../../../components/BaseCard';
import { SectionHeader } from '../../../components/SectionHeader';
import { DataBadge } from '../../../components/DataBadge';
import { CardHeader, AssetImage } from '../../../components/ds';
import {
  formatBoneDie,
  formatLuckyNumber,
  getRarityColor,
  getEnemyTypeColor,
  slugToName,
  getElementInfo,
} from '../../../data/wiki/helpers';
import { getEntity } from '../../../data/wiki';
import type { AnyEntity, Domain, Element, Shop, WikiCategory, Wanderer, Enemy, Item } from '../../../data/wiki/types';
import { AsciiDomainViewer } from '../../../components/AsciiDomainViewer';

interface WikiLocationProps {
  entity?: AnyEntity;
}

interface DisplayConnectedArea {
  slug: string;
  name: string;
  direction: string;
  level: string;
}

const RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique'];
type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'unique';

const getRarityRank = (rarity: string) => {
  const rank = RARITY_ORDER.indexOf(rarity);
  return rank === -1 ? RARITY_ORDER.length : rank;
};

const getBadgeRarity = (rarity: string): BadgeRarity | undefined => {
  const normalized = rarity.toLowerCase();
  return ['common', 'uncommon', 'rare', 'epic', 'legendary', 'unique'].includes(normalized)
    ? (normalized as BadgeRarity)
    : undefined;
};

// Dynamic section configuration based on available data
const getLocationSections = (
  hasEnemies: boolean,
  hasConnectedAreas: boolean,
  isShop: boolean,
  isDomain: boolean,
): WikiSection[] => {
  const sections: WikiSection[] = [
    { name: 'At a Glance' },
    { name: isShop ? 'Proprietor' : 'Guys' },
  ];
  if (hasEnemies) sections.push({ name: 'Monsters' });
  if (isDomain) sections.push({ name: 'World View' });
  sections.push({ name: isShop ? 'Shop Inventory' : 'Items Found' });
  if (hasConnectedAreas) sections.push({ name: 'Connected Worlds' });
  return sections;
};

export function WikiLocation({ entity }: WikiLocationProps) {
  const { category } = useParams();
  const navigate = useNavigate();
  const [asciiArtEnabled, setAsciiArtEnabled] = useState(true);

  // Guard: entity should always exist (WikiEntity shows 404 for missing entities)
  if (!entity) {
    return null;
  }

  // Type-specific data extraction
  const isDomain = entity.category === 'domains';
  const isShop = entity.category === 'shops';

  const domainData = isDomain ? (entity as Domain) : undefined;
  const shopData = isShop ? (entity as Shop) : undefined;

  // Check for mobile vendor (shop with travelPattern)
  const isMobileVendor = isShop && shopData?.travelPattern && shopData.travelPattern.length > 0;
  const travelPattern = shopData?.travelPattern || [];
  const officeName = domainData?.dieRector ? slugToName(domainData.dieRector) : '-';
  const elementName: Element = domainData?.element || 'Neutral';
  const elementColor = getElementInfo(elementName)?.color || tokens.colors.text.secondary;
  const doorName = domainData?.door ? `Door ${domainData.door}` : '-';
  const boneName = formatBoneDie(domainData?.preferredDice);
  const luckyNumber = formatLuckyNumber(domainData?.luckyNumber);

  // Map entity data to locationInfo format
  const locationInfo = {
    name: entity.name,
    region: isMobileVendor ? 'Mobile Vendor' : (domainData?.region || shopData?.location || '-'),
    levelRange: domainData?.levelRange || '-',
    requirements: domainData?.requirements || '-',
    type: isDomain ? 'World' : entity.category.charAt(0).toUpperCase() + entity.category.slice(1, -1),
  };

  // Map world Guys from domain.npcs slugs to real wanderer entities.
  // For shops, use the proprietor as the Guy.
  const npcs = (() => {
    if (domainData?.npcs) {
      return domainData.npcs.map(slug => {
        const wanderer = getEntity(slug) as Wanderer | undefined;
        return {
          slug,
          name: wanderer?.name || slugToName(slug),
          role: wanderer?.role || 'NPC',
          hasQuest: wanderer?.services && wanderer.services.length > 0,
          sprite: wanderer?.sprites?.[0] || wanderer?.portrait || '',
        };
      });
    }
    if (isShop && shopData?.proprietor) {
      const wanderer = getEntity(shopData.proprietor) as Wanderer | undefined;
      return [{
        slug: shopData.proprietor,
        name: wanderer?.name || slugToName(shopData.proprietor),
        role: shopData.specialty || wanderer?.role || 'Proprietor',
        hasQuest: wanderer?.services && wanderer.services.length > 0,
        sprite: wanderer?.sprites?.[0] || wanderer?.portrait || '',
      }];
    }
    return [];
  })();

  // Map enemies from domain.enemies slugs to real enemy entities
  const enemies = domainData?.enemies?.map(slug => {
    const enemy = getEntity(slug) as Enemy | undefined;
    return {
      slug,
      name: enemy?.name || slugToName(slug),
      type: enemy?.enemyType || 'Normal',
      level: enemy?.level?.toString() || domainData.levelRange || '-',
      sprite: enemy?.sprites?.[0] || enemy?.image || '',
    };
  }) || [];

  // Map items from domain.items or shop.inventory to real item entities.
  const locationItems = (() => {
    if (domainData?.items) {
      return domainData.items.map(slug => {
        const item = getEntity(slug) as Item | undefined;
        return {
          slug,
          name: item?.name || slugToName(slug),
          rarity: item?.rarity || 'Common',
          image: item?.image || item?.sprites?.[0] || '',
        };
      });
    }
    if (isShop && shopData?.inventory) {
      return shopData.inventory.map(inv => {
        const item = getEntity(inv.item) as Item | undefined;
        return {
          slug: inv.item,
          name: item?.name || slugToName(inv.item),
          rarity: item?.rarity || 'Common',
          image: item?.image || item?.sprites?.[0] || '',
        };
      });
    }
    return [];
  })();

  const sortedLocationItems = [...locationItems].sort((a, b) => getRarityRank(a.rarity) - getRarityRank(b.rarity));
  const hasItems = sortedLocationItems.length > 0;
  const connectedAreas = domainData?.connectedAreas?.map((conn) => ({
    slug: conn.area,
    name: slugToName(conn.area),
    direction: conn.direction || '-',
    level: conn.levelRange || '-',
  })) || [];

  // Determine which sections have data
  const hasEnemies = enemies.length > 0;
  const hasConnectedAreas = connectedAreas.length > 0;
  const atAGlanceFacts: Array<{ label: string; value: string; icon: typeof RegionIcon; color?: string }> = isShop
    ? [
        { label: 'Location', value: isMobileVendor ? 'Mobile Vendor' : (shopData?.location ? slugToName(shopData.location) : 'Unknown'), icon: RegionIcon },
        { label: 'Specialty', value: shopData?.specialty || 'General Goods', icon: ShopIcon },
      ]
    : [
        { label: 'Office', value: officeName, icon: RegionIcon },
        { label: 'Door', value: doorName, icon: LocationIcon },
        { label: 'Element', value: elementName, icon: DifficultyIcon, color: elementColor },
        { label: 'Bone', value: boneName, icon: RequirementIcon },
        { label: 'Lucky No.', value: luckyNumber, icon: LocationIcon },
      ];

  const scrollToWorldView = () => {
    document.getElementById(toAnchorId('World View'))?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // Infobox content (right sidebar)
  const infoboxContent = (
    <Box>
      {/* Location Map Preview */}
      <Paper
        sx={{
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: '30px',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <Box sx={{ p: 3 }}>
          {isDomain && domainData?.element ? (
            // Domain: Colored circle with ASCII flume background
            <Box sx={{
              position: 'relative',
              borderRadius: '18px',
              overflow: 'hidden',
              height: { xs: 260, sm: 280, md: 180 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0a0a0f',
            }}>
              {/* ASCII Flume Background */}
              <Box
                component="img"
                src={`/assets/flumes/${entity.slug}-ascii.svg`}
                alt=""
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.6,
                }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Colored Circle (Planet) */}
              <Box
                sx={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  backgroundColor: getElementInfo(domainData.element)?.color || tokens.colors.primary,
                  boxShadow: `0 0 40px ${getElementInfo(domainData.element)?.color || tokens.colors.primary}60, 0 0 80px ${getElementInfo(domainData.element)?.color || tokens.colors.primary}30`,
                  border: `3px solid ${getElementInfo(domainData.element)?.color || tokens.colors.primary}`,
                }}
              />
            </Box>
          ) : (
            // Shop: Keep original image display
            <Box sx={{
              backgroundColor: tokens.colors.background.elevated,
              borderRadius: '18px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: { xs: 260, sm: 280, md: 220 },
            }}>
              <AssetImage
                src={entity.image || entity.portrait || ''}
                alt={locationInfo.name}
                category={(entity.category || 'domains') as 'domains' | 'shops'}
                width="100%"
                height="100%"
                fallback="placeholder"
              />
            </Box>
          )}
        </Box>
        {/* Only show "view full map" for worlds, not shops */}
        {isDomain && (
          <Box sx={{ pb: 2 }}>
            <Button
              size="small"
              onClick={scrollToWorldView}
              sx={{
                minHeight: 28,
                color: tokens.colors.text.secondary,
                fontFamily: tokens.fonts.mono,
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: 0,
              }}
            >
              Click for preview
            </Button>
          </Box>
        )}
      </Paper>

      {/* Facts */}
      <Paper
        sx={{
          mt: 2,
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: '30px',
          overflow: 'hidden',
        }}
      >
        <CardHeader title="Facts" />
        <Box sx={{ p: 3 }}>
          {isShop ? (
            // Shop-specific info
            <>
              {[
                { icon: RegionIcon, label: 'Location', value: isMobileVendor ? 'Mobile Vendor' : (shopData?.location ? slugToName(shopData.location) : 'Unknown') },
                { icon: ShopIcon, label: 'Specialty', value: shopData?.specialty || 'General Goods' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, '&:last-child': { mb: 0 } }}>
                    <Icon sx={{ fontSize: 18, color: tokens.colors.text.disabled }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: tokens.colors.text.primary }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </>
          ) : (
            // World-specific info
            <>
              {[
                { icon: RegionIcon, label: 'Office', value: officeName },
                { icon: LocationIcon, label: 'Door', value: doorName },
                { icon: DifficultyIcon, label: 'Element', value: elementName, color: elementColor },
                { icon: RequirementIcon, label: 'Bone', value: boneName },
                { icon: LocationIcon, label: 'Lucky No.', value: luckyNumber },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, '&:last-child': { mb: 0 } }}>
                    <Icon sx={{ fontSize: 18, color: tokens.colors.text.disabled }} />
                    <Box>
                      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: item.color || tokens.colors.text.primary }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </>
          )}
        </Box>
      </Paper>

      {/* Travel Pattern for Mobile Vendors */}
      {isMobileVendor && travelPattern.length > 0 && (
        <Paper
          sx={{
            mt: 2,
            backgroundColor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: '30px',
            overflow: 'hidden',
          }}
        >
          <CardHeader title="Travels To" />
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {travelPattern.map((domainSlug) => (
                <WikiLink key={domainSlug} slug={domainSlug} category="domains" variant="chip" />
              ))}
            </Box>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, mt: 1.5, display: 'block' }}>
              This vendor travels between worlds. Check each location for current availability.
            </Typography>
          </Box>
        </Paper>
      )}

    </Box>
  );

  // Get category from entity or URL param
  const entityCategory = (entity?.category || category || 'domains') as WikiCategory;

  // Build dynamic sections based on available data
  const sections = getLocationSections(hasEnemies, hasConnectedAreas, isShop, isDomain);

  return (
    <WikiLayout
      infobox={infoboxContent}
      sections={sections}
      breadcrumbs={
        <WikiBreadcrumbs
          category={entityCategory}
          entityName={locationInfo.name}
        />
      }
      title={<PageHeader title={locationInfo.name} headingVariant="h1" />}
    >

      {/* At a Glance */}
      <WikiSectionAnchor id={toAnchorId('At a Glance')}>
        <Paper
          sx={{
            mb: 4,
            backgroundColor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: '30px',
            overflow: 'hidden',
          }}
        >
          <CardHeader title="At a Glance" />
          <Box sx={{ p: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {atAGlanceFacts.map((fact) => {
            const Icon = fact.icon;
            return (
              <Box key={fact.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    bgcolor: tokens.colors.background.elevated,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ fontSize: 18, color: tokens.colors.text.secondary }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block' }}>
                    {fact.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: fact.color || tokens.colors.text.primary }}>
                    {fact.value}
                  </Typography>
                </Box>
              </Box>
            );
          })}
          </Box>
        </Paper>
      </WikiSectionAnchor>

      {/* Two Columns: Guys | Monsters */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Guys / Proprietor Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <WikiSectionAnchor id={toAnchorId(isShop ? 'Proprietor' : 'Guys')}>
            <SectionHeader title={isShop ? 'Proprietor' : 'Guys'} sx={{ mb: 2 }} />
            <BaseCard padding={0}>
              {npcs.length > 0 ? npcs.map((npc, i) => (
                <Box
                  key={npc.slug || npc.name}
                  onClick={() => npc.slug && navigate(`/wiki/wanderers/${npc.slug}`)}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: npc.slug ? 'pointer' : 'default',
                    borderBottom: i < npcs.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                    '&:hover': npc.slug ? { bgcolor: tokens.colors.background.elevated } : {},
                    '&:first-of-type': { borderTopLeftRadius: '29px', borderTopRightRadius: '29px' },
                    '&:last-of-type': { borderBottomLeftRadius: '29px', borderBottomRightRadius: '29px' },
                  }}
                >
                  <AssetImage
                    src={npc.sprite}
                    alt={npc.name}
                    category="wanderers"
                    width={40}
                    height={40}
                    fallback="placeholder"
                    sx={{ borderRadius: '50%', flexShrink: 0, objectFit: 'contain', filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))' }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: npc.slug ? tokens.colors.secondary : tokens.colors.text.primary,
                        }}
                      >
                        {npc.name}
                      </Typography>
                      {npc.hasQuest && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: tokens.colors.warning,
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                      {npc.role}
                    </Typography>
                  </Box>
                  {npc.slug && <ArrowIcon sx={{ color: tokens.colors.text.disabled, fontSize: 18 }} />}
                </Box>
              )) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: tokens.colors.text.disabled }}>
                    {isShop ? 'No proprietor data available' : 'No Guys in this world'}
                  </Typography>
                </Box>
              )}
            </BaseCard>
          </WikiSectionAnchor>
        </Grid>

        {/* Monsters Column - only show if there are monsters */}
        {hasEnemies && (
          <Grid size={{ xs: 12, md: 6 }}>
            <WikiSectionAnchor id={toAnchorId('Monsters')}>
              <SectionHeader title="Monsters" sx={{ mb: 2 }} />
              <BaseCard padding={0}>
                {enemies.map((enemy, i) => (
                  <Box
                    key={enemy.name}
                    onClick={() => enemy.slug && navigate(`/wiki/enemies/${enemy.slug}`)}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      cursor: enemy.slug ? 'pointer' : 'default',
                      borderBottom: i < enemies.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                      '&:hover': enemy.slug ? { bgcolor: tokens.colors.background.elevated } : {},
                      '&:first-of-type': { borderTopLeftRadius: '29px', borderTopRightRadius: '29px' },
                      '&:last-of-type': { borderBottomLeftRadius: '29px', borderBottomRightRadius: '29px' },
                    }}
                  >
                    <AssetImage
                      src={enemy.sprite}
                      alt={enemy.name}
                      category="enemies"
                      width={40}
                      height={40}
                      fallback="placeholder"
                      sx={{ borderRadius: 1, flexShrink: 0, objectFit: 'contain', filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))' }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: enemy.slug ? tokens.colors.secondary : tokens.colors.text.primary,
                          }}
                        >
                          {enemy.name}
                        </Typography>
                        <Chip
                          label={enemy.type}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            bgcolor: `${getEnemyTypeColor(enemy.type as 'Normal' | 'Elite' | 'Miniboss' | 'Boss')}20`,
                            color: getEnemyTypeColor(enemy.type as 'Normal' | 'Elite' | 'Miniboss' | 'Boss'),
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block' }}>
                        Lv. {enemy.level}
                      </Typography>
                    </Box>
                    {enemy.slug && <ArrowIcon sx={{ color: tokens.colors.text.disabled, fontSize: 18 }} />}
                  </Box>
                ))}
              </BaseCard>
            </WikiSectionAnchor>
          </Grid>
        )}
      </Grid>

      {/* World Viewer - ASCII 3D globe for worlds only */}
      {isDomain && entity?.slug && (
        <WikiSectionAnchor id={toAnchorId('World View')}>
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <SectionHeader title="World View" sx={{ mb: 0 }} />
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={asciiArtEnabled}
                  onChange={(event) => setAsciiArtEnabled(event.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: tokens.colors.error,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: tokens.colors.error,
                    },
                  }}
                />
              }
              label={
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  ASCII art
                </Typography>
              }
              sx={{ mr: 0 }}
            />
          </Box>
          <AsciiDomainViewer
            domainSlug={entity.slug}
            height={220}
            cellSize={10}
            autoRotate={true}
            asciiArt={asciiArtEnabled}
          />
        </WikiSectionAnchor>
      )}

      {/* Items Found / Shop Inventory */}
      <WikiSectionAnchor id={toAnchorId(isShop ? 'Shop Inventory' : 'Items Found')}>
        <SectionHeader title={isShop ? 'Shop Inventory' : 'Items Found'} sx={{ mb: 2 }} />
        {isShop && shopData?.inventory ? (
          // Shop inventory with images and prices
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {shopData.inventory.map((inv) => {
              const item = getEntity(inv.item) as Item | undefined;
              return (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={inv.item}>
                  <Paper
                    onClick={() => navigate(`/wiki/items/${inv.item}`)}
                    sx={{
                      p: 2,
                      backgroundColor: tokens.colors.background.paper,
                      border: `1px solid ${tokens.colors.border}`,
                      borderRadius: '20px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      '&:hover': { borderColor: tokens.colors.text.secondary },
                    }}
                  >
                    <AssetImage
                      src={item?.image || item?.sprites?.[0] || ''}
                      alt={item?.name || slugToName(inv.item)}
                      category="items"
                      width={64}
                      height={64}
                      fallback="placeholder"
                      sx={{ mx: 'auto', mb: 1.5, borderRadius: 1 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: tokens.colors.secondary,
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item?.name || slugToName(inv.item)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                      {inv.price} gold
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          // World items as compact linked item cards
          <>
            {hasItems ? (
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {sortedLocationItems.map((item) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.slug || item.name}>
                    <Paper
                      onClick={() => item.slug && navigate(`/wiki/items/${item.slug}`)}
                      sx={{
                        p: 2,
                        minHeight: 96,
                        backgroundColor: tokens.colors.background.paper,
                        border: `1px solid ${tokens.colors.border}`,
                        borderRadius: '20px',
                        cursor: item.slug ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        transition: 'border-color 160ms ease, transform 160ms ease',
                        '&:hover': item.slug ? {
                          borderColor: getRarityColor(item.rarity),
                          transform: 'translateY(-1px)',
                        } : {},
                      }}
                    >
                      <AssetImage
                        src={item.image}
                        alt={item.name}
                        category="items"
                        width={56}
                        height={56}
                        fallback="placeholder"
                        sx={{
                          borderRadius: 1,
                          bgcolor: tokens.colors.background.elevated,
                          objectFit: 'contain',
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: item.slug ? tokens.colors.secondary : tokens.colors.text.primary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            mb: 0.75,
                          }}
                        >
                          {item.name}
                        </Typography>
                        <DataBadge
                          label={item.rarity}
                          rarity={getBadgeRarity(item.rarity)}
                          variant="outlined"
                          size="sm"
                        />
                      </Box>
                      {item.slug && <ArrowIcon sx={{ color: tokens.colors.text.disabled, fontSize: 18, flexShrink: 0 }} />}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <BaseCard sx={{ mb: 4 }}>
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: tokens.colors.text.disabled }}>
                    No items found in this area
                  </Typography>
                </Box>
              </BaseCard>
            )}
          </>
        )}
      </WikiSectionAnchor>

      {/* Connected Worlds - only show if there are connected areas */}
      {hasConnectedAreas && (
        <WikiSectionAnchor id={toAnchorId('Connected Worlds')}>
          <SectionHeader title="Connected Worlds" sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {connectedAreas.map((area: DisplayConnectedArea) => {
              const areaEntity = area.slug ? getEntity(area.slug) as Domain | undefined : undefined;
              return (
              <Grid size={{ xs: 12, sm: 4 }} key={area.name}>
                <Paper
                  onClick={() => area.slug && navigate(`/wiki/domains/${area.slug}`)}
                  sx={{
                    p: 3,
                    backgroundColor: tokens.colors.background.paper,
                    border: `1px solid ${tokens.colors.border}`,
                    borderRadius: '30px',
                    cursor: area.slug ? 'pointer' : 'default',
                    '&:hover': area.slug ? { borderColor: tokens.colors.primary } : {},
                  }}
                >
                  <AssetImage
                    src={areaEntity?.image || areaEntity?.sprites?.[0] || ''}
                    alt={area.name}
                    category="domains"
                    width="100%"
                    height={80}
                    fallback="placeholder"
                    sx={{ mb: 2, borderRadius: '20px' }}
                  />
                  {area.slug ? (
                    <WikiLink slug={area.slug} category="domains" />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {area.name}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                      {area.direction}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                      Lv. {area.level}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              );
            })}
          </Grid>
        </WikiSectionAnchor>
      )}

    </WikiLayout>
  );
}
