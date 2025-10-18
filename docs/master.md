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

**Duration**: Week 2-4 (~14 working days)
**Status**: 🔄 In Progress (Task 1 Complete ✅)

**High-Level Objectives**:
- ✅ Convert 31 .rsc (BMP) files (~68MB) to optimized PNG format → **24.16 MB (64.6% compression)**
- ⏳ Extract and catalog ~5,000+ individual tiles and sprites
- ⏳ Generate comprehensive JSON metadata for each asset type
- ⏳ Create optimized sprite atlases for Phaser 3
- 🎯 Reduce total asset size by 80% (68MB → ~15MB target)
- ⏳ Document complete asset loading system
- ⏳ Verify all assets loadable and functional in test scene

**Task 1 Results** (Completed 2025-10-18):
- Files converted: 31/31 (100% success)
- Original size: 68.29 MB
- Converted size: 24.16 MB
- Compression: 64.6% (exceeded 30% target!)
- All PNGs verified with correct RGB colors and alpha=255 (opaque)

---

### Pre-Phase 2 Setup

**Before starting asset conversion**, ensure your development environment is properly configured:

#### 1. Environment Verification
```bash
# Verify Node.js version (20+ required)
node --version  # Should show v20.x.x or higher

# Verify npm version (9+ required)
npm --version   # Should show 9.x.x or higher

# Check available disk space (need ~150MB for conversions)
df -h .
```

#### 2. Install Asset Pipeline Dependencies
```bash
# Navigate to asset-pipeline package
cd packages/asset-pipeline

# Initialize package if not already done
npm init -y

# Install Sharp (image processing library)
npm install sharp --save-dev

# Install free-tex-packer-core (atlas generation)
npm install free-tex-packer-core --save-dev

# Install jimp (backup image library, handles edge cases)
npm install jimp --save-dev

# Install cli-progress (progress bars)
npm install cli-progress --save-dev

# Install chalk (colored terminal output)
npm install chalk --save-dev

# Return to project root
cd ../..
```

#### 3. Verify Asset File Integrity
```bash
# Count assets
ls -1 assets/original/*.rsc* | wc -l  # Should show 33

# Check total size
du -sh assets/original/  # Should show ~73M

# Verify all files are readable
file assets/original/*.rsc* | grep -i bitmap  # All should be "PC bitmap"
```

#### 4. Set Up Version Control Workflow
```bash
# Create Phase 2 bookmark
jj bookmark create phase-2/asset-pipeline

# Start working on Phase 2
jj new phase-2/asset-pipeline

# Verify you're on the right bookmark
jj status
```

#### 5. Create Working Directories
```bash
# Ensure all required directories exist
mkdir -p assets/extracted
mkdir -p assets/game/tiles
mkdir -p assets/game/sprites
mkdir -p assets/game/effects
mkdir -p assets/game/ui
mkdir -p packages/asset-pipeline/src/converters
mkdir -p packages/asset-pipeline/src/extractors
mkdir -p packages/asset-pipeline/src/packers
mkdir -p packages/asset-pipeline/src/utils
```

**Exit Criteria for Setup**:
- ✅ Node 20+ and npm 9+ installed
- ✅ All dependencies installed successfully
- ✅ 33 asset files verified as readable BMP format
- ✅ jj bookmark created for Phase 2
- ✅ Directory structure ready

---

### Asset Inventory & Processing Strategy

#### Asset Classification

Our 33 .rsc files break down into 6 categories, each requiring different processing strategies:

| Category | Files | Total Size | Processing Strategy |
|----------|-------|------------|---------------------|
| **Tile Sheets** | 11 files | ~58MB | Grid extraction (32×32 tiles) |
| **Sprite Sheets** | 4 files | ~2.1MB | Frame detection + animation extraction |
| **Object Sheets** | 2 files | ~943KB | Individual object extraction |
| **Effect Sheets** | 6 files | ~581KB | Animation frame extraction |
| **Attributes** | 2 files | ~89KB | Icon extraction (small images) |
| **Night Mode** | 2 files | ~167KB | Palette swap reference |
| **UI/Interface** | 6 files | ~2.8MB | Component extraction |

#### Detailed File Inventory

**Tile Sheets** (Primary Focus - Week 2, Days 1-4):
```
tiles1.rsc       4.6MB   224×7136   (7 cols × 223 rows = 1,561 tiles)
tiles2.rsc      21.0MB   [analyze]  (LARGEST FILE - requires special handling)
tiles3.rsc       4.5MB   [analyze]
tiles4.rsc       5.3MB   [analyze]
tiles5.rsc      19.0MB   [analyze]  (SECOND LARGEST)
tiles6.rsc       1.1MB   [analyze]
tiles.rsc        2.9MB   [analyze]
tilesground.rsc  883KB   [analyze]
tilesindoor.rsc  1.3MB   [analyze]
tilesother.rsc   1.1MB   [analyze]
tilesoutdoor.rsc 1.1MB   [analyze]
```

**Sprite Sheets** (Week 2, Days 5-7):
```
Sprites.rsc      721KB   384×4000   (Character animations)
Spritesm.rsc     188KB   [smaller]  (Minimap sprites?)
lsprites.rsc     865KB   [large]    (Boss/large entity sprites?)
lspritesm.rsc    290KB   [smaller]  (Minimap large sprites?)
```

