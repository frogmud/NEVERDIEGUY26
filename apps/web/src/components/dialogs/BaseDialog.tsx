/**
 * BaseDialog - Consistent dialog wrapper with standard Paper styling
 *
 * Provides unified styling for all dialogs in the app.
 * Wraps MUI Dialog with dialogPaperProps and optional DialogHeader.
 */

import { Dialog, DialogProps } from '@mui/material';
import { tokens } from '../../theme';
import { DialogHeader } from '../DialogHeader';

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
        },
      }}
      {...dialogProps}
    >
      {showHeader && title && <DialogHeader title={title} onClose={onClose} />}
      {children}
    </Dialog>
  );
}
