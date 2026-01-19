import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
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
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { PageHeader } from '../../../components/Placeholder';
import { WikiLayout, WikiSectionAnchor, toAnchorId, type WikiSection } from '../../../components/WikiLayout';
import { WikiBreadcrumbs } from '../../../components/WikiBreadcrumbs';
import { WikiLink } from '../../../components/WikiLink';
import { BaseCard } from '../../../components/BaseCard';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardHeader, AssetImage } from '../../../components/ds';
import { getDifficultyColor, getRarityColor, getEnemyTypeColor, slugToName } from '../../../data/wiki/helpers';
import { getEntity } from '../../../data/wiki';
import type { AnyEntity, Domain, Shop, WikiCategory, Wanderer, Enemy, Item } from '../../../data/wiki/types';
import { AsciiDomainViewer } from '../../../components/AsciiDomainViewer';

interface WikiLocationProps {
  entity?: AnyEntity;
}

// Default location data
const defaultLocationInfo = {
  name: 'Crimson Domain',
  region: 'Northern Wastes',
  difficulty: 'Hard',
  levelRange: '25-35',
  requirements: 'Complete "Shadow\'s End" quest',
  type: 'Domain',
};

const defaultNpcs = [
  { name: 'Merchant Galen', role: 'Shop Keeper', hasQuest: true },
  { name: 'Elder Thorne', role: 'Quest Giver', hasQuest: true },
  { name: 'Guard Captain', role: 'Dialogue', hasQuest: false },
];

const defaultEnemies = [
  { name: 'Shadow Wraith', type: 'Normal', level: '25-28' },
  { name: 'Dark Knight', type: 'Elite', level: '28-32' },
  { name: 'Crimson Sentinel', type: 'Normal', level: '26-30' },
  { name: 'Void Lord', type: 'Boss', level: '35' },
];

const defaultItemsByRarity = {
  Common: ['Soul Fragment', 'Iron Ore', 'Healing Herb'],
  Uncommon: ['Frost Crystal', 'Shadow Essence', 'Magic Scroll'],
  Rare: ['Ancient Rune', 'Crimson Blade Fragment'],
  Epic: ['Void Essence'],
};

interface DisplayConnectedArea {
  slug: string;
  name: string;
  direction: string;
  level: string;
}

const defaultConnectedAreas: DisplayConnectedArea[] = [];

// Dynamic section configuration based on available data
const getLocationSections = (
  hasEnemies: boolean,
  hasConnectedAreas: boolean,
  isShop: boolean,
  isDomain: boolean,
): WikiSection[] => {
  const sections: WikiSection[] = [
    { name: 'Quick Facts' },
    { name: isShop ? 'Proprietor' : 'NPCs' },
  ];
  if (hasEnemies) sections.push({ name: 'Enemies' });
  if (isDomain) sections.push({ name: 'Domain View' });
  sections.push({ name: isShop ? 'Shop Inventory' : 'Items Found' });
  if (hasConnectedAreas) sections.push({ name: 'Connected Areas' });
  return sections;
};

// Dying Saucer animation frames
const DYING_SAUCER_FRAMES = Array.from({ length: 12 }, (_, i) =>
  `/assets/enemies/dying-saucer/main_ufo_frames/ufo-${String(i + 1).padStart(2, '0')}.png`
);


