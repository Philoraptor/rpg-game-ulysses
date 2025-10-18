/**
 * Shared Package - Main Export
 *
 * @module shared
 * @fileoverview Central export for all shared utilities, types, and validation
 */

// Types
export * from './types';
export type { Result } from './types/result';

// Validation
export * from './validation';
export type {
  AssetManifest,
  AtlasMetadata,
  Animation,
  TileProperties,
  ValidationResult,
} from './validation/asset-schemas';
