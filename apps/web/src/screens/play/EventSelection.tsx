import { useMemo } from 'react';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import {
  WorkspacePremiumSharp as TrophyIcon,
  MeetingRoomSharp as DoorIcon,
  LocalFireDepartmentSharp as FireIcon,
  DiamondSharp as DiamondIcon,
  AttachMoneySharp as MoneyIcon,
  StorageSharp as DataIcon,
  WarningAmberSharp as WarningIcon,
  AutoAwesomeSharp as SparkleIcon,
  GavelSharp as AuditIcon,
  EditSharp as PencilIcon,
} from '@mui/icons-material';
import { tokens, PROMISE_CONFIGS, DOOR_CONFIGS } from '../../theme';
import {
  DOMAINS,
  getEventScoreGoal,
  formatRewardTier,
  type EventConfig,
} from '../../games/meteor/gameConfig';
import { createSeededRng, getAvailableDoors, type DoorPreview, type DoorPromise } from '../../data/pools';

const gamingFont = { fontFamily: tokens.fonts.gaming };

// Promise type icons (colors from PROMISE_CONFIGS in theme)
const PROMISE_ICONS: Record<string, React.ReactNode> = {
  '+Credits': <MoneyIcon sx={{ fontSize: 12 }} />,
  '+Data': <DataIcon sx={{ fontSize: 12 }} />,
  'Rare Issuance': <DiamondIcon sx={{ fontSize: 12 }} />,
  'Anomaly Chance': <SparkleIcon sx={{ fontSize: 12 }} />,
  'Wanderer Bias': <SparkleIcon sx={{ fontSize: 12 }} />,
  'Heat Spike': <FireIcon sx={{ fontSize: 12 }} />,
  'Override': <WarningIcon sx={{ fontSize: 12 }} />,
};

// Door type icons (colors from DOOR_CONFIGS in theme)
const DOOR_ICONS: Record<string, React.ReactNode> = {
  stable: <DoorIcon />,
  elite: <TrophyIcon />,
  anomaly: <SparkleIcon />,
  audit: <AuditIcon />,
};

// Door Card Component
interface DoorCardProps {
  door: DoorPreview;
  onSelect: () => void;
}

function DoorCard({ door, onSelect }: DoorCardProps) {
  const doorConfig = DOOR_CONFIGS[door.doorType];
  const doorIcon = DOOR_ICONS[door.doorType];
  const difficultyStars = '|'.repeat(door.difficulty);

  return (
    <Paper
      onClick={onSelect}
      sx={{
        flex: 1,
        minWidth: 180,
        maxWidth: 220,
        bgcolor: tokens.colors.background.paper,
        border: `2px solid ${doorConfig.color}40`,
        borderRadius: 2,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: doorConfig.color,
          bgcolor: doorConfig.bgColor,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Door Icon */}
      <Box
        sx={{
          width: 64,
          height: 64,
          bgcolor: doorConfig.bgColor,
          border: `2px solid ${doorConfig.color}`,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.5,
          color: doorConfig.color,
          '& svg': { fontSize: 28 },
        }}
      >
        {doorIcon}
      </Box>

      {/* Door Label */}
      <Typography
        sx={{
          ...gamingFont,
          fontSize: '0.7rem',
          color: doorConfig.color,
          fontWeight: 700,
          mb: 0.5,
          textAlign: 'center',
        }}
      >
        {door.label}
      </Typography>

      {/* Difficulty */}
      <Typography
        sx={{
          fontSize: '0.6rem',
          color: tokens.colors.text.disabled,
          letterSpacing: '0.15em',
          mb: 1.5,
        }}
      >
        {difficultyStars}
      </Typography>

      {/* Promise Badges */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
        {door.promises.map((promise, i) => {
          const promiseConfig = PROMISE_CONFIGS[promise];
          const promiseIcon = PROMISE_ICONS[promise];
          return (
            <Chip
              key={i}
              icon={promiseIcon as React.ReactElement}
              label={promiseConfig.label}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.5rem',
                bgcolor: `${promiseConfig.color}15`,
                color: promiseConfig.color,
                border: `1px solid ${promiseConfig.color}40`,
                '& .MuiChip-icon': { color: promiseConfig.color, ml: 0.5 },
                '& .MuiChip-label': { px: 0.5 },
              }}
            />
          );
        })}
      </Box>

      {/* Enter Button */}
      <Button
        variant="contained"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        sx={{
          mt: 2,
          width: '100%',
          bgcolor: doorConfig.color,
          color: '#fff',
          ...gamingFont,
          fontSize: '0.65rem',
          py: 0.75,
          '&:hover': {
            bgcolor: doorConfig.color,
            filter: 'brightness(1.1)',
          },
        }}
      >
        Enter
      </Button>
    </Paper>
  );
}

