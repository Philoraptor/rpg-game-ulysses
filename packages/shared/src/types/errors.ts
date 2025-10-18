/**
 * Custom Error Classes for Asset Pipeline
 *
 * @module shared/types/errors
 * @fileoverview Domain-specific errors for game asset processing
 */

/**
 * Base error class for asset pipeline errors
 */
export class AssetPipelineError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AssetPipelineError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when manifest generation fails
 */
export class ManifestGenerationError extends AssetPipelineError {
  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'MANIFEST_GENERATION_ERROR', context);
    this.name = 'ManifestGenerationError';
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends AssetPipelineError {
  constructor(
    message: string,
    public readonly validationErrors?: string[],
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when asset loading fails
 */
export class AssetLoadError extends AssetPipelineError {
  constructor(
    message: string,
    public readonly assetPath?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'ASSET_LOAD_ERROR', { ...context, assetPath });
    this.name = 'AssetLoadError';
  }
}

/**
 * Error thrown when file operations fail
 */
export class FileOperationError extends AssetPipelineError {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly operation: 'read' | 'write' | 'delete' | 'stat',
    context?: Record<string, unknown>
  ) {
    super(message, 'FILE_OPERATION_ERROR', { ...context, filePath, operation });
    this.name = 'FileOperationError';
  }
}

/**
 * Error thrown when atlas packing fails
 */
export class AtlasPackingError extends AssetPipelineError {
  constructor(
    message: string,
    public readonly atlasName?: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'ATLAS_PACKING_ERROR', { ...context, atlasName });
    this.name = 'AtlasPackingError';
  }
}

/**
 * Error thrown when QA validation fails
 */
export class QAValidationError extends AssetPipelineError {
  constructor(
    message: string,
    public readonly checkName: string,
    public readonly failures: string[],
    context?: Record<string, unknown>
  ) {
    super(message, 'QA_VALIDATION_ERROR', { ...context, checkName, failures });
    this.name = 'QAValidationError';
  }
}

/**
 * Error thrown when performance targets not met
 */
export class PerformanceError extends AssetPipelineError {
  constructor(
    message: string,
    public readonly metric: string,
    public readonly actual: number,
    public readonly target: number,
    context?: Record<string, unknown>
  ) {
    super(message, 'PERFORMANCE_ERROR', { ...context, metric, actual, target });
    this.name = 'PerformanceError';
  }
}

/**
 * Helper to convert unknown errors to AssetPipelineError
 */
export function toAssetError(error: unknown, defaultMessage?: string): AssetPipelineError {
  if (error instanceof AssetPipelineError) {
    return error;
  }

  if (error instanceof Error) {
    return new AssetPipelineError(
      error.message || defaultMessage || 'Unknown error occurred',
      'UNKNOWN_ERROR',
      { originalError: error.message, stack: error.stack }
    );
  }

  return new AssetPipelineError(
    defaultMessage || 'Unknown error occurred',
    'UNKNOWN_ERROR',
    { originalError: String(error) }
  );
}
