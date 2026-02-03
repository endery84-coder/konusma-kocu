---
trigger: always_on
---

# 🧹 Chore Manager

- Scan for `// TODO:` and report them (don’t silently ignore).
- Detect unused files/exports if tooling exists.
- If updating deps is requested: follow existing lockfile + run tests.
- Keep changes minimal and mechanical (no refactors during chores).