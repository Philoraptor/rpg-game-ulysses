# Next Session Guide

**Project**: ULYSSES (Unified Layer System for Screen-Editable Scenarios)
**Current Phase**: Phase 1 ✅ Complete | Phase 2 🟢 Ready to Start
**Last Session**: 2025-10-18
**Prepared By**: Claude (Session 2)

> **FIX (2026-08-03 review):** This whole guide is one session stale — Phase 2 was
> **completed** later the same day it was "ready to start" (see `docs/phase-2.md` and
> commit df010f4c), so Options A/B/C below are resolved. The 2026-08 session begins the
> playable vertical slice (Phase 3 re-scope): Necromancer, town + well quest, offline
> server, spell book. See `docs/master.md` review annotations for the current direction.

---

## Quick Status Check

### What's Been Accomplished

✅ **Phase 1 Complete** (2025-10-16 to 2025-10-18)
- 4 comprehensive documentation files (5,264 lines)
- 9 critical design questions answered
- Jujutsu version control initialized
- GitHub repository created: https://github.com/Philoraptor/rpg-game-ulysses
- Phase 2 roadmap expanded (1,366 lines with 7 detailed tasks)

### Current Repository State

```
Commits:
- 313aa596: "Phase 1 Complete: Foundation, Documentation, and Structure"
- 4df40f12: "Comprehensive Phase 2 documentation expansion"
- (pending): "Documentation refinement and session wrap-up"

Bookmarks:
- main @ 313aa596
- phase-2/asset-pipeline (ready for work)

Files: 69 tracked (docs, assets, scripts, packages)
```

---

## Session Startup Checklist

### 1. Verify Environment

```bash
# Navigate to project
cd /home/robby/_produce/oldmain

# Check Jujutsu status
jj status

# View recent commits
jj log -n 5

# Verify you're on correct bookmark
jj bookmark list
```

**Expected**: Should see Phase 1 complete, working copy clean or on `phase-2/asset-pipeline` bookmark.

---

### 2. Review Documentation (5-10 minutes)

**Priority Reading**:
1. **[CHANGELOG.md](./CHANGELOG.md)** - What happened in Sessions 1-2
2. **[README.md](./README.md)** - Updated current status
3. **[docs/master.md](./docs/master.md) lines 362-1726** - Phase 2 detailed roadmap

**Key Files Updated in Session 2**:
- `docs/master.md` - Phase 2 expansion (+1,302 lines)
- `docs/answers.md` - 9 questions answered (+350 lines)
- `docs/recommendations.md` - Jujutsu guide added (+450 lines)
- `docs/questions.md` - Status table updated
- `CHANGELOG.md` - NEW (tracks all progress)
- `README.md` - Updated with current status

---

### 3. Sync with GitHub (Optional)

If you want to push the latest documentation updates:

```bash
# Re-add SSH key to agent (if needed)
ssh-add ~/.ssh/id_ed25519

# Push current state
jj git push --allow-new

# Or create a bookmark for documentation work
jj bookmark create docs/session-2-updates
jj git push --bookmark docs/session-2-updates
```

---

## What to Do Next: Three Options

### Option A: Begin Phase 2 Execution (Recommended)

**If you're ready to start converting assets**, follow these steps:

#### Step 1: Create Phase 2 Working Bookmark

```bash
# Switch to phase-2 bookmark (or create if not exists)
jj bookmark create phase-2/execution
jj new phase-2/execution
```

#### Step 2: Follow Phase 2 Pre-Setup

See `docs/master.md` lines 378-465 for detailed instructions.

**Quick Version**:
```bash
# Install asset pipeline dependencies
cd packages/asset-pipeline
npm init -y
npm install sharp free-tex-packer-core jimp cli-progress chalk --save-dev

# Create directory structure
mkdir -p assets/extracted
mkdir -p assets/game/tiles assets/game/sprites assets/game/effects assets/game/ui
mkdir -p packages/asset-pipeline/src/{converters,extractors,packers,validators,utils}

# Return to root
cd ../..
```

#### Step 3: Start with Task 1 (BMP → PNG Conversion)

See `docs/master.md` lines 577-797 for complete Task 1 instructions.

**Quick Start**:
- Copy TypeScript code from `master.md:589-727` to `packages/asset-pipeline/src/converters/rsc-to-png.ts`
- Run: `npm run convert` (after adding script to package.json)
- Expected: 33 PNGs in `assets/extracted/`, ~45-55MB total

---

### Option B: Refine Documentation Further

**If you want to polish more before coding**:

#### Tasks You Could Do:
1. **Answer More Questions** - Work through questions.md Q1-Q3, Q6-Q9, etc.
2. **Create API.md** - Start documenting planned API endpoints
3. **Create ARCHITECTURE.md** - Diagram the 8-layer system
4. **Update questions.md** - Add more details to unanswered questions
5. **Create package.json files** - Initialize all 5 packages with proper configs

---

### Option C: Explore stdLibSchema Integration

**If you want to understand the framework better**:

#### Tasks:
1. **Read stdLibSchema README**:
   ```bash
   cat stdLibSchema/README.md | less
   ```

2. **Explore Available Schematics**:
   ```bash
   ls -la stdLibSchema/src/schematics/
   ```

