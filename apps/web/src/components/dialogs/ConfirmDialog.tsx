/**
 * ConfirmDialog - Reusable confirmation dialog with icon, content, and actions
 *
 * Use for: Block user, delete confirmation, any yes/no decision
 */

import { DialogContent, DialogActions, Button } from '@mui/material';
import { tokens } from '../../theme';
import { CircleIcon } from '../CircleIcon';
import { BaseDialog } from './BaseDialog';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  icon: React.ReactNode;
  iconColor?: string;
  confirmLabel?: string;
  confirmColor?: 'primary' | 'error' | 'success' | 'warning';
  cancelLabel?: string;
  children: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  icon,
  iconColor = tokens.colors.primary,
  confirmLabel = 'Confirm',
  confirmColor = 'primary',
  cancelLabel = 'Cancel',
  children,
}: ConfirmDialogProps) {
  return (
    <BaseDialog open={open} onClose={onClose} title={title}>
      <DialogContent sx={{ paddingTop: '24px !important' }}>
        <CircleIcon icon={icon} color={iconColor} />
        {children}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button variant="outlined" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </BaseDialog>
  );
}
