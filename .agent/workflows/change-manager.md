---
description: Review changes and prepare commits
trigger: pre_commit OR git_status
---

# 🕵️ Change Manager

1. **Audit:** Run linting and type-checking on changed files.
2. **Optimize:** Remove unused imports, format code.
3. **Commit Prep:**
   - Write a "Conventional Commit" message (e.g., `feat: add login`).
   - 🛑 **WAIT** for user confirmation before pushing code.