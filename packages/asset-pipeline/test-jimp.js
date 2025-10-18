const Jimp = require('jimp');
const path = require('path');

const testFile = path.join(process.cwd(), 'assets/original/snow.rsc');
const outputFile = path.join(process.cwd(), 'assets/extracted/snow-test.png');

console.log('Testing Jimp with:', testFile);
console.log('Jimp version:', require('jimp/package.json').version);

async function test() {
  try {
    const image = await Jimp.default.read(testFile);
    console.log('Successfully read image!');
    console.log('Dimensions:', image.bitmap.width, 'x', image.bitmap.height);
    await image.write(outputFile);
    console.log('Successfully wrote to:', outputFile);
  } catch(err) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
  }
}

test();
