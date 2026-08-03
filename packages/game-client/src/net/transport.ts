/**
 * LocalTransport — in-memory client/server seam
 *
 * @module game-client/net/transport
 * @fileoverview Connects the renderer to the built-in offline server through
 * the same one-way message queues a WebSocket would provide. Delivery is
 * deferred to a microtask so neither side can cheat with synchronous access.
 */

import type { ClientMessage, ClientTransport, ServerMessage } from '@shared/protocol/messages';
import { LocalGameServer } from '../server/LocalGameServer';

export function createLocalTransport(): ClientTransport {
  let clientHandler: ((msg: ServerMessage) => void) | null = null;
  const pending: ServerMessage[] = [];

  const server = new LocalGameServer((msg) => {
    queueMicrotask(() => {
      if (clientHandler) clientHandler(msg);
      else pending.push(msg);
    });
  });

  return {
    send(msg: ClientMessage): void {
      queueMicrotask(() => server.handleMessage(msg));
    },
    onMessage(handler: (msg: ServerMessage) => void): void {
      clientHandler = handler;
      while (pending.length > 0) handler(pending.shift() as ServerMessage);
    },
  };
}
