/**
 * Main Entry Point
 *
 * @module game-client/main
 * @fileoverview Boots Phaser with the BootScene -> GameScene pipeline and the
 * built-in offline server behind them.
 */

import Phaser from 'phaser';
import { gameConfig } from './config/game.config';

const game = new Phaser.Game(gameConfig);

// Expose for debugging in the browser console
(window as unknown as { game: Phaser.Game }).game = game;
