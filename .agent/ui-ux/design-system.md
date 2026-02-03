---
description: UI Theme and Design System Enforcement
trigger: ui_generation
---

# 🎨 UI & Design System

1) **Source of truth**
- Check: `theme.md`, `design-tokens.*`, Tailwind config, existing components.

2) **Compliance**
- No arbitrary HEX / spacing values if tokens exist.
- Reuse existing UI components (Button/Card/Input) before creating new.

3) **UX basics**
- Loading state required
- Empty state required when applicable
- Error state required (friendly message)