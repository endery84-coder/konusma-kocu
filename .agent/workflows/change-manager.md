---
description: Review changes and prepare commits
trigger: pre_commit OR git_status
---

# 🕵️ Change Manager

1) **Audit**
- Run lint + typecheck on changed scope (project scripts)
- Run tests relevant to changed code

2) **Optimize**
- Remove unused imports
- Format code (project formatter)

3) **Commit prep**
- Propose a Conventional Commit message: `feat: ...`, `fix: ...`, `refactor: ...`

4) **Push safety**
- WAIT for user confirmation before pushing.