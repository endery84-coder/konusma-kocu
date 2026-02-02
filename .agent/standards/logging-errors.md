---
description: Logging and Error Handling Standards
trigger: always_on
---

# 🚨 Logging & Errors

1. **Development vs Production:**
   - `console.log` is for debugging ONLY. Must be removed or converted to Logger before commit.
   - Use a proper Logger (Winston/Pino) for production apps.

2. **Error Handling:**
   - Never leave an empty `catch` block.
   - Always provide a user-friendly error message, but log the stack trace internally.

3. **Privacy:** NEVER log passwords, tokens, or PII (Personal Identifiable Information).