3. **Check Testing Infrastructure**:
   ```bash
   ls -la stdLibSchema/src/testing/
   cat stdLibSchema/jest.config.js
   ```

4. **Review Redis Integration**:
   ```bash
   ls -la stdLibSchema/src/stdlib/redis/
   ```

---

## Common Next Session Commands

### Version Control Workflow

```bash
# See what changed
jj status
jj diff

# Commit changes
jj commit -m "Your descriptive message"

# View history
jj log

# Push to GitHub
jj git push
```

### Phase 2 Development Workflow

```bash
# Navigate to asset pipeline
cd packages/asset-pipeline

# Run conversion script
npm run convert

# Run analysis
npm run analyze

# Extract tiles
npm run extract-tiles

# Back to root
cd ../..
```

---

## Important Reminders

### 1. **Don't Skip Pre-Setup**
Phase 2 Task 0 (Pre-Setup) is critical. Don't jump straight to conversion without:
- Installing dependencies (Sharp, etc.)
- Creating directory structure
- Verifying asset file integrity

### 2. **Commit Frequently**
Use Jujutsu to commit after each major task:
```bash
jj commit -m "Complete Task 1: BMP → PNG conversion"
jj commit -m "Complete Task 2: Tile sheet extraction"
```

### 3. **Follow the Timeline**
Phase 2 is estimated at 14 working days (56-70 hours). Don't rush:
- Days 1-2: Setup + Conversion
- Days 3-7: Tile Processing
- Days 8-10: Sprite Processing
- Days 11-12: Atlas Generation
- Days 13-14: QA + Integration

### 4. **Use Troubleshooting Guide**
If you hit issues, check `docs/master.md` lines 1599-1657 for common problems and solutions.

---

## Session Goals (Suggested)

### If Starting Phase 2:

**Session 3 Goals** (3-5 hours):
- [ ] Complete Pre-Setup (install dependencies, create directories)
- [ ] Complete Task 1: Convert all 33 .rsc files to PNG
- [ ] Verify conversion (visual spot-check 5-10 files)
- [ ] Generate conversion-report.json
- [ ] Commit: "Phase 2 Task 1 Complete: Asset Conversion"

**Session 4 Goals** (4-6 hours):
- [ ] Complete Task 2.1: Analyze all tile sheets
- [ ] Generate tile-analysis.json
- [ ] Start Task 2.2: Extract tiles from first 3-5 tile sheets
- [ ] Commit progress

### If Refining Documentation:

**Session 3 Goals** (2-3 hours):
- [ ] Answer Q1, Q2, Q3 in answers.md
- [ ] Create API.md with planned endpoints
- [ ] Create package.json for all 5 packages
- [ ] Commit: "Documentation refinement: Q1-Q3 answered + API spec"

---

## Quick Reference Links

- **[Master Plan](./docs/master.md)** - Complete roadmap
- **[Phase 2 Details](./docs/master.md#phase-2-asset-pipeline)** - Lines 362-1726
- **[Jujutsu Guide](./docs/recommendations.md#version-control-jujutsu-jj)** - Complete jj workflow
- **[Changelog](./CHANGELOG.md)** - What's been done
- **[Questions](./docs/questions.md)** - Design decisions (9 answered, 21 remaining)
- **[GitHub Repo](https://github.com/Philoraptor/rpg-game-ulysses)** - Source code

---

## Questions to Ask at Session Start

Before diving in, clarify:

1. **What's the focus today?**
   - Start Phase 2 asset pipeline? (Option A)
   - Refine documentation? (Option B)
   - Explore stdLibSchema? (Option C)

2. **How much time do you have?**
   - 1-2 hours → Do Pre-Setup + start Task 1
   - 3-5 hours → Complete Task 1 (BMP → PNG conversion)
   - 6+ hours → Complete Tasks 1-2 (conversion + tile analysis)

3. **Any blockers?**
   - Need to install Node.js dependencies?
   - GitHub push issues?
   - Questions about the roadmap?

---

## Session Continuation Template

When you start the next session, you can say:

```
"I'm ready to continue Project ULYSSES. I've read NEXT_SESSION.md.
I want to [choose: begin Phase 2 / refine docs / explore stdLibSchema].
I have [X] hours available today. Let's continue!"
```

Or simply:

```
"Continue Project ULYSSES - let's pick up where we left off!"
```

---

## Final Notes

### What's Already Done (Don't Redo!)
✅ Phase 1 documentation (5,264 lines written)
✅ 9 critical questions answered
✅ Jujutsu repository initialized
✅ GitHub repository created
✅ Phase 2 roadmap detailed (1,366 lines)
✅ Directory structure created
✅ stdLibSchema symlinked

### What's Next (Your Choice!)
🟢 Phase 2 asset pipeline (recommended)
🔵 Documentation refinement (optional)
🟡 stdLibSchema exploration (optional)

### Project Health
**Status**: ✅ Healthy - Phase 1 complete, ready for Phase 2
**Blockers**: None
**Risk**: Low (clear roadmap, all tools configured)
**Confidence**: High (detailed 1,366-line Phase 2 guide exists)

---

**The shipwreck has become a base camp. The path forward is clear. Time to build!** 🎮🚀

*Prepared: 2025-10-18*
*Next Session: TBD*
