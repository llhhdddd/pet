# System Design Document: 小组学习陪伴宠物系统

## 1. 基础信息

- Doc ID: SD-2026-001
- 状态: In Review
- 创建时间: 2026-05-12
- 负责人: \[待定]
- 关联文档: PS-2026-001 (Product Spec), tech-stack.yaml

***

## 2. 技术栈规范

### 2.1 基础技术栈

| 层级           | 技术选型       | 版本   | 说明                    |
| ------------ | ---------- | ---- | --------------------- |
| **编程语言**     | Python     | 3.11 | 项目主语言                 |
| **编程语言(前端)** | TypeScript | 5.x  | Web端和桌面端              |
| **代码规范**     | PEP 8      | -    | Python编码标准            |
| **版本控制**     | Git        | -    | 分支策略见git-workflow\.md |

### 2.2 后端技术栈

| 组件        | 技术选型        | 版本     | 说明        |
| --------- | ----------- | ------ | --------- |
| **Web框架** | FastAPI     | 0.100+ | 高性能异步框架   |
| **ORM**   | SQLAlchemy  | 2.0+   | 异步ORM支持   |
| **数据库**   | PostgreSQL  | 15     | 主数据库      |
| **迁移工具**  | Alembic     | -      | 数据库版本管理   |
| **验证库**   | Pydantic    | 2.0    | 数据验证      |
| **认证库**   | python-jose | -      | JWT Token |
| **密码加密**  | bcrypt      | -      | 密码哈希      |

### 2.3 前端技术栈

| 组件          | 技术选型       | 版本  | 说明     |
| ----------- | ---------- | --- | ------ |
| **Web框架**   | React      | 18  | UI框架   |
| **桌面框架**    | Tauri      | 2.0 | 桌面应用   |
| **状态管理**    | Zustand    | -   | 轻量状态管理 |
| **HTTP客户端** | Axios      | -   | API调用  |
| **UI组件库**   | Ant Design | 5   | 企业级组件  |
| **构建工具**    | Vite       | 5   | 快速构建   |

### 2.4 基础设施

| 组件       | 技术选型                  | 说明          |
| -------- | --------------------- | ----------- |
| **实时通信** | WebSocket (FastAPI原生) | 桌面端数据同步     |
| **缓存**   | Redis                 | 会话管理、实时数据缓存 |
| **任务队列** | Celery                | 异步任务处理      |
| **文件存储** | 本地存储/MinIO            | 宠物形象、作业附件   |

***

## 3. 系统整体架构设计

### 3.1 系统分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  教师 Web 端  │  │  学生 Web 端   │  │    桌面宠物端(Tauri)    │  │
│  │  React+TS   │  │  React+TS    │  │   React+Tauri+Rust    │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬────────────┘  │
│         │                │                     │                │
│         └────────────────┼─────────────────────┘                │
│                          ▼                                      │
├─────────────────────────────────────────────────────────────────┤
│                        网关层                                    │
├─────────────────────────────────────────────────────────────────┤
│                     Nginx (反向代理/负载均衡)                     │
│                          │                                      │
├──────────────────────────┼──────────────────────────────────────┤
│                          ▼                                      │
├─────────────────────────────────────────────────────────────────┤
│                        API层 (FastAPI)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      API Routes                           │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │  │  Auth   │ │  User   │ │  Class  │ │  Task   │  ...   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                      │
│  ┌──────────────────────┼──────────────────────────────────┐  │
│  │              Middleware Layer                              │  │
│  │  CORS │ Auth │ Rate Limit │ Logging │ Validation         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                      │
├──────────────────────────┼──────────────────────────────────────┤
│                          ▼                                      │
├─────────────────────────────────────────────────────────────────┤
│                       服务层                                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ UserService │  │ClassService │  │TaskService  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │PetService   │  │GoldService  │  │AnalyzeService│            │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                          │                                      │
├──────────────────────────┼──────────────────────────────────────┤
│                          ▼                                      │
├─────────────────────────────────────────────────────────────────┤
│                      数据访问层                                  │
├─────────────────────────────────────────────────────────────────┤
│     SQLAlchemy 2.0 ORM      │      Redis Cache                  │
│                              │                                   │
├──────────────────────────────┼──────────────────────────────────┤
│                              ▼                                  │
├─────────────────────────────────────────────────────────────────┤
│                      PostgreSQL 15                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │  users │ │ classes│ │ groups │ │  pets  │ │ tasks  │ ...   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 模块划分与职责

