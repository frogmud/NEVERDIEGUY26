import { ReactNode } from 'react';
import { Drawer, Box, IconButton } from '@mui/material';
import { Close as CloseIcon, DragHandle as HandleIcon } from '@mui/icons-material';
import { tokens } from '../theme';

type SheetHeight = 'auto' | 'half' | 'full';

interface BottomSheetProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  height?: SheetHeight;
  showHandle?: boolean;
  showCloseButton?: boolean;
  hideBackdrop?: boolean;
  keepMounted?: boolean;
}

const HEIGHT_MAP: Record<SheetHeight, string> = {
  auto: 'auto',
  half: '50vh',
  full: '90vh',
};

export function BottomSheet({
  open,
  onClose,
  children,
  height = 'auto',
  showHandle = true,
  showCloseButton = false,
  hideBackdrop = false,
  keepMounted = true,
}: BottomSheetProps) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      hideBackdrop={hideBackdrop}
      ModalProps={{
        keepMounted,
        // Allow clicks through when backdrop is hidden
        ...(hideBackdrop && {
          BackdropProps: {
            invisible: true,
            sx: { pointerEvents: 'none' },
          },
        }),
      }}
      PaperProps={{
        sx: {
          borderRadius: '16px 16px 0 0',
          maxHeight: HEIGHT_MAP[height],
          minHeight: height === 'auto' ? 'auto' : HEIGHT_MAP[height],
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${tokens.colors.border}`,
          borderBottom: 'none',
          overflow: 'hidden',
        },
      }}
      sx={{
        // Smooth slide-up animation
        '& .MuiDrawer-paper': {
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1) !important',
        },
      }}
    >
      {/* Handle bar for visual affordance */}
      {showHandle && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pt: 1,
            pb: 0.5,
          }}
        >
          <HandleIcon
            sx={{
              color: tokens.colors.text.disabled,
              fontSize: 28,
            }}
          />
        </Box>
      )}

      {/* Close button (optional) */}
      {showCloseButton && onClose && (
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: tokens.colors.text.secondary,
            '&:hover': {
              color: tokens.colors.text.primary,
              bgcolor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      {/* Content */}
      <Box
        sx={{
          overflow: 'auto',
          maxHeight: height === 'full' ? 'calc(90vh - 40px)' : 'auto',
        }}
      >
        {children}
      </Box>
    </Drawer>
  );
}
