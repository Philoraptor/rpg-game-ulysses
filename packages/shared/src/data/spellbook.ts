/**
 * The Spell Book
 *
 * @module shared/data/spellbook
 * @fileoverview Every spell here is a DERIVATIVE of a real spell recovered from
 * the legacy VB scripts (scripts/legacy/). Each entry records its provenance
 * (source script + legacy effect id), its mechanics, and — in natural language —
 * the animation script the client performs when it is cast. Animation `row`
 * numbers index into Effects.rsc (8 frames per row, 17 rows).
 *
 * Organization: grimoires per class -> schools -> tiers. The player's grimoire
 * is the Necromancer's; Mage/Knight/Barbarian kits belong to partner companions
 * earned through the Well Quest.
 */

import type { PartnerClass } from '../protocol/messages';

/** Effects.rsc row indices, named for readability at call sites. */
export const FX = {
  FIRE_BURST: 0,
  SUMMON_PORTAL: 1,
  PLASMA_ORB: 2,
  STATIC_FIELD: 3,
  SPARKLE_RAIN: 4,
  LIGHTNING: 5,
  THIN_LIGHTNING: 6,
  SPARKS: 7,
  FLAME_SWIRL: 8,
  SLASH_ARC: 9,
  WATER_SPLASH: 10,
  SHADOW_WISP: 11,
  THIN_SLASH: 12,
  BOLT: 13,
  GREY_CROSS: 14,
  GRAVE_SWIRL: 15,
  FROST_CRYSTAL: 16,
} as const;

export type SpellSchool =
  | 'School of Bone'
  | 'School of Blood'
  | 'School of Shadow'
  | 'School of the Grave'
  | 'Elemental Arts' // Mage partner
  | 'Way of the Blade' // Knight partner
  | 'Rage of the North'; // Barbarian partner

export type SpellShape =
  | { kind: 'projectile'; range: number }
  | { kind: 'plus'; radius: 1 } // the Supernova plus-pattern
  | { kind: 'square'; radius: 1 } // the Hellfire 3x3
  | { kind: 'nearest'; range: number }
  | { kind: 'self' }
  | { kind: 'summon' };

export interface Spell {
  id: string;
  name: string;
  /** Float-text spoken over the caster's head, legacy style. */
  incantation: string;
  school: SpellSchool;
  tier: 1 | 2 | 3;
  manaCost: number;
  cooldownMs: number;
  /** Base damage (or heal, for negative values); scaled by the server. */
  power: number;
  shape: SpellShape;
  /** True when the page is attuned and castable in the current build. */
  castable: boolean;
  /** What the spell does, in rulebook language. */
  mechanics: string;
  /**
   * The animation script, in natural language. This is the authoritative
   * description of what the renderer performs; the client's effect calls are
   * an implementation of this paragraph.
   */
  animationScript: string;
  /** Where this page was recovered from. */
  provenance: string;
  /** Effects.rsc row the client plays for this spell. */
  fxRow: number;
}

/* ------------------------------------------------------------------ */
/* The Necromancer's Grimoire (player)                                  */
/* ------------------------------------------------------------------ */

