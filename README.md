# CrownFlow

<p align="center">
  <strong>个人会员订阅管理系统</strong>
</p>

<p align="center">
  <a href="#核心功能">功能特性</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#api-接口">API 文档</a> •
  <a href="#开发指南">开发指南</a>
</p>

---

## 项目简介

CrownFlow 是一个前后端分离的会员订阅管理系统，帮助用户追踪和管理各类订阅服务（如 Netflix、Spotify、iCloud 等），统计支出并提醒续费。同时提供每日经验汇总功能，帮助用户记录和反思每日事件。

### 核心功能

| 功能模块 | 说明 |
|----------|------|
| 🎯 **会员管理** | 添加、编辑、删除会员订阅，支持分类、价格、周期、日期等字段 |
| 📊 **支出统计** | 按日期范围计算支出，支持按天/周/月/季度查看趋势 |
| 🔔 **到期提醒** | 自动检测即将到期的会员，首页显示提醒列表 |
| 📁 **分类管理** | 自定义会员分类，支持图标和颜色配置 |
| 📝 **每日经验** | 按日期记录每日事件和反思，支持心情、天气、总结等 |

### 页面预览

| 页面 | 功能 |
|------|------|
| **Dashboard** | 会员总数、活跃会员数、本月支出、年度支出、到期提醒 |
| **Members** | 会员列表（分页、搜索、筛选）、状态标签（正常/即将到期/已过期） |
| **Statistics** | 支出趋势折线图、分类支出饼图、时间范围选择 |
| **Journal** | 日记信息（心情、天气、总结）、事件列表、反思条目 |
| **Settings** | 分类 CRUD、颜色选择器（16 种预设色）、会员分布卡片 |

---

## 技术栈

### 前端

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.x | 前端框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 5.x | 构建工具 |
| Ant Design | 5.x | UI 组件库 |
| Zustand | 4.x | 状态管理 |
| Recharts | 2.x | 图表库 |
| Axios | 1.x | HTTP 客户端 |
| Day.js | 1.x | 日期处理 |

### 后端

| 技术 | 版本 | 说明 |
|------|------|------|
| FastAPI | 0.x | 后端框架（主服务） |
| Flask | 3.x | 后端框架（日记服务） |
| SQLAlchemy | 2.x | ORM |
| SQLite | - | 数据库 |
| APScheduler | 1.x | 定时任务 |

### 端口配置

| 服务 | 端口 |
|------|------|
| 主后端（会员管理） | 60000 |
| 前端 | 60001 |
| 日记服务后端 | 60002 |

---

## 项目结构

```
CrownFlow/
├── frontend/                    # React 前端应用
│   ├── src/
│   │   ├── components/          # 通用组件
│   │   │   ├── ErrorBoundary.tsx    # 错误边界
│   │   │   ├── Layout.tsx           # 布局组件
│   │   │   ├── EventCard.tsx        # 事件卡片
│   │   │   ├── MemberCard.tsx       # 会员卡片
│   │   │   └── SubscriptionModal.tsx # 订阅弹窗
│   │   ├── pages/               # 页面组件
│   │   │   ├── Dashboard.tsx    # 首页概览
│   │   │   ├── Members.tsx      # 会员管理
│   │   │   ├── Statistics.tsx   # 统计图表
│   │   │   ├── Settings.tsx     # 设置页面
│   │   │   └── Journal.tsx      # 每日经验汇总
│   │   ├── hooks/               # 自定义 Hooks
│   │   │   ├── useApi.ts        # API 请求
│   │   │   ├── useMembers.ts    # 会员数据
│   │   │   ├── useCategories.ts # 分类数据
│   │   │   ├── useStats.ts      # 统计数据
│   │   │   └── useReminders.ts  # 提醒数据
│   │   ├── services/            # API 封装
│   │   ├── stores/              # Zustand 状态管理
│   │   ├── types/               # TypeScript 类型定义
│   │   └── utils/               # 工具函数
│   ├── public/                  # 静态资源
│   ├── shell/                   # 服务管理脚本
│   └── package.json
│
├── backend/                     # 主后端（会员管理）
│   ├── app/
│   │   ├── api/                 # API 路由
│   │   │   ├── members.py       # 会员 API
│   │   │   ├── categories.py    # 分类 API
│   │   │   ├── stats.py         # 统计 API
│   │   │   └── reminders.py     # 提醒 API
│   │   ├── models/              # 数据模型
│   │   ├── utils/               # 工具函数
│   │   └── main.py              # 应用入口
│   ├── tests/                   # 单元测试
│   ├── data/                    # SQLite 数据库
│   ├── shell/                   # 服务管理脚本
│   └── requirements.txt
│
├── journal-service/             # 日记服务后端
│   ├── app/
│   │   ├── api/                 # API 路由
│   │   │   ├── journals.py      # 日记 API
│   │   │   ├── events.py        # 事件 API
│   │   │   └── reflections.py   # 反思 API
│   │   ├── models/              # 数据模型
│   │   └── main.py              # 应用入口
│   ├── tests/                   # 单元测试
│   ├── shell/                   # 服务管理脚本
│   └── requirements.txt
│
├── docs/                        # 文档
│   ├── DEVELOPMENT_PLAN.md      # 开发计划
│   └── FRONTEND_OPTIMIZATION_SUMMARY.md
│
└── README.md
```

