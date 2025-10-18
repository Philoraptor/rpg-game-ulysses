const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

// Test a few PNG files to verify colors and opacity
const testFiles = ['snow.rsc.png', 'tiles1.rsc.png', 'Sprites.rsc.png'];

console.log('Verifying PNG color channels and opacity...\n');

for (const filename of testFiles) {
  const filePath = path.join(process.cwd(), 'assets/extracted', filename);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${filename}: File not found`);
    continue;
  }

  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);

  // Sample first 100 pixels
  let opaqueCount = 0;
  let transparentCount = 0;
  let coloredCount = 0;
  let rSum = 0, gSum = 0, bSum = 0, aSum = 0;

  const sampleSize = Math.min(100, png.width * png.height);

  for (let i = 0; i < sampleSize; i++) {
    const idx = i * 4;
    const r = png.data[idx];
    const g = png.data[idx + 1];
    const b = png.data[idx + 2];
    const a = png.data[idx + 3];

    rSum += r;
    gSum += g;
    bSum += b;
    aSum += a;

    if (a === 255) opaqueCount++;
    if (a === 0) transparentCount++;
    if (r > 0 || g > 0 || b > 0) coloredCount++;
  }

  const avgR = (rSum / sampleSize).toFixed(1);
  const avgG = (gSum / sampleSize).toFixed(1);
  const avgB = (bSum / sampleSize).toFixed(1);
  const avgA = (aSum / sampleSize).toFixed(1);

  const status = (avgA > 250 && coloredCount > 0) ? '✅' : '❌';

  console.log(`${status} ${filename}:`);
  console.log(`   Dimensions: ${png.width}x${png.height}`);
  console.log(`   Sample: ${sampleSize} pixels`);
  console.log(`   Opaque: ${opaqueCount}/${sampleSize}, Transparent: ${transparentCount}/${sampleSize}`);
  console.log(`   Colored: ${coloredCount}/${sampleSize}`);
  console.log(`   Avg RGBA: (${avgR}, ${avgG}, ${avgB}, ${avgA})`);
  console.log();
}

console.log('✅ Verification complete! Images should have visible colors with full opacity.');
