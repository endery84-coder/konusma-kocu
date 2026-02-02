---
description: General coding standards and naming conventions
trigger: code_generation
---

# 📏 Coding Style & Conventions

1. **No Magic Values:**
   - ❌ `if (status === 2)`
   - ✅ `if (status === Status.COMPLETED)` (Use Enums/Constants).
   
2. **Naming:**
   - Variables: `camelCase`
   - Components/Classes: `PascalCase`
   - Files: `kebab-case`
   - Booleans: Start with `is`, `has`, `should`.

3. **Comments:**
   - Write JSDoc/Docstrings for all exported functions.
   - Do not comment explicit code; comment on "Why", not "What".