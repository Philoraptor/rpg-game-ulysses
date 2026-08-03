# The Spell Book — Design Document

**Added**: 2026-08-03 (this system was absent from the October 2025 plans; see the
FIX annotation in `docs/master.md` Phase 7)
**Data of record**: `packages/shared/src/data/spellbook.ts`
**Legacy sources**: `scripts/legacy/` (extraction summary below)

---

## What this is

Every spell in the game is a **derivative of a real spell recovered from the legacy
VB scripts** — not invented from nothing. Each entry in the data file carries five
things:

1. **Mechanics** — what it does, in rulebook language (shape, cost, cooldown, power)
2. **Incantation** — the float-text spoken over the caster, in the legacy style
   (`"Con Fun Dere!"`, `"Au Fero!"`, `"ARRGH"` are all verbatim from the old scripts)
3. **Animation script, in natural language** — the authoritative description of what
   the renderer performs. The client's effect calls are an *implementation* of that
   paragraph, not the other way round. When the animation and the paragraph disagree,
   the paragraph wins.
4. **Provenance** — which legacy script the page was recovered from, and which legacy
   effect id it used
5. **An `fxRow`** — the row of `Effects.rsc` (8 frames per row, 17 rows) the client
   plays today

## Organization

```
The Necromancer's Grimoire        (player — class chosen: Necromancer)
├── School of Shadow    Shadow Bolt* · Hellfire*
├── School of the Grave Corpse Nova* · Sepulchral Hush
├── School of Blood     Life Leech* · Blood Pact · Last Rites
└── School of Bone      Summon Wraith* · Bone Armor

Partner kits (earned via the Well Quest — battle reward)
├── Mage      Major Fireball · Supernova
├── Knight    Valiant Strike · Lure ("Mon En!")
└── Barbarian Cleave · Berserk ("ARRGH!")
```

`*` = attuned (castable, keys 1-5). Unstarred pages are **recovered but not yet
attuned** — they render in the book with their full animation scripts and the reason
they're locked (missing equipment system, missing death-trigger hook, etc.). This is
deliberate roadmap-as-lore: locked pages are the Phase 7 backlog, visible in-game.

## Legacy extraction summary (2026-08-03)

A full sweep of `scripts/legacy/` recovered, among others:

- **darkones_scripts.txt** — the `/cast` system: Absorb, Supernova, Hellfire, Shock,
  Desolation, Water Pillar, Flames (+ skill-up), learn-by-scroll objects (17, 36, 40,
  45, 47, 54/55) gated by flags 30/60/120/200/251/320 and class (1=Mage, 2=Darkmage)
- **Remotes_Classic Scripts.txt** — the four-class spell tabs (Knight/Mage/Thief/
  Cleric): Static Tear, Void Bolt, Arcanic Bolt, Major Fireball, Meteor Blast, Blink,
  invisibility family, Silence, Drain, Evil Eye, Frost Wave, Arcane Rain, the Heal
  family ("Ave Maria!"), Damnation, Redemption, Resurrect, the Mindsets, Adrenaline,
  Lure, Push, and the reagent economy (Blinding Powder 407, Nightfall Dust 408,
  Living Essence 411, Holy Water 413, Ancient Relics 280)
- **torrentus_cure2.txt** — Cure (INI-file spell learning)
- **reference_sheet.txt** — the effect/sound API signatures
  (`CreateTileEffect(Map,X,Y,Sprite,Speed,TotalFrames,LoopCount,EndSound)` et al.)
  and the 16 text colors, now `packages/shared/src/data/colors.ts`
- Cooldown-flag system: flag 23 spell / 27 invis / 28 buff, per-class durations

Design translations kept on purpose: the **plus-pattern** (Supernova) and **3×3**
(Hellfire) AoE geometries, HP-threshold gates ("below 20% health" → Last Rites),
cost-precedes-gain ordering (Blood Pact), and float-text incantations as the
casting feedback channel.

## Asset survey appendix

Sprites and tiles were selected by generating labeled contact sheets from the Phase 2
extraction (`assets/game/sprites/Sprites/`, `assets/game/tiles/tiles1/`) and reading
them visually. Selections of record: `packages/game-client/src/data/sprites.ts`
(characters) and `packages/game-client/src/server/screens.ts` (`T` table, tiles).
Notables: necromancer frames 195-214 (skull-robed caster), rats 672-683, wraiths
492-503, barbarian 480-491, wells 497-499, building sections 520+ (multi-tile),
Effects.rsc = 17 rows × 8 frames.

**Colorkey**: the legacy engine used pure black as transparency. Phase 2 preserved it
as opaque; `packages/asset-pipeline/colorkey-alpha.cjs` now writes `.alpha.png`
siblings with the key applied. The client loads those.
