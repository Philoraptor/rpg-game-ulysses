/**
 * Main Entry Point
 *
 * @module game-client/main
 * @fileoverview Game initialization
 */

import Phaser from 'phaser';
import { gameConfig } from './config/game.config';

console.log('🚀 ULYSSES - 2D Top-Down RPG');
console.log('================================');
console.log('Initializing game...\n');

// Create game instance
const game = new Phaser.Game(gameConfig);

// Expose to window for debugging
(window as any).game = game;

console.log('✓ Game instance created');
console.log('✓ Ready to load assets\n');