export const NECROMANCER_SPELLS: Spell[] = [
  {
    id: 'shadow_bolt',
    name: 'Shadow Bolt',
    incantation: 'Umbra Ictus!',
    school: 'School of Shadow',
    tier: 1,
    manaCost: 0,
    cooldownMs: 700,
    power: 10,
    shape: { kind: 'projectile', range: 6 },
    castable: true,
    mechanics:
      'The cantrip every necromancer learns first — costs nothing but breath. ' +
      'Hurls a mote of darkness in the facing direction, striking the first ' +
      'enemy within 6 tiles.',
    animationScript:
      'A ribbon of violet shadow gathers at the necromancer’s palm for a ' +
      'single frame, then streaks tile by tile along the cast direction — the ' +
      'dark wisp animation (Effects row 11) played once per tile it crosses, ' +
      'each 60ms after the last, so the bolt visibly travels. On impact the ' +
      'wisp collapses inward and the damage number floats up in bright red.',
    provenance:
      'Derivative of Void Bolt (spell119, Remotes_Classic Scripts.txt) — ' +
      'mage projectile, legacy effect 18, re-shaded for the shadow school.',
    fxRow: FX.SHADOW_WISP,
  },
  {
    id: 'corpse_nova',
    name: 'Corpse Nova',
    incantation: 'Mortui Vigilant!',
    school: 'School of the Grave',
    tier: 1,
    manaCost: 8,
    cooldownMs: 2500,
    power: 12,
    shape: { kind: 'plus', radius: 1 },
    castable: true,
    mechanics:
      'Grave-cold erupts from the caster in a plus-pattern: the tile beneath ' +
      'and the four orthogonal neighbors. Every enemy standing in it is struck.',
    animationScript:
      'Five grey grave-swirls (Effects row 15) detonate simultaneously — one ' +
      'under the caster, four on the orthogonal tiles — each an 8-frame ring ' +
      'of ash spinning outward and fading. The caster is briefly haloed white. ' +
      'The plus-shape is the point: the player reads the safe diagonals at a ' +
      'glance, exactly as Supernova taught in the old game.',
    provenance:
      'Direct descendant of Supernova (darkones_scripts.txt “nova”, ' +
      '5-tile plus pattern, legacy tile effect 9). Same geometry, grave-flavored.',
    fxRow: FX.GRAVE_SWIRL,
  },
  {
    id: 'life_leech',
    name: 'Life Leech',
    incantation: 'Vampirica!',
    school: 'School of Blood',
    tier: 2,
    manaCost: 10,
    cooldownMs: 3000,
    power: 10,
    shape: { kind: 'nearest', range: 3 },
    castable: true,
    mechanics:
      'Drains the nearest enemy within 3 tiles, dealing damage and restoring ' +
      'half of it to the caster as health.',
    animationScript:
      'A blue plasma knot (Effects row 2) blooms on the victim while a second, ' +
      'dimmer copy plays over the necromancer half a beat later — the visual ' +
      'grammar of transfer: it happens THERE, then arrives HERE. The victim’s ' +
      'damage floats in bright red; the caster’s heal floats in bright green ' +
      'with a leading plus sign.',
    provenance:
      'Fusion of the vampire boss’s life drain (“Vampirica …” float text, ' +
      'nisfight, Remotes_Classic) with Leech HP “Au Fero!” (spell134, legacy ' +
      'effect 51).',
    fxRow: FX.PLASMA_ORB,
  },
  {
    id: 'summon_wraith',
    name: 'Summon Wraith',
    incantation: 'Surge Umbra!',
    school: 'School of Bone',
    tier: 2,
    manaCost: 12,
    cooldownMs: 12000,
    power: 6,
    shape: { kind: 'summon' },
    castable: true,
    mechanics:
      'Tears a brief passage to the grave and binds one wraith for 20 seconds. ' +
      'The wraith drifts after the necromancer and claws at nearby enemies. ' +
      'One wraith may walk at a time.',
    animationScript:
      'A cold blue portal-orb (Effects row 1) dilates on the summon tile: ' +
      'small, swollen, then a ring — the classic aperture read. On its final ' +
      'frame the wraith sprite fades in from 0 to full alpha over a half ' +
      'second, already drifting. When the binding lapses, the wraith plays the ' +
      'same portal in reverse order and is gone before the last frame lands.',
    provenance:
      'Derivative of the Summoner’s minion call (summonerspawn, ' +
      'Remotes_Classic — SpawnMonster + tile effect 36) bound to the ghost ' +
      'sprites of Sprites.rsc.',
    fxRow: FX.SUMMON_PORTAL,
  },
  {
    id: 'hellfire',
    name: 'Hellfire',
    incantation: 'Incendia Ex!',
    school: 'School of Shadow',
    tier: 3,
    manaCost: 22,
    cooldownMs: 9000,
    power: 26,
    shape: { kind: 'square', radius: 1 },
    castable: true,
    mechanics:
      'The forbidden page. Immolates the full 3×3 square centered on the ' +
      'caster — every enemy in nine tiles burns. The necromancer stands in ' +
      'the eye of it, untouched.',
    animationScript:
      'Nine fire-bursts (Effects row 0) ignite across the 3×3 in two waves: ' +
      'center tile first, the eight surrounding tiles 80ms later, so the blast ' +
      'reads as an outward bloom rather than a stamp. Each burst runs its full ' +
      '8 frames; the floor under them flashes warm. Damage numbers stagger ' +
      'upward one after another — the old servers let Hellfire fill the ' +
      'screen with red, and so do we.',
    provenance:
      'Direct port of Hellfire (darkones_scripts.txt, 3×3 blast, mana 15+10 ' +
      'per target, legacy tile effect 1). The one page kept under its true name.',
    fxRow: FX.FIRE_BURST,
  },
  /* ----- Pages recovered but not yet attuned (locked in this build) ----- */
  {
    id: 'bone_armor',
    name: 'Bone Armor',
    incantation: 'Os Mose!',
    school: 'School of Bone',
    tier: 1,
    manaCost: 12,
    cooldownMs: 30000,
    power: 2,
    shape: { kind: 'self' },
    castable: false,
    mechanics:
      'Sheathes the caster in grave-plate: +2 defense for 30 seconds. ' +
      '(Awaits the equipment system — the legacy version worked by rewriting ' +
      'an equipped item’s suffix.)',
    animationScript:
      'Grey cross-motes (Effects row 14) orbit the caster once, then snap ' +
      'inward and harden — a single white flash on the sprite marks the ' +
      'armor taking. A faint bone-white outline should linger on the sprite ' +
      'for the duration.',
    provenance:
      'Derivative of Absorb “Os Mose!” (spell129, Remotes_Classic — ' +
      'SetEquippedItemSuffix 250, Freya’s Charm, legacy effect 58).',
    fxRow: FX.GREY_CROSS,
  },
  {
    id: 'blood_pact',
    name: 'Blood Pact',
    incantation: 'Kon Zen Trat!',
    school: 'School of Blood',
    tier: 1,
    manaCost: 0,
    cooldownMs: 8000,
    power: 25,
    shape: { kind: 'self' },
    castable: false,
    mechanics:
      'Opens a vein in the soul: pays 25 health, gains 39 mana. The exchange ' +
      'rate is exactly the old one. (Awaits UI affordance for self-harm ' +
      'confirmation.)',
    animationScript:
      'A crimson version of the transfer bloom: sparks (Effects row 7) crackle ' +
      'over the heart, the HP bar visibly ticks down before the MP bar ticks ' +
      'up — order matters, cost precedes gain — and the incantation floats ' +
      'in bright magenta.',
    provenance:
      'Direct port of the mage HP→mana rite (spell124 “Kon Zen Trat!”, ' +
      'Remotes_Classic, legacy effect 30).',
    fxRow: FX.SPARKS,
  },
  {
    id: 'silence',
    name: 'Sepulchral Hush',
    incantation: 'Con Fun Dere!',
    school: 'School of the Grave',
    tier: 2,
    manaCost: 35,
    cooldownMs: 20000,
    power: 0,
    shape: { kind: 'plus', radius: 1 },
    castable: false,
    mechanics:
      'Everything within 4 tiles forgets its own voice: enemy casters are ' +
      'locked out of their abilities for 6 seconds. (Awaits enemies that cast.)',
    animationScript:
      'The static-field sheet (Effects row 3) washes over each victim like a ' +
      'purple television losing signal, and their name label greys out for ' +
      'the duration — silence you can see from across the room.',
    provenance:
      'Direct descendant of Silence (spell123 “Con Fun Dere!”, ' +
      'Remotes_Classic, legacy effect 21).',
    fxRow: FX.STATIC_FIELD,
  },
  {
    id: 'last_rites',
    name: 'Last Rites',
    incantation: 'Decerto!',
    school: 'School of Blood',
    tier: 3,
    manaCost: 0,
    cooldownMs: 60000,
    power: 40,
    shape: { kind: 'square', radius: 1 },
    castable: false,
    mechanics:
      'Castable only below 20% health. If the necromancer dies while the rite ' +
      'is armed, the death detonates: heavy damage to everything within 4 ' +
      'tiles, and the corpse takes its bow. (Awaits the death-trigger hook.)',
    animationScript:
      'On arming: a slow grave-swirl under the caster’s feet that does NOT ' +
      'fade — an ominous idle loop. On death-detonation: the swirl inverts, ' +
      'the screen shakes 200ms, and a ring of fire-bursts walks the 3×3 ' +
      'perimeter clockwise before the center erupts last. The incantation ' +
      'floats in bright red over the falling body.',
    provenance:
      'Derivative of Redemption (spell207/redemption2, Remotes_Classic — ' +
      'the “below 20% health” gate is quoted verbatim in ' +
      'reference_sheet.txt:365).',
    fxRow: FX.GRAVE_SWIRL,
  },
];

