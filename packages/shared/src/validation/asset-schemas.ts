/**
 * Asset Pipeline Validation Schemas
 *
 * @module shared/validation/asset-schemas
 * @fileoverview Zod schemas for validating asset manifest and metadata
 */

import { z } from 'zod';

/**
 * Common validation patterns
 */
export const CommonSchemas = {
  // File path validation
  FilePath: z.string().min(1, 'File path cannot be empty'),

  // Semantic version validation
  SemanticVersion: z
    .string()
    .regex(
      /^\d+\.\d+\.\d+$/,
      'Must follow semantic versioning (x.y.z)'
    ),

  // Positive integer
  PositiveInt: z.number().int().positive('Must be a positive integer'),

  // Non-negative integer
  NonNegativeInt: z.number().int().min(0, 'Must be non-negative'),

  // Percentage (0-100)
  Percentage: z.number().min(0).max(100, 'Must be between 0 and 100'),

  // Timestamp (ISO string)
  Timestamp: z.string().datetime('Must be a valid ISO datetime'),

  // Size in bytes
  FileSize: z.number().int().min(0, 'File size must be non-negative'),
};

/**
 * Atlas metadata schema
 */
export const AtlasMetadataSchema = z.object({
  // File paths
  path: CommonSchemas.FilePath.describe('Path to atlas PNG file'),
  jsonPath: CommonSchemas.FilePath.describe('Path to atlas JSON metadata'),

  // Dimensions
  size: z.object({
    width: CommonSchemas.PositiveInt.describe('Atlas width in pixels'),
    height: CommonSchemas.PositiveInt.describe('Atlas height in pixels'),
  }).describe('Atlas dimensions'),

  // Frame information
  frameCount: CommonSchemas.PositiveInt.describe('Number of frames in atlas'),

  // Loading configuration
  preload: z.boolean().default(true).describe('Whether to preload this atlas'),
  priority: z
    .number()
    .int()
    .min(1, 'Priority must be at least 1')
    .max(10, 'Priority cannot exceed 10')
    .describe('Loading priority (1 = highest)'),

  // Category
  category: z
    .enum(['tiles', 'sprites', 'effects', 'ui', 'other'])
    .describe('Asset category'),

  // Optional metadata
  fileSize: CommonSchemas.FileSize.optional().describe('File size in bytes'),
  format: z.enum(['png', 'jpg', 'webp']).default('png').describe('Image format'),
  compressionRatio: CommonSchemas.Percentage.optional().describe('Compression ratio'),
});

export type AtlasMetadata = z.infer<typeof AtlasMetadataSchema>;

/**
 * Animation definition schema
 */
export const AnimationSchema = z.object({
  // Frame sequence
  frames: z
    .array(CommonSchemas.NonNegativeInt)
    .min(1, 'Animation must have at least one frame')
    .describe('Array of frame indices'),

  // Playback settings
  fps: z
    .number()
    .int()
    .min(1, 'FPS must be at least 1')
    .max(120, 'FPS cannot exceed 120')
    .describe('Frames per second'),

  loop: z.boolean().default(true).describe('Whether animation loops'),

  // Optional properties
  yoyo: z.boolean().optional().describe('Reverse animation on loop'),
  delay: CommonSchemas.NonNegativeInt.optional().describe('Delay before animation starts (ms)'),
  repeatDelay: CommonSchemas.NonNegativeInt.optional().describe('Delay between loops (ms)'),
});

export type Animation = z.infer<typeof AnimationSchema>;

/**
 * Tile properties schema
 */
export const TilePropertiesSchema = z.object({
  // Collision
  collision: z.boolean().default(false).describe('Whether tile blocks movement'),

  // Visual category
  category: z
    .enum(['ground', 'wall', 'water', 'decoration', 'door', 'other'])
    .describe('Tile category'),

  // Animation (for animated tiles)
  animated: z.boolean().optional().describe('Whether tile is animated'),
  animationFrames: z.array(CommonSchemas.NonNegativeInt).optional().describe('Animation frame IDs'),
  animationSpeed: CommonSchemas.PositiveInt.optional().describe('Animation speed in ms per frame'),

  // Additional properties
  walkable: z.boolean().optional().describe('Whether player can walk on tile'),
  transparent: z.boolean().optional().describe('Whether tile has transparency'),
  layer: z.enum(['ground', 'object', 'overlay']).optional().describe('Rendering layer'),
});

export type TileProperties = z.infer<typeof TilePropertiesSchema>;

/**
 * Master asset manifest schema
 */
export const AssetManifestSchema = z.object({
  // Version information
  version: CommonSchemas.SemanticVersion.describe('Manifest version'),
  generatedAt: CommonSchemas.Timestamp.describe('Generation timestamp'),

  // Summary statistics
  totalAssets: CommonSchemas.NonNegativeInt.describe('Total number of assets'),
  totalSize: CommonSchemas.FileSize.optional().describe('Total size of all assets in bytes'),
  compressionRatio: CommonSchemas.Percentage.optional().describe('Overall compression ratio'),

  // Atlas collection
  atlases: z
    .record(z.string(), AtlasMetadataSchema)
    .describe('Map of atlas name to metadata'),

  // Animation definitions
  animations: z
    .record(z.string(), AnimationSchema)
    .optional()
    .default({})
    .describe('Map of animation name to definition'),

  // Tile properties
  tileProperties: z
    .record(z.string(), TilePropertiesSchema)
    .optional()
    .default({})
    .describe('Map of tile ID to properties'),

  // Pipeline metadata
  pipeline: z
    .object({
      bmpToPngConversion: z.object({
        originalSize: CommonSchemas.FileSize,
        convertedSize: CommonSchemas.FileSize,
        compressionRatio: CommonSchemas.Percentage,
        filesProcessed: CommonSchemas.PositiveInt,
      }).optional(),
      tileExtraction: z.object({
        totalTiles: CommonSchemas.NonNegativeInt,
        tilesExtracted: CommonSchemas.NonNegativeInt,
        sheetsProcessed: CommonSchemas.NonNegativeInt,
      }).optional(),
      atlasGeneration: z.object({
        atlasesCreated: CommonSchemas.NonNegativeInt,
        totalFrames: CommonSchemas.NonNegativeInt,
      }).optional(),
    })
    .optional()
    .describe('Asset pipeline processing metadata'),
});

export type AssetManifest = z.infer<typeof AssetManifestSchema>;

/**
 * Validation result interface
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
  errorMessages?: string[];
}

/**
 * Validate data against a Zod schema
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  } else {
    return {
      success: false,
      errors: result.error,
      errorMessages: result.error.issues.map((issue) => issue.message),
    };
  }
}

/**
 * Get validation errors in a flat format
 */
export function getValidationErrorsFlat(errors: z.ZodError): Record<string, string> {
  const errorMap: Record<string, string> = {};

  errors.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errorMap[path] = issue.message;
  });

  return errorMap;
}

/**
 * Validate asset manifest
 */
export function validateManifest(data: unknown): ValidationResult<AssetManifest> {
  return validateData(AssetManifestSchema, data);
}

/**
 * Validate atlas metadata
 */
export function validateAtlas(data: unknown): ValidationResult<AtlasMetadata> {
  return validateData(AtlasMetadataSchema, data);
}

/**
 * Validate animation
 */
export function validateAnimation(data: unknown): ValidationResult<Animation> {
  return validateData(AnimationSchema, data);
}
