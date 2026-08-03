/**
 * LocalGameServer — the built-in offline server
 *
 * @module game-client/server/LocalGameServer
 * @fileoverview Authoritative game simulation running in-page. It speaks the
 * shared ClientMessage/ServerMessage protocol over an injected send function,
 * exactly as a networked server would over a WebSocket (Phase 6 swaps the
 * transport, not this logic). Movement validation, NPC wandering + chatter,
 * monster AI, spell resolution, the Well Quest state machine and the partner
 * companion all live here — never in the renderer.
 */

import type {
  ClientMessage,
  ServerMessage,
  Direction,
  EntityState,
  PartnerClass,
  QuestStage,
  SaveState,
} from '@shared/protocol/messages';
import { C } from '@shared/data/colors';
import { NECROMANCER_SPELLS, PARTNER_SPELLS, spellById, FX, type Spell } from '@shared/data/spellbook';
import { SCREENS, WARPS, NEIGHBORS, TOWN_SPAWN, DEN_ENTRY } from './screens';
import { TOWN_NPCS, type NpcDef } from './npcs';

const TICK_MS = 120;
const DIRS: Record<Direction, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

interface SimEntity extends EntityState {
  screenId: string;
  homeX: number;
  homeY: number;
  wander: number;
  npcDef?: NpcDef;
  /** ms timestamps (sim clock) gating actions */
  nextMoveAt: number;
  nextAttackAt: number;
  /** monsters: base melee damage */
  bite?: number;
  /** summons: despawn time */
  expiresAt?: number;
  partnerClass?: PartnerClass;
  spellCooldowns: Record<string, number>;
}

export class LocalGameServer {
  private send: (msg: ServerMessage) => void;
  private now = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  private entities = new Map<string, SimEntity>();
  private nextId = 1;

  private player!: SimEntity;
  private playerMp = 40;
  private playerMaxMp = 40;
  private playerScreen = 'town';
  private questStage: QuestStage = 'not_started';
  private partner: SimEntity | null = null;
  private wraith: SimEntity | null = null;
  private nextChatterAt = 3000;
  private failNoteAt: Record<string, number> = {};
  private nextRegenAt = 0;
  private partnerOffered = false;
  private dirty = false;

  constructor(send: (msg: ServerMessage) => void) {
    this.send = send;
  }

  /* ---------------------------------------------------------- lifecycle */

  handleMessage(msg: ClientMessage): void {
    switch (msg.type) {
      case 'join':
        this.onJoin(msg.restore);
        break;
      case 'move':
        this.onMove(msg.dir);
        break;
      case 'face':
        if (!this.player.dead) this.player.dir = msg.dir;
        this.dirty = true;
        break;
      case 'cast':
        this.onCast(msg.spellId);
        break;
      case 'interact':
        this.onInteract();
        break;
      case 'choosePartner':
        this.onChoosePartner(msg.cls);
        break;
      case 'respawn':
        this.onRespawn();
        break;
    }
  }

  stop(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
  }

