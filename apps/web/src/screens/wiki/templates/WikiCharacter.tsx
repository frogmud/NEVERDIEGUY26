import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  FavoriteSharp as HealthIcon,
  PlaceSharp as LocationIcon,
  GradeSharp as LevelIcon,
  ShieldSharp as DefenseIcon,
  LocalFireDepartmentSharp as WeaknessIcon,
  AcUnitSharp as ResistIcon,
  ArrowForwardSharp as ArrowIcon,
  CasinoSharp as DiceIcon,
  PublicSharp as OriginIcon,
  SportsEsportsSharp as PlayStyleIcon,
  InventorySharp as LoadoutIcon,
  StorefrontSharp as ServicesIcon,
  AutoAwesomeSharp as FavorIcon,
  WarningAmberSharp as CorruptionIcon,
  GroupsSharp as FactionIcon,
  FavoriteSharp as AllyIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { PageHeader, TextBlock } from '../../../components/Placeholder';
import { WikiLayout, WikiSectionAnchor, toAnchorId, type WikiSection } from '../../../components/WikiLayout';
import { WikiBreadcrumbs } from '../../../components/WikiBreadcrumbs';
import { WikiLink } from '../../../components/WikiLink';
import { BaseCard } from '../../../components/BaseCard';
import { SectionHeader } from '../../../components/SectionHeader';
import { DataBadge } from '../../../components/DataBadge';
import { CardHeader, AssetImage } from '../../../components/ds';
import { getRarityColor, slugToName } from '../../../data/wiki/helpers';
import type { AnyEntity, Enemy, Traveler, Wanderer, Pantheon, Faction, WikiCategory, Item, Domain, Shop } from '../../../data/wiki/types';
import { getEntity, getRelated } from '../../../data/wiki';

interface WikiCharacterProps {
  entity?: AnyEntity;
}

// Entity type enum for cleaner logic
type CharacterType = 'traveler' | 'enemy' | 'wanderer' | 'pantheon' | 'faction';

// Dynamic section configuration based on entity type and available data
const getCharacterSections = (
  characterType: CharacterType,
  hasPhases: boolean,
  hasDrops: boolean,
  hasLocations: boolean,
  hasLoadout: boolean,
  hasFavorEffects: boolean,
): WikiSection[] => {
  const sections: WikiSection[] = [];

  switch (characterType) {
    case 'traveler':
      sections.push({ name: 'Base Stats' });
      sections.push({ name: 'Affiliations' });
      if (hasLoadout) sections.push({ name: 'Favorite Items' });
      break;

    case 'wanderer':
      sections.push({ name: 'Affiliations' });
      if (hasLocations) sections.push({ name: 'Locations' });
      break;

    case 'pantheon':
      sections.push({ name: 'Base Stats' });
      sections.push({ name: 'Affiliations' });
      break;

    case 'faction':
      sections.push({ name: 'Overview' });
      sections.push({ name: 'Members' });
      sections.push({ name: 'Alliances' });
      sections.push({ name: 'Faction Bonuses' });
      break;

    case 'enemy':
    default:
      sections.push({ name: 'Combat Overview' });
      if (hasPhases) sections.push({ name: 'Battle Phases' });
      if (hasDrops) sections.push({ name: 'Favorite Items' });
      sections.push({ name: 'Strategy Guide' });
      if (hasLocations) sections.push({ name: 'Encountered In' });
      break;
  }

  return sections;
};

