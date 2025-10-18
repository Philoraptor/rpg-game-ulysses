#!/usr/bin/env node
/**
 * CLI Script: Generate Asset Manifest
 *
 * @module asset-pipeline/cli/generate-manifest
 * @fileoverview Command-line tool to generate assets.json manifest
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { safeGenerateManifest } from '../generators/manifest-generator.js';

// Get project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../..');

const config = {
  atlasesDir: path.join(projectRoot, 'assets/game/atlases'),
  outputPath: path.join(projectRoot, 'assets/game/assets.json'),
  projectRoot,
  includeAnimations: true,
  includeTileProperties: true,
};

console.log('\n📦 Generating Asset Manifest...\n');
console.log(`Project Root: ${projectRoot}`);
console.log(`Atlases Directory: ${config.atlasesDir}`);
console.log(`Output Path: ${config.outputPath}\n`);

// Generate manifest
const manifest = await safeGenerateManifest(config);

if (manifest) {
  console.log('\n✨ Manifest generation complete!\n');
  console.log('📊 Summary:');
  console.log(`   Version: ${manifest.version}`);
  console.log(`   Generated: ${manifest.generatedAt}`);
  console.log(`   Total Assets: ${manifest.totalAssets}`);
  console.log(`   Atlases: ${Object.keys(manifest.atlases).length}`);
  console.log(`   Animations: ${Object.keys(manifest.animations || {}).length}`);
  console.log(`   Tile Properties: ${Object.keys(manifest.tileProperties || {}).length}`);

  if (manifest.pipeline) {
    console.log('\n📈 Pipeline Metrics:');
    if (manifest.pipeline.bmpToPngConversion) {
      const conv = manifest.pipeline.bmpToPngConversion;
      console.log(`   BMP→PNG: ${conv.filesProcessed} files`);
      console.log(`   Compression: ${conv.compressionRatio.toFixed(1)}%`);
    }
    if (manifest.pipeline.tileExtraction) {
      const tile = manifest.pipeline.tileExtraction;
      console.log(`   Tiles Extracted: ${tile.tilesExtracted.toLocaleString()}`);
      console.log(`   Sheets Processed: ${tile.sheetsProcessed}`);
    }
  }

  console.log(`\n📄 Manifest saved to: ${config.outputPath}\n`);
  process.exit(0);
} else {
  console.error('\n❌ Manifest generation failed. See errors above.\n');
  process.exit(1);
}
