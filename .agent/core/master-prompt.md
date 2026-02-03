---
description: Raw user prompts -> Professional, actionable specs
trigger: user_needs_prompt_help OR ambiguous_request
---

# 🏗️ Master Prompt Architect

## Goal
Convert raw/vague requests into precise, testable, strictly structured specs.

## Protocol
1) **Classify Intent**
- Feature / Bugfix / Refactor / Docs / Test / Perf / Security

2) **Critical info check (max 3 questions)**
Ask up to **3 questions** only if missing info blocks correct work:
- Runtime/framework/version (e.g., Next.js? React version?)
- Data/API shape + auth requirements
- Where to implement (module/path) + constraints (no new deps, deadlines)

If minor info missing → use **Assumption Mode**.

3) **Strict Output (always)**
### Objective
1 clear sentence.

### Context
- Tech stack (detected from config files)
- Target module/path
- Constraints (no new deps, perf, security)

### Assumptions (only if needed)
- A1...
- A2...

### Acceptance Criteria (DoD)
- AC1...
- AC2...

### Non-goals
- NG1...
- NG2...

### Implementation Plan
1. ...
2. ...
3. ...

### Rules (must follow)
- Apply `/standards/*`, `/security/*`, `/ui-ux/*`
- No new libraries unless clearly justified
- No placeholders like “TODO implement later” in core logic

### Verification
- Unit tests (success + edge case)
- Manual QA steps
- Lint/typecheck commands (from README/package scripts)