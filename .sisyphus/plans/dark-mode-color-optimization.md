# 暗色模式配色优化工作计划

## TL;DR

> **Quick Summary**: 为 CrownFlow 系统优化暗色模式配色方案，解决颜色刺眼问题。创建暗色专用色板，实现颜色动态调整工具，逐组件优化图表、统计数字、卡片等所有硬编码颜色。
> 
> **Deliverables**:
> - 颜色调整工具函数 `adjustColorForDarkMode()`
> - 暗色专用图表色板 `DARK_COLORS`
> - 优化后的组件：Statistics、Dashboard、MemberCard、MemberRankingCard、Members
> - 视觉回归测试套件
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 (颜色工具) → Task 2-6 (组件优化) → Task 7 (测试验证)

---

## Context

### Original Request
用户反馈："暗色模式下很多颜色很突出（刺眼），优化暗色模式下的配色方案。"

### Interview Summary
**Key Discussions**:
- **图表策略**: 设计暗色专用色板（降低饱和度和亮度）
- **优化范围**: 全面优化（图表、统计数字、Tag、Badge、Card等所有组件）
- **分类颜色**: 动态调整用户自定义颜色（自动降低亮度/饱和度）

**Research Findings**:
- **主题架构**: 已有 Ant Design `theme.darkAlgorithm`，但缺少组件级优化
- **硬编码颜色**: 16个源文件存在硬编码颜色值
- **图表集成**: Recharts v2.10.0 部分支持暗色模式（Tooltip已处理，轴线/网格未处理）
- **CSS覆盖**: index.css 中约28个 `!important` 覆盖

### Metis Review
**Identified Gaps** (addressed):
- **测试策略缺失**: 缺少具体的测试命令和验证方法 → 已添加 Playwright 视觉测试
- **颜色调整算法未定义**: 未确定具体的 HSL 调整公式 → 已定义公式
- **优先级未排序**: 16个文件未分优先级 → 已按用户可见性和使用频率排序
- **回归风险**: 未考虑浅色模式回归测试 → 已添加双向测试要求

**Scope Boundaries**:
- **包含**: Statistics.tsx, Dashboard.tsx, MemberCard.tsx, MemberRankingCard.tsx, Members.tsx
- **排除**: Login.tsx, Journal.tsx, Settings.tsx, EventModal.tsx（未明确要求）
- **架构**: 不重构现有 CSS overrides，专注于颜色优化

---

## Work Objectives

### Core Objective
为暗色模式创建柔和、协调的配色方案，解决颜色刺眼问题，同时保持浅色模式不受影响。

### Concrete Deliverables
1. 颜色调整工具函数：`adjustColorForDarkMode(hex, options)`
2. 暗色专用图表色板：`DARK_COLORS` 数组（8种柔和颜色）
3. 优化后的组件：
   - Statistics.tsx: 图表颜色、网格线、参考线
   - Dashboard.tsx: Statistic 数值颜色
   - MemberCard.tsx: 边框颜色、价格颜色
   - MemberRankingCard.tsx: 排名图标、进度条颜色
   - Members.tsx: Tag 用户分类颜色
4. 测试套件：Playwright 视觉回归测试

### Definition of Done
- [ ] 所有硬编码颜色已替换为主题感知颜色
- [ ] 暗色模式下所有组件颜色柔和、协调
- [ ] 浅色模式回归测试通过（无破坏性变更）
- [ ] 视觉回归测试通过（Playwright 截图对比）
- [ ] 颜色对比度符合 WCAG AA 标准（≥4.5:1）

### Must Have
- 颜色调整算法必须明确定义（HSL 公式）
- 每个修改必须测试浅色模式和暗色模式
- 保持现有 `theme-change` 事件系统
- 使用 `theme.useToken()` hook 模式

### Must NOT Have (Guardrails)
- **禁止**: 添加新的 `!important` CSS 覆盖
- **禁止**: 修改不在范围内的组件（Login、Journal、Settings等）
- **禁止**: 引入新的主题状态重复
- **禁止**: 使用无法处理双模式的工具函数
- **禁止**: AI slop 模式：过度抽象、未请求的基础设施、超出范围的测试

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (需要手动验证)
- **Automated tests**: NO (手动验证为主)
- **Test strategy**:
  1. 浅色模式手动验证（确保无破坏）
  2. 暗色模式手动验证（视觉检查）
  3. 颜色对比度手动检查（WebAIM 对比度检查器）
  4. 组件功能验证（主题切换）

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, switch theme, screenshot, compare colors
- **Accessibility**: Use axe-core — Audit contrast ratios, verify WCAG AA compliance
- **Unit Tests**: Use bun test — Assert color values, test adjustment algorithm
- **Visual Regression**: Use Playwright — Screenshot comparison between light/dark modes

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 0 (Optional Infrastructure):
└── Task 0: 设置测试基础设施 [quick] (可选)

