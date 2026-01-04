/**
 * GameHistory - Past games table with search, sort, and pagination
 *
 * Shows completed games with player names, domains, results, and review status.
 * Supports filtering by search query and sorting by any column.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Pagination,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  SearchSharp as SearchIcon,
  CloseSharp as CloseIcon,
  BoltSharp as BoltIcon,
  PublicSharp as CountryIcon,
  StarSharp as StarIcon,
} from '@mui/icons-material';
import { tokens } from '../../../theme';
import { CardHeader, SortableHeader, type SortConfig } from '../../../components/ds';
import { MOCK_HISTORY, MODE_ICONS } from '../../../data/home';
import { tableColWidths, tableRowHeight } from '../styles';

const PER_PAGE = 10;

export function GameHistory() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      column,
      direction: prev?.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter by search query
  const filteredHistory = searchQuery
    ? MOCK_HISTORY.filter(game => {
        const query = searchQuery.toLowerCase();
        return (
          game.players[0].toLowerCase().includes(query) ||
          game.players[1].toLowerCase().includes(query) ||
          game.domain.toLowerCase().includes(query) ||
          game.mode.toLowerCase().includes(query) ||
          game.when.toLowerCase().includes(query)
        );
      })
    : MOCK_HISTORY;

  // Sort if active
  const sortedHistory = sortConfig
    ? [...filteredHistory].sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        switch (sortConfig.column) {
          case 'type': return dir * a.mode.localeCompare(b.mode);
          case 'players': return dir * a.players[0].localeCompare(b.players[0]);
          case 'domain': return dir * a.domain.localeCompare(b.domain);
          case 'result': return dir * (a.result[0] - b.result[0]);
          case 'when': return dir * a.when.localeCompare(b.when);
          default: return 0;
        }
      })
    : filteredHistory;

  const totalPages = Math.ceil(sortedHistory.length / PER_PAGE);
  const paginatedHistory = sortedHistory.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <Paper sx={{ bgcolor: tokens.colors.background.paper, borderRadius: '30px', overflow: 'hidden', border: `1px solid ${tokens.colors.border}` }}>
      <CardHeader
        title={`Game History (${searchQuery ? `${sortedHistory.length} of ${MOCK_HISTORY.length}` : MOCK_HISTORY.length})`}
        action="external"
        actionTooltip="View All Games"
        onActionClick={() => navigate('/progress')}
      >
        <SearchInput
          value={searchQuery}
          onChange={(value) => { setSearchQuery(value); setPage(1); }}
          onClear={() => setSearchQuery('')}
        />
      </CardHeader>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: tokens.colors.background.elevated }}>
              <SortableHeader column="type" label="Type" sortConfig={sortConfig} onSort={handleSort} width={tableColWidths.type} align="center" />
              <SortableHeader column="players" label="Players" sortConfig={sortConfig} onSort={handleSort} />
              <SortableHeader column="domain" label="Domain" sortConfig={sortConfig} onSort={handleSort} width={tableColWidths.domain} />
              <SortableHeader column="result" label="Result" sortConfig={sortConfig} onSort={handleSort} width={tableColWidths.record} />
              <SortableHeader column="when" label="When?" sortConfig={sortConfig} onSort={handleSort} width={tableColWidths.when} />
              <TableCell sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem', py: 0.75, width: tableColWidths.action }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedHistory.map((game, i) => (
              <GameHistoryRow key={i} game={game} navigate={navigate} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {sortedHistory.length === 0 ? (
        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
          <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.8rem' }}>
            No games found matching "{searchQuery}"
          </Typography>
        </Box>
      ) : (
        <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            size="small"
            sx={{ '& .MuiPaginationItem-root': { color: tokens.colors.text.secondary } }}
          />
        </Box>
      )}
    </Paper>
  );
}

/** Search input with clear button */
function SearchInput({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 1.5,
      py: 1,
      borderRadius: '999px',
      border: `1px solid ${tokens.colors.border}`,
      minWidth: 140,
    }}>
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: tokens.colors.text.primary,
          fontSize: '0.75rem',
          width: '100%',
        }}
      />
      {value ? (
        <IconButton size="small" onClick={onClear} sx={{ p: 0 }}>
          <CloseIcon sx={{ fontSize: 14, color: tokens.colors.text.disabled }} />
        </IconButton>
      ) : (
        <SearchIcon sx={{ color: tokens.colors.text.disabled, fontSize: 16 }} />
      )}
    </Box>
  );
}

