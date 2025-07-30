# CICI - 综合社交活动平台

## 项目介绍

CICI 是一个集成日程管理、社交互动、活动发现、内容发布等功能的综合性社交活动平台。采用 iOS 26 无色毛玻璃视觉语言设计，提供现代化、直观的用户体验。

## 核心功能

### 📅 日程管理
- 个人日程规划和管理
- 智能提醒和通知
- 日历视图和任务列表
- 与活动的无缝集成

### 🔍 发现模块
- 个性化活动推荐
- 地理位置相关内容
- 用户兴趣匹配
- 热门话题和趋势

### 💬 社交互动
- 实时聊天和群组
- 好友关系管理
- 动态发布和分享
- 评论和点赞系统

### 🎯 活动系统
- 活动创建和管理
- 报名和签到功能
- 活动评价和反馈
- 票务和支付集成

## 技术架构

### 前端技术栈
- **框架**: uni-app + Vue 3
- **状态管理**: Pinia
- **样式**: SCSS + CSS Variables
- **UI 设计**: iOS 26 无色毛玻璃风格
- **平台支持**: 微信小程序、H5、App

### 后端技术栈
- **服务端**: Node.js + Express/Koa
- **数据库**: MongoDB (主) + Redis (缓存)
- **实时通信**: Socket.io
- **认证**: JWT + OAuth
- **文件存储**: 阿里云 OSS

### 设计系统

#### 毛玻璃效果
采用 `backdrop-filter` 和 CSS Variables 实现一致的毛玻璃视觉效果：
- 透明度控制
- 模糊背景
- 边框和高光
- 响应式适配

#### 色彩系统
- **主色调**: 动态主题色
- **辅助色**: 语义化色彩
- **文本色**: 层次化灰度
- **背景色**: 渐变和透明

#### 动画效果
- **过渡动画**: 统一的缓动函数
- **交互反馈**: 触觉和视觉反馈
- **加载状态**: 骨架屏和加载动画
- **页面转场**: 流畅的导航体验

## 项目结构

```
client/Cici/
├── pages/                  # 页面文件
│   ├── schedule/           # 日程模块
│   ├── discover/           # 发现模块
│   ├── message/            # 消息模块
│   └── profile/            # 个人中心
├── src/
│   ├── api/                # API 接口
│   ├── components/         # 组件库
│   │   └── common/         # 通用组件
│   ├── store/              # 状态管理
│   │   └── modules/        # Store 模块
│   └── utils/              # 工具函数
├── static/                 # 静态资源
├── uni_modules/            # uni-app 组件
├── App.vue                 # 应用入口
├── main.js                 # 主文件
├── pages.json              # 页面配置
└── uni.scss               # 全局样式
```

## 开发指南

### 环境要求
- HBuilderX 3.8.0+
- Node.js 16.0+
- 微信开发者工具 (小程序开发)

### 快速开始

1. **克隆项目**
```bash
git clone [repository-url]
cd C2/client/Cici
```

2. **安装依赖**
```bash
npm install
```

3. **运行项目**
- 微信小程序: HBuilderX -> 运行 -> 运行到小程序模拟器
- H5: HBuilderX -> 运行 -> 运行到浏览器
- App: HBuilderX -> 运行 -> 运行到手机或模拟器

### 开发规范

#### 组件开发
- 使用 Vue 3 Composition API
- 统一的命名规范 (PascalCase)
- 完整的 props 定义和类型检查
- 必要的事件定义和文档注释

#### 样式规范
- 使用 CSS Variables 确保主题一致性
- SCSS 嵌套层级不超过 3 层
- 统一使用设计系统中的间距和颜色
- 响应式设计适配不同屏幕尺寸

#### 状态管理
- 模块化的 Store 设计
- 持久化重要用户数据
- 异步操作的错误处理
- 合理的缓存策略

## 组件库

### 基础组件
- **CustomNavbar**: 自定义导航栏
- **CustomTabbar**: 底部标签栏
- **GlassCard**: 毛玻璃卡片
- **GlassButton**: 毛玻璃按钮

### 业务组件
- **ActivityCard**: 活动卡片
- **UserProfile**: 用户资料
- **ChatBubble**: 聊天气泡
- **CalendarView**: 日历视图

## API 接口

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/profile` - 获取用户信息

### 活动相关
- `GET /api/activities` - 获取活动列表
- `POST /api/activities` - 创建活动
- `GET /api/activities/:id` - 获取活动详情
- `POST /api/activities/:id/join` - 参加活动

### 社交相关
- `GET /api/users/recommendations` - 推荐用户
- `POST /api/users/:id/follow` - 关注用户
- `GET /api/posts` - 获取动态
- `POST /api/posts` - 发布动态

## 部署说明

### 小程序发布
1. 在 HBuilderX 中配置小程序 AppID
2. 运行到微信小程序开发者工具
3. 上传代码并提交审核

### H5 部署
1. 运行 `npm run build:h5`
2. 将 `dist/build/h5` 目录部署到服务器
3. 配置域名和 HTTPS

### App 打包
1. 在 HBuilderX 中配置证书
2. 云端打包或本地打包
3. 发布到应用商店

## 更新日志

### v1.0.0 (2024-01-xx)
- 🎉 项目初始化
- ✨ 实现核心 UI 组件
- ✨ 完成日程和发现模块
- 🎨 应用 iOS 26 设计语言
- 📱 支持多平台部署

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 联系我们

- 项目主页: [GitHub Repository]
- 问题反馈: [Issues]
- 邮箱: contact@cici.app

---

**CICI** - 让每一次相聚都充满意义 ✨
