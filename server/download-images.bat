@echo off
title Download Docker Images for CICI App & Nginx
color 0A

echo.
echo ========================================
echo    Download Required Docker Images
echo ========================================
echo.

echo [INFO] This script will attempt to download:
echo  - node:18-alpine (for CICI application)
echo  - nginx:alpine (for file storage service)
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
echo [OK] Docker Desktop is available
echo.

echo [DOWNLOAD] Attempting to download required images...
echo This may take several minutes depending on network speed.
echo.

REM 尝试下载node:18-alpine
echo [1/2] Downloading node:18-alpine...
echo Attempt 1...
docker pull node:18-alpine
if %errorlevel% equ 0 (
    echo [✓] node:18-alpine downloaded successfully
    goto download_nginx
)

echo Attempt 2...
timeout /t 5 /nobreak >nul
docker pull node:18-alpine
if %errorlevel% equ 0 (
    echo [✓] node:18-alpine downloaded successfully
    goto download_nginx
)

echo Attempt 3...
timeout /t 10 /nobreak >nul
docker pull node:18-alpine
if %errorlevel% equ 0 (
    echo [✓] node:18-alpine downloaded successfully
    goto download_nginx
)

echo [WARNING] Failed to download node:18-alpine after 3 attempts.
echo You may need to:
echo  1. Check your internet connection
echo  2. Try using a VPN
echo  3. Download manually: docker pull node:18-alpine
echo.

:download_nginx
REM 尝试下载nginx:alpine (如果还没有)
docker images nginx | findstr alpine >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] nginx:alpine already available
    goto check_images
)

echo [2/2] Downloading nginx:alpine...
echo Attempt 1...
docker pull nginx:alpine
if %errorlevel% equ 0 (
    echo [✓] nginx:alpine downloaded successfully
    goto check_images
)

echo Attempt 2...
timeout /t 5 /nobreak >nul
docker pull nginx:alpine
if %errorlevel% equ 0 (
    echo [✓] nginx:alpine downloaded successfully
    goto check_images
)

echo Attempt 3...
timeout /t 10 /nobreak >nul
docker pull nginx:alpine
if %errorlevel% equ 0 (
    echo [✓] nginx:alpine downloaded successfully
    goto check_images
)

echo [WARNING] Failed to download nginx:alpine after 3 attempts.
echo You may need to:
echo  1. Check your internet connection
echo  2. Try using a VPN
echo  3. Download manually: docker pull nginx:alpine
echo.

:check_images
echo.
echo ========================================
echo         DOWNLOAD STATUS REPORT
echo ========================================
echo.

echo [CHECK] Available Docker images:
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | findstr -E "(node|nginx|mongo|redis|elastic)"
echo.

echo [SUMMARY] Current CICI services:
docker ps --filter "name=cici" --format "table {{.Names}}\t{{.Status}}"
echo.

echo [NEXT STEPS]
if exist "docker-compose.yml" (
    echo  • If both images downloaded successfully:
    echo    Run: docker compose up -d app nginx
    echo.
    echo  • If some downloads failed:
    echo    Try downloading manually or use a VPN
    echo    Then run: docker compose up -d app nginx
) else (
    echo  • docker-compose.yml not found in current directory
    echo  • Make sure you're in the correct project folder
)

echo.
echo Press any key to exit...
pause >nul
