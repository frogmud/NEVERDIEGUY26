#!/usr/bin/env ts-node
/**
 * Chatbase Quality Audit Script
 *
 * Analyzes NPC dialogue coverage, pool distribution, and quality metrics.
 *
 * Run with: npx tsx scripts/audit-chatbase-quality.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Canonical NPC data
import {
  ALL_NPCS,
  WANDERER_NPCS,
  TRAVELER_NPCS,
  PANTHEON_NPCS,
} from '../src/npcs/definitions';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Types
// ============================================

interface PoolStats {
  count: number;
  avgLength: number;
  examples: string[];
}

interface NPCAudit {
  slug: string;
  name: string;
  category: string;
  totalTemplates: number;
  pools: Record<string, PoolStats>;
  missingPools: string[];
  avgTemplateLength: number;
  qualityScore: number;
}

interface AuditReport {
  timestamp: string;
  totalNPCs: number;
  totalTemplates: number;
  npcAudits: NPCAudit[];
  globalPoolDistribution: Record<string, number>;
  coverageGaps: string[];
  recommendations: string[];
}

// ============================================
// Pool Types
// ============================================

const REQUIRED_POOLS = [
  'greeting',
  'reaction',
  'lore',
  'hint',
  'farewell',
];

const OPTIONAL_POOLS = [
  'challenge',
  'salesPitch',
  'idle',
  'threat',
];

const ALL_POOLS = [...REQUIRED_POOLS, ...OPTIONAL_POOLS];

// ============================================
// Load Chatbase
// ============================================

async function loadChatbase(): Promise<Map<string, any[]>> {
  const chatbasePath = path.join(
    __dirname,
    '../../../apps/web/src/data/npc-chat/npcs/chatbase-extracted.ts'
  );

  // Read the file and extract templates
  const content = fs.readFileSync(chatbasePath, 'utf-8');

  // Parse exported arrays from the TypeScript file
  const templateMap = new Map<string, any[]>();

  // Extract all template arrays using regex
  const arrayRegex = /export const (\w+)_CHATBASE: ResponseTemplate\[\] = \[([\s\S]*?)\];/g;
  const chatterRegex = /export const CHATTER_EXTRACTED: ResponseTemplate\[\] = \[([\s\S]*?)\];/g;

  let match;

  // Get named chatbase arrays (pantheon)
  while ((match = arrayRegex.exec(content)) !== null) {
    const name = match[1].toLowerCase().replace(/_/g, '-');
    const templates = parseTemplateArray(match[2]);
    templateMap.set(name, templates);
  }

  // Get chatter extracted (mixed NPCs)
  const chatterMatch = chatterRegex.exec(content);
  if (chatterMatch) {
    const templates = parseTemplateArray(chatterMatch[1]);
    // Group by entitySlug
    for (const t of templates) {
      const existing = templateMap.get(t.entitySlug) || [];
      existing.push(t);
      templateMap.set(t.entitySlug, existing);
    }
  }

  return templateMap;
}

function parseTemplateArray(content: string): any[] {
  const templates: any[] = [];
  const templateRegex = /\{\s*id:\s*'([^']+)',\s*entitySlug:\s*'([^']+)',\s*pool:\s*'([^']+)',\s*mood:\s*'([^']+)',\s*text:\s*'([^']+)',\s*weight:\s*(\d+),\s*purpose:\s*'([^']+)'\s*\}/g;

  let match;
  while ((match = templateRegex.exec(content)) !== null) {
    templates.push({
      id: match[1],
      entitySlug: match[2],
      pool: match[3],
      mood: match[4],
      text: match[5],
      weight: parseInt(match[6]),
      purpose: match[7],
    });
  }

  return templates;
}

// ============================================
// Audit Logic
// ============================================

function auditNPC(
  npc: { identity: { slug: string; name: string; category: string } },
  templates: any[]
): NPCAudit {
  const poolStats: Record<string, PoolStats> = {};

  // Count templates by pool
  for (const pool of ALL_POOLS) {
    const poolTemplates = templates.filter(t => t.pool === pool);
    poolStats[pool] = {
      count: poolTemplates.length,
      avgLength: poolTemplates.length > 0
        ? poolTemplates.reduce((sum, t) => sum + t.text.length, 0) / poolTemplates.length
        : 0,
      examples: poolTemplates.slice(0, 2).map(t => t.text.substring(0, 50) + '...'),
    };
  }

  // Find missing required pools
  const missingPools = REQUIRED_POOLS.filter(pool => poolStats[pool].count === 0);

  // Calculate quality score (0-100)
  let score = 0;

  // Coverage: +40 points max (8 pools * 5 points each)
  const coveredPools = ALL_POOLS.filter(pool => poolStats[pool].count > 0);
  score += coveredPools.length * 5;

  // Volume: +30 points max (at least 3 per required pool)
  const wellCoveredPools = REQUIRED_POOLS.filter(pool => poolStats[pool].count >= 3);
  score += wellCoveredPools.length * 6;

  // Variety: +30 points max (average length > 50 chars)
  const avgLength = templates.length > 0
    ? templates.reduce((sum, t) => sum + t.text.length, 0) / templates.length
    : 0;
  if (avgLength > 80) score += 30;
  else if (avgLength > 50) score += 20;
  else if (avgLength > 30) score += 10;

  return {
    slug: npc.identity.slug,
    name: npc.identity.name,
    category: npc.identity.category,
    totalTemplates: templates.length,
    pools: poolStats,
    missingPools,
    avgTemplateLength: Math.round(avgLength),
    qualityScore: Math.min(100, score),
  };
}

function generateRecommendations(audits: NPCAudit[]): string[] {
  const recommendations: string[] = [];

  // Find NPCs with no templates
  const noTemplates = audits.filter(a => a.totalTemplates === 0);
  if (noTemplates.length > 0) {
    recommendations.push(
      `CRITICAL: ${noTemplates.length} NPCs have NO dialogue: ${noTemplates.map(a => a.name).join(', ')}`
    );
  }

  // Find NPCs missing required pools
  const missingRequired = audits.filter(a => a.missingPools.length > 0 && a.totalTemplates > 0);
  for (const audit of missingRequired) {
    recommendations.push(
      `${audit.name} missing pools: ${audit.missingPools.join(', ')}`
    );
  }

  // Find low quality scores
  const lowQuality = audits.filter(a => a.qualityScore < 50 && a.totalTemplates > 0);
  if (lowQuality.length > 0) {
    recommendations.push(
      `LOW QUALITY: ${lowQuality.map(a => `${a.name} (${a.qualityScore})`).join(', ')}`
    );
  }

  // Find NPCs with < 5 templates
  const sparseNPCs = audits.filter(a => a.totalTemplates > 0 && a.totalTemplates < 5);
  if (sparseNPCs.length > 0) {
    recommendations.push(
      `SPARSE: ${sparseNPCs.map(a => `${a.name} (${a.totalTemplates})`).join(', ')} need more templates`
    );
  }

  return recommendations;
}

// ============================================
// Main
// ============================================

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('CHATBASE QUALITY AUDIT');
  console.log('='.repeat(60));
  console.log();

  // Load chatbase
  const chatbase = await loadChatbase();
  console.log(`Loaded chatbase with ${chatbase.size} NPC entries`);

  // Audit each NPC
  const audits: NPCAudit[] = [];
  const globalPoolDistribution: Record<string, number> = {};

  for (const npc of ALL_NPCS) {
    const templates = chatbase.get(npc.identity.slug) || [];
    const audit = auditNPC(npc, templates);
    audits.push(audit);

    // Update global pool distribution
    for (const [pool, stats] of Object.entries(audit.pools)) {
      globalPoolDistribution[pool] = (globalPoolDistribution[pool] || 0) + stats.count;
    }
  }

  // Sort by quality score (lowest first)
  audits.sort((a, b) => a.qualityScore - b.qualityScore);

  // Print summary by category
  console.log('\n--- COVERAGE BY CATEGORY ---\n');

  for (const [category, npcs] of [
    ['Pantheon', PANTHEON_NPCS],
    ['Wanderers', WANDERER_NPCS],
    ['Travelers', TRAVELER_NPCS],
  ] as const) {
    const categoryAudits = audits.filter(a =>
      npcs.some(n => n.identity.slug === a.slug)
    );
    const covered = categoryAudits.filter(a => a.totalTemplates > 0).length;
    const total = categoryAudits.reduce((sum, a) => sum + a.totalTemplates, 0);
    const avgQuality = categoryAudits.length > 0
      ? categoryAudits.reduce((sum, a) => sum + a.qualityScore, 0) / categoryAudits.length
      : 0;

    console.log(`${category}: ${covered}/${npcs.length} NPCs covered, ${total} templates, avg quality: ${avgQuality.toFixed(0)}`);
  }

  // Print detailed NPC breakdown
  console.log('\n--- NPC DETAIL (sorted by quality) ---\n');

  for (const audit of audits) {
    const pools = Object.entries(audit.pools)
      .filter(([_, stats]) => stats.count > 0)
      .map(([pool, stats]) => `${pool}:${stats.count}`)
      .join(', ');

    const status = audit.totalTemplates === 0
      ? 'NO DIALOGUE'
      : audit.qualityScore < 50
        ? 'LOW'
        : audit.qualityScore < 75
          ? 'OK'
          : 'GOOD';

    console.log(`[${status.padEnd(12)}] ${audit.name.padEnd(20)} | ${audit.totalTemplates.toString().padStart(3)} templates | Q:${audit.qualityScore.toString().padStart(3)} | ${pools || 'none'}`);
  }

  // Print global pool distribution
  console.log('\n--- GLOBAL POOL DISTRIBUTION ---\n');

  const sortedPools = Object.entries(globalPoolDistribution)
    .sort(([, a], [, b]) => b - a);

  for (const [pool, count] of sortedPools) {
    const bar = '#'.repeat(Math.min(50, Math.floor(count / 2)));
    console.log(`${pool.padEnd(12)} ${count.toString().padStart(4)} ${bar}`);
  }

  // Generate recommendations
  const recommendations = generateRecommendations(audits);

  console.log('\n--- RECOMMENDATIONS ---\n');

  if (recommendations.length === 0) {
    console.log('All NPCs have good dialogue coverage!');
  } else {
    for (const rec of recommendations) {
      console.log(`- ${rec}`);
    }
  }

  // Write JSON report
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    totalNPCs: ALL_NPCS.length,
    totalTemplates: audits.reduce((sum, a) => sum + a.totalTemplates, 0),
    npcAudits: audits,
    globalPoolDistribution,
    coverageGaps: audits.filter(a => a.totalTemplates === 0).map(a => a.slug),
    recommendations,
  };

  const logDir = path.join(__dirname, '../logs');
  fs.mkdirSync(logDir, { recursive: true });

  const reportPath = path.join(logDir, `chatbase-audit-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved: ${reportPath}`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`SUMMARY: ${report.totalTemplates} templates across ${ALL_NPCS.length - report.coverageGaps.length}/${ALL_NPCS.length} NPCs`);
  console.log('='.repeat(60));
}

main().catch(console.error);
