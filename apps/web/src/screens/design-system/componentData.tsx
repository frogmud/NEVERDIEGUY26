import { ReactNode } from 'react';
import { Box, Typography, Button, Chip, Switch, Alert, Paper, Stack, Avatar, Skeleton, LinearProgress, Divider, Collapse } from '@mui/material';
import {
  HomeSharp as HomeIcon,
  StarSharp as StarIcon,
  MenuSharp as MenuIcon,
  CloseSharp as CloseIcon,
  ExpandMoreSharp as ExpandMoreIcon,
  CheckSharp as CheckIcon,
  BlockSharp as BlockIcon,
  FlagSharp as FlagIcon,
  NotificationsSharp as NotificationsIcon,
  PersonAddSharp as PersonAddIcon,
  OpenInNewSharp as OpenInNewIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';

export interface ComponentInfo {
  id: string;
  name: string;
  category: 'Foundation' | 'Layout' | 'Inputs' | 'Data Display' | 'Feedback' | 'Navigation' | 'Dialogs' | 'Game UI' | 'Icons';
  description: string;
  preview: ReactNode;
}

// Simple preview components (static, no interactivity)
const ColorPreview = () => (
  <Stack direction="row" spacing={0.5}>
    <Box sx={{ width: 24, height: 24, bgcolor: tokens.colors.primary, borderRadius: 0.5 }} />
    <Box sx={{ width: 24, height: 24, bgcolor: tokens.colors.secondary, borderRadius: 0.5 }} />
    <Box sx={{ width: 24, height: 24, bgcolor: tokens.colors.success, borderRadius: 0.5 }} />
    <Box sx={{ width: 24, height: 24, bgcolor: tokens.colors.warning, borderRadius: 0.5 }} />
  </Stack>
);

const TypographyPreview = () => (
  <Stack spacing={0.5}>
    <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>Heading</Typography>
    <Typography sx={{ fontSize: '0.75rem' }}>Body text</Typography>
    <Typography sx={{ fontSize: '0.65rem', fontFamily: 'monospace' }}>Code</Typography>
  </Stack>
);

const TokensPreview = () => (
  <Stack direction="row" spacing={1}>
    {[4, 8, 12, 16].map((size) => (
      <Box
        key={size}
        sx={{
          width: size,
          height: size,
          bgcolor: tokens.colors.background.elevated,
          borderRadius: 0.5,
        }}
      />
    ))}
  </Stack>
);

const BaseCardPreview = () => (
  <Box
    sx={{
      p: 1.5,
      bgcolor: tokens.colors.background.paper,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: 1,
    }}
  >
    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Card</Typography>
    <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.text.secondary }}>Content here</Typography>
  </Box>
);

const SectionHeaderPreview = () => (
  <Box sx={{ borderBottom: `1px solid ${tokens.colors.border}`, pb: 0.5 }}>
    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Section Title</Typography>
  </Box>
);

const StatCardPreview = () => (
  <Box sx={{ textAlign: 'center', p: 1 }}>
    <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: tokens.colors.primary }}>42</Typography>
    <Typography sx={{ fontSize: '0.65rem', color: tokens.colors.text.secondary }}>Items</Typography>
  </Box>
);

const IconBadgePreview = () => (
  <Stack direction="row" spacing={1}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: tokens.colors.background.elevated,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <HomeIcon sx={{ fontSize: 16 }} />
    </Box>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: tokens.colors.background.elevated,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <StarIcon sx={{ fontSize: 16, color: tokens.colors.warning }} />
    </Box>
  </Stack>
);

const DataBadgePreview = () => (
  <Stack direction="row" spacing={0.5}>
    <Box
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 1,
        border: `1px solid ${tokens.colors.primary}`,
        color: tokens.colors.primary,
        fontSize: '0.6rem',
      }}
    >
      Primary
    </Box>
    <Box
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 1,
        border: `1px solid ${tokens.colors.success}`,
        color: tokens.colors.success,
        fontSize: '0.6rem',
      }}
    >
      Success
    </Box>
  </Stack>
);

const ListItemRowPreview = () => (
  <Stack spacing={0.5}>
    {['Home', 'Settings'].map((item) => (
      <Box
        key={item}
        sx={{
          py: 0.5,
          px: 1,
          bgcolor: tokens.colors.background.paper,
          borderRadius: 0.5,
          fontSize: '0.7rem',
        }}
      >
        {item}
      </Box>
    ))}
  </Stack>
);

