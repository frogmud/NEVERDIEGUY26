// Player data persistence for stash/inventory system
// Stored in localStorage, persists between runs

// ============================================
// Types
// ============================================

export interface PlayerData {
  stash: StashItem[];           // Permanent collection (at home)
  gold: number;                 // Persistent gold between runs
  stats: PlayerStats;           // Lifetime stats
  version: number;              // Schema version for migrations
}

export interface StashItem {
  id: string;                   // UUID
  itemSlug: string;             // Reference to wiki item
  quantity: number;             // Stackable count
  acquiredAt: number;           // Timestamp
}

export interface PlayerStats {
  totalGoldEarned: number;
  totalGoldSpent: number;
  runsCompleted: number;
  runsWon: number;
  itemsCollected: number;
  itemsSold: number;
}

// ============================================
// Constants
// ============================================

const STORAGE_KEY = 'ndg_player_data';
const CURRENT_VERSION = 1;

// ============================================
// Default Data
// ============================================

export function createDefaultPlayerData(): PlayerData {
  return {
    stash: [],
    gold: 0,
    stats: {
      totalGoldEarned: 0,
      totalGoldSpent: 0,
      runsCompleted: 0,
      runsWon: 0,
      itemsCollected: 0,
      itemsSold: 0,
    },
    version: CURRENT_VERSION,
  };
}

// ============================================
// UUID Generator
// ============================================

function generateId(): string {
  return crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ============================================
// localStorage Functions
// ============================================

export function loadPlayerData(): PlayerData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createDefaultPlayerData();
    }

    const parsed = JSON.parse(stored) as PlayerData;

    // Version migration (future-proofing)
    if (parsed.version !== CURRENT_VERSION) {
      return migratePlayerData(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load player data:', error);
    return createDefaultPlayerData();
  }
}

export function savePlayerData(data: PlayerData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save player data:', error);
  }
}

export function clearPlayerData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ============================================
// Stash Operations
// ============================================

export function addToStash(
  data: PlayerData,
  itemSlug: string,
  quantity: number = 1
): PlayerData {
  // Check if item already exists (stack)
  const existingIndex = data.stash.findIndex(
    (item) => item.itemSlug === itemSlug
  );

  let newStash: StashItem[];

  if (existingIndex >= 0) {
    // Stack with existing
    newStash = [...data.stash];
    newStash[existingIndex] = {
      ...newStash[existingIndex],
      quantity: newStash[existingIndex].quantity + quantity,
    };
  } else {
    // Add new item
    const newItem: StashItem = {
      id: generateId(),
      itemSlug,
      quantity,
      acquiredAt: Date.now(),
    };
    newStash = [...data.stash, newItem];
  }

  return {
    ...data,
    stash: newStash,
    stats: {
      ...data.stats,
      itemsCollected: data.stats.itemsCollected + quantity,
    },
  };
}

export function removeFromStash(
  data: PlayerData,
  itemId: string,
  quantity: number = 1
): PlayerData {
  const itemIndex = data.stash.findIndex((item) => item.id === itemId);

  if (itemIndex < 0) {
    return data; // Item not found
  }

  const item = data.stash[itemIndex];
  let newStash: StashItem[];

  if (item.quantity <= quantity) {
    // Remove entirely
    newStash = data.stash.filter((_, i) => i !== itemIndex);
  } else {
    // Reduce quantity
    newStash = [...data.stash];
    newStash[itemIndex] = {
      ...item,
      quantity: item.quantity - quantity,
    };
  }

  return {
    ...data,
    stash: newStash,
  };
}

export function findInStash(
  data: PlayerData,
  itemSlug: string
): StashItem | undefined {
  return data.stash.find((item) => item.itemSlug === itemSlug);
}

export function getStashQuantity(data: PlayerData, itemSlug: string): number {
  const item = findInStash(data, itemSlug);
  return item?.quantity ?? 0;
}

// ============================================
// Gold Operations
// ============================================

export function addGold(data: PlayerData, amount: number): PlayerData {
  return {
    ...data,
    gold: data.gold + amount,
    stats: {
      ...data.stats,
      totalGoldEarned: data.stats.totalGoldEarned + amount,
    },
  };
}

