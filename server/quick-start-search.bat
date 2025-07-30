@echo off
title Quick Start CICI Search
color 0A

echo.
echo ========================================
echo     Quick Start CICI Search Service  
echo ========================================
echo.

echo [INFO] Starting Elasticsearch with optimized settings...
echo.

REM 先停止可能存在的旧容器
echo [CLEANUP] Removing any existing search containers...
docker stop cici-search 2>nul
docker rm cici-search 2>nul

echo [START] Starting Elasticsearch 7.17.15...
docker compose up -d elasticsearch

echo.
echo [WAIT] Waiting 20 seconds for Elasticsearch to start...
timeout /t 20 /nobreak >nul

echo [CHECK] Container status:
docker ps --filter "name=cici-search"

echo.
echo [TEST] Testing connectivity...
curl -s http://localhost:9200 2>nul && echo [OK] Elasticsearch is responding || echo [WARNING] Not ready yet

echo.
echo ========================================
echo  Search Service: http://localhost:9200
echo ========================================
echo.

pause