interface EventCardProps {
  event: EventConfig;
  eventIndex: number;
  domainId: number;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  onBegin: () => void;
  onSkip: () => void;
}

function EventCard({
  event,
  eventIndex,
  domainId,
  isActive,
  isCompleted,
  isLocked,
  onBegin,
  onSkip,
}: EventCardProps) {
  const scoreGoal = getEventScoreGoal(domainId, eventIndex);
  const buttonLabels = ['Begin', 'Next Event', 'Last Event'];
  const buttonLabel = buttonLabels[eventIndex] || 'Begin';

  return (
    <Paper
      sx={{
        flex: 1,
        minWidth: 200,
        maxWidth: 280,
        bgcolor: tokens.colors.background.paper,
        border: `1px solid ${tokens.colors.border}`,
        borderRadius: 2,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: isLocked ? 0.6 : 1,
      }}
    >
      {/* Begin/Next/Last button */}
      <Button
        variant="contained"
        disabled={!isActive || isCompleted}
        onClick={onBegin}
        sx={{
          width: '100%',
          mb: 3,
          py: 1,
          bgcolor: isActive && !isCompleted ? '#c4a000' : tokens.colors.background.elevated,
          color: isActive && !isCompleted ? '#fff' : tokens.colors.text.disabled,
          ...gamingFont,
          fontSize: '1rem',
          '&:hover': {
            bgcolor: isActive && !isCompleted ? '#a08300' : tokens.colors.background.elevated,
          },
          '&.Mui-disabled': {
            bgcolor: tokens.colors.background.elevated,
            color: tokens.colors.text.disabled,
          },
        }}
      >
        {isCompleted ? 'Completed' : buttonLabel}
      </Button>

      {/* Badge */}
      <Box
        sx={{
          width: 80,
          height: 80,
          bgcolor: event.badgeColor,
          border: `3px solid ${event.badgeBorder}`,
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        <Typography
          sx={{
            ...gamingFont,
            fontSize: '0.95rem',
            color: event.badgeTextColor,
            fontWeight: 700,
          }}
        >
          {event.label}
        </Typography>
        <TrophyIcon sx={{ fontSize: 28, color: event.badgeTextColor }} />
      </Box>

      {/* Boss penalty */}
      {event.type === 'boss' && event.summonModifier !== 0 && (
        <Typography
          sx={{
            ...gamingFont,
            fontSize: '0.8rem',
            color: tokens.colors.text.primary,
            mb: 1,
          }}
        >
          {event.summonModifier > 0 ? '+' : ''}{event.summonModifier} Roll
        </Typography>
      )}

      {/* Score goal */}
      <Typography
        sx={{
          ...gamingFont,
          fontSize: '0.95rem',
          color: tokens.colors.text.secondary,
          mt: 2,
        }}
      >
        Score at least
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            bgcolor: tokens.colors.background.elevated,
            borderRadius: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrophyIcon sx={{ fontSize: 14, color: '#C4A000' }} />
        </Box>
        <Typography
          sx={{
            color: tokens.colors.error,
            fontWeight: 700,
            fontSize: '1.3rem',
            ...gamingFont,
            letterSpacing: '0.05em',
          }}
        >
          {scoreGoal.toString().padStart(5, '0')}
        </Typography>
      </Box>

      {/* Reward */}
      <Typography sx={{ ...gamingFont, fontSize: '0.95rem', color: tokens.colors.text.secondary }}>
        Reward:{' '}
        <Box component="span" sx={{ color: '#c4a000' }}>
          {formatRewardTier(event.rewardTier)}
        </Box>
      </Typography>

      {/* Divider / Skip section */}
      {event.type !== 'boss' ? (
        <>
          <Typography
            sx={{
              ...gamingFont,
              fontSize: '0.9rem',
              color: tokens.colors.text.secondary,
              my: 2,
            }}
          >
            or
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PencilIcon
              sx={{
                fontSize: 20,
                color: isActive && !isCompleted ? '#c4a000' : tokens.colors.text.disabled,
              }}
            />
            <Button
              variant="contained"
              disabled={!isActive || isCompleted || !event.skippable}
              onClick={onSkip}
              sx={{
                bgcolor: isActive && !isCompleted ? tokens.colors.error : tokens.colors.background.elevated,
                color: isActive && !isCompleted ? '#fff' : tokens.colors.text.disabled,
                ...gamingFont,
                fontSize: '0.8rem',
                py: 0.75,
                px: 2,
                '&:hover': {
                  bgcolor: isActive && !isCompleted ? '#c0392b' : tokens.colors.background.elevated,
                },
                '&.Mui-disabled': {
                  bgcolor: tokens.colors.background.elevated,
                  color: tokens.colors.text.disabled,
                },
              }}
            >
              Skip Event
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Typography
            sx={{
              ...gamingFont,
              fontSize: '1rem',
              color: '#c4a000',
              mt: 3,
              mb: 0.5,
            }}
          >
            Domain Boss
          </Typography>
          <Typography
            sx={{
              ...gamingFont,
              fontSize: '0.7rem',
              color: tokens.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            New Events
          </Typography>
          <Typography
            sx={{
              ...gamingFont,
              fontSize: '0.7rem',
              color: tokens.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Reroll Favors
          </Typography>
        </>
      )}
    </Paper>
  );
}

interface EventSelectionProps {
  domainId: number;
  currentEvent: number;
  completedEvents: boolean[];
  onBeginEvent: (eventIndex: number) => void;
  onSkipEvent: (eventIndex: number) => void;
  // New props for door-based selection
  threadId?: string;
  tier?: number;
  useDoorSelector?: boolean;
  onSelectDoor?: (door: DoorPreview) => void;
}

export function EventSelection({
  domainId,
  currentEvent,
  completedEvents,
  onBeginEvent,
  onSkipEvent,
  threadId,
  tier = 1,
  useDoorSelector = false,
  onSelectDoor,
}: EventSelectionProps) {
  const domain = DOMAINS.find((d) => d.id === domainId);
  if (!domain) return null;

  // Generate doors based on thread ID (deterministic)
  const doors = useMemo(() => {
    if (!useDoorSelector || !threadId) return [];
    const rng = createSeededRng(threadId);
    // Use domain slug format for door generation
    const domainSlug = domain.name.toLowerCase().replace('the ', '').replace(' ', '-');
    return getAvailableDoors(domainSlug, currentEvent, tier, rng);
  }, [useDoorSelector, threadId, domain.name, currentEvent, tier]);

  // Door-based selector (new flow)
  if (useDoorSelector && doors.length > 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
          p: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography
            sx={{
              ...gamingFont,
              fontSize: '0.6rem',
              color: tokens.colors.text.disabled,
              letterSpacing: '0.1em',
              mb: 0.5,
            }}
          >
            ROOM {currentEvent + 1}/3
          </Typography>
          <Typography
            sx={{
              ...gamingFont,
              fontSize: '0.9rem',
              color: tokens.colors.text.primary,
              mb: 0.5,
            }}
          >
            {domain.name}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.7rem',
              color: tokens.colors.text.secondary,
            }}
          >
            Choose your path
          </Typography>
        </Box>

        {/* Door Cards */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: 800,
          }}
        >
          {doors.map((door, index) => (
            <DoorCard
              key={index}
              door={door}
              onSelect={() => onSelectDoor?.(door)}
            />
          ))}
        </Box>

        {/* Room Progress */}
        <Box sx={{ mt: 4, display: 'flex', gap: 1 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: completedEvents[i]
                  ? tokens.colors.success
                  : i === currentEvent
                  ? tokens.colors.primary
                  : tokens.colors.background.elevated,
                border: `1px solid ${
                  completedEvents[i]
                    ? tokens.colors.success
                    : i === currentEvent
                    ? tokens.colors.primary
                    : tokens.colors.border
                }`,
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  // Legacy event card selector (fallback)
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        p: 3,
      }}
    >
      {/* Domain title */}
      <Typography
        sx={{
          ...gamingFont,
          fontSize: '0.8rem',
          color: tokens.colors.text.secondary,
          mb: 3,
        }}
      >
        Domain {domainId}: {domain.name}
      </Typography>

      {/* Event cards */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 900,
        }}
      >
        {domain.events.map((event, index) => (
          <EventCard
            key={index}
            event={event}
            eventIndex={index}
            domainId={domainId}
            isActive={index === currentEvent}
            isCompleted={completedEvents[index]}
            isLocked={index > currentEvent && !completedEvents[index - 1]}
            onBegin={() => onBeginEvent(index)}
            onSkip={() => onSkipEvent(index)}
          />
        ))}
      </Box>
    </Box>
  );
}
