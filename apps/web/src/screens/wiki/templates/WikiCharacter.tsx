import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Grid,
  Tooltip,
  Modal,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
      sections.push({ name: 'Overview' });
      sections.push({ name: 'Base Stats' });
      sections.push({ name: 'Abilities' });
      if (hasLoadout) sections.push({ name: 'Starting Loadout' });
      break;

    case 'wanderer':
      sections.push({ name: 'Overview' });
      if (hasLocations) sections.push({ name: 'Locations' });
      break;

    case 'pantheon':
      sections.push({ name: 'Overview' });
      sections.push({ name: 'Base Stats' });
      if (hasFavorEffects) sections.push({ name: 'Divine Favor' });
      sections.push({ name: 'Corruption Effects' });
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
      sections.push({ name: 'Abilities & Attacks' });
      if (hasDrops) sections.push({ name: 'Drops & Rewards' });
      sections.push({ name: 'Strategy Guide' });
      if (hasLocations) sections.push({ name: 'Encountered In' });
      break;
  }

  return sections;
};

export function WikiCharacter({ entity }: WikiCharacterProps) {
  const { category } = useParams();
  const navigate = useNavigate();

  // Sprite zoom modal state
  const [zoomedSprite, setZoomedSprite] = useState<string | null>(null);

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
    health: enemyData?.hp?.toString() || '-',
    level: '-',
    type: enemyData?.enemyType || travelerData?.availability || wandererData?.role || pantheonData?.role || entity.rarity || 'Unknown',
    location: enemyData?.domain ? slugToName(enemyData.domain) : '-',
    weakness: enemyData?.weaknesses?.[0] || '-',
    resistance: enemyData?.resistances?.[0] || '-',
    defense: enemyData?.defense?.toString() || '-',
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
      image: item?.image || '',
    };
  }) || [];

  const locations = enemyData?.locations?.map(loc => {
    const domain = getEntity(loc) as Domain | undefined;
    return {
      slug: loc,
      name: domain?.name || slugToName(loc),
      type: 'Location',
      level: domain?.levelRange || '-',
      image: domain?.image || '',
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
              height: 220,
              borderRadius: '18px',
              bgcolor: tokens.colors.background.elevated,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AssetImage
                src={entity?.image || ''}
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
              height: 220,
              borderRadius: '18px',
              bgcolor: tokens.colors.background.elevated,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <AssetImage
                src={entity?.portrait || entity?.image || ''}
                alt={characterInfo.name}
                category={category as 'enemies' | 'travelers' | 'wanderers' | 'pantheon'}
                width="100%"
                height={220}
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
              <Tooltip key={i} title="Click to enlarge" placement="top" arrow>
                <Box
                  onClick={() => setZoomedSprite(sprite)}
                  sx={{
                    cursor: 'zoom-in',
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
              </Tooltip>
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
                { icon: DiceIcon, label: 'Lucky Die', value: travelerData?.luckyDie?.toUpperCase() || 'None' },
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
                { icon: DiceIcon, label: 'Lucky Die', value: pantheonData?.luckyDie?.toUpperCase() || 'None' },
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
                { icon: DiceIcon, label: 'Lucky Die', value: entity?.luckyDie?.toUpperCase() || 'None' },
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

      {/* Affiliations - Show relationships at a glance */}
      {!isEnemy && hasAffiliations && (
        <Paper
          sx={{
            mt: 2,
            backgroundColor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: '30px',
            overflow: 'hidden',
          }}
        >
          <CardHeader title="Affiliations" />
          <Box sx={{ p: 2 }}>
            {/* Faction Membership */}
            {factionMemberships.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <FactionIcon sx={{ fontSize: 16, color: tokens.colors.text.disabled }} />
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                    Faction
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {factionMemberships.map((faction) => (
                    <WikiLink key={faction.slug} slug={faction.slug} variant="chip" category="factions" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Domain Control (Pantheon only) */}
            {controlledDomain && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationIcon sx={{ fontSize: 16, color: tokens.colors.text.disabled }} />
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                    Controls
                  </Typography>
                </Box>
                <WikiLink slug={controlledDomain.slug} variant="chip" category="domains" />
              </Box>
            )}

            {/* Wanderer Locations */}
            {wandererDomains.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationIcon sx={{ fontSize: 16, color: tokens.colors.text.disabled }} />
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                    Appears In
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {wandererDomains.map((domain) => (
                    <WikiLink key={domain.slug} slug={domain.slug} variant="chip" category="domains" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Related Characters */}
            {relatedCharacters.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AllyIcon sx={{ fontSize: 16, color: tokens.colors.text.disabled }} />
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                    Related
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {relatedCharacters.slice(0, 6).map((char) => (
                    <Tooltip key={char.slug} title={char.name} placement="top" arrow>
                      <Box
                        onClick={() => navigate(`/wiki/${char.category}/${char.slug}`)}
                        sx={{
                          cursor: 'pointer',
                          transition: 'transform 150ms ease',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      >
                        <AssetImage
                          src={char.portrait || char.image || ''}
                          alt={char.name}
                          category={char.category as 'travelers' | 'wanderers' | 'pantheon'}
                          width={32}
                          height={32}
                          fallback="placeholder"
                          sx={{ borderRadius: '50%', border: `2px solid ${tokens.colors.border}` }}
                        />
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      )}

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
    >
      <PageHeader
        title={characterInfo.name}
      />

      {/* Traveler Overview - for travelers only */}
      {isTraveler && travelerInfo && (
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
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Origin</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{travelerInfo.origin}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Play Style</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{travelerInfo.playStyle}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: tokens.colors.background.elevated,
                    borderRadius: 1,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Lucky Die</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: tokens.fonts.gaming }}>
                    {travelerData?.luckyDie?.toUpperCase() || 'None'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                    {travelerData?.luckyDie === 'all' ? 'All dice affinity' : travelerData?.luckyDie ? `${travelerData.luckyDie.toUpperCase()} affinity` : 'No affinity'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            </Box>
          </Paper>
        </WikiSectionAnchor>
      )}

      {/* Wanderer Overview - for wanderers only */}
      {isWanderer && wandererInfo && (
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
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Role</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{wandererInfo.role}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Origin</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{wandererInfo.origin}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {hasServices && (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: tokens.colors.background.elevated,
                      borderRadius: 1,
                      textAlign: 'center',
                    }}
                  >
                    <ServicesIcon sx={{ fontSize: 32, color: tokens.colors.text.secondary, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: tokens.fonts.gaming }}>
                      {services.length}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                      Available {services.length === 1 ? 'Service' : 'Services'}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
            </Box>
          </Paper>
        </WikiSectionAnchor>
      )}

      {/* Pantheon Overview - for pantheon only */}
      {isPantheon && pantheonInfo && (
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
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Role</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{pantheonInfo.role}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Domain</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{slugToName(pantheonInfo.domain)}</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Element</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{pantheonInfo.element}</Typography>
                  </Box>
                  {pantheonInfo.door && (
                    <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
                      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Door</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Door {pantheonInfo.door}</Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: tokens.colors.background.elevated,
                    borderRadius: 1,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Lucky Die</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: tokens.fonts.gaming }}>
                    {pantheonData?.luckyDie?.toUpperCase() || 'None'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                    {pantheonData?.luckyDie === 'all' ? 'All dice affinity' : pantheonData?.luckyDie ? `${pantheonData.luckyDie.toUpperCase()} affinity` : 'No affinity'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            </Box>
          </Paper>
        </WikiSectionAnchor>
      )}

      {/* Faction Overview - for factions only */}
      {isFaction && factionInfo && (
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
                  variant="h6"
                  sx={{
                    fontStyle: 'italic',
                    color: tokens.colors.text.secondary,
                    mb: 3,
                    textAlign: 'center',
                  }}
                >
                  "{factionInfo.motto}"
                </Typography>
              )}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
                      <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Element</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{factionInfo.element}</Typography>
                    </Box>
                    {factionInfo.homeBase && (
                      <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
                        <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Home Base</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          <WikiLink slug={factionInfo.homeBase} category="domains" />
                        </Typography>
                      </Box>
                    )}
                    {factionInfo.founder && (
                      <Box sx={{ flex: '1 1 45%', minWidth: 120 }}>
                        <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Founder</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          <WikiLink slug={factionInfo.founder} />
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: tokens.colors.background.elevated,
                      borderRadius: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Lucky Die</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, fontFamily: tokens.fonts.gaming }}>
                      {entity?.luckyDie?.toUpperCase() || 'None'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                      {entity?.luckyDie === 'all' ? 'All dice affinity' : entity?.luckyDie ? `${entity.luckyDie.toUpperCase()} affinity` : 'No affinity'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              {factionInfo.lore && (
                <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mt: 3 }}>
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
                    src={memberEntity?.image || ''}
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
          <SectionHeader title="Faction Bonuses" icon={<FavorIcon />} sx={{ mb: 2 }} />
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
          <SectionHeader title="Base Stats" sx={{ mb: 2 }} />
          <BaseCard sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              {Object.entries(baseStats).map(([stat, value]) => {
                const statConfig: Record<string, { label: string; icon: string; color: string; tooltip: string }> = {
                  luck: {
                    label: 'Luck',
                    icon: '/icons/stat-luck.svg',
                    color: '#FFD700',
                    tooltip: 'Affects critical hit chance, rare drops, and bonus roll opportunities. Higher luck means more favorable RNG.',
                  },
                  essence: {
                    label: 'Essence',
                    icon: '/icons/stat-essence.svg',
                    color: '#FF1744',
                    tooltip: 'Core vitality and life force. Determines max health pool and recovery rate between encounters.',
                  },
                  grit: {
                    label: 'Grit',
                    icon: '/icons/stat-grit.svg',
                    color: '#FFA726',
                    tooltip: 'Mental fortitude and determination. Reduces damage from consecutive hits and improves comeback mechanics.',
                  },
                  shadow: {
                    label: 'Shadow',
                    icon: '/icons/stat-shadow.svg',
                    color: '#7C4DFF',
                    tooltip: 'Stealth and evasion capability. Higher shadow increases dodge chance and sneak attack damage.',
                  },
                  fury: {
                    label: 'Fury',
                    icon: '/icons/stat-fury.svg',
                    color: '#4CAF50',
                    tooltip: 'Raw offensive power. Directly multiplies damage output and affects dice roll bonuses.',
                  },
                  resilience: {
                    label: 'Resilience',
                    icon: '/icons/stat-resilience.svg',
                    color: '#00E5FF',
                    tooltip: 'Defensive capability and damage reduction. Higher resilience means less damage taken per hit.',
                  },
                  swiftness: {
                    label: 'Swiftness',
                    icon: '/icons/stat-swiftness.svg',
                    color: '#FFEB3B',
                    tooltip: 'Speed and agility. Affects turn order, action economy, and chance to act first in combat.',
                  },
                };
                const config = statConfig[stat] || { label: stat, icon: '', color: tokens.colors.text.secondary, tooltip: '' };
                return (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={stat}>
                    <Tooltip
                      title={config.tooltip}
                      placement="top"
                      arrow
                      slotProps={{
                        tooltip: {
                          sx: {
                            bgcolor: '#1a1a1a',
                            border: `1px solid ${tokens.colors.border}`,
                            fontSize: '0.8rem',
                            maxWidth: 220,
                            p: 1.5,
                          },
                        },
                        arrow: {
                          sx: { color: '#1a1a1a' },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: tokens.colors.background.elevated,
                          borderRadius: 1,
                          textAlign: 'center',
                          cursor: 'help',
                          transition: 'transform 150ms ease, box-shadow 150ms ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${config.color}33`,
                          },
                        }}
                      >
                        {config.icon && (
                          <Box
                            component="img"
                            src={config.icon}
                            alt={config.label}
                            sx={{
                              width: 24,
                              height: 24,
                              mb: 1,
                              filter: 'brightness(0) invert(1)',
                              opacity: 0.8,
                            }}
                          />
                        )}
                        <Typography variant="h5" sx={{ fontWeight: 600, fontFamily: tokens.fonts.gaming, color: config.color }}>
                          {value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                          {config.label}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={typeof value === 'number' ? value : 0}
                          sx={{
                            mt: 1,
                            height: 4,
                            borderRadius: 1,
                            bgcolor: tokens.colors.background.paper,
                            '& .MuiLinearProgress-bar': { bgcolor: config.color },
                          }}
                        />
                      </Box>
                    </Tooltip>
                  </Grid>
                );
              })}
            </Grid>
          </BaseCard>
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

      {/* Abilities - for travelers and enemies only */}
      {(isTraveler || (!isWanderer && !isPantheon && !isFaction)) && (
      <WikiSectionAnchor id={toAnchorId(isTraveler ? 'Abilities' : 'Abilities & Attacks')}>
        <SectionHeader title={isTraveler ? 'Abilities' : 'Abilities & Attacks'} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {abilities.map((ability) => (
            <BaseCard key={ability.name}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {ability.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                    {ability.description}
                  </Typography>
                </Box>
                <Chip
                  label={ability.type}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: tokens.colors.border,
                    color: tokens.colors.text.secondary,
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Damage</Typography>
                  <Typography variant="body2" sx={{ color: ability.damage === '-' ? tokens.colors.text.disabled : tokens.colors.text.primary, fontWeight: 500 }}>
                    {ability.damage}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Cooldown</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{ability.cooldown}</Typography>
                </Box>
              </Box>
            </BaseCard>
          ))}
        </Box>
      </WikiSectionAnchor>
      )}

      {/* Starting Loadout - for travelers only */}
      {isTraveler && hasLoadout && (
        <WikiSectionAnchor id={toAnchorId('Starting Loadout')}>
          <SectionHeader title="Starting Loadout" icon={<LoadoutIcon />} sx={{ mb: 2 }} />
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
                  src={loadoutItem?.image || ''}
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
          <SectionHeader title="Locations" icon={<LocationIcon />} sx={{ mb: 2 }} />
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

      {/* Divine Favor - for pantheon only */}
      {isPantheon && hasFavorEffects && (
        <WikiSectionAnchor id={toAnchorId('Divine Favor')}>
          <SectionHeader title="Divine Favor" icon={<FavorIcon />} sx={{ mb: 2 }} />
          <BaseCard sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {favorEffects.map((favor, i) => (
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
                    {favor.effect}
                  </Typography>
                </Box>
              ))}
            </Box>
          </BaseCard>
        </WikiSectionAnchor>
      )}

      {/* Corruption Effects - for pantheon only */}
      {isPantheon && corruptionEffects.length > 0 && (
        <WikiSectionAnchor id={toAnchorId('Corruption Effects')}>
          <SectionHeader title="Corruption Effects" icon={<CorruptionIcon />} sx={{ mb: 2 }} />
          <BaseCard sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {corruptionEffects.map((effect, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <CorruptionIcon sx={{ color: tokens.colors.error, fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: tokens.colors.text.primary }}>
                    {effect}
                  </Typography>
                </Box>
              ))}
            </Box>
          </BaseCard>
        </WikiSectionAnchor>
      )}

      {/* Drops & Rewards - for enemies only */}
      {!isTraveler && !isWanderer && !isPantheon && !isFaction && hasDrops && (
        <WikiSectionAnchor id={toAnchorId('Drops & Rewards')}>
          <SectionHeader title="Drops & Rewards" sx={{ mb: 2 }} />
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
          <SectionHeader title="Encountered In" icon={<LocationIcon />} sx={{ mb: 2 }} />
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

      {/* Sprite Zoom Modal */}
      <Modal
        open={!!zoomedSprite}
        onClose={() => setZoomedSprite(null)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          onClick={() => setZoomedSprite(null)}
          sx={{
            position: 'relative',
            outline: 'none',
            cursor: 'zoom-out',
          }}
        >
          <IconButton
            onClick={() => setZoomedSprite(null)}
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              color: tokens.colors.text.primary,
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <CloseIcon />
          </IconButton>
          {zoomedSprite && (
            <Box
              component="img"
              src={zoomedSprite}
              alt="Zoomed sprite"
              sx={{
                maxWidth: '80vw',
                maxHeight: '80vh',
                width: 'auto',
                height: 'auto',
                minWidth: 200,
                minHeight: 200,
                objectFit: 'contain',
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))',
              }}
            />
          )}
        </Box>
      </Modal>

    </WikiLayout>
  );
}
