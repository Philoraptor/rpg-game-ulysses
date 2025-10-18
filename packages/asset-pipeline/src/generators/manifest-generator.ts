/**
 * Asset Manifest Generator
 *
 * @module asset-pipeline/generators/manifest-generator
 * @fileoverview Generates master assets.json manifest from atlas metadata
 */

import fs from 'fs/promises';
import path from 'path';
import {
  Result,
  Ok,
  Err,
  ManifestGenerationError,
  ValidationError,
  FileOperationError,
  toAssetError,
} from '../../../shared/src/types';
import {
  AssetManifest,
  AtlasMetadata,
  Animation,
  TileProperties,
  validateManifest,
} from '../../../shared/src/validation';

/**
 * Configuration for manifest generation
 */
export interface ManifestGeneratorConfig {
  atlasesDir: string;
  outputPath: string;
  projectRoot: string;
  includeAnimations?: boolean;
  includeTileProperties?: boolean;
}

/**
 * Atlas file metadata from free-tex-packer
 */
interface AtlasJSON {
  frames: Record<string, {
    frame: { x: number; y: number; w: number; h: number };
    rotated: boolean;
    trimmed: boolean;
    spriteSourceSize: { x: number; y: number; w: number; h: number };
    sourceSize: { w: number; h: number };
  }>;
  meta?: {
    app?: string;
    version?: string;
    image?: string;
    format?: string;
    size?: { w: number; h: number };
    scale?: string;
  };
}

/**
 * Generate master asset manifest
 */
export async function generateManifest(
  config: ManifestGeneratorConfig
): Promise<Result<AssetManifest, ManifestGenerationError>> {
  try {
    // Step 1: Load all atlas metadata
    const atlasesResult = await loadAtlasMetadata(config.atlasesDir);
    if (atlasesResult.isErr()) {
      return atlasesResult;
    }
    const atlases = atlasesResult.value;

    // Step 2: Build manifest structure
    const manifest: AssetManifest = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      totalAssets: Object.values(atlases).reduce((sum, atlas) => sum + atlas.frameCount, 0),
      atlases,
      animations: config.includeAnimations ? generateDefaultAnimations() : {},
      tileProperties: config.includeTileProperties ? generateDefaultTileProperties() : {},
      pipeline: await generatePipelineMetadata(config.projectRoot),
    };

    // Step 3: Validate manifest
    const validation = validateManifest(manifest);
    if (!validation.success) {
      return new Err(
        new ManifestGenerationError(
          'Generated manifest failed validation',
          {
            errors: validation.errorMessages,
            validationErrors: validation.errors?.issues,
          }
        )
      );
    }

    // Step 4: Write manifest to file
    const writeResult = await writeManifestFile(config.outputPath, validation.data!);
    if (writeResult.isErr()) {
      return writeResult;
    }

    return new Ok(validation.data!);
  } catch (error) {
    return new Err(
      new ManifestGenerationError(
        'Failed to generate manifest',
        { originalError: toAssetError(error).message }
      )
    );
  }
}

/**
 * Load metadata from all atlas JSON files
 */
