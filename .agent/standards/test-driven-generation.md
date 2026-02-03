---
trigger: user_request_feature
---

# ✅ Test Requirement (Practical)

1) **When tests are required**
- New business logic / data transforms / permissions → unit test required
- New component with behavior (loading/error/interaction) → test required

2) **Minimum**
- Include **Success Case** + at least **1 Edge Case**

3) **Use existing test stack**
- Jest/Vitest/PyTest/etc. (do not add new runner)

4) **When tests can be skipped**
- Trivial constants/types or pure re-export: OK to skip
- If skipping, leave a short note in PR summary (not as TODO in code)