/** Individual game history row */
function GameHistoryRow({
  game,
  navigate,
}: {
  game: typeof MOCK_HISTORY[0];
  navigate: (path: string) => void;
}) {
  return (
    <TableRow hover sx={{ height: tableRowHeight, borderBottom: `1px solid ${tokens.colors.border}` }}>
      {/* Type column */}
      <TableCell sx={{ py: 1, pl: 1.5, width: tableColWidths.type }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
          <Avatar src={MODE_ICONS[game.mode]} sx={{ width: 28, height: 28, bgcolor: tokens.colors.background.elevated }} />
          <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.6rem' }}>{game.mode}</Typography>
        </Box>
      </TableCell>

      {/* Players column */}
      <TableCell sx={{ py: 1, width: tableColWidths.player }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <PlayerRow
            player={game.players[0]}
            wikiLink={game.wikiLinks[0]}
            userId={game.userIds[0]}
            color={tokens.colors.secondary}
          />
          <PlayerRow
            player={game.players[1]}
            wikiLink={game.wikiLinks[1]}
            userId={game.userIds[1]}
            color={tokens.colors.primary}
          />
        </Box>
      </TableCell>

      {/* Domain column */}
      <TableCell sx={{ py: 1, width: tableColWidths.domain }}>
        <Typography
          onClick={() => navigate(`/wiki/domains/${game.domain.toLowerCase().replace(/\s+/g, '-')}`)}
          sx={{
            fontSize: '0.75rem',
            color: tokens.colors.text.secondary,
            cursor: 'pointer',
            '&:hover': { color: tokens.colors.secondary, textDecoration: 'underline' },
          }}
        >
          {game.domain}
        </Typography>
      </TableCell>

      {/* Result column */}
      <TableCell sx={{ py: 1, width: tableColWidths.record }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          <ResultIndicator score={game.result[0]} />
          <ResultIndicator score={game.result[1]} />
        </Box>
      </TableCell>

      {/* When column */}
      <TableCell sx={{ py: 1, width: tableColWidths.when }}>
        <Typography sx={{ color: tokens.colors.text.secondary, fontSize: '0.75rem' }}>{game.when}</Typography>
      </TableCell>

      {/* Action column - Review button */}
      <TableCell sx={{ py: 0.5, pr: 1, width: tableColWidths.action }}>
        <Tooltip title={game.reviewed ? "Already reviewed" : "Review game"} arrow>
          <Box
            sx={{
              width: tableColWidths.action - 8,
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
            <BoltIcon sx={{ fontSize: 20, color: game.reviewed ? tokens.colors.text.disabled : tokens.colors.warning }} />
          </Box>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

/** Player name with optional wiki link or user profile link */
function PlayerRow({
  player,
  wikiLink,
  userId,
  color,
}: {
  player: string;
  wikiLink: { category: string; slug: string } | null;
  userId: number | null;
  color: string;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
      {wikiLink ? (
        <Typography
          component="a"
          href={`/wiki/${wikiLink.category}/${wikiLink.slug}`}
          sx={{ fontSize: '0.75rem', color: tokens.colors.rarity.epic, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          {player}
        </Typography>
      ) : userId ? (
        <>
          <Typography
            component="a"
            href={`/user/${userId}`}
            sx={{ fontSize: '0.75rem', color: tokens.colors.text.primary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {player}
          </Typography>
          <CountryIcon sx={{ fontSize: 12, color: tokens.colors.text.disabled }} />
          <StarIcon sx={{ fontSize: 12, color: tokens.colors.warning }} />
        </>
      ) : (
        <Typography sx={{ fontSize: '0.75rem' }}>{player}</Typography>
      )}
    </Box>
  );
}

/** Score indicator with colored box */
function ResultIndicator({ score }: { score: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography sx={{ fontSize: '0.75rem', width: 12, textAlign: 'right' }}>{score}</Typography>
      <Box sx={{
        width: 14,
        height: 14,
        borderRadius: 0.5,
        bgcolor: score > 0 ? tokens.colors.success : tokens.colors.primary,
      }} />
    </Box>
  );
}
