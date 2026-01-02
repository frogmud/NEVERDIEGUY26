import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  EmojiEventsSharp as TrophyIcon,
  PlayArrowSharp as PlayIcon,
  VisibilitySharp as SpectateIcon,
  InfoSharp as InfoIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';

// Mock tournament data
interface Player {
  id: number;
  name: string;
  seed: number;
  avatar?: string;
}

interface Match {
  id: string;
  round: number;
  position: number;
  player1: Player | null;
  player2: Player | null;
  score1?: number;
  score2?: number;
  winner?: number;
  status: 'pending' | 'live' | 'complete';
  scheduledTime?: string;
}

const MOCK_PLAYERS: Player[] = [
  { id: 1, name: 'ProDicer420', seed: 1 },
  { id: 2, name: 'DiceKing99', seed: 8 },
  { id: 3, name: 'RollMaster', seed: 4 },
  { id: 4, name: 'LuckyDice', seed: 5 },
  { id: 5, name: 'NDGFan', seed: 3 },
  { id: 6, name: 'CasinoKing', seed: 6 },
  { id: 7, name: 'DiceLord', seed: 2 },
  { id: 8, name: 'RNGesus', seed: 7 },
];

const MOCK_MATCHES: Match[] = [
  // Quarterfinals (Round 1)
  { id: 'qf1', round: 1, position: 0, player1: MOCK_PLAYERS[0], player2: MOCK_PLAYERS[1], score1: 45200, score2: 32100, winner: 1, status: 'complete' },
  { id: 'qf2', round: 1, position: 1, player1: MOCK_PLAYERS[2], player2: MOCK_PLAYERS[3], score1: 28500, score2: 31200, winner: 4, status: 'complete' },
  { id: 'qf3', round: 1, position: 2, player1: MOCK_PLAYERS[4], player2: MOCK_PLAYERS[5], status: 'live', score1: 18200, score2: 15800 },
  { id: 'qf4', round: 1, position: 3, player1: MOCK_PLAYERS[6], player2: MOCK_PLAYERS[7], status: 'pending', scheduledTime: '3:00 PM' },
  // Semifinals (Round 2)
  { id: 'sf1', round: 2, position: 0, player1: MOCK_PLAYERS[0], player2: MOCK_PLAYERS[3], status: 'pending' },
  { id: 'sf2', round: 2, position: 1, player1: null, player2: null, status: 'pending' },
  // Finals (Round 3)
  { id: 'f1', round: 3, position: 0, player1: null, player2: null, status: 'pending' },
];

const ROUND_NAMES = ['Quarterfinals', 'Semifinals', 'Finals'];

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

