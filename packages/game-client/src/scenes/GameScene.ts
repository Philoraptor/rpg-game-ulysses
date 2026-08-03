/**
 * GameScene — the thin renderer
 *
 * @module game-client/scenes/GameScene
 * @fileoverview Renders whatever the server says is true: screens, entities,
 * effects, float text. Sends input as protocol messages. Holds NO game rules —
 * if you find a damage number in this file, it is a bug.
 */

import Phaser from 'phaser';
import type {
  ClientTransport,
  Direction,
  EntityState,
  ScreenData,
  ServerMessage,
} from '@shared/protocol/messages';
import { LEGACY_COLORS } from '@shared/data/colors';
import { NECROMANCER_SPELLS } from '@shared/data/spellbook';
import { createLocalTransport } from '../net/transport';
import { SPRITES } from '../data/sprites';
import { GameUI } from '../ui/GameUI';

const TILE = 32;

interface RenderedEntity {
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Sprite;
  label: Phaser.GameObjects.Text;
  hpBar: Phaser.GameObjects.Rectangle;
  state: EntityState;
}

export class GameScene extends Phaser.Scene {
  private transport!: ClientTransport;
  private ui!: GameUI;
  private playerId = '';
  private tileImages: Phaser.GameObjects.Image[] = [];
  private rendered = new Map<string, RenderedEntity>();
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private heldDir: Direction | null = null;
  private gameOver = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.ui = new GameUI(
      (spellId) => this.transport.send({ type: 'cast', spellId }),
      (cls) => this.transport.send({ type: 'choosePartner', cls }),
    );

    this.transport = createLocalTransport();
    this.transport.onMessage((msg) => this.onServer(msg));

    const saved = localStorage.getItem('ulysses.save');
    let restore;
    if (saved !== null) {
      try {
        restore = JSON.parse(saved);
      } catch {
        restore = undefined;
      }
    }
    this.transport.send({ type: 'join', restore });

