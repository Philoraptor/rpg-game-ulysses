import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

interface TileSheetAnalysis {
  filename: string;
  width: number;
  height: number;
  detectedTileSize: number;
  cols: number;
  rows: number;
  totalTiles: number;
  remainderPixels: number;
  fileSize: number;
  category: 'tiles' | 'sprites' | 'objects' | 'effects' | 'ui' | 'other';
}

/**
 * Detect the most likely tile size for a given sheet
 * Tests common tile sizes and finds best fit with least remainder
 */
function detectTileSize(width: number, height: number): {
  size: number;
  cols: number;
  rows: number;
  remainder: number;
} {
  const tileSizes = [32, 16, 64, 24, 48, 8];
  let bestFit = { size: 32, cols: 0, rows: 0, remainder: Infinity };

  for (const tileSize of tileSizes) {
    const cols = Math.floor(width / tileSize);
    const rows = Math.floor(height / tileSize);
    const remainderX = width % tileSize;
    const remainderY = height % tileSize;
    const totalRemainder = remainderX + remainderY;

    if (totalRemainder < bestFit.remainder && cols > 0 && rows > 0) {
      bestFit = { size: tileSize, cols, rows, remainder: totalRemainder };
    }
  }

  return bestFit;
}

/**
 * Categorize file by name patterns
 */
function categorizeFile(filename: string): TileSheetAnalysis['category'] {
  const lower = filename.toLowerCase();

  if (lower.includes('tile')) return 'tiles';
  if (lower.includes('sprite')) return 'sprites';
  if (lower.includes('object')) return 'objects';
  if (lower.includes('effect') || lower.includes('rain') || lower.includes('snow')) return 'effects';
  if (lower.includes('interface') || lower.includes('ui')) return 'ui';

  return 'other';
}

/**
 * Analyze a single tile sheet
 */
async function analyzeTileSheet(filePath: string): Promise<TileSheetAnalysis> {
  const filename = path.basename(filePath);
  const stats = await fs.stat(filePath);
  const metadata = await sharp(filePath).metadata();

  const width = metadata.width!;
  const height = metadata.height!;

  const bestFit = detectTileSize(width, height);

  return {
    filename,
    width,
    height,
    detectedTileSize: bestFit.size,
    cols: bestFit.cols,
    rows: bestFit.rows,
    totalTiles: bestFit.cols * bestFit.rows,
    remainderPixels: bestFit.remainder,
    fileSize: stats.size,
    category: categorizeFile(filename)
  };
}

/**
 * Main analysis function
 */
async function analyzeAllSheets(): Promise<void> {
  console.log(chalk.blue.bold('\n🔍 Tile Sheet Analysis Tool\n'));

  const extractedDir = path.join(process.cwd(), '../../assets/extracted');

  // Get all PNG files
  const allFiles = await fs.readdir(extractedDir);
  const pngFiles = allFiles
    .filter(f => f.toLowerCase().endsWith('.png'))
    .sort();

  console.log(chalk.gray(`Found ${pngFiles.length} PNG files to analyze\n`));

  const results: TileSheetAnalysis[] = [];

  for (const file of pngFiles) {
    const filePath = path.join(extractedDir, file);
    try {
      const analysis = await analyzeTileSheet(filePath);
      results.push(analysis);
    } catch (error) {
      console.error(chalk.red(`Failed to analyze ${file}:`), error);
    }
  }

  // Group by category
  const byCategory = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, TileSheetAnalysis[]>);

  // Display results by category
  console.log(chalk.yellow.bold('📊 Analysis Results by Category\n'));

  for (const [category, sheets] of Object.entries(byCategory)) {
    console.log(chalk.cyan.bold(`\n${category.toUpperCase()}:`));
    console.log(chalk.gray('─'.repeat(100)));

    console.log(
      chalk.white(
        `${'Filename'.padEnd(30)} | ${'Dimensions'.padEnd(12)} | ${'Tile'.padEnd(5)} | ${'Grid'.padEnd(10)} | ${'Tiles'.padEnd(6)} | ${'Size'.padEnd(8)}`
      )
    );
    console.log(chalk.gray('─'.repeat(100)));

    for (const sheet of sheets) {
      const dims = `${sheet.width}×${sheet.height}`;
      const grid = `${sheet.cols}×${sheet.rows}`;
      const size = `${(sheet.fileSize / 1024 / 1024).toFixed(2)} MB`;

      console.log(
        `${sheet.filename.padEnd(30)} | ${dims.padEnd(12)} | ${sheet.detectedTileSize.toString().padEnd(5)} | ${grid.padEnd(10)} | ${sheet.totalTiles.toString().padEnd(6)} | ${size.padEnd(8)}`
      );
    }
  }

  // Summary statistics
  const totalTiles = results.reduce((sum, r) => sum + r.totalTiles, 0);
  const totalSize = results.reduce((sum, r) => sum + r.fileSize, 0);
  const tileSheets = results.filter(r => r.category === 'tiles');
  const tileCount = tileSheets.reduce((sum, r) => sum + r.totalTiles, 0);

  console.log(chalk.green.bold('\n📈 Summary Statistics\n'));
  console.log(chalk.white(`  Total files analyzed: ${results.length}`));
  console.log(chalk.white(`  Total tiles across all sheets: ${totalTiles.toLocaleString()}`));
  console.log(chalk.white(`  Tile sheets only (tiles*.png): ${tileSheets.length} sheets, ${tileCount.toLocaleString()} tiles`));
  console.log(chalk.white(`  Total file size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`));
  console.log(chalk.white(`  Average tiles per sheet: ${Math.round(totalTiles / results.length)}`));

  // Identify largest sheets
  const largest = [...results].sort((a, b) => b.totalTiles - a.totalTiles).slice(0, 5);
  console.log(chalk.yellow.bold('\n🏆 Top 5 Largest Sheets\n'));
  for (let i = 0; i < largest.length; i++) {
    const s = largest[i];
    console.log(chalk.white(`  ${i + 1}. ${s.filename}: ${s.totalTiles.toLocaleString()} tiles (${s.cols}×${s.rows})`));
  }

  // Save results to JSON
  const outputPath = path.join(process.cwd(), '../../assets/tile-analysis.json');
  await fs.writeFile(
    outputPath,
    JSON.stringify({
      generatedAt: new Date().toISOString(),
      totalSheets: results.length,
      totalTiles,
      byCategory,
      sheets: results
    }, null, 2)
  );

  console.log(chalk.green.bold(`\n✅ Analysis complete! Results saved to assets/tile-analysis.json\n`));
}

// Run if executed directly
if (require.main === module) {
  analyzeAllSheets().catch(error => {
    console.error(chalk.red.bold('\n❌ Analysis failed:'), error);
    process.exit(1);
  });
}

export { analyzeTileSheet, analyzeAllSheets };
