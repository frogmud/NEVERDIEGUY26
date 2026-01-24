/**
 * Export Wiki Data to JSON
 *
 * Generates a JSON file containing all wiki entities for use by the Asset CMS.
 * Run: npx tsx apps/web/scripts/export-wiki-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import all wiki data
import { travelers } from '../src/data/wiki/entities/travelers';
import { enemies } from '../src/data/wiki/entities/enemies';
import { items } from '../src/data/wiki/entities/items';
import { domains } from '../src/data/wiki/entities/domains';
import { shops } from '../src/data/wiki/entities/shops';
import { pantheon } from '../src/data/wiki/entities/pantheon';
import { wanderers } from '../src/data/wiki/entities/wanderers';
import { trophies } from '../src/data/wiki/entities/trophies';
import { factions } from '../src/data/wiki/entities/factions';

const OUTPUT_PATH = path.resolve(__dirname, '../../asset-cms/src/data/wiki-export.json');

// Create output directory if needed
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Compile all wiki data
const wikiData = {
  travelers,
  enemies,
  items,
  domains,
  shops,
  pantheon,
  wanderers,
  trophies,
  factions,
};

// Write to file
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(wikiData, null, 2));

// Stats
const stats = Object.entries(wikiData).map(([category, entities]) => ({
  category,
  count: Array.isArray(entities) ? entities.length : 0,
}));

console.log('Wiki data exported to:', OUTPUT_PATH);
console.log('\nEntity counts:');
stats.forEach(({ category, count }) => {
  console.log(`  ${category}: ${count}`);
});
console.log(`\nTotal: ${stats.reduce((sum, s) => sum + s.count, 0)} entities`);