export function spendGold(data: PlayerData, amount: number): PlayerData | null {
  if (data.gold < amount) {
    return null; // Not enough gold
  }

  return {
    ...data,
    gold: data.gold - amount,
    stats: {
      ...data.stats,
      totalGoldSpent: data.stats.totalGoldSpent + amount,
    },
  };
}

export function sellItem(
  data: PlayerData,
  itemId: string,
  price: number,
  quantity: number = 1
): PlayerData {
  const withoutItem = removeFromStash(data, itemId, quantity);

  return {
    ...withoutItem,
    gold: withoutItem.gold + price,
    stats: {
      ...withoutItem.stats,
      totalGoldEarned: withoutItem.stats.totalGoldEarned + price,
      itemsSold: withoutItem.stats.itemsSold + quantity,
    },
  };
}

// ============================================
// Run Stats
// ============================================

export function recordRunComplete(
  data: PlayerData,
  won: boolean,
  goldEarned: number
): PlayerData {
  return {
    ...data,
    gold: data.gold + goldEarned,
    stats: {
      ...data.stats,
      runsCompleted: data.stats.runsCompleted + 1,
      runsWon: data.stats.runsWon + (won ? 1 : 0),
      totalGoldEarned: data.stats.totalGoldEarned + goldEarned,
    },
  };
}

// ============================================
// Run State Persistence (for Continue button)
// ============================================

const RUN_STORAGE_KEY = 'ndg_saved_run';

export interface SavedRunState {
  threadId: string;
  currentDomain: number;
  roomNumber: number;
  gold: number;
  totalScore: number;
  tier: number;
  phase: string;
  centerPanel: string;
  domainState: {
    id: number;
    name: string;
    clearedCount: number;
    totalZones: number;
  } | null;
  selectedZoneId: string | null;
  inventory: {
    dice: Record<string, number>;
    powerups: string[];
    upgrades: string[];
  };
  runStats: {
    npcsSquished: number;
    diceThrown: number;
    eventsCompleted: number;
    purchases: number;
  };
  // Scar system (4 scars = game over)
  scars: number;
  savedAt: number;
}

export function saveRunState(state: SavedRunState): void {
  try {
    localStorage.setItem(RUN_STORAGE_KEY, JSON.stringify({
      ...state,
      savedAt: Date.now(),
    }));
  } catch (error) {
    console.error('Failed to save run state:', error);
  }
}

