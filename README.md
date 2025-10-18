# Project ULYSSES

**Unified Layer System for Screen-Editable Scenarios**

A modern 2D top-down RPG game built with TypeScript, HTML5 Canvas/Phaser 3, and Node.js.

---

## Overview

- **Game Viewport**: 640×640 pixels (20×20 grid of 32×32 tiles)
- **World Size**: 256×256 screens (65,536 total screens)
- **Architecture**: 8-layer modular system
- **Technology**: TypeScript + Phaser 3 + Node.js + Fastify + PostgreSQL + Redis
- **Framework Integration**: Leverages [stdLibSchema](./stdLibSchema/) for code generation, testing, and workflows

---

## Project Structure

```
/oldmain/
├── packages/              # Monorepo packages
│   ├── game-client/      # Phaser 3 game client (browser)
│   ├── game-server/      # Node.js + Fastify server
│   ├── map-editor/       # Web-based map editor
│   ├── asset-pipeline/   # Asset conversion tools
│   └── shared/           # Shared types and utilities
├── assets/               # Game assets
│   ├── original/         # Original .rsc files (50+ files, ~73MB)
│   ├── extracted/        # Extracted PNGs
│   ├── game/             # Final optimized atlases
│   └── ui/               # Interface graphics
├── scripts/              # Legacy VB scripts (archived)
├── docs/                 # Project documentation
│   ├── answers.md        # Architectural decisions
│   ├── questions.md      # Open design questions
│   ├── recommendations.md # Technology stack guide
│   └── master.md         # Complete project roadmap
├── stdLibSchema/         # Symlink to framework (308 TypeScript files)
└── package.json          # Root workspace configuration
```

---

## Quick Start

### Prerequisites

- Node.js 20+ LTS
- npm 9+
- PostgreSQL 16+ (for server)
- Redis 7+ (for server)

### Installation

```bash
# Install dependencies for all packages
npm install

# Convert legacy assets (Phase 2)
npm run convert:assets

# Run development servers
npm run dev:all
```

### Development Workflows

```bash
# Client only (http://localhost:8080)
npm run dev:client

# Server only (http://localhost:3000)
npm run dev:server

# Map editor (http://localhost:8081)
npm run dev:editor

# Build all packages
npm run build

# Run tests
npm run test

# Lint and format
npm run lint:fix
npm run format
```

---

## Current Status

**Phase 1: Foundation** ✅ **COMPLETE**
- [x] Documentation files generated
- [x] Directory structure organized
- [x] stdLibSchema symlink created
- [x] Monorepo initialized

**Phase 2: Asset Pipeline** ⏳ **NEXT**
- [ ] Convert .rsc (BMP) files to PNG
- [ ] Generate sprite atlases
- [ ] Create metadata JSON files

**Phase 3: Core Engine** ⏳ **UPCOMING**
- [ ] Set up Phaser 3 client
- [ ] Implement 8-layer architecture
- [ ] Player movement on single screen

---

## Documentation

- **[Master Plan](./docs/master.md)** - Complete project roadmap and vision
- **[Answers](./docs/answers.md)** - Architectural decisions and solutions
- **[Questions](./docs/questions.md)** - Open design questions (30 questions catalogued)
- **[Recommendations](./docs/recommendations.md)** - Technology stack and best practices

---

## Key Features (Planned)

- ✅ **Massive World**: 256×256 screen grid (65,536 explorable screens)
- ✅ **Retro Aesthetic**: Preserved pixel art from legacy .rsc assets
- ✅ **Multiplayer**: Real-time server with WebSocket (50-200+ concurrent players)
- ✅ **Map Editor**: Web-based tool for creating content
- ✅ **Script System**: TypeScript event-driven system (replaces legacy VB scripts)
- ✅ **8-Layer Architecture**: Modular, testable, scalable

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Language** | TypeScript 5.x | Type safety, modern tooling |
| **Client** | Phaser 3 + Vite | Game rendering, input, physics |
| **Server** | Node.js 20 + Fastify | High-performance backend |
| **Database** | PostgreSQL 16 | Persistent player data |
| **Cache** | Redis 7 | Session management, leaderboards |
| **ORM** | Drizzle | Type-safe database queries |
| **Testing** | Jest + Playwright | Unit and E2E tests (via stdLibSchema) |
| **Build** | Vite | Fast HMR, optimized production builds |

---

## Assets

**Original Legacy Assets** (discovered 2025-10-16):
- 50+ .rsc files (~73MB total)
- Tiles, sprites, objects, effects, UI
- 70,000+ lines of VB scripts
- Reference API documentation

**Conversion Status**:
- ⏳ Pending - Phase 2 will convert to modern PNG atlases

---

## Development Phases

1. **Phase 1**: Foundation & Documentation (Week 1-2) ✅
2. **Phase 2**: Asset Pipeline (Week 2-4) ⏳
3. **Phase 3**: Core Game Engine (Week 4-8)
4. **Phase 4**: World & Navigation (Week 8-12)
5. **Phase 5**: Map Editor (Week 12-18)
6. **Phase 6**: Server Infrastructure (Week 18-24)
7. **Phase 7**: Script System & Content (Week 24-32)
8. **Phase 8**: Polish & Launch (Week 32-40)

**Timeline**: 6-10 months to v1.0.0

---

## Contributing

This project is in active development. Contributions welcome once foundation is complete (Phase 2+).

---

## License

MIT

---

## Acknowledgments

- Original assets and scripts from legacy system
- [stdLibSchema](https://github.com/yourusername/stdLibSchema) - Framework for schematics, testing, and workflows
- Phaser 3 community
- TypeScript ecosystem

---

**"You are Ulysses, stranded on the beach with scattered resources. The journey to build a world begins now."**

*Session initialized: 2025-10-16*
