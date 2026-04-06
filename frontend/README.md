# CrownFlow Frontend

CrownFlow 前端应用 - 会员订阅管理系统

## 技术栈

- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Ant Design** - UI组件库
- **Zustand** - 状态管理
- **Axios** - HTTP客户端
- **Recharts** - 图表库
- **Day.js** - 日期处理

## 目录结构

```
frontend/
├── public/              # 静态资源
├── src/
│   ├── components/      # 通用组件
│   │   ├── ErrorBoundary.tsx
│   │   └── Layout.tsx
│   ├── hooks/           # 自定义Hooks
│   │   ├── useApi.ts
│   │   ├── useCategories.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMembers.ts
│   │   ├── useReminders.ts
│   │   ├── useStats.ts
│   │   └── index.ts
│   ├── pages/           # 页面组件
│   │   ├── Dashboard.tsx
│   │   ├── Members.tsx
│   │   ├── Statistics.tsx
│   │   └── Settings.tsx
│   ├── services/        # API服务
│   │   └── api.ts
│   ├── stores/          # 状态管理
│   │   └── index.ts
│   ├── types/           # TypeScript类型
│   │   └── index.ts
│   ├── utils/           # 工具函数
│   │   └── index.ts
│   ├── App.tsx          # 应用入口
│   ├── main.tsx         # React入口
│   └── index.css        # 全局样式
├── shell/               # Shell脚本
│   ├── start.sh         # 启动服务
│   ├── stop.sh          # 停止服务
│   ├── status.sh        # 查看状态
│   └── restart.sh       # 重启服务
├── .env                 # 环境变量
├── .env.development     # 开发环境变量
├── .env.production      # 生产环境变量
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 http://localhost:60001 启动

### 使用Shell脚本

```bash
# 启动服务
./shell/start.sh

# 查看状态
./shell/status.sh

# 停止服务
./shell/stop.sh

# 重启服务
./shell/restart.sh
```

## 功能特性

### 1. Dashboard 概览页面
- 会员总数、活跃会员统计
- 本月支出、年度支出统计
- 即将到期会员提醒
- 响应式卡片布局

### 2. Members 会员管理页面
- 会员列表（支持分页）
- 搜索和筛选功能
- 添加/编辑/删除会员
- 表单验证
- 日期范围筛选

### 3. Statistics 统计图表页面
- 支出趋势图（折线图）
- 分类支出占比（饼图）
- 按月/周/季度查看
- 日期范围选择

### 4. Settings 设置页面
- 分类管理
- 添加/编辑/删除分类
- 图标和颜色配置

## 性能优化

1. **组件优化**
   - 使用 `React.memo` 避免不必要的重渲染
   - 使用 `useCallback` 和 `useMemo` 优化回调函数和计算

2. **数据获取优化**
   - 使用自定义Hooks统一管理API请求
   - 支持请求缓存
   - 自动重试机制

3. **代码分割**
   - 路由级别的懒加载
   - 按需加载组件

4. **请求优化**
   - Axios请求/响应拦截器
   - 请求去重
   - 超时处理

## 错误处理

1. **全局错误边界**
   - ErrorBoundary组件捕获React错误
   - 友好的错误提示界面

2. **API错误处理**
   - 统一的错误拦截
   - 自动重试机制
   - 错误提示信息

3. **表单验证**
   - 实时验证
   - 友好的错误提示

## 自定义Hooks

### useApi
通用API请求Hook，提供：
- loading状态
- 错误处理
- 自动重试
- 请求取消

### useMembers / useCategories
数据管理Hooks，提供：
- 数据获取
- 增删改查操作
- 缓存管理

### useDebounce
防抖Hook，用于：
- 搜索输入
- 表单验证

## 环境变量

```bash
# .env
VITE_API_BASE_URL=/api        # API基础路径
VITE_APP_TITLE=CrownFlow      # 应用标题
VITE_API_TIMEOUT=10000        # API超时时间
```

## 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist` 目录。

## 代码规范

- 使用TypeScript严格模式
- ESLint + Prettier代码格式化
- 组件和函数必须添加注释
- 遵循React最佳实践

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT
