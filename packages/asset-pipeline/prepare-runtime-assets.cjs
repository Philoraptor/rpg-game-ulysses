/**
 * Prepare derived runtime assets (idempotent, run before dev/build).
 *
 * 1. Copies Effects.rsc.png (Phase 2 extraction) into the served asset tree.
 * 2. Applies the legacy black colorkey -> alpha to the atlases + effects sheet
 *    via colorkey-alpha.cjs, producing the .alpha.png files BootScene loads.
 *
 * These outputs are derived artifacts and stay gitignored; the sources and
 * this script are what's committed.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '../..');
const effectsDir = path.join(root, 'assets/game/effects');
const effectsSrc = path.join(root, 'assets/extracted/Effects.rsc.png');
const effectsDst = path.join(effectsDir, 'effects.png');

fs.mkdirSync(effectsDir, { recursive: true });
if (!fs.existsSync(effectsDst)) {
  fs.copyFileSync(effectsSrc, effectsDst);
  console.log('copied Effects.rsc.png -> assets/game/effects/effects.png');
}

const targets = [
  path.join(root, 'assets/game/atlases/tiles-atlas.png'),
  path.join(root, 'assets/game/atlases/sprites-atlas.png'),
  effectsDst,
];
const missing = targets.filter(
  (t) => !fs.existsSync(t.replace(/\.png$/, '.alpha.png')),
);
if (missing.length > 0) {
  execFileSync(process.execPath, [path.join(__dirname, 'colorkey-alpha.cjs'), ...missing], {
    stdio: 'inherit',
  });
} else {
  console.log('alpha atlases up to date');
}
