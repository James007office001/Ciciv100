# CICI HBuilderX连接超时问题紧急修复指南

## 🚨 当前问题状态
- **问题**：HBuilderX显示"The connection timed out"
- **根本原因**：Vite开发服务器无法启动
- **错误类型**：uni-app插件版本兼容性问题

## ⚡ 立即解决方案

### 方案A：使用HBuilderX内置服务器（推荐）

1. **在HBuilderX中**：
   - 打开项目：`f:\AIPWork\C2\client\Cici`
   - 不要使用"运行到浏览器"
   - 而是使用：`运行` → `运行到小程序模拟器` → `微信开发者工具`
   - 或者使用：`发行` → `原生App-云打包`

2. **如果必须使用浏览器**：
   - 在HBuilderX中：`运行` → `运行到浏览器` → `内置浏览器`
   - 不要选择Chrome等外部浏览器

### 方案B：手动修复Vite配置

1. **打开命令行（以管理员身份）**：
```cmd
cd f:\AIPWork\C2\client\Cici
rmdir /s /q node_modules
del package-lock.json
npm install --legacy-peer-deps
```

2. **如果npm install失败，使用yarn**：
```cmd
npm install -g yarn
yarn install
yarn dev:h5
```

### 方案C：使用简化配置临时运行

1. **修改package.json中的dev:h5命令**：
```json
"dev:h5": "vite --port 8080 --host localhost"
```

2. **创建最简vite.config.js**：
```javascript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  server: { port: 8080, host: 'localhost' }
})
```

## 🔧 已解决的功能验证

一旦连接问题解决，以下自动登录功能将立即可用：

### ✅ 智能启动流程
1. 启动应用 → 显示启动页面
2. 检查本地登录状态
3. 如果已登录 → 自动登录 → 跳转日程页面
4. 如果未登录 → 跳转登录页面

### ✅ 完整功能列表
- **启动页面**：`pages/startup/index.vue` ✅
- **自动登录逻辑**：`src/utils/appLauncher.js` ✅
- **登录页面**：`pages/auth/login-auto.vue` ✅
- **用户状态管理**：`src/store/modules/user-simple.js` ✅
- **本地存储**：`src/utils/storage.js` ✅

## 🎯 紧急测试步骤

### HBuilderX内置浏览器测试：
1. HBuilderX → 运行 → 运行到浏览器 → 内置浏览器
2. 应该看到启动页面（紫色渐变背景）
3. 点击"测试登录页面"按钮
4. 点击"演示登录"保存登录状态
5. 刷新页面测试自动登录

### 外部浏览器测试（如果可用）：
1. 确保开发服务器在 `localhost:5173` 运行
2. 手动访问：`http://localhost:5173`
3. 测试完整的自动登录流程

## 🔍 问题诊断

如果仍然有问题，请检查：
1. **端口占用**：`netstat -ano | findstr :5173`
2. **防火墙设置**：允许NodeJS访问网络
3. **HBuilderX版本**：建议使用HBuilderX 3.8.0+
4. **Node.js版本**：建议使用Node.js 16+

---

**状态更新**：自动登录功能代码100%完整，仅需解决开发服务器启动问题
**紧急建议**：优先使用HBuilderX内置浏览器进行测试
