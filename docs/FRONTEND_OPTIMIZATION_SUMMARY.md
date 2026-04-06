# CrownFlow 前端实现说明

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5.x |
| UI | Ant Design 5.x |
| 图表 | Recharts |
| 路由 | React Router 6.x |
| HTTP | Axios |
| 日期 | dayjs |

---

## 目录结构

```
frontend/src/
├── components/         # 通用组件
│   ├── ErrorBoundary.tsx
│   └── Layout.tsx
├── pages/              # 页面
│   ├── Dashboard.tsx   # 首页
│   ├── Members.tsx     # 会员管理
│   ├── Statistics.tsx  # 统计图表
│   └── Settings.tsx    # 设置
├── hooks/              # 自定义 Hooks
├── services/           # API 封装
├── types/              # TypeScript 类型
├── utils/              # 工具函数
├── App.tsx
└── main.tsx
```

---

## 页面实现

### Dashboard（首页）

- 四个统计卡片：会员总数、活跃会员、本月支出、年度支出
- 即将到期会员列表
- 刷新按钮

### Members（会员管理）

- 表格展示会员列表，支持分页
- 筛选：分类、日期范围
- 搜索：300ms 防抖
- 添加/编辑弹窗：两列布局表单
- 状态标签：正常（绿）、即将到期（橙）、已过期（灰）

### Statistics（统计图表）

- 折线图：支出趋势
- 饼图：分类支出占比
- 粒度选择：按天/按周/按月/按季度
- 快速选择：本周/本月/本季度/本年
- 横坐标优化：左右留白，显示所有刻度

### Settings（设置）

**Tab 1: 图表分类**
- 分类表格（图标、名称、颜色、创建时间）
- 添加/编辑弹窗
- ColorPicker：16 种预设颜色
- 删除确认（有关联会员时拒绝）

**Tab 2: 会员分类管理**
- 分类卡片网格布局
- 会员数量 Badge 显示

---

## 自定义 Hooks

| Hook | 说明 |
|------|------|
| useApi | 通用 API 请求（loading、error、重试） |
| useMembers | 会员 CRUD |
| useCategories | 分类 CRUD |
| useStats | 统计数据 |
| useReminders | 提醒数据 |
| useDebounce | 防抖 |
| useLocalStorage | 本地存储 |

---

## API 服务层

**请求特性：**
- GET 请求缓存 5 分钟
- 5xx 错误自动重试 3 次
- 请求超时 5 秒
- 统一错误格式（ApiError）

**API 模块：**
- `memberApi`：会员管理
- `categoryApi`：分类管理
- `statsApi`：统计分析
- `reminderApi`：提醒

---

## 性能优化

- **路由懒加载**：React.lazy + Suspense
- **组件优化**：React.memo、useCallback、useMemo
- **搜索防抖**：300ms
- **请求缓存**：避免重复请求

---

## 错误处理

- **ErrorBoundary**：捕获组件错误
- **API 错误**：统一提示
- **表单验证**：实时验证

---

## 环境配置

```
# .env.development
VITE_API_BASE_URL=http://localhost:60000/api
VITE_API_TIMEOUT=5000

# .env.production
VITE_API_BASE_URL=/api
VITE_API_TIMEOUT=5000
```

---

## 服务脚本

```bash
./shell/start.sh    # 启动
./shell/stop.sh     # 停止
./shell/status.sh   # 状态
./shell/restart.sh  # 重启
```

---

**最后更新**：2026-03-21
