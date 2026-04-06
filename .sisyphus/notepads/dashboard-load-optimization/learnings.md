# Learnings

## Context
- Dashboard.tsx currently imports MemberRankingCard and ExpiryCalendar directly (lines 22-23)
- These components call heavy APIs that slow down first-screen load
- App.tsx shows the pattern for lazy imports (lines 20-26) and Suspense fallback (lines 28-37)

## Patterns Found
- Lazy import pattern: `const Component = lazy(() => import('./path'))`
- Suspense fallback: `<Suspense fallback={<LoadingFallback />}>...</Suspense>`
- Card loading prop: `<Card loading={loading}>` (used in Dashboard.tsx:135, 144, 154, 172, 199)

## Key Files
- `frontend/src/pages/Dashboard.tsx` - Main file to modify
- `frontend/src/App.tsx` - Reference for lazy/Suspense patterns
- Target components: `MemberRankingCard`, `ExpiryCalendar`

## Timestamps
- 2026-04-04T15:01: Initial analysis completed
## Skeleton Component Patterns (2026-04-04T15:15)
- Inline skeleton components placed before main component (pattern: lines 25-41 in Dashboard.tsx)
- `MemberRankingSkeleton`: Card wrapper with `<Skeleton active avatar paragraph={{ rows: 3 }} />`
- `CalendarSkeleton`: Card wrapper with `<Skeleton active paragraph={{ rows: 8 }} />`
- Ant Design Skeleton props:
  - `active`: enables animation
  - `avatar`: shows avatar placeholder (for member ranking list)
  - `paragraph={{ rows: N }}`: sets number of text placeholder rows
- Inline approach avoids creating separate files for simple skeleton components

## Lazy Loading Implementation (2026-04-04T15:25)
- React imports update: `import React, { useMemo, useState, useEffect, lazy, Suspense } from 'react';`
- Lazy import syntax: `const Component = lazy(() => import('@/components/Component'));`
- Direct imports must be **deleted** when converting to lazy imports
- Suspense wrapping pattern:
  ```tsx
  <Suspense fallback={<SkeletonComponent />}>
    <LazyComponent />
  </Suspense>
  ```
- Build verification: Lazy-loaded components appear as separate chunks in build output
- Code-splitting successful: `MemberRankingCard` (5.06 kB), `ExpiryCalendar` (8.92 kB)
