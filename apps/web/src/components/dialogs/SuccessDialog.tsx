/**
 * SuccessDialog - Simple success confirmation dialog
 *
 * Use for: Friend request sent, report submitted, action completed
 */

import { Dialog, DialogContent, Typography, Button, Box } from '@mui/material';
import { CheckCircleOutline as SuccessIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import { CircleIcon } from '../CircleIcon';
import { useSoundContext } from '../../contexts/SoundContext';

// Use dialogPaperProps style directly since we don't need header
const dialogPaperProps = {
  sx: {
    bgcolor: tokens.colors.background.paper,
    border: `1px solid ${tokens.colors.border}`,
  },
};

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  iconColor?: string;
  title: string;
  message: string;
  /** Custom action buttons. If not provided, shows a "Done" button */
  actions?: React.ReactNode;
}

export function SuccessDialog({
  open,
  onClose,
  icon = <SuccessIcon />,
  iconColor = tokens.colors.success,
  title,
  message,
  actions,
}: SuccessDialogProps) {
  const { playUIClick } = useSoundContext();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={dialogPaperProps}
    >
      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <CircleIcon icon={icon} color={iconColor} mb={2} />

        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          {message}
        </Typography>

        {actions ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {actions}
          </Box>
        ) : (
          <Button variant="contained" fullWidth onClick={() => { playUIClick(); onClose(); }}>
            Done
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
