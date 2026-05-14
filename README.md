# 小组学习陪伴宠物系统 - 宠物养成模块

![GitHub last commit](https://img.shields.io/github/last-commit/llhhdddd/pet)
![GitHub repo size](https://img.shields.io/github/repo-size/llhhdddd/pet)
![Python](https://img.shields.io/badge/python-3.11-blue)
![FastAPI](https://img.shields.io/badge/fastapi-0.104-green)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-blue)

## 项目概述

本项目是一个以「小组共同养虚拟宠物」为学习激励的智能系统的核心模块——**宠物养成模块**。通过游戏化的学习机制，将学习任务的完成与宠物的成长绑定，激发学生的学习动力。

### 核心目标

- **业务目标**：提升学生学习动力，减轻教师管理负担
- **用户目标**：提供有趣的学习体验，即时反馈学习成果
- **技术目标**：构建稳定、可扩展的宠物养成系统

## 功能特性

### 🐾 宠物养成核心功能

| 功能模块 | 描述 |
|---------|------|
| **属性系统** | 生命值、饱食度、心情值、成长值四大核心属性 |
| **成长机制** | 等级提升、成长效率计算、进化触发条件 |
| **互动功能** | 喂食、清洁、玩耍、治疗、抚摸等互动方式 |
| **任务系统** | 日常任务、成就任务、奖励发放机制 |
| **外观系统** | 随等级变化的外观展示和进化机制 |

### 🎮 互动功能

| 互动类型 | 消耗 | 效果 | 冷却时间 |
|---------|------|------|---------|
| 喂食 | 小组金币 | 饱食度+20~50 | 5分钟 |
| 清洁 | 小组金币 | 生命值+10~20 | 30分钟 |
| 玩耍 | 无 | 心情值+15~30，饱食度-5 | 10分钟 |
| 治疗 | 小组金币 | 生命值+30~50 | 1小时 |
| 抚摸 | 无 | 心情值+5~10 | 1分钟 |

### 📊 属性系统

| 属性 | 范围 | 说明 |
|------|------|------|
| 生命值 | 0-100 | 宠物健康状态，影响成长效率 |
| 饱食度 | 0-100 | 宠物饥饿程度，影响生命值衰减 |
| 心情值 | 0-100 | 宠物愉悦度，影响成长效率 |
| 成长值 | 0-∞ | 累积成长经验，用于等级提升 |
| 等级 | 1-99 | 宠物当前等级，最高99级 |

## 技术架构

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| **后端框架** | FastAPI | 0.104+ |
| **数据库** | PostgreSQL | 15 |
| **ORM** | SQLAlchemy | 2.0+ |
| **缓存** | Redis | 7.2 |
| **异步任务** | Celery | - |
| **实时通信** | WebSocket | - |

### 项目结构

```
pet/
├── backend/                    # 后端源代码
│   ├── app/                    # FastAPI应用
│   │   ├── api/                # API路由
│   │   │   └── v1/             # 版本1 API
│   │   │       ├── pets.py     # 宠物管理API
│   │   │       ├── interactions.py  # 互动API
│   │   │       └── tasks.py    # 任务API
│   │   ├── db/                 # 数据库层
│   │   │   ├── session.py      # 数据库会话
│   │   │   └── models.py       # 数据模型
│   │   ├── services/           # 业务逻辑层
│   │   │   ├── pet_service.py  # 宠物服务
│   │   │   ├── interaction_service.py  # 互动服务
│   │   │   └── task_service.py # 任务服务
│   │   ├── schemas/            # 数据模型定义
│   │   │   ├── pet_schemas.py  # 宠物相关Schema
│   │   │   ├── interaction_schemas.py  # 互动Schema
│   │   │   └── task_schemas.py # 任务Schema
│   │   ├── utils/              # 工具函数
│   │   │   ├── pet_calculator.py  # 属性计算器
│   │   │   └── exceptions.py   # 异常定义
│   │   ├── main.py             # 应用入口
│   │   └── settings.py         # 配置管理
│   ├── requirements.txt        # 依赖列表
│   └── Dockerfile              # Docker配置
├── specs/                      # 规格文档
│   ├── product-spec/           # 产品规格
│   ├── design-doc/             # 设计文档
│   └── plan/                   # 执行计划
├── rules/                      # 规则文档
├── project/                    # 项目配置
├── docker-compose.yml          # Docker Compose配置
├── .env.example               # 环境变量示例
└── .gitignore                 # Git忽略配置
```

## 安装与运行

### 环境要求

- Python 3.11+
- PostgreSQL 15+
- Redis 7.2+
- Docker (可选)

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/llhhdddd/pet.git
   cd pet
   ```

2. **创建虚拟环境**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/macOS
   source venv/bin/activate
   ```

3. **安装依赖**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件配置数据库连接
   ```

5. **启动服务**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **访问API文档**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Docker部署

```bash
docker-compose up -d
```

## API接口

### 宠物管理

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/v1/pets/{pet_id}` | GET | 获取宠物信息 |
| `/api/v1/pets` | POST | 创建宠物 |
| `/api/v1/pets/{pet_id}` | PUT | 更新宠物信息 |
| `/api/v1/pets/{pet_id}/growth` | POST | 增加成长值 |

### 互动接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/v1/groups/{group_id}/pet/interact` | POST | 与宠物互动 |

### 任务接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/v1/users/{user_id}/daily-tasks` | GET | 获取每日任务 |
| `/api/v1/users/{user_id}/tasks/{task_id}/claim` | POST | 领取任务奖励 |

## 使用示例

### 创建宠物

```bash
curl -X POST "http://localhost:8000/api/v1/pets" \
     -H "Content-Type: application/json" \
     -d '{"name": "小旺", "type": "dog"}'
```

### 与宠物互动

```bash
curl -X POST "http://localhost:8000/api/v1/groups/1/pet/interact" \
     -H "Content-Type: application/json" \
     -d '{"interaction_type": "feed", "item_id": 1, "quantity": 1}'
```

### 领取任务奖励

```bash
curl -X POST "http://localhost:8000/api/v1/users/1/tasks/daily_login/claim" \
     -H "Content-Type: application/json" \
     -d '{}'
```

## 核心算法

### 等级计算公式

```python
def calculate_level(growth_value: int) -> int:
    return min(growth_value // 100 + 1, 99)
```

### 成长效率计算

成长效率受生命值、心情值和等级影响：
- 生命值 >= 81: +20%
- 心情值 >= 81: +15%
- 等级加成: 等级 × 0.5% (最高+50%)

## 可扩展性设计

### 新增宠物类型

```python
from app.utils.registry import PetTypeRegistry

PetTypeRegistry.register_pet_type("rabbit", {
    "name": "兔子",
    "growth_factor": 1.2,
    "health_factor": 0.8,
    "mood_factor": 1.3
})
```

### 新增互动方式

```python
from app.utils.plugins import InteractionPlugin, InteractionRegistry

class PetDanceInteraction(InteractionPlugin):
    def __init__(self):
        self.id = "dance"
        self.name = "跳舞"
        self.cost = 30
    
    async def execute(self, pet, group):
        # 跳舞逻辑
        pass

InteractionRegistry.register_interaction("dance", PetDanceInteraction)
```

## 贡献指南

### 开发流程

1. Fork 本仓库
2. 创建功能分支 `feature/xxx`
3. 提交代码 `git commit -m "feat: xxx"`
4. 推送到远程分支
5. 创建 Pull Request

### 代码规范

- 遵循 PEP 8 规范
- 使用 Conventional Commits 提交信息格式
- 核心函数必须有文档注释
- PR 需至少 1 位团队成员审核

### 提交信息格式

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建/工具更新
```

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: https://github.com/llhhdddd/pet/issues
- 邮件: dev@example.com

---

**项目状态**: 🚀 开发中

**最后更新**: 2026年5月