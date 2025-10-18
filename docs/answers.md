# Answers: Architectural Decisions & Solutions

**Project**: Unnamed 2D Top-Down RPG
**Session**: Initialization - "Ulysses Stranded"
**Date**: 2025-10-16

---

## Table of Contents
1. [Core Architecture Decisions](#core-architecture-decisions)
2. [Asset Management Solutions](#asset-management-solutions)
3. [Script System Migration](#script-system-migration)
4. [Rendering & Performance](#rendering--performance)
5. [World & Map System](#world--map-system)
6. [Integration with stdLibSchema](#integration-with-stdlibschema)

---

## Core Architecture Decisions

### Q: What is the 8-layer architecture for this RPG?

**A: Hierarchical Layer System**

```
Layer 8: Network/Server Interface
  ↓ (Server-client communication, state sync)
Layer 7: Script Engine
  ↓ (Event system, quest logic, NPC behavior)
Layer 6: Entity/Object System
  ↓ (Players, NPCs, items, monsters)
Layer 5: Map/World System
  ↓ (256×256 screen array, navigation)
Layer 4: Game State Manager
  ↓ (Global state, flags, player data)
Layer 3: Input Handler
  ↓ (Keyboard, mouse, touch controls)
Layer 2: Tile/Sprite Manager
  ↓ (Asset loading, animations, effects)
Layer 1: Rendering Engine
  ↓ (Canvas/WebGL drawing, camera)
```

Each layer is:
- **Independent**: Can be tested/developed separately
- **Modular**: Interfaces defined between layers
- **Replaceable**: Technology can change without affecting other layers

---

## Asset Management Solutions

### Q: How do we handle 50+ .rsc files (70MB+ of bitmap data)?

**A: Conversion Pipeline with Metadata**

**Current Format:**
- `.rsc` files are BMP images (discovered via `file` command)
- tiles1.rsc: 224×7136px, 24-bit (~4.7MB)
- Sprites.rsc: 384×4000px, 8-bit with palette (~720KB)
- Effects.rsc: 256×544px animations
- Objects.rsc: 32×7520px item strip

**Conversion Strategy:**
1. **Extract to PNG**: Convert BMP → PNG (better compression, alpha channel support)
2. **Generate Atlases**: Combine related sprites into optimized texture atlases
3. **Create JSON Metadata**:
   ```json
   {
     "name": "tiles_ground",
     "source": "tilesground.rsc",
     "tileSize": 32,
     "columns": 7,
     "tiles": [
       {"id": 0, "name": "grass", "collision": false},
       {"id": 1, "name": "stone_floor", "collision": false},
       {"id": 2, "name": "wall", "collision": true}
     ]
   }
   ```
4. **Lazy Loading**: Load assets per screen/zone, not all at once

**File Organization:**
```
/assets/
  /sprites/
    player.atlas.png
    player.atlas.json
    npcs.atlas.png
    monsters.atlas.png
  /tiles/
    ground.atlas.png
    indoor.atlas.png
    outdoor.atlas.png
  /effects/
    rain.anim.png
    spells.atlas.png
  /ui/
    interface.png
    buttons.png
```

---

## Script System Migration

### Q: How do we modernize the VB-style scripting system?

**A: TypeScript Event-Driven API with stdLibSchema Integration**

**Legacy System** (reference_sheet.txt):
```vb
Sub Main(Player as Long)
  If GetPlayerLevel(Player) = 5 Then
    PlayerMessage(Player, "Welcome!", 14)
    GiveObj(Player, 3, 150)
  End If
End Sub
```

**Modern Equivalent:**
```typescript
// Using stdLibSchema schematic generation
export class QuestEvent implements GameEvent {
  trigger: EventType = 'JoinMap';
  mapId = 30;

  async execute(context: GameContext): Promise<EventResult> {
    const { player } = context;

    if (player.level === 5) {
      await player.message("Welcome!", TextColor.Yellow);
      await player.inventory.add(ItemId.POTION, 150);
    }

    return EventResult.Continue;
  }
}
```

**Schematic Generation via stdLibSchema:**
- Use `/stdLibSchema/src/schematics/` to generate quest templates
- Use `/stdLibSchema/src/specs/` for event validation
- Use `/stdLibSchema/src/stdlib/orchestration/` for workflow execution

**Event Types to Support** (from reference_sheet.txt):
- `PlayerRegen`, `MonsterDie`, `PlayerDie`
- `UseObj`, `DropObj`, `GetObj`
- `JoinMap`, `PartMap`, `Map_X_Y` (tile scripts)
- `CatchFish`, `ChopLumber`, `MineOre`
- `JoinGame`, `PartGame`, `PlayerResurrect`

---

## Rendering & Performance

### Q: How do we achieve 60 FPS with a 640×640 viewport + UI?

**A: Canvas-based Rendering with Culling & Dirty Regions**

**Technology Choice: HTML5 Canvas**
- Native browser support
- Hardware acceleration
- Easy pixel-perfect rendering for retro aesthetic

**Optimization Strategies:**

1. **Viewport Culling**: Only render visible 20×20 tile grid
   ```typescript
   // Calculate visible tiles based on camera position
   const startX = Math.floor(camera.x / TILE_SIZE);
   const startY = Math.floor(camera.y / TILE_SIZE);
   const endX = startX + VIEWPORT_TILES_X; // 20
   const endY = startY + VIEWPORT_TILES_Y; // 20
   ```

2. **Dirty Region Tracking**: Only redraw changed areas
   ```typescript
   class DirtyRegionTracker {
     private regions: Rectangle[] = [];

     markDirty(x: number, y: number, width: number, height: number) {
       this.regions.push(new Rectangle(x, y, width, height));
     }

     render(ctx: CanvasRenderingContext2D) {
       // Only redraw dirty regions
       for (const region of this.regions) {
         ctx.save();
         ctx.rect(region.x, region.y, region.width, region.height);
         ctx.clip();
         this.renderRegion(ctx, region);
         ctx.restore();
       }
       this.regions = [];
     }
   }
   ```

3. **Layer Caching**: Pre-render static layers (ground tiles) to off-screen canvas
   - Ground layer: Rarely changes
   - Object layer: Doors, chests
   - Entity layer: Players, NPCs (redrawn every frame)
   - Effect layer: Animations, particles

4. **Sprite Batching**: Group draw calls by texture

**Target Performance:**
- 60 FPS @ 1024×768 fullscreen
- < 16ms frame time
- < 100MB memory footprint

---

## World & Map System

### Q: How do we manage a 256×256 screen world?

**A: Chunk-Based Loading with Screen Addressing**

**World Structure:**
```
World Map: 256×256 screens (0x00 to 0xFF in each dimension)
Each Screen: 640×640px (20×20 tiles of 32×32px)
Total World: 163,840 × 163,840 pixels (26.8 billion pixels!)
```

**Memory Strategy:**
```typescript
class WorldManager {
  private loadedScreens = new Map<string, Screen>();
  private activeScreen: Screen;

  // Screen addressing: "0x4A_0x7C" = screen at (74, 124)
  getScreen(x: number, y: number): Screen {
    const key = `0x${x.toString(16).padStart(2, '0')}_0x${y.toString(16).padStart(2, '0')}`;

    if (!this.loadedScreens.has(key)) {
      this.loadScreen(x, y);
    }

    return this.loadedScreens.get(key)!;
  }

  // Keep only 3×3 grid loaded (9 screens = current + 8 neighbors)
  private unloadDistantScreens(centerX: number, centerY: number) {
    for (const [key, screen] of this.loadedScreens) {
      const [sx, sy] = this.parseScreenKey(key);
      if (Math.abs(sx - centerX) > 1 || Math.abs(sy - centerY) > 1) {
        this.loadedScreens.delete(key);
      }
    }
  }
}
```

**Screen Transitions:**
```typescript
// Player moves from screen (10, 20) to (10, 21) by walking down
if (player.y > SCREEN_HEIGHT) {
  currentScreen = [currentScreen[0], currentScreen[1] + 1];
  player.y = 0;
  worldManager.transitionScreen('down');
}
```

**File Format (per screen):**
```json
{
  "screen": [74, 124],
  "name": "Dark Forest Entrance",
  "layers": {
    "tiles": [[0,1,2,...], [3,4,5,...], ...],      // 20×20 tile IDs
    "collision": [[0,0,1,...], ...],                // 0=walkable, 1=blocked
    "objects": [{"id": 5, "x": 10, "y": 12}, ...],  // Placed objects
    "scripts": [{"tile": [15,8], "event": "chest_open"}]
  },
  "connections": {
    "north": [74, 123],
    "south": [74, 125],
    "east": [75, 124],
    "west": [73, 124]
  }
}
```

---

## Integration with stdLibSchema

### Q: How does stdLibSchema enhance the game development workflow?

**A: Multi-Faceted Integration**

### 1. **Schematic Generation** (`/stdLibSchema/src/schematics/`)
Generate boilerplate code for game entities:

```bash
# Generate a new quest using custom schematic
schematics .:generate-quest --name=UnderwaterCave --type=dungeon

# Creates:
# /src/quests/underwater-cave/
#   underwater-cave.quest.ts
#   underwater-cave.events.ts
#   underwater-cave.rewards.ts
#   underwater-cave.spec.ts
```

### 2. **Workflow Orchestration** (`/stdLibSchema/.rumination/workflows/`)
Define complex game development workflows:

```json
{
  "workflow": "map-creation",
  "steps": [
    {"agent": "map-designer", "task": "layout-tiles"},
    {"agent": "collision-generator", "task": "auto-collision"},
    {"agent": "spawn-placer", "task": "place-monsters"},
    {"agent": "validator", "task": "check-playability"}
  ]
}
```

### 3. **Specs Framework** (`/stdLibSchema/src/specs/`)
Validate game data structures:

```typescript
// Spec: All screens must have valid connections
export class ScreenConnectionSpec implements Spec {
  verify(screen: Screen): SpecResult {
    const { connections } = screen;

    // Check north connection
    if (connections.north) {
      const [nx, ny] = connections.north;
      if (ny !== screen.y - 1) {
        return SpecResult.fail("North connection has wrong Y coordinate");
      }
    }

    return SpecResult.pass();
  }
}
```

### 4. **Testing Infrastructure** (`/stdLibSchema/src/testing/`)
**Available Infrastructure**:
- **Jest**: Unit testing framework (configured and ready)
- **Playwright**: E2E testing for map editor and game client
- **Coverage Tools**: Test coverage tracking and reporting
- **Memory Management**: Built-in test memory profiling
- **Dashboard Monitoring**: Test result visualization

**Implementation for Game**:
```typescript
// /packages/game-client/__tests__/world-manager.spec.ts
import { WorldManager } from '../src/game/world/world-manager';

describe('WorldManager', () => {
  let worldManager: WorldManager;

  beforeEach(() => {
    worldManager = new WorldManager();
  });

  test('should load screen at coordinates', async () => {
    const screen = await worldManager.getScreen(0x0A, 0x14);
    expect(screen).toBeDefined();
    expect(screen.position).toEqual([0x0A, 0x14]);
  });

  test('should handle screen transitions correctly', async () => {
    const result = await worldManager.transitionScreen('north');
    expect(result.success).toBe(true);
    expect(worldManager.currentScreen[1]).toBe(0x13); // One screen north
  });
});
```

### 5. **Redis Integration** (`/stdLibSchema/src/stdlib/redis/`)
**Built-in Redis Support** for game server:
- **Session Management**: Player login sessions, JWT token storage
- **Leaderboards**: Real-time ranking updates
- **Cache Layer**: Frequently accessed game data
- **Connection Pooling**: Optimized Redis connections

**Usage for Game Server**:
```typescript
import { RedisClient } from 'stdlibschema/stdlib/redis';

// Cache player data for fast lookups
const redis = new RedisClient({
  host: process.env.REDIS_HOST,
  port: 6379,
  maxRetriesPerRequest: 3
});

// Cache player session
await redis.setEx(`session:${playerId}`, 3600, JSON.stringify(playerData));

// Leaderboard management
await redis.zAdd('leaderboard:level', { score: player.level, member: playerId });
const top10 = await redis.zRange('leaderboard:level', 0, 9, { REV: true });
```

### 6. **AI-Powered Code Analysis** (`/stdLibSchema/plugins/` + BLC-010)
**Built-in AI Integration**:
- **BLC-010**: AI integration endpoints using Anthropic SDK
- **Code Analysis**: Automated code quality suggestions
- **Pattern Detection**: Identify architectural issues
- **Refactoring Suggestions**: AI-generated improvements

**Usage for Game Development**:
```typescript
import { AIAnalyzer } from 'stdlibschema/plugins';

const analyzer = new AIAnalyzer({
  provider: 'anthropic',
  model: 'claude-3-sonnet'
});

// Analyze quest script for logic issues
const analysis = await analyzer.analyzeFile(
  tree,
  'src/scripts/quests/underwater-cave.quest.ts'
);

console.log(analysis.suggestions);
// Output: [
//   "Consider adding null checks for player inventory",
//   "Quest completion flag should be persisted to database",
//   "Reward calculation could overflow for high-level players"
// ]
```

### 7. **Orchestration Agents** (`/stdLibSchema/src/stdlib/orchestration/`)
**Multi-Agent System** for complex workflows:
```typescript
// Agent: Auto-generate random dungeon floors
export class DungeonGeneratorAgent implements Agent {
  async execute(context: AgentContext): Promise<AgentResult> {
    const { floors, theme, difficulty } = context.params;

    for (let i = 0; i < floors; i++) {
      const floor = await this.generateFloor(i, theme, difficulty);
      await this.validateFloor(floor);
      await this.saveFloor(floor);
    }

    return AgentResult.success(`Generated ${floors} dungeon floors`);
  }
}
```

### 8. **Standard Library Utilities** (`/stdLibSchema/src/stdlib/`)
**500+ Utility Functions** organized by category:
- **String Manipulation**: `toPascalCase`, `toCamelCase`, `toKebabCase`
- **Filesystem**: `readJsonFile`, `writeJsonFile`, `copyDirectory`
- **AST Operations**: TypeScript AST manipulation for code generation
- **Functional Utilities**: `pipe`, `compose`, `curry` for functional programming
- **Performance Monitoring**: Built-in profiling and metrics

**Symlink Benefits:**
- Direct access to stdLibSchema without duplication
- Use existing TypeScript build pipeline
- Leverage 308 existing files and modules
- Integrate testing/validation frameworks
- Access workflow orchestration for complex tasks
- Redis integration ready for production
- AI-powered development assistance

---

## Priority Questions Answered

### Q10: What platforms should the game target?

**A: Web-First with Desktop Wrapper Option**

**Primary Target**: Web (Browser-based)
- HTML5 Canvas/Phaser 3 rendering
- Runs on Chrome, Firefox, Safari, Edge
- No installation required (low barrier to entry)
- Cross-platform by default (Windows, Mac, Linux, mobile)

**Secondary Target**: Desktop (Electron wrapper)
- Package web version as standalone app
- Can be added later with minimal changes
- Provides native feel for desktop users
- Enables Steam distribution if desired

**Rationale**:
- stdLibSchema's tooling is web-optimized (Vite, TypeScript)
- Phaser 3 is battle-tested for browser games
- Deployment is simpler (Vercel/Netlify vs app store processes)
- Wider audience reach (instant play in browser)

**Decision**: **Web-first, Electron wrapper in Phase 8 (optional)**

---

### Q4: What is the combat system?

**A: Real-Time with Cooldown Abilities (Hybrid Approach)**

**System Design**:
- **Real-time movement**: Player can move freely during combat
- **Auto-attack**: Click enemy to engage (auto-attacks until target dies/flees)
- **Cooldown abilities**: Special skills with 3-30 second cooldowns
- **No turn-based pausing**: Combat feels dynamic, not static

**Implementation**:
```typescript
interface CombatSystem {
  autoAttack: {
    enabled: boolean;
    attackSpeed: number; // attacks per second (e.g., 1.5)
    range: number;       // tiles (e.g., 1 for melee, 5 for ranged)
  };
  abilities: Array<{
    id: string;
    name: string;
    cooldown: number;    // milliseconds
    manaCost: number;
    effect: AbilityEffect;
  }>;
}
```

**Rationale**:
- Modern feel (not slow turn-based)
- Skill-based (positioning matters, timing abilities)
- Accessible (auto-attack for casual, abilities for depth)
- Matches legacy VB scripts (`AttackPlayer`, `AttackMonster` events suggest continuous combat)

**Decision**: **Real-time with cooldowns**

---

### Q5: How is the 256×256 world populated?

**A: Hybrid Approach (Procedural + Hand-Crafted)**

**Strategy**:
1. **Hand-Crafted Key Locations** (5-10% of world):
   - Towns, quest hubs, dungeons, boss arenas
   - Created with map editor
   - Narrative-driven content

2. **Procedurally Generated Filler** (90-95% of world):
   - Wilderness (forests, plains, mountains)
   - Random dungeons
   - Generic monster spawns
   - Generated using template system

3. **Template-Based Generation**:
   ```typescript
   const forestTemplate = {
     groundTiles: [1, 2, 3, 4, 5], // Grass variations
     objectDensity: 0.3,           // 30% tiles have objects
     objects: [10, 11, 12],        // Trees, rocks, flowers
     monsterSpawns: [5, 6, 7],     // Forest monsters
     monsterDensity: 0.05          // 5% chance per screen
   };
   ```

4. **Screen Density**:
   - Not all 65,536 screens are accessible
   - ~5,000-10,000 playable screens (8-15% of world)
   - Rest is void (impassable ocean, mountains, barriers)

**Rationale**:
- 65,536 hand-crafted screens is impossible for solo/small team
- Procedural ensures world feels vast
- Hand-crafted provides quality narrative content
- Template system allows artist control over procedural aesthetics

**Decision**: **Hybrid (procedural filler + hand-crafted key areas)**

---

### Q12: What database should store world/player data?

**A: PostgreSQL + Redis Hybrid (Confirmed)**

**Architecture**:

**PostgreSQL 16** (Persistent data):
- Player accounts (username, password hash)
- Character data (level, stats, equipment)
- Inventory (items, quantities)
- Quest completion flags
- Guild/party membership

**Redis 7** (Session/Cache data):
- Active player sessions (who's online, where)
- Leaderboards (top players by level, PvP rank)
- Screen cache (recently accessed map data)
- Rate limiting (prevent spam/abuse)
- Real-time metrics (server health, player count)

**Integration with stdLibSchema**:
```typescript
// stdLibSchema provides Redis utilities
import { RedisClient } from 'stdlibschema/stdlib/redis';

const redis = new RedisClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379
});

// Cache player position for fast lookup
await redis.hSet(`player:${playerId}`, {
  x: player.x,
  y: player.y,
  screen: `${screenX}_${screenY}`,
  map: player.mapId
});

// Get nearby players (O(1) lookup)
const nearbyKeys = await redis.keys(`player:*`);
// Filter by proximity in application layer
```

**ORM**: Drizzle (type-safe, modern, lightweight)

**Decision**: **PostgreSQL + Redis hybrid (leverage stdLibSchema Redis integration)**

---

### Q13: Should we build a custom map editor or use existing tools?

**A: Custom Web-Based Editor (Confirmed)**

**Rationale**:
1. **Can reuse game rendering engine**: Same tile/sprite rendering code
2. **Web-based = accessible**: No separate installation, edit in browser
3. **Integrated workflow**: Edit map → save → test in game immediately
4. **Custom format**: Screen JSON format is unique to this project
5. **stdLibSchema utilities**: Can use file system utilities from stdlib

**Technology**:
- React or Vanilla TypeScript + Canvas
- Phaser 3 renderer (same as game)
- IndexedDB for autosave
- Export to game's JSON format

**Development Timeline**: Phase 5 (Week 12-18)

**Decision**: **Custom web-based map editor**

---

### Q18: How much of the legacy script content should be ported?

**A: Core Systems Only + Selective Content (Confirmed)**

**Port Priority**:

**Tier 1 - Must Port (Core Systems)**:
- Event system (`JoinMap`, `UseObj`, `MonsterDie`, etc.)
- Player API (`GetPlayerLevel`, `SetPlayerHP`, `GiveObj`, etc.)
- Party system (party_script.txt → TypeScript)
- Flag system (persistent quest flags)

**Tier 2 - Selective Port (Best Content)**:
- Well-designed quests (review Remotes_Classic Scripts.txt)
- Boss encounters with unique mechanics
- Guild features if time permits

**Tier 3 - Reference Only**:
- Outdated VB syntax examples
- Redundant/obsolete features
- Low-quality filler content

**Approach**:
```typescript
// Modernize as we port
// Old VB:
// If GetPlayerLevel(Player) = 5 Then
//   GiveObj(Player, 3, 150)
// End If

// New TypeScript:
if (player.level === 5) {
  await player.inventory.add({ id: 3, quantity: 150 });
}
```

**Rationale**:
- 70,000 lines is too much to port manually
- Much legacy content is likely obsolete
- Focus on quality over quantity
- Fresh content can be created with map editor

**Decision**: **Port core systems + cherry-pick best content (~10-20% of legacy scripts)**

---

### Q20: What is the expected player count?

**A: 50-200 Concurrent, Designed for Horizontal Scaling**

**Initial Target**: 50-200 concurrent players
- Single Node.js server instance (2-4 GB RAM)
- Managed PostgreSQL (starter tier)
- Redis instance (1 GB)
- **Estimated cost**: $30-50/month

**Scaling Strategy** (if growth occurs):
- **Horizontal scaling**: Multiple game server instances
- **Load balancer**: Distribute players across servers
- **Screen sharding**: Different servers handle different world regions
- **Redis cluster**: Distributed session storage
- **Database read replicas**: Handle read-heavy queries

**Architecture for Scalability**:
```typescript
// Server handles subset of world (e.g., screens 0x00-0x3F)
const SERVER_REGION = {
  minX: 0x00,
  maxX: 0x3F,
  minY: 0x00,
  maxY: 0xFF
};

// Route players to correct server based on screen
function getServerForScreen(screenX: number, screenY: number): string {
  // Hash or range-based routing
  if (screenX >= 0x00 && screenX <= 0x3F) return 'server-1.example.com';
  if (screenX >= 0x40 && screenX <= 0x7F) return 'server-2.example.com';
  // ...
}
```

**Monitoring**:
- Track concurrent connections
- Monitor server CPU/memory usage
- Set alerts for 80% capacity
- Plan scaling before hitting limits

**Decision**: **Design for 50-200 concurrent, architect for horizontal scaling**

---

### Q25: Should we use stdLibSchema's testing infrastructure?

**A: Yes (Confirmed)**

**Benefits**:
- **Jest already configured**: No setup required
- **Playwright ready**: E2E testing for map editor + game client
- **Coverage tools**: Track test coverage, ensure quality
- **Memory profiling**: Catch memory leaks early
- **Dashboard monitoring**: Visualize test results

**Implementation**:
```typescript
// /packages/shared/__tests__/screen-loader.spec.ts
import { ScreenLoader } from '../src/loaders/screen-loader';

describe('ScreenLoader', () => {
  test('should load valid screen JSON', async () => {
    const screen = await ScreenLoader.load('/assets/screens/00_00.json');
    expect(screen.layers.ground).toHaveLength(400); // 20x20 tiles
  });

  test('should reject malformed screen data', async () => {
    await expect(ScreenLoader.load('/invalid.json'))
      .rejects.toThrow('Invalid screen format');
  });
});
```

**Testing Goals**:
- 80%+ code coverage
- All critical paths tested (movement, combat, quests)
- E2E tests for player workflows

**Decision**: **Yes, leverage stdLibSchema's Jest + Playwright infrastructure**

---

### Q26: What CI/CD pipeline?

**A: GitHub Actions + Vercel (Confirmed)**

**CI/CD Stack**:
- **GitHub Actions**: Automated testing, linting, builds
- **Vercel**: Client deployment (game + map editor)
- **Railway/DigitalOcean**: Server deployment

**GitHub Actions Workflow**:
```yaml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run build

  deploy-client:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: vercel --prod
```

**Rationale**:
- stdLibSchema uses similar CI/CD patterns
- GitHub Actions is free for open source
- Vercel provides instant deployments for web clients
- Matches recommendations from recommendations.md

**Decision**: **GitHub Actions for CI, Vercel for client deployment**

---

## Summary of Key Decisions

| Question | Answer |
|----------|--------|
| **Architecture** | 8-layer modular system, TypeScript-based |
| **Rendering** | HTML5 Canvas with dirty regions & culling |
| **Assets** | Convert .rsc BMP → PNG atlases with JSON metadata |
| **Scripting** | Migrate VB → TypeScript event system |
| **World** | 256×256 screens, chunk loading (3×3 active grid) |
| **Map Editor** | Palette-based painter with layer support |
| **Framework** | Leverage stdLibSchema for schematics, specs, orchestration |
| **Testing** | Jest + Playwright via stdLibSchema infrastructure |

---

## Next Steps

See `master.md` for complete project roadmap and timeline.
