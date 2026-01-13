/**
 * DomainInfoModal - Shows current domain/zone information
 *
 * Quick reference for the current play state.
 */

import { Box, Dialog, DialogContent, Typography, IconButton, Chip } from '@mui/material';
import { CloseSharp as CloseIcon } from '@mui/icons-material';
import { tokens } from '../../../theme';
import type { DomainState } from '../../../types/zones';

const gamingFont = { fontFamily: tokens.fonts.gaming };

interface DomainInfoModalProps {
  open: boolean;
  onClose: () => void;
  domainState: DomainState | null;
  currentDomain: number;
  roomNumber: number;
  totalScore: number;
  gold: number;
}

export function DomainInfoModal({
  open,
  onClose,
  domainState,
  currentDomain,
  roomNumber,
  totalScore,
  gold,
}: DomainInfoModalProps) {
  const zones = domainState?.zones || [];
  const clearedCount = domainState?.clearedCount || 0;
  const totalZones = domainState?.totalZones || 3;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: tokens.colors.background.paper,
          border: `2px solid ${tokens.colors.border}`,
          borderRadius: 2,
          minWidth: 340,
          maxWidth: 400,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.disabled, letterSpacing: '0.1em' }}>
                DOMAIN {currentDomain}/6
              </Typography>
              <Typography variant="h5" sx={{ ...gamingFont, color: tokens.colors.text.primary }}>
                {domainState?.name || 'Unknown Domain'}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: tokens.colors.text.secondary }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            <Box sx={{ p: 2, bgcolor: tokens.colors.background.elevated, borderRadius: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled, mb: 0.5 }}>
                TOTAL SCORE
              </Typography>
              <Typography sx={{ ...gamingFont, fontSize: '1.25rem', color: tokens.colors.primary }}>
                {totalScore.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: tokens.colors.background.elevated, borderRadius: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', color: tokens.colors.text.disabled, mb: 0.5 }}>
                GOLD
              </Typography>
              <Typography sx={{ ...gamingFont, fontSize: '1.25rem', color: '#ffd700' }}>
                {gold}
              </Typography>
            </Box>
          </Box>

          {/* Zone Progress */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.disabled, mb: 1, letterSpacing: '0.05em' }}>
              ZONES ({clearedCount}/{totalZones})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {zones.map((zone, i) => (
                <Chip
                  key={zone.id}
                  label={`T${zone.tier}`}
                  size="small"
                  sx={{
                    height: 28,
                    fontSize: '0.75rem',
                    ...gamingFont,
                    bgcolor: zone.cleared
                      ? `${tokens.colors.success}20`
                      : tokens.colors.background.elevated,
                    color: zone.cleared ? tokens.colors.success : tokens.colors.text.secondary,
                    border: `1px solid ${zone.cleared ? tokens.colors.success : tokens.colors.border}`,
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Event Progress */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: tokens.colors.text.disabled }}>
              Event Progress:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[1, 2, 3].map((room) => (
                <Box
                  key={room}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: room <= roomNumber ? tokens.colors.success : tokens.colors.background.elevated,
                    border: `1px solid ${room <= roomNumber ? tokens.colors.success : tokens.colors.border}`,
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
