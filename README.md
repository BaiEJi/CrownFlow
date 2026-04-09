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

CrownFlow 是一个前后端分离的会员订阅管理系统，帮助用户追踪和管理各类订阅服务（如 Netflix、Spotify、iCloud 等），统计支出并提醒续费。

### 核心功能

| 功能模块 | 说明 |
|----------|------|
| 🎯 **会员管理** | 添加、编辑、删除会员订阅，支持分类、价格、周期、日期等字段 |
| 📊 **支出统计** | 按日期范围计算支出，支持按天/周/月/季度查看趋势 |
| 🔔 **到期提醒** | 自动检测即将到期的会员，首页显示提醒列表 |
| 📁 **分类管理** | 自定义会员分类，支持图标和颜色配置 |

### 页面预览

| 页面 | 功能 |
|------|------|
| **Dashboard** | 会员总数、活跃会员数、本月支出、年度支出、分类支出汇总、到期提醒 |
| **Members** | 会员列表（分页、搜索、筛选）、状态标签（正常/即将到期/已过期） |
| **Statistics** | 支出趋势折线图、分类支出饼图、时间范围选择 |
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
| Flask | 3.x | 后端框架 |
| SQLAlchemy | 2.x | ORM |
| SQLite | - | 数据库 |

### 端口配置

| 服务 | 端口 |
|------|------|
| 后端 API | 60000 |
| 前端 | 60001 |

---

## 快速开始

### 环境要求

- **Node.js** 18+
- **Python** 3.11+
- **pip** 或 **conda**

### 安装依赖

\`\`\`bash
# 克隆项目
git clone https://github.com/BaiEJi/CrownFlow.git
cd CrownFlow

# 安装后端依赖
cd backend
pip install -r requirements.txt

# 安装前端依赖
cd ../frontend
npm install
\`\`\`

### 启动服务

#### 方式一：使用 Shell 脚本（推荐）

\`\`\`bash
# 启动后端
cd backend && ./shell/start.sh

# 启动前端
cd ../frontend && ./shell/start.sh
\`\`\`

#### 方式二：手动启动

\`\`\`bash
# 启动后端
cd backend
python app/main.py

# 启动前端（开发模式）
cd frontend
npm run dev
\`\`\`

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端应用 | http://localhost:60001 |
| 后端 API | http://localhost:60000/api |
| 健康检查 | http://localhost:60000/health |

---

## API 接口

### 后端服务（端口 60000）

#### 会员管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | \`/api/members\` | 获取会员列表 |
| GET | \`/api/members/{id}\` | 获取单个会员详情 |
| POST | \`/api/members\` | 创建会员 |
| PUT | \`/api/members/{id}\` | 更新会员 |
| DELETE | \`/api/members/{id}\` | 删除会员 |

#### 分类管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | \`/api/categories\` | 获取所有分类 |
| POST | \`/api/categories\` | 创建分类 |
| PUT | \`/api/categories/{id}\` | 更新分类 |
| DELETE | \`/api/categories/{id}\` | 删除分类 |

#### 统计分析

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | \`/api/stats/overview\` | 概览数据（会员总数、支出统计） |
| GET | \`/api/stats/category-summary\` | 各分类本月/年度支出汇总 |
| GET | \`/api/stats/spending\` | 支出统计 |
| GET | \`/api/stats/by-category\` | 分类支出统计 |
| GET | \`/api/stats/trend\` | 支出趋势数据 |

#### 提醒

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | \`/api/reminders/upcoming\` | 获取即将到期的会员列表 |

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

---

## 支出计算逻辑

\`\`\`
日均支出 = 价格 / 计费周期天数
实际支出 = 日均支出 × 与查询范围重叠的天数
\`\`\`

---

## 功能特性

### Dashboard 概览页面
- ✅ 会员总数、活跃会员统计
- ✅ 本月支出、年度支出统计
- ✅ 分类支出汇总表格（支持排序）
- ✅ 即将到期会员提醒卡片
- ✅ 响应式布局设计
- ✅ 暗色模式支持

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
