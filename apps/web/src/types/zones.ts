/**
 * Zone and Domain types for the hybrid globe/flat game architecture
 */

// Event variants for player choice
export type EventVariant = 'swift' | 'standard' | 'grueling';

export interface EventVariantConfig {
  label: string;
  description: string;
  goalMultiplier: number;    // Affects score goal
  timerMultiplier: number;   // Affects event duration
  goldMultiplier: number;    // Affects gold reward
  color: string;             // UI accent color
}

export const EVENT_VARIANTS: Record<EventVariant, EventVariantConfig> = {
  swift: {
    label: 'Swift',
    description: 'Quick clear, lower rewards',
    goalMultiplier: 0.6,     // 40% easier goal
    timerMultiplier: 0.6,    // 12s (base 20s * 0.6)
    goldMultiplier: 0.6,     // 40% less gold
    color: '#22c55e',        // Green - easy
  },
  standard: {
    label: 'Standard',
    description: 'Balanced risk and reward',
    goalMultiplier: 1.0,     // Base goal
    timerMultiplier: 1.0,    // 20s base
    goldMultiplier: 1.0,
    color: '#f59e0b',        // Amber - normal
  },
  grueling: {
    label: 'Grueling',
    description: 'High stakes, high payout',
    goalMultiplier: 1.5,     // 50% harder goal
    timerMultiplier: 1.5,    // 30s (base 20s * 1.5)
    goldMultiplier: 1.8,     // 80% more gold
    color: '#ef4444',        // Red - hard
  },
};

export interface ZoneMarker {
  id: string;
  lat: number;
  lng: number;
  tier: 1 | 2 | 3 | 4 | 5;
  type: 'stable' | 'elite' | 'anomaly';
  eventType: 'small' | 'big' | 'boss';
  eventVariant: EventVariant;
  cleared: boolean;
  rewards: ZoneRewards;
}

export interface ZoneRewards {
  goldMin: number;
  goldMax: number;
  lootTier: number;
}

export interface DomainState {
  id: number;
  name: string;
  slug: string;
  background: string;
  zones: ZoneMarker[];
  clearedCount: number;
  totalZones: number;
}

export type GamePhase = 'globe' | 'transition' | 'combat';

// Helper to calculate rewards based on tier
export function calculateRewards(tier: number): ZoneRewards {
  const baseGold = 50;
  return {
    goldMin: baseGold * tier,
    goldMax: baseGold * tier * 2,
    lootTier: tier,
  };
}

// Generate evenly-spaced points on sphere using fibonacci distribution
export function fibonacciSpherePoints(count: number): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
    const radius = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const lat = Math.asin(y) * (180 / Math.PI);
    const lng = ((theta * 180) / Math.PI) % 360 - 180;

    points.push({ lat, lng });
  }

  return points;
}

// Generate zone markers for a domain
// Flat structure: 3 event options (swift/standard/grueling) - player picks one
export function generateDomainZones(domainId: number, _zoneCount = 3): ZoneMarker[] {
  const zones: ZoneMarker[] = [];
  const variants: EventVariant[] = ['swift', 'standard', 'grueling'];
  const basePositions = fibonacciSpherePoints(3);

  // Generate 3 event options with different variants
  for (let i = 0; i < 3; i++) {
    const variant = variants[i];
    const tier = Math.min(5, domainId) as 1 | 2 | 3 | 4 | 5;

    zones.push({
      id: `${domainId}-event-${variant}`,
      lat: basePositions[i].lat + (Math.random() - 0.5) * 30,
      lng: basePositions[i].lng + (Math.random() - 0.5) * 30,
      tier,
      type: 'stable',
      eventType: 'big',
      eventVariant: variant,
      cleared: false,
      rewards: calculateRewards(tier),
    });
  }

  return zones;
}
