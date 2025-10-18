/**
 * Sprite Extractor
 *
 * Extracts sprite frames and identifies animations from sprite sheets.
 * Handles both grid-based sprites and complex animation sequences.
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import cliProgress from 'cli-progress';
import chalk from 'chalk';

/**
 * Animation definition
 */
export interface SpriteAnimation {
  name: string;
  frameStart: number;
  frameEnd: number;
  fps: number;
  loop: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
}

/**
 * Sprite sheet configuration
 */
export interface SpriteSheetConfig {
  filename: string;
  frameWidth: number;
  frameHeight: number;
  cols?: number;
  rows?: number;
  spacing?: number;
  margin?: number;
  animations?: SpriteAnimation[];
}

/**
 * Metadata for an extracted sprite frame
 */
interface SpriteFrameMetadata {
  frame: number;
  sourceFile: string;
  position: {
    col: number;
    row: number;
  };
  pixels: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  outputFile: string;
}

/**
 * Metadata for an extracted sprite sheet
 */
interface SpriteSheetMetadata {
  sourceFile: string;
  frameSize: {
    width: number;
    height: number;
  };
  grid: {
    cols: number;
    rows: number;
  };
  totalFrames: number;
  extractedFrames: number;
  animations: SpriteAnimation[];
  frames: SpriteFrameMetadata[];
  extractedAt: string;
}

/**
 * Extract sprites from a grid-based sprite sheet
 */
async function extractSpriteSheet(
  config: SpriteSheetConfig,
  outputDir: string
): Promise<SpriteSheetMetadata> {
  const sourcePath = path.join(process.cwd(), '../../assets/extracted', config.filename);

  // Get image dimensions
  const metadata = await sharp(sourcePath).metadata();
  const sheetWidth = metadata.width!;
  const sheetHeight = metadata.height!;

  // Calculate grid if not provided
  const spacing = config.spacing || 0;
  const margin = config.margin || 0;

  const cols = config.cols || Math.floor((sheetWidth - margin) / (config.frameWidth + spacing));
  const rows = config.rows || Math.floor((sheetHeight - margin) / (config.frameHeight + spacing));

  const totalFrames = cols * rows;

  console.log(chalk.cyan(`\n🎬 Extracting ${config.filename}`));
  console.log(chalk.gray(`   Frame size: ${config.frameWidth}×${config.frameHeight} | Grid: ${cols}×${rows} | Total frames: ${totalFrames}`));

  const progressBar = new cliProgress.SingleBar({
    format: '   Progress |{bar}| {percentage}% | {value}/{total} frames',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  progressBar.start(totalFrames, 0);

  const frames: SpriteFrameMetadata[] = [];
  let frameId = 0;

  const baseName = config.filename.replace(/\.(rsc\.)?png$/i, '').replace(/\./g, '_');

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = margin + col * (config.frameWidth + spacing);
      const y = margin + row * (config.frameHeight + spacing);

      const outputFilename = `${baseName}_frame_${frameId.toString().padStart(4, '0')}.png`;
      const outputPath = path.join(outputDir, outputFilename);

      await sharp(sourcePath)
        .extract({ left: x, top: y, width: config.frameWidth, height: config.frameHeight })
        .png({ compressionLevel: 9 })
        .toFile(outputPath);

      frames.push({
        frame: frameId,
        sourceFile: config.filename,
        position: { col, row },
        pixels: { x, y, width: config.frameWidth, height: config.frameHeight },
        outputFile: outputFilename
      });

      frameId++;
      progressBar.update(frameId);
    }
  }

  progressBar.stop();

  console.log(chalk.green(`   ✓ Extracted ${frameId} frames to ${path.relative(process.cwd(), outputDir)}`));

  return {
    sourceFile: config.filename,
    frameSize: {
      width: config.frameWidth,
      height: config.frameHeight
    },
    grid: { cols, rows },
    totalFrames,
    extractedFrames: frameId,
    animations: config.animations || [],
    frames,
    extractedAt: new Date().toISOString()
  };
}

/**
 * Generate Phaser 3 animation configurations from sprite metadata
 */