export function WikiLocation({ entity }: WikiLocationProps) {
  const { category } = useParams();
  const navigate = useNavigate();

  // Animation state for Dying Saucer
  const isDyingSaucer = entity?.slug === 'the-dying-saucer';
  const isBoardRoom = entity?.slug === 'the-board-room';
  const [saucerFrame, setSaucerFrame] = useState(0);

  useEffect(() => {
    if (!isDyingSaucer) return;
    const interval = setInterval(() => {
      setSaucerFrame(prev => (prev + 1) % DYING_SAUCER_FRAMES.length);
    }, 100); // 100ms per frame = ~10fps
    return () => clearInterval(interval);
  }, [isDyingSaucer]);

  // Type-specific data extraction
  const isDomain = entity?.category === 'domains';
  const isShop = entity?.category === 'shops';

  const domainData = isDomain ? (entity as Domain) : undefined;
  const shopData = isShop ? (entity as Shop) : undefined;

  // Check for mobile vendor (shop with travelPattern)
  const isMobileVendor = isShop && shopData?.travelPattern && shopData.travelPattern.length > 0;
  const travelPattern = shopData?.travelPattern || [];

  // Map entity data to locationInfo format
  const locationInfo = entity ? {
    name: entity.name,
    region: isMobileVendor ? 'Mobile Vendor' : (domainData?.region || shopData?.location || '-'),
    difficulty: domainData?.difficulty || 'Normal',
    levelRange: domainData?.levelRange || '-',
    requirements: domainData?.requirements || '-',
    type: entity.category.charAt(0).toUpperCase() + entity.category.slice(1, -1),
  } : defaultLocationInfo;

  // Map NPCs from domain.npcs slugs to real wanderer entities
  // For shops, use the proprietor as the NPC
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

  // Map items from domain.items or shop.inventory to real item entities, grouped by rarity
  const locationItems = (() => {
    if (domainData?.items) {
      return domainData.items.map(slug => {
        const item = getEntity(slug) as Item | undefined;
        return {
          slug,
          name: item?.name || slugToName(slug),
          rarity: item?.rarity || 'Common',
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
        };
      });
    }
    return [];
  })();

  // Group items by rarity
  const itemsByRarity: Record<string, Array<{ slug: string; name: string }>> = {};
  if (locationItems.length > 0) {
    for (const item of locationItems) {
      if (!itemsByRarity[item.rarity]) {
        itemsByRarity[item.rarity] = [];
      }
      itemsByRarity[item.rarity].push({ slug: item.slug, name: item.name });
    }
  }

  // Order rarities for display
  const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique'];
  const hasItems = Object.keys(itemsByRarity).length > 0;
  const connectedAreas = domainData?.connectedAreas?.map((conn) => ({
    slug: conn.area,
    name: slugToName(conn.area),
    direction: conn.direction || '-',
    level: conn.levelRange || '-',
  })) || (isDomain || isShop ? [] : defaultConnectedAreas);

  // Determine which sections have data
  const hasEnemies = enemies.length > 0;
  const hasConnectedAreas = connectedAreas.length > 0;

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
        {isDyingSaucer ? (
          // Animated Dying Saucer
          <Box sx={{ p: 3 }}>
            <Box sx={{
              backgroundColor: tokens.colors.background.elevated,
              borderRadius: '18px',
              height: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src={DYING_SAUCER_FRAMES[saucerFrame]}
                alt="The Dying Saucer"
                style={{
                  width: 'auto',
                  height: '75%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  imageRendering: 'pixelated',
                }}
              />
            </Box>
          </Box>
        ) : isBoardRoom ? (
          // Board Room - circular crop
          <Box sx={{ p: 3 }}>
            <Box sx={{
              backgroundColor: tokens.colors.background.elevated,
              borderRadius: '18px',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Box sx={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                overflow: 'hidden',
              }}>
                <img
                  src={entity?.image || ''}
                  alt="The Board Room"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Box sx={{
              backgroundColor: tokens.colors.background.elevated,
              borderRadius: '18px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AssetImage
                src={entity?.image || entity?.portrait || ''}
                alt={locationInfo.name}
                category={(entity?.category || 'domains') as 'domains' | 'shops'}
                width="100%"
                height={isShop ? 220 : 180}
                fallback="placeholder"
              />
            </Box>
          </Box>
        )}
        {/* Only show "view full map" for domains, not shops */}
        {isDomain && (
          <Box sx={{ pb: 2 }}>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              Click to view full map
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Location Info */}
      <Paper
        sx={{
          mt: 2,
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: '30px',
          overflow: 'hidden',
        }}
      >
        <CardHeader title="Location Info" />
        <Box sx={{ p: 3 }}>
          {[
            { icon: RegionIcon, label: 'Region', value: locationInfo.region },
            { icon: DifficultyIcon, label: 'Difficulty', value: locationInfo.difficulty, color: getDifficultyColor(locationInfo.difficulty) },
            { icon: LocationIcon, label: 'Level', value: locationInfo.levelRange },
            { icon: RequirementIcon, label: 'Unlock', value: locationInfo.requirements },
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
              This vendor travels between domains. Check each location for current availability.
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
    >
      <PageHeader
        title={locationInfo.name}
      />

      {/* Quick Facts Bar */}
      <WikiSectionAnchor id={toAnchorId('Quick Facts')}>
        <Paper
          sx={{
            mb: 4,
            backgroundColor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: '30px',
            overflow: 'hidden',
          }}
        >
          <CardHeader title="Quick Facts" />
          <Box sx={{ p: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {[
            { label: 'Region', value: locationInfo.region, icon: RegionIcon },
            { label: 'Difficulty', value: locationInfo.difficulty, icon: DifficultyIcon, color: getDifficultyColor(locationInfo.difficulty) },
            { label: 'Level', value: locationInfo.levelRange, icon: LocationIcon },
            { label: 'Unlock', value: 'Quest Required', icon: RequirementIcon },
          ].map((fact) => {
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

      {/* Two Columns: NPCs | Enemies */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* NPCs / Proprietor Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <WikiSectionAnchor id={toAnchorId(isShop ? 'Proprietor' : 'NPCs')}>
            <SectionHeader title={isShop ? 'Proprietor' : 'NPCs'} icon={<NPCIcon />} sx={{ mb: 2 }} />
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
                    {isShop ? 'No proprietor data available' : 'No NPCs in this area'}
                  </Typography>
                </Box>
              )}
            </BaseCard>
          </WikiSectionAnchor>
        </Grid>

        {/* Enemies Column - only show if there are enemies */}
        {hasEnemies && (
          <Grid size={{ xs: 12, md: 6 }}>
            <WikiSectionAnchor id={toAnchorId('Enemies')}>
              <SectionHeader title="Enemies" icon={<EnemyIcon />} sx={{ mb: 2 }} />
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

      {/* Domain Viewer - ASCII 3D globe for domains only */}
      {isDomain && entity?.slug && (
        <WikiSectionAnchor id={toAnchorId('Domain View')}>
          <SectionHeader title="Domain View" sx={{ mb: 2 }} />
          <AsciiDomainViewer
            domainSlug={entity.slug}
            height={220}
            cellSize={10}
            autoRotate={true}
          />
        </WikiSectionAnchor>
      )}

      {/* Items Found / Shop Inventory */}
      <WikiSectionAnchor id={toAnchorId(isShop ? 'Shop Inventory' : 'Items Found')}>
        <SectionHeader title={isShop ? 'Shop Inventory' : 'Items Found'} icon={<ItemIcon />} sx={{ mb: 2 }} />
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
                      src={item?.image || ''}
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
          // Domain items by rarity (chip cloud)
          <BaseCard sx={{ mb: 4 }}>
            {hasItems ? (
              rarityOrder
                .filter(rarity => itemsByRarity[rarity]?.length > 0)
                .map((rarity) => (
                  <Box key={rarity} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                    <Typography variant="caption" sx={{ color: getRarityColor(rarity), fontWeight: 500, mb: 1, display: 'block' }}>
                      {rarity}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {itemsByRarity[rarity].map((item) => (
                        item.slug ? (
                          <WikiLink key={item.slug} slug={item.slug} category="items" variant="chip" />
                        ) : (
                          <Chip
                            key={item.name}
                            label={item.name}
                            size="small"
                            sx={{
                              bgcolor: `${getRarityColor(rarity)}20`,
                              borderRadius: 1,
                              cursor: 'pointer',
                              '&:hover': { bgcolor: `${getRarityColor(rarity)}30` },
                            }}
                          />
                        )
                      ))}
                    </Box>
                  </Box>
                ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: tokens.colors.text.disabled }}>
                  No items found in this area
                </Typography>
              </Box>
            )}
          </BaseCard>
        )}
      </WikiSectionAnchor>

      {/* Connected Areas - only show if there are connected areas */}
      {hasConnectedAreas && (
        <WikiSectionAnchor id={toAnchorId('Connected Areas')}>
          <SectionHeader title="Connected Areas" sx={{ mb: 2 }} />
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
                    src={areaEntity?.image || ''}
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
