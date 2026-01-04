import { useNavigate } from 'react-router-dom';
import { Box, Typography, ButtonBase } from '@mui/material';
import { HistorySharp as HistoryIcon } from '@mui/icons-material';
import { tokens } from '../../../../theme';

interface GameTabProps {
  hasSaveData?: boolean;
  onNewRun?: () => void;
  onContinue?: () => void;
}

export function GameTab({ hasSaveData = true, onNewRun, onContinue }: GameTabProps) {
  const navigate = useNavigate();

  const handleNewRun = () => {
    if (onNewRun) {
      onNewRun();
    } else {
      // Default: navigate to 3D globe game
      navigate('/play/globe');
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      // Default: navigate to 3D globe game (continue)
      navigate('/play/globe');
    }
  };

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Logo/Title */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          mb: 1,
        }}
      >
        <Box
          component="img"
          src="/logos/ndg-skull-dome.svg"
          alt="NEVERDIEGUY"
          sx={{ width: 32, height: 36 }}
        />
        <Typography
          sx={{
            fontFamily: tokens.fonts.gaming,
            fontSize: '1rem',
            letterSpacing: '0.05em',
            color: tokens.colors.text.primary,
          }}
        >
          NEVERDIEGUY
        </Typography>
      </Box>

      {/* New Run Card */}
      <ActionCard
        sprite="/assets/ui/dice/d20-01.png"
        label="New Run"
        onClick={handleNewRun}
      />

      {/* Continue Card */}
      <ActionCard
        sprite="/assets/ui/dice/d20-03.png"
        label="Continue"
        onClick={handleContinue}
        disabled={!hasSaveData}
      />

      {/* Quick Links Row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          mt: 1,
        }}
      >
        <QuickLink
          icon={<HistoryIcon sx={{ fontSize: 20 }} />}
          label="History"
          onClick={() => navigate('/progress')}
        />
      </Box>
    </Box>
  );
}

// Action Card Component
interface ActionCardProps {
  sprite: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

function ActionCard({ sprite, label, onClick, disabled = false }: ActionCardProps) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: '16px',
        bgcolor: tokens.colors.background.elevated,
        border: `1px solid ${tokens.colors.border}`,
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        '&:hover': !disabled
          ? {
              bgcolor: tokens.colors.background.paper,
              borderColor: tokens.colors.text.secondary,
            }
          : {},
      }}
    >
      {/* Sprite */}
      <Box
        sx={{
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Box
          component="img"
          src={sprite}
          alt={label}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
        />
      </Box>

      {/* Label */}
      <Typography
        sx={{
          fontFamily: tokens.fonts.gaming,
          fontSize: '1.25rem',
          color: tokens.colors.text.primary,
          flex: 1,
          textAlign: 'left',
        }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
}

// Quick Link Component
interface QuickLinkProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function QuickLink({ icon, label, onClick }: QuickLinkProps) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.5,
        py: 1,
        borderRadius: 2,
        color: tokens.colors.text.secondary,
        transition: 'all 0.15s ease',
        '&:hover': {
          color: tokens.colors.text.primary,
          bgcolor: tokens.colors.background.elevated,
        },
      }}
    >
      {icon}
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
        {label}
      </Typography>
    </ButtonBase>
  );
}