| 模块            | 职责           | 主要类/函数                                   |
| ------------- | ------------ | ---------------------------------------- |
| **auth**      | 用户认证、Token管理 | `AuthService`, `JWTHandler`              |
| **users**     | 用户信息管理       | `UserService`, `UserRepository`          |
| **classes**   | 班级管理         | `ClassService`, `ClassRepository`        |
| **groups**    | 小组管理         | `GroupService`, `GroupRepository`        |
| **pets**      | 宠物养成         | `PetService`, `PetRepository`            |
| **tasks**     | 任务全流程        | `TaskService`, `SubmissionService`       |
| **gold**      | 金币经济         | `GoldService`, `TransactionRepository`   |
| **analyze**   | 学情分析         | `AnalyzeService`, `StatisticsRepository` |
| **websocket** | 实时通信         | `WebSocketHandler`                       |

### 3.3 核心业务链路

```
用户操作流程：

1. 认证流程
   注册 → 登录 → JWT Token → 访问受保护资源

2. 任务发布流程
   教师创建任务 → 分发给班级/小组 → 学生收到通知

3. 作业提交流程
   学生提交作业 → 教师批改 → 评分+评语 → 发放金币

4. 宠物养成流程
   完成学习任务 → 赚取金币+成长值 → 宠物升级 → 解锁特权

5. 桌面端同步流程
   Web端操作 → WebSocket推送 → 桌面端接收 → 更新UI
```

***

## 4. 数据库完整设计

### 4.1 E-R实体关系图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │       │   classes   │       │    pets     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ username    │       │ name        │       │ name        │
│ password    │       │ invite_code │       │ type        │
│ role        │       │ teacher_id  │◄──────│ level       │
│ created_at  │       │ created_at  │       │ growth_value│
└──────┬──────┘       └──────┬──────┘       │ health_value│
       │                     │              │ image_url   │
       │                     │              │ group_id(FK)│
       │            ┌────────┴────────┐      └─────────────┘
       │            │                 │
       │     ┌──────┴──────┐  ┌──────┴──────┐
       │     │ group_members│  │   tasks    │
       │     ├─────────────┤  ├─────────────┤
       │     │ user_id(FK) │  │ id (PK)     │
       │     │ group_id(FK)│  │ class_id(FK)│
       │     │ joined_at    │  │ title       │
       │     └──────┬──────┘  │ content     │
       │            │         │ deadline    │
       │     ┌──────┴──────┐  │ max_score   │
       │     │   groups    │  │ late_penalty│
       │     ├─────────────┤  │ task_type   │
       │     │ id (PK)     │  │ status      │
       │     │ class_id(FK)│  │ created_at  │
       │     │ name        │  └──────┬──────┘
       │     │ pet_id(FK)  │         │
       │     │ gold_balance│         │
       │     └──────┬──────┘         │
       │            │            ┌────┴────┐
       │            │            │         │
       │     ┌──────┴──────┐     │  ┌─────┴─────┐
       │     │  submissions│     │  │ gold_trans│
       │     ├─────────────┤     │  ├──────────┤
       └────►│ id (PK)     │     │  │ id (PK)  │
             │ task_id(FK) │     │  │ user_id  │
             │ student_id  │     │  │ group_id │
             │ content      │     │  │ amount   │
             │ score        │     │  │ source   │
             │ feedback     │     │  │ related  │
             │ submitted_at │     │  │ created  │
             │ graded_at    │     │  └──────────┘
             └─────────────┘     │
                                  │
                           ┌──────┴──────┐
                           │ bug_corrections
                           ├──────────────┤
                           │ id (PK)      │
                           │ user_id(FK)  │
                           │ submission_id│
                           │ bug_type     │
                           │ fixed_content│
                           │ reward       │
                           │ created_at   │
                           └──────────────┘
```

### 4.2 完整表结构设计

#### 4.2.1 users 用户表

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student')),
    personal_gold INT DEFAULT 0,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);
```

#### 4.2.2 classes 班级表

```sql
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(8) NOT NULL UNIQUE,
    description TEXT,
    teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    max_students INT DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_invite_code ON classes(invite_code);
```

#### 4.2.3 groups 小组表

```sql
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    pet_id INT,
    gold_balance INT DEFAULT 0,
    growth_value INT DEFAULT 0,
    health_value INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, name)
);

CREATE INDEX idx_groups_class ON groups(class_id);
CREATE INDEX idx_groups_pet ON groups(pet_id);
```

#### 4.2.4 group\_members 小组关系表

```sql
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    is_leader BOOLEAN DEFAULT FALSE,
    contribution_score INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, group_id)
);

CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
```

#### 4.2.5 pets 宠物表

```sql
CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL,
    level INT DEFAULT 1,
    growth_value INT DEFAULT 0,
    health_value INT DEFAULT 100,
    image_url VARCHAR(500),
    unlocked_images JSONB DEFAULT '[]',
    unlocked_privileges JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pets_type ON pets(type);
CREATE INDEX idx_pets_level ON pets(level DESC);
```

