# 小组学习陪伴宠物系统 - 后端

## 项目简介

基于 FastAPI 的后端服务，提供 RESTful API 接口。

## 技术栈

- Python 3.11
- FastAPI 0.104
- SQLAlchemy 2.0
- PostgreSQL 15
- Redis 7.2

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等
```

### 3. 初始化数据库

```bash
# 创建数据库
createdb pet_system

# 运行迁移（待实现）
alembic upgrade head
```

### 4. 启动服务

```bash
python main.py
# 或
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

访问 http://localhost:8000/docs 查看 API 文档

## 项目结构

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py       # 认证接口
│   │       ├── users.py      # 用户接口
│   │       ├── classes.py    # 班级管理（李红蝶）
│   │       ├── groups.py     # 小组管理（李红蝶）
│   │       ├── tasks.py      # 任务管理（范海清）
│   │       ├── pets.py       # 宠物养成（刘桂芹）
│   │       └── gold.py       # 金币经济（左鸿芳）
│   ├── core/
│   │   ├── config.py         # 配置
│   │   └── database.py       # 数据库连接
│   ├── models/               # 数据模型
│   ├── schemas/              # Pydantic 模型
│   ├── services/             # 业务逻辑
│   └── utils/                # 工具函数
├── tests/                    # 测试用例
├── migrations/               # 数据库迁移
├── main.py                   # 应用入口
└── requirements.txt          # 依赖
```

## 开发计划

- ✅ EP-001: 项目工程结构搭建
- 🔄 EP-002: 数据库初始化与建表（进行中）
- ⏳ EP-003: 认证模块开发
- ⏳ EP-004: API 基础框架搭建

## 负责人

- 李红蝶：班级小组管理、认证模块、API 框架
