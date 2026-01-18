/**
 * BaseDialog - Consistent dialog wrapper with standard Paper styling
 *
 * Provides unified styling for all dialogs in the app.
 * Wraps MUI Dialog with dialogPaperProps and optional DialogHeader.
 * Balatro-style entrance animation.
 */

import { Dialog, DialogProps, keyframes } from '@mui/material';
import { tokens } from '../../theme';
import { DialogHeader } from '../DialogHeader';
import { MODAL, EASING } from '../../utils/transitions';

// Modal entrance animation
const modalEnter = keyframes`
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
`;

interface BaseDialogProps extends Omit<DialogProps, 'title'> {
  title?: string;
  onClose: () => void;
  showHeader?: boolean;
  children: React.ReactNode;
}

export function BaseDialog({
  open,
  onClose,
  title,
  showHeader = true,
  maxWidth = 'xs',
  children,
  ...dialogProps
}: BaseDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          // Balatro-style entrance animation
          animation: `${modalEnter} ${MODAL.enter}ms ${EASING.smooth}`,
        },
      }}
      {...dialogProps}
    >
      {showHeader && title && <DialogHeader title={title} onClose={onClose} />}
      {children}
    </Dialog>
  );
}
