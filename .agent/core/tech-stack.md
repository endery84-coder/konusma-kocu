---
description: Enforce project specific technology stack
trigger: always_on
---

# 🧠 Tech Stack Awareness

1) **Discovery**
- Always read: `package.json` (or `go.mod` / `requirements.txt`) first.
- Match versions + existing patterns (React 18 vs 16, router choice, state lib, etc.)

2) **Consistency**
- Do NOT introduce a new library if an existing one already solves it.
- Prefer project’s established primitives (fetch/axios, form lib, logger, test runner).

3) **No deprecated APIs**
- Avoid deprecated framework APIs and old patterns already replaced in repo.

4) **If a new dependency is unavoidable**
- Provide: why needed + alternative you rejected + impact (bundle/perf/ops).