const ButtonPreview = () => (
  <Stack direction="row" spacing={0.5}>
    <Button variant="contained" size="small" sx={{ fontSize: '0.65rem', minWidth: 0, px: 1 }}>
      Primary
    </Button>
    <Button variant="outlined" size="small" sx={{ fontSize: '0.65rem', minWidth: 0, px: 1 }}>
      Sharp
    </Button>
  </Stack>
);

const ChipPreview = () => (
  <Stack direction="row" spacing={0.5}>
    <Chip label="Tag" size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
    <Chip label="Active" size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: tokens.colors.background.elevated }} />
  </Stack>
);

const TextFieldPreview = () => (
  <Box
    sx={{
      p: 0.75,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: 0.5,
      bgcolor: tokens.colors.background.paper,
      fontSize: '0.65rem',
      color: tokens.colors.text.disabled,
      width: 100,
    }}
  >
    Enter text...
  </Box>
);

const SwitchPreview = () => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Switch size="small" defaultChecked sx={{ transform: 'scale(0.7)' }} />
    <Switch size="small" sx={{ transform: 'scale(0.7)' }} />
  </Stack>
);

const AlertPreview = () => (
  <Alert severity="info" sx={{ py: 0, fontSize: '0.65rem', '& .MuiAlert-icon': { fontSize: 16 } }}>
    Info message
  </Alert>
);

const PaperPreview = () => (
  <Stack direction="row" spacing={0.5}>
    <Paper sx={{ p: 1, bgcolor: tokens.colors.background.paper, fontSize: '0.6rem' }}>Default</Paper>
    <Paper sx={{ p: 1, bgcolor: tokens.colors.background.elevated, fontSize: '0.6rem' }}>Elevated</Paper>
  </Stack>
);

// New MUI Component Previews
const DialogPreview = () => (
  <Box
    sx={{
      p: 1.5,
      bgcolor: tokens.colors.background.paper,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: 1,
      width: 100,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Dialog</Typography>
      <CloseIcon sx={{ fontSize: 12 }} />
    </Box>
    <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.text.secondary }}>Content</Typography>
  </Box>
);

const DrawerPreview = () => (
  <Box sx={{ display: 'flex', width: 80, height: 50 }}>
    <Box
      sx={{
        width: 24,
        bgcolor: tokens.colors.background.paper,
        borderRight: `1px solid ${tokens.colors.border}`,
        p: 0.5,
      }}
    >
      <Stack spacing={0.5}>
        <Box sx={{ height: 8, bgcolor: tokens.colors.background.elevated, borderRadius: 0.5 }} />
        <Box sx={{ height: 8, bgcolor: tokens.colors.background.elevated, borderRadius: 0.5 }} />
      </Stack>
    </Box>
    <Box sx={{ flex: 1, bgcolor: tokens.colors.background.default }} />
  </Box>
);

const MenuPreview = () => (
  <Box
    sx={{
      p: 0.5,
      bgcolor: tokens.colors.background.paper,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: 0.5,
      width: 70,
    }}
  >
    <Stack spacing={0.25}>
      {['Edit', 'Copy', 'Delete'].map((item) => (
        <Box
          key={item}
          sx={{
            py: 0.25,
            px: 0.5,
            fontSize: '0.55rem',
            borderRadius: 0.25,
            '&:first-of-type': { bgcolor: tokens.colors.background.elevated },
          }}
        >
          {item}
        </Box>
      ))}
    </Stack>
  </Box>
);

const TabsPreview = () => (
  <Stack direction="row" spacing={1} sx={{ borderBottom: `1px solid ${tokens.colors.border}`, pb: 0.5 }}>
    <Box sx={{ fontSize: '0.65rem', color: tokens.colors.primary, borderBottom: `2px solid ${tokens.colors.primary}`, pb: 0.5 }}>
      Tab 1
    </Box>
    <Box sx={{ fontSize: '0.65rem', color: tokens.colors.text.secondary }}>Tab 2</Box>
    <Box sx={{ fontSize: '0.65rem', color: tokens.colors.text.secondary }}>Tab 3</Box>
  </Stack>
);

const TablePreview = () => (
  <Box sx={{ fontSize: '0.55rem' }}>
    <Box sx={{ display: 'flex', gap: 1.5, fontWeight: 600, borderBottom: `1px solid ${tokens.colors.border}`, pb: 0.5, mb: 0.5 }}>
      <Box sx={{ width: 40 }}>Name</Box>
      <Box sx={{ width: 30 }}>Type</Box>
    </Box>
    {['Item A', 'Item B'].map((item) => (
      <Box key={item} sx={{ display: 'flex', gap: 1.5, py: 0.25 }}>
        <Box sx={{ width: 40 }}>{item}</Box>
        <Box sx={{ width: 30, color: tokens.colors.text.secondary }}>Rare</Box>
      </Box>
    ))}
  </Box>
);

