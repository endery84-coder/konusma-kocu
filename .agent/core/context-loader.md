---
description: Load minimal project context before any coding
trigger: always_on
---

# 🧭 Context Loader (Run First)

## 1) Read these first (in order)
1. `README.md` (setup, scripts, env)
2. `.env.example` / `.env.*` (required variables)
3. One of: `package.json` / `go.mod` / `requirements.txt` (stack + deps)
4. Tooling: `tsconfig.json`, `eslint*`, `prettier*`, `tailwind.config*` (if exists)
5. Existing patterns: find 1 similar feature + its tests (copy the style)

## 2) Determine "Project Language" for comments/docs
- If repo comments/docs are mostly Turkish → write TR.
- If mostly English → write EN.
- If unclear → default **English** (don’t mix).

## 3) Before generating code, always produce
- Which files will change (short list)
- Assumptions (if any)
- Acceptance Criteria (what “done” means)
- Verification steps (tests + manual)