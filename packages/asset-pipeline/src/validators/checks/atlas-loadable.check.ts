/**
 * Atlas Loadable Check
 *
 * @module asset-pipeline/validators/checks/atlas-loadable
 * @fileoverview Verify all atlas files exist and are loadable
 */

import fs from 'fs/promises';
import path from 'path';
import { CheckResult, ValidationCheck } from '../types';

export class AtlasLoadableCheck implements ValidationCheck {
  name = 'atlas-loadable';
  description = 'Verify all atlas PNG and JSON files exist and are loadable';

  constructor(
    private manifestPath: string,
    private projectRoot: string
  ) {}

  async run(): Promise<CheckResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let checkedFiles = 0;

    try {
      // Load manifest
      const manifestContent = await fs.readFile(this.manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);

      // Check each atlas
      for (const [atlasName, atlas] of Object.entries(manifest.atlases)) {
        const pngPath = path.join(this.projectRoot, 'assets/game', atlas.path);
        const jsonPath = path.join(this.projectRoot, 'assets/game', atlas.jsonPath);

        // Check PNG exists
        try {
          await fs.access(pngPath);
          checkedFiles++;
        } catch {
          errors.push(`Atlas PNG missing: ${atlas.path} (${atlasName})`);
        }

        // Check JSON exists
        try {
          await fs.access(jsonPath);
          checkedFiles++;
        } catch {
          errors.push(`Atlas JSON missing: ${atlas.jsonPath} (${atlasName})`);
        }

        // Verify JSON is valid
        try {
          const jsonContent = await fs.readFile(jsonPath, 'utf-8');
          const atlasData = JSON.parse(jsonContent);

          if (!atlasData.frames || typeof atlasData.frames !== 'object') {
            errors.push(`Invalid atlas JSON structure: ${atlas.jsonPath}`);
          }
        } catch (e) {
          errors.push(`Cannot parse JSON: ${atlas.jsonPath} - ${e.message}`);
        }
      }

      return {
        name: this.name,
        passed: errors.length === 0,
        errors,
        warnings,
        metrics: { filesChecked: checkedFiles },
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
