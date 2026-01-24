import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Switch,
  Divider,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  CookieSharp as CookieIcon,
  CheckCircleSharp as CheckIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';

type CookieCategory = {
  id: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
};

const initialCategories: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description: 'Required for the app to function. These cannot be disabled.',
    required: true,
    enabled: true,
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    description: 'Remember your preferences like language, theme, and display settings.',
    required: false,
    enabled: true,
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us understand how you use the app so we can improve it.',
    required: false,
    enabled: true,
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'Used to show you relevant promotions and measure campaign effectiveness.',
    required: false,
    enabled: false,
  },
];

export function CookieSettings() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(initialCategories);
  const [saved, setSaved] = useState(false);

  const handleToggle = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id && !cat.required ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    // In real app, would persist to localStorage/backend
  };

  const handleAcceptAll = () => {
    setCategories((prev) => prev.map((cat) => ({ ...cat, enabled: true })));
    setSaved(true);
  };

  const handleRejectNonEssential = () => {
    setCategories((prev) =>
      prev.map((cat) => ({ ...cat, enabled: cat.required }))
    );
    setSaved(true);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 2 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: tokens.colors.text.secondary }}
      >
        Back
      </Button>

      <PageHeader
        title="Cookie Settings"
        subtitle="Manage your cookie preferences"
      />

      {/* Info */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          p: 2,
          mb: 3,
          bgcolor: `${tokens.colors.secondary}10`,
          border: `1px solid ${tokens.colors.secondary}30`,
          borderRadius: 1,
        }}
      >
        <CookieIcon sx={{ color: tokens.colors.secondary }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            About Cookies
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
            We use cookies to provide a better experience, remember your preferences,
            and understand how you use our app. You can adjust your settings below.
          </Typography>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" fullWidth onClick={handleAcceptAll}>
          Accept All
        </Button>
        <Button variant="outlined" fullWidth onClick={handleRejectNonEssential}>
          Essential Only
        </Button>
      </Box>

      {/* Categories */}
      <CardSection sx={{ mb: 3 }}>
        {categories.map((category, index) => (
          <Box key={category.id}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                py: 2,
              }}
            >
              <Box sx={{ flex: 1, pr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2">{category.name}</Typography>
                  {category.required && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: tokens.colors.text.disabled,
                        fontStyle: 'italic',
                      }}
                    >
                      (Required)
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                  {category.description}
                </Typography>
              </Box>
              <Switch
                checked={category.enabled}
                onChange={() => handleToggle(category.id)}
                disabled={category.required}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: tokens.colors.primary,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: tokens.colors.primary,
                  },
                }}
              />
            </Box>
            {index < categories.length - 1 && <Divider />}
          </Box>
        ))}
      </CardSection>

      {/* Save */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSave}
          disabled={saved}
          startIcon={saved ? <CheckIcon /> : null}
        >
          {saved ? 'Preferences Saved' : 'Save Preferences'}
        </Button>
      </Box>

      {saved && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 2,
            color: tokens.colors.success,
          }}
        >
          Your cookie preferences have been saved.
        </Typography>
      )}

      {/* More Info */}
      <CardSection sx={{ mt: 3, bgcolor: tokens.colors.background.elevated }}>
        <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
          For more information about how we use cookies and your data, please read our{' '}
          <Typography
            component="span"
            variant="caption"
            sx={{ color: tokens.colors.primary, cursor: 'pointer' }}
            onClick={() => navigate('/privacy')}
          >
            Privacy Policy
          </Typography>
          .
        </Typography>
      </CardSection>
    </Box>
  );
}
