/**
 * Contact - Contact form for help center
 * Submit feedback, bug reports, or general inquiries
 */

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Grid,
} from '@mui/material';
import {
  EmailSharp as EmailIcon,
  CheckCircleSharp as SuccessIcon,
  ForumSharp as DiscordIcon,
  AlternateEmailSharp as TwitterIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';
import { SectionHeader } from '../../components/SectionHeader';

const subjects = [
  'General Question',
  'Bug Report',
  'Feature Request',
  'Account Issue',
  'Billing',
  'Other',
];

const socialLinks = [
  {
    name: 'Discord Community',
    description: 'Join our community for real-time help',
    icon: DiscordIcon,
    url: 'https://discord.gg/neverdieguy',
  },
  {
    name: 'Twitter / X',
    description: 'Follow @neverdieguy for updates',
    icon: TwitterIcon,
    url: 'https://twitter.com/neverdieguy',
  },
];

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open mailto link with form data
    const mailtoSubject = encodeURIComponent(`[NDG] ${subject}`);
    const mailtoBody = encodeURIComponent(`From: ${name} (${email})\n\n${message}`);
    window.open(`mailto:neverdieguy@neverdieguy.com?subject=${mailtoSubject}&body=${mailtoBody}`);
    setSubmitted(true);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setSubmitted(false);
  };

  // Success state
  if (submitted) {
    return (
      <Box>
        <PageHeader title="Contact Us" />
        <CardSection padding={4} sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: `${tokens.colors.success}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <SuccessIcon sx={{ fontSize: 40, color: tokens.colors.success }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Message Sent!
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 4, maxWidth: 400, mx: 'auto' }}>
            Thanks for reaching out. We typically respond within 24-48 hours.
          </Typography>
          <Button variant="outlined" onClick={handleReset}>
            Send Another Message
          </Button>
        </CardSection>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Contact Us" />

      {/* Contact Form */}
      <CardSection padding={4} sx={{ mb: 4 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: `${tokens.colors.primary}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <EmailIcon sx={{ fontSize: 32, color: tokens.colors.primary }} />
        </Box>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 4, textAlign: 'center' }}>
          We'll get back to you within 24-48 hours.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                sx: { backgroundColor: tokens.colors.background.elevated },
              },
            }}
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                sx: { backgroundColor: tokens.colors.background.elevated },
              },
            }}
          />

          <TextField
            select
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            fullWidth
            required
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                sx: { backgroundColor: tokens.colors.background.elevated },
              },
            }}
          >
            {subjects.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
            placeholder="Describe your question or issue in detail..."
            sx={{ mb: 4 }}
            slotProps={{
              input: {
                sx: { backgroundColor: tokens.colors.background.elevated },
              },
            }}
          />

          <Button type="submit" variant="contained" fullWidth size="large">
            Send Message
          </Button>
        </Box>
      </CardSection>

      {/* Alternative Contact Methods */}
      <SectionHeader title="Other Ways to Reach Us" sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Grid size={{ xs: 12, sm: 6 }} key={link.name}>
              <Paper
                component="a"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  backgroundColor: tokens.colors.background.paper,
                  border: `1px solid ${tokens.colors.border}`,
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    borderColor: tokens.colors.secondary,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: tokens.colors.background.elevated,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ color: tokens.colors.secondary }} />
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {link.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
                    {link.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
