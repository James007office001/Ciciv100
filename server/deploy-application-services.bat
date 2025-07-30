@echo off
title Deploy CICI Application Services
color 0A

echo.
echo =============================================
echo      CICI Application Services Deployment
echo =============================================
echo.

echo [INFO] Deploying specialized application layer services:
echo  - Socket.IO Real-time Communication Server (port 3001)
echo  - File Processing Service (port 3002) 
echo  - Cache Management Service (port 3003)
echo  - API Gateway Service (port 3004)
echo.

REM 检查Docker状态
echo [CHECK] Verifying Docker Desktop is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    pause
    exit /b 1
)
echo [OK] Docker Desktop is available
echo.

REM 检查现有服务
echo [CHECK] Current CICI services status...
docker ps --filter "name=cici" --format "table {{.Names}}\t{{.Status}}"
echo.

REM 检查必需镜像
echo [CHECK] Verifying required images...
docker images node:18-alpine >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] node:18-alpine image not found!
    echo Please run: docker pull node:18-alpine
    pause
    exit /b 1
)
echo [OK] node:18-alpine image available
echo.

echo [DEPLOY] Starting application layer services...
echo.

REM 启动Socket.IO服务
echo [1/4] Starting Socket.IO Real-time Server...
docker run -d ^
  --name cici-socketio ^
  --network server_cici-network ^
  -p 3001:3001 ^
  -e NODE_ENV=development ^
  -e REDIS_HOST=redis ^
  -e REDIS_PORT=6379 ^
  -e REDIS_PASSWORD=redis123 ^
  node:18-alpine ^
  sh -c "npm init -y && npm install socket.io express redis ioredis && node -e \"const express=require('express');const http=require('http');const socketIo=require('socket.io');const app=express();const server=http.createServer(app);const io=socketIo(server,{cors:{origin:'*'}});io.on('connection',(socket)=>{console.log('Client connected:',socket.id);socket.on('join-room',(room)=>{socket.join(room);console.log('Client joined room:',room);});socket.on('message',(data)=>{io.to(data.room).emit('message',data);});socket.on('disconnect',()=>{console.log('Client disconnected:',socket.id);});});server.listen(3001,()=>{console.log('Socket.IO server running on port 3001');});\""

timeout /t 3 /nobreak >nul
docker ps --filter "name=cici-socketio" --format "{{.Names}}" | findstr cici-socketio >nul
if %errorlevel% equ 0 (
    echo [✓] Socket.IO server started
) else (
    echo [!] Socket.IO server failed to start
)
echo.

REM 启动文件处理服务
echo [2/4] Starting File Processing Service...
docker run -d ^
  --name cici-fileservice ^
  --network server_cici-network ^
  -p 3002:3002 ^
  -v "%cd%/uploads:/app/uploads" ^
  -v "%cd%/temp:/app/temp" ^
  node:18-alpine ^
  sh -c "npm init -y && npm install express multer && node -e \"const express=require('express');const multer=require('multer');const app=express();const storage=multer.diskStorage({destination:'/app/uploads/',filename:(req,file,cb)=>{cb(null,Date.now()+'-'+file.originalname);}});const upload=multer({storage});app.use('/uploads',express.static('/app/uploads'));app.post('/upload',upload.single('file'),(req,res)=>{res.json({success:true,filename:req.file.filename,path:'/uploads/'+req.file.filename});});app.get('/health',(req,res)=>{res.json({status:'healthy',service:'file-processor'});});app.listen(3002,()=>{console.log('File service running on port 3002');});\""

timeout /t 3 /nobreak >nul
docker ps --filter "name=cici-fileservice" --format "{{.Names}}" | findstr cici-fileservice >nul
if %errorlevel% equ 0 (
    echo [✓] File processing service started
) else (
    echo [!] File processing service failed to start
)
echo.

