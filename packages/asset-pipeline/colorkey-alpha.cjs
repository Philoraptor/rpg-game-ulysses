/**
 * Colorkey pass: pure-black pixels -> transparent.
 *
 * The legacy .rsc BMPs used black (0,0,0) as the transparency key, which the
 * Phase 2 conversion preserved as opaque black (alpha was forced to 255 —
 * correct for ground tiles, wrong for sprites/decor/effects). This tool writes
 * `.alpha.png` siblings with the colorkey applied; originals stay untouched.
 *
 * Usage: node colorkey-alpha.cjs <file.png> [...more]
 */
const fs = require('fs');
const { PNG } = require('pngjs');

for (const file of process.argv.slice(2)) {
  const png = PNG.sync.read(fs.readFileSync(file));
  let cleared = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i] === 0 && png.data[i + 1] === 0 && png.data[i + 2] === 0) {
      png.data[i + 3] = 0;
      cleared++;
    }
  }
  const out = file.replace(/\.png$/, '.alpha.png');
  fs.writeFileSync(out, PNG.sync.write(png));
  console.log(`${out}: ${cleared} px keyed`);
}
