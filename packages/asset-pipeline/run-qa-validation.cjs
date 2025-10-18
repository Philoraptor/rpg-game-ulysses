/**
 * QA Validation Runner
 * Runs all asset validation checks and generates report
 */

const fs = require('fs').promises;
const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');
const manifestPath = path.join(projectRoot, 'assets/game/assets.json');
const outputPath = path.join(projectRoot, 'assets/qa-report.json');

// Simple validator without TypeScript
async function runValidation() {
  console.log('\n🔍 Running Asset QA Validation...\n');

  const errors = [];
  const warnings = [];
  const checkResults = [];

  // Load manifest
  const manifestContent = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestContent);

  // CHECK 1: Atlas files exist and loadable
  console.log('  Running: Verify all atlas PNG and JSON files exist and are loadable...');
  let loadableErrors = [];
  let loadableWarnings = [];
  let filesChecked = 0;

  for (const [atlasName, atlas] of Object.entries(manifest.atlases)) {
    const pngPath = path.join(projectRoot, 'assets/game', atlas.path);
    const jsonPath = path.join(projectRoot, 'assets/game', atlas.jsonPath);

    try {
      await fs.access(pngPath);
      filesChecked++;
    } catch {
      loadableErrors.push(`Atlas PNG missing: ${atlas.path} (${atlasName})`);
    }

    try {
      await fs.access(jsonPath);
      filesChecked++;
    } catch {
      loadableErrors.push(`Atlas JSON missing: ${atlas.jsonPath} (${atlasName})`);
    }

    // Verify JSON is valid
    try {
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      const atlasData = JSON.parse(jsonContent);
      if (!atlasData.frames || typeof atlasData.frames !== 'object') {
        loadableErrors.push(`Invalid atlas JSON structure: ${atlas.jsonPath}`);
      }
    } catch (e) {
      loadableErrors.push(`Cannot parse JSON: ${atlas.jsonPath} - ${e.message}`);
    }
  }

  const loadableCheck = {
    name: 'atlas-loadable',
    passed: loadableErrors.length === 0,
    errors: loadableErrors,
    warnings: loadableWarnings,
    metrics: { filesChecked },
  };
  checkResults.push(loadableCheck);

  if (loadableCheck.passed) {
    console.log('  ✓ atlas-loadable: PASSED');
  } else {
    console.log('  ✗ atlas-loadable: FAILED');
    loadableErrors.forEach((err) => console.log(`    ERROR: ${err}`));
  }
  console.log('');

  // CHECK 2: Dimensions check
  console.log('  Running: Verify atlas dimensions are power-of-2 for optimal GPU performance...');
  let dimensionErrors = [];
  let dimensionWarnings = [];

  function isPowerOf2(value) {
    return value > 0 && (value & (value - 1)) === 0;
  }

  for (const [atlasName, atlas] of Object.entries(manifest.atlases)) {
    if (!isPowerOf2(atlas.size.width)) {
      dimensionWarnings.push(
        `${atlasName}: Width ${atlas.size.width} is not power-of-2 (may impact GPU performance)`
      );
    }
    if (!isPowerOf2(atlas.size.height)) {
      dimensionWarnings.push(
        `${atlasName}: Height ${atlas.size.height} is not power-of-2 (may impact GPU performance)`
      );
    }

    const maxDimension = 8192;
    if (atlas.size.width > maxDimension) {
      dimensionErrors.push(`${atlasName}: Width ${atlas.size.width} exceeds maximum ${maxDimension}`);
    }
    if (atlas.size.height > maxDimension) {
      dimensionErrors.push(`${atlasName}: Height ${atlas.size.height} exceeds maximum ${maxDimension}`);
    }
  }

  const dimensionCheck = {
    name: 'dimensions',
    passed: dimensionErrors.length === 0,
    errors: dimensionErrors,
    warnings: dimensionWarnings,
    metrics: { atlasesChecked: Object.keys(manifest.atlases).length },
  };
  checkResults.push(dimensionCheck);

  if (dimensionCheck.passed) {
    console.log('  ✓ dimensions: PASSED');
  } else {
    console.log('  ✗ dimensions: FAILED');
  }
  if (dimensionWarnings.length > 0) {
    dimensionWarnings.forEach((warn) => console.log(`    WARN: ${warn}`));
  }
  console.log('');

  // CHECK 3: File size check
  console.log('  Running: Verify total file sizes meet compression targets...');
  let totalSize = 0;
  const targetTotalSize = 15 * 1024 * 1024; // 15MB

  for (const [atlasName, atlas] of Object.entries(manifest.atlases)) {
    totalSize += atlas.fileSize || 0;
  }

  let sizeWarnings = [];
  if (totalSize > targetTotalSize) {
    const overageMB = ((totalSize - targetTotalSize) / 1024 / 1024).toFixed(2);
    sizeWarnings.push(
      `Total size ${(totalSize / 1024 / 1024).toFixed(2)}MB exceeds target ${(targetTotalSize / 1024 / 1024).toFixed(0)}MB by ${overageMB}MB`
    );
  }

  const sizeCheck = {
    name: 'file-size',
    passed: true,
    errors: [],
    warnings: sizeWarnings,
    metrics: {
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      targetSizeMB: (targetTotalSize / 1024 / 1024).toFixed(0),
    },
  };
  checkResults.push(sizeCheck);

  console.log('  ✓ file-size: PASSED');
  if (sizeWarnings.length > 0) {
    sizeWarnings.forEach((warn) => console.log(`    WARN: ${warn}`));
  }
  console.log('');

  // Calculate summary
  const passedChecks = checkResults.filter((c) => c.passed).length;
  const failedChecks = checkResults.filter((c) => !c.passed).length;
  const totalWarnings = checkResults.reduce((sum, c) => sum + c.warnings.length, 0);

  const report = {
    timestamp: new Date().toISOString(),
    passed: failedChecks === 0,
    summary: {
      totalChecks: checkResults.length,
      passed: passedChecks,
      failed: failedChecks,
      warnings: totalWarnings,
    },
    checks: checkResults,
    metrics: {
      totalSize,
      atlasCount: Object.keys(manifest.atlases).length,
      frameCount: manifest.totalAssets,
      avgFramesPerAtlas: Math.round(manifest.totalAssets / Object.keys(manifest.atlases).length),
    },
  };

  // Save report
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2), 'utf-8');

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('  QA VALIDATION SUMMARY');
  console.log('='.repeat(60));

  if (report.passed) {
    console.log('\n✅ ALL CHECKS PASSED\n');
  } else {
    console.log('\n❌ VALIDATION FAILED\n');
  }

  console.log(`Total Checks: ${report.summary.totalChecks}`);
  console.log(`  Passed: ${report.summary.passed}`);
  console.log(`  Failed: ${report.summary.failed}`);
  console.log(`  Warnings: ${report.summary.warnings}`);

  console.log('\nMetrics:');
  console.log(`  Total Size: ${(report.metrics.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Atlases: ${report.metrics.atlasCount}`);
  console.log(`  Total Frames: ${report.metrics.frameCount.toLocaleString()}`);
  console.log(`  Avg Frames/Atlas: ${report.metrics.avgFramesPerAtlas}`);

  console.log('\n' + '='.repeat(60) + '\n');
  console.log(`📄 QA report saved to: ${outputPath}\n`);

  process.exit(report.passed ? 0 : 1);
}

runValidation().catch((error) => {
  console.error('\n❌ Validation failed with error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
