/**
 * File Size Check
 *
 * @module asset-pipeline/validators/checks/file-size
 * @fileoverview Verify file sizes meet targets
 */

import fs from 'fs/promises';
import { CheckResult, ValidationCheck } from '../types';

export class FileSizeCheck implements ValidationCheck {
  name = 'file-size';
  description = 'Verify total file sizes meet compression targets';

  constructor(
    private manifestPath: string,
    private targetTotalSize: number = 15 * 1024 * 1024 // 15MB default target
  ) {}

  async run(): Promise<CheckResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const manifestContent = await fs.readFile(this.manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      let totalSize = 0;
      const sizes: Record<string, number> = {};

      for (const [atlasName, atlas] of Object.entries(manifest.atlases)) {
        const fileSize = atlas.fileSize || 0;
        totalSize += fileSize;
        sizes[atlasName] = fileSize;
      }

      // Check against target
      if (totalSize > this.targetTotalSize) {
        const overageMB = ((totalSize - this.targetTotalSize) / 1024 / 1024).toFixed(2);
        warnings.push(
          `Total size ${(totalSize / 1024 / 1024).toFixed(2)}MB exceeds target ${(this.targetTotalSize / 1024 / 1024).toFixed(0)}MB by ${overageMB}MB`
        );
      }

      // Check for excessively large individual atlases
      const maxAtlasSize = 8 * 1024 * 1024; // 8MB per atlas
      for (const [atlasName, size] of Object.entries(sizes)) {
        if (size > maxAtlasSize) {
          warnings.push(
            `${atlasName} is large: ${(size / 1024 / 1024).toFixed(2)}MB (consider splitting)`
          );
        }
      }

      return {
        name: this.name,
        passed: true, // Warnings only, not hard failures
        errors,
        warnings,
        metrics: {
          totalSize,
          totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
          targetSizeMB: (this.targetTotalSize / 1024 / 1024).toFixed(0),
          compressionTarget: ((totalSize / this.targetTotalSize) * 100).toFixed(1) + '%',
        },
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
