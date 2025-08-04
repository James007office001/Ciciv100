# AWS ECS 容器状态检查脚本
param(
    [string]$ClusterName = "c2-cluster",
    [string]$Region = "us-east-1"
)

# 设置AWS环境变量
$env:AWS_DEFAULT_REGION = $Region
$env:AWS_DEFAULT_OUTPUT = "json"

Write-Host "🚀 检查AWS ECS容器状态..." -ForegroundColor Cyan

try {
    # 1. 检查集群状态
    Write-Host "`n📋 检查集群 $ClusterName..."
    $clusterResult = aws ecs describe-clusters --clusters $ClusterName --region $Region 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 无法访问集群 $ClusterName" -ForegroundColor Red
        exit 1
    }
    
    $cluster = ($clusterResult | ConvertFrom-Json).clusters[0]
    Write-Host "✅ 集群状态: $($cluster.status)" -ForegroundColor Green
    Write-Host "   运行任务数: $($cluster.runningTasksCount)"
    Write-Host "   待处理任务数: $($cluster.pendingTasksCount)"
    
    # 2. 获取任务列表
    Write-Host "`n📦 获取任务列表..."
    $tasksResult = aws ecs list-tasks --cluster $ClusterName --region $Region 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 无法获取任务列表" -ForegroundColor Red
        exit 1
    }
    
    $tasks = ($tasksResult | ConvertFrom-Json).taskArns
    if ($tasks.Count -eq 0) {
        Write-Host "❌ 集群中没有找到任何任务" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ 找到 $($tasks.Count) 个任务"
    
    # 3. 获取任务详细信息
    Write-Host "`n🔍 获取任务详细信息..."
    $taskDetailsResult = aws ecs describe-tasks --cluster $ClusterName --tasks $tasks --region $Region 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 无法获取任务详细信息" -ForegroundColor Red
        exit 1
    }
    
    $taskDetails = ($taskDetailsResult | ConvertFrom-Json).tasks
    
    foreach ($task in $taskDetails) {
        Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        $taskId = $task.taskArn.Split('/')[-1]
        Write-Host "📋 任务ID: $taskId"
        Write-Host "📦 任务定义: $($task.taskDefinitionArn.Split('/')[-1])"
        
        $statusColor = if ($task.lastStatus -eq "RUNNING") { "Green" } else { "Yellow" }
        Write-Host "🎯 任务状态: $($task.lastStatus)" -ForegroundColor $statusColor
        Write-Host "💡 期望状态: $($task.desiredStatus)"
        
        if ($task.createdAt) {
            Write-Host "⏰ 创建时间: $($task.createdAt)"
        }
        if ($task.startedAt) {
            Write-Host "🏁 启动时间: $($task.startedAt)"
        }
        
        if ($task.lastStatus -eq "RUNNING") {
            Write-Host "✅ 任务正在运行!" -ForegroundColor Green
            
            # 尝试获取网络信息
            if ($task.attachments) {
                foreach ($attachment in $task.attachments) {
                    if ($attachment.type -eq "ElasticNetworkInterface") {
                        foreach ($detail in $attachment.details) {
                            if ($detail.name -eq "networkInterfaceId") {
                                $eniId = $detail.value
                                Write-Host "🌐 网络接口ID: $eniId"
                                
                                # 获取网络接口信息
                                $eniResult = aws ec2 describe-network-interfaces --network-interface-ids $eniId --region $Region 2>$null
                                if ($LASTEXITCODE -eq 0) {
                                    $eni = ($eniResult | ConvertFrom-Json).NetworkInterfaces[0]
                                    
                                    if ($eni.Association.PublicIp) {
                                        $publicIp = $eni.Association.PublicIp
                                        Write-Host "🌍 公网IP: $publicIp" -ForegroundColor Green
                                        
                                        # 测试健康端点
                                        Write-Host "`n🏥 测试应用健康端点..."
                                        $healthUrl = "http://$publicIp:3000/health"
                                        Write-Host "📡 请求URL: $healthUrl"
                                        
                                        try {
                                            $response = Invoke-RestMethod -Uri $healthUrl -Method GET -TimeoutSec 15 -ErrorAction Stop
                                            Write-Host "✅ 健康检查成功!" -ForegroundColor Green
                                            Write-Host "📊 响应数据:" -ForegroundColor Green
                                            $response | ConvertTo-Json | Write-Host -ForegroundColor Green
                                            
                                            Write-Host "`n🎯 验证完成: 应用成功运行在AWS ECS上!" -ForegroundColor Green
                                            Write-Host "🌐 访问地址: http://$publicIp:3000" -ForegroundColor Cyan
                                            Write-Host "🏥 健康检查: http://$publicIp:3000/health" -ForegroundColor Cyan
                                            
                                        } catch {
                                            Write-Host "⚠️ 健康检查失败: $($_.Exception.Message)" -ForegroundColor Yellow
                                            Write-Host "💡 可能原因: 应用仍在启动中或端口未开放" -ForegroundColor Yellow
                                        }
                                    } else {
                                        Write-Host "❌ 未分配公网IP" -ForegroundColor Red
                                    }
                                } else {
                                    Write-Host "⚠️ 无法获取网络接口信息" -ForegroundColor Yellow
                                }
                            }
                        }
                    }
                }
            }
        } elseif ($task.lastStatus -eq "PENDING" -or $task.lastStatus -eq "PROVISIONING") {
            Write-Host "⏳ 任务正在启动中，请等待..." -ForegroundColor Yellow
        } else {
            Write-Host "⚠️ 任务状态异常: $($task.lastStatus)" -ForegroundColor Yellow
            if ($task.stoppedReason) {
                Write-Host "❌ 停止原因: $($task.stoppedReason)" -ForegroundColor Red
            }
        }
    }
    
} catch {
    Write-Host "❌ 验证过程出错: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🔍 容器状态检查完成" -ForegroundColor Cyan
