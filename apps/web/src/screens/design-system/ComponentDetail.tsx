import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Chip,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  TextField,
  Switch,
  Avatar,
  Skeleton,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Grid,
  Stack,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@mui/material';
import {
  ArrowBackSharp as BackIcon,
  StarSharp as StarIcon,
  HomeSharp as HomeIcon,
  SettingsSharp as SettingsIcon,
  CheckSharp as CheckIcon,
  BlockSharp as BlockIcon,
  FlagSharp as FlagIcon,
  DeleteSharp as DeleteIcon,
  InfoSharp as InfoIcon,
  OpenInNewSharp as OpenInNewIcon,
  ExpandMoreSharp as ExpandMoreIcon,
  CloseSharp as CloseIcon,
} from '@mui/icons-material';
import { tokens } from '../../theme';
import { componentRegistry } from './componentData';
import { BaseCard } from '../../components/BaseCard';
import { SectionHeader } from '../../components/SectionHeader';
import { StatCard } from '../../components/StatCard';
import { CircleIcon } from '../../components';
import { DataBadge } from '../../components/DataBadge';
import { ListItemRow } from '../../components/ListItemRow';
import { BaseDialog, ConfirmDialog, SuccessDialog, ReportDialog } from '../../components/dialogs';
import { CardHeader } from '../../components/ds/CardHeader';
import { ExpandableSection } from '../../components/ds/ExpandableSection';
import { StatusBanner } from '../../components/ds/StatusBanner';
import { BottomSheet } from '../../components/BottomSheet';
import { DiceShape, DiceMini } from '../../components/DiceShapes';

