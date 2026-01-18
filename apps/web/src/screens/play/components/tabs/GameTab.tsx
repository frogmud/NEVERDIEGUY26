import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import { tokens } from '../../../../theme';

interface GameTabProps {
  hasSaveData?: boolean;
  savedProgress?: {
    domain: number;
    room: number;
  };
  onNewRun?: () => void;
  onContinue?: () => void;
}

export function GameTab({ hasSaveData = false, savedProgress, onNewRun, onContinue }: GameTabProps) {
  const navigate = useNavigate();

  const handleNewRun = () => {
    if (onNewRun) {
      onNewRun();
    } else {
      navigate('/play/globe');
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate('/play/globe');
    }
  };

  // Format progress subtitle
  const progressText = savedProgress
    ? `Domain ${savedProgress.domain}, Room ${savedProgress.room}`
    : undefined;

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Logo/Title */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box
          component="img"
          src="/logos/ndg-skull-dome.svg"
          alt="NEVERDIEGUY"
          sx={{ width: 40, height: 44 }}
        />
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '1.1rem',
            letterSpacing: '0.05em',
            color: tokens.colors.text.primary,
          }}
        >
          NEVERDIEGUY
        </Typography>
      </Box>

      {/* New Run Button */}
      <ActionButton
        label="New Run"
        onClick={handleNewRun}
        primary
      />

      {/* Continue Button */}
      <ActionButton
        label="Continue"
        subtitle={progressText}
        onClick={handleContinue}
        disabled={!hasSaveData}
      />
    </Box>
  );
}

// Action Button Component
interface ActionButtonProps {
  label: string;
  subtitle?: string;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
}

function ActionButton({ label, subtitle, onClick, disabled = false, primary = false }: ActionButtonProps) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
        py: 2,
        px: 3,
        borderRadius: '12px',
        bgcolor: primary ? tokens.colors.primary : tokens.colors.background.elevated,
        border: `2px solid ${primary ? tokens.colors.primary : tokens.colors.border}`,
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        '&:hover': !disabled
          ? {
              filter: primary ? 'brightness(1.1)' : 'none',
              bgcolor: primary ? undefined : tokens.colors.background.paper,
              borderColor: primary ? undefined : tokens.colors.text.secondary,
              transform: 'scale(1.02)',
            }
          : {},
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.fonts.gaming,
          fontSize: '1.4rem',
          color: tokens.colors.text.primary,
        }}
      >
        {label}
      </Typography>
      {subtitle && (
        <Typography
          sx={{
            fontSize: '0.85rem',
            color: tokens.colors.text.secondary,
            mt: 0.5,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </ButtonBase>
  );
}
