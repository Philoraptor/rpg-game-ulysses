/**
 * Tile Extractor
 *
 * Extracts individual tiles from tile sheet PNGs based on analysis results.
 * Supports filtering by category, tile size, and filename patterns.
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import cliProgress from 'cli-progress';
import chalk from 'chalk';

/**
 * Configuration for tile extraction
 */
export interface TileExtractorConfig {
  /**
   * Filter by category (tiles, sprites, objects, effects, ui, other)
   */
  categories?: string[];

  /**
   * Filter by tile size (32, 16, 8, etc.)
   */
  tileSizes?: number[];

  /**
   * Filter by filename pattern (regex)
   */
  filenamePattern?: RegExp;

  /**
   * Skip sheets with more than this many tiles (prevents extracting massive sheets)
   */
  maxTilesPerSheet?: number;

  /**
   * Output directory base path
   */
  outputDir?: string;

  /**
   * Whether to generate metadata JSON for each tileset
   */
  generateMetadata?: boolean;

  /**
   * Continue extraction even if some tiles fail
   */
  continueOnError?: boolean;
}

/**
 * Metadata for a single extracted tile
 */
interface TileMetadata {
  id: number;
  sourceFile: string;
  position: {
    col: number;
    row: number;
  };
  pixels: {
    left: number;
    top: number;
  };
  outputFile: string;
}

/**
 * Metadata for an extracted tileset
 */
interface TilesetMetadata {
  sourceFile: string;
  tileSize: number;
  grid: {
    cols: number;
    rows: number;
  };
  totalTiles: number;
  extractedTiles: number;
  tiles: TileMetadata[];
  extractedAt: string;
}

/**
 * Result of extracting a single sheet
 */
interface ExtractionResult {
  sourceFile: string;
  success: boolean;
  tilesExtracted: number;
  outputDir: string;
  error?: string;
}

/**
 * Extract tiles from a single sheet
 */
