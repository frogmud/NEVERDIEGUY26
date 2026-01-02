/**
 * NarrativeFork - Minimal zone selection through narrative choices
 *
 * Replaces explicit door cards with text-based options like Balatro.
 * Zone type is hidden until selection.
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Fade,
  alpha,
} from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import {
  getDomainNarratives,
  SKIP_OPTION,
  type NarrativeOption,
  type ZoneType,
} from '../../../data/narrativeForks';

export interface NarrativeForkProps {
  /** Current domain slug */
  domainSlug: string;
  /** Called when player selects a path */
  onSelect: (zoneType: ZoneType, isSkip: boolean) => void;
  /** Whether skip option should be shown */
  showSkip?: boolean;
  /** Disable interactions during transitions */
  disabled?: boolean;
}

export function NarrativeFork({
  domainSlug,
  onSelect,
  showSkip = true,
  disabled = false,
}: NarrativeForkProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const narratives = getDomainNarratives(domainSlug);
  const allOptions = showSkip
    ? [...narratives.options, SKIP_OPTION]
    : narratives.options;

  const handleSelect = (index: number) => {
    if (disabled || confirmed) return;
    setSelectedIndex(index);
  };

  const handleConfirm = () => {
    if (selectedIndex === null || disabled || confirmed) return;

    setConfirmed(true);
    const option = allOptions[selectedIndex];
    const isSkip = showSkip && selectedIndex === allOptions.length - 1;

    // Small delay for visual feedback
    setTimeout(() => {
      onSelect(option.zoneType, isSkip);
    }, 300);
  };

  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 2,
        }}
      >
        {/* Intro text */}
        <Typography
          variant="body1"
          sx={{
            fontStyle: 'italic',
            color: 'text.secondary',
            textAlign: 'center',
            mb: 1,
          }}
        >
          {narratives.intro}
        </Typography>

        {/* Options list */}
        <List
          sx={{
            bgcolor: alpha('#000', 0.3),
            borderRadius: 1,
            py: 0,
          }}
        >
          {allOptions.map((option, index) => {
            const isSkipOption = showSkip && index === allOptions.length - 1;
            const isSelected = selectedIndex === index;

            return (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => handleSelect(index)}
                  disabled={disabled || confirmed}
                  selected={isSelected}
                  sx={{
                    py: 1.5,
                    opacity: confirmed && !isSelected ? 0.4 : 1,
                    transition: 'opacity 0.2s',
                    '&.Mui-selected': {
                      bgcolor: alpha('#E90441', 0.15),
                      '&:hover': {
                        bgcolor: alpha('#E90441', 0.2),
                      },
                    },
                    ...(isSkipOption && {
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      color: 'text.disabled',
                    }),
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {isSelected ? (
                      <RadioButtonCheckedIcon
                        sx={{ color: 'primary.main', fontSize: 20 }}
                      />
                    ) : (
                      <RadioButtonUncheckedIcon
                        sx={{ color: 'text.disabled', fontSize: 20 }}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={option.text}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: {
                        fontFamily: isSkipOption ? 'inherit' : '"IBM Plex Mono", monospace',
                      },
                    }}
                  />
                  {option.hint && !isSkipOption && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.disabled',
                        fontStyle: 'italic',
                        ml: 1,
                      }}
                    >
                      {option.hint}
                    </Typography>
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Confirm button */}
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedIndex === null || disabled || confirmed}
          sx={{
            mt: 1,
            py: 1.5,
            fontFamily: '"m6x11plus", monospace',
            fontSize: '1rem',
          }}
        >
          {confirmed ? 'Entering...' : 'Continue'}
        </Button>
      </Box>
    </Fade>
  );
}
