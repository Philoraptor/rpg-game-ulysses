# Recommendations: Technology Stack & Best Practices

**Project**: Unnamed 2D Top-Down RPG
**Session**: Initialization - "Ulysses Stranded"
**Date**: 2025-10-16

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Development Tools](#development-tools)
3. [Architecture Patterns](#architecture-patterns)
4. [Asset Pipeline](#asset-pipeline)
5. [Testing Strategy](#testing-strategy)
6. [Performance Optimization](#performance-optimization)
7. [Security Considerations](#security-considerations)
8. [Project Management](#project-management)

---

## Technology Stack

### Frontend (Game Client)

#### Core Technologies
```
Language:       TypeScript 5.x
Runtime:        Browser (ES2020+ target)
Rendering:      HTML5 Canvas 2D API
Build Tool:     Vite 5.x
Package Mgr:    npm (matches stdLibSchema)
```

**Rationale**:
- **TypeScript**: Type safety, matches stdLibSchema, excellent tooling
- **Canvas 2D**: Native, hardware-accelerated, perfect for pixel-art
- **Vite**: Fast HMR, optimized builds, modern tooling

#### Optional Frameworks (Evaluate in Phase 2)

**Option A: Phaser 3** (Recommended for rapid development)
```typescript
// Pros: Battle-tested, full game engine, rich plugin ecosystem
// Cons: Some overhead, opinionated structure
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
  create() {
    this.map = this.make.tilemap({ key: 'screen_00_00' });
    this.player = this.physics.add.sprite(320, 320, 'player');
  }
}
```

**Option B: PixiJS** (Lightweight, flexible)
```typescript
// Pros: Fast WebGL renderer, lightweight, flexible
// Cons: Lower-level, need to build game systems yourself
import { Application, Sprite, Texture } from 'pixi.js';

const app = new Application({ width: 640, height: 640 });
const sprite = Sprite.from('player.png');
```

**Option C: Custom Engine** (Full control)
```typescript
// Pros: No bloat, exactly what you need, educational
// Cons: Time-consuming, reinventing wheels, more bugs
class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private systems: System[] = [];

  render(deltaTime: number) {
    for (const system of this.systems) {
      system.update(deltaTime);
    }
  }
}
```

**Recommendation**: Start with **Phaser 3** for Phase 1-3 (rapid prototyping), evaluate custom engine in Phase 4 if performance/flexibility issues arise.

---

### Backend (Game Server)

#### Core Technologies
```
Language:       TypeScript 5.x
Runtime:        Node.js 20.x LTS
Framework:      Fastify 4.x (faster than Express)
WebSocket:      ws library + Fastify WebSocket plugin
Database:       PostgreSQL 16 + Redis 7
ORM:            Drizzle ORM (type-safe, modern)
```

**Server Structure**:
```typescript
// /server/
//   /api/          - REST endpoints (auth, account)
//   /websocket/    - Real-time game communication
//   /game-loop/    - Server tick, entity updates
//   /scripts/      - Event system, quest logic
//   /database/     - Models, migrations
```

**Sample Server (Fastify + WebSocket)**:
```typescript
import Fastify from 'fastify';
import websocket from '@fastify/websocket';

const server = Fastify({ logger: true });
await server.register(websocket);

server.register(async (fastify) => {
  fastify.get('/game', { websocket: true }, (socket, request) => {
    socket.on('message', (data) => {
      const message = JSON.parse(data.toString());
      handleGameMessage(socket, message);
    });
  });
});

await server.listen({ port: 3000 });
```

**Rationale**:
- **Fastify**: 2-3x faster than Express, excellent TypeScript support
- **PostgreSQL**: Robust, ACID compliant for critical data (accounts, inventory)
- **Redis**: Fast session storage, leaderboards, caching (stdLibSchema already integrates)
- **Drizzle ORM**: Type-safe queries, no decorators, lightweight

---

### Shared Code

#### Monorepo Structure
```
/oldmain/
  /packages/
    /game-client/      - Frontend (Phaser game)
    /game-server/      - Backend (Fastify server)
    /shared/           - Common code (types, protocol, validators)
    /map-editor/       - Map editing tool
    /asset-pipeline/   - .rsc converter, sprite packer
  /assets/             - Original + converted assets
  /scripts/            - Build scripts, converters
  /docs/               - Documentation (answers.md, etc.)
  stdLibSchema/        - Symlink to framework
  package.json         - Root workspace config
```

**Workspace Configuration** (`package.json`):
```json
{
  "name": "rpg-game-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev:client": "npm run dev --workspace=game-client",
    "dev:server": "npm run dev --workspace=game-server",
    "dev:editor": "npm run dev --workspace=map-editor",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces"
  }
}
```

**Shared Types** (`/packages/shared/src/types.ts`):
```typescript
// Used by both client and server
export interface Player {
  id: string;
  name: string;
  position: { x: number; y: number; screen: [number, number] };
  level: number;
  hp: number;
  maxHp: number;
  sprite: number;
}

export interface GameMessage {
  type: 'move' | 'chat' | 'attack' | 'use_item';
  payload: unknown;
}

export const TILE_SIZE = 32;
export const VIEWPORT_WIDTH = 640;
export const VIEWPORT_HEIGHT = 640;
export const WORLD_SIZE = 256;
```

---

## Development Tools

### Code Quality

#### Linting & Formatting
```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Tools**:
- ESLint + @typescript-eslint/parser
- Prettier (code formatting)
- Husky (pre-commit hooks)
- lint-staged (only lint changed files)

---

### Build & Dev Experience

#### Vite Configuration (Client)
```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'phaser': ['phaser'],
          'game-logic': ['./src/game/systems', './src/game/entities'],
        },
      },
    },
  },
  server: {
    port: 8080,
    proxy: {
      '/api': 'http://localhost:3000',
      '/ws': { target: 'ws://localhost:3000', ws: true },
    },
  },
});
```

#### TSConfig (Shared)
```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "paths": {
      "@shared/*": ["./packages/shared/src/*"],
      "@game/*": ["./packages/game-client/src/*"]
    }
  }
}
```

---

### Asset Tools

#### Image Conversion Pipeline

**Sharp** (Fast image processing):
```typescript
import sharp from 'sharp';
import fs from 'fs/promises';