const AvatarPreview = () => (
  <Stack direction="row" spacing={0.5}>
    <Avatar sx={{ width: 28, height: 28, bgcolor: tokens.colors.primary, fontSize: '0.7rem' }}>A</Avatar>
    <Avatar sx={{ width: 28, height: 28, bgcolor: tokens.colors.secondary, fontSize: '0.7rem' }}>B</Avatar>
    <Avatar sx={{ width: 28, height: 28, bgcolor: tokens.colors.warning, fontSize: '0.7rem' }}>C</Avatar>
  </Stack>
);

const SkeletonPreview = () => (
  <Stack spacing={0.5} sx={{ width: 80 }}>
    <Skeleton variant="text" width="100%" height={12} sx={{ bgcolor: tokens.colors.background.elevated }} />
    <Skeleton variant="text" width="70%" height={12} sx={{ bgcolor: tokens.colors.background.elevated }} />
    <Skeleton variant="rectangular" width="100%" height={24} sx={{ bgcolor: tokens.colors.background.elevated, borderRadius: 0.5 }} />
  </Stack>
);

const ProgressPreview = () => (
  <Stack spacing={1} sx={{ width: 100 }}>
    <LinearProgress variant="determinate" value={60} sx={{ height: 6, borderRadius: 1 }} />
    <LinearProgress variant="determinate" value={30} sx={{ height: 6, borderRadius: 1 }} />
  </Stack>
);

const TooltipPreview = () => (
  <Box sx={{ position: 'relative' }}>
    <Box
      sx={{
        px: 1,
        py: 0.5,
        bgcolor: tokens.colors.background.elevated,
        borderRadius: 0.5,
        fontSize: '0.6rem',
        position: 'absolute',
        top: -24,
        left: '50%',
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
      }}
    >
      Tooltip text
    </Box>
    <Typography sx={{ fontSize: '0.65rem', textDecoration: 'underline dotted' }}>Hover me</Typography>
  </Box>
);

const DividerPreview = () => (
  <Stack spacing={1} sx={{ width: 80 }}>
    <Divider sx={{ borderColor: tokens.colors.border }} />
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ flex: 1, height: 1, bgcolor: tokens.colors.border }} />
      <Typography sx={{ fontSize: '0.55rem', color: tokens.colors.text.disabled }}>OR</Typography>
      <Box sx={{ flex: 1, height: 1, bgcolor: tokens.colors.border }} />
    </Stack>
  </Stack>
);

// Placeholder Utility Previews
const PageHeaderPreview = () => (
  <Box>
    <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.text.disabled, mb: 0.25 }}>Home / Wiki</Typography>
    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Page Title</Typography>
    <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.text.secondary }}>Subtitle here</Typography>
  </Box>
);

const CardGridPreview = () => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5 }}>
    {[1, 2, 3].map((i) => (
      <Box
        key={i}
        sx={{
          height: 24,
          bgcolor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: 0.5,
        }}
      />
    ))}
  </Box>
);

const StatsRowPreview = () => (
  <Stack direction="row" spacing={0.5}>
    {['42', '89%', '7d'].map((val) => (
      <Box
        key={val}
        sx={{
          p: 0.5,
          bgcolor: tokens.colors.background.paper,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: 0.5,
          textAlign: 'center',
          flex: 1,
        }}
      >
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: tokens.colors.primary }}>{val}</Typography>
      </Box>
    ))}
  </Stack>
);

const PlaceholderCardPreview = () => (
  <Box
    sx={{
      p: 1,
      bgcolor: tokens.colors.background.paper,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: 1,
      width: 80,
    }}
  >
    <Skeleton variant="rectangular" height={24} sx={{ bgcolor: tokens.colors.background.elevated, mb: 0.5, borderRadius: 0.5 }} />
    <Skeleton variant="text" width="80%" height={10} sx={{ bgcolor: tokens.colors.background.elevated }} />
    <Skeleton variant="text" width="60%" height={10} sx={{ bgcolor: tokens.colors.background.elevated }} />
  </Box>
);