    const kb = this.input.keyboard;
    if (!kb) return;
    this.keys = {
      W: kb.addKey('W'),
      A: kb.addKey('A'),
      S: kb.addKey('S'),
      D: kb.addKey('D'),
      UP: kb.addKey('UP'),
      DOWN: kb.addKey('DOWN'),
      LEFT: kb.addKey('LEFT'),
      RIGHT: kb.addKey('RIGHT'),
    };
    kb.on('keydown-E', () => this.transport.send({ type: 'interact' }));
    kb.on('keydown-B', () => this.ui.toggleSpellbook());
    kb.on('keydown-R', () => {
      if (this.gameOver) {
        this.gameOver = false;
        this.ui.hideGameOver();
        this.transport.send({ type: 'respawn' });
      }
    });
    const castable = NECROMANCER_SPELLS.filter((s) => s.castable);
    for (let i = 0; i < Math.min(castable.length, 5); i++) {
      kb.on(`keydown-${['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][i]}`, () =>
        this.transport.send({ type: 'cast', spellId: castable[i].id }),
      );
    }
  }

  update(): void {
    if (!this.keys || this.gameOver) return;
    const dir = this.readDir();
    if (dir) this.transport.send({ type: 'move', dir });
  }

  private readDir(): Direction | null {
    const k = this.keys;
    if (k.W.isDown || k.UP.isDown) return 'up';
    if (k.S.isDown || k.DOWN.isDown) return 'down';
    if (k.A.isDown || k.LEFT.isDown) return 'left';
    if (k.D.isDown || k.RIGHT.isDown) return 'right';
    return null;
  }

  /* --------------------------------------------------------- server -> */

  private onServer(msg: ServerMessage): void {
    switch (msg.type) {
      case 'welcome':
        this.playerId = msg.playerId;
        this.ui.setSpells(msg.spellIds);
        break;
      case 'screen':
        this.renderScreen(msg.screen);
        this.syncEntities(msg.entities, true);
        break;
      case 'entities':
        this.syncEntities(msg.entities, false);
        break;
      case 'chat':
        this.ui.log(msg.from, msg.text, LEGACY_COLORS[msg.color] ?? '#ffffff');
        break;
      case 'float':
        this.floatText(msg.x, msg.y, msg.text, LEGACY_COLORS[msg.color] ?? '#ffffff');
        break;
      case 'effect':
        this.playTileEffect(msg.row, msg.x, msg.y);
        break;
      case 'charEffect': {
        const r = this.rendered.get(msg.entityId);
        if (r) this.playTileEffect(msg.row, r.state.x, r.state.y);
        break;
      }
      case 'stats':
        this.ui.setStats(msg.hp, msg.maxHp, msg.mp, msg.maxMp, msg.cooldowns);
        break;
      case 'quest':
        this.ui.setQuest(msg.stage, msg.note);
        break;
      case 'partnerOffer':
        this.ui.showPartnerChoice();
        break;
      case 'gameOver':
        this.gameOver = true;
        this.ui.showGameOver();
        break;
      case 'save':
        localStorage.setItem('ulysses.save', JSON.stringify(msg.state));
        break;
    }
  }

  /* -------------------------------------------------------- rendering */

  private renderScreen(screen: ScreenData): void {
    for (const img of this.tileImages) img.destroy();
    this.tileImages = [];
    for (const r of this.rendered.values()) r.container.destroy();
    this.rendered.clear();

    for (let y = 0; y < screen.height; y++) {
      for (let x = 0; x < screen.width; x++) {
        this.tileImages.push(
          this.add
            .image(x * TILE, y * TILE, 'tiles', this.tileFrame(screen.ground[y][x]))
            .setOrigin(0)
            .setDepth(0),
        );
        const d = screen.decor[y][x];
        if (d >= 0) {
          // Tall decor (roofs, tree crowns, the well rim) sits above entities
          // on rows north of it, so characters can walk behind buildings.
          const depth = screen.tallTiles.includes(d) ? 10 + y + 0.5 : 1;
          this.tileImages.push(
            this.add
              .image(x * TILE, y * TILE, 'tiles', this.tileFrame(d))
              .setOrigin(0)
              .setDepth(depth),
          );
        }
      }
    }
    this.ui.setLocation(screen.name);
  }

  private tileFrame(index: number): string {
    return `tiles1_${String(index).padStart(5, '0')}.png`;
  }

  private spriteFrame(index: number): string {
    return `Sprites_frame_${String(index).padStart(4, '0')}.png`;
  }

  private syncEntities(states: EntityState[], fresh: boolean): void {
    const seen = new Set<string>();
    for (const state of states) {
      seen.add(state.id);
      let r = this.rendered.get(state.id);
      if (!r) {
        r = this.createEntity(state);
        this.rendered.set(state.id, r);
      }
      this.updateEntity(r, state, fresh);
    }
    for (const [id, r] of [...this.rendered]) {
      if (!seen.has(id)) {
        r.container.destroy();
        this.rendered.delete(id);
      }
    }
  }

  private createEntity(state: EntityState): RenderedEntity {
    const sprite = this.add
      .sprite(TILE / 2, TILE / 2, 'sprites', this.spriteFrame(SPRITES[state.sprite]?.down[0] ?? 0))
      .setScale(state.scale ?? 1);
    if (state.tint !== undefined) sprite.setTint(state.tint);

    const label = this.add
      .text(TILE / 2, -6, state.name, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: state.kind === 'monster' ? '#ff5555' : state.kind === 'npc' ? '#ffff55' : '#55ffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1);

    const hpBar = this.add
      .rectangle(TILE / 2, -2, TILE, 3, 0x55ff55)
      .setOrigin(0.5, 0.5)
      .setVisible(state.kind === 'monster' || state.kind === 'partner' || state.kind === 'summon');

    const container = this.add
      .container(state.x * TILE, state.y * TILE, [sprite, label, hpBar])
      .setDepth(10 + state.y);
    return { container, sprite, label, hpBar, state };
  }

  private updateEntity(r: RenderedEntity, state: EntityState, snap: boolean): void {
    const moved = r.state.x !== state.x || r.state.y !== state.y;
    const tx = state.x * TILE;
    const ty = state.y * TILE;
    if (snap) {
      r.container.setPosition(tx, ty);
    } else if (moved) {
      this.tweens.add({ targets: r.container, x: tx, y: ty, duration: 140, ease: 'Linear' });
    }
    r.container.setDepth(10 + state.y);

    const def = SPRITES[state.sprite];
    if (def) {
      const animKey =
        state.dir === 'up'
          ? `${state.sprite}_up`
          : state.dir === 'down'
            ? `${state.sprite}_down`
            : `${state.sprite}_side`;
      r.sprite.setFlipX(state.dir === 'right');
      if (moved || snap) {
        r.sprite.play(animKey, true);
      } else if (r.sprite.anims.currentAnim?.key !== animKey) {
        r.sprite.play(animKey, true);
        r.sprite.anims.pause();
      }
    }

    const ratio = state.maxHp > 0 ? state.hp / state.maxHp : 0;
    r.hpBar.width = Math.max(2, TILE * ratio);
    r.hpBar.fillColor = ratio > 0.5 ? 0x55ff55 : ratio > 0.25 ? 0xffff55 : 0xff5555;

    r.state = state;
  }

  private playTileEffect(row: number, x: number, y: number): void {
    const fx = this.add
      .sprite(x * TILE + TILE / 2, y * TILE + TILE / 2, 'effects')
      .setDepth(50)
      .setScale(1.2);
    fx.play(`fx_${row}`);
    fx.once('animationcomplete', () => fx.destroy());
  }

  private floatText(x: number, y: number, text: string, color: string): void {
    const t = this.add
      .text(x * TILE + TILE / 2, y * TILE, text, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color,
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1)
      .setDepth(60);
    this.tweens.add({
      targets: t,
      y: t.y - 28,
      alpha: 0,
      duration: 1100,
      ease: 'Cubic.Out',
      onComplete: () => t.destroy(),
    });
  }
}
