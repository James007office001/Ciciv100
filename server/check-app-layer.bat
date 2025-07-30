@echo off
title CICI Application Layer Status Check
color 0A

echo.
echo ========================================
echo    CICI Application Layer Status Check
echo ========================================
echo.

echo [INFO] Checking Application Layer services...
echo.

REM 检查容器状态
echo [CHECK] Container Status:
docker ps --filter "name=cici-app" --filter "name=cici-redis" --filter "name=cici-nginx" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

REM 检查端口
echo [CHECK] Port Status:
netstat -an | findstr ":3000 " >nul && echo [OK] Port 3000 (App Server) is listening || echo [WARNING] Port 3000 not listening
netstat -an | findstr ":6379 " >nul && echo [OK] Port 6379 (Redis) is listening || echo [WARNING] Port 6379 not listening  
netstat -an | findstr ":8080 " >nul && echo [OK] Port 8080 (Nginx) is listening || echo [WARNING] Port 8080 not listening
echo.

REM 健康检查
echo [CHECK] Service Health Checks:

echo Testing Express Server...
curl -s -f http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Express Server is healthy
) else (
    echo [ERROR] Express Server health check failed
)

echo Testing Socket.IO...
curl -s -f http://localhost:3000/api/socket/stats >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Socket.IO Server is healthy
) else (
    echo [ERROR] Socket.IO Server health check failed
)

echo Testing File Service...
curl -s -f http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] File Service is healthy
) else (
    echo [ERROR] File Service health check failed
)

echo Testing Redis Cache...
docker exec cici-app node -e "
const redis = require('redis');
const client = redis.createClient({url: 'redis://redis:6379', password: 'redis123'});
client.connect().then(() => {
  console.log('Redis OK');
  client.disconnect();
}).catch(() => process.exit(1));
" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Redis Cache is healthy
) else (
    echo [ERROR] Redis Cache health check failed
)

echo.
echo ========================================
echo      Application Layer Summary
echo ========================================
echo.
echo Available Services:
echo  • Express API Server    : http://localhost:3000
echo  • Socket.IO WebSocket   : ws://localhost:3000
echo  • File Upload Service   : http://localhost:8080
echo  • Redis Cache           : localhost:6379
echo.
echo Key Endpoints:
echo  • Health Check          : http://localhost:3000/health
echo  • API Information       : http://localhost:3000/api/info
echo  • Socket Test           : http://localhost:3000/api/socket/test
echo  • Cache Test            : http://localhost:3000/api/cache/test/ping
echo.
echo Application Layer Features:
echo  ✓ Node.js Express Server with RESTful APIs
echo  ✓ Socket.IO Real-time Communication
echo  ✓ Multer File Upload Service
echo  ✓ Redis Caching Layer
echo  ✓ JWT Authentication System
echo  ✓ Request Rate Limiting
echo  ✓ Comprehensive Logging with Winston/Morgan
echo  ✓ CORS and Security Headers
echo  ✓ Request Compression
echo  ✓ Health Monitoring
echo.
pause
