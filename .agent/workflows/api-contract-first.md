---
trigger: api_integration OR fetch_request
---

# 🔌 API Contract-First Workflow

1) **Define contract first**
- TypeScript interface / schema for request + response
- Prefer existing repo conventions for API clients

2) **Error schema (recommended)**
- Normalize errors to something like:
  - `code`, `message`, `details?`, `traceId?`

3) **Error handling**
- Every request in `try/catch`
- Friendly user message + internal log

4) **Loading states**
- UI must manage `isLoading`
- Handle empty / retry scenario if relevant

5) **No mock drift**
- If API not ready: mock data must match the contract exactly