#!/usr/bin/env node
/**
 * PSX Model Index Generator
 * Scans the PSX Mega Pack and generates a JSON index for the Asset CMS
 */

const fs = require('fs');
const path = require('path');

const PSX_PATH = '/Users/kevin/Documents/PSX Mega Pack/Models/GLB';
const OUTPUT_PATH = path.join(__dirname, '../src/data/psx-models.json');

function scanDirectory(dirPath, categoryName) {
  const models = [];

  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      if (file.endsWith('.glb')) {
        const name = file.replace('.glb', '');
        models.push({
          name,
          file,
          category: categoryName,
          path: path.join(dirPath, file),
        });
      }
    }
  } catch (err) {
    console.error(`Error scanning ${dirPath}:`, err.message);
  }

  return models;
}

function main() {
  console.log('Scanning PSX Mega Pack...');
  console.log(`Source: ${PSX_PATH}`);

  if (!fs.existsSync(PSX_PATH)) {
    console.error('PSX Mega Pack not found at expected path');
    process.exit(1);
  }

  const categories = [];
  const allModels = [];

  // Scan each category folder
  const categoryFolders = fs.readdirSync(PSX_PATH).filter(f => {
    const fullPath = path.join(PSX_PATH, f);
    return fs.statSync(fullPath).isDirectory() && !f.startsWith('.');
  });

  for (const folder of categoryFolders) {
    const folderPath = path.join(PSX_PATH, folder);
    const models = scanDirectory(folderPath, folder);

    if (models.length > 0) {
      categories.push({
        name: folder,
        path: folder,
        count: models.length,
      });

      allModels.push(...models);
      console.log(`  ${folder}: ${models.length} models`);
    }
  }

  // Sort categories by name
  categories.sort((a, b) => a.name.localeCompare(b.name));

  // Sort models by name within each category
  allModels.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  const index = {
    basePath: PSX_PATH,
    generatedAt: new Date().toISOString(),
    categories,
    models: allModels,
  };

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write index
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(index, null, 2));

  console.log('');
  console.log(`Total: ${allModels.length} models in ${categories.length} categories`);
  console.log(`Output: ${OUTPUT_PATH}`);
}

main();
