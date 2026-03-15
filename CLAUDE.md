# Faroese Radio

A monorepo that scrapes real-time song/artist metadata from Faroese radio stations and displays it via a web UI.

## Architecture

**Monorepo** managed with pnpm workspaces:
- `packages/scraper` — Node.js scraper polling radio station APIs every 10s, writes to SQLite
- `packages/web-ui` — Next.js 13 app reading from the same SQLite database (read-only)
- `packages/database` — Unused placeholder

## Tech Stack

- **Language:** TypeScript (strict mode, v5.2.2)
- **Database:** SQLite via `better-sqlite3` (WAL mode)
- **Frontend:** Next.js 13.5, Vanilla Extract (CSS-in-JS), date-fns
- **Scraper:** ts-node, Zod for validation, eventsource for SSE stations
- **Production:** PM2 (`ecosystem.config.cjs`)

## Commands

```bash
# Development
pnpm start:scraper     # Run scraper
pnpm start:web         # Next.js dev server (port 3000)

# Build
pnpm build             # Build both packages
pnpm build:web         # Next.js build
pnpm build:scraper     # tsc to dist/

# Production
pnpm start             # PM2 (web + scraper), runs init-db first
pnpm backup:sqlite     # Backup DB to /data/backups/
```

## Environment Variables

| Variable | Description |
|---|---|
| `STATION_URL_RAS_2` | RAS2 station API endpoint |
| `STATION_URL_KVF` | KVF station SSE endpoint |
| `STATION_URL_KVF2` | KVF2 station SSE endpoint |
| `ALDAN_URL` | ALDAN station endpoint (in progress) |
| `DB_PATH` | SQLite path (default: `/data/app.db` in prod, `packages/scraper/database.sqlite` in dev) |
| `PORT` | Web server port (default: 3000) |

## Database Schema

Tables: `artists`, `songs` (with `artist_id` FK), `stations`, `plays` (with soft delete), `raw_play_data`

Schema defined in `packages/scraper/src/database.ts`, Zod schemas in `packages/scraper/src/schema.ts`.

## Key Files

- `packages/scraper/src/fetchers.ts` — Per-station fetch logic (RAS2, KVF, KVF2, ALDAN WIP)
- `packages/scraper/src/scraper.ts` — Main poll loop (10s interval)
- `packages/scraper/src/database.ts` — SQLite write operations
- `packages/web-ui/utils/database.ts` — Read-only DB helper for Next.js
- `ecosystem.config.cjs` — PM2 config (web on port 3000, scraper restarts at 6am daily)
- `scripts/init-db.js` — DB initialization (run automatically before `pnpm start`)
