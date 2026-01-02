import React from 'react';
import {
  Box,
  Button,
  Chip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from '@mui/material';
import { ExpandMoreSharp as ExpandMoreIcon } from '@mui/icons-material';
import { CardSection } from '../../../components/CardSection';
import { DiceShape } from '../../../components/DiceShapes';
import { RollHistory } from './RollHistory';
import { tokens } from '../../../theme';
import type { DieInfo } from '../../../hooks/useDiceSelection';
import type { RollHistoryEntry } from '../../../hooks/useRollHistory';

// Gaming font style
const gamingFont = { fontFamily: tokens.fonts.gaming };

interface ControlsPanelProps {
  availableDice: DieInfo[];
  selectedDice: string[];
  onToggle: (dieId: string) => void;
  onSummon: () => void;
  onTribute: () => void;
  summons: number;
  tributes: number;
  gameOver: boolean;
  history: RollHistoryEntry[];
  isSmall?: boolean;
  controlsRef?: React.RefObject<HTMLDivElement | null>;
}

export function ControlsPanel({
  availableDice,
  selectedDice,
  onToggle,
  onSummon,
  onTribute,
  summons,
  tributes,
  gameOver,
  history,
  isSmall = false,
  controlsRef,
}: ControlsPanelProps) {
  const [accordionExpanded, setAccordionExpanded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <CardSection
      padding={isSmall ? 1 : 1.5}
      sx={{
        width: '100%',
        maxWidth: 480,
        mt: 1,
        borderRadius: 2,
        overflow: 'hidden',
        animation: 'slideInFromBottom 0.3s ease-out',
        '@keyframes slideInFromBottom': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Dice row - fixed height to prevent expansion */}
      <Box
        ref={controlsRef}
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: isSmall ? 0.75 : 1,
          mb: isSmall ? 1 : 1.5,
          height: isSmall ? 40 : 48,
          minHeight: isSmall ? 40 : 48,
          maxHeight: isSmall ? 40 : 48,
        }}
      >
        {availableDice.map((die) => {
          const isSelected = selectedDice.includes(die.id);
          const diceSize = isSmall ? 32 : 40;
          return (
            <Box
              key={die.id}
              onClick={() => onToggle(die.id)}
              sx={{
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.15s',
                opacity: isSelected ? 1 : 0.6,
                '&:hover': { opacity: 1 },
                // Fixed dimensions to prevent growth
                width: diceSize,
                height: diceSize,
                minWidth: diceSize,
                minHeight: diceSize,
                maxWidth: diceSize,
                maxHeight: diceSize,
                flexShrink: 0,
              }}
            >
              <DiceShape
                sides={die.sides as 4 | 6 | 8 | 10 | 12 | 20}
                size={diceSize}
                color={die.color}
                value={die.sides}
              />
            </Box>
          );
        })}
      </Box>

      {/* Action buttons */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: isSmall ? 0.75 : 1.5,
          alignItems: 'center',
        }}
      >
        <Button
          variant="contained"
          onClick={onSummon}
          disabled={selectedDice.length === 0 || summons <= 0 || gameOver}
          sx={{
            bgcolor: '#3498db',
            minWidth: isSmall ? 100 : 140,
            py: isSmall ? 0.75 : 1.25,
            fontSize: isSmall ? '1.05rem' : '1.25rem',
            ...gamingFont,
            '&:hover': { bgcolor: '#2980b9' },
          }}
        >
          Summon
        </Button>

        <Box
          sx={{
            display: isSmall ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.25,
            bgcolor: tokens.colors.background.elevated,
            borderRadius: 1,
            px: 1.5,
            py: 0.75,
            border: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: tokens.colors.text.secondary,
              ...gamingFont,
              fontSize: '0.7rem',
            }}
          >
            Sort By
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip
              label="Rank"
              size="small"
              sx={{
                ...gamingFont,
                fontSize: '0.75rem',
                bgcolor: '#C4A000',
                color: '#fff',
                height: 22,
              }}
            />
            <Chip
              label="Favor"
              size="small"
              sx={{
                ...gamingFont,
                fontSize: '0.75rem',
                bgcolor: '#C4A000',
                color: '#fff',
                height: 22,
              }}
            />
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={onTribute}
          disabled={selectedDice.length === 0 || tributes <= 0 || gameOver}
          sx={{
            bgcolor: tokens.colors.error,
            minWidth: isSmall ? 100 : 140,
            py: isSmall ? 0.75 : 1.25,
            fontSize: isSmall ? '1.05rem' : '1.25rem',
            ...gamingFont,
            '&:hover': { bgcolor: '#c0392b' },
          }}
        >
          Tribute
        </Button>
      </Box>

      {/* Simple chevron to expand history */}
      <Accordion
        expanded={accordionExpanded}
        onChange={(_, expanded) => setAccordionExpanded(expanded)}
        sx={{
          mt: 0.75,
          bgcolor: 'transparent',
          boxShadow: 'none',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}
          sx={{
            minHeight: 28,
            justifyContent: 'center',
            '& .MuiAccordionSummary-content': { flexGrow: 0, my: 0 },
            '& .MuiAccordionSummary-expandIconWrapper': {
              color: tokens.colors.text.disabled,
              position: 'static',
              transform: 'none',
              ml: 0,
              '&.Mui-expanded': { transform: 'rotate(180deg)' },
            },
            px: 0,
          }}
        />

        <AccordionDetails sx={{ p: 0 }}>
          {/* Tabs for History / Inventory */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              borderBottom: `1px solid ${tokens.colors.border}`,
              minHeight: 32,
            }}
          >
            <Tab
              label="History"
              sx={{ ...gamingFont, fontSize: '0.8rem', minHeight: 32, py: 0.5 }}
            />
            <Tab
              label="Inventory"
              sx={{ ...gamingFont, fontSize: '0.8rem', minHeight: 32, py: 0.5 }}
            />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ maxHeight: 200, overflow: 'hidden' }}>
            {activeTab === 0 && (
              // History Tab - Chess.com style notation
              <RollHistory history={history} maxVisible={6} />
            )}

            {activeTab === 1 && (
              // Inventory Tab (placeholder)
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: tokens.colors.text.disabled,
                  }}
                >
                  Dice inventory coming soon
                </Typography>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </CardSection>
  );
}
