import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import {
  ExpandMoreSharp as ExpandIcon,
  HelpOutlineSharp as HelpIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';

const faqData = [
  {
    category: 'About NEVER DIE GUY',
    questions: [
      { q: 'What is NEVER DIE GUY?', a: 'NEVER DIE GUY is a roguelike dice game where you throw meteors at planets to score points and progress through domains. Each run is unique thanks to item combinations and event variety. The game combines dice rolling with Balatro-inspired scoring chains.' },
      { q: 'How is this a roguelike?', a: 'Like classic roguelikes, NEVER DIE GUY features permadeath (your run ends when you lose), procedural generation (events and items are randomized), and strategic choices. When you lose, you start fresh - part of the fun is learning from each attempt.' },
      { q: 'Is this free to play?', a: 'Yes! The game is completely free to play in your browser. No downloads required.' },
    ],
  },
  {
    category: 'Getting Started',
    questions: [
      { q: 'How do I start playing?', a: 'Click "Play" on the home screen to begin a new run. You\'ll throw dice at planets, hit score goals to clear events, and collect items along the way. Check the wiki for more info on items and strategies.' },
      { q: 'What are domains?', a: 'Domains are themed worlds you progress through. Each domain has 3 events to clear. Complete all 6 domains to finish a run. Each domain has unique visual themes and NPCs.' },
      { q: 'How does scoring work?', a: 'Roll dice and throw them at the planet. Your base roll gets modified by items and effects. Hit the score goal to clear the event. The wiki has detailed info on scoring mechanics.' },
    ],
  },
  {
    category: 'Gameplay',
    questions: [
      { q: 'What dice can I use?', a: 'You have a hand of different dice types: D4, D6, D8, D10, D12, and D20. Each has trade-offs between consistency and maximum damage. Build your strategy around your item synergies.' },
      { q: 'How do items work?', a: 'Items modify your dice rolls with flat bonuses, multipliers, and triggered effects. Finding synergies between items is key to high scores. Check item descriptions for proc conditions.' },
      { q: 'Can I practice without risking my run?', a: 'The game automatically starts in practice mode from the home page. You can also access practice through character pages in the wiki.' },
    ],
  },
  {
    category: 'Future Plans',
    questions: [
      { q: 'What features are coming next?', a: 'We\'re working on more items, domains, and NPCs. Multiplayer modes and leaderboards are planned for future updates.' },
      { q: 'Will there be mobile apps?', a: 'Native iOS and Android apps are planned for 2026. The web version works great on mobile browsers in the meantime - just add it to your home screen for an app-like experience.' },
    ],
  },
];

export function FAQ() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions"
      />

      {faqData.map((section) => (
        <Box key={section.category} sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 2, color: tokens.colors.text.primary }}
          >
            {section.category}
          </Typography>
          <Box
            sx={{
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {section.questions.map((item, i) => {
              const panelId = `${section.category}-${i}`;
              return (
                <Accordion
                  key={panelId}
                  expanded={expanded === panelId}
                  onChange={handleChange(panelId)}
                  disableGutters
                  sx={{
                    backgroundColor: tokens.colors.background.paper,
                    boxShadow: 'none',
                    '&:before': { display: 'none' },
                    borderBottom: i < section.questions.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandIcon sx={{ color: tokens.colors.text.secondary }} />}
                    sx={{
                      '&:hover': {
                        backgroundColor: tokens.colors.background.elevated,
                      },
                    }}
                  >
                    <Typography variant="body1">{item.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      backgroundColor: tokens.colors.background.elevated,
                      borderTop: `1px solid ${tokens.colors.border}`,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                      {item.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </Box>
      ))}

      {/* Still need help CTA */}
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
          mt: 2,
          borderTop: `1px solid ${tokens.colors.border}`,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: tokens.colors.background.elevated,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <HelpIcon sx={{ fontSize: 32, color: tokens.colors.text.disabled }} />
        </Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Still need help?
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          Can't find what you're looking for? Our support team is here to help.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/help/contact')}
        >
          Contact Us
        </Button>
      </Box>
    </Container>
  );
}
