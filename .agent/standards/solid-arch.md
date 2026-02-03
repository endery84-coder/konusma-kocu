---
description: Apply SOLID principles
trigger: refactor OR complex_logic
---

# 🏛️ SOLID Architecture (Practical)

1) **Single Responsibility**
- One function/module = one job.

2) **DRY**
- Extract repeated logic into utilities/services.

3) **Layer boundaries**
- UI should not contain business rules.
- Business logic should not import UI components.
- Data access should be isolated (repo/service pattern).

4) **Small interfaces**
- Prefer small, composable modules over big “god” services.