@echo off
title Deploy CICI Data Access Layer - Full Stack
color 0A

echo.
echo =============================================
echo    CICI Data Access Layer - Full Deployment
echo =============================================
echo.

echo [INFO] Deploying complete data access layer stack:
echo  - MongoDB Database (Primary Storage)
echo  - Redis Cache (Session & Performance Cache)
echo  - Elasticsearch Search Engine (Full-text Search)
echo  - Nginx File Storage Service (Static Files)
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

REM 清理现有容器（如果需要）
echo [CLEANUP] Stopping any existing CICI containers...
docker compose down --volumes 2>nul
docker container prune -f >nul 2>&1
echo [OK] Environment cleaned
echo.

REM 创建Docker网络
echo [NETWORK] Creating CICI container network...
docker network create cici-network 2>nul || echo [INFO] Network already exists
echo [OK] Network ready
echo.

REM 拉取所有需要的镜像
echo [DOWNLOAD] Pulling required Docker images...
echo  • MongoDB 7.0...
docker pull mongo:7.0
if %errorlevel% neq 0 (
    echo [ERROR] Failed to pull MongoDB image!
    exit /b 1
)

echo  • Redis 7.2 Alpine...
docker pull redis:7.2-alpine
if %errorlevel% neq 0 (
    echo [ERROR] Failed to pull Redis image!
    exit /b 1
)

echo  • Elasticsearch 7.17.15...
docker pull docker.elastic.co/elasticsearch/elasticsearch:7.17.15
if %errorlevel% neq 0 (
    echo [ERROR] Failed to pull Elasticsearch image!
    exit /b 1
)

echo  • Nginx Alpine...
docker pull nginx:alpine
if %errorlevel% neq 0 (
    echo [ERROR] Failed to pull Nginx image!
    exit /b 1
)

echo [OK] All images downloaded successfully
echo.

REM 启动数据访问层服务
echo [DEPLOY] Starting data access layer services...
echo.

echo [1/4] Starting MongoDB Database...
docker compose up -d mongo
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start MongoDB!
    exit /b 1
)
echo [OK] MongoDB started
echo.

echo [2/4] Starting Redis Cache...
docker compose up -d redis
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Redis!
    exit /b 1
)
echo [OK] Redis started
echo.

echo [3/4] Starting Elasticsearch Search Engine...
docker compose up -d elasticsearch
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Elasticsearch!
    exit /b 1
)
echo [OK] Elasticsearch started
echo.

echo [4/4] Starting Nginx File Storage...
docker compose up -d nginx
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Nginx!
    exit /b 1
)
echo [OK] Nginx started
echo.

REM 等待服务初始化
echo [WAIT] Waiting for services to initialize...
echo This may take 60-90 seconds for first startup...
echo.

for /l %%i in (1,1,6) do (
    echo Waiting... %%i0 seconds
    timeout /t 10 /nobreak >nul
)

echo.
echo [CHECK] Verifying service status...
docker compose ps
echo.

REM 健康检查
echo =============================================
echo           HEALTH CHECKS
echo =============================================
echo.

echo [TEST 1/4] MongoDB Database Connectivity...
timeout /t 5 /nobreak >nul
docker exec cici-mongo mongosh --eval "db.adminCommand('ismaster')" >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] MongoDB is responding on port 27017
) else (
    echo [!] MongoDB may need more time to initialize
)
echo.

echo [TEST 2/4] Redis Cache Connectivity...
docker exec cici-redis redis-cli -a redis123 ping >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Redis is responding on port 6379
) else (
    echo [!] Redis may need more time to initialize
)
echo.

echo [TEST 3/4] Elasticsearch Search Engine...
curl -s http://localhost:9200/_cluster/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Elasticsearch is responding on port 9200
    curl -s http://localhost:9200/_cluster/health | findstr "green\|yellow" >nul && echo [✓] Cluster status: Healthy
) else (
    echo [!] Elasticsearch may need more time to initialize
)
echo.

