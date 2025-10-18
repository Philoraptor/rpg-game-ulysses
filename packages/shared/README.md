# Shared

Common types, utilities, and protocols used by both client and server.

## Exports

### Types
- Player, NPC, Monster, Item interfaces
- GameMessage protocol
- Screen, Tile, Entity types

### Constants
- TILE_SIZE = 32
- VIEWPORT_WIDTH = 640
- VIEWPORT_HEIGHT = 640
- WORLD_SIZE = 256

### Utilities
- Coordinate conversion
- Validation functions
- Common helpers

## Structure

```
/src/
  /types/       - Shared TypeScript interfaces
  /protocol/    - Network message definitions
  /constants/   - Game constants
  /utils/       - Helper functions
  index.ts      - Main export
```

## Usage

```typescript
import { Player, GameMessage, TILE_SIZE } from '@shared';

const player: Player = {
  id: '123',
  name: 'Hero',
  position: { x: 10, y: 10, screen: [0, 0] },
  level: 1,
  hp: 100,
  maxHp: 100,
};
```

## Status

⏳ Phase 3 - To be implemented alongside game engine
