---
name: add-endpoint
description: Scaffolds a new API endpoint (route + controller + test) for a given resource and HTTP method. Scaffold only — wiring and a stub handler, never the business logic.
argument-hint: <resource> <method>
---

Scaffold a new endpoint for resource "$1" using HTTP method "$2".

**Scaffold only.** Produce the wiring and a stub handler — do NOT implement
the endpoint's actual behavior, even when it seems obvious. Concretely, the
new handler must:
- validate `req.body` / `req.query` via `server/utils/validate.js` (this part
  is real, not a stub — it's required by `.claude/rules/api-rules.md`),
- `log()` that the endpoint was hit,
- return `res.status(501).json({ error: 'Not implemented' })`,
- carry a `TODO:` comment naming what's left to build (store reads/writes,
  `activityLog.record()` calls, the real response shape).

It must NOT read from or write to `server/store.js`, and must not import
`server/activityLog.js`. Leaving those out is the point of the command — the
human writes the behavior afterwards.

Follow the existing style exactly — don't invent a new style:
- Route wiring: match `server/routes/tasks.js`
- Controller: match `tasksController.js`'s shape — validate input via
  `server/utils/validate.js` before touching the store (required by
  `CLAUDE.md`), `const` over `let`, JSDoc on the new exported function,
  `log()` from `server/utils/logger.js` instead of `console.log`
- Test: match `server/__tests__/tasksController.test.js`'s style

If `server/routes/$1.js` already exists, add the "$2" handler to the files
that are already there instead of creating new ones — same steps, applied to
the existing router, controller, validator, and test file.

Steps:
1. Create `server/routes/$1.js`, mounted at `/api/$1`.
2. Create `server/controllers/$1Controller.js` with the stub "$2" handler
   described above.
3. Add a minimal validator to `server/utils/validate.js` if "$1" doesn't
   have one yet.
4. Mount the new router in `server/index.js` next to the existing
   `/api/tasks` mount.
5. Write `server/__tests__/$1Controller.test.js` with two cases: a valid
   payload reaches the handler (assert 501), and one invalid payload is
   rejected (assert 400). Don't write tests for behavior that isn't built.
6. Run the full test suite, make sure the new test passes, and nothing
   else broke.
7. Report what the endpoint does NOT do yet, so the human knows exactly
   what's left to implement.
