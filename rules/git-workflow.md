# Git 工作流规则

## 分支命名
- main: 生产分支，只读
- develop: 集成分支
- feature/*: 功能分支
- fix/*: 缺陷修复
- hotfix/*: 紧急修复
- release/*: 发布分支

## Commit 规范
使用 Conventional Commits 格式：
- feat: 新功能
- fix: 缺陷修复
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 杂项

## PR/MR 要求
必须包含：
- 关联 ID
- 变更摘要
- 测试结果
- 风险说明

## 合并策略
- 必须经过代码评审
- 必须通过测试
- Squash merge 优先