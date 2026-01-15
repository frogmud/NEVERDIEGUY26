import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { NavigateNextSharp as NextIcon } from '@mui/icons-material';
import { tokens } from '../../theme';
import { CardSection } from '../../components/CardSection';

const sections = [
  {
    title: 'Information We Collect',
    content: `We collect information you provide directly to us, such as when you create an account, update your profile, make a purchase, or contact us for support. This may include your email address, username, display name, and payment information. We also automatically collect certain information when you use the Service, including your IP address, device information, browser type, and gameplay data.`,
  },
  {
    title: 'How We Use Information',
    content: `We use the information we collect to: (a) provide, maintain, and improve the Service; (b) process transactions and send related information; (c) send you technical notices, updates, and support messages; (d) respond to your comments, questions, and requests; (e) monitor and analyze trends, usage, and activities; (f) detect, investigate, and prevent fraudulent transactions and other illegal activities; (g) personalize and improve your experience.`,
  },
  {
    title: 'Information Sharing',
    content: `We do not sell your personal information. We may share your information in the following circumstances: (a) with service providers who perform services on our behalf; (b) in response to a request for information if we believe disclosure is required by law; (c) to protect the rights, property, and safety of NEVER DIE GUY, our users, or the public; (d) in connection with a merger, sale of company assets, or acquisition. Aggregate or anonymized information that cannot identify you may be shared without restriction.`,
  },
  {
    title: 'Data Security',
    content: `We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable, and we cannot guarantee the security of our systems. You are responsible for maintaining the secrecy of your account credentials.`,
  },
  {
    title: 'Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide you services. If you wish to delete your account, you may do so through the Settings page. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.`,
  },
  {
    title: 'Your Rights',
    content: `Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data, the right to data portability, and the right to opt out of certain processing. To exercise these rights, please contact us at kevin@neverdieguy.com. We will respond to your request within a reasonable timeframe.`,
  },
  {
    title: 'Cookies & Tracking',
    content: `We use cookies and similar tracking technologies to collect and use personal information about you. Cookies are small data files stored on your device that help us improve your experience. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.`,
  },
  {
    title: "Children's Privacy",
    content: `The Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you believe your child has provided us with personal information, please contact us so that we can take appropriate action.`,
  },
  {
    title: 'International Transfers',
    content: `Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. If you are located outside the United States and choose to provide information to us, please note that we transfer the data to the United States and process it there.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. If we make material changes, we will notify you by updating the date at the top of this policy and, in some cases, we may provide additional notice. Your continued use of the Service after any changes indicates your acceptance of the updated policy.`,
  },
  {
    title: 'Contact Us',
    content: `If you have any questions about this Privacy Policy, please contact us at kevin@neverdieguy.com.`,
  },
];

export function Privacy() {
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
          Privacy Policy
        </Typography>
      </Breadcrumbs>

      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Privacy Policy
      </Typography>
      <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 4 }}>
        Last updated: December 30, 2024
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
