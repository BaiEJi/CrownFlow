# Dashboard 首屏加载优化计划

## TL;DR

> **核心目标**: 延迟加载 Dashboard 的次要组件（MemberRankingCard、ExpiryCalendar），提升首屏速度
>
> **交付物**: 
> - Dashboard 子组件延迟加载（React.lazy + Suspense）
> - Skeleton 骨架屏占位符
> - API 请求优先级分离（立即：统计+提醒；延迟：排名+日历）
>
> **工作量**: Quick（1-2小时）
> **并行执行**: NO - 顺序修改单一文件
> **关键路径**: Skeleton组件 → Dashboard lazy导入 → QA验证

---

## Context

### 原始需求
"最大的痛点是第一次进入这个网页的时候，会加载太多前端组件导致用户体验非常卡，优化一下（因为网络带宽小，不能一次加载太多的组件）"

### 讨论总结
**关键决策**:
- 首屏速度优先：延迟次要数据，骨架屏占位
- Dashboard立即显示：4个统计卡片 + 即将到期提醒
- 延迟组件：MemberRankingCard、ExpiryCalendar
- 占位方式：Ant Design Skeleton 骨架屏
- 快速见效：最小改动，预计1-2小时

**研究发现**:
- 当前 Dashboard 有 4 个 API 同时调用（useOverview + useReminders + MemberRankingCard内部 + ExpiryCalendar内部）
- MemberRankingCard 调用 `memberApi.getAll({ page: 1, page_size: 1000 })` - 最多1000条数据
- ExpiryCalendar 调用 `reminderApi.getAll()` + 农历计算（lunar-javascript）
- 延迟加载这两个组件 → 自然延迟其 API 调用和数据计算

### Metis 审查
**识别的 gaps（已处理）**:
- ❌ useTrend/useCategoryStats 不存在于 Dashboard（Metis误判）
- ✅ Error Boundary：暂不添加（简化范围）
- ✅ Skeleton精度：使用 Ant Design Card `loading={true}`（最简单）
- ✅ 延迟时机：React.lazy + Suspense（标准做法）

---

## Work Objectives

### 核心目标
Dashboard 首屏加载时，立即显示关键统计数据（4卡片+提醒），次要组件（排名+日历）延迟加载并用骨架屏占位。

### 具体交付物
- Dashboard.tsx 修改为 lazy 导入 MemberRankingCard 和 ExpiryCalendar
- Skeleton 占位组件（两个 Card 带 loading 状态）
- 保持 useOverview 和 useReminders 立即调用（`immediate: true`）
- 延迟加载自然延迟子组件内的 API 调用

### Done 定义
- [ ] Dashboard 首屏渲染时间缩短（可测量）
- [ ] Skeleton 骨架屏正确显示
- [ ] 延迟组件在数据加载后正常渲染
- [ ] 无 TypeScript 或 lint 错误
- [ ] 功能完整性保持（刷新、点击跳转等）

### Must Have
- React.lazy 导入 MemberRankingCard 和 ExpiryCalendar
- Suspense 包裹，fallback 为 Skeleton
- 保持统计数据立即加载

### Must NOT Have（Guardrails）
- ❌ 不修改其他页面（Members、Statistics 等）
- ❌ 不改变 useOverview 或 useReminders 的 immediate 参数
- ❌ 不添加 prefetch、Service Worker、缓存策略（超出范围）
- ❌ 不修改构建配置（vite.config.ts）
- ❌ 不添加过度复杂的 Error Boundary（简化范围）

---

## Verification Strategy

### 测试决策
- **基础设施存在**: YES（vitest + frontend测试配置）
- **自动化测试**: Tests-after（不强制 TDD，快速见效）
- **框架**: vitest
- **Agent QA**: ALWAYS（mandatory）

### QA 策略
每个任务必须包含 agent-executed QA scenarios：
- **前端/UI**: 使用 Playwright skill — 打开页面，验证骨架屏显示，验证数据加载完成
- **CLI**: 使用 Bash — npm run build，tsc --noEmit
- **证据**: `.sisyphus/evidence/task-{N}-{scenario-slug}.{png/json/log}`

---

## Execution Strategy

### 并行执行波次