export function loadSavedRun(): SavedRunState | null {
  try {
    const stored = localStorage.getItem(RUN_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as SavedRunState;

    // Check if save is too old (24 hours)
    const MAX_AGE = 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.savedAt > MAX_AGE) {
      clearSavedRun();
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load saved run:', error);
    return null;
  }
}

export function hasSavedRun(): boolean {
  return loadSavedRun() !== null;
}

export function clearSavedRun(): void {
  localStorage.removeItem(RUN_STORAGE_KEY);
}

// ============================================
// Social Settings Persistence
// ============================================

const SOCIAL_SETTINGS_KEY = 'ndg_social_settings';

export interface SocialSettingsData {
  whoCanMessage: 'everyone' | 'friends' | 'none';
  showOnlineStatus: boolean;
  showActivityStatus: boolean;
}

export function createDefaultSocialSettings(): SocialSettingsData {
  return {
    whoCanMessage: 'everyone',
    showOnlineStatus: true,
    showActivityStatus: true,
  };
}

export function loadSocialSettings(): SocialSettingsData {
  try {
    const stored = localStorage.getItem(SOCIAL_SETTINGS_KEY);
    if (!stored) {
      return createDefaultSocialSettings();
    }
    return { ...createDefaultSocialSettings(), ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to load social settings:', error);
    return createDefaultSocialSettings();
  }
}

export function saveSocialSettings(settings: SocialSettingsData): void {
  try {
    localStorage.setItem(SOCIAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save social settings:', error);
  }
}

// ============================================
// Notification Settings Persistence
// ============================================

const NOTIFICATION_SETTINGS_KEY = 'ndg_notification_settings';

export interface NotificationSettingsData {
  // Push notifications
  pushEnabled: boolean;
  pushNPCMessages: boolean;
  pushChallenges: boolean;
  pushAchievements: boolean;
  pushSystem: boolean;
  // Email notifications
  emailEnabled: boolean;
  emailWeeklyDigest: boolean;
  emailPromotions: boolean;
  emailNewFeatures: boolean;
}

export function createDefaultNotificationSettings(): NotificationSettingsData {
  return {
    pushEnabled: true,
    pushNPCMessages: true,
    pushChallenges: true,
    pushAchievements: true,
    pushSystem: true,
    emailEnabled: true,
    emailWeeklyDigest: true,
    emailPromotions: false,
    emailNewFeatures: true,
  };
}

export function loadNotificationSettings(): NotificationSettingsData {
  try {
    const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!stored) {
      return createDefaultNotificationSettings();
    }
    return { ...createDefaultNotificationSettings(), ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to load notification settings:', error);
    return createDefaultNotificationSettings();
  }
}

export function saveNotificationSettings(settings: NotificationSettingsData): void {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save notification settings:', error);
  }
}

// ============================================
// Game Settings Persistence
// ============================================

const GAME_SETTINGS_KEY = 'ndg_game_settings';

export interface GameSettingsData {
  showDamageNumbers: boolean;
  screenShake: boolean;
  autoRoll: boolean;
  showFavorEffects: boolean;
  rerollOnesOnPreferred: boolean;
  compactDice: boolean;
}

export function createDefaultGameSettings(): GameSettingsData {
  return {
    showDamageNumbers: true,
    screenShake: true,
    autoRoll: false,
    showFavorEffects: true,
    rerollOnesOnPreferred: true,
    compactDice: false,
  };
}

export function loadGameSettings(): GameSettingsData {
  try {
    const stored = localStorage.getItem(GAME_SETTINGS_KEY);
    if (!stored) {
      return createDefaultGameSettings();
    }
    return { ...createDefaultGameSettings(), ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to load game settings:', error);
    return createDefaultGameSettings();
  }
}

export function saveGameSettings(settings: GameSettingsData): void {
  try {
    localStorage.setItem(GAME_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save game settings:', error);
  }
}

// ============================================
// Profile Data Persistence
// ============================================

const PROFILE_STORAGE_KEY = 'ndg_profile';

export interface ProfileData {
  displayName: string;
  bio: string;
  status: 'online' | 'away' | 'dnd' | 'invisible';
  avatarId: string;
  playerNumber: number;  // Unique player number (NEVER DIE GUY #)
  updatedAt: number;
}

// Key for storing the global player number counter
const PLAYER_NUMBER_KEY = 'ndg_player_number';

/**
 * Get or generate a unique player number for this browser/device.
 * Numbers are assigned sequentially starting from 1.
 */
function getOrCreatePlayerNumber(): number {
  const stored = localStorage.getItem(PLAYER_NUMBER_KEY);
  if (stored) {
    return parseInt(stored, 10);
  }

  // Generate new player number
  // Use timestamp + random to create a unique-ish number
  // In a real system this would be server-assigned, but for MVP
  // we'll use a simple approach that creates reasonably unique numbers
  const playerNumber = Math.floor(Date.now() / 1000) % 1000000 + Math.floor(Math.random() * 1000);
  localStorage.setItem(PLAYER_NUMBER_KEY, String(playerNumber));
  console.log(`Welcome, NEVER DIE GUY #${playerNumber}!`);
  return playerNumber;
}

export function createDefaultProfile(): ProfileData {
  return {
    displayName: 'NEVER DIE GUY',
    bio: '',
    status: 'online',
    avatarId: 'skull',
    playerNumber: getOrCreatePlayerNumber(),
    updatedAt: Date.now(),
  };
}

export function loadProfile(): ProfileData {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!stored) {
      return createDefaultProfile();
    }
    const parsed = JSON.parse(stored) as ProfileData;

    // Migrate: ensure player number exists
    if (!parsed.playerNumber) {
      parsed.playerNumber = getOrCreatePlayerNumber();
      saveProfile(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load profile:', error);
    return createDefaultProfile();
  }
}

export function saveProfile(profile: ProfileData): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
      ...profile,
      updatedAt: Date.now(),
    }));
  } catch (error) {
    console.error('Failed to save profile:', error);
  }
}

// ============================================
// Board & Pieces Settings Persistence
// ============================================

const BOARD_SETTINGS_KEY = 'ndg_board_settings';

export interface BoardSettingsData {
  theme: 'classic' | 'monochrome';
  size: 'compact' | 'standard' | 'large';
  use3D: boolean;
  showRollAnimation: boolean;
  showCritEffects: boolean;
  hapticFeedback: boolean;
}

