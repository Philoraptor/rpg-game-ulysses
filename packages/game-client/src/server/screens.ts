/**
 * Screen Definitions
 *
 * @module game-client/server/screens
 * @fileoverview Hand-authored 20x20 screens built from tiles1 atlas frames.
 * Tile indices were chosen by visual survey of the extracted tile sheets
 * (see docs/spellbook.md appendix for the survey method).
 */

import type { ScreenData } from '@shared/protocol/messages';

/** tiles1 atlas frame indices. */
export const T = {
  GRASS: 13,
  GRASS_B: 14,
  GRASS_C: 20,
  PATH: 53,
  HERB: 48,
  PLANT: 55,
  FLOWERS: 281,
  WELL: 499,
  TREE_PINE: 297,
  TREE_GREEN: 295,
  BUSH: 274,
  ROCK: 287,
  CAMPFIRE: 480,
  PLANKS: 146,
  DUNGEON_FLOOR: 86,
  DUNGEON_WALL: 81,
  LAVA: 128,
} as const;

const W = 20;
const H = 20;

/** Deterministic LCG so screens render identically every boot. */
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function grid(fill: number): number[][] {
  return Array.from({ length: H }, () => Array<number>(W).fill(fill));
}

export const WELL_POS = { x: 10, y: 8 };
export const TOWN_SPAWN = { x: 10, y: 14 };
export const DEN_ENTRY = { x: 10, y: 2 };
export const DEN_SPAWN = { x: 10, y: 5 };

function buildTown(): ScreenData {
  const rng = makeRng(0x0175e5); // "ULYSSES" seed — stable town layout
  const ground = grid(T.GRASS);
  const decor = grid(-1);
  const collision = grid(0);

  // Grass variety (full tiles only — edge/partial tiles read as holes)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (rng() < 0.15) ground[y][x] = T.GRASS_C;
    }
  }

  // Dirt path: south edge up to the well, plus an east-west lane
  for (let y = WELL_POS.y + 1; y < H; y++) ground[y][10] = T.PATH;
  for (let x = 4; x <= 16; x++) ground[12][x] = T.PATH;

  // Tree ring border (leave the south path open)
  for (let x = 0; x < W; x++) {
    for (const y of [0, H - 1]) {
      if (y === H - 1 && x === 10) continue;
      decor[y][x] = rng() < 0.5 ? T.TREE_PINE : T.TREE_GREEN;
      collision[y][x] = 1;
    }
  }
  for (let y = 1; y < H - 1; y++) {
    for (const x of [0, W - 1]) {
      decor[y][x] = rng() < 0.5 ? T.TREE_PINE : T.TREE_GREEN;
      collision[y][x] = 1;
    }
  }

  // Buildings — multi-tile pieces from the tileset's Buildings section.
  // Each entry: top-left position + a 2D grid of tiles1 frame indices.
  const buildings: Array<{ x: number; y: number; tiles: number[][] }> = [
    // Timbered shop: dark roof slopes over lantern-window + signed door
    { x: 3, y: 2, tiles: [[528, 529], [548, 549]] },
    // Thatched log cabin: straw roof over log walls with a red door
    { x: 14, y: 2, tiles: [[555, 556], [560, 561]] },
  ];
  for (const b of buildings) {
    b.tiles.forEach((row, ry) => {
      const isRoof = ry < b.tiles.length - 1; // upper rows: walk-behind, drawn tall
      row.forEach((tile, rx) => {
        decor[b.y + ry][b.x + rx] = tile;
        collision[b.y + ry][b.x + rx] = isRoof ? 0 : 1;
      });
    });
  }

  // Interior copses and dressing
  const dressings: Array<[number, number, number, 0 | 1]> = [
    [6, 3, T.TREE_GREEN, 1],
    [16, 5, T.TREE_PINE, 1],
    [4, 16, T.TREE_PINE, 1],
    [15, 16, T.TREE_GREEN, 1],
    [6, 5, T.BUSH, 1],
    [14, 7, T.BUSH, 1],
    [3, 10, T.ROCK, 1],
    [17, 11, T.ROCK, 1],
    [5, 8, T.FLOWERS, 0],
    [13, 5, T.FLOWERS, 0],
    [8, 16, T.HERB, 0],
    [12, 15, T.PLANT, 0],
    [7, 11, T.FLOWERS, 0],
  ];
  for (const [x, y, tile, blocks] of dressings) {
    decor[y][x] = tile;
    collision[y][x] = blocks;
  }

  // The Well — a single warp tile: stepping on it begins the descent
  decor[WELL_POS.y][WELL_POS.x] = T.WELL;
  collision[WELL_POS.y][WELL_POS.x] = 0;

  return {
    id: 'town',
    name: 'Haven-by-the-Sea',
    width: W,
    height: H,
    ground,
    decor,
    collision,
    tallTiles: TALL_TILES,
  };
}

