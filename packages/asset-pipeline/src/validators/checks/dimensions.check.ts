/**
 * Dimensions Check
 *
 * @module asset-pipeline/validators/checks/dimensions
 * @fileoverview Verify atlas dimensions are optimal (power-of-2)
 */

import fs from 'fs/promises';
import { CheckResult, ValidationCheck } from '../types';

export class DimensionsCheck implements ValidationCheck {
  name = 'dimensions';
  description = 'Verify atlas dimensions are power-of-2 for optimal GPU performance';

  constructor(private manifestPath: string) {}

  async run(): Promise<CheckResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let checkedAtlases = 0;

    try {
      const manifestContent = await fs.readFile(this.manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      for (const [atlasName, atlas] of Object.entries(manifest.atlases)) {
        checkedAtlases++;

        // Check if width is power of 2
        if (!isPowerOf2(atlas.size.width)) {
          warnings.push(
            `${atlasName}: Width ${atlas.size.width} is not power-of-2 (may impact GPU performance)`
          );
        }

        // Check if height is power of 2
        if (!isPowerOf2(atlas.size.height)) {
          warnings.push(
            `${atlasName}: Height ${atlas.size.height} is not power-of-2 (may impact GPU performance)`
          );
        }

        // Check if dimensions are too large
        const maxDimension = 8192;
        if (atlas.size.width > maxDimension) {
          errors.push(`${atlasName}: Width ${atlas.size.width} exceeds maximum ${maxDimension}`);
        }
        if (atlas.size.height > maxDimension) {
          errors.push(`${atlasName}: Height ${atlas.size.height} exceeds maximum ${maxDimension}`);
        }

        // Check if dimensions are too small
        const minDimension = 64;
        if (atlas.size.width < minDimension) {
          warnings.push(`${atlasName}: Width ${atlas.size.width} is very small (< ${minDimension})`);
        }
        if (atlas.size.height < minDimension) {
          warnings.push(`${atlasName}: Height ${atlas.size.height} is very small (< ${minDimension})`);
        }
      }

      return {
        name: this.name,
        passed: errors.length === 0,
        errors,
        warnings,
        metrics: { atlasesChecked: checkedAtlases },
      };
    } catch (error) {
      return {
        name: this.name,
        passed: false,
        errors: [`Check failed: ${error.message}`],
        warnings: [],
      };
    }
  }
}

function isPowerOf2(value: number): boolean {
  return value > 0 && (value & (value - 1)) === 0;
}
