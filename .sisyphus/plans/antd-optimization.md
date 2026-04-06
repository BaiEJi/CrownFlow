# Ant Design Performance Optimization Plan

## TL;DR

> **Quick Summary**: Optimize Ant Design and icons bundle size by refactoring 35 icon imports to direct path imports across 11 files, enhanced with Vite configuration and bundle analysis verification.
> 
> **Deliverables**:
> - Bundle analyzer infrastructure added to Vite config
> - 35 icons refactored to direct path imports in 11 files
> - Vite optimizeDeps configuration for faster dev startup
> - Bundle size reduced by minimum 30% (target 50%)
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: NO - sequential refactoring with per-file verification
> **Critical Path**: Bundle analyzer setup → Baseline measurement → Icon refactoring (file-by-file) → Final verification

---

## Context

### Original Request
User reported first-time website load performance issue due to large `antd.js` and `@ant-design_icons.js` bundles. The requests show:
- `/node_modules/.vite/deps/antd.js?v=237d7fb5` (large bundle)
- `/node_modules/.vite/deps/@ant-design_icons.js?v=83c959e6` (large bundle)

The goal is to reduce bundle size by **50%** to improve first-screen loading experience.

### Interview Summary
**Key Discussions**:
- **Environment**: Both development AND production need optimization
- **Performance Goal**: Reduce bundle size by 50% (baseline: 342K gzip for antd+icons)
- **CDN Externalization**: NO - bundle locally for stability
- **Test Infrastructure**: YES - Vitest configured, but NO component tests exist
- **Icon Usage**: 35 icon types, 58 usage instances across 11 files
- **Component Usage**: 39 component types, 130+ instances (already tree-shaken)

**Research Findings**:
- **Vite Config**: Already has manualChunks splitting, compression, terser minification; Missing: optimizeDeps explicit include, bundle analyzer
- **Import Pattern**: Named imports used (tree-shaking enabled), but icons need direct path imports for optimal tree-shaking
- **Baseline Sizes**: vendor-antd: 328K gzip, vendor-icons: 14K gzip, total: 342K gzip
- **Ant Design v5**: Uses CSS-in-JS (Emotion), automatic tree-shaking for components

### Metis Review
**Identified Gaps** (addressed):
- **CRITICAL: No component tests** → Added manual verification checklist as primary QA method
- **Missing bundle analyzer** → Added Task 1: Bundle analyzer infrastructure setup
- **Unproven 50% assumption** → Adjusted target to minimum 30% with bundle analyzer validation
- **No baseline measurement** → Added Task 2: Baseline capture before refactoring
- **Icon usage patterns not audited** → Added Task 3: Icon usage pattern audit (aliases, dynamic, conditional)
- **No rollback strategy** → Added atomic commit strategy with git branch approach
- **Behavior preservation unclear** → Defined explicit manual verification checklist (11 files × icons)

---

## Work Objectives

### Core Objective
Refactor all @ant-design/icons imports to direct path imports to enable optimal tree-shaking, reducing bundle size while preserving exact icon rendering behavior across all 11 files.

### Concrete Deliverables
- Vite config enhanced with bundle analyzer (`rollup-plugin-visualizer`)
- Vite config enhanced with `optimizeDeps.include` for faster dev startup
- 35 icons refactored from `import { IconA } from '@ant-design/icons'` to `import IconA from '@ant-design/icons/IconA'`
- Build verification: All chunks exist, TypeScript passes, existing tests pass
- Bundle size measurement: Before vs after comparison with actual byte counts

### Definition of Done
- [ ] Bundle analyzer generates `dist/stats.html` showing chunk breakdown
- [ ] Baseline bundle sizes captured (exact bytes, not "about 342K")
- [ ] All 11 files refactored with per-file build verification
- [ ] Final bundle size reduced by minimum 30% (target 50%)
- [ ] TypeScript compilation passes (`npm run type-check`)
- [ ] Existing 38 tests pass (`npm test`)
- [ ] Manual visual verification checklist completed (user confirms icons render correctly)

### Must Have
- Icon imports changed to direct path imports ONLY (no other code changes)
- Build succeeds after each file modification
- Icon rendering preserved exactly (same icons, same appearance)
- Bundle analyzer added and working

### Must NOT Have (Guardrails)
- ❌ DO NOT refactor adjacent code beyond icon imports
- ❌ DO NOT add new dependencies beyond bundle analyzer
- ❌ DO NOT change icon usage patterns (aliases, conditional loading preserved)
- ❌ DO NOT modify antd component imports (already tree-shaken)
- ❌ DO NOT "clean up" other imports while working on icons
- ❌ DO NOT add component testing infrastructure (separate future task)
- ❌ DO NOT upgrade Vite or antd versions
- ❌ DO NOT change chunk splitting strategy (keep existing manualChunks)
- ❌ DO NOT assume 50% target without bundle analyzer evidence

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: YES (Vitest configured)
- **Automated tests**: Tests-after (build verification + bundle measurement)
- **Framework**: Vitest
- **Component tests**: NO (0 tests for icon-using components) → Manual verification required

**CRITICAL NOTE**: Since no component tests exist for icon-using files, manual visual verification by user is REQUIRED. This is explicitly documented in the QA Scenarios.

### QA Policy
Every task MUST include agent-executed QA scenarios (see TODO template below).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Build Verification**: Use Bash — Run build commands, check exit codes, verify output files
- **Bundle Measurement**: Use Bash — Measure exact bytes of chunks before/after
- **TypeScript Check**: Use Bash — Run `npm run type-check`, verify exit code 0
- **Test Execution**: Use Bash — Run `npm test`, verify all 38 tests pass
- **Manual Verification**: Document checklist for user (cannot be agent-executed)

