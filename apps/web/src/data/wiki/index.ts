// Main wiki data exports
import type { WikiEntity, WikiCategory, AnyEntity } from './types';
import { buildRelationshipGraph, getRelatedSlugs, getAllRelationships, type RelationType } from './relationships';

// Entity imports
import { travelers } from './entities/travelers';
import { enemies } from './entities/enemies';
import { items } from './entities/items';
import { domains } from './entities/domains';
import { shops } from './entities/shops';
import { pantheon } from './entities/pantheon';
import { wanderers } from './entities/wanderers';
import { trophies } from './entities/trophies';
import { factions } from './entities/factions';

// Re-export types
export * from './types';
export * from './helpers';
export { type RelationType } from './relationships';

// All entities combined
const allEntities: AnyEntity[] = [
  ...travelers,
  ...enemies,
  ...items,
  ...domains,
  ...shops,
  ...pantheon,
  ...wanderers,
  ...trophies,
  ...factions,
];

// Build relationship graph once
const relationshipGraph = buildRelationshipGraph(allEntities);

// Entity lookup by slug
export function getEntity(slug: string): AnyEntity | undefined {
  return allEntities.find(e => e.slug === slug);
}

// Get all entities by category
export function getEntitiesByCategory(category: WikiCategory): AnyEntity[] {
  switch (category) {
    case 'travelers': return travelers;
    case 'enemies': return enemies;
    case 'items': return items;
    case 'domains': return domains;
    case 'shops': return shops;
    case 'pantheon': return pantheon;
    case 'wanderers': return wanderers;
    case 'trophies': return trophies;
    case 'factions': return factions;
    default: return [];
  }
}

// Get related entities (resolved to full objects)
export function getRelated(slug: string, type: RelationType): AnyEntity[] {
  const relatedSlugs = getRelatedSlugs(relationshipGraph, slug, type);
  return relatedSlugs
    .map(s => getEntity(s))
    .filter((e): e is AnyEntity => e !== undefined);
}

// Get all relationships for an entity
export function getEntityRelationships(slug: string): Map<RelationType, AnyEntity[]> {
  const slugMap = getAllRelationships(relationshipGraph, slug);
  const entityMap = new Map<RelationType, AnyEntity[]>();

  for (const [type, slugs] of slugMap) {
    const entities = slugs
      .map(s => getEntity(s))
      .filter((e): e is AnyEntity => e !== undefined);
    entityMap.set(type, entities);
  }

  return entityMap;
}

// Get category counts
export function getCategoryCounts(): Record<WikiCategory, number> {
  return {
    travelers: travelers.length,
    enemies: enemies.length,
    items: items.length,
    domains: domains.length,
    shops: shops.length,
    pantheon: pantheon.length,
    wanderers: wanderers.length,
    trophies: trophies.length,
    factions: factions.length,
  };
}

// Get all categories
export function getAllCategories(): WikiCategory[] {
  return [
    'travelers',
    'enemies',
    'items',
    'domains',
    'shops',
    'pantheon',
    'wanderers',
    'trophies',
    'factions',
  ];
}

// Search entities by name
export function searchEntities(query: string): AnyEntity[] {
  const lowerQuery = query.toLowerCase();
  return allEntities.filter(e =>
    e.name.toLowerCase().includes(lowerQuery) ||
    e.slug.includes(lowerQuery) ||
    e.description?.toLowerCase().includes(lowerQuery)
  );
}

// Get total entity count
export function getTotalEntityCount(): number {
  return allEntities.length;
}

// Category character mappings (for WikiEntity router)
export const characterCategories: WikiCategory[] = ['travelers', 'enemies', 'wanderers', 'pantheon', 'factions'];
export const itemCategories: WikiCategory[] = ['items', 'trophies'];
export const locationCategories: WikiCategory[] = ['domains', 'shops'];
