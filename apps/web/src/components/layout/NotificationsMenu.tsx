import { Box, Menu, MenuItem, Typography, Button } from '@mui/material';
import { tokens } from '../../theme';

interface NotificationsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onViewAll: () => void;
}

const mockNotifications = [
  { title: 'New achievement unlocked!', time: '2m ago' },
  { title: 'Your order has shipped', time: '1h ago' },
  { title: 'Welcome to NEVER DIE GUY', time: '2h ago' },
  { title: 'New wiki entry added', time: '5h ago' },
  { title: 'Level up! You reached level 42', time: '1d ago' },
];

export function NotificationsMenu({ anchorEl, open, onClose, onViewAll }: NotificationsMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: { width: 320, bgcolor: tokens.colors.background.paper, mt: 1 },
      }}
    >
      <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${tokens.colors.border}` }}>
        <Typography variant="subtitle2">Inbox</Typography>
      </Box>
      {mockNotifications.map((notif, i) => (
        <MenuItem
          key={i}
          onClick={onClose}
          sx={{ py: 1.5, borderBottom: `1px solid ${tokens.colors.border}` }}
        >
          <Box>
            <Typography variant="body2">{notif.title}</Typography>
            <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
              {notif.time}
            </Typography>
          </Box>
        </MenuItem>
      ))}
      <Box sx={{ p: 1 }}>
        <Button fullWidth size="small" onClick={onViewAll}>
          View all
        </Button>
      </Box>
    </Menu>
  );
}