function buildWellDepths(): ScreenData {
  const rng = makeRng(0xdeadbeef);
  const ground = grid(T.DUNGEON_FLOOR);
  const decor = grid(-1);
  const collision = grid(0);

  // Brick walls around the perimeter
  for (let x = 0; x < W; x++) {
    for (const y of [0, H - 1]) {
      decor[y][x] = T.DUNGEON_WALL;
      collision[y][x] = 1;
    }
  }
  for (let y = 1; y < H - 1; y++) {
    for (const x of [0, W - 1]) {
      decor[y][x] = T.DUNGEON_WALL;
      collision[y][x] = 1;
    }
  }

  // Interior pillars
  for (const [x, y] of [
    [5, 6],
    [14, 6],
    [5, 13],
    [14, 13],
    [9, 10],
    [10, 10],
  ] as const) {
    decor[y][x] = T.DUNGEON_WALL;
    collision[y][x] = 1;
  }

  // Lava seams in the corners — the mutation has a source
  for (const [x, y] of [
    [2, 16],
    [3, 16],
    [2, 17],
    [16, 2],
    [17, 2],
    [17, 3],
  ] as const) {
    ground[y][x] = T.LAVA;
    collision[y][x] = 1;
  }

  // Rubble
  for (let i = 0; i < 10; i++) {
    const x = 2 + Math.floor(rng() * 16);
    const y = 4 + Math.floor(rng() * 13);
    if (decor[y][x] === -1 && collision[y][x] === 0 && !(x === DEN_ENTRY.x && y <= 4)) {
      decor[y][x] = T.ROCK;
      collision[y][x] = 1;
    }
  }

  // The rope platform back up (entry/exit)
  ground[DEN_ENTRY.y][DEN_ENTRY.x] = T.PLANKS;
  decor[DEN_ENTRY.y - 1][DEN_ENTRY.x] = T.CAMPFIRE;

  return {
    id: 'well_depths',
    name: 'The Well Depths',
    width: W,
    height: H,
    ground,
    decor,
    collision,
    tallTiles: TALL_TILES,
  };
}

function buildStrand(): ScreenData {
  const rng = makeRng(0x5ea51de);
  const ground = grid(57); // sand
  const decor = grid(-1);
  const collision = grid(0);

  // Grass fringe along the north edge (the road back to town)
  for (let x = 0; x < W; x++) ground[0][x] = T.GRASS;

  // East/west scrub keeps the strand a corridor; south is the surf line.
  for (let y = 1; y < H; y++) {
    for (const x of [0, W - 1]) {
      decor[y][x] = rng() < 0.5 ? T.BUSH : T.ROCK;
      collision[y][x] = 1;
    }
  }
  // The "endless sea": an unbroken breakwater of rock — a fully obstructed
  // side, so no screen is programmed beyond it and no slide can happen.
  for (let x = 0; x < W; x++) {
    decor[H - 1][x] = T.ROCK;
    collision[H - 1][x] = 1;
  }

  // Where the sea spat Ulysses out: a dead campfire and scattered wreckage
  decor[12][9] = T.CAMPFIRE;
  const wrecks: Array<[number, number, number, 0 | 1]> = [
    [7, 10, 269, 1], // driftwood log
    [12, 14, T.ROCK, 1],
    [5, 15, T.ROCK, 1],
    [14, 9, 278, 0], // beach scrub
    [4, 8, 278, 0],
    [16, 13, 276, 0], // reeds
  ];
  for (const [x, y, tile, blocks] of wrecks) {
    decor[y][x] = tile;
    collision[y][x] = blocks;
  }

  return {
    id: 'the_strand',
    name: 'The Strand',
    width: W,
    height: H,
    ground,
    decor,
    collision,
    tallTiles: TALL_TILES,
  };
}

/**
 * Edge connectivity: walking off an open border cell slides to the adjacent
 * screen (the 256x256 world model, two screens at a time). A side with no
 * entry here is simply not programmed to continue — obstructions on that
 * border are the visual promise of that fact.
 */
export const NEIGHBORS: Record<string, Partial<Record<'up' | 'down' | 'left' | 'right', string>>> = {
  town: { down: 'the_strand' },
  the_strand: { up: 'town' },
};

/** Decor drawn above entities by row (roofs, tree crowns, the well rim). */
export const TALL_TILES: number[] = [
  T.TREE_PINE,
  T.TREE_GREEN,
  528, 529, 555, 556, // building roofs
  T.WELL,
];

/** Step-on warp tiles, resolved server-side after each successful move. */
export interface Warp {
  x: number;
  y: number;
  to: string;
  tx: number;
  ty: number;
}
export const WARPS: Record<string, Warp[]> = {
  town: [{ x: WELL_POS.x, y: WELL_POS.y, to: 'well_depths', tx: DEN_SPAWN.x, ty: DEN_SPAWN.y }],
  well_depths: [{ x: DEN_ENTRY.x, y: DEN_ENTRY.y, to: 'town', tx: 11, ty: 10 }],
};

export const SCREENS: Record<string, ScreenData> = {
  town: buildTown(),
  well_depths: buildWellDepths(),
  the_strand: buildStrand(),
};
