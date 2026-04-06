# CrownFlow

CrownFlow 是一个前后端分离的会员订阅管理系统，帮助用户追踪和管理各类订阅服务（如 Netflix、Spotify、iCloud 等），统计支出并提醒续费。同时提供每日经验汇总功能。

## 核心功能

| 功能 | 说明 |
|------|------|
| 会员管理 | 添加、编辑、删除会员订阅，支持分类、价格、周期、日期等字段 |
| 分类管理 | 自定义会员分类，支持图标和颜色 |
| 支出统计 | 按日期范围计算支出，支持按天/周/月/季度查看趋势 |
| 到期提醒 | 自动检测即将到期的会员，首页显示提醒列表 |
| 每日经验 | 按日期记录每日事件和反思，支持心情、天气、总结等 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + Ant Design |
| 后端 | Python FastAPI + SQLAlchemy |
| 数据库 | SQLite |
| 图表 | Recharts |

## 项目结构

```
CrownFlow/
├── frontend/           # React 前端应用
├── backend/            # 主后端服务（会员管理）
├── journal-service/    # 日记服务后端
├── docs/               # 文档
└── shell/              # 服务管理脚本
```

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.11+

### 安装依赖

```bash
# 后端
cd backend && pip install -r requirements.txt
cd ../journal-service && pip install -r requirements.txt

# 前端
cd frontend && npm install
```

### 启动服务

```bash
# 启动主后端
cd backend && ./shell/start.sh

# 启动日记服务
cd journal-service && ./shell/start.sh

# 启动前端
cd frontend && ./shell/start.sh
```

### 访问地址

- 前端：http://localhost:60001
- 主后端 API：http://localhost:60000/api
- 日记服务 API：http://localhost:60002/api

## API 接口

### 主后端（端口 60000）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/members | 获取会员列表 |
| POST | /api/members | 创建会员 |
| PUT | /api/members/{id} | 更新会员 |
| DELETE | /api/members/{id} | 删除会员 |
| GET | /api/categories | 获取分类列表 |
| GET | /api/stats/overview | 概览数据 |
| GET | /api/reminders/upcoming | 即将到期会员 |

### 日记服务（端口 60002）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/journals | 获取日记列表 |
| POST | /api/journals | 创建日记 |
| POST | /api/journals/{date}/events | 添加事件 |
| POST | /api/events/{id}/reflections | 添加反思 |

## License

MIT