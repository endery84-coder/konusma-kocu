---
description: UI Theme and Design System Enforcement
trigger: ui_generation
---

# 🎨 UI & Design System

1. **Source of Truth:** Check for `theme.md`, `design-tokens.ts`, or Tailwind config.
2. **Compliance:**
   - Use defined colors/spacing strictly. NO arbitrary HEX codes.
   - Re-use existing UI components (Buttons, Cards) instead of creating new ones.
3. **Fallback:** If no theme exists, match the style of existing pages.