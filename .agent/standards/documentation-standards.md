---
description: Documentation rules
trigger: always_on
---

# 📚 Documentation Standards

1) **Exported functions**
- Every exported function/class must have JSDoc/Docstring:
  - what it does
  - params
  - return value
  - important side effects (if any)

2) **Complexity**
- If logic is hard to read, add minimal inline comments explaining intent.

3) **Language**
- Do not mix languages in the same file.
- Use project language detected by `core/context-loader.md`.