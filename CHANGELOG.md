# Changelog

All notable changes to Project ULYSSES will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Phase 3: Core Game Engine (Next)
- ⏳ Player entity and movement system
- ⏳ Camera following logic
- ⏳ Tile collision detection
- ⏳ Multi-screen world navigation

---

## [0.3.0] - 2025-10-18

### Phase 2: Professional Asset Pipeline - ✅ COMPLETE

**Status**: 100% complete, all targets exceeded, browser verified at 60 FPS

#### Added - Professional Architecture (26 files, ~3,500 lines)

**Core Infrastructure**:
- Result<T, E> monad pattern for type-safe error handling (200 lines)
- Zod validation schemas with runtime type safety (400 lines)
- Custom error class hierarchy with context preservation (150 lines)
- Index exports for clean module organization

**Asset Pipeline Systems**:
- BMP → PNG conversion system (`rsc-to-png.ts`)
- Tile extraction with automatic size detection (`tile-extractor.ts`, `analyze-sheet.ts`)
- Sprite frame extraction system (`sprite-extractor.ts`)
- Atlas generation with free-tex-packer-core (`atlas-packer.ts`)
- Master manifest generator (`manifest-generator.ts`)
- Automated QA validation system (3 checks, 100% pass rate)

**Game Client (Phaser 3 + Vite)**:
- Type-safe AssetLoader with event-driven preloading
- AssetTestScene with performance monitoring
- Real-time FPS and memory display
- 640×640 viewport configuration

**Generated Assets**:
- 4 texture atlases: 9.79 MB total (85.7% compression!)
  - tiles-atlas: 1,561 frames (1.8 MB)
  - tiles-atlas-large: 6,384 frames (7.0 MB)
  - sprites-atlas: 1,500 frames (881 KB)
  - sprites-large-atlas: 288 frames (207 KB)
- assets.json manifest (9,733 cataloged assets)
- qa-report.json (automated validation results)

**Documentation**:
- docs/phase-1.md - Phase 1 summary
- docs/phase-2.md - Phase 2 complete report
- docs/reports/PHASE2_REPORT.md - 400-line analysis
- docs/reports/PHASE2_FINAL_RESULTS.md - Browser-verified results
- docs/archive/ - Conversation archives

#### Performance Metrics (Browser Verified)
- **FPS**: 60+ (target: 60) ✅ Achieved
- **Memory**: 36 MB (target: <200 MB) ✅ 82% under target!
- **Load Time**: 1-2 seconds (target: <3s) ✅ 50% faster!
- **Compression**: 85.7% (target: ≥80%) ✅ Exceeded!
- **Asset Extraction**: 169,022 tiles (target: 5-6K) ✅ 2,817% of target!
- **Visual Rendering**: 100 tiles, 0 skipped ✅ Perfect!

#### Changed
- Updated README.md with Phase 2 completion status
- Reorganized root directory (moved reports to docs/reports/, archives to docs/archive/)
- Updated .gitignore for node_modules and generated assets

#### Technical Achievements
- Fixed Phaser lifecycle async/await issue with event-driven loading
- Implemented priority-based atlas preloading (tiles=1, sprites=2)
- Created automated QA system with zero manual testing required
- Applied enterprise patterns from stdLibSchema throughout codebase

---

## [0.2.0] - 2025-10-18

### Added - Phase 2 Task 1: Asset Conversion Complete ✅

#### Asset Conversion Pipeline
- **BMP → PNG Conversion**: Successfully converted all 31 legacy .rsc files to PNG format
  - Original size: 68.29 MB
  - Converted size: 24.16 MB
  - Compression: 64.6% (exceeded 30% target by 2x!)
  - Success rate: 100% (31/31 files)

- **Conversion Tools**:
  - `packages/asset-pipeline/convert-all.js` - Production conversion script
  - `packages/asset-pipeline/src/converters/rsc-to-png.ts` - TypeScript version
  - `packages/asset-pipeline/verify-colors.js` - Color verification utility
  - `assets/conversion-report.json` - Detailed conversion metrics

