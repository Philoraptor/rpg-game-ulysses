# Master Vision Plan: 2D Top-Down RPG Framework

**Project Code**: ULYSSES (Unified Layer System for Screen-Editable Scenarios)
**Initialization**: 2025-10-16 - "Ulysses Stranded on the Beach"
**Status**: ✅ Phase 1 Complete | 🟢 Phase 2 Starting

---

## Executive Summary

This document outlines the complete vision and roadmap for developing a modern 2D top-down RPG game, built upon discovered legacy assets (50+ .rsc sprite files, 70,000+ lines of VB scripts) and enhanced with the stdLibSchema framework's code generation, workflow orchestration, and testing infrastructure.

**Core Specifications**:
- **Display**: 640×640px game viewport, 1024×768 fullscreen with UI
- **Tile System**: 32×32px tiles, 20×20 grid per screen
- **World**: 256×256 screens (65,536 total screens in hexadecimal array 0x00-0xFF)
- **Architecture**: 8-layer modular system (Rendering → Network)
- **Technology**: TypeScript + HTML5 Canvas/Phaser 3 + Node.js/Fastify
- **Framework**: Integrates stdLibSchema for schematics, testing, workflows

**Key Innovation**: Leveraging stdLibSchema's 308-file framework via symlink to accelerate development with proven tools for code generation, validation specs, and agent orchestration.

---

## Table of Contents

