/**
 * Central export for shared components.
 * Import from '@/components' or '../../components' instead of individual files.
 */

// Layout
export { Shell } from './Shell';
export { AuthLayout } from './AuthLayout';

// Cards & Containers
export { CardSection } from './CardSection';
export { BaseCard } from './BaseCard';
export { StatCard } from './StatCard';
export { BottomSheet } from './BottomSheet';

// Headers & Labels
export { SectionHeader } from './SectionHeader';
export { DialogHeader } from './DialogHeader';

// Icons & Badges
export { CircleIcon, IconBadge, IconCircle } from './CircleIcon';
export type { CircleIconProps } from './CircleIcon';
export { DataBadge } from './DataBadge';
export { TokenIcon } from './TokenIcon';
export { BronzePlacard } from './BronzePlacard';

// List Items
export { ListItemRow } from './ListItemRow';
export { SettingRow } from './SettingRow';
export { StatRow } from './StatRow';

// Dice & Game
export { DiceShape, DiceMini } from './DiceShapes';

// Sprites
export { CharacterSprite, getCharacterSpriteSize, isLargeSprite } from './CharacterSprite';
export { AnimatedSprite } from './AnimatedSprite';
export { MarketSprite, MarketPortrait } from './MarketSprite';

// Feedback & Overlays
export { NotificationToast } from './NotificationToast';
export { FavorEffectToast } from './FavorEffectToast';

// Dialogs & Sheets
export { ShareSheet } from './ShareSheet';
export { ReportGameDialog } from './ReportGameDialog';

// Dialog Components (new unified dialog system)
export { BaseDialog, ConfirmDialog, ReportDialog, SuccessDialog } from './dialogs';

// Placeholders & Skeletons
export { PageHeader, TextBlock, FormField, SidebarLayout, PlaceholderCard } from './Placeholder';
export { LeaderboardSkeleton, ProgressSkeleton, HistorySkeleton, WikiIndexSkeleton, HomeSkeleton } from './Placeholder';

// Setup
export { SidebarSetup } from './SidebarSetup';

// Guest Experience
export { GuestBanner, GuestBlockModal } from './GuestExperience';
