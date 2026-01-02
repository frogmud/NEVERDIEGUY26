import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Skeleton,
  Chip,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  SportsEsportsSharp as ChallengeIcon,
  PersonAddSharp as AddFriendIcon,
  ArrowBackSharp as BackIcon,
  HourglassEmptySharp as PendingIcon,
  CheckSharp as CheckIcon,
  PersonSharp as PersonIcon,
  PersonRemoveSharp as UnfriendIcon,
  Close as CloseIcon,
  BlockSharp as BlockIcon,
  FlagSharp as ReportIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { tokens, sxPatterns, dialogPaperProps } from '../../theme';
import { ChallengeSentDialog } from '../play/ChallengeSent';
import { FriendRequestDialog, FriendRequestSentDialog } from './FriendRequestDialog';
import { BlockUserDialog } from './BlockUserDialog';
import { ReportUserDialog } from './ReportUserDialog';
import { CardSection } from '../../components/CardSection';
import { getUser, type User } from '../../data/users';

type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

// Get user data by ID, with fallback for unknown IDs
function getUserData(id: number): User {
  const user = getUser(id);
  if (user) return user;
  // Fallback for unknown IDs
  return {
    id,
    name: `Player ${id}`,
    rating: 1000 + (id % 500),
    rank: id,
    level: 10 + (id % 50),
    wins: 50 + (id % 100),
    draws: 0,
    losses: 30 + (id % 50),
    achievements: 10 + (id % 30),
    friends: 5 + (id % 20),
    points: 2000 + (id * 100),
    joinDate: 'Jan 2024',
    lastOnline: 'Recently',
    country: 'US',
    bio: 'A mysterious player...',
    favoriteDomain: 'Earth',
    avatar: null,
  };
}

