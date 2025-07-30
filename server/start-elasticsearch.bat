@echo off
title Start CICI Elasticsearch Service
color 0A

echo.
echo ========================================
echo    Starting CICI Elasticsearch Service
echo ========================================
echo.

echo [INFO] Starting Elasticsearch search service...
echo.

REM 检查Docker状态
echo [CHECK] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    pause
    exit /b 1
)
echo [OK] Docker is available
echo.

REM 启动Elasticsearch
echo [START] Starting Elasticsearch container...
docker compose up -d elasticsearch

echo.
echo [CHECK] Waiting for Elasticsearch to start...
timeout /t 15 /nobreak >nul

REM 检查容器状态
echo [INFO] Container status:
docker ps --filter "name=cici-search"

echo.
echo [TEST] Testing Elasticsearch connection...
curl -f http://localhost:9200 2>nul && echo [OK] Elasticsearch is responding || echo [WARNING] Elasticsearch not ready yet

echo.
echo ========================================
echo  Elasticsearch Service Status
echo ========================================
echo  • Search Service: http://localhost:9200
echo  • Container Name: cici-search
echo  • Health Check: http://localhost:9200/_cluster/health
echo ========================================
echo.

pause
