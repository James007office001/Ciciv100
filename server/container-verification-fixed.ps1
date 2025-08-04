# AWS ECS 容器验证脚本 - 修复版
# 用于验证C2项目在AWS ECS上的部署状态

# 设置AWS环境变量
$env:AWS_DEFAULT_REGION = "us-east-1"
$env:AWS_DEFAULT_OUTPUT = "json"

# 配置参数
$CLUSTER_NAME = "c2-cluster"
$REGION = "us-east-1"

Write-Host "🚀 开始验证AWS ECS容器部署状态..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

function Check-ECSContainerStatus {
    try {
        # 1. 获取集群信息
        Write-Host "`n📋 检查ECS集群状态..."
        $clusterStatus = aws ecs describe-clusters --clusters $CLUSTER_NAME --region $REGION | ConvertFrom-Json
        
        if ($clusterStatus.clusters.Count -eq 0) {
            Write-Host "❌ 集群 $CLUSTER_NAME 不存在" -ForegroundColor Red
            return $false
        }
        
        $cluster = $clusterStatus.clusters[0]
        Write-Host "✅ 集群状态: $($cluster.status)" -ForegroundColor Green
        Write-Host "   活跃任务数: $($cluster.runningTasksCount)"
        Write-Host "   待处理任务数: $($cluster.pendingTasksCount)"
        
        # 2. 获取所有任务
        Write-Host "`n📦 获取任务列表..."
        $allTasks = aws ecs list-tasks --cluster $CLUSTER_NAME --region $REGION | ConvertFrom-Json
        
        if ($allTasks.taskArns.Count -eq 0) {
            Write-Host "❌ 集群中没有找到任何任务" -ForegroundColor Red
            return $false
        }
        
        Write-Host "✅ 找到 $($allTasks.taskArns.Count) 个任务"
        
        # 3. 获取任务详细信息
        Write-Host "`n🔍 获取任务详细信息..."
        $taskDetails = aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $allTasks.taskArns --region $REGION | ConvertFrom-Json
        
        foreach ($task in $taskDetails.tasks) {
            Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            Write-Host "📋 任务ID: $($task.taskArn.Split('/')[-1])"
            Write-Host "📦 任务定义: $($task.taskDefinitionArn.Split('/')[-1])"
            Write-Host "🎯 任务状态: $($task.lastStatus)" -ForegroundColor $(if ($task.lastStatus -eq "RUNNING") { "Green" } else { "Yellow" })
            Write-Host "💡 期望状态: $($task.desiredStatus)"
            Write-Host "⏰ 创建时间: $($task.createdAt)"
            Write-Host "🏁 启动时间: $($task.startedAt)"
            
            if ($task.lastStatus -eq "RUNNING") {
                Write-Host "✅ 任务正在运行!" -ForegroundColor Green
                
                # 获取网络信息
                if ($task.attachments) {
                    foreach ($attachment in $task.attachments) {
                        if ($attachment.type -eq "ElasticNetworkInterface") {
                            foreach ($detail in $attachment.details) {
                                if ($detail.name -eq "networkInterfaceId") {
                                    $eniId = $detail.value
                                    Write-Host "🌐 网络接口ID: $eniId"
                                    
                                    # 获取公网IP
                                    $eniInfo = aws ec2 describe-network-interfaces --network-interface-ids $eniId --region $REGION | ConvertFrom-Json
                                    
                                    if ($eniInfo.NetworkInterfaces[0].Association.PublicIp) {
                                        $publicIp = $eniInfo.NetworkInterfaces[0].Association.PublicIp
                                        Write-Host "🌍 公网IP: $publicIp" -ForegroundColor Green
                                        
                                        # 测试健康端点
                                        Write-Host "`n🏥 测试应用健康端点..."
                                        try {
                                            $healthUrl = "http://$publicIp:3000/health"
                                            Write-Host "📡 请求URL: $healthUrl"
                                            
                                            $response = Invoke-RestMethod -Uri $healthUrl -Method GET -TimeoutSec 10
                                            Write-Host "✅ 健康检查成功!" -ForegroundColor Green
                                            Write-Host "📊 响应数据: $($response | ConvertTo-Json -Compress)"
                                            
                                            Write-Host "`n🎯 验证完成: 应用成功运行在AWS ECS上!" -ForegroundColor Green
                                            Write-Host "🌐 访问地址: http://$publicIp:3000" -ForegroundColor Cyan
                                            return $true
                                            
                                        } catch {
                                            Write-Host "⚠️ 健康检查失败: $($_.Exception.Message)" -ForegroundColor Yellow
                                            Write-Host "💡 容器可能仍在启动中，请稍后重试" -ForegroundColor Yellow
                                        }
                                    } else {
                                        Write-Host "❌ 未分配公网IP" -ForegroundColor Red
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
        return $false
    }
    
    return $false
}

# 主执行逻辑
$result = Check-ECSContainerStatus

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ($result) {
    Write-Host "🎉 部署验证成功! 应用已成功运行在AWS ECS上!" -ForegroundColor Green
} else {
    Write-Host "⚠️ 部署验证未完成，请检查上述信息或稍后重试" -ForegroundColor Yellow
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
