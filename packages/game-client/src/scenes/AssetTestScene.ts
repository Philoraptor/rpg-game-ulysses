/**
 * Asset Test Scene
 *
 * @module game-client/scenes/AssetTestScene
 * @fileoverview Test scene for validating asset loading and rendering
 */

import Phaser from 'phaser';
import { AssetLoader } from '../loaders/AssetLoader';

/**
 * AssetTestScene - Validates all assets render correctly at 60 FPS
 */
export class AssetTestScene extends Phaser.Scene {
  private fpsText?: Phaser.GameObjects.Text;
  private memoryText?: Phaser.GameObjects.Text;
  private loadingText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'AssetTestScene' });
  }

  /**
   * Preload assets - Phaser lifecycle method (must be synchronous)
   */
  preload(): void {
    console.log('\n🎮 AssetTestScene: Preloading...\n');

    // Show loading text
    this.loadingText = this.add.text(320, 320, 'Loading Assets...', {
      fontSize: '24px',
      color: '#0f0',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    // Step 1: Load the manifest JSON
    AssetLoader.preloadManifest(this);

    // Step 2: When manifest loads, load all assets
    this.load.on('filecomplete-json-asset-manifest', () => {
      console.log('✅ Manifest file loaded, now loading atlases...');
      AssetLoader.loadAssets(this);
    });

    // Handle load errors
    this.load.on('loaderror', (file: any) => {
      console.error('❌ Load error:', file.key, file.url);
      if (this.loadingText) {
        this.loadingText.setText(`ERROR loading: ${file.key}\nCheck console`);
      }
    });

    // Progress feedback
    this.load.on('progress', (value: number) => {
      if (this.loadingText) {
        const percent = Math.round(value * 100);
        this.loadingText.setText(`Loading Assets... ${percent}%`);
      }
    });
  }

  /**
   * Create game objects - Phaser lifecycle method
   */
  create(): void {
    console.log('\n🎮 AssetTestScene: Creating scene...\n');

    // Remove loading text
    if (this.loadingText) {
      this.loadingText.destroy();
    }

    // Check if manifest loaded
    if (!AssetLoader.isManifestLoaded()) {
      console.error('❌ Manifest not loaded!');
      this.add.text(320, 320, 'ERROR: Manifest not loaded\nCheck console', {
        fontSize: '18px',
        color: '#f00',
        fontFamily: 'Courier New',
      }).setOrigin(0.5);
      return;
    }

    // Register animations (will skip for now since we need frame mapping)
    AssetLoader.registerAnimations(this);

    // Test 1: Render tile grid (10x10 sample)
    this.renderTileGrid();

    // Test 2: Show atlas info
    this.showAtlasInfo();

    // Test 3: Display performance metrics
    this.createPerformanceDisplay();

    console.log('\n✨ Scene creation complete!\n');
  }

  /**
   * Render a sample tile grid
   */
  private renderTileGrid(): void {
    const tileSize = 32;
    const gridSize = 10; // 10x10 grid

    console.log('   🎨 Rendering tile grid...');

    let successCount = 0;
    let failCount = 0;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const tileIndex = (y * gridSize + x) % 100;
        const frameName = `tiles1_${String(tileIndex).padStart(5, '0')}.png`;

        try {
          this.add.image(
            x * tileSize + tileSize / 2,
            y * tileSize + tileSize / 2,
            'tiles-atlas',
            frameName
          );
          successCount++;
        } catch (error) {
          // Frame might not exist, that's ok
          failCount++;
        }
      }
    }

    console.log(`   ✓ Tile grid rendered: ${successCount} tiles (${failCount} skipped)`);
  }

  /**
   * Show atlas information
   */
  private showAtlasInfo(): void {
    const manifest = AssetLoader.getManifest();
    if (!manifest) return;

    let yPos = 350;
    const xPos = 320;

    this.add.text(xPos, yPos, '=== ASSET TEST SCENE ===', {
      fontSize: '16px',
      color: '#0f0',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    yPos += 30;

    this.add.text(xPos, yPos, `Manifest v${manifest.version}`, {
      fontSize: '12px',
      color: '#0f0',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    yPos += 20;

    this.add.text(xPos, yPos, `Total Assets: ${manifest.totalAssets.toLocaleString()}`, {
      fontSize: '12px',
      color: '#0f0',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    yPos += 20;

    this.add.text(xPos, yPos, `Atlases Loaded: ${Object.keys(manifest.atlases).length}`, {
      fontSize: '12px',
      color: '#0f0',
      fontFamily: 'Courier New',
    }).setOrigin(0.5);

    yPos += 20;

    const atlasInfo = Object.entries(manifest.atlases)
      .map(([name, atlas]) => `${name}: ${atlas.frameCount}`)
      .join(', ');

    this.add.text(xPos, yPos, atlasInfo, {
      fontSize: '10px',
      color: '#0a0',
      fontFamily: 'Courier New',
      wordWrap: { width: 600 },
    }).setOrigin(0.5);

    console.log('   ✓ Atlas info displayed');
  }

  /**
   * Create performance display
   */
  private createPerformanceDisplay(): void {
    this.fpsText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#0f0',
      fontFamily: 'Courier New',
    });

    this.memoryText = this.add.text(10, 30, '', {
      fontSize: '14px',
      color: '#0f0',
      fontFamily: 'Courier New',
    });

    console.log('   ✓ Performance display created');
  }

  /**
   * Update loop - Phaser lifecycle method
   */
  update(): void {
    // Update FPS display
    if (this.fpsText) {
      const fps = Math.round(this.game.loop.actualFps);
      const color = fps >= 55 ? '#0f0' : fps >= 30 ? '#ff0' : '#f00';
      this.fpsText.setText(`FPS: ${fps}`);
      this.fpsText.setColor(color);
    }

    // Update memory display
    if (this.memoryText && (performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
      this.memoryText.setText(`Memory: ${usedMB} MB`);
    }
  }
}