const InfoboxPreview = () => (
  <Box
    sx={{
      p: 1,
      bgcolor: tokens.colors.background.paper,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: 0.5,
      width: 70,
    }}
  >
    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, textAlign: 'center', mb: 0.5 }}>Title</Typography>
    <Box sx={{ fontSize: '0.5rem' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><span>HP:</span><span>100</span></Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><span>ATK:</span><span>50</span></Box>
    </Box>
  </Box>
);

// Dialog System Previews
const BaseDialogPreview = () => (
  <Box
    sx={{
      p: 1.5,
      bgcolor: tokens.colors.background.paper,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: 1,
      width: 100,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Title</Typography>
      <CloseIcon sx={{ fontSize: 12, color: tokens.colors.text.secondary }} />
    </Box>
    <Box sx={{ height: 20, bgcolor: tokens.colors.background.elevated, borderRadius: 0.5, mb: 1 }} />
    <Typography sx={{ fontSize: '0.55rem', color: tokens.colors.text.secondary }}>Dialog content</Typography>
  </Box>
);

const ConfirmDialogPreview = () => (
  <Box
    sx={{
      p: 1,
      bgcolor: tokens.colors.background.paper,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: 1,
      width: 90,
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        bgcolor: `${tokens.colors.error}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 0.5,
      }}
    >
      <BlockIcon sx={{ fontSize: 14, color: tokens.colors.error }} />
    </Box>
    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, mb: 0.5 }}>Confirm?</Typography>
    <Stack direction="row" spacing={0.5} justifyContent="center">
      <Box sx={{ px: 0.75, py: 0.25, fontSize: '0.5rem', border: `1px solid ${tokens.colors.border}`, borderRadius: 0.5 }}>Cancel</Box>
      <Box sx={{ px: 0.75, py: 0.25, fontSize: '0.5rem', bgcolor: tokens.colors.error, color: '#fff', borderRadius: 0.5 }}>Confirm</Box>
    </Stack>
  </Box>
);

const SuccessDialogPreview = () => (
  <Box
    sx={{
      p: 1,
      bgcolor: tokens.colors.background.paper,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: 1,
      width: 90,
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        bgcolor: `${tokens.colors.success}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 0.5,
      }}
    >
      <CheckIcon sx={{ fontSize: 14, color: tokens.colors.success }} />
    </Box>
    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, mb: 0.25 }}>Success!</Typography>
    <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.text.secondary }}>Action completed</Typography>
  </Box>
);

const ReportDialogPreview = () => (
  <Box
    sx={{
      p: 1,
      bgcolor: tokens.colors.background.paper,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: 1,
      width: 100,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
      <FlagIcon sx={{ fontSize: 12, color: tokens.colors.warning }} />
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>Report</Typography>
    </Box>
    <Stack spacing={0.25}>
      {['Reason 1', 'Reason 2'].map((r, i) => (
        <Box
          key={r}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: '0.5rem',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              border: `1px solid ${i === 0 ? tokens.colors.primary : tokens.colors.border}`,
              bgcolor: i === 0 ? tokens.colors.primary : 'transparent',
            }}
          />
          {r}
        </Box>
      ))}
    </Stack>
  </Box>
);

// DS Utility Component Previews
const CardHeaderPreview = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      p: 1,
      borderBottom: `1px solid ${tokens.colors.border}`,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>Title</Typography>
      <Box
        sx={{
          px: 0.5,
          py: 0.125,
          borderRadius: 0.5,
          bgcolor: tokens.colors.background.elevated,
          fontSize: '0.5rem',
        }}
      >
        12
      </Box>
    </Box>
    <OpenInNewIcon sx={{ fontSize: 12, color: tokens.colors.text.secondary }} />
  </Box>
);

const ExpandableSectionPreview = () => (
  <Box
    sx={{
      p: 1,
      bgcolor: tokens.colors.background.paper,
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: 0.5,
      width: 100,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <StarIcon sx={{ fontSize: 12, color: tokens.colors.warning }} />
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 500 }}>Section</Typography>
      </Box>
      <ExpandMoreIcon sx={{ fontSize: 12, color: tokens.colors.text.secondary }} />
    </Box>
    <Collapse in>
      <Box sx={{ mt: 0.5, pt: 0.5, borderTop: `1px solid ${tokens.colors.border}`, fontSize: '0.5rem', color: tokens.colors.text.secondary }}>
        Expanded content
      </Box>
    </Collapse>
  </Box>
);

const StatusBannerPreview = () => (
  <Stack spacing={0.5}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: 0.5,
        bgcolor: `${tokens.colors.warning}15`,
        border: `1px solid ${tokens.colors.warning}40`,
      }}
    >
      <NotificationsIcon sx={{ fontSize: 10, color: tokens.colors.warning }} />
      <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.warning }}>Warning banner</Typography>
    </Box>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: 0.5,
        bgcolor: `${tokens.colors.success}15`,
        border: `1px solid ${tokens.colors.success}40`,
      }}
    >
      <CheckIcon sx={{ fontSize: 10, color: tokens.colors.success }} />
      <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.success }}>Success banner</Typography>
    </Box>
  </Stack>
);

