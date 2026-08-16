# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install deps
npm run dev           # run API (4000) + Vite client (5173) together, via concurrently
npm run dev:server    # API only, port 4000 (PORT env var overrides)
npm run dev:client    # Vite client only
npm test              # run all tests (vitest, server/__tests__/**/*.test.js)
npx vitest run server/__tests__/store.test.js   # run a single test file
npx vitest run -t "test name"                   # run tests matching a name
npm run lint           # eslint .
npm run build          # vite build -> dist/
```

There is no test setup for the client — `vitest.config.js` only includes `server/__tests__/**/*.test.js`.

## Architecture

Two independent runtimes in one repo, wired together only in dev via a proxy:

- **`server/`** — Express API, in-memory data, no persistence.
- **`client/`** — React SPA (Vite root is `client`, see `vite.config.js`).

In dev, Vite proxies `/api/*` to `http://localhost:4000` (`vite.config.js`). The client's `fetch` calls always use the relative base URL `/api/tasks` (`client/src/api/tasksApi.js`) — there is no absolute API host anywhere in the client. In production this proxy doesn't exist, so the client must be served from the same origin as the API (or behind a reverse proxy that maps `/api`).

### Server request flow

`server/index.js` → `server/routes/tasks.js` (mounted at `/api/tasks`) → `server/controllers/tasksController.js` → `server/store.js`.

Route order in `routes/tasks.js` matters: `GET /next` is declared before `GET /:id` so it isn't shadowed by the param route. `POST /import` isn't actually at risk of shadowing — it's a different HTTP method than `GET /:id`, and there's no `POST /:id` route to conflict with.

- **`server/store.js`** is the only place task data lives — a plain in-memory array, reseeded from `SEED_TASKS` in `server/index.js` on every server start. Nothing survives a restart.
- **`server/activityLog.js`** is a separate in-memory log of create/update/delete actions, also wiped on restart. It simulates an external logging call with an artificial 50ms delay — treat calls to `record()` as async for that reason.
- **`server/utils/validate.js`** is the single source of truth for task validation rules (title length, allowed priorities) and is used by both `createTask` and `updateTask` (via the `partial` option) — extend here rather than duplicating checks in the controller.
- `bulkImportTasks` in the controller is the most complex handler: it parses `"title,priority"` lines, dedupes by lowercased title, auto-escalates priority to `high` on urgent keywords, and returns a per-line skip/create report. There's a TODO in the source noting it should be split up before adding file-upload support — keep that in mind before extending it further.

### Client state

There is no global state library (no Redux/Zustand/Context). All server-derived state lives in one hook, `client/src/hooks/useTasks.js`, which owns the `tasks` array and does an optimistic update for `toggleComplete` (applies the flip locally, reverts on API failure). `App.jsx` separately owns UI-only `filter` state and derives the visible list by filtering client-side — the backend's `?completed=` query param support is unused by the client.

`client/src/components/TaskList.jsx` renders the task `<ul>`, delegating each row to `TaskItem.jsx`; it's rendered from `App.jsx` and fed the filtered `visibleTasks` array.
