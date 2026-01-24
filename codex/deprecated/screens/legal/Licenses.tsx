import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Chip,
  Collapse,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  SearchSharp as SearchIcon,
  ExpandMoreSharp as ExpandIcon,
  ExpandLessSharp as CollapseIcon,
  CodeSharp as CodeIcon,
  ImageSharp as ImageIcon,
  MusicNoteSharp as MusicIcon,
  TextFieldsSharp as FontIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { PageHeader } from '../../components/Placeholder';
import { CardSection } from '../../components/CardSection';

type License = {
  name: string;
  version?: string;
  license: string;
  category: 'code' | 'assets' | 'audio' | 'fonts';
  url?: string;
  description?: string;
};

const licenses: License[] = [
  // Code - Core
  { name: 'React', version: '19.1.0', license: 'MIT', category: 'code', url: 'https://react.dev', description: 'UI framework' },
  { name: 'Material-UI', version: '7.3.5', license: 'MIT', category: 'code', url: 'https://mui.com', description: 'Component library' },
  { name: 'React Router', version: '7.6.1', license: 'MIT', category: 'code', url: 'https://reactrouter.com', description: 'Client-side routing' },
  { name: 'Emotion', version: '11.14.0', license: 'MIT', category: 'code', url: 'https://emotion.sh', description: 'CSS-in-JS styling' },
  // Code - Game
  { name: 'Phaser', version: '3.90.0', license: 'MIT', category: 'code', url: 'https://phaser.io', description: 'Game framework powering Meteor mode' },
  { name: 'RPG Dice Roller', version: '5.5.1', license: 'MIT', category: 'code', url: 'https://dice-roller.github.io/documentation/', description: 'Dice notation parser and roller by GreenImp' },
  { name: 'DotLottie React', version: '0.17.10', license: 'MIT', category: 'code', url: 'https://lottiefiles.com', description: 'Lottie animations' },
  { name: 'JSZip', version: '3.10.1', license: 'MIT', category: 'code', url: 'https://stuk.github.io/jszip/', description: 'ZIP file generation' },
  // Code - Build
  { name: 'Vite', version: '6.3.5', license: 'MIT', category: 'code', url: 'https://vite.dev', description: 'Build tooling' },
  { name: 'TypeScript', version: '5.8.3', license: 'Apache-2.0', category: 'code', url: 'https://typescriptlang.org', description: 'Type system' },
  // Fonts
  { name: 'Inter', license: 'OFL-1.1', category: 'fonts', url: 'https://rsms.me/inter/', description: 'Primary UI typeface' },
  { name: 'Press Start 2P', license: 'OFL-1.1', category: 'fonts', url: 'https://fonts.google.com/specimen/Press+Start+2P', description: 'Gaming/brand typeface by CodeMan38' },
  { name: 'IBM Plex Mono', license: 'OFL-1.1', category: 'fonts', url: 'https://fonts.google.com/specimen/IBM+Plex+Mono', description: 'Monospace code typeface' },
  // Assets
  { name: 'Material Icons', license: 'Apache-2.0', category: 'assets', description: 'UI iconography' },
  { name: 'Original Artwork', license: 'Proprietary', category: 'assets', description: 'All game art is proprietary to Kevin Grzejka Design LLC' },
  // Audio
  { name: 'Original Soundtrack', license: 'Proprietary', category: 'audio', description: 'All music is proprietary to Kevin Grzejka Design LLC' },
  { name: 'Sound Effects', license: 'Various', category: 'audio', description: 'Mix of licensed and original audio' },
];

const categoryConfig = {
  code: { icon: CodeIcon, label: 'Code Libraries', color: tokens.colors.secondary },
  assets: { icon: ImageIcon, label: 'Visual Assets', color: tokens.colors.primary },
  audio: { icon: MusicIcon, label: 'Audio', color: tokens.colors.warning },
  fonts: { icon: FontIcon, label: 'Fonts', color: '#7c4dff' },
};

export function Licenses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('code');

  const filteredLicenses = licenses.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.license.toLowerCase().includes(search.toLowerCase())
  );

  const groupedLicenses = {
    code: filteredLicenses.filter((l) => l.category === 'code'),
    fonts: filteredLicenses.filter((l) => l.category === 'fonts'),
    assets: filteredLicenses.filter((l) => l.category === 'assets'),
    audio: filteredLicenses.filter((l) => l.category === 'audio'),
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 2 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, color: tokens.colors.text.secondary }}
      >
        Back
      </Button>

      <PageHeader
        title="Licenses & Credits"
        subtitle="Open source and third-party acknowledgments"
      />

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <CardSection sx={{ flex: 1, textAlign: 'center', py: 2 }}>
          <Typography variant="h5" sx={{ fontFamily: tokens.fonts.gaming, color: tokens.colors.primary }}>
            {licenses.filter((l) => l.category === 'code').length}
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
            Libraries
          </Typography>
        </CardSection>
        <CardSection sx={{ flex: 1, textAlign: 'center', py: 2 }}>
          <Typography variant="h5" sx={{ fontFamily: tokens.fonts.gaming, color: '#7c4dff' }}>
            {licenses.filter((l) => l.category === 'fonts').length}
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
            Fonts
          </Typography>
        </CardSection>
        <CardSection sx={{ flex: 1, textAlign: 'center', py: 2 }}>
          <Typography variant="h5" sx={{ fontFamily: tokens.fonts.gaming, color: tokens.colors.warning }}>
            {licenses.filter((l) => l.license === 'MIT').length}
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
            MIT Licensed
          </Typography>
        </CardSection>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search licenses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: tokens.colors.text.secondary }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Categories */}
      {(Object.keys(groupedLicenses) as Array<keyof typeof groupedLicenses>).map((category) => {
        const config = categoryConfig[category];
        const Icon = config.icon;
        const items = groupedLicenses[category];
        const isExpanded = expandedCategory === category;

        if (items.length === 0) return null;

        return (
          <CardSection key={category} sx={{ mb: 2 }}>
            <Box
              onClick={() => setExpandedCategory(isExpanded ? null : category)}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                    bgcolor: `${config.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ color: config.color, fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2">{config.label}</Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </Typography>
                </Box>
              </Box>
              {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
            </Box>

            <Collapse in={isExpanded}>
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${tokens.colors.border}` }}>
                {items.map((item) => (
                  <Box
                    key={item.name}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      '&:not(:last-child)': {
                        borderBottom: `1px solid ${tokens.colors.border}`,
                      },
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{item.name}</Typography>
                        {item.version && (
                          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>
                            v{item.version}
                          </Typography>
                        )}
                      </Box>
                      {item.description && (
                        <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
                          {item.description}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={item.license}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.7rem',
                        borderColor:
                          item.license === 'Proprietary'
                            ? tokens.colors.primary
                            : tokens.colors.border,
                        color:
                          item.license === 'Proprietary'
                            ? tokens.colors.primary
                            : tokens.colors.text.secondary,
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Collapse>
          </CardSection>
        );
      })}

      {/* Notice */}
      <CardSection sx={{ bgcolor: tokens.colors.background.elevated }}>
        <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>
          NEVER DIE GUY is built with open source software. We're grateful to the
          developers and maintainers of these projects. All proprietary content,
          including artwork, music, and game design, is owned by Kevin Grzejka Design LLC.
        </Typography>
      </CardSection>
    </Box>
  );
}
