/**
 * Leaderboard - Game type pools with right-side sections nav
 */

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Breadcrumbs,
  useMediaQuery,
  useTheme,
  Drawer,
  Link as MuiLink,
} from '@mui/material';
import {
  SportsEsportsSharp as ChallengeIcon,
  NavigateNextSharp as NextIcon,
  MenuSharp as MenuIcon,
  ChevronLeftSharp as BackIcon,
  EmojiEventsSharp as TrophyIcon,
  LockSharp as LockIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { AssetImage } from '../../components/ds';
import { ChallengeSentDialog } from '../play/ChallengeSent';

// ============================================
// Types & Config
// ============================================

type GameType = 'all' | 'arena' | 'vbots' | '1v1';

interface GameTypeConfig {
  id: GameType;
  label: string;
  description: string;
  disabled?: boolean;
}

const gameTypes: GameTypeConfig[] = [
  { id: 'all', label: 'Overall', description: 'Combined rankings' },
  { id: 'arena', label: 'Arena', description: 'Solo roguelike' },
  { id: 'vbots', label: 'VBots', description: 'vs AI challenge', disabled: true },
  { id: '1v1', label: '1v1', description: 'Player vs player', disabled: true },
];

// Placard images for top 3
const RANK_PLACARDS: Record<number, string> = {
  1: '/assets/items/quest/placard-gold.svg',
  2: '/assets/items/quest/placard-silver.svg',
  3: '/assets/items/quest/placard-bronze.svg',
};

// ============================================
// Mock Player Data by Game Type
// ============================================

interface Player {
  id: number;
  name: string;
  points: number;
  wins: number;
  winRate: number;
  streak: number;
  specialty: GameType;
}

const generatePlayers = (): Record<GameType, Player[]> => {
  // Arena specialists - solo roguelike grinders
  const arenaPlayers: Player[] = [
    { id: 101, name: 'VoidWalker', points: 48750, wins: 312, winRate: 78, streak: 15, specialty: 'arena' },
    { id: 102, name: 'DiceReaper', points: 45200, wins: 287, winRate: 75, streak: 8, specialty: 'arena' },
    { id: 103, name: 'CritMaster', points: 42100, wins: 265, winRate: 72, streak: 12, specialty: 'arena' },
    { id: 104, name: 'RNGesus', points: 39800, wins: 248, winRate: 70, streak: 5, specialty: 'arena' },
    { id: 105, name: 'FloorSweeper', points: 37500, wins: 231, winRate: 68, streak: 9, specialty: 'arena' },
    { id: 106, name: 'BossSlayer', points: 35200, wins: 218, winRate: 67, streak: 4, specialty: 'arena' },
    { id: 107, name: 'LootGoblin', points: 33100, wins: 205, winRate: 65, streak: 7, specialty: 'arena' },
    { id: 108, name: 'DeathDenier', points: 31000, wins: 192, winRate: 63, streak: 3, specialty: 'arena' },
  ];

  // VBots specialists - AI challengers
  const vbotsPlayers: Player[] = [
    { id: 201, name: 'BotBuster', points: 52300, wins: 445, winRate: 89, streak: 23, specialty: 'vbots' },
    { id: 202, name: 'AISlayer', points: 49100, wins: 412, winRate: 86, streak: 18, specialty: 'vbots' },
    { id: 203, name: 'MachineBreaker', points: 46800, wins: 398, winRate: 84, streak: 14, specialty: 'vbots' },
    { id: 204, name: 'CodeCrusher', points: 44200, wins: 378, winRate: 82, streak: 11, specialty: 'vbots' },
    { id: 205, name: 'BinaryBane', points: 41900, wins: 356, winRate: 80, streak: 9, specialty: 'vbots' },
    { id: 206, name: 'SiliconSmith', points: 39500, wins: 334, winRate: 78, streak: 6, specialty: 'vbots' },
    { id: 207, name: 'RobotWrecker', points: 37200, wins: 312, winRate: 76, streak: 5, specialty: 'vbots' },
    { id: 208, name: 'CPUConqueror', points: 35000, wins: 290, winRate: 74, streak: 4, specialty: 'vbots' },
  ];

  // 1v1 specialists - PvP masters
  const pvpPlayers: Player[] = [
    { id: 301, name: 'DuelKing', points: 61200, wins: 534, winRate: 82, streak: 19, specialty: '1v1' },
    { id: 302, name: 'PvPLord', points: 58400, wins: 498, winRate: 79, streak: 14, specialty: '1v1' },
    { id: 303, name: 'ArenaChamp', points: 55100, wins: 467, winRate: 77, streak: 11, specialty: '1v1' },
    { id: 304, name: 'BladeRunner', points: 52800, wins: 445, winRate: 75, streak: 8, specialty: '1v1' },
    { id: 305, name: 'CombatAce', points: 49600, wins: 412, winRate: 73, streak: 6, specialty: '1v1' },
    { id: 306, name: 'WarMachine', points: 47200, wins: 389, winRate: 71, streak: 5, specialty: '1v1' },
    { id: 307, name: 'DiceAssassin', points: 44800, wins: 367, winRate: 69, streak: 4, specialty: '1v1' },
    { id: 308, name: 'VersusVictor', points: 42500, wins: 345, winRate: 67, streak: 3, specialty: '1v1' },
  ];

  // All combined and sorted by total points
  const allPlayers = [...arenaPlayers, ...vbotsPlayers, ...pvpPlayers]
    .sort((a, b) => b.points - a.points)
    .slice(0, 15);

  return {
    all: allPlayers,
    arena: arenaPlayers,
    vbots: vbotsPlayers,
    '1v1': pvpPlayers,
  };
};

const PLAYERS_BY_TYPE = generatePlayers();

// ============================================
// Main Component
// ============================================

export function Leaderboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeType, setActiveType] = useState<GameType>('all');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState<{ name: string; rank: number } | null>(null);

  const handleTypeClick = (type: GameTypeConfig) => {
    if (type.disabled) return;
    setActiveType(type.id);
    setMobileDrawerOpen(false);
  };

  const handleChallenge = (e: React.MouseEvent, name: string, rank: number) => {
    e.stopPropagation();
    setChallengeTarget({ name, rank });
  };

  const handleRowClick = (playerId: number) => {
    navigate(`/user/${playerId}`);
  };

  const players = PLAYERS_BY_TYPE[activeType];
  const currentTypeConfig = gameTypes.find(t => t.id === activeType)!;

  // Right-side sections nav
  const sectionsNav = (
    <Box
      sx={{
        position: { md: 'sticky' },
        top: { md: 80 },
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 2, color: tokens.colors.text.secondary }}>
        Game Types
      </Typography>
      {gameTypes.map((type) => {
        const content = (
          <Box
            key={type.id}
            sx={{
              mb: 1.5,
              opacity: type.disabled ? 0.6 : 1,
              cursor: type.disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="body2"
                onClick={() => handleTypeClick(type)}
                sx={{
                  color: type.disabled
                    ? tokens.colors.text.disabled
                    : activeType === type.id
                    ? tokens.colors.text.primary
                    : tokens.colors.secondary,
                  fontWeight: activeType === type.id ? 600 : 400,
                  cursor: type.disabled ? 'not-allowed' : 'pointer',
                  '&:hover': type.disabled ? {} : { textDecoration: 'underline' },
                }}
              >
                {type.label}
              </Typography>
              {type.disabled && <LockIcon sx={{ fontSize: 12, color: tokens.colors.text.disabled }} />}
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: tokens.colors.text.disabled,
                fontSize: '0.7rem',
              }}
            >
              {type.disabled ? 'Coming Soon' : type.description}
            </Typography>
          </Box>
        );

        return type.disabled ? (
          <Tooltip key={type.id} title="Coming Soon" arrow placement="left">
            {content}
          </Tooltip>
        ) : (
          content
        );
      })}
    </Box>
  );

  // Mobile drawer content
  const drawerContent = (
    <Box sx={{ py: 2 }}>
      {gameTypes.map((type) => (
        <Tooltip
          key={type.id}
          title={type.disabled ? 'Coming Soon' : ''}
          placement="right"
          arrow
        >
          <Box
            onClick={() => handleTypeClick(type)}
            sx={{
              px: 3,
              py: 1.5,
              cursor: type.disabled ? 'not-allowed' : 'pointer',
              opacity: type.disabled ? 0.6 : 1,
              bgcolor: activeType === type.id ? tokens.colors.background.elevated : 'transparent',
              '&:hover': type.disabled ? {} : { bgcolor: tokens.colors.background.elevated },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: activeType === type.id ? 600 : 400,
                  color: type.disabled
                    ? tokens.colors.text.disabled
                    : activeType === type.id
                    ? tokens.colors.text.primary
                    : tokens.colors.text.secondary,
                }}
              >
                {type.label}
              </Typography>
              {type.disabled && <LockIcon sx={{ fontSize: 14, color: tokens.colors.text.disabled }} />}
            </Box>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              {type.disabled ? 'Coming Soon' : type.description}
            </Typography>
          </Box>
        </Tooltip>
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
            {currentTypeConfig.label} Leaderboard
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
              Leaderboard
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
              Leaderboard
            </Typography>
          </Breadcrumbs>

          {/* Header */}
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Rankings
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
            Top performers this season
          </Typography>

          {/* Filter Toolbar */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {gameTypes.map((type) => {
              const isActive = activeType === type.id;
              const chip = (
                <Box
                  key={type.id}
                  onClick={() => handleTypeClick(type)}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: '20px',
                    bgcolor: isActive
                      ? tokens.colors.primary
                      : tokens.colors.background.elevated,
                    color: isActive
                      ? tokens.colors.background.default
                      : type.disabled
                      ? tokens.colors.text.disabled
                      : tokens.colors.text.primary,
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 400,
                    cursor: type.disabled ? 'not-allowed' : 'pointer',
                    opacity: type.disabled ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    transition: 'all 0.15s',
                    '&:hover': type.disabled
                      ? {}
                      : {
                          bgcolor: isActive
                            ? tokens.colors.primary
                            : tokens.colors.background.paper,
                        },
                  }}
                >
                  {type.label}
                  {type.disabled && <LockIcon sx={{ fontSize: 14 }} />}
                </Box>
              );

              return type.disabled ? (
                <Tooltip key={type.id} title="Coming Soon" arrow>
                  {chip}
                </Tooltip>
              ) : (
                chip
              );
            })}
          </Box>

          {/* Top 3 Podium */}
          <Box sx={{ display: 'flex', justifyContent: 'stretch', gap: 2, mb: 4, width: '100%' }}>
            {[1, 0, 2].map((idx) => {
              const player = players[idx];
              if (!player) return null;
              const rank = idx + 1;

              return (
                <Paper
                  key={player.id}
                  onClick={() => handleRowClick(player.id)}
                  sx={{
                    py: 4,
                    px: 3,
                    textAlign: 'center',
                    backgroundColor: tokens.colors.background.paper,
                    border: `1px solid ${tokens.colors.border}`,
                    borderRadius: '20px',
                    transform: rank === 1 ? 'scale(1.02)' : 'none',
                    zIndex: rank === 1 ? 1 : 0,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    flex: 1,
                    '&:hover': {
                      borderColor: tokens.colors.secondary,
                      transform: rank === 1 ? 'scale(1.04)' : 'scale(1.02)',
                    },
                    '&:hover .challenge-btn': {
                      opacity: 1,
                    },
                  }}
                >
                  <Tooltip title="Challenge">
                    <IconButton
                      className="challenge-btn"
                      size="small"
                      onClick={(e) => handleChallenge(e, player.name, rank)}
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        opacity: 0,
                        transition: 'opacity 0.15s',
                        bgcolor: tokens.colors.background.elevated,
                        '&:hover': { bgcolor: tokens.colors.background.default },
                      }}
                    >
                      <ChallengeIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>

                  {/* Placard Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 32,
                      height: 32,
                    }}
                  >
                    <AssetImage
                      src={RANK_PLACARDS[rank]}
                      alt={`Rank ${rank}`}
                      width={32}
                      height={32}
                      fallback="hide"
                    />
                  </Box>

                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      mx: 'auto',
                      mb: 1.5,
                      mt: 1,
                      bgcolor: tokens.colors.background.elevated,
                      fontSize: '1.25rem',
                    }}
                  >
                    {player.name.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: tokens.colors.secondary, fontWeight: 500 }}>
                    {player.name}
                  </Typography>
                  <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.25rem', my: 0.5 }}>
                    {player.points.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                    {player.winRate}% win rate
                  </Typography>
                </Paper>
              );
            })}
          </Box>

          {/* Rest of Leaderboard */}
          <Paper
            sx={{
              backgroundColor: tokens.colors.background.paper,
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            {players.slice(3).map((player, i) => {
              const rank = i + 4;
              return (
                <Box
                  key={player.id}
                  onClick={() => handleRowClick(player.id)}
                  sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderBottom: i < players.length - 4 ? `1px solid ${tokens.colors.border}` : 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: tokens.colors.background.elevated,
                    },
                    '&:hover .challenge-btn': {
                      opacity: 1,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      width: 28,
                      textAlign: 'center',
                      color: tokens.colors.text.disabled,
                      fontWeight: 600,
                      fontSize: '0.85rem',
                    }}
                  >
                    {rank}
                  </Typography>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: tokens.colors.background.elevated, fontSize: '0.9rem' }}>
                    {player.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: tokens.colors.secondary, fontWeight: 500 }}>
                      {player.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                      {player.wins} wins · {player.winRate}% WR
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', mr: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.points.toLocaleString()}
                    </Typography>
                    {player.streak > 5 && (
                      <Typography variant="caption" sx={{ color: tokens.colors.success, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <TrophyIcon sx={{ fontSize: 12 }} /> {player.streak} streak
                      </Typography>
                    )}
                  </Box>
                  <Tooltip title="Challenge">
                    <IconButton
                      className="challenge-btn"
                      size="small"
                      onClick={(e) => handleChallenge(e, player.name, rank)}
                      sx={{
                        opacity: 0,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      <ChallengeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              );
            })}
          </Paper>
        </Box>

        {/* Right Sidebar */}
        {!isMobile && (
          <Box sx={{ width: 160, flexShrink: 0 }}>
            {sectionsNav}
          </Box>
        )}
      </Box>

      {/* Challenge Dialog */}
      <ChallengeSentDialog
        open={!!challengeTarget}
        onClose={() => setChallengeTarget(null)}
        playerName={challengeTarget?.name}
        playerRank={challengeTarget?.rank}
      />
    </Box>
  );
}
