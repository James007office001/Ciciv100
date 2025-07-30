# Google账号登录冲突修复指南

## 🎯 问题描述

在HBuilderX环境中启动uni-app前端应用时：
- **已登录Google账号的Chrome**: 登录时显示"系统不可用，请稍后重试"
- **未登录Google账号的Chrome**: 可以正常登录

## 🔍 问题原因

1. **Cookie冲突**: Google账号登录时会设置多个cookie（SAPISID、HSID、SSID等），这些cookie可能与uni-app的请求产生冲突
2. **存储冲突**: Google相关的localStorage/sessionStorage数据可能影响uni-app的网络请求
3. **请求头冲突**: Chrome的Google登录状态可能会自动添加某些请求头，干扰uni-app的API调用

## ✅ 修复方案

### 方案1: 自动修复（推荐）

已在代码中集成自动修复机制：

#### 1.1 添加了Google冲突检测和清理工具
- 文件: `src/utils/googleConflictFix.js`
- 功能: 检测Google登录状态、清理冲突数据、修补网络请求

#### 1.2 应用启动时自动初始化
- 文件: `main.js`
- 在创建app时自动运行冲突修复

#### 1.3 登录时特殊处理
- 文件: `pages/auth/login.vue`
- 登录前检测并清理Google相关数据
- 为登录请求添加特殊请求头

### 方案2: 手动修复

#### 2.1 使用独立Chrome实例启动脚本
运行项目根目录的 `launch-chrome-clean.bat` 脚本：

```batch
# 双击运行或在命令行中执行
launch-chrome-clean.bat
```

**脚本功能**:
- 创建独立的Chrome用户数据目录
- 禁用Google同步功能
- 使用隔离的浏览器环境
- 自动打开 http://localhost:5173

#### 2.2 手动清理浏览器数据
1. 在Chrome中按 `F12` 打开开发者工具
2. 在Console中执行：
```javascript
// 清理Google相关存储
Object.keys(localStorage).forEach(key => {
  if (key.includes('google') || key.includes('gapi') || key.includes('oauth')) {
    localStorage.removeItem(key);
  }
});

// 清理sessionStorage
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('google') || key.includes('gapi') || key.includes('oauth')) {
    sessionStorage.removeItem(key);
  }
});

console.log('Google相关数据已清理');
```

#### 2.3 HBuilderX配置调整
在HBuilderX中设置启动参数：
1. 打开 `运行` -> `运行到浏览器` -> `Chrome` -> `运行配置`
2. 添加启动参数：
```
--user-data-dir="%TEMP%/hbuilderx_chrome" --disable-sync --no-default-browser-check
```

## 🧪 测试步骤

### 自动修复测试
1. 确保已更新的代码生效
2. 在已登录Google账号的Chrome中访问应用
3. 查看控制台是否有冲突检测和清理日志
4. 尝试登录，应该能正常工作

### 手动修复测试
1. 运行 `launch-chrome-clean.bat` 脚本
2. 在新开启的Chrome实例中访问 http://localhost:5173
3. 使用测试账号 `test001@cici.com` / `test123456` 登录
4. 应该能够正常登录

## 📊 修复验证

### 成功标志
- ✅ 控制台显示冲突检测日志
- ✅ 登录请求正常发送和接收
- ✅ 不再显示"系统不可用，请稍后重试"
- ✅ 成功跳转到主页面

### 调试信息
在控制台中查看以下日志：
```
=== Google账号登录冲突修复启动 ===
⚠️ 检测到Google账号登录冲突风险
✅ Google冲突数据已清理
✅ 网络请求修补完成
=== Google账号登录冲突修复完成 ===
```

## 🔧 技术细节

### 修复机制
1. **启动检测**: 应用启动时检测浏览器环境和Google登录状态
2. **数据清理**: 清除可能造成冲突的Google相关存储数据
3. **请求修补**: 为uni.request添加特殊请求头，避免冲突
4. **登录增强**: 登录前再次检测和清理，确保请求干净

### 请求头增强
```javascript
{
  'X-Uni-App': 'true',
  'X-Requested-With': 'XMLHttpRequest',
  'X-Login-Request': 'true',  // 仅登录请求
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
}
```

## 🚀 快速解决方案

**最简单的方法**:
1. 运行 `launch-chrome-clean.bat`
2. 在新打开的Chrome中进行开发和测试

**自动化方法**:
代码已集成自动修复，正常启动应用即可。

## ⚠️ 注意事项

1. **不影响主Chrome**: 修复不会影响您的主Chrome浏览器配置
2. **临时数据**: 独立Chrome实例的数据是临时的，关闭后会被清理
3. **开发专用**: 此修复主要针对开发环境，生产环境不会有此问题
4. **uni-app兼容**: 修复完全兼容uni-app框架，不影响其他功能

修复完成后，无论Chrome是否登录Google账号，都应该能够正常使用CICI应用的登录功能。
