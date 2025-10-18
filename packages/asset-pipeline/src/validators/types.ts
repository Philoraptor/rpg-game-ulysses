/**
 * Validation Types
 *
 * @module asset-pipeline/validators/types
 * @fileoverview Type definitions for asset validation
 */

/**
 * Validation check result
 */
export interface CheckResult {
  name: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
  metrics?: Record<string, number | string>;
}

/**
 * Overall validation result
 */
export interface ValidationReport {
  timestamp: string;
  passed: boolean;
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  checks: CheckResult[];
  metrics: {
    totalSize: number;
    atlasCount: number;
    frameCount: number;
    avgFramesPerAtlas: number;
  };
  recommendations?: string[];
}

/**
 * Validation check interface
 */
export interface ValidationCheck {
  name: string;
  description: string;
  run: () => Promise<CheckResult>;
}