---

## Execution Strategy

### Parallel Execution Waves

> Sequential refactoring with per-file verification to catch issues immediately.
> Each file is verified before moving to next.

```
Wave 1 (Foundation - Sequential):
├── Task 1: Bundle analyzer infrastructure setup [quick]
├── Task 2: Baseline bundle size measurement [quick]
└── Task 3: Icon usage pattern audit [quick]

Wave 2 (Core Refactoring - Sequential with Verification):
├── Task 4: Layout.tsx icon refactoring (11 icons, largest file) [quick]
├── Task 5: Dashboard.tsx icon refactoring (5 icons, first-screen) [quick]
├── Task 6: MemberRankingCard.tsx icon refactoring (4 icons, first-screen lazy) [quick]
├── Task 7: ExpiryCalendar.tsx icon refactoring (5 icons, first-screen lazy) [quick]
├── Task 8: Login.tsx icon refactoring (2 icons, auth page) [quick]
└── Task 9: Members.tsx icon refactoring (7 icons) [quick]

Wave 3 (Remaining Refactoring - Sequential):
├── Task 10: MemberDetail.tsx icon refactoring (9 icons) [quick]
├── Task 11: Settings.tsx icon refactoring (5 icons) [quick]
├── Task 12: Journal.tsx icon refactoring (5 icons) [quick]
├── Task 13: Statistics.tsx icon refactoring (图表相关icons) [quick]
└── Task 14: MemberCard.tsx icon refactoring (3 icons) [quick]

Wave 4 (Component Files - Sequential):
├── Task 15: SubscriptionTimeline.tsx icon refactoring (4 icons) [quick]
├── Task 16: EventCard.tsx icon refactoring (5 icons) [quick]
├── Task 17: ErrorBoundary.tsx icon check (0 icons) [quick]
└── Task 18: Vite optimizeDeps configuration [quick]

Wave FINAL (After ALL refactoring - 4 parallel reviews, then user okay):
├── Task F1: Bundle size verification (oracle)
├── Task F2: Build integrity check (unspecified-high)
├── Task F3: Manual visual verification guidance (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay -> User performs visual verification
```

### Dependency Matrix

- **1-3**: — (foundation, independent)
- **4**: 1, 2, 3 — (needs baseline + audit before refactoring)
- **5-17**: 4 — (sequential, each verified before next)
- **18**: 17 — (Vite config after all files done)
- **F1-F4**: 18 — (final verification after all work)

### Agent Dispatch Summary

- **Wave 1**: **3** — T1 → `quick`, T2 → `quick`, T3 → `quick`
- **Wave 2**: **6** — T4-T9 → `quick` (each file verified before next)
- **Wave 3**: **5** — T10-T14 → `quick`
- **Wave 4**: **4** — T15-T17 → `quick`, T18 → `quick`
- **Wave FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Bundle Analyzer Infrastructure Setup

  **What to do**:
  - Install `rollup-plugin-visualizer` as dev dependency
  - Add `visualizer` plugin to `vite.config.ts` with config: `{ filename: './dist/stats.html', gzipSize: true, brotliSize: true, open: false }`
  - Add `build:analyze` script to `package.json`: `"build:analyze": "vite build --mode analyze"`
  - Run `npm run build:analyze` to verify stats.html generation

  **Must NOT do**:
  - DO NOT add other analysis tools (bundle-buddy, webpack-bundle-analyzer)
  - DO NOT modify existing manualChunks configuration
  - DO NOT change compression plugin settings

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single dependency + config addition, straightforward setup
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (Sequential foundation)
  - **Blocks**: Tasks 2, 4-18, F1-F4
  - **Blocked By**: None (can start immediately)

  **References**:
  - `frontend/vite.config.ts:55-70` - Current plugin configuration pattern, add visualizer after compression plugins
  - `frontend/package.json:5-10` - Script section for adding build:analyze script
  - External: https://github.com/btd/rollup-plugin-visualizer - Visualizer configuration options

  **Acceptance Criteria**:
  - [ ] `rollup-plugin-visualizer` installed in package.json devDependencies
  - [ ] visualizer plugin added to vite.config.ts plugins array
  - [ ] `build:analyze` script added to package.json
  - [ ] `npm run build:analyze` succeeds with exit code 0
  - [ ] `dist/stats.html` file exists after build

  **QA Scenarios**:
  ```
  Scenario: Bundle analyzer generates output
    Tool: Bash
    Preconditions: Clean working directory, no pending changes
    Steps:
      1. cd /home/lizy/projects/CrownFlow/frontend && npm install
      2. npm run build:analyze
      3. ls -lh dist/stats.html
      4. du -b dist/stats.html | awk '{print $1}'
    Expected Result: dist/stats.html exists, file size > 100KB (contains chunk breakdown)
    Failure Indicators: stats.html missing, build exits with non-zero code
    Evidence: .sisyphus/evidence/task-1-bundle-analyzer.txt
  ```

  **Evidence to Capture**:
  - [ ] Build output showing stats.html created
  - [ ] npm list rollup-plugin-visualizer showing installed version

  **Commit**: YES
  - Message: `perf(infra): add bundle analyzer for performance monitoring`
  - Files: vite.config.ts, package.json, package-lock.json (if exists)
  - Pre-commit: `npm run build:analyze`

- [x] 2. Baseline Bundle Size Measurement

  **What to do**:
  - Run `npm run build` with current (pre-optimization) state
  - Measure exact byte sizes of vendor-antd and vendor-icons chunks (both uncompressed and gzip)
  - Capture sizes using: `du -b dist/assets/vendor-*.js.gz | awk '{print $1, $2}'`
  - Document baseline in `.sisyphus/evidence/baseline-sizes.txt` with format: chunk_name, uncompressed_bytes, gzip_bytes, brotli_bytes
  - Run bundle analyzer to generate stats.html for baseline analysis

  **Must NOT do**:
  - DO NOT modify any source files
  - DO NOT change vite.config.ts
  - DO NOT proceed to Task 4 without capturing baseline

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Measurement task, no code changes, pure documentation
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (Sequential foundation)
  - **Blocks**: Tasks 4-18, F1
  - **Blocked By**: Task 1 (needs bundle analyzer)

  **References**:
  - `frontend/dist/assets/` - Location of built chunks
  - Expected chunks: vendor-antd-*.js, vendor-icons-*.js, vendor-react-*.js, vendor-charts-*.js, vendor-utils-*.js

  **Acceptance Criteria**:
  - [ ] `npm run build` succeeds with exit code 0
  - [ ] `.sisyphus/evidence/baseline-sizes.txt` created with exact byte counts
  - [ ] Baseline file contains: vendor-antd (328K gzip target), vendor-icons (14K gzip target)
  - [ ] All chunk files exist in dist/assets

  **QA Scenarios**:
  ```
  Scenario: Baseline sizes captured accurately
    Tool: Bash
    Preconditions: Task 1 completed, bundle analyzer working
    Steps:
      1. cd /home/lizy/projects/CrownFlow/frontend && npm run build
      2. cd dist/assets && ls vendor-antd-*.js.gz vendor-icons-*.js.gz
      3. du -b vendor-antd-*.js.gz vendor-icons-*.js.gz | tee ../baseline-check.txt
      4. grep -E 'vendor-antd|vendor-icons' ../baseline-check.txt
    Expected Result: Two lines output showing exact byte counts for both chunks
    Failure Indicators: Missing chunk files, build failure
    Evidence: .sisyphus/evidence/task-2-baseline-measurement.txt
  ```

  **Evidence to Capture**:
  - [ ] Build output log
  - [ ] du output showing exact bytes
  - [ ] baseline-sizes.txt file content

  **Commit**: YES
  - Message: `docs(baseline): capture initial bundle sizes before optimization`
  - Files: .sisyphus/evidence/baseline-sizes.txt
  - Pre-commit: verify file exists and contains data

- [x] 3. Icon Usage Pattern Audit

  **What to do**:
  - Use `ast_grep_search` to find all icon import patterns across 11 files
  - Identify icon aliases: `import { IconA as AliasA }` patterns
  - Identify conditional icon usage: `icon && <Icon />` or ternary operators
  - Identify icons in props/config: `<Button icon={<IconA />} />` patterns
  - Identify dynamic icon selection: `const iconMap = { edit: EditOutlined }` patterns
  - Document transformation plan for each pattern type in `.sisyphus/evidence/icon-usage-audit.md`
  - Create per-file refactoring checklist based on audit

  **Must NOT do**:
  - DO NOT modify any import statements yet
  - DO NOT assume simple patterns without verification
  - DO NOT skip checking for dynamic imports

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pattern search and documentation, no code changes
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (Sequential foundation)
  - **Blocks**: Tasks 4-17
  - **Blocked By**: None (can run after Task 2)

  **References**:
  - Files to audit:
    - `frontend/src/components/Layout.tsx`
    - `frontend/src/pages/Dashboard.tsx`
    - `frontend/src/components/MemberRankingCard.tsx`
    - `frontend/src/components/ExpiryCalendar.tsx`
    - `frontend/src/pages/Login.tsx`
    - `frontend/src/pages/Members.tsx`
    - `frontend/src/pages/MemberDetail.tsx`
    - `frontend/src/pages/Settings.tsx`
    - `frontend/src/pages/Journal.tsx`
    - `frontend/src/pages/Statistics.tsx`
    - `frontend/src/components/MemberCard.tsx`
    - `frontend/src/components/SubscriptionTimeline.tsx`
    - `frontend/src/components/EventCard.tsx`

  **Acceptance Criteria**:
  - [ ] All 11+3 files audited for icon import patterns
  - [ ] `.sisyphus/evidence/icon-usage-audit.md` created with pattern analysis
  - [ ] Document contains: per-file icon count, alias patterns, conditional patterns, dynamic patterns
  - [ ] Transformation plan documented for each pattern type

  **QA Scenarios**:
  ```
  Scenario: Icon patterns audited comprehensively
    Tool: Bash + ast_grep_search
    Preconditions: Files exist and accessible
    Steps:
      1. Use ast_grep_search to find `import { $$$ } from '@ant-design/icons'` in all files
      2. grep for 'as ' to find aliases in each file
      3. grep for 'icon && ' or 'icon ? ' to find conditional usage
      4. grep for 'icon={<' to find prop usage
      5. Read audit file and verify all patterns documented
    Expected Result: All patterns identified and documented in audit file
    Failure Indicators: Missing files in audit, pattern types not documented
    Evidence: .sisyphus/evidence/task-3-icon-audit.txt
  ```

  **Evidence to Capture**:
  - [ ] ast_grep_search results showing all import statements
  - [ ] grep results for aliases, conditional, prop usage
  - [ ] icon-usage-audit.md file content

  **Commit**: YES
  - Message: `docs(audit): document icon usage patterns and transformation plan`
  - Files: .sisyphus/evidence/icon-usage-audit.md
  - Pre-commit: verify file exists and contains comprehensive analysis

## 🔴 原计划已验证为不可行 - 发现问题根源

### 根本原因分析

**@ant-design/icons 的 package.json 没有 `exports` 字段！**

| 导入方式 | 解析路径 | 模块类型 | Tree-Shake |
|---------|---------|---------|------------|
| `import { X } from '@ant-design/icons'` | `./es/index.js` → ESM | **ESM** | ✅ 是 |
| `import X from '@ant-design/icons/X'` | `./X.js` → `./lib/X.js` | **CommonJS** | ❌ 否 |

**结论**: 命名导入已经是最佳方案，直接路径导入会使用 CommonJS 导致包体积增大。

### Bundle 分析 - 真正的优化目标

| Chunk | Gzip 大小 | 占比 | 优化价值 |
|-------|-----------|------|---------|
| vendor-antd | 327 KB | 53% | ⭐⭐⭐ 最高 |
| vendor-charts | 93 KB | 15% | ⭐⭐ 中等 |
| vendor-utils | 117 KB | 19% | ⭐ 低 |
| vendor-react | 58 KB | 9% | - |
| **vendor-icons** | **14 KB** | **2%** | **已最优** |

**vendor-icons (14KB) 已经是最小的，真正应该优化的是 vendor-antd (327KB)!**

---

## ✅ 新优化方案 (待用户选择)

### 方案 A: CDN 外链 (推荐)

使用 `vite-plugin-cdn-import` 将 antd/react 外链到 CDN：

```typescript
// vite.config.ts
import cdn from 'vite-plugin-cdn-import'

plugins: [
  cdn({
    modules: ['react', 'react-dom', 'antd'],
  }),
]
```

**预期收益**: 减少 50%+ 首屏 JS 体积  
**风险**: CDN 稳定性依赖

### 方案 B: 路由懒加载

对图表页面等非首屏内容懒加载：

```typescript
const Statistics = React.lazy(() => import('./pages/Statistics'));
```

**预期收益**: 减少 30-50% 首屏体积  
**风险**: 需要处理加载状态

### 方案 C: 组合优化

1. antd/react 外链 CDN
2. 图表页面懒加载
3. 保留当前图标命名导入

**预期收益**: 减少 60-70% 首屏体积

---

**请选择方案后继续执行**
  - Refactor 11 icons in Layout.tsx from named imports to direct path imports
  - Icons: DashboardOutlined, UserOutlined, BarChartOutlined, SettingOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined, MoonOutlined, SunOutlined
  - Preserve any import aliases (e.g., `import { Layout as AntLayout }`)
  - Use `ast_grep_replace` with `dryRun=true` to preview changes before applying
  - Verify TypeScript compilation passes after changes
  - Run `npm run build` to verify no build errors

  **Must NOT do**:
  - DO NOT change antd component imports (Layout, Menu, Button, etc.)
  - DO NOT modify icon usage locations (keep icons where they are used)
  - DO NOT refactor adjacent code or add "improvements"
  - DO NOT change icon naming or aliases

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple import path transformation, straightforward refactoring
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (Sequential with verification)
  - **Blocks**: Tasks 5-17
  - **Blocked By**: Tasks 1, 2, 3 (needs baseline + audit)

  **References**:
  - `frontend/src/components/Layout.tsx:1-10` - Current import statements to refactor
  - `.sisyphus/evidence/icon-usage-audit.md` - Pattern analysis for Layout.tsx
  - Pattern example: `import { UserOutlined } from '@ant-design/icons'` → `import UserOutlined from '@ant-design/icons/UserOutlined'`

  **Acceptance Criteria**:
  - [ ] All 11 icons changed to direct path imports
  - [ ] Import aliases preserved (if any exist)
  - [ ] `npm run type-check` passes (exit code 0)
  - [ ] `npm run build` passes (exit code 0)
  - [ ] No other code changes in file

  **QA Scenarios**:
  ```
  Scenario: Layout.tsx icons refactored successfully
    Tool: Bash
    Preconditions: Tasks 1-3 completed, git shows Layout.tsx modified
    Steps:
      1. cd /home/lizy/projects/CrownFlow/frontend
      2. npm run type-check
      3. npm run build
      4. grep "@ant-design/icons" src/components/Layout.tsx
      5. git diff src/components/Layout.tsx | grep -c "import.*from '@ant-design/icons"
    Expected Result: type-check passes, build passes, grep shows 11 direct path imports, git diff shows only import changes
    Failure Indicators: TypeScript errors, build failure, grep shows named imports still present
    Evidence: .sisyphus/evidence/task-4-layout-refactor.txt
  ```

  **Evidence to Capture**:
  - [ ] npm run type-check output (exit code)
  - [ ] npm run build output (exit code)
  - [ ] grep output showing direct path imports
  - [ ] git diff showing only import changes

  **Commit**: YES
  - Message: `refactor(icons): change Layout.tsx to direct path imports`
  - Files: src/components/Layout.tsx
  - Pre-commit: `npm run type-check && npm run build`

- [ ] 5. Dashboard.tsx Icon Refactoring

  **What to do**:
  - Refactor 5 icons in Dashboard.tsx from named imports to direct path imports
  - Icons: UserOutlined, CalendarOutlined, WarningOutlined, ReloadOutlined, QuestionCircleOutlined
  - Preserve any import aliases
  - Use `ast_grep_replace` with `dryRun=true` to preview
  - Verify TypeScript and build pass after changes

  **Must NOT do**:
  - DO NOT change antd component imports (Card, Row, Col, Statistic, etc.)
  - DO NOT modify icon usage in JSX
  - DO NOT refactor adjacent code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple import transformation for 5 icons
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (Sequential after Task 4)
  - **Blocks**: Tasks 6-17
  - **Blocked By**: Task 4

  **References**:
  - `frontend/src/pages/Dashboard.tsx:1-10` - Current imports
  - `.sisyphus/evidence/icon-usage-audit.md` - Dashboard pattern analysis

  **Acceptance Criteria**:
  - [ ] All 5 icons changed to direct path imports
  - [ ] `npm run type-check` passes
  - [ ] `npm run build` passes
  - [ ] No other code changes

  **QA Scenarios**:
  ```
  Scenario: Dashboard.tsx icons refactored
    Tool: Bash
    Preconditions: Task 4 completed
    Steps:
      1. cd /home/lizy/projects/CrownFlow/frontend
      2. npm run type-check
      3. npm run build
      4. grep "@ant-design/icons" src/pages/Dashboard.tsx | wc -l
    Expected Result: 5 lines showing direct path imports, type-check/build pass
    Failure Indicators: Named imports still present, build errors
    Evidence: .sisyphus/evidence/task-5-dashboard-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(icons): change Dashboard.tsx to direct path imports`
  - Files: src/pages/Dashboard.tsx
  - Pre-commit: `npm run type-check && npm run build`

