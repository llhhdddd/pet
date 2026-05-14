# 小组学习陪伴宠物系统 - 网页端

## 项目简介

这是一个基于 React + TypeScript + Vite 的网页端应用，实现了学生端和教师端的双角色系统。

## 技术栈

- **框架**: React 18 + TypeScript 5.3.3
- **构建工具**: Vite 5.0.8
- **样式**: Tailwind CSS 3.4.0
- **路由**: React Router 6.20.0
- **状态管理**: Zustand 4.4.7
- **HTTP 客户端**: Axios 1.6.2
- **图标库**: Lucide React 0.294.0

## 功能特性

### 用户认证系统
- 用户注册（学生/教师身份选择）
- 邮箱/手机号验证流程
- 账号密码登录
- "记住我"功能
- 找回密码（三步验证流程）
- 密码强度检测

### 学生端功能
- 首页：宠物状态、任务概览、学习统计
- 宠物养成：宠物信息、喂食、玩耍、健康值管理
- 任务中心：任务列表、任务提交、任务完成
- 金币系统：金币余额、获取方式、商城、交易记录
- 捉虫游戏：错题转化游戏、60秒限时、三档难度
- 班级：班级信息、成员列表
- 小组：小组信息、成员管理
- 个人中心：用户信息、设置

### 教师端功能
- 班级管理：创建班级、查看班级详情、邀请码管理
- 任务管理：创建任务、发布任务、作业批改、评分
- 学情分析：班级统计、学生成绩、小组排名、异常预警
- 规则配置：金币规则、宠物成长规则、特权解锁规则
- 个人中心：用户信息、设置

### 界面设计
- 橙黄色渐变背景（动态动画）
- 白色字体 + 阴影效果（WCAG AA级标准）
- 玻璃态 UI 设计
- 响应式布局（适配 PC、平板、手机）
- 页面过渡动画和微交互效果

## 安装依赖

```bash
cd web
npm install
```

## 启动开发服务器

```bash
npm run dev
```

开发服务器将运行在 http://localhost:3000/

## 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

## 预览生产版本

```bash
npm run preview
```

## 项目结构

```
web/
├── src/
│   ├── components/common/     # 通用组件
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Layout.tsx
│   ├── pages/                  # 页面组件
│   │   ├── Login.tsx          # 登录/注册页面
│   │   ├── Home.tsx           # 学生首页
│   │   ├── Pet.tsx            # 宠物养成页面
│   │   ├── Task.tsx           # 学生任务页面
│   │   ├── Gold.tsx           # 金币系统页面
│   │   ├── BugCatch.tsx       # 捉虫游戏页面
│   │   ├── Class.tsx          # 班级管理页面
│   │   ├── Group.tsx          # 小组管理页面
│   │   ├── Statistics.tsx     # 学情分析页面
│   │   ├── Settings.tsx       # 规则配置页面
│   │   └── Profile.tsx        # 个人中心页面
│   ├── store/
│   │   └── useStore.ts        # Zustand 状态管理
│   ├── App.tsx                # 应用主组件
│   ├── main.tsx               # 应用入口
│   └── index.css              # 全局样式
├── index.html                 # HTML 模板
├── package.json               # Node.js 依赖
├── vite.config.ts             # Vite 配置
├── tailwind.config.js         # Tailwind CSS 配置
└── tsconfig.json              # TypeScript 配置
```

## 开发说明

### 状态管理

使用 Zustand 进行状态管理，支持持久化存储：

```typescript
import { useStore } from './store/useStore'

const { user, login, logout } = useStore()
```

### 路由配置

使用 React Router 进行路由管理：

```typescript
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="pet" element={<Pet />} />
    {/* 其他路由 */}
  </Route>
</Routes>
```

### 样式规范

使用 Tailwind CSS 进行样式开发，遵循以下规范：

- 使用 `glass` 类实现玻璃态效果
- 使用 `text-white-shadow` 类增强白色字体可读性
- 使用 `card-hover` 类实现卡片悬浮效果
- 使用 `btn-press` 类实现按钮点击效果

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT
