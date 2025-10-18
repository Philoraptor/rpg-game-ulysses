/**
 * Game Configuration
 *
 * @module game-client/config/game
 * @fileoverview Phaser 3 game configuration
 */

import Phaser from 'phaser';
import { AssetTestScene } from '../scenes/AssetTestScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 640,
  height: 640,
  parent: 'game-container',
  backgroundColor: '#000000',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [AssetTestScene],
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
