import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { NavigateNextSharp as NextIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import { CardSection } from '../../components/CardSection';

const sections = [
  {
    title: 'Introduction',
    content: `Welcome to NEVER DIE GUY. These Terms of Service ("Terms") govern your use of the NEVER DIE GUY application, website, and related services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.`,
  },
  {
    title: 'Use of Service',
    content: `You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to: (a) use the Service in any way that violates applicable laws or regulations; (b) use the Service to transmit harmful, offensive, or unauthorized content; (c) attempt to gain unauthorized access to any part of the Service; (d) interfere with or disrupt the Service or servers or networks connected to the Service; (e) use any automated means to access the Service without our express permission.`,
  },
  {
    title: 'Virtual Items & Currency',
    content: `The Service may include virtual currency, items, or other content ("Virtual Items"). Virtual Items have no real-world value and cannot be exchanged for real money. You are granted a limited, revocable license to use Virtual Items within the Service. We reserve the right to modify, remove, or discontinue Virtual Items at any time without liability. All purchases of Virtual Items are final and non-refundable except where required by applicable law.`,
  },
  {
    title: 'Intellectual Property',
    content: `The Service and its original content, features, and functionality are owned by Kevin Grzejka Design LLC and are protected by copyright, trademark, and other intellectual property laws. NEVER DIE GUY is a trademark of Kevin Grzejka Design LLC (USPTO Serial #99074782). You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written consent.`,
  },
  {
    title: 'User Content',
    content: `You may submit content to the Service, including display names, profile information, and in-game communications ("User Content"). You retain ownership of your User Content, but you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your User Content in connection with the Service. You represent that your User Content does not violate any third-party rights.`,
  },
  {
    title: 'Termination',
    content: `We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.`,
  },
  {
    title: 'Disclaimers',
    content: `The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all warranties, express or implied, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components.`,
  },
  {
    title: 'Limitation of Liability',
    content: `To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of the Service.`,
  },
  {
    title: 'Changes to Terms',
    content: `We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.`,
  },
  {
    title: 'Contact Us',
    content: `If you have any questions about these Terms, please contact us at kevin@neverdieguy.com.`,
  },
];

export function Terms() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NextIcon fontSize="small" sx={{ color: tokens.colors.text.disabled }} />}
        sx={{ mb: 3 }}
      >
        <MuiLink
          component={RouterLink}
          to="/"
          sx={{ color: tokens.colors.secondary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Home
        </MuiLink>
        <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>
          Terms of Service
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Terms of Service
      </Typography>
      <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 4 }}>
        Last updated: January 2026
      </Typography>

      <CardSection padding={4}>
        {sections.map((section, i) => (
          <Box key={section.title} sx={{ mb: i < sections.length - 1 ? 4 : 0 }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
              {section.title}
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, lineHeight: 1.7 }}>
              {section.content}
            </Typography>
          </Box>
        ))}
      </CardSection>
    </Box>
  );
}