```
Wave 1（顺序执行 — 单文件修改）:
└── Task 1: 创建 Skeleton 占位组件 [quick]
└── Task 2: Dashboard lazy导入改造 [quick]
└── Task 3: QA验证 + 构建测试 [quick]

Wave FINAL（验证阶段）:
└── Task F1: Plan compliance audit（oracle）
└── Task F2: Code quality review（unspecified-high）
└── Task F3: Real manual QA（unspecified-high + playwright）
└── Task F4: Scope fidelity check（deep）
→ 展示结果 → 用户确认 OK → 完成

关键路径: Task 1 → Task 2 → Task 3 → F1-F4 → 用户OK
```

### Agent 调度摘要
- **Wave 1**: 3 tasks → `quick`
- **Wave FINAL**: 4 tasks → `oracle` + `unspecified-high` + `playwright` + `deep`

---

## TODOs

- [x] 1. 创建 DashboardSkeleton 占位组件

  **What to do**:
  - 在 Dashboard.tsx 文件顶部创建两个简单的 Skeleton 占位组件
  - `MemberRankingSkeleton`: 一个 Card 带 Skeleton（avatar + 3 rows）
  - `CalendarSkeleton`: 一个 Card 带 Skeleton（paragraph rows: 8）
  - 使用 Ant Design 的 `<Skeleton>` 组件（无需外部文件，inline定义即可）

  **Must NOT do**:
  - ❌ 不创建单独的 Skeleton.tsx 文件（inline在 Dashboard 内即可）
  - ❌ 不使用复杂的样式或动画
  - ❌ 不修改其他文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单一文件小改动，无需复杂逻辑
  - **Skills**: []
    - 无需特殊技能，React基础即可

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential（Task 1先完成）
  - **Blocks**: Task 2
  - **Blocked By**: None（可立即开始）

  **References** (CRITICAL):

  > Executor无context，必须明确说明what和why

  **Pattern References**:
  - `frontend/src/pages/Dashboard.tsx:135-141` - Card + loading prop 示例（现有）
  - `frontend/src/pages/Dashboard.tsx:199` - Card + loading prop 示例（现有）
  - Ant Design Skeleton docs: https://ant.design/components/skeleton-cn

  **WHY Each Reference Matters**:
  - `Dashboard.tsx:135-141`: 展示现有 Card loading 用法，可直接复制模式
  - `Dashboard.tsx:199`: 另一个 Card loading 示例，验证模式一致性
  - Ant Design docs: Skeleton API（active, avatar, paragraph等参数）

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Skeleton组件创建验证
    Tool: Bash
    Preconditions: Dashboard.tsx 已修改
    Steps:
      1. grep -n "MemberRankingSkeleton" frontend/src/pages/Dashboard.tsx
      2. grep -n "CalendarSkeleton" frontend/src/pages/Dashboard.tsx
      3. grep -n "from 'antd'" frontend/src/pages/Dashboard.tsx | grep Skeleton
    Expected Result: 
      - 找到 MemberRankingSkeleton 定义（至少1行）
      - 找到 CalendarSkeleton 定义（至少1行）
      - import 包含 Skeleton（或已包含）
    Failure Indicators: 未找到定义，或 import 缺少 Skeleton
    Evidence: .sisyphus/evidence/task-1-skeleton-created.log
  ```

  **Evidence to Capture**:
  - [ ] .sisyphus/evidence/task-1-skeleton-created.log（grep结果）

  **Commit**: NO（与Task 2一起提交）

---

- [x] 2. Dashboard lazy导入改造

  **What to do**:
  - 将 Dashboard.tsx 的直接导入改为 lazy 导入：
    ```tsx
    // 当前（line 22-23）:
    import MemberRankingCard from '@/components/MemberRankingCard';
    import ExpiryCalendar from '@/components/ExpiryCalendar';
    
    // 改为:
    const MemberRankingCard = lazy(() => import('@/components/MemberRankingCard'));
    const ExpiryCalendar = lazy(() => import('@/components/ExpiryCalendar'));
    ```
  - 添加 React.lazy 导入（已在文件中有 React 导入，添加 lazy）
  - 用 Suspense 包裹两个组件，fallback 使用创建的 Skeleton
  - 保持 Row/Col 布局不变，只替换组件内容

  **Must NOT do**:
  - ❌ 不修改 useOverview 或 useReminders 的调用
  - ❌ 不改变 Row/Col 布局结构
  - ❌ 不修改 MemberRankingCard.tsx 或 ExpiryCalendar.tsx
  - ❌ 不添加 ErrorBoundary（简化范围）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 标准的 React lazy改造，模式清晰
  - **Skills**: []
    - React lazy + Suspense 是基础技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential（依赖 Task 1）
  - **Blocks**: Task 3
  - **Blocked By**: Task 1（Skeleton组件必须先创建）

  **References**:

  **Pattern References**:
  - `frontend/src/App.tsx:17-23` - lazy 导入示例（现有页面lazy模式）
  - `frontend/src/App.tsx:42-50` - Suspense fallback 示例（现有Suspense用法）
  - `frontend/src/pages/Dashboard.tsx:260-267` - 目标位置（Row/Col布局）

  **WHY Each Reference Matters**:
  - `App.tsx:17-23`: 展示 lazy 导入的正确语法，直接复制模式
  - `App.tsx:42-50`: 展示 Suspense fallback 的用法，复制此模式
  - `Dashboard.tsx:260-267`: 需要修改的目标位置，明确指出

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Lazy导入验证
    Tool: Bash
    Preconditions: Dashboard.tsx 已修改
    Steps:
      1. grep -n "lazy(() => import" frontend/src/pages/Dashboard.tsx
      2. grep -n "Suspense" frontend/src/pages/Dashboard.tsx
      3. grep -n "MemberRankingCard" frontend/src/pages/Dashboard.tsx | grep -v "//"
      4. grep -n "ExpiryCalendar" frontend/src/pages/Dashboard.tsx | grep -v "//"
    Expected Result:
      - 找到2行 lazy 导入（MemberRankingCard 和 ExpiryCalendar）
      - 找到≥2行 Suspense（两个Suspense块）
      - 无直接 import MemberRankingCard（只有lazy）
      - 无直接 import ExpiryCalendar（只有lazy）
    Failure Indicators: 
      - 只有1行 lazy，或无 Suspense
      - 存在直接 import 语句（未删除）
    Evidence: .sisyphus/evidence/task-2-lazy-import.log
  ```

  ```
  Scenario: TypeScript编译验证
    Tool: Bash
    Preconditions: 代码已修改
    Steps:
      1. cd frontend && npm run type-check（或 tsc --noEmit）
    Expected Result: 无 TypeScript 错误
    Failure Indicators: 报错（lazy import类型问题）
    Evidence: .sisyphus/evidence/task-2-typescript.log
  ```

  ```
  Scenario: 构建验证
    Tool: Bash
    Preconditions: TypeScript编译通过
    Steps:
      1. cd frontend && npm run build
      2. ls -la dist/assets/ | grep -E "(MemberRanking|ExpiryCalendar)"
    Expected Result: 
      - Build 成功，无错误
      - 可能生成新的chunk文件（包含 lazy组件）
    Failure Indicators: Build 失败
    Evidence: .sisyphus/evidence/task-2-build.log
  ```

  **Evidence to Capture**:
  - [ ] .sisyphus/evidence/task-2-lazy-import.log
  - [ ] .sisyphus/evidence/task-2-typescript.log
  - [ ] .sisyphus/evidence/task-2-build.log

  **Commit**: YES
  - Message: `perf(dashboard): lazy load ranking and calendar components with skeleton`
  - Files: `frontend/src/pages/Dashboard.tsx`
  - Pre-commit: `npm run lint && npm run build`