function MatchCard({ match, onClick }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isComplete = match.status === 'complete';

  return (
    <Paper
      onClick={onClick}
      sx={{
        width: 200,
        bgcolor: tokens.colors.background.paper,
        border: `1px solid ${isLive ? tokens.colors.error : tokens.colors.border}`,
        borderRadius: 1,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.15s',
        position: 'relative',
        '&:hover': {
          borderColor: tokens.colors.primary,
          transform: 'scale(1.02)',
        },
      }}
    >
      {/* Status indicator */}
      {isLive && (
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: tokens.colors.error,
              animation: 'blink 1s infinite',
              '@keyframes blink': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.3 },
              },
            }}
          />
          <Typography variant="caption" sx={{ color: tokens.colors.error, fontSize: '0.6rem' }}>
            LIVE
          </Typography>
        </Box>
      )}

      {/* Player 1 */}
      <Box
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: match.winner === match.player1?.id ? `${tokens.colors.success}10` : 'transparent',
        }}
      >
        {match.player1 ? (
          <>
            <Typography
              sx={{
                width: 16,
                fontSize: '0.7rem',
                color: tokens.colors.text.disabled,
                textAlign: 'center',
              }}
            >
              {match.player1.seed}
            </Typography>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
              {match.player1.name[0]}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                fontSize: '0.75rem',
                fontWeight: match.winner === match.player1.id ? 600 : 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {match.player1.name}
            </Typography>
            {match.score1 !== undefined && (
              <Typography
                sx={{
                  fontFamily: tokens.fonts.mono,
                  fontSize: '0.7rem',
                  color: match.winner === match.player1.id ? tokens.colors.success : tokens.colors.text.secondary,
                }}
              >
                {(match.score1 / 1000).toFixed(1)}k
              </Typography>
            )}
            {match.winner === match.player1.id && (
              <TrophyIcon sx={{ fontSize: 14, color: tokens.colors.warning }} />
            )}
          </>
        ) : (
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontStyle: 'italic' }}>
            TBD
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Player 2 */}
      <Box
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: match.winner === match.player2?.id ? `${tokens.colors.success}10` : 'transparent',
        }}
      >
        {match.player2 ? (
          <>
            <Typography
              sx={{
                width: 16,
                fontSize: '0.7rem',
                color: tokens.colors.text.disabled,
                textAlign: 'center',
              }}
            >
              {match.player2.seed}
            </Typography>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
              {match.player2.name[0]}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                flex: 1,
                fontSize: '0.75rem',
                fontWeight: match.winner === match.player2.id ? 600 : 400,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {match.player2.name}
            </Typography>
            {match.score2 !== undefined && (
              <Typography
                sx={{
                  fontFamily: tokens.fonts.mono,
                  fontSize: '0.7rem',
                  color: match.winner === match.player2.id ? tokens.colors.success : tokens.colors.text.secondary,
                }}
              >
                {(match.score2 / 1000).toFixed(1)}k
              </Typography>
            )}
            {match.winner === match.player2.id && (
              <TrophyIcon sx={{ fontSize: 14, color: tokens.colors.warning }} />
            )}
          </>
        ) : (
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontStyle: 'italic' }}>
            TBD
          </Typography>
        )}
      </Box>

      {/* Scheduled time for pending matches */}
      {match.status === 'pending' && match.scheduledTime && (
        <Box sx={{ px: 1, pb: 0.5, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, fontSize: '0.65rem' }}>
            {match.scheduledTime}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

export function TournamentBracket() {
  const navigate = useNavigate();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const getMatchesByRound = (round: number) =>
    MOCK_MATCHES.filter((m) => m.round === round).sort((a, b) => a.position - b.position);

  const handleSpectate = (matchId: string) => {
    setSelectedMatch(null);
    navigate(`/play/spectate/${matchId}`);
  };

  const handleViewReplay = (matchId: string) => {
    setSelectedMatch(null);
    navigate(`/play/replay/${matchId}`);
  };

  return (
    <Box>
      <PageHeader title="Frostfire Tournament" subtitle="Season 3 Championship Bracket" />

      {/* Tournament info */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Chip label="8 Players" variant="outlined" />
        <Chip label="Single Elimination" variant="outlined" />
        <Chip label="Prize: 10,000 Gold" variant="outlined" sx={{ color: '#c4a000', borderColor: '#c4a000' }} />
        <Chip
          label="2 LIVE"
          sx={{ bgcolor: tokens.colors.error, color: '#fff' }}
        />
      </Box>

      {/* Bracket visualization */}
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          overflowX: 'auto',
          pb: 2,
          alignItems: 'center',
        }}
      >
        {[1, 2, 3].map((round) => (
          <Box key={round} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Round header */}
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                color: tokens.colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: 1,
                fontSize: '0.7rem',
              }}
            >
              {ROUND_NAMES[round - 1]}
            </Typography>

            {/* Matches in this round */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: round === 1 ? 2 : round === 2 ? 8 : 16,
                justifyContent: 'center',
              }}
            >
              {getMatchesByRound(round).map((match) => (
                <MatchCard key={match.id} match={match} onClick={() => setSelectedMatch(match)} />
              ))}
            </Box>
          </Box>
        ))}

        {/* Champion placeholder */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 2,
              color: tokens.colors.warning,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.7rem',
            }}
          >
            Champion
          </Typography>
          <Paper
            sx={{
              width: 120,
              height: 120,
              bgcolor: `${tokens.colors.warning}10`,
              border: `2px dashed ${tokens.colors.warning}40`,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrophyIcon sx={{ fontSize: 40, color: tokens.colors.warning, mb: 1 }} />
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              TBD
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Match detail dialog */}
      <Dialog
        open={Boolean(selectedMatch)}
        onClose={() => setSelectedMatch(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
          },
        }}
      >
        {selectedMatch && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ flex: 1 }}>
                {ROUND_NAMES[selectedMatch.round - 1]} - Match {selectedMatch.position + 1}
              </Typography>
              {selectedMatch.status === 'live' && (
                <Chip label="LIVE" size="small" sx={{ bgcolor: tokens.colors.error, color: '#fff' }} />
              )}
              {selectedMatch.status === 'complete' && (
                <Chip label="COMPLETE" size="small" sx={{ bgcolor: tokens.colors.success, color: '#fff' }} />
              )}
            </DialogTitle>
            <DialogContent>
              {/* Player matchup */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', py: 3 }}>
                {/* Player 1 */}
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 1,
                      bgcolor:
                        selectedMatch.winner === selectedMatch.player1?.id
                          ? tokens.colors.success
                          : tokens.colors.background.elevated,
                    }}
                  >
                    {selectedMatch.player1?.name[0] || '?'}
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {selectedMatch.player1?.name || 'TBD'}
                  </Typography>
                  {selectedMatch.player1 && (
                    <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                      Seed #{selectedMatch.player1.seed}
                    </Typography>
                  )}
                  {selectedMatch.score1 !== undefined && (
                    <Typography
                      sx={{
                        fontFamily: tokens.fonts.gaming,
                        fontSize: '1.5rem',
                        color:
                          selectedMatch.winner === selectedMatch.player1?.id
                            ? tokens.colors.success
                            : tokens.colors.text.primary,
                        mt: 1,
                      }}
                    >
                      {selectedMatch.score1.toLocaleString()}
                    </Typography>
                  )}
                </Box>

                {/* VS */}
                <Typography
                  sx={{
                    fontFamily: tokens.fonts.gaming,
                    fontSize: '1.2rem',
                    color: tokens.colors.text.disabled,
                  }}
                >
                  VS
                </Typography>

                {/* Player 2 */}
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 1,
                      bgcolor:
                        selectedMatch.winner === selectedMatch.player2?.id
                          ? tokens.colors.success
                          : tokens.colors.background.elevated,
                    }}
                  >
                    {selectedMatch.player2?.name[0] || '?'}
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {selectedMatch.player2?.name || 'TBD'}
                  </Typography>
                  {selectedMatch.player2 && (
                    <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                      Seed #{selectedMatch.player2.seed}
                    </Typography>
                  )}
                  {selectedMatch.score2 !== undefined && (
                    <Typography
                      sx={{
                        fontFamily: tokens.fonts.gaming,
                        fontSize: '1.5rem',
                        color:
                          selectedMatch.winner === selectedMatch.player2?.id
                            ? tokens.colors.success
                            : tokens.colors.text.primary,
                        mt: 1,
                      }}
                    >
                      {selectedMatch.score2.toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </Box>

              {selectedMatch.scheduledTime && selectedMatch.status === 'pending' && (
                <Typography
                  sx={{ textAlign: 'center', color: tokens.colors.text.secondary, mt: 2 }}
                >
                  Scheduled: {selectedMatch.scheduledTime}
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setSelectedMatch(null)}>Close</Button>
              {selectedMatch.status === 'live' && (
                <Button
                  variant="contained"
                  startIcon={<SpectateIcon />}
                  onClick={() => handleSpectate(selectedMatch.id)}
                  sx={{ bgcolor: tokens.colors.error }}
                >
                  Watch Live
                </Button>
              )}
              {selectedMatch.status === 'complete' && (
                <Button
                  variant="contained"
                  startIcon={<PlayIcon />}
                  onClick={() => handleViewReplay(selectedMatch.id)}
                >
                  View Replay
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