function generatePhaserAnimations(metadata: SpriteSheetMetadata): Record<string, any> {
  const animations: Record<string, any> = {};

  for (const anim of metadata.animations) {
    const baseName = metadata.sourceFile.replace(/\.(rsc\.)?png$/i, '').replace(/\./g, '_');

    animations[anim.name] = {
      key: anim.name,
      frames: Array.from(
        { length: anim.frameEnd - anim.frameStart + 1 },
        (_, i) => ({
          key: baseName,
          frame: `${baseName}_frame_${(anim.frameStart + i).toString().padStart(4, '0')}.png`
        })
      ),
      frameRate: anim.fps,
      repeat: anim.loop ? -1 : 0,
      yoyo: false
    };
  }

  return animations;
}

/**
 * Extract all sprite sheets
 */
export async function extractSprites(): Promise<void> {
  console.log(chalk.blue.bold('\n🎨 Sprite Extraction Tool\n'));

  const baseOutputDir = path.join(process.cwd(), '../../assets/game/sprites');
  await fs.mkdir(baseOutputDir, { recursive: true });

  // Define sprite sheet configurations
  // Based on analysis: Sprites.rsc.png is 384×4000 (12 cols × 125 rows at 32px)
  // This is likely character sprites with 4 directions × 3-4 frames per direction
  const spriteConfigs: SpriteSheetConfig[] = [
    {
      filename: 'Sprites.rsc.png',
      frameWidth: 32,
      frameHeight: 32,
      // Define animations (example - adjust based on actual sprite layout)
      animations: [
        { name: 'player_walk_down', frameStart: 0, frameEnd: 3, fps: 8, loop: true, direction: 'down' },
        { name: 'player_walk_left', frameStart: 4, frameEnd: 7, fps: 8, loop: true, direction: 'left' },
        { name: 'player_walk_right', frameStart: 8, frameEnd: 11, fps: 8, loop: true, direction: 'right' },
        { name: 'player_walk_up', frameStart: 12, frameEnd: 15, fps: 8, loop: true, direction: 'up' }
      ]
    },
    {
      filename: 'lsprites.rsc.png',
      frameWidth: 32,
      frameHeight: 32,
      // Large sprites - bosses, NPCs, etc.
      animations: []
    }
  ];

  const results: SpriteSheetMetadata[] = [];

  for (const config of spriteConfigs) {
    const outputDir = path.join(
      baseOutputDir,
      config.filename.replace(/\.(rsc\.)?png$/i, '').replace(/\./g, '_')
    );
    await fs.mkdir(outputDir, { recursive: true });

    try {
      const metadata = await extractSpriteSheet(config, outputDir);
      results.push(metadata);

      // Save metadata
      await fs.writeFile(
        path.join(outputDir, `${config.filename.replace(/\.(rsc\.)?png$/i, '')}_metadata.json`),
        JSON.stringify(metadata, null, 2)
      );

      // Generate Phaser animations
      if (config.animations && config.animations.length > 0) {
        const phaserAnims = generatePhaserAnimations(metadata);
        await fs.writeFile(
          path.join(outputDir, `${config.filename.replace(/\.(rsc\.)?png$/i, '')}_animations.json`),
          JSON.stringify(phaserAnims, null, 2)
        );
      }

    } catch (error) {
      console.log(chalk.red(`   ✗ Failed to extract ${config.filename}: ${error}`));
    }
  }

  // Summary
  const totalFrames = results.reduce((sum, r) => sum + r.extractedFrames, 0);
  const totalAnimations = results.reduce((sum, r) => sum + r.animations.length, 0);

  console.log(chalk.green.bold('\n📊 Extraction Summary\n'));
  console.log(chalk.white(`  Sprite sheets processed: ${results.length}`));
  console.log(chalk.white(`  Total frames extracted: ${totalFrames.toLocaleString()}`));
  console.log(chalk.white(`  Animations defined: ${totalAnimations}`));

  console.log(chalk.green.bold('\n✅ Sprite extraction complete!\n'));
}

/**
 * CLI entry point
 */
if (require.main === module) {
  extractSprites().catch(error => {
    console.error(chalk.red.bold('\n❌ Sprite extraction failed:'), error);
    process.exit(1);
  });
}

export type { SpriteSheetMetadata };
