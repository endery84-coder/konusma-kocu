---
description: Enforce project specific technology stack
trigger: always_on
---

# 🧠 Tech Stack Awareness

1. **Discovery:** Always read `package.json`, `go.mod`, or `requirements.txt` first.
2. **Consistency:**
   - Do NOT introduce new libraries if an existing one does the job.
   - Use the syntax version matching the project (e.g., React 18 vs 16).
3. **Forbidden:** Do not use deprecated APIs or generic placeholders.