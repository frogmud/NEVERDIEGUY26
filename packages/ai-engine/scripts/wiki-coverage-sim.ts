#!/usr/bin/env ts-node
/**
 * Wiki Coverage Analyzer
 *
 * Crawls game data and cross-references wiki entries to find gaps.
 * Run with: npx ts-node scripts/wiki-coverage-sim.ts
 *
 * Answers:
 * - What items lack descriptions?
 * - What mechanics are unexplained?
 * - What's the overall documentation coverage?
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ALL_NPCS } from '../src/npcs/definitions';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Configuration
// ============================================

const OUTPUT_PATH = './logs/wiki-coverage.json';

// ============================================
// Game Entity Types
// ============================================

interface GameEntity {
  type: 'npc' | 'item' | 'mechanic' | 'zone' | 'event' | 'dice' | 'modifier';
  id: string;
  name: string;
  category?: string;
  hasDescription: boolean;
  hasLore: boolean;
  hasStats: boolean;
  hasImage: boolean;
  linkedEntities: string[];
  wikiPath?: string;
}

interface WikiEntry {
  id: string;
  path: string;
  title: string;
  wordCount: number;
  lastUpdated?: Date;
  linksTo: string[];
  linkedFrom: string[];
}

interface CoverageReport {
  totalEntities: number;
  documentedEntities: number;
  coveragePercent: number;

  byType: Record<string, {
    total: number;
    documented: number;
    coverage: number;
    missing: string[];
  }>;

  orphanedWikiPages: string[];
  brokenLinks: Array<{ from: string; to: string }>;
  staleEntries: string[];

  gaps: Array<{
    entity: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    reason: string;
  }>;

  recommendations: string[];
}

// ============================================
// Entity Extraction
// ============================================

function extractNPCEntities(): GameEntity[] {
  return ALL_NPCS.map(npc => ({
    type: 'npc' as const,
    id: npc.identity.slug,
    name: npc.identity.name,
    category: npc.identity.category,
    hasDescription: !!npc.identity.tagline,
    hasLore: !!npc.identity.backstory,
    hasStats: true, // NPCs always have stats from their config
    hasImage: false, // Would check for avatar file
    linkedEntities: [], // Would extract from dialogue
    wikiPath: `/wiki/npcs/${npc.identity.slug}`,
  }));
}

function extractItemEntities(): GameEntity[] {
  // These would come from a central item definition file
  // For now, using inline definitions that match our simulators
  const items = [
    { id: 'iron-dice', name: 'Iron Dice', tier: 'common' },
    { id: 'steel-grip', name: 'Steel Grip', tier: 'common' },
    { id: 'lucky-penny', name: 'Lucky Penny', tier: 'common' },
    { id: 'healing-herb', name: 'Healing Herb', tier: 'common' },
    { id: 'basic-shield', name: 'Basic Shield', tier: 'common' },
    { id: 'rabbits-foot', name: "Rabbit's Foot", tier: 'uncommon' },
    { id: 'gold-magnet', name: 'Gold Magnet', tier: 'uncommon' },
    { id: 'titanium-knuckles', name: 'Titanium Knuckles', tier: 'uncommon' },
    { id: 'nature-blessing', name: 'Nature Blessing', tier: 'uncommon' },
    { id: 'reinforced-plating', name: 'Reinforced Plating', tier: 'uncommon' },
    { id: 'obsidian-die', name: 'Obsidian Die', tier: 'rare' },
    { id: 'void-shard', name: 'Void Shard', tier: 'rare' },
    { id: 'berserker-rage', name: 'Berserker Rage', tier: 'rare' },
    { id: 'four-leaf', name: 'Four-Leaf Clover', tier: 'rare' },
    { id: 'glass-cannon', name: 'Glass Cannon', tier: 'rare' },
    { id: 'meteor-core', name: 'Meteor Core', tier: 'legendary' },
    { id: 'phoenix-feather', name: 'Phoenix Feather', tier: 'legendary' },
    { id: 'horseshoe', name: 'Golden Horseshoe', tier: 'legendary' },
    { id: 'cosmic-dust', name: 'Cosmic Dust', tier: 'legendary' },
  ];

  return items.map(item => ({
    type: 'item' as const,
    id: item.id,
    name: item.name,
    category: item.tier,
    hasDescription: false, // Would check wiki
    hasLore: false,
    hasStats: true, // Items have effect stats
    hasImage: false,
    linkedEntities: [],
    wikiPath: `/wiki/items/${item.id}`,
  }));
}

function extractMechanicEntities(): GameEntity[] {
  const mechanics = [
    { id: 'cee-lo', name: 'Cee-Lo Dice Game', category: 'gambling' },
    { id: 'lucky-numbers', name: 'Lucky Numbers', category: 'gambling' },
    { id: 'sphere-targeting', name: 'Sphere Targeting', category: 'combat' },
    { id: 'zone-damage', name: 'Zone Damage System', category: 'combat' },
    { id: 'crits', name: 'Critical Hits', category: 'combat' },
    { id: 'procs', name: 'Proc Effects', category: 'combat' },
    { id: 'synergies', name: 'Item Synergies', category: 'items' },
    { id: 'anti-synergies', name: 'Anti-Synergies', category: 'items' },
    { id: 'haggling', name: 'Haggling System', category: 'economy' },
    { id: 'gold-economy', name: 'Gold Economy', category: 'economy' },
    { id: 'npc-moods', name: 'NPC Mood System', category: 'npcs' },
    { id: 'npc-archetypes', name: 'NPC Archetypes', category: 'npcs' },
    { id: 'relationships', name: 'Relationship System', category: 'npcs' },
    { id: 'rivalries', name: 'Rivalry System', category: 'npcs' },
    { id: 'quitting', name: 'NPC Quitting Behavior', category: 'npcs' },
    { id: 'elo-ranking', name: 'ELO Ranking', category: 'multiplayer' },
    { id: 'matchmaking', name: 'Matchmaking', category: 'multiplayer' },
    { id: 'vbots', name: 'VBots Mode', category: 'modes' },
    { id: 'arena', name: 'Arena Mode', category: 'modes' },
    { id: 'ante-system', name: 'Ante Progression', category: 'roguelike' },
  ];

  return mechanics.map(mech => ({
    type: 'mechanic' as const,
    id: mech.id,
    name: mech.name,
    category: mech.category,
    hasDescription: false,
    hasLore: false,
    hasStats: false,
    hasImage: false,
    linkedEntities: [],
    wikiPath: `/wiki/mechanics/${mech.id}`,
  }));
}

function extractZoneEntities(): GameEntity[] {
  const zones = [
    { id: 'core', name: 'Core Zone' },
    { id: 'inner', name: 'Inner Ring' },
    { id: 'mid', name: 'Mid Ring' },
    { id: 'outer', name: 'Outer Ring' },
    { id: 'edge', name: 'Edge Zone' },
  ];

  return zones.map(zone => ({
    type: 'zone' as const,
    id: zone.id,
    name: zone.name,
    hasDescription: false,
    hasLore: false,
    hasStats: true,
    hasImage: false,
    linkedEntities: [],
    wikiPath: `/wiki/zones/${zone.id}`,
  }));
}

function extractDiceEntities(): GameEntity[] {
  const dice = [
    { id: 'd4', name: 'D4 Spike' },
    { id: 'd6', name: 'D6 Standard' },
    { id: 'd8', name: 'D8 Octahedron' },
    { id: 'd10', name: 'D10 Decahedron' },
    { id: 'd12', name: 'D12 Dodecahedron' },
    { id: 'd20', name: 'D20 Icosahedron' },
  ];

  return dice.map(die => ({
    type: 'dice' as const,
    id: die.id,
    name: die.name,
    hasDescription: false,
    hasLore: false,
    hasStats: true,
    hasImage: false,
    linkedEntities: [],
    wikiPath: `/wiki/dice/${die.id}`,
  }));
}

// ============================================
// Wiki Scanning (Simulated)
// ============================================

function scanWikiEntries(): WikiEntry[] {
  // In production, this would actually scan markdown files
  // For now, simulating based on what we know exists

  const existingPages: WikiEntry[] = [
    // NPCs with pages
    { id: 'the-one', path: '/wiki/npcs/the-one', title: 'The One', wordCount: 450, linksTo: ['pantheon', 'dice'], linkedFrom: [] },
    { id: 'stitch-up-girl', path: '/wiki/npcs/stitch-up-girl', title: 'Stitch Up Girl', wordCount: 320, linksTo: ['travelers'], linkedFrom: [] },
    // Core mechanics
    { id: 'cee-lo', path: '/wiki/mechanics/cee-lo', title: 'Cee-Lo', wordCount: 800, linksTo: ['lucky-numbers', 'gambling'], linkedFrom: [] },
    // Some items
    { id: 'meteor-core', path: '/wiki/items/meteor-core', title: 'Meteor Core', wordCount: 250, linksTo: ['legendary-items', 'damage'], linkedFrom: [] },
  ];

  return existingPages;
}

// ============================================
// Coverage Analysis
// ============================================

function analyzeEntity(entity: GameEntity, wikiEntries: WikiEntry[]): {
  documented: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
} {
  const hasWikiPage = wikiEntries.some(w => w.id === entity.id);

  if (!hasWikiPage) {
    // Determine severity based on entity type and importance
    let severity: 'critical' | 'high' | 'medium' | 'low' = 'medium';
    let reason = 'No wiki page exists';

    if (entity.type === 'mechanic') {
      severity = 'critical';
      reason = 'Core mechanic undocumented';
    } else if (entity.type === 'npc' && entity.category === 'pantheon') {
      severity = 'high';
      reason = 'Major NPC lacks documentation';
    } else if (entity.type === 'item' && entity.category === 'legendary') {
      severity = 'high';
      reason = 'Legendary item undocumented';
    } else if (entity.type === 'dice') {
      severity = 'medium';
      reason = 'Dice type needs explanation';
    }

    return { documented: false, severity, reason };
  }

  // Has wiki page - check quality
  const wikiEntry = wikiEntries.find(w => w.id === entity.id)!;

  if (wikiEntry.wordCount < 100) {
    return {
      documented: true,
      severity: 'low',
      reason: 'Wiki page is too short (stub)',
    };
  }

  return { documented: true, severity: 'low', reason: '' };
}

function generateCoverageReport(
  entities: GameEntity[],
  wikiEntries: WikiEntry[]
): CoverageReport {
  const gaps: CoverageReport['gaps'] = [];
  const byType: CoverageReport['byType'] = {};

  // Initialize type buckets
  const types = ['npc', 'item', 'mechanic', 'zone', 'dice', 'modifier', 'event'];
  for (const type of types) {
    byType[type] = { total: 0, documented: 0, coverage: 0, missing: [] };
  }

  // Analyze each entity
  for (const entity of entities) {
    const analysis = analyzeEntity(entity, wikiEntries);

    byType[entity.type].total++;
    if (analysis.documented) {
      byType[entity.type].documented++;
    } else {
      byType[entity.type].missing.push(entity.id);
      gaps.push({
        entity: entity.name,
        type: entity.type,
        severity: analysis.severity,
        reason: analysis.reason,
      });
    }
  }

  // Calculate coverage percentages
  for (const type of types) {
    if (byType[type].total > 0) {
      byType[type].coverage = byType[type].documented / byType[type].total;
    }
  }

  // Find orphaned wiki pages (pages with no corresponding entity)
  const entityIds = new Set(entities.map(e => e.id));
  const orphanedWikiPages = wikiEntries
    .filter(w => !entityIds.has(w.id))
    .map(w => w.path);

  // Find broken links
  const brokenLinks: CoverageReport['brokenLinks'] = [];
  for (const entry of wikiEntries) {
    for (const link of entry.linksTo) {
      const linkExists = wikiEntries.some(w => w.id === link) || entityIds.has(link);
      if (!linkExists) {
        brokenLinks.push({ from: entry.path, to: link });
      }
    }
  }

  // Total coverage
  const totalEntities = entities.length;
  const documentedEntities = entities.filter(e =>
    wikiEntries.some(w => w.id === e.id)
  ).length;

  // Generate recommendations
  const recommendations: string[] = [];

  const criticalGaps = gaps.filter(g => g.severity === 'critical');
  if (criticalGaps.length > 0) {
    recommendations.push(`URGENT: ${criticalGaps.length} critical mechanics need documentation`);
    recommendations.push(`Priority: ${criticalGaps.slice(0, 3).map(g => g.entity).join(', ')}`);
  }

  const mechCoverage = byType['mechanic'].coverage;
  if (mechCoverage < 0.5) {
    recommendations.push(`Mechanics coverage is ${(mechCoverage * 100).toFixed(0)}% - needs improvement`);
  }

  const npcCoverage = byType['npc'].coverage;
  if (npcCoverage < 0.3) {
    recommendations.push(`Only ${(npcCoverage * 100).toFixed(0)}% of NPCs documented`);
  }

  if (orphanedWikiPages.length > 0) {
    recommendations.push(`${orphanedWikiPages.length} orphaned wiki pages should be reviewed`);
  }

  if (brokenLinks.length > 0) {
    recommendations.push(`${brokenLinks.length} broken links need fixing`);
  }

  return {
    totalEntities,
    documentedEntities,
    coveragePercent: totalEntities > 0 ? documentedEntities / totalEntities : 0,
    byType,
    orphanedWikiPages,
    brokenLinks,
    staleEntries: [], // Would check modification dates
    gaps: gaps.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }),
    recommendations,
  };
}

// ============================================
// Main Runner
// ============================================

async function main() {
  console.log('='.repeat(70));
  console.log('WIKI COVERAGE ANALYZER');
  console.log('='.repeat(70));
  console.log('');

  const startTime = Date.now();

  // Extract all game entities
  console.log('Extracting game entities...');
  const entities: GameEntity[] = [
    ...extractNPCEntities(),
    ...extractItemEntities(),
    ...extractMechanicEntities(),
    ...extractZoneEntities(),
    ...extractDiceEntities(),
  ];
  console.log(`  Found ${entities.length} entities`);

  // Scan wiki
  console.log('Scanning wiki entries...');
  const wikiEntries = scanWikiEntries();
  console.log(`  Found ${wikiEntries.length} wiki pages`);
  console.log('');

  // Generate report
  const report = generateCoverageReport(entities, wikiEntries);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Print results
  console.log('='.repeat(70));
  console.log('COVERAGE SUMMARY');
  console.log('='.repeat(70));
  console.log(`Overall Coverage: ${(report.coveragePercent * 100).toFixed(1)}% (${report.documentedEntities}/${report.totalEntities})`);
  console.log('');

  console.log('Coverage by Type:');
  for (const [type, data] of Object.entries(report.byType)) {
    if (data.total > 0) {
      const bar = '#'.repeat(Math.floor(data.coverage * 20));
      const empty = '-'.repeat(20 - Math.floor(data.coverage * 20));
      console.log(`  ${type.padEnd(12)} [${bar}${empty}] ${(data.coverage * 100).toFixed(0)}% (${data.documented}/${data.total})`);
    }
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('CRITICAL GAPS');
  console.log('='.repeat(70));
  const criticalGaps = report.gaps.filter(g => g.severity === 'critical');
  if (criticalGaps.length === 0) {
    console.log('  No critical gaps!');
  } else {
    for (const gap of criticalGaps) {
      console.log(`  [CRITICAL] ${gap.entity} (${gap.type})`);
      console.log(`             ${gap.reason}`);
    }
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('HIGH PRIORITY GAPS');
  console.log('='.repeat(70));
  const highGaps = report.gaps.filter(g => g.severity === 'high').slice(0, 10);
  if (highGaps.length === 0) {
    console.log('  No high priority gaps!');
  } else {
    for (const gap of highGaps) {
      console.log(`  [HIGH] ${gap.entity} (${gap.type}) - ${gap.reason}`);
    }
  }
  console.log('');

  console.log('='.repeat(70));
  console.log('MISSING BY TYPE');
  console.log('='.repeat(70));
  for (const [type, data] of Object.entries(report.byType)) {
    if (data.missing.length > 0) {
      console.log(`${type.toUpperCase()} (${data.missing.length} missing):`);
      console.log(`  ${data.missing.slice(0, 5).join(', ')}${data.missing.length > 5 ? `, ... and ${data.missing.length - 5} more` : ''}`);
    }
  }
  console.log('');

  if (report.orphanedWikiPages.length > 0) {
    console.log('='.repeat(70));
    console.log('ORPHANED WIKI PAGES');
    console.log('='.repeat(70));
    for (const page of report.orphanedWikiPages) {
      console.log(`  ${page}`);
    }
    console.log('');
  }

  if (report.brokenLinks.length > 0) {
    console.log('='.repeat(70));
    console.log('BROKEN LINKS');
    console.log('='.repeat(70));
    for (const link of report.brokenLinks.slice(0, 10)) {
      console.log(`  ${link.from} -> ${link.to} (not found)`);
    }
    console.log('');
  }

  console.log('='.repeat(70));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(70));
  for (const rec of report.recommendations) {
    console.log(`  - ${rec}`);
  }
  console.log('');

  console.log('='.repeat(70));
  console.log(`Completed in ${elapsed}s`);
  console.log('='.repeat(70));

  // Save results
  const logDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const output = {
    timestamp: new Date().toISOString(),
    durationSeconds: parseFloat(elapsed),
    summary: {
      totalEntities: report.totalEntities,
      documentedEntities: report.documentedEntities,
      coveragePercent: report.coveragePercent,
    },
    byType: report.byType,
    gaps: report.gaps,
    orphanedWikiPages: report.orphanedWikiPages,
    brokenLinks: report.brokenLinks,
    recommendations: report.recommendations,
    entities: entities.map(e => ({
      type: e.type,
      id: e.id,
      name: e.name,
      category: e.category,
      wikiPath: e.wikiPath,
    })),
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\nSaved to: ${OUTPUT_PATH}`);
}

main().catch(console.error);