const BottomSheetPreview = () => (
  <Box sx={{ position: 'relative', width: 80, height: 50 }}>
    <Box sx={{ height: 30, bgcolor: tokens.colors.background.default, opacity: 0.5 }} />
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 28,
        bgcolor: tokens.colors.background.paper,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        p: 0.5,
      }}
    >
      <Box sx={{ width: 20, height: 3, bgcolor: tokens.colors.border, borderRadius: 1, mx: 'auto', mb: 0.5 }} />
      <Typography sx={{ fontSize: '0.5rem', textAlign: 'center' }}>Sheet content</Typography>
    </Box>
  </Box>
);

const ToastPreview = () => (
  <Stack spacing={0.5}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        bgcolor: tokens.colors.background.elevated,
        borderRadius: 0.5,
        border: `1px solid ${tokens.colors.border}`,
      }}
    >
      <CheckIcon sx={{ fontSize: 10, color: tokens.colors.success }} />
      <Typography sx={{ fontSize: '0.5rem' }}>Action completed</Typography>
    </Box>
  </Stack>
);

const CharacterSpritePreview = () => (
  <Stack direction="row" spacing={0.5} alignItems="flex-end">
    <Box
      sx={{
        width: 32,
        height: 32,
        bgcolor: tokens.colors.background.elevated,
        borderRadius: 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.5rem',
        color: tokens.colors.text.disabled,
      }}
    >
      1x
    </Box>
    <Box
      sx={{
        width: 24,
        height: 24,
        bgcolor: tokens.colors.background.elevated,
        borderRadius: 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.45rem',
        color: tokens.colors.text.disabled,
      }}
    >
      0.75x
    </Box>
  </Stack>
);

const AnimatedSpritePreview = () => (
  <Box sx={{ position: 'relative', width: 40, height: 40 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        bgcolor: tokens.colors.background.elevated,
        borderRadius: 0.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.5rem',
        color: tokens.colors.text.disabled,
      }}
    >
      1-4
    </Box>
    <Box
      sx={{
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 12,
        height: 12,
        borderRadius: '50%',
        bgcolor: tokens.colors.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography sx={{ fontSize: '0.4rem', color: '#fff' }}>4</Typography>
    </Box>
  </Box>
);

const DicePreview = () => (
  <Stack direction="row" spacing={0.5}>
    {['D4', 'D6', 'D8'].map((d) => (
      <Box
        key={d}
        sx={{
          width: 20,
          height: 20,
          bgcolor: tokens.colors.background.elevated,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: d === 'D6' ? 2 : d === 'D4' ? '0 50% 50% 50%' : 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.45rem',
          fontWeight: 600,
        }}
      >
        {d}
      </Box>
    ))}
  </Stack>
);

// Additional Component Previews
const TokenIconPreview = () => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: tokens.colors.warning, opacity: 0.8 }} />
    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: tokens.colors.warning }} />
    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: tokens.colors.warning }} />
  </Stack>
);

const WikiLinkPreview = () => (
  <Stack spacing={0.5}>
    <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.secondary, textDecoration: 'underline' }}>Void Spawn</Typography>
    <Box sx={{ px: 0.75, py: 0.25, bgcolor: tokens.colors.background.elevated, border: `1px solid ${tokens.colors.secondary}`, borderRadius: 2, fontSize: '0.5rem', color: tokens.colors.secondary, display: 'inline-block', width: 'fit-content' }}>chip</Box>
  </Stack>
);

const DialogHeaderPreview = () => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: `1px solid ${tokens.colors.border}`, width: 100 }}>
    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>Title</Typography>
    <CloseIcon sx={{ fontSize: 12, color: tokens.colors.text.secondary }} />
  </Box>
);

const StatRowPreview = () => (
  <Box sx={{ width: 90 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
      <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.text.secondary }}>Wins</Typography>
      <Typography sx={{ fontSize: '0.5rem' }}>847</Typography>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.text.secondary }}>Rate</Typography>
      <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.success }}>68.7%</Typography>
    </Box>
  </Box>
);

const CardSectionPreview = () => (
  <Box sx={{ p: 1, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, borderRadius: 3, width: 70 }}>
    <Box sx={{ height: 20, bgcolor: tokens.colors.background.elevated, borderRadius: 1 }} />
  </Box>
);

