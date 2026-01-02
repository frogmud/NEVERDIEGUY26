/**
 * ReportGameDialog - Report game issues or provide feedback
 *
 * Uses the shared ReportDialog component with custom success actions.
 */

import { Button } from '@mui/material';
import {
  HomeSharp as HomeIcon,
  RefreshSharp as RefreshIcon,
} from '@mui/icons-material';
import { ReportDialog } from './dialogs';

const REPORT_REASONS = [
  'Game bug or glitch',
  'Visual or audio issue',
  'Performance problem',
  'Gameplay feedback',
  'Feature suggestion',
  'Other',
] as const;

interface ReportGameDialogProps {
  open: boolean;
  onClose: () => void;
  onBackToHome?: () => void;
}

export function ReportGameDialog({
  open,
  onClose,
  onBackToHome,
}: ReportGameDialogProps) {
  const handleSubmit = (reason: string, details?: string) => {
    // In real app, would send to backend here
    console.log('Game report submitted:', { reason, details });
  };

  const handleBackToHome = () => {
    onClose();
    onBackToHome?.();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Custom success actions with Back to Home and Refresh options
  const successActions = (
    <>
      {onBackToHome && (
        <Button
          variant="contained"
          fullWidth
          startIcon={<HomeIcon />}
          onClick={handleBackToHome}
        >
          Back to Home
        </Button>
      )}
      <Button
        variant="outlined"
        fullWidth
        startIcon={<RefreshIcon />}
        onClick={handleRefresh}
      >
        Refresh Page
      </Button>
    </>
  );

  return (
    <ReportDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Report Issue"
      prompt="What would you like to report?"
      reasons={REPORT_REASONS}
      successTitle="Thanks for the Report"
      successMessage="Your feedback helps us improve the game."
      maxDetails={300}
      successActions={successActions}
    />
  );
}
