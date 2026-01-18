/**
 * Zone and Domain types for the hybrid globe/flat game architecture
 *
 * Simplified: 1 event per domain, no variants.
 * Difficulty comes from domain position and clock management.
 */

export interface ZoneMarker {
  id: string;
  lat: number;
  lng: number;
  tier: 1 | 2 | 3 | 4 | 5;
  type: 'stable' | 'elite' | 'anomaly';
  eventType: 'small' | 'big' | 'boss';
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
// Flat structure: 1 event per domain
export function generateDomainZones(domainId: number, zoneCount = 1): ZoneMarker[] {
  const zones: ZoneMarker[] = [];
  const basePositions = fibonacciSpherePoints(Math.max(1, zoneCount));

  for (let i = 0; i < zoneCount; i++) {
    const tier = Math.min(5, domainId) as 1 | 2 | 3 | 4 | 5;

    zones.push({
      id: `${domainId}-event-${i}`,
      lat: basePositions[i]?.lat ?? 0,
      lng: basePositions[i]?.lng ?? 0,
      tier,
      type: 'stable',
      eventType: 'big',
      cleared: false,
      rewards: calculateRewards(tier),
    });
  }

  return zones;
}
