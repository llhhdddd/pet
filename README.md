# Standard 模式项目目录

## 模式定位
适用于：常规业务项目、小团队协作

## 包含内容
- 完整 Spec（产品需求、设计、执行计划）
- 验证与归档
- 基础测试和日志
- 完整的规范规则

## 可跳过内容（相比 Strict 模式）
- 强制 ADR
- 强制变更管理流程
- 强制安全扫描
- 强制评审
- 强制可观测性要求

## 目录结构
```
Standard 模式/
├── README.md
├── AGENTS_CORE.md
├── .gitignore
├── .env.example
├── specs/
│   ├── product-spec/
│   │   └── PRODUCT_SPEC_TEMPLATE.md
│   ├── design-doc/
│   │   └── DESIGN_DOC_TEMPLATE.md
│   ├── exec-plan/
│   │   └── EXEC_PLAN_TEMPLATE.md
│   ├── change-requests/
│   │   └── CHANGE_REQUEST_TEMPLATE.md
│   └── validation-reports/
├── rules/
│   ├── git-workflow.md
│   ├── code-style-universal.md
│   ├── security-baseline.md
│   ├── testing-guidelines.md
│   └── quality-gate.md
├── project/
│   ├── tech-stack.yaml
│   ├── constraints.yaml
│   └── team-guidelines.md
├── skills/
│   ├── spec-writing.md
│   └── code-review.md
├── logs/
│   ├── task-execution.log
│   └── decision-log.md
└── docs/
    ├── methodology.md
    └── quick-start.md
```

## 使用场景
- 常规业务项目开发
- 小组协作（2-10人）
- 需要版本管理的项目
- 中等复杂度系统