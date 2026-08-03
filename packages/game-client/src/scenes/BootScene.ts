/**
 * BootScene — asset loading & animation registration
 *
 * @module game-client/scenes/BootScene
 * @fileoverview Loads the Phase 2 atlases plus the Effects sheet, registers
 * every character animation from the sprite table, then hands off to GameScene.
 */

import Phaser from 'phaser';
import { SPRITES } from '../data/sprites';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // .alpha variants have the legacy black colorkey converted to transparency
    // (packages/asset-pipeline/colorkey-alpha.cjs)
    this.load.atlas('tiles', '/atlases/tiles-atlas.alpha.png', '/atlases/tiles-atlas.json');
    this.load.atlas('sprites', '/atlases/sprites-atlas.alpha.png', '/atlases/sprites-atlas.json');
    this.load.spritesheet('effects', '/effects/effects.alpha.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    const bar = this.add.rectangle(320, 320, 10, 12, 0x55ff55);
    this.load.on('progress', (v: number) => bar.setSize(Math.max(10, 600 * v), 12));
  }

  create(): void {
    // Character animations: 2-frame walk per facing + single cast/attack frame
    for (const [key, def] of Object.entries(SPRITES)) {
      const mk = (suffix: string, frames: number[], rate = 6, repeat = -1): void => {
        this.anims.create({
          key: `${key}_${suffix}`,
          frames: frames.map((f) => ({
            key: 'sprites',
            frame: `Sprites_frame_${String(f).padStart(4, '0')}.png`,
          })),
          frameRate: rate,
          repeat,
        });
      };
      mk('down', def.down);
      mk('up', def.up);
      mk('side', def.side);
      mk('cast', def.cast, 8, 0);
    }

    // Effect animations: one per row of Effects.rsc (8 frames each)
    for (let row = 0; row < 17; row++) {
      this.anims.create({
        key: `fx_${row}`,
        frames: this.anims.generateFrameNumbers('effects', {
          start: row * 8,
          end: row * 8 + 7,
        }),
        frameRate: 16,
        repeat: 0,
      });
    }

    this.scene.start('GameScene');
  }
}