---

## 快速开始

### 环境要求

- **Node.js** 18+
- **Python** 3.11+
- **pip** 或 **conda**

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/BaiEJi/CrownFlow.git
cd CrownFlow

# 安装后端依赖
cd backend
pip install -r requirements.txt

cd ../journal-service
pip install -r requirements.txt

# 安装前端依赖
cd ../frontend
npm install
```

### 启动服务

#### 方式一：使用 Shell 脚本（推荐）

```bash
# 启动主后端
cd backend && ./shell/start.sh

# 启动日记服务
cd ../journal-service && ./shell/start.sh

# 启动前端
cd ../frontend && ./shell/start.sh
```

#### 方式二：手动启动

```bash
# 启动主后端
cd backend
python app/main.py

# 启动日记服务
cd journal-service
python app/main.py

# 启动前端（开发模式）
cd frontend
npm run dev
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端应用 | http://localhost:60001 |
| 主后端 API | http://localhost:60000/api |
| 日记服务 API | http://localhost:60002/api |
| 健康检查 | http://localhost:60000/health |

### 服务管理

每个服务目录下都有管理脚本：

```bash
./shell/start.sh    # 启动服务
./shell/stop.sh     # 停止服务
./shell/status.sh   # 查看状态
./shell/restart.sh  # 重启服务
```

---

## API 接口

### 主后端（端口 60000）

#### 会员管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/members` | 获取会员列表 |
| GET | `/api/members/{id}` | 获取单个会员详情 |
| POST | `/api/members` | 创建会员 |
| PUT | `/api/members/{id}` | 更新会员 |
| DELETE | `/api/members/{id}` | 删除会员 |

#### 分类管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/categories` | 获取所有分类 |
| POST | `/api/categories` | 创建分类 |
| PUT | `/api/categories/{id}` | 更新分类 |
| DELETE | `/api/categories/{id}` | 删除分类 |

#### 统计分析

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stats/overview` | 概览数据（会员总数、支出统计） |
| GET | `/api/stats/spending` | 支出统计 |
| GET | `/api/stats/by-category` | 分类支出统计 |
| GET | `/api/stats/trend` | 支出趋势数据 |

#### 提醒

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/reminders/upcoming` | 获取即将到期的会员列表 |

### 日记服务（端口 60002）

#### 日记管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/journals` | 获取日记列表 |
| GET | `/api/journals/{date}` | 获取某天的日记详情 |
| POST | `/api/journals` | 创建日记 |
| PUT | `/api/journals/{id}` | 更新日记 |
| DELETE | `/api/journals/{id}` | 删除日记 |

#### 事件管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/journals/{date}/events` | 为日记添加事件 |
| GET | `/api/events/{id}` | 获取事件详情 |
| PUT | `/api/events/{id}` | 更新事件 |
| DELETE | `/api/events/{id}` | 删除事件 |

#### 反思管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/events/{id}/reflections` | 为事件添加反思 |
| GET | `/api/reflections/{id}` | 获取反思详情 |
| PUT | `/api/reflections/{id}` | 更新反思 |
| DELETE | `/api/reflections/{id}` | 删除反思 |

