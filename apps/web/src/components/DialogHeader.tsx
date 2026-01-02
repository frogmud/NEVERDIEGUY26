import { DialogTitle, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { tokens } from '../theme';

interface DialogHeaderProps {
  title: string;
  onClose: () => void;
}

export function DialogHeader({ title, onClose }: DialogHeaderProps) {
  return (
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
        {title}
      </Typography>
      <IconButton onClick={onClose} size="small">
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
}