export function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challengeOpen, setChallengeOpen] = useState(false);

  // Friend status state
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [friendRequestOpen, setFriendRequestOpen] = useState(false);
  const [requestSentOpen, setRequestSentOpen] = useState(false);
  const [friendsMenuAnchor, setFriendsMenuAnchor] = useState<null | HTMLElement>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);
  const [unfriendDialogOpen, setUnfriendDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Get user data from mock database
  const userId = Number(id) || 1;
  const userData = getUserData(userId);
  const userName = userData.name;
  const userRank = userData.rank;

  // Handle friend request
  const handleSendFriendRequest = () => {
    setFriendRequestOpen(false);
    setRequestSentOpen(true);
    setFriendStatus('pending_sent');
  };

  // Handle accept friend request
  const handleAcceptRequest = () => {
    setFriendStatus('friends');
  };

  // Handle cancel pending request
  const handleCancelRequest = () => {
    setFriendStatus('none');
  };

  // Handle unfriend
  const handleUnfriend = () => {
    setFriendsMenuAnchor(null);
    setUnfriendDialogOpen(false);
    setFriendStatus('none');
  };

  // Handle block
  const handleBlockUser = () => {
    setBlockDialogOpen(false);
    setFriendStatus('none');
    setSnackbar({
      open: true,
      message: `${userName} has been blocked`,
      severity: 'success',
    });
    // In a real app, would also call an API to block the user
  };

  // Handle report
  const handleReportUser = (reason: string, details?: string) => {
    // Note: ReportUserDialog shows its own success state, but we close it after
    setSnackbar({
      open: true,
      message: 'Report submitted. Thanks for helping keep our community safe.',
      severity: 'info',
    });
    // In a real app, would send this to the backend
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Render friend button based on status
  const renderFriendButton = () => {
    switch (friendStatus) {
      case 'none':
        return (
          <Button
            variant="outlined"
            startIcon={<AddFriendIcon />}
            onClick={() => setFriendRequestOpen(true)}
          >
            Add Friend
          </Button>
        );
      case 'pending_sent':
        return (
          <Button
            variant="outlined"
            startIcon={<PendingIcon />}
            onClick={handleCancelRequest}
            sx={{
              color: tokens.colors.text.secondary,
              borderColor: tokens.colors.border,
            }}
          >
            Request Sent
          </Button>
        );
      case 'pending_received':
        return (
          <Button
            variant="contained"
            startIcon={<AddFriendIcon />}
            onClick={handleAcceptRequest}
          >
            Accept Request
          </Button>
        );
      case 'friends':
        return (
          <Button
            variant="outlined"
            startIcon={<CheckIcon />}
            onClick={(e) => setFriendsMenuAnchor(e.currentTarget)}
            sx={{
              color: tokens.colors.success,
              borderColor: tokens.colors.success,
            }}
          >
            Friends
          </Button>
        );
    }
  };

  return (
    <Box>
      {/* Back button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: tokens.colors.text.secondary }}
      >
        Back
      </Button>

      {/* Profile header */}
      <CardSection padding={4} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Avatar
          sx={{
            width: 120,
            height: 120,
            backgroundColor: userData.rating >= 2000 ? tokens.colors.rarity.legendary
              : userData.rating >= 1800 ? tokens.colors.rarity.epic
              : userData.rating >= 1500 ? tokens.colors.rarity.rare
              : userData.rating >= 1200 ? tokens.colors.rarity.uncommon
              : tokens.colors.background.elevated,
            fontSize: '3rem',
          }}
        >
          {userName.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            {userName}
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 1 }}>
            Rank #{userRank} | Rating: {userData.rating} | Last online: {userData.lastOnline}
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.disabled, mb: 2, fontStyle: 'italic' }}>
            "{userData.bio}"
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label={`Level ${userData.level}`} size="small" sx={{ bgcolor: tokens.colors.background.elevated }} />
            <Chip label={userData.favoriteDomain} size="small" sx={{ bgcolor: tokens.colors.background.elevated }} />
            <Chip label={`Joined ${userData.joinDate}`} size="small" sx={{ bgcolor: tokens.colors.background.elevated }} />
            {friendStatus === 'friends' && (
              <Chip
                label="Friend"
                size="small"
                sx={{
                  bgcolor: `${tokens.colors.success}20`,
                  color: tokens.colors.success,
                }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<ChallengeIcon />}
            onClick={() => setChallengeOpen(true)}
          >
            Challenge
          </Button>
          {renderFriendButton()}
          {/* More menu for non-friends (Block/Report) */}
          {friendStatus !== 'friends' && (
            <IconButton
              onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
              sx={{
                color: tokens.colors.text.secondary,
                '&:hover': {
                  bgcolor: tokens.colors.background.elevated,
                },
              }}
            >
              <MoreIcon />
            </IconButton>
          )}
        </Box>
      </CardSection>

      {/* Friends menu */}
      <Menu
        anchorEl={friendsMenuAnchor}
        open={Boolean(friendsMenuAnchor)}
        onClose={() => setFriendsMenuAnchor(null)}
        PaperProps={{
          sx: {
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={() => { setFriendsMenuAnchor(null); navigate(`/user/${userId}`); }}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => { setFriendsMenuAnchor(null); setUnfriendDialogOpen(true); }}
          sx={{ color: tokens.colors.error }}
        >
          <ListItemIcon>
            <UnfriendIcon fontSize="small" sx={{ color: tokens.colors.error }} />
          </ListItemIcon>
          <ListItemText>Unfriend</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { setFriendsMenuAnchor(null); setBlockDialogOpen(true); }}>
          <ListItemIcon>
            <BlockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Block</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setFriendsMenuAnchor(null); setReportDialogOpen(true); }}>
          <ListItemIcon>
            <ReportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Report</ListItemText>
        </MenuItem>
      </Menu>

      {/* More menu (for non-friends) */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            bgcolor: tokens.colors.background.paper,
            border: `1px solid ${tokens.colors.border}`,
            minWidth: 160,
          },
        }}
      >
        <MenuItem onClick={() => { setMoreMenuAnchor(null); setBlockDialogOpen(true); }}>
          <ListItemIcon>
            <BlockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Block</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setMoreMenuAnchor(null); setReportDialogOpen(true); }}>
          <ListItemIcon>
            <ReportIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Report</ListItemText>
        </MenuItem>
      </Menu>

      {/* Stats */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption">Level Progress</Typography>
          <Typography variant="caption">Lv. {userData.level}</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(userData.level % 10) * 10 + 5}
          sx={sxPatterns.progressBar}
        />
      </Box>

      <CardSection padding={3} sx={{ mb: 4, display: 'flex', justifyContent: 'space-around' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5">{userData.wins.toLocaleString()}</Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Wins</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5">{userData.losses.toLocaleString()}</Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Losses</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5">{userData.achievements.toLocaleString()}</Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Achievements</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5">{userData.friends.toLocaleString()}</Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Friends</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5">{userData.points.toLocaleString()}</Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Points</Typography>
        </Box>
      </CardSection>

      {/* Friends list */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Friends
          </Typography>
          <Button
            size="small"
            onClick={() => navigate('/following')}
            sx={{ color: tokens.colors.text.secondary }}
          >
            See All
          </Button>
        </Box>
        <CardSection padding={2}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: 4,
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: tokens.colors.border,
                borderRadius: 2,
              },
            }}
          >
            {/* Friends list - using real user IDs from MOCK_USERS */}
            {[
              { id: 101, name: 'DeathWalker99', rank: 12, online: true },
              { id: 109, name: 'GrandMaster_Z', rank: 5, online: true },
              { id: 116, name: 'Apex_Predator', rank: 3, online: false },
              { id: 113, name: 'EternalFlame', rank: 9, online: true },
              { id: 107, name: 'xX_Destroyer_Xx', rank: 18, online: false },
              { id: 111, name: 'SilentStorm', rank: 34, online: false },
              { id: 117, name: 'IceQueen', rank: 89, online: true },
              { id: 104, name: 'CrimsonBlade', rank: 45, online: false },
            ].map((friend) => (
              <Box
                key={friend.id}
                onClick={() => navigate(`/user/${friend.id}`)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  minWidth: 72,
                  p: 1,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: tokens.colors.background.elevated,
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: friend.rank <= 10 ? tokens.colors.primary : tokens.colors.background.elevated,
                      fontSize: '1rem',
                    }}
                  >
                    {friend.name.charAt(0)}
                  </Avatar>
                  {/* Online indicator */}
                  {friend.online && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: tokens.colors.success,
                        border: `2px solid ${tokens.colors.background.paper}`,
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: tokens.colors.text.secondary,
                    textAlign: 'center',
                    maxWidth: 64,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {friend.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardSection>
      </Box>

      {/* Recent activity */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent Activity
      </Typography>
      <Paper
        sx={{
          backgroundColor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Box
            key={i}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderBottom: i < 4 ? `1px solid ${tokens.colors.border}` : 'none',
            }}
          >
            <Skeleton
              variant="circular"
              width={32}
              height={32}
              sx={{ bgcolor: tokens.colors.background.elevated }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" sx={{ bgcolor: tokens.colors.background.elevated }} />
            </Box>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              {i === 0 ? '2h ago' : i === 1 ? '5h ago' : i === 2 ? '1d ago' : '2d ago'}
            </Typography>
          </Box>
        ))}
      </Paper>

      {/* Challenge Sent Dialog */}
      <ChallengeSentDialog
        open={challengeOpen}
        onClose={() => setChallengeOpen(false)}
        playerName={userName}
        playerRank={userRank}
      />

      {/* Friend Request Dialog */}
      <FriendRequestDialog
        open={friendRequestOpen}
        onClose={() => setFriendRequestOpen(false)}
        onConfirm={handleSendFriendRequest}
        userName={userName}
        userRank={userRank}
      />

      {/* Request Sent Confirmation */}
      <FriendRequestSentDialog
        open={requestSentOpen}
        onClose={() => setRequestSentOpen(false)}
        userName={userName}
      />

      {/* Unfriend Confirmation Dialog */}
      <Dialog
        open={unfriendDialogOpen}
        onClose={() => setUnfriendDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={dialogPaperProps}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${tokens.colors.border}`,
            pb: 2,
          }}
        >
          <Typography variant="h6" component="span">
            Unfriend {userName}?
          </Typography>
          <IconButton onClick={() => setUnfriendDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            They won't be notified, but you'll be removed from each other's friends list.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" onClick={() => setUnfriendDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleUnfriend}
          >
            Unfriend
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block User Dialog */}
      <BlockUserDialog
        open={blockDialogOpen}
        onClose={() => setBlockDialogOpen(false)}
        onConfirm={handleBlockUser}
        userName={userName}
      />

      {/* Report User Dialog */}
      <ReportUserDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        onSubmit={handleReportUser}
        userName={userName}
      />

      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
