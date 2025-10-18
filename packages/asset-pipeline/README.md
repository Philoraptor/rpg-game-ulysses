# Asset Pipeline

Tools for converting legacy .rsc (BMP) files to modern game-ready formats.

## Status

**Phase 2 Task 1**: ✅ **COMPLETE** (2025-10-18)
- 31 BMP files converted to PNG
- 68.29 MB → 24.16 MB (64.6% compression)
- All colors verified with alpha=255 opacity

**Next**: Task 2 - Tile extraction (~5,000 tiles from 11 tile sheets)

## Current Features

- ✅ BMP → PNG conversion with ABGR→RGBA color mapping
- ✅ Progress bar visualization
- ✅ Conversion metrics and reporting
- ⏳ Sprite atlas generation (Task 4)
- ⏳ Metadata JSON creation (Task 5)
- ⏳ Tile extraction (Task 2)
- ⏳ Animation frame detection (Task 3)

## Structure

```
/src/
  /converters/    - .rsc → PNG conversion (rsc-to-png.ts)
  /extractors/    - Tile/sprite extraction (future)
  /packers/       - Sprite atlas generation (future)
  /validators/    - Quality assurance (future)
  /utils/         - Shared utilities
convert-all.js    - Production conversion script (JavaScript)
verify-colors.js  - PNG color/opacity verification
```

## Scripts

```bash
# Convert all .rsc files to PNG
npm run convert

# Or run the JavaScript version directly
node convert-all.js

# Verify converted PNGs have correct colors
node verify-colors.js
```

## Dependencies

### Active (Currently Used)
- **bmp-js** - BMP decoder (handles Windows 3.x BMP format)
- **pngjs** - PNG encoder
- **cli-progress** - Terminal progress bars
- **chalk@4** - Colored terminal output
- **typescript** + **ts-node** - TypeScript support
- **@types/*** - TypeScript type definitions

### Reserved for Future Tasks
- **sharp** - High-performance image processing (for tile extraction, Task 2+)
- **jimp** - Alternative image library (backup/edge cases)
- **free-tex-packer-core** - Texture atlas generation (Task 4)

## Usage Example

```bash
cd packages/asset-pipeline

# Run conversion
npm run convert

# Output:
# Found 31 asset files to convert
# Converting |████████████████████| 100% | 31/31 | interface.rsc.bmp
#
# Conversion Complete!
#
# Summary:
#   Successful: 31/31
#   Failed: 0/31
#
#   Original size: 68.29 MB
#   Converted size: 24.16 MB
#   Compression: 64.6%
```

## Technical Notes

### Color Channel Mapping

The conversion handles ABGR→RGBA color channel mapping:
- **bmp-js output**: ABGR format (byte 0=Alpha, 1=Blue, 2=Green, 3=Red)
- **PNG requirement**: RGBA format (byte 0=Red, 1=Green, 2=Blue, 3=Alpha)
- **Alpha handling**: BMPs are 24-bit RGB (no alpha), so we force alpha=255 (opaque)

```javascript
// ABGR → RGBA conversion
pixelData[0] = bmpData.data[3];  // Red (from position 3)
pixelData[1] = bmpData.data[2];  // Green (from position 2)
pixelData[2] = bmpData.data[1];  // Blue (from position 1)
pixelData[3] = 255;              // Alpha (force opaque)
```

## Output

### Converted Assets (assets/extracted/)
- 31 PNG files with proper RGB colors and full opacity
- Average file size: ~779 KB per file
- All verified with `verify-colors.js`

### Conversion Report (assets/conversion-report.json)
```json
[
  {
    "filename": "tiles1.rsc",
    "originalSize": 4775974,
    "convertedSize": 1601488,
    "compressionRatio": 66.47,
    "success": true
  },
  ...
]
```

## Troubleshooting

**Issue**: PNGs appear all blue/yellow
**Cause**: Incorrect color channel mapping
**Fix**: Verify ABGR→RGBA conversion is applied

**Issue**: PNGs are fully transparent
**Cause**: Alpha channel set to 0
**Fix**: Force alpha=255 for opaque images (BMPs have no alpha channel)

**Issue**: Sharp fails with "unsupported format"
**Cause**: Windows 3.x BMP format not supported by Sharp
**Solution**: Use bmp-js library instead (pure JavaScript BMP decoder)