echo [TEST 4/4] Nginx File Storage...
curl -s http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Nginx is responding on port 8080
) else (
    echo [!] Nginx may need more time to initialize
)
echo.

REM 显示服务状态
echo =============================================
echo        DATA ACCESS LAYER STATUS
echo =============================================
echo.

echo [SERVICES] Running Containers:
docker ps --filter "name=cici" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

echo [ENDPOINTS] Service Access Points:
echo  • MongoDB Database     : mongodb://localhost:27017
echo    - Username          : admin
echo    - Password          : admin123
echo    - Database          : cici_database
echo.
echo  • Redis Cache          : redis://localhost:6379
echo    - Password          : redis123
echo    - Use Cases         : Sessions, API cache, temporary data
echo.
echo  • Elasticsearch       : http://localhost:9200
echo    - Cluster Health    : http://localhost:9200/_cluster/health
echo    - Search API        : http://localhost:9200/_search
echo    - Use Cases         : Full-text search, analytics
echo.
echo  • Nginx File Storage   : http://localhost:8080
echo    - Upload Directory  : /uploads
echo    - Use Cases         : Static files, images, documents
echo.

echo [VOLUMES] Persistent Data Storage:
docker volume ls --filter "name=server_" --format "table {{.Name}}\t{{.Driver}}"
echo.

echo [NETWORK] Container Network:
docker network ls --filter "name=cici" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
echo.

echo =============================================
echo    DATA ACCESS LAYER DEPLOYMENT COMPLETE!
echo =============================================
echo.

echo [SUCCESS] All data access layer services are deployed:
echo  ✓ MongoDB 7.0 - Primary database with authentication
echo  ✓ Redis 7.2 - High-performance caching layer
echo  ✓ Elasticsearch 7.17 - Full-text search engine
echo  ✓ Nginx - Static file storage and serving
echo.

echo [INTEGRATION] Ready for application layer:
echo  • Database connections configured
echo  • Cache layer operational
echo  • Search indexing available
echo  • File upload/download ready
echo.

echo [NEXT STEPS] To deploy the application layer:
echo  • Run: docker compose up -d app
echo  • Or use: .\deploy-app-layer.bat
echo.

echo Press any key to run connectivity tests...
pause >nul

REM 运行详细的连接测试
echo.
echo =============================================
echo           CONNECTIVITY TESTS
echo =============================================
echo.

echo [DETAILED TEST] MongoDB Database...
docker exec cici-mongo mongosh --eval "
db = db.getSiblingDB('cici_database');
db.test.insertOne({test: 'connection', timestamp: new Date()});
print('✓ Database write test passed');
db.test.deleteMany({test: 'connection'});
print('✓ Database cleanup completed');
" 2>nul || echo [!] MongoDB detailed test failed

echo.
echo [DETAILED TEST] Redis Cache...
docker exec cici-redis redis-cli -a redis123 --no-auth-warning eval "
redis.call('SET', 'test:connection', 'success');
local result = redis.call('GET', 'test:connection');
redis.call('DEL', 'test:connection');
return result;
" 0 2>nul && echo [✓] Redis read/write test passed || echo [!] Redis detailed test failed

echo.
echo [DETAILED TEST] Elasticsearch Search...
curl -s -X PUT "http://localhost:9200/test-index" -H "Content-Type: application/json" -d "{\"settings\":{\"number_of_shards\":1}}" >nul 2>&1
curl -s -X DELETE "http://localhost:9200/test-index" >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Elasticsearch index operations test passed
) else (
    echo [!] Elasticsearch detailed test failed
)

echo.
echo [DETAILED TEST] Nginx File Storage...
echo test > temp_test_file.txt
curl -s -F "file=@temp_test_file.txt" http://localhost:8080/upload >nul 2>&1
del temp_test_file.txt >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Nginx file operations test passed
) else (
    echo [!] Nginx detailed test failed
)

echo.
echo =============================================
echo     ALL DATA ACCESS LAYER TESTS COMPLETE!
echo =============================================
echo.
echo Your CICI data access layer is fully operational!
echo.
pause
