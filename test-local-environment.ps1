# C2项目本地环境测试指南

Write-Host "=== C2项目本地环境功能测试 ===" -ForegroundColor Cyan

# 1. 检查所有容器状态
Write-Host "`n📋 1. 容器状态检查:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Where-Object { $_ -like "*cici*" }

# 2. 测试主应用健康检查
Write-Host "`n🔍 2. 主应用健康检查:" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 5
    Write-Host "✅ 主应用健康状态: $($health | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ 主应用健康检查失败: $_" -ForegroundColor Red
}

# 3. 测试各个微服务
Write-Host "`n🌐 3. 微服务连接测试:" -ForegroundColor Yellow

$services = @(
    @{Name="API网关"; Port=3004; Path="/"}
    @{Name="Socket.IO"; Port=3001; Path="/"}
    @{Name="文件服务"; Port=3002; Path="/"}
    @{Name="缓存服务"; Port=3003; Path="/"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)$($service.Path)" -Method GET -TimeoutSec 3 -UseBasicParsing
        Write-Host "  ✅ $($service.Name) (端口$($service.Port)): 响应码 $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $($service.Name) (端口$($service.Port)): 连接失败" -ForegroundColor Red
    }
}

# 4. 测试数据库连接
Write-Host "`n🗄️ 4. 数据库连接测试:" -ForegroundColor Yellow

# MongoDB
try {
    $mongoTest = Test-NetConnection localhost -Port 27017 -InformationLevel Quiet
    if ($mongoTest) {
        Write-Host "  ✅ MongoDB (端口27017): 连接正常" -ForegroundColor Green
    } else {
        Write-Host "  ❌ MongoDB (端口27017): 连接失败" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ MongoDB 测试错误: $_" -ForegroundColor Red
}

# Redis
try {
    $redisTest = Test-NetConnection localhost -Port 6379 -InformationLevel Quiet
    if ($redisTest) {
        Write-Host "  ✅ Redis (端口6379): 连接正常" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Redis (端口6379): 连接失败" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Redis 测试错误: $_" -ForegroundColor Red
}

# Elasticsearch
try {
    $esTest = Test-NetConnection localhost -Port 9200 -InformationLevel Quiet
    if ($esTest) {
        Write-Host "  ✅ Elasticsearch (端口9200): 连接正常" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Elasticsearch (端口9200): 连接失败" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Elasticsearch 测试错误: $_" -ForegroundColor Red
}

# 5. 生成访问报告
Write-Host "`n📋 5. 访问信息汇总:" -ForegroundColor Yellow
Write-Host "  🌐 主应用地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  🔧 API网关地址: http://localhost:3004" -ForegroundColor Cyan
Write-Host "  💬 Socket.IO地址: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  📁 文件服务地址: http://localhost:3002" -ForegroundColor Cyan
Write-Host "  ⚡ 缓存服务地址: http://localhost:3003" -ForegroundColor Cyan
Write-Host "  🌐 Nginx代理地址: http://localhost:8080" -ForegroundColor Cyan

# 6. 资源使用情况
Write-Host "`n📊 6. 资源使用情况:" -ForegroundColor Yellow
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | Where-Object { $_ -like "*cici*" }

Write-Host "`n🎉 本地环境测试完成!" -ForegroundColor Green
Write-Host "💡 提示: 如需外网访问，可以使用 ngrok 或类似工具进行内网穿透" -ForegroundColor Yellow

Write-Host "`n=== 测试报告结束 ===" -ForegroundColor Cyan