export function WikiCharacter({ entity }: WikiCharacterProps) {
  const { category } = useParams();
  const navigate = useNavigate();

  // Typewriter effect for faction motto
  const factionMotto = (entity as Faction)?.motto || '';
  const [displayedMotto, setDisplayedMotto] = useState('');

  useEffect(() => {
    if (!factionMotto) return;
    setDisplayedMotto('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < factionMotto.length) {
        setDisplayedMotto(factionMotto.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [factionMotto]);

  // Guard: entity should always exist (WikiEntity shows 404 for missing entities)
  if (!entity) {
    return null;
  }

  // Determine character type
  const isEnemy = entity.category === 'enemies';
  const isTraveler = entity?.category === 'travelers';
  const isWanderer = entity?.category === 'wanderers';
  const isPantheon = entity?.category === 'pantheon';
  const isFaction = entity?.category === 'factions';

  const characterType: CharacterType = isTraveler ? 'traveler'
    : isWanderer ? 'wanderer'
    : isPantheon ? 'pantheon'
    : isFaction ? 'faction'
    : 'enemy';

  // Cast to specific types
  const enemyData = isEnemy ? (entity as Enemy) : undefined;
  const travelerData = isTraveler ? (entity as Traveler) : undefined;
  const wandererData = isWanderer ? (entity as Wanderer) : undefined;
  const pantheonData = isPantheon ? (entity as Pantheon) : undefined;
  const factionData = isFaction ? (entity as Faction) : undefined;

  const characterInfo = {
    name: entity.name,
    health: enemyData?.hp?.toString() || enemyData?.baseHp?.toString() || '-',
    level: enemyData?.level?.toString() || '-',
    type: enemyData?.enemyType || travelerData?.availability || wandererData?.role || pantheonData?.role || entity.rarity || 'Unknown',
    location: enemyData?.domain ? slugToName(enemyData.domain) : '-',
    weakness: enemyData?.weaknesses?.[0] || enemyData?.element || '-',
    resistance: enemyData?.resistances?.[0] || '-',
    defense: enemyData?.defense?.toString() || enemyData?.baseDefense?.toString() || '-',
    rarity: entity.rarity || 'Common',
  };

  // Traveler-specific data
  const travelerInfo = travelerData ? {
    origin: travelerData.origin || 'Unknown',
    playStyle: travelerData.playStyle || 'Balanced',
  } : null;

  // Wanderer-specific data
  const wandererInfo = wandererData ? {
    role: wandererData.role || 'NPC',
    origin: wandererData.origin || 'Unknown',
  } : null;

  // Pantheon-specific data
  const pantheonInfo = pantheonData ? {
    role: pantheonData.role || 'Die-rector',
    domain: pantheonData.domain || 'Unknown',
    element: pantheonData.element || 'Neutral',
    door: pantheonData.door,
  } : null;

  // Faction-specific data
  const factionInfo = factionData ? {
    motto: factionData.motto || '',
    founder: factionData.founder,
    homeBase: factionData.homeBase,
    element: factionData.element || 'Neutral',
    members: factionData.members || [],
    allies: factionData.allies || [],
    rivals: factionData.rivals || [],
    bonuses: factionData.bonuses || [],
    lore: factionData.lore || '',
  } : null;

  // Base stats for travelers and pantheon
  const baseStats = travelerData?.baseStats || pantheonData?.baseStats || null;

  // Starting loadout for travelers
  const startingLoadout = travelerData?.startingLoadout || [];

  // Wanderer services and locations
  const services = wandererData?.services || [];
  const wandererLocations = wandererData?.locations || [];

  // Pantheon favor and corruption effects
  const favorEffects = pantheonData?.favorEffects || [];
  const corruptionEffects = pantheonData?.corruptionEffects || [];

  const phases = enemyData?.phases?.map(p => ({
    phase: p.phase,
    name: p.name,
    health: p.healthRange,
    description: p.description || '',
  })) || [];

  const rawAbilities = enemyData?.abilities || travelerData?.abilities || [];
  const abilities = rawAbilities.map(a => ({
    name: a.name,
    damage: a.damage || '-',
    type: a.type || 'Unknown',
    cooldown: a.cooldown || '-',
    description: a.description || '',
  }));

  const drops = enemyData?.drops?.map(d => {
    const item = getEntity(d.item) as Item | undefined;
    return {
      slug: d.item,
      name: item?.name || slugToName(d.item),
      rate: d.rate,
      rarity: item?.rarity || d.rarity || 'Common',
      image: item?.image || item?.sprites?.[0] || '',
    };
  }) || [];

  const locations = enemyData?.locations?.map(loc => {
    const domain = getEntity(loc) as Domain | undefined;
    return {
      slug: loc,
      name: domain?.name || slugToName(loc),
      type: 'Location',
      level: domain?.levelRange || '-',
      image: domain?.image || domain?.sprites?.[0] || '',
    };
  }) || [];

  // Determine which sections have data
  const hasPhases = phases.length > 0;
  const hasDrops = drops.length > 0;
  const hasLocations = locations.length > 0 || wandererLocations.length > 0;
  const hasLoadout = startingLoadout.length > 0;
  const hasServices = services.length > 0;
  const hasFavorEffects = favorEffects.length > 0;

  // Get relationship data for affiliations
  const factionMemberships = entity ? getRelated(entity.slug, 'memberOf') as Faction[] : [];
  const controlledDomain = isPantheon && pantheonData?.domain ? getEntity(pantheonData.domain) as Domain | undefined : undefined;
  const wandererDomains = isWanderer && wandererData?.locations ? wandererData.locations.map(loc => getEntity(loc)).filter((d): d is Domain => d !== undefined) : [];

  // Get allies/rivals from seeAlso and faction data
  const relatedCharacters = entity?.seeAlso
    ?.map(slug => getEntity(slug))
    .filter((e): e is AnyEntity => e !== undefined && ['travelers', 'wanderers', 'pantheon'].includes(e.category)) || [];

  const hasAffiliations = factionMemberships.length > 0 || controlledDomain || wandererDomains.length > 0 || relatedCharacters.length > 0;

  // Infobox content (right sidebar)
  const infoboxContent = (
    <Box>
      {/* Character Portrait */}
      <Paper
        sx={{
          p: 3,
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: '30px',
          textAlign: 'center',
        }}
      >
        <Box sx={{ position: 'relative', mb: 2 }}>
          {category === 'factions' ? (
            // Factions: center icon at 50% scale within container
            <Box sx={{
              width: '100%',
              height: { xs: 260, sm: 280, md: 220 },
              borderRadius: '18px',
              bgcolor: tokens.colors.background.elevated,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AssetImage
                src={entity?.image || entity?.sprites?.[0] || ''}
                alt={characterInfo.name}
                category="factions"
                width={110}
                height={110}
                fallback="placeholder"
                sx={{ objectFit: 'contain' }}
              />
            </Box>
          ) : (
            <Box sx={{
              width: '100%',
              height: { xs: 260, sm: 280, md: 220 },
              borderRadius: '18px',
              bgcolor: tokens.colors.background.elevated,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <AssetImage
                src={entity?.portrait || entity?.sprites?.[0] || entity?.image || ''}
                alt={characterInfo.name}
                category={category as 'enemies' | 'travelers' | 'wanderers' | 'pantheon'}
                width="100%"
                height="100%"
                fallback="placeholder"
                sx={{ objectFit: 'cover' }}
              />
            </Box>
          )}
          <Chip
            label={characterInfo.rarity}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: getRarityColor(characterInfo.rarity),
              color: tokens.colors.background.default,
              fontWeight: 600,
            }}
          />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {characterInfo.name}
        </Typography>
        <DataBadge label={characterInfo.type} color="primary" variant="filled" />

        {/* Sprites Gallery */}
        {(travelerData?.sprites || pantheonData?.sprites) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(travelerData?.sprites || pantheonData?.sprites || []).map((sprite, i) => (
              <Box
                key={i}
                sx={{
                  transition: 'transform 150ms ease',
                  '&:hover': {
                    transform: 'scale(1.4)',
                    zIndex: 10,
                  },
                }}
              >
                <AssetImage
                  src={sprite}
                  alt={`${characterInfo.name} sprite ${i + 1}`}
                  category={category as 'travelers' | 'pantheon'}
                  width={40}
                  height={40}
                  fallback="placeholder"
                  sx={{ objectFit: 'contain', filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))' }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Character Stats - Different for each character type */}
      <Paper
        sx={{
          mt: 2,
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: '30px',
          overflow: 'hidden',
        }}
      >
        <CardHeader
          title={characterType === 'traveler' ? 'Profile' :
                 characterType === 'wanderer' ? 'Info' :
                 characterType === 'pantheon' ? 'Divine Info' :
                 characterType === 'faction' ? 'Faction Info' : 'Quick Stats'}
        />
        <Box sx={{ p: 2 }}>
          {characterType === 'traveler' && travelerInfo ? (
            // Traveler info
            <>
              {[
                { icon: OriginIcon, label: 'Origin', value: travelerInfo.origin },
                { icon: PlayStyleIcon, label: 'Play Style', value: travelerInfo.playStyle },
                { icon: DiceIcon, label: 'Lucky Number', value: travelerData?.luckyNumber === 7 ? 'ALL' : String(travelerData?.luckyNumber || '-') },
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
            </>
          ) : characterType === 'wanderer' && wandererInfo ? (
            // Wanderer info
            <>
              {[
                { icon: ServicesIcon, label: 'Role', value: wandererInfo.role },
                { icon: OriginIcon, label: 'Origin', value: wandererInfo.origin },
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
            </>
          ) : characterType === 'pantheon' && pantheonInfo ? (
            // Pantheon info
            <>
              {[
                { icon: LocationIcon, label: 'Domain', value: slugToName(pantheonInfo.domain) },
                { icon: FavorIcon, label: 'Element', value: pantheonInfo.element },
                { icon: DiceIcon, label: 'Door', value: pantheonInfo.door ? `Door ${pantheonInfo.door}` : 'None' },
                { icon: DiceIcon, label: 'Lucky Number', value: pantheonData?.luckyNumber === 7 ? 'ALL' : String(pantheonData?.luckyNumber || '-') },
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
            </>
          ) : characterType === 'faction' && factionInfo ? (
            // Faction info
            <>
              {[
                { icon: FavorIcon, label: 'Element', value: factionInfo.element },
                { icon: LocationIcon, label: 'Home Base', value: factionInfo.homeBase ? slugToName(factionInfo.homeBase) : 'Various' },
                { icon: DiceIcon, label: 'Lucky Number', value: factionData?.luckyNumber === 7 ? 'ALL' : String(factionData?.luckyNumber ?? '-') },
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
            </>
          ) : (
            // Enemy info
            <>
              {[
                { icon: HealthIcon, label: 'Health', value: characterInfo.health },
                { icon: LevelIcon, label: 'Level', value: characterInfo.level },
                { icon: DefenseIcon, label: 'Defense', value: characterInfo.defense },
                { icon: WeaknessIcon, label: 'Weakness', value: characterInfo.weakness },
                { icon: ResistIcon, label: 'Resistance', value: characterInfo.resistance },
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
            </>
          )}
        </Box>
      </Paper>

    </Box>
  );

  // Get category from entity or URL param
  const entityCategory = (entity?.category || category || 'enemies') as WikiCategory;

  // Build dynamic sections based on entity type and available data
  const sections = getCharacterSections(
    characterType,
    hasPhases,
    hasDrops,
    hasLocations,
    hasLoadout,
    hasFavorEffects,
  );

  return (
    <WikiLayout
      infobox={infoboxContent}
      sections={sections}
      breadcrumbs={
        <WikiBreadcrumbs
          category={entityCategory}
          entityName={characterInfo.name}
        />
      }
      title={<PageHeader title={characterInfo.name} />}
    >



      {/* Faction Overview - for factions only */}
      {isFaction && factionInfo && (factionInfo.motto || factionInfo.founder || factionInfo.lore) && (
        <WikiSectionAnchor id={toAnchorId('Overview')}>
          <Paper
            sx={{
              mb: 4,
              backgroundColor: tokens.colors.background.paper,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: '30px',
              overflow: 'hidden',
            }}
          >
            <CardHeader title="Overview" />
            <Box sx={{ p: 3 }}>
              {factionInfo.motto && (
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: tokens.fonts.gaming,
                    color: tokens.colors.text.secondary,
                    mb: factionInfo.founder || factionInfo.lore ? 3 : 0,
                    textAlign: 'center',
                    fontSize: '1.75rem',
                  }}
                >
                  "{displayedMotto}"
                </Typography>
              )}
              {factionInfo.founder && (
                <Box sx={{ mb: factionInfo.lore ? 2 : 0 }}>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Founded by</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    <WikiLink slug={factionInfo.founder} />
                  </Typography>
                </Box>
              )}
              {factionInfo.lore && (
                <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                  {factionInfo.lore}
                </Typography>
              )}
            </Box>
          </Paper>
        </WikiSectionAnchor>
      )}

      {/* Faction Members - for factions only */}
      {isFaction && factionInfo && factionInfo.members.length > 0 && (
        <WikiSectionAnchor id={toAnchorId('Members')}>
          <SectionHeader title="Members" sx={{ mb: 2 }} />
          <BaseCard padding={0} sx={{ mb: 4 }}>
            {factionInfo.members.map((memberSlug, i) => {
              const memberEntity = getEntity(memberSlug);
              return (
                <Box
                  key={memberSlug}
                  onClick={() => navigate(`/wiki/${memberEntity?.category || 'travelers'}/${memberSlug}`)}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                    borderBottom: i < factionInfo.members.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                    '&:hover': { bgcolor: tokens.colors.background.elevated },
                    '&:first-of-type': { borderTopLeftRadius: '29px', borderTopRightRadius: '29px' },
                    '&:last-of-type': { borderBottomLeftRadius: '29px', borderBottomRightRadius: '29px' },
                  }}
                >
                  <AssetImage
                    src={memberEntity?.portrait || memberEntity?.sprites?.[0] || memberEntity?.image || ''}
                    alt={memberEntity?.name || slugToName(memberSlug)}
                    category={memberEntity?.category as 'travelers' | 'wanderers' | 'pantheon'}
                    width={40}
                    height={40}
                    fallback="placeholder"
                    sx={{ borderRadius: '50%', flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <WikiLink slug={memberSlug} />
                  </Box>
                  <ArrowIcon sx={{ color: tokens.colors.text.disabled, fontSize: 18 }} />
                </Box>
              );
            })}
          </BaseCard>
        </WikiSectionAnchor>
      )}

      {/* Faction Alliances - for factions only */}
      {isFaction && factionInfo && (factionInfo.allies.length > 0 || factionInfo.rivals.length > 0) && (
        <WikiSectionAnchor id={toAnchorId('Alliances')}>
          <SectionHeader title="Alliances" sx={{ mb: 2 }} />
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {factionInfo.allies.length > 0 && (
              <Grid size={{ xs: 12, md: 6 }}>
                <BaseCard>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: tokens.colors.success }}>Allies</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {factionInfo.allies.map((allySlug) => (
                      <WikiLink key={allySlug} slug={allySlug} variant="chip" category="factions" />
                    ))}
                  </Box>
                </BaseCard>
              </Grid>
            )}
            {factionInfo.rivals.length > 0 && (
              <Grid size={{ xs: 12, md: 6 }}>
                <BaseCard>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: tokens.colors.error }}>Rivals</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {factionInfo.rivals.map((rivalSlug) => (
                      <WikiLink key={rivalSlug} slug={rivalSlug} variant="chip" category="factions" />
                    ))}
                  </Box>
                </BaseCard>
              </Grid>
            )}
          </Grid>
        </WikiSectionAnchor>
      )}

      {/* Faction Bonuses - for factions only */}
      {isFaction && factionInfo && factionInfo.bonuses.length > 0 && (
        <WikiSectionAnchor id={toAnchorId('Faction Bonuses')}>
          <SectionHeader title="Faction Bonuses" sx={{ mb: 2 }} />
          <BaseCard sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {factionInfo.bonuses.map((bonus, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <FavorIcon sx={{ color: tokens.colors.success, fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: tokens.colors.text.primary }}>
                    {bonus}
                  </Typography>
                </Box>
              ))}
            </Box>
          </BaseCard>
        </WikiSectionAnchor>
      )}

      {/* Combat Overview - for enemies only */}
      {!isTraveler && !isWanderer && !isPantheon && !isFaction && (
        <WikiSectionAnchor id={toAnchorId('Combat Overview')}>
          <Paper
            sx={{
              mb: 4,
              backgroundColor: tokens.colors.background.paper,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: '30px',
              overflow: 'hidden',
            }}
          >
            <CardHeader title="Combat Overview" />
            <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Health Bar */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <HealthIcon sx={{ color: tokens.colors.text.secondary }} />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Health</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{characterInfo.health}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: tokens.colors.background.elevated,
                        '& .MuiLinearProgress-bar': { bgcolor: tokens.colors.text.secondary },
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <DefenseIcon sx={{ color: tokens.colors.text.secondary }} />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Defense</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{characterInfo.defense}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={75}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: tokens.colors.background.elevated,
                        '& .MuiLinearProgress-bar': { bgcolor: tokens.colors.text.secondary },
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
              {/* Weakness/Resistance */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: tokens.colors.background.elevated,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Weakness</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {characterInfo.weakness}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                      +50% damage
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: tokens.colors.background.elevated,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Resistance</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {characterInfo.resistance}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                      -50% damage
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            </Box>
          </Paper>
        </WikiSectionAnchor>
      )}

      {/* Base Stats - for travelers and pantheon */}
      {(isTraveler || isPantheon) && baseStats && (
        <WikiSectionAnchor id={toAnchorId('Base Stats')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SectionHeader title="Base Stats" sx={{ mb: 0 }} />
            <Tooltip
              title="All characters in NEVER DIE GUY are eternal, but stats give insight into their personalities and how they approach challenges. Use these to understand combat synergies and team composition."
              placement="top"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: '#1a1a1a',
                    border: `1px solid ${tokens.colors.border}`,
                    fontSize: '0.8rem',
                    maxWidth: 280,
                    p: 1.5,
                  },
                },
                arrow: { sx: { color: '#1a1a1a' } },
              }}
            >
              <InfoIcon sx={{ fontSize: 18, color: tokens.colors.text.disabled, cursor: 'help' }} />
            </Tooltip>
          </Box>
          <BaseCard sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(baseStats).map(([stat, value]) => {
                const mutedBar = tokens.colors.text.disabled;
                const statConfig: Record<string, { label: string; color: string; tooltip: string }> = {
                  luck: { label: 'Luck', color: mutedBar, tooltip: 'Favorable RNG and bonus rolls' },
                  essence: { label: 'Essence', color: mutedBar, tooltip: 'Vitality and life force' },
                  grit: { label: 'Grit', color: mutedBar, tooltip: 'Mental fortitude' },
                  shadow: { label: 'Shadow', color: mutedBar, tooltip: 'Stealth and evasion' },
                  fury: { label: 'Fury', color: mutedBar, tooltip: 'Raw offensive power' },
                  resilience: { label: 'Resilience', color: mutedBar, tooltip: 'Damage reduction' },
                  swiftness: { label: 'Swiftness', color: mutedBar, tooltip: 'Speed and agility' },
                };
                const config = statConfig[stat] || { label: stat, color: mutedBar, tooltip: '' };
                const numValue = typeof value === 'number' ? value : 0;
                return (
                  <Tooltip key={stat} title={config.tooltip} placement="top" arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'help' }}>
                      <Typography
                        variant="body2"
                        sx={{ width: 80, flexShrink: 0, color: tokens.colors.text.secondary, fontWeight: 500 }}
                      >
                        {config.label}
                      </Typography>
                      <Box sx={{ flex: 1, position: 'relative' }}>
                        <LinearProgress
                          variant="determinate"
                          value={numValue}
                          sx={{
                            height: 20,
                            borderRadius: 1,
                            bgcolor: tokens.colors.background.elevated,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: config.color,
                              borderRadius: 1,
                            },
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            position: 'absolute',
                            left: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontWeight: 600,
                            color: numValue > 15 ? '#000' : tokens.colors.text.primary,
                            textShadow: numValue > 15 ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </BaseCard>
        </WikiSectionAnchor>
      )}

      {/* Affiliations - for travelers, wanderers, and pantheon (no main header, implied) */}
      {!isEnemy && !isFaction && hasAffiliations && (
        <WikiSectionAnchor id={toAnchorId('Affiliations')}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
            {/* Faction Membership */}
            {factionMemberships.length > 0 && (
              <BaseCard>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: tokens.colors.text.disabled, fontWeight: 500 }}>
                    Faction
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {factionMemberships.map((faction) => (
                    <WikiLink key={faction.slug} slug={faction.slug} variant="chip" category="factions" />
                  ))}
                </Box>
              </BaseCard>
            )}

            {/* Domain Control (Pantheon only) */}
            {controlledDomain && (
              <BaseCard>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: tokens.colors.text.disabled, fontWeight: 500 }}>
                    Controls
                  </Typography>
                </Box>
                <WikiLink slug={controlledDomain.slug} variant="chip" category="domains" />
              </BaseCard>
            )}

            {/* Wanderer Locations - own container, no icon */}
            {wandererDomains.length > 0 && (
              <BaseCard>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: tokens.colors.text.disabled, fontWeight: 500 }}>
                    Appears In
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {wandererDomains.map((domain) => (
                    <WikiLink key={domain.slug} slug={domain.slug} variant="chip" category="domains" />
                  ))}
                </Box>
              </BaseCard>
            )}

            {/* Related Characters - own container, no icon, use portraits */}
            {relatedCharacters.length > 0 && (
              <BaseCard>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: tokens.colors.text.disabled, fontWeight: 500 }}>
                    Related Characters
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {relatedCharacters.slice(0, 8).map((char) => (
                    <Tooltip key={char.slug} title={char.name} placement="top" arrow>
                      <Box
                        onClick={() => navigate(`/wiki/${char.category}/${char.slug}`)}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 0.5,
                          cursor: 'pointer',
                          transition: 'transform 150ms ease',
                          '&:hover': { transform: 'scale(1.05)' },
                        }}
                      >
                        <AssetImage
                          src={char.portrait || char.image || char.sprites?.[0] || ''}
                          alt={char.name}
                          category={char.category as 'travelers' | 'wanderers' | 'pantheon'}
                          width={64}
                          height={64}
                          fallback="placeholder"
                          sx={{ borderRadius: '12px', border: `2px solid ${tokens.colors.border}` }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: tokens.colors.text.secondary,
                            maxWidth: 70,
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {char.name}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </BaseCard>
            )}
          </Box>
        </WikiSectionAnchor>
      )}

      {/* Boss Phases - for enemies with phases only */}
      {!isTraveler && hasPhases && (
        <WikiSectionAnchor id={toAnchorId('Battle Phases')}>
          <SectionHeader title="Battle Phases" sx={{ mb: 2 }} />
          <BaseCard sx={{ mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              {phases.map((phase, i) => (
                <Box
                  key={phase.phase}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mb: i < phases.length - 1 ? 3 : 0,
                  }}
                >
                  {/* Phase number */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: tokens.colors.background.elevated,
                        border: `2px solid ${tokens.colors.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tokens.colors.text.secondary,
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}
                    >
                      {phase.phase}
                    </Box>
                    {i < phases.length - 1 && (
                      <Box
                        sx={{
                          width: 2,
                          flex: 1,
                          bgcolor: tokens.colors.border,
                          my: 1,
                        }}
                      />
                    )}
                  </Box>
                  {/* Phase content */}
                  <Box sx={{ flex: 1, pb: i < phases.length - 1 ? 2 : 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {phase.name}
                      </Typography>
                      <Chip
                        label={phase.health}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: tokens.colors.background.elevated,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                      {phase.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </BaseCard>
        </WikiSectionAnchor>
      )}


      {/* Favorite Items - for travelers only */}
      {isTraveler && hasLoadout && (
        <WikiSectionAnchor id={toAnchorId('Favorite Items')}>
          <SectionHeader title="Favorite Items" sx={{ mb: 2 }} />
          <BaseCard padding={0} sx={{ mb: 4 }}>
            {startingLoadout.map((itemSlug, i) => {
              const loadoutItem = getEntity(itemSlug) as Item | undefined;
              return (
              <Box
                key={itemSlug}
                onClick={() => navigate(`/wiki/items/${itemSlug}`)}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  borderBottom: i < startingLoadout.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                  '&:hover': { bgcolor: tokens.colors.background.elevated },
                  '&:first-of-type': { borderTopLeftRadius: '29px', borderTopRightRadius: '29px' },
                  '&:last-of-type': { borderBottomLeftRadius: '29px', borderBottomRightRadius: '29px' },
                }}
              >
                <AssetImage
                  src={loadoutItem?.image || loadoutItem?.sprites?.[0] || ''}
                  alt={loadoutItem?.name || slugToName(itemSlug)}
                  category="items"
                  width={40}
                  height={40}
                  fallback="placeholder"
                  sx={{ borderRadius: 0.5, flexShrink: 0, objectFit: 'contain' }}
                />
                <Box sx={{ flex: 1 }}>
                  <WikiLink slug={itemSlug} category="items" />
                </Box>
                <ArrowIcon sx={{ color: tokens.colors.text.disabled, fontSize: 18 }} />
              </Box>
              );
            })}
          </BaseCard>
        </WikiSectionAnchor>
      )}

      {/* Locations - for wanderers only */}
      {isWanderer && wandererLocations.length > 0 && (
        <WikiSectionAnchor id={toAnchorId('Locations')}>
          <SectionHeader title="Locations" sx={{ mb: 2 }} />
          <BaseCard padding={0} sx={{ mb: 4 }}>
            {wandererLocations.map((loc, i) => {
              const locEntity = getEntity(loc);
              const isDomainLoc = locEntity?.category === 'domains';
              const isShopLoc = locEntity?.category === 'shops';
              const domain = isDomainLoc ? (locEntity as Domain) : undefined;
              const shop = isShopLoc ? (locEntity as Shop) : undefined;
              const locImage = domain?.image || shop?.sprites?.[0] || shop?.portrait || '';
              const locCategory = isDomainLoc ? 'domains' : isShopLoc ? 'shops' : 'domains';
              return (
              <Box
                key={loc}
                onClick={() => navigate(`/wiki/${locCategory}/${loc}`)}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  borderBottom: i < wandererLocations.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                  '&:hover': { bgcolor: tokens.colors.background.elevated },
                  '&:first-of-type': { borderTopLeftRadius: '29px', borderTopRightRadius: '29px' },
                  '&:last-of-type': { borderBottomLeftRadius: '29px', borderBottomRightRadius: '29px' },
                }}
              >
                <AssetImage
                  src={locImage}
                  alt={locEntity?.name || slugToName(loc)}
                  category={locCategory}
                  width={48}
                  height={48}
                  fallback="placeholder"
                  sx={{ borderRadius: 1, flexShrink: 0 }}
                />
                <Box sx={{ flex: 1 }}>
                  <WikiLink slug={loc} category={locCategory} />
                </Box>
                <ArrowIcon sx={{ color: tokens.colors.text.disabled, fontSize: 18 }} />
              </Box>
              );
            })}
          </BaseCard>
        </WikiSectionAnchor>
      )}


      {/* Favorite Items - for enemies only */}
      {!isTraveler && !isWanderer && !isPantheon && !isFaction && hasDrops && (
        <WikiSectionAnchor id={toAnchorId('Favorite Items')}>
          <SectionHeader title="Favorite Items" sx={{ mb: 2 }} />
          <BaseCard sx={{ mb: 4 }}>
            {drops.map((drop, i) => (
              <Box
                key={drop.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.5,
                  borderBottom: i < drops.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                }}
              >
                <AssetImage
                  src={drop.image}
                  alt={drop.name}
                  category="items"
                  width={36}
                  height={36}
                  fallback="placeholder"
                  sx={{ borderRadius: 0.5, flexShrink: 0, objectFit: 'contain' }}
                />
                <Box sx={{ flex: 1 }}>
                  {drop.slug ? (
                    <WikiLink slug={drop.slug} category="items" />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{drop.name}</Typography>
                  )}
                  <Typography variant="caption" sx={{ color: getRarityColor(drop.rarity), display: 'block' }}>
                    {drop.rarity}
                  </Typography>
                </Box>
                <Box sx={{ width: 120 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Drop Rate</Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.success }}>{drop.rate}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={drop.rate}
                    sx={{
                      height: 4,
                      borderRadius: 1,
                      bgcolor: tokens.colors.background.elevated,
                      '& .MuiLinearProgress-bar': { bgcolor: getRarityColor(drop.rarity) },
                    }}
                  />
                </Box>
              </Box>
            ))}
          </BaseCard>
        </WikiSectionAnchor>
      )}

      {/* Strategy Guide - placeholder section hidden until real data available */}

      {/* Encountered In - for enemies only */}
      {!isTraveler && !isWanderer && !isPantheon && !isFaction && hasLocations && (
        <WikiSectionAnchor id={toAnchorId('Encountered In')}>
          <SectionHeader title="Encountered In" sx={{ mb: 2 }} />
          <BaseCard padding={0} sx={{ mb: 4 }}>
            {locations.map((loc, i) => (
              <Box
                key={loc.name}
                onClick={() => loc.slug && navigate(`/wiki/domains/${loc.slug}`)}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: loc.slug ? 'pointer' : 'default',
                  borderBottom: i < locations.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                  '&:hover': loc.slug ? { bgcolor: tokens.colors.background.elevated } : {},
                  '&:first-of-type': { borderTopLeftRadius: '29px', borderTopRightRadius: '29px' },
                  '&:last-of-type': { borderBottomLeftRadius: '29px', borderBottomRightRadius: '29px' },
                }}
              >
                <AssetImage
                  src={loc.image}
                  alt={loc.name}
                  category="domains"
                  width={48}
                  height={48}
                  fallback="placeholder"
                  sx={{ borderRadius: 1, flexShrink: 0 }}
                />
                <Box sx={{ flex: 1 }}>
                  {loc.slug ? (
                    <WikiLink slug={loc.slug} category="domains" />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{loc.name}</Typography>
                  )}
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, display: 'block' }}>
                    {loc.type} Location - Lv. {loc.level}
                  </Typography>
                </Box>
                {loc.slug && <ArrowIcon sx={{ color: tokens.colors.text.disabled, fontSize: 18 }} />}
              </Box>
            ))}
          </BaseCard>
        </WikiSectionAnchor>
      )}

    </WikiLayout>
  );
}