#### 4.2.6 tasks 任务表

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    task_type VARCHAR(30) NOT NULL CHECK (task_type IN ('homework', 'preview', 'project', 'quiz')),
    deadline TIMESTAMP NOT NULL,
    max_score INT DEFAULT 100,
    late_penalty_rate DECIMAL(3,2) DEFAULT 0.10,
    target_type VARCHAR(10) CHECK (target_type IN ('class', 'group')),
    target_ids INT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_class ON tasks(class_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_status ON tasks(status);
```

#### 4.2.7 submissions 提交表

```sql
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    attachments JSONB DEFAULT '[]',
    score INT,
    feedback TEXT,
    is_excellent BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned', ' resubmitted')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, student_id)
);

CREATE INDEX idx_submissions_task ON submissions(task_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_submissions_status ON submissions(status);
```

#### 4.2.8 gold\_transactions 金币流水表

```sql
CREATE TABLE gold_transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    group_id INT REFERENCES groups(id) ON DELETE SET NULL,
    amount INT NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    source_type VARCHAR(30) NOT NULL,
    related_id INT,
    description VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gold_user ON gold_transactions(user_id);
CREATE INDEX idx_gold_group ON gold_transactions(group_id);
CREATE INDEX idx_gold_created ON gold_transactions(created_at);
```

#### 4.2.9 bug\_corrections 捉虫记录表

```sql
CREATE TABLE bug_corrections (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_id INT REFERENCES submissions(id) ON DELETE SET NULL,
    bug_type VARCHAR(30) NOT NULL,
    original_content TEXT,
    fixed_content TEXT,
    reward_amount INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

CREATE INDEX idx_bug_user ON bug_corrections(user_id);
CREATE INDEX idx_bug_submission ON bug_corrections(submission_id);
```

#### 4.2.10 class\_notifications 班级通知表

```sql
CREATE TABLE class_notifications (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    notification_type VARCHAR(20) DEFAULT 'notice',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_class ON class_notifications(class_id);
```

#### 4.2.11 notification\_read\_status 已读状态表

```sql
CREATE TABLE notification_read_status (
    id SERIAL PRIMARY KEY,
    notification_id INT NOT NULL REFERENCES class_notifications(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(notification_id, user_id)
);
```

#### 4.2.12 pet\_privileges 宠物特权表

```sql
CREATE TABLE pet_privileges (
    id SERIAL PRIMARY KEY,
    pet_id INT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    privilege_code VARCHAR(50) NOT NULL,
    privilege_name VARCHAR(100),
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pet_id, privilege_code)
);

CREATE INDEX idx_privileges_pet ON pet_privileges(pet_id);
```

#### 4.2.13 shop\_items 商城道具表

```sql
CREATE TABLE shop_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    item_type VARCHAR(30) NOT NULL,
    price INT NOT NULL,
    effect_value JSONB,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shop_items_type ON shop_items(item_type);
```

#### 4.2.14 purchase\_records 购买记录表

```sql
CREATE TABLE purchase_records (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    total_price INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchase_user ON purchase_records(user_id);
CREATE INDEX idx_purchase_group ON purchase_records(group_id);
```

***

## 5. 前后端接口统一规范

### 5.1 RESTful API 规范

#### 基础规范

- 所有API使用HTTPS
- Base URL: `/api/v1`
- 认证方式: Bearer Token (JWT)
- 请求格式: `Content-Type: application/json`
- 响应格式: JSON

#### 响应格式标准

```json
{
    "code": 200,
    "message": "success",
    "data": { ... }
}

{
    "code": 400,
    "message": "Bad Request",
    "error": "详细错误信息"
}
```

#### 状态码定义

| 状态码 | 含义                    | 说明          |
| --- | --------------------- | ----------- |
| 200 | OK                    | 请求成功        |
| 201 | Created               | 资源创建成功      |
| 400 | Bad Request           | 请求参数错误      |
| 401 | Unauthorized          | 未认证或Token无效 |
| 403 | Forbidden             | 无权限访问       |
| 404 | Not Found             | 资源不存在       |
| 422 | Unprocessable Entity  | 业务逻辑错误      |
| 500 | Internal Server Error | 服务器内部错误     |

### 5.2 认证接口

#### POST /api/v1/auth/register - 用户注册

**请求**

```json
{
    "username": "teacher001",
    "email": "teacher@example.com",
    "password": "SecurePass123",
    "role": "teacher"
}
```

**响应**

```json
{
    "code": 201,
    "message": "注册成功",
    "data": {
        "user_id": 1,
        "username": "teacher001",
        "role": "teacher"
    }
}
```

#### POST /api/v1/auth/login - 用户登录

**请求**

```json
{
    "username": "teacher001",
    "password": "SecurePass123"
}
```

**响应**

```json
{
    "code": 200,
    "message": "登录成功",
    "data": {
        "access_token": "eyJhbGciOiJIUzI1NiIs...",
        "token_type": "bearer",
        "expires_in": 86400,
        "user": {
            "id": 1,
            "username": "teacher001",
            "role": "teacher"
        }
    }
}
```

### 5.3 班级管理接口

#### POST /api/v1/classes - 创建班级

**权限**: teacher
**请求**

```json
{
    "name": "2026级Python班",
    "description": "Python程序设计基础",
    "max_students": 50
}
```

**响应**

```json
{
    "code": 201,
    "message": "班级创建成功",
    "data": {
        "id": 1,
        "name": "2026级Python班",
        "invite_code": "ABC12345",
        "max_students": 50
    }
}
```

#### GET /api/v1/classes/{class\_id} - 获取班级详情

**权限**: teacher(自己的班级), student(已加入)
**响应**

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "name": "2026级Python班",
        "invite_code": "ABC12345",
        "description": "Python程序设计基础",
        "teacher": {
            "id": 1,
            "username": "teacher001"
        },
        "student_count": 30,
        "group_count": 5,
        "is_joined": true
    }
}
```

#### POST /api/v1/classes/join - 加入班级

**权限**: student
**请求**

```json
{
    "invite_code": "ABC12345"
}
```

### 5.4 小组管理接口

#### GET /api/v1/classes/{class\_id}/groups - 获取班级小组列表

**响应**

```json
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": 1,
            "name": "第一小组",
            "member_count": 6,
            "pet": {
                "id": 1,
                "name": "小旺",
                "level": 5,
                "health_value": 90
            },
            "gold_balance": 500,
            "growth_value": 450
        }
    ]
}
```

#### POST /api/v1/classes/{class\_id}/groups - 创建小组

**权限**: teacher
**请求**

```json
{
    "name": "第一小组",
    "member_ids": [10, 11, 12, 13, 14, 15]
}
```

### 5.5 任务管理接口

#### POST /api/v1/tasks - 创建任务

**权限**: teacher
**请求**

```json
{
    "class_id": 1,
    "title": "Python基础作业1",
    "content": "完成教材第3章练习题1-10",
    "task_type": "homework",
    "deadline": "2026-05-20T23:59:59",
    "max_score": 100,
    "late_penalty_rate": 0.1,
    "target_type": "class",
    "attachments": []
}
```

#### GET /api/v1/tasks - 获取任务列表

**权限**: teacher(自己创建的), student(已加入班级的)
**查询参数**: `class_id`, `status`, `task_type`, `page`, `page_size`

#### POST /api/v1/tasks/{task\_id}/submit - 提交作业

**权限**: student
**请求**

```json
{
    "content": "我的作业答案...",
    "attachments": []
}
```

#### PUT /api/v1/submissions/{submission\_id}/grade - 批改作业

**权限**: teacher
**请求**

```json
{
    "score": 95,
    "feedback": "作业完成得很好，注意第3题的语法规范",
    "is_excellent": true
}
```

### 5.6 宠物管理接口

#### GET /api/v1/pets/{pet\_id} - 获取宠物信息

**响应**

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": 1,
        "name": "小旺",
        "type": "dog",
        "level": 5,
        "growth_value": 450,
        "growth_to_next_level": 500,
        "health_value": 90,
        "image_url": "/static/pets/dog_lv5.png",
        "unlocked_images": ["dog_lv1", "dog_lv3", "dog_lv5"],
        "privileges": ["view_answer", "view_excellent"]
    }
}
```

#### PUT /api/v1/groups/{group\_id}/pet/feed - 喂养宠物

**请求**

```json
{
    "item_id": 1,
    "quantity": 1
}
```

### 5.7 金币管理接口

#### GET /api/v1/gold/balance - 获取金币余额

**响应**

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "personal_gold": 150,
        "group_gold": 500
    }
}
```

#### GET /api/v1/gold/transactions - 金币流水

**查询参数**: `user_id`, `group_id`, `start_date`, `end_date`, `page`, `page_size`

#### POST /api/v1/gold/reward - 发放金币奖励

**权限**: system/teacher
**请求**

```json
{
    "user_id": 10,
    "group_id": 1,
    "amount": 100,
    "source_type": "task_complete",
    "related_id": 15,
    "description": "完成Python作业1"
}
```

### 5.8 学情分析接口

#### GET /api/v1/analyze/class/{class\_id}/overview - 班级学情概览

**权限**: teacher
**响应**

```json
{
    "code": 200,
    "message": "success",
    "data": {
        "total_students": 30,
        "total_tasks": 10,
        "submission_rate": 0.85,
        "average_score": 82.5,
        "excellent_rate": 0.3,
        "class_ranking": [
            {
                "user_id": 10,
                "username": "student001",
                "total_score": 920,
                "rank": 1
            }
        ],
        "task_completion": [
            {
                "task_id": 1,
                "title": "Python基础作业1",
                "submission_rate": 0.9,
                "average_score": 85.0
            }
        ],
        "alerts": [
            {
                "user_id": 15,
                "username": "student005",
                "alert_type": "overdue",
                "count": 3
            }
        ]
    }
}
```

***

## 6. 核心业务逻辑实现方案

### 6.1 金币分配算法

```python
# 位置: services/gold_service.py

class GoldService:
    PERSONAL_RATIO = 0.3  # 个人所得比例
    GROUP_RATIO = 0.7    # 小组所得比例
    
    async def distribute_task_reward(
        self,
        user_id: int,
        group_id: int,
        base_reward: int,
        task_id: int
    ) -> GoldDistributionResult:
        """
        金币分配算法：
        1. 计算个人所得和小组所得
        2. 更新用户个人金币
        3. 更新小组公共池
        4. 记录金币流水
        """
        personal_amount = int(base_reward * self.PERSONAL_RATIO)
        group_amount = int(base_reward * self.GROUP_RATIO)
        
        async with self.db.transaction():
            # 更新个人金币
            await self.user_repo.add_gold(user_id, personal_amount)
            
            # 更新小组金币
            await self.group_repo.add_gold(group_id, group_amount)
            
            # 记录个人金币流水
            await self.transaction_repo.create(
                user_id=user_id,
                amount=personal_amount,
                transaction_type="earn",
                source_type="task_complete",
                related_id=task_id,
                description=f"完成任务获得个人金币"
            )
            
            # 记录小组金币流水
            await self.transaction_repo.create(
                group_id=group_id,
                amount=group_amount,
                transaction_type="earn",
                source_type="task_complete",
                related_id=task_id,
                description=f"完成任务获得小组金币"
            )
        
        return GoldDistributionResult(
            personal=personal_amount,
            group=group_amount
        )
```

### 6.2 宠物成长算法

```python
# 位置: services/pet_service.py

class PetService:
    GROWTH_PER_LEVEL = 100  # 每级所需成长值
    
    def calculate_level(self, growth_value: int) -> int:
        """根据成长值计算等级"""
        return growth_value // self.GROWTH_PER_LEVEL + 1
    
    def calculate_growth_for_next_level(self, current_level: int) -> int:
        """计算到达下一级还需要多少成长值"""
        next_level_growth = current_level * self.GROWTH_PER_LEVEL
        return next_level_growth
    
    async def add_growth(self, pet_id: int, amount: int) -> PetGrowthResult:
        """
        增加成长值并检查升级
        """
        pet = await self.pet_repo.get_by_id(pet_id)
        
        old_level = self.calculate_level(pet.growth_value)
        pet.growth_value += amount
        new_level = self.calculate_level(pet.growth_value)
        
        new_privileges = []
        if new_level > old_level:
            new_privileges = await self.unlock_privileges(pet, new_level)
        
        await self.pet_repo.update(pet)
        
        return PetGrowthResult(
            pet_id=pet_id,
            added_growth=amount,
            new_growth_value=pet.growth_value,
            old_level=old_level,
            new_level=new_level,
            new_privileges=new_privileges,
            leveled_up=new_level > old_level
        )
```

### 6.3 健康值衰减算法

```python
# 位置: services/pet_service.py

class PetHealthDecayService:
    DAILY_DECAY_RATE = 10  # 每日衰减健康值
    
    async def check_and_decay_health(self, group_id: int) -> List[HealthDecayEvent]:
        """
        检查并执行健康值衰减
        触发条件：小组有逾期未完成的任务
        """
        events = []
        
        group = await self.group_repo.get_by_id(group_id)
        pet = await self.pet_repo.get_by_id(group.pet_id)
        
        # 获取逾期任务数量
        overdue_tasks = await self.task_repo.get_overdue_by_group(group_id)
        
        if overdue_tasks:
            days_overdue = (datetime.now() - overdue_tasks[0].deadline).days
            decay_amount = min(days_overdue * self.DAILY_DECAY_RATE, pet.health_value)
            
            if decay_amount > 0:
                pet.health_value -= decay_amount
                await self.pet_repo.update(pet)
                
                events.append(HealthDecayEvent(
                    pet_id=pet.id,
                    decay_amount=decay_amount,
                    new_health_value=pet.health_value,
                    trigger_task_count=len(overdue_tasks)
                ))
        
        return events
```

### 6.4 迟交扣分算法

```python
# 位置: services/task_service.py

class LateSubmissionPenaltyService:
    async def calculate_score_with_penalty(
        self,
        submission: Submission,
        task: Task
    ) -> int:
        """
        计算迟交扣分后的实际得分
        公式: 实际得分 = 原始得分 × (1 - 逾期天数 × 迟交扣分率)
        """
        if submission.submitted_at <= task.deadline:
            return submission.raw_score
        
        days_late = (submission.submitted_at - task.deadline).days
        penalty_rate = min(days_late * task.late_penalty_rate, 0.9)  # 最多扣90%
        
        final_score = int(submission.raw_score * (1 - penalty_rate))
        return max(final_score, 0)  # 最低0分
```

### 6.5 WebSocket实时同步

```python
# 位置: websocket/pet_sync.py

from fastapi import WebSocket

class PetSyncWebSocket:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, user_id: int, websocket: WebSocket):
        """用户连接"""
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    def disconnect(self, user_id: int, websocket: WebSocket):
        """用户断开"""
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
    
    async def broadcast_pet_update(self, group_id: int, event: PetUpdateEvent):
        """广播宠物更新到小组所有成员"""
        group_members = await self.group_repo.get_member_user_ids(group_id)
        
        for user_id in group_members:
            if user_id in self.active_connections:
                for connection in self.active_connections[user_id]:
                    try:
                        await connection.send_json(event.dict())
                    except Exception:
                        self.disconnect(user_id, connection)
    
    async def broadcast_task_reminder(
        self,
        user_id: int,
        reminder: TaskReminder
    ):
        """发送任务提醒给指定用户"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(reminder.dict())
                except Exception:
                    self.disconnect(user_id, connection)
```

***

## 7. 安全设计

### 7.1 密码安全

```python
# 位置: security/password.py

import bcrypt

def hash_password(password: str) -> str:
    """使用bcrypt加密密码"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """验证密码"""
    return bcrypt.checkpw(
        password.encode('utf-8'),
        hashed.encode('utf-8')
    )
```

**安全要求**：

- 密码最小长度8位，必须包含字母和数字
- 密码不存储明文，只存储bcrypt哈希
- 登录失败5次后锁定15分钟
- Token有效期24小时

### 7.2 JWT认证

```python
# 位置: security/jwt.py

from datetime import datetime, timedelta
from jose import JWTError, jwt

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24小时

def create_access_token(data: dict) -> str:
    """创建JWT Token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """验证JWT Token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

### 7.3 输入校验

```python
# 位置: schemas/validators.py

from pydantic import BaseModel, validator, Field
import re

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    password: str = Field(..., min_length=8)
    role: str = Field(..., regex=r'^(teacher|student)$')
    
    @validator('password')
    def password_must_be_strong(cls, v):
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('密码必须包含字母')
        if not re.search(r'\d', v):
            raise ValueError('密码必须包含数字')
        return v

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: Optional[str] = Field(None, max_length=5000)
    deadline: datetime
    max_score: int = Field(100, gt=0, le=1000)
    late_penalty_rate: float = Field(0.1, ge=0, le=0.9)
```

### 7.4 SQL注入防护

```python
# 位置: repositories/base.py

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

class BaseRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_by_id(self, id: int):
        """使用参数化查询，防止SQL注入"""
        stmt = select(self.model).where(self.model.id == id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def filter_by(self, **kwargs):
        """使用参数化查询"""
        stmt = select(self.model)
        for key, value in kwargs.items():
            stmt = stmt.where(getattr(self.model, key) == value)
        result = await self.db.execute(stmt)
        return result.scalars().all()
```

### 7.5 RBAC权限控制

```python
# 位置: middleware/rbac.py

from enum import Enum
from functools import wraps

class Role(Enum):
    TEACHER = "teacher"
    STUDENT = "student"
    ADMIN = "admin"

class Permission:
    TEACHER_ONLY = [Role.TEACHER, Role.ADMIN]
    STUDENT_ONLY = [Role.STUDENT]
    AUTHENTICATED = [Role.TEACHER, Role.STUDENT, Role.ADMIN]

def require_permission(allowed_roles: List[Role]):
    """权限装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="未认证")
            
            if current_user.role not in [r.value for r in allowed_roles]:
                raise HTTPException(status_code=403, detail="无权限")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# 使用示例
@router.post("/tasks")
@require_permission([Role.TEACHER, Role.ADMIN])
async def create_task(...):
    pass
```

### 7.6 敏感信息保护

```python
# 位置: config/settings.py

class Settings:
    # 数据库配置从环境变量读取，不硬编码
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    # JWT密钥从环境变量读取
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    
    # 敏感配置不记录日志
    @classmethod
    def display_settings(cls):
        return {
            "DATABASE_URL": "***(hidden)***",  # 脱敏
            "JWT_SECRET_KEY": "***(hidden)***",
            "DEBUG": cls.DEBUG
        }
```

***

## 8. 数据库初始化脚本

### 8.1 完整建表脚本

```sql
-- 位置: database/migrations/001_initial_schema.sql

BEGIN;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student')),
    personal_gold INT DEFAULT 0,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 班级表
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(8) NOT NULL UNIQUE,
    description TEXT,
    teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    max_students INT DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 小组表
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    pet_id INT,
    gold_balance INT DEFAULT 0,
    growth_value INT DEFAULT 0,
    health_value INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, name)
);

-- 小组关系表
CREATE TABLE IF NOT EXISTS group_members (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    is_leader BOOLEAN DEFAULT FALSE,
    contribution_score INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, group_id)
);

-- 宠物表
CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL,
    level INT DEFAULT 1,
    growth_value INT DEFAULT 0,
    health_value INT DEFAULT 100,
    image_url VARCHAR(500),
    unlocked_images JSONB DEFAULT '[]',
    unlocked_privileges JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    task_type VARCHAR(30) NOT NULL CHECK (task_type IN ('homework', 'preview', 'project', 'quiz')),
    deadline TIMESTAMP NOT NULL,
    max_score INT DEFAULT 100,
    late_penalty_rate DECIMAL(3,2) DEFAULT 0.10,
    target_type VARCHAR(10) CHECK (target_type IN ('class', 'group')),
    target_ids INT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 提交表
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    attachments JSONB DEFAULT '[]',
    score INT,
    feedback TEXT,
    is_excellent BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned', 'resubmitted')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, student_id)
);

-- 金币流水表
CREATE TABLE IF NOT EXISTS gold_transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    group_id INT REFERENCES groups(id) ON DELETE SET NULL,
    amount INT NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    source_type VARCHAR(30) NOT NULL,
    related_id INT,
    description VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 捉虫记录表
CREATE TABLE IF NOT EXISTS bug_corrections (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_id INT REFERENCES submissions(id) ON DELETE SET NULL,
    bug_type VARCHAR(30) NOT NULL,
    original_content TEXT,
    fixed_content TEXT,
    reward_amount INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- 班级通知表
CREATE TABLE IF NOT EXISTS class_notifications (
    id SERIAL PRIMARY KEY,
    class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    notification_type VARCHAR(20) DEFAULT 'notice',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 已读状态表
CREATE TABLE IF NOT EXISTS notification_read_status (
    id SERIAL PRIMARY KEY,
    notification_id INT NOT NULL REFERENCES class_notifications(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(notification_id, user_id)
);

-- 宠物特权表
CREATE TABLE IF NOT EXISTS pet_privileges (
    id SERIAL PRIMARY KEY,
    pet_id INT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    privilege_code VARCHAR(50) NOT NULL,
    privilege_name VARCHAR(100),
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pet_id, privilege_code)
);

-- 商城道具表
CREATE TABLE IF NOT EXISTS shop_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    item_type VARCHAR(30) NOT NULL,
    price INT NOT NULL,
    effect_value JSONB,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 购买记录表
CREATE TABLE IF NOT EXISTS purchase_records (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    total_price INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_invite_code ON classes(invite_code);
CREATE INDEX idx_groups_class ON groups(class_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_tasks_class ON tasks(class_id);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_submissions_task ON submissions(task_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_gold_user ON gold_transactions(user_id);
CREATE INDEX idx_gold_group ON gold_transactions(group_id);

COMMIT;
```

### 8.2 初始化测试数据

```sql
-- 位置: database/seeds/001_test_data.sql

BEGIN;

-- 插入测试用户 (密码都是 Test123)
INSERT INTO users (username, email, password_hash, role, personal_gold) VALUES
('teacher001', 'teacher001@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfQ3Z7M8WG', 'teacher', 0),
('student001', 'student001@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfQ3Z7M8WG', 'student', 100),
('student002', 'student002@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfQ3Z7M8WG', 'student', 80),
('student003', 'student003@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfQ3Z7M8WG', 'student', 60);

-- 插入测试班级
INSERT INTO classes (name, invite_code, description, teacher_id) VALUES
('2026级Python班', 'PY202601', 'Python程序设计基础', 1);

-- 插入测试宠物
INSERT INTO pets (name, type, level, growth_value, health_value) VALUES
('小旺', 'dog', 3, 280, 90),
('小喵', 'cat', 2, 150, 100);

-- 插入测试小组
INSERT INTO groups (class_id, name, pet_id, gold_balance, growth_value, health_value) VALUES
(1, '第一小组', 1, 500, 280, 90),
(1, '第二小组', 2, 300, 150, 100);

-- 插入小组关系
INSERT INTO group_members (user_id, group_id, is_leader) VALUES
(2, 1, TRUE),
(3, 1, FALSE),
(4, 2, TRUE);

-- 插入商城道具
INSERT INTO shop_items (name, item_type, price, effect_value, description) VALUES
('普通狗粮', 'food', 10, '{"health": 5}', '恢复宠物5点健康值'),
('高级狗粮', 'food', 30, '{"health": 20}', '恢复宠物20点健康值'),
('可爱帽子', 'decoration', 50, '{"charm": 10}', '装饰品，增加魅力值'),
('超级狗粮', 'food', 100, '{"health": 50, "growth": 10}', '恢复健康并增加少量成长值');

COMMIT;
```

***

## 9. 项目目录结构

```
pet-learning-system/
├── backend/                          # 后端项目
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI入口
│   │   ├── config.py                 # 配置管理
│   │   ├── database.py               # 数据库连接
│   │   ├── models/                   # SQLAlchemy模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── class.py
│   │   │   ├── group.py
│   │   │   ├── pet.py
│   │   │   ├── task.py
│   │   │   └── gold.py
│   │   ├── schemas/                  # Pydantic模型
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── task.py
│   │   │   └── pet.py
│   │   ├── repositories/             # 数据访问层
│   │   │   ├── __init__.py
│   │   │   ├── user_repo.py
│   │   │   ├── class_repo.py
│   │   │   └── task_repo.py
│   │   ├── services/                 # 业务逻辑层
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── class_service.py
│   │   │   ├── task_service.py
│   │   │   ├── pet_service.py
│   │   │   └── gold_service.py
│   │   ├── api/                      # API路由
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── classes.py
│   │   │   │   ├── tasks.py
│   │   │   │   ├── pets.py
│   │   │   │   └── gold.py
│   │   ├── middleware/                # 中间件
│   │   │   ├── __init__.py
│   │   │   ├── auth_middleware.py
│   │   │   └── cors_middleware.py
│   │   ├── websocket/                # WebSocket处理
│   │   │   ├── __init__.py
│   │   │   ├── pet_sync.py
│   │   │   └── task_reminder.py
│   │   └── security/                 # 安全相关
│   │       ├── __init__.py
│   │       ├── password.py
│   │       └── jwt.py
│   ├── migrations/                   # Alembic迁移
│   │   ├── versions/
│   │   └── env.py
│   ├── tests/                        # 测试
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_tasks.py
│   │   └── test_pets.py
│   ├── requirements.txt
│   └── alembic.ini
│
├── frontend/                         # 前端Web项目
│   ├── src/
│   │   ├── __init__.py
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── api/                      # API调用
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── tasks.ts
│   │   │   └── pets.ts
│   │   ├── stores/                   # Zustand状态
│   │   │   ├── authStore.ts
│   │   │   ├── taskStore.ts
│   │   │   └── petStore.ts
│   │   ├── components/               # 公共组件
│   │   │   ├── Layout/
│   │   │   ├── TaskCard/
│   │   │   └── PetDisplay/
│   │   ├── pages/                    # 页面
│   │   │   ├── teacher/
│   │   │   │   ├── Dashboard/
│   │   │   │   ├── ClassManagement/
│   │   │   │   └── TaskManagement/
│   │   │   └── student/
│   │   │       ├── Dashboard/
│   │   │       ├── TaskList/
│   │   │       └── MyPet/
│   │   └── styles/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── desktop/                          # 桌面宠物端(Tauri)
│   ├── src/                          # React前端
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── PetWidget/            # 宠物组件
│   │   │   ├── TaskReminder/         # 任务提醒
│   │   │   └── SystemTray/
│   │   └── utils/
│   ├── src-tauri/                   # Rust后端
│   │   ├── src/
│   │   │   ├── main.rs
│   │   │   ├── commands.rs
│   │   │   └── tray.rs
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   └── package.json
│
├── database/                         # 数据库脚本
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── seeds/
│       └── 001_test_data.sql
│
├── docs/                             # 文档
│   ├── API.md
│   └── DEPLOY.md
│
├── .env.example
├── docker-compose.yml
├── README.md
└── SPEC.md
```

***

## 10. 附录

### 10.1 错误码定义

| 错误码      | 英文描述                | 中文描述     |
| -------- | ------------------- | -------- |
| AUTH001  | Invalid credentials | 用户名或密码错误 |
| AUTH002  | Token expired       | Token已过期 |
| AUTH003  | Token invalid       | Token无效  |
| CLASS001 | Class not found     | 班级不存在    |
| CLASS002 | Invite code invalid | 邀请码无效    |
| CLASS003 | Class is full       | 班级人数已满   |
| GROUP001 | Group not found     | 小组不存在    |
| GROUP002 | Already in a group  | 已在其他小组   |
| TASK001  | Task not found      | 任务不存在    |
| TASK002  | Already submitted   | 已提交过     |
| TASK003  | Past deadline       | 已过截止时间   |
| GOLD001  | Insufficient gold   | 金币不足     |
| PET001   | Pet not found       | 宠物不存在    |
| PET002   | Max health          | 健康值已满    |

