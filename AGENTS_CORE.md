# AGENTS_CORE.md - Standard 模式核心契约

## 1. 方法论原则
- Spec 即真相：代码、测试、文档必须以已锁定 Spec 为准
- 分层管理：需求、设计、执行分层沉淀
- 可追溯：所有关键决策、变更、执行过程必须留痕
- 渐进式加载：按需加载规范文件
- 人类确认关键决策

## 2. 文档状态机
- Draft（草稿）
- In Review（评审中）
- Locked（锁定）
- Change Requested（变更请求）
- Deprecated（已废弃）
- Archived（已归档）

## 3. 标准指令集
- /sdd-init - 初始化需求
- /sdd-design - 生成设计文档
- /sdd-plan - 生成执行计划
- /sdd-breakpoint - 保存断点
- /sdd-recover - 恢复断点
- /sdd-review - 触发评审
- /sdd-exec - 执行开发
- /sdd-validate - 验证
- /sdd-archive - 归档
- /sdd-help - 帮助

## 4. 指令执行规则
- 只有 Locked 的上层文档才能生成下层文档
- 修改 Locked 文档必须走变更流程
- 执行阶段必须遵守安全基线
- 关键操作必须写日志
- 关键阶段必须更新断点

## 5. 权限边界
### Agent 可直接执行
- 创建草稿
- 生成模板
- 编写非破坏性代码
- 生成测试
- 更新日志
- 生成验证报告

### 需人类确认
- 修改 Locked Spec/Design
- 新增依赖
- 删除文件
- 改动鉴权/加密/权限逻辑
- 修改数据库迁移
- 发布到非开发环境

### 禁止自动执行
- 删除生产数据
- 暴露密钥
- 绕过测试与安全检查
- 修改审计记录

## 6. 知识加载策略
### 默认加载
- rules/git-workflow.md
- rules/code-style-universal.md
- rules/security-baseline.md
- project/tech-stack.yaml
- project/constraints.yaml

### 按需加载
- rules/testing-guidelines.md
- rules/quality-gate.md
- rules/observability-guidelines.md
- skills/*.md

## 7. 产物一致性要求
- Product Spec 定义做什么
- Design Doc 定义怎么做
- Exec Plan 定义先做什么后做什么
- Code 必须服从已锁定 Spec
- 测试必须覆盖验收标准

## 8. 质量门禁
代码合并前必须满足：
1. lint 通过
2. 类型检查通过（如适用）
3. 单元测试通过
4. 安全扫描通过
5. Code-Spec 一致性通过