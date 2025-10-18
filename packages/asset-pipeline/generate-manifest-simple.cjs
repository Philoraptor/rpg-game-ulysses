/**
 * Simple Manifest Generator (JavaScript)
 * Generates assets.json from atlas metadata files
 */

const fs = require('fs').promises;
const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');
const atlasesDir = path.join(projectRoot, 'assets/game/atlases');
const outputPath = path.join(projectRoot, 'assets/game/assets.json');

async function generateManifest() {
  try {
    console.log('\n📦 Generating Asset Manifest...\n');
    console.log(`Atlases Directory: ${atlasesDir}`);
    console.log(`Output Path: ${outputPath}\n`);

    // Read all JSON files from atlases directory
    const files = await fs.readdir(atlasesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    console.log(`Found ${jsonFiles.length} atlas JSON files\n`);

    const atlases = {};

    for (const jsonFile of jsonFiles) {
      const jsonPath = path.join(atlasesDir, jsonFile);
      const pngFile = jsonFile.replace('.json', '.png');
      const pngPath = path.join(atlasesDir, pngFile);

      // Read JSON
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      const atlasData = JSON.parse(jsonContent);

      // Get PNG stats
      const pngStats = await fs.stat(pngPath);

      // Determine category
      const lower = jsonFile.toLowerCase();
      let category = 'other';
      if (lower.includes('tile')) category = 'tiles';
      else if (lower.includes('sprite')) category = 'sprites';
      else if (lower.includes('effect')) category = 'effects';
      else if (lower.includes('ui')) category = 'ui';

      // Determine priority
      const priority = (category === 'tiles' || category === 'ui') ? 1 :
                      category === 'sprites' ? 2 :
                      category === 'effects' ? 3 : 5;

      const atlasName = path.basename(jsonFile, '.json');
      atlases[atlasName] = {
        path: `atlases/${pngFile}`,
        jsonPath: `atlases/${jsonFile}`,
        size: {
          width: atlasData.meta?.size?.w || 0,
          height: atlasData.meta?.size?.h || 0,
        },
        frameCount: Object.keys(atlasData.frames).length,
        preload: category === 'tiles' || category === 'sprites' || category === 'ui',
        priority,
        category,
        fileSize: pngStats.size,
        format: 'png',
      };

      console.log(`✓ ${atlasName}: ${atlases[atlasName].frameCount} frames (${category}, priority ${priority})`);
    }

    // Load tile analysis if exists
    let pipelineData = undefined;
    try {
      const tileAnalysisPath = path.join(projectRoot, 'assets/tile-analysis.json');
      const tileAnalysis = JSON.parse(await fs.readFile(tileAnalysisPath, 'utf-8'));
      pipelineData = {
        tileExtraction: {
          totalTiles: tileAnalysis.totalTiles || 0,
          tilesExtracted: tileAnalysis.totalTiles || 0,
          sheetsProcessed: tileAnalysis.totalSheets || 0,
        }
      };
    } catch (e) {
      // Ignore if file doesn't exist
    }

    // Build manifest
    const totalAssets = Object.values(atlases).reduce((sum, atlas) => sum + atlas.frameCount, 0);

    const manifest = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      totalAssets,
      atlases,
      animations: {
        player_walk_down: { frames: [0, 1, 2, 3], fps: 8, loop: true },
        player_walk_up: { frames: [4, 5, 6, 7], fps: 8, loop: true },
        player_walk_left: { frames: [8, 9, 10, 11], fps: 8, loop: true },
        player_walk_right: { frames: [12, 13, 14, 15], fps: 8, loop: true },
        player_idle_down: { frames: [0], fps: 1, loop: true },
      },
      tileProperties: {
        '0': { collision: false, category: 'ground', walkable: true, layer: 'ground' },
        '1': { collision: true, category: 'wall', walkable: false, layer: 'object' },
      },
      pipeline: pipelineData,
    };

    // Write to file
    await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');

    console.log('\n✨ Manifest generation complete!\n');
    console.log('📊 Summary:');
    console.log(`   Version: ${manifest.version}`);
    console.log(`   Total Assets: ${manifest.totalAssets.toLocaleString()}`);
    console.log(`   Atlases: ${Object.keys(manifest.atlases).length}`);
    console.log(`   Animations: ${Object.keys(manifest.animations).length}`);

    if (pipelineData) {
      console.log('\n📈 Pipeline Metrics:');
      const tile = pipelineData.tileExtraction;
      console.log(`   Tiles Extracted: ${tile.tilesExtracted.toLocaleString()}`);
      console.log(`   Sheets Processed: ${tile.sheetsProcessed}`);
    }

    console.log(`\n📄 Manifest saved to: ${outputPath}\n`);
    return manifest;
  } catch (error) {
    console.error('\n❌ Error generating manifest:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

generateManifest();