async function convertRscToPng(rscPath: string, outPath: string) {
  // .rsc files are BMP - Sharp can read them
  await sharp(rscPath)
    .png({ compressionLevel: 9, palette: true })
    .toFile(outPath);

  console.log(`Converted ${rscPath} → ${outPath}`);
}

// Convert all tiles
const files = await fs.readdir('./assets/');
for (const file of files.filter(f => f.endsWith('.rsc'))) {
  await convertRscToPng(`./assets/${file}`, `./assets/converted/${file}.png`);
}
```

**TexturePacker** (Create sprite atlases):
```bash
# Install TexturePacker CLI or use programmatic API
npm install @texturepacker/texturepacker

# Pack sprites into atlas
texturepacker \
  --format phaser3 \
  --data sprites.json \
  --sheet sprites.png \
  --trim-sprite-names \
  ./assets/sprites/*.png
```

**Alternative: Free Sprite Packer**:
```typescript
// Use free-tex-packer library
import texturePacker from 'free-tex-packer-core';

const images = [/* load images */];
const options = {
  textureName: 'sprites',
  width: 2048,
  height: 2048,
  extrude: 1,
  allowRotation: false,
};

const files = texturePacker(images, options);
// files contains atlas image + JSON metadata
```

---

## Architecture Patterns

### Entity Component System (ECS)

**Recommendation**: Use ECS for game entities (flexible, performant).

```typescript
// Component-based architecture
interface Component {
  type: string;
}

interface PositionComponent extends Component {
  type: 'position';
  x: number;
  y: number;
  screen: [number, number];
}

interface HealthComponent extends Component {
  type: 'health';
  current: number;
  max: number;
}

interface SpriteComponent extends Component {
  type: 'sprite';
  textureKey: string;
  frame: number;
}

class Entity {
  id: string;
  components = new Map<string, Component>();

