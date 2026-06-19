import { ButtonBase, Box, Typography, SxProps, Theme } from '@mui/material';
import { tokens } from '@neverdieguy/tokens';

export type MenuButtonColor = 'red' | 'yellow' | 'neutral' | 'blue';

export interface MenuButtonProps {
  /** Primary line (large). */
  title: string;
  /** Secondary line (small, optional). */
  subtitle?: string;
  color?: MenuButtonColor;
  disabled?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

const colorMap: Record<MenuButtonColor, string> = {
  red: tokens.colors.primary,
  yellow: tokens.colors.warning,
  neutral: tokens.colors.background.elevated,
  blue: tokens.colors.info,
};

/**
 * MenuButton - large two-line action button (Die / Reroll / Continue style).
 * Maps to the BONES "Menu Button" component (Color=Red|Yellow|Neutral|Blue x State).
 */
export function MenuButton({
  title,
  subtitle,
  color = 'red',
  disabled,
  onClick,
  sx,
}: MenuButtonProps) {
  const bg = colorMap[color];
  const onLight = color === 'yellow';
  const fg = color === 'neutral' ? tokens.colors.text.primary : onLight ? '#0a0a0a' : '#fff';

  return (
    <ButtonBase
      disabled={disabled}
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        px: 3,
        py: 2,
        borderRadius: `${tokens.radius.lg}px`,
        backgroundColor: bg,
        color: fg,
        textAlign: 'left',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 150ms ease',
        '&:hover': disabled ? undefined : { filter: 'brightness(1.1)' },
        ...sx,
      }}
    >
      <Box>
        <Typography sx={{ fontFamily: tokens.fonts.gaming, fontSize: '1.25rem', lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ fontSize: '0.8rem', opacity: 0.85, mt: 0.5 }}>{subtitle}</Typography>
        )}
      </Box>
    </ButtonBase>
  );
}
