# Decisions

## Architecture Decisions
1. **Inline Skeleton**: Create skeleton components inline in Dashboard.tsx (no separate file)
   - Reason: Minimal change, simple scope
   - Alternative: Separate Skeleton.tsx file (rejected - over-engineering)

2. **React.lazy + Suspense**: Standard React pattern for code splitting
   - Reason: Built-in, no extra dependencies
   - Alternative: Manual dynamic import (rejected - more complex)

3. **No Error Boundary**: Keep scope minimal
   - Reason: Quick win focus, 1-2 hour estimate
   - Alternative: Add error boundaries (deferred - out of scope)

## Scope Boundaries
- ✅ Modify: Dashboard.tsx only
- ❌ Do NOT modify: MemberRankingCard.tsx, ExpiryCalendar.tsx, App.tsx, other pages
- ❌ Do NOT add: prefetch, Service Worker, cache strategies
- ❌ Do NOT change: useOverview/useReminders immediate parameter

## Timestamps
- 2026-04-04T15:01: Initial decisions documented