  addComponent<T extends Component>(component: T): void {
    this.components.set(component.type, component);
  }

  getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T;
  }

  hasComponent(type: string): boolean {
    return this.components.has(type);
  }
}

// System processes entities with specific components
class MovementSystem {
  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      if (entity.hasComponent('position') && entity.hasComponent('velocity')) {
        const pos = entity.getComponent<PositionComponent>('position')!;
        const vel = entity.getComponent<VelocityComponent>('velocity')!;

        pos.x += vel.x * deltaTime;
        pos.y += vel.y * deltaTime;
      }
    }
  }
}
```

**Libraries to consider**:
- [bitECS](https://github.com/NateTheGreatt/bitECS) - Ultra-fast, data-oriented
- [ecsy](https://github.com/ecsyjs/ecsy) - Simple, well-documented
- Roll your own (educational, full control)

---

### Event System

**Recommendation**: Typed event emitter for game events.

```typescript
// Type-safe event system
type GameEvents = {
  'player:move': { playerId: string; from: Vec2; to: Vec2 };
  'player:damage': { playerId: string; amount: number; source: string };
  'item:pickup': { playerId: string; itemId: number; quantity: number };
  'screen:transition': { from: [number, number]; to: [number, number] };
};

class EventBus {
  private listeners = new Map<keyof GameEvents, Set<Function>>();

  on<K extends keyof GameEvents>(
    event: K,
    handler: (data: GameEvents[K]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  }
}

// Usage
const bus = new EventBus();
bus.on('player:move', ({ playerId, from, to }) => {
  console.log(`Player ${playerId} moved from ${from} to ${to}`);
});
bus.emit('player:move', { playerId: '123', from: [10, 10], to: [11, 10] });
```

---

### State Management

**Client State**: Zustand (lightweight, TypeScript-friendly)
```typescript
import { create } from 'zustand';

interface GameState {
  player: Player | null;
  currentScreen: [number, number];
  loadedScreens: Map<string, Screen>;
  setPlayer: (player: Player) => void;
  setScreen: (screen: [number, number]) => void;
}

export const useGameStore = create<GameState>((set) => ({
  player: null,
  currentScreen: [0, 0],
  loadedScreens: new Map(),
  setPlayer: (player) => set({ player }),
  setScreen: (screen) => set({ currentScreen: screen }),
}));
```

**Server State**: In-memory + database sync
```typescript
class WorldState {
  private players = new Map<string, Player>();
  private screens = new Map<string, LoadedScreen>();

  // Fast in-memory lookups
  getPlayer(id: string): Player | undefined {
    return this.players.get(id);
  }