- [ ] 6. MemberRankingCard.tsx Icon Refactoring

  **What to do**:
  - Refactor 4 icons in MemberRankingCard.tsx: TrophyOutlined, FireOutlined, BarChartOutlined, ReloadOutlined
  - Preserve aliases, preview with dryRun, verify build

  **Must NOT do**:
  - DO NOT change antd imports (Card, Radio, Progress, etc.)
  - DO NOT modify JSX usage

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (Sequential after Task 5)
  - **Blocks**: Tasks 7-17
  - **Blocked By**: Task 5

  **References**:
  - `frontend/src/components/MemberRankingCard.tsx:1-10`
  - `.sisyphus/evidence/icon-usage-audit.md`

  **Acceptance Criteria**:
  - [ ] 4 icons changed to direct path imports
  - [ ] TypeScript/build pass
  - [ ] No other changes

  **QA Scenarios**:
  ```
  Scenario: MemberRankingCard icons refactored
    Tool: Bash
    Steps:
      1. npm run type-check && npm run build
      2. grep "@ant-design/icons" src/components/MemberRankingCard.tsx
    Expected Result: 4 direct path imports, builds pass
    Evidence: .sisyphus/evidence/task-6-rankingcard-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(icons): change MemberRankingCard.tsx to direct path imports`
  - Files: src/components/MemberRankingCard.tsx
  - Pre-commit: `npm run type-check && npm run build`

- [ ] 7. ExpiryCalendar.tsx Icon Refactoring

  **What to do**:
  - Refactor 5 icons: LeftOutlined, RightOutlined, CalendarOutlined, ReloadOutlined, WarningOutlined
  - Preserve aliases, preview with dryRun, verify build

  **Must NOT do**:
  - DO NOT change antd imports (Card, Badge, Modal, etc.)
  - DO NOT modify JSX usage

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (Sequential after Task 6)
  - **Blocks**: Tasks 8-17
  - **Blocked By**: Task 6

  **References**:
  - `frontend/src/components/ExpiryCalendar.tsx:1-10`
  - `.sisyphus/evidence/icon-usage-audit.md`

  **Acceptance Criteria**:
  - [ ] 5 icons changed to direct path imports
  - [ ] TypeScript/build pass
  - [ ] No other changes

  **QA Scenarios**:
  ```
  Scenario: ExpiryCalendar icons refactored
    Tool: Bash
    Steps:
      1. npm run type-check && npm run build
      2. grep "@ant-design/icons" src/components/ExpiryCalendar.tsx
    Expected Result: 5 direct path imports, builds pass
    Evidence: .sisyphus/evidence/task-7-calendar-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(icons): change ExpiryCalendar.tsx to direct path imports`
  - Files: src/components/ExpiryCalendar.tsx

- [ ] 8. Login.tsx Icon Refactoring

  **What to do**:
  - Refactor 2 icons: UserOutlined, LockOutlined
  - Preserve aliases, preview with dryRun, verify build

  **Must NOT do**:
  - DO NOT change antd imports (Form, Input, Button, Card, message)
  - DO NOT modify JSX

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (Sequential after Task 7)
  - **Blocks**: Tasks 9-17
  - **Blocked By**: Task 7

  **References**:
  - `frontend/src/pages/Login.tsx:1-10`
  - `.sisyphus/evidence/icon-usage-audit.md`

  **Acceptance Criteria**:
  - [ ] 2 icons changed to direct path imports
  - [ ] TypeScript/build pass
  - [ ] No other changes

  **QA Scenarios**:
  ```
  Scenario: Login icons refactored
    Tool: Bash
    Steps:
      1. npm run type-check && npm run build
      2. grep "@ant-design/icons" src/pages/Login.tsx
    Expected Result: 2 direct path imports, builds pass
    Evidence: .sisyphus/evidence/task-8-login-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(icons): change Login.tsx to direct path imports`
  - Files: src/pages/Login.tsx

- [ ] 9. Members.tsx Icon Refactoring

  **What to do**:
  - Refactor 7 icons: PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, EyeOutlined, UnorderedListOutlined, AppstoreOutlined
  - Preserve aliases, preview with dryRun, verify build

  **Must NOT do**:
  - DO NOT change antd imports (Card, Table, Button, Modal, etc.)
  - DO NOT modify JSX

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (Sequential after Task 8)
  - **Blocks**: Tasks 10-17
  - **Blocked By**: Task 8

  **References**:
  - `frontend/src/pages/Members.tsx:1-10`
  - `.sisyphus/evidence/icon-usage-audit.md`

  **Acceptance Criteria**:
  - [ ] 7 icons changed to direct path imports
  - [ ] TypeScript/build pass
  - [ ] No other changes

  **QA Scenarios**:
  ```
  Scenario: Members icons refactored
    Tool: Bash
    Steps:
      1. npm run type-check && npm run build
      2. grep "@ant-design/icons" src/pages/Members.tsx | wc -l
    Expected Result: 7+ direct path imports, builds pass
    Evidence: .sisyphus/evidence/task-9-members-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(icons): change Members.tsx to direct path imports`
  - Files: src/pages/Members.tsx

- [ ] 10. MemberDetail.tsx Icon Refactoring

  **What to do**:
  - Refactor 9 icons: ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, ClockCircleOutlined, ClearOutlined, UnorderedListOutlined, FieldTimeOutlined
  - Preserve aliases, preview with dryRun, verify build

  **Must NOT do**:
  - DO NOT change antd imports
  - DO NOT modify JSX

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (Sequential after Task 9)
  - **Blocks**: Tasks 11-17
  - **Blocked By**: Task 9

  **References**:
  - `frontend/src/pages/MemberDetail.tsx:1-10`
  - `.sisyphus/evidence/icon-usage-audit.md`

  **Acceptance Criteria**:
  - [ ] 9 icons changed to direct path imports
  - [ ] TypeScript/build pass
  - [ ] No other changes

  **QA Scenarios**:
  ```
  Scenario: MemberDetail icons refactored
    Tool: Bash
    Steps:
      1. npm run type-check && npm run build
      2. grep "@ant-design/icons" src/pages/MemberDetail.tsx
    Expected Result: 9 direct path imports, builds pass
    Evidence: .sisyphus/evidence/task-10-memberdetail-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(icons): change MemberDetail.tsx to direct path imports`
  - Files: src/pages/MemberDetail.tsx

- [ ] 11. Settings.tsx Icon Refactoring

  **What to do**:
  - Refactor 5 icons: PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined, UserOutlined
  - Preserve aliases, preview with dryRun, verify build

  **Must NOT do**:
  - DO NOT change antd imports
  - DO NOT modify JSX

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (Sequential after Task 10)
  - **Blocks**: Tasks 12-17
  - **Blocked By**: Task 10

  **References**:
  - `frontend/src/pages/Settings.tsx:1-10`
  - `.sisyphus/evidence/icon-usage-audit.md`

  **Acceptance Criteria**:
  - [ ] 5 icons changed to direct path imports
  - [ ] TypeScript/build pass
  - [ ] No other changes

  **QA Scenarios**:
  ```
  Scenario: Settings icons refactored
    Tool: Bash
    Steps:
      1. npm run type-check && npm run build
      2. grep "@ant-design/icons" src/pages/Settings.tsx
    Expected Result: 5 direct path imports, builds pass
    Evidence: .sisyphus/evidence/task-11-settings-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(icons): change Settings.tsx to direct path imports`
  - Files: src/pages/Settings.tsx

- [ ] 12. Journal.tsx Icon Refactoring

  **What to do**:
  - Refactor 5 icons: PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SmileOutlined
  - Preserve aliases, preview with dryRun, verify build

  **Must NOT do**:
  - DO NOT change antd imports
  - DO NOT modify JSX

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (Sequential after Task 11)
  - **Blocks**: Tasks 13-17
  - **Blocked By**: Task 11

  **References**:
  - `frontend/src/pages/Journal.tsx:1-10`
  - `.sisyphus/evidence/icon-usage-audit.md`

  **Acceptance Criteria**:
  - [ ] 5 icons changed to direct path imports
  - [ ] TypeScript/build pass
  - [ ] No other changes

  **QA Scenarios**:
  ```
  Scenario: Journal icons refactored
    Tool: Bash
    Steps:
      1. npm run type-check && npm run build
      2. grep "@ant-design/icons" src/pages/Journal.tsx
    Expected Result: 5 direct path imports, builds pass
    Evidence: .sisyphus/evidence/task-12-journal-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(icons): change Journal.tsx to direct path imports`
  - Files: src/pages/Journal.tsx

- [ ] 13. Statistics.tsx Icon Refactoring

  **What to do**:
  - Refactor icons used in Statistics.tsx (check audit file for exact icons)
  - Preserve aliases, preview with dryRun, verify build

  **Must NOT do**:
  - DO NOT change antd imports
  - DO NOT modify JSX

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (Sequential after Task 12)
  - **Blocks**: Tasks 14-17
  - **Blocked By**: Task 12

  **References**:
  - `frontend/src/pages/Statistics.tsx:1-10`
  - `.sisyphus/evidence/icon-usage-audit.md`

  **Acceptance Criteria**:
  - [ ] All icons changed to direct path imports
  - [ ] TypeScript/build pass
  - [ ] No other changes

  **QA Scenarios**:
  ```
  Scenario: Statistics icons refactored
    Tool: Bash
    Steps:
      1. npm run type-check && npm run build
      2. grep "@ant-design/icons" src/pages/Statistics.tsx
    Expected Result: Direct path imports, builds pass
    Evidence: .sisyphus/evidence/task-13-statistics-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(icons): change Statistics.tsx to direct path imports`
  - Files: src/pages/Statistics.tsx

- [ ] 14. MemberCard.tsx Icon Refactoring

  **What to do**:
  - Refactor 3 icons: EyeOutlined, EditOutlined, DeleteOutlined
  - Preserve aliases, preview with dryRun, verify build

  **Must NOT do**:
  - DO NOT change antd imports
  - DO NOT modify JSX

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (Sequential after Task 13)
  - **Blocks**: Tasks 15-17
  - **Blocked By**: Task 13

  **References**:
  - `frontend/src/components/MemberCard.tsx:1-10`
  - `.sisyphus/evidence/icon-usage-audit.md`

  **Acceptance Criteria**:
  - [ ] 3 icons changed to direct path imports
  - [ ] TypeScript/build pass
  - [ ] No other changes

  **QA Scenarios**:
  ```
  Scenario: MemberCard icons refactored
    Tool: Bash
    Steps:
      1. npm run type-check && npm run build
      2. grep "@ant-design/icons" src/components/MemberCard.tsx
    Expected Result: 3 direct path imports, builds pass
    Evidence: .sisyphus/evidence/task-14-membercard-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(icons): change MemberCard.tsx to direct path imports`
  - Files: src/components/MemberCard.tsx

- [ ] 15. SubscriptionTimeline.tsx Icon Refactoring

  **What to do**:
  - Refactor 4 icons: LeftOutlined, RightOutlined, ZoomInOutlined, ZoomOutOutlined
  - Preserve aliases, preview with dryRun, verify build

  **Must NOT do**:
  - DO NOT change antd imports
  - DO NOT modify JSX

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (Sequential after Task 14)
  - **Blocks**: Tasks 16-18
  - **Blocked By**: Task 14

  **References**:
  - `frontend/src/components/SubscriptionTimeline.tsx:1-10`
  - `.sisyphus/evidence/icon-usage-audit.md`

  **Acceptance Criteria**:
  - [ ] 4 icons changed to direct path imports
  - [ ] TypeScript/build pass
  - [ ] No other changes

  **QA Scenarios**:
  ```
  Scenario: SubscriptionTimeline icons refactored
    Tool: Bash
    Steps:
      1. npm run type-check && npm run build
      2. grep "@ant-design/icons" src/components/SubscriptionTimeline.tsx
    Expected Result: 4 direct path imports, builds pass
    Evidence: .sisyphus/evidence/task-15-timeline-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(icons): change SubscriptionTimeline.tsx to direct path imports`
  - Files: src/components/SubscriptionTimeline.tsx

- [ ] 16. EventCard.tsx Icon Refactoring

  **What to do**:
  - Refactor 5 icons: EditOutlined, DeleteOutlined, PlusOutlined, ClockCircleOutlined, EnvironmentOutlined
  - Preserve aliases, preview with dryRun, verify build

  **Must NOT do**:
  - DO NOT change antd imports
  - DO NOT modify JSX

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (Sequential after Task 15)
  - **Blocks**: Tasks 17-18
  - **Blocked By**: Task 15

  **References**:
  - `frontend/src/components/EventCard.tsx:1-10`
  - `.sisyphus/evidence/icon-usage-audit.md`

  **Acceptance Criteria**:
  - [ ] 5 icons changed to direct path imports
  - [ ] TypeScript/build pass
  - [ ] No other changes

  **QA Scenarios**:
  ```
  Scenario: EventCard icons refactored
    Tool: Bash
    Steps:
      1. npm run type-check && npm run build
      2. grep "@ant-design/icons" src/components/EventCard.tsx
    Expected Result: 5 direct path imports, builds pass
    Evidence: .sisyphus/evidence/task-16-eventcard-refactor.txt
  ```

  **Commit**: YES
  - Message: `refactor(icons): change EventCard.tsx to direct path imports`
  - Files: src/components/EventCard.tsx

- [ ] 17. ErrorBoundary.tsx Icon Check

  **What to do**:
  - Read ErrorBoundary.tsx and verify no icons imported from @ant-design/icons
  - If icons exist, refactor to direct path imports
  - Document in evidence that this file has 0 icon imports

  **Must NOT do**:
  - DO NOT change antd imports (Result, Button)
  - DO NOT add unnecessary changes if no icons exist

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (Sequential after Task 16)
  - **Blocks**: Task 18
  - **Blocked By**: Task 16

  **References**:
  - `frontend/src/components/ErrorBoundary.tsx`

  **Acceptance Criteria**:
  - [ ] File checked for icon imports
  - [ ] If icons exist, refactored; if none, documented
  - [ ] TypeScript/build pass

  **QA Scenarios**:
  ```
  Scenario: ErrorBoundary icon check
    Tool: Bash
    Steps:
      1. grep "@ant-design/icons" src/components/ErrorBoundary.tsx
      2. npm run type-check && npm run build
    Expected Result: Either 0 icons (documented) or refactored imports, builds pass
    Evidence: .sisyphus/evidence/task-17-errorboundary-check.txt
  ```

  **Commit**: YES (if changes needed)
  - Message: `refactor(icons): change ErrorBoundary.tsx to direct path imports` (if icons found)
  - Files: src/components/ErrorBoundary.tsx (if modified)

- [ ] 18. Vite optimizeDeps Configuration

  **What to do**:
  - Add `optimizeDeps.include` to vite.config.ts
  - Include: `['antd', '@ant-design/icons', 'react', 'react-dom', 'react-router-dom']`
  - Add `server.warmup.clientFiles` for dev startup optimization: `['./src/App.tsx', './src/main.tsx']`
  - Verify build passes and dev server starts faster

  **Must NOT do**:
  - DO NOT change existing manualChunks configuration
  - DO NOT modify compression settings
  - DO NOT upgrade Vite version

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Vite config enhancement, straightforward addition
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (Sequential after Task 17)
  - **Blocks**: Tasks F1-F4
  - **Blocked By**: Task 17

  **References**:
  - `frontend/vite.config.ts` - Add optimizeDeps and server.warmup sections
  - Official docs: https://vitejs.dev/guide/dep-pre-bundling.html

  **Acceptance Criteria**:
  - [ ] optimizeDeps.include added with 5 dependencies
  - [ ] server.warmup.clientFiles added
  - [ ] `npm run build` passes
  - [ ] `npm run dev` starts (verify faster startup qualitatively)

  **QA Scenarios**:
  ```
  Scenario: Vite optimizeDeps configured
    Tool: Bash
    Steps:
      1. grep "optimizeDeps" vite.config.ts
      2. grep "warmup" vite.config.ts
      3. npm run build
      4. npm run dev (timeout 5s, check startup)
    Expected Result: Config additions present, build passes, dev server starts
    Evidence: .sisyphus/evidence/task-18-vite-config.txt
  ```

  **Commit**: YES
  - Message: `perf(vite): add optimizeDeps.include for faster dev startup`
  - Files: vite.config.ts
  - Pre-commit: `npm run build`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