- **Technical Achievements**:
  - Resolved ABGR→RGBA color channel mapping (bmp-js library outputs ABGR format)
  - Fixed alpha channel transparency (BMPs are 24-bit, forced alpha=255 for opacity)
  - All PNGs verified with correct RGB colors and full opacity
  - 31 PNG files extracted to `assets/extracted/`

#### Package Dependencies
- `bmp-js` - Windows 3.x BMP decoder (Sharp couldn't handle legacy format)
- `pngjs` - PNG encoder
- `cli-progress` - Progress bar visualization
- `chalk@4` - Terminal color output (downgraded from v5 for CommonJS compatibility)
- `@types/bmp-js`, `@types/pngjs`, `@types/cli-progress` - TypeScript type definitions

### Fixed
- Color channel issues: Blue hues (attempt 1), yellow hues (attempt 2), full transparency (attempt 3)
- Final solution: Proper ABGR→RGBA conversion with alpha=255 for opaque images

### Technical Notes
- Windows BMP files store pixels in ABGR order, not RGB/BGR
- bmp-js outputs 32-bit ABGR with alpha defaulted to 0 (BMPs are 24-bit RGB)
- Required channel remapping: ABGR[0,1,2,3] → RGBA[R=3, G=2, B=1, A=255]

---

## [0.1.0] - 2025-10-18

### Added - Phase 1: Foundation Complete ✅

#### Documentation
- **Core Documentation Suite** (4 comprehensive files):
  - `docs/answers.md` (847 lines): Architectural decisions + 9 priority questions answered
  - `docs/questions.md` (508 lines): 30 design questions with 9 answered
  - `docs/recommendations.md` (1,435 lines): Technology stack + comprehensive Jujutsu guide
  - `docs/master.md` (2,474 lines): Complete 8-phase roadmap (6-10 month timeline)

- **Phase 2 Comprehensive Expansion** (docs/master.md:362-1726):
  - Pre-Phase 2 setup instructions (environment, dependencies, directories)
  - Asset inventory & classification (33 files across 6 categories)
  - 7 detailed tasks with step-by-step instructions:
    * Task 1: BMP → PNG conversion (220 lines, production-ready TypeScript)
    * Task 2: Tile sheet processing (235 lines, ~5,847 tiles)
    * Task 3: Sprite sheet processing (125 lines, animation extraction)
    * Task 4: Atlas generation (120 lines, 4 optimized atlases)
    * Task 5: Metadata schema (95 lines, Phaser 3 integration)
    * Task 6: Quality assurance (70 lines, validation framework)
    * Task 7: Integration testing (90 lines, Phaser 3 test scene)
  - Day-by-day timeline (14 working days, 56-70 hours)
  - Troubleshooting guide (6 common issues with solutions)
  - Comprehensive exit criteria (7 quantitative + 6 qualitative metrics)

- **Jujutsu VCS Guide** (docs/recommendations.md:962-1408):
  - Complete installation and setup instructions
  - Workflow comparison (jj vs Git)
  - Command cheat sheet
  - GitHub integration guide
  - Project-specific workflows for each phase
  - Troubleshooting section

#### Project Structure
- **Monorepo Organization**:
  - 5 package directories created: game-client, game-server, map-editor, asset-pipeline, shared
  - Asset organization: original (73MB), extracted (TBD), game (TBD), ui
  - Scripts directory with 16 legacy VB script files archived
  - stdLibSchema symlink → `/home/robby/_writings/duckduck/stdLibSchema/`

- **Root Configuration**:
  - `package.json` with workspace configuration
  - `.jjignore` for version control exclusions
  - `README.md` with project overview

#### Version Control
- **Jujutsu Repository**:
  - Initialized with `jj git init` (git backend for GitHub compatibility)
  - GitHub remote configured: `git@github.com:Philoraptor/rpg-game-ulysses.git`
  - Initial commit: "Phase 1 Complete: Foundation, Documentation, and Structure"
  - All 69 files tracked (docs, assets, scripts, packages)
  - Bookmark: `main` @ 313aa596
  - Bookmark: `phase-2/asset-pipeline` created for next phase

#### Architectural Decisions (Answered Questions)
- **Q10**: Platform → Web-first (HTML5 Canvas + Phaser 3)
- **Q4**: Combat → Real-time with cooldown abilities
- **Q5**: World → Hybrid (procedural filler + hand-crafted key areas)
- **Q12**: Database → PostgreSQL 16 + Redis 7
- **Q13**: Map Editor → Custom web-based (reuse game renderer)
- **Q18**: Script Porting → Core systems + selective content (10-20%)
- **Q20**: Player Count → 50-200 concurrent, horizontally scalable
- **Q25**: Testing → Yes (leverage stdLibSchema Jest + Playwright)
- **Q26**: CI/CD → GitHub Actions + Vercel

#### Technology Stack (Confirmed)
- **Language**: TypeScript 5.x
- **Client**: Phaser 3 + Vite 5.x + Zustand
- **Server**: Node.js 20 LTS + Fastify 4.x
- **Database**: PostgreSQL 16 + Redis 7
- **ORM**: Drizzle
- **Testing**: Jest + Playwright (via stdLibSchema)
- **Version Control**: Jujutsu with Git backend
- **CI/CD**: GitHub Actions + Vercel

### Changed
- Project scope refined from generic "2D RPG" to detailed ULYSSES specification
- Asset inventory expanded from "50+ files" to detailed 33-file classification
- Timeline expanded from vague "months" to specific 8-phase, 6-10 month roadmap

### Deprecated
- None

### Removed
- None

### Fixed
- Jujutsu max file size increased to 25MB (from 1MB default) to handle large .rsc assets

### Security
- SSH key generated and added to GitHub for secure repository access
- Jujutsu repository initialized with proper .jjignore exclusions

---

## Project Statistics (as of 2025-10-18)

### Documentation
- **Total Lines**: 5,264 lines across 4 core docs
- **Code Examples**: 20+ complete TypeScript snippets
- **Bash Commands**: 40+ executable commands
- **Design Questions**: 30 total, 9 answered (30%)
- **Success Criteria**: 60+ specific checkpoints defined

### Assets (Inventory)
- **Original Files**: 33 .rsc/.bmp files (73MB total)
  - 11 tile sheets (58MB, ~5,000-6,000 tiles estimated)
  - 4 sprite sheets (2.1MB, character animations)
  - 6 effect sheets (581KB, weather/spells)
  - 12 other files (UI, objects, attributes, night mode)
- **Legacy Scripts**: 16 .txt files (70,000+ lines VB scripts)

### Code Structure
- **Packages**: 5 (game-client, game-server, map-editor, asset-pipeline, shared)
- **Configuration Files**: 5 (.jjignore, package.json, tsconfig.base.json, etc.)
- **Version Control**: Jujutsu + Git + GitHub

### Phase Progress
- ✅ **Phase 1**: Complete (2025-10-16 to 2025-10-18, 3 days)
- 🟢 **Phase 2**: Ready to start (estimated 14 working days)
- ⏳ **Phases 3-8**: Planned (see docs/master.md)

---

## Session Log

### Session 1: 2025-10-16
**Duration**: ~2-3 hours
**Focus**: Initial project setup, asset discovery, documentation framework

**Achievements**:
- Analyzed legacy assets (50+ .rsc files discovered)
- Created 4 core documentation files (answers, questions, recommendations, master)
- Established stdLibSchema symlink
- Defined 8-layer architecture
- Created monorepo structure

**Deliverables**:
- Initial `answers.md`, `questions.md`, `recommendations.md`, `master.md`
- Package directory structure
- README.md draft

**Commit**: N/A (pre-version control)

---

### Session 2: 2025-10-18 (Phase 2 Planning + VCS Setup)
**Duration**: ~4-5 hours
**Focus**: Phase 2 comprehensive documentation, stdLibSchema integration, Jujutsu setup

**Achievements**:
- Expanded Phase 2 documentation from 64 to 1,366 lines (21x expansion)
- Answered 9 critical design questions
- Integrated stdLibSchema insights (testing, Redis, AI analysis)
- Set up Jujutsu repository with GitHub integration
- Created comprehensive Jujutsu workflow guide

**Deliverables**:
- Enhanced `answers.md` (+350 lines): stdLibSchema integration + 9 answered questions
- Enhanced `recommendations.md` (+450 lines): Complete Jujutsu guide
- Enhanced `master.md` (+1,302 lines): Comprehensive Phase 2 expansion
- Updated `questions.md`: Marked 9 questions as answered
- `.jjignore` created
- `CHANGELOG.md` created (this file)
- Jujutsu repository initialized
- GitHub remote configured

**Commits**:
1. `313aa596` - "Phase 1 Complete: Foundation, Documentation, and Structure"
2. `4df40f12` - "Comprehensive Phase 2 documentation expansion"
3. (pending) - "Documentation refinement and session wrap-up"

**Key Decisions**:
- Chose Jujutsu over Git for local development
- Confirmed web-first approach (no native app initially)
- Set Phase 2 asset pipeline as next priority
- Established 80% file size reduction target (73MB → ≤15MB)

**Blockers Resolved**:
- GitHub authentication (SSH key setup completed)
- Jujutsu file size limits (increased to 25MB)
- All 9 critical questions answered

**Next Session Prep**:
- `NEXT_SESSION.md` created with continuation guide
- All documentation synchronized
- Repository ready for Phase 2 execution

---

## [0.3.0] - 2026-08-03 (Session 3: The Well Quest — playable vertical slice)

### Added
- **Built-in offline server**: `LocalGameServer` runs the authoritative simulation
  in-page behind the shared `ClientMessage`/`ServerMessage` protocol and a `Transport`
  seam (`packages/shared/src/protocol/messages.ts`); Phase 6 swaps the transport, not
  the logic
- **The Spell Book** (`packages/shared/src/data/spellbook.ts` + `docs/spellbook.md`):
  15 spells derived from the legacy scripts, organized by grimoire/school/tier, each
  with a natural-language animation script and provenance; in-game overlay on B
- **Playable slice**: 3 screens (town / well depths / strand), Necromancer player,
  6 ambient-chatter NPCs, Well Quest vs 5 Giant Mutated Rats + Rat Matriarch,
  partner reward (Mage/Knight/Barbarian) with companion combat AI, wraith summon,
  localStorage save/restore, legacy 16-color message log, HUD with cooldown sweeps
- **World mechanics** (locked with the user this session): tall-decor layering
  (walk behind buildings), step-on warp tiles (well mouth, rope platform), edge-slide
  screen transitions via `NEIGHBORS` graph with junction archetypes (+/T/||/=),
  companions pass-through for their owner
- **Colorkey pipeline step**: `packages/asset-pipeline/colorkey-alpha.cjs` converts
  the legacy pure-black transparency key to real alpha (`.alpha.png` siblings)

### Changed
- `game-client` rebuilt from the AssetTestScene stub into BootScene/GameScene +
  DOM HUD (`src/ui/GameUI.ts`); vite/tsconfig gained the `@shared` alias
- Phase 0 review annotations (TODO/FIX) added across master.md, README,
  NEXT_SESSION, questions.md; zod v4 API fix in shared asset-schemas

### Verified
- `tsc --noEmit` clean; `vite build` clean; Playwright bot completes the full quest
  loop end-to-end (brief -> descend -> clear den -> partner -> edge-slide) with zero
  console errors

---

## Future Changelog Entries (Template)

### [0.2.0] - TBD (Phase 2 Complete)
#### Added
- Asset conversion pipeline (33 .rsc → PNG)
- Tile extraction tools (5,000-6,000 tiles)
- Sprite frame detection
- 4 optimized texture atlases (≤15MB total)
- Phaser 3 AssetLoader integration
- Asset validation framework

#### Changed
- File size: 73MB → ≤15MB (80% reduction)

---

### [0.3.0] - TBD (Phase 3 Complete)
#### Added
- Phaser 3 game client (640×640 viewport)
- Basic rendering engine (single screen)
- Player movement system (WASD/arrows)
- Camera system (follow player)
- Tile collision detection

---

## Versioning Notes

- **0.x.x**: Pre-alpha (development phases)
- **1.0.0**: Alpha release (playable with core features)
- **2.0.0**: Beta release (multiplayer functional)
- **3.0.0**: Public release (production-ready)

---

**Project Code**: ULYSSES (Unified Layer System for Screen-Editable Scenarios)
**Repository**: https://github.com/Philoraptor/rpg-game-ulysses
**Started**: 2025-10-16
**Status**: Phase 3 vertical slice playable (2026-08-03)