Wave 1 (Foundation - sequential, all depend on Task 1):
├── Task 1: 创建颜色调整工具函数 [quick]
└── Task 2: 创建暗色图表色板 [quick]

Wave 2 (Component Optimization - MAX PARALLEL):
├── Task 3: 优化 Statistics.tsx [unspecified-high]
├── Task 4: 优化 Dashboard.tsx [quick]
├── Task 5: 优化 MemberCard.tsx [quick]
├── Task 6: 优化 MemberRankingCard.tsx [quick]
└── Task 7: 优化 Members.tsx [quick]

Wave FINAL (Verification - manual or automated based on Task 0 decision):
├── Task F1: 视觉回归测试 (oracle)
├── Task F2: 可访问性审计 (unspecified-high)
├── Task F3: 浅色模式回归测试 (deep)
└── Task F4: 代码质量检查 (quick)

Critical Path: Task 0 (optional) → Task 1 → Task 2 → Task 3-7 (parallel) → F1-F4
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 5 (Wave 2)
```

### Dependency Matrix

- **0**: — — 1-7, F1-F4 (optional)
- **1**: — — 2-7, F1-F4
- **2**: 1 — 3
- **3**: 1, 2 — F1-F4
- **4**: 1 — F1-F4
- **5**: 1 — F1-F4
- **6**: 1 — F1-F4
- **7**: 1 — F1-F4
- **F1**: 1-7 — user okay
- **F2**: 1-7 — user okay
- **F3**: 1-7 — user okay
- **F4**: 1-7 — user okay

### Agent Dispatch Summary

- **Wave 0**: **1** — T0 → `quick` (optional)
- **Wave 1**: **2** — T1 → `quick`, T2 → `quick`
- **Wave 2**: **5** — T3 → `unspecified-high`, T4-T7 → `quick`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `deep`, F4 → `quick`

---

## TODOs

- [x] 0. 设置测试基础设施（可选）

  **What to do**:
  - 评估是否需要自动化测试基础设施
  - 如果需要，安装 Playwright 和相关依赖
  - 配置 Playwright 支持浅色/暗色模式测试
  - 创建基础测试配置文件

  **Must NOT do**:
  - 不要创建过度复杂的测试框架
  - 不要影响核心开发工作

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 基础设施设置，一次性工作
  - **Skills**: []
    - 无需特定技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (optional, can skip)
  - **Blocks**: F1-F4 (if automation desired)
  - **Blocked By**: None

  **References**:
  - `frontend/package.json` - 检查现有测试依赖
  - https://playwright.dev/docs/intro - Playwright 安装指南

  **Acceptance Criteria**:
  - [ ] 评估报告：是否需要自动化测试
  - [ ] 如果需要：Playwright 已安装和配置
  - [ ] 如果不需要：手动测试流程已定义

  **QA Scenarios**:
  ```
  Scenario: 测试基础设施决策
    Tool: Manual
    Preconditions: 无
    Steps:
      1. 检查项目规模和复杂度
      2. 评估是否需要自动化测试
      3. 记录决策和理由
    Expected Result: 明确的测试策略决策
    Evidence: .sisyphus/evidence/task-0-test-decision.txt
  ```

  **Evidence to Capture**:
  - [ ] 测试策略决策文档：task-0-test-decision.txt

  **Commit**: NO (基础设施配置，不单独提交)

- [x] 1. 创建颜色调整工具函数

  **What to do**:
  - 在 `frontend/src/utils/color.ts` 创建 `adjustColorForDarkMode(hex, options)` 函数
  - 实现 HSL 颜色空间调整算法：降低亮度 20%，降低饱和度 15%
  - 添加边界保护：避免颜色过亮或过暗
  - 编写单元测试验证调整效果

  **Must NOT do**:
  - 不要创建过度抽象的颜色系统
  - 不要引入新的依赖库
  - 不要修改现有颜色处理逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 工具函数实现，逻辑清晰，范围小
  - **Skills**: []
    - 无需特定技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 2-7, F1-F4
  - **Blocked By**: None (can start immediately)

  **References**:
  - `frontend/src/utils/index.ts` - 现有工具函数位置，了解导出模式
  - `frontend/src/pages/Statistics.tsx:52-58` - 主题检测模式参考
  - https://css-tricks.com/nerds-guide-color-conversion/ - HSL 颜色转换原理

  **Acceptance Criteria**:
  - [ ] `adjustColorForDarkMode('#1890ff')` 返回柔和的蓝色
  - [ ] `adjustColorForDarkMode('#FFFF00')` 返回不刺眼的黄色
  - [ ] 边界情况处理：纯黑、纯白、高饱和度颜色
  - [ ] 单元测试覆盖率 ≥ 90%

  **QA Scenarios**:
  ```
  Scenario: 颜色调整 - 正常颜色
    Tool: bun test
    Preconditions: 函数已实现
    Steps:
      1. 调用 adjustColorForDarkMode('#1890ff', { lightnessDelta: -0.2, saturationDelta: -0.15 })
      2. 断言返回值不等于原色
      3. 断言亮度降低约 20%
      4. 断言饱和度降低约 15%
    Expected Result: 返回柔和的蓝色 '#3b82f6'
    Evidence: .sisyphus/evidence/task-1-normal-color.txt

  Scenario: 颜色调整 - 边界情况
    Tool: bun test
    Preconditions: 函数已实现
    Steps:
      1. 测试纯黑 '#000000' → 应返回深灰
      2. 测试纯白 '#FFFFFF' → 应返回浅灰
      3. 测试高饱和度 '#FF0000' → 应降低饱和度
    Expected Result: 所有边界情况正确处理，不崩溃
    Evidence: .sisyphus/evidence/task-1-edge-cases.txt
  ```

  **Evidence to Capture**:
  - [ ] 单元测试输出：task-1-unit-tests.txt
  - [ ] 颜色调整前后对比表：task-1-color-comparison.md

  **Commit**: YES
  - Message: `feat(utils): add color adjustment utility for dark mode`
  - Files: `frontend/src/utils/color.ts`, `frontend/src/utils/color.test.ts`
  - Pre-commit: `bun test frontend/src/utils/color.test.ts`

- [x] 2. 创建暗色图表色板

  **What to do**:
  - 在 `frontend/src/constants/colors.ts` 定义 `DARK_COLORS` 数组
  - 包含 8 种柔和颜色，对应浅色模式的 COLORS
  - 确保颜色对比度符合 WCAG AA 标准（≥4.5:1）
  - 编写颜色对比度测试

  **Must NOT do**:
  - 不要替换浅色模式的 COLORS
  - 不要创建过度复杂的色板系统
  - 不要使用不协调的颜色组合

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 常量定义，逻辑简单
  - **Skills**: []
    - 无需特定技能

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (depends on Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - `frontend/src/pages/Statistics.tsx:37-46` - 现有 COLORS 数组定义
  - https://color.adobe.com/create/color-accessibility - 颜色可访问性工具
  - https://webaim.org/resources/contrastchecker/ - 对比度检查器

  **Acceptance Criteria**:
  - [ ] DARK_COLORS 数组包含 8 种颜色
  - [ ] 每种颜色对比度 ≥ 4.5:1（与暗色背景 #141414）
  - [ ] 颜色柔和、协调，不刺眼
  - [ ] 测试文件验证对比度

  **QA Scenarios**:
  ```
  Scenario: 色板对比度验证
    Tool: bun test
    Preconditions: DARK_COLORS 已定义
    Steps:
      1. 遍历 DARK_COLORS 每种颜色
      2. 计算与 #141414 背景的对比度
      3. 断言对比度 ≥ 4.5:1
    Expected Result: 所有 8 种颜色通过对比度测试
    Evidence: .sisyphus/evidence/task-2-contrast-ratios.txt

  Scenario: 色板视觉协调性
    Tool: Playwright (manual inspection)
    Preconditions: 色板已定义
    Steps:
      1. 渲染色板展示页面
      2. 切换到暗色模式
      3. 检查颜色是否柔和、协调
    Expected Result: 颜色不刺眼，视觉协调
    Evidence: .sisyphus/evidence/task-2-palette-visual.png
  ```

  **Evidence to Capture**:
  - [ ] 对比度测试结果：task-2-contrast-ratios.txt
  - [ ] 色板视觉展示：task-2-palette-visual.png

  **Commit**: YES
  - Message: `feat(constants): add dark color palette for charts`
  - Files: `frontend/src/constants/colors.ts`, `frontend/src/constants/colors.test.ts`

- [x] 3. 优化 Statistics.tsx 图表颜色

  **What to do**:
  - 替换硬编码的 COLORS 数组为主题感知的颜色选择
  - 优化折线图线条颜色（stroke='#1890ff' → 柔和蓝）
  - 优化网格线颜色（CartesianGrid stroke）
  - 优化参考线颜色（ReferenceLine stroke='#e0e0e0' → 柔和灰）
  - 使用 `theme.useToken()` hook 获取主题状态

  **Must NOT do**:
  - 不要删除现有的浅色模式 COLORS
  - 不要修改 Tooltip 样式（已适配暗色模式）
  - 不要改变图表的数据逻辑

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 多个图表元素需要协调优化，需要仔细测试
  - **Skills**: []
    - 无需特定技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4-7)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1, Task 2

  **References**:
  - `frontend/src/pages/Statistics.tsx:37-46` - COLORS 数组定义
  - `frontend/src/pages/Statistics.tsx:52-58` - 主题检测模式参考
  - `frontend/src/pages/Statistics.tsx:270` - Line stroke 颜色
  - `frontend/src/pages/Statistics.tsx:253` - CartesianGrid 配置
  - `frontend/src/pages/Statistics.tsx:277` - ReferenceLine 颜色
  - https://recharts.org/en-US/api - Recharts API 文档

  **Acceptance Criteria**:
  - [ ] 暗色模式下饼图使用 DARK_COLORS
  - [ ] 折线线条颜色柔和（不刺眼）
  - [ ] 网格线颜色柔和（#424242 或更柔和）
  - [ ] 参考线颜色柔和（不突兀）
  - [ ] 浅色模式不受影响

  **QA Scenarios**:
  ```
  Scenario: 折线图暗色模式
    Tool: Playwright
    Preconditions: 应用运行，有测试数据
    Steps:
      1. 导航到 /statistics 页面
      2. 切换到暗色模式
      3. 截图折线图区域
      4. 提取线条颜色，断言不是 '#1890ff'
      5. 提取网格线颜色，断言柔和（接近 #424242）
    Expected Result: 线条柔和，网格线不刺眼
    Evidence: .sisyphus/evidence/task-3-line-chart-dark.png

  Scenario: 饼图暗色模式
    Tool: Playwright
    Preconditions: 应用运行，有测试数据
    Steps:
      1. 导航到 /statistics 页面
      2. 切换到暗色模式
      3. 截图饼图区域
      4. 检查饼图扇区颜色是否来自 DARK_COLORS
    Expected Result: 饼图颜色柔和、协调
    Evidence: .sisyphus/evidence/task-3-pie-chart-dark.png

  Scenario: 浅色模式回归
    Tool: Playwright
    Preconditions: 修改完成
    Steps:
      1. 保持浅色模式
      2. 导航到 /statistics 页面
      3. 截图图表区域
      4. 与修改前的浅色模式截图对比
    Expected Result: 浅色模式图表外观不变
    Evidence: .sisyphus/evidence/task-3-light-regression.png
  ```

  **Evidence to Capture**:
  - [ ] 暗色模式折线图：task-3-line-chart-dark.png
  - [ ] 暗色模式饼图：task-3-pie-chart-dark.png
  - [ ] 浅色模式回归：task-3-light-regression.png

  **Commit**: YES
  - Message: `feat(Statistics): optimize chart colors for dark mode`
  - Files: `frontend/src/pages/Statistics.tsx`
  - Pre-commit: `playwright test --project=dark-mode`

- [x] 4. 优化 Dashboard.tsx 统计数字颜色

  **What to do**:
  - 替换硬编码的 Statistic valueStyle 颜色
  - 绿色 '#3f8600'（活跃会员）→ 柔和绿
  - 红色 '#cf1322'（本月支出）→ 柔和红
  - 紫色 '#722ed1'（年度支出）→ 柔和紫
  - 使用 `theme.useToken()` hook 或 CSS 变量

  **Must NOT do**:
  - 不要改变 Statistic 的数值逻辑
  - 不要修改其他 Dashboard 组件
  - 不要影响浅色模式

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的颜色替换，范围小
  - **Skills**: []
    - 无需特定技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3, 5-7)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1

  **References**:
  - `frontend/src/pages/Dashboard.tsx:136` - 活跃会员绿色
  - `frontend/src/pages/Dashboard.tsx:154` - 本月支出红色
  - `frontend/src/pages/Dashboard.tsx:172` - 年度支出紫色
  - `frontend/src/pages/Statistics.tsx:52-58` - 主题检测模式参考

  **Acceptance Criteria**:
  - [ ] 暗色模式下统计数字颜色柔和
  - [ ] 使用主题感知的颜色选择
  - [ ] 浅色模式颜色不变

  **QA Scenarios**:
  ```
  Scenario: 统计数字暗色模式
    Tool: Playwright
    Preconditions: 应用运行
    Steps:
      1. 导航到 /dashboard 页面
      2. 切换到暗色模式
      3. 提取活跃会员数值颜色
      4. 断言颜色不是 '#3f8600'（原绿色）
      5. 提取本月支出数值颜色
      6. 断言颜色不是 '#cf1322'（原红色）
    Expected Result: 所有数值颜色柔和、不刺眼
    Evidence: .sisyphus/evidence/task-4-statistics-dark.png

  Scenario: 统计数字浅色模式回归
    Tool: Playwright
    Preconditions: 修改完成
    Steps:
      1. 保持浅色模式
      2. 导航到 /dashboard 页面
      3. 截图统计卡片区域
      4. 与修改前对比
    Expected Result: 浅色模式外观不变
    Evidence: .sisyphus/evidence/task-4-light-regression.png
  ```

  **Evidence to Capture**:
  - [ ] 暗色模式统计数字：task-4-statistics-dark.png
  - [ ] 浅色模式回归：task-4-light-regression.png

  **Commit**: YES
  - Message: `feat(Dashboard): optimize statistic value colors`
  - Files: `frontend/src/pages/Dashboard.tsx`
  - Pre-commit: `playwright test --project=dark-mode`

- [x] 5. 优化 MemberCard.tsx 状态颜色

  **What to do**:
  - 替换边框硬编码颜色
  - 过期状态 '#d9d9d9' → 柔和灰
  - 即将过期 '#fa8c16' → 柔和橙
  - 正常状态 '#52c41a' → 柔和绿
  - 替换价格颜色 '#cf1322' → 柔和红
  - 使用主题感知的颜色选择

  **Must NOT do**:
  - 不要改变状态判断逻辑
  - 不要修改卡片布局
  - 不要影响浅色模式

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 简单的颜色替换
  - **Skills**: []
    - 无需特定技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3-4, 6-7)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1

  **References**:
  - `frontend/src/components/MemberCard.tsx:22-26` - 边框颜色逻辑
  - `frontend/src/components/MemberCard.tsx:76` - 价格颜色
  - `frontend/src/pages/Statistics.tsx:52-58` - 主题检测模式参考

  **Acceptance Criteria**:
  - [ ] 暗色模式下边框颜色柔和
  - [ ] 价格颜色不刺眼
  - [ ] 使用主题感知的颜色选择
  - [ ] 浅色模式不受影响

  **QA Scenarios**:
  ```
  Scenario: 会员卡片边框暗色模式
    Tool: Playwright
    Preconditions: 有不同状态的会员数据
    Steps:
      1. 导航到 /members 页面（卡片视图）
      2. 切换到暗色模式
      3. 检查正常状态卡片边框颜色
      4. 检查即将过期卡片边框颜色
      5. 检查已过期卡片边框颜色
    Expected Result: 所有边框颜色柔和，不刺眼
    Evidence: .sisyphus/evidence/task-5-borders-dark.png

  Scenario: 价格颜色暗色模式
    Tool: Playwright
    Preconditions: 有会员数据
    Steps:
      1. 导航到 /members 页面（卡片视图）
      2. 切换到暗色模式
      3. 提取价格颜色
      4. 断言颜色不是 '#cf1322'（原红色）
    Expected Result: 价格颜色柔和
    Evidence: .sisyphus/evidence/task-5-price-dark.png
  ```

  **Evidence to Capture**:
  - [ ] 卡片边框暗色模式：task-5-borders-dark.png
  - [ ] 价格颜色暗色模式：task-5-price-dark.png

  **Commit**: YES
  - Message: `feat(MemberCard): optimize status colors for dark mode`
  - Files: `frontend/src/components/MemberCard.tsx`

- [x] 6. 优化 MemberRankingCard.tsx 排名颜色

  **What to do**:
  - 替换排名图标颜色
    - 第1名 '#faad14'（金色）→ 柔和金
    - 第2名 '#8c8c8c'（银色）→ 柔和银
    - 第3名 '#b97d4f'（铜色）→ 柔和铜
    - 其他 '#666' → 主题感知的灰色
  - 替换进度条颜色
    - 第1名 '#cf1322' → 柔和红
    - 第2名 '#fa541c' → 柔和橙红
    - 第3名 '#fa8c16' → 柔和橙
    - 第4-5名 '#1890ff' → 柔和蓝
    - 其他 '#52c41a' → 柔和绿
  - 使用主题感知的颜色选择

  **Must NOT do**:
  - 不要改变排名逻辑
  - 不要修改进度条布局
  - 不要影响浅色模式

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 颜色替换，逻辑简单
  - **Skills**: []
    - 无需特定技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3-5, 7)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1

  **References**:
  - `frontend/src/components/MemberRankingCard.tsx:102-105` - 排名图标颜色
  - `frontend/src/components/MemberRankingCard.tsx:109-114` - 进度条颜色
  - `frontend/src/pages/Statistics.tsx:52-58` - 主题检测模式参考

  **Acceptance Criteria**:
  - [ ] 暗色模式下排名图标颜色柔和
  - [ ] 进度条颜色柔和、协调
  - [ ] 使用主题感知的颜色选择
  - [ ] 浅色模式不受影响

  **QA Scenarios**:
  ```
  Scenario: 排名图标暗色模式
    Tool: Playwright
    Preconditions: 有会员排名数据
    Steps:
      1. 导航到 /dashboard 页面
      2. 切换到暗色模式
      3. 检查前3名的奖杯图标颜色
      4. 断言颜色柔和，不刺眼
    Expected Result: 金银铜颜色柔和、协调
    Evidence: .sisyphus/evidence/task-6-trophy-dark.png

  Scenario: 进度条暗色模式
    Tool: Playwright
    Preconditions: 有会员排名数据
    Steps:
      1. 导航到 /dashboard 页面
      2. 切换到暗色模式
      3. 检查前5名的进度条颜色
      4. 断言颜色不是原始的硬编码颜色
    Expected Result: 进度条颜色柔和
    Evidence: .sisyphus/evidence/task-6-progress-dark.png
  ```

  **Evidence to Capture**:
  - [ ] 排名图标暗色模式：task-6-trophy-dark.png
  - [ ] 进度条暗色模式：task-6-progress-dark.png

  **Commit**: YES
  - Message: `feat(MemberRankingCard): optimize ranking colors`
  - Files: `frontend/src/components/MemberRankingCard.tsx`

- [x] 7. 优化 Members.tsx 标签颜色（用户分类颜色动态调整）

  **What to do**:
  - 为用户自定义的分类颜色实现动态调整
  - 在渲染 Tag 时应用 `adjustColorForDarkMode()` 函数
  - 处理边界情况：亮黄色、品红色等极端颜色
  - 确保调整后的颜色可读性和对比度

  **Must NOT do**:
  - 不要修改数据库中的分类颜色
  - 不要改变 Tag 的其他样式
  - 不要影响浅色模式的颜色显示

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 应用工具函数，逻辑简单
  - **Skills**: []
    - 无需特定技能

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 3-6)
  - **Blocks**: F1-F4
  - **Blocked By**: Task 1

  **References**:
  - `frontend/src/pages/Members.tsx:260` - Tag 使用用户分类颜色
  - `frontend/src/pages/Members.tsx:303` - 状态 Tag 颜色
  - `frontend/src/utils/color.ts` - 颜色调整工具函数（Task 1 创建）
  - `frontend/src/pages/Statistics.tsx:52-58` - 主题检测模式参考

  **Acceptance Criteria**:
  - [ ] 暗色模式下用户分类颜色自动调整
  - [ ] 亮色系颜色（如 #FFFF00）被柔化
  - [ ] 保持颜色辨识度
  - [ ] 浅色模式颜色不变

  **QA Scenarios**:
  ```
  Scenario: 用户分类颜色调整 - 亮色
    Tool: Playwright
    Preconditions: 有使用亮色分类的会员（如 #FFFF00, #FF00FF）
    Steps:
      1. 导航到 /members 页面
      2. 切换到暗色模式
      3. 检查亮色分类的 Tag
      4. 断言颜色已调整，不是原始颜色
      5. 断言对比度 ≥ 4.5:1
    Expected Result: 亮色被柔化，可读性好
    Evidence: .sisyphus/evidence/task-7-bright-colors-dark.png

  Scenario: 用户分类颜色调整 - 普通颜色
    Tool: Playwright
    Preconditions: 有使用普通颜色的会员
    Steps:
      1. 导航到 /members 页面
      2. 切换到暗色模式
      3. 检查普通颜色的 Tag
      4. 断言颜色略微柔和
    Expected Result: 颜色保持辨识度，略微柔化
    Evidence: .sisyphus/evidence/task-7-normal-colors-dark.png
  ```

  **Evidence to Capture**:
  - [ ] 亮色调整对比：task-7-bright-colors-dark.png
  - [ ] 普通颜色调整：task-7-normal-colors-dark.png

  **Commit**: YES
  - Message: `feat(Members): optimize tag colors with user adjustment`
  - Files: `frontend/src/pages/Members.tsx`

---

## Final Verification Wave (MANDATORY)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **视觉回归测试** — `oracle`
  Run Playwright visual regression tests for all optimized components. Compare light mode and dark mode screenshots. Check for visual inconsistencies, color mismatches, and layout issues.
  Output: `Light Mode [PASS/FAIL] | Dark Mode [PASS/FAIL] | Visual Diff [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **可访问性审计** — `unspecified-high`
  Run axe-core accessibility audit on dark mode pages. Check color contrast ratios (≥4.5:1 for text, ≥3:1 for UI). Verify focus indicators are visible. Test with bright user colors edge case (#FFFF00, #FF00FF).
  Output: `Contrast Ratios [N/N pass] | Focus States [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F3. **浅色模式回归测试** — `deep`
  Verify all changes in light mode. Run unit tests. Check no hardcoded dark colors leaked into light mode. Test theme switching (light → dark → light). Verify no visual regressions in light mode.
  Output: `Light Mode Tests [N/N pass] | Theme Switch [PASS/FAIL] | No Leakage [CLEAN/N issues] | VERDICT`

- [ ] F4. **代码质量检查** — `quick`
  Run `tsc --noEmit` + ESLint. Check for `as any`, `@ts-ignore`, unused imports. Verify no new `!important` CSS added. Check AI slop: excessive comments, over-abstraction.
  Output: `TypeScript [PASS/FAIL] | ESLint [PASS/FAIL] | No New !important [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **0**: `chore: setup test infrastructure (optional)` — frontend/package.json, frontend/playwright.config.ts (如果选择自动化)
- **1**: `feat(utils): add color adjustment utility for dark mode` — frontend/src/utils/color.ts, bun test
- **2**: `feat(constants): add dark color palette for charts` — frontend/src/constants/colors.ts
- **3**: `feat(Statistics): optimize chart colors for dark mode` — frontend/src/pages/Statistics.tsx
- **4**: `feat(Dashboard): optimize statistic value colors` — frontend/src/pages/Dashboard.tsx
- **5**: `feat(MemberCard): optimize status colors for dark mode` — frontend/src/components/MemberCard.tsx
- **6**: `feat(MemberRankingCard): optimize ranking colors` — frontend/src/components/MemberRankingCard.tsx
- **7**: `feat(Members): optimize tag colors with user adjustment` — frontend/src/pages/Members.tsx

---

## Success Criteria

### Verification Commands
```bash
# Type checking
cd frontend && npm run type-check

# Build test
cd frontend && npm run build

# Linting
cd frontend && npm run lint

# Unit tests (for color utility)
cd frontend && npm test

# Manual verification steps:
# 1. Navigate to http://localhost:60001
# 2. Test light mode appearance
# 3. Switch to dark mode (click moon icon in sidebar)
# 4. Verify all colors are soft and coordinated
# 5. Switch back to light mode to verify no regression
```

### Final Checklist
- [ ] 所有 "Must Have" 存在
- [ ] 所有 "Must NOT Have" 不存在
- [ ] 所有测试通过
- [ ] 视觉回归测试通过
- [ ] 可访问性审计通过
- [ ] 浅色模式无回归