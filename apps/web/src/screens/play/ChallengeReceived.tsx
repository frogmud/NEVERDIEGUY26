import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  SportsEsportsSharp as ChallengeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';

interface ChallengeReceivedDialogProps {
  open: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  playerName?: string;
  playerRank?: number;
}

export function ChallengeReceivedDialog({
  open,
  onClose,
  onAccept,
  onDecline,
  playerName = 'Player',
  playerRank = 42,
}: ChallengeReceivedDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
        },
      }}
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
          Challenge Received
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', paddingTop: '48px !important' }}>
        {/* Challenge icon */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: tokens.colors.background.elevated,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <ChallengeIcon sx={{ fontSize: 32, color: tokens.colors.text.secondary }} />
        </Box>

        <Typography variant="body1" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          You've been challenged to a battle
        </Typography>

        {/* Challenger info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            bgcolor: tokens.colors.background.elevated,
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Avatar sx={{ bgcolor: tokens.colors.background.paper }}>
            {playerName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {playerName}
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              Rank #{playerRank}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" fullWidth onClick={onDecline}>
            Decline
          </Button>
          <Button variant="contained" fullWidth onClick={onAccept}>
            Accept
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