REM 启动缓存管理服务
echo [3/4] Starting Cache Management Service...
docker run -d ^
  --name cici-cacheservice ^
  --network server_cici-network ^
  -p 3003:3003 ^
  -e REDIS_HOST=redis ^
  -e REDIS_PORT=6379 ^
  -e REDIS_PASSWORD=redis123 ^
  node:18-alpine ^
  sh -c "npm init -y && npm install express ioredis && node -e \"const express=require('express');const Redis=require('ioredis');const app=express();app.use(express.json());const redis=new Redis({host:'redis',port:6379,password:'redis123'});app.get('/cache/:key',async(req,res)=>{try{const value=await redis.get(req.params.key);res.json({key:req.params.key,value});}catch(error){res.status(500).json({error:error.message});}});app.post('/cache/:key',async(req,res)=>{try{await redis.set(req.params.key,JSON.stringify(req.body.value));res.json({success:true,key:req.params.key});}catch(error){res.status(500).json({error:error.message});}});app.get('/health',(req,res)=>{res.json({status:'healthy',service:'cache-manager'});});app.listen(3003,()=>{console.log('Cache service running on port 3003');});\""

timeout /t 3 /nobreak >nul
docker ps --filter "name=cici-cacheservice" --format "{{.Names}}" | findstr cici-cacheservice >nul
if %errorlevel% equ 0 (
    echo [✓] Cache management service started
) else (
    echo [!] Cache management service failed to start
)
echo.

REM 启动API网关
echo [4/4] Starting API Gateway Service...
docker run -d ^
  --name cici-gateway ^
  --network server_cici-network ^
  -p 3004:3004 ^
  node:18-alpine ^
  sh -c "npm init -y && npm install express http-proxy-middleware cors && node -e \"const express=require('express');const{createProxyMiddleware}=require('http-proxy-middleware');const cors=require('cors');const app=express();app.use(cors());app.use(express.json());app.use('/api',createProxyMiddleware({target:'http://cici-app:3000',changeOrigin:true}));app.use('/socket',createProxyMiddleware({target:'http://cici-socketio:3001',changeOrigin:true,ws:true}));app.use('/files',createProxyMiddleware({target:'http://cici-fileservice:3002',changeOrigin:true}));app.use('/cache',createProxyMiddleware({target:'http://cici-cacheservice:3003',changeOrigin:true}));app.get('/health',(req,res)=>{res.json({status:'healthy',service:'api-gateway',routes:['/api','/socket','/files','/cache']});});app.listen(3004,()=>{console.log('API Gateway running on port 3004');});\""

timeout /t 3 /nobreak >nul
docker ps --filter "name=cici-gateway" --format "{{.Names}}" | findstr cici-gateway >nul
if %errorlevel% equ 0 (
    echo [✓] API Gateway service started
) else (
    echo [!] API Gateway service failed to start
)
echo.

echo [WAIT] Waiting for services to fully initialize...
timeout /t 10 /nobreak >nul

echo.
echo =============================================
echo         APPLICATION LAYER STATUS
echo =============================================
echo.

echo [SERVICES] All CICI Services:
docker ps --filter "name=cici" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

echo [ENDPOINTS] Application Layer:
echo  • Main CICI App        : http://localhost:3000
echo  • Socket.IO Server     : http://localhost:3001  
echo  • File Processing      : http://localhost:3002
echo  • Cache Management     : http://localhost:3003
echo  • API Gateway          : http://localhost:3004
echo.

echo [HEALTH CHECKS] Testing services...
curl -s http://localhost:3002/health >nul 2>&1 && echo [✓] File Service: Healthy || echo [!] File Service: Not ready
curl -s http://localhost:3003/health >nul 2>&1 && echo [✓] Cache Service: Healthy || echo [!] Cache Service: Not ready  
curl -s http://localhost:3004/health >nul 2>&1 && echo [✓] API Gateway: Healthy || echo [!] API Gateway: Not ready

echo.
echo =============================================
echo    APPLICATION LAYER DEPLOYMENT COMPLETE!
echo =============================================
echo.

echo [SUCCESS] Deployed application services:
echo  ✓ Socket.IO Real-time Communication
echo  ✓ File Processing & Upload Service
echo  ✓ Cache Management Layer
echo  ✓ API Gateway & Service Orchestration
echo.

echo [TOTAL] Complete CICI Architecture:
echo  📱 Application Layer: 5 services
echo  💾 Data Access Layer: 4 services  
echo  🔗 Total: 9 microservices
echo.

pause