async function loadAtlasMetadata(
  atlasesDir: string
): Promise<Result<Record<string, AtlasMetadata>, ManifestGenerationError>> {
  try {
    const files = await fs.readdir(atlasesDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const atlases: Record<string, AtlasMetadata> = {};

    for (const jsonFile of jsonFiles) {
      const jsonPath = path.join(atlasesDir, jsonFile);
      const pngFile = jsonFile.replace('.json', '.png');
      const pngPath = path.join(atlasesDir, pngFile);

      // Read JSON metadata
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      const atlasData: AtlasJSON = JSON.parse(jsonContent);

      // Get PNG file stats
      const pngStats = await fs.stat(pngPath);

      // Determine category from filename
      const category = determineCategory(jsonFile);

      // Determine priority (tiles=1, sprites=2, effects=3, ui=1, other=5)
      const priority = category === 'tiles' || category === 'ui' ? 1 :
                       category === 'sprites' ? 2 :
                       category === 'effects' ? 3 : 5;

      // Build atlas metadata
      const atlasName = path.basename(jsonFile, '.json');
      atlases[atlasName] = {
        path: `atlases/${pngFile}`,
        jsonPath: `atlases/${jsonFile}`,
        size: {
          width: atlasData.meta?.size?.w || 0,
          height: atlasData.meta?.size?.h || 0,
        },
        frameCount: Object.keys(atlasData.frames).length,
        preload: category === 'tiles' || category === 'sprites' || category === 'ui',
        priority,
        category,
        fileSize: pngStats.size,
        format: 'png',
      };
    }

    return new Ok(atlases);
  } catch (error) {
    return new Err(
      new ManifestGenerationError(
        'Failed to load atlas metadata',
        { originalError: toAssetError(error).message, atlasesDir }
      )
    );
  }
}

/**
 * Determine asset category from filename
 */
function determineCategory(filename: string): 'tiles' | 'sprites' | 'effects' | 'ui' | 'other' {
  const lower = filename.toLowerCase();
  if (lower.includes('tile')) return 'tiles';
  if (lower.includes('sprite')) return 'sprites';
  if (lower.includes('effect')) return 'effects';
  if (lower.includes('ui') || lower.includes('interface')) return 'ui';
  return 'other';
}

/**
 * Generate default animation definitions
 */
function generateDefaultAnimations(): Record<string, Animation> {
  return {
    player_walk_down: {
      frames: [0, 1, 2, 3],
      fps: 8,
      loop: true,
    },
    player_walk_up: {
      frames: [4, 5, 6, 7],
      fps: 8,
      loop: true,
    },
    player_walk_left: {
      frames: [8, 9, 10, 11],
      fps: 8,
      loop: true,
    },
    player_walk_right: {
      frames: [12, 13, 14, 15],
      fps: 8,
      loop: true,
    },
    player_idle_down: {
      frames: [0],
      fps: 1,
      loop: true,
    },
  };
}

/**
 * Generate default tile properties
 */
function generateDefaultTileProperties(): Record<string, TileProperties> {
  return {
    '0': {
      collision: false,
      category: 'ground',
      walkable: true,
      transparent: false,
      layer: 'ground',
    },
    '1': {
      collision: true,
      category: 'wall',
      walkable: false,
      transparent: false,
      layer: 'object',
    },
  };
}

/**
 * Generate pipeline processing metadata
 */
async function generatePipelineMetadata(
  projectRoot: string
): Promise<AssetManifest['pipeline']> {
  try {
    // Load tile analysis if exists
    const tileAnalysisPath = path.join(projectRoot, 'assets/tile-analysis.json');
    const tileAnalysis = JSON.parse(await fs.readFile(tileAnalysisPath, 'utf-8'));

    // Load conversion report if exists
    const conversionReportPath = path.join(projectRoot, 'assets/conversion-report.json');
    let conversionData;
    try {
      conversionData = JSON.parse(await fs.readFile(conversionReportPath, 'utf-8'));
    } catch {
      conversionData = null;
    }

    return {
      tileExtraction: {
        totalTiles: tileAnalysis.totalTiles || 0,
        tilesExtracted: tileAnalysis.totalTiles || 0,
        sheetsProcessed: tileAnalysis.totalSheets || 0,
      },
      bmpToPngConversion: conversionData ? {
        originalSize: conversionData.totalOriginal || 0,
        convertedSize: conversionData.totalConverted || 0,
        compressionRatio: conversionData.compressionRatio || 0,
        filesProcessed: conversionData.filesProcessed || 0,
      } : undefined,
    };
  } catch {
    return undefined;
  }
}

/**
 * Write manifest to JSON file
 */
async function writeManifestFile(
  outputPath: string,
  manifest: AssetManifest
): Promise<Result<void, ManifestGenerationError>> {
  try {
    await fs.writeFile(
      outputPath,
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );
    return new Ok(undefined);
  } catch (error) {
    return new Err(
      new ManifestGenerationError(
        'Failed to write manifest file',
        { originalError: toAssetError(error).message, outputPath }
      )
    );
  }
}

/**
 * Safe wrapper that logs errors
 */
export async function safeGenerateManifest(
  config: ManifestGeneratorConfig
): Promise<AssetManifest | null> {
  const result = await generateManifest(config);

  if (result.isErr()) {
    console.error('❌ Manifest generation failed:', result.error.message);
    if (result.error.context) {
      console.error('   Context:', result.error.context);
    }
    return null;
  }

  console.log('✅ Manifest generated successfully');
  console.log(`   Total assets: ${result.value.totalAssets}`);
  console.log(`   Atlases: ${Object.keys(result.value.atlases).length}`);
  return result.value;
}
