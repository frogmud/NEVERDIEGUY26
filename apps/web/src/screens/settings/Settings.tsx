import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProfile, saveProfile, type ProfileData } from '../../data/player/storage';
import { useSettings } from '../../contexts/SettingsContext';
import {
  Box,
  Typography,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Drawer,
  IconButton,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Container,
} from '@mui/material';
import {
  CloseSharp as CloseIcon,
  ChevronRightSharp as ChevronRightIcon,
  Circle as CircleIcon,
  CheckSharp as CheckIcon,
} from '@mui/icons-material';
import { tokens, dialogPaperProps, PRESENCE_COLORS } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { BaseCard } from '../../components/BaseCard';
import { SectionHeader } from '../../components/SectionHeader';

interface SettingsItem {
  name: string;
  type: string;
  value?: string;
  default?: boolean;
  link?: string;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

// Settings sections factory - uses profile for dynamic values
function getSettingsSections(profile: ProfileData | null): SettingsSection[] {
  const statusLabels: Record<string, string> = {
    online: 'Online',
    away: 'Away',
    dnd: 'Do Not Disturb',
    invisible: 'Invisible',
  };

  return [
  {
    title: 'Account',
    items: [
      { name: 'Username', value: `@${profile?.displayName.toLowerCase().replace(/\s+/g, '') || 'player'}`, type: 'drawer' },
      { name: 'Status', value: statusLabels[profile?.status || 'online'], type: 'drawer' },
      { name: 'Email', value: 'user@example.com', type: 'drawer' },
      { name: 'Password', value: '********', type: 'drawer' },
      { name: 'Two-factor authentication', value: 'Disabled', type: 'dialog' },
      { name: 'Devices & Sessions', value: '4 active devices', type: 'link', link: '/settings/devices' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { name: 'Theme', type: 'switch', default: true },
      { name: 'Language', value: 'English', type: 'drawer' },
      { name: 'Notifications', type: 'switch', default: true },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      { name: 'Privacy settings', value: 'Public profile', type: 'link', link: '/settings/privacy' },
      { name: 'Connected accounts', value: '2 connected', type: 'link', link: '/settings/connected-accounts' },
    ],
  },
  {
    title: 'Data',
    items: [
      { name: 'Export data', type: 'dialog' },
      { name: 'Erase personal data', type: 'link', link: '/settings/erase-data' },
      { name: 'Delete account', type: 'danger-dialog' },
    ],
  },
  ];
}

const statusOptions = [
  { id: 'online', label: 'Online', color: PRESENCE_COLORS.online },
  { id: 'away', label: 'Away', color: PRESENCE_COLORS.away },
  { id: 'dnd', label: 'Do Not Disturb', color: PRESENCE_COLORS.busy },
  { id: 'invisible', label: 'Invisible', color: PRESENCE_COLORS.offline },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'pt', name: 'Portuguese' },
];

export function Settings() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode, notificationsEnabled, setNotificationsEnabled } = useSettings();

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Load profile on mount
  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<{ title: string; type: string }>({ title: '', type: '' });

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<{ title: string; value?: string }>({ title: '' });

  // Form states for drawers (initialized from profile)
  const [username, setUsername] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'online' | 'away' | 'dnd' | 'invisible'>('online');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Sync form state when profile loads
  useEffect(() => {
    if (profile) {
      setUsername(profile.displayName.toLowerCase().replace(/\s+/g, ''));
      setSelectedStatus(profile.status);
    }
  }, [profile]);

  // Get switch value from context
  const getSwitchValue = (name: string): boolean => {
    if (name === 'Theme') return darkMode;
    if (name === 'Notifications') return notificationsEnabled;
    return false;
  };

  // Toggle switch using context setters
  const handleSwitchToggle = (name: string) => {
    if (name === 'Theme') setDarkMode(!darkMode);
    if (name === 'Notifications') setNotificationsEnabled(!notificationsEnabled);
  };

  const handleItemClick = (item: SettingsItem) => {
    if (item.type === 'switch') {
      handleSwitchToggle(item.name);
    } else if (item.type === 'link' && item.link) {
      navigate(item.link);
    } else if (item.type === 'drawer') {
      setDrawerContent({ title: item.name, value: item.value });
      setDrawerOpen(true);
    } else {
      setDialogContent({ title: item.name, type: item.type });
      setDialogOpen(true);
    }
  };

  return (
    <Container maxWidth="md">
      <PageHeader title="Settings" subtitle="Manage your account" />

      {getSettingsSections(profile).map((section) => (
        <Box key={section.title} sx={{ mb: 3 }}>
          <SectionHeader title={section.title} sx={{ mb: 2 }} />
          <BaseCard padding={0}>
            {section.items.map((item, i) => (
              <Box
                key={item.name}
                onClick={() => handleItemClick(item)}
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: i < section.items.length - 1 ? `1px solid ${tokens.colors.border}` : 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: tokens.colors.background.elevated,
                  },
                }}
              >
                <Box>
                  <Typography variant="body1">{item.name}</Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                    {item.value || ''}
                  </Typography>
                </Box>
                {item.type === 'switch' ? (
                  <Switch
                    checked={getSwitchValue(item.name)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleSwitchToggle(item.name)}
                  />
                ) : (
                  <ChevronRightIcon sx={{ color: tokens.colors.text.disabled }} />
                )}
              </Box>
            ))}
          </BaseCard>
        </Box>
      ))}

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          backdrop: {
            sx: { bgcolor: 'rgba(0, 0, 0, 0.5)' },
          },
        }}
        PaperProps={{
          sx: {
            width: 400,
            bgcolor: tokens.colors.background.paper,
            top: 56,
            height: 'calc(100vh - 56px)',
            borderLeft: `1px solid ${tokens.colors.border}`,
          }
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${tokens.colors.border}`,
          }}
        >
          <Typography variant="h5">{drawerContent.title}</Typography>
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 3 }}>
          {drawerContent.title === 'Email' && (
            <>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
                Update your email address. You'll need to verify the new email.
              </Typography>
              <TextField
                fullWidth
                label="Current email"
                defaultValue={drawerContent.value}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="New email"
                placeholder="Enter new email"
                sx={{ mb: 3 }}
              />
              <Button variant="contained" fullWidth>Update Email</Button>
            </>
          )}
          {drawerContent.title === 'Password' && (
            <form onSubmit={(e) => e.preventDefault()}>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
                Choose a strong password with at least 8 characters.
              </Typography>
              {/* Hidden username field for accessibility */}
              <input type="hidden" name="username" autoComplete="username" value="user@example.com" readOnly />
              <TextField
                fullWidth
                label="Current password"
                type="password"
                autoComplete="current-password"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="New password"
                type="password"
                autoComplete="new-password"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                sx={{ mb: 3 }}
              />
              <Button variant="contained" fullWidth type="submit">Update Password</Button>
            </form>
          )}
          {drawerContent.title === 'Username' && (
            <>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
                Your username is how others find and mention you.
              </Typography>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                InputProps={{
                  startAdornment: <Typography sx={{ color: tokens.colors.text.disabled, mr: 0.5 }}>@</Typography>,
                }}
                sx={{ mb: 3 }}
              />
              <Button variant="contained" fullWidth onClick={() => {
                if (profile) {
                  const updatedProfile = { ...profile, displayName: username || 'Player', updatedAt: Date.now() };
                  saveProfile(updatedProfile);
                  setProfile(updatedProfile);
                }
                setDrawerOpen(false);
              }}>
                Save Username
              </Button>
            </>
          )}
          {drawerContent.title === 'Status' && (
            <>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
                Let others know your availability.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 3 }}>
                {statusOptions.map((option) => (
                  <Box
                    key={option.id}
                    onClick={() => setSelectedStatus(option.id as 'online' | 'away' | 'dnd' | 'invisible')}
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      cursor: 'pointer',
                      borderRadius: 1,
                      backgroundColor: selectedStatus === option.id ? tokens.colors.background.elevated : 'transparent',
                      '&:hover': { backgroundColor: tokens.colors.background.elevated },
                    }}
                  >
                    <CircleIcon sx={{ color: option.color, fontSize: 12 }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>{option.label}</Typography>
                    {selectedStatus === option.id && (
                      <CheckIcon sx={{ color: tokens.colors.primary, fontSize: 18 }} />
                    )}
                  </Box>
                ))}
              </Box>
              <Button variant="contained" fullWidth onClick={() => {
                if (profile) {
                  const updatedProfile = { ...profile, status: selectedStatus, updatedAt: Date.now() };
                  saveProfile(updatedProfile);
                  setProfile(updatedProfile);
                }
                setDrawerOpen(false);
              }}>
                Save Status
              </Button>
            </>
          )}
          {drawerContent.title === 'Language' && (
            <>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
                Choose your preferred language.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 3 }}>
                {languages.map((lang) => (
                  <Box
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      cursor: 'pointer',
                      borderRadius: 1,
                      backgroundColor: selectedLanguage === lang.code ? tokens.colors.background.elevated : 'transparent',
                      '&:hover': { backgroundColor: tokens.colors.background.elevated },
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>{lang.name}</Typography>
                    {selectedLanguage === lang.code && (
                      <CheckIcon sx={{ color: tokens.colors.primary, fontSize: 18 }} />
                    )}
                  </Box>
                ))}
              </Box>
              <Button variant="contained" fullWidth onClick={() => setDrawerOpen(false)}>
                Save Language
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {/* Settings Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={dialogPaperProps}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${tokens.colors.border}`,
            pb: 2,
          }}
        >
          <Typography variant="h5" component="span">{dialogContent.title}</Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '32px !important' }}>
          {dialogContent.type === 'danger-dialog' ? (
            <>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
                This action cannot be undone. This will permanently delete your account and all associated data.
              </Typography>
              <TextField
                fullWidth
                label="Type 'DELETE' to confirm"
                sx={{ mt: 2 }}
              />
            </>
          ) : dialogContent.title === 'Two-factor authentication' ? (
            <>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
                Add an extra layer of security to your account.
              </Typography>
              <RadioGroup defaultValue="disabled">
                <FormControlLabel value="disabled" control={<Radio />} label="Disabled" />
                <FormControlLabel value="sms" control={<Radio />} label="SMS verification" />
                <FormControlLabel value="app" control={<Radio />} label="Authenticator app" />
              </RadioGroup>
            </>
          ) : dialogContent.title === 'Export data' ? (
            <>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
                Download a copy of all your data. This may take a few minutes.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <FormControlLabel control={<Switch defaultChecked />} label="Profile information" />
                <FormControlLabel control={<Switch defaultChecked />} label="Activity history" />
                <FormControlLabel control={<Switch defaultChecked />} label="Achievements" />
                <FormControlLabel control={<Switch />} label="Purchase history" />
              </Box>
            </>
          ) : (
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
              Configure your {dialogContent.title.toLowerCase()} settings.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setDialogOpen(false)}
            color={dialogContent.type === 'danger-dialog' ? 'error' : 'primary'}
          >
            {dialogContent.type === 'danger-dialog' ? 'Delete Account' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