---

## 数据模型

### Member（会员）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| name | string | 会员名称 |
| category_id | int | 分类 ID |
| level | string | 会员级别 |
| price | decimal | 价格 |
| currency | string | 币种（CNY/USD/EUR/GBP/JPY） |
| billing_cycle | enum | 计费周期（monthly/quarterly/yearly/custom） |
| custom_days | int | 自定义天数 |
| start_date | date | 开始日期 |
| end_date | date | 结束日期 |
| notes | text | 备注 |
| reminder_days | int | 提前提醒天数（默认 7） |

### Category（分类）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| name | string | 分类名称（唯一） |
| icon | string | 图标（emoji） |
| color | string | 颜色（hex） |

### Journal（日记）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| date | date | 日期（唯一） |
| mood | string | 心情 |
| weather | string | 天气 |
| summary | text | 当日总结 |

### JournalEvent（事件）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| journal_id | int | 外键，关联日记 |
| title | string | 事件标题 |
| start_time | string | 开始时间（HH:MM） |
| end_time | string | 结束时间（HH:MM） |
| location | string | 地点 |
| background | text | 背景/起因 |
| process | text | 过程描述 |
| result | text | 结果 |

### EventReflection（反思）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| event_id | int | 外键，关联事件 |
| type | string | 反思类型（good/bad/improve/custom） |
| custom_type_name | string | 自定义类型名称 |
| content | text | 反思内容 |

---

## 支出计算逻辑

```
日均支出 = 价格 / 计费周期天数
实际支出 = 日均支出 × 与查询范围重叠的天数
```

### 趋势图横坐标规则

| 粒度 | 横坐标格式 | 计算范围 |
|------|-----------|----------|
| 按天 | 每天日期 | 当天 |
| 按周 | 周一日期范围（MM/DD-MM/DD） | 完整一周（周一到周日） |
| 按月 | 年-月（YYYY-MM） | 完整一月 |
| 按季度 | 年-季度（YYYY-Qn） | 完整一季度 |

---

## 开发指南

### 运行测试

```bash
# 主后端测试
cd backend
python -m pytest tests/ -v

# 日记服务测试
cd journal-service
python -m pytest tests/ -v

# 前端测试
cd frontend
npm run test
```

### 构建生产版本

```bash
cd frontend
npm run build
```

构建产物将生成在 `dist` 目录。

### 环境变量

前端环境变量（`.env.development` / `.env.production`）：

```bash
VITE_API_BASE_URL=http://localhost:60000/api
VITE_JOURNAL_API_BASE_URL=http://localhost:60002/api
VITE_APP_TITLE=CrownFlow
VITE_API_TIMEOUT=10000
```

### 代码规范

- **前端**: TypeScript 严格模式、ESLint + Prettier
- **后端**: Python 类型提示、Flask 最佳实践

---

## 功能特性

### Dashboard 概览页面
- ✅ 会员总数、活跃会员统计
- ✅ 本月支出、年度支出统计
- ✅ 即将到期会员提醒卡片
- ✅ 响应式布局设计

### Members 会员管理页面
- ✅ 会员列表（支持分页）
- ✅ 搜索和多条件筛选
- ✅ 添加/编辑/删除会员弹窗
- ✅ 表单实时验证
- ✅ 状态标签：正常（绿）、即将到期（橙）、已过期（灰）

### Statistics 统计图表页面
- ✅ 支出趋势折线图
- ✅ 分类支出饼图
- ✅ 时间范围选择：按天/周/月/季度
- ✅ 快速选择：本周/本月/本季度/本年

### Journal 每日经验页面
- ✅ 日期选择器切换日期
- ✅ 日记信息：心情、天气、当日总结
- ✅ 事件管理：标题、时间段、地点、背景、过程、结果
- ✅ 反思条目：做得好的、做得不好的、改进建议、自定义

### Settings 设置页面
- ✅ 分类 CRUD 管理
- ✅ 颜色选择器（16 种预设色）
- ✅ 图标配置（emoji）
- ✅ 各分类会员分布卡片

---

## 许可证

[MIT License](LICENSE)

---

<p align="center">
  Made with ❤️ by BaiEJi
</p>