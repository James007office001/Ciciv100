@echo off
echo 正在启动CICI前端开发服务器...
cd /d "f:\AIPWork\C2\client\Cici"

echo 检查依赖...
if not exist "node_modules" (
    echo 安装依赖...
    npm install --legacy-peer-deps
)

echo 启动开发服务器...
npm run dev:h5

pause