const SettingRowPreview = () => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, borderBottom: `1px solid ${tokens.colors.border}`, width: 100 }}>
    <Box>
      <Typography sx={{ fontSize: '0.55rem', fontWeight: 500 }}>Setting</Typography>
      <Typography sx={{ fontSize: '0.45rem', color: tokens.colors.text.disabled }}>Description</Typography>
    </Box>
    <Box sx={{ width: 20, height: 12, borderRadius: 6, bgcolor: tokens.colors.primary }} />
  </Box>
);

const ShareSheetPreview = () => (
  <Box sx={{ p: 1, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, borderRadius: 1, width: 90 }}>
    <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, mb: 0.5 }}>Share</Typography>
    <Stack direction="row" spacing={0.5}>
      {['T', 'F', 'R'].map((p, i) => (
        <Box key={p} sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: ['#1DA1F2', '#1877F2', '#FF4500'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.4rem', color: '#fff', fontWeight: 700 }}>{p}</Box>
      ))}
    </Stack>
  </Box>
);

const MarketSpritePreview = () => (
  <Stack direction="row" spacing={0.5} alignItems="flex-end">
    <Box sx={{ width: 32, height: 32, bgcolor: tokens.colors.background.elevated, borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', color: tokens.colors.text.disabled }}>idle</Box>
    <Box sx={{ width: 28, height: 28, bgcolor: tokens.colors.background.elevated, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.4rem', color: tokens.colors.text.disabled }}>port</Box>
  </Stack>
);

const LuckyNumberPickerPreview = () => (
  <Stack direction="row" spacing={0.5}>
    {[1, 2, 3].map((n) => (
      <Box key={n} sx={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${n === 2 ? tokens.colors.success : tokens.colors.border}`, bgcolor: n === 2 ? `${tokens.colors.success}20` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 700, color: n === 2 ? tokens.colors.success : tokens.colors.text.disabled }}>{n}</Box>
    ))}
  </Stack>
);

const SortableHeaderPreview = () => (
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
      <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.text.disabled }}>Name</Typography>
      <ExpandMoreIcon sx={{ fontSize: 8, color: tokens.colors.text.disabled }} />
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
      <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.text.secondary }}>Score</Typography>
      <ExpandMoreIcon sx={{ fontSize: 8, color: tokens.colors.text.secondary, transform: 'rotate(180deg)' }} />
    </Box>
  </Box>
);

const AssetImagePreview = () => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    <Box sx={{ width: 24, height: 24, bgcolor: tokens.colors.background.elevated, borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.4rem', color: tokens.colors.text.disabled }}>img</Box>
    <Box sx={{ width: 24, height: 24, bgcolor: tokens.colors.background.elevated, borderRadius: 0.5, border: `1px dashed ${tokens.colors.text.disabled}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.35rem', color: tokens.colors.text.disabled }}>404</Box>
  </Stack>
);

const BronzePlacardPreview = () => (
  <Box sx={{ width: 40, height: 32, bgcolor: '#CD7F32', borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box sx={{ width: 30, height: 22, border: '1px solid rgba(0,0,0,0.2)', borderRadius: 0.25 }} />
  </Box>
);

const CircleIconDetailPreview = () => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: `${tokens.colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <StarIcon sx={{ fontSize: 10, color: tokens.colors.primary }} />
    </Box>
    <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: `${tokens.colors.success}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CheckIcon sx={{ fontSize: 12, color: tokens.colors.success }} />
    </Box>
    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: `${tokens.colors.warning}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <StarIcon sx={{ fontSize: 14, color: tokens.colors.warning }} />
    </Box>
  </Stack>
);

export const componentRegistry: ComponentInfo[] = [
  // Foundations
  {
    id: 'colors',
    name: 'Colors',
    category: 'Foundation',
    description: 'Brand and semantic color palette',
    preview: <ColorPreview />,
  },
  {
    id: 'typography',
    name: 'Typography',
    category: 'Foundation',
    description: 'Type scale and text styles',
    preview: <TypographyPreview />,
  },
  {
    id: 'tokens',
    name: 'Tokens',
    category: 'Foundation',
    description: 'Spacing, radius, and design tokens',
    preview: <TokensPreview />,
  },

  // Custom Components - Layout
  {
    id: 'base-card',
    name: 'BaseCard',
    category: 'Layout',
    description: 'Container card with hover states',
    preview: <BaseCardPreview />,
  },
  {
    id: 'section-header',
    name: 'SectionHeader',
    category: 'Layout',
    description: 'Section title with icon and action',
    preview: <SectionHeaderPreview />,
  },
  {
    id: 'paper',
    name: 'Paper',
    category: 'Layout',
    description: 'Surface elevation component',
    preview: <PaperPreview />,
  },

  // Custom Components - Data Display
  {
    id: 'stat-card',
    name: 'StatCard',
    category: 'Data Display',
    description: 'Statistic display card',
    preview: <StatCardPreview />,
  },
  {
    id: 'icon-badge',
    name: 'IconBadge',
    category: 'Data Display',
    description: 'Circular icon container',
    preview: <IconBadgePreview />,
  },
  {
    id: 'data-badge',
    name: 'DataBadge',
    category: 'Data Display',
    description: 'Status and type badge',
    preview: <DataBadgePreview />,
  },
  {
    id: 'chip',
    name: 'Chip',
    category: 'Data Display',
    description: 'Filter chips and tags',
    preview: <ChipPreview />,
  },

  // Inputs
  {
    id: 'button',
    name: 'Button',
    category: 'Inputs',
    description: 'Primary, outlined, and text variants',
    preview: <ButtonPreview />,
  },
  {
    id: 'text-field',
    name: 'TextField',
    category: 'Inputs',
    description: 'Text input field',
    preview: <TextFieldPreview />,
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'Inputs',
    description: 'Toggle switch control',
    preview: <SwitchPreview />,
  },

  // Navigation
  {
    id: 'list-item-row',
    name: 'ListItemRow',
    category: 'Navigation',
    description: 'Clickable list row',
    preview: <ListItemRowPreview />,
  },

  // Feedback
  {
    id: 'alert',
    name: 'Alert',
    category: 'Feedback',
    description: 'Status alert banners',
    preview: <AlertPreview />,
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    category: 'Feedback',
    description: 'Loading placeholder shapes',
    preview: <SkeletonPreview />,
  },
  {
    id: 'progress',
    name: 'LinearProgress',
    category: 'Feedback',
    description: 'Progress bar indicator',
    preview: <ProgressPreview />,
  },

  // More MUI Components - Navigation
  {
    id: 'dialog',
    name: 'Dialog',
    category: 'Navigation',
    description: 'Modal dialog window',
    preview: <DialogPreview />,
  },
  {
    id: 'drawer',
    name: 'Drawer',
    category: 'Navigation',
    description: 'Slide-out panel',
    preview: <DrawerPreview />,
  },
  {
    id: 'menu',
    name: 'Menu',
    category: 'Navigation',
    description: 'Dropdown menu',
    preview: <MenuPreview />,
  },
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'Navigation',
    description: 'Tabbed navigation',
    preview: <TabsPreview />,
  },

  // More MUI Components - Data Display
  {
    id: 'table',
    name: 'Table',
    category: 'Data Display',
    description: 'Data table with rows and columns',
    preview: <TablePreview />,
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'Data Display',
    description: 'User avatar component',
    preview: <AvatarPreview />,
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'Data Display',
    description: 'Hover tooltip',
    preview: <TooltipPreview />,
  },
  {
    id: 'divider',
    name: 'Divider',
    category: 'Layout',
    description: 'Content separator',
    preview: <DividerPreview />,
  },

  // Placeholder Utilities
  {
    id: 'page-header',
    name: 'PageHeader',
    category: 'Layout',
    description: 'Page title with breadcrumb',
    preview: <PageHeaderPreview />,
  },
  {
    id: 'card-grid',
    name: 'CardGrid',
    category: 'Layout',
    description: 'Responsive card grid layout',
    preview: <CardGridPreview />,
  },
  {
    id: 'stats-row',
    name: 'StatsRow',
    category: 'Data Display',
    description: 'Row of stat cards',
    preview: <StatsRowPreview />,
  },
  {
    id: 'placeholder-card',
    name: 'PlaceholderCard',
    category: 'Feedback',
    description: 'Skeleton card with menu',
    preview: <PlaceholderCardPreview />,
  },
  {
    id: 'infobox',
    name: 'Infobox',
    category: 'Data Display',
    description: 'Wiki-style info panel',
    preview: <InfoboxPreview />,
  },

  // Dialog System
  {
    id: 'base-dialog',
    name: 'BaseDialog',
    category: 'Dialogs',
    description: 'Foundation dialog wrapper with consistent styling',
    preview: <BaseDialogPreview />,
  },
  {
    id: 'confirm-dialog',
    name: 'ConfirmDialog',
    category: 'Dialogs',
    description: 'Icon + content + Cancel/Confirm actions',
    preview: <ConfirmDialogPreview />,
  },
  {
    id: 'success-dialog',
    name: 'SuccessDialog',
    category: 'Dialogs',
    description: 'Success confirmation with customizable actions',
    preview: <SuccessDialogPreview />,
  },
  {
    id: 'report-dialog',
    name: 'ReportDialog',
    category: 'Dialogs',
    description: 'Report flow with radio options and details',
    preview: <ReportDialogPreview />,
  },

  // DS Utility Components
  {
    id: 'card-header',
    name: 'CardHeader',
    category: 'Layout',
    description: 'Card header with title, count, and action',
    preview: <CardHeaderPreview />,
  },
  {
    id: 'expandable-section',
    name: 'ExpandableSection',
    category: 'Layout',
    description: 'Accordion pattern with icon and content',
    preview: <ExpandableSectionPreview />,
  },
  {
    id: 'status-banner',
    name: 'StatusBanner',
    category: 'Feedback',
    description: 'Inline status notification banner',
    preview: <StatusBannerPreview />,
  },
  {
    id: 'bottom-sheet',
    name: 'BottomSheet',
    category: 'Navigation',
    description: 'Mobile bottom sheet overlay',
    preview: <BottomSheetPreview />,
  },
  {
    id: 'notification-toast',
    name: 'NotificationToast',
    category: 'Feedback',
    description: 'Temporary notification message',
    preview: <ToastPreview />,
  },

  // Sprite Components
  {
    id: 'character-sprite',
    name: 'CharacterSprite',
    category: 'Game UI',
    description: 'Character display with size variants',
    preview: <CharacterSpritePreview />,
  },
  {
    id: 'animated-sprite',
    name: 'AnimatedSprite',
    category: 'Game UI',
    description: 'Multi-frame animated sprite display',
    preview: <AnimatedSpritePreview />,
  },
  {
    id: 'dice-shapes',
    name: 'DiceShapes',
    category: 'Game UI',
    description: 'D4, D6, D8 dice display components',
    preview: <DicePreview />,
  },

  // Additional Components - Icons & Assets
  {
    id: 'token-icon',
    name: 'TokenIcon',
    category: 'Icons',
    description: 'Game currency token icon with size variants',
    preview: <TokenIconPreview />,
  },
  {
    id: 'circle-icon-detail',
    name: 'CircleIcon',
    category: 'Icons',
    description: 'Unified circular icon wrapper with presets',
    preview: <CircleIconDetailPreview />,
  },
  {
    id: 'bronze-placard',
    name: 'BronzePlacard',
    category: 'Icons',
    description: 'Decorative bronze placard element',
    preview: <BronzePlacardPreview />,
  },

  // Additional Components - Navigation
  {
    id: 'wiki-link',
    name: 'WikiLink',
    category: 'Navigation',
    description: 'Slug-based wiki navigation link',
    preview: <WikiLinkPreview />,
  },
  {
    id: 'share-sheet',
    name: 'ShareSheet',
    category: 'Navigation',
    description: 'Social sharing dialog with copy link',
    preview: <ShareSheetPreview />,
  },

  // Additional Components - Layout
  {
    id: 'dialog-header',
    name: 'DialogHeader',
    category: 'Layout',
    description: 'Dialog title with close button',
    preview: <DialogHeaderPreview />,
  },
  {
    id: 'card-section',
    name: 'CardSection',
    category: 'Layout',
    description: 'Rounded card container (30px radius)',
    preview: <CardSectionPreview />,
  },

  // Additional Components - Data Display
  {
    id: 'stat-row',
    name: 'StatRow',
    category: 'Data Display',
    description: 'Label-value pair row',
    preview: <StatRowPreview />,
  },
  {
    id: 'setting-row',
    name: 'SettingRow',
    category: 'Data Display',
    description: 'Toggle setting with title and description',
    preview: <SettingRowPreview />,
  },
  {
    id: 'sortable-header',
    name: 'SortableHeader',
    category: 'Data Display',
    description: 'Table column header with sort indicator',
    preview: <SortableHeaderPreview />,
  },
  {
    id: 'asset-image',
    name: 'AssetImage',
    category: 'Data Display',
    description: 'Image with fallback chain handling',
    preview: <AssetImagePreview />,
  },

  // Additional Components - Game UI
  {
    id: 'market-sprite',
    name: 'MarketSprite',
    category: 'Game UI',
    description: 'Market character sprite with animation',
    preview: <MarketSpritePreview />,
  },
  {
    id: 'lucky-number-picker',
    name: 'LuckyNumberPicker',
    category: 'Game UI',
    description: 'Die-rector patron selection grid',
    preview: <LuckyNumberPickerPreview />,
  },
];
