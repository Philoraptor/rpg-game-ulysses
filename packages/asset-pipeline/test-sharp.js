const sharp = require('sharp');
const path = require('path');

const testFile = path.join(process.cwd(), 'assets/original/snow.rsc');

console.log('Testing file:', testFile);

sharp(testFile)
  .metadata()
  .then(metadata => {
    console.log('Metadata:', JSON.stringify(metadata, null, 2));
    return sharp(testFile)
      .png()
      .toFile(path.join(process.cwd(), 'assets/extracted/test.png'));
  })
  .then(info => {
    console.log('Conversion successful:', info);
  })
  .catch(err => {
    console.error('Error:', err);
  });
