# Questions: Open Design Decisions

**Project**: Unnamed 2D Top-Down RPG
**Session**: Initialization - "Ulysses Stranded"
**Date**: 2025-10-16

---

## Table of Contents
1. [Game Design Questions](#game-design-questions)
2. [Technical Architecture Questions](#technical-architecture-questions)
3. [Asset & Content Questions](#asset--content-questions)
4. [Multiplayer & Networking Questions](#multiplayer--networking-questions)
5. [Development Workflow Questions](#development-workflow-questions)
6. [Monetization & Distribution Questions](#monetization--distribution-questions)

---

## Game Design Questions

### 🎮 Core Mechanics

**Q1: What is the primary gameplay loop?**
- [ ] Exploration-focused (discover all 65,536 screens)
- [ ] Combat-focused (level up, defeat bosses)
- [ ] Social-focused (guilds, parties, trading)
- [ ] Quest-focused (story-driven progression)
- [ ] Sandbox (player-driven economy, building)

**Decision Impact**: Determines which systems to prioritize in development.

---

**Q2: What is the player progression system?**
- [ ] Classic RPG leveling (XP → levels → stats)
- [ ] Skill-based (improve by using: combat skills, crafting, etc.)
- [ ] Hybrid (levels + skill trees)
- [ ] Classless (all players can do everything)
- [ ] Class-based (warrior, mage, rogue, etc.)

**Evidence from scripts**: reference_sheet.txt mentions `GetPlayerLevel`, `SetPlayerClass`, suggesting class-based system.

**Recommendation**: Start with classic class-based system (proven model from legacy scripts).

> **FIX (2026-08-03 review):** Q2 is now ANSWERED by user direction: **class-based**.
> Player class: **Necromancer**. Companion classes: **Mage, Knight, Barbarian** (earned
> via the Well Quest). Legacy scripts corroborate (Mage/Darkmage gated spells). Move this
> to answers.md on next doc pass.

---

**Q3: Is permadeath a feature?**
- [ ] No permadeath (respawn at checkpoint)
- [ ] Optional hardcore mode
- [ ] Permadeath with legacy system (items dropped on death)
- [ ] Temporary death penalty (XP loss, stat debuff)

**Script evidence**: `PlayerResurrect` event suggests respawn system.

---

**Q4: What is the combat system?**
- [ ] Real-time action (player skill-based)
- [ ] Turn-based
- [ ] Auto-attack with abilities (like classic MMORPGs)
- [ ] Hybrid (real-time movement, cooldown abilities)

**Legacy system**: Scripts show `AttackPlayer`, `AttackMonster` events, suggesting auto-attack model.

---

### 🌍 World Design

**Q5: How is the 256×256 world populated?**
- [ ] Fully hand-crafted (65,536 screens designed manually)
- [ ] Procedurally generated with hand-crafted key locations
- [ ] Tile-based procedural generation
- [ ] Template-based (create reusable screen templates)
- [ ] Community-created (map editor for players)

**Constraints**: 65,536 screens is too many for manual design.

**Recommendation**: Procedural generation for wilderness/dungeons + hand-crafted towns/quest areas.

---

**Q6: Are there multiple continents/dimensions?**
- [ ] Single 256×256 world map
- [ ] Multiple world maps (Overworld, Underworld, etc.)
- [ ] Instanced dungeons separate from world map
- [ ] Seamless transitions between dimensions

**Decision Impact**: Affects world file format and screen addressing system.

---

**Q7: What is the scale of screen density?**
- [ ] Every screen is accessible (256×256 = 65,536 screens)
- [ ] Many screens are "void" (ocean, impassable mountains)
- [ ] Sparse world (100-1000 actual playable screens)

**Resource impact**: Full 65,536 screens = ~320MB if 5KB per screen file.

---

### 🎨 Visual Style

**Q8: What art style should the game have?**
- [ ] Preserve retro aesthetic (keep original .rsc pixel art)
- [ ] Upgrade to HD sprites (maintain style, increase resolution)
- [ ] Complete visual overhaul (modern pixel art)
- [ ] Mixed (retro game, modern UI)

**Current assets**: 32×32 tiles, 8-bit and 24-bit color BMP sprites.

**Recommendation**: Start with preserved retro aesthetic, allow future theming/modding.

---

**Q9: Should we support multiple visual themes?**
- [ ] Single fixed theme
- [ ] Day/night cycle (time-based lighting)
- [ ] Weather effects (rain, snow from .rsc files)
- [ ] Seasonal variations
- [ ] Player-selectable themes/filters

**Assets available**: Rain1.rsc, Rain2.rsc, snow.rsc, NIGHT.RSC, NIGHTM.RSC

**Recommendation**: Implement day/night + weather from existing assets.

---

## Technical Architecture Questions

### 💻 Platform & Deployment

**Q10: What platforms should the game target?**
- [ ] Web-only (browser-based, HTML5)
- [ ] Desktop (Electron wrapper for web version)
- [ ] Native desktop (separate builds for Windows/Mac/Linux)
- [ ] Mobile (responsive design for touch)
- [ ] All platforms (progressive web app)

**Recommendation**: Start with web (lowest barrier to entry), add Electron wrapper later.

---

**Q11: Should the game be client-server or P2P?**
- [ ] Authoritative server (prevents cheating, better for MMO)
- [ ] Client-side (single-player focus, optional multiplayer)
- [ ] Hybrid (client prediction + server validation)
- [ ] P2P mesh network (decentralized)

**Legacy system**: VB scripts suggest server-authoritative model (server-side scripting).

**Recommendation**: Authoritative server using Node.js + TypeScript (matches stdLibSchema stack).

> **FIX (2026-08-03 review):** Q11 ANSWERED with a refinement: authoritative simulation,
> but hosted **in-page as a built-in offline server** (`LocalGameServer` behind a
> `Transport` interface). Client-server discipline is preserved from day one; the network
> hop is added later without touching game logic.

---

**Q12: What database should store world/player data?**
- [ ] PostgreSQL (relational, robust)
- [ ] MongoDB (document-based, flexible schema)
- [ ] Redis (in-memory, fast, used by stdLibSchema)
- [ ] SQLite (embedded, simple)
- [ ] Hybrid (Redis for session data, PostgreSQL for persistence)

**stdLibSchema**: Has Redis integration (see REDIS_INTEGRATION_SUMMARY.md).

**Recommendation**: Redis + PostgreSQL hybrid (leverage existing stdLibSchema integration).

---

### 🔧 Development Tools

**Q13: Should we build a custom map editor or use existing tools?**
- [ ] Custom web-based editor (integrated with game)
- [ ] Desktop app (Electron-based)
- [ ] Use existing editor (Tiled Map Editor) + custom import
- [ ] In-game editor (edit while playing)

**Requirements**:
- Paint tiles from palette
- Layer support (tiles, collision, objects, scripts)
- Screen navigation (256×256 grid)
- Live preview

**Recommendation**: Custom web-based editor (can reuse game rendering engine).

---

**Q14: How should scripts/events be authored?**
- [ ] TypeScript code files (requires programming knowledge)
- [ ] Visual scripting (node-based editor)
- [ ] JSON configuration (data-driven)
- [ ] Domain-specific language (custom scripting language)
- [ ] Hybrid (JSON for simple, TypeScript for complex)

**Legacy system**: VB scripts are text-based code.

**Recommendation**: Start with TypeScript + JSON, add visual scripting in Phase 2.

---

## Asset & Content Questions

### 🖼️ Asset Management

**Q15: Should original .rsc files be preserved in final build?**
- [ ] Yes, keep as historical artifacts
- [ ] No, convert and discard originals
- [ ] Keep in separate "legacy" branch/archive

**Current state**: 50+ files, ~73MB total.

**Recommendation**: Archive originals in `/scripts/legacy/`, use converted assets in production.

---

**Q16: How should sprite animations be handled?**
- [ ] Sprite sheets with JSON metadata (frame positions)
- [ ] Individual PNG files per frame
- [ ] Animated sprite format (GIF, WebP)
- [ ] Custom binary format (optimized)

**Sprites.rsc**: 384×4000px suggests vertical strip format (possibly 100+ frames).

**Recommendation**: Extract to sprite sheets with JSON metadata (industry standard).

---

**Q17: Should the game support modding?**
- [ ] Full modding support (custom assets, scripts)
- [ ] Limited modding (cosmetic only)
- [ ] No modding (closed system)
- [ ] Community workshop (curated mods)

**Impact**: Affects file format choices, asset loading system.

**Recommendation**: Design with modding in mind from start (easier than retrofitting).

---

### 📜 Content Creation

**Q18: How much of the legacy script content should be ported?**
- [ ] None (fresh start, legacy as reference only)
- [ ] Core systems only (party, guilds, basic events)
- [ ] Selective port (best quests/features)
- [ ] Complete port (70,000+ lines from Remotes_Classic Scripts.txt)

**Effort**: Full port = months of work, likely has obsolete content.

**Recommendation**: Port core systems + cherry-pick best content. Modernize as needed.

---

**Q19: Should NPCs have AI or scripted behavior?**
- [ ] Pure scripted (follows exact script logic)
- [ ] Simple AI (pathfinding, basic reactions)
- [ ] Advanced AI (machine learning, adaptive)
- [ ] Hybrid (script-driven with AI enhancements)

**Legacy system**: Event-driven scripts (no AI mentioned).

**Recommendation**: Start scripted, add AI for pathfinding/combat later.

---

## Multiplayer & Networking Questions

### 🌐 Network Architecture

**Q20: What is the expected player count?**
- [ ] Single-player only
- [ ] Small multiplayer (2-10 players)
- [ ] Medium scale (50-200 concurrent)
- [ ] MMO scale (1000+ concurrent)

**Impact**: Affects server architecture, networking protocol, instance management.

**Legacy system**: Mentions `GetMaxUsers()`, guilds, parties → suggests MMO intent.

**Recommendation**: Design for 50-200 initially, architect for horizontal scaling.

---

**Q21: How should players interact across the 256×256 world?**
- [ ] Single shared world (all players on same map)
- [ ] Instanced zones (dungeons are private)
- [ ] Channels (multiple copies of world, player picks)
- [ ] Hybrid (shared towns, instanced dungeons)

**Performance**: 256×256 screens = can't load all at once.

**Recommendation**: Shared world with on-demand screen loading. Instance dungeons/raids.

---

**Q22: What networking protocol?**
- [ ] WebSocket (bidirectional, real-time)
- [ ] WebRTC (P2P capabilities)
- [ ] HTTP/REST (simple, stateless)
- [ ] Custom TCP/UDP (performance)

**Web compatibility**: WebSocket widely supported.

**Recommendation**: WebSocket for game, REST for account/login.

---

### 👥 Social Features

**Q23: What social systems are needed?**
- [ ] Chat (global, map, party, guild, whisper)
- [ ] Friends list
- [ ] Guilds (legacy scripts mention guilds)
- [ ] Party system (legacy has party_script.txt)
- [ ] Trading
- [ ] PvP (AttackPlayer event exists)
- [ ] Leaderboards

**Legacy evidence**: party_script.txt (370 lines) shows party invite/join/leave/roll system.

**Recommendation**: Implement chat + party system first (core social features).

---

## Development Workflow Questions

### 🛠️ Build & Deploy

**Q24: What is the development workflow?**
- [ ] Monorepo (game + editor + server in one repo)
- [ ] Multi-repo (separate repos for each component)
- [ ] Hybrid (core in one repo, tools separate)

**stdLibSchema**: Already a large monorepo with multiple modules.

**Recommendation**: Monorepo under `/game/` in current project, leverage stdLibSchema via symlink.

---

**Q25: Should we use stdLibSchema's testing infrastructure?**
- [ ] Yes (Jest, Playwright, mutation testing)
- [ ] No (separate testing setup)
- [ ] Partial (unit tests only)

**Available**: stdLibSchema has 308 files, extensive test coverage infrastructure.

**Recommendation**: Yes, leverage existing testing infrastructure (saves setup time).

---

**Q26: What CI/CD pipeline?**
- [ ] GitHub Actions
- [ ] GitLab CI
- [ ] Jenkins
- [ ] Vercel (for web deployment)
- [ ] Custom

**stdLibSchema**: Has `vercel:deploy` script, suggesting Vercel integration.

**Recommendation**: GitHub Actions for testing, Vercel for web hosting.

---

### 📊 Analytics & Monitoring

**Q27: Should we track game analytics?**
- [ ] No tracking (privacy-focused)
- [ ] Basic (player count, session duration)
- [ ] Detailed (heatmaps, quest completion, drop rates)
- [ ] Custom (define specific KPIs)

**Impact**: Affects data collection, player privacy policy.

**Recommendation**: Basic analytics initially (understand player behavior).

---

## Monetization & Distribution Questions

### 💰 Business Model

**Q28: How should the game be monetized?**
- [ ] Free-to-play
- [ ] One-time purchase
- [ ] Subscription (monthly fee)
- [ ] Freemium (free + optional cosmetics)
- [ ] Open source / non-commercial

**Decision Impact**: Affects development priorities, features, anti-cheat needs.

**This is a user decision** - postpone until later phase.

---

**Q29: Where will the game be distributed?**
- [ ] Own website
- [ ] Steam
- [ ] itch.io
- [ ] App stores (mobile)
- [ ] Multiple platforms

**For web version**: Own hosting most flexible initially.

---

**Q30: Should there be a beta/early access period?**
- [ ] Yes, closed alpha
- [ ] Yes, open beta
- [ ] No, launch when complete
- [ ] Rolling release (continuous updates)

**Recommendation**: Closed alpha with map editor → open beta when core gameplay ready.

---

## Priority Questions (Need Immediate Answers)

### ⚡ Critical Path Decisions

**Status Update (2025-10-18)**: 8 critical questions have been answered! See `answers.md` for complete details.

#### ✅ ANSWERED Questions

1. **Q10**: Platform target → affects tech stack choices
   - ✅ **ANSWERED**: Web-first (HTML5 Canvas + TypeScript), optional Electron wrapper later
   - See: `answers.md` lines 477-499

2. **Q4**: Combat system → affects input handling, game loop design
   - ✅ **ANSWERED**: Real-time with cooldown abilities (hybrid approach)
   - See: `answers.md` lines 503-537

3. **Q5**: World population strategy → affects tooling priorities
   - ✅ **ANSWERED**: Hybrid (procedural filler + hand-crafted key areas)
   - See: `answers.md` lines 541-579

4. **Q12**: Database choice → affects server architecture
   - ✅ **ANSWERED**: PostgreSQL 16 + Redis 7 hybrid
   - See: `answers.md` lines 583-628

5. **Q13**: Map editor approach → affects Phase 4 timeline
   - ✅ **ANSWERED**: Custom web-based editor (reuse game rendering engine)
   - See: `answers.md` lines 632-650

6. **Q18**: Legacy script porting scope → affects workload
   - ✅ **ANSWERED**: Core systems only + selective content (~10-20% of scripts)
   - See: `answers.md` lines 655-697

7. **Q20**: Player count target → affects server architecture
   - ✅ **ANSWERED**: 50-200 concurrent, designed for horizontal scaling
   - See: `answers.md` lines 701-743

8. **Q25**: Use stdLibSchema testing infrastructure?
   - ✅ **ANSWERED**: Yes (leverage Jest + Playwright)
   - See: `answers.md` lines 747-781

9. **Q26**: CI/CD pipeline choice
   - ✅ **ANSWERED**: GitHub Actions for CI, Vercel for client deployment
   - See: `answers.md` lines 785-826

#### ⚠️ STILL UNANSWERED (Lower Priority)

These can be deferred to Phase 2 or later:

- **Q1, Q2, Q6, Q11, Q14**: Database/server details (partially answered by Q12)
- **Q3, Q7-Q9, Q15-Q17, Q19, Q21-Q24, Q27-Q30**: Design/implementation details

---

## Questions for User Input

### 🎯 Requires User Decision

**Name the game**: Current placeholder is "Unnamed 2D Top-Down RPG"
- What is the game's title?
- What is the world/lore called?
- What is the game's theme (fantasy, sci-fi, post-apocalyptic, etc.)?

**Creative direction**:
- Should we preserve the retro aesthetic or modernize?
- Is this a serious RPG or tongue-in-cheek/humorous?
- Target audience: Nostalgic players? New generation? Hardcore RPG fans?

**Scope**:
- Is this a hobby project or commercial venture?
- What is the timeline (months? years?)?
- Solo developer or will there be a team?

---

## Summary: Decision Framework

| Priority | Questions | Status |
|----------|-----------|--------|
| **Critical** | Q4, Q5, Q10, Q12, Q13, Q18, Q20, Q25, Q26 | ✅ **ANSWERED** (9/9 complete!) |
| **High** | Q1, Q2, Q6, Q11, Q14 | 🔄 Partially covered by Q12 answers |
| **Medium** | Q7, Q8, Q9, Q15, Q16, Q21-Q24, Q27 | 📋 Defer to Phase 2+ |
| **Low** | Q3, Q17, Q19, Q28-Q30 | ⏳ Future consideration |

**Progress**: 9 critical questions answered (30%), sufficient to proceed with Phase 2!

**Next Steps**:
1. ✅ Phase 1 complete (documentation, VCS setup)
2. 🟢 Ready to begin Phase 2 (asset pipeline)
3. Remaining questions can be answered during implementation as needed

**Key Achievement**: All blocking questions for Phase 2 have been resolved! The project has clear technical direction and can proceed with development.

---

*These questions emerged from analyzing the legacy assets, stdLibSchema integration points, and architectural requirements. Answers will shape the development roadmap.*