**Object Sheets** (Week 2, Day 8):
```
Objects.rsc      706KB   32×7520    (235 objects at 32×32)
Objectsm.rsc     237KB   [smaller]  (Minimap objects?)
```

**Effect Sheets** (Week 2, Days 8-9):
```
Effects.rsc      138KB   256×544    (Spell/combat effects)
Effectsm.rsc      69KB   [smaller]
Rain1.rsc        146KB   [animated]
Rain1m.rsc       145KB   [animated]
Rain2.rsc        145KB   [animated]
Rain2m.rsc       145KB   [animated]
snow.rsc         774B    [minimal]  (Snowflake particles?)
snowm.rsc        774B    [minimal]
```

**Attributes** (Week 2, Day 10):
```
Att1.rsc          43KB   [icons]    (Skill/stat icons?)
Att2.rsc          46KB   [icons]
```

**Night Mode** (Week 2, Day 10):
```
NIGHT.RSC        148KB   [palette]  (Night-time color palette)
NIGHTM.RSC        19KB   [palette]
```

**UI/Interface** (Week 2, Days 11-12):
```
interface.rsc.bmp 1.4MB  [800×600]  (Main UI layout)
Tilesm.rsc        975KB  [minimap]  (Minimap tiles?)
```

#### Processing Priority

1. **HIGH PRIORITY** (Blocks development):
   - tiles1-6.rsc, tilesground/indoor/outdoor.rsc → Need for map rendering
   - Sprites.rsc → Need for player character
   - interface.rsc.bmp → Need for UI

2. **MEDIUM PRIORITY** (Needed for features):
   - Objects.rsc → Items and world objects
   - Effects.rsc → Combat and spells
   - lsprites.rsc → Boss encounters

3. **LOW PRIORITY** (Nice to have):
   - "*m.rsc" files (minimap versions)
   - Night mode palettes
   - Weather effects

#### "m" Suffix Investigation

Files ending in "m" (Spritesm.rsc, etc.) are likely **minimap** or **mobile** versions:
- **Hypothesis 1**: Minimap icons (small 8×8 or 16×16 versions)
- **Hypothesis 2**: Mobile/low-res fallbacks
- **Verification**: Analyze dimensions after extraction

**Decision**: Process main files first, handle "m" files in Task 6 (QA) once we understand the format.

---

### Detailed Task Breakdown

**Tasks**:

#### Task 1: BMP → PNG Batch Conversion ✅ COMPLETE

**Goal**: Convert all .rsc BMP files to PNG format with compression optimization.

**Duration**: 4-6 hours (including testing and validation) → **Actual: ~2 hours** (with color debugging)