  private onJoin(restore?: SaveState): void {
    this.player = {
      id: 'p1',
      kind: 'player',
      name: 'Ulysses',
      sprite: 'necromancer',
      x: TOWN_SPAWN.x,
      y: TOWN_SPAWN.y,
      dir: 'up',
      hp: 80,
      maxHp: 80,
      screenId: 'town',
      homeX: TOWN_SPAWN.x,
      homeY: TOWN_SPAWN.y,
      wander: 0,
      nextMoveAt: 0,
      nextAttackAt: 0,
      spellCooldowns: {},
    };
    this.entities.set(this.player.id, this.player);

    for (const def of TOWN_NPCS) {
      const npc: SimEntity = {
        id: def.id,
        kind: 'npc',
        name: def.name,
        sprite: def.sprite,
        x: def.x,
        y: def.y,
        dir: 'down',
        hp: 1,
        maxHp: 1,
        screenId: 'town',
        homeX: def.x,
        homeY: def.y,
        wander: def.wander,
        npcDef: def,
        nextMoveAt: 0,
        nextAttackAt: 0,
        spellCooldowns: {},
      };
      this.entities.set(npc.id, npc);
    }

    this.spawnRats();

    if (restore) {
      this.questStage = restore.stage === 'in_well' ? 'briefed' : restore.stage;
      if (restore.partner && restore.stage === 'partner_chosen') {
        this.spawnPartner(restore.partner, true);
      }
    }

    this.send({
      type: 'welcome',
      playerId: this.player.id,
      spellIds: NECROMANCER_SPELLS.filter((s) => s.castable).map((s) => s.id),
    });
    this.sendScreen();
    this.sendStats();
    this.send({ type: 'quest', stage: this.questStage });
    this.chat('Haven-by-the-Sea', 'The sea has spat you out, Ulysses. Again.', C.BrightCyan);
    this.chat('Haven-by-the-Sea', 'WASD/arrows move · 1-5 cast · B spell book · E talk/descend', C.Grey);

    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  private spawnRats(): void {
    const spots: Array<[number, number, boolean]> = [
      [4, 8, false],
      [15, 9, false],
      [7, 15, false],
      [13, 16, false],
      [4, 12, false],
      [10, 13, true], // the Matriarch holds the center
    ];
    for (const [x, y, boss] of spots) {
      const id = `rat_${this.nextId++}`;
      this.entities.set(id, {
        id,
        kind: 'monster',
        name: boss ? 'Rat Matriarch' : 'Giant Mutated Rat',
        sprite: 'rat',
        x,
        y,
        dir: 'left',
        hp: boss ? 60 : 24,
        maxHp: boss ? 60 : 24,
        scale: boss ? 2.6 : 1.9,
        tint: boss ? 0xd8a0ff : 0xa8e8a0,
        screenId: 'well_depths',
        homeX: x,
        homeY: y,
        wander: 2,
        bite: boss ? 8 : 4,
        nextMoveAt: 0,
        nextAttackAt: 0,
        spellCooldowns: {},
      });
    }
  }

  /* ------------------------------------------------------------- input */

  private onMove(dir: Direction): void {
    const p = this.player;
    if (p.dead || this.now < p.nextMoveAt) return;
    p.dir = dir;
    const [dx, dy] = DIRS[dir];
    const nx = p.x + dx;
    const ny = p.y + dy;

    // Edge slide: stepping off an open border cell continues onto the
    // neighboring screen, entering at the opposite edge.
    const screen = SCREENS[this.playerScreen];
    if (nx < 0 || ny < 0 || nx >= screen.width || ny >= screen.height) {
      const nextId = NEIGHBORS[this.playerScreen]?.[dir];
      if (nextId) {
        const dest = SCREENS[nextId];
        const ex = dir === 'left' ? dest.width - 1 : dir === 'right' ? 0 : p.x;
        const ey = dir === 'up' ? dest.height - 1 : dir === 'down' ? 0 : p.y;
        if (dest.collision[ey][ex] === 0) {
          this.warpTo(nextId, ex, ey);
          this.chat('', `~ ${dest.name} ~`, C.BrightCyan);
        }
      }
      this.dirty = true;
      return;
    }
    if (!this.walkable(this.playerScreen, nx, ny, false, true)) {
      this.dirty = true;
      return;
    }
    p.x = nx;
    p.y = ny;
    p.nextMoveAt = this.now + 165;
    this.dirty = true;
    this.checkWarp();
  }

  /** Step-on warp tiles: the well mouth going down, the rope platform going up. */
  private checkWarp(): void {
    const warp = (WARPS[this.playerScreen] ?? []).find(
      (w) => w.x === this.player.x && w.y === this.player.y,
    );
    if (!warp) return;

    if (warp.to === 'well_depths') {
      if (this.questStage === 'not_started') {
        this.chat(
          'Elder Aldric',
          'Hold, Ulysses! Speak with me before you climb down. (Press E near me.)',
          C.Yellow,
        );
        // Nudge the player off the rim so the warning doesn't repeat forever
        this.player.y += 1;
        return;
      }
      this.warpTo(warp.to, warp.tx, warp.ty);
      if (this.questStage === 'briefed') this.setQuest('in_well');
      this.chat('', 'You climb down the slick rope. The squeaking is... substantial.', C.BrightRed);
      return;
    }

    this.warpTo(warp.to, warp.tx, warp.ty);
    if (this.questStage === 'rats_cleared' && !this.partner) this.offerPartner();
    else if (this.questStage === 'in_well') this.setQuest('briefed');
  }

  private onCast(spellId: string): void {
    const p = this.player;
    if (p.dead) return;
    const spell = spellById(spellId);
    if (!spell || !spell.castable) return;
    const readyAt = p.spellCooldowns[spellId] ?? 0;
    if (this.now < readyAt) return;
    if (this.playerMp < spell.manaCost) {
      this.failNote('Low mana');
      return;
    }
    this.playerMp -= spell.manaCost;
    p.spellCooldowns[spellId] = this.now + spell.cooldownMs;
    this.send({ type: 'float', x: p.x, y: p.y, text: spell.incantation, color: C.BrightMagenta });
    this.resolveSpell(p, spell);
    this.sendStats();
  }

  private onInteract(): void {
    const p = this.player;
    if (p.dead) return;

    if (this.playerScreen === 'town') {
      const npc = this.nearestNpc(2);
      if (npc?.npcDef) {
        npc.dir = this.dirTowards(npc, p);
        if (npc.id === 'npc_elder' && this.questStage === 'not_started') {
          for (const line of npc.npcDef.greeting) this.chat(npc.name, line.text, line.color);
          this.setQuest('briefed', 'Clear the giant mutated rats from the Well Depths.');
        } else if (npc.id === 'npc_elder' && this.questStage === 'rats_cleared' && !this.partner) {
          this.offerPartner();
        } else {
          const lines = npc.npcDef.greeting;
          const line = lines[Math.floor(Math.random() * lines.length)];
          this.chat(npc.name, line.text, line.color);
        }
        this.dirty = true;
      }
      return;
    }
  }

  private onChoosePartner(cls: PartnerClass): void {
    if (this.partner || this.questStage !== 'rats_cleared') return;
    this.spawnPartner(cls, false);
    this.setQuest('partner_chosen');
    this.saveState();
  }

  private onRespawn(): void {
    const p = this.player;
    if (!p.dead) return;
    p.dead = false;
    p.hp = p.maxHp;
    this.playerMp = this.playerMaxMp;
    this.warpTo('town', TOWN_SPAWN.x, TOWN_SPAWN.y);
    this.chat('', 'You wake by the well, whole. Death keeps no necromancer.', C.BrightCyan);
    this.sendStats();
  }

  private spawnPartner(cls: PartnerClass, silent: boolean): void {
    const names: Record<PartnerClass, string> = {
      mage: 'Sable the Mage',
      knight: 'Dame Oriane',
      barbarian: 'Torvald of the North',
    };
    const partner: SimEntity = {
      id: 'partner',
      kind: 'partner',
      name: names[cls],
      sprite: cls,
      x: this.player.x,
      y: Math.min(18, this.player.y + 1),
      dir: 'up',
      hp: 80,
      maxHp: 80,
      screenId: this.playerScreen,
      homeX: this.player.x,
      homeY: this.player.y,
      wander: 0,
      partnerClass: cls,
      nextMoveAt: 0,
      nextAttackAt: 0,
      spellCooldowns: {},
    };
    this.partner = partner;
    this.entities.set(partner.id, partner);
    if (!silent) {
      this.send({ type: 'effect', row: FX.SUMMON_PORTAL, x: partner.x, y: partner.y });
      this.chat('Elder Aldric', `${partner.name} answers the old pact. Fight well together.`, C.Yellow);
      this.chat(partner.name, 'Point me at something, necromancer.', C.White);
    }
    this.dirty = true;
  }

  private offerPartner(): void {
    if (this.partnerOffered && this.partner) return;
    this.partnerOffered = true;
    this.chat('Elder Aldric', 'The well runs clean! As promised: choose your partner.', C.Yellow);
    this.send({ type: 'partnerOffer' });
  }

  /* ------------------------------------------------------------ spells */

  private resolveSpell(caster: SimEntity, spell: Spell): void {
    const targets = this.spellTargets(caster, spell);

    switch (spell.shape.kind) {
      case 'projectile': {
        const [dx, dy] = DIRS[caster.dir];
        const range = spell.shape.range;
        let hit: SimEntity | null = null;
        for (let i = 1; i <= range; i++) {
          const tx = caster.x + dx * i;
          const ty = caster.y + dy * i;
          this.send({ type: 'effect', row: spell.fxRow, x: tx, y: ty });
          if (!this.walkable(caster.screenId, tx, ty, true)) break;
          hit = this.monsterAt(caster.screenId, tx, ty, caster);
          if (hit) break;
        }
        if (hit) this.damage(caster, hit, spell.power);
        break;
      }
      case 'plus':
      case 'square': {
        const cells: Array<[number, number]> =
          spell.shape.kind === 'plus'
            ? [
                [0, 0],
                [1, 0],
                [-1, 0],
                [0, 1],
                [0, -1],
              ]
            : [-1, 0, 1].flatMap((yy) => [-1, 0, 1].map((xx) => [xx, yy] as [number, number]));
        for (const [xx, yy] of cells) {
          this.send({ type: 'effect', row: spell.fxRow, x: caster.x + xx, y: caster.y + yy });
        }
        for (const t of targets) this.damage(caster, t, spell.power);
        if (spell.id === 'taunt') {
          for (const m of this.monstersOn(caster.screenId)) {
            this.send({ type: 'charEffect', row: FX.THIN_LIGHTNING, entityId: m.id });
          }
        }
        break;
      }
      case 'nearest': {
        const t = targets[0];
        if (t) {
          this.send({ type: 'charEffect', row: spell.fxRow, entityId: t.id });
          this.damage(caster, t, spell.power);
          if (spell.id === 'life_leech' && caster === this.player) {
            const heal = Math.floor(spell.power / 2);
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
            this.send({ type: 'charEffect', row: spell.fxRow, entityId: this.player.id });
            this.send({
              type: 'float',
              x: this.player.x,
              y: this.player.y,
              text: `+${heal}`,
              color: C.BrightGreen,
            });
            this.sendStats();
          }
        } else if (caster === this.player) {
          this.failNote('No victim in reach');
        }
        break;
      }
      case 'summon': {
        this.castSummonWraith(caster);
        break;
      }
      case 'self': {
        this.send({ type: 'charEffect', row: spell.fxRow, entityId: caster.id });
        break;
      }
    }
  }

  private castSummonWraith(caster: SimEntity): void {
    if (this.wraith) {
      this.entities.delete(this.wraith.id);
      this.send({ type: 'effect', row: FX.SUMMON_PORTAL, x: this.wraith.x, y: this.wraith.y });
    }
    const wx = caster.x;
    const wy = Math.min(18, caster.y + 1);
    const wraith: SimEntity = {
      id: `wraith_${this.nextId++}`,
      kind: 'summon',
      name: 'Bound Wraith',
      sprite: 'wraith',
      x: wx,
      y: wy,
      dir: caster.dir,
      hp: 30,
      maxHp: 30,
      screenId: caster.screenId,
      homeX: wx,
      homeY: wy,
      wander: 0,
      expiresAt: this.now + 20000,
      nextMoveAt: 0,
      nextAttackAt: 0,
      spellCooldowns: {},
    };
    this.wraith = wraith;
    this.entities.set(wraith.id, wraith);
    this.send({ type: 'effect', row: FX.SUMMON_PORTAL, x: wx, y: wy });
    this.dirty = true;
  }

  private spellTargets(caster: SimEntity, spell: Spell): SimEntity[] {
    const monsters = this.monstersOn(caster.screenId);
    switch (spell.shape.kind) {
      case 'plus':
        return monsters.filter(
          (m) =>
            (m.x === caster.x && Math.abs(m.y - caster.y) <= 1) ||
            (m.y === caster.y && Math.abs(m.x - caster.x) <= 1),
        );
      case 'square':
        return monsters.filter(
          (m) => Math.abs(m.x - caster.x) <= 1 && Math.abs(m.y - caster.y) <= 1,
        );
      case 'nearest': {
        const range = spell.shape.range;
        const inRange = monsters
          .map((m) => ({ m, d: Math.abs(m.x - caster.x) + Math.abs(m.y - caster.y) }))
          .filter((e) => e.d <= range)
          .sort((a, b) => a.d - b.d);
        return inRange.length > 0 ? [inRange[0].m] : [];
      }
      default:
        return [];
    }
  }

  private damage(source: SimEntity, target: SimEntity, amount: number): void {
    if (target.dead) return;
    target.hp -= amount;
    this.send({ type: 'float', x: target.x, y: target.y, text: String(amount), color: C.BrightRed });
    if (target.hp <= 0) {
      target.dead = true;
      target.hp = 0;
      this.entities.delete(target.id);
      if (this.wraith?.id === target.id) this.wraith = null;
      this.send({ type: 'effect', row: FX.GRAVE_SWIRL, x: target.x, y: target.y });
      if (target.kind === 'monster') {
        this.chat('', `${target.name} is slain!`, C.BrightGreen);
        this.checkDenCleared();
      } else if (target.kind === 'partner') {
        this.partner = null;
        this.chat('', `${target.name} falls! The old pact will need mending...`, C.BrightRed);
      }
    }
    this.dirty = true;
  }

  private checkDenCleared(): void {
    const remaining = [...this.entities.values()].filter(
      (e) => e.kind === 'monster' && e.screenId === 'well_depths',
    );
    if (remaining.length === 0 && this.questStage === 'in_well') {
      this.setQuest('rats_cleared', 'The Well Depths are silent. Return to Elder Aldric.');
      this.chat('', 'The last squeak dies away. The water already runs clearer.', C.BrightGreen);
      this.saveState();
    }
  }

  /* ---------------------------------------------------------------- AI */

  private tick(): void {
    this.now += TICK_MS;

    // Ambient chatter
    if (this.playerScreen === 'town' && this.now >= this.nextChatterAt) {
      this.nextChatterAt = this.now + 5000 + Math.random() * 7000;
      const talkers = TOWN_NPCS.filter((n) => n.chatter.length > 0);
      const def = talkers[Math.floor(Math.random() * talkers.length)];
      const line = def.chatter[Math.floor(Math.random() * def.chatter.length)];
      this.chat(def.name, line.text, line.color);
    }

    // Mana/health regen
    if (this.now >= this.nextRegenAt && !this.player.dead) {
      this.nextRegenAt = this.now + 2000;
      const mpUp = this.playerMp < this.playerMaxMp;
      const hpUp = this.player.hp < this.player.maxHp;
      if (mpUp) this.playerMp = Math.min(this.playerMaxMp, this.playerMp + 5);
      if (hpUp) {
        const rate = this.playerScreen === 'town' ? 2 : 1;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + rate);
      }
      if (mpUp || hpUp) this.sendStats();
    }

    for (const e of [...this.entities.values()]) {
      if (e.kind === 'npc') this.tickNpc(e);
      else if (e.kind === 'monster') this.tickMonster(e);
      else if (e.kind === 'partner' || e.kind === 'summon') this.tickAlly(e);
    }

    // Wraith expiry
    if (this.wraith && this.wraith.expiresAt !== undefined && this.now >= this.wraith.expiresAt) {
      this.send({ type: 'effect', row: FX.SUMMON_PORTAL, x: this.wraith.x, y: this.wraith.y });
      this.entities.delete(this.wraith.id);
      this.wraith = null;
      this.dirty = true;
    }

    if (this.dirty) {
      this.dirty = false;
      this.send({ type: 'entities', entities: this.visibleEntities() });
    }
  }

  private tickNpc(npc: SimEntity): void {
    if (npc.wander === 0 || this.now < npc.nextMoveAt || Math.random() < 0.85) return;
    npc.nextMoveAt = this.now + 600;
    const dirs = Object.keys(DIRS) as Direction[];
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    const [dx, dy] = DIRS[dir];
    const nx = npc.x + dx;
    const ny = npc.y + dy;
    if (
      Math.abs(nx - npc.homeX) + Math.abs(ny - npc.homeY) <= npc.wander &&
      this.walkable(npc.screenId, nx, ny)
    ) {
      npc.dir = dir;
      npc.x = nx;
      npc.y = ny;
      this.dirty = true;
    }
  }

  private tickMonster(m: SimEntity): void {
    if (m.screenId !== this.playerScreen || this.player.dead) return;
    // Prefer the taunting knight, then the closest of player/allies
    const candidates: SimEntity[] = [this.player];
    if (this.partner && this.partner.screenId === m.screenId) candidates.push(this.partner);
    if (this.wraith && this.wraith.screenId === m.screenId) candidates.push(this.wraith);
    const target = candidates.sort(
      (a, b) =>
        Math.abs(a.x - m.x) + Math.abs(a.y - m.y) - (Math.abs(b.x - m.x) + Math.abs(b.y - m.y)),
    )[0];
    const dist = Math.abs(target.x - m.x) + Math.abs(target.y - m.y);

    if (dist === 1) {
      if (this.now >= m.nextAttackAt) {
        m.nextAttackAt = this.now + 1500;
        m.dir = this.dirTowards(m, target);
        this.send({ type: 'charEffect', row: FX.THIN_SLASH, entityId: target.id });
        this.hurtAlly(target, m.bite ?? 5, m.name);
      }
      return;
    }
    const aggro = m.name === 'Rat Matriarch' ? 4 : 5;
    if (dist <= aggro && this.now >= m.nextMoveAt) {
      m.nextMoveAt = this.now + (m.name === 'Rat Matriarch' ? 480 : 360);
      this.stepTowards(m, target);
    }
  }

  private tickAlly(ally: SimEntity): void {
    if (ally.screenId !== this.playerScreen) {
      // Follow across screens
      ally.screenId = this.playerScreen;
      ally.x = this.player.x;
      ally.y = Math.min(18, this.player.y + 1);
      this.dirty = true;
      return;
    }
    const monsters = this.monstersOn(ally.screenId);
    const nearest = monsters
      .map((m) => ({ m, d: Math.abs(m.x - ally.x) + Math.abs(m.y - ally.y) }))
      .sort((a, b) => a.d - b.d)[0];

    if (nearest && nearest.d <= 6) {
      // Fight: partner uses its class kit, wraith claws
      if (ally.kind === 'summon') {
        if (nearest.d === 1) {
          if (this.now >= ally.nextAttackAt) {
            ally.nextAttackAt = this.now + 1100;
            ally.dir = this.dirTowards(ally, nearest.m);
            this.send({ type: 'charEffect', row: FX.THIN_SLASH, entityId: nearest.m.id });
            this.damage(ally, nearest.m, 6);
          }
        } else if (this.now >= ally.nextMoveAt) {
          ally.nextMoveAt = this.now + 300;
          this.stepTowards(ally, nearest.m);
        }
        return;
      }
      this.partnerFight(ally, nearest.m, nearest.d);
      return;
    }

    // Heel: stay within 2 tiles of the player
    const dp = Math.abs(this.player.x - ally.x) + Math.abs(this.player.y - ally.y);
    if (dp > 2 && this.now >= ally.nextMoveAt) {
      ally.nextMoveAt = this.now + 220;
      this.stepTowards(ally, this.player);
    }
  }

