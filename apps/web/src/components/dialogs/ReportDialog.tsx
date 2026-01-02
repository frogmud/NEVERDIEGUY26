/**
 * ReportDialog - Reusable report dialog with radio options and details
 *
 * Consolidates ReportUserDialog and ReportGameDialog patterns.
 * Handles its own success state internally.
 */

import { useState } from 'react';
import {
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@mui/material';
import { FlagSharp as FlagIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import { CircleIcon } from '../CircleIcon';
import { BaseDialog } from './BaseDialog';
import { SuccessDialog } from './SuccessDialog';

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details?: string) => void;
  title: string;
  prompt: string;
  reasons: readonly string[];
  successTitle: string;
  successMessage: string;
  /** Max character limit for details field. Defaults to 150 */
  maxDetails?: number;
  /** Custom actions for success state. If not provided, shows "Done" button */
  successActions?: React.ReactNode;
}

export function ReportDialog({
  open,
  onClose,
  onSubmit,
  title,
  prompt,
  reasons,
  successTitle,
  successMessage,
  maxDetails = 150,
  successActions,
}: ReportDialogProps) {
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (reason) {
      onSubmit(reason, details || undefined);
      setSubmitted(true);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after dialog closes
    setTimeout(() => {
      setReason('');
      setDetails('');
      setSubmitted(false);
    }, 200);
  };

  // Success state
  if (submitted) {
    return (
      <SuccessDialog
        open={open}
        onClose={handleClose}
        title={successTitle}
        message={successMessage}
        actions={successActions}
      />
    );
  }

  return (
    <BaseDialog open={open} onClose={handleClose} title={title}>
      <DialogContent sx={{ paddingTop: '24px !important' }}>
        <CircleIcon icon={<FlagIcon />} color={tokens.colors.text.secondary} />

        <Typography
          variant="body2"
          sx={{ color: tokens.colors.text.secondary, mb: 2 }}
        >
          {prompt}
        </Typography>

        {/* Reason selection */}
        <RadioGroup
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mb: 3 }}
        >
          {reasons.map((r) => (
            <FormControlLabel
              key={r}
              value={r}
              control={
                <Radio
                  size="small"
                  sx={{
                    color: tokens.colors.text.disabled,
                    '&.Mui-checked': {
                      color: tokens.colors.primary,
                    },
                  }}
                />
              }
              label={r}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem',
                  color: tokens.colors.text.secondary,
                },
              }}
            />
          ))}
        </RadioGroup>

        {/* Optional details */}
        <TextField
          fullWidth
          label="Additional details (optional)"
          placeholder="Provide any additional context..."
          multiline
          rows={2}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          inputProps={{ maxLength: maxDetails }}
          helperText={`${details.length}/${maxDetails}`}
          FormHelperTextProps={{
            sx: { textAlign: 'right', mr: 0 },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!reason}>
          Submit Report
        </Button>
      </DialogActions>
    </BaseDialog>
  );
}
