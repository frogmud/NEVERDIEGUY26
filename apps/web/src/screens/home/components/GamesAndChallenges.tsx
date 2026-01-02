/**
 * GamesAndChallenges - Card viewer or table view for active games
 *
 * Shows incoming challenges and active games with toggle between
 * card carousel view and table view. Supports cancel/accept actions.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  CloseSharp as CloseIcon,
  RefreshSharp as RefreshIcon,
  ViewListSharp as ListIcon,
  ViewCarouselSharp as CarouselIcon,
  ChevronRightSharp as ChevronRightIcon,
  StarSharp as StarIcon,
  PublicSharp as CountryIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { CardHeader, SortableHeader, type SortConfig } from '../../../components/ds';
import { MOCK_CHALLENGES, MODE_ICONS } from '../../../data/home';
import { tableColWidths, tableRowHeight, smallIconSx } from '../styles';

type Challenge = typeof MOCK_CHALLENGES[0];

export function GamesAndChallenges() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [challenges, setChallenges] = useState(MOCK_CHALLENGES);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev?.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCancel = (id: number, name?: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
    setSnackbar({ open: true, message: name ? `Challenge with ${name} canceled` : 'Challenge canceled' });
  };

  // Sort challenges if sort is active
  const sortedChallenges = sortConfig
    ? [...challenges].sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        switch (sortConfig.column) {
          case 'type': return dir * a.mode.localeCompare(b.mode);
          case 'player': return dir * a.name.localeCompare(b.name);
          case 'domain': return dir * a.domainName.localeCompare(b.domainName);
          case 'record': {
            const aWins = a.record ? parseInt(a.record.split(' / ')[0]) : 0;
            const bWins = b.record ? parseInt(b.record.split(' / ')[0]) : 0;
            return dir * (aWins - bWins);
          }
          case 'when': return dir * a.time.localeCompare(b.time);
          default: return 0;
        }
      })
    : challenges;

  return (
    <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '30px', overflow: 'hidden', minWidth: 0, border: `1px solid ${tokens.colors.border}` }}>
      <CardHeader
        title="Games & Challenges"
        count={challenges.length}
        infoTooltip="Your active games and incoming challenges"
      >
        <Box sx={{ display: 'flex', gap: 0.25 }}>
          <Tooltip title="View as table" arrow><IconButton size="small" sx={{ ...smallIconSx, color: viewMode === 'list' ? tokens.colors.text.primary : tokens.colors.text.disabled }} onClick={() => setViewMode('list')}><ListIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
          <Tooltip title="View as cards" arrow><IconButton size="small" sx={{ ...smallIconSx, color: viewMode === 'grid' ? tokens.colors.text.primary : tokens.colors.text.disabled }} onClick={() => setViewMode('grid')}><CarouselIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
        </Box>
      </CardHeader>

      {/* Empty state */}
      {challenges.length === 0 ? (
        <Box sx={{ py: 6, px: 3, bgcolor: tokens.colors.background.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: tokens.colors.text.secondary, fontSize: '0.95rem' }}>
            You don't have active games or challenges.
          </Typography>
        </Box>
      ) : viewMode === 'grid' ? (
        <CardViewer challenges={challenges} onCancel={handleCancel} />
      ) : (
        <ChallengesTable
          challenges={sortedChallenges}
          sortConfig={sortConfig}
          onSort={handleSort}
          onCancel={handleCancel}
          navigate={navigate}
        />
      )}

      {/* Cancel notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
}

/** Card carousel view */
function CardViewer({
  challenges,
  onCancel,
}: {
  challenges: Challenge[];
  onCancel: (id: number, name?: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (challenges.length === 0) {
    return null;
  }

  // Adjust index if out of bounds after cancel
  const safeIndex = Math.min(currentIndex, challenges.length - 1);
  const currentChallenge = challenges[safeIndex];
  const total = challenges.length;

  return (
    <Box sx={{ p: 1.5, py: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        {/* Left arrow */}
        <IconButton
          onClick={() => setCurrentIndex(i => (i - 1 + total) % total)}
          sx={{ position: 'absolute', left: 8, zIndex: 1, color: tokens.colors.text.disabled }}
        >
          <ChevronRightIcon sx={{ transform: 'rotate(180deg)' }} />
        </IconButton>

        {/* Current card */}
        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', px: 8, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '80%' }}>
            <ChallengeCard challenge={currentChallenge} onCancel={onCancel} />
          </Box>
        </Box>

        {/* Right arrow */}
        <IconButton
          onClick={() => setCurrentIndex(i => (i + 1) % total)}
          sx={{ position: 'absolute', right: 8, zIndex: 1, color: tokens.colors.text.disabled }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Pagination indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 1.5 }}>
        {challenges.map((_, i) => (
          <Box
            key={i}
            onClick={() => setCurrentIndex(i)}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: i === safeIndex ? tokens.colors.text.primary : tokens.colors.border,
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

/** Individual challenge card - 40% domain | 60% content */
function ChallengeCard({
  challenge,
  onCancel,
}: {
  challenge: Challenge;
  onCancel: (id: number, name?: string) => void;
}) {
  const navigate = useNavigate();
  const record = challenge.record ? challenge.record.split(' / ').map(Number) : null;
  const [wins, draws, losses] = record || [0, 0, 0];
  const isNPC = challenge.status === 'npc';
  const isReceived = challenge.status === 'received';
  const isSent = challenge.status === 'sent';

  const nameLink = isNPC && challenge.wikiCategory && challenge.wikiSlug
    ? `/wiki/${challenge.wikiCategory}/${challenge.wikiSlug}`
    : challenge.userId ? `/user/${challenge.userId}` : '#';

  return (
    <Paper
      sx={{
        bgcolor: tokens.colors.background.paper,
        borderRadius: '18px',
        overflow: 'hidden',
        border: `1px solid ${tokens.colors.border}`,
      }}
    >
      <Box sx={{ display: 'flex' }}>
        {/* Domain planet section - 40% with action overlay */}
        <Box sx={{
          width: '40%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: tokens.colors.background.elevated,
          borderRight: `1px solid ${tokens.colors.border}`,
          position: 'relative',
        }}>
          {/* Domain planet (circle placeholder) */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5 }}>
            <Box sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: tokens.colors.background.paper,
              border: `2px solid ${tokens.colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Typography
                onClick={(e) => { e.stopPropagation(); navigate(`/wiki/domains/${challenge.domain}`); }}
                sx={{
                  fontSize: '0.65rem',
                  color: tokens.colors.text.disabled,
                  textAlign: 'center',
                  px: 0.5,
                  cursor: 'pointer',
                  '&:hover': { color: tokens.colors.secondary },
                }}
              >
                {challenge.domainName}
              </Typography>
            </Box>
          </Box>

          {/* Action buttons inside image container - 25/75 split */}
          <Box sx={{ display: 'flex', alignItems: 'stretch', borderTop: `1px solid ${tokens.colors.border}` }}>
            {isReceived || isNPC ? (
              <>
                <Box sx={{ width: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRight: `1px solid ${tokens.colors.border}`, py: 1 }}>
                  <Tooltip title={isNPC ? "Skip for now" : "Decline challenge"} arrow>
                    <IconButton size="small" onClick={() => onCancel(challenge.id, challenge.name)} sx={{ color: tokens.colors.text.disabled, p: 0.5 }}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Button variant="contained" sx={{ width: '75%', bgcolor: tokens.colors.primary, borderRadius: 0, py: 1, fontSize: '0.85rem', fontWeight: 600, minWidth: 0 }}>
                  {isNPC ? 'Fight' : 'Play'}
                </Button>
              </>
            ) : (
              <>
                <Box sx={{ width: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRight: `1px solid ${tokens.colors.border}`, py: 1 }}>
                  <Tooltip title="Cancel" arrow>
                    <IconButton size="small" onClick={() => onCancel(challenge.id, challenge.name)} sx={{ color: tokens.colors.text.disabled, p: 0.5 }}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ width: '75%', py: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Tooltip title={isSent ? "Send again" : "Challenge"} arrow>
                    <IconButton size="small" sx={{ color: tokens.colors.text.disabled, p: 0.5 }}>
                      <RefreshIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Content section - 60% */}
        <Box sx={{ flex: 1, p: 2, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.25 }}>{challenge.type}</Typography>
          <Typography
            component="a"
            href={nameLink}
            sx={{
              color: isNPC ? tokens.colors.rarity.epic : tokens.colors.text.secondary,
              fontSize: '0.85rem',
              mb: 0.25,
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline', color: isNPC ? tokens.colors.rarity.epic : tokens.colors.secondary },
            }}
          >
            {challenge.name}{challenge.rating ? ` (${challenge.rating})` : ''}
          </Typography>
          {/* Mode on Domain */}
          <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.75rem', mb: 0.75 }}>
            {challenge.mode === 'Bots' ? 'vsBots' : challenge.mode} on {challenge.domainName}
          </Typography>
          {!isNPC && record ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Typography sx={{ color: tokens.colors.success, fontSize: '1rem', fontWeight: 600 }}>{wins}</Typography>
                <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '1rem' }}>/</Typography>
                <Typography sx={{ color: tokens.colors.text.primary, fontSize: '1rem' }}>{draws}</Typography>
                <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '1rem' }}>/</Typography>
                <Typography sx={{ color: tokens.colors.primary, fontSize: '1rem', fontWeight: 600 }}>{losses}</Typography>
              </Box>
              <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem' }}>Your record</Typography>
            </>
          ) : (
            <>
              {challenge.taunt && (
                <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.75rem', fontStyle: 'italic', mb: 0.5 }}>
                  "{challenge.taunt}"
                </Typography>
              )}
              <Typography sx={{ color: tokens.colors.warning, fontSize: '0.75rem' }}>{challenge.time}</Typography>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

/** Table view for challenges */
function ChallengesTable({
  challenges,
  sortConfig,
  onSort,
  onCancel,
  navigate,
}: {
  challenges: Challenge[];
  sortConfig: SortConfig;
  onSort: (column: string) => void;
  onCancel: (id: number, name?: string) => void;
  navigate: (path: string) => void;
}) {
  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: tokens.colors.background.elevated }}>
              <SortableHeader column="type" label="Type" sortConfig={sortConfig} onSort={onSort} width={tableColWidths.type} align="center" />
              <SortableHeader column="player" label="Player" sortConfig={sortConfig} onSort={onSort} />
              <SortableHeader column="domain" label="Domain" sortConfig={sortConfig} onSort={onSort} width={tableColWidths.domain} />
              <SortableHeader column="record" label="Record" sortConfig={sortConfig} onSort={onSort} width={tableColWidths.record} />
              <SortableHeader column="when" label="When?" sortConfig={sortConfig} onSort={onSort} width={tableColWidths.when} />
              <TableCell sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem', py: 0.75, width: tableColWidths.actionDouble }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {challenges.slice(0, 10).map((c) => (
              <ChallengeTableRow
                key={c.id}
                challenge={c}
                onCancel={onCancel}
                navigate={navigate}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ py: 1.5, display: 'flex', justifyContent: 'center' }}>
        <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem' }}>
          No more games or challenges in progress
        </Typography>
      </Box>
    </>
  );
}

/** Individual challenge row */
function ChallengeTableRow({
  challenge: c,
  onCancel,
  navigate,
}: {
  challenge: Challenge;
  onCancel: (id: number, name?: string) => void;
  navigate: (path: string) => void;
}) {
  const record = c.record ? c.record.split(' / ').map(Number) : null;
  const [wins, draws, losses] = record || [0, 0, 0];
  const isNPC = c.status === 'npc';
  const isReceived = c.status === 'received';
  const isSent = c.status === 'sent';
  const nameLink = isNPC && c.wikiCategory && c.wikiSlug
    ? `/wiki/${c.wikiCategory}/${c.wikiSlug}`
    : c.userId ? `/user/${c.userId}` : '#';

  return (
    <TableRow hover sx={{ height: tableRowHeight, borderBottom: `1px solid ${tokens.colors.border}` }}>
      {/* Type column */}
      <TableCell sx={{ py: 1, pl: 1.5, width: tableColWidths.type }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
          <Avatar src={MODE_ICONS[c.mode]} sx={{ width: 28, height: 28, bgcolor: tokens.colors.background.elevated }} />
          <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.6rem' }}>{c.mode}</Typography>
        </Box>
      </TableCell>

      {/* Player column with flag/star icons */}
      <TableCell sx={{ py: 1, width: tableColWidths.player }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            component="a"
            href={nameLink}
            sx={{
              fontSize: '0.75rem',
              color: isNPC ? tokens.colors.rarity.epic : tokens.colors.text.primary,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {c.name}{c.rating ? ` (${c.rating})` : ''}
          </Typography>
          {!isNPC && (
            <>
              <CountryIcon sx={{ fontSize: 12, color: tokens.colors.text.disabled }} />
              <StarIcon sx={{ fontSize: 12, color: tokens.colors.warning }} />
            </>
          )}
        </Box>
      </TableCell>

      {/* Domain column */}
      <TableCell sx={{ py: 1, width: tableColWidths.domain }}>
        <Typography
          onClick={() => navigate(`/wiki/domains/${c.domain}`)}
          sx={{
            fontSize: '0.75rem',
            color: tokens.colors.text.secondary,
            cursor: 'pointer',
            '&:hover': { color: tokens.colors.secondary, textDecoration: 'underline' },
          }}
        >
          {c.domainName}
        </Typography>
      </TableCell>

      {/* Record column */}
      <TableCell sx={{ py: 1, width: tableColWidths.record }}>
        {record ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ color: tokens.colors.success, fontSize: '0.75rem', fontWeight: 600 }}>{wins}</Typography>
            <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.75rem' }}>/</Typography>
            <Typography sx={{ color: tokens.colors.text.primary, fontSize: '0.75rem' }}>{draws}</Typography>
            <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.75rem' }}>/</Typography>
            <Typography sx={{ color: tokens.colors.primary, fontSize: '0.75rem', fontWeight: 600 }}>{losses}</Typography>
          </Box>
        ) : (
          <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.75rem' }}>--</Typography>
        )}
      </TableCell>

      {/* When column */}
      <TableCell sx={{ py: 1, width: tableColWidths.when }}>
        <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.75rem' }}>{c.time}</Typography>
      </TableCell>

      {/* Action column - two buttons: Cancel + Primary action */}
      <TableCell sx={{ py: 0.5, pr: 1, width: tableColWidths.actionDouble }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {/* Cancel button */}
          <Box
            onClick={() => onCancel(c.id, c.name)}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: tokens.colors.background.elevated,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: `${tokens.colors.primary}30` },
            }}
          >
            <CloseIcon sx={{ fontSize: 18, color: tokens.colors.text.secondary }} />
          </Box>
          {/* Primary action button */}
          {isReceived || isNPC ? (
            <Button
              variant="contained"
              size="small"
              sx={{
                bgcolor: tokens.colors.primary,
                fontSize: '0.65rem',
                fontWeight: 600,
                minWidth: 52,
                height: 40,
                borderRadius: 1,
              }}
            >
              Duel
            </Button>
          ) : (
            <Tooltip title={isSent ? "Send again" : "Challenge"} arrow>
              <Box
                sx={{
                  width: 52,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: tokens.colors.background.elevated,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: tokens.colors.background.paper },
                }}
              >
                <RefreshIcon sx={{ fontSize: 18, color: tokens.colors.text.secondary }} />
              </Box>
            </Tooltip>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
}