  private partnerFight(ally: SimEntity, target: SimEntity, dist: number): void {
    const cls = ally.partnerClass;
    if (!cls) return;
    const kit = PARTNER_SPELLS[cls];

    for (const spell of kit) {
      if (this.now < (ally.spellCooldowns[spell.id] ?? 0)) continue;

      if (spell.shape.kind === 'projectile') {
        // Needs a clear axis: line up roughly, then fire
        if (ally.x === target.x || ally.y === target.y) {
          ally.dir = this.dirTowards(ally, target);
          ally.spellCooldowns[spell.id] = this.now + spell.cooldownMs;
          this.send({ type: 'float', x: ally.x, y: ally.y, text: spell.incantation, color: C.BrightCyan });
          this.resolveSpell(ally, spell);
          return;
        }
      } else if (spell.shape.kind === 'nearest' && dist === 1) {
        ally.spellCooldowns[spell.id] = this.now + spell.cooldownMs;
        this.send({ type: 'float', x: ally.x, y: ally.y, text: spell.incantation, color: C.BrightCyan });
        this.resolveSpell(ally, spell);
        return;
      } else if (spell.shape.kind === 'plus' && dist <= 1 && spell.power > 0) {
        ally.spellCooldowns[spell.id] = this.now + spell.cooldownMs;
        this.resolveSpell(ally, spell);
        return;
      } else if (spell.shape.kind === 'self' && ally.hp < ally.maxHp / 2) {
        ally.spellCooldowns[spell.id] = this.now + spell.cooldownMs;
        this.send({ type: 'float', x: ally.x, y: ally.y, text: spell.incantation, color: C.Red });
        this.resolveSpell(ally, spell);
        return;
      }
    }

    // Close distance (mage keeps 2 tiles back)
    const desired = cls === 'mage' ? 2 : 1;
    if (dist > desired && this.now >= ally.nextMoveAt) {
      ally.nextMoveAt = this.now + 260;
      this.stepTowards(ally, target);
    }
  }

