const fs = require('fs');
const bmp = require('bmp-js');
const PNG = require('pngjs').PNG;
const path = require('path');

const testFile = path.join(process.cwd(), 'assets/original/snow.rsc');
const outputFile = path.join(process.cwd(), 'assets/extracted/snow-bmpjs.png');

console.log('Reading BMP file:', testFile);

const bmpBuffer = fs.readFileSync(testFile);
const bmpData = bmp.decode(bmpBuffer);

console.log('Successfully decoded BMP!');
console.log('Dimensions:', bmpData.width, 'x', bmpData.height);

// Create PNG
const png = new PNG({
  width: bmpData.width,
  height: bmpData.height
});

png.data = Buffer.from(bmpData.data);

png.pack().pipe(fs.createWriteStream(outputFile))
  .on('finish', () => {
    console.log('Successfully wrote PNG to:', outputFile);
    const stats = fs.statSync(outputFile);
    console.log('Output size:', stats.size, 'bytes');
  })
  .on('error', (err) => {
    console.error('Error writing PNG:', err);
  });
