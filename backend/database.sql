-- =============================================
-- 小组学习陪伴宠物系统 - 数据库建表脚本
-- =============================================

-- 1. 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 班级表
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(20) NOT NULL UNIQUE,
    teacher_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. 小组表
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id),
    name VARCHAR(50) NOT NULL,
    pet_id INTEGER REFERENCES pets(id),
    gold_balance FLOAT DEFAULT 0.0,
    growth_value INTEGER DEFAULT 0,
    health_value INTEGER DEFAULT 100,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. 小组成员表
CREATE TABLE group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    contribution FLOAT DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. 宠物表
CREATE TABLE pets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(30) NOT NULL,
    level INTEGER DEFAULT 1,
    image_url VARCHAR(255),
    growth_threshold INTEGER DEFAULT 100,
    unlock_privileges JSON,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. 宠物特权表
CREATE TABLE pet_privileges (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pets(id),
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    unlock_level INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. 任务表
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id),
    group_id INTEGER REFERENCES groups(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    deadline TIMESTAMP NOT NULL,
    max_score FLOAT DEFAULT 100.0,
    late_penalty_rule JSON,
    task_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. 提交表
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id),
    student_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT,
    score FLOAT,
    feedback TEXT,
    status VARCHAR(30) DEFAULT 'pending',
    submitted_at TIMESTAMP,
    graded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. 金币交易表
CREATE TABLE gold_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    group_id INTEGER REFERENCES groups(id),
    amount FLOAT NOT NULL,
    transaction_type VARCHAR(30) NOT NULL,
    source_type VARCHAR(50),
    related_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. 捉虫记录表
CREATE TABLE bug_corrections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    submission_id INTEGER NOT NULL REFERENCES submissions(id),
    bug_type VARCHAR(50) NOT NULL,
    fixed_content TEXT,
    reward_amount FLOAT DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. 商城商品表
CREATE TABLE shop_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    category VARCHAR(30) NOT NULL,
    image_url VARCHAR(255),
    effect VARCHAR(255),
    unlock_level INTEGER DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. 购买记录表
CREATE TABLE purchase_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    item_id INTEGER NOT NULL REFERENCES shop_items(id),
    quantity INTEGER DEFAULT 1,
    total_price FLOAT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. 班级通知表
CREATE TABLE class_notifications (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    notification_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. 通知阅读状态表
CREATE TABLE notification_read_status (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER NOT NULL REFERENCES class_notifications(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 创建索引
-- =============================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_classes_invite_code ON classes(invite_code);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_gold_transactions_user ON gold_transactions(user_id);
CREATE INDEX idx_gold_transactions_group ON gold_transactions(group_id);

-- =============================================
-- 插入初始化数据
-- =============================================

-- 初始化商城商品
INSERT INTO shop_items (name, description, price, category, effect, unlock_level) VALUES
('普通口粮', '宠物的日常口粮，恢复少量健康值', 10, 'food', '恢复10点健康值', 1),
('高级口粮', '营养丰富的高级口粮，恢复较多健康值', 30, 'food', '恢复30点健康值', 3),
('超级口粮', '顶级营养口粮，大幅恢复健康值', 50, 'food', '恢复50点健康值', 5),
('成长药水', '加速宠物成长', 20, 'prop', '增加20成长值', 2),
('健康药水', '瞬间恢复宠物健康', 35, 'prop', '恢复全部健康值', 4),
('金币袋', '额外金币奖励', 0, 'prop', '获得50金币', 1),
('可爱蝴蝶结', '给宠物戴上可爱的蝴蝶结', 100, 'costume', '解锁蝴蝶结装扮', 3),
('帅气披风', '让宠物看起来更帅气', 150, 'costume', '解锁披风装扮', 5),
('魔法帽子', '神秘的魔法帽子', 200, 'costume', '解锁魔法帽子装扮', 7);

-- 初始化宠物特权
INSERT INTO pet_privileges (name, description, unlock_level) VALUES
('作业提醒', '宠物会提醒你完成作业', 2),
('双倍金币', '完成任务获得双倍金币', 4),
('健康恢复', '宠物每天自动恢复健康', 6),
('任务预览', '可以提前查看任务', 8),
('小组加速', '小组任务获得额外成长值', 10);

-- =============================================
-- 创建示例教师账号（密码: teacher123）
-- =============================================
-- INSERT INTO users (username, email, hashed_password, role) VALUES
-- ('teacher', 'teacher@example.com', '$2b$12$EixZaYbB.rK4fl8x2q7Meu6Q6D2V5fF5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q', 'teacher');

-- =============================================
-- 脚本结束
-- =============================================