  private hurtAlly(target: SimEntity, amount: number, from: string): void {
    if (target.dead) return;
    if (target.kind === 'player') {
      target.hp = Math.max(0, target.hp - amount);
      this.send({ type: 'float', x: target.x, y: target.y, text: String(amount), color: C.BrightRed });
      if (target.hp <= 0) {
        target.dead = true;
        this.chat('', `${from} tears you down. The grave laughs at the irony.`, C.BrightRed);
        this.send({ type: 'gameOver' });
      }
      this.sendStats();
      this.dirty = true;
      return;
    }
    target.hp -= amount;
    this.send({ type: 'float', x: target.x, y: target.y, text: String(amount), color: C.Red });
    if (target.hp <= 0) {
      target.dead = true;
      this.entities.delete(target.id);
      if (this.wraith?.id === target.id) this.wraith = null;
      if (this.partner?.id === target.id) {
        this.partner = null;
        this.chat('', `${target.name} falls!`, C.BrightRed);
      }
      this.send({ type: 'effect', row: FX.GRAVE_SWIRL, x: target.x, y: target.y });
    }
    this.dirty = true;
  }

  /* ------------------------------------------------------------ helpers */

  private stepTowards(e: SimEntity, target: SimEntity): void {
    const dx = target.x - e.x;
    const dy = target.y - e.y;
    const tryDirs: Direction[] =
      Math.abs(dx) >= Math.abs(dy)
        ? [dx > 0 ? 'right' : 'left', dy > 0 ? 'down' : 'up']
        : [dy > 0 ? 'down' : 'up', dx > 0 ? 'right' : 'left'];
    for (const dir of tryDirs) {
      const [mx, my] = DIRS[dir];
      const nx = e.x + mx;
      const ny = e.y + my;
      if (this.walkable(e.screenId, nx, ny) && !this.occupied(e.screenId, nx, ny, e)) {
        e.dir = dir;
        e.x = nx;
        e.y = ny;
        this.dirty = true;
        return;
      }
    }
  }