/* ------------------------------------------------------------------ */
/* Partner kits (Mage / Knight / Barbarian companions)                 */
/* ------------------------------------------------------------------ */

export const PARTNER_SPELLS: Record<PartnerClass, Spell[]> = {
  mage: [
    {
      id: 'major_fireball',
      name: 'Major Fireball',
      incantation: 'Ignis Maior!',
      school: 'Elemental Arts',
      tier: 1,
      manaCost: 5,
      cooldownMs: 1200,
      power: 10,
      shape: { kind: 'projectile', range: 6 },
      castable: true,
      mechanics: 'Classic mage artillery: a fireball down the facing line.',
      animationScript:
        'The fire-burst sheet (Effects row 0) rides the projectile path one ' +
        'tile at a time and blossoms to full size only on impact — in ' +
        'flight it plays just its first two frames per tile, small and eager.',
      provenance:
        'Direct port of Major Fireball (spell125, Remotes_Classic, legacy ' +
        'effect 7).',
      fxRow: FX.FIRE_BURST,
    },
    {
      id: 'supernova',
      name: 'Supernova',
      incantation: 'Stella Mori!',
      school: 'Elemental Arts',
      tier: 2,
      manaCost: 10,
      cooldownMs: 5000,
      power: 14,
      shape: { kind: 'plus', radius: 1 },
      castable: true,
      mechanics: 'The mage’s plus-pattern blast, five tiles at once.',
      animationScript:
        'Five lightning columns (Effects row 5) strike the plus-pattern in a ' +
        'single frame — no stagger; a supernova is simultaneous by ' +
        'definition. Afterimage lingers 300ms as the bolts fade bottom-up.',
      provenance:
        'Direct port of Supernova (darkones_scripts.txt “nova”, legacy ' +
        'tile effect 9).',
      fxRow: FX.LIGHTNING,
    },
  ],
  knight: [
    {
      id: 'valiant_strike',
      name: 'Valiant Strike',
      incantation: 'Pro Gloria!',
      school: 'Way of the Blade',
      tier: 1,
      manaCost: 0,
      cooldownMs: 900,
      power: 11,
      shape: { kind: 'nearest', range: 1 },
      castable: true,
      mechanics: 'A disciplined sword blow against the adjacent enemy.',
      animationScript:
        'One white crescent arc (Effects row 9) sweeps across the target ' +
        'tile in the direction the knight faces — 8 frames, no more; a ' +
        'knight does not flourish.',
      provenance:
        'Built on the melee grammar of AttackMonster + the slash-arc sheet; ' +
        'discipline borrowed from the Mindset stances (spell30-32).',
      fxRow: FX.SLASH_ARC,
    },
    {
      id: 'taunt',
      name: 'Lure',
      incantation: 'Mon En!',
      school: 'Way of the Blade',
      tier: 2,
      manaCost: 0,
      cooldownMs: 6000,
      power: 0,
      shape: { kind: 'plus', radius: 1 },
      castable: true,
      mechanics:
        'Every enemy within 4 tiles forgets the necromancer and turns on the ' +
        'knight. The tank button, unchanged since the old servers.',
      animationScript:
        'The thin-lightning crack (Effects row 6) snaps over the knight’s ' +
        'head like a raised banner; each affected enemy flashes red for two ' +
        'frames as its target flips.',
      provenance:
        'Direct port of Lure/Taunt “Mon En!” (spell33, Remotes_Classic, ' +
        'legacy effect 41).',
      fxRow: FX.THIN_LIGHTNING,
    },
  ],
  barbarian: [
    {
      id: 'cleave',
      name: 'Cleave',
      incantation: 'RARGH!',
      school: 'Rage of the North',
      tier: 1,
      manaCost: 0,
      cooldownMs: 1100,
      power: 13,
      shape: { kind: 'nearest', range: 1 },
      castable: true,
      mechanics: 'An axe swing that does not believe in defense.',
      animationScript:
        'Two overlapping slash arcs (Effects row 9), the second mirrored and ' +
        '2 frames behind the first — sloppy, huge, effective. The camera ' +
        'nudges 2px toward the blow.',
      provenance:
        'Melee derivative; the double-arc is the visual of Quick Strike’s ' +
        'two damage cases (spell179) collapsed into one swing.',
      fxRow: FX.SLASH_ARC,
    },
    {
      id: 'berserk',
      name: 'Berserk',
      incantation: 'ARRGH!',
      school: 'Rage of the North',
      tier: 2,
      manaCost: 0,
      cooldownMs: 15000,
      power: 5,
      shape: { kind: 'self' },
      castable: true,
      mechanics:
        'Pays 10 health, gains +5 damage for 10 seconds. Rage is a loan.',
      animationScript:
        'The flame-swirl sheet (Effects row 8) wraps the barbarian’s ' +
        'sprite, which tints 20% toward red for the duration; the incantation ' +
        'floats in plain red — the legacy float for Adrenaline was ' +
        'literally “ARRGH” and we honor it.',
      provenance:
        'Direct descendant of Adrenaline (spell35, Remotes_Classic — 40 HP ' +
        'cost, Str buff, float “ARRGH”, legacy effect 7).',
      fxRow: FX.FLAME_SWIRL,
    },
  ],
};

export const ALL_SPELLS: Spell[] = [
  ...NECROMANCER_SPELLS,
  ...PARTNER_SPELLS.mage,
  ...PARTNER_SPELLS.knight,
  ...PARTNER_SPELLS.barbarian,
];

export function spellById(id: string): Spell | undefined {
  return ALL_SPELLS.find((s) => s.id === id);
}
