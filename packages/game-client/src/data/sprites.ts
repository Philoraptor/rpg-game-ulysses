/**
 * Sprite Table
 *
 * @module game-client/data/sprites
 * @fileoverview Frame assignments into Sprites.rsc (via sprites-atlas), chosen
 * by visual survey of all 1,500 extracted frames (2026-08-03 session). Each
 * character gets 2-frame walk cycles per facing plus a cast/attack frame.
 * `side` frames face LEFT as drawn; the renderer flips for right.
 */

export interface SpriteDef {
  down: number[];
  up: number[];
  side: number[];
  cast: number[];
}

export const SPRITES: Record<string, SpriteDef> = {
  // The player: horned skull-robed caster, frames 195-214
  necromancer: { down: [195, 196], up: [198, 199], side: [204, 205], cast: [206] },

  // Partners
  mage: { down: [0, 1], up: [3, 4], side: [6, 7], cast: [11] }, // cyan-robed storm caller
  knight: { down: [255, 256], up: [257, 258], side: [260, 261], cast: [259] }, // silver plate, greatsword
  barbarian: { down: [480, 481], up: [482, 483], side: [486, 487], cast: [490] }, // flame-haired brute

  // The Well menace: grey rats, drawn side-on; scale/tint mutate them
  rat: { down: [676, 677], up: [676, 677], side: [678, 679], cast: [680] },

  // Necromancer's bound wraith
  wraith: { down: [492, 493], up: [494, 495], side: [496, 497], cast: [498] },

  // Townsfolk
  elder: { down: [140, 141], up: [140, 141], side: [142, 143], cast: [143] },
  jester: { down: [144, 145], up: [147, 148], side: [150, 151], cast: [146] },
  barmaid: { down: [101, 102], up: [103, 104], side: [105, 106], cast: [104] },
  hunter: { down: [108, 109], up: [110, 111], side: [114, 115], cast: [113] },
  monk: { down: [168, 169], up: [171, 172], side: [174, 175], cast: [170] },
  lady: { down: [96, 97], up: [98, 99], side: [99, 100], cast: [98] },
};
