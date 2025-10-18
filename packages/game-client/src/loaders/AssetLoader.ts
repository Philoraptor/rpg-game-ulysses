/**
 * Asset Loader
 *
 * @module game-client/loaders/AssetLoader
 * @fileoverview Type-safe asset loading for Phaser 3
 */

import Phaser from 'phaser';

/**
 * Asset manifest interface (matches generated assets.json)
 */
interface AssetManifest {
  version: string;
  generatedAt: string;
  totalAssets: number;
  atlases: Record<string, {
    path: string;
    jsonPath: string;
    size: { width: number; height: number };
    frameCount: number;
    preload: boolean;
    priority: number;
    category: string;
  }>;
  animations?: Record<string, {
    frames: number[];
    fps: number;
    loop: boolean;
  }>;
}

/**
 * AssetLoader - Manages loading and registration of all game assets
 */
export class AssetLoader {
  private static manifest: AssetManifest | null = null;

  /**
   * Preload manifest as JSON using Phaser's loader
   * This must be called FIRST in the scene's preload method
   */
  static preloadManifest(scene: Phaser.Scene): void {
    console.log('📦 Loading asset manifest...');
    scene.load.json('asset-manifest', '/assets.json');
  }

  /**
   * Load all assets after manifest is loaded
   * Call this in preload after preloadManifest, or in create
   */
  static loadAssets(scene: Phaser.Scene): void {
    // Get the loaded manifest from Phaser's cache
    const manifestData = scene.cache.json.get('asset-manifest');

    if (!manifestData) {
      console.error('❌ Asset manifest not found in cache!');
      console.error('   Did you call AssetLoader.preloadManifest() first?');
      return;
    }

    this.manifest = manifestData as AssetManifest;

    console.log('✅ Manifest loaded!');
    console.log(`   Version: ${this.manifest.version}`);
    console.log(`   Total Assets: ${this.manifest.totalAssets.toLocaleString()}`);

    // Sort atlases by priority (1 = highest)
    const sortedAtlases = Object.entries(this.manifest.atlases)
      .sort(([, a], [, b]) => a.priority - b.priority);

    let loadedCount = 0;

    for (const [key, atlas] of sortedAtlases) {
      if (atlas.preload) {
        scene.load.atlas(key, `/${atlas.path}`, `/${atlas.jsonPath}`);
        loadedCount++;
        console.log(`   Loading: ${key} (${atlas.category}, ${atlas.frameCount} frames)`);
      }
    }

    console.log(`   Queued ${loadedCount} atlases for loading`);
  }

  /**
   * Register animations after assets are loaded
   * Call this in the scene's create() method
   */
  static registerAnimations(scene: Phaser.Scene): void {
    if (!this.manifest || !this.manifest.animations) {
      console.warn('⚠️  No animations to register');
      return;
    }

    console.log('🎬 Registering animations...');
    let registered = 0;

    for (const [key, anim] of Object.entries(this.manifest.animations)) {
      try {
        // Note: Animation frames need to reference actual frame names from the atlas
        // For now, we'll skip registration since we don't have proper frame mapping
        // This would need actual sprite frame names like 'sprite_walk_down_0001.png'
        console.log(`   Skipping: ${key} (needs frame name mapping)`);
      } catch (error) {
        console.warn(`   Failed to register animation: ${key}`, error);
      }
    }

    console.log(`   Registered ${registered} animations`);
  }

  /**
   * Get manifest data
   */
  static getManifest(): AssetManifest | null {
    return this.manifest;
  }

  /**
   * Check if manifest is loaded
   */
  static isManifestLoaded(): boolean {
    return this.manifest !== null;
  }
}
