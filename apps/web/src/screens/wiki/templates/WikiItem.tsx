import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  AttachMoneySharp as ValueIcon,
  PestControlSharp as EnemyIcon,
  PlaceSharp as LocationIcon,
  CasinoSharp as DiceIcon,
  WhatshotSharp as ElementIcon,
  TrendingUpSharp as TierIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { PageHeader, TextBlock } from '../../../components/Placeholder';
import { WikiLayout, WikiSectionAnchor, toAnchorId, type WikiSection } from '../../../components/WikiLayout';
import { WikiBreadcrumbs } from '../../../components/WikiBreadcrumbs';
import { WikiLink } from '../../../components/WikiLink';
import { BaseCard } from '../../../components/BaseCard';
import { SectionHeader } from '../../../components/SectionHeader';
import { CardHeader, AssetImage } from '../../../components/ds';
import { getRarityColor, slugToName } from '../../../data/wiki/helpers';
import type { AnyEntity, Item, WikiCategory } from '../../../data/wiki/types';
import { getEntity } from '../../../data/wiki';

interface WikiItemProps {
  entity?: AnyEntity;
}

// Default item data
const defaultItemInfo = {
  name: 'Void Essence',
  rarity: 'Epic',
  type: 'Material',
  value: '500 Gold',
  stackSize: '20',
  weight: '0.1',
  source: 'Boss Drop',
};

const defaultStats = [
  { label: 'Void Power', value: 85, max: 100 },
  { label: 'Purity', value: 70, max: 100 },
  { label: 'Stability', value: 45, max: 100 },
];

const defaultEffects = [
  { name: 'Void Infusion', description: 'Adds void damage to weapons when used in crafting' },
  { name: 'Soul Binding', description: 'Required for high-tier soul-based equipment' },
];

const defaultObtainMethods = [
  { type: 'enemy', name: 'Void Lord', location: 'Crimson Domain', rate: '15%' },
  { type: 'enemy', name: 'Shadow Sentinel', location: 'Void Realm', rate: '5%' },
  { type: 'location', name: 'Ancient Chest', location: 'Lost Temple', rate: '10%' },
];


// Section configuration - dynamically built based on available data
const getItemSections = (hasStats: boolean, hasObtainMethods: boolean, hasCraftingRecipe: boolean, hasUsedIn: boolean): WikiSection[] => {
  const sections: WikiSection[] = [
    { name: 'At a Glance' },
    { name: 'Description' },
  ];
  if (hasStats) sections.push({ name: 'Stats & Properties' });
  if (hasObtainMethods) sections.push({ name: 'How to Obtain' });
  if (hasCraftingRecipe) sections.push({ name: 'Crafting Recipe' });
  if (hasUsedIn) sections.push({ name: 'Used In Recipes' });
  return sections;
};

