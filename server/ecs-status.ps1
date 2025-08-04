# AWS ECS Status Check
Write-Host "Checking AWS ECS Status..." -ForegroundColor Cyan

$env:AWS_DEFAULT_REGION = "us-east-1"

# Check cluster status
Write-Host "`nChecking cluster status..." -ForegroundColor Yellow
try {
    $clusterResult = aws ecs describe-clusters --clusters c2-cluster --region us-east-1 | ConvertFrom-Json
    $cluster = $clusterResult.clusters[0]
    Write-Host "Cluster Status: $($cluster.status)" -ForegroundColor Green
    Write-Host "Running Tasks: $($cluster.runningTasksCount)"
    Write-Host "Pending Tasks: $($cluster.pendingTasksCount)"
    Write-Host "Active Services: $($cluster.activeServicesCount)"
} catch {
    Write-Host "Failed to get cluster info: $($_.Exception.Message)" -ForegroundColor Red
}

# List tasks
Write-Host "`nListing tasks..." -ForegroundColor Yellow
try {
    $tasksResult = aws ecs list-tasks --cluster c2-cluster --region us-east-1 | ConvertFrom-Json
    $tasks = $tasksResult.taskArns
    Write-Host "Total Tasks: $($tasks.Count)" -ForegroundColor Green
    
    if ($tasks.Count -gt 0) {
        # Get task details
        Write-Host "`nGetting task details..." -ForegroundColor Yellow
        $taskDetailResult = aws ecs describe-tasks --cluster c2-cluster --tasks $tasks[0] --region us-east-1 | ConvertFrom-Json
        $task = $taskDetailResult.tasks[0]
        
        Write-Host "Task ID: $($task.taskArn.Split('/')[-1])" -ForegroundColor Cyan
        Write-Host "Current Status: $($task.lastStatus)" -ForegroundColor $(if ($task.lastStatus -eq "RUNNING") { "Green" } else { "Yellow" })
        Write-Host "Desired Status: $($task.desiredStatus)"
        Write-Host "CPU: $($task.cpu)"
        Write-Host "Memory: $($task.memory)"
        
        if ($task.createdAt) {
            Write-Host "Created: $($task.createdAt)"
        }
        if ($task.startedAt) {
            Write-Host "Started: $($task.startedAt)"
        }
        
        # Container status
        if ($task.containers) {
            Write-Host "`nContainer Status:" -ForegroundColor Cyan
            foreach ($container in $task.containers) {
                Write-Host "  $($container.name): $($container.lastStatus)" -ForegroundColor $(if ($container.lastStatus -eq "RUNNING") { "Green" } else { "Yellow" })
            }
        }
        
        # Network info if running
        if ($task.lastStatus -eq "RUNNING") {
            Write-Host "`nTask is RUNNING!" -ForegroundColor Green
            
            if ($task.attachments) {
                foreach ($attachment in $task.attachments) {
                    if ($attachment.type -eq "ElasticNetworkInterface") {
                        foreach ($detail in $attachment.details) {
                            if ($detail.name -eq "networkInterfaceId") {
                                $eniId = $detail.value
                                Write-Host "Network Interface ID: $eniId" -ForegroundColor Cyan
                                
                                # Get public IP
                                try {
                                    $eniResult = aws ec2 describe-network-interfaces --network-interface-ids $eniId --region us-east-1 | ConvertFrom-Json
                                    $eni = $eniResult.NetworkInterfaces[0]
                                    
                                    if ($eni.Association.PublicIp) {
                                        $publicIp = $eni.Association.PublicIp
                                        Write-Host "Public IP: $publicIp" -ForegroundColor Green
                                        
                                        # Test health endpoint
                                        Write-Host "`nTesting health endpoint..." -ForegroundColor Yellow
                                        $healthUrl = "http://$publicIp:3000/health"
                                        try {
                                            $response = Invoke-RestMethod -Uri $healthUrl -Method GET -TimeoutSec 10
                                            Write-Host "Health check SUCCESS!" -ForegroundColor Green
                                            Write-Host "Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Green
                                            Write-Host "`nApplication is running successfully!" -ForegroundColor Green
                                            Write-Host "Access URL: http://$publicIp:3000" -ForegroundColor Cyan
                                        } catch {
                                            Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
                                        }
                                    } else {
                                        Write-Host "No public IP assigned" -ForegroundColor Red
                                    }
                                } catch {
                                    Write-Host "Failed to get network info: $($_.Exception.Message)" -ForegroundColor Yellow
                                }
                            }
                        }
                    }
                }
            }
        } else {
            Write-Host "`nTask Status: $($task.lastStatus)" -ForegroundColor Yellow
            if ($task.stoppedReason) {
                Write-Host "Stop Reason: $($task.stoppedReason)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "No tasks found in cluster" -ForegroundColor Red
    }
} catch {
    Write-Host "Failed to get task info: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nStatus check completed." -ForegroundColor Cyan
