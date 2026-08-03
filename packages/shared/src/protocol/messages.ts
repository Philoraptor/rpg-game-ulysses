/**
 * Network Protocol - Message Types
 *
 * @module shared/protocol/messages
 * @fileoverview The client/server wire protocol. The SAME messages flow whether
 * the server is the built-in offline LocalGameServer (in-page) or, later, a real
 * WebSocket server (Phase 6). Client code must never reach around this protocol.
 */

export type Direction = 'up' | 'down' | 'left' | 'right';
export type PartnerClass = 'mage' | 'knight' | 'barbarian';

export type QuestStage =
  | 'not_started'
  | 'briefed'
  | 'in_well'
  | 'rats_cleared'
  | 'partner_chosen';

export type EntityKind = 'player' | 'npc' | 'monster' | 'partner' | 'summon';

/** Dynamic entity snapshot, broadcast by the server each simulation tick. */
export interface EntityState {
  id: string;
  kind: EntityKind;
  name: string;
  /** Key into the client's sprite table (walk/cast frame sets). */
  sprite: string;
  /** Tile coordinates (0-19 on a 20x20 screen). */
  x: number;
  y: number;
  dir: Direction;
  hp: number;
  maxHp: number;
  /** Render scale; giant mutated rats are ordinary rats grown wrong (2x). */
  scale?: number;
  /** Optional tint for mutation/boss variants (0xRRGGBB). */
  tint?: number;
  dead?: boolean;
}

/** Static screen payload sent on join and on every screen transition. */
export interface ScreenData {
  id: string;
  name: string;
  width: number;
  height: number;
  /** tiles1 atlas frame index per cell. */
  ground: number[][];
  /** Decor layer: tiles1 frame index or -1 for empty. */
  decor: number[][];
  /** 1 = blocked, 0 = walkable. */
  collision: number[][];
  /**
   * Decor tile indices that render ABOVE entities on rows south of them
   * (building roofs, tree crowns) so characters can walk behind them.
   */
  tallTiles: number[];
}

export type ClientMessage =
  | { type: 'join'; restore?: SaveState }
  | { type: 'move'; dir: Direction }
  | { type: 'face'; dir: Direction }
  | { type: 'cast'; spellId: string }
  | { type: 'interact' }
  | { type: 'choosePartner'; cls: PartnerClass }
  | { type: 'respawn' };

export type ServerMessage =
  | { type: 'welcome'; playerId: string; spellIds: string[] }
  | { type: 'screen'; screen: ScreenData; entities: EntityState[] }
  | { type: 'entities'; entities: EntityState[] }
  | { type: 'chat'; from: string; text: string; color: number }
  | { type: 'float'; x: number; y: number; text: string; color: number }
  | { type: 'effect'; row: number; x: number; y: number; loops?: number }
  | { type: 'charEffect'; row: number; entityId: string }
  | {
      type: 'stats';
      hp: number;
      maxHp: number;
      mp: number;
      maxMp: number;
      cooldowns: Record<string, number>;
    }
  | { type: 'quest'; stage: QuestStage; note?: string }
  | { type: 'partnerOffer' }
  | { type: 'gameOver' }
  | { type: 'save'; state: SaveState };

/** Minimal persistence blob the client stores in localStorage. */
export interface SaveState {
  stage: QuestStage;
  partner?: PartnerClass;
}

/**
 * Transport seam between client and server. LocalTransport implements this
 * in-memory today; a WebSocketTransport implements it in Phase 6 unchanged.
 */
export interface ClientTransport {
  send(msg: ClientMessage): void;
  onMessage(handler: (msg: ServerMessage) => void): void;
}
