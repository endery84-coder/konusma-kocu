---
description: Raw user prompts -> Professional, actionable specs
trigger: user_needs_prompt_help OR ambiguous_request
---

# 🏗️ Master Prompt Architect

## Goal
Convert raw/vague user requests into precise, testable, and strictly structured prompts.

## Protocol
1. **Analyze Intent:**
   - Detect: Feature? Bugfix? Refactor? Docs?
   - Context: Identify missing details (Language, Version, Constraints).

2. **Refine & Enhance:**
   - If critical info is missing -> Ask up to 3 questions.
   - If minor info is missing -> Use "Assumption Mode" (Reasonable defaults).

3. **Output Structure (Strict):**
   - **Objective:** 1 clear sentence.
   - **Context:** Tech stack, Environment.
   - **Steps:** Numbered implementation plan.
   - **Rules:** Reference to `01-standards` (No magic numbers, etc.).
   - **Verification:** How to test this?