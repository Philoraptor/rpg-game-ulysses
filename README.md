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

**Phase 1: Foundation & Documentation** ✅ **COMPLETE** (2025-10-16 to 2025-10-18)
- [x] 4 comprehensive documentation files (5,264 lines total)
- [x] 9 critical design questions answered
- [x] Directory structure organized (5 packages)
- [x] stdLibSchema symlink created (308 files integrated)
- [x] Monorepo initialized with workspaces
- [x] Jujutsu version control initialized
- [x] GitHub repository created and configured
- [x] Comprehensive Phase 2 roadmap (1,366 lines, 7 detailed tasks)

**Phase 2: Asset Pipeline** 🟢 **READY TO START** (Estimated: 14 working days)
- [ ] Pre-setup: Install dependencies (Sharp, free-tex-packer, jimp)
- [ ] Task 1: Convert 33 .rsc (BMP) files to PNG (~4-6 hours)
- [ ] Task 2: Extract ~5,000-6,000 tiles from 11 tile sheets (~8-12 hours)
- [ ] Task 3: Extract sprite frames and animations (~6-8 hours)
- [ ] Task 4: Generate 4 optimized texture atlases (≤15MB total) (~6-8 hours)
- [ ] Task 5: Create asset manifest and metadata (~4-6 hours)
- [ ] Task 6: Quality assurance validation (~4-6 hours)
- [ ] Task 7: Phaser 3 integration testing (~6-8 hours)

**Phase 3: Core Game Engine** ⏳ **UPCOMING** (Week 4-8)
- [ ] Set up Phaser 3 client with Vite
- [ ] Implement 8-layer architecture
- [ ] Player movement on single screen (WASD/arrows)
- [ ] Camera system (follow player)
- [ ] Basic collision detection

**Progress**: 1/8 phases complete (12.5%), on track for 6-10 month timeline

---

## Documentation

- **[Master Plan](./docs/master.md)** (2,474 lines) - Complete 8-phase roadmap with detailed Phase 2 expansion
- **[Answers](./docs/answers.md)** (847 lines) - Architectural decisions + 9 priority questions answered
- **[Questions](./docs/questions.md)** (508 lines) - 30 design questions (9 answered, 21 deferred)
- **[Recommendations](./docs/recommendations.md)** (1,435 lines) - Technology stack + comprehensive Jujutsu guide
- **[Changelog](./CHANGELOG.md)** - Project progress and version history

**Total Documentation**: 5,264 lines + 20 code examples + 40 executable commands

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

**Original Legacy Assets** (catalogued 2025-10-16):
- **33 .rsc/.bmp files** (~73MB total)
  - 11 tile sheets (58MB) → ~5,000-6,000 tiles estimated
  - 4 sprite sheets (2.1MB) → character animations
  - 6 effect sheets (581KB) → weather, spells
  - 12 other files → objects, UI, attributes, night mode
- **16 VB script files** (70,000+ lines)
  - Event system, quest logic, party system
  - Reference API documentation (447 lines)

**Conversion Target** (Phase 2):
- ✅ 33 PNGs (~45-55MB, 30% reduction)
- ✅ 4 optimized atlases (~12-15MB, 80% reduction)
- ✅ Complete metadata JSON + Phaser 3 integration
- ✅ Load time: < 3 seconds, 60 FPS performance

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

**Timeline**: 6-10 months to v1.0.0 (Target: Mid-2025)

---

## Version Control

**Jujutsu (jj)** with Git backend for GitHub compatibility

```bash
# Check status
jj status

# View commit history
jj log

# Commit changes
jj commit -m "Your message"

# Push to GitHub
jj git push
```

**Repository**: https://github.com/Philoraptor/rpg-game-ulysses

See [`docs/recommendations.md`](./docs/recommendations.md#version-control-jujutsu-jj) for complete Jujutsu guide.

---

## Contributing

This project is in active development. Contributions welcome once foundation is complete (Phase 2+).

**Development Workflow**:
1. Fork the repository on GitHub
2. Create a feature bookmark: `jj bookmark create feature/your-feature`
3. Make changes and commit: `jj commit -m "Add feature"`
4. Push to GitHub: `jj git push --bookmark feature/your-feature`
5. Create pull request on GitHub

---

## License

MIT

---

## Acknowledgments

- Original assets and scripts from legacy VB system
- [stdLibSchema](https://github.com/Philoraptor/stdLibSchema) - Framework for schematics, testing, and workflows
- Phaser 3 game framework
- Jujutsu version control system
- TypeScript and Node.js ecosystems

---

## Project History

**Session 1** (2025-10-16): "Ulysses Stranded on the Beach"
- Discovered 33 legacy asset files (73MB)
- Created initial documentation framework
- Established project vision and 8-phase roadmap

**Session 2** (2025-10-18): "The Shipwreck Becomes a Base Camp"
- Expanded Phase 2 documentation (64 → 1,366 lines)
- Answered 9 critical design questions
- Set up Jujutsu version control + GitHub integration
- Created comprehensive Jujutsu workflow guide
- Ready to begin Phase 2 asset pipeline execution

---

**"The shipwreck has become a base camp. The maps are drawn, supplies are organized, and the path forward is clear."**

**Status**: Phase 1 ✅ Complete | Phase 2 🟢 Ready | Repository 🔗 Live

*Last updated: 2025-10-18*
