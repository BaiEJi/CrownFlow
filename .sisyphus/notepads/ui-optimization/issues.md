# Issues and Gotchas

## Known Issues from Plan Analysis
- Statistics.tsx has disabled animations (`isAnimationActive={false}`) - major blocker for Stripe style
- Duplicate COLORS array in Statistics.tsx vs constants/colors.ts - causes dark mode issues
- Favicon is broken (missing `/vite.svg` file)
- Recharts library used for charts - need gradient SVG defs for modern look

## Potential Problems to Watch For
- Dark mode contrast compliance when adding gradients
- Responsive chart overflow at mobile breakpoints
- Table styling conflicts with Ant Design default styles
- Favicon format compatibility across browsers
## Dark Mode Contrast Issues (2026-04-05)
- Statistics page "统计图表" heading has LOW CONTRAST in dark mode
  - Text color: rgb(22, 104, 220) (#1668dc) - Ant Design primary blue
  - Background color: rgb(21, 50, 91) (#15325b) - dark blue background
  - Calculated contrast: 46.703 (below 125 threshold)
  - WCAG AA requires contrast ratio ≥ 4.5:1 (approximately 125 brightness difference)
  - Issue severity: MEDIUM - may affect readability for some users
  - Recommendation: Increase text brightness to rgba(255,255,255,0.85) or similar
  - Location: Statistics.tsx heading component
  - Do NOT fix in this task (verification only) - needs dedicated fix task

## Additional Low Contrast Elements (2026-04-05)
- rgba(255,255,255,0.85) text on rgba(255,255,255,0.25) background (contrast: 0)
  - Likely transparent/overlay element
  - May be acceptable if parent has proper background
- rgba(255,255,255,0.85) text on rgb(237,92,100) background (contrast: 118.733)
  - Red background element (possibly alert/tag)
  - Contrast below threshold but may be acceptable for accent elements
  - Check context: if it's a badge/tag, low contrast may be intentional for visual hierarchy

## Verification Completed (2026-04-05)
- Settings page dark mode: ALL CHECKS PASSED ✓
- Statistics page dark mode: PASSED with contrast warnings ⚠️
- No code modifications made (verification only)
- All evidence files captured successfully

## Responsive Testing Issues (2026-04-05)
- Settings page at 375px mobile: HORIZONTAL SCROLL DETECTED ⚠️
  - Horizontal scroll amount: 240px
  - Root cause: Sidebar (182px width) does NOT collapse at 375px breakpoint
  - Expected behavior: Sidebar should collapse/hide at mobile breakpoint (≤768px)
  - Impact: Poor mobile UX, requires horizontal scrolling on mobile devices
  - Issue severity: HIGH - critical mobile UX issue
  - Recommendation: Implement sidebar collapse at 768px breakpoint
  - Location: Layout.tsx or sidebar component (DO NOT modify in this task)
  - Note: Sidebar collapse logic NOT implemented in current version

- Settings page at 375px: Table columns TOO NARROW
  - Column 1 width: 41px (below 50px threshold)
  - Column 2 width: 30px (below 50px threshold)
  - Impact: Poor readability, cramped content on mobile
  - Severity: MEDIUM - usability concern but not critical
  - Recommendation: Use Ant Design Table scrollable feature for mobile

- Settings page at 375px: Sidebar should collapse
  - Current 768px media query in index.css (lines 35-63) may not trigger sidebar collapse
  - Need to verify if sidebar collapse is implemented in Layout.tsx
  - Mobile users forced to scroll horizontally due to sidebar presence

## Responsive Testing PASSED Breakpoints (2026-04-05)
- Statistics page: ALL breakpoints PASSED ✓
  - 375px: No horizontal scroll, charts fit viewport (181px width)
  - 768px: No horizontal scroll, charts fit viewport (574px width)
  - 1024px: No horizontal scroll, charts responsive layout (filter 806px, charts side-by-side)
  - 1440px: No horizontal scroll, charts fit viewport (1222px, 809px, 397px widths)

- Settings page: 3 breakpoints PASSED ✓
  - 768px: No horizontal scroll, table 524px width, cards grid adjusts
  - 1024px: No horizontal scroll, table 756px width, cards grid adjusts
  - 1440px: No horizontal scroll, table 1172px width, cards grid adjusts

- Settings page: 1 breakpoint FAILED ⚠️
  - 375px: Horizontal scroll 240px, sidebar not collapsing

## Responsive Testing Evidence Files Created (2026-04-05)
- `.sisyphus/evidence/task-10-statistics-375.png` (48K) - Mobile Statistics
- `.sisyphus/evidence/task-10-statistics-768.png` (70K) - Tablet Statistics
- `.sisyphus/evidence/task-10-statistics-1024.png` (74K) - Laptop Statistics
- `.sisyphus/evidence/task-10-statistics-1440.png` (83K) - Desktop Statistics
- `.sisyphus/evidence/task-10-settings-375.png` (82K) - Mobile Settings (shows horizontal scroll)
- `.sisyphus/evidence/task-10-settings-768.png` (86K) - Tablet Settings
- `.sisyphus/evidence/task-10-settings-1024.png` (95K) - Laptop Settings
- `.sisyphus/evidence/task-10-settings-1440.png` (98K) - Desktop Settings

## Responsive Testing Summary
- Statistics page: Perfect responsive behavior across all breakpoints
- Settings page: Responsive at tablet/desktop, issues at mobile (375px)
- Critical issue: Sidebar does NOT collapse at mobile breakpoint
- Recommendation: Implement sidebar collapse mechanism for mobile UX improvement
- No code modifications made (verification only) - needs dedicated fix task
