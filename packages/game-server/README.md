# Game Server

Node.js + Fastify server for multiplayer game.

## Technology

- Node.js 20 LTS
- Fastify (web framework)
- WebSocket (real-time communication)
- Drizzle ORM + PostgreSQL
- Redis (caching, sessions)

## Structure

```
/src/
  /api/         - REST endpoints (auth, account)
  /websocket/   - WebSocket handlers
  /game-loop/   - Server tick, physics
  /database/    - Drizzle models, migrations
  /scripts/     - Event system, quest logic
  server.ts     - Entry point
```

## Development

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm start        # Run production build
```

## Status

⏳ Phase 6 - Not yet implemented
