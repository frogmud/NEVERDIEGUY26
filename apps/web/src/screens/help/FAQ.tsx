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
      { q: 'What is NEVER DIE GUY?', a: 'NEVER DIE GUY is a roguelike dice game where you explore procedurally generated domains, battle enemies, and collect loot. Each run is unique thanks to the Die-rector favor system and random encounters. The game combines strategic dice rolling with RPG progression.' },
      { q: 'How is this a roguelike?', a: 'Like classic roguelikes, NEVER DIE GUY features permadeath (your run ends when you die), procedural generation (domains and encounters are randomized), and turn-based combat using dice. When you die, you start fresh but keep permanent progression through the meta-game like unlocked patrons and achievements.' },
      { q: 'Is this free to play?', a: 'Yes! The core game is completely free. Premium membership unlocks cosmetic items like dice themes, additional Die-rector patrons, and quality-of-life features like stat tracking. Premium provides no gameplay advantages - it\'s purely optional support.' },
    ],
  },
  {
    category: 'Getting Started',
    questions: [
      { q: 'What do I get with a profile?', a: 'Creating a profile saves your progress across sessions, unlocks the leaderboard so you can compete globally, lets you add friends and view their stats, and syncs your data across devices. You can also customize your avatar and display name.' },
      { q: 'How do I choose a Die-rector patron?', a: 'Go to Settings > Gameplay and select your Die-rector patron. Each Die-rector is associated with a specific die (d4, d6, d8, d10, d12, or d20) and grants favor bonuses when you roll their number. Favor affects drop rates, NPC relationships, and special encounters.' },
      { q: 'How do I start playing?', a: 'From the home screen, tap "Play" to begin a new run. You\'ll choose your starting loadout and domain, then battle through encounters using dice rolls. The wiki (Diepedia) has guides on enemies, items, and strategies if you want to learn more.' },
    ],
  },
  {
    category: 'Future Plans',
    questions: [
      { q: 'What features are coming next?', a: 'We\'re actively developing multiplayer duels, guild systems, seasonal events with exclusive rewards, and new domains. The Play section will expand with tournament modes and spectating. Check the Progress page for development updates.' },
      { q: 'Will there be mobile apps?', a: 'Native iOS and Android apps are planned for 2025. The web version is fully responsive and works great on mobile browsers in the meantime - just add it to your home screen for an app-like experience.' },
    ],
  },
  {
    category: 'Account & Subscription',
    questions: [
      { q: 'How do I cancel my subscription?', a: 'Go to Settings > Membership > Manage Subscription. You can cancel anytime and keep premium features until your billing period ends. We don\'t do sneaky auto-renewals without clear notice.' },
      { q: 'Can I delete my account?', a: 'Yes. Go to Settings > Account > Delete Account. This action is permanent and removes all your data including progress, achievements, and purchase history. We recommend exporting your data first.' },
      { q: 'What payment methods do you accept?', a: 'We accept all major credit cards and PayPal. Regional payment methods vary by location. All payments are securely processed and we never store your full card details.' },
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