export function WikiItem({ entity }: WikiItemProps) {
  const { category } = useParams();

  // Handle both items and trophies categories
  const itemData = (entity?.category === 'items' || entity?.category === 'trophies')
    ? (entity as Item)
    : undefined;

  const itemInfo = itemData ? {
    name: itemData.name,
    rarity: itemData.rarity || 'Common',
    type: itemData.itemType || 'Unknown',
    subtype: itemData.subtype,
    value: itemData.value?.toString() || '-',
    stackSize: '20',
    weight: '0.1',
    source: itemData.obtainMethods?.[0]?.type || 'Unknown',
    element: itemData.element || 'Neutral',
    tier: itemData.tier || 1,
    level: itemData.level || 1,
    preferredDice: itemData.preferredDice,
    description: itemData.description,
  } : { ...defaultItemInfo, element: 'Neutral', tier: 1, level: 1, preferredDice: undefined, subtype: undefined, description: undefined };

  const stats = itemData?.stats || defaultStats;
  const effects = itemData?.effects || defaultEffects;
  const obtainMethods = itemData?.obtainMethods?.map(m => ({
    type: m.type,
    slug: m.source,
    name: slugToName(m.source),
    location: m.location || '-',
    rate: m.rate || '-',
  })) || defaultObtainMethods.map(m => ({ ...m, slug: '' }));

  // Additional entity-aware data
  const craftingRecipe = itemData?.craftingRecipe || null;
  const usedIn = itemData?.usedIn || [];

  // Determine which sections have data
  const hasStats = stats.length > 0 && !!itemData?.stats;
  const hasEffects = effects.length > 0;
  const hasObtainMethods = obtainMethods.length > 0 && !!itemData?.obtainMethods;
  const hasCraftingRecipe = craftingRecipe !== null;
  const hasUsedIn = usedIn.length > 0;

  // Infobox content (right sidebar)
  const infoboxContent = (
    <Box>
      {/* Item Image */}
      <Paper
        sx={{
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: '30px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            p: 3,
          }}
        >
          <Box
            sx={{
              backgroundColor: tokens.colors.background.elevated,
              borderRadius: '18px',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AssetImage
              src={itemData?.image || ''}
              alt={itemInfo.name}
              category="items"
              width="100%"
              height={140}
              fallback="placeholder"
              sx={{ objectFit: 'contain' }}
            />
          </Box>
          <Chip
            label={itemInfo.rarity}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: getRarityColor(itemInfo.rarity),
              color: tokens.colors.background.default,
              fontWeight: 600,
            }}
          />
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {itemInfo.name}
          </Typography>
          <Typography variant="body2" sx={{ color: getRarityColor(itemInfo.rarity) }}>
            {itemInfo.rarity} {itemInfo.type}
          </Typography>
        </Box>
      </Paper>

      {/* Quick Stats */}
      <Paper
        sx={{
          mt: 2,
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: '30px',
          overflow: 'hidden',
        }}
      >
        <CardHeader title="Quick Info" />
        <Box sx={{ p: 2 }}>
          {[
            { icon: ValueIcon, label: 'Value', value: itemInfo.value },
            { icon: ElementIcon, label: 'Element', value: itemInfo.element },
            { icon: TierIcon, label: 'Tier', value: `T${itemInfo.tier}` },
            { icon: TierIcon, label: 'Level', value: `Lv.${itemInfo.level}` },
            ...(itemInfo.preferredDice ? [{ icon: DiceIcon, label: 'Dice', value: `d${itemInfo.preferredDice}` }] : []),
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, '&:last-child': { mb: 0 } }}>
                <Icon sx={{ fontSize: 18, color: tokens.colors.text.disabled }} />
                <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, flex: 1 }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {item.value}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );

  // Get category from entity or URL param
  const entityCategory = (entity?.category || category || 'items') as WikiCategory;

  // Build dynamic sections based on available data
  const sections = getItemSections(hasStats, hasObtainMethods, hasCraftingRecipe, hasUsedIn);

  return (
    <WikiLayout
      infobox={infoboxContent}
      sections={sections}
      breadcrumbs={
        <WikiBreadcrumbs
          category={entityCategory}
          entityName={itemInfo.name}
        />
      }
    >
      <PageHeader
        title={itemInfo.name}
      />

      {/* At a Glance */}
      <WikiSectionAnchor id={toAnchorId('At a Glance')}>
        <Paper
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: '30px',
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <AssetImage
            src={itemData?.image || ''}
            alt={itemInfo.name}
            category="items"
            width={64}
            height={64}
            fallback="placeholder"
            sx={{ borderRadius: '16px', flexShrink: 0 }}
          />
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {itemInfo.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={itemInfo.rarity}
                size="small"
                sx={{ bgcolor: getRarityColor(itemInfo.rarity), color: tokens.colors.background.default }}
              />
              <Chip
                label={itemInfo.subtype ? `${itemInfo.type} - ${itemInfo.subtype}` : itemInfo.type}
                size="small"
                variant="outlined"
                sx={{ borderColor: tokens.colors.border }}
              />
              <Chip
                label={itemInfo.element}
                size="small"
                variant="outlined"
                sx={{ borderColor: tokens.colors.border }}
              />
              <Chip
                label={`T${itemInfo.tier}`}
                size="small"
                variant="outlined"
                sx={{ borderColor: tokens.colors.border }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Value</Typography>
              <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.25rem', fontWeight: 600 }}>{itemInfo.value}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Level</Typography>
              <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.25rem', fontWeight: 600 }}>{itemInfo.level}</Typography>
            </Box>
            {itemInfo.preferredDice && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Dice</Typography>
                <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.25rem', fontWeight: 600 }}>d{itemInfo.preferredDice}</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </WikiSectionAnchor>

      {/* Description */}
      <WikiSectionAnchor id={toAnchorId('Description')}>
        <SectionHeader title="Description" sx={{ mb: 2 }} />
        <Box sx={{ mb: 4 }}>
          {itemInfo.description ? (
            <Typography variant="body1" sx={{ color: tokens.colors.text.secondary, lineHeight: 1.7 }}>
              {itemInfo.description}
            </Typography>
          ) : (
            <TextBlock lines={3} />
          )}
          {effects.length > 0 && (
            <Box sx={{ mt: 3 }}>
              {effects.map((effect) => (
                <Box
                  key={effect.name}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: tokens.colors.background.elevated,
                    borderRadius: '15px',
                    '&:last-child': { mb: 0 },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, color: getRarityColor(itemInfo.rarity) }}>
                    {effect.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                    {effect.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </WikiSectionAnchor>

      {/* Stats & Properties - only show if we have real stats */}
      {hasStats && (
        <WikiSectionAnchor id={toAnchorId('Stats & Properties')}>
          <SectionHeader title="Stats & Properties" sx={{ mb: 2 }} />
          <BaseCard sx={{ mb: 4 }}>
            {stats.map((stat) => (
              <Box key={stat.label} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{stat.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{stat.value}/{stat.max || 100}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(stat.value / (stat.max || 100)) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: tokens.colors.background.elevated,
                    '& .MuiLinearProgress-bar': { bgcolor: getRarityColor(itemInfo.rarity) },
                  }}
                />
              </Box>
            ))}
          </BaseCard>
        </WikiSectionAnchor>
      )}

      {/* How to Obtain - only show if we have real obtain methods */}
      {hasObtainMethods && (
        <WikiSectionAnchor id={toAnchorId('How to Obtain')}>
          <SectionHeader title="How to Obtain" sx={{ mb: 2 }} />
          <BaseCard padding={0} sx={{ mb: 4 }}>
            {obtainMethods.map((method, i) => {
              const Icon = method.type === 'enemy' ? EnemyIcon : LocationIcon;
              return (
                <Box
                  key={`${method.name}-${i}`}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    borderBottom: i < obtainMethods.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                    '&:hover': { bgcolor: tokens.colors.background.elevated },
                    '&:first-of-type': { borderTopLeftRadius: '29px', borderTopRightRadius: '29px' },
                    '&:last-of-type': { borderBottomLeftRadius: '29px', borderBottomRightRadius: '29px' },
                  }}
                >
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
                  <Box sx={{ flex: 1 }}>
                    {method.slug ? (
                      <WikiLink slug={method.slug} />
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{method.name}</Typography>
                    )}
                    {method.location && method.location !== '-' && (
                      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block' }}>
                        {method.location}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={method.rate}
                    size="small"
                    sx={{
                      bgcolor: tokens.colors.background.elevated,
                      color: tokens.colors.text.primary,
                    }}
                  />
                </Box>
              );
            })}
          </BaseCard>
        </WikiSectionAnchor>
      )}

      {/* Crafting Recipe - only show if item has a crafting recipe */}
      {hasCraftingRecipe && craftingRecipe && (
        <WikiSectionAnchor id={toAnchorId('Crafting Recipe')}>
          <SectionHeader title="Crafting Recipe" sx={{ mb: 2 }} />
          <BaseCard sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {craftingRecipe.materials.map((mat, i) => {
                const matItem = getEntity(mat.item) as Item | undefined;
                return (
                <Box key={mat.item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AssetImage
                      src={matItem?.image || ''}
                      alt={matItem?.name || mat.item}
                      category="items"
                      width={56}
                      height={56}
                      fallback="placeholder"
                      sx={{ borderRadius: 1, mb: 0.5, objectFit: 'contain' }}
                    />
                    <WikiLink slug={mat.item} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>x{mat.quantity}</Typography>
                  </Box>
                  {i < craftingRecipe.materials.length - 1 && (
                    <Typography variant="h5" sx={{ color: tokens.colors.text.disabled, mx: 1 }}>+</Typography>
                  )}
                </Box>
                );
              })}
              <Typography variant="h4" sx={{ color: tokens.colors.text.disabled, mx: 2 }}>=</Typography>
              <Box sx={{ textAlign: 'center' }}>
                <AssetImage
                  src={itemData?.image || ''}
                  alt={itemInfo.name}
                  category="items"
                  width={64}
                  height={64}
                  fallback="placeholder"
                  sx={{ borderRadius: 1, mb: 0.5, border: `2px solid ${getRarityColor(itemInfo.rarity)}30` }}
                />
                <Typography variant="caption" sx={{ color: getRarityColor(itemInfo.rarity), display: 'block' }}>
                  {itemInfo.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>x1</Typography>
              </Box>
            </Box>
          </BaseCard>
        </WikiSectionAnchor>
      )}

      {/* Used In - only show if item is used in other recipes */}
      {hasUsedIn && (
        <WikiSectionAnchor id={toAnchorId('Used In Recipes')}>
          <SectionHeader title="Used In" sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {usedIn.map((slug) => (
              <WikiLink key={slug} slug={slug} variant="chip" />
            ))}
          </Box>
        </WikiSectionAnchor>
      )}

    </WikiLayout>
  );
}
