@echo off
echo 正在修复Vite开发服务器兼容性问题...
echo.

cd /d "%~dp0"

echo 1. 清理旧的依赖...
if exist node_modules (
    echo 删除 node_modules 目录...
    rmdir /s /q node_modules
)

if exist package-lock.json (
    echo 删除 package-lock.json...
    del package-lock.json
)

echo.
echo 2. 安装兼容版本的依赖...
npm install --legacy-peer-deps

echo.
echo 3. 尝试启动开发服务器...
echo 如果启动失败，请尝试以下命令之一：
echo   npm run dev:h5-simple
echo   npm run dev:h5
echo.

echo 修复完成！
pause
