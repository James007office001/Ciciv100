@echo off
title CICI Application Services Quick Deploy
color 0B

echo.
echo ================================================
echo   CICI应用服务层快速部署脚本
echo ================================================
echo.

echo [检查] 验证Docker Desktop状态...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Docker Desktop未运行或未安装
    echo 请先启动Docker Desktop，然后重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo [OK] Docker Desktop已就绪
echo.

echo [部署] 启动应用服务层容器...
echo.

cd /d "%~dp0"
docker-compose -f docker-compose.app-services.yml up -d

if %errorlevel% neq 0 (
    echo.
    echo [错误] 部署失败，请检查Docker Desktop是否正常运行
    echo 错误排查：
    echo 1. 确保Docker Desktop已完全启动
    echo 2. 确保有足够的系统资源
    echo 3. 检查端口3001-3004是否被占用
    echo.
    pause
    exit /b 1
)

echo.
echo [等待] 等待服务完全启动...
timeout /t 15 /nobreak >nul

echo.
echo ================================================
echo   部署状态检查
echo ================================================
echo.

echo [服务] 容器状态：
docker-compose -f docker-compose.app-services.yml ps

echo.
echo [健康] 服务健康检查：
echo.

REM Socket.IO服务检查
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Socket.IO服务: 正常运行 - http://localhost:3001/health
) else (
    echo [!] Socket.IO服务: 启动中或失败 - http://localhost:3001/health
)

REM 文件服务检查  
curl -s http://localhost:3002/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 文件处理服务: 正常运行 - http://localhost:3002/health
) else (
    echo [!] 文件处理服务: 启动中或失败 - http://localhost:3002/health
)

REM 缓存服务检查
curl -s http://localhost:3003/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] 缓存管理服务: 正常运行 - http://localhost:3003/health
) else (
    echo [!] 缓存管理服务: 启动中或失败 - http://localhost:3003/health
)

REM API网关检查
curl -s http://localhost:3004/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] API网关服务: 正常运行 - http://localhost:3004/health
) else (
    echo [!] API网关服务: 启动中或失败 - http://localhost:3004/health
)

echo.
echo ================================================
echo   🎉 应用服务层部署完成！
echo ================================================
echo.

echo [服务] 已部署的应用服务：
echo  📡 Socket.IO实时通信: http://localhost:3001
echo  📁 文件处理服务: http://localhost:3002  
echo  💾 缓存管理服务: http://localhost:3003
echo  🌐 API网关服务: http://localhost:3004
echo.

echo [文档] API网关使用指南：
echo  📚 API文档: http://localhost:3004/api/docs
echo  🔍 服务发现: http://localhost:3004/api/services
echo  ⚕️ 服务健康: http://localhost:3004/api/health/[service]
echo.

echo [日志] 查看服务日志命令：
echo  docker-compose -f docker-compose.app-services.yml logs -f
echo.

echo [管理] 服务管理命令：
echo  停止: docker-compose -f docker-compose.app-services.yml down
echo  重启: docker-compose -f docker-compose.app-services.yml restart
echo  状态: docker-compose -f docker-compose.app-services.yml ps
echo.

echo 注意：确保数据访问层服务（MongoDB、Redis、Elasticsearch）也在运行
echo 以获得完整的CICI微服务架构体验！
echo.

pause
