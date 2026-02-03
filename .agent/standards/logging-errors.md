---
description: Logging and Error Handling Standards
trigger: always_on
---

# 🚨 Logging & Errors

1) **Dev vs Prod**
- `console.log` only for local debugging.
- Before commit: remove or replace with project Logger.

2) **Error handling**
- No empty `catch`.
- User-facing message should be friendly.
- Log stack trace internally (no sensitive data).

3) **Privacy**
- NEVER log passwords/tokens/PII.

4) **Structured logs (if logger exists)**
- Include: `level`, `message`, and if available `requestId/traceId`.