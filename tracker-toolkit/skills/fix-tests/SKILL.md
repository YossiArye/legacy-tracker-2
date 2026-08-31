---
name: fix-tests
description: Runs the test suite and fixes whatever is currently failing.
---

Current test output:

!`npm test 2>&1 | tail -30`

Based on the failures above, fix whatever is broken. Don't touch or
"fix" any test that's already passing — scope the change to exactly
what's failing right now.
