/**
 * Atlas Packer
 *
 * Packs extracted tiles and sprites into optimized texture atlases for game engines.
 * Uses free-tex-packer-core to generate Phaser 3 compatible atlases.
 */

import { packAsync } from 'free-tex-packer-core';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

/**
 * Atlas packing configuration
 */
export interface AtlasConfig {
  name: string;
  inputDir: string;
  outputDir: string;
  maxWidth?: number;
  maxHeight?: number;
  padding?: number;
  extrude?: number;
  allowRotation?: boolean;
  detectIdentical?: boolean;
}

/**
 * Pack a single atlas from input directory
 */
async function packAtlas(config: AtlasConfig): Promise<void> {
  console.log(chalk.cyan(`\n📦 Packing ${config.name} atlas...`));

  const inputPath = path.join(process.cwd(), config.inputDir);
  const outputPath = path.join(process.cwd(), config.outputDir);

  // Ensure output directory exists
  await fs.mkdir(outputPath, { recursive: true });

  // Read all PNG files from input directory
  const files = await fs.readdir(inputPath, { withFileTypes: true });
  const pngFiles = files.filter(f => f.isFile() && f.name.toLowerCase().endsWith('.png'));

  if (pngFiles.length === 0) {
    console.log(chalk.yellow(`   ⚠️  No PNG files found in ${inputPath}`));
    return;
  }

  console.log(chalk.gray(`   Found ${pngFiles.length} images to pack`));

  // Read all images
  const images = [];
  for (const file of pngFiles) {
    const filePath = path.join(inputPath, file.name);
    const buffer = await fs.readFile(filePath);
    images.push({
      path: file.name,
      contents: buffer
    });
  }

  // Pack configuration
  const packOptions: any = {
    textureName: config.name,
    width: config.maxWidth || 4096,
    height: config.maxHeight || 4096,
    fixedSize: false,
    powerOfTwo: true,
    padding: config.padding !== undefined ? config.padding : 2,
    extrude: config.extrude !== undefined ? config.extrude : 1,
    allowRotation: config.allowRotation !== undefined ? config.allowRotation : false,
    detectIdentical: config.detectIdentical !== undefined ? config.detectIdentical : true,
    allowTrim: false, // Keep original dimensions for tiles
    packer: 'MaxRectsBin'
    // packerMethod removed - not needed for MaxRectsBin
  };

  console.log(chalk.gray(`   Packing with max size ${packOptions.width}×${packOptions.height}...`));

  try {
    // Pack the atlas
    const result = await packAsync(images, packOptions);

    // Save results
    let atlasCount = 0;
    for (const item of result) {
      if (item.name.endsWith('.png')) {
        const outputFile = path.join(outputPath, item.name);
        await fs.writeFile(outputFile, item.buffer);

        const sizeMB = (item.buffer.length / 1024 / 1024).toFixed(2);
        console.log(chalk.green(`   ✓ Saved ${item.name} (${sizeMB} MB)`));
        atlasCount++;

      } else if (item.name.endsWith('.json')) {
        // Save JSON metadata
        const outputFile = path.join(outputPath, item.name);
        await fs.writeFile(outputFile, item.buffer);
        console.log(chalk.green(`   ✓ Saved ${item.name}`));
      }
    }

    console.log(chalk.green(`   ✓ Created ${atlasCount} atlas(es) from ${pngFiles.length} images`));

  } catch (error) {
    console.log(chalk.red(`   ✗ Failed to pack: ${error instanceof Error ? error.message : String(error)}`));
    throw error;
  }
}

/**
 * Pack all atlases
 */
export async function packAllAtlases(): Promise<void> {
  console.log(chalk.blue.bold('\n🎁 Texture Atlas Packer\n'));

  const configs: AtlasConfig[] = [
    {
      name: 'tiles-atlas',
      inputDir: '../../assets/game/tiles/tiles1',
      outputDir: '../../assets/game/atlases',
      maxWidth: 2048,
      maxHeight: 2048,
      padding: 2,
      extrude: 1,
      detectIdentical: true
    },
    {
      name: 'tiles-atlas-large',
      inputDir: '../../assets/game/tiles/tiles5',
      outputDir: '../../assets/game/atlases',
      maxWidth: 4096,
      maxHeight: 4096,
      padding: 2,
      extrude: 1,
      detectIdentical: true
    },
    {
      name: 'sprites-atlas',
      inputDir: '../../assets/game/sprites/Sprites',
      outputDir: '../../assets/game/atlases',
      maxWidth: 2048,
      maxHeight: 2048,
      padding: 2,
      extrude: 0, // Sprites may need pixel-perfect alignment
      detectIdentical: true
    },
    {
      name: 'sprites-large-atlas',
      inputDir: '../../assets/game/sprites/lsprites',
      outputDir: '../../assets/game/atlases',
      maxWidth: 1024,
      maxHeight: 1024,
      padding: 2,
      extrude: 0,
      detectIdentical: true
    }
  ];

  const results = [];

  for (const config of configs) {
    try {
      await packAtlas(config);
      results.push({ name: config.name, success: true });
    } catch (error) {
      results.push({ name: config.name, success: false, error });
      console.log(chalk.red(`   ✗ Skipping ${config.name} due to error`));
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(chalk.green.bold('\n📊 Packing Summary\n'));
  console.log(chalk.white(`  Atlases configured: ${configs.length}`));
  console.log(chalk.white(`  Successfully packed: ${successful}`));
  console.log(chalk.white(`  Failed: ${failed}`));

  // Show total size
  const atlasesDir = path.join(process.cwd(), '../../assets/game/atlases');
  try {
    const files = await fs.readdir(atlasesDir);
    const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));

    let totalSize = 0;
    for (const file of pngFiles) {
      const stats = await fs.stat(path.join(atlasesDir, file));
      totalSize += stats.size;
    }

    console.log(chalk.white(`  Total atlas size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`));
  } catch (error) {
    // Ignore if directory doesn't exist
  }

  console.log(chalk.green.bold('\n✅ Atlas packing complete!\n'));
}

/**
 * CLI entry point
 */
if (require.main === module) {
  packAllAtlases().catch(error => {
    console.error(chalk.red.bold('\n❌ Atlas packing failed:'), error);
    process.exit(1);
  });
}
