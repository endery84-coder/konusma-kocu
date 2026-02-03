---
description: Security guardrails
trigger: always_on
---

# 🛡️ Security Guardrails

1) **Input Validation**
- Validate ALL external inputs (request body/query/params/forms).
- Use repo’s existing validator (Zod/Yup/class-validator etc.). Don’t add new.

2) **Secrets**
- NEVER hardcode secrets. Use environment variables (`process.env`, config).
- Don’t commit tokens/keys into code, logs, or tests.

3) **Injection Prevention**
- SQL: parameterized queries only.
- HTML: sanitize outputs / escape where needed.
- Avoid dynamic `eval`, unsafe templating.

4) **AuthZ (Authorization)**
- Authentication is not enough: always enforce **permission checks** server-side.

5) **Safe errors**
- User sees friendly message; internal logs keep stack trace.
- Don’t leak internals in API responses.

6) **Do not log PII**
- No passwords, tokens, session ids, personal data in logs.