@echo off
chcp 65001 >nul
echo ========================================
echo CICI Docker Environment Build Script
echo ========================================

echo.
echo Step 1: Checking Docker environment...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not running
    echo [INFO] Please ensure Docker Desktop is running
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed
    pause
    exit /b 1
)

echo [SUCCESS] Docker environment is ready

echo.
echo Step 2: Cleaning up old containers and images...
echo Stopping existing containers...
docker-compose down --remove-orphans 2>nul

echo Cleaning unused images...
docker system prune -f 2>nul

echo [SUCCESS] Cleanup completed

echo.
echo Step 3: Building application image...
echo [INFO] Building CICI application image (this may take several minutes)...
docker-compose build --no-cache app

if %errorlevel% neq 0 (
    echo [ERROR] Application image build failed
    echo [INFO] Please check Dockerfile and related files
    pause
    exit /b 1
)

echo [SUCCESS] Application image build completed

echo.
echo Step 4: Pulling required external images...
echo [INFO] Pulling MongoDB image...
docker pull mongo:7.0

echo [INFO] Pulling Redis image...
docker pull redis:7.2-alpine

echo [INFO] Pulling Elasticsearch image...
docker pull elasticsearch:8.11.0

echo [INFO] Pulling Nginx image...
docker pull nginx:alpine

echo [SUCCESS] All images are ready

echo.
echo Step 5: Starting all services...
echo [INFO] Starting CICI complete service stack...
docker-compose up -d

if %errorlevel% neq 0 (
    echo [ERROR] Service startup failed
    echo [INFO] Please check logs for details
    pause
    exit /b 1
)

echo [SUCCESS] All services started successfully

echo.
echo Step 6: Waiting for service initialization...
echo [INFO] Waiting 30 seconds for all services to fully start...
timeout /t 30 /nobreak >nul

echo.
echo ========================================
echo CICI Docker Environment Build Complete!
echo ========================================
echo.
echo Service URLs:
echo   Main App: http://localhost:3000
echo   Health Check: http://localhost:3000/health
echo   API Info: http://localhost:3000/api/info
echo   File Service: http://localhost:8080
echo   MongoDB: mongodb://localhost:27017
echo   Redis: redis://localhost:6379
echo   Elasticsearch: http://localhost:9200
echo.
echo Next step: Run test-services.bat to verify all services
echo ========================================

pause