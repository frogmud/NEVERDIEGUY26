// Generate Markdown Summaries from TypeScript Entity Data
// Run with: npm run generate-summaries

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { travelers } from './wiki/entities/travelers';
import { items } from './wiki/entities/items';
import { pantheon } from './wiki/entities/pantheon';
import { trophies } from './wiki/entities/trophies';
import type { BaseStats, StatModifier } from './stats/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUMMARIES_DIR = path.join(__dirname, 'summaries');

// Ensure summaries directory exists
if (!fs.existsSync(SUMMARIES_DIR)) {
  fs.mkdirSync(SUMMARIES_DIR, { recursive: true });
}

// Helper: Format stat value with bold for high values
function formatStat(value: number, threshold: number = 70): string {
  return value >= threshold ? `**${value}**` : `${value}`;
}

// Helper: Format stat modifiers for display
function formatModifiers(mods: StatModifier[] | undefined): string {
  if (!mods || mods.length === 0) return '-';

  return mods.map(m => {
    const parts: string[] = [];
    if (m.flat) parts.push(`+${m.flat} ${m.stat}`);
    if (m.percent) parts.push(`+${Math.round(m.percent * 100)}% ${m.stat}`);
    return parts.join(', ');
  }).join('; ');
}

// Helper: Get die type from lucky number
function getDieFromLucky(lucky: number): string {
  const dieMap: Record<number, string> = {
    0: '-',
    1: 'd4',
    2: 'd6',
    3: 'd8',
    4: 'd10',
    5: 'd12',
    6: 'd20',
    7: 'ALL',
  };
  return dieMap[lucky] || '-';
}

