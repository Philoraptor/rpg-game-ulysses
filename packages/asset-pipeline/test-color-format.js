const bmp = require('bmp-js');
const fs = require('fs');
const path = require('path');

// Test with a small known file
const testFile = path.join(process.cwd(), 'assets/original/snow.rsc');
const bmpBuffer = fs.readFileSync(testFile);
const bmpData = bmp.decode(bmpBuffer);

console.log('BMP Metadata:');
console.log('  Width:', bmpData.width);
console.log('  Height:', bmpData.height);
console.log('  Data length:', bmpData.data.length);
console.log('  Bytes per pixel:', bmpData.data.length / (bmpData.width * bmpData.height));

// Sample first pixel
console.log('\nFirst pixel (bytes 0-3):');
console.log('  Byte 0:', bmpData.data[0]);
console.log('  Byte 1:', bmpData.data[1]);
console.log('  Byte 2:', bmpData.data[2]);
console.log('  Byte 3:', bmpData.data[3]);

// Check if mostly one color
let rSum = 0, gSum = 0, bSum = 0;
for (let i = 0; i < bmpData.data.length; i += 4) {
  rSum += bmpData.data[i];
  gSum += bmpData.data[i + 1];
  bSum += bmpData.data[i + 2];
}

const pixelCount = bmpData.data.length / 4;
console.log('\nAverage channel values:');
console.log('  Channel 0 avg:', (rSum / pixelCount).toFixed(2));
console.log('  Channel 1 avg:', (gSum / pixelCount).toFixed(2));
console.log('  Channel 2 avg:', (bSum / pixelCount).toFixed(2));

console.log('\nNote: bmp-js outputs in ABGR format (reversed from standard RGBA)');
console.log('      Position 0 = Alpha, 1 = Blue, 2 = Green, 3 = Red (for some BMP variants)');
console.log('   OR Position 0 = Red, 1 = Green, 2 = Blue, 3 = Alpha (standard RGBA)');