  // Periodic save to database
  async persistToDatabase(): Promise<void> {
    for (const [id, player] of this.players) {
      await db.update(players).set(player).where(eq(players.id, id));
    }
  }
}
```

---

## Asset Pipeline

### Conversion Workflow

```
┌─────────────────┐
│  Original .rsc  │ (BMP files)
│  /assets/*.rsc  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Conversion Script      │
│  (Sharp + custom logic) │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Extracted PNGs              │
│  /assets/extracted/*.png     │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  TexturePacker / Custom      │
│  (Create optimized atlases)  │
└────────┬─────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  Final Assets                  │
│  /assets/game/sprites.png      │
│  /assets/game/sprites.json     │
│  /assets/game/tiles.png        │
│  /assets/game/tiles.json       │
└────────────────────────────────┘
```

### Metadata Generation

```typescript
// Generate JSON metadata for tile sheets
interface TileMetadata {
  name: string;
  source: string;
  tileSize: number;
  imageWidth: number;
  imageHeight: number;
  columns: number;
  rows: number;
  tileCount: number;
  tiles: Array<{
    id: number;
    x: number;
    y: number;
    properties?: {
      collision?: boolean;
      animated?: boolean;
      frames?: number[];
    };
  }>;
}

async function generateTileMetadata(
  imagePath: string,
  tileSize: number
): Promise<TileMetadata> {
  const image = sharp(imagePath);
  const metadata = await image.metadata();

  const columns = Math.floor(metadata.width! / tileSize);
  const rows = Math.floor(metadata.height! / tileSize);
  const tileCount = columns * rows;

  const tiles = [];
  for (let i = 0; i < tileCount; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    tiles.push({
      id: i,
      x: col * tileSize,
      y: row * tileSize,
    });
  }

  return {
    name: path.basename(imagePath, path.extname(imagePath)),
    source: imagePath,
    tileSize,
    imageWidth: metadata.width!,
    imageHeight: metadata.height!,
    columns,
    rows,
    tileCount,
    tiles,
  };
}
```

---

## Testing Strategy

### Unit Tests (Jest via stdLibSchema)

```typescript
// /packages/game-client/src/game/world/__tests__/world-manager.spec.ts
import { WorldManager } from '../world-manager';

describe('WorldManager', () => {
  let worldManager: WorldManager;

  beforeEach(() => {
    worldManager = new WorldManager();
  });

  test('should load screen at coordinates', async () => {
    const screen = await worldManager.getScreen(10, 20);
    expect(screen).toBeDefined();
    expect(screen.position).toEqual([10, 20]);
  });

  test('should unload distant screens', () => {
    worldManager.getScreen(0, 0);
    worldManager.getScreen(5, 5); // Far away

    worldManager.setActiveScreen(0, 0);
    worldManager.unloadDistantScreens();

    expect(worldManager.isScreenLoaded(5, 5)).toBe(false);
  });
});
```

### Integration Tests (Playwright via stdLibSchema)

```typescript
// /tests/e2e/game.spec.ts
import { test, expect } from '@playwright/test';

test('player can move across screen', async ({ page }) => {
  await page.goto('http://localhost:8080');

  // Wait for game to load
  await page.waitForSelector('canvas');

  // Simulate key presses
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');

  // Check player position updated
  const playerX = await page.evaluate(() => {
    return (window as any).game.player.x;
  });

  expect(playerX).toBeGreaterThan(320); // Moved right from center
});
```

### Test Coverage Goals
- **Unit Tests**: 80%+ for game logic, systems
- **Integration Tests**: Critical paths (movement, combat, quests)
- **E2E Tests**: Major workflows (character creation, quest completion)

**Leverage stdLibSchema**:
- Jest configuration already set up
- Playwright E2E framework available
- Mutation testing for critical logic

---

## Performance Optimization

### Client-Side

#### 1. Object Pooling
```typescript
// Reuse objects instead of creating/destroying
class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();

  constructor(private factory: () => T, initialSize = 100) {
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory());
    }
  }

  acquire(): T {
    const obj = this.available.pop() ?? this.factory();
    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    this.inUse.delete(obj);
    this.available.push(obj);
  }
}

// Usage for projectiles, effects, etc.
const projectilePool = new ObjectPool(() => new Projectile(), 50);
```

#### 2. Spatial Partitioning
```typescript
// Only check collisions for nearby entities
class QuadTree {
  private readonly MAX_OBJECTS = 10;
  private readonly MAX_LEVELS = 5;

  private objects: Entity[] = [];
  private nodes: QuadTree[] = [];

  insert(entity: Entity): void {
    // Insert into appropriate quad
  }

  retrieve(entity: Entity): Entity[] {
    // Return only nearby entities for collision check
    // Instead of checking all N entities, check only ~log(N)
  }
}
```

#### 3. Delta Time Rendering
```typescript
let lastTime = 0;

function gameLoop(currentTime: number): void {
  const deltaTime = (currentTime - lastTime) / 1000; // seconds
  lastTime = currentTime;

  update(deltaTime); // Physics, AI, etc.
  render();          // Drawing

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

### Server-Side

#### 1. Tick Rate Optimization
```typescript
// Server runs at fixed tick rate (e.g., 20 TPS)
const TARGET_TPS = 20;
const TICK_INTERVAL = 1000 / TARGET_TPS; // 50ms

let lastTick = Date.now();

setInterval(() => {
  const now = Date.now();
  const deltaTime = (now - lastTick) / 1000;
  lastTick = now;

  updateGameState(deltaTime);
  broadcastStateToClients();
}, TICK_INTERVAL);
```

#### 2. Database Query Optimization
```typescript
// Use Drizzle ORM with proper indexing
import { eq, and, between } from 'drizzle-orm';

// Bad: Load all players
const allPlayers = await db.select().from(players);

// Good: Load only nearby players
const nearbyPlayers = await db
  .select()
  .from(players)
  .where(
    and(
      between(players.x, currentScreen.x - 1, currentScreen.x + 1),
      between(players.y, currentScreen.y - 1, currentScreen.y + 1)
    )
  );
```

#### 3. Redis Caching
```typescript
// Cache frequently accessed data (leverage stdLibSchema Redis integration)
import { createClient } from 'redis';

const redis = createClient();

async function getPlayerCached(id: string): Promise<Player> {
  // Check cache first
  const cached = await redis.get(`player:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Load from database
  const player = await db.query.players.findFirst({
    where: eq(players.id, id),
  });

  // Cache for 5 minutes
  await redis.setEx(`player:${id}`, 300, JSON.stringify(player));

  return player;
}
```

---

## Security Considerations

### Client Security (Anti-Cheat)

1. **Never Trust Client**:
   - All critical logic runs on server
   - Client sends inputs, server validates

2. **Validate All Inputs**:
```typescript
// Server-side validation
function handlePlayerMove(playerId: string, direction: Direction): void {
  const player = worldState.getPlayer(playerId);

  // Validate movement is possible
  if (!canPlayerMove(player, direction)) {
    // Kick for cheating?
    console.warn(`Player ${playerId} attempted invalid move`);
    return;
  }

  // Apply movement
  applyMovement(player, direction);
}
```

3. **Rate Limiting**:
```typescript
// Prevent spam/flooding
const rateLimiter = new Map<string, number>();

function checkRateLimit(playerId: string): boolean {
  const now = Date.now();
  const lastAction = rateLimiter.get(playerId) ?? 0;

  if (now - lastAction < 100) { // 100ms between actions
    return false;
  }

  rateLimiter.set(playerId, now);
  return true;
}
```

### Server Security

1. **Authentication**: JWT tokens
2. **SQL Injection**: Use ORM (Drizzle) with parameterized queries
3. **DDoS Protection**: Rate limiting, Cloudflare
4. **Environment Variables**: Never commit secrets
```typescript
// Use dotenv
import 'dotenv/config';

const config = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  redisUrl: process.env.REDIS_URL!,
};
```

---

## Project Management

### Version Control

**Git Workflow**:
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

**Commit Convention**:
```
feat(client): add player movement system
fix(server): resolve screen transition bug
docs(readme): update installation instructions
test(world): add WorldManager unit tests
refactor(ecs): optimize entity component lookup
```

### Milestones

```
v0.1.0 - Foundation (2-4 weeks)
  - Asset conversion pipeline
  - Basic rendering engine
  - Player movement
  - Single screen display

v0.2.0 - World System (3-5 weeks)
  - 256×256 screen addressing
  - Screen transitions
  - Screen loading/unloading
  - Collision detection

v0.3.0 - Map Editor (4-6 weeks)
  - Tile palette
  - Layer system
  - Screen navigation
  - Save/load screens

v0.4.0 - Multiplayer (6-8 weeks)
  - Server infrastructure
  - WebSocket communication
  - Player synchronization
  - Chat system

v0.5.0 - Content (8-12 weeks)
  - Script system
  - Quest framework
  - NPC system
  - Combat system

v1.0.0 - Launch (Cumulative 6-12 months)
  - Polish
  - Testing
  - Performance optimization
  - Documentation
```

### Documentation

**Maintain**:
- **README.md**: Quick start, setup instructions
- **ARCHITECTURE.md**: System design, diagrams
- **API.md**: Server API documentation
- **SCRIPTING.md**: Event system, quest creation guide
- **CHANGELOG.md**: Version history

**Use**:
- TypeDoc for API documentation
- Mermaid diagrams for architecture
- Markdown for guides

---

## Version Control: Jujutsu (jj)

### What is Jujutsu?

**Jujutsu** (jj) is a modern version control system built on Git's storage layer but with a fundamentally different user experience. It addresses many pain points of traditional Git workflows while maintaining full compatibility with GitHub.

**Key Advantages for Game Development**:
- **Automatic tracking**: All changes tracked without explicit `git add`
- **Safe experimentation**: Easy to try different approaches (asset pipelines, rendering engines)
- **No staging area confusion**: Direct from working copy to commits
- **Better conflict resolution**: More intuitive merge workflows
- **First-class change tracking**: Changes are entities, not just diffs
- **Immutable history**: Can't lose work, easy to undo mistakes

### Why Jujutsu for Project ULYSSES?

**Game development characteristics**:
- Large binary assets (.rsc files → converted PNGs)
- Experimental workflows (trying different tile atlases, sprite sheets)
- Frequent branching (testing procedural generation algorithms)
- Collaborative content creation (multiple people editing maps)

**Jujutsu benefits**:
- Better handling of large binary files than pure Git
- Non-linear workflow ideal for iterative game design
- Can experiment freely without branch pollution
- GitHub compatibility maintained (can push to GitHub repo)

### Installation

**Official Installation**: https://jj-vcs.github.io/jj/latest/install-and-setup/

**Quick Install**:
```bash
# macOS
brew install jj

# Linux (Cargo)
cargo install --git https://github.com/martinvonz/jj.git --locked jj-cli

# Windows (Cargo)
cargo install --git https://github.com/martinvonz/jj.git --locked jj-cli

# Verify installation
jj --version
```

### Initial Setup

#### 1. Configure User Identity
```bash
# Set your name and email (same as Git)
jj config set --user user.name "Your Name"
jj config set --user user.email "your.email@example.com"
```

#### 2. Initialize Repository
```bash
# From project directory
cd /home/robby/_produce/oldmain

# Initialize jj repo with git backend (GitHub compatibility)
jj init --git

# This creates:
# - .jj/ directory (jj metadata)
# - .git/ directory (git backend for GitHub)
```

#### 3. Create .jjignore
```bash
# Similar to .gitignore, tells jj what to ignore
cat > .jjignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log
yarn-error.log
.pnpm-debug.log

# Build outputs
dist/
build/
.next/
out/
*.tsbuildinfo

# Testing
coverage/
.nyc_output/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Original assets (large binary files, keep in repo but track separately)
# Note: We DO want these in version control for archival purposes
# assets/original/*.rsc

# Temporary files
*.log
*.tmp
.cache/
EOF
```

### Basic Workflow

#### Creating Changes (No Staging Area!)
```bash
# Just edit files - jj tracks automatically
vim packages/game-client/src/main.ts

# See what changed
jj diff

# Create a commit with description
jj commit -m "Add player movement system"

# Or interactively describe your change
jj describe
# Opens editor: type commit message, save, close
```

#### Viewing History
```bash
# Beautiful commit graph
jj log

# See specific change
jj show <change-id>

# See what's in working copy
jj status
```

#### Branching (Bookmarks in jj terminology)
```bash
# Create bookmark (like git branch)
jj bookmark create feature/map-editor

# List bookmarks
jj bookmark list

# Switch to bookmark
jj new feature/map-editor
# Or: jj edit feature/map-editor

# Delete bookmark
jj bookmark delete feature/old-feature
```

#### Working with GitHub

**Setup Remote**:
```bash
# Add GitHub remote
jj git remote add origin https://github.com/Philoraptor/rpg-game-ulysses.git

# Push to GitHub
jj git push
```

**Pull from GitHub**:
```bash
# Fetch changes from GitHub
jj git fetch

# See what was fetched
jj log

# Integrate changes
jj rebase -d main  # Rebase your changes on top of main
```

**Create Pull Request Workflow**:
```bash
# 1. Create feature bookmark
jj bookmark create feature/asset-pipeline

# 2. Make changes and commit
jj commit -m "Convert .rsc files to PNG format"

# 3. Push to GitHub
jj git push --bookmark feature/asset-pipeline

# 4. Create PR on GitHub web UI
# 5. After review/approval, merge on GitHub
# 6. Fetch and rebase locally
jj git fetch
jj rebase -d main
```

### Advanced Workflows

#### Experiment Safely
```bash
# Create experimental change
jj new -m "Try procedural dungeon generation"

# Make changes, test
# ...

# If experiment failed:
jj abandon <change-id>

# If experiment succeeded:
jj commit -m "Implement procedural dungeon generation"
```

#### Split/Squash Commits
```bash
# Split a commit into two
jj split <change-id>
# Interactively select which changes go in each part

# Squash multiple commits
jj squash --from <change-1> --into <change-2>
```

#### Undo Mistakes (Everything is Recoverable!)
```bash
# Made a mistake? Show operation log
jj op log

# Undo last operation
jj op undo

# Restore to specific operation
jj op restore <operation-id>
```

### Jujutsu vs Git: Quick Comparison

| Operation | Git | Jujutsu |
|-----------|-----|---------|
| **Stage changes** | `git add .` | Not needed (auto-tracked) |
| **Commit** | `git commit -m "msg"` | `jj commit -m "msg"` |
| **View log** | `git log --graph` | `jj log` (prettier default) |
| **Create branch** | `git checkout -b feature` | `jj bookmark create feature` |
| **Switch branch** | `git checkout main` | `jj edit main` |
| **Amend commit** | `git commit --amend` | `jj describe` (edit any change) |
| **Undo mistake** | `git reflog` + `git reset` | `jj op undo` |
| **Push to GitHub** | `git push origin main` | `jj git push` |
| **Pull from GitHub** | `git pull` | `jj git fetch` + `jj rebase` |

### Jujutsu Command Cheat Sheet

**Daily Commands**:
```bash
jj status             # What's in working copy
jj diff               # See changes
jj commit -m "msg"    # Create commit
jj log                # View history
jj new <bookmark>     # Start new change
```

**Bookmarks (Branches)**:
```bash
jj bookmark create <name>      # Create bookmark
jj bookmark list               # List all bookmarks
jj bookmark delete <name>      # Delete bookmark
jj bookmark set <name> -r <id> # Move bookmark to change
```

**GitHub Sync**:
```bash
jj git fetch                   # Get updates from GitHub
jj git push                    # Push to GitHub
jj git push --bookmark <name>  # Push specific bookmark
jj rebase -d main              # Rebase on main
```

**Undo/Restore**:
```bash
jj op log             # Show operation history
jj op undo            # Undo last operation
jj op restore <id>    # Restore to specific operation
jj abandon <id>       # Abandon unwanted change
```

**Inspection**:
```bash
jj show <id>          # Show specific change
jj log -r <id>        # Log for specific change
jj diff -r <id>       # Diff for specific change
```

### Workflow for Project ULYSSES

**Phase 2 (Asset Pipeline)**:
```bash
# 1. Start asset conversion work
jj bookmark create phase-2/asset-pipeline
jj new phase-2/asset-pipeline

# 2. Convert assets, commit incrementally
jj commit -m "Add .rsc to PNG converter"
jj commit -m "Generate tile metadata JSON"
jj commit -m "Create sprite atlases"

# 3. Push to GitHub for backup
jj git push --bookmark phase-2/asset-pipeline

# 4. If something breaks, easy rollback
jj op undo  # Undo last change
```

**Phase 3 (Core Engine)**:
```bash
# 1. Create bookmark for Phaser integration
jj bookmark create phase-3/phaser-setup

# 2. Experiment with rendering approaches
jj new -m "Try Phaser 3 rendering"
# ... test ...
# If it works:
jj commit -m "Integrate Phaser 3 game client"

# 3. Try alternative if first didn't work
jj new -m "Try custom Canvas renderer"
# ... test ...
# If this works better:
jj commit -m "Implement custom Canvas renderer"
# Abandon the Phaser attempt:
jj abandon <phaser-change-id>
```

**Collaboration**:
```bash
# 1. Someone else made changes on GitHub
jj git fetch

# 2. See what they changed
jj log

# 3. Rebase your work on their changes
jj rebase -d main

# 4. Push your changes
jj git push
```

### Integration with GitHub

**GitHub Workflow** (identical to Git):
1. Push branches to GitHub: `jj git push --bookmark feature-name`
2. Create PR on GitHub web interface
3. Review, discuss, approve
4. Merge on GitHub (squash, merge, or rebase)
5. Fetch updates: `jj git fetch`
6. Continue working

**GitHub Actions** (CI/CD):
- Works identically to Git (GitHub sees `.git/` directory)
- All CI/CD workflows trigger normally
- No changes needed to `.github/workflows/` files

### Migrating Between jj and git

**Coexistence**:
- jj and git can coexist in same repo
- `.jj/` and `.git/` both present
- Can use `jj` commands or `git` commands interchangeably
- Useful for gradual adoption

**Use jj for local work, git for GitHub**:
```bash
# Local development with jj
jj commit -m "Add feature"

# Push to GitHub with git (if preferred)
git push origin main

# Or use jj's git bridge
jj git push
```

### Troubleshooting

**Problem**: "jj: command not found"
```bash
# Solution: Install jj
# macOS: brew install jj
# Linux/Windows: cargo install --git https://github.com/martinvonz/jj.git --locked jj-cli
```

**Problem**: "Repository not found"
```bash
# Solution: Initialize jj repository
jj init --git
```

**Problem**: "Divergent bookmarks"
```bash
# Solution: Fetch and rebase
jj git fetch
jj rebase -d main
```

**Problem**: "Made a mistake, want to undo"
```bash
# Solution: Use operation log
jj op log
jj op undo
# Or restore to specific operation:
jj op restore <operation-id>
```

### Resources

**Official Documentation**:
- Install & Setup: https://jj-vcs.github.io/jj/latest/install-and-setup/
- Tutorial: https://jj-vcs.github.io/jj/latest/tutorial/
- FAQ: https://jj-vcs.github.io/jj/latest/FAQ/

**Community**:
- GitHub: https://github.com/martinvonz/jj
- Discord: https://discord.gg/dkmfj3aGQN

### Why Not Git?

**Valid Reasons to Use Git Instead**:
- Team already familiar with Git workflows
- Existing Git tooling/integrations critical to workflow
- Preference for mature, widely-adopted tools

**Jujutsu Advantages for This Project**:
- Clean slate (no existing Git history to migrate)
- Solo/small team (easier to adopt new tool)
- Experimental workflow benefits game development
- Large binary assets (better handling than Git)
- GitHub compatibility maintained (can always fall back to Git)

**Recommendation**: **Use Jujutsu for local development, GitHub for remote hosting**

---

## Summary: Recommended Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Language** | TypeScript 5.x | Type safety, tooling, matches stdLibSchema |
| **Client Runtime** | Browser (Canvas) | Cross-platform, no install |
| **Game Framework** | Phaser 3 | Proven, full-featured, good docs |
| **Server Runtime** | Node.js 20 LTS | JavaScript ecosystem, async I/O |
| **Server Framework** | Fastify 4.x | Fast, TypeScript-friendly |
| **Database** | PostgreSQL 16 | ACID, relational data |
| **Cache** | Redis 7 | Session data, leaderboards (stdLibSchema compatible) |
| **ORM** | Drizzle | Type-safe, modern, performant |
| **Build Tool** | Vite 5.x | Fast HMR, optimized builds |
| **Testing** | Jest + Playwright | Via stdLibSchema infrastructure |
| **Linting** | ESLint + Prettier | Code quality, consistency |
| **State** | Zustand (client) | Lightweight, flexible |
| **Networking** | WebSocket | Real-time, bidirectional |
| **Version Control** | Jujutsu (jj) | Modern VCS, safe experimentation, GitHub compatible |

**Total New Dependencies**: ~20 packages (Phaser, Fastify, Drizzle, etc.)
**Leverage stdLibSchema**: Testing, workflows, schematics, validation

---

**Next**: See `master.md` for complete project roadmap integrating these recommendations.
