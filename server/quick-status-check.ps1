# AWS ECS 状态快速检查
Write-Host "🚀 AWS ECS 快速状态检查" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 设置环境变量
$env:AWS_DEFAULT_REGION = "us-east-1"

# 简单的命令执行函数
function Execute-AWSCommand {
    param([string]$Command, [string]$Description)
    
    Write-Host "`n📋 $Description..." -ForegroundColor Yellow
    Write-Host "执行: $Command" -ForegroundColor Gray
    
    $startTime = Get-Date
    try {
        $result = Invoke-Expression $Command
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        Write-Host "✅ 完成 (用时: $($duration.ToString('F1'))s)" -ForegroundColor Green
        return $result
    } catch {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        Write-Host "❌ 失败 (用时: $($duration.ToString('F1'))s): $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. 检查集群基本信息
$clusterResult = Execute-AWSCommand "aws ecs describe-clusters --clusters c2-cluster --region us-east-1" "检查集群状态"

if ($clusterResult) {
    try {
        $cluster = ($clusterResult | ConvertFrom-Json).clusters[0]
        Write-Host "📊 集群信息:" -ForegroundColor Cyan
        Write-Host "   状态: $($cluster.status)"
        Write-Host "   运行任务数: $($cluster.runningTasksCount)"
        Write-Host "   待处理任务数: $($cluster.pendingTasksCount)"
        Write-Host "   活跃服务数: $($cluster.activeServicesCount)"
    } catch {
        Write-Host "⚠️ 解析集群信息失败" -ForegroundColor Yellow
    }
}

# 2. 检查任务列表
$tasksResult = Execute-AWSCommand "aws ecs list-tasks --cluster c2-cluster --region us-east-1" "获取任务列表"

if ($tasksResult) {
    try {
        $tasks = ($tasksResult | ConvertFrom-Json).taskArns
        Write-Host "📦 任务信息:" -ForegroundColor Cyan
        Write-Host "   任务总数: $($tasks.Count)"
        
        if ($tasks.Count -gt 0) {
            Write-Host "   任务列表:"
            foreach ($taskArn in $tasks) {
                $taskId = $taskArn.Split('/')[-1]
                Write-Host "     - $taskId"
            }
            
            # 3. 获取第一个任务的详细信息
            $firstTask = $tasks[0]
            $taskDetailResult = Execute-AWSCommand "aws ecs describe-tasks --cluster c2-cluster --tasks `"$firstTask`" --region us-east-1" "获取任务详细信息"
            
            if ($taskDetailResult) {
                try {
                    $taskDetail = ($taskDetailResult | ConvertFrom-Json).tasks[0]
                    Write-Host "🔍 任务详情:" -ForegroundColor Cyan
                    Write-Host "   任务ID: $($taskDetail.taskArn.Split('/')[-1])"
                    Write-Host "   当前状态: $($taskDetail.lastStatus)"
                    Write-Host "   期望状态: $($taskDetail.desiredStatus)"
                    Write-Host "   CPU: $($taskDetail.cpu)"
                    Write-Host "   内存: $($taskDetail.memory)"
                    
                    if ($taskDetail.createdAt) {
                        Write-Host "   创建时间: $($taskDetail.createdAt)"
                    }
                    if ($taskDetail.startedAt) {
                        Write-Host "   启动时间: $($taskDetail.startedAt)"
                    }
                    
                    # 检查容器状态
                    if ($taskDetail.containers) {
                        Write-Host "   容器状态:"
                        foreach ($container in $taskDetail.containers) {
                            Write-Host "     - $($container.name): $($container.lastStatus)"
                        }
                    }
                    
                    # 如果任务正在运行，尝试获取网络信息
                    if ($taskDetail.lastStatus -eq "RUNNING") {
                        Write-Host "✅ 任务正在运行!" -ForegroundColor Green
                        
                        # 简化的网络信息获取
                        if ($taskDetail.attachments) {
                            foreach ($attachment in $taskDetail.attachments) {
                                if ($attachment.type -eq "ElasticNetworkInterface") {
                                    foreach ($detail in $attachment.details) {
                                        if ($detail.name -eq "networkInterfaceId") {
                                            Write-Host "🌐 网络接口ID: $($detail.value)"
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        Write-Host "⚠️ 任务状态: $($taskDetail.lastStatus)" -ForegroundColor Yellow
                        if ($taskDetail.stoppedReason) {
                            Write-Host "❌ 停止原因: $($taskDetail.stoppedReason)" -ForegroundColor Red
                        }
                    }
                    
                } catch {
                    Write-Host "⚠️ 解析任务详情失败: $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }
        }
    } catch {
        Write-Host "⚠️ 解析任务列表失败: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🔍 快速状态检查完成" -ForegroundColor Cyan