**Dependencies**: bmp-js + pngjs libraries (Sharp couldn't handle Windows 3.x BMP format)

**Status**: ✅ **COMPLETE** (2025-10-18)
**Actual Results**:
- 31 files converted successfully (31 .rsc files found, not 33 as estimated)
- Original: 68.29 MB → Converted: 24.16 MB
- Compression: 64.6% (exceeded 30% target)
- Color issue resolved: Proper ABGR→RGBA conversion with alpha=255
- Verification: All PNGs display correct RGB colors with full opacity

##### Step 1.1: Create Conversion Script

Create `/packages/asset-pipeline/src/converters/rsc-to-png.ts`:

```typescript
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import cliProgress from 'cli-progress';
import chalk from 'chalk';

interface ConversionResult {
  filename: string;
  originalSize: number;
  convertedSize: number;
  compressionRatio: number;
  success: boolean;
  error?: string;
}

async function convertAllRsc(): Promise<ConversionResult[]> {
  const srcDir = path.join(process.cwd(), 'assets/original');
  const destDir = path.join(process.cwd(), 'assets/extracted');

  // Ensure destination directory exists
  await fs.mkdir(destDir, { recursive: true });

  // Get all .rsc and .bmp files
  const allFiles = await fs.readdir(srcDir);
  const rscFiles = allFiles.filter(f =>
    f.toLowerCase().endsWith('.rsc') || f.toLowerCase().endsWith('.bmp')
  );

  console.log(chalk.blue(`\nFound ${rscFiles.length} asset files to convert\n`));

  // Create progress bar
  const progressBar = new cliProgress.SingleBar({
    format: 'Converting |{bar}| {percentage}% | {value}/{total} | {filename}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
  });

  progressBar.start(rscFiles.length, 0, { filename: 'Starting...' });

  const results: ConversionResult[] = [];

  for (let i = 0; i < rscFiles.length; i++) {
    const file = rscFiles[i];
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, `${file}.png`);

    progressBar.update(i + 1, { filename: file });

    try {
      // Get original file size
      const stats = await fs.stat(srcPath);
      const originalSize = stats.size;

      // Test different compression levels to find optimal
      let bestCompression = 6; // Default
      let smallestSize = Infinity;

      // Quick test: try compression levels 5, 6, 7
      for (const level of [5, 6, 7]) {
        const testBuffer = await sharp(srcPath)
          .png({ compressionLevel: level })
          .toBuffer();

        if (testBuffer.length < smallestSize) {
          smallestSize = testBuffer.length;
          bestCompression = level;
        }
      }

      // Convert with best compression
      await sharp(srcPath)
        .png({ compressionLevel: bestCompression })
        .toFile(destPath);

      const destStats = await fs.stat(destPath);
      const convertedSize = destStats.size;
      const compressionRatio = ((originalSize - convertedSize) / originalSize) * 100;

      results.push({
        filename: file,
        originalSize,
        convertedSize,
        compressionRatio,
        success: true
      });

    } catch (error) {
      results.push({
        filename: file,
        originalSize: 0,
        convertedSize: 0,
        compressionRatio: 0,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  progressBar.stop();

  return results;
}

// Run conversion and report results
convertAllRsc().then(results => {
  console.log(chalk.green('\n\nConversion Complete!\n'));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(chalk.blue('Summary:'));
  console.log(`  Successful: ${successful.length}/${results.length}`);
  console.log(`  Failed: ${failed.length}/${results.length}`);

  const totalOriginal = successful.reduce((sum, r) => sum + r.originalSize, 0);
  const totalConverted = successful.reduce((sum, r) => sum + r.convertedSize, 0);
  const overallRatio = ((totalOriginal - totalConverted) / totalOriginal) * 100;

  console.log(`\n  Original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Converted size: ${(totalConverted / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Compression: ${overallRatio.toFixed(1)}%`);

  if (failed.length > 0) {
    console.log(chalk.red('\n\nFailed conversions:'));
    failed.forEach(f => {
      console.log(`  ${f.filename}: ${f.error}`);
    });
  }

  // Save results to JSON
  fs.writeFile(
    'assets/conversion-report.json',
    JSON.stringify(results, null, 2)
  );

  console.log(chalk.gray('\n  Report saved to assets/conversion-report.json\n'));
});
```

##### Step 1.2: Run Conversion

```bash
# From project root
cd packages/asset-pipeline

# Add run script to package.json
npm pkg set scripts.convert="ts-node src/converters/rsc-to-png.ts"

# Run conversion (takes 2-5 minutes for 73MB)
npm run convert
```

**Expected Output**:
```
Found 33 asset files to convert

Converting |████████████████████| 100% | 33/33 | interface.rsc.bmp

Conversion Complete!

Summary:
  Successful: 33/33
  Failed: 0/33

  Original size: 73.24 MB
  Converted size: 51.18 MB
  Compression: 30.1%

  Report saved to assets/conversion-report.json
```

##### Step 1.3: Verify Conversion

```bash
# Count converted files
ls -1 assets/extracted/*.png | wc -l  # Should show 33

# Check total size
du -sh assets/extracted/  # Should show ~45-55M

# Visual spot check (open a few PNGs)
feh assets/extracted/tiles1.rsc.png  # Linux
open assets/extracted/tiles1.rsc.png  # macOS
```

##### Step 1.4: Handle Edge Cases

**Issue**: Some .rsc files might be 8-bit indexed color (palette-based):
```typescript
// Add to conversion script
const metadata = await sharp(srcPath).metadata();

if (metadata.format === 'bitmap' && metadata.depth === 8) {
  // 8-bit indexed color - expand to RGB before conversion
  await sharp(srcPath)
    .toColorspace('srgb')  // Convert to full RGB
    .png({ compressionLevel: bestCompression })
    .toFile(destPath);
}
```

**Success Criteria** (All Met ✅):
- ✅ All 31 files converted successfully (31/31, 100% success rate)
- ✅ Total size 64.6% smaller (68.29MB → 24.16MB, exceeded 30% target!)
- ✅ No visual artifacts (all colors verified with RGB spectrum + alpha=255)
- ✅ conversion-report.json generated with detailed metrics
- ✅ All PNGs loadable and verified (using verify-colors.js script)

**Actual Achievement**: Exceeded all targets! 64.6% compression vs 30% goal.

---

#### Task 2: Tile Sheet Processing & Extraction

**Goal**: Extract individual 32×32 tiles from 11 tile sheet files, generating ~2,000-4,000 individual tiles.

**Duration**: 8-12 hours (spread over 2-3 days)

**Dependencies**: Task 1 complete (PNGs extracted)

##### Step 2.1: Analyze Tile Sheet Dimensions

Create `/packages/asset-pipeline/src/utils/analyze-sheet.ts`:

```typescript
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function analyzeTileSheet(filename: string) {
  const filePath = path.join(process.cwd(), 'assets/extracted', filename);
  const metadata = await sharp(filePath).metadata();

  const width = metadata.width!;
  const height = metadata.height!;

  // Detect likely tile size (try 32, 16, 64)
  const tileSizes = [32, 16, 64, 24];
  let bestFit = { size: 32, cols: 0, rows: 0, remainder: Infinity };

  for (const tileSize of tileSizes) {
    const cols = Math.floor(width / tileSize);
    const rows = Math.floor(height / tileSize);
    const remainderX = width % tileSize;
    const remainderY = height % tileSize;
    const totalRemainder = remainderX + remainderY;

    if (totalRemainder < bestFit.remainder) {
      bestFit = { size: tileSize, cols, rows, remainder: totalRemainder };
    }
  }

  return {
    filename,
    width,
    height,
    detectedTileSize: bestFit.size,
    cols: bestFit.cols,
    rows: bestFit.rows,
    totalTiles: bestFit.cols * bestFit.rows,
    remainderPixels: bestFit.remainder
  };
}

// Analyze all tile sheets
const tileSheets = [
  'tiles.rsc.png',
  'tiles1.rsc.png',
  'tiles2.rsc.png',
  'tiles3.rsc.png',
  'tiles4.rsc.png',
  'tiles5.rsc.png',
  'tiles6.rsc.png',
  'tilesground.rsc.png',
  'tilesindoor.rsc.png',
  'tilesother.rsc.png',
  'tilesoutdoor.rsc.png',
];

Promise.all(tileSheets.map(analyzeTileSheet)).then(results => {
  console.log('\nTile Sheet Analysis:\n');
  console.table(results);

  const totalTiles = results.reduce((sum, r) => sum + r.totalTiles, 0);
  console.log(`\nTotal tiles across all sheets: ${totalTiles}`);

  fs.writeFile(
    'assets/tile-analysis.json',
    JSON.stringify(results, null, 2)
  );
});
```

Run analysis:
```bash
npm pkg set scripts.analyze="ts-node src/utils/analyze-sheet.ts"
npm run analyze
```

**Example Output**:
```
Tile Sheet Analysis:

┌─────────────────────────┬────────┬────────┬──────────┬──────┬──────┬────────────┐
│ filename                │ width  │ height │ tileSize │ cols │ rows │ totalTiles │
├─────────────────────────┼────────┼────────┼──────────┼──────┼──────┼────────────┤
│ tiles1.rsc.png          │ 224    │ 7136   │ 32       │ 7    │ 223  │ 1561       │
│ tiles2.rsc.png          │ 512    │ 8192   │ 32       │ 16   │ 256  │ 4096       │
│ ...                     │ ...    │ ...    │ ...      │ ...  │ ...  │ ...        │
└─────────────────────────┴────────┴────────┴──────────┴──────┴──────┴────────────┘

Total tiles across all sheets: 5847
```

##### Step 2.2: Extract Individual Tiles

Create `/packages/asset-pipeline/src/extractors/tile-extractor.ts`:

```typescript
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import cliProgress from 'cli-progress';

interface TileExtractionConfig {
  sourceFile: string;
  tileSize: number;
  outputDir: string;
  namePrefix: string;
}

async function extractTiles(config: TileExtractionConfig) {
  const { sourceFile, tileSize, outputDir, namePrefix } = config;

  const srcPath = path.join(process.cwd(), 'assets/extracted', sourceFile);
  const destDir = path.join(process.cwd(), outputDir);

  await fs.mkdir(destDir, { recursive: true });

  const metadata = await sharp(srcPath).metadata();
  const width = metadata.width!;
  const height = metadata.height!;

  const cols = Math.floor(width / tileSize);
  const rows = Math.floor(height / tileSize);
  const totalTiles = cols * rows;

  console.log(`\nExtracting ${totalTiles} tiles from ${sourceFile}...`);

  const progressBar = new cliProgress.SingleBar({});
  progressBar.start(totalTiles, 0);

  let tileId = 0;
  const tileMetadata = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const left = col * tileSize;
      const top = row * tileSize;

      const outputPath = path.join(destDir, `${namePrefix}_${tileId.toString().padStart(4, '0')}.png`);

      await sharp(srcPath)
        .extract({ left, top, width: tileSize, height: tileSize })
        .toFile(outputPath);

      tileMetadata.push({
        id: tileId,
        sourceFile,
        position: { col, row },
        pixels: { left, top },
        outputFile: path.basename(outputPath)
      });

      tileId++;
      progressBar.update(tileId);
    }
  }

  progressBar.stop();

  // Save metadata
  await fs.writeFile(
    path.join(destDir, `${namePrefix}_metadata.json`),
    JSON.stringify({ totalTiles, tileSize, tiles: tileMetadata }, null, 2)
  );

  console.log(`  ✓ Extracted ${totalTiles} tiles to ${outputDir}`);
}

// Extract all tile sheets
async function extractAllTiles() {
  // Based on analysis results, extract each sheet
  await extractTiles({
    sourceFile: 'tiles1.rsc.png',
    tileSize: 32,
    outputDir: 'assets/game/tiles/tileset1',
    namePrefix: 'tile1'
  });

  await extractTiles({
    sourceFile: 'tiles2.rsc.png',
    tileSize: 32,
    outputDir: 'assets/game/tiles/tileset2',
    namePrefix: 'tile2'
  });

  // ... repeat for all tile sheets

  console.log('\n✓ All tile sheets extracted!\n');
}

extractAllTiles();
```

Run extraction:
```bash
npm pkg set scripts.extract-tiles="ts-node src/extractors/tile-extractor.ts"
npm run extract-tiles
```

**Expected Output**:
```
Extracting 1561 tiles from tiles1.rsc.png...
  ✓ Extracted 1561 tiles to assets/game/tiles/tileset1

Extracting 4096 tiles from tiles2.rsc.png...
  ✓ Extracted 4096 tiles to assets/game/tiles/tileset2

...

✓ All tile sheets extracted!
```

##### Step 2.3: Optimize Tile Storage

**Problem**: 5,847 individual PNG files is inefficient (slow loading, many HTTP requests).

**Solution**: Pack tiles into atlases (handled in Task 4).

**For now**: Keep individual tiles for cataloging and review. Will pack into atlases later.

**Success Criteria**:
- ✅ 5,000-6,000 individual tiles extracted
- ✅ Each tile exactly 32×32 pixels (or detected size)
- ✅ Metadata JSON for each tile sheet
- ✅ Visual spot-check confirms tiles are correct
- ✅ tile-analysis.json saved

---

#### Task 3: Sprite Sheet Processing & Animation Extraction

**Goal**: Extract sprite frames and identify animation sequences from 4 sprite sheets.

**Duration**: 6-8 hours

**Dependencies**: Task 1 complete

##### Step 3.1: Analyze Sprite Sheet Structure

Sprites are more complex than tiles:
- **Variable sizes** (not uniform grid)
- **Packed layouts** (sprites arranged for space efficiency)
- **Animation sequences** (frames of walk, attack, etc.)

Create `/packages/asset-pipeline/src/utils/sprite-analyzer.ts`:

```typescript
import sharp from 'sharp';
import Jimp from 'jimp';

async function detectSpriteFrames(filename: string) {
  // Load with Jimp for pixel-level access
  const image = await Jimp.read(`assets/extracted/${filename}`);

  const width = image.getWidth();
  const height = image.getHeight();

  // Detect frames by transparency boundaries
  // Sprites are usually separated by empty (transparent/white) columns
  const frames = [];
  let currentFrame = null;

  for (let x = 0; x < width; x++) {
    let columnHasPixels = false;

    for (let y = 0; y < height; y++) {
      const pixel = image.getPixelColor(x, y);
      const rgba = Jimp.intToRGBA(pixel);

      // Check if pixel is non-transparent and non-white
      if (rgba.a > 0 && (rgba.r < 250 || rgba.g < 250 || rgba.b < 250)) {
        columnHasPixels = true;
        break;
      }
    }

    if (columnHasPixels) {
      if (!currentFrame) {
        currentFrame = { startX: x, endX: x };
      } else {
        currentFrame.endX = x;
      }
    } else if (currentFrame) {
      frames.push(currentFrame);
      currentFrame = null;
    }
  }

  // Detect row boundaries for multi-row sheets
  // (Similar logic for Y axis)

  return frames;
}
```

**Manual Analysis Required**: The VB scripts might have animation frame counts!

Check `scripts/legacy/reference_sheet.txt` for sprite definitions:
```bash
grep -i "sprite\|anim" scripts/legacy/reference_sheet.txt
```

##### Step 3.2: Extract Sprite Frames

Once frame boundaries are detected:

```typescript
async function extractSpriteFrames(config: {
  sourceFile: string;
  frames: Array<{startX: number; endX: number; y: number; height: number}>;
  outputDir: string;
  namePrefix: string;
}) {
  for (let i = 0; i < config.frames.length; i++) {
    const frame = config.frames[i];

    await sharp(`assets/extracted/${config.sourceFile}`)
      .extract({
        left: frame.startX,
        top: frame.y,
        width: frame.endX - frame.startX,
        height: frame.height
      })
      .toFile(`${config.outputDir}/${config.namePrefix}_frame_${i.toString().padStart(3, '0')}.png`);
  }
}
```

##### Step 3.3: Identify Animations

Group frames into animations (walk, attack, idle, etc.):

```typescript
interface SpriteAnimation {
  name: string;
  frames: number[];  // Frame indices
  fps: number;
  loop: boolean;
}

const characterAnimations: SpriteAnimation[] = [
  { name: 'walk_down', frames: [0, 1, 2, 3], fps: 8, loop: true },
  { name: 'walk_up', frames: [4, 5, 6, 7], fps: 8, loop: true },
  { name: 'walk_left', frames: [8, 9, 10, 11], fps: 8, loop: true },
  { name: 'walk_right', frames: [12, 13, 14, 15], fps: 8, loop: true },
  { name: 'attack_down', frames: [16, 17, 18], fps: 12, loop: false },
  // ... etc
];
```

**Success Criteria**:
- ✅ All sprite frames extracted
- ✅ Animation sequences identified (or documented as unknown)
- ✅ Metadata JSON for each sprite sheet
- ✅ Visual review confirms sprites look correct

---

#### Task 4: Atlas Generation & Optimization

**Goal**: Pack extracted tiles and sprites into optimized texture atlases for efficient loading in Phaser 3.

**Duration**: 6-8 hours

**Dependencies**: Tasks 2 & 3 complete (tiles and sprites extracted)

##### Step 4.1: Install Atlas Packer

```bash
cd packages/asset-pipeline
npm install free-tex-packer-core --save-dev
```

##### Step 4.2: Create Atlas Packing Script

Create `/packages/asset-pipeline/src/packers/atlas-packer.ts`:

```typescript
import { packAsync } from 'free-tex-packer-core';
import fs from 'fs/promises';
import path from 'path';

async function packTileAtlas() {
  // Collect all tile PNGs from extracted tiles
  const tileFiles = [];

  for (let i = 1; i <= 6; i++) {
    const tileset = `tileset${i}`;
    const tileDir = `assets/game/tiles/${tileset}`;
    const files = await fs.readdir(tileDir);

    for (const file of files.filter(f => f.endsWith('.png'))) {
      const buffer = await fs.readFile(path.join(tileDir, file));
      tileFiles.push({
        path: file,
        contents: buffer
      });
    }
  }

  // Pack into atlas
  const result = await packAsync(tileFiles, {
    textureName: 'tiles-atlas',
    width: 2048,
    height: 2048,
    fixedSize: false,
    powerOfTwo: true,
    padding: 1,
    extrude: 1,  // Prevent texture bleeding
    allowRotation: false,
    detectIdentical: true,
    allowTrim: false,
    packer: 'MaxRectsBin',
    packerMethod: 'Best',
  });

  // Save atlas image and JSON
  for (const item of result) {
    if (item.name === 'tiles-atlas.png') {
      await fs.writeFile('assets/game/tiles-atlas.png', item.buffer);
    } else if (item.name === 'tiles-atlas.json') {
      // Convert to Phaser format
      const atlas = JSON.parse(item.buffer.toString());
      await fs.writeFile('assets/game/tiles-atlas.json', JSON.stringify(atlas, null, 2));
    }
  }

  console.log('✓ Tile atlas generated');
}

// Similar for sprites, effects, UI
async function packAll() {
  await packTileAtlas();
  await packSpriteAtlas();
  await packEffectsAtlas();
  await packUIAtlas();
}

packAll();
```

##### Step 4.3: Optimize Atlas Settings

**Target Atlas Sizes**:
- **tiles-atlas.png**: 2048×2048 (4MB max) - main terrain tiles
- **sprites-atlas.png**: 1024×1024 (1MB max) - characters, NPCs
- **effects-atlas.png**: 1024×1024 (1MB max) - spells, weather
- **ui-atlas.png**: 1024×1024 (1MB max) - interface elements

**Optimization**:
- Use `powerOfTwo: true` for GPU efficiency
- `extrude: 1` prevents texture bleeding
- `detectIdentical: true` removes duplicate tiles
- `allowTrim: false` keeps tile alignment

##### Step 4.4: Verify Atlas Generation

```bash
# Check generated atlases
ls -lh assets/game/*.png assets/game/*.json

# Expected:
# tiles-atlas.png      ~3.2MB
# tiles-atlas.json     ~45KB
# sprites-atlas.png    ~890KB
# sprites-atlas.json   ~12KB
# ...
```

**Success Criteria**:
- ✅ 4 main atlases generated (tiles, sprites, effects, UI)
- ✅ Total atlas size ≤ 15MB (vs 73MB original = 80% reduction)
- ✅ JSON metadata in Phaser 3 format
- ✅ No duplicate tiles (identified and removed)

---

#### Task 5: Metadata Schema & Asset Manifest

**Goal**: Create comprehensive metadata describing all assets for game engine loading.

**Duration**: 4-6 hours

##### Step 5.1: Design Master Asset Manifest

Create `/assets/game/assets.json`:

```json
{
  "version": "1.0.0",
  "generatedAt": "2025-10-20T12:00:00Z",
  "totalAssets": 5847,
  "atlases": {
    "tiles": {
      "path": "tiles-atlas.png",
      "json": "tiles-atlas.json",
      "size": { "width": 2048, "height": 2048 },
      "tileCount": 4892,
      "tileSize": 32,
      "preload": true,
      "priority": 1
    },
    "sprites": {
      "path": "sprites-atlas.png",
      "json": "sprites-atlas.json",
      "size": { "width": 1024, "height": 1024 },
      "frameCount": 248,
      "preload": true,
      "priority": 2
    },
    "effects": {
      "path": "effects-atlas.png",
      "json": "effects-atlas.json",
      "lazy": true,
      "priority": 3
    },
    "ui": {
      "path": "ui-atlas.png",
      "json": "ui-atlas.json",
      "preload": true,
      "priority": 1
    }
  },
  "animations": {
    "player_walk_down": { "frames": [0, 1, 2, 3], "fps": 8, "loop": true },
    "player_walk_up": { "frames": [4, 5, 6, 7], "fps": 8, "loop": true },
    "player_attack": { "frames": [16, 17, 18], "fps": 12, "loop": false }
  },
  "tileProperties": {
    "0": { "collision": false, "category": "ground" },
    "1": { "collision": true, "category": "wall" },
    "5": { "collision": false, "animated": true, "frames": [5, 6, 7, 8] }
  }
}
```

##### Step 5.2: Generate Phaser 3 Loading Code

Create `/packages/game-client/src/loaders/AssetLoader.ts`:

```typescript
import Phaser from 'phaser';

export class AssetLoader {
  static async preload(scene: Phaser.Scene) {
    // Load asset manifest
    const manifest = await fetch('/assets/game/assets.json').then(r => r.json());

    // Preload atlases with priority 1
    for (const [key, atlas] of Object.entries(manifest.atlases)) {
      if (atlas.preload && atlas.priority === 1) {
        scene.load.atlas(key, atlas.path, atlas.json);
      }
    }

    // Load animations
    scene.load.on('complete', () => {
      this.registerAnimations(scene, manifest.animations);
    });
  }

  static registerAnimations(scene: Phaser.Scene, animations: any) {
    for (const [key, anim] of Object.entries(animations)) {
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers('sprites', { frames: anim.frames }),
        frameRate: anim.fps,
        repeat: anim.loop ? -1 : 0
      });
    }
  }
}
```

**Success Criteria**:
- ✅ assets.json manifest created with all atlases
- ✅ Animation definitions included
- ✅ Tile properties cataloged
- ✅ Phaser 3 loader integration code written

---

#### Task 6: Quality Assurance & Validation

**Goal**: Verify all converted assets are correct and functional.

**Duration**: 4-6 hours

##### Step 6.1: Visual Comparison

Create side-by-side comparison tool:

```bash
# Open original and converted in two windows
feh assets/original/tiles1.rsc &
feh assets/extracted/tiles1.rsc.png &

# Check 10-15 random files visually
```

##### Step 6.2: Automated Validation

Create `/packages/asset-pipeline/src/validators/asset-validator.ts`:

```typescript
import sharp from 'sharp';

async function validateConversion(original: string, converted: string) {
  const [origMeta, convMeta] = await Promise.all([
    sharp(original).metadata(),
    sharp(converted).metadata()
  ]);

  const issues = [];

  // Check dimensions match
  if (origMeta.width !== convMeta.width || origMeta.height !== convMeta.height) {
    issues.push(`Dimension mismatch: ${origMeta.width}×${origMeta.height} vs ${convMeta.width}×${convMeta.height}`);
  }

  // Check file size is reasonable
  const sizeRatio = convMeta.size! / origMeta.size!;
  if (sizeRatio > 1.2) {
    issues.push(`Converted file larger than original (${sizeRatio.toFixed(2)}x)`);
  }

  return { valid: issues.length === 0, issues };
}
```

##### Step 6.3: Load Testing

Test atlas loading performance:

```typescript
console.time('Atlas Load');
const image = await fetch('/assets/game/tiles-atlas.png');
const blob = await image.blob();
console.timeEnd('Atlas Load');  // Target: < 500ms
```

##### Step 6.4: Validation Checklist

- [ ] All 33 .rsc files converted successfully
- [ ] No visual artifacts in converted PNGs
- [ ] All atlases load in < 3 seconds total
- [ ] Tile extraction correct (5,000-6,000 tiles)
- [ ] Sprite frames properly detected
- [ ] Animation metadata accurate
- [ ] File sizes meet targets (≤ 15MB total)
- [ ] No memory leaks during processing
- [ ] Metadata JSON files valid and parseable

**Success Criteria**:
- ✅ 100% of assets pass validation
- ✅ Load time < 3 seconds
- ✅ No visual discrepancies found

---

#### Task 7: Integration Testing with Phaser 3

**Goal**: Create minimal test scene proving all assets load and render correctly.

**Duration**: 6-8 hours

##### Step 7.1: Create Test Scene

Create `/packages/game-client/src/scenes/AssetTestScene.ts`:

```typescript
import Phaser from 'phaser';
import { AssetLoader } from '../loaders/AssetLoader';

export class AssetTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'AssetTestScene' });
  }

  preload() {
    // Load all atlases
    AssetLoader.preload(this);
  }

  create() {
    // Test 1: Render tile grid (20×20 = one screen)
    this.renderTileGrid();

    // Test 2: Display all sprites
    this.displaySprites();

    // Test 3: Play animations
    this.testAnimations();

    // Test 4: Show performance metrics
    this.showMetrics();
  }

  renderTileGrid() {
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 20; col++) {
        const tileId = row * 20 + col;
        this.add.image(col * 32, row * 32, 'tiles', `tile1_${tileId.toString().padStart(4, '0')}.png`);
      }
    }
  }

  displaySprites() {
    const sprite = this.add.sprite(320, 320, 'sprites');
    sprite.play('player_walk_down');
  }

  showMetrics() {
    const text = this.add.text(10, 10, '', { color: '#00ff00', fontSize: '14px' });

    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        text.setText([
          `FPS: ${Math.round(this.game.loop.actualFps)}`,
          `Memory: ${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`
        ]);
      }
    });
  }
}
```

##### Step 7.2: Run Test

```bash
cd packages/game-client
npm run dev

# Open http://localhost:8080
# Should see:
# - 20×20 tile grid rendered
# - Animated player sprite
# - FPS counter showing 60 FPS
# - Memory usage stable
```

##### Step 7.3: Performance Benchmarks

**Targets**:
- **Load time**: < 3 seconds for all atlases
- **FPS**: 60 FPS stable (no drops)
- **Memory**: < 200MB client RAM
- **Asset count**: 4 atlases + manifest loaded

**Success Criteria**:
- ✅ All assets render correctly in Phaser 3
- ✅ 60 FPS maintained
- ✅ No console errors
- ✅ Animations play smoothly
- ✅ Memory usage stable (no leaks)

---

### Phase 2 Timeline

**Detailed Day-by-Day Breakdown** (assumes 4-6 hours/day):

**Week 2: Days 1-2** (Setup + Conversion)
- Day 1: Pre-Setup (environment, dependencies, directories) - 4 hours
- Day 2: Task 1 (BMP → PNG conversion) - 5 hours

**Week 2: Days 3-7** (Tile Processing)
- Day 3: Task 2.1 (Analyze tile sheets) - 3 hours
- Day 4-6: Task 2.2 (Extract 5,847 tiles) - 12 hours
- Day 7: Task 2.3 (Review and organize) - 4 hours

**Week 3: Days 8-10** (Sprite Processing)
- Day 8-9: Task 3.1-3.2 (Sprite detection and extraction) - 10 hours
- Day 10: Task 3.3 (Animation identification) - 4 hours

**Week 3: Days 11-12** (Atlas Generation)
- Day 11: Task 4.1-4.2 (Pack atlases) - 5 hours
- Day 12: Task 4.3-4.4 (Optimize and verify) - 3 hours

**Week 4: Days 13-14** (QA + Integration)
- Day 13: Tasks 5-6 (Metadata + QA) - 6 hours
- Day 14: Task 7 (Integration testing) - 5 hours

**Total**: ~56-70 hours spread over 14 working days (2-4 calendar weeks)

---

### Troubleshooting Common Issues

**Issue 1**: "Sharp installation failed - node-gyp errors"
```bash
# Solution: Install build tools
# Ubuntu/Debian:
sudo apt-get install build-essential libvips-dev

# macOS:
brew install vips

# Then reinstall:
npm install sharp --force
```

**Issue 2**: "Out of memory when processing tiles2.rsc (21MB file)"
```bash
# Solution: Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run extract-tiles
```

**Issue 3**: "Converted PNG looks corrupted/wrong colors"
```typescript
// Solution: Check color space conversion
const metadata = await sharp(srcPath).metadata();
if (metadata.space === 'cmyk') {
  await sharp(srcPath)
    .toColorspace('srgb')
    .toFile(destPath);
}
```

**Issue 4**: "Atlas packing fails - textures don't fit"
```typescript
// Solution: Increase atlas size or create multiple atlases
const result = await packAsync(tileFiles, {
  width: 4096,  // Increase from 2048
  height: 4096,
  allowRotation: true,  // Allow rotation to save space
});
```

**Issue 5**: "Phaser can't load atlas JSON"
```bash
# Solution: Verify JSON format
node -e "JSON.parse(require('fs').readFileSync('assets/game/tiles-atlas.json'))"

# If error, regenerate with correct format
```

**Issue 6**: "Tiles have 1px bleeding/artifacts in game"
```typescript
// Solution: Add extrude padding
const result = await packAsync(tileFiles, {
  extrude: 2,  // Increase from 1
  padding: 2,
});
```

---

### Final Deliverables

**Code**:
- ✅ `/packages/asset-pipeline/` - Complete conversion toolchain
  - `src/converters/rsc-to-png.ts` - BMP to PNG converter
  - `src/extractors/tile-extractor.ts` - Tile extraction
  - `src/extractors/sprite-extractor.ts` - Sprite extraction
  - `src/packers/atlas-packer.ts` - Atlas generation
  - `src/validators/asset-validator.ts` - QA validation
  - `src/utils/analyze-sheet.ts` - Sheet analysis tool

**Assets**:
- ✅ `/assets/extracted/` - 33 PNG files (~45-55MB)
- ✅ `/assets/game/` - 4 optimized atlases (~12-15MB)
  - tiles-atlas.png + tiles-atlas.json
  - sprites-atlas.png + sprites-atlas.json
  - effects-atlas.png + effects-atlas.json
  - ui-atlas.png + ui-atlas.json
- ✅ `/assets/game/assets.json` - Master asset manifest

**Documentation**:
- ✅ conversion-report.json - Conversion statistics
- ✅ tile-analysis.json - Tile sheet analysis
- ✅ Metadata JSON for each atlas

**Game Integration**:
- ✅ `/packages/game-client/src/loaders/AssetLoader.ts`
- ✅ `/packages/game-client/src/scenes/AssetTestScene.ts`

---

### Exit Criteria & Success Metrics

**Quantitative Metrics**:
- ✅ **Conversion Rate**: 100% (33/33 files converted successfully)
- ✅ **File Size Reduction**: ≥ 80% (73MB → ≤15MB)
- ✅ **Asset Count**: 5,000-6,000 tiles + 200-300 sprites extracted
- ✅ **Atlas Count**: 4 main atlases generated
- ✅ **Load Time**: < 3 seconds for all atlases
- ✅ **Performance**: 60 FPS in test scene
- ✅ **Memory**: < 200MB client RAM usage

**Qualitative Criteria**:
- ✅ No visual artifacts or color corruption
- ✅ All tiles/sprites render identically to originals
- ✅ Animations smooth and correct
- ✅ Code well-documented and maintainable
- ✅ Scripts reusable for future asset updates
- ✅ Phaser 3 integration working

**Phase Completion Checklist**:
- [ ] Pre-Setup: Environment configured, dependencies installed
- [ ] Task 1: All 33 .rsc files converted to PNG
- [ ] Task 2: 5,000-6,000 tiles extracted and cataloged
- [ ] Task 3: Sprite frames extracted, animations identified
- [ ] Task 4: 4 atlases generated and optimized
- [ ] Task 5: Complete metadata and manifest created
- [ ] Task 6: QA validation passed (100% assets verified)
- [ ] Task 7: Phaser 3 test scene working at 60 FPS
- [ ] Documentation: All reports and metadata generated
- [ ] Version Control: Changes committed to jj repository
- [ ] Ready for Phase 3: Core game engine development

**Sign-Off Required**:
When all checkboxes are complete, Phase 2 is officially done and Phase 3 (Core Game Engine) can begin!

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
