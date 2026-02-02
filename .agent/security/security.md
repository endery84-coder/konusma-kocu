---
description: Security guardrails
trigger: always_on
---

# 🛡️ Security Guardrails

1. **Input Validation:** Validate ALL user inputs (Zod/Yup).
2. **Secrets:** NEVER hardcode secrets. Use `process.env`.
3. **Injection Prevention:** Use parameterized queries for SQL. Sanitize HTML outputs.