@echo off
title CICI Complete Service Status
color 0A

echo.
echo ========================================
echo      CICI Complete Service Status
echo ========================================
echo.

echo [INFO] Checking all CICI services...
echo.

REM 检查所有CICI容器
echo [CHECK] All CICI containers:
docker ps -a --filter "name=cici" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

REM 启动缺失的服务
echo [START] Ensuring all services are running...

echo Starting MongoDB...
docker compose up -d mongo

echo Starting Redis...
docker compose up -d redis

echo Starting Elasticsearch...
docker compose up -d elasticsearch

echo Starting Application Server...
docker compose up -d app

echo Starting Nginx...
docker compose up -d nginx

echo.
echo [WAIT] Waiting for services to initialize...
timeout /t 20 /nobreak >nul

echo.
echo [CHECK] Final service status:
docker compose ps

echo.
echo ========================================
echo        Service Endpoints
echo ========================================
echo  • Application API    : http://localhost:3000
echo  • File Service       : http://localhost:8080
echo  • MongoDB           : localhost:27017
echo  • Redis Cache       : localhost:6379
echo  • Elasticsearch     : http://localhost:9200
echo ========================================
echo.

echo [TEST] Quick connectivity tests...
curl -s http://localhost:3000/health >nul && echo [OK] App Server responding || echo [ERROR] App Server not responding
curl -s http://localhost:8080 >nul && echo [OK] File Service responding || echo [ERROR] File Service not responding
curl -s http://localhost:9200 >nul && echo [OK] Elasticsearch responding || echo [ERROR] Elasticsearch not responding

echo.
pause
