/**
 * Game Configuration
 *
 * @module game-client/config/game
 * @fileoverview Phaser 3 game configuration.
 */

import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { GameScene } from '../scenes/GameScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 640,
  height: 640,
  parent: 'game-container',
  backgroundColor: '#000000',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scene: [BootScene, GameScene],
  fps: {
    target: 60,
  },
  scale: {
    mode: Phaser.Scale.NONE,
  },
};
