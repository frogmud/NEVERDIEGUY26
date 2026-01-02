import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  ContentCopySharp as CopyIcon,
  CheckSharp as CheckIcon,
  CloseSharp as CloseIcon,
  ShareSharp as ShareIcon,
} from '@mui/icons-material';
import { tokens } from '../theme';

// Social platform configs
const socialPlatforms = [
  {
    id: 'twitter',
    name: 'Twitter',
    color: '#1DA1F2',
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'discord',
    name: 'Discord',
    color: '#5865F2',
    getUrl: () => null, // Discord doesn't have direct share URL
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'reddit',
    name: 'Reddit',
    color: '#FF4500',
    getUrl: (url: string, text: string) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
];

interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  text?: string;
}

export function ShareSheet({
  open,
  onClose,
  url,
  title = 'Share',
  text = 'Check this out!',
}: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  const handleSocialShare = (platform: typeof socialPlatforms[0]) => {
    const shareUrl = platform.getUrl(url, text);
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Native Share Button (mobile) */}
        {hasNativeShare && (
          <Button
            variant="contained"
            fullWidth
            startIcon={<ShareIcon />}
            onClick={handleNativeShare}
            sx={{ mb: 3 }}
          >
            Share...
          </Button>
        )}

        {/* Copy Link Section */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Copy Link
        </Typography>
        <TextField
          fullWidth
          value={url}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleCopy} edge="end">
                  {copied ? (
                    <CheckIcon sx={{ color: tokens.colors.success }} />
                  ) : (
                    <CopyIcon />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Social Platforms */}
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Share to
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
          {socialPlatforms.map((platform) => (
            <Button
              key={platform.id}
              variant="outlined"
              onClick={() => handleSocialShare(platform)}
              disabled={!platform.getUrl(url, text)}
              sx={{
                flexDirection: 'column',
                py: 1.5,
                borderColor: tokens.colors.border,
                '&:hover': {
                  borderColor: platform.color,
                  bgcolor: `${platform.color}10`,
                },
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: platform.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 0.5,
                }}
              >
                <Typography
                  sx={{
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  {platform.name.charAt(0)}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                {platform.name}
              </Typography>
            </Button>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
