# CrownFlow UI/UX Optimization Plan

## TL;DR

> **Quick Summary**: Optimize Statistics and Settings pages for modern data visualization aesthetics (Stripe/Vercel style), add crown+flow favicon, use Playwright screenshot QA.
> 
> **Deliverables**:
> - Statistics page: Modern chart styling with animations and enhanced tooltips
> - Settings page: Optimized table styling for Category tab (keep Member tab cards)
> - Favicon: Crown + flow combination icon (SVG + PNG fallback)
> - QA: Playwright screenshot comparison before/after
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Favicon → Statistics Animations → Settings Table → QA Verification

---

## Context

### Original Request
User wants UI/UX optimization for:
1. Statistics page - more modern, better looking
2. Settings page - better presentation
3. Other optimizations (not new features)
4. Website favicon

### Interview Summary
**Key Discussions**:
- Design style: Data visualization enhancement (Stripe/Vercel style)
- Statistics: Chart animations, tooltips, gradient fills
- Settings: Hybrid approach - optimize table in Category tab, keep cards in Member tab
- Color scheme: Keep existing Ant Design blue theme
- Favicon: Crown + flow combination icon
- QA strategy: Playwright screenshot comparison

**Research Findings**:
- Statistics has disabled animations (`isAnimationActive={false}`) - major blocker for Stripe style
- Duplicate COLORS array in Statistics.tsx vs constants/colors.ts - causes dark mode issues
- Recharts library used for charts - need gradient SVG defs for modern look
- Favicon is broken (missing `/vite.svg` file)
- WCAG AA contrast compliance required for dark mode

### Metis Review
**Identified Gaps** (addressed in plan):
- Animations disabled: Will enable in Statistics.tsx (lines 278, 328)
- COLORS duplication: Will use constants/colors.ts import
- Table styling specifics: Will implement hover, spacing, typography improvements
- Favicon format: SVG primary + PNG fallback for legacy browsers

---

## Work Objectives

### Core Objective
Enhance visual presentation of Statistics and Settings pages to achieve modern data visualization aesthetics without adding new features.

### Concrete Deliverables
- Statistics page with animated, gradient-filled charts and enhanced tooltips
- Settings Category tab with optimized table styling (better spacing, hover effects)
- Crown+flow favicon in public/ folder (SVG + PNG + favicon.ico)
- Playwright QA evidence showing before/after comparison

### Definition of Done
- [ ] Playwright screenshots show visual improvement (before/after comparison)
- [ ] Chart animations active and smooth (300-500ms entrance)
- [ ] Dark mode supported for all new styling elements
- [ ] Favicon loads in browser tab (check network tab)
- [ ] WCAG AA contrast maintained in dark mode
- [ ] Responsive breakpoints tested: 375px, 768px, 1024px, 1440px

### Must Have
- Enable chart animations (remove `isAnimationActive={false}`)
- Use constants/colors.ts COLORS (remove duplicate)
- Gradient fills for trend chart (AreaChart with SVG defs)
- Optimized table styling for CategoryManageTab
- Working favicon in public/ folder

### Must NOT Have (Guardrails from Metis)
- NO Dashboard.tsx or Layout.tsx modifications
- NO new features beyond visual improvements
- NO Ant Design blue color scheme changes (#1890ff)
- NO new npm dependencies
- NO MemberCategoryTab grid structure changes (xs:1, sm:2, md:3, lg:3, xl:4, xxl:4)
- NO WCAG AA contrast removal
- NO data fetching hooks modifications (useStats, useCategories)
- NO backend API call changes

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright in package.json)
- **Automated tests**: NO (visual QA, not unit tests)
- **Framework**: Playwright for screenshot comparison
- **Agent-Executed QA**: Playwright before/after screenshots + dark mode + responsive testing

### QA Policy
Every task MUST include agent-executed QA scenarios with Playwright.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) - Navigate, wait for animations, snapshot + screenshot
- **Responsive**: Use Playwright browser_resize for 375px, 768px, 1024px, 1440px testing
- **Dark Mode**: Use Playwright browser_evaluate to set localStorage theme-mode
- **Favicon**: Use Playwright browser_evaluate to check favicon href

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - favicon + baseline capture):
├── Task 1: Capture baseline screenshots (quick)
├── Task 2: Create favicon assets (quick)
└── Task 3: Update favicon reference in index.html (quick)

Wave 2 (After Wave 1 - Statistics chart modernization):
├── Task 4: Enable chart animations (quick)
├── Task 5: Add gradient fills to trend chart (visual-engineering)
├── Task 6: Optimize chart tooltips and styling (visual-engineering)
└── Task 7: Use constants/colors.ts COLORS (quick)

