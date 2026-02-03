---
description: General coding standards and conventions
trigger: code_generation
---

# 📏 Coding Style & Conventions

## 1) No magic values
- ❌ `if (status === 2)`
- ✅ `if (status === Status.COMPLETED)` (enum/const)

## 2) Keep functions clean
- Single responsibility
- Prefer pure functions for business logic
- Avoid deeply nested logic; extract helpers

## 3) Arguments
- Max 3 args. If more, use an object parameter + destructuring.

## 4) Naming
- Follow `/standards/naming-conventions.md`

## 5) Comments
- Comment **why**, not what.
- Complex logic: short inline explanation.

## 6) Exported APIs must be documented
- Follow `/standards/documentation-standards.md`