  private dirTowards(e: SimEntity, target: SimEntity): Direction {
    const dx = target.x - e.x;
    const dy = target.y - e.y;
    if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'down' : 'up';
  }

  private walkable(
    screenId: string,
    x: number,
    y: number,
    forProjectile = false,
    throughAllies = false,
  ): boolean {
    const s = SCREENS[screenId];
    if (x < 0 || y < 0 || x >= s.width || y >= s.height) return false;
    if (s.collision[y][x] === 1) return false;
    if (!forProjectile && this.occupied(screenId, x, y, undefined, throughAllies)) return false;
    return true;
  }

  private occupied(
    screenId: string,
    x: number,
    y: number,
    ignore?: SimEntity,
    throughAllies = false,
  ): boolean {
    for (const e of this.entities.values()) {
      if (e === ignore || e.screenId !== screenId || e.x !== x || e.y !== y || e.dead) continue;
      // The necromancer walks through their own companions, never the reverse
      if (throughAllies && (e.kind === 'partner' || e.kind === 'summon')) continue;
      return true;
    }
    return false;
  }

  private monsterAt(screenId: string, x: number, y: number, _caster: SimEntity): SimEntity | null {
    for (const e of this.entities.values()) {
      if (e.kind === 'monster' && e.screenId === screenId && e.x === x && e.y === y && !e.dead) {
        return e;
      }
    }
    return null;
  }

  private monstersOn(screenId: string): SimEntity[] {
    return [...this.entities.values()].filter((e) => e.kind === 'monster' && e.screenId === screenId && !e.dead);
  }

  private nearestNpc(range: number): SimEntity | null {
    let best: SimEntity | null = null;
    let bestD = range + 1;
    for (const e of this.entities.values()) {
      if (e.kind !== 'npc' || e.screenId !== this.playerScreen) continue;
      const d = Math.abs(e.x - this.player.x) + Math.abs(e.y - this.player.y);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private warpTo(screenId: string, x: number, y: number): void {
    this.playerScreen = screenId;
    this.player.screenId = screenId;
    this.player.x = x;
    this.player.y = y;
    if (this.partner) {
      this.partner.screenId = screenId;
      this.partner.x = x;
      this.partner.y = Math.min(18, y + 1);
    }
    if (this.wraith) {
      this.wraith.screenId = screenId;
      this.wraith.x = x;
      this.wraith.y = Math.max(1, y - 1);
    }
    this.sendScreen();
  }

  private visibleEntities(): EntityState[] {
    return [...this.entities.values()]
      .filter((e) => e.screenId === this.playerScreen)
      .map(({ screenId: _s, homeX: _hx, homeY: _hy, wander: _w, npcDef: _n, nextMoveAt: _nm, nextAttackAt: _na, bite: _b, expiresAt: _e, partnerClass: _p, spellCooldowns: _sc, ...pub }) => pub);
  }

  private sendScreen(): void {
    this.send({ type: 'screen', screen: SCREENS[this.playerScreen], entities: this.visibleEntities() });
  }

  private sendStats(): void {
    const cooldowns: Record<string, number> = {};
    for (const [id, readyAt] of Object.entries(this.player.spellCooldowns)) {
      cooldowns[id] = Math.max(0, readyAt - this.now);
    }
    this.send({
      type: 'stats',
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      mp: this.playerMp,
      maxMp: this.playerMaxMp,
      cooldowns,
    });
  }

  private setQuest(stage: QuestStage, note?: string): void {
    this.questStage = stage;
    this.send({ type: 'quest', stage, note });
    this.saveState();
  }

  private saveState(): void {
    this.send({
      type: 'save',
      state: { stage: this.questStage, partner: this.partner?.partnerClass },
    });
  }

  private chat(from: string, text: string, color: number): void {
    this.send({ type: 'chat', from, text, color });
  }

  /** Transient failure feedback: floats over the caster, throttled, kept out of the log. */
  private failNote(text: string): void {
    const last = this.failNoteAt[text] ?? -Infinity;
    if (this.now - last < 1500) return;
    this.failNoteAt[text] = this.now;
    this.send({ type: 'float', x: this.player.x, y: this.player.y, text, color: C.Grey });
  }
}