Wave 3 (After Wave 2 - Settings table optimization + QA):
├── Task 8: Optimize CategoryManageTab table styling (visual-engineering)
├── Task 9: Verify dark mode support (quick)
├── Task 10: Responsive testing (quick)
└── Task 11: Final QA screenshot comparison (quick)

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Visual QA execution (unspecified-high + playwright skill)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: T1 → T4 → T5 → T8 → T11 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 3 (Wave 1), 4 (Wave 2), 4 (Wave 3)
```

### Dependency Matrix

- **1**: - - 9, 11, 1 (baseline capture blocks QA comparison)
- **2**: - 3, 1 (favicon creation blocks HTML reference)
- **3**: 2 - 11, 1 (HTML reference blocks favicon verification)
- **4**: - 5, 7, 1 (animations enable gradient + tooltip tasks)
- **5**: 4 - 9, 1 (gradient fills test dark mode)
- **6**: 4 - 9, 1 (tooltip styling test dark mode)
- **7**: 4 - 6, 2 (COLORS import unifies styling)
- **8**: - 9, 11, 1 (table styling test dark + responsive)
- **9**: 5, 6, 8 - 11, 2 (dark mode test after styling changes)
- **10**: 8 - 11, 2 (responsive test after table changes)
- **11**: 1, 3, 9, 10 - F1-F4, 3 (final QA after all changes)

### Agent Dispatch Summary

- **Wave 1**: **3 tasks** - T1 → `quick`, T2 → `quick`, T3 → `quick`
- **Wave 2**: **4 tasks** - T4 → `quick`, T5 → `visual-engineering`, T6 → `visual-engineering`, T7 → `quick`
- **Wave 3**: **4 tasks** - T8 → `visual-engineering`, T9 → `quick`, T10 → `quick`, T11 → `quick`
- **Wave FINAL**: **4 tasks** - F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Capture Baseline Screenshots (Before Any Changes)

  **What to do**:
  - Use Playwright to navigate to Statistics page (http://117.72.98.99:60001/statistics)
  - Wait for charts to fully render (2 seconds)
  - Capture baseline screenshot: `.sisyphus/evidence/baseline-statistics-light.png`
  - Capture accessibility snapshot: `.sisyphus/evidence/baseline-statistics-light.md`
  - Toggle to dark mode via localStorage `'theme-mode': 'dark'`
  - Capture dark mode screenshot: `.sisyphus/evidence/baseline-statistics-dark.png`
  - Navigate to Settings page, capture both tabs:
    - CategoryManageTab: `.sisyphus/evidence/baseline-settings-category.png`
    - MemberCategoryTab: `.sisyphus/evidence/baseline-settings-member.png`
  - Test responsive at 375px: `.sisyphus/evidence/baseline-statistics-375.png`

  **Must NOT do**:
  - Do not modify any source code files
  - Do not deploy changes before capturing baseline

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward screenshot capture task, no implementation complexity
  - **Skills**: [`playwright`]
    - `playwright`: Required for browser automation, navigation, screenshot capture, dark mode toggle
  - **Skills Evaluated but Omitted**:
    - `visual-engineering`: No visual design decisions needed, only capture existing state

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 11 (final QA needs baseline for comparison)
  - **Blocked By**: None (can start immediately)

  **References**:
  - **Pattern References**:
    - `frontend/src/pages/Statistics.tsx:278-328` - Current chart rendering with disabled animations (baseline state)
    - `frontend/src/pages/Settings.tsx:69-150` - CategoryManageTab table structure
    - `frontend/src/pages/Settings.tsx:152-200` - MemberCategoryTab card layout
  - **API/Type References**:
    - `frontend/src/constants/colors.ts:COLORS` - Current color constants (will change)
    - `frontend/src/index.css:35-63` - Dark mode CSS overrides (baseline dark mode styling)
  - **Test References**:
    - `package.json:devDependencies.playwright` - Playwright testing framework available
  - **External References**:
    - Playwright docs: https://playwright.dev/docs/screenshots
  - **WHY Each Reference Matters**:
    - Statistics.tsx:278-328 - Shows current chart state (disabled animations) for baseline comparison
    - colors.ts:COLORS - Will be modified later, need baseline to verify changes
    - index.css:35-63 - Dark mode baseline, changes may affect dark mode styling

  **Acceptance Criteria**:
  - [ ] Baseline screenshots captured for all 4 scenarios (statistics light/dark, settings category/member)
  - [ ] Accessibility snapshots saved as .md files
  - [ ] Responsive baseline at 375px captured
  - [ ] Evidence files exist in `.sisyphus/evidence/` directory

  **QA Scenarios**:

  ```
  Scenario: Baseline Statistics Light Mode
    Tool: Playwright
    Preconditions: Browser open, no localStorage theme override
    Steps:
      1. playwright_browser_navigate(url: "http://117.72.98.99:60001/statistics")
      2. playwright_browser_wait_for(time: 2)  // Wait for charts to render
      3. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/baseline-statistics-light.png", type: png)
      4. playwright_browser_snapshot(filename: ".sisyphus/evidence/baseline-statistics-light.md")
    Expected Result: Evidence files exist with valid PNG content
    Failure Indicators: Files not created, PNG size 0 bytes, snapshot empty
    Evidence: .sisyphus/evidence/baseline-statistics-light.png, baseline-statistics-light.md

  Scenario: Baseline Statistics Dark Mode
    Tool: Playwright
    Preconditions: Statistics page loaded
    Steps:
      1. playwright_browser_evaluate(function: "() => { localStorage.setItem('theme-mode', 'dark'); window.dispatchEvent(new CustomEvent('theme-change')); }")
      2. playwright_browser_wait_for(time: 1)  // Wait for dark mode transition
      3. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/baseline-statistics-dark.png", type: png)
      4. playwright_browser_snapshot(filename: ".sisyphus/evidence/baseline-statistics-dark.md")
    Expected Result: Dark mode applied, evidence captured
    Failure Indicators: Light mode still showing, colors unchanged
    Evidence: .sisyphus/evidence/baseline-statistics-dark.png

  Scenario: Responsive Baseline 375px
    Tool: Playwright
    Preconditions: Statistics page loaded
    Steps:
      1. playwright_browser_resize(width: 375, height: 667)  // iPhone SE size
      2. playwright_browser_navigate(url: "http://117.72.98.99:60001/statistics")
      3. playwright_browser_wait_for(time: 2)
      4. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/baseline-statistics-375.png", type: png)
      5. playwright_browser_snapshot(filename: ".sisyphus/evidence/baseline-statistics-375.md")
    Expected Result: Charts fit within 375px viewport, no overflow
    Failure Indicators: Charts overflow viewport, horizontal scrolling required
    Evidence: .sisyphus/evidence/baseline-statistics-375.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/baseline-statistics-light.png` - Light mode baseline
  - [ ] `.sisyphus/evidence/baseline-statistics-dark.png` - Dark mode baseline
  - [ ] `.sisyphus/evidence/baseline-settings-category.png` - Settings Category tab baseline
  - [ ] `.sisyphus/evidence/baseline-settings-member.png` - Settings Member tab baseline
  - [ ] `.sisyphus/evidence/baseline-statistics-375.png` - Mobile baseline

  **Commit**: NO (baseline capture, no code changes)

- [x] 2. Create Favicon Assets (Crown + Flow Combination)

  **What to do**:
  - Create SVG favicon with crown + flowing curves icon
  - Design elements: Crown shape on top, flowing wave/curves underneath representing "Flow"
  - Use Ant Design blue color (#1890ff) for consistency with existing theme
  - Create PNG fallback versions:
    - favicon-16x16.png (16x16 pixels, 8-bit)
    - favicon-32x32.png (32x32 pixels, 8-bit)
    - favicon.ico (multi-resolution ICO file with 16x16 and 32x32)
  - Optionally create apple-touch-icon.png (180x180) for iOS
  - Save all files to `frontend/public/` directory (create if doesn't exist)
  - Test SVG renders correctly in browser (no malformed SVG errors)

  **Must NOT do**:
  - Do not use copyrighted icons/images
  - Do not create overly complex SVG (file size < 5KB)
  - Do not use non-brand colors (must use #1890ff or similar)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Asset creation task, straightforward SVG design with clear specifications
  - **Skills**: [`visual-engineering`]
    - `visual-engineering`: Required for icon design, SVG creation, visual aesthetics
  - **Skills Evaluated but Omitted**:
    - `playwright`: Not needed for asset creation, will be used in Task 3 for verification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 3 (HTML reference needs favicon files)
  - **Blocked By**: None (can start immediately)

  **References**:
  - **Pattern References**:
    - `frontend/src/components/Layout.tsx:7` - "CrownFlow" brand name, favicon should reflect
    - `frontend/src/main.tsx:30-35` - Ant Design ConfigProvider theme with blue color (#1890ff)
  - **API/Type References**:
    - None (static asset creation)
  - **Test References**:
    - None (visual asset, will be verified in Task 3)
  - **External References**:
    - SVG best practices: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial
    - Favicon generation: https://realfavicongenerator.net/ (for reference, not to use)
  - **WHY Each Reference Matters**:
    - Layout.tsx:7 - Brand name "CrownFlow" informs icon design (crown + flow)
    - main.tsx:30-35 - Theme color #1890ff ensures favicon matches brand identity

  **Acceptance Criteria**:
  - [ ] `frontend/public/favicon.svg` created with valid SVG syntax
  - [ ] SVG file size < 5KB
  - [ ] PNG fallbacks created: favicon-16x16.png, favicon-32x32.png
  - [ ] favicon.ico created (multi-resolution)
  - [ ] SVG contains crown shape + flowing curves
  - [ ] SVG uses #1890ff color (Ant Design blue)

  **QA Scenarios**:

  ```
  Scenario: SVG Validity Check
    Tool: Bash
    Preconditions: frontend/public/favicon.svg created
    Steps:
      1. Read frontend/public/favicon.svg file content
      2. Validate SVG starts with '<svg' and ends with '</svg>'
      3. Check file size < 5KB: `stat -c%s frontend/public/favicon.svg`
      4. grep for 'crown' or 'flow' elements in SVG content (visual elements present)
    Expected Result: SVG valid, file size < 5KB, contains crown/flow design elements
    Failure Indicators: Malformed SVG, file size > 5KB, missing design elements
    Evidence: .sisyphus/evidence/task-2-favicon-svg-check.md

  Scenario: PNG Files Created
    Tool: Bash
    Preconditions: frontend/public/ directory exists
    Steps:
      1. ls frontend/public/*.png
      2. Verify favicon-16x16.png exists
      3. Verify favicon-32x32.png exists
      4. Check PNG file sizes: `stat -c%s frontend/public/favicon-16x16.png` (expected: ~1KB)
    Expected Result: All PNG files created with reasonable sizes
    Failure Indicators: PNG files missing, file sizes 0 bytes
    Evidence: .sisyphus/evidence/task-2-favicon-png-check.md
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-2-favicon-svg-check.md` - SVG validation report
  - [ ] `.sisyphus/evidence/task-2-favicon-png-check.md` - PNG files list
  - [ ] Optional: `.sisyphus/evidence/task-2-favicon-preview.png` - Rendered favicon screenshot

  **Commit**: YES (groups with Task 3)
  - Message: `style: add favicon with crown+flow icon`
  - Files: `frontend/public/favicon.svg`, `frontend/public/favicon-16x16.png`, `frontend/public/favicon-32x32.png`, `frontend/public/favicon.ico`
  - Pre-commit: None (static assets)

- [x] 3. Update Favicon Reference in index.html

  **What to do**:
  - Read `frontend/index.html`
  - Replace existing favicon link (currently `<link rel="icon" type="image/svg+xml" href="/vite.svg" />`)
  - Add multiple favicon link tags for cross-browser support:
    ```html
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
    ```
  - Optionally add apple-touch-icon: `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`
  - Verify paths are correct (relative to frontend root, will be served by Vite)
  - Test favicon loads in browser after changes

  **Must NOT do**:
  - Do not use absolute URLs (use relative paths like `/favicon.svg`)
  - Do not remove existing meta tags or other HTML content
  - Do not change HTML structure beyond favicon links

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple HTML edit, add favicon links, straightforward
  - **Skills**: []
    - No special skills needed for HTML edit
  - **Skills Evaluated but Omitted**:
    - `playwright`: Will be used in Task 11 for favicon verification, not needed here

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 11 (favicon verification needs HTML reference)
  - **Blocked By**: Task 2 (needs favicon files created)

  **References**:
  - **Pattern References**:
    - `frontend/index.html` - Current HTML structure, locate favicon link section
  - **API/Type References**:
    - None (HTML static file)
  - **Test References**:
    - None (will be verified in Task 11)
  - **External References**:
    - HTML favicon best practices: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel#icon
  - **WHY Each Reference Matters**:
    - index.html - Contains current broken favicon reference, need to replace with correct paths

  **Acceptance Criteria**:
  - [ ] `frontend/index.html` updated with new favicon links
  - [ ] Favicon links include SVG, PNG, and ICO formats
  - [ ] All favicon paths use relative URLs (`/favicon.svg`, not `http://...`)
  - [ ] HTML still valid (no syntax errors)

  **QA Scenarios**:

  ```
  Scenario: HTML Favicon Links Check
    Tool: Bash
    Preconditions: frontend/index.html updated
    Steps:
      1. Read frontend/index.html content
      2. grep for '<link rel="icon"' lines
      3. Verify at least 3 favicon link variants present (SVG, PNG, ICO)
      4. Verify all href paths start with '/' (relative URLs)
    Expected Result: Multiple favicon links present with correct paths
    Failure Indicators: Missing favicon links, wrong paths, syntax errors
    Evidence: .sisyphus/evidence/task-3-favicon-html-check.md
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-3-favicon-html-check.md` - HTML favicon links validation

  **Commit**: YES (groups with Task 2)
  - Message: `style: add favicon with crown+flow icon`
  - Files: `frontend/index.html`
  - Pre-commit: None (HTML static file)

- [x] 4. Enable Chart Animations in Statistics.tsx

  **What to do**:
  - Read `frontend/src/pages/Statistics.tsx`
  - Locate LineChart component (line ~278): `<Line ... isAnimationActive={false} />`
  - Remove `isAnimationActive={false}` or set to `isAnimationActive={true}`
  - Locate PieChart component (line ~328): `<Pie ... isAnimationActive={false} />`
  - Remove `isAnimationActive={false}` or set to `isAnimationActive={true}`
  - Optionally add animation configuration:
    - For LineChart: `animationDuration={500}`, `animationEasing="ease-out"`
    - For PieChart: `animationDuration={300}`, `animationEasing="ease-out"`
  - Verify animations are smooth, no stuttering on mobile devices
  - Test animations complete before screenshot capture (add wait time)

  **Must NOT do**:
  - Do not change chart data or data fetching logic
  - Do not remove or modify existing chart components beyond animation settings
  - Do not add excessive animation duration (>1000ms)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple prop change in existing Recharts components, no complex implementation
  - **Skills**: []
    - No special skills needed for prop modification
  - **Skills Evaluated but Omitted**:
    - `visual-engineering`: Animation timing is straightforward, no design decisions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7)
  - **Blocks**: Tasks 5, 6, 7 (animations enable gradient + tooltip styling tasks)
  - **Blocked By**: Task 1 (needs baseline to compare animation change)

  **References**:
  - **Pattern References**:
    - `frontend/src/pages/Statistics.tsx:278` - LineChart with `isAnimationActive={false}`
    - `frontend/src/pages/Statistics.tsx:328` - PieChart with `isAnimationActive={false}`
  - **API/Type References**:
    - Recharts LineChart API: https://recharts.org/en-US/api/LineChart
    - Recharts PieChart API: https://recharts.org/en-US/api/PieChart
  - **Test References**:
    - None (visual verification in Task 11)
  - **External References**:
    - Recharts animation docs: https://recharts.org/en-US/guide/animations
  - **WHY Each Reference Matters**:
    - Statistics.tsx:278 - Current disabled animation, need to enable
    - Statistics.tsx:328 - PieChart also disabled, need to enable
    - Recharts API - Animation configuration options (duration, easing)

  **Acceptance Criteria**:
  - [ ] `frontend/src/pages/Statistics.tsx` updated with `isAnimationActive={true}` or prop removed
  - [ ] LineChart animations active (500ms entrance animation)
  - [ ] PieChart animations active (300ms entrance animation)
  - [ ] No performance issues on mobile (test at 375px viewport)

  **QA Scenarios**:

  ```
  Scenario: Animation Props Check
    Tool: Bash
    Preconditions: frontend/src/pages/Statistics.tsx updated
    Steps:
      1. Read frontend/src/pages/Statistics.tsx content
      2. grep for 'isAnimationActive' occurrences
      3. Verify no `isAnimationActive={false}` found
      4. Verify animations present (either prop removed or set to true)
    Expected Result: No disabled animations, animations enabled
    Failure Indicators: Still has `isAnimationActive={false}` lines
    Evidence: .sisyphus/evidence/task-4-animations-check.md

  Scenario: Animation Visual Test (after implementation)
    Tool: Playwright
    Preconditions: Statistics page loaded, animations enabled
    Steps:
      1. playwright_browser_navigate(url: "http://117.72.98.99:60001/statistics")
      2. playwright_browser_wait_for(time: 0.5)  // Let animation start
      3. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-4-animation-mid.png", type: png)
      4. playwright_browser_wait_for(time: 1)  // Let animation complete
      5. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-4-animation-done.png", type: png)
    Expected Result: Mid-animation screenshot shows partial chart, final screenshot shows complete chart
    Failure Indicators: Charts appear instantly (no animation), or charts stuck mid-animation
    Evidence: .sisyphus/evidence/task-4-animation-mid.png, task-4-animation-done.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-4-animations-check.md` - Animation prop validation
  - [ ] `.sisyphus/evidence/task-4-animation-mid.png` - Mid-animation state
  - [ ] `.sisyphus/evidence/task-4-animation-done.png` - Animation complete state

  **Commit**: YES (groups with Tasks 5-7)
  - Message: `style: modernize statistics charts with animations and gradients`
  - Files: `frontend/src/pages/Statistics.tsx`
  - Pre-commit: `npm run build` (verify no syntax errors)

- [x] 5. Add Gradient Fills to Trend Chart (Statistics.tsx)

  **What to do**:
  - Read `frontend/src/pages/Statistics.tsx`
  - Convert LineChart to AreaChart for gradient fill support
  - Add SVG `<defs>` section with linearGradient definition:
    ```tsx
    <defs>
      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1}/>
      </linearGradient>
    </defs>
    ```
  - Replace `<Line>` with `<Area>` component:
    ```tsx
    <Area 
      type="monotone" 
      dataKey="amount" 
      stroke="#1890ff" 
      fill="url(#colorExpense)" 
      fillOpacity={1}
      isAnimationActive={true}
      animationDuration={500}
    />
    ```
  - For dark mode, create second gradient with darker opacity:
    ```tsx
    <linearGradient id="colorExpenseDark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#1890ff" stopOpacity={isDark ? 0.6 : 0.8}/>
      <stop offset="95%" stopColor="#1890ff" stopOpacity={isDark ? 0.05 : 0.1}/>
    </linearGradient>
    ```
  - Use `isDark` state variable (already exists in Statistics.tsx) to conditionally set fill
  - Test gradient renders correctly in both light and dark modes
  - Ensure gradient doesn't break existing chart functionality

  **Must NOT do**:
  - Do not change chart data structure or API calls
  - Do not remove existing chart tooltips or legend
  - Do not use non-brand colors (must use #1890ff or colors.ts constants)
  - Do not add gradient to PieChart (only LineChart/AreaChart)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Requires SVG gradient design, visual aesthetics decisions, Recharts API knowledge
  - **Skills**: [`visual-engineering`]
    - `visual-engineering`: Required for gradient design, color transitions, visual polish
  - **Skills Evaluated but Omitted**:
    - `playwright`: Will be used in Task 9 for dark mode gradient verification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6, 7)
  - **Blocks**: Task 9 (dark mode gradient verification)
  - **Blocked By**: Task 4 (animations must be enabled first)

  **References**:
  - **Pattern References**:
    - `frontend/src/pages/Statistics.tsx:200-280` - Current LineChart component structure
    - `frontend/src/constants/colors.ts:COLORS[0]` - Primary blue color (#1890ff)
    - `frontend/src/constants/colors.ts:DARK_COLORS[0]` - Dark mode adjusted primary blue
  - **API/Type References**:
    - Recharts AreaChart API: https://recharts.org/en-US/api/AreaChart
    - SVG linearGradient: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient
  - **Test References**:
    - None (will be verified in Task 9 dark mode test)
  - **External References**:
    - Stripe chart style reference: https://stripe.com/docs/dashboard (gradient fill example)
    - Recharts gradient example: https://recharts.org/en-US/examples/AreaChart
  - **WHY Each Reference Matters**:
    - Statistics.tsx:200-280 - Current LineChart location, need to convert to AreaChart
    - colors.ts:COLORS[0] - Brand color for gradient fill
    - colors.ts:DARK_COLORS[0] - Dark mode adjusted color for gradient opacity adjustment
    - Stripe charts - Modern gradient fill reference for visual style

  **Acceptance Criteria**:
  - [ ] LineChart converted to AreaChart with gradient fill
  - [ ] SVG `<defs>` with linearGradient added
  - [ ] Gradient uses #1890ff color (Ant Design blue)
  - [ ] Dark mode gradient has adjusted opacity
  - [ ] AreaChart stroke and fill both use gradient or brand color

  **QA Scenarios**:

  ```
  Scenario: Gradient Definition Check
    Tool: Bash
    Preconditions: frontend/src/pages/Statistics.tsx updated
    Steps:
      1. Read frontend/src/pages/Statistics.tsx content
      2. grep for '<defs>' section
      3. grep for '<linearGradient' definition
      4. Verify gradient id starts with 'color' (e.g., 'colorExpense')
      5. grep for '<Area' component (LineChart converted to AreaChart)
    Expected Result: Gradient defs present, AreaChart component used
    Failure Indicators: No defs section, still using LineChart, no linearGradient
    Evidence: .sisyphus/evidence/task-5-gradient-defs-check.md

  Scenario: Gradient Visual Light Mode
    Tool: Playwright
    Preconditions: Statistics page loaded, light mode
    Steps:
      1. playwright_browser_navigate(url: "http://117.72.98.99:60001/statistics")
      2. playwright_browser_wait_for(time: 2)  // Animation complete
      3. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-5-gradient-light.png", type: png)
      4. playwright_browser_snapshot(filename: ".sisyphus/evidence/task-5-gradient-light.md")
    Expected Result: Trend chart shows gradient fill (semi-transparent blue area)
    Failure Indicators: Chart shows solid line only (no gradient area), gradient not visible
    Evidence: .sisyphus/evidence/task-5-gradient-light.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-5-gradient-defs-check.md` - Gradient definition validation
  - [ ] `.sisyphus/evidence/task-5-gradient-light.png` - Light mode gradient visual
  - [ ] `.sisyphus/evidence/task-9-gradient-dark.png` - Dark mode gradient (captured in Task 9)

  **Commit**: YES (groups with Tasks 4, 6, 7)
  - Message: `style: modernize statistics charts with animations and gradients`
  - Files: `frontend/src/pages/Statistics.tsx`
  - Pre-commit: `npm run build`

- [x] 6. Optimize Chart Tooltips and Styling (Statistics.tsx)

  **What to do**:
  - Read `frontend/src/pages/Statistics.tsx`
  - Enhance custom tooltip component (CustomTooltip function)
  - Improve tooltip styling:
    - Add border-radius for modern rounded appearance: `borderRadius: '8px'`
    - Add subtle shadow: `boxShadow: '0 2px 8px rgba(0,0,0,0.15)'`
    - Improve typography: `fontSize: '14px'`, `fontWeight: '500'`
    - Add padding: `padding: '12px 16px'`
    - Better color contrast: darker background for light mode, lighter for dark mode
  - Add tooltip animation (optional):
    - CSS transition for tooltip appearance (fade in)
  - Improve chart container styling:
    - Add card border-radius: `borderRadius: '12px'`
    - Add subtle shadow: `boxShadow: '0 1px 3px rgba(0,0,0,0.1)'`
    - Better spacing between chart cards
  - Enhance PieChart label styling:
    - Use colors.ts COLORS array for label colors
    - Better font size and positioning
  - Test tooltips appear correctly on hover
  - Verify dark mode tooltip styling works

  **Must NOT do**:
  - Do not change tooltip content or data display logic
  - Do not remove existing tooltip functionality
  - Do not add complex animations that break accessibility
  - Do not use fixed pixel values without responsive considerations

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Tooltip design requires visual polish, CSS styling, shadow/border-radius decisions
  - **Skills**: [`visual-engineering`]
    - `visual-engineering`: Required for tooltip styling, visual refinement, CSS-in-JS patterns
  - **Skills Evaluated but Omitted**:
    - `playwright`: Will be used in Task 11 for tooltip hover verification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 7)
  - **Blocks**: Task 9 (dark mode tooltip verification)
  - **Blocked By**: Task 4 (animations must be enabled)

  **References**:
  - **Pattern References**:
    - `frontend/src/pages/Statistics.tsx:64-73` - Current CustomTooltip component inline styles
    - `frontend/src/pages/Statistics.tsx:100-150` - Chart container styling
    - `frontend/src/constants/colors.ts:adjustForDarkModeWithContrast` - Dark mode color utility
  - **API/Type References**:
    - Recharts Tooltip API: https://recharts.org/en-US/api/Tooltip
  - **Test References**:
    - None (will be verified in Task 11)
  - **External References**:
    - Ant Design Tooltip style: https://ant.design/components/tooltip-cn (for reference)
    - Stripe tooltip design: https://stripe.com/docs/dashboard (modern tooltip reference)
  - **WHY Each Reference Matters**:
    - Statistics.tsx:64-73 - Current tooltip inline styles, need to enhance with modern CSS
    - colors.ts:adjustForDarkModeWithContrast - Ensure tooltip dark mode colors maintain WCAG AA contrast
    - Ant Design Tooltip - Reference for modern tooltip styling patterns

  **Acceptance Criteria**:
  - [ ] CustomTooltip styling enhanced (border-radius, shadow, better typography)
  - [ ] Tooltip dark mode styling works with proper contrast
  - [ ] Chart container card styling improved (border-radius, shadow)
  - [ ] PieChart label styling uses COLORS array
  - [ ] Tooltips appear on hover without errors

  **QA Scenarios**:

  ```
  Scenario: Tooltip Styling Check
    Tool: Bash
    Preconditions: frontend/src/pages/Statistics.tsx updated
    Steps:
      1. Read frontend/src/pages/Statistics.tsx content
      2. grep for 'CustomTooltip' function
      3. grep for 'borderRadius' in tooltip styles
      4. grep for 'boxShadow' in tooltip styles
      5. Verify styling improvements present (borderRadius, boxShadow, padding)
    Expected Result: Tooltip styles contain borderRadius, boxShadow, padding
    Failure Indicators: Missing modern styling properties
    Evidence: .sisyphus/evidence/task-6-tooltip-styles-check.md

  Scenario: Tooltip Hover Visual Test
    Tool: Playwright
    Preconditions: Statistics page loaded
    Steps:
      1. playwright_browser_navigate(url: "http://117.72.98.99:60001/statistics")
      2. playwright_browser_wait_for(time: 2)  // Charts rendered
      3. playwright_browser_hover(element: "trend chart area", ref: "chart-area")
      4. playwright_browser_wait_for(time: 0.5)  // Tooltip appears
      5. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-6-tooltip-hover.png", type: png)
    Expected Result: Tooltip visible with rounded corners, shadow, good typography
    Failure Indicators: Tooltip missing, old styling (no rounded corners), no shadow
    Evidence: .sisyphus/evidence/task-6-tooltip-hover.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-6-tooltip-styles-check.md` - Tooltip styling validation
  - [ ] `.sisyphus/evidence/task-6-tooltip-hover.png` - Tooltip hover visual

  **Commit**: YES (groups with Tasks 4, 5, 7)
  - Message: `style: modernize statistics charts with animations and gradients`
  - Files: `frontend/src/pages/Statistics.tsx`
  - Pre-commit: `npm run build`

- [x] 7. Use constants/colors.ts COLORS in Statistics.tsx

  **What to do**:
  - Read `frontend/src/pages/Statistics.tsx`
  - Locate duplicate COLORS array definition (lines ~38-47)
  - Remove duplicate COLORS array from Statistics.tsx
  - Add import: `import { COLORS, DARK_COLORS } from '@/constants/colors'`
  - Replace all hardcoded color references with COLORS array:
    - LineChart/AreaChart stroke: `stroke={COLORS[0]}`
    - PieChart slice colors: Use COLORS array iteration
    - Tooltip colors: Use COLORS[0] for primary
  - Ensure DARK_COLORS used for dark mode (isDark state):
    - Conditional color selection: `isDark ? DARK_COLORS[0] : COLORS[0]`
  - Verify all chart colors come from constants/colors.ts
  - Test dark mode chart colors work correctly

  **Must NOT do**:
  - Do not modify constants/colors.ts content (use existing colors)
  - Do not add new color constants
  - Do not remove WCAG AA contrast compliance
  - Do not change color array order (COLORS[0] must be primary blue)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Import addition and color reference replacement, straightforward refactoring
  - **Skills**: []
    - No special skills needed for import/cleanup
  - **Skills Evaluated but Omitted**:
    - `visual-engineering`: No design decisions, only code cleanup

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5, 6)
  - **Blocks**: Task 9 (dark mode color verification needs correct COLORS usage)
  - **Blocked By**: Task 4 (animations enabled before color changes)

  **References**:
  - **Pattern References**:
    - `frontend/src/pages/Statistics.tsx:38-47` - Duplicate COLORS array to remove
    - `frontend/src/constants/colors.ts:COLORS` - Shared color constants array
    - `frontend/src/constants/colors.ts:DARK_COLORS` - Dark mode color constants
    - `frontend/src/constants/colors.ts:adjustForDarkModeWithContrast` - Dark mode utility
  - **API/Type References**:
    - None (color constants array)
  - **Test References**:
    - None (will be verified in Task 9)
  - **External References**:
    - WCAG AA contrast: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
  - **WHY Each Reference Matters**:
    - Statistics.tsx:38-47 - Duplicate COLORS causing inconsistency, need to remove
    - colors.ts:COLORS - Central color constants, ensure Statistics uses shared colors
    - colors.ts:DARK_COLORS - Dark mode colors, Statistics must use for dark mode support
    - WCAG AA - Ensure dark mode colors maintain accessibility compliance

  **Acceptance Criteria**:
  - [ ] Duplicate COLORS array removed from Statistics.tsx
  - [ ] Import added: `import { COLORS, DARK_COLORS } from '@/constants/colors'`
  - [ ] All chart colors use COLORS/DARK_COLORS arrays
  - [ ] Dark mode colors conditional on `isDark` state
  - [ ] No hardcoded color values (e.g., '#1890ff') remaining in Statistics.tsx

  **QA Scenarios**:

  ```
  Scenario: Duplicate COLORS Removed Check
    Tool: Bash
    Preconditions: frontend/src/pages/Statistics.tsx updated
    Steps:
      1. Read frontend/src/pages/Statistics.tsx content
      2. grep for 'const COLORS' or 'let COLORS' at component level (not import)
      3. Verify no local COLORS array definition found
      4. grep for "import { COLORS" from '@/constants/colors'
      5. Verify import statement present
    Expected Result: No duplicate COLORS, import from constants/colors.ts present
    Failure Indicators: Duplicate COLORS array still exists, missing import
    Evidence: .sisyphus/evidence/task-7-colors-import-check.md

  Scenario: Color Usage Check
    Tool: Bash
    Preconditions: frontend/src/pages/Statistics.tsx updated
    Steps:
      1. Read frontend/src/pages/Statistics.tsx content
      2. grep for hardcoded hex colors like '#1890ff', '#52c41a', etc. (in chart components)
      3. grep for COLORS[0], COLORS[1] references
      4. Verify COLORS array references present, hardcoded colors removed
    Expected Result: COLORS array used, no hardcoded hex colors in charts
    Failure Indicators: Hardcoded colors found, COLORS not referenced
    Evidence: .sisyphus/evidence/task-7-colors-usage-check.md
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-7-colors-import-check.md` - Import validation
  - [ ] `.sisyphus/evidence/task-7-colors-usage-check.md` - Color usage validation

  **Commit**: YES (groups with Tasks 4-6)
  - Message: `style: modernize statistics charts with animations and gradients`
  - Files: `frontend/src/pages/Statistics.tsx`
  - Pre-commit: `npm run build`

- [x] 8. Optimize CategoryManageTab Table Styling (Settings.tsx)

  **What to do**:
  - Read `frontend/src/pages/Settings.tsx`
  - Locate CategoryManageTab component (lines ~69-150)
  - Enhance Ant Design Table styling via inline styles or ConfigProvider:
    - **Row hover effect**: Add hover highlight (light gray background)
      ```tsx
      onRow={(record) => ({
        onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = isDark ? '#1a1a1a' : '#f5f5f5'; },
        onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = ''; }
      })}
      ```
    - **Header styling**: Better typography (fontWeight: '600', fontSize: '14px')
      ```tsx
      <Table 
        columns={columns.map(col => ({
          ...col,
          title: <span style={{ fontWeight: 600, fontSize: 14 }}>{col.title}</span>
        }))}
      />
      ```
    - **Spacing/padding**: Increase row padding (padding: '12px 16px')
      ```tsx
        rowStyle={{ padding: '12px 16px' }}
      ```
    - **Borders**: Cleaner border styling (borderBottom only, no vertical borders)
      ```tsx
      style={{ border: 'none', borderBottom: '1px solid var(--ant-color-border)' }}
      ```
    - **Icon column**: Better emoji display (fontSize: '20px', textAlign: 'center')
    - **Color column**: Enhanced color preview (show color circle instead of hex text)
      - Add circular color badge: `<div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: color }} />`
    - **Action buttons**: Better spacing and icon size
  - Apply CSS variables for theme compatibility: `var(--ant-color-border)`, `var(--ant-color-text)`
  - Test dark mode table styling works correctly
  - Ensure table sorting/filtering functionality unchanged

  **Must NOT do**:
  - Do not change table data fetching or mutation logic
  - Do not remove edit/delete action functionality
  - Do not add new table columns or features
  - Do not use fixed colors without dark mode consideration
  - Do not modify MemberCategoryTab component (user wants to keep card layout)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Table styling refinement requires CSS expertise, hover effects, visual polish
  - **Skills**: [`visual-engineering`]
    - `visual-engineering`: Required for table hover effects, color badge design, typography refinement
  - **Skills Evaluated but Omitted**:
    - `playwright`: Will be used in Task 9 for dark mode table verification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11)
  - **Blocks**: Task 9 (dark mode table verification)
  - **Blocked By**: None (independent of Statistics changes)

  **References**:
  - **Pattern References**:
    - `frontend/src/pages/Settings.tsx:69-150` - CategoryManageTab table structure
    - `frontend/src/pages/Settings.tsx:112-126` - Table columns definition
    - `frontend/src/pages/Settings.tsx:138-148` - Action buttons styling
    - `frontend/src/index.css:35-63` - Dark mode CSS overrides (body.dark)
  - **API/Type References**:
    - Ant Design Table API: https://ant.design/components/table-cn
  - **Test References**:
    - None (will be verified in Task 9)
  - **External References**:
    - Stripe table design: https://stripe.com/docs/dashboard (modern table reference)
    - Ant Design dark mode: https://ant.design/docs/react/customize-theme-cn
  - **WHY Each Reference Matters**:
    - Settings.tsx:69-150 - CategoryManageTab table location, need to enhance styling
    - Settings.tsx:112-126 - Column definitions, can add header styling here
    - index.css:35-63 - Dark mode overrides, ensure table respects dark mode class
    - Ant Design Table - onRow, columns, rowStyle props for styling customization

  **Acceptance Criteria**:
  - [ ] Table row hover effect added (light gray highlight)
  - [ ] Table header typography improved (fontWeight: 600)
  - [ ] Row padding increased (12px 16px)
  - [ ] Color column shows circular color badge (not hex text)
  - [ ] Dark mode table styling works (CSS variables used)
  - [ ] Table functionality unchanged (edit/delete still work)

  **QA Scenarios**:

  ```
  Scenario: Table Styling Check
    Tool: Bash
    Preconditions: frontend/src/pages/Settings.tsx updated
    Steps:
      1. Read frontend/src/pages/Settings.tsx content
      2. grep for 'onRow' in CategoryManageTab
      3. grep for 'fontWeight' in columns definition
      4. grep for 'borderRadius' in color column (color badge)
      5. Verify styling improvements present
    Expected Result: onRow hover, fontWeight headers, borderRadius color badge
    Failure Indicators: Missing styling improvements
    Evidence: .sisyphus/evidence/task-8-table-styles-check.md

  Scenario: Table Visual Light Mode
    Tool: Playwright
    Preconditions: Settings page loaded, CategoryManageTab active
    Steps:
      1. playwright_browser_navigate(url: "http://117.72.98.99:60001/settings")
      2. playwright_browser_click(ref: "tab-chart-category")  // Ensure on Category tab
      3. playwright_browser_wait_for(time: 1)
      4. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-8-table-light.png", type: png)
      5. playwright_browser_hover(element: "table row", ref: "table-row-music")  // Test hover effect
      6. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-8-table-hover.png", type: png)
    Expected Result: Table shows modern styling, row hover highlight visible
    Failure Indicators: Old table styling, no hover effect, hex text in color column
    Evidence: .sisyphus/evidence/task-8-table-light.png, task-8-table-hover.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-8-table-styles-check.md` - Table styling validation
  - [ ] `.sisyphus/evidence/task-8-table-light.png` - Light mode table
  - [ ] `.sisyphus/evidence/task-8-table-hover.png` - Row hover effect
  - [ ] `.sisyphus/evidence/task-9-table-dark.png` - Dark mode table (captured in Task 9)

  **Commit**: YES
  - Message: `style: optimize settings category table styling`
  - Files: `frontend/src/pages/Settings.tsx`
  - Pre-commit: `npm run build`

- [x] 9. Verify Dark Mode Support (Statistics + Settings)

  **What to do**:
  - Use Playwright to test dark mode rendering for Statistics and Settings pages
  - Navigate to Statistics page, toggle to dark mode (localStorage `'theme-mode': 'dark'`)
  - Wait for dark mode transition (1 second)
  - Capture dark mode screenshots:
    - Statistics: `.sisyphus/evidence/task-9-statistics-dark-final.png`
    - Settings Category tab: `.sisyphus/evidence/task-9-settings-category-dark.png`
  - Verify dark mode styling elements:
    - **Statistics**: 
      - Gradient fill visible (opacity adjusted)
      - Tooltip colors readable (WCAG AA contrast)
      - Chart colors from DARK_COLORS array
    - **Settings**:
      - Table hover effect works in dark mode
      - Color badges visible
      - Typography readable
  - Check for any dark mode bugs:
    - White backgrounds in dark containers
    - Low contrast text
    - Missing color adjustments
  - If bugs found, report them (do not fix in this task)
  - Capture accessibility snapshots for dark mode state

  **Must NOT do**:
  - Do not modify any source code (verification only)
  - Do not fix dark mode bugs (report only)
  - Do not change dark mode toggle logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification task, no implementation, just Playwright testing
  - **Skills**: [`playwright`]
    - `playwright`: Required for dark mode toggle, screenshot capture, accessibility snapshot
  - **Skills Evaluated but Omitted**:
    - `visual-engineering`: No design work, only verification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 10, 11)
  - **Blocks**: Task 11 (final QA needs dark mode evidence)
  - **Blocked By**: Tasks 5, 6, 8 (gradient, tooltip, table styling completed)

  **References**:
  - **Pattern References**:
    - `frontend/src/pages/Statistics.tsx` - Statistics dark mode styling (isDark state usage)
    - `frontend/src/pages/Settings.tsx` - Settings dark mode styling
    - `frontend/src/constants/colors.ts:DARK_COLORS` - Dark mode color constants
    - `frontend/src/index.css:35-63` - Dark mode CSS class (body.dark)
  - **API/Type References**:
    - None (visual verification)
  - **Test References**:
    - None (Playwright testing)
  - **External References**:
    - WCAG AA contrast checker: https://webaim.org/resources/contrastchecker/
  - **WHY Each Reference Matters**:
    - Statistics.tsx - Dark mode styling implementation, verify isDark usage
    - Settings.tsx - Dark mode table styling, verify hover effect in dark
    - colors.ts:DARK_COLORS - Expected dark mode colors, verify used correctly
    - index.css - Dark mode CSS class, verify applied to body

  **Acceptance Criteria**:
  - [ ] Dark mode screenshots captured for Statistics and Settings
  - [ ] Statistics gradient fill visible in dark mode (opacity adjusted)
  - [ ] Statistics tooltip colors readable (WCAG AA contrast)
  - [ ] Settings table hover effect works in dark mode
  - [ ] No white backgrounds in dark containers
  - [ ] Accessibility snapshots captured

  **QA Scenarios**:

  ```
  Scenario: Statistics Dark Mode Gradient
    Tool: Playwright
    Preconditions: Statistics page loaded
    Steps:
      1. playwright_browser_navigate(url: "http://117.72.98.99:60001/statistics")
      2. playwright_browser_evaluate(function: "() => { localStorage.setItem('theme-mode', 'dark'); window.dispatchEvent(new CustomEvent('theme-change')); }")
      3. playwright_browser_wait_for(time: 2)  // Dark mode transition + chart render
      4. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-9-statistics-dark-final.png", type: png)
      5. playwright_browser_snapshot(filename: ".sisyphus/evidence/task-9-statistics-dark-final.md")
    Expected Result: Gradient fill visible with adjusted opacity, dark background, readable text
    Failure Indicators: Gradient invisible, white background, low contrast text
    Evidence: .sisyphus/evidence/task-9-statistics-dark-final.png

  Scenario: Settings Dark Mode Table
    Tool: Playwright
    Preconditions: Settings page loaded
    Steps:
      1. playwright_browser_navigate(url: "http://117.72.98.99:60001/settings")
      2. playwright_browser_click(ref: "tab-chart-category")  // Category tab
      3. playwright_browser_evaluate(function: "() => { localStorage.setItem('theme-mode', 'dark'); window.dispatchEvent(new CustomEvent('theme-change')); }")
      4. playwright_browser_wait_for(time: 1)
      5. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-9-settings-category-dark.png", type: png)
      6. playwright_browser_hover(element: "table row", ref: "table-row-ai")  // Test dark hover
      7. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-9-table-hover-dark.png", type: png)
    Expected Result: Dark table styling, hover highlight visible, color badges visible
    Failure Indicators: White table background, no hover effect, unreadable text
    Evidence: .sisyphus/evidence/task-9-settings-category-dark.png, task-9-table-hover-dark.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-9-statistics-dark-final.png` - Statistics dark mode
  - [ ] `.sisyphus/evidence/task-9-statistics-dark-final.md` - Statistics dark mode snapshot
  - [ ] `.sisyphus/evidence/task-9-settings-category-dark.png` - Settings dark mode table
  - [ ] `.sisyphus/evidence/task-9-table-hover-dark.png` - Dark mode table hover
  - [ ] `.sisyphus/evidence/task-9-gradient-dark.png` - Dark mode gradient (from Task 5)

  **Commit**: NO (verification task, no code changes)

- [x] 10. Responsive Testing (375px, 768px, 1024px, 1440px)

  **What to do**:
  - Use Playwright to test responsive rendering at multiple breakpoints
  - Test breakpoints: 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop)
  - For each breakpoint:
    - Resize browser: `playwright_browser_resize(width: {size}, height: {appropriate_height})`
    - Navigate to Statistics page
    - Wait for charts to render
    - Capture screenshot: `.sisyphus/evidence/task-10-statistics-{size}.png`
    - Verify: Charts fit within viewport, no overflow, no horizontal scroll
    - Navigate to Settings page
    - Capture screenshot: `.sisyphus/evidence/task-10-settings-{size}.png`
    - Verify: Table responsive, cards grid adjusts
  - Check for responsive issues:
    - Charts overflowing viewport
    - Table columns too narrow
    - Buttons too small on mobile
    - Text too large/small
  - If issues found, report them (do not fix in this task)
  - Verify sidebar collapses at mobile breakpoint (if applicable)

  **Must NOT do**:
  - Do not modify any source code (verification only)
  - Do not fix responsive bugs (report only)
  - Do not change existing responsive breakpoints (768px media query in index.css)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Responsive verification, no implementation, just Playwright testing
  - **Skills**: [`playwright`]
    - `playwright`: Required for browser resize, screenshot capture, viewport testing
  - **Skills Evaluated but Omitted**:
    - `visual-engineering`: No design work, only verification

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 11)
  - **Blocks**: Task 11 (final QA needs responsive evidence)
  - **Blocked By**: Task 8 (table styling completed)

  **References**:
  - **Pattern References**:
    - `frontend/src/index.css:35-63` - Responsive media queries (768px breakpoint)
    - `frontend/src/pages/Statistics.tsx` - Statistics responsive chart layout (Row/Col)
    - `frontend/src/pages/Settings.tsx:MemberCategoryTab` - Card grid responsive breakpoints
  - **API/Type References**:
    - None (visual verification)
  - **Test References**:
    - None (Playwright testing)
  - **External References**:
    - Responsive design breakpoints: https://tailwindcss.com/docs/responsive-design
  - **WHY Each Reference Matters**:
    - index.css - Existing 768px media query, verify charts respect this breakpoint
    - Statistics.tsx - Ant Design Row/Col responsive layout, verify charts adjust
    - Settings.tsx - MemberCategoryTab grid xs:1, sm:2, md:3, verify cards adjust at breakpoints

  **Acceptance Criteria**:
  - [ ] Screenshots captured for all 4 breakpoints (375px, 768px, 1024px, 1440px)
  - [ ] Statistics page tested at all breakpoints
  - [ ] Settings page tested at all breakpoints
  - [ ] Charts fit within viewport at all sizes (no overflow)
  - [ ] Table responsive at mobile/tablet sizes
  - [ ] Cards grid adjusts at breakpoints

  **QA Scenarios**:

  ```
  Scenario: Mobile 375px Statistics
    Tool: Playwright
    Preconditions: None
    Steps:
      1. playwright_browser_resize(width: 375, height: 667)  // iPhone SE
      2. playwright_browser_navigate(url: "http://117.72.98.99:60001/statistics")
      3. playwright_browser_wait_for(time: 2)
      4. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-10-statistics-375.png", type: png)
      5. playwright_browser_snapshot(filename: ".sisyphus/evidence/task-10-statistics-375.md")
      6. playwright_browser_evaluate(function: "() => { return document.body.scrollWidth; }")  // Check overflow
    Expected Result: Charts fit viewport, scrollWidth <= 375, no horizontal scroll
    Failure Indicators: scrollWidth > 375, charts overflow, horizontal scroll required
    Evidence: .sisyphus/evidence/task-10-statistics-375.png

  Scenario: Tablet 768px Settings
    Tool: Playwright
    Preconditions: None
    Steps:
      1. playwright_browser_resize(width: 768, height: 1024)  // iPad
      2. playwright_browser_navigate(url: "http://117.72.98.99:60001/settings")
      3. playwright_browser_wait_for(time: 1)
      4. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-10-settings-768.png", type: png)
      5. playwright_browser_click(ref: "tab-chart-category")
      6. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-10-settings-category-768.png", type: png)
    Expected Result: Table fits 768px, cards grid 2 columns (sm:2), sidebar visible
    Failure Indicators: Table too wide, cards overflow, sidebar hidden unexpectedly
    Evidence: .sisyphus/evidence/task-10-settings-768.png

  Scenario: Desktop 1440px Statistics
    Tool: Playwright
    Preconditions: None
    Steps:
      1. playwright_browser_resize(width: 1440, height: 900)  // MacBook Pro
      2. playwright_browser_navigate(url: "http://117.72.98.99:60001/statistics")
      3. playwright_browser_wait_for(time: 2)
      4. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-10-statistics-1440.png", type: png)
    Expected Result: Charts side-by-side, gradient visible, full width layout
    Failure Indicators: Charts not utilizing full width, layout too narrow
    Evidence: .sisyphus/evidence/task-10-statistics-1440.png
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-10-statistics-375.png` - Mobile Statistics
  - [ ] `.sisyphus/evidence/task-10-statistics-768.png` - Tablet Statistics
  - [ ] `.sisyphus/evidence/task-10-statistics-1024.png` - Laptop Statistics
  - [ ] `.sisyphus/evidence/task-10-statistics-1440.png` - Desktop Statistics
  - [ ] `.sisyphus/evidence/task-10-settings-375.png` - Mobile Settings
  - [ ] `.sisyphus/evidence/task-10-settings-768.png` - Tablet Settings
  - [ ] `.sisyphus/evidence/task-10-settings-1024.png` - Laptop Settings
  - [ ] `.sisyphus/evidence/task-10-settings-1440.png` - Desktop Settings

  **Commit**: NO (verification task, no code changes)

- [x] 11. Final QA Screenshot Comparison (Before vs After)

  **What to do**:
  - Compare baseline screenshots (Task 1) with final screenshots (after all changes)
  - Create comparison report for Statistics page:
    - Light mode: baseline-statistics-light.png vs task-10-statistics-1440.png (or current screenshot)
    - Dark mode: baseline-statistics-dark.png vs task-9-statistics-dark-final.png
    - Mobile: baseline-statistics-375.png vs task-10-statistics-375.png
  - Create comparison report for Settings page:
    - Category tab: baseline-settings-category.png vs task-8-table-light.png
    - Member tab: baseline-settings-member.png vs current screenshot
    - Dark mode: baseline-settings-category-dark.png vs task-9-settings-category-dark.png
  - Document visual improvements:
    - Chart animations active vs disabled
    - Gradient fills vs solid lines
    - Modern tooltips vs old tooltips
    - Optimized table vs old table
    - Favicon present vs broken
  - Create side-by-side comparison images (optional, using image diff tool)
  - Write comparison report: `.sisyphus/evidence/task-11-comparison-report.md`
  - Verify favicon loads: check browser tab icon
  - Final visual inspection: ensure all improvements visible

  **Must NOT do**:
  - Do not modify any source code (verification only)
  - Do not create new screenshots (use existing from Tasks 1, 9, 10)
  - Do not change deployed site

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Comparison verification, report generation, no implementation
  - **Skills**: [`playwright`]
    - `playwright`: Required for final screenshots if needed, favicon verification
  - **Skills Evaluated but Omitted**:
    - `visual-engineering`: No design work, only comparison

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 10)
  - **Blocks**: Wave FINAL (needs comparison report for review)
  - **Blocked By**: Tasks 1, 3, 9, 10 (baseline, favicon, dark mode, responsive completed)

  **References**:
  - **Pattern References**:
    - `.sisyphus/evidence/baseline-statistics-light.png` - Baseline light mode
    - `.sisyphus/evidence/baseline-statistics-dark.png` - Baseline dark mode
    - `.sisyphus/evidence/task-9-statistics-dark-final.png` - Final dark mode
    - `.sisyphus/evidence/task-10-statistics-1440.png` - Final desktop
  - **API/Type References**:
    - None (visual comparison)
  - **Test References**:
    - None (comparison report)
  - **External References**:
    - Image diff tools: https://www.diffchecker.com/image-diff/ (reference, not required)
  - **WHY Each Reference Matters**:
    - Baseline screenshots - Before state, compare against final screenshots
    - Final screenshots - After state, demonstrate visual improvements
    - Comparison report - Document all improvements for user review

  **Acceptance Criteria**:
  - [ ] Comparison report created: `.sisyphus/evidence/task-11-comparison-report.md`
  - [ ] Statistics light mode comparison documented
  - [ ] Statistics dark mode comparison documented
  - [ ] Settings table comparison documented
  - [ ] Favicon verification documented
  - [ ] All visual improvements listed in report

  **QA Scenarios**:

  ```
  Scenario: Favicon Verification
    Tool: Playwright
    Preconditions: All favicon changes deployed
    Steps:
      1. playwright_browser_navigate(url: "http://117.72.98.99:60001")
      2. playwright_browser_evaluate(function: "() => { const favicon = document.querySelector('link[rel~=\"icon\"]'); return favicon ? { href: favicon.href, type: favicon.type } : 'NOT_FOUND'; }")
      3. Verify favicon href contains '/favicon.svg' or '/favicon.png'
      4. playwright_browser_take_screenshot(filename: ".sisyphus/evidence/task-11-favicon-verification.png", type: png)
    Expected Result: Favicon href correct (e.g., 'http://117.72.98.99:60001/favicon.svg')
    Failure Indicators: Favicon NOT_FOUND, href still '/vite.svg', wrong path
    Evidence: .sisyphus/evidence/task-11-favicon-verification.png

  Scenario: Comparison Report Generation
    Tool: Bash
    Preconditions: All evidence files exist
    Steps:
      1. ls .sisyphus/evidence/*.png
      2. Verify baseline screenshots exist (baseline-*)
      3. Verify final screenshots exist (task-9-*, task-10-*, task-11-*)
      4. Create comparison report markdown file
      5. Write comparison summary for each page/mode
    Expected Result: Comparison report created with all improvements documented
    Failure Indicators: Missing baseline/final screenshots, incomplete report
    Evidence: .sisyphus/evidence/task-11-comparison-report.md
  ```

  **Evidence to Capture**:
  - [ ] `.sisyphus/evidence/task-11-comparison-report.md` - Visual comparison report
  - [ ] `.sisyphus/evidence/task-11-favicon-verification.png` - Favicon verification
  - [ ] `.sisyphus/evidence/task-11-statistics-final.png` - Final Statistics screenshot (if needed)
  - [ ] `.sisyphus/evidence/task-11-settings-final.png` - Final Settings screenshot (if needed)

  **Commit**: NO (verification task, no code changes)

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, check favicon). For each "Must NOT Have": search codebase for forbidden patterns — reject if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build` + `npm run lint` (if exists). Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Visual QA Execution** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-page consistency. Test edge cases: empty state, no subscriptions. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Cross-page [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git diff). Verify 1:1 — everything in spec was built, nothing beyond spec. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Task 2-3**: `style: add favicon with crown+flow icon` - public/favicon.svg, public/favicon.png, frontend/index.html
- **Task 4-7**: `style: modernize statistics charts with animations and gradients` - frontend/src/pages/Statistics.tsx, frontend/src/constants/colors.ts (if needed)
- **Task 8**: `style: optimize settings category table styling` - frontend/src/pages/Settings.tsx

---

## Success Criteria

### Verification Commands
```bash
cd frontend
npm run build  # Expected: success, no errors
npm run lint   # Expected: if exists, no errors or acceptable warnings
```

### Visual QA Evidence Files
```bash
.sisyphus/evidence/baseline-statistics-light.png
.sisyphus/evidence/baseline-statistics-dark.png
.sisyphus/evidence/baseline-settings-category.png
.sisyphus/evidence/baseline-settings-member.png
.sisyphus/evidence/task-11-statistics-final.png
.sisyphus/evidence/task-11-settings-final.png
.sisyphus/evidence/task-11-comparison-report.md
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Favicon loads in browser
- [ ] Charts animate smoothly
- [ ] Dark mode supported
- [ ] Responsive at 375px, 768px, 1024px, 1440px
- [ ] WCAG AA contrast maintained