---
paths: ["server/controllers/**"]
---

Every route handler in `server/controllers/` must validate its input via
`server/utils/validate.js` before touching the store — never trust
`req.body` fields directly.