// Generate Travelers Summary
function generateTravelersSummary(): string {
  const lines: string[] = [
    '# Travelers Summary',
    '> Auto-generated from src/data/wiki/entities/travelers.ts',
    '',
    '## Stats Overview',
    '',
    '| Name | Lucky# | Die | Essence | Grit | Shadow | Fury | Resilience | Swiftness |',
    '|------|--------|-----|---------|------|--------|------|------------|-----------|',
  ];

  for (const t of travelers) {
    const stats = t.baseStats;
    if (!stats) continue;

    lines.push(
      `| ${t.name} | ${t.luckyNumber || '-'} | ${getDieFromLucky(t.luckyNumber || 0)} | ` +
      `${formatStat(stats.essence)} | ${formatStat(stats.grit)} | ${formatStat(stats.shadow)} | ` +
      `${formatStat(stats.fury)} | ${formatStat(stats.resilience)} | ${formatStat(stats.swiftness)} |`
    );
  }

  lines.push('');
  lines.push('## Traveler Details');
  lines.push('');

  for (const t of travelers) {
    lines.push(`### ${t.name}`);
    lines.push(`- **Slug**: \`${t.slug}\``);
    lines.push(`- **Lucky Number**: ${t.luckyNumber || 'None'} (${getDieFromLucky(t.luckyNumber || 0)})`);
    lines.push(`- **Rarity**: ${t.rarity || 'Unknown'}`);
    lines.push(`- **Origin**: ${t.origin || 'Unknown'}`);
    lines.push(`- **Play Style**: ${t.playStyle || 'Unknown'}`);
    if (t.baseStats) {
      lines.push(`- **Primary Stat**: ${getPrimaryStat(t.baseStats)}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// Get the primary (highest) stat for a character
function getPrimaryStat(stats: BaseStats): string {
  const statNames = ['essence', 'grit', 'shadow', 'fury', 'resilience', 'swiftness'] as const;
  let highest: typeof statNames[number] = statNames[0];
  let highestVal = stats[highest];

  for (const stat of statNames) {
    if (stats[stat] > highestVal) {
      highest = stat;
      highestVal = stats[stat];
    }
  }

  return `${highest} (${highestVal})`;
}

// Generate Items Summary (Legendary/Epic only)
function generateItemsSummary(): string {
  const legendaryItems = items.filter(i => i.rarity === 'Legendary');
  const epicItems = items.filter(i => i.rarity === 'Epic');

  const lines: string[] = [
    '# Items Summary',
    '> Auto-generated from src/data/wiki/entities/items.ts',
    '> Showing Legendary and Epic items only',
    '',
    '## Legendary Items',
    '',
    '| Name | Type | Lucky# | Element | Stat Modifiers |',
    '|------|------|--------|---------|----------------|',
  ];

  for (const item of legendaryItems) {
    lines.push(
      `| ${item.name} | ${item.itemType || '-'} | ${item.luckyNumber ?? '-'} | ` +
      `${item.element || '-'} | ${formatModifiers(item.statModifiers)} |`
    );
  }

  lines.push('');
  lines.push('## Epic Items');
  lines.push('');
  lines.push('| Name | Type | Lucky# | Element | Stat Modifiers |');
  lines.push('|------|------|--------|---------|----------------|');

  for (const item of epicItems) {
    lines.push(
      `| ${item.name} | ${item.itemType || '-'} | ${item.luckyNumber ?? '-'} | ` +
      `${item.element || '-'} | ${formatModifiers(item.statModifiers)} |`
    );
  }

  lines.push('');
  lines.push('## Item Count by Rarity');
  lines.push('');
  const rarities = ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common'];
  for (const rarity of rarities) {
    const count = items.filter(i => i.rarity === rarity).length;
    lines.push(`- **${rarity}**: ${count}`);
  }

  return lines.join('\n');
}

// Generate Pantheon Summary
function generatePantheonSummary(): string {
  const lines: string[] = [
    '# Pantheon Summary (Die-rectors)',
    '> Auto-generated from src/data/wiki/entities/pantheon.ts',
    '',
    '## Die-rectors by Door',
    '',
    '| Name | Door | Lucky# | Die | Element | Primary Stat |',
    '|------|------|--------|-----|---------|--------------|',
  ];

  // Door-based Die-rectors first (1-6)
  const doorBased = pantheon.filter(p => p.door);
  const nonDoor = pantheon.filter(p => !p.door);

  for (const p of doorBased.sort((a, b) => (a.door || 0) - (b.door || 0))) {
    const stats = p.baseStats;
    const primary = stats ? getPrimaryStat(stats) : '-';
    lines.push(
      `| ${p.name} | ${p.door || '-'} | ${p.luckyNumber || '-'} | ` +
      `${getDieFromLucky(p.luckyNumber || 0)} | ${p.element || '-'} | ${primary} |`
    );
  }

  lines.push('');
  lines.push('## Other Pantheon Members');
  lines.push('');
  lines.push('| Name | Role | Element | Primary Stat |');
  lines.push('|------|------|---------|--------------|');

  for (const p of nonDoor) {
    const stats = p.baseStats;
    const primary = stats ? getPrimaryStat(stats) : '-';
    lines.push(
      `| ${p.name} | ${p.role || '-'} | ${p.element || '-'} | ${primary} |`
    );
  }

  lines.push('');
  lines.push('## Stat Profiles');
  lines.push('');

  for (const p of pantheon) {
    if (!p.baseStats) continue;
    const stats = p.baseStats;
    lines.push(`### ${p.name}`);
    lines.push(`| Stat | Value |`);
    lines.push(`|------|-------|`);
    lines.push(`| Luck | ${stats.luck} |`);
    lines.push(`| Essence | ${formatStat(stats.essence)} |`);
    lines.push(`| Grit | ${formatStat(stats.grit)} |`);
    lines.push(`| Shadow | ${formatStat(stats.shadow)} |`);
    lines.push(`| Fury | ${formatStat(stats.fury)} |`);
    lines.push(`| Resilience | ${formatStat(stats.resilience)} |`);
    lines.push(`| Swiftness | ${formatStat(stats.swiftness)} |`);
    lines.push('');
  }

  return lines.join('\n');
}

// Generate Trophies Summary
function generateTrophiesSummary(): string {
  const lines: string[] = [
    '# Trophies Summary',
    '> Auto-generated from src/data/wiki/entities/trophies.ts',
    '',
    '## All Trophies',
    '',
    '| Name | Rarity | Difficulty | Unlock Condition | Reward |',
    '|------|--------|------------|------------------|--------|',
  ];

  for (const t of trophies) {
    lines.push(
      `| ${t.name} | ${t.rarity || '-'} | ${t.difficulty || '-'} | ` +
      `${t.unlockCondition || '-'} | ${t.reward || '-'} |`
    );
  }

  lines.push('');
  lines.push('## Trophy Details');
  lines.push('');

  for (const t of trophies) {
    lines.push(`### ${t.name}`);
    lines.push(`- **Slug**: \`${t.slug}\``);
    lines.push(`- **Rarity**: ${t.rarity || 'Unknown'}`);
    lines.push(`- **Difficulty**: ${t.difficulty || 'Unknown'}`);
    if (t.description) lines.push(`- **Description**: ${t.description}`);
    if (t.unlockCondition) lines.push(`- **Unlock**: ${t.unlockCondition}`);
    if (t.reward) lines.push(`- **Reward**: ${t.reward}`);
    if (t.progress?.target) lines.push(`- **Target**: ${t.progress.target}`);
    if (t.seeAlso?.length) lines.push(`- **Related**: ${t.seeAlso.join(', ')}`);
    lines.push('');
  }

  return lines.join('\n');
}

// Generate Stats Overview
function generateStatsOverview(): string {
  const lines: string[] = [
    '# Stats System Overview',
    '> Auto-generated summary of the dice-themed stat system',
    '',
    '## The 7 Core Stats',
    '',
    '| Stat | Die | Die-rector | Element | Description |',
    '|------|-----|------------|---------|-------------|',
    '| Luck | All | (Player) | Neutral | Favor triggers, crit chance, loot quality |',
    '| Essence | d4 | The One | Void | Base power, reality manipulation |',
    '| Grit | d6 | John | Earth | Mixing stat, endurance, HP pool |',
    '| Shadow | d8 | Peter | Death | Dodge chance, stealth, ambush |',
    '| Fury | d10 | Robert | Fire | Attack damage, berserk threshold |',
    '| Resilience | d12 | Alice | Ice | Damage reduction, defense |',
    '| Swiftness | d20 | Jane | Wind | Turn order, cooldown reduction |',
    '',
    '## Stat Ranges',
    '',
    '- **Base Range**: 25-100 (travelers/pantheon)',
    '- **Modifier Flats**: +10 to +40 typical',
    '- **Modifier Percents**: +8% to +25% typical',
    '',
    '## Lucky Number Mapping',
    '',
    '| Lucky# | Die | Primary Stat |',
    '|--------|-----|--------------|',
    '| 0 | None | (Special entities) |',
    '| 1 | d4 | Essence |',
    '| 2 | d6 | Grit |',
    '| 3 | d8 | Shadow |',
    '| 4 | d10 | Fury |',
    '| 5 | d12 | Resilience |',
    '| 6 | d20 | Swiftness |',
    '| 7 | ALL | (Boots - cosmic cat) |',
    '',
  ];

  return lines.join('\n');
}

// Write all summaries
function writeSummaries(): void {
  console.log('Generating summaries...');

  const summaries = [
    { name: 'travelers.md', content: generateTravelersSummary() },
    { name: 'items.md', content: generateItemsSummary() },
    { name: 'pantheon.md', content: generatePantheonSummary() },
    { name: 'stats-overview.md', content: generateStatsOverview() },
    { name: 'trophies.md', content: generateTrophiesSummary() },
  ];

  for (const summary of summaries) {
    const filePath = path.join(SUMMARIES_DIR, summary.name);
    fs.writeFileSync(filePath, summary.content, 'utf-8');
    console.log(`  Written: ${summary.name}`);
  }

  console.log(`\nSummaries generated in: ${SUMMARIES_DIR}`);
}

// Run
writeSummaries();