- [ ] F1. **Bundle Size Verification** — `oracle`
  Run `npm run build`, measure exact bytes of vendor-antd and vendor-icons chunks (gzip). Compare against baseline captured in Task 2. Verify minimum 30% reduction achieved (target 50%). Check bundle analyzer stats.html exists and shows tree-shaking effectiveness. Output: Before/After sizes in bytes, reduction percentage, VERDICT: PASS/FAIL.

- [ ] F2. **Build Integrity Check** — `unspecified-high`
  Run `npm run type-check` (TypeScript compilation), verify exit code 0. Run `npm test`, verify all 38 tests pass. Check dist/assets contains all expected chunks (vendor-antd, vendor-icons, vendor-react, vendor-charts, vendor-utils). Verify compression files exist (.gz, .br). Run `npm run build` one final time, verify no errors. Output: TypeScript [PASS/FAIL], Tests [38/38], Chunks [N present], VERDICT.

- [ ] F3. **Manual Visual Verification Guidance** — `unspecified-high`
  Generate comprehensive manual verification checklist document at `.sisyphus/evidence/manual-verification-checklist.md`. List all 11 files with specific icons to check, exact component locations (file:line), and expected appearance. Provide step-by-step instructions for user to visually verify each icon renders correctly. This task PROVIDES guidance; actual verification performed by user. Output: Checklist document created, VERDICT: GUIDANCE_PROVIDED.

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff for each commit). Verify 1:1 — everything in spec was done (no missing icons, no missing files), nothing beyond spec was done (no adjacent code changes, no extra optimizations). Check "Must NOT do" compliance. Detect cross-task contamination: verify only icon import paths changed, no other modifications. Output: Tasks [18/18 compliant], Contamination [CLEAN/N issues], VERDICT.

---

## Commit Strategy

- **Task 1**: `perf(infra): add bundle analyzer for performance monitoring` — vite.config.ts, package.json
- **Task 2**: `docs(baseline): capture initial bundle sizes before optimization` — .sisyphus/evidence/baseline-sizes.txt
- **Task 3**: `docs(audit): document icon usage patterns and transformation plan` — .sisyphus/evidence/icon-usage-audit.md
- **Task 4**: `refactor(icons): change Layout.tsx to direct path imports` — src/components/Layout.tsx
- **Task 5**: `refactor(icons): change Dashboard.tsx to direct path imports` — src/pages/Dashboard.tsx
- **Task 6**: `refactor(icons): change MemberRankingCard.tsx to direct path imports` — src/components/MemberRankingCard.tsx
- **Task 7**: `refactor(icons): change ExpiryCalendar.tsx to direct path imports` — src/components/ExpiryCalendar.tsx
- **Task 8**: `refactor(icons): change Login.tsx to direct path imports` — src/pages/Login.tsx
- **Task 9**: `refactor(icons): change Members.tsx to direct path imports` — src/pages/Members.tsx
- **Task 10**: `refactor(icons): change MemberDetail.tsx to direct path imports` — src/pages/MemberDetail.tsx
- **Task 11**: `refactor(icons): change Settings.tsx to direct path imports` — src/pages/Settings.tsx
- **Task 12**: `refactor(icons): change Journal.tsx to direct path imports` — src/pages/Journal.tsx
- **Task 13**: `refactor(icons): change Statistics.tsx to direct path imports` — src/pages/Statistics.tsx
- **Task 14**: `refactor(icons): change MemberCard.tsx to direct path imports` — src/components/MemberCard.tsx
- **Task 15**: `refactor(icons): change SubscriptionTimeline.tsx to direct path imports` — src/components/SubscriptionTimeline.tsx
- **Task 16**: `refactor(icons): change EventCard.tsx to direct path imports` — src/components/EventCard.tsx
- **Task 18**: `perf(vite): add optimizeDeps.include for faster dev startup` — vite.config.ts

---

## Success Criteria

### Verification Commands
```bash
# Bundle size verification
cd /home/lizy/projects/CrownFlow/frontend && npm run build
cd dist/assets && ls -lh vendor-antd-*.js vendor-icons-*.js
du -b vendor-antd-*.js.gz vendor-icons-*.js.gz | awk '{print $1, $2}'

# TypeScript compilation
npm run type-check
# Expected: Exit code 0

# Tests execution
npm test
# Expected: 38 tests pass, 0 failures

# Bundle analyzer
npm run build:analyze
ls dist/stats.html
# Expected: stats.html exists

# All chunks present
ls dist/assets/vendor-*.js
# Expected: vendor-antd, vendor-icons, vendor-react, vendor-charts, vendor-utils
```

### Final Checklist
- [ ] Bundle analyzer added and generating stats.html
- [ ] Baseline sizes captured (exact bytes)
- [ ] All 11 files refactored (35 icons)
- [ ] Build passes after each file
- [ ] TypeScript compilation passes
- [ ] All 38 existing tests pass
- [ ] Bundle size reduced by minimum 30%
- [ ] Manual verification checklist provided to user
- [ ] User confirms visual verification completed
- [ ] No adjacent code changes detected
- [ ] All "Must NOT" constraints satisfied