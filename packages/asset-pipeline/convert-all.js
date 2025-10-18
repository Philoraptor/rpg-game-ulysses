const bmp = require('bmp-js');
const { PNG } = require('pngjs');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const cliProgress = require('cli-progress');
const chalk = require('chalk');

console.log('[DEBUG] Starting conversion script...');

async function convertAllRsc() {
  const srcDir = path.join(process.cwd(), 'assets/original');
  const destDir = path.join(process.cwd(), 'assets/extracted');

  console.log('[DEBUG] Source dir:', srcDir);
  console.log('[DEBUG] Dest dir:', destDir);

  // Ensure destination directory exists
  await fs.mkdir(destDir, { recursive: true });

  // Get all .rsc and .bmp files
  const allFiles = await fs.readdir(srcDir);
  const rscFiles = allFiles.filter(f =>
    f.toLowerCase().endsWith('.rsc') || f.toLowerCase().endsWith('.bmp')
  );

  console.log(chalk.blue(`\nFound ${rscFiles.length} asset files to convert\n`));

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Converting |{bar}| {percentage}% | {value}/{total} | {filename}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
  });

  progressBar.start(rscFiles.length, 0, { filename: 'Starting...' });

  const results = [];

  for (let i = 0; i < rscFiles.length; i++) {
    const file = rscFiles[i];
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, `${file}.png`);

    progressBar.update(i + 1, { filename: file });

    try {
      // Get original file size
      const stats = await fs.stat(srcPath);
      const originalSize = stats.size;

      // Read BMP file
      const bmpBuffer = await fs.readFile(srcPath);
      const bmpData = bmp.decode(bmpBuffer);

      // Create PNG
      const png = new PNG({
        width: bmpData.width,
        height: bmpData.height
      });

      // Convert ABGR to RGBA (bmp-js outputs ABGR, PNG expects RGBA)
      // ABGR: position 0=Alpha, 1=Blue, 2=Green, 3=Red
      // RGBA: position 0=Red, 1=Green, 2=Blue, 3=Alpha
      const pixelData = Buffer.allocUnsafe(bmpData.data.length);
      for (let i = 0; i < bmpData.data.length; i += 4) {
        pixelData[i]     = bmpData.data[i + 3];  // Red (from position 3)
        pixelData[i + 1] = bmpData.data[i + 2];  // Green (from position 2)
        pixelData[i + 2] = bmpData.data[i + 1];  // Blue (from position 1)
        pixelData[i + 3] = bmpData.data[i];      // Alpha (from position 0)
      }

      png.data = pixelData;

      // Write PNG to file
      await new Promise((resolve, reject) => {
        png.pack()
          .pipe(fsSync.createWriteStream(destPath))
          .on('finish', resolve)
          .on('error', reject);
      });

      const destStats = await fs.stat(destPath);
      const convertedSize = destStats.size;
      const compressionRatio = ((originalSize - convertedSize) / originalSize) * 100;

      results.push({
        filename: file,
        originalSize,
        convertedSize,
        compressionRatio,
        success: true
      });

    } catch (error) {
      results.push({
        filename: file,
        originalSize: 0,
        convertedSize: 0,
        compressionRatio: 0,
        success: false,
        error: error.message
      });
    }
  }

  progressBar.stop();

  return results;
}

// Run conversion and report results
convertAllRsc()
  .then(async (results) => {
    console.log(chalk.green('\n\nConversion Complete!\n'));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(chalk.blue('Summary:'));
    console.log(`  Successful: ${successful.length}/${results.length}`);
    console.log(`  Failed: ${failed.length}/${results.length}`);

    const totalOriginal = successful.reduce((sum, r) => sum + r.originalSize, 0);
    const totalConverted = successful.reduce((sum, r) => sum + r.convertedSize, 0);
    const overallRatio = ((totalOriginal - totalConverted) / totalOriginal) * 100;

    console.log(`\n  Original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Converted size: ${(totalConverted / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Compression: ${overallRatio.toFixed(1)}%`);

    if (failed.length > 0) {
      console.log(chalk.red('\n\nFailed conversions:'));
      failed.forEach(f => {
        console.log(`  ${f.filename}: ${f.error}`);
      });
    }

    // Save results to JSON
    await fs.writeFile(
      'assets/conversion-report.json',
      JSON.stringify(results, null, 2)
    );

    console.log(chalk.gray('\n  Report saved to assets/conversion-report.json\n'));
  })
  .catch((error) => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
