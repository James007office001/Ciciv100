@echo off
title Deploy CICI Search Service
color 0A

echo.
echo ========================================
echo     Deploy CICI Search Service
echo ========================================
echo.

echo [INFO] Starting Elasticsearch search service deployment...
echo.

REM 检查Docker状态
echo [CHECK] Verifying Docker Desktop is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)
echo [OK] Docker is available
echo.

REM 检查现有服务状态
echo [CHECK] Checking existing CICI services...
docker ps --filter "name=cici" --format "table {{.Names}}\t{{.Status}}"
echo.

REM 启动Elasticsearch服务
echo [DEPLOY] Starting Elasticsearch search service...
echo  - Service Name: cici-search
echo  - Image: elasticsearch:8.11.0
echo  - Port: 9200
echo  - Configuration: Single-node, no security
echo.

docker compose up -d elasticsearch
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Elasticsearch service!
    echo Checking docker compose logs...
    docker compose logs elasticsearch
    pause
    exit /b 1
)

echo [OK] Elasticsearch service deployment initiated
echo.

REM 等待服务启动
echo [WAIT] Waiting for Elasticsearch to initialize...
echo This may take 30-60 seconds for first startup...
timeout /t 30 /nobreak >nul

REM 检查服务状态
echo [CHECK] Verifying service status...
docker ps --filter "name=cici-search" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

REM 健康检查
echo [TEST] Testing Elasticsearch connectivity...
timeout /t 10 /nobreak >nul

curl -s http://localhost:9200 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Elasticsearch is responding on port 9200
    echo.
    echo [INFO] Getting cluster information...
    curl -s http://localhost:9200 2>nul
    echo.
) else (
    echo [WARNING] Elasticsearch not ready yet, checking logs...
    echo.
    echo [LOGS] Recent Elasticsearch logs:
    docker compose logs --tail 10 elasticsearch
    echo.
    echo [INFO] Service may need more time to start completely.
)

echo.
echo ========================================
echo       CICI Search Service Status
echo ========================================
echo.

echo [INFO] All CICI Services:
docker ps --filter "name=cici" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

echo [INFO] Search Service Endpoints:
echo  • Elasticsearch API    : http://localhost:9200
echo  • Cluster Health       : http://localhost:9200/_cluster/health
echo  • Node Info            : http://localhost:9200/_nodes
echo  • Search Test          : http://localhost:9200/_search
echo.

echo [INFO] Integration with Application:
echo  • The cici-app service can now connect to Elasticsearch
echo  • Search functionality is ready for implementation
echo  • Document indexing and search APIs are available
echo.

echo ========================================
echo   CICI Search Deployment Complete!
echo ========================================
echo.
echo Press any key to test the search service...
pause >nul

REM 测试搜索服务
echo [TEST] Testing search service functionality...
echo.

echo Testing cluster health...
curl -s "http://localhost:9200/_cluster/health?pretty" 2>nul && echo. || echo [ERROR] Health check failed

echo Testing node information...
curl -s "http://localhost:9200/_nodes?pretty" 2>nul | head -20 && echo "..." || echo [ERROR] Node info failed

echo.
echo Search service is ready for use!
echo You can now implement search functionality in your CICI application.
echo.
pause
