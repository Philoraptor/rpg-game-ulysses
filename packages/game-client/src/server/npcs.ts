/**
 * NPC Definitions & Ambient Chatter
 *
 * @module game-client/server/npcs
 * @fileoverview The townsfolk of Haven-by-the-Sea. Sprites reference the
 * client sprite table (frames verified visually against Sprites.rsc).
 * Chatter is broadcast at random intervals in the legacy MapMessage style.
 */

import { C } from '@shared/data/colors';

export interface NpcDef {
  id: string;
  name: string;
  sprite: string;
  x: number;
  y: number;
  /** Manhattan wander radius around home; 0 = stands still. */
  wander: number;
  /** Ambient lines, broadcast randomly while the player is in town. */
  chatter: Array<{ text: string; color: number }>;
  /** Lines used when the player interacts directly. */
  greeting: Array<{ text: string; color: number }>;
}

export const TOWN_NPCS: NpcDef[] = [
  {
    id: 'npc_elder',
    name: 'Elder Aldric',
    sprite: 'elder',
    x: 9,
    y: 9,
    wander: 0,
    chatter: [
      { text: 'The well water came up green this morning. Green!', color: C.BrightGreen },
      { text: 'A brave soul could earn themselves a true companion...', color: C.Yellow },
      { text: 'I remember when the well sang. Now it only squeaks.', color: C.Grey },
    ],
    greeting: [
      {
        text: 'Ulysses! Yes, you — the sea returns strange gifts. Our well is fouled.',
        color: C.White,
      },
      {
        text: 'Giant mutated rats nest in the depths. Clear them out, necromancer.',
        color: C.BrightRed,
      },
      {
        text: 'Do this, and I will call a partner to your side — a Mage, a Knight, or a Barbarian of the old guilds.',
        color: C.Yellow,
      },
      { text: '(Press E at the well to climb down. Steel yourself.)', color: C.BrightCyan },
    ],
  },
  {
    id: 'npc_jester',
    name: 'Pip the Jester',
    sprite: 'jester',
    x: 6,
    y: 13,
    wander: 3,
    chatter: [
      { text: 'That Ulysses fellow looks lost again! Lost-lost-LOST, la la~', color: C.BrightMagenta },
      { text: 'Watch out for the giant mutated rats down there! They juggle better than I do.', color: C.BrightRed },
      { text: 'A Necromancer in Haven! Shall I fetch the funny bones? Eh? EH?', color: C.Yellow },
    ],
    greeting: [
      { text: 'Why did the rat cross the well? MUTATION! Hee hee!', color: C.BrightMagenta },
    ],
  },
  {
    id: 'npc_barmaid',
    name: 'Rosa',
    sprite: 'barmaid',
    x: 14,
    y: 12,
    wander: 2,
    chatter: [
      { text: 'Poor dear looks absolutely lost. Washed up on the beach, they say.', color: C.BrightMagenta },
      { text: 'The well quest? Elder Aldric pays in companions, not coin. Odd old man.', color: C.Grey },
      { text: 'I heard squeaking from the well last night. BIG squeaking.', color: C.BrightRed },
    ],
    greeting: [
      { text: 'No tavern yet, love — the roadmap says Phase 7. Chin up.', color: C.Yellow },
    ],
  },
  {
    id: 'npc_hunter',
    name: 'Bram the Hunter',
    sprite: 'hunter',
    x: 4,
    y: 6,
    wander: 3,
    chatter: [
      { text: 'Rats the size of hounds down that well. My arrows just bounce off.', color: C.BrightRed },
      { text: 'You look lost, stranger. The whole town can tell.', color: C.Grey },
      { text: 'Whoever clears the well earns a partner for the road. Mage, Knight or Barbarian — their pick.', color: C.Yellow },
    ],
    greeting: [
      { text: 'Tracks by the well. Big ones. Take the quest or stay out of my light.', color: C.Grey },
    ],
  },
  {
    id: 'npc_monk',
    name: 'Brother Ash',
    sprite: 'monk',
    x: 15,
    y: 5,
    wander: 1,
    chatter: [
      { text: 'The lost are merely early to somewhere else, Ulysses.', color: C.BrightCyan },
      { text: 'Something warps the creatures beneath us. Lava, or worse.', color: C.Brown },
    ],
    greeting: [
      { text: 'Death magic, so close to a well of life. The irony sustains me.', color: C.BrightCyan },
    ],
  },
  {
    id: 'npc_lady',
    name: 'Mirabel',
    sprite: 'lady',
    x: 12,
    y: 16,
    wander: 2,
    chatter: [
      { text: 'Is that the lost one from the beach? He walks in circles, bless him.', color: C.BrightMagenta },
      { text: 'Do NOT go down the well without a weapon. Or at all!', color: C.BrightRed },
    ],
    greeting: [
      { text: 'The flowers grow strangely fast this year. I blame the water.', color: C.Green },
    ],
  },
];