// Component-specific content for detail pages
const componentDetails: Record<string, {
  examples: React.ReactNode;
  props?: { name: string; type: string; default: string; description: string }[];
  code?: string;
}> = {
  colors: {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Brand Colors</Typography>
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          {[
            { name: 'Primary', value: tokens.colors.primary },
            { name: 'Secondary', value: tokens.colors.secondary },
          ].map((color) => (
            <Box key={color.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: color.value, border: `1px solid ${tokens.colors.border}` }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{color.name}</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: tokens.colors.text.disabled }}>{color.value}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Status Colors</Typography>
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          {[
            { name: 'Success', value: tokens.colors.success },
            { name: 'Warning', value: tokens.colors.warning },
            { name: 'Error', value: tokens.colors.error },
          ].map((color) => (
            <Box key={color.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: color.value, border: `1px solid ${tokens.colors.border}` }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{color.name}</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: tokens.colors.text.disabled }}>{color.value}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Background Colors</Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {[
            { name: 'Default', value: tokens.colors.background.default },
            { name: 'Paper', value: tokens.colors.background.paper },
            { name: 'Elevated', value: tokens.colors.background.elevated },
          ].map((color) => (
            <Box key={color.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: color.value, border: `1px solid ${tokens.colors.border}` }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{color.name}</Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: tokens.colors.text.disabled }}>{color.value}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    ),
    code: `import { tokens } from '../../theme';

// Usage
<Box sx={{ bgcolor: tokens.colors.primary }} />
<Box sx={{ color: tokens.colors.text.secondary }} />`,
  },

  typography: {
    examples: (
      <Box>
        <Typography variant="h1" sx={{ mb: 2 }}>Heading 1</Typography>
        <Typography variant="h2" sx={{ mb: 2 }}>Heading 2</Typography>
        <Typography variant="h3" sx={{ mb: 2 }}>Heading 3</Typography>
        <Typography variant="h4" sx={{ mb: 2 }}>Heading 4</Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>Heading 5</Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>Heading 6</Typography>
        <Divider sx={{ my: 3, borderColor: tokens.colors.border }} />
        <Typography variant="body1" sx={{ mb: 1 }}>Body 1 - Regular paragraph text for main content</Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>Body 2 - Smaller text for secondary content</Typography>
        <Typography variant="caption">Caption - Smallest text for labels and metadata</Typography>
      </Box>
    ),
    code: `<Typography variant="h1">Heading</Typography>
<Typography variant="body1">Paragraph text</Typography>
<Typography variant="caption">Caption</Typography>`,
  },

  tokens: {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Spacing</Typography>
        <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
          {Object.entries(tokens.spacing).map(([key, value]) => (
            <Box key={key} sx={{ textAlign: 'center' }}>
              <Box sx={{ width: value, height: value, bgcolor: tokens.colors.background.elevated, borderRadius: 1, mb: 1, mx: 'auto' }} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{key}: {value}px</Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Border Radius</Typography>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {Object.entries(tokens.radius).map(([key, value]) => (
            <Box key={key} sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 48, height: 48, bgcolor: tokens.colors.background.elevated, borderRadius: `${value}px`, mb: 1 }} />
              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{key}: {value}px</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    ),
    code: `import { tokens } from '../../theme';

// Spacing
<Box sx={{ p: tokens.spacing.md }} />

// Border radius
<Box sx={{ borderRadius: tokens.radius.lg }} />`,
  },

  'base-card': {
    examples: (
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ width: 200 }}>
          <BaseCard>
            <Typography variant="body2">Default card</Typography>
          </BaseCard>
        </Box>
        <Box sx={{ width: 200 }}>
          <BaseCard hover onClick={() => {}}>
            <Typography variant="body2">Hover card (clickable)</Typography>
          </BaseCard>
        </Box>
        <Box sx={{ width: 200 }}>
          <BaseCard padding={4}>
            <Typography variant="body2">Custom padding (4)</Typography>
          </BaseCard>
        </Box>
      </Box>
    ),
    props: [
      { name: 'children', type: 'ReactNode', default: '-', description: 'Card content' },
      { name: 'hover', type: 'boolean', default: 'false', description: 'Enable hover effect' },
      { name: 'padding', type: 'number', default: '3', description: 'Padding multiplier' },
      { name: 'onClick', type: '() => void', default: '-', description: 'Click handler' },
    ],
    code: `import { BaseCard } from '../../components/BaseCard';

<BaseCard hover onClick={handleClick}>
  <Typography>Card content</Typography>
</BaseCard>`,
  },

  'section-header': {
    examples: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <SectionHeader title="Basic Section" />
        <SectionHeader title="With Icon" icon={<StarIcon />} />
        <SectionHeader title="With Action" action={<Button size="small">View All</Button>} />
      </Box>
    ),
    props: [
      { name: 'title', type: 'string', default: '-', description: 'Section title' },
      { name: 'icon', type: 'ReactNode', default: '-', description: 'Optional icon' },
      { name: 'action', type: 'ReactNode', default: '-', description: 'Right-side action' },
      { name: 'variant', type: 'string', default: 'h6', description: 'Typography variant' },
    ],
    code: `import { SectionHeader } from '../../components/SectionHeader';

<SectionHeader
  title="Recent Activity"
  icon={<ActivityIcon />}
  action={<Button>View All</Button>}
/>`,
  },

  'stat-card': {
    examples: (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <StatCard label="Total Items" value="1,234" icon={<StarIcon />} />
        <StatCard label="Score" value="89%" />
        <StatCard label="Streak" value="7 days" icon={<CheckIcon />} />
      </Box>
    ),
    props: [
      { name: 'label', type: 'string', default: '-', description: 'Stat label' },
      { name: 'value', type: 'string | number', default: '-', description: 'Stat value' },
      { name: 'icon', type: 'ReactNode', default: '-', description: 'Optional icon' },
    ],
    code: `import { StatCard } from '../../components/StatCard';

<StatCard label="Total Items" value="1,234" icon={<StarIcon />} />`,
  },

  'icon-badge': {
    examples: (
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircleIcon icon={<HomeIcon />} size="sm" />
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>sm</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <CircleIcon icon={<StarIcon sx={{ color: tokens.colors.warning }} />} size="md" />
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>md</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <CircleIcon icon={<SettingsIcon sx={{ color: tokens.colors.primary }} />} size="lg" />
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>lg</Typography>
        </Box>
      </Box>
    ),
    props: [
      { name: 'icon', type: 'ReactNode', default: '-', description: 'Icon element' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md', description: 'Badge size' },
    ],
    code: `import { IconBadge } from '../../components/IconBadge';

<CircleIcon icon={<StarIcon />} size="lg" />`,
  },

  'data-badge': {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Outlined (default)</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          <DataBadge label="Primary" color="primary" />
          <DataBadge label="Secondary" color="secondary" />
          <DataBadge label="Warning" color="warning" />
          <DataBadge label="Success" color="success" />
          <DataBadge label="Error" color="error" />
        </Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Filled</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <DataBadge label="Filled" color="primary" variant="filled" />
          <DataBadge label="Filled" color="warning" variant="filled" />
          <DataBadge label="Filled" color="success" variant="filled" />
        </Box>
      </Box>
    ),
    props: [
      { name: 'label', type: 'string', default: '-', description: 'Badge text' },
      { name: 'color', type: "'primary' | 'secondary' | 'warning' | 'success' | 'error'", default: 'primary', description: 'Badge color' },
      { name: 'variant', type: "'outlined' | 'filled'", default: 'outlined', description: 'Badge style' },
    ],
    code: `import { DataBadge } from '../../components/DataBadge';

<DataBadge label="Rare" color="warning" />
<DataBadge label="Active" color="success" variant="filled" />`,
  },

  'list-item-row': {
    examples: (
      <BaseCard padding={0} sx={{ maxWidth: 400 }}>
        <ListItemRow icon={<HomeIcon />} primary="Home" secondary="Go to homepage" onClick={() => {}} />
        <ListItemRow icon={<StarIcon />} primary="Favorites" secondary="View saved items" action={<DataBadge label="12" color="primary" />} onClick={() => {}} />
        <ListItemRow icon={<SettingsIcon />} primary="Settings" onClick={() => {}} />
      </BaseCard>
    ),
    props: [
      { name: 'icon', type: 'ReactNode', default: '-', description: 'Left icon' },
      { name: 'primary', type: 'string', default: '-', description: 'Primary text' },
      { name: 'secondary', type: 'string', default: '-', description: 'Secondary text' },
      { name: 'action', type: 'ReactNode', default: '-', description: 'Right action element' },
      { name: 'onClick', type: '() => void', default: '-', description: 'Click handler' },
    ],
    code: `import { ListItemRow } from '../../components/ListItemRow';

<ListItemRow
  icon={<SettingsIcon />}
  primary="Settings"
  secondary="Configure your app"
  action={<ChevronRightIcon />}
  onClick={handleClick}
/>`,
  },

  button: {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Variants</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Button variant="contained">Primary</Button>
          <Button variant="contained" color="secondary">Secondary</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
        </Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Sizes</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
          <Button variant="contained" size="small">Small</Button>
          <Button variant="contained" size="medium">Medium</Button>
          <Button variant="contained" size="large">Large</Button>
        </Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>States</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<StarIcon />}>With Icon</Button>
          <Button variant="contained" disabled>Disabled</Button>
        </Box>
      </Box>
    ),
    code: `<Button variant="contained">Primary</Button>
<Button variant="outlined" startIcon={<Icon />}>With Icon</Button>
<Button variant="text" size="small">Small Text</Button>`,
  },

  chip: {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Variants</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          <Chip label="Default" />
          <Chip label="Outlined" variant="outlined" />
          <Chip label="Active" sx={{ bgcolor: tokens.colors.background.elevated }} />
        </Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Interactive</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Clickable" onClick={() => {}} />
          <Chip label="With Icon" icon={<StarIcon />} />
          <Chip label="Deletable" onDelete={() => {}} />
        </Box>
      </Box>
    ),
    code: `<Chip label="Tag" />
<Chip label="Deletable" onDelete={handleDelete} />
<Chip label="Active" sx={{ bgcolor: tokens.colors.background.elevated }} />`,
  },

  'text-field': {
    examples: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300 }}>
        <TextField label="Default" placeholder="Enter text..." />
        <TextField label="Filled" variant="filled" />
        <TextField label="Outlined" variant="outlined" />
        <TextField label="With Error" error helperText="This field is required" />
      </Box>
    ),
    code: `<TextField label="Name" placeholder="Enter name..." />
<TextField label="Email" type="email" variant="filled" />
<TextField label="Error" error helperText="Required" />`,
  },

  switch: {
    examples: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Switch defaultChecked />
          <Typography variant="body2">Enabled</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Switch />
          <Typography variant="body2">Disabled state</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Switch size="small" defaultChecked />
          <Typography variant="body2">Small size</Typography>
        </Box>
      </Box>
    ),
    code: `<Switch checked={enabled} onChange={handleChange} />
<Switch size="small" />`,
  },

  alert: {
    examples: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Alert severity="success">Success - Operation completed successfully</Alert>
        <Alert severity="info">Info - Here is some helpful information</Alert>
        <Alert severity="warning">Warning - Please review before continuing</Alert>
        <Alert severity="error">Error - Something went wrong</Alert>
      </Box>
    ),
    code: `<Alert severity="success">Success message</Alert>
<Alert severity="error" onClose={handleClose}>Dismissible alert</Alert>`,
  },

  paper: {
    examples: (
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 3, bgcolor: tokens.colors.background.paper }}>
          <Typography variant="body2">Default</Typography>
        </Paper>
        <Paper sx={{ p: 3, bgcolor: tokens.colors.background.elevated }}>
          <Typography variant="body2">Elevated</Typography>
        </Paper>
        <Paper sx={{ p: 3, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="body2">With Border</Typography>
        </Paper>
      </Box>
    ),
    code: `<Paper sx={{ p: 3, bgcolor: tokens.colors.background.paper }}>
  Content
</Paper>

<Paper sx={{ bgcolor: tokens.colors.background.elevated }}>
  Elevated surface
</Paper>`,
  },

  // New MUI Components
  skeleton: {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Variants</Typography>
        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          <Box>
            <Skeleton variant="text" width={200} sx={{ bgcolor: tokens.colors.background.elevated }} />
            <Typography variant="caption">Text</Typography>
          </Box>
          <Box>
            <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: tokens.colors.background.elevated }} />
            <Typography variant="caption">Circular</Typography>
          </Box>
          <Box>
            <Skeleton variant="rectangular" width={100} height={60} sx={{ bgcolor: tokens.colors.background.elevated }} />
            <Typography variant="caption">Rectangular</Typography>
          </Box>
        </Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Card Example</Typography>
        <Box sx={{ width: 300, p: 2, border: `1px solid ${tokens.colors.border}`, borderRadius: 1 }}>
          <Skeleton variant="rectangular" height={140} sx={{ bgcolor: tokens.colors.background.elevated, mb: 2 }} />
          <Skeleton variant="text" width="80%" sx={{ bgcolor: tokens.colors.background.elevated }} />
          <Skeleton variant="text" width="60%" sx={{ bgcolor: tokens.colors.background.elevated }} />
        </Box>
      </Box>
    ),
    code: `<Skeleton variant="text" width={200} />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" height={140} />`,
  },

  progress: {
    examples: (
      <Box sx={{ width: 300 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Determinate</Typography>
        <LinearProgress variant="determinate" value={75} sx={{ mb: 2 }} />
        <LinearProgress variant="determinate" value={50} sx={{ mb: 2 }} />
        <LinearProgress variant="determinate" value={25} sx={{ mb: 3 }} />
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Indeterminate</Typography>
        <LinearProgress sx={{ mb: 2 }} />
      </Box>
    ),
    code: `<LinearProgress variant="determinate" value={75} />
<LinearProgress /> {/* Indeterminate */}`,
  },

  dialog: {
    examples: (
      <Box>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
          Dialogs are modal overlays for confirmations, forms, and alerts.
        </Typography>
        <Paper sx={{ p: 3, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, maxWidth: 400 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Dialog Title</Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
            Dialog content goes here. This is where you put your form or message.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button>Cancel</Button>
            <Button variant="contained">Confirm</Button>
          </Box>
        </Paper>
      </Box>
    ),
    code: `<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>Content here</DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button variant="contained">Confirm</Button>
  </DialogActions>
</Dialog>`,
  },

  drawer: {
    examples: (
      <Box>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
          Drawers slide in from the edge for navigation or filters.
        </Typography>
        <Box sx={{ display: 'flex', height: 200, border: `1px solid ${tokens.colors.border}`, borderRadius: 1, overflow: 'hidden' }}>
          <Box sx={{ width: 200, bgcolor: tokens.colors.background.paper, borderRight: `1px solid ${tokens.colors.border}`, p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>Drawer</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['Home', 'Profile', 'Settings'].map((item) => (
                <Box key={item} sx={{ p: 1, bgcolor: tokens.colors.background.elevated, borderRadius: 1 }}>
                  <Typography variant="body2">{item}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <Box sx={{ flex: 1, bgcolor: tokens.colors.background.default, p: 2 }}>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>Main content</Typography>
          </Box>
        </Box>
      </Box>
    ),
    code: `<Drawer anchor="left" open={open} onClose={handleClose}>
  <Box sx={{ width: 250, p: 2 }}>
    Drawer content
  </Box>
</Drawer>`,
  },

  menu: {
    examples: (
      <Box>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
          Menus display a list of choices on a temporary surface.
        </Typography>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Paper sx={{ p: 1, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, minWidth: 150 }}>
            {['Edit', 'Duplicate', 'Archive', 'Delete'].map((item, i) => (
              <Box
                key={item}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  color: item === 'Delete' ? tokens.colors.error : 'inherit',
                  '&:hover': { bgcolor: tokens.colors.background.elevated },
                }}
              >
                <Typography variant="body2">{item}</Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    ),
    code: `<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
  <MenuItem onClick={handleClose}>Edit</MenuItem>
  <MenuItem onClick={handleClose}>Delete</MenuItem>
</Menu>`,
  },

  tabs: {
    examples: (
      <Box>
        <Box sx={{ borderBottom: `1px solid ${tokens.colors.border}`, mb: 3 }}>
          <Tabs value={0}>
            <Tab label="Overview" />
            <Tab label="Details" />
            <Tab label="Reviews" />
          </Tabs>
        </Box>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
          Tab content would appear here based on selected tab.
        </Typography>
      </Box>
    ),
    code: `<Tabs value={value} onChange={handleChange}>
  <Tab label="Tab 1" />
  <Tab label="Tab 2" />
</Tabs>`,
  },

  table: {
    examples: (
      <TableContainer component={Paper} sx={{ bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` }}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { borderColor: tokens.colors.border, fontWeight: 600 } }}>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Rarity</TableCell>
              <TableCell align="right">Level</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { name: 'Sword of Dawn', type: 'Weapon', rarity: 'Rare', level: 25 },
              { name: 'Dragon Scale', type: 'Material', rarity: 'Epic', level: 40 },
              { name: 'Health Potion', type: 'Consumable', rarity: 'Common', level: 1 },
            ].map((row) => (
              <TableRow key={row.name} sx={{ '& td': { borderColor: tokens.colors.border } }}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell><Chip label={row.rarity} size="small" /></TableCell>
                <TableCell align="right">{row.level}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ),
    code: `<TableContainer>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Type</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.id}>
          <TableCell>{row.name}</TableCell>
          <TableCell>{row.type}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>`,
  },

  avatar: {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Sizes</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>S</Avatar>
          <Avatar sx={{ width: 40, height: 40 }}>M</Avatar>
          <Avatar sx={{ width: 56, height: 56 }}>L</Avatar>
        </Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Colors</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar sx={{ bgcolor: tokens.colors.primary }}>A</Avatar>
          <Avatar sx={{ bgcolor: tokens.colors.secondary }}>B</Avatar>
          <Avatar sx={{ bgcolor: tokens.colors.success }}>C</Avatar>
          <Avatar sx={{ bgcolor: tokens.colors.warning }}>D</Avatar>
        </Box>
      </Box>
    ),
    code: `<Avatar>U</Avatar>
<Avatar sx={{ bgcolor: tokens.colors.primary }}>A</Avatar>
<Avatar src="/path/to/image.jpg" />`,
  },

  tooltip: {
    examples: (
      <Box sx={{ display: 'flex', gap: 4 }}>
        <Tooltip title="This is a tooltip" placement="top">
          <Button variant="outlined">Hover me (top)</Button>
        </Tooltip>
        <Tooltip title="Bottom tooltip" placement="bottom">
          <Button variant="outlined">Hover me (bottom)</Button>
        </Tooltip>
      </Box>
    ),
    code: `<Tooltip title="Helpful text">
  <Button>Hover me</Button>
</Tooltip>`,
  },

  divider: {
    examples: (
      <Box sx={{ width: 300 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>Content above</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" sx={{ mb: 2 }}>Content below</Typography>
        <Divider sx={{ my: 2 }}>OR</Divider>
        <Typography variant="body2">With text</Typography>
      </Box>
    ),
    code: `<Divider />
<Divider>OR</Divider>
<Divider orientation="vertical" flexItem />`,
  },

  // Placeholder Utilities
  'page-header': {
    examples: (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled, mb: 0.5, display: 'block' }}>
            Home / Wiki / Characters
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>Page Title</Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            Subtitle or description text goes here
          </Typography>
        </Box>
      </Box>
    ),
    props: [
      { name: 'title', type: 'string', default: '-', description: 'Page title' },
      { name: 'subtitle', type: 'string', default: '-', description: 'Optional subtitle' },
    ],
    code: `import { PageHeader } from '../../components/Placeholder';

<PageHeader title="Wiki" subtitle="Browse the database" />`,
  },

  'card-grid': {
    examples: (
      <Grid container spacing={2}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
            <Paper sx={{ p: 2, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` }}>
              <Skeleton variant="rectangular" height={80} sx={{ bgcolor: tokens.colors.background.elevated, mb: 1 }} />
              <Skeleton variant="text" width="70%" sx={{ bgcolor: tokens.colors.background.elevated }} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    ),
    props: [
      { name: 'count', type: 'number', default: '6', description: 'Number of cards' },
      { name: 'columns', type: 'number', default: '3', description: 'Columns per row' },
    ],
    code: `import { CardGrid } from '../../components/Placeholder';

<CardGrid count={6} columns={3} />`,
  },

  'stats-row': {
    examples: (
      <Grid container spacing={2}>
        {[
          { label: 'Total Items', value: '1,234' },
          { label: 'Categories', value: '12' },
          { label: 'Contributors', value: '89' },
          { label: 'Last Updated', value: '2h ago' },
        ].map((stat) => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Paper sx={{ p: 2, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: tokens.colors.primary }}>{stat.value}</Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>{stat.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    ),
    props: [
      { name: 'count', type: 'number', default: '4', description: 'Number of stat cards' },
    ],
    code: `import { StatsRow } from '../../components/Placeholder';

<StatsRow count={4} />`,
  },

  'placeholder-card': {
    examples: (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Paper sx={{ width: 200, p: 2, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` }}>
          <Skeleton variant="rectangular" height={100} sx={{ bgcolor: tokens.colors.background.elevated, mb: 2, borderRadius: 1 }} />
          <Skeleton variant="text" width="80%" sx={{ bgcolor: tokens.colors.background.elevated }} />
          <Skeleton variant="text" width="60%" sx={{ bgcolor: tokens.colors.background.elevated }} />
        </Paper>
      </Box>
    ),
    props: [
      { name: 'height', type: 'number', default: '200', description: 'Card height' },
      { name: 'onClick', type: '() => void', default: '-', description: 'Click handler' },
    ],
    code: `import { PlaceholderCard } from '../../components/Placeholder';

<PlaceholderCard height={200} onClick={handleClick} />`,
  },

  infobox: {
    examples: (
      <Paper sx={{ p: 2, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, maxWidth: 280 }}>
        <Skeleton variant="rectangular" height={160} sx={{ bgcolor: tokens.colors.background.elevated, mb: 2, borderRadius: 1 }} />
        <Box>
          {[
            { label: 'Type', value: 'Enemy' },
            { label: 'Health', value: '500' },
            { label: 'Attack', value: '45' },
            { label: 'Location', value: 'Dark Forest' },
          ].map((row) => (
            <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${tokens.colors.border}` }}>
              <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>{row.label}</Typography>
              <Typography variant="body2">{row.value}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    ),
    code: `import { Infobox } from '../../components/Placeholder';

<Infobox />`,
  },

  // ============================================
  // Dialog System Components
  // ============================================

  'base-dialog': {
    examples: <BaseDialogExample />,
    props: [
      { name: 'open', type: 'boolean', default: '-', description: 'Controls dialog visibility' },
      { name: 'onClose', type: '() => void', default: '-', description: 'Called when dialog should close' },
      { name: 'title', type: 'string', default: '-', description: 'Dialog header title' },
      { name: 'showHeader', type: 'boolean', default: 'true', description: 'Show/hide the header' },
      { name: 'maxWidth', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'xs'", description: 'Max dialog width' },
      { name: 'children', type: 'ReactNode', default: '-', description: 'Dialog content' },
    ],
    code: `import { BaseDialog } from '../../components/dialogs';

<BaseDialog open={open} onClose={handleClose} title="Dialog Title">
  <DialogContent>
    Your content here
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button variant="contained">Confirm</Button>
  </DialogActions>
</BaseDialog>`,
  },

  'confirm-dialog': {
    examples: <ConfirmDialogExample />,
    props: [
      { name: 'open', type: 'boolean', default: '-', description: 'Controls dialog visibility' },
      { name: 'onClose', type: '() => void', default: '-', description: 'Called when cancelled' },
      { name: 'onConfirm', type: '() => void', default: '-', description: 'Called when confirmed' },
      { name: 'title', type: 'string', default: '-', description: 'Dialog header title' },
      { name: 'icon', type: 'ReactNode', default: '-', description: 'Icon displayed in circle' },
      { name: 'iconColor', type: 'string', default: 'primary', description: 'Icon background color' },
      { name: 'confirmLabel', type: 'string', default: "'Confirm'", description: 'Confirm button text' },
      { name: 'confirmColor', type: "'primary' | 'error' | 'success'", default: "'primary'", description: 'Confirm button color' },
      { name: 'cancelLabel', type: 'string', default: "'Cancel'", description: 'Cancel button text' },
      { name: 'children', type: 'ReactNode', default: '-', description: 'Dialog body content' },
    ],
    code: `import { ConfirmDialog } from '../../components/dialogs';
import { BlockSharp as BlockIcon } from '@mui/icons-material';

<ConfirmDialog
  open={open}
  onClose={handleClose}
  onConfirm={handleBlock}
  title="Block User"
  icon={<BlockIcon />}
  iconColor={tokens.colors.error}
  confirmLabel="Block"
  confirmColor="error"
>
  <Typography>Are you sure you want to block this user?</Typography>
</ConfirmDialog>`,
  },

  'success-dialog': {
    examples: <SuccessDialogExample />,
    props: [
      { name: 'open', type: 'boolean', default: '-', description: 'Controls dialog visibility' },
      { name: 'onClose', type: '() => void', default: '-', description: 'Called when closed' },
      { name: 'title', type: 'string', default: '-', description: 'Success title' },
      { name: 'message', type: 'string', default: '-', description: 'Success message' },
      { name: 'icon', type: 'ReactNode', default: '<SuccessIcon />', description: 'Custom icon' },
      { name: 'iconColor', type: 'string', default: 'success', description: 'Icon color' },
      { name: 'actions', type: 'ReactNode', default: "'Done' button", description: 'Custom action buttons' },
    ],
    code: `import { SuccessDialog } from '../../components/dialogs';

<SuccessDialog
  open={open}
  onClose={handleClose}
  title="Request Sent!"
  message="Your friend request has been sent successfully."
/>

// With custom actions
<SuccessDialog
  open={open}
  onClose={handleClose}
  title="Report Submitted"
  message="Thank you for your feedback."
  actions={
    <>
      <Button onClick={goHome}>Back to Home</Button>
      <Button onClick={refresh}>Refresh</Button>
    </>
  }
/>`,
  },

  'report-dialog': {
    examples: <ReportDialogExample />,
    props: [
      { name: 'open', type: 'boolean', default: '-', description: 'Controls dialog visibility' },
      { name: 'onClose', type: '() => void', default: '-', description: 'Called when closed' },
      { name: 'onSubmit', type: '(reason: string, details?: string) => void', default: '-', description: 'Called on submit' },
      { name: 'title', type: 'string', default: '-', description: 'Dialog title' },
      { name: 'prompt', type: 'string', default: '-', description: 'Prompt text above options' },
      { name: 'reasons', type: 'readonly string[]', default: '-', description: 'Array of reason options' },
      { name: 'successTitle', type: 'string', default: '-', description: 'Success dialog title' },
      { name: 'successMessage', type: 'string', default: '-', description: 'Success dialog message' },
      { name: 'maxDetails', type: 'number', default: '150', description: 'Max chars for details field' },
      { name: 'successActions', type: 'ReactNode', default: "'Done' button", description: 'Custom success actions' },
    ],
    code: `import { ReportDialog } from '../../components/dialogs';

const REPORT_REASONS = [
  'Harassment or bullying',
  'Spam or misleading content',
  'Inappropriate content',
  'Other',
] as const;

<ReportDialog
  open={open}
  onClose={handleClose}
  onSubmit={(reason, details) => console.log(reason, details)}
  title="Report User"
  prompt="Why are you reporting this user?"
  reasons={REPORT_REASONS}
  successTitle="Report Submitted"
  successMessage="Thank you for helping keep our community safe."
  maxDetails={150}
/>`,
  },

  // ============================================
  // DS Utility Components
  // ============================================

  'card-header': {
    examples: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
        <Paper sx={{ bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` }}>
          <CardHeader title="Basic Header" />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>Card content</Typography>
          </Box>
        </Paper>

        <Paper sx={{ bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` }}>
          <CardHeader title="With Count" count={42} />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>Shows count in parentheses</Typography>
          </Box>
        </Paper>

        <Paper sx={{ bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` }}>
          <CardHeader
            title="With Tooltip"
            infoTooltip="This is helpful info about this section"
          />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>Hover the (i) icon</Typography>
          </Box>
        </Paper>

        <Paper sx={{ bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` }}>
          <CardHeader
            title="External Action"
            action="external"
            actionTooltip="View full page"
            onActionClick={() => {}}
          />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>With external link icon</Typography>
          </Box>
        </Paper>

        <Paper sx={{ bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` }}>
          <CardHeader
            title="Custom Action"
            action={<Button size="small">Edit</Button>}
          />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>With custom button</Typography>
          </Box>
        </Paper>
      </Box>
    ),
    props: [
      { name: 'title', type: 'string', default: '-', description: 'Card title text' },
      { name: 'count', type: 'number', default: '-', description: 'Optional count after title' },
      { name: 'infoTooltip', type: 'string', default: '-', description: 'Info tooltip text' },
      { name: 'action', type: "'external' | ReactNode", default: '-', description: 'Action button type or element' },
      { name: 'actionTooltip', type: 'string', default: "'View all'", description: 'External action tooltip' },
      { name: 'onActionClick', type: '() => void', default: '-', description: 'Action click handler' },
      { name: 'children', type: 'ReactNode', default: '-', description: 'Additional header content' },
    ],
    code: `import { CardHeader } from '../../components/ds/CardHeader';

<Paper>
  <CardHeader
    title="Recent Games"
    count={14}
    infoTooltip="Games played in the last 7 days"
    action="external"
    onActionClick={() => navigate('/games')}
  />
  <Box sx={{ p: 2 }}>Content here</Box>
</Paper>`,
  },

  'expandable-section': {
    examples: <ExpandableSectionExample />,
    props: [
      { name: 'id', type: 'string', default: '-', description: 'Unique identifier for the section' },
      { name: 'icon', type: 'string | ReactNode', default: '-', description: 'Icon (path or element)' },
      { name: 'title', type: 'string', default: '-', description: 'Section title' },
      { name: 'value', type: 'string | number', default: '-', description: 'Value shown on right side' },
      { name: 'expanded', type: 'boolean', default: '-', description: 'Whether section is expanded' },
      { name: 'onToggle', type: '(id: string) => void', default: '-', description: 'Toggle callback' },
      { name: 'showBorder', type: 'boolean', default: 'true', description: 'Show bottom border' },
      { name: 'children', type: 'ReactNode', default: '-', description: 'Expandable content' },
    ],
    code: `import { ExpandableSection } from '../../components/ds/ExpandableSection';

const [expanded, setExpanded] = useState<string | null>(null);

<ExpandableSection
  id="stats"
  icon={<StarIcon />}
  title="Statistics"
  value="1,234"
  expanded={expanded === 'stats'}
  onToggle={(id) => setExpanded(expanded === id ? null : id)}
>
  <Typography>Expanded content here</Typography>
</ExpandableSection>`,
  },

  'status-banner': {
    examples: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Warning</Typography>
        <StatusBanner variant="warning">
          Your daily challenge resets in 2 hours!
        </StatusBanner>

        <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Success</Typography>
        <StatusBanner variant="success">
          You completed today's daily challenge!
        </StatusBanner>

        <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Info</Typography>
        <StatusBanner variant="info">
          New wiki articles have been added this week.
        </StatusBanner>

        <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Custom Content</Typography>
        <StatusBanner variant="warning">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.7rem' }}>Streak at risk!</Typography>
            <Button size="small" variant="outlined" sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: '0.65rem' }}>
              Play Now
            </Button>
          </Box>
        </StatusBanner>
      </Box>
    ),
    props: [
      { name: 'variant', type: "'warning' | 'success' | 'info'", default: '-', description: 'Visual style variant' },
      { name: 'children', type: 'ReactNode', default: '-', description: 'Banner content' },
      { name: 'icon', type: 'ReactNode', default: 'variant default', description: 'Custom icon override' },
    ],
    code: `import { StatusBanner } from '../../components/ds/StatusBanner';

<StatusBanner variant="warning">
  Your streak resets in 2 hours!
</StatusBanner>

<StatusBanner variant="success">
  Challenge completed!
</StatusBanner>

<StatusBanner variant="info">
  <Box sx={{ display: 'flex', gap: 1 }}>
    <Typography>New content available</Typography>
    <Button size="small">View</Button>
  </Box>
</StatusBanner>`,
  },

  'bottom-sheet': {
    examples: <BottomSheetExample />,
    props: [
      { name: 'open', type: 'boolean', default: '-', description: 'Controls sheet visibility' },
      { name: 'onClose', type: '() => void', default: '-', description: 'Called when sheet closes' },
      { name: 'height', type: "'auto' | 'half' | 'full'", default: "'auto'", description: 'Sheet height preset' },
      { name: 'showHandle', type: 'boolean', default: 'true', description: 'Show drag handle indicator' },
      { name: 'showCloseButton', type: 'boolean', default: 'false', description: 'Show X close button' },
      { name: 'hideBackdrop', type: 'boolean', default: 'false', description: 'Hide backdrop overlay' },
      { name: 'keepMounted', type: 'boolean', default: 'true', description: 'Keep content mounted when closed' },
      { name: 'children', type: 'ReactNode', default: '-', description: 'Sheet content' },
    ],
    code: `import { BottomSheet } from '../../components/BottomSheet';

<BottomSheet
  open={open}
  onClose={handleClose}
  height="half"
  showHandle
>
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">Sheet Title</Typography>
    <Typography>Sheet content here</Typography>
  </Box>
</BottomSheet>`,
  },

  'notification-toast': {
    examples: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 350 }}>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
          Toast notifications appear temporarily to confirm actions.
        </Typography>

        <Paper sx={{ p: 2, bgcolor: tokens.colors.background.elevated, border: `1px solid ${tokens.colors.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CircleIcon icon={<CheckIcon />} color={tokens.colors.success} size="sm" />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Friend Request Sent</Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>Just now</Typography>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 2, bgcolor: tokens.colors.background.elevated, border: `1px solid ${tokens.colors.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CircleIcon icon={<StarIcon />} color={tokens.colors.warning} size="sm" />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Achievement Unlocked</Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>First Victory</Typography>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 2, bgcolor: tokens.colors.background.elevated, border: `1px solid ${tokens.colors.primary}40` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CircleIcon icon={<InfoIcon />} color={tokens.colors.primary} size="sm" />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Favor Effect Active</Typography>
              <Typography variant="caption" sx={{ color: tokens.colors.text.secondary }}>+10% bonus damage</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    ),
    code: `import { NotificationToast } from '../../components/NotificationToast';

// Basic usage
<NotificationToast
  open={showToast}
  onClose={() => setShowToast(false)}
  message="Action completed successfully"
  severity="success"
/>`,
  },

  // ============================================
  // Sprite Components
  // ============================================

  'character-sprite': {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Size Variants</Typography>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', mb: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 100, height: 100, bgcolor: tokens.colors.background.elevated, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ color: tokens.colors.text.disabled }}>100x100</Typography>
            </Box>
            <Typography variant="caption">Default</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 75, height: 75, bgcolor: tokens.colors.background.elevated, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem' }}>75x75</Typography>
            </Box>
            <Typography variant="caption">size=75</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 50, height: 50, bgcolor: tokens.colors.background.elevated, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ color: tokens.colors.text.disabled, fontSize: '0.6rem' }}>50</Typography>
            </Box>
            <Typography variant="caption">size=50</Typography>
          </Box>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Large Characters (300x300)</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 150, height: 150, bgcolor: tokens.colors.background.elevated, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ color: tokens.colors.text.disabled }}>King James</Typography>
            </Box>
            <Typography variant="caption">Auto-scales to 300px</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 150, height: 150, bgcolor: tokens.colors.background.elevated, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ color: tokens.colors.text.disabled }}>Rhea</Typography>
            </Box>
            <Typography variant="caption">Auto-scales to 300px</Typography>
          </Box>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Animation States</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {['idle', 'shop', 'walk', 'back', 'action'].map((anim) => (
            <Chip key={anim} label={anim} size="small" variant="outlined" />
          ))}
        </Box>
      </Box>
    ),
    props: [
      { name: 'slug', type: 'string', default: '-', description: 'Character slug (e.g., "mr-bones")' },
      { name: 'category', type: 'WikiCategory', default: '-', description: 'Wiki category for animation speed' },
      { name: 'size', type: 'number', default: '100 or 300', description: 'Override default size' },
      { name: 'animation', type: "'idle' | 'shop' | 'walk' | 'back' | 'action'", default: "'idle'", description: 'Animation state' },
      { name: 'isPaused', type: 'boolean', default: 'false', description: 'Pause animation' },
      { name: 'frameInterval', type: 'number', default: 'category default', description: 'Ms per frame' },
      { name: 'fallbackSrc', type: 'string', default: '-', description: 'Fallback image if sprite not found' },
      { name: 'onClick', type: '() => void', default: '-', description: 'Click handler' },
      { name: 'debug', type: 'boolean', default: 'false', description: 'Show debug border' },
    ],
    code: `import { CharacterSprite } from '../../components/CharacterSprite';

<CharacterSprite
  slug="mr-bones"
  category="travelers"
  animation="idle"
/>

// Custom size
<CharacterSprite
  slug="boo-g"
  size={64}
  onClick={() => openProfile()}
/>

// Paused animation
<CharacterSprite
  slug="king-james"
  isPaused={true}
/>`,
  },

  'animated-sprite': {
    examples: (
      <Box>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          AnimatedSprite cycles through frame images for idle animations. It auto-detects frame count or uses known values.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Frame Interval</Typography>
        <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, bgcolor: tokens.colors.background.elevated, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.text.disabled }}>200ms</Typography>
            </Box>
            <Typography variant="caption">Fast</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, bgcolor: tokens.colors.background.elevated, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.text.disabled }}>600ms</Typography>
            </Box>
            <Typography variant="caption">Default</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, bgcolor: tokens.colors.background.elevated, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.text.disabled }}>1000ms</Typography>
            </Box>
            <Typography variant="caption">Slow</Typography>
          </Box>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Known Frame Counts</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['mr-bones: 1', 'boo-g: 3', 'king-james: 2', 'the-general: 3'].map((info) => (
            <Chip key={info} label={info} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
          ))}
        </Box>
      </Box>
    ),
    props: [
      { name: 'slug', type: 'string', default: '-', description: 'Character slug' },
      { name: 'basePath', type: 'string', default: "'/assets/market'", description: 'Base path for sprites' },
      { name: 'frameCount', type: 'number', default: 'auto-detect', description: 'Override frame count' },
      { name: 'frameInterval', type: 'number', default: '600', description: 'Ms between frames' },
      { name: 'width', type: 'number', default: '64', description: 'Sprite width' },
      { name: 'height', type: "number | 'auto'", default: "'auto'", description: 'Sprite height' },
      { name: 'fallbackSrc', type: 'string', default: '-', description: 'Fallback image' },
      { name: 'isPaused', type: 'boolean', default: 'false', description: 'Pause animation' },
    ],
    code: `import { AnimatedSprite } from '../../components/AnimatedSprite';

<AnimatedSprite
  slug="boo-g"
  width={64}
  frameInterval={400}
/>

// With fallback
<AnimatedSprite
  slug="unknown-npc"
  fallbackSrc="/assets/placeholders/character.png"
/>`,
  },

  'dice-shapes': {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>All Dice Types</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
          {[4, 6, 8, 10, 12, 20].map((sides) => (
            <Box key={sides} sx={{ textAlign: 'center' }}>
              <DiceShape sides={sides as 4|6|8|10|12|20} size={48} color={tokens.colors.primary} value={sides} />
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>D{sides}</Typography>
            </Box>
          ))}
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Colors</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <DiceShape sides={6} size={48} color={tokens.colors.primary} value={6} />
          <DiceShape sides={6} size={48} color={tokens.colors.secondary} value={6} />
          <DiceShape sides={6} size={48} color={tokens.colors.success} value={6} />
          <DiceShape sides={6} size={48} color={tokens.colors.warning} value={6} />
          <DiceShape sides={6} size={48} color={tokens.colors.error} value={6} />
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Sizes</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 4 }}>
          <DiceShape sides={6} size={24} color={tokens.colors.primary} />
          <DiceShape sides={6} size={36} color={tokens.colors.primary} />
          <DiceShape sides={6} size={48} color={tokens.colors.primary} value={6} />
          <DiceShape sides={6} size={64} color={tokens.colors.primary} value={6} />
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>DiceMini (Selector Style)</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DiceMini sides={4} color={tokens.colors.primary} selected count={2} />
          <DiceMini sides={6} color={tokens.colors.secondary} selected />
          <DiceMini sides={8} color={tokens.colors.warning} />
          <DiceMini sides={20} color={tokens.colors.success} selected count={1} />
        </Box>
      </Box>
    ),
    props: [
      { name: 'sides', type: '4 | 6 | 8 | 10 | 12 | 20', default: '-', description: 'Number of dice sides' },
      { name: 'size', type: 'number', default: '48', description: 'Dice size in pixels' },
      { name: 'color', type: 'string', default: '-', description: 'Fill color' },
      { name: 'value', type: 'number | string', default: '-', description: 'Value to display on dice' },
      { name: 'onClick', type: '() => void', default: '-', description: 'Click handler' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction' },
      { name: 'fontFamily', type: 'string', default: 'Inter', description: 'Font for value text' },
      { name: 'fontScale', type: 'number', default: '0.4', description: 'Font size multiplier' },
    ],
    code: `import { DiceShape, DiceMini } from '../../components/DiceShapes';

// Basic dice
<DiceShape sides={6} size={48} color={tokens.colors.primary} value={6} />

// Interactive
<DiceShape
  sides={20}
  size={64}
  color={tokens.colors.warning}
  value={rollResult}
  onClick={handleRoll}
/>

// Mini selector with count
<DiceMini
  sides={6}
  color={tokens.colors.secondary}
  selected={isSelected}
  count={diceCount}
  onClick={() => toggleDice(6)}
/>`,
  },

  // ============================================
  // Additional Components
  // ============================================

  'token-icon': {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Size Variants</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: tokens.colors.warning, mx: 'auto', mb: 1 }} />
            <Typography variant="caption">16px</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: tokens.colors.warning, mx: 'auto', mb: 1 }} />
            <Typography variant="caption">24px (default)</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: tokens.colors.warning, mx: 'auto', mb: 1 }} />
            <Typography variant="caption">32px</Typography>
          </Box>
        </Stack>
      </Box>
    ),
    props: [
      { name: 'size', type: 'number', default: '24', description: 'Icon size in pixels' },
      { name: 'style', type: 'CSSProperties', default: '-', description: 'Additional inline styles' },
    ],
    code: `import { TokenIcon } from '../../components/TokenIcon';

<TokenIcon />           // 24px default
<TokenIcon size={16} /> // Small
<TokenIcon size={32} /> // Large`,
  },

  'circle-icon-detail': {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Size Presets</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <Box key={size} sx={{ textAlign: 'center' }}>
              <CircleIcon icon={<StarIcon />} size={size} color={tokens.colors.warning} />
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>{size}</Typography>
            </Box>
          ))}
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Auto Color Transparency</Typography>
        <Stack direction="row" spacing={2}>
          <CircleIcon icon={<CheckIcon />} color={tokens.colors.success} size="lg" />
          <CircleIcon icon={<InfoIcon />} color={tokens.colors.secondary} size="lg" />
          <CircleIcon icon={<BlockIcon />} color={tokens.colors.error} size="lg" />
        </Stack>
      </Box>
    ),
    props: [
      { name: 'icon', type: 'ReactNode', default: '-', description: 'Icon element to display' },
      { name: 'color', type: 'string', default: 'elevated bg', description: 'Background color (auto-transparency for hex)' },
      { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | number", default: "'md'", description: 'Size preset or pixel value' },
      { name: 'iconSize', type: 'number', default: 'auto', description: 'Override icon size' },
      { name: 'mb', type: 'number', default: '-', description: 'Bottom margin' },
      { name: 'centered', type: 'boolean', default: 'false', description: 'Center with mx: auto' },
    ],
    code: `import { CircleIcon } from '../../components/CircleIcon';

// Size presets
<CircleIcon icon={<StarIcon />} size="lg" />

// With color (auto-transparency)
<CircleIcon icon={<CheckIcon />} color={tokens.colors.success} />

// Dialog header pattern
<CircleIcon icon={<FlagIcon />} color={tokens.colors.primary} mb={2} centered />`,
  },

  'bronze-placard': {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Size Variants</Typography>
        <Stack direction="row" spacing={3} alignItems="flex-end">
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 32, height: 25, bgcolor: '#CD7F32', borderRadius: 0.5, mb: 1 }} />
            <Typography variant="caption">32px</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 50, bgcolor: '#CD7F32', borderRadius: 1, mb: 1 }} />
            <Typography variant="caption">64px (default)</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 96, height: 75, bgcolor: '#CD7F32', borderRadius: 1, mb: 1 }} />
            <Typography variant="caption">96px</Typography>
          </Box>
        </Stack>
      </Box>
    ),
    props: [
      { name: 'size', type: 'number', default: '64', description: 'Width in pixels (height auto-calculated)' },
      { name: 'style', type: 'CSSProperties', default: '-', description: 'Additional inline styles' },
    ],
    code: `import { BronzePlacard } from '../../components/BronzePlacard';

<BronzePlacard />           // 64px default
<BronzePlacard size={32} /> // Small
<BronzePlacard size={96} /> // Large`,
  },

  'wiki-link': {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Inline Links</Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Check out the <Box component="span" sx={{ color: tokens.colors.secondary, textDecoration: 'underline', cursor: 'pointer' }}>Void Spawn</Box> in the enemies section.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Chip Variant</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip label="Soul Fragment" size="small" sx={{ bgcolor: tokens.colors.background.elevated, border: `1px solid ${tokens.colors.secondary}`, color: tokens.colors.secondary }} />
          <Chip label="Mr. Bones" size="small" sx={{ bgcolor: tokens.colors.background.elevated, border: `1px solid ${tokens.colors.secondary}`, color: tokens.colors.secondary }} />
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Unresolved Entity</Typography>
        <Typography variant="body2" sx={{ color: tokens.colors.text.disabled }}>Unknown: missing-item</Typography>
      </Box>
    ),
    props: [
      { name: 'slug', type: 'string', default: '-', description: 'Entity slug identifier' },
      { name: 'category', type: 'WikiCategory', default: 'auto', description: 'Category override' },
      { name: 'children', type: 'ReactNode', default: 'entity.name', description: 'Custom display content' },
      { name: 'variant', type: "'inline' | 'chip'", default: "'inline'", description: 'Link style' },
      { name: 'showUnknownPrefix', type: 'boolean', default: 'false', description: 'Show "Unknown:" for unresolved' },
    ],
    code: `import { WikiLink } from '../../components/WikiLink';

// Auto-resolves name from entity data
<WikiLink slug="void-spawn" />

// Chip variant for tags
<WikiLink slug="soul-fragment" variant="chip" />

// Custom display text
<WikiLink slug="mr-bones">The skeleton merchant</WikiLink>`,
  },

  'dialog-header': {
    examples: (
      <Paper sx={{ bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, maxWidth: 300 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
          <Typography variant="h6">Dialog Title</Typography>
          <IconButton size="small"><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>Dialog content goes here...</Typography>
        </Box>
      </Paper>
    ),
    props: [
      { name: 'title', type: 'string', default: '-', description: 'Dialog title text' },
      { name: 'onClose', type: '() => void', default: '-', description: 'Close button handler' },
    ],
    code: `import { DialogHeader } from '../../components/DialogHeader';

<Dialog open={open} onClose={handleClose}>
  <DialogHeader title="Confirm Action" onClose={handleClose} />
  <DialogContent>...</DialogContent>
</Dialog>`,
  },

  'card-section': {
    examples: (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ p: 2, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, borderRadius: '30px', width: 150 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Card Section</Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>30px border radius</Typography>
        </Box>
        <Box sx={{ p: 3, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, borderRadius: '30px', width: 150 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Padding 3</Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>Custom padding</Typography>
        </Box>
      </Box>
    ),
    props: [
      { name: 'children', type: 'ReactNode', default: '-', description: 'Card content' },
      { name: 'padding', type: 'number', default: '2', description: 'MUI spacing value' },
      { name: 'sx', type: 'SxProps', default: '-', description: 'Additional styles' },
    ],
    code: `import { CardSection } from '../../components/CardSection';

<CardSection>
  <Typography>Default padding (2)</Typography>
</CardSection>

<CardSection padding={3}>
  <Typography>More padding</Typography>
</CardSection>`,
  },

  'stat-row': {
    examples: (
      <Paper sx={{ p: 2, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, maxWidth: 300 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>Total Wins</Typography>
          <Typography variant="body2">847</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>Win Rate</Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.success, fontWeight: 600 }}>68.7%</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>Current Streak</Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.warning, fontWeight: 600 }}>12</Typography>
        </Box>
      </Paper>
    ),
    props: [
      { name: 'label', type: 'string', default: '-', description: 'Left-side label' },
      { name: 'value', type: 'string | number', default: '-', description: 'Right-side value' },
      { name: 'valueColor', type: 'string', default: 'text.primary', description: 'Value text color' },
      { name: 'bold', type: 'boolean', default: 'false', description: 'Bold value text' },
    ],
    code: `import { StatRow } from '../../components/StatRow';

<StatRow label="Total Wins" value={847} />
<StatRow label="Win Rate" value="68.7%" valueColor={tokens.colors.success} bold />`,
  },

  'setting-row': {
    examples: <SettingRowExample />,
    props: [
      { name: 'title', type: 'string', default: '-', description: 'Setting title' },
      { name: 'description', type: 'string', default: '-', description: 'Setting description' },
      { name: 'checked', type: 'boolean', default: '-', description: 'Toggle state' },
      { name: 'onChange', type: '() => void', default: '-', description: 'Toggle handler' },
      { name: 'isLast', type: 'boolean', default: 'false', description: 'Hide bottom border' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable toggle' },
    ],
    code: `import { SettingRow } from '../../components/SettingRow';

<SettingRow
  title="Push Notifications"
  description="Receive game updates and friend requests"
  checked={notifications}
  onChange={() => setNotifications(!notifications)}
/>`,
  },

  'share-sheet': {
    examples: <ShareSheetExample />,
    props: [
      { name: 'open', type: 'boolean', default: '-', description: 'Dialog visibility' },
      { name: 'onClose', type: '() => void', default: '-', description: 'Close handler' },
      { name: 'url', type: 'string', default: '-', description: 'URL to share' },
      { name: 'title', type: 'string', default: "'Share'", description: 'Dialog title' },
      { name: 'text', type: 'string', default: "'Check this out!'", description: 'Share text' },
    ],
    code: `import { ShareSheet } from '../../components/ShareSheet';

<ShareSheet
  open={open}
  onClose={() => setOpen(false)}
  url="https://neverdieguy.com/game/abc123"
  title="Share Game"
  text="Check out my game!"
/>`,
  },

  'sortable-header': {
    examples: (
      <Box>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          SortableHeader creates clickable table column headers with ascending/descending sort indicators.
        </Typography>
        <Paper sx={{ bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem', cursor: 'pointer' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>Name</Box>
                </TableCell>
                <TableCell sx={{ color: tokens.colors.text.secondary, fontSize: '0.7rem', cursor: 'pointer' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Score <ExpandMoreIcon sx={{ fontSize: 14, transform: 'rotate(180deg)' }} />
                  </Box>
                </TableCell>
                <TableCell sx={{ color: tokens.colors.text.disabled, fontSize: '0.7rem', cursor: 'pointer' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>Date</Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell>Player1</TableCell><TableCell>1250</TableCell><TableCell>Jan 1</TableCell></TableRow>
              <TableRow><TableCell>Player2</TableCell><TableCell>980</TableCell><TableCell>Jan 2</TableCell></TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Box>
    ),
    props: [
      { name: 'column', type: 'string', default: '-', description: 'Column identifier' },
      { name: 'label', type: 'string', default: '-', description: 'Display label' },
      { name: 'sortConfig', type: 'SortConfig', default: '-', description: 'Current sort state' },
      { name: 'onSort', type: '(column: string) => void', default: '-', description: 'Sort handler' },
      { name: 'width', type: 'number | string', default: '-', description: 'Column width' },
      { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", description: 'Text alignment' },
    ],
    code: `import { SortableHeader, SortConfig } from '../../components/ds/SortableHeader';

const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'score', direction: 'desc' });

const handleSort = (column: string) => {
  setSortConfig(prev => ({
    column,
    direction: prev?.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
  }));
};

<TableHead>
  <TableRow>
    <SortableHeader column="name" label="Name" sortConfig={sortConfig} onSort={handleSort} />
    <SortableHeader column="score" label="Score" sortConfig={sortConfig} onSort={handleSort} />
  </TableRow>
</TableHead>`,
  },

  'asset-image': {
    examples: (
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Fallback Behavior</Typography>
        <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, bgcolor: tokens.colors.background.elevated, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.text.disabled }}>Image</Typography>
            </Box>
            <Typography variant="caption">Success</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, bgcolor: tokens.colors.background.elevated, borderRadius: 1, border: `1px dashed ${tokens.colors.text.disabled}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.text.disabled }}>placeholder</Typography>
            </Box>
            <Typography variant="caption">Fallback</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.text.disabled }}>(hidden)</Typography>
            </Box>
            <Typography variant="caption">Hide mode</Typography>
          </Box>
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Rendering Modes</Typography>
        <Stack direction="row" spacing={2}>
          <Chip label="pixelated" size="small" variant="outlined" />
          <Chip label="padded" size="small" variant="outlined" />
          <Chip label="cover / contain" size="small" variant="outlined" />
        </Stack>
      </Box>
    ),
    props: [
      { name: 'src', type: 'string', default: '-', description: 'Primary image source' },
      { name: 'alt', type: 'string', default: '-', description: 'Alt text' },
      { name: 'category', type: 'WikiCategory', default: '-', description: 'Category for placeholder' },
      { name: 'width', type: 'number | string', default: '-', description: 'Image width' },
      { name: 'height', type: 'number | string', default: '-', description: 'Image height' },
      { name: 'fallback', type: "'hide' | 'placeholder'", default: "'hide'", description: 'Fallback behavior' },
      { name: 'pixelated', type: 'boolean', default: 'false', description: 'Pixelated rendering' },
      { name: 'padded', type: 'boolean', default: 'false', description: 'Add 8% padding' },
      { name: 'objectFit', type: "'contain' | 'cover'", default: "'contain'", description: 'Object fit mode' },
    ],
    code: `import { AssetImage } from '../../components/ds/AssetImage';

<AssetImage
  src="/assets/enemies/void-spawn.png"
  alt="Void Spawn"
  width={64}
  height={64}
  category="enemies"
  fallback="placeholder"
  pixelated
/>`,
  },

  'market-sprite': {
    examples: (
      <Box>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          MarketSprite renders animated character sprites from the market sprite sheets using the useCharacterAnimation hook.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Components</Typography>
        <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 100, height: 100, bgcolor: tokens.colors.background.elevated, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.text.disabled }}>MarketSprite</Typography>
            </Box>
            <Typography variant="caption">Animated (100px)</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ width: 120, height: 120, bgcolor: tokens.colors.background.elevated, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.text.disabled }}>MarketPortrait</Typography>
            </Box>
            <Typography variant="caption">Static portrait</Typography>
          </Box>
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Animation States</Typography>
        <Stack direction="row" spacing={1}>
          {['idle', 'walk', 'shop', 'action'].map((s) => (
            <Chip key={s} label={s} size="small" variant="outlined" />
          ))}
        </Stack>
      </Box>
    ),
    props: [
      { name: 'characterId', type: 'CharacterId', default: '-', description: 'Character identifier' },
      { name: 'animation', type: 'AnimationState', default: "'idle'", description: 'Animation state' },
      { name: 'size', type: 'number', default: '100', description: 'Sprite size' },
      { name: 'autoPlay', type: 'boolean', default: 'true', description: 'Auto-play animation' },
      { name: 'onClick', type: '() => void', default: '-', description: 'Click handler' },
    ],
    code: `import { MarketSprite, MarketPortrait } from '../../components/MarketSprite';

<MarketSprite characterId="mr-bones" animation="idle" />
<MarketSprite characterId="boo-g" animation="shop" size={64} />
<MarketPortrait characterId="dr-maxwell" size={120} />`,
  },

  'lottie-overlay': {
    examples: (
      <Box>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          LottieOverlay displays animated Lottie effects (confetti, skull, star, energy) as overlays.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Available Types</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          {['confetti', 'skull', 'star', 'energy'].map((type) => (
            <Box key={type} sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${tokens.colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.text.disabled }}>{type}</Typography>
              </Box>
              <Typography variant="caption">{type}</Typography>
            </Box>
          ))}
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Components</Typography>
        <Stack direction="row" spacing={1}>
          <Chip label="LottieOverlay" size="small" />
          <Chip label="LottieTrigger" size="small" variant="outlined" />
        </Stack>
      </Box>
    ),
    props: [
      { name: 'type', type: "'confetti' | 'skull' | 'star' | 'energy'", default: '-', description: 'Lottie animation type' },
      { name: 'play', type: 'boolean', default: '-', description: 'Trigger animation' },
      { name: 'onComplete', type: '() => void', default: '-', description: 'Animation complete callback' },
      { name: 'size', type: 'number', default: '120', description: 'Animation size' },
    ],
    code: `import { LottieOverlay, LottieTrigger } from '../../components/LottieOverlay';

// Controlled overlay
<LottieOverlay
  type="confetti"
  play={showConfetti}
  onComplete={() => setShowConfetti(false)}
/>

// Increment-based trigger
<LottieTrigger type="star" trigger={starCount} />`,
  },

  'lucky-number-picker': {
    examples: (
      <Box>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          LuckyNumberPicker allows users to select their Die-rector patron (lucky number 1-6) or special options (0=None, 7=All).
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Die-rector Dice</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Box key={n} sx={{ width: 40, height: 40, borderRadius: 1, border: `2px solid ${n === 3 ? tokens.colors.success : tokens.colors.border}`, bgcolor: n === 3 ? `${tokens.colors.success}20` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: n === 3 ? tokens.colors.success : tokens.colors.text.disabled }}>{n}</Box>
          ))}
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Special Options</Typography>
        <Stack direction="row" spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', border: `2px solid ${tokens.colors.text.disabled}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BlockIcon sx={{ fontSize: 16, color: tokens.colors.text.disabled }} />
            </Box>
            <Typography variant="caption">None (0)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: tokens.colors.text.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '0.6rem', color: tokens.colors.background.default }}>All</Typography>
            </Box>
            <Typography variant="caption">All (7)</Typography>
          </Box>
        </Stack>
      </Box>
    ),
    props: [
      { name: 'value', type: 'LuckyNumber (0-7)', default: '-', description: 'Selected lucky number' },
      { name: 'onChange', type: '(value: LuckyNumber) => void', default: '-', description: 'Selection handler' },
      { name: 'showLabels', type: 'boolean', default: 'true', description: 'Show Die-rector names' },
      { name: 'compact', type: 'boolean', default: 'false', description: 'Compact layout' },
    ],
    code: `import { LuckyNumberPicker, LuckyNumberBadge } from '../../components/LuckyNumberPicker';

// Full picker
<LuckyNumberPicker
  value={luckyNumber}
  onChange={setLuckyNumber}
  showLabels
/>

// Compact badge
<LuckyNumberBadge value={3} size="md" showLabel />`,
  },

  'transition-wipe': {
    examples: (
      <Box>
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
          TransitionWipe provides a Balatro-inspired NDG skull wipe transition between game panels.
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Transition Phases</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          {(['idle', 'exit', 'wipe', 'enter'] as const).map((phase) => (
            <Box key={phase} sx={{ textAlign: 'center' }}>
              <Box sx={{ width: 60, height: 40, bgcolor: phase === 'wipe' ? tokens.colors.background.default : tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                {phase === 'wipe' && <Typography sx={{ fontSize: '0.5rem', color: tokens.colors.primary }}>NDG</Typography>}
              </Box>
              <Typography variant="caption">{phase}</Typography>
            </Box>
          ))}
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>Features</Typography>
        <Stack direction="row" spacing={1}>
          <Chip label="Fade in/out" size="small" variant="outlined" />
          <Chip label="Skull pulse glow" size="small" variant="outlined" />
          <Chip label="Configurable duration" size="small" variant="outlined" />
        </Stack>
      </Box>
    ),
    props: [
      { name: 'phase', type: "'idle' | 'exit' | 'wipe' | 'enter'", default: '-', description: 'Current transition phase' },
      { name: 'onWipeComplete', type: '() => void', default: '-', description: 'Called when wipe animation finishes' },
      { name: 'duration', type: 'number', default: '300', description: 'Animation duration in ms' },
    ],
    code: `import { TransitionWipe, TransitionPhase } from '../../components/TransitionWipe';

const [phase, setPhase] = useState<TransitionPhase>('idle');

const handleTransition = () => {
  setPhase('wipe');
};

<TransitionWipe
  phase={phase}
  onWipeComplete={() => {
    setPhase('enter');
    // Load new content
  }}
  duration={300}
/>`,
  },
};

// ============================================
// Interactive Example Components
// ============================================

function BaseDialogExample() {
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <Button variant="contained" onClick={() => setOpen(true)}>Open BaseDialog</Button>
      <BaseDialog open={open} onClose={() => setOpen(false)} title="Example Dialog">
        <DialogContent>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
            BaseDialog provides consistent styling for all dialogs including background color, border, and optional header.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpen(false)}>Confirm</Button>
        </DialogActions>
      </BaseDialog>
    </Box>
  );
}

function ConfirmDialogExample() {
  const [openBlock, setOpenBlock] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button variant="outlined" color="error" onClick={() => setOpenBlock(true)}>Block User</Button>
      <Button variant="outlined" color="error" onClick={() => setOpenDelete(true)}>Delete Item</Button>

      <ConfirmDialog
        open={openBlock}
        onClose={() => setOpenBlock(false)}
        onConfirm={() => setOpenBlock(false)}
        title="Block User"
        icon={<BlockIcon />}
        iconColor={tokens.colors.error}
        confirmLabel="Block"
        confirmColor="error"
      >
        <Typography variant="body1" sx={{ color: tokens.colors.text.secondary, mb: 2, textAlign: 'center' }}>
          Are you sure you want to block this user? You won't see their messages anymore.
        </Typography>
      </ConfirmDialog>

      <ConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={() => setOpenDelete(false)}
        title="Delete Item"
        icon={<DeleteIcon />}
        iconColor={tokens.colors.warning}
        confirmLabel="Delete"
        confirmColor="error"
      >
        <Typography variant="body1" sx={{ color: tokens.colors.text.secondary, mb: 2, textAlign: 'center' }}>
          This action cannot be undone. Are you sure?
        </Typography>
      </ConfirmDialog>
    </Box>
  );
}

function SuccessDialogExample() {
  const [openBasic, setOpenBasic] = useState(false);
  const [openCustom, setOpenCustom] = useState(false);

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button variant="contained" color="success" onClick={() => setOpenBasic(true)}>Basic Success</Button>
      <Button variant="outlined" onClick={() => setOpenCustom(true)}>Custom Actions</Button>

      <SuccessDialog
        open={openBasic}
        onClose={() => setOpenBasic(false)}
        title="Request Sent!"
        message="Your friend request has been sent successfully."
      />

      <SuccessDialog
        open={openCustom}
        onClose={() => setOpenCustom(false)}
        icon={<FlagIcon />}
        iconColor={tokens.colors.warning}
        title="Report Submitted"
        message="Thank you for helping keep our community safe."
        actions={
          <>
            <Button variant="contained" fullWidth startIcon={<HomeIcon />} onClick={() => setOpenCustom(false)}>
              Back to Home
            </Button>
            <Button variant="outlined" fullWidth onClick={() => setOpenCustom(false)}>
              Close
            </Button>
          </>
        }
      />
    </Box>
  );
}

function ReportDialogExample() {
  const [open, setOpen] = useState(false);

  const EXAMPLE_REASONS = [
    'Harassment or bullying',
    'Spam or misleading content',
    'Inappropriate content',
    'Cheating or exploits',
    'Other',
  ] as const;

  return (
    <Box>
      <Button variant="outlined" color="warning" startIcon={<FlagIcon />} onClick={() => setOpen(true)}>
        Report User
      </Button>

      <ReportDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(reason, details) => console.log('Report:', reason, details)}
        title="Report User"
        prompt="Why are you reporting this user?"
        reasons={EXAMPLE_REASONS}
        successTitle="Report Submitted"
        successMessage="Thank you for helping keep our community safe. We'll review your report."
        maxDetails={150}
      />
    </Box>
  );
}

function ExpandableSectionExample() {
  const [expanded, setExpanded] = useState<string | null>('stats');

  return (
    <Paper sx={{ bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, maxWidth: 400 }}>
      <ExpandableSection
        id="stats"
        icon={<StarIcon sx={{ color: tokens.colors.warning }} />}
        title="Statistics"
        value="1,234"
        expanded={expanded === 'stats'}
        onToggle={(id) => setExpanded(expanded === id ? null : id)}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>Wins</Typography>
          <Typography variant="body2">847</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>Win Rate</Typography>
          <Typography variant="body2">68.7%</Typography>
        </Box>
      </ExpandableSection>

      <ExpandableSection
        id="items"
        icon={<HomeIcon sx={{ color: tokens.colors.secondary }} />}
        title="Inventory"
        value="42"
        expanded={expanded === 'items'}
        onToggle={(id) => setExpanded(expanded === id ? null : id)}
      >
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
          You have 42 items in your inventory.
        </Typography>
      </ExpandableSection>

      <ExpandableSection
        id="settings"
        icon={<SettingsIcon sx={{ color: tokens.colors.text.disabled }} />}
        title="Settings"
        expanded={expanded === 'settings'}
        onToggle={(id) => setExpanded(expanded === id ? null : id)}
        showBorder={false}
      >
        <Typography variant="body2" sx={{ color: tokens.colors.text.secondary }}>
          Configure your preferences here.
        </Typography>
      </ExpandableSection>
    </Paper>
  );
}

function BottomSheetExample() {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState<'auto' | 'half' | 'full'>('auto');

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="outlined" onClick={() => { setHeight('auto'); setOpen(true); }}>Auto Height</Button>
        <Button variant="outlined" onClick={() => { setHeight('half'); setOpen(true); }}>Half Height</Button>
        <Button variant="outlined" onClick={() => { setHeight('full'); setOpen(true); }}>Full Height</Button>
      </Box>

      <BottomSheet open={open} onClose={() => setOpen(false)} height={height}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Bottom Sheet</Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
            Current height: {height}
          </Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 3 }}>
            Bottom sheets slide up from the bottom of the screen. They're great for mobile-first experiences and contextual actions.
          </Typography>
          <Button variant="contained" fullWidth onClick={() => setOpen(false)}>
            Close Sheet
          </Button>
        </Box>
      </BottomSheet>
    </Box>
  );
}

function SettingRowExample() {
  const [settings, setSettings] = useState({ notifications: true, sound: false, haptics: true });

  return (
    <Paper sx={{ bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}`, maxWidth: 400 }}>
      <Box sx={{ p: 2, borderBottom: `1px solid ${tokens.colors.border}` }}>
        <Typography variant="h6">Settings</Typography>
      </Box>
      <Box sx={{ p: 2, borderBottom: `1px solid ${tokens.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body1">Push Notifications</Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Receive game updates and friend requests</Typography>
        </Box>
        <Switch checked={settings.notifications} onChange={() => setSettings(s => ({ ...s, notifications: !s.notifications }))} />
      </Box>
      <Box sx={{ p: 2, borderBottom: `1px solid ${tokens.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body1">Sound Effects</Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Play sound on dice rolls and wins</Typography>
        </Box>
        <Switch checked={settings.sound} onChange={() => setSettings(s => ({ ...s, sound: !s.sound }))} />
      </Box>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body1">Haptic Feedback</Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.text.disabled }}>Vibrate on important actions</Typography>
        </Box>
        <Switch checked={settings.haptics} onChange={() => setSettings(s => ({ ...s, haptics: !s.haptics }))} />
      </Box>
    </Paper>
  );
}

function ShareSheetExample() {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Button variant="outlined" onClick={() => setOpen(true)}>Open Share Sheet</Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` } }}>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Share</Typography>
          <Typography variant="body2" sx={{ color: tokens.colors.text.secondary, mb: 2 }}>
            ShareSheet opens a dialog with copy link and social platform buttons.
          </Typography>
          <TextField fullWidth value="https://neverdieguy.com/game/abc123" InputProps={{ readOnly: true }} sx={{ mb: 2 }} />
          <Stack direction="row" spacing={1} justifyContent="center">
            {[{ n: 'Twitter', c: '#1DA1F2' }, { n: 'Facebook', c: '#1877F2' }, { n: 'Reddit', c: '#FF4500' }].map((p) => (
              <Box key={p.n} sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: p.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{p.n[0]}</Box>
            ))}
          </Stack>
          <Button variant="contained" fullWidth onClick={() => setOpen(false)} sx={{ mt: 2 }}>Close</Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export function ComponentDetail() {
  const { componentId } = useParams<{ componentId: string }>();
  const navigate = useNavigate();

  const component = componentRegistry.find((c) => c.id === componentId);
  const details = componentId ? componentDetails[componentId] : null;

  if (!component) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Component not found</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/design-system')} sx={{ mt: 2 }}>
          Back to Design System
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Back link */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/design-system')}
        sx={{ mb: 3, color: tokens.colors.text.secondary }}
      >
        Design System
      </Button>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
            {component.name}
          </Typography>
          <Chip
            label={component.category}
            size="small"
            sx={{
              bgcolor: `${tokens.colors.primary}15`,
              color: tokens.colors.primary,
              fontWeight: 500,
            }}
          />
        </Box>
        <Typography variant="body1" sx={{ color: tokens.colors.text.secondary }}>
          {component.description}
        </Typography>
      </Box>

      <Divider sx={{ my: 4, borderColor: tokens.colors.border }} />

      {/* Examples */}
      {details?.examples && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Examples
          </Typography>
          <BaseCard sx={{ mb: 4 }}>
            {details.examples}
          </BaseCard>
        </>
      )}

      {/* Props Table */}
      {details?.props && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Props
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4, bgcolor: tokens.colors.background.paper, border: `1px solid ${tokens.colors.border}` }}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { borderColor: tokens.colors.border, fontWeight: 600 } }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Default</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {details.props.map((prop) => (
                  <TableRow key={prop.name} sx={{ '& td': { borderColor: tokens.colors.border } }}>
                    <TableCell sx={{ fontFamily: 'monospace', color: tokens.colors.primary }}>{prop.name}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{prop.type}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', color: tokens.colors.text.disabled }}>{prop.default}</TableCell>
                    <TableCell>{prop.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Code */}
      {details?.code && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            Usage
          </Typography>
          <Paper
            sx={{
              p: 2,
              bgcolor: tokens.colors.background.elevated,
              border: `1px solid ${tokens.colors.border}`,
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap',
              overflowX: 'auto',
            }}
          >
            {details.code}
          </Paper>
        </>
      )}
    </Container>
  );
}