async function extractTileSheet(
  sourceFile: string,
  analysis: any,
  config: TileExtractorConfig
): Promise<ExtractionResult> {
  const sourcePath = path.join(process.cwd(), '../../assets/extracted', sourceFile);

  // Create output directory based on filename
  const baseName = sourceFile.replace(/\.(rsc\.)?png$/i, '').replace(/\./g, '_');
  const outputDir = path.join(
    process.cwd(),
    config.outputDir || '../../assets/game/tiles',
    baseName
  );

  await fs.mkdir(outputDir, { recursive: true });

  const { cols, rows, detectedTileSize: tileSize } = analysis;
  const totalTiles = cols * rows;

  console.log(chalk.cyan(`\n📦 Extracting ${sourceFile}`));
  console.log(chalk.gray(`   Grid: ${cols}×${rows} | Tile size: ${tileSize}px | Total: ${totalTiles} tiles`));

  const progressBar = new cliProgress.SingleBar({
    format: '   Progress |{bar}| {percentage}% | {value}/{total} tiles',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  progressBar.start(totalTiles, 0);

  const tiles: TileMetadata[] = [];
  let tileId = 0;
  let extractedCount = 0;

  try {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const left = col * tileSize;
        const top = row * tileSize;

        const outputFilename = `${baseName}_${tileId.toString().padStart(5, '0')}.png`;
        const outputPath = path.join(outputDir, outputFilename);

        try {
          await sharp(sourcePath)
            .extract({ left, top, width: tileSize, height: tileSize })
            .png({ compressionLevel: 9 })
            .toFile(outputPath);

          tiles.push({
            id: tileId,
            sourceFile,
            position: { col, row },
            pixels: { left, top },
            outputFile: outputFilename
          });

          extractedCount++;
        } catch (error) {
          if (!config.continueOnError) {
            throw error;
          }
          // Skip failed tile but continue
        }

        tileId++;
        progressBar.update(tileId);
      }
    }

    progressBar.stop();

    // Generate metadata if requested
    if (config.generateMetadata) {
      const metadata: TilesetMetadata = {
        sourceFile,
        tileSize,
        grid: { cols, rows },
        totalTiles,
        extractedTiles: extractedCount,
        tiles,
        extractedAt: new Date().toISOString()
      };

      await fs.writeFile(
        path.join(outputDir, `${baseName}_metadata.json`),
        JSON.stringify(metadata, null, 2)
      );
    }

    console.log(chalk.green(`   ✓ Extracted ${extractedCount} tiles to ${path.relative(process.cwd(), outputDir)}`));

    return {
      sourceFile,
      success: true,
      tilesExtracted: extractedCount,
      outputDir
    };

  } catch (error) {
    progressBar.stop();
    console.log(chalk.red(`   ✗ Failed: ${error instanceof Error ? error.message : String(error)}`));

    return {
      sourceFile,
      success: false,
      tilesExtracted: 0,
      outputDir,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Extract tiles from all sheets matching the configuration
 */
export async function extractTiles(config: TileExtractorConfig = {}): Promise<void> {
  console.log(chalk.blue.bold('\n🔧 Tile Extraction Tool\n'));

  // Load analysis results
  const analysisPath = path.join(process.cwd(), '../../assets/tile-analysis.json');
  const analysisData = JSON.parse(await fs.readFile(analysisPath, 'utf-8'));

  // Filter sheets based on configuration
  let sheetsToExtract = analysisData.sheets;

  if (config.categories && config.categories.length > 0) {
    sheetsToExtract = sheetsToExtract.filter((s: any) =>
      config.categories!.includes(s.category)
    );
    console.log(chalk.gray(`📋 Filtering by categories: ${config.categories.join(', ')}`));
  }

  if (config.tileSizes && config.tileSizes.length > 0) {
    sheetsToExtract = sheetsToExtract.filter((s: any) =>
      config.tileSizes!.includes(s.detectedTileSize)
    );
    console.log(chalk.gray(`📏 Filtering by tile sizes: ${config.tileSizes.join('px, ')}px`));
  }

  if (config.filenamePattern) {
    sheetsToExtract = sheetsToExtract.filter((s: any) =>
      config.filenamePattern!.test(s.filename)
    );
    console.log(chalk.gray(`🔍 Filtering by pattern: ${config.filenamePattern}`));
  }

  if (config.maxTilesPerSheet) {
    const beforeFilter = sheetsToExtract.length;
    sheetsToExtract = sheetsToExtract.filter((s: any) =>
      s.totalTiles <= config.maxTilesPerSheet!
    );
    const skipped = beforeFilter - sheetsToExtract.length;
    if (skipped > 0) {
      console.log(chalk.yellow(`⚠️  Skipped ${skipped} sheet(s) exceeding ${config.maxTilesPerSheet} tiles`));
    }
  }

  console.log(chalk.white(`\n📦 Extracting from ${sheetsToExtract.length} sheet(s)\n`));

  const results: ExtractionResult[] = [];

  for (const sheet of sheetsToExtract) {
    const result = await extractTileSheet(sheet.filename, sheet, config);
    results.push(result);
  }

  // Summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalTiles = successful.reduce((sum, r) => sum + r.tilesExtracted, 0);

  console.log(chalk.green.bold('\n📊 Extraction Summary\n'));
  console.log(chalk.white(`  Sheets processed: ${results.length}`));
  console.log(chalk.white(`  Successful: ${successful.length}`));
  console.log(chalk.white(`  Failed: ${failed.length}`));
  console.log(chalk.white(`  Total tiles extracted: ${totalTiles.toLocaleString()}`));

  if (failed.length > 0) {
    console.log(chalk.red.bold('\n❌ Failed Sheets:\n'));
    failed.forEach(f => {
      console.log(chalk.red(`  - ${f.sourceFile}: ${f.error}`));
    });
  }

  console.log(chalk.green.bold('\n✅ Extraction complete!\n'));
}

/**
 * CLI entry point
 */
if (require.main === module) {
  // Default config: Extract only 32px tiles from "tiles" category, skip huge sheets
  const config: TileExtractorConfig = {
    categories: ['tiles'],
    tileSizes: [32],
    maxTilesPerSheet: 10000, // Skip tiles2.rsc.png (114k tiles) and tiles3.rsc.png (24k tiles)
    generateMetadata: true,
    continueOnError: true
  };

  extractTiles(config).catch(error => {
    console.error(chalk.red.bold('\n❌ Extraction failed:'), error);
    process.exit(1);
  });
}

export type { ExtractionResult, TilesetMetadata };
