# Asset Pipeline

Tools for converting legacy .rsc (BMP) files to modern formats.

## Features

- BMP → PNG conversion
- Sprite atlas generation
- Metadata JSON creation
- Tile extraction (32×32)
- Animation frame detection

## Structure

```
/src/
  /converters/  - .rsc → PNG conversion
  /packers/     - Sprite atlas generation
  /generators/  - Metadata JSON generation
  /utils/       - Shared utilities
```

## Usage

```bash
npm run convert              # Convert all .rsc files
npm run convert:tiles        # Convert tiles only
npm run convert:sprites      # Convert sprites only
npm run pack                 # Generate atlases
npm run metadata             # Generate JSON metadata
```

## Dependencies

- Sharp (image processing)
- free-tex-packer-core (atlas generation)

## Status

⏳ Phase 2 - Next priority
