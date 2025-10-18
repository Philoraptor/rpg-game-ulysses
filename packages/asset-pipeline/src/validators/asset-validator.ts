/**
 * Asset Validator
 *
 * @module asset-pipeline/validators/asset-validator
 * @fileoverview Main validator orchestrator that runs all checks
 */

import fs from 'fs/promises';
import { ValidationReport, ValidationCheck, CheckResult } from './types';
import { AtlasLoadableCheck } from './checks/atlas-loadable.check';
import { DimensionsCheck } from './checks/dimensions.check';
import { FileSizeCheck } from './checks/file-size.check';

export interface ValidatorConfig {
  manifestPath: string;
  projectRoot: string;
  outputPath?: string;
}

/**
 * Main asset validator
 */
export class AssetValidator {
  private checks: ValidationCheck[] = [];

  constructor(private config: ValidatorConfig) {
    this.registerDefaultChecks();
  }

  /**
   * Register default validation checks
   */
  private registerDefaultChecks(): void {
    this.checks = [
      new AtlasLoadableCheck(this.config.manifestPath, this.config.projectRoot),
      new DimensionsCheck(this.config.manifestPath),
      new FileSizeCheck(this.config.manifestPath),
    ];
  }

  /**
   * Add a custom check
   */
  addCheck(check: ValidationCheck): void {
    this.checks.push(check);
  }

  /**
   * Run all validation checks
   */
  async validate(): Promise<ValidationReport> {
    console.log('\n🔍 Running Asset QA Validation...\n');

    const checkResults: CheckResult[] = [];
    let passed = 0;
    let failed = 0;
    let totalWarnings = 0;

    for (const check of this.checks) {
      console.log(`  Running: ${check.description}...`);
      const result = await check.run();
      checkResults.push(result);

      if (result.passed) {
        passed++;
        console.log(`  ✓ ${check.name}: PASSED`);
      } else {
        failed++;
        console.log(`  ✗ ${check.name}: FAILED`);
      }

      if (result.errors.length > 0) {
        result.errors.forEach((err) => console.log(`    ERROR: ${err}`));
      }

      if (result.warnings.length > 0) {
        totalWarnings += result.warnings.length;
        result.warnings.forEach((warn) => console.log(`    WARN: ${warn}`));
      }

      console.log('');
    }

    // Calculate metrics
    const manifest = JSON.parse(await fs.readFile(this.config.manifestPath, 'utf-8'));
    const totalSize = Object.values(manifest.atlases).reduce(
      (sum: number, atlas: any) => sum + (atlas.fileSize || 0),
      0
    );

    const metrics = {
      totalSize,
      atlasCount: Object.keys(manifest.atlases).length,
      frameCount: manifest.totalAssets,
      avgFramesPerAtlas: Math.round(manifest.totalAssets / Object.keys(manifest.atlases).length),
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(checkResults, metrics);

    const report: ValidationReport = {
      timestamp: new Date().toISOString(),
      passed: failed === 0,
      summary: {
        totalChecks: this.checks.length,
        passed,
        failed,
        warnings: totalWarnings,
      },
      checks: checkResults,
      metrics,
      recommendations,
    };

    // Save report if output path specified
    if (this.config.outputPath) {
      await fs.writeFile(
        this.config.outputPath,
        JSON.stringify(report, null, 2),
        'utf-8'
      );
      console.log(`📄 QA report saved to: ${this.config.outputPath}\n`);
    }

    return report;
  }

  /**
   * Generate recommendations based on check results
   */
  private generateRecommendations(
    checkResults: CheckResult[],
    metrics: ValidationReport['metrics']
  ): string[] {
    const recommendations: string[] = [];

    // Check for non-power-of-2 dimensions
    const dimensionsCheck = checkResults.find((c) => c.name === 'dimensions');
    if (dimensionsCheck && dimensionsCheck.warnings.length > 0) {
      recommendations.push(
        'Consider regenerating atlases with power-of-2 dimensions for optimal GPU performance'
      );
    }

    // Check for large file sizes
    if (metrics.totalSize > 15 * 1024 * 1024) {
      recommendations.push(
        'Total asset size exceeds 15MB - consider additional compression or splitting large atlases'
      );
    }

    // Check for low frame counts
    if (metrics.avgFramesPerAtlas < 100) {
      recommendations.push(
        'Average frames per atlas is low - consider consolidating small atlases to reduce HTTP requests'
      );
    }

    // Check for very high frame counts
    if (metrics.frameCount > 10000) {
      recommendations.push(
        'Very high frame count - ensure lazy loading for non-critical assets'
      );
    }

    return recommendations;
  }

  /**
   * Print summary to console
   */
  printSummary(report: ValidationReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('  QA VALIDATION SUMMARY');
    console.log('='.repeat(60));

    if (report.passed) {
      console.log('\n✅ ALL CHECKS PASSED\n');
    } else {
      console.log('\n❌ VALIDATION FAILED\n');
    }

    console.log(`Total Checks: ${report.summary.totalChecks}`);
    console.log(`  Passed: ${report.summary.passed}`);
    console.log(`  Failed: ${report.summary.failed}`);
    console.log(`  Warnings: ${report.summary.warnings}`);

    console.log('\nMetrics:');
    console.log(`  Total Size: ${(report.metrics.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Atlases: ${report.metrics.atlasCount}`);
    console.log(`  Total Frames: ${report.metrics.frameCount.toLocaleString()}`);
    console.log(`  Avg Frames/Atlas: ${report.metrics.avgFramesPerAtlas}`);

    if (report.recommendations && report.recommendations.length > 0) {
      console.log('\nRecommendations:');
      report.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}
