/**
 * ReportUserDialog - Report a user for violations
 *
 * Uses the shared ReportDialog component.
 */

import { ReportDialog } from '../../components/dialogs';

const REPORT_REASONS = [
  'Harassment or bullying',
  'Spam or misleading content',
  'Inappropriate content',
  'Impersonation',
  'Cheating or exploits',
  'Other',
] as const;

interface ReportUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details?: string) => void;
  userName: string;
}

export function ReportUserDialog({
  open,
  onClose,
  onSubmit,
  userName,
}: ReportUserDialogProps) {
  return (
    <ReportDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={`Report ${userName}`}
      prompt="Why are you reporting this user?"
      reasons={REPORT_REASONS}
      successTitle="Report Submitted"
      successMessage="Thank you for helping keep our community safe. We'll review your report and take appropriate action."
      maxDetails={150}
    />
  );
}