1. [Vision & Goals](#vision--goals)
2. [Current State Analysis](#current-state-analysis)
3. [Technical Architecture](#technical-architecture)
4. [Development Phases](#development-phases)
5. [Detailed Roadmap](#detailed-roadmap)
6. [Team & Resources](#team--resources)
7. [Risk Management](#risk-management)
8. [Success Metrics](#success-metrics)
9. [Appendices](#appendices)

---

## Vision & Goals

### The Vision

Create a **modern, web-based 2D top-down MMORPG** that combines:
- **Retro Aesthetic**: Preserve the charm of classic pixel-art RPGs
- **Modern Technology**: Leverage 2025-era web standards, TypeScript, real-time networking
- **Massive World**: 256×256 screen grid = endless exploration potential
- **Developer-Friendly**: Map editor, script system, modding support
- **Community-Driven**: Multiplayer, guilds, player-created content

### Primary Goals

1. **Preserve Legacy**: Honor the original .rsc assets and script design
2. **Modernize Stack**: TypeScript, Canvas/WebGL, Node.js server
3. **Leverage stdLibSchema**: Use framework for rapid development
4. **Enable Creation**: Build map editor for world-building
5. **Support Multiplayer**: Real-time server for 50-200 concurrent players (scalable)
6. **Ensure Quality**: 80%+ test coverage, performance monitoring

### Secondary Goals

- **Modding Support**: Allow community asset packs, custom scripts
- **Cross-Platform**: Web primary, Electron desktop wrapper
- **Monetization Ready**: Architecture supports future F2P/premium model
- **Educational**: Serve as reference for game dev with TypeScript

---

## Current State Analysis

### Discovered Assets (Stranded Inventory)

**Resource Files** (`/home/robby/_produce/oldmain/`):
```
Tiles:       tiles1-6.rsc, tilesground/indoor/outdoor.rsc  (~35MB)
Sprites:     Sprites.rsc, lspritesm.rsc                    (~1.6MB)
Objects:     Objects.rsc, Objectsm.rsc                     (~963KB)
Effects:     Effects.rsc, Rain1/2.rsc, snow.rsc           (~850KB)
Interface:   interface.rsc.bmp, chat/registry dirs        (~1.4MB)
Attributes:  Att1.rsc, Att2.rsc                           (~90KB)
Night Mode:  NIGHT.RSC, NIGHTM.RSC                        (~169KB)

Total:       50+ files, ~73MB raw bitmap data
```

**Script Files**:
```
reference_sheet.txt              447 lines   - API documentation
Remotes_Classic Scripts.txt    70,160 lines - Full script library
darkones_scripts.txt            3,490 lines  - Quest/event scripts
party_script.txt / _2.txt         753 lines  - Party system
boss_encounter.txt                129 lines  - Boss AI example
+ 10 more .txt files with tutorials, templates, etc.
```

**stdLibSchema Framework** (`/home/robby/_produce/oldmain/stdLibSchema/` → `/home/robby/_writings/duckduck/stdLibSchema/`):
```
Source:      /src/ with 308 TypeScript files
Modules:     stdlib, specs, schematics, agents, testing
Build:       npm scripts for dev/prod/test
Testing:     Jest + Playwright + mutation testing
Workflows:   .rumination/workflows/ orchestration system
Validation:  Specs framework for data validation
Cache:       Redis integration for performance
```

### Key Discoveries

1. **`.rsc` files are BMPs**: Confirmed via `file` command - Windows 3.x bitmap format
2. **Tile sizes vary**:
   - tiles1.rsc: 224×7136 (24-bit) = 7 columns × 223 rows
   - Sprites.rsc: 384×4000 (8-bit palette) = animations
3. **VB-style scripting**: Event-driven (JoinMap, UseObj, MonsterDie, etc.)
4. **Equipment slots**: Weapon(0), Shield(1), Armor(2), Helm(3), Ring(4)
5. **Color system**: 16 text colors (0=Black → 15=White)
6. **Map numbering**: Up to 3000 maps referenced in scripts
7. **Player flags**: Persistent storage (e.g., flag 907 for quest completion)

---

## Technical Architecture

### 8-Layer System

```
┌──────────────────────────────────────────────────────────────┐
│ Layer 8: Network / Server Interface                          │
│   - WebSocket communication (ws library)                     │
│   - State synchronization, latency compensation             │
│   - Authentication (JWT), session management                 │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│ Layer 7: Script Engine                                       │
│   - TypeScript event system (replaces VB scripts)            │
│   - Quest logic, NPC behavior, world events                  │
│   - Leverages stdLibSchema schematics for generation         │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│ Layer 6: Entity / Object System                              │
│   - ECS architecture (Entity-Component-System)               │
│   - Players, NPCs, monsters, items                           │
│   - Inventory, equipment, stats                              │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│ Layer 5: Map / World System                                  │
│   - 256×256 screen grid management                           │
│   - Chunk loading (3×3 screen window)                        │
│   - Screen transitions, connections                          │
│   - Collision detection (tile-based)                         │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│ Layer 4: Game State Manager                                  │
│   - Global state (Zustand on client, in-memory on server)    │
│   - Player data, world state, flags                          │
│   - Save/load system, database sync                          │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│ Layer 3: Input Handler                                       │
│   - Keyboard (WASD / Arrow keys)                             │
│   - Mouse (click-to-move, UI interaction)                    │
│   - Touch (mobile support)                                   │
│   - Gamepad (optional future)                                │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│ Layer 2: Tile / Sprite Manager                               │
│   - Asset loading (converted PNG atlases)                    │
│   - Animation system                                         │
│   - Sprite batching, texture management                      │
│   - Effects rendering (weather, spells)                      │
└─────────────────────────┬────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│ Layer 1: Rendering Engine                                    │
│   - HTML5 Canvas 2D or Phaser 3 renderer                     │
│   - Camera system (follow player, screen transitions)        │
│   - Layer rendering (ground, objects, entities, effects, UI) │
│   - 60 FPS target, dirty region optimization                 │
└──────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Language** | TypeScript | 5.x | Type safety, tooling |
| **Client Runtime** | Browser | ES2020+ | Cross-platform |
| **Game Framework** | Phaser 3 | 3.80+ | Rendering, physics, input |
| **Build Tool** | Vite | 5.x | Fast dev server, HMR |
| **Server Runtime** | Node.js | 20 LTS | JavaScript server |
| **Server Framework** | Fastify | 4.x | High-performance HTTP/WS |
| **Database** | PostgreSQL | 16 | Persistent data |
| **Cache** | Redis | 7 | Session, leaderboards |
| **ORM** | Drizzle | Latest | Type-safe queries |
| **Testing** | Jest + Playwright | Via stdLibSchema | Unit + E2E tests |
| **State (Client)** | Zustand | 4.x | Lightweight state |
| **WebSocket** | ws | 8.x | Real-time communication |

### Monorepo Structure

```
/home/robby/_produce/oldmain/
├── packages/
│   ├── game-client/         # Phaser 3 game (Vite + TypeScript)
│   │   ├── src/
│   │   │   ├── game/        # Game logic (ECS, systems)
│   │   │   ├── scenes/      # Phaser scenes
│   │   │   ├── assets/      # Compiled assets
│   │   │   └── main.ts      # Entry point
│   │   ├── public/          # Static files
│   │   └── package.json
│   │
│   ├── game-server/         # Node.js + Fastify server
│   │   ├── src/
│   │   │   ├── api/         # REST endpoints
│   │   │   ├── websocket/   # WebSocket handlers
│   │   │   ├── game-loop/   # Server tick, physics
│   │   │   ├── database/    # Drizzle models, migrations
│   │   │   ├── scripts/     # Event system, quests
│   │   │   └── server.ts    # Entry point
│   │   └── package.json
│   │
│   ├── map-editor/          # Web-based map editor
│   │   ├── src/
│   │   │   ├── editor/      # Tile palette, layers
│   │   │   ├── preview/     # Live map preview
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   ├── asset-pipeline/      # Conversion tools
│   │   ├── src/
│   │   │   ├── converters/  # .rsc → PNG
│   │   │   ├── packers/     # Create atlases
│   │   │   └── generators/  # Metadata JSON
│   │   └── package.json
│   │
│   └── shared/              # Common types, utilities
│       ├── src/
│       │   ├── types/       # Shared interfaces
│       │   ├── protocol/    # Network messages
│       │   ├── constants/   # Game constants
│       │   └── utils/       # Helper functions
│       └── package.json
│
├── assets/                  # Asset files
│   ├── original/            # Original .rsc files (archived)
│   ├── extracted/           # Extracted PNGs
│   ├── game/                # Final compiled atlases
│   │   ├── sprites.png
│   │   ├── sprites.json
│   │   ├── tiles.png
│   │   └── tiles.json
│   └── ui/                  # Interface graphics
│
├── scripts/                 # Original VB scripts (archived)
│   └── legacy/              # .txt script files
│
├── docs/                    # Project documentation
│   ├── answers.md           # Architectural decisions ✅
│   ├── questions.md         # Open questions ✅
│   ├── recommendations.md   # Tech stack guide ✅
│   ├── master.md            # This file ✅
│   └── API.md               # Server API docs (TODO)
│
├── stdLibSchema/            # Symlink → /home/robby/_writings/duckduck/stdLibSchema/
│
├── package.json             # Root workspace config
├── tsconfig.base.json       # Shared TypeScript config
├── .eslintrc.json           # Linting rules
├── .prettierrc              # Code formatting
├── .jjignore                # Jujutsu ignore file
└── README.md                # Quick start guide
```

---

## Version Control

### Jujutsu (jj) Repository

**Chosen VCS**: Jujutsu with Git backend
- **Local**: Use `jj` commands for development
- **Remote**: GitHub at https://github.com/Philoraptor/rpg-game-ulysses
- **Backend**: Git-compatible (can use Git commands if needed)

**Why Jujutsu?**
1. **Safe Experimentation**: Ideal for game development (trying different asset pipelines, rendering approaches)
2. **No Staging Area**: Simpler workflow than Git
3. **Immutable History**: Can't lose work, easy to undo mistakes
4. **GitHub Compatible**: Full integration with GitHub (PR workflow, CI/CD)
5. **Better Binary Handling**: More efficient with large asset files

**Repository State**:
- ✅ Initialized with `jj init --git`
- ✅ GitHub remote configured: `origin = https://github.com/Philoraptor/rpg-game-ulysses.git`
- ✅ Initial commit: "Phase 1 Complete: Foundation, Documentation, and Structure"
- ✅ `.jjignore` created (excludes node_modules, build artifacts, etc.)

**Workflow**:
```bash
# Daily development
jj status              # Check current changes
jj diff                # See what changed
jj commit -m "message" # Commit changes
jj log                 # View history

# Push to GitHub
jj git push            # Push all bookmarks
jj git push --bookmark feature-name  # Push specific bookmark

# Pull from GitHub
jj git fetch           # Fetch updates
jj rebase -d main      # Integrate changes
```

**See**: `docs/recommendations.md` for comprehensive Jujutsu guide (installation, workflows, troubleshooting)

---

## Development Phases

### Phase 1: Foundation & Documentation ✅ **COMPLETE**

**Duration**: Week 1-2 (Completed: 2025-10-18)
**Status**: ✅ Complete

**Objectives**:
- [x] Create stdLibSchema symlink
- [x] Generate core documentation (answers.md, questions.md, recommendations.md, master.md)
- [x] Update answers.md with stdLibSchema insights and priority question answers
- [x] Add comprehensive Jujutsu (jj) workflow to recommendations.md
- [x] Set up organized directory structure
- [x] Archive legacy assets
- [x] Initialize monorepo with workspaces
- [x] Create initial package.json files
- [x] Initialize version control (Jujutsu with git backend)

**Deliverables**:
- ✅ `answers.md` - Architectural decisions + 8 priority questions answered
- ✅ `questions.md` - 30 open questions catalogued with recommendations
- ✅ `recommendations.md` - Technology stack + comprehensive Jujutsu guide
- ✅ `master.md` - Complete roadmap (this document)
- ✅ Asset directory structure (original, extracted, game, ui)
- ✅ Monorepo scaffolding (5 packages initialized)
- ✅ README.md with project overview
- ✅ package.json with workspace configuration
- ✅ Jujutsu repository initialized with GitHub integration

**Exit Criteria**: ✅ ALL COMPLETE
- ✅ All documentation files created and updated
- ✅ Directory structure organized
- ✅ README.md with setup instructions
- ✅ package.json with workspace configuration
- ✅ Version control initialized (jj + GitHub)

---

### Phase 2: Asset Pipeline

**Duration**: Week 2-4
**Status**: ⏳ Pending

**Objectives**:
- Convert .rsc (BMP) files to PNG format
- Extract individual tiles/sprites from sheets
- Generate JSON metadata for each atlas
- Create optimized sprite atlases
- Document asset loading system

**Tasks**:

1. **BMP → PNG Conversion**
   ```typescript
   // /packages/asset-pipeline/src/converters/rsc-to-png.ts
   async function convertAllRsc() {
     const files = await fs.readdir('./assets/original/');
     for (const file of files.filter(f => f.endsWith('.rsc'))) {
       await sharp(`./assets/original/${file}`)
         .png({ compressionLevel: 9 })
         .toFile(`./assets/extracted/${file}.png`);
     }
   }
   ```

2. **Tile Extraction**
   - Parse 32×32 tiles from sheets
   - Generate tile IDs (0-N)
   - Create tile metadata JSON

3. **Sprite Atlas Generation**
   - Combine related sprites
   - Optimize packing (free-tex-packer)
   - Generate frame data

4. **Metadata Schema**
   ```json
   {
     "tiles": {
       "ground": { "path": "tiles-ground.png", "tileSize": 32, "count": 500 },
       "indoor": { "path": "tiles-indoor.png", "tileSize": 32, "count": 300 }
     },
     "sprites": {
       "player": { "path": "sprites-player.png", "frames": 24, "animations": {...} },
       "monsters": { "path": "sprites-monsters.png", "frames": 120 }
     }
   }
   ```

**Deliverables**:
- Conversion scripts in `/packages/asset-pipeline/`
- All .rsc files converted to PNG
- Optimized atlases in `/assets/game/`
- Complete metadata JSON files
- Asset loading documentation

**Exit Criteria**:
- All 50+ .rsc files successfully converted
- Asset size reduced by 30%+ (PNG compression)
- Metadata validated (all tiles/sprites indexed)
- Can load assets in Phaser 3 test scene

---

### Phase 3: Core Game Engine

**Duration**: Week 4-8
**Status**: ⏳ Pending

**Objectives**:
- Set up Phaser 3 game client
- Implement 8-layer architecture
- Basic rendering (single screen)
- Player movement (WASD/arrows)
- Camera system
- Input handling

**Tasks**:

1. **Project Setup**
   - Initialize `/packages/game-client/` with Vite
   - Install Phaser 3, TypeScript, Zustand
   - Configure build pipeline

2. **Layer 1: Rendering Engine**
   ```typescript
   // Phaser scene for game rendering
   class GameScene extends Phaser.Scene {
     create() {
       this.tilemap = this.make.tilemap({ key: 'screen_00_00' });
       this.tileset = this.tilemap.addTilesetImage('tiles', 'tiles-atlas');
       this.groundLayer = this.tilemap.createLayer('ground', this.tileset);
     }
   }
   ```

3. **Layer 2: Tile/Sprite Manager**
   - Asset preloader
   - Sprite animation system
   - Tile rendering

4. **Layer 3: Input Handler**
   - Keyboard input (WASD, arrows)
   - Mouse click-to-move (optional)
   - Input buffering for network

5. **Layer 4: Game State**
   ```typescript
   const useGameStore = create<GameState>((set) => ({
     player: null,
     currentScreen: [0, 0],
     loadedScreens: new Map(),
   }));
   ```

6. **Layer 5: World System (Basic)**
   - Single screen loading
   - Tile collision detection
   - Player position tracking

7. **Layer 6: Entity System (Basic)**
   - Player entity
   - Basic ECS structure
   - Movement component

**Deliverables**:
- Runnable game client at `http://localhost:8080`
- Player can move on a single screen
- Smooth 60 FPS rendering
- Basic collision detection
- Camera follows player

**Exit Criteria**:
- Game boots and loads assets
- Player sprite rendered correctly
- Movement works in all 4 directions
- Collision prevents walking through walls
- No console errors

---

### Phase 4: World & Navigation System

**Duration**: Week 8-12
**Status**: ⏳ Pending

**Objectives**:
- Implement 256×256 screen grid
- Screen-to-screen transitions
- Chunk loading system (3×3 window)
- Multi-layer map support
- Save/load screen data

**Tasks**:

1. **Screen Addressing**
   ```typescript
   class WorldManager {
     private screens = new Map<string, Screen>();

     getScreen(x: number, y: number): Screen {
       const key = this.getScreenKey(x, y);
       if (!this.screens.has(key)) {
         this.loadScreen(x, y);
       }
       return this.screens.get(key)!;
     }

     private getScreenKey(x: number, y: number): string {
       return `${x.toString(16).padStart(2, '0')}_${y.toString(16).padStart(2, '0')}`;
     }
   }
   ```

2. **Screen Transitions**
   - Detect boundary crossing (player.y > 640 → next screen south)
   - Smooth scroll animation vs instant warp
   - Update loaded screen chunks

3. **File Format**
   ```json
   {
     "screen": [10, 20],
     "name": "Forest Path",
     "layers": {
       "ground": [[0,1,2,...], ...],    // 20×20 tile IDs
       "objects": [[0,0,5,...], ...],   // Object IDs (0=empty)
       "collision": [[0,0,1,...], ...], // 0=walkable, 1=blocked
       "events": [[0,0,3,...], ...]     // Script trigger IDs
     },
     "connections": {
       "north": [10, 19],
       "south": [10, 21],
       "east": [11, 20],
       "west": [9, 20]
     },
     "npcs": [{"id": 1, "x": 10, "y": 5, "sprite": 50}],
     "metadata": {"theme": "forest", "music": "forest_ambient.ogg"}
   }
   ```

4. **Chunk Loading Strategy**
   - Load current screen + 8 neighbors (3×3 grid)
   - Unload screens >1 away
   - Async loading with loading indicator

5. **Layer Support**
   - Ground layer (base tiles)
   - Object layer (trees, rocks, furniture)
   - Collision layer (walkable mask)
   - Event layer (script triggers)
   - Overlay layer (roof tiles for buildings)

**Deliverables**:
- Player can navigate between multiple screens
- Seamless screen transitions
- 256×256 coordinate system working
- Screen files save/load correctly
- Memory-efficient chunk management

**Exit Criteria**:
- Navigate from (0,0) to (5,5) smoothly
- Memory usage stable (< 200MB for 9 loaded screens)
- Screen data persists between sessions
- Collision works across screen boundaries

---

### Phase 5: Map Editor

**Duration**: Week 12-18
**Status**: ⏳ Pending

**Objectives**:
- Web-based map editor
- Tile palette selection
- Multi-layer painting
- Screen navigation (256×256 grid)
- Object placement
- Script trigger assignment
- Save/load map files

**UI Components**:

1. **Tile Palette** (left sidebar)
   - Dropdown: Select tileset (ground, indoor, outdoor)
   - Grid display of available tiles (32×32 previews)
   - Click to select tile

2. **Layer Panel** (right sidebar)
   - Tabs: Ground, Objects, Collision, Events
   - Layer visibility toggles
   - Opacity sliders

3. **Canvas** (center)
   - 640×640 editable grid (20×20 tiles)
   - Paint tool (click/drag)
   - Eraser tool
   - Fill tool (bucket fill)
   - Selection tool (copy/paste regions)

4. **Screen Navigator** (top bar)
   - Current screen: (0x0A, 0x14)
   - Arrow buttons: Move to adjacent screen
   - Jump-to input: Go to specific screen
   - Mini-map: Overview of populated screens

5. **Toolbar** (top)
   - New screen, Save, Load
   - Undo/Redo
   - Grid toggle
   - Zoom (for detail work)

**Technology**:
- React or Vanilla TS + Canvas
- Reuse game rendering engine for preview
- IndexedDB for local saves
- Export to JSON format

**Deliverables**:
- Functional map editor at `http://localhost:8081`
- Can create and edit screens
- All layer types supported
- Save/load to JSON files
- Export compatible with game client

**Exit Criteria**:
- Can create a 3×3 screen dungeon
- Tile painting works smoothly
- Collision layer prevents player from walking through walls in game
- Object placement appears correctly in game
- Files load in game client without errors

---

### Phase 6: Server Infrastructure

**Duration**: Week 18-24
**Status**: ⏳ Pending

**Objectives**:
- Node.js + Fastify server
- WebSocket communication
- Player authentication
- Database setup (PostgreSQL + Redis)
- Server-side game loop
- Player synchronization

**Tasks**:

1. **Server Setup**
   ```typescript
   // /packages/game-server/src/server.ts
   import Fastify from 'fastify';
   import websocket from '@fastify/websocket';

   const server = Fastify({ logger: true });
   await server.register(websocket);

   server.register(async (fastify) => {
     fastify.get('/game', { websocket: true }, connectionHandler);
   });

   await server.listen({ port: 3000 });
   ```

2. **Authentication**
   - JWT token system
   - Login/register endpoints
   - Password hashing (bcrypt)

3. **Database Schema** (Drizzle ORM)
   ```typescript
   export const players = pgTable('players', {
     id: uuid('id').primaryKey(),
     username: varchar('username', { length: 32 }).unique(),
     passwordHash: varchar('password_hash', { length: 255 }),
     level: integer('level').default(1),
     x: integer('x').default(10),
     y: integer('y').default(10),
     screenX: integer('screen_x').default(0),
     screenY: integer('screen_y').default(0),
     hp: integer('hp').default(100),
     maxHp: integer('max_hp').default(100),
     createdAt: timestamp('created_at').defaultNow(),
   });
   ```

4. **WebSocket Protocol**
   ```typescript
   type ClientMessage =
     | { type: 'move', direction: 'up' | 'down' | 'left' | 'right' }
     | { type: 'chat', message: string }
     | { type: 'attack', targetId: string };

   type ServerMessage =
     | { type: 'player_moved', playerId: string, x: number, y: number }
     | { type: 'player_joined', player: Player }
     | { type: 'player_left', playerId: string }
     | { type: 'chat_message', from: string, message: string };
   ```

5. **Server Game Loop**
   ```typescript
   const TICK_RATE = 20; // 20 TPS
   const TICK_INTERVAL = 1000 / TICK_RATE;

   setInterval(() => {
     updateAllEntities();
     processMovementQueue();
     checkCollisions();
     broadcastStateUpdates();
   }, TICK_INTERVAL);
   ```

6. **State Synchronization**
   - Client prediction (move immediately)
   - Server validation (confirm or correct)
   - Interpolation for smooth movement

**Deliverables**:
- Running server at `http://localhost:3000`
- Database migrations
- Login/register system
- Multiple clients can connect
- Players see each other move in real-time

**Exit Criteria**:
- 2 players can see each other
- Movement synchronizes correctly
- No desyncs or rubber-banding
- Chat system works
- Server handles 50+ concurrent connections

---

### Phase 7: Script System & Content

**Duration**: Week 24-32
**Status**: ⏳ Pending

**Objectives**:
- Implement event system
- Port core legacy scripts
- Quest framework
- NPC system
- Combat system
- Item/inventory system

**Tasks**:

1. **Event System**
   ```typescript
   interface GameEvent {
     type: EventType;
     trigger: EventTrigger;
     conditions?: EventCondition[];
     actions: EventAction[];
   }

   type EventType =
     | 'JoinMap' | 'PartMap' | 'Map_X_Y'
     | 'UseObj' | 'DropObj' | 'GetObj'
     | 'MonsterDie' | 'PlayerDie' | 'AttackPlayer';

   // Example: Chest opening script
   const chestEvent: GameEvent = {
     type: 'Map_X_Y',
     trigger: { screen: [10, 20], tile: [15, 8] },
     conditions: [
       { type: 'hasItem', itemId: 5 } // Has key
     ],
     actions: [
       { type: 'giveItem', itemId: 100, quantity: 1 },
       { type: 'message', text: 'You found a treasure!', color: 'yellow' },
       { type: 'setFlag', flagId: 500, value: 1 }
     ]
   };
   ```

2. **Quest System**
   ```typescript
   interface Quest {
     id: number;
     name: string;
     description: string;
     requirements: QuestRequirement[];
     objectives: QuestObjective[];
     rewards: QuestReward[];
   }

   // Leverage stdLibSchema for generation
   // schematics .:generate-quest --name=UnderwaterCave
   ```

3. **NPC System**
   - Dialogue trees
   - Shop interface
   - Quest givers
   - Basic AI (pathfinding)

4. **Combat System**
   - Auto-attack (legacy style)
   - Abilities with cooldowns
   - Damage calculation
   - Experience/leveling

5. **Inventory & Items**
   - Draggable inventory UI
   - Equipment slots (weapon, shield, armor, helm, ring)
   - Item stacking
   - Item usage (potions, scrolls)

6. **Script Migration**
   - Port party_script.txt → TypeScript party system
   - Port boss_encounter.txt → Boss AI
   - Port core utility scripts

**Deliverables**:
- Event system handles 10+ event types
- 5 sample quests implemented
- NPCs with dialogue
- Basic combat (player vs monster)
- Full inventory system
- Legacy party system ported

**Exit Criteria**:
- Can complete a simple quest (kill 5 rats, get reward)
- NPCs have dialogue
- Combat feels responsive
- Inventory works (pickup, equip, use items)
- Party invite/join system functional

---

### Phase 8: Polish & Launch

**Duration**: Week 32-40
**Status**: ⏳ Pending

**Objectives**:
- UI/UX polish
- Performance optimization
- Bug fixes
- Testing (unit, integration, E2E)
- Documentation
- Deployment
- Marketing materials

**Tasks**:

1. **Performance**
   - Profiling (Chrome DevTools, Lighthouse)
   - Memory leak detection
   - Optimize render loop
   - Asset lazy loading
   - Database query optimization
   - Redis caching strategy

2. **Testing** (Leverage stdLibSchema)
   - Unit tests: 80%+ coverage
   - Integration tests: API endpoints, WebSocket
   - E2E tests: Playwright (login, move, quest)
   - Load testing: Artillery (100+ concurrent users)

3. **UI/UX**
   - Responsive design (1024×768 fullscreen)
   - Accessibility (keyboard navigation)
   - Sound effects & music
   - Particle effects
   - Loading screens
   - Error handling

4. **Documentation**
   - Player guide (how to play)
   - Developer docs (how to add content)
   - API documentation (TypeDoc)
   - Deployment guide

5. **Deployment**
   - Client: Vercel or Netlify
   - Server: DigitalOcean/AWS/Railway
   - Database: Managed PostgreSQL
   - Redis: Managed instance
   - CI/CD: GitHub Actions

6. **Launch Prep**
   - Beta testing (closed alpha)
   - Bug bash
   - Balancing (XP rates, item drop rates)
   - Content review (10+ hours of gameplay)

**Deliverables**:
- Polished game running at 60 FPS
- Test coverage report
- Deployed to production
- Player/developer documentation
- Launch trailer (optional)

**Exit Criteria**:
- No critical bugs
- Performance targets met (60 FPS, <2s load time)
- 10+ playable hours of content
- Positive feedback from beta testers
- Ready for public release

---

## Detailed Roadmap

### Timeline Overview (6-10 Months)

```
Month 1-2:   Phase 1-2  (Foundation + Asset Pipeline)
Month 2-3:   Phase 3    (Core Engine)
Month 3-4:   Phase 4    (World System)
Month 4-5:   Phase 5    (Map Editor)
Month 5-6:   Phase 6    (Server Infrastructure)
Month 6-8:   Phase 7    (Content & Scripts)
Month 8-10:  Phase 8    (Polish & Launch)
```

### Milestones

| Milestone | Target Date | Description |
|-----------|-------------|-------------|
| **M1: Foundation** | Week 2 | Docs complete, directory structure, monorepo setup |
| **M2: Assets** | Week 4 | All .rsc files converted, atlases generated |
| **M3: Prototype** | Week 8 | Player can move on one screen, 60 FPS |
| **M4: Navigation** | Week 12 | Multi-screen world, transitions working |
| **M5: Editor** | Week 18 | Map editor functional, can create content |
| **M6: Multiplayer** | Week 24 | Server running, players can see each other |
| **M7: Content** | Week 32 | Quests, combat, NPCs implemented |
| **M8: Launch** | Week 40 | Game polished and deployed |

---

## Team & Resources

### Roles (Solo Developer + AI Assistance)

**Developer** (You):
- Project lead
- Architecture decisions
- Content creation (maps, quests)
- Testing & QA

**AI Assistant** (Claude):
- Code generation (leverage stdLibSchema schematics)
- Documentation
- Testing strategy
- Bug fixing assistance
- Architecture guidance

**Community** (Future):
- Beta testers
- Content creators (maps, mods)
- Bug reporters

### Tools & Services

**Development**:
- VS Code / Cursor
- Git / GitHub
- Node.js 20 LTS
- PostgreSQL (local or Docker)
- Redis (local or Docker)

**Deployment** (Phase 8):
- Vercel (client hosting)
- Railway / DigitalOcean (server)
- Managed PostgreSQL
- Managed Redis
- Cloudflare (CDN, DDoS protection)

**Estimated Costs** (Production):
- Domain: $10-15/year
- Server (2GB RAM): $12-20/month
- Database: $7-15/month
- Redis: $5-10/month
- **Total**: ~$30-50/month for small-scale (50-200 concurrent users)

---

## Risk Management

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Performance issues** | High | Medium | Profile early, optimize render loop, use object pooling |
| **Scope creep** | High | High | Stick to roadmap, defer features to v2.0 |
| **Asset quality** | Medium | Low | Legacy assets proven workable, can upgrade later |
| **Multiplayer desyncs** | High | Medium | Client prediction + server validation, thorough testing |
| **Database scaling** | Medium | Low | Start with managed DB, horizontal scaling if needed |
| **Browser compatibility** | Low | Low | Target modern browsers (Chrome, Firefox, Safari) |

### Schedule Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Underestimated complexity** | Medium | Medium | Buffer time in phases, MVP-first approach |
| **Blocked on decisions** | Medium | Low | Document all questions early, prioritize critical decisions |
| **Burnout** | High | Medium | Sustainable pace, celebrate milestones, breaks between phases |
| **Dependency issues** | Low | Low | Lock dependency versions, monorepo reduces external deps |

### Content Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| **Insufficient content** | Medium | Medium | Procedural generation for filler areas, focus on quality over quantity |
| **Balancing issues** | Medium | High | Iterate based on playtesting, adjustable config files |
| **Legal (asset ownership)** | High | Low | Assume original assets are your own or properly licensed |

---

## Success Metrics

### Technical KPIs

- **Performance**: 60 FPS client, <100ms server tick
- **Load Time**: <3 seconds to game start
- **Uptime**: 99%+ server availability
- **Test Coverage**: 80%+ code coverage
- **Memory**: <200MB client, <1GB server (50 users)

### Player KPIs (Post-Launch)

- **DAU**: Daily active users
- **Session Length**: Average playtime per session
- **Retention**: % players returning after 1/7/30 days
- **Conversion**: % completing tutorial, reaching level 10, etc.

### Development KPIs

- **Velocity**: Features completed per week
- **Bug Rate**: Bugs reported vs fixed
- **Documentation**: All systems documented
- **Deployment**: 1-click deploy working

---

## Appendices

### A. Legacy Script API Reference

See `reference_sheet.txt` for complete API (447 lines).

**Key Functions**:
- `PlayerMessage(Player, Message, Color)` - Send message to player
- `GiveObj(Player, ObjectID, Quantity)` - Give item
- `TakeObj(Player, ObjectID, Quantity)` - Remove item
- `PlayerWarp(Player, Map, X, Y)` - Teleport player
- `SetPlayerHP/Energy/Mana(Player, Value)` - Set stats
- `GetPlayerLevel/Name/Guild(Player)` - Get player data
- `HasObj(Player, ObjectID)` - Check inventory
- `GetPlayerFlag(Player, FlagID)` - Get persistent flag
- `SetPlayerFlag(Player, FlagID, Value)` - Set persistent flag

**Events**:
- `JoinMap#` - Player enters map
- `PartMap#` - Player leaves map
- `Map#_X_Y` - Player steps on tile at (X,Y)
- `MonsterDie#` - Monster dies
- `UseObj#` - Player uses item
- `PlayerRegen` - Player regenerates HP/mana

### B. Asset Inventory

See `/assets/original/` for complete list (50+ files).

**Highlights**:
- `tiles1-6.rsc` - 6 major tile sets
- `Sprites.rsc` - Main character sprites
- `Objects.rsc` - Items and objects
- `Effects.rsc` - Spell/weather effects
- `interface.rsc.bmp` - UI elements
- `NIGHT.RSC` - Night-time palette

### C. Technology Alternatives

**If Phaser 3 doesn't meet needs**:
- PixiJS (lighter, more control)
- Custom Canvas engine (most control, most work)
- Three.js (3D option, overkill for 2D)

**If Fastify has issues**:
- Express (slower but more popular)
- Hono (modern, edge-compatible)
- Raw Node.js HTTP (minimal)

**If PostgreSQL is overkill**:
- SQLite (simpler, file-based)
- MongoDB (NoSQL, flexible schema)

### D. Resources & Learning

**Phaser 3**:
- Official Docs: https://photonstorm.github.io/phaser3-docs/
- Examples: https://phaser.io/examples
- Tutorial: "Making Your First Phaser 3 Game"

**Fastify**:
- Docs: https://www.fastify.io/docs/latest/
- Plugins: WebSocket, CORS, JWT

**Drizzle ORM**:
- Docs: https://orm.drizzle.team/docs/overview
- PostgreSQL Guide

**Game Dev Patterns**:
- "Game Programming Patterns" by Robert Nystrom
- ECS Architecture guides

### E. Related Projects

**Inspiration**:
- RuneScape (2D tile-based MMORPG)
- Tibia (classic 2D isometric)
- Stardew Valley (modern pixel art)

**Open Source Examples**:
- Phaser 3 Multiplayer Example
- Node.js WebSocket Game Servers

---

## Conclusion: The Journey Ahead

You are Ulysses, washed ashore with scattered resources: ancient sprite sheets, cryptic scripts, and a powerful framework (stdLibSchema) as your compass. This master plan is your map to transform these fragments into a living, breathing 2D world.

**The Path Forward**:
1. ✅ **You are here**: Foundation laid, documentation complete
2. ⏳ **Next**: Asset pipeline (convert legacy graphics to modern format)
3. 🎯 **Goal**: Playable multiplayer RPG in 6-10 months

**Remember**:
- **Start small**: Single screen → multi-screen → full world
- **Iterate**: Prototype → test → refine → repeat
- **Leverage stdLibSchema**: Use schematics for code generation, specs for validation
- **Document**: Every decision, every API, every system
- **Stay focused**: MVP first, features later

**The adventure begins now.** The beach behind you, the horizon ahead, and a world of 256×256 screens waiting to be brought to life.

---

**Document Version**: 1.0.0
**Last Updated**: 2025-10-16
**Status**: Living Document (update as phases progress)
**Next Review**: End of Phase 1 (Week 2)
