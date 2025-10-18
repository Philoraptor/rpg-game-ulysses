# Map Editor

Web-based map editor for creating game screens.

## Features

- Tile palette selection
- Multi-layer editing (ground, objects, collision, events)
- 256×256 screen navigation
- Object placement
- Script trigger assignment
- Export to JSON

## Technology

- TypeScript
- HTML5 Canvas
- Vite
- (Optionally) React for UI

## Structure

```
/src/
  /editor/      - Tile palette, layer controls
  /preview/     - Live map preview
  /ui/          - Editor interface
  main.ts       - Entry point
```

## Development

```bash
npm run dev      # Start dev server (http://localhost:8081)
npm run build    # Build for production
```

## Status

⏳ Phase 5 - Not yet implemented