export function createDefaultBoardSettings(): BoardSettingsData {
  return {
    theme: 'classic',
    size: 'standard',
    use3D: false,
    showRollAnimation: true,
    showCritEffects: true,
    hapticFeedback: true,
  };
}

export function loadBoardSettings(): BoardSettingsData {
  try {
    const stored = localStorage.getItem(BOARD_SETTINGS_KEY);
    if (!stored) {
      return createDefaultBoardSettings();
    }
    return { ...createDefaultBoardSettings(), ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to load board settings:', error);
    return createDefaultBoardSettings();
  }
}

export function saveBoardSettings(settings: BoardSettingsData): void {
  try {
    localStorage.setItem(BOARD_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save board settings:', error);
  }
}

// ============================================
// Daily Reward Persistence
// ============================================

const DAILY_REWARD_KEY = 'ndg_daily_reward';

export interface DailyRewardData {
  lastClaimDate: string | null; // ISO date string (YYYY-MM-DD)
  currentStreak: number;
  weekProgress: number[]; // Days claimed this week (1-7)
  totalClaimed: number;
}

export function createDefaultDailyReward(): DailyRewardData {
  return {
    lastClaimDate: null,
    currentStreak: 0,
    weekProgress: [],
    totalClaimed: 0,
  };
}

export function loadDailyReward(): DailyRewardData {
  try {
    const stored = localStorage.getItem(DAILY_REWARD_KEY);
    if (!stored) {
      return createDefaultDailyReward();
    }
    return { ...createDefaultDailyReward(), ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to load daily reward:', error);
    return createDefaultDailyReward();
  }
}

export function saveDailyReward(data: DailyRewardData): void {
  try {
    localStorage.setItem(DAILY_REWARD_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save daily reward:', error);
  }
}

// Helper to get today's date as YYYY-MM-DD
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Check if user can claim today
export function canClaimToday(data: DailyRewardData): boolean {
  return data.lastClaimDate !== getTodayDateString();
}

// Calculate current day in week (1-7)
export function getCurrentWeekDay(data: DailyRewardData): number {
  return (data.weekProgress.length % 7) + 1;
}

// ============================================
// Heat System Persistence (Streak-based difficulty)
// ============================================

const HEAT_STORAGE_KEY = 'ndg_heat';

export interface HeatData {
  currentHeat: number;      // Current streak level (resets on death)
  maxHeatEver: number;      // Personal best streak
  lastRunWon: boolean;      // Did last run end in victory?
  updatedAt: number;
}

export function createDefaultHeatData(): HeatData {
  return {
    currentHeat: 0,
    maxHeatEver: 0,
    lastRunWon: false,
    updatedAt: Date.now(),
  };
}

export function loadHeatData(): HeatData {
  try {
    const stored = localStorage.getItem(HEAT_STORAGE_KEY);
    if (!stored) {
      return createDefaultHeatData();
    }
    return { ...createDefaultHeatData(), ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to load heat data:', error);
    return createDefaultHeatData();
  }
}

export function saveHeatData(data: HeatData): void {
  try {
    localStorage.setItem(HEAT_STORAGE_KEY, JSON.stringify({
      ...data,
      updatedAt: Date.now(),
    }));
  } catch (error) {
    console.error('Failed to save heat data:', error);
  }
}

/**
 * Increment heat after completing a domain.
 * Also updates maxHeatEver if current streak is a new record.
 */
export function incrementHeat(data: HeatData): HeatData {
  const newHeat = data.currentHeat + 1;
  return {
    ...data,
    currentHeat: newHeat,
    maxHeatEver: Math.max(data.maxHeatEver, newHeat),
    lastRunWon: true,
    updatedAt: Date.now(),
  };
}

/**
 * Reset heat to 0 after death.
 * Preserves maxHeatEver for historical tracking.
 */
export function resetHeat(data: HeatData): HeatData {
  return {
    ...data,
    currentHeat: 0,
    lastRunWon: false,
    updatedAt: Date.now(),
  };
}

// ============================================
// Corruption Persistence
// ============================================

const CORRUPTION_STORAGE_KEY = 'ndg_corruption';

export interface CorruptionData {
  level: number;  // 0-100
  updatedAt: number;
}

export function createDefaultCorruptionData(): CorruptionData {
  return {
    level: 0,
    updatedAt: Date.now(),
  };
}

export function loadCorruptionData(): CorruptionData {
  try {
    const stored = localStorage.getItem(CORRUPTION_STORAGE_KEY);
    if (!stored) {
      return createDefaultCorruptionData();
    }
    return { ...createDefaultCorruptionData(), ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to load corruption data:', error);
    return createDefaultCorruptionData();
  }
}

export function saveCorruptionData(data: CorruptionData): void {
  try {
    localStorage.setItem(CORRUPTION_STORAGE_KEY, JSON.stringify({
      ...data,
      updatedAt: Date.now(),
    }));
  } catch (error) {
    console.error('Failed to save corruption data:', error);
  }
}

/**
 * Add corruption after rerolling loadout.
 * Corruption is capped at 100.
 */
export function addCorruption(data: CorruptionData, amount: number): CorruptionData {
  return {
    level: Math.min(100, data.level + amount),
    updatedAt: Date.now(),
  };
}

/**
 * Reset corruption to 0 when starting fresh (new seed).
 */
export function resetCorruption(): CorruptionData {
  return createDefaultCorruptionData();
}

/**
 * Get the corruption cost for a reroll based on how many times rerolled.
 * Escalates: 5, 8, 12, 15 (capped at 15 for 4+ rerolls)
 */
export function getRerollCorruptionCost(rerollCount: number): number {
  const costs = [5, 8, 12, 15];
  return costs[Math.min(rerollCount, costs.length - 1)];
}

// ============================================
// Run History Persistence
// ============================================

const RUN_HISTORY_KEY = 'ndg_run_history';
const MAX_HISTORY_ENTRIES = 100;

export interface RunHistoryEntry {
  id: string;
  threadId: string;
  won: boolean;
  totalScore: number;
  gold: number;
  domain: number;
  roomsCleared: number;
  stats: {
    bestRoll: number;
    mostRolled: string;
    diceThrown: number;
    npcsSquished: number;
    purchases: number;
    killedBy?: string;
    heatAtDeath?: number;  // Heat level when run ended
  };
  timestamp: number;
  duration?: number; // milliseconds
}

export function loadRunHistory(): RunHistoryEntry[] {
  try {
    const stored = localStorage.getItem(RUN_HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as RunHistoryEntry[];
  } catch (error) {
    console.error('Failed to load run history:', error);
    return [];
  }
}

export function saveRunHistory(history: RunHistoryEntry[]): void {
  try {
    // Keep only the last MAX_HISTORY_ENTRIES
    const trimmed = history.slice(-MAX_HISTORY_ENTRIES);
    localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save run history:', error);
  }
}

export function addRunToHistory(entry: Omit<RunHistoryEntry, 'id' | 'timestamp'>): RunHistoryEntry {
  const history = loadRunHistory();
  const newEntry: RunHistoryEntry = {
    ...entry,
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    timestamp: Date.now(),
  };
  history.push(newEntry);
  saveRunHistory(history);
  return newEntry;
}

export function clearRunHistory(): void {
  localStorage.removeItem(RUN_HISTORY_KEY);
}

export function getRunHistoryStats(): {
  totalRuns: number;
  wins: number;
  losses: number;
  bestScore: number;
  avgScore: number;
  totalGoldEarned: number;
  bestStreak: number;
} {
  const history = loadRunHistory();
  const heatData = loadHeatData();

  if (history.length === 0) {
    return {
      totalRuns: 0, wins: 0, losses: 0, bestScore: 0, avgScore: 0,
      totalGoldEarned: 0, bestStreak: heatData.maxHeatEver
    };
  }

  const wins = history.filter(r => r.won).length;
  const totalScore = history.reduce((sum, r) => sum + r.totalScore, 0);
  const bestScore = Math.max(...history.map(r => r.totalScore));
  const totalGold = history.reduce((sum, r) => sum + r.gold, 0);

  return {
    totalRuns: history.length,
    wins,
    losses: history.length - wins,
    bestScore,
    avgScore: Math.round(totalScore / history.length),
    totalGoldEarned: totalGold,
    bestStreak: heatData.maxHeatEver,
  };
}

// ============================================
// Migration
// ============================================

function migratePlayerData(_oldData: PlayerData): PlayerData {
  // For future migrations when schema changes
  // Currently just return fresh data if version mismatch
  return createDefaultPlayerData();
}
