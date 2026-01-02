// Relationship types and reverse lookup resolver
import type { WikiEntity, WikiCategory } from './types';

// Relationship types
export type RelationType =
  | 'drops'        // Enemy drops Item
  | 'droppedBy'    // Item dropped by Enemy
  | 'locatedIn'    // Entity found in Domain
  | 'contains'     // Domain contains Entity
  | 'soldBy'       // Item sold by Shop
  | 'sells'        // Shop sells Item
  | 'controls'     // Pantheon controls Domain
  | 'controlledBy' // Domain controlled by Pantheon
  | 'seeAlso';     // Generic related entities

// Build reverse lookups from entity data
export function buildRelationshipGraph(entities: WikiEntity[]): Map<string, Map<RelationType, string[]>> {
  const graph = new Map<string, Map<RelationType, string[]>>();

  // Initialize all entities in graph
  for (const entity of entities) {
    if (!graph.has(entity.slug)) {
      graph.set(entity.slug, new Map());
    }

    // Copy seeAlso as-is
    if (entity.seeAlso && entity.seeAlso.length > 0) {
      const relations = graph.get(entity.slug)!;
      relations.set('seeAlso', [...entity.seeAlso]);
    }
  }

  // Process enemies for drop relationships
  for (const entity of entities) {
    if (entity.category === 'enemies' && 'drops' in entity) {
      const enemy = entity as { slug: string; drops?: { item: string }[] };
      if (enemy.drops) {
        const enemyRelations = graph.get(enemy.slug)!;
        const dropSlugs = enemy.drops.map(d => d.item);
        enemyRelations.set('drops', dropSlugs);

        // Build reverse: item -> droppedBy -> enemy
        for (const drop of enemy.drops) {
          if (!graph.has(drop.item)) {
            graph.set(drop.item, new Map());
          }
          const itemRelations = graph.get(drop.item)!;
          const droppedBy = itemRelations.get('droppedBy') || [];
          if (!droppedBy.includes(enemy.slug)) {
            droppedBy.push(enemy.slug);
          }
          itemRelations.set('droppedBy', droppedBy);
        }
      }
    }

    // Process domains for contains relationships
    if (entity.category === 'domains' && 'enemies' in entity) {
      const domain = entity as { slug: string; enemies?: string[]; items?: string[]; npcs?: string[] };
      const domainRelations = graph.get(domain.slug)!;

      const contains: string[] = [];
      if (domain.enemies) contains.push(...domain.enemies);
      if (domain.items) contains.push(...domain.items);
      if (domain.npcs) contains.push(...domain.npcs);

      if (contains.length > 0) {
        domainRelations.set('contains', contains);

        // Build reverse: entity -> locatedIn -> domain
        for (const slug of contains) {
          if (!graph.has(slug)) {
            graph.set(slug, new Map());
          }
          const entityRelations = graph.get(slug)!;
          const locatedIn = entityRelations.get('locatedIn') || [];
          if (!locatedIn.includes(domain.slug)) {
            locatedIn.push(domain.slug);
          }
          entityRelations.set('locatedIn', locatedIn);
        }
      }
    }

    // Process shops for sells relationships
    if (entity.category === 'shops' && 'inventory' in entity) {
      const shop = entity as { slug: string; inventory?: { item: string }[] };
      if (shop.inventory) {
        const shopRelations = graph.get(shop.slug)!;
        const sellsSlugs = shop.inventory.map(i => i.item);
        shopRelations.set('sells', sellsSlugs);

        // Build reverse: item -> soldBy -> shop
        for (const inv of shop.inventory) {
          if (!graph.has(inv.item)) {
            graph.set(inv.item, new Map());
          }
          const itemRelations = graph.get(inv.item)!;
          const soldBy = itemRelations.get('soldBy') || [];
          if (!soldBy.includes(shop.slug)) {
            soldBy.push(shop.slug);
          }
          itemRelations.set('soldBy', soldBy);
        }
      }
    }

    // Process pantheon for controls relationships
    if (entity.category === 'pantheon' && 'domain' in entity) {
      const dieRector = entity as { slug: string; domain?: string };
      if (dieRector.domain) {
        const pantheonRelations = graph.get(dieRector.slug)!;
        pantheonRelations.set('controls', [dieRector.domain]);

        // Build reverse: domain -> controlledBy -> pantheon
        if (!graph.has(dieRector.domain)) {
          graph.set(dieRector.domain, new Map());
        }
        const domainRelations = graph.get(dieRector.domain)!;
        domainRelations.set('controlledBy', [dieRector.slug]);
      }
    }
  }

  return graph;
}

// Get related entities for a given slug and relationship type
export function getRelatedSlugs(
  graph: Map<string, Map<RelationType, string[]>>,
  slug: string,
  type: RelationType
): string[] {
  const relations = graph.get(slug);
  if (!relations) return [];
  return relations.get(type) || [];
}

// Get all relationships for an entity
export function getAllRelationships(
  graph: Map<string, Map<RelationType, string[]>>,
  slug: string
): Map<RelationType, string[]> {
  return graph.get(slug) || new Map();
}