---

- [x] 3. 实际页面验证（Playwright）

  **What to do**:
  - 启动前端开发服务器（npm run dev）
  - 打开 Dashboard 页面（http://localhost:60001 或配置的端口）
  - 验证骨架屏正确显示（首屏）
  - 等待数据加载，验证延迟组件正确渲染
  - 测试刷新按钮功能
  - 测试点击跳转功能（排名卡片点击跳转到会员详情）

  **Must NOT do**:
  - ❌ 不修改其他页面
  - ❌ 不添加新测试文件（手动QA）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: QA验证任务，使用 Playwright skill
  - **Skills**: [`/playwright`]
    - `/playwright`: Browser automation，验证UI渲染

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential（依赖 Task 2完成）
  - **Blocks**: Final Verification Wave
  - **Blocked By**: Task 2（代码必须先完成）

  **References**:

  **Pattern References**:
  - `frontend/src/pages/Dashboard.tsx:260-267` - 目标组件位置
  - Dashboard 首屏: http://localhost:60001（或 .env配置的端口）

  **WHY Each Reference Matters**:
  - 目标位置明确验证区域
  - 首屏URL用于打开页面

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: 骨架屏显示验证
    Tool: Playwright（通过 playwright skill）
    Preconditions: 
      - 前端开发服务器已启动（npm run dev）
      - Dashboard 页面可访问
    Steps:
      1. 打开 Dashboard 页面（http://localhost:60001）
      2. 立即截图（首屏，延迟组件应显示骨架屏）
      3. 等待 2-3 秒
      4. 再次截图（骨架屏应消失，组件已渲染）
    Expected Result:
      - 首屏截图：左侧和右侧Card显示骨架屏（Skeleton动画）
      - 2秒后截图：排名列表和日历正确渲染
    Failure Indicators:
      - 首屏无骨架屏（组件直接显示，lazy失败）
      - 2秒后仍显示骨架屏（组件加载失败）
    Evidence: .sisyphus/evidence/task-3-skeleton-1.png, .sisyphus/evidence/task-3-rendered-2.png
  ```

  ```
  Scenario: 功能完整性验证
    Tool: Playwright
    Preconditions: 页面已加载完成
    Steps:
      1. 点击刷新按钮（ReloadOutlined图标按钮）
      2. 验证统计数据刷新（4个卡片数据更新）
      3. 点击排名卡片中的会员条目
      4. 验证跳转到会员详情页（URL变化）
    Expected Result:
      - 刷新按钮可点击，数据重新加载
      - 骨架屏再次显示，然后渲染
      - 点击跳转成功，URL变化到 `/members/{id}`
    Failure Indicators:
      - 刷新按钮无响应
      - 点击无跳转
    Evidence: .sisyphus/evidence/task-3-refresh.png, .sisyphus/evidence/task-3-navigate.png
  ```

  ```
  Scenario: 网络慢速验证（edge case）
    Tool: Playwright
    Preconditions: DevTools可用
    Steps:
      1. 设置网络 throttling（Slow 3G）
      2. 刷新页面
      3. 观察骨架屏持续时间更长
      4. 最终组件仍正确渲染
    Expected Result:
      - 骨架屏显示时间延长（网络慢）
      - 最终组件正常渲染（无失败）
    Failure Indicators: 组件加载失败，显示空白或错误
    Evidence: .sisyphus/evidence/task-3-slow-network.png
  ```

  **Evidence to Capture**:
  - [ ] .sisyphus/evidence/task-3-skeleton-1.png
  - [ ] .sisyphus/evidence/task-3-rendered-2.png
  - [ ] .sisyphus/evidence/task-3-refresh.png
  - [ ] .sisyphus/evidence/task-3-navigate.png
  - [ ] .sisyphus/evidence/task-3-slow-network.png

  **Commit**: NO（已在 Task 2提交）

---

## Final Verification Wave（MANDATORY）

> 4 review agents 并行运行。ALL必须 APPROVE。展示合并结果给用户，等待明确"okay"确认。

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read plan end-to-end. For each "Must Have": verify implementation exists (read file, check imports). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + `npm run lint` + `npm run build`. Review changed files for: `as any`/`@ts-ignore`, unused imports, console.log. Check AI slop: excessive comments, over-abstraction.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | TypeScript [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` + `playwright` skill
  Start from clean state (npm run dev). Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test integration (刷新按钮、点击跳转). Test edge cases (网络慢、数据为空). Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git diff). Verify 1:1 — everything in spec built (no missing), nothing beyond spec built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **1**: `perf(dashboard): lazy load ranking and calendar components with skeleton`
  - Files: `frontend/src/pages/Dashboard.tsx`
  - Pre-commit: `npm run lint && npm run build`

---

## Success Criteria

### 验证命令
```bash
# 构建验证
cd frontend && npm run build

# TypeScript 检查
npm run type-check  # 或 tsc --noEmit

# 验证 lazy 导入存在
grep -n "lazy(() => import" src/pages/Dashboard.tsx
# Expected: 2行（MemberRankingCard 和 ExpiryCalendar）

# 验证 Suspense 包裹
grep -n "Suspense" src/pages/Dashboard.tsx
# Expected: ≥2行（两个Suspense块）
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] TypeScript 编译通过
- [ ] Build 成功
- [ ] Skeleton 正确显示
- [ ] 延迟组件正常渲染
- [ ] 首屏加载速度提升